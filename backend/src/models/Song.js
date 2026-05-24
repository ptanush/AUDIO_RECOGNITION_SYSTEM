const { v4: uuidv4 } = require('uuid');
const { getDatabase, initializeDatabase } = require('../config/mongo');

const getSongsCollection = async () => {
  const db = await getDatabase();
  return db.collection('songs');
};

const ensureSongsDatabase = async () => {
  const db = await initializeDatabase();
  return db.collection('songs');
};

const getAllSongs = async () => {
  const collection = await getSongsCollection();
  return collection.find({}).sort({ createdAt: -1 }).toArray();
};

const getSongById = async (id) => {
  const collection = await getSongsCollection();
  return collection.findOne({ id });
};

const createSong = async ({ title, description, filename, features, metadata, uploadedBy }) => {
  const collection = await getSongsCollection();
  const now = new Date().toISOString();

  const newSong = {
    id: uuidv4(),
    title: title || 'Unknown Song',
    description: description || '',
    filename,
    uploadedBy: uploadedBy || null,
    metadata: features?.metadata || metadata || {},
    waveformStats: features?.waveformStats || {},
    spectralFingerprint: features?.spectralFingerprint || [],
    anchorPoints: features?.anchorPoints || [],
    audioSignature: features?.audioSignature || {},
    durationScale: features?.durationScale || 1,
    createdAt: now,
  };

  await collection.insertOne(newSong);
  return newSong;
};

const deleteSongById = async (id) => {
  const collection = await getSongsCollection();
  const result = await collection.deleteOne({ id });
  return result.deletedCount > 0;
};

module.exports = {
  ensureSongsDatabase,
  getAllSongs,
  getSongById,
  createSong,
  deleteSongById,
};
