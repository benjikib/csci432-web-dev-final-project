const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { authenticate, requireRole } = require('../middleware/auth');

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

      const { email, password, name, communityCode, isAdmin, organizationInviteCode } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // If not an admin, require organization invite code
      if (!isAdmin && !organizationInviteCode) {
        return res.status(400).json({
          success: false,
          message: 'Organization invite code is required to sign up'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate profile picture URL using DiceBear API
      const profilePictureUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=54966D&textColor=ffffff`;

      let organization = null;
      let organizationId = null;
      let organizationRole = null;

      // If user provided an invite code, verify and join organization
      if (organizationInviteCode && !isAdmin) {
        organization = await Organization.findByInviteCode(organizationInviteCode);
        if (!organization) {
          return res.status(400).json({
            success: false,
            message: 'Invalid organization invite code'
          });
        }
        organizationId = organization._id;
        organizationRole = 'member';
      }

      // Create user (assign default role 'user' or 'guest')
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        communityCode,
        picture: profilePictureUrl,
        roles: ['user'], // All users start with 'user' role
        organizationId,
        organizationRole
      });

      // If joining an organization, add user to organization members
      if (organization) {
        await Organization.addMember(organization._id, user._id);
      }

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
          name: user.name,
          isAdmin,
          organizationId,
          organizationRole,
          requiresPayment: isAdmin // Frontend will redirect to payment page
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
      console.log('Login request body:', req.body);
      console.log('Login request headers:', req.headers);

      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
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

      // Check if user has a password
      if (!user.password || typeof user.password !== 'string') {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
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
        picture: user.picture,
        communityCode: user.communityCode,
        organizationId: user.organizationId,
        organizationRole: user.organizationRole,
        roles: user.roles || ['guest'],
        permissions: user.permissions || [],
        settings: user.settings || {
          theme: 'light',
          notifications: true,
          displayName: user.name
        },
        memberCommittees: user.memberCommittees || [],
        chairedCommittees: user.chairedCommittees || [],
        ownedCommittees: user.ownedCommittees || [],
        guestCommittees: user.guestCommittees || [],
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
 * @route   GET /auth/settings
 * @desc    Get current user's settings
 * @access  Private
 */
router.get('/settings', authenticate, async (req, res) => {
  try {
    // Make sure req.user exists and has userId
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user doesn't have settings, create default settings
    let settings = user.settings;
    if (!settings) {
      settings = {
        theme: 'light',
        notifications: true,
        displayName: user.name || 'User'
      };

      // Update user with default settings
      await User.updateSettings(req.user.userId, settings);
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching settings'
    });
  }
});

/**
 * @route   PUT /auth/settings
 * @desc    Update current user's settings (theme, notifications)
 * @access  Private
 */
router.put('/settings', authenticate, async (req, res) => {
  try {
    const { theme, notifications } = req.body;

    const settingsUpdate = {};
    if (theme !== undefined) settingsUpdate.theme = theme;
    if (notifications !== undefined) settingsUpdate.notifications = notifications;

    const updatedUser = await User.updateSettings(req.user.userId, settingsUpdate);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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
});

/**
 * @route   PUT /auth/profile
 * @desc    Update current user's profile (name, display name)
 * @access  Private
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, displayName } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const updates = {};

    // Update full name
    if (name !== undefined) {
      updates.name = name;
    }

    // Update display name in settings
    if (displayName !== undefined) {
      const settingsUpdate = { displayName };
      await User.updateSettings(req.user.userId, settingsUpdate);
    }

    // Update other user fields if provided
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      await User.updateById(req.user.userId, updates);
    }

    // Fetch and return updated user
    const updatedUser = await User.findById(req.user.userId);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        bio: updatedUser.bio,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        picture: updatedUser.picture,
        communityCode: updatedUser.communityCode,
        settings: updatedUser.settings || {
          theme: 'light',
          notifications: true,
          displayName: updatedUser.name
        },
        roles: updatedUser.roles,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

/**
 * @route   GET /auth/users
 * @desc    Get all users (admin only, filtered by organization unless super-admin)
 * @access  Private (Admin only)
 */
router.get('/users', authenticate, async (req, res) => {
  try {
    // Check if user is super-admin or org-admin
    const isSuperAdmin = req.user.roles && req.user.roles.includes('super-admin');
    const isOrgAdmin = req.user.organizationRole === 'admin';
    
    if (!isSuperAdmin && !isOrgAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
    }
    
    let filter = {};
    if (!isSuperAdmin) {
      // For org-admins, filter by their organizationId
      const currentUser = await User.findById(req.user.userId);
      const organizationId = currentUser?.organizationId;
      if (organizationId) {
        filter.organizationId = new ObjectId(organizationId);
      }
    }
    
    const users = await User.collection().find(filter).toArray();

    const usersData = users.map(user => ({
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      organizationId: user.organizationId, // ← Include this for filtering
      organizationRole: user.organizationRole,
      roles: user.roles || ['guest'],
      permissions: user.permissions || [],
      settings: user.settings || {
        theme: 'light',
        notifications: true,
        displayName: user.name
      },
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      users: usersData
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

/**
 * @route   GET /auth/users/list
 * @desc    Get list of users for selection (authenticated users, filtered by organization unless super-admin)
 * @access  Private (authenticated)
 */
router.get('/users/list', authenticate, async (req, res) => {
  try {
    // Check if user is super-admin or org-admin
    const isSuperAdmin = req.user.roles && req.user.roles.includes('super-admin');
    const isOrgAdmin = req.user.organizationRole === 'admin';
    
    if (!isSuperAdmin && !isOrgAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
    }
    const search = (req.query.search || '').trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Use the isSuperAdmin already declared above for filtering
    let filter = {};
    if (!isSuperAdmin) {
      const currentUser = await User.findById(req.user.userId);
      const organizationId = currentUser?.organizationId;
      if (organizationId) {
        filter.organizationId = new ObjectId(organizationId);
      }
    }
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { 'settings.displayName': regex }
      ];
    }

    const total = await User.collection().countDocuments(filter);
    const users = await User.collection()
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();

    const usersData = users.map(u => ({
      _id: u._id,
      email: u.email,
      name: u.name,
      picture: u.picture,
      settings: u.settings
    }));

    res.json({ success: true, users: usersData, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get users list error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
});

/**
 * @route   PUT /auth/users/:userId
 * @desc    Update a user's roles and permissions (admin only)
 * @access  Private (Admin only)
 */
router.put('/users/:userId', authenticate, async (req, res) => {
  try {
    // Check if user is super-admin or org-admin
    const isSuperAdmin = req.user.roles && req.user.roles.includes('super-admin');
    const isOrgAdmin = req.user.organizationRole === 'admin';
    
    if (!isSuperAdmin && !isOrgAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
    }
    
    const { roles, permissions, organizationRole } = req.body;
    const { userId } = req.params;

    const updates = {};
    if (roles !== undefined) updates.roles = roles;
    if (permissions !== undefined) updates.permissions = permissions;
    if (organizationRole !== undefined) updates.organizationRole = organizationRole;
    updates.updatedAt = new Date();

    const updatedUser = await User.updateById(userId, updates);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        roles: updatedUser.roles,
        organizationRole: updatedUser.organizationRole,
        permissions: updatedUser.permissions
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
});

/**
 * @route   DELETE /auth/user/:userId
 * @desc    Delete user account (user can delete own account, admins can delete any)
 * @access  Private
 */
router.delete('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;
    
    // Check if user is deleting their own account or is an admin
    const isSuperAdmin = req.user.roles && req.user.roles.includes('super-admin');
    const isOrgAdmin = req.user.organizationRole === 'admin';
    const isSelfDelete = String(requestingUserId) === String(userId);
    
    if (!isSelfDelete && !isSuperAdmin && !isOrgAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user'
      });
    }

    // Get user before deletion
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user is deleting their own account and they own an organization, delete it
    let deletedOrgStats = null;
    if (isSelfDelete && user.organizationId && user.organizationRole === 'admin') {
      const Organization = require('../models/Organization');
      const organization = await Organization.findById(user.organizationId);
      
      if (organization && String(organization.owner) === String(userId)) {
        console.log(`User ${userId} is organization owner - deleting organization ${organization._id}`);
        
        // Delete organization and cascade (committees, motions, votes, comments, notifications)
        const { getDB } = require('../config/database');
        const db = getDB();
        const orgId = new ObjectId(user.organizationId);

        // Get all committees in this organization
        const committees = await db.collection('committees')
          .find({ organizationId: orgId })
          .toArray();
        
        const committeeIds = committees.map(c => c._id);

        // Get all motions in these committees
        const motionIds = [];
        for (const committee of committees) {
          if (committee.motions && Array.isArray(committee.motions)) {
            motionIds.push(...committee.motions.map(m => m._id || m.id));
          }
        }

        // Delete cascade
        if (motionIds.length > 0) {
          await db.collection('votes').deleteMany({ motionId: { $in: motionIds } });
          await db.collection('comments').deleteMany({ motionId: { $in: motionIds } });
        }
        if (committeeIds.length > 0) {
          await db.collection('notifications').deleteMany({ committeeId: { $in: committeeIds } });
        }
        await db.collection('committees').deleteMany({ organizationId: orgId });

        // Remove organization reference from all users
        await db.collection('users').updateMany(
          { organizationId: orgId },
          { 
            $unset: { 
              organizationId: '', 
              organizationRole: '' 
            }
          }
        );

        // Delete the organization
        await Organization.deleteById(user.organizationId);

        deletedOrgStats = {
          organizationId: String(organization._id),
          organizationName: organization.name,
          committees: committeeIds.length,
          motions: motionIds.length
        };

        console.log(`Deleted organization: ${organization.name} (${deletedOrgStats.committees} committees, ${deletedOrgStats.motions} motions)`);
      }
    }

    // Remove user from all committees
    const Committee = require('../models/Committee');
    const { getDB } = require('../config/database');
    const db = getDB();
    
    await db.collection('committees').updateMany(
      { 'members.userId': new ObjectId(userId) },
      { $pull: { members: { userId: new ObjectId(userId) } } }
    );

    // Delete user's votes
    await db.collection('votes').deleteMany({ userId: new ObjectId(userId) });

    // Delete user's comments
    await db.collection('comments').deleteMany({ author: new ObjectId(userId) });

    // Delete user's notifications
    const Notification = require('../models/Notification');
    await Notification.collection().deleteMany({ userId: new ObjectId(userId) });

    // Delete the user
    await User.deleteById(userId);

    const response = {
      success: true,
      message: 'User account deleted successfully'
    };

    if (deletedOrgStats) {
      response.organizationDeleted = true;
      response.organizationStats = deletedOrgStats;
    }

    res.json(response);
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
});

module.exports = router;
