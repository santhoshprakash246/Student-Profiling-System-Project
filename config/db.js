const mongoose = require('mongoose');

let memoryServerInstance = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_profiling_system';
  const forceInMemory = process.env.USE_IN_MEMORY_DB === 'true';

  if (!forceInMemory) {
    try {
      console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000 // Quick fallback if local daemon is not running
      });
      console.log(`[Database] Connected successfully to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] Direct MongoDB connection failed (${err.message}).`);
      console.log(`[Database] Checking for in-memory MongoDB fallback...`);
    }
  }

  // Fallback to in-memory MongoDB for local dev or automated testing if available
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    console.log('[Database] Starting in-memory MongoDB server instance...');
    memoryServerInstance = await MongoMemoryServer.create();
    const memUri = memoryServerInstance.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[Database] Connected successfully to In-Memory MongoDB: ${memUri}`);
    return conn;
  } catch (memErr) {
    console.error('[Database] In-memory MongoDB failed or not available:', memErr.message);
    throw new Error('Unable to connect to MongoDB. Please ensure MongoDB is running or MONGODB_URI is valid in .env');
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    console.log('[Database] Disconnected from MongoDB');
  } catch (err) {
    console.error('[Database] Disconnect error:', err.message);
  }
}

module.exports = { connectDB, disconnectDB };
