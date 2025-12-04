const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { authenticate } = require('../middleware/auth');
const Committee = require('../models/Committee');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');
const Notification = require('../models/Notification');
const { checkVotingEligibility, isVotingPeriodExpired } = require('../utils/votingEligibility');

/**
 * POST /api/motion-control/:committeeId/:motionId/second
 * Second a motion (requires requireSecond setting enabled)
 */
router.post('/:committeeId/:motionId/second', authenticate, async (req, res) => {
    try {
        const { committeeId, motionId } = req.params;
        const userId = req.user.userId;

        // Get committee and motion
        const committee = await Committee.findByIdOrSlug(committeeId);
        if (!committee) {
            return res.status(404).json({ success: false, message: 'Committee not found' });
        }

        const motion = await Committee.findMotionById(committee._id, motionId);
        if (!motion) {
            return res.status(404).json({ success: false, message: 'Motion not found' });
        }

        // Check if user is a member (not the author)
        const isMember = await Committee.isMember(committee._id, userId);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'Only committee members can second motions' });
        }

        // Check if user is the author
        if (String(motion.author) === String(userId)) {
            return res.status(400).json({ success: false, message: 'You cannot second your own motion' });
        }

        // Check if already seconded
        if (motion.secondedBy) {
            return res.status(400).json({ 
                success: false, 
                message: 'Motion has already been seconded' 
            });
        }

        // Update motion with secondedBy
        await Committee.updateMotion(committee._id, motionId, {
            secondedBy: new ObjectId(userId)
        });

        // Create a "yes" vote for the seconder
        await Vote.updateOrCreate(userId, motionId, committee._id, 'yes', false);

        // Recalculate vote counts
        const voteSummary = await Vote.getVoteSummary(motionId);
        await Committee.updateMotionVoteCounts(committee._id, motionId, voteSummary);

        // Get updated motion
        const updatedMotion = await Committee.findMotionById(committee._id, motionId);

        // Check voting eligibility
        const settings = committee.settings || {};
        const eligibility = await checkVotingEligibility(updatedMotion, settings, committee._id);

        // If voting can now begin, auto-open voting and create notifications
        if (eligibility.canBegin && updatedMotion.votingStatus !== 'open') {
            // Auto-open voting
            await Committee.updateMotion(committee._id, motionId, {
                votingStatus: 'open',
                votingOpenedAt: new Date()
            });
            
            // Create system message
            await Comment.create({
                motionId: motionId,
                committeeId: committee._id.toString(),
                author: null,
                content: '✅ Motion has been seconded. Voting is now open.',
                stance: 'neutral',
                isSystemMessage: true,
                messageType: 'voting-eligible'
            });
            
            // Create notification for all committee members
            try {
                console.log('Creating voting notification for seconded motion:', updatedMotion.title);
                const notification = await Notification.create({
                    type: 'voting_opened',
                    committeeId: committee._id,
                    committeeTitle: committee.title,
                    message: `Voting is now open for "${updatedMotion.title}"`,
                    metadata: {
                        motionId: motionId.toString(),
                        motionTitle: updatedMotion.title,
                        committeeSlug: committee.slug
                    }
                });
                console.log('Voting notification created:', notification);
            } catch (notifErr) {
                console.error('Failed to create voting notification:', notifErr);
            }
            
            // Refresh motion to get updated votingStatus
            const refreshedMotion = await Committee.findMotionById(committee._id, motionId);
            res.json({
                success: true,
                message: 'Motion seconded and voting opened',
                motion: refreshedMotion,
                voteSummary,
                eligibility
            });
        } else {
            res.json({
                success: true,
                message: 'Motion seconded successfully',
                motion: updatedMotion,
                voteSummary,
                eligibility
            });
        }
    } catch (error) {
        console.error('Error seconding motion:', error);
        res.status(500).json({ success: false, message: 'Failed to second motion', error: error.message });
    }
});

/**
 * GET /api/motion-control/:committeeId/:motionId/voting-eligibility
 * Check if voting is eligible for a motion
 */
router.get('/:committeeId/:motionId/voting-eligibility', authenticate, async (req, res) => {
    try {
        const { committeeId, motionId } = req.params;

        const committee = await Committee.findByIdOrSlug(committeeId);
        if (!committee) {
            return res.status(404).json({ success: false, message: 'Committee not found' });
        }

        const motion = await Committee.findMotionById(committee._id, motionId);
        if (!motion) {
            return res.status(404).json({ success: false, message: 'Motion not found' });
        }

        const settings = committee.settings || {};
        const eligibility = await checkVotingEligibility(motion, settings, committee._id);

        // Also check if voting period has expired
        const expired = isVotingPeriodExpired(motion, settings);

        res.json({
            success: true,
            ...eligibility,
            votingStatus: motion.votingStatus || 'not-started',
            votingPeriodExpired: expired
        });
    } catch (error) {
        console.error('Error checking voting eligibility:', error);
        res.status(500).json({ success: false, message: 'Failed to check eligibility', error: error.message });
    }
});

