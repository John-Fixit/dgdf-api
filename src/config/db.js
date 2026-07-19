import mongoose from 'mongoose';

/**
 * Connect to MongoDB using MONGODB_URI.
 * Resolves without throwing when the URI is missing or connection fails,
 * so the server can still run with mock/placeholder responses.
 * @returns {Promise<boolean>} true if connected, false otherwise
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[db] MONGODB_URI not set — running without database');
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log('[db] MongoDB connected');
    return true;
  } catch (err) {
    console.warn('[db] MongoDB connection failed:', err.message);
    return false;
  }
}

/**
 * Whether mongoose currently has an active connection.
 * @returns {boolean}
 */
export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}
