import { requireDb } from '../config/db.js';
import Milestone from '../models/Milestone.js';

/**
 * @returns {Promise<Array>}
 */
export async function findAll() {
  requireDb();
  return Milestone.find().sort({ sortOrder: 1, createdAt: 1 });
}

/**
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function findById(id) {
  requireDb();
  try {
    return await Milestone.findById(id);
  } catch (err) {
    if (err.name === 'CastError') {
      const castErr = new Error('Invalid milestone ID');
      castErr.statusCode = 400;
      throw castErr;
    }
    throw err;
  }
}

/**
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function create(payload) {
  requireDb();
  return Milestone.create(payload);
}

/**
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object | null>}
 */
export async function updateById(id, payload) {
  requireDb();
  try {
    return await Milestone.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      const castErr = new Error('Invalid milestone ID');
      castErr.statusCode = 400;
      throw castErr;
    }
    throw err;
  }
}

/**
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function deleteById(id) {
  requireDb();
  try {
    return await Milestone.findByIdAndDelete(id);
  } catch (err) {
    if (err.name === 'CastError') {
      const castErr = new Error('Invalid milestone ID');
      castErr.statusCode = 400;
      throw castErr;
    }
    throw err;
  }
}
