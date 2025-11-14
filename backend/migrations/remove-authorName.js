const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/roberts-rules';

async function removeAuthorNameField() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('committees');

    // Remove authorName field from all motions in all committees
    const result = await collection.updateMany(
      { 'motions.authorName': { $exists: true } },
      { $unset: { 'motions.$[].authorName': '' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} committees`);
    console.log('✅ Removed authorName field from all motions');

    // Verify the changes
    const committees = await collection.find({}).toArray();
    let totalMotions = 0;
    let motionsWithAuthorName = 0;

    committees.forEach(committee => {
      if (committee.motions) {
        totalMotions += committee.motions.length;
        committee.motions.forEach(motion => {
          if (motion.authorName) {
            motionsWithAuthorName++;
          }
        });
      }
    });

    console.log(`\n📊 Verification:`);
    console.log(`   Total motions: ${totalMotions}`);
    console.log(`   Motions with authorName field: ${motionsWithAuthorName}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Migration complete');
  }
}

removeAuthorNameField();
