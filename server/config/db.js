const mongoose = require('mongoose');

let cached = null;

module.exports = async function connectDB() {
  if (cached) return cached;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing');

  cached = await mongoose.connect(uri, {
    bufferCommands: false,
  });

  return cached;
};
