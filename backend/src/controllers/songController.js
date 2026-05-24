const path = require('path');
const fs = require('fs');
const AudioProcessingPipeline = require('../services/audioProcessingPipeline');
const { getAllSongs, getSongById, createSong, deleteSongById } = require('../models/Song');
const { incrementSongsUploaded } = require('../models/User');

/**
 * Song Controller
 * 
 * Handles all song-related requests:
 * - Upload & process audio files
 * - Match queries against database
 * - List & retrieve songs
 * - Delete songs
 */

const listSongs = async (req, res, next) => {
  try {
    const songs = await getAllSongs();
    res.json({
      success: true,
      count: songs.length,
      songs: songs.map((song) => ({
        id: song.id,
        title: song.title,
        description: song.description,
        duration: song.metadata?.duration || 0,
        createdAt: song.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

const getSongDetail = async (req, res, next) => {
  try {
    const song = await getSongById(req.params.id);
    if (!song) {
      res.status(404);
      throw new Error('Song not found');
    }

    res.json({
      success: true,
      song: {
        id: song.id,
        title: song.title,
        description: song.description,
        duration: song.metadata?.duration || 0,
        filename: song.filename,
        createdAt: song.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPLOAD SONG
 * 
 * Process:
 * 1. Validate audio file (format, size, metadata)
 * 2. Extract all 4 types of features (50-100ms)
 * 3. Optimize features for storage (reduce to 2-3 KB)
 * 4. Save to database with features
 * 5. Update user's song count
 * 6. Return song details + processing stats
 */
const uploadSong = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an audio file named songFile');
    }

    const userId = req.user?.userId; // From auth middleware
    const title = req.body.title || req.file.originalname;
    const description = req.body.description || '';
    const filePath = req.file.path;

    // Check for duplicate songs (same title and user)
    const existingSongs = await getAllSongs();
    const duplicate = existingSongs.find(song => 
      song.title === title && song.uploadedBy === userId
    );
    
    if (duplicate) {
      // Clean up uploaded file
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error('Could not clean up duplicate file:', err);
      }
      
      const error = new Error('A song with this title already exists in your uploads');
      error.status = 409;
      throw error;
    }

    // Validate audio file (async)
    const validation = await AudioProcessingPipeline.validateAudioFile(filePath);
    if (!validation || typeof validation.valid === 'undefined') {
      console.error('Unexpected validation result:', validation);
      res.status(500);
      throw new Error('Audio validation returned unexpected result');
    }
    if (!validation.valid) {
      console.error('Audio validation errors:', validation.errors);
      res.status(400);
      throw new Error(`Audio validation failed: ${Array.isArray(validation.errors) ? validation.errors.join(', ') : String(validation.errors)}`);
    }

    // Process upload: extract features
    const processingResult = await AudioProcessingPipeline.processUpload(filePath, {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    if (!processingResult.success) {
      throw new Error('Feature extraction failed');
    }

    // Create song with features
    const song = await createSong({
      title,
      description,
      filename: path.basename(filePath),
      features: processingResult.features,
      metadata: processingResult.features.metadata,
      uploadedBy: userId // Track which user uploaded
    });

    // Update user's song count if authenticated
    if (userId) {
      try {
        await incrementSongsUploaded(userId);
      } catch (err) {
        console.error('Could not update user song count:', err);
        // Don't fail the upload if user update fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Song uploaded and processed successfully',
      song: {
        id: song.id,
        title: song.title,
        description: song.description,
        duration: song.metadata.duration,
        createdAt: song.createdAt,
        uploadedBy: userId
      },
      processingMetrics: {
        totalTime: processingResult.processingTime,
        featuresExtracted: {
          metadataFields: 6,
          waveformSamples: 8,
          spectralBands: 16,
          signatureFields: 5
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * MATCH SONG
 * 
 * Process:
 * 1. Validate query audio file
 * 2. Extract features from query (50-100ms)
 * 3. Compare against all database songs (30-80ms)
 * 4. Calculate weighted similarity scores (10-30ms)
 * 5. Rank matches by confidence (descending)
 * 6. Return best match + top N + detailed features breakdown
 * 
 * Total time: 200-400ms for 100-song database
 * 
 * Response includes:
 * - bestMatch: highest confidence match
 * - confidence: 0-100 percentage
 * - topMatches: ranked list of top N
 * - matchingFeatures: breakdown of 4 dimensions
 * - processingMetrics: timing + stats
 * - processingStages: 4 animation stages
 */
const matchSong = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an audio file named queryFile');
    }

    // Get all songs from database
    const allSongs = await getAllSongs();
    if (allSongs.length === 0) {
      res.status(404);
      throw new Error(
        'No songs in database. Upload reference songs first using /songs/upload'
      );
    }

    // Validate query file (async)
    const validation = await AudioProcessingPipeline.validateAudioFile(req.file.path);
    if (!validation.valid) {
      res.status(400);
      throw new Error(`Query audio validation failed: ${validation.errors.join(', ')}`);
    }

    // Process match with options
    const matchOptions = {
      topN: req.topN || 5,
      threshold: req.threshold
    };

    const matchResult = await AudioProcessingPipeline.processMatch(
      req.file.path,
      allSongs,
      matchOptions
    );

    if (!matchResult.success) {
      throw new Error('Matching failed');
    }

    // Return comprehensive response
    res.json({
      success: true,
      bestMatch: matchResult.bestMatch,
      confidence: matchResult.confidence,
      topMatches: matchResult.topMatches,
      matchingFeatures: matchResult.matchingFeatures,
      processingMetrics: matchResult.processingMetrics,
      processingStages: matchResult.processingStages,
      message: matchResult.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE SONG
 * 
 * Remove song from database
 */
const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteSongById(id);
    if (!deleted) {
      res.status(404);
      throw new Error('Song not found');
    }

    const allSongs = await getAllSongs();

    res.json({
      success: true,
      message: 'Song deleted successfully',
      remainingSongs: allSongs.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET MATCHING STATISTICS
 * 
 * Return database stats and system info
 */
const getMatchingStats = async (req, res, next) => {
  try {
    const allSongs = await getAllSongs();

    // Calculate statistics
    const totalFeatureSize = allSongs.length * 2.5; // ~2.5 KB per song
    const avgDuration =
      allSongs.length > 0
        ? (allSongs.reduce((sum, s) => sum + (s.metadata?.duration || 0), 0) /
            allSongs.length).toFixed(2)
        : 0;

    const codecs = new Set(allSongs.map((s) => s.metadata?.codec));

    res.json({
      success: true,
      stats: {
        totalSongs: allSongs.length,
        averageDuration: avgDuration,
        formats: Array.from(codecs),
        memoryUsage: {
          totalFeatures: `${totalFeatureSize.toFixed(1)} KB`,
          perSong: '2-3 KB'
        }
      },
      systemInfo: AudioProcessingPipeline.getSystemInfo()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSongs,
  getSongById: getSongDetail,
  uploadSong,
  matchSong,
  deleteSong,
  getMatchingStats
};
