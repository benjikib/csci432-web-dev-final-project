const express = require('express');
const { body, validationResult } = require('express-validator');
const Vote = require('../models/Vote');
const Motion = require('../models/Motion');
const Committee = require('../models/Committee');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { checkVotingEligibility, isVotingPeriodExpired, checkQuorum, calculateMotionResult } = require('../utils/votingEligibility');

const router = express.Router();

/**
 * @route   GET /committee/:id/motion/:motionId/votes
 * @desc    Get vote summary and details
 * @access  Private
 */
router.get('/committee/:id/motion/:motionId/votes', authenticate, async (req, res) => {
  try {
    // Resolve committee by slug or id
    const committee = await Committee.findByIdOrSlug(req.params.id);
    if (!committee) {
      return res.status(404).json({ success: false, message: 'Committee not found' });
    }

    // Verify motion exists (embedded motion in committee)
    const motion = await Committee.findMotionById(committee._id, req.params.motionId);
    if (!motion) {
      return res.status(404).json({
        success: false,
        message: 'Motion not found'
      });
    }

    // Get vote summary
    const summary = await Vote.getVoteSummary(req.params.motionId);

    // Check if current user has voted
    const userVote = await Vote.findByUserAndMotion(req.user.userId, req.params.motionId);

    res.json({
      success: true,
      summary,
      userVote: userVote ? {
        vote: userVote.vote,
        votedAt: userVote.createdAt
      } : null
    });
  } catch (error) {
    console.error('Get votes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching votes'
    });
  }
});

/**
 * @route   POST /committee/:id/motion/:motionId/vote
 * @desc    Cast or update a vote
 * @access  Private
 */
