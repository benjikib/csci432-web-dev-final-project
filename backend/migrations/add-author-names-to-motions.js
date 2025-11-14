/**
 * Migration script to add authorName field to existing motions
 * This populates the authorName field with the user's display name from settings
 * Run with: node migrations/add-author-names-to-motions.js
 */

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'commie_db';

async function migrateMotionAuthorNames() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const committeesCollection = db.collection('committees');
    const usersCollection = db.collection('users');

    // Find all committees with motions
    const committees = await committeesCollection.find({
      motions: { $exists: true, $ne: [] }
    }).toArray();

    console.log(`Found ${committees.length} committees with motions`);

    let updatedMotionsCount = 0;

    for (const committee of committees) {
      let needsUpdate = false;
      const updatedMotions = [];

      for (const motion of committee.motions) {
        // Check if motion already has authorName
        if (!motion.authorName && motion.author) {
          needsUpdate = true;

          try {
            // Fetch the user
            const authorId = typeof motion.author === 'string' ? new ObjectId(motion.author) : motion.author;
            const user = await usersCollection.findOne({ _id: authorId });

            if (user) {
              // Get display name from settings, fallback to name
              const displayName = user.settings?.displayName || user.name || 'Anonymous';
              motion.authorName = displayName;
              console.log(`  Updated motion "${motion.title}" with authorName: ${displayName}`);
              updatedMotionsCount++;
            } else {
              motion.authorName = 'Anonymous';
              console.log(`  User not found for motion "${motion.title}", set to Anonymous`);
              updatedMotionsCount++;
            }
          } catch (err) {
            console.error(`  Error processing motion "${motion.title}":`, err.message);
            motion.authorName = 'Anonymous';
            updatedMotionsCount++;
          }
        }

        updatedMotions.push(motion);
      }

      // Update the committee with modified motions
      if (needsUpdate) {
        await committeesCollection.updateOne(
          { _id: committee._id },
          {
            $set: {
              motions: updatedMotions,
              updatedAt: new Date()
            }
          }
        );
        console.log(`Updated committee: ${committee.title}`);
      }
    }

    console.log(`\nMigration completed successfully`);
    console.log(`Total motions updated: ${updatedMotionsCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

migrateMotionAuthorNames();
