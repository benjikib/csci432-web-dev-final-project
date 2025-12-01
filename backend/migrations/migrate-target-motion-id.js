/**
 * Migration: populate `motions.targetMotionId` from existing `motions.amendTargetMotionId` values,
 * and ensure an index exists on `motions.targetMotionId` for faster queries.
 * Run with: node migrations/migrate-target-motion-id.js
 */

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'commie_db';

async function migrate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const committees = db.collection('committees');

    console.log('Connected. Scanning committees for motions to migrate...');
    const cursor = committees.find({ motions: { $exists: true, $ne: [] } });
    let updatedCount = 0;
    while (await cursor.hasNext()) {
      const committee = await cursor.next();
      let changed = false;
      const updatedMotions = (committee.motions || []).map(m => {
        // if targetMotionId missing but amendTargetMotionId exists, copy
        if ((!m.targetMotionId || m.targetMotionId === null) && m.amendTargetMotionId) {
          changed = true;
          return { ...m, targetMotionId: m.amendTargetMotionId };
        }
        return m;
      });
      if (changed) {
        await committees.updateOne({ _id: committee._id }, { $set: { motions: updatedMotions, updatedAt: new Date() } });
        updatedCount++;
      }
    }
    console.log(`Updated ${updatedCount} committees with targetMotionId`);

    console.log('Creating index on motions.targetMotionId...');
    await committees.createIndex({ 'motions.targetMotionId': 1 });
    console.log('Index created. Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.close();
  }
}

migrate();
