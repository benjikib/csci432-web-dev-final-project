const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and authenticate user
 */
async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization required.'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Invalid token.'
      });
    }

    // Attach user to request object
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user) {
        req.user = {
          userId: user._id.toString(),
          email: user.email,
          name: user.name
        };
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
}

/**
 * Middleware to check if user has a specific permission or is an admin
 */
function requirePermissionOrAdmin(permission) {
  return async (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get full user data including roles and permissions
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is admin
      const isAdmin = user.roles && user.roles.includes('admin');

      // Check if user has the specific permission
      const hasPermission = user.permissions && user.permissions.includes(permission);

      if (isAdmin || hasPermission) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action'
        });
      }
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
}

/**
 * Middleware to check if user has a specific role
 */
function requireRole(role) {
  return async (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get full user data including roles
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user has the required role
      const hasRole = user.roles && user.roles.includes(role);

      if (hasRole) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: `This action requires ${role} role`
        });
      }
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking role'
      });
    }
  };
}

module.exports = { authenticate, optionalAuth, requirePermissionOrAdmin, requireRole };
