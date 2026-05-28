const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const customUri = process.env.MONGODB_URI;
    
    if (customUri) {
      const redactedUri = customUri.replace(/:([^@/]+)@/, ':****@');
      console.log(`Attempting to connect to MONGODB_URI: ${redactedUri}`);
      await mongoose.connect(customUri);
      console.log('Successfully connected to MongoDB.');
    } else {
      console.log('No MONGODB_URI provided. Starting In-Memory MongoDB Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log(`In-Memory MongoDB Server running at: ${uri}`);
      await mongoose.connect(uri);
      console.log('Successfully connected to In-Memory MongoDB.');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    if (!mongod) {
      try {
        console.log('Attempting in-memory MongoDB fallback due to connection failure...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        console.log(`In-Memory MongoDB Fallback Server running at: ${uri}`);
        await mongoose.connect(uri);
        console.log('Successfully connected to Fallback In-Memory MongoDB.');
      } catch (fallbackError) {
        console.error('Critical: In-Memory MongoDB Fallback failed:', fallbackError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

module.exports = { connectDB, closeDB };
