/**
 * Migration script to add settings field to existing users
 * Run with: node migrations/add-user-settings.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'commie_db';

async function migrateUserSettings() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Find all users without settings field
    const usersWithoutSettings = await usersCollection.find({
      settings: { $exists: false }
    }).toArray();

    console.log(`Found ${usersWithoutSettings.length} users without settings field`);

    if (usersWithoutSettings.length === 0) {
      console.log('No users need migration');
      return;
    }

    // Update each user to add default settings
    for (const user of usersWithoutSettings) {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            settings: {
              theme: 'light',
              notifications: true,
              displayName: user.name || 'User'
            },
            updatedAt: new Date()
          }
        }
      );
      console.log(`Added settings to user: ${user.email || user._id}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

migrateUserSettings();
