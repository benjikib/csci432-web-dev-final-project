const express = require('express');
const { body, validationResult } = require('express-validator');
const { connectDB } = require('./_lib/database');
const Committee = require('./_lib/models/Committee');
const { authenticate, requirePermissionOrAdmin } = require('./_lib/middleware/auth0');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @route   GET /api/committees/:page
 * @desc    Get all committees (paginated)
 * @access  Public
 */
app.get('/committees/:page', async (req, res) => {
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
 * @route   GET /api/committee/:id
 * @desc    Get specific committee details (by slug or ID)
 * @access  Public
 */
app.get('/committee/:id', async (req, res) => {
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
 * @route   POST /api/committee/create
 * @desc    Create a new committee
 * @access  Public
 */
app.post('/committee/create',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { title, description, members } = req.body;

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
 * @route   PUT /api/committee/:id
 * @desc    Update a committee (by slug or ID)
 * @access  Private (Admin or edit_any_committee permission required)
 */
app.put('/committee/:id',
  authenticate,
  requirePermissionOrAdmin('edit_any_committee'),
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty')
  ],
  async (req, res) => {
    try {
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
 * @route   DELETE /api/committee/:id
 * @desc    Delete a committee (by slug or ID)
 * @access  Private (Admin or delete_any_committee permission required)
 */
app.delete('/committee/:id', authenticate, requirePermissionOrAdmin('delete_any_committee'), async (req, res) => {
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

// Serverless function handler
module.exports = async (req, res) => {
  try {
    // Ensure database connection
    await connectDB();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Normalize the path - remove /api prefix if present
    req.url = req.url.replace(/^\/api/, '') || '/';

    // Pass to Express app
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
