const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI not set in environment');
  }

  await mongoose.connect(mongoUri, {
    // Options can be added here if needed
  });
};

module.exports = { connectDB };

