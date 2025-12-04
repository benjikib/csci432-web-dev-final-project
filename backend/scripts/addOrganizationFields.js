/**
 * Script to add organizationId and organizationRole fields to existing users
 * This is a one-time migration for users created before the organization system
 */

const path = require('path');
const backendDir = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(backendDir, '.env') });

const { MongoClient } = require('mongodb');

async function addOrganizationFields() {
  let client;
  try {
    console.log('Connecting to database...');
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/csci432-final';
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to database');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Find users missing the organization fields
    const usersWithoutOrgFields = await usersCollection.find({
      $or: [
        { organizationId: { $exists: false } },
        { organizationRole: { $exists: false } }
      ]
    }).toArray();

    console.log(`Found ${usersWithoutOrgFields.length} users missing organization fields`);

    if (usersWithoutOrgFields.length === 0) {
      console.log('All users already have organization fields!');
      await client.close();
      process.exit(0);
    }

    // Update all users to have the organization fields
    const result = await usersCollection.updateMany(
      {
        $or: [
          { organizationId: { $exists: false } },
          { organizationRole: { $exists: false } }
        ]
      },
      {
        $set: {
          organizationId: null,
          organizationRole: null
        }
      }
    );

    console.log(`✓ Updated ${result.modifiedCount} users`);
    console.log('');
    console.log('Organization fields added:');
    console.log('  - organizationId: null');
    console.log('  - organizationRole: null');
    console.log('');
    console.log('Users can now:');
    console.log('  1. Join an organization using an invite code (signup/settings)');
    console.log('  2. Be promoted to org admin by organization owner');
    console.log('  3. Remain independent (no organization)');

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error adding organization fields:', error);
    if (client) {
      await client.close();
    }
    process.exit(1);
  }
}

addOrganizationFields();
