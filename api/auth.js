const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { connectDB } = require('./_lib/database');
const User = require('./_lib/models/User');
const { authenticate, syncAuth0User, validateAuth0Token, requireRole } = require('./_lib/middleware/auth0');

// Create Express app for this route
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
app.post('/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required')
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

      const { email, password, name, communityCode } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        communityCode
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and receive JWT token
 * @access  Public
 */
app.post('/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
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

      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
app.post('/logout', authenticate, async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
app.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
        permissions: user.permissions,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
});

/**
 * @route   POST /api/auth/sync
 * @desc    Sync Auth0 user with database
 * @access  Private
 */
app.post('/sync', validateAuth0Token, syncAuth0User, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'User synced successfully',
      user: req.user
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during sync'
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
app.put('/profile',
  authenticate,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email')
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

      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.email) updates.email = req.body.email;
      if (req.body.picture) updates.picture = req.body.picture;

      const updatedUser = await User.updateById(req.user.userId, updates);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          picture: updatedUser.picture
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating profile'
      });
    }
  }
);

/**
 * @route   PUT /api/auth/settings
 * @desc    Update user settings
 * @access  Private
 */
app.put('/settings',
  authenticate,
  async (req, res) => {
    try {
      const { settings } = req.body;

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid settings format'
        });
      }

      const updatedUser = await User.updateById(req.user.userId, { settings });

      res.json({
        success: true,
        message: 'Settings updated successfully',
        settings: updatedUser.settings
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating settings'
      });
    }
  }
);

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

    // Normalize the path - remove /api/auth prefix if present
    const originalUrl = req.url;
    req.url = req.url.replace(/^\/api\/auth/, '') || '/';

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
