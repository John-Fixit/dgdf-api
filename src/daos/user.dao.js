import { isDBConnected } from '../config/db.js';
import User from '../models/User.js';

/**
 * Find a user by email, including the password hash.
 * Returns null when DB is disconnected or no user matches.
 * @param {string} email
 * @returns {Promise<import('mongoose').Document | null>}
 */
export async function findByEmailWithPassword(email) {
  if (!isDBConnected()) {
    return null;
  }

  return User.findOne({ email: email.toLowerCase() }).select('+password');
}

/**
 * Find a user by id (without password).
 * Returns null when DB is disconnected or no user matches.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document | null>}
 */
export async function findById(id) {
  if (!isDBConnected()) {
    return null;
  }

  return User.findById(id).select('-password');
}
