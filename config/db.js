const mongoose = require('mongoose');

global.useLocalDB = false;

const connectDB = async () => {
  try {
    // Try to connect to MongoDB, but set a short timeout so the server doesn't hang
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/amazon_clone';
    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 2000 // 2 seconds timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useLocalDB = false;
  } catch (error) {
    console.warn(`\n⚠️ MongoDB connection failed: ${error.message}`);
    console.warn(`⚠️ Switching to local JSON file-based database fallback (located in './data/').\n`);
    global.useLocalDB = true;
  }
};

module.exports = connectDB;
