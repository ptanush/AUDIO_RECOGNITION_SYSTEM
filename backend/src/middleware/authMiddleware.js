const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Authentication Middleware
 * 
 * Verifies JWT token and extracts user information
 * Protects routes that require authentication
 */

/**
 * Verify JWT token and attach user info to request
 */
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        details: 'Authorization header with Bearer token is required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email }
    next();
  } catch (error) {
    console.error('JWT verify error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        details: 'Please login again to get a new token'
      });
    }

    res.status(403).json({
      success: false,
      error: 'Invalid token',
      details: 'Token verification failed'
    });
  }
};

/**
 * Optional token verification - doesn't fail if token is missing
 * Useful for endpoints that can work with or without authentication
 */
const optionalVerifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Silently ignore token errors for optional auth
    next();
  }
};

module.exports = {
  verifyToken,
  optionalVerifyToken
};