router.post('/committee/:id/motion/:motionId/vote',
  authenticate,
  [
    body('vote').isIn(['yes', 'no', 'abstain']).withMessage('Vote must be yes, no, or abstain'),
    body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be a boolean')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      // Resolve committee and verify motion exists
      const committee = await Committee.findByIdOrSlug(req.params.id);
      if (!committee) {
        return res.status(404).json({ success: false, message: 'Committee not found' });
      }
      const motion = await Committee.findMotionById(committee._id, req.params.motionId);
      if (!motion) {
        return res.status(404).json({
          success: false,
          message: 'Motion not found'
        });
      }

      // Verify user's role in committee using role-aware helper to block guests
      const role = await Committee.getMemberRole(committee._id, req.user.userId);
      if (!role || role === 'guest') {
        return res.status(403).json({
          success: false,
          message: 'You must be a member (not a guest) of this committee to vote'
        });
      }

      const { vote, isAnonymous } = req.body;
      const settings = committee.settings || {};

      // Check if abstentions are allowed
      if (vote === 'abstain' && !settings.allowAbstentions) {
        return res.status(400).json({
          success: false,
          message: 'Abstentions are not allowed in this committee'
        });
      }

      // Check voting status
      if (motion.votingStatus === 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Voting has been closed for this motion'
        });
      }

      // Normalize votingStatus - treat undefined as 'not-started'
      const currentVotingStatus = motion.votingStatus || 'not-started';

      // Check if voting period has expired
      if (isVotingPeriodExpired(motion, settings)) {
        return res.status(400).json({
          success: false,
          message: 'Voting period has expired for this motion'
        });
      }

      // Check voting eligibility (unless voting is already open or user is chair)
      const isChair = await Committee.isChair(committee._id, req.user.userId);
      if (currentVotingStatus !== 'open' && !isChair) {
        const eligibility = await checkVotingEligibility(motion, settings, committee._id);
        if (!eligibility.eligible) {
          return res.status(400).json({
            success: false,
            message: 'Voting requirements not met',
            reasons: eligibility.reasons
          });
        }
        
        // If voting can begin and this is the first vote, auto-open voting
        if (eligibility.canBegin && currentVotingStatus === 'not-started') {
          await Committee.updateMotion(committee._id, req.params.motionId, {
            votingStatus: 'open',
            votingOpenedAt: new Date()
          });
          
          console.log('✓ Auto-opened voting for motion', req.params.motionId);
          
          // Create system message
          await Comment.create({
            motionId: req.params.motionId,
            committeeId: committee._id,
            author: null,
            content: '✅ All requirements met. Voting can begin.',
            stance: 'neutral',
            isSystemMessage: true,
            messageType: 'voting-eligible'
          });
        }
      }

      // Log for debugging
      console.log('Casting vote:', { motionId: req.params.motionId, committeeId: committee._id, userId: req.user.userId, vote });

      // Create or update vote
      const voteRecord = await Vote.updateOrCreate(
        req.user.userId,
        req.params.motionId,
        committee._id,
        vote,
        isAnonymous || false
      );

      // If vote type is roll_call, create a system comment broadcasting the vote
      if (settings.voteType === 'roll_call') {
        try {
          const user = await User.findById(req.user.userId);
          const userName = user ? (user.name || user.email || 'Unknown User') : 'Unknown User';
          const voteEmoji = vote === 'yes' ? '✅' : vote === 'no' ? '❌' : '⚪';
          
          await Comment.create({
            motionId: req.params.motionId,
            committeeId: committee._id,
            author: null,
            content: `${voteEmoji} Roll Call: ${userName} voted ${vote.toUpperCase()}`,
            stance: 'neutral',
            isSystemMessage: true,
            messageType: 'roll-call-vote'
          });
        } catch (err) {
          console.warn('Failed to create roll call comment:', err);
        }
      }

      // Update motion vote counts on either embedded motion or separate motions collection
      const updatedSummary = await Vote.getVoteSummary(req.params.motionId);
      try {
        await Committee.updateMotionVoteCounts(committee._id, req.params.motionId, updatedSummary);
      } catch (err) {
        // If committee update fails, fallback to Motion.updateVoteCounts
        await Motion.updateVoteCounts(req.params.motionId);
      }

      // Get updated motion with new vote counts
      const updatedMotion = await Committee.findMotionById(committee._id, req.params.motionId);
      
      console.log('=== MOTION STATUS AFTER VOTE ===');
      console.log('Motion found:', !!updatedMotion);
      console.log('Voting status:', updatedMotion?.votingStatus);
      console.log('Motion status:', updatedMotion?.status);
      console.log('Votes:', updatedMotion?.votes);
      console.log('Motion type:', updatedMotion?.motionType);
      console.log('Vote required:', updatedMotion?.voteRequired);
      console.log('================================');
      
      // Check if motion has reached vote threshold and should be auto-closed
      // Treat undefined votingStatus as 'not-started'
      const updatedVotingStatus = updatedMotion?.votingStatus || 'not-started';
      if (updatedMotion && updatedVotingStatus === 'open') {
        // Determine threshold: use motion.voteRequired if present, otherwise fall back to committee default
        // Map voteRequired values: 'majority' -> 'simple_majority', 'two-thirds' -> 'two_thirds'
        let threshold = settings.defaultVoteThreshold || 'simple_majority';
        if (updatedMotion.voteRequired) {
          if (updatedMotion.voteRequired === 'majority') {
            threshold = 'simple_majority';
          } else if (updatedMotion.voteRequired === 'two-thirds') {
            threshold = 'two_thirds';
          } else if (updatedMotion.voteRequired === 'unanimous') {
            threshold = 'unanimous';
          } else if (updatedMotion.voteRequired === 'none') {
            // Motion requires no vote - don't auto-close
            console.log('Motion requires no vote - skipping auto-close');
            threshold = null;
          }
        }
        
        if (threshold) {
          const result = calculateMotionResult(updatedMotion, threshold);
          const totalMembers = committee.members ? committee.members.length : 0;
          const quorumCheck = checkQuorum(updatedMotion, settings, totalMembers);
        
          console.log('=== AUTO-CLOSE CHECK ===');
          console.log('Threshold:', threshold);
          console.log('Votes:', updatedMotion.votes);
          console.log('Result:', result);
          console.log('Total Members:', totalMembers);
          console.log('Quorum Check:', quorumCheck);
          console.log('Settings quorumRequired:', settings.quorumRequired);
        
        // Calculate minimum member participation based on threshold
        // For simple_majority (50%), require at least 50% of members to vote
        // For two_thirds (66.67%), require at least 66.67% of members to vote
        // For unanimous (100%), require all members to vote
        let minParticipationPercent = 50; // default
        if (threshold === 'two_thirds') {
          minParticipationPercent = 66.67;
        } else if (threshold === 'unanimous') {
          minParticipationPercent = 100;
        }
        
        const totalVotes = updatedMotion.votes.yes + updatedMotion.votes.no + updatedMotion.votes.abstain;
        const participationPercent = (totalVotes / totalMembers) * 100;
        const minParticipationMet = participationPercent >= minParticipationPercent;
        
        console.log('Min participation required:', minParticipationPercent + '%');
        console.log('Current participation:', participationPercent.toFixed(2) + '%', '(' + totalVotes + '/' + totalMembers + ')');
        console.log('Participation met:', minParticipationMet);
        
        // Determine if we should auto-close based on:
        // 1. Vote threshold reached (passed or definitively failed)
        // 2. Minimum participation met (based on threshold percentage)
        // 3. Quorum met (if explicitly required by settings)
        let shouldAutoClose = false;
        let finalStatus = 'active';
        let closureReason = '';
        
        // Check if motion passed with sufficient participation
        if (result.passed && minParticipationMet && (!settings.quorumRequired || quorumCheck.met)) {
          shouldAutoClose = true;
          finalStatus = 'passed';
          closureReason = `Motion passed with ${result.yesPercent}% yes votes (${threshold} threshold, ${totalVotes}/${totalMembers} members voted)`;
          console.log('✓ Motion should pass');
        } else if (result.passed && !minParticipationMet) {
          console.log('✗ Motion passed vote threshold but not enough members voted');
          console.log('   Need', minParticipationPercent + '% participation, have', participationPercent.toFixed(2) + '%');
        } else if (result.passed && settings.quorumRequired && !quorumCheck.met) {
          console.log('✗ Motion passed threshold but quorum not met');
          console.log('   Quorum required:', quorumCheck.required, '| Current votes:', quorumCheck.current);
        } else if (!result.passed) {
          // Check if motion has definitively failed (can't reach threshold even if all remaining votes are yes)
          const totalVotes = updatedMotion.votes.yes + updatedMotion.votes.no + updatedMotion.votes.abstain;
          const votesRemaining = totalMembers - totalVotes;
          const maxPossibleYes = updatedMotion.votes.yes + votesRemaining;
          const maxPossibleTotal = updatedMotion.votes.yes + updatedMotion.votes.no + votesRemaining;
          
          if (maxPossibleTotal > 0) {
            const maxPossiblePercent = (maxPossibleYes / maxPossibleTotal) * 100;
            const requiredPercent = result.requiredPercent;
            
            if (maxPossiblePercent < requiredPercent) {
              shouldAutoClose = true;
              finalStatus = 'failed';
              closureReason = `Motion failed - cannot reach ${threshold} threshold (${result.yesPercent}% yes)`;
            }
          }
        }
        
        if (shouldAutoClose) {
          // Update motion status and close voting
          await Committee.updateMotion(committee._id, req.params.motionId, {
            status: finalStatus,
            votingStatus: 'closed',
            votingClosedAt: new Date()
          });
          
          // Create system message
          const statusEmoji = finalStatus === 'passed' ? '✅' : '❌';
          await Comment.create({
            motionId: req.params.motionId,
            committeeId: committee._id,
            author: null,
            content: `${statusEmoji} ${closureReason}`,
            stance: 'neutral',
            isSystemMessage: true,
            messageType: 'voting-closed'
          });
          
          console.log(`Auto-closed motion ${req.params.motionId}: ${closureReason}`);
          
          // If this is a reconsider motion that passed, restore the target motion
          if (finalStatus === 'passed' && updatedMotion.motionType === 'reconsider' && updatedMotion.targetMotionId) {
            try {
              console.log('Reconsider motion passed - restoring target motion:', updatedMotion.targetMotionId);
              
              // Reset the target motion to active status and reset votes
              await Committee.updateMotion(committee._id, String(updatedMotion.targetMotionId), {
                status: 'active',
                votingStatus: 'not-started',
                votingClosedAt: null,
                votes: {
                  yes: 0,
                  no: 0,
                  abstain: 0
                }
              });
              
              // Delete all votes for the target motion
              const { ObjectId } = require('mongodb');
              await Vote.collection().deleteMany({
                motionId: new ObjectId(updatedMotion.targetMotionId)
              });
              
              // Create system message on the reconsidered motion
              await Comment.create({
                motionId: String(updatedMotion.targetMotionId),
                committeeId: committee._id,
                author: null,
                content: '🔄 This motion has been reconsidered and is now open for discussion and voting again.',
                stance: 'neutral',
                isSystemMessage: true,
                messageType: 'motion-reconsidered'
              });
              
              console.log('✓ Target motion successfully reconsidered and reset');
            } catch (err) {
              console.error('Error reconsidering target motion:', err);
            }
          }
        }
        }
      }

      // Fetch the updated summary and the current user's vote
      const summary = await Vote.getVoteSummary(req.params.motionId);
      const userVote = await Vote.findByUserAndMotion(req.user.userId, req.params.motionId);

      res.status(201).json({
        success: true,
        message: 'Vote recorded successfully',
        vote: userVote ? {
          vote: userVote.vote,
          votedAt: userVote.updatedAt || userVote.createdAt
        } : null,
        summary
      });
    } catch (error) {
      console.error('Cast vote error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error recording vote'
      });
    }
  }
);

