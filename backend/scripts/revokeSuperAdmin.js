/**
 * Script to revoke super-admin privileges from a user
 * Usage: node scripts/revokeSuperAdmin.js <email> (from backend directory)
 *    OR: node revokeSuperAdmin.js <email> (from scripts directory)
 * 
 * This script should only be run by platform maintainers/developers.
 */

const path = require('path');

// Determine the backend directory based on where this script is located
const backendDir = path.join(__dirname, '..');

// Load environment variables from backend directory
require('dotenv').config({ path: path.join(backendDir, '.env') });

// Require MongoDB native driver
const { MongoClient, ObjectId } = require('mongodb');

async function revokeSuperAdmin() {
  let client;
  try {
    const email = process.argv[2];

    if (!email) {
      console.error('Error: Email address required');
      console.log('Usage: node scripts/revokeSuperAdmin.js <email>');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('Connecting to database...');
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/csci432-final';
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to database');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`Error: User with email "${email}" not found`);
      process.exit(1);
    }

    // Check if user has super-admin role
    if (!user.roles || !user.roles.includes('super-admin')) {
      console.log(`User "${email}" is not a super-admin`);
      await client.close();
      process.exit(0);
    }

    // Remove super-admin role
    const updatedRoles = user.roles.filter(role => role !== 'super-admin');
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { roles: updatedRoles } }
    );

    console.log(`✓ Successfully revoked super-admin privileges from "${email}"`);
    console.log(`User ID: ${user._id}`);
    console.log(`Remaining roles: ${updatedRoles.length > 0 ? updatedRoles.join(', ') : 'none'}`);

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error revoking super-admin:', error);
    if (client) {
      await client.close();
    }
    process.exit(1);
  }
}

revokeSuperAdmin();
