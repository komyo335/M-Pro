import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas.
 * Reads MONGODB_URI from environment variables.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set. Create a .env file in server/ — see .env.example');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}