/**
 * @route   DELETE /committee/:id/motion/:motionId/vote
 * @desc    Remove your vote
 * @access  Private
 */
router.delete('/committee/:id/motion/:motionId/vote', authenticate, async (req, res) => {
  try {
    // Resolve committee and verify motion exists
    const committee = await Committee.findByIdOrSlug(req.params.id);
    if (!committee) {
      return res.status(404).json({ success: false, message: 'Committee not found' });
    }
    const motion = await Committee.findMotionById(committee._id, req.params.motionId);
    if (!motion) {
      return res.status(404).json({
        success: false,
        message: 'Motion not found'
      });
    }

    // Verify user is allowed to act on votes (guest users cannot cast or remove votes)
    const role = await Committee.getMemberRole(committee._id, req.user.userId);
    if (!role || role === 'guest') {
      return res.status(403).json({ success: false, message: 'Guests are not permitted to vote' });
    }

    // Delete vote
    const result = await Vote.deleteByUserAndMotion(req.user.userId, req.params.motionId);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No vote found to delete'
      });
    }

    // Update motion vote counts (prefer embedded committee motion update if possible) and fetch summary
    const updatedSummary = await Vote.getVoteSummary(req.params.motionId);
    try {
      await Committee.updateMotionVoteCounts(committee._id, req.params.motionId, updatedSummary);
    } catch (err) {
      await Motion.updateVoteCounts(req.params.motionId);
    }
    const summary = updatedSummary;

    res.json({
      success: true,
      message: 'Vote removed successfully',
      summary
    });
  } catch (error) {
    console.error('Delete vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting vote'
    });
  }
});

module.exports = router;
