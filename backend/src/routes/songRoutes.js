const express = require('express');
const { upload } = require('../config/uploadConfig');
const AudioMiddleware = require('../middleware/audioMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  uploadSong,
  matchSong,
  listSongs,
  getSongById,
  deleteSong,
  getMatchingStats
} = require('../controllers/songController');

const router = express.Router();

/**
 * Song Routes
 * 
 * Middleware pipeline:
 * 1. Logging (all requests)
 * 2. Rate limiting (POST /match)
 * 3. File validation (upload routes)
 * 4. Query validation (match route)
 * 5. Cleanup (remove temp files after response)
 * 6. Auth verification (protected routes - marked below)
 */

// Logging middleware (all routes)
router.use(AudioMiddleware.logRequest);

// GET: List all songs (public)
router.get('/', listSongs);

// GET: Database statistics and system info (public) - MUST be before /:id
router.get('/stats/matching', getMatchingStats);

// GET: Song by ID (public)
router.get('/:id', getSongById);

// POST: Upload song (PROTECTED - requires authentication)
// Flow: Auth → Upload → Validate → Extract features → Optimize → Save to DB
router.post(
  '/upload',
  verifyToken,  // ← Requires valid JWT token
  upload.single('songFile'),
  AudioMiddleware.validateAudioFile,
  AudioMiddleware.cleanupFiles,
  uploadSong
);

// POST: Match audio (PROTECTED - requires authentication)
// Flow: Auth → Upload → Validate → Extract features → Compare DB → Rank → Return results
router.post(
  '/match',
  verifyToken,  // ← Requires valid JWT token
  upload.single('queryFile'),
  AudioMiddleware.rateLimitMatcher,
  AudioMiddleware.validateAudioFile,
  AudioMiddleware.validateMatchQuery,
  AudioMiddleware.cleanupFiles,
  matchSong
);

// DELETE: Remove song (PROTECTED - requires authentication)
router.delete('/:id', verifyToken, deleteSong);

module.exports = router;
