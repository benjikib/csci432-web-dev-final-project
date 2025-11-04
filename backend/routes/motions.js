const express = require('express');
const { body, validationResult } = require('express-validator');
const Motion = require('../models/Motion');
const Committee = require('../models/Committee');

const router = express.Router();

/**
 * @route   GET /committee/:id/motions/:page
 * @desc    Get all motions in committee (paginated, by slug or ID)
 * @access  Public
 */
router.get('/committee/:id/motions/:page', async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 10;

    // Verify committee exists
    const committee = await Committee.findByIdOrSlug(req.params.id);
    if (!committee) {
      return res.status(404).json({
        success: false,
        message: 'Committee not found'
      });
    }

    const result = await Motion.findByCommittee(committee._id, page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get motions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching motions'
    });
  }
});

/**
 * @route   GET /committee/:id/motion/:motionId
 * @desc    Get specific motion details (committee by slug or ID)
 * @access  Public
 */
router.get('/committee/:id/motion/:motionId', async (req, res) => {
  try {
    // Verify committee exists and get its ID
    const committee = await Committee.findByIdOrSlug(req.params.id);
    if (!committee) {
      return res.status(404).json({
        success: false,
        message: 'Committee not found'
      });
    }

    const motion = await Motion.findByIdAndCommittee(req.params.motionId, committee._id);

    if (!motion) {
      return res.status(404).json({
        success: false,
        message: 'Motion not found'
      });
    }

    res.json({
      success: true,
      motion
    });
  } catch (error) {
    console.error('Get motion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching motion'
    });
  }
});

/**
 * @route   POST /committee/:id/motion/create
 * @desc    Create a new motion (committee by slug or ID)
 * @access  Public
 */
router.post('/committee/:id/motion/create',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required')
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

      // Verify committee exists
      const committee = await Committee.findByIdOrSlug(req.params.id);
      if (!committee) {
        return res.status(404).json({
          success: false,
          message: 'Committee not found'
        });
      }

      const { title, description, fullDescription } = req.body;

      // Create motion without author for now
      const motion = await Motion.create({
        committeeId: committee._id,
        title,
        description,
        fullDescription: fullDescription || description
      });

      res.status(201).json({
        success: true,
        message: 'Motion created successfully',
        motion
      });
    } catch (error) {
      console.error('Create motion error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating motion'
      });
    }
  }
);

/**
 * @route   PUT /committee/:id/motion/:motionId
 * @desc    Update a motion (committee by slug or ID)
 * @access  Public
 */
router.put('/committee/:id/motion/:motionId',
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty')
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

      // Verify committee exists
      const committee = await Committee.findByIdOrSlug(req.params.id);
      if (!committee) {
        return res.status(404).json({
          success: false,
          message: 'Committee not found'
        });
      }

      const motion = await Motion.findByIdAndCommittee(req.params.motionId, committee._id);

      if (!motion) {
        return res.status(404).json({
          success: false,
          message: 'Motion not found'
        });
      }

      const updates = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.description) updates.description = req.body.description;
      if (req.body.fullDescription) updates.fullDescription = req.body.fullDescription;
      if (req.body.status) updates.status = req.body.status;

      const updatedMotion = await Motion.updateById(req.params.motionId, updates);

      res.json({
        success: true,
        message: 'Motion updated successfully',
        motion: updatedMotion
      });
    } catch (error) {
      console.error('Update motion error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating motion'
      });
    }
  }
);

/**
 * @route   DELETE /committee/:id/motion/:motionId
 * @desc    Delete a motion (committee by slug or ID)
 * @access  Public
 */
router.delete('/committee/:id/motion/:motionId', async (req, res) => {
  try {
    // Verify committee exists
    const committee = await Committee.findByIdOrSlug(req.params.id);
    if (!committee) {
      return res.status(404).json({
        success: false,
        message: 'Committee not found'
      });
    }

    const motion = await Motion.findByIdAndCommittee(req.params.motionId, committee._id);

    if (!motion) {
      return res.status(404).json({
        success: false,
        message: 'Motion not found'
      });
    }

    await Motion.deleteById(req.params.motionId);

    res.json({
      success: true,
      message: 'Motion deleted successfully'
    });
  } catch (error) {
    console.error('Delete motion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting motion'
    });
  }
});

module.exports = router;
