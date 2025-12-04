/**
 * Script to set a user as super-admin
 * Usage: node scripts/setSuperAdmin.js <email> (from backend directory)
 *    OR: node setSuperAdmin.js <email> (from scripts directory)
 * 
 * This script should only be run by platform maintainers/developers
 * to grant super-admin privileges to trusted users.
 */

const path = require('path');

// Determine the backend directory based on where this script is located
const backendDir = path.join(__dirname, '..');

// Load environment variables from backend directory
require('dotenv').config({ path: path.join(backendDir, '.env') });

// Require mongoose and User model using absolute paths
const mongoose = require(path.join(backendDir, 'node_modules', 'mongoose'));
const User = require(path.join(backendDir, 'models', 'User'));

async function setSuperAdmin() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.error('Error: Email address required');
      console.log('Usage: node scripts/setSuperAdmin.js <email>');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/csci432-final');
    console.log('Connected to database');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`Error: User with email "${email}" not found`);
      process.exit(1);
    }

    // Check if already super-admin
    if (user.roles && user.roles.includes('super-admin')) {
      console.log(`User "${email}" is already a super-admin`);
      process.exit(0);
    }

    // Add super-admin role
    const updatedRoles = [...new Set([...(user.roles || []), 'super-admin'])];
    await User.collection().updateOne(
      { _id: user._id },
      { $set: { roles: updatedRoles } }
    );

    console.log(`✓ Successfully granted super-admin privileges to "${email}"`);
    console.log(`User ID: ${user._id}`);
    console.log(`Roles: ${updatedRoles.join(', ')}`);
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('Super-admins have unrestricted access to all organizations and data.');
    console.log('This privilege should only be granted to platform maintainers/developers.');

    process.exit(0);
  } catch (error) {
    console.error('Error setting super-admin:', error);
    process.exit(1);
  }
}

setSuperAdmin();
