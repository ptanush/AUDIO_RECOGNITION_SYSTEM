const { v4: uuidv4 } = require('uuid');
const { getDatabase, initializeDatabase } = require('../config/mongo');

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    songsUploaded: user.songsUploaded || 0,
    lastLogin: user.lastLogin || null,
  };
};

const getUsersCollection = async () => {
  const db = await getDatabase();
  return db.collection('users');
};

const ensureUsersDatabase = async () => {
  const db = await initializeDatabase();
  return db.collection('users');
};

const getAllUsers = async () => {
  const collection = await getUsersCollection();
  return collection.find({}, { projection: { passwordHash: 0 } }).toArray();
};

const getUserByEmail = async (email) => {
  const collection = await getUsersCollection();
  return collection.findOne({ email });
};

const getUserById = async (userId) => {
  const collection = await getUsersCollection();
  return collection.findOne({ id: userId });
};

const createUser = async (userData) => {
  const collection = await getUsersCollection();
  const now = new Date().toISOString();

  const newUser = {
    id: uuidv4(),
    email: userData.email,
    username: userData.username || userData.email.split('@')[0],
    passwordHash: userData.passwordHash,
    createdAt: now,
    updatedAt: now,
    songsUploaded: 0,
    lastLogin: null,
  };

  try {
    await collection.insertOne(newUser);
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('User already exists');
    }
    throw error;
  }

  return sanitizeUser(newUser);
};

const updateUser = async (userId, updates) => {
  const collection = await getUsersCollection();
  const result = await collection.updateOne(
    { id: userId },
    { $set: { ...updates, updatedAt: new Date().toISOString() } }
  );

  if (result.matchedCount === 0) {
    throw new Error('User not found');
  }

  return collection.findOne({ id: userId });
};

const deleteUser = async (userId) => {
  const collection = await getUsersCollection();
  const result = await collection.deleteOne({ id: userId });

  if (result.deletedCount === 0) {
    throw new Error('User not found');
  }

  return { success: true, message: 'User deleted' };
};

const incrementSongsUploaded = async (userId) => {
  const collection = await getUsersCollection();
  const result = await collection.updateOne(
    { id: userId },
    {
      $inc: { songsUploaded: 1 },
      $set: { updatedAt: new Date().toISOString() },
    },
  );

  if (result.matchedCount === 0) {
    throw new Error('User not found');
  }

  return collection.findOne({ id: userId });
};

module.exports = {
  ensureUsersDatabase,
  getAllUsers,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  incrementSongsUploaded,
};
