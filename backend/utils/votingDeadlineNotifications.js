const { getDB } = require('../config/database');
const Notification = require('../models/Notification');
const { ObjectId } = require('mongodb');

/**
 * Check all open motions and send notifications for those past 50% of voting duration
 * This should be called periodically (e.g., every hour)
 */
async function checkAndNotifyVotingDeadlines() {
  try {
    const db = getDB();
    const committeesCollection = db.collection('committees');
    
    console.log('🔔 Checking for voting deadline notifications...');
    
    // Get all committees
    const committees = await committeesCollection.find({}).toArray();
    
    let notificationsCreated = 0;
    
    for (const committee of committees) {
      if (!committee.motions || committee.motions.length === 0) continue;
      
      const settings = committee.settings || {};
      const votingPeriodDays = settings.votingPeriodDays || 7;
      const votingPeriodMs = votingPeriodDays * 24 * 60 * 60 * 1000;
      const halfwayMs = votingPeriodMs / 2;
      
      for (const motion of committee.motions) {
        // Only check motions with open voting
        if (motion.votingStatus !== 'open' || !motion.votingOpenedAt) continue;
        
        const now = new Date();
        const openedAt = new Date(motion.votingOpenedAt);
        const timeElapsed = now - openedAt;
        const closeAt = new Date(openedAt.getTime() + votingPeriodMs);
        
        // Check if we've passed the 50% mark but voting is still open
        if (timeElapsed >= halfwayMs && timeElapsed < votingPeriodMs) {
          // Check if we've already sent this notification
          const existingNotif = await Notification.collection().findOne({
            type: 'voting_deadline_approaching',
            'metadata.motionId': motion._id.toString(),
            committeeId: committee._id
          });
          
          if (!existingNotif) {
            // Create notification
            const timeRemaining = closeAt - now;
            const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));
            const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
            
            let timeRemainingText;
            if (daysRemaining > 1) {
              timeRemainingText = `${daysRemaining} days`;
            } else if (hoursRemaining > 1) {
              timeRemainingText = `${hoursRemaining} hours`;
            } else {
              timeRemainingText = 'less than 1 hour';
            }
            
            await Notification.create({
              type: 'voting_deadline_approaching',
              committeeId: committee._id,
              committeeTitle: committee.title,
              message: `Voting closes in ${timeRemainingText} for "${motion.title}"`,
              metadata: {
                motionId: motion._id.toString(),
                motionTitle: motion.title,
                committeeSlug: committee.slug,
                closesAt: closeAt.toISOString(),
                timeRemaining: timeRemainingText
              }
            });
            
            notificationsCreated++;
            console.log(`  ✓ Created deadline notification for motion: ${motion.title}`);
          }
        }
      }
    }
    
    if (notificationsCreated > 0) {
      console.log(`✅ Created ${notificationsCreated} voting deadline notifications`);
    } else {
      console.log('✓ No new deadline notifications needed');
    }
    
  } catch (error) {
    console.error('❌ Error checking voting deadlines:', error);
  }
}

module.exports = { checkAndNotifyVotingDeadlines };
