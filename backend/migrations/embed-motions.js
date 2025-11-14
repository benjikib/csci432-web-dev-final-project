const { connectDB, client } = require('../config/database');
const { ObjectId } = require('mongodb');

async function embedMotionsIntoCommittees() {
  try {
    const db = await connectDB();
    const committeesCollection = db.collection('committees');
    const motionsCollection = db.collection('motions');

    // Get all motions
    const motions = await motionsCollection.find({}).toArray();
    console.log(`Found ${motions.length} motions to migrate`);

    // Group motions by committeeId
    const motionsByCommittee = {};
    motions.forEach(motion => {
      // Skip motions without a committeeId
      if (!motion.committeeId) {
        console.log(`⚠ Skipping motion "${motion.title}" - no committeeId`);
        return;
      }

      const committeeId = motion.committeeId.toString();
      if (!motionsByCommittee[committeeId]) {
        motionsByCommittee[committeeId] = [];
      }
      motionsByCommittee[committeeId].push(motion);
    });

    console.log(`Motions grouped into ${Object.keys(motionsByCommittee).length} committees`);

    // Update each committee with its motions
    let updatedCount = 0;
    for (const [committeeId, committeeMotions] of Object.entries(motionsByCommittee)) {
      const result = await committeesCollection.updateOne(
        { _id: new ObjectId(committeeId) },
        {
          $set: {
            motions: committeeMotions,
            updatedAt: new Date()
          }
        }
      );

      if (result.modifiedCount > 0) {
        updatedCount++;
        console.log(`✓ Added ${committeeMotions.length} motions to committee ${committeeId}`);
      } else {
        console.log(`⚠ Committee ${committeeId} not found or already has motions`);
      }
    }

    // Initialize empty motions array for committees that have no motions
    const committeesWithoutMotions = await committeesCollection.updateMany(
      { motions: { $exists: false } },
      { $set: { motions: [] } }
    );

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   - Updated ${updatedCount} committees with motions`);
    console.log(`   - Initialized ${committeesWithoutMotions.modifiedCount} committees with empty motions array`);
    console.log(`\nNote: The old 'motions' collection still exists.`);
    console.log(`      To remove it, run: db.motions.drop() in MongoDB shell`);

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

embedMotionsIntoCommittees();
