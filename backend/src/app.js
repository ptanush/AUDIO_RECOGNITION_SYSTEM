const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const songRoutes = require('./routes/songRoutes');
const authRoutes = require('./routes/authRoutes');
const AudioMiddleware = require('./middleware/audioMiddleware');
const { ensureUploadDirectories } = require('./utils/fileStore');

const app = express();

// CORS — allow the Vite dev server and any localhost origin
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, curl) or from allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize databases
ensureUploadDirectories();

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/**
 * API Routes
 */

// Health check endpoint
app.get('/api/health', AudioMiddleware.healthCheck);

// API documentation
app.get('/api/docs', AudioMiddleware.apiDocs);

// Authentication routes (no prefix, mounted at /api/auth)
app.use('/api/auth', authRoutes);

// Song routes (with /api/songs prefix)
app.use('/api/songs', songRoutes);

// 404 handler
app.use(AudioMiddleware.notFound);

// Global error handler (must be last)
app.use(AudioMiddleware.errorHandler);

module.exports = app;
