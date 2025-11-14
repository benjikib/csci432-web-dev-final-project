const express = require('express');
const { body, validationResult } = require('express-validator');
const Vote = require('../models/Vote');
const Motion = require('../models/Motion');
const Committee = require('../models/Committee');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /committee/:id/motion/:motionId/votes
 * @desc    Get vote summary and details
 * @access  Private
 */
router.get('/committee/:id/motion/:motionId/votes', authenticate, async (req, res) => {
  try {
    // Verify motion exists
    const motion = await Motion.findByIdAndCommittee(req.params.motionId, req.params.id);
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

      // Verify motion exists
      const motion = await Motion.findByIdAndCommittee(req.params.motionId, req.params.id);
      if (!motion) {
        return res.status(404).json({
          success: false,
          message: 'Motion not found'
        });
      }

      // Verify user is member of committee
      const committee = await Committee.findById(req.params.id);
      if (!committee.members.includes(req.user.userId)) {
        return res.status(403).json({
          success: false,
          message: 'You must be a member of this committee to vote'
        });
      }

      const { vote, isAnonymous } = req.body;

      // Create or update vote
      const voteRecord = await Vote.updateOrCreate(
        req.user.userId,
        req.params.motionId,
        req.params.id,
        vote,
        isAnonymous || false
      );

      // Update motion vote counts
      await Motion.updateVoteCounts(req.params.motionId);

      res.status(201).json({
        success: true,
        message: 'Vote recorded successfully',
        vote: {
          vote: voteRecord.vote,
          votedAt: voteRecord.updatedAt || voteRecord.createdAt
        }
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
    // Verify motion exists
    const motion = await Motion.findByIdAndCommittee(req.params.motionId, req.params.id);
    if (!motion) {
      return res.status(404).json({
        success: false,
        message: 'Motion not found'
      });
    }

    // Delete vote
    const result = await Vote.deleteByUserAndMotion(req.user.userId, req.params.motionId);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No vote found to delete'
      });
    }

    // Update motion vote counts
    await Motion.updateVoteCounts(req.params.motionId);

    res.json({
      success: true,
      message: 'Vote removed successfully'
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