/**
 * POST /api/motion-control/:committeeId/:motionId/open-voting
 * Chair-only: Open voting for a motion (bypasses requirements)
 */
router.post('/:committeeId/:motionId/open-voting', authenticate, async (req, res) => {
    try {
        const { committeeId, motionId } = req.params;
        const userId = req.user.userId;

        // Check if user is chair
        const committee = await Committee.findByIdOrSlug(committeeId);
        if (!committee) {
            return res.status(404).json({ success: false, message: 'Committee not found' });
        }
        
        const isChair = await Committee.isChair(committee._id, userId);
        if (!isChair) {
            return res.status(403).json({ success: false, message: 'Only the chair can open voting' });
        }

        const motion = await Committee.findMotionById(committee._id, motionId);
        if (!motion) {
            return res.status(404).json({ success: false, message: 'Motion not found' });
        }

        if (motion.votingStatus === 'open') {
            return res.status(400).json({ success: false, message: 'Voting is already open' });
        }

        if (motion.votingStatus === 'closed') {
            return res.status(400).json({ success: false, message: 'Voting has been closed' });
        }

        // Open voting
        await Committee.updateMotion(committee._id, motionId, {
            votingStatus: 'open',
            votingOpenedAt: new Date()
        });

        // Create system message
        await Comment.create({
            motionId: motionId,
            committeeId: committee._id.toString(),
            author: null,
            content: '🗳️ The chair has opened voting for this motion.',
            stance: 'neutral',
            isSystemMessage: true,
            messageType: 'voting-opened'
        });

        // Create notification for all committee members who haven't voted
        const updatedMotion = await Committee.findMotionById(committee._id, motionId);
        try {
            console.log('Creating voting notification for motion:', updatedMotion.title);
            const notification = await Notification.create({
                type: 'voting_opened',
                committeeId: committee._id,
                committeeTitle: committee.title,
                message: `Voting is now open for "${updatedMotion.title}"`,
                metadata: {
                    motionId: motionId.toString(),
                    motionTitle: updatedMotion.title,
                    committeeSlug: committee.slug
                }
            });
            console.log('Voting notification created:', notification);
        } catch (notifErr) {
            console.error('Failed to create voting notification:', notifErr);
        }

        res.json({
            success: true,
            message: 'Voting opened successfully',
            motion: updatedMotion
        });
    } catch (error) {
        console.error('Error opening voting:', error);
        res.status(500).json({ success: false, message: 'Failed to open voting', error: error.message });
    }
});

/**
 * POST /api/motion-control/:committeeId/:motionId/close-voting
 * Chair-only: Close voting for a motion
 */
router.post('/:committeeId/:motionId/close-voting', authenticate, async (req, res) => {
    try {
        const { committeeId, motionId } = req.params;
        const userId = req.user.userId;

        // Check if user is chair
        const committee = await Committee.findByIdOrSlug(committeeId);
        if (!committee) {
            return res.status(404).json({ success: false, message: 'Committee not found' });
        }
        
        const isChair = await Committee.isChair(committee._id, userId);
        if (!isChair) {
            return res.status(403).json({ success: false, message: 'Only the chair can close voting' });
        }

        const motion = await Committee.findMotionById(committee._id, motionId);
        if (!motion) {
            return res.status(404).json({ success: false, message: 'Motion not found' });
        }

        if (motion.votingStatus === 'closed') {
            return res.status(400).json({ success: false, message: 'Voting is already closed' });
        }

        // Close voting
        await Committee.updateMotion(committee._id, motionId, {
            votingStatus: 'closed',
            votingClosedAt: new Date()
        });

        // Get vote summary
        const voteSummary = await Vote.getVoteSummary(motionId);
        
        // Create system message with results
        await Comment.create({
            motionId: motionId,
            committeeId: committee._id.toString(),
            author: null,
            content: `🔒 Voting has been closed. Final results: ${voteSummary.yes} Yes, ${voteSummary.no} No, ${voteSummary.abstain} Abstain.`,
            stance: 'neutral',
            isSystemMessage: true,
            messageType: 'voting-closed'
        });

        const updatedMotion = await Committee.findMotionById(committee._id, motionId);

        res.json({
            success: true,
            message: 'Voting closed successfully',
            motion: updatedMotion,
            voteSummary
        });
    } catch (error) {
        console.error('Error closing voting:', error);
        res.status(500).json({ success: false, message: 'Failed to close voting', error: error.message });
    }
});

module.exports = router;
