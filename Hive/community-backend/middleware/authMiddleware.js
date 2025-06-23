const { verifyToken } = require('../utils/generateToken');
const jwtBlacklist = require('../utils/jwtBlacklist');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Check if token is blacklisted
      const isBlacklisted = await jwtBlacklist.isBlacklisted(token);
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          message: 'Token has been revoked'
        });
      }

      // Verify token
      const decoded = verifyToken(token);
      
      // Get user from token
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Update last seen
      await user.updateLastSeen();
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Optional authentication - doesn't require token but adds user if available
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        // Check if token is blacklisted
        const isBlacklisted = await jwtBlacklist.isBlacklisted(token);
        if (!isBlacklisted) {
          const decoded = verifyToken(token);
          const user = await User.findById(decoded.userId).select('-password');
          
          if (user && user.isActive) {
            await user.updateLastSeen();
            req.user = user;
          }
        }
      } catch (error) {
        // Token is invalid, but we don't block the request
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Check if user is the author of a resource
const isAuthor = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      if (resource.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to perform this action'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('IsAuthor middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

// Check if user is moderator or admin
const isModerator = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // For now, we'll use reputation as a simple moderator check
    // In a real app, you'd have a proper role system
    if (req.user.reputation < 100) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  } catch (error) {
    console.error('IsModerator middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Import Redis rate limiters
const { rateLimiters } = require('./redisRateLimit');

module.exports = {
  protect,
  optionalAuth,
  isAuthor,
  isModerator,
  rateLimiters
}; 
 