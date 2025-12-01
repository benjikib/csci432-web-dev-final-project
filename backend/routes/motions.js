const express = require('express');
const { body, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const Committee = require('../models/Committee');
const User = require('../models/User');
const { authenticate, requirePermissionOrAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /committee/:id/motions/:page
 * @desc    Get all motions in committee (paginated, by slug or ID)
 * @query   ?type=motionType&status=active&targetMotion=motionId
 * @access  Public
 */
router.get('/committee/:id/motions/:page', async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 10;
    const { type, status, targetMotion } = req.query;

    // Verify committee exists
    const committee = await Committee.findByIdOrSlug(req.params.id);
    if (!committee) {
      return res.status(404).json({
        success: false,
        message: 'Committee not found'
      });
    }

    let result = await Committee.findMotions(committee._id, page, limit);

    // Apply filters if provided
    let filteredMotions = result.motions;
    
    if (type) {
      filteredMotions = filteredMotions.filter(m => m.motionType === type);
    }
    
    if (status) {
      filteredMotions = filteredMotions.filter(m => m.status === status);
    }
    
    if (targetMotion) {
      filteredMotions = filteredMotions.filter(m => 
        m.amendTargetMotionId && m.amendTargetMotionId.toString() === targetMotion
      );
    }

    // Update result with filtered motions
    result = {
      ...result,
      motions: filteredMotions,
      total: filteredMotions.length,
      totalPages: Math.ceil(filteredMotions.length / limit)
    };

    // Populate author information for each motion
    const motionsWithAuthors = await Promise.all(
      result.motions.map(async (motion) => {
        if (motion.author) {
          try {
            const authorId = typeof motion.author === 'string' ? motion.author : motion.author.toString();
            const author = await User.findById(authorId);

            return {
              ...motion,
              authorInfo: author ? {
                id: author._id,
                name: author.settings?.displayName || author.name,
                email: author.email,
                picture: author.picture
              } : null
            };
          } catch (err) {
            console.error('Error fetching author for motion:', motion.title, err);
            return motion;
          }
        }
        return motion;
      })
    );

    res.json({
      success: true,
      ...result,
      motions: motionsWithAuthors,
      filters: { type, status, targetMotion } // Include applied filters in response
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

    const motion = await Committee.findMotionById(committee._id, req.params.motionId);

    if (!motion) {
      return res.status(404).json({
        success: false,
        message: 'Motion not found'
      });
    }

    // Populate author information
    let motionWithAuthor = motion;
    if (motion.author) {
      try {
        const authorId = typeof motion.author === 'string' ? motion.author : motion.author.toString();
        const author = await User.findById(authorId);
        motionWithAuthor = {
          ...motion,
          authorInfo: author ? {
            id: author._id,
            name: author.settings?.displayName || author.name,
            email: author.email,
            picture: author.picture
          } : null
        };
      } catch (err) {
        console.error('Error fetching author:', err);
      }
    }

    res.json({
      success: true,
      motion: motionWithAuthor
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
 * @access  Private (requires authentication)
 */
router.post('/committee/:id/motion/create',
  authenticate,
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

      // Create motion with userId reference
      // Disallow guest users from creating motions in this committee
      try {
        const role = await Committee.getMemberRole(committee._id, req.user.userId);
        if (role === 'guest') {
          return res.status(403).json({ success: false, message: 'Guest members are not allowed to create motions in this committee' });
        }
      } catch (e) {
        console.warn('Failed to verify member role for user:', e);
      }

      const motion = await Committee.createMotion(committee._id, {
        title,
        description,
        fullDescription: fullDescription || description,
        author: req.user ? req.user.userId : null
      });

      // Populate author information for response
      let motionWithAuthor = motion;
      if (motion.author) {
        try {
          const author = await User.findById(motion.author);
          if (author) {
            motionWithAuthor = {
              ...motion,
              authorInfo: {
                id: author._id,
                name: author.settings?.displayName || author.name,
                email: author.email,
                picture: author.picture
              }
            };
          }
        } catch (err) {
          console.error('Error fetching author for new motion:', err);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Motion created successfully',
        motion: motionWithAuthor
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
 * @access  Private (Admin or edit_any_motion permission required)
 */
router.put('/committee/:id/motion/:motionId',
  authenticate,
  requirePermissionOrAdmin('edit_any_motion'),
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

      const motion = await Committee.findMotionById(committee._id, req.params.motionId);

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

      const updatedMotion = await Committee.updateMotion(committee._id, req.params.motionId, updates);

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
 * @access  Private (Admin or delete_any_motion permission required)
 */
router.delete('/committee/:id/motion/:motionId', authenticate, requirePermissionOrAdmin('delete_any_motion'), async (req, res) => {
  try {
    // Verify committee exists
    const committee = await Committee.findByIdOrSlug(req.params.id);
    if (!committee) {
      return res.status(404).json({
        success: false,
        message: 'Committee not found'
      });
    }

    const motion = await Committee.findMotionById(committee._id, req.params.motionId);

    if (!motion) {
      return res.status(404).json({
        success: false,
        message: 'Motion not found'
      });
    }

    await Committee.deleteMotion(committee._id, req.params.motionId);

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

/**
 * @route   GET /committee/:id/motion/:motionId/subsidiaries
 * @desc    Get all subsidiary motions affecting a specific motion
 * @access  Public
 */
router.get('/committee/:id/motion/:motionId/subsidiaries', async (req, res) => {
  try {
    // Verify committee exists
    const committee = await Committee.findByIdOrSlug(req.params.id);
    if (!committee) {
      return res.status(404).json({
        success: false,
        message: 'Committee not found'
      });
    }

    // Verify target motion exists
    const targetMotion = await Committee.findMotionById(committee._id, req.params.motionId);
    if (!targetMotion) {
      return res.status(404).json({
        success: false,
        message: 'Target motion not found'
      });
    }

    // Find all motions where amendTargetMotionId matches this motion
    const allMotions = await Committee.findMotions(committee._id, 1, 1000); // Get all motions
    const subsidiaryMotions = allMotions.motions.filter(m => 
      m.amendTargetMotionId && m.amendTargetMotionId.toString() === req.params.motionId.toString()
    );

    // Populate author information
    const motionsWithAuthors = await Promise.all(
      subsidiaryMotions.map(async (motion) => {
        if (motion.author) {
          try {
            const authorId = typeof motion.author === 'string' ? motion.author : motion.author.toString();
            const author = await User.findById(authorId);

            return {
              ...motion,
              authorInfo: author ? {
                id: author._id,
                name: author.settings?.displayName || author.name,
                email: author.email,
                picture: author.picture
              } : null
            };
          } catch (err) {
            console.error('Error fetching author:', err);
            return motion;
          }
        }
        return motion;
      })
    );

    res.json({
      success: true,
      targetMotion: {
        id: targetMotion._id,
        title: targetMotion.title
      },
      subsidiaryMotions: motionsWithAuthors,
      total: motionsWithAuthors.length
    });
  } catch (error) {
    console.error('Get subsidiary motions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subsidiary motions'
    });
  }
});

module.exports = router;
