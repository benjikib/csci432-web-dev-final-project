/**
 * Migration script: convert legacy committee.members (array of ids) into role-aware member objects
 * and add chair/owner into members array with appropriate roles.
 * Usage: node backend/scripts/migrate-members-to-roles.js --mongo-uri=mongodb://... [--dry-run]
 */
const { MongoClient, ObjectId } = require('mongodb');
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

async function migrate(uri, dryRun = true) {
  // Connect with a short server selection timeout so errors fail fast
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const db = client.db();
  const committees = db.collection('committees');
  const users = db.collection('users');

  const cursor = committees.find({});
  while (await cursor.hasNext()) {
    const c = await cursor.next();
    const id = c._id;
    const membersArr = c.members || [];
    const newMembers = [];

    // convert primitive members to object form
    for (const m of membersArr) {
      if (!m) continue;
      if (typeof m === 'string' || ObjectId.isValid(m)) {
        newMembers.push({ userId: new ObjectId(m), role: 'member', joinedAt: new Date() });
      } else if (typeof m === 'object') {
        // keep role if present
        const userId = m.userId || m._id || m.id;
        if (!userId) continue;
        newMembers.push({ userId: new ObjectId(userId), role: m.role || 'member', joinedAt: m.joinedAt ? new Date(m.joinedAt) : new Date() });
      }
    }

    // Add chair and owner if not present
    if (c.chair) {
      if (!newMembers.some(x => String(x.userId) === String(c.chair))) {
        newMembers.push({ userId: new ObjectId(c.chair), role: 'chair', joinedAt: new Date() });
      } else {
        // ensure role is at least chair
        newMembers.forEach(x => { if (String(x.userId) === String(c.chair)) x.role = 'chair'; });
      }
    }
    if (c.owner) {
      if (!newMembers.some(x => String(x.userId) === String(c.owner))) {
        newMembers.push({ userId: new ObjectId(c.owner), role: 'owner', joinedAt: new Date() });
      } else {
        newMembers.forEach(x => { if (String(x.userId) === String(c.owner)) x.role = 'owner'; });
      }
    }

    // remove duplicates and collapse roles
    const finalMembers = [];
    for (const m of newMembers) {
      const found = finalMembers.find(x => String(x.userId) === String(m.userId));
      if (!found) finalMembers.push(m);
      else {
        // prefer owner/chair > guest > member
        const rank = { owner: 3, chair: 3, member: 2, guest: 1 };
        if (rank[m.role] > rank[found.role]) found.role = m.role;
      }
    }

    console.log(`Committee ${id.toString()} will migrate ${membersArr.length} -> ${finalMembers.length} members`);
    if (!dryRun) {
      await committees.updateOne({ _id: id }, { $set: { members: finalMembers, updatedAt: new Date() } });

      // Update user docs to include memberCommittees or guestCommittees for compatibility
      for (const m of finalMembers) {
        const uid = m.userId;
        await users.updateOne({ _id: uid }, { $addToSet: { memberCommittees: id } });
        if (m.role === 'guest') {
          await users.updateOne({ _id: uid }, { $addToSet: { guestCommittees: id } });
        }
        if (m.role === 'chair') await users.updateOne({ _id: uid }, { $addToSet: { chairedCommittees: id } });
        if (m.role === 'owner') await users.updateOne({ _id: uid }, { $addToSet: { ownedCommittees: id } });
      }
    }
  }

  await client.close();
}

const uri = argv['mongo-uri'] || process.env.MONGO_URI || 'mongodb://localhost:27017/commie_dev';
const dry = argv['dry-run'] !== undefined ? Boolean(argv['dry-run']) : true;

migrate(uri, dry).then(() => {
  console.log('Migration complete', dry ? '(dry-run)' : '');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed', err && err.message ? err.message : err);
  process.exit(1);
});
