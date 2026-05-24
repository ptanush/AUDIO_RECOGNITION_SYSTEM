const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserByEmail, createUser, updateUser, getUserById } = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRATION = '7d'; // Token expires in 7 days

/**
 * Authentication Controller
 * 
 * Handles:
 * - User registration
 * - User login
 * - User logout (token invalidation on frontend)
 * - Token refresh
 * - User profile retrieval
 */

/**
 * REGISTER - Create new user account
 */
const register = async (req, res, next) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      res.status(400);
      throw new Error('Email, password, and confirm password are required');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    if (password !== confirmPassword) {
      res.status(400);
      throw new Error('Passwords do not match');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(409);
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser({
      email,
      username: username || email.split('@')[0],
      passwordHash
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // Record login
    await updateUser(user.id, {
      lastLogin: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      },
      token,
      expiresIn: JWT_EXPIRATION
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LOGIN - Authenticate user and return JWT token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // Update last login
    await updateUser(user.id, {
      lastLogin: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        songsUploaded: user.songsUploaded || 0
      },
      token,
      expiresIn: JWT_EXPIRATION
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LOGOUT - Invalidate token (frontend removes token)
 * 
 * Note: Since we're using stateless JWT, logout happens on client side
 * This endpoint confirms logout and can clear any server-side sessions if needed
 */
const logout = async (req, res, next) => {
  try {
    // Client is responsible for removing the token
    // Server can log the logout if needed
    res.json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * REFRESH TOKEN - Get new JWT token using existing valid token
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401);
      throw new Error('No token provided');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await getUserById(decoded.userId);

      if (!user) {
        res.status(401);
        throw new Error('User not found');
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      res.json({
        success: true,
        message: 'Token refreshed',
        token: newToken,
        expiresIn: JWT_EXPIRATION
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Token expired. Please login again.');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET PROFILE - Retrieve user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId; // Set by auth middleware

    if (!userId) {
      res.status(401);
      throw new Error('Not authenticated');
    }

    const user = await getUserById(userId);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        songsUploaded: user.songsUploaded || 0,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE PROFILE - Update user information
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId; // Set by auth middleware
    const { username } = req.body;

    if (!userId) {
      res.status(401);
      throw new Error('Not authenticated');
    }

    if (username && username.length < 2) {
      res.status(400);
      throw new Error('Username must be at least 2 characters');
    }

    const updatedUser = await updateUser(userId, {
      ...(username && { username })
    });

    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        songsUploaded: updatedUser.songsUploaded || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile
};
