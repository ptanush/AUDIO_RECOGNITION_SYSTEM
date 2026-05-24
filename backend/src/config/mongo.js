const { MongoClient } = require('mongodb');

let clientPromise = null;

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  return uri;
};

const getDatabaseName = () => process.env.MONGODB_DB_NAME || 'mergeconflicts';

const connectToDatabase = async () => {
  if (!clientPromise) {
    const client = new MongoClient(getMongoUri(), {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
      socketTimeoutMS: 2000,
    });
    clientPromise = client.connect();
  }

  return clientPromise;
};

const getDatabase = async () => {
  const client = await connectToDatabase();
  return client.db(getDatabaseName());
};

const initializeDatabase = async () => {
  try {
    const db = await getDatabase();

    await Promise.all([
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('songs').createIndex({ id: 1 }, { unique: true }),
    ]);

    console.log('✅ MongoDB connection initialized successfully');
    return db;
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.warn('⚠️  Backend will run with limited functionality without a database');
    console.warn('⚠️  To use full features, configure MONGODB_URI and ensure MongoDB is running');
    
    // Return a mock database object so the server can still start
    return {
      collection: () => ({
        findOne: async () => null,
        find: async () => ({ toArray: async () => [] }),
        insertOne: async (doc) => ({ insertedId: doc.id }),
        updateOne: async () => ({ modifiedCount: 1 }),
        deleteOne: async () => ({ deletedCount: 1 }),
        createIndex: async () => ({}),
      }),
      createIndex: async () => ({}),
    };
  }
};

module.exports = {
  connectToDatabase,
  getDatabase,
  initializeDatabase,
};
