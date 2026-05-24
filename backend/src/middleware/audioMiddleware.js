const AudioProcessingPipeline = require('../services/audioProcessingPipeline');

/**
 * Audio Middleware
 * 
 * Handles:
 * - Audio file validation (format, size, metadata)
 * - Rate limiting (30 requests/minute default)
 * - Error handling (graceful fallbacks)
 * - Logging (operation tracking)
 * - Query parameter validation
 */
class AudioMiddleware {
  // Rate limiting: track requests per IP
  static requestCounts = {};

  // Rate limit config
  static RATE_LIMIT_REQUESTS = 30;
  static RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

  /**
   * Validate audio file upload
   */
  static async validateAudioFile(req, res, next) {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file uploaded',
        required: 'multipart/form-data with file field'
      });
    }

    try {
      const validation = await AudioProcessingPipeline.validateAudioFile(req.file.path);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Audio file validation failed',
          errors: validation.errors
        });
      }

      next();
    } catch (err) {
      console.error('validateAudioFile error:', err);
      return res.status(500).json({ success: false, error: 'Audio validation error', details: err.message });
    }
  }

  /**
   * Validate match query parameters
   */
  static validateMatchQuery(req, res, next) {
    let { topN, threshold } = req.query;

    // Validate topN (1-50)
    if (topN) {
      const parsed = parseInt(topN, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 50) {
        return res.status(400).json({
          success: false,
          error: 'Invalid topN parameter',
          details: 'topN must be between 1 and 50'
        });
      }
      req.topN = parsed;
    } else {
      req.topN = 5;
    }

    // Validate threshold (0-1)
    if (threshold) {
      const parsed = parseFloat(threshold);
      if (isNaN(parsed) || parsed < 0 || parsed > 1) {
        return res.status(400).json({
          success: false,
          error: 'Invalid threshold parameter',
          details: 'threshold must be between 0 and 1 (e.g., 0.3 for 30%)'
        });
      }
      req.threshold = parsed;
    }

    next();
  }

  /**
   * Rate limiting middleware
   * 
   * Default: 30 requests per minute per IP
   * Prevents API abuse
   */
  static rateLimitMatcher(req, res, next) {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Initialize IP tracking
    if (!AudioMiddleware.requestCounts[clientIP]) {
      AudioMiddleware.requestCounts[clientIP] = [];
    }

    // Remove old requests outside the window
    AudioMiddleware.requestCounts[clientIP] = AudioMiddleware.requestCounts[clientIP].filter(
      (timestamp) => now - timestamp < AudioMiddleware.RATE_LIMIT_WINDOW
    );

    // Check if limit exceeded
    if (AudioMiddleware.requestCounts[clientIP].length >= AudioMiddleware.RATE_LIMIT_REQUESTS) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        details: `Maximum ${AudioMiddleware.RATE_LIMIT_REQUESTS} requests per minute`,
        retryAfter: Math.ceil(
          (AudioMiddleware.requestCounts[clientIP][0] + AudioMiddleware.RATE_LIMIT_WINDOW - now) / 1000
        )
      });
    }

    // Add current request
    AudioMiddleware.requestCounts[clientIP].push(now);

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': AudioMiddleware.RATE_LIMIT_REQUESTS,
      'X-RateLimit-Remaining': AudioMiddleware.RATE_LIMIT_REQUESTS - AudioMiddleware.requestCounts[clientIP].length,
      'X-RateLimit-Reset': new Date(
        Math.max(...AudioMiddleware.requestCounts[clientIP]) + AudioMiddleware.RATE_LIMIT_WINDOW
      ).toISOString()
    });

    next();
  }

  /**
   * Request logging middleware
   */
  static logRequest(req, res, next) {
    const startTime = Date.now();

    // Log request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

    // Log response when finished
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      const duration = Date.now() - startTime;
      const status = body.success ? 'OK' : 'ERROR';
      console.log(`  └─ ${status} (${duration}ms)`);
      return originalJson(body);
    };

    next();
  }

  /**
   * Global error handling middleware
   */
  static errorHandler(err, req, res, next) {
    console.error('Error:', err.message);

    // Don't expose stack traces in production
    const isDev = process.env.NODE_ENV !== 'production';
    const stack = isDev ? err.stack : undefined;

    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error',
      ...(stack && { stack })
    });
  }

  /**
   * Handle 404 errors
   */
  static notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  }

  /**
   * Cleanup temporary files after response
   */
  static cleanupFiles(req, res, next) {
    // Store original end function
    const originalEnd = res.end.bind(res);

    res.end = function (...args) {
      // Delete uploaded file if it exists
      if (req.file && req.file.path) {
        const fs = require('fs');
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Cleanup error:', err);
        });
      }

      return originalEnd(...args);
    };

    next();
  }

  /**
   * CORS middleware (already handled by express CORS, but included for completeness)
   */
  static corsHeaders(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  }

  /**
   * Health check middleware for monitoring
   */
  static healthCheck(req, res) {
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      features: AudioProcessingPipeline.getSystemInfo().features
    });
  }

  /**
   * Comprehensive API documentation endpoint
   */
  static apiDocs(req, res) {
    res.json({
      success: true,
      version: '1.0.0',
      description: 'Audio Identification System - Hackathon Grade Backend',
      endpoints: [
        {
          method: 'GET',
          path: '/health',
          description: 'Health check & system status',
          response: 'System info & features'
        },
        {
          method: 'GET',
          path: '/songs',
          description: 'List all uploaded songs',
          response: 'Array of songs with metadata'
        },
        {
          method: 'GET',
          path: '/songs/:id',
          description: 'Get song by ID',
          response: 'Song details'
        },
        {
          method: 'POST',
          path: '/songs/upload',
          description: 'Upload & process audio file',
          parameters: {
            songFile: 'Audio file (required)',
            title: 'Song title (optional)',
            description: 'Song description (optional)'
          },
          response: 'Song details + features'
        },
        {
          method: 'POST',
          path: '/songs/match',
          description: 'Match audio query against database',
          parameters: {
            queryFile: 'Audio file to match (required)',
            topN: 'Number of results (1-50, default 5)',
            threshold: 'Confidence threshold (0-1, default 0.3)'
          },
          response: 'Best match + top matches + features'
        },
        {
          method: 'DELETE',
          path: '/songs/:id',
          description: 'Delete song from database',
          response: 'Confirmation message'
        }
      ],
      matching: {
        algorithm: 'Multi-faceted Weighted Similarity',
        dimensions: {
          waveformStats: '25% - RMS, peak, ZCR, entropy, etc.',
          spectralFingerprint: '35% - 16-band energy + anchor points (PRIMARY)',
          audioSignature: '25% - Hash-based quick matching',
          metadata: '15% - Sample rate, channels, codec'
        },
        totalScore: '(waveform×0.25) + (spectral×0.35) + (signature×0.25) + (metadata×0.15)',
        confidence: 'score^0.8 × 100',
        threshold: '30% default (filters noise)'
      },
      performance: AudioProcessingPipeline.getSystemInfo().performance,
        rateLimit: {
          requests: AudioMiddleware.RATE_LIMIT_REQUESTS,
          window: '1 minute'
        }
    });
  }
}

module.exports = AudioMiddleware;
