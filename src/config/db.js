import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

/**
 * Connect to MongoDB using MONGODB_URI.
 * Resolves without throwing when the URI is missing or connection fails,
 * so the server can still boot and serve /health. Every DB-backed route
 * fails with a 503 until a connection is established — see `isDBConnected`.
 * @returns {Promise<boolean>} true if connected, false otherwise
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("[db] MONGODB_URI not set — running without database");
    return false;
  }

  try {
    await mongoose.connect(uri, {
      dbName: "dgdelightfound_db",
    });
    console.log("[db] MongoDB connected");
    return true;
  } catch (err) {
    console.warn("[db] MongoDB connection failed:", err.message);
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

/**
 * Throws a user-friendly 503 when MongoDB isn't connected.
 * Call at the top of any dao/service function that needs the database.
 */
export function requireDb() {
  if (!isDBConnected()) {
    throw new AppError(
      "We're experiencing a temporary issue. Please try again in a moment.",
      503
    );
  }
}
