const { auth } = require('express-openid-connect');
const { auth: jwtCheck } = require('express-oauth2-jwt-bearer');
const User = require('../models/User');

/**
 * Auth0 configuration for session-based authentication
 * This is useful for traditional web apps with server-side rendering
 */
const auth0Config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code',
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid profile email'
  }
};

/**
 * JWT validation middleware for API endpoints
 * Validates Access Tokens issued by Auth0
 */
const validateAuth0Token = jwtCheck({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

/**
 * Middleware to sync Auth0 user with our database
 * Creates or updates user in our MongoDB based on Auth0 profile
 */
async function syncAuth0User(req, res, next) {
  try {
    // Check if user is authenticated via Auth0
    // The JWT middleware puts decoded token in req.auth.payload
    if (!req.auth || !req.auth.payload || !req.auth.payload.sub) {
      return next();
    }

    const auth0Id = req.auth.payload.sub;

    // Check if user exists in our database
    let user = await User.findByAuth0Id(auth0Id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please log in again to sync your profile.'
      });
    }

    // Update existing user's last login
    await User.updateLastLogin(user._id);

    // Attach user to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      auth0Id: user.auth0Id,
      roles: user.roles,
      permissions: user.permissions
    };

    next();
  } catch (error) {
    console.error('Auth0 user sync error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync user profile'
    });
  }
}

/**
 * Combined authentication middleware
 * Supports both Auth0 tokens and custom JWT tokens
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization required.'
      });
    }

    const token = authHeader.substring(7);

    // Try Auth0 validation first
    try {
      await validateAuth0Token(req, res, async () => {
        // If Auth0 validation succeeds, sync the user
        await syncAuth0User(req, res, next);
      });
      return;
    } catch (auth0Error) {
      // If Auth0 validation fails, try custom JWT
      const jwt = require('jsonwebtoken');

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found. Invalid token.'
          });
        }

        req.user = {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          roles: user.roles,
          permissions: user.permissions
        };

        return next();
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
}

/**
 * Middleware to check if user has a specific role
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.roles || !req.user.roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${role}' required.`
      });
    }

    next();
  };
}

/**
 * Middleware to check if user has a specific permission
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Permission '${permission}' required.`
      });
    }

    next();
  };
}

module.exports = {
  auth0Config,
  auth0SessionAuth: auth,
  validateAuth0Token,
  syncAuth0User,
  authenticate,
  requireRole,
  requirePermission
};
