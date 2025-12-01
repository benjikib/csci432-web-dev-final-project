const { connectDB, client } = require('../config/database');

async function createVotesIndexes() {
  try {
    const db = await connectDB();
    const votes = db.collection('votes');

    console.log('Creating indexes on votes collection...');

    // Ensure one vote per user per motion
    await votes.createIndex({ motionId: 1, userId: 1 }, { unique: true });

    // Querying by motion is common, and we use aggregation by committee sometimes
    await votes.createIndex({ motionId: 1 });
    await votes.createIndex({ committeeId: 1 });

    // Helpful for ordering and pruning
    await votes.createIndex({ updatedAt: -1 });

    console.log('✅ Created votes indexes successfully');

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create votes indexes:', error);
    process.exit(1);
  }
}

createVotesIndexes();