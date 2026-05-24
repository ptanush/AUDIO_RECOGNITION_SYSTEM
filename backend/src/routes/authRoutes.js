const express = require('express');
const { register, login, logout, refreshToken, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Authentication Routes
 * 
 * POST   /auth/register    - Create new user account
 * POST   /auth/login       - Login & get JWT token
 * POST   /auth/logout      - Logout (client removes token)
 * POST   /auth/refresh     - Refresh JWT token
 * GET    /auth/profile     - Get user profile (protected)
 * PUT    /auth/profile     - Update user profile (protected)
 */

/**
 * Public routes (no authentication required)
 */

// POST: Register new user
// Body: { email, username, password, confirmPassword }
// Returns: { user, token, expiresIn }
router.post('/register', register);

// POST: Login user
// Body: { email, password }
// Returns: { user, token, expiresIn }
router.post('/login', login);

// POST: Logout
// Removes token from client (stateless JWT logout)
router.post('/logout', logout);

// POST: Refresh token
// Header: Authorization: Bearer <token>
// Returns: { token, expiresIn }
router.post('/refresh', refreshToken);

/**
 * Protected routes (authentication required)
 */

// GET: User profile
// Header: Authorization: Bearer <token>
// Returns: { user }
router.get('/profile', verifyToken, getProfile);

// PUT: Update user profile
// Header: Authorization: Bearer <token>
// Body: { username }
// Returns: { user }
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
