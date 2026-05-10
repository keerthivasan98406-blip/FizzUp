const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-drop old billNumber index if it exists
    try {
      const Sale = require('../models/Sale');
      await Sale.collection.dropIndex('billNumber_1');
      console.log('✅ Dropped old billNumber index');
    } catch (e) {
      // Index doesn't exist - that's fine
    }

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
