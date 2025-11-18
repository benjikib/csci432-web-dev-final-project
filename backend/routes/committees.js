const express = require('express');
const { body, validationResult } = require('express-validator');
const Committee = require('../models/Committee');
const { authenticate, requirePermissionOrAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /committees/my-chairs
 * @desc    Get committees where current user is chair
 * @access  Private (requires authentication)
 */
router.get('/committees/my-chairs', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find all committees where this user is the chair
    const committees = await Committee.collection()
      .find({ chair: userId })
      .toArray();

    res.json({
      success: true,
      committees,
      total: committees.length
    });
  } catch (error) {
    console.error('Get chair committees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching chair committees'
    });
  }
});

/**
 * @route   GET /committees/:page
 * @desc    Get all committees (paginated)
 * @access  Public
 */
router.get('/committees/:page', async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 10;

    const result = await Committee.findAll(page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get committees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching committees'
    });
  }
});

/**
 * @route   GET /committee/:id
 * @desc    Get specific committee details (by slug or ID)
 * @access  Public
 */
router.get('/committee/:id', async (req, res) => {
  try {
    const committee = await Committee.findByIdOrSlug(req.params.id);

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: 'Committee not found'
      });
    }

    res.json({
      success: true,
      committee
    });
  } catch (error) {
    console.error('Get committee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching committee'
    });
  }
});

/**
 * @route   POST /committee/create
 * @desc    Create a new committee
 * @access  Public
 */
router.post('/committee/create',
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

      const { title, description, members } = req.body;

      // Create committee without owner for now
      const committee = await Committee.create({
        title,
        description,
        members: members || []
      });

      res.status(201).json({
        success: true,
        message: 'Committee created successfully',
        committee
      });
    } catch (error) {
      console.error('Create committee error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating committee'
      });
    }
  }
);

/**
 * @route   GET /committee/:id/settings
 * @desc    Get committee settings only (faster than full committee)
 * @access  Public
 */
router.get('/committee/:id/settings', async (req, res) => {
  try {
    const committee = await Committee.findByIdOrSlug(req.params.id);

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: 'Committee not found'
      });
    }

    res.json({
      success: true,
      settings: committee.settings || {}
    });
  } catch (error) {
    console.error('Get committee settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching committee settings'
    });
  }
});

/**
 * @route   PATCH /committee/:id/settings
 * @desc    Update only committee settings (partial update)
 * @access  Private (Admin or edit_any_committee permission required)
 */
router.patch('/committee/:id/settings',
  authenticate,
  requirePermissionOrAdmin('edit_any_committee'),
  async (req, res) => {
    try {
      const committee = await Committee.findByIdOrSlug(req.params.id);

      if (!committee) {
        return res.status(404).json({
          success: false,
          message: 'Committee not found'
        });
      }

      const updatedCommittee = await Committee.updateById(committee._id, {
        settings: req.body
      });

      res.json({
        success: true,
        message: 'Committee settings updated successfully',
        settings: updatedCommittee.settings
      });
    } catch (error) {
      console.error('Update committee settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating committee settings'
      });
    }
  }
);

/**
 * @route   PUT /committee/:id
 * @desc    Update a committee (by slug or ID)
 * @access  Private (Admin or edit_any_committee permission required)
 */
router.put('/committee/:id',
  authenticate,
  requirePermissionOrAdmin('edit_any_committee'),
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

      const committee = await Committee.findByIdOrSlug(req.params.id);

      if (!committee) {
        return res.status(404).json({
          success: false,
          message: 'Committee not found'
        });
      }

      const updates = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.description) updates.description = req.body.description;
      if (req.body.chair !== undefined) updates.chair = req.body.chair;
      if (req.body.settings) updates.settings = req.body.settings;

      const updatedCommittee = await Committee.updateById(committee._id, updates);

      res.json({
        success: true,
        message: 'Committee updated successfully',
        committee: updatedCommittee
      });
    } catch (error) {
      console.error('Update committee error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating committee'
      });
    }
  }
);

/**
 * @route   DELETE /committee/:id
 * @desc    Delete a committee (by slug or ID)
 * @access  Private (Admin or delete_any_committee permission required)
 */
router.delete('/committee/:id', authenticate, requirePermissionOrAdmin('delete_any_committee'), async (req, res) => {
  try {
    const committee = await Committee.findByIdOrSlug(req.params.id);

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: 'Committee not found'
      });
    }

    await Committee.deleteById(committee._id);

    res.json({
      success: true,
      message: 'Committee deleted successfully'
    });
  } catch (error) {
    console.error('Delete committee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting committee'
    });
  }
});

module.exports = router;
