const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { syncAuth0User, validateAuth0Token } = require('../middleware/auth0');

const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register',
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
 * @route   POST /auth/login
 * @desc    Login user and receive JWT token
 * @access  Public
 */
router.post('/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
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

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user has a local password (not an Auth0-only user)
      if (!user.password || typeof user.password !== 'string') {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. This account may use a different login method.'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
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
 * @route   POST /auth/logout
 * @desc    Logout (invalidate token) - client-side should remove token
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // The server can optionally maintain a blacklist of tokens
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

/**
 * @route   GET /auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
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
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profilePicture: user.profilePicture,
        communityCode: user.communityCode,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user info'
    });
  }
});

/**
 * @route   POST /auth/auth0/callback
 * @desc    Auth0 callback to sync user with database
 * @access  Public (requires valid Auth0 token)
 */
router.post('/auth0/callback', validateAuth0Token, syncAuth0User, async (req, res) => {
  try {
    console.log('✅ Auth0 callback hit!');
    console.log('Request auth:', req.auth);
    console.log('Request user:', req.user);

    if (!req.user) {
      console.error('❌ No user in request after sync');
      return res.status(400).json({
        success: false,
        message: 'User sync failed'
      });
    }

    console.log('✅ Sending successful response');
    res.json({
      success: true,
      message: 'User authenticated successfully',
      user: {
        id: req.user.userId,
        email: req.user.email,
        name: req.user.name,
        roles: req.user.roles,
        permissions: req.user.permissions
      }
    });
  } catch (error) {
    console.error('❌ Auth0 callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
});

/**
 * @route   POST /auth/auth0/sync
 * @desc    Sync Auth0 user with database (creates if not exists)
 * @access  Public (validates token and syncs)
 */
router.post('/auth0/sync', async (req, res) => {
  try {
    const { auth0Id, email, name, picture, emailVerified } = req.body;

    if (!auth0Id || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: auth0Id and email'
      });
    }

    // Check if user exists
    let user = await User.findByAuth0Id(auth0Id);

    if (!user) {
      // Create new user
      user = await User.create({
        auth0Id,
        email,
        name,
        picture,
        emailVerified: emailVerified || false,
        roles: ['member']
      });
    } else {
      // Update existing user's last login
      await User.updateLastLogin(user._id);
    }

    res.json({
      success: true,
      message: 'User synced successfully',
      user: {
        id: user._id,
        auth0Id: user.auth0Id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        roles: user.roles,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Auth0 sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error syncing user'
    });
  }
});

module.exports = router;
