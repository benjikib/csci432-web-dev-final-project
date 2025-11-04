const express = require('express');
const { body, validationResult } = require('express-validator');
const Committee = require('../models/Committee');

const router = express.Router();

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
 * @route   PUT /committee/:id
 * @desc    Update a committee (by slug or ID)
 * @access  Public
 */
router.put('/committee/:id',
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
 * @access  Public
 */
router.delete('/committee/:id', async (req, res) => {
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
