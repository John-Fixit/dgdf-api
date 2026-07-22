import { isDBConnected } from '../config/db.js';
import User from '../models/User.js';

/**
 * Find a user by email, including the password hash.
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
 * @param {string} id
 * @returns {Promise<import('mongoose').Document | null>}
 */
export async function findById(id) {
  if (!isDBConnected()) {
    return null;
  }

  return User.findById(id).select('-password');
}

/**
 * Find a user by id, including the password hash.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document | null>}
 */
export async function findByIdWithPassword(id) {
  if (!isDBConnected()) {
    return null;
  }

  return User.findById(id).select('+password');
}

/**
 * List all administrators (without passwords).
 * @returns {Promise<object[]>}
 */
export async function findAll() {
  if (!isDBConnected()) {
    return [];
  }

  return User.find({}).select('-password').sort({ createdAt: -1 });
}

/**
 * Create a new administrator.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function create(payload) {
  if (!isDBConnected()) {
    throw new Error('Database not connected');
  }

  return User.create(payload);
}

/**
 * Count users matching a filter.
 * @param {object} [filter]
 * @returns {Promise<number>}
 */
export async function count(filter = {}) {
  if (!isDBConnected()) {
    return 0;
  }

  return User.countDocuments(filter);
}
