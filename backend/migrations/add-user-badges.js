/**
 * Migration: Add badge field to existing users
 * Assigns "Founding Member" badge to all existing users
 */

require('dotenv').config();
const { connectDB, getDB } = require('../config/database');

async function addUserBadges() {
  try {
    console.log('Starting user badge migration...');
    
    await connectDB();
    const db = getDB();
    
    // Update all users without a badge to have "Founding Member" badge
    const result = await db.collection('users').updateMany(
      { badge: { $exists: false } }, // Users without badge field
      { 
        $set: { 
          badge: 'Founding Member',
          updatedAt: new Date()
        } 
      }
    );
    
    console.log(`Migration complete!`);
    console.log(`- Users updated: ${result.modifiedCount}`);
    console.log(`- Users matched: ${result.matchedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

addUserBadges();
