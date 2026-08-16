import { requireDb } from '../config/db.js';
import Leadership from '../models/Leadership.js';

/**
 * @param {boolean} publishedOnly
 * @returns {Promise<Array>}
 */
export async function findAll(publishedOnly = false) {
  requireDb();
  const filter = publishedOnly ? { status: 'published' } : {};
  return Leadership.find(filter).sort({ sortOrder: 1, createdAt: 1 });
}

/**
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function findById(id) {
  requireDb();
  try {
    return await Leadership.findById(id);
  } catch (err) {
    if (err.name === 'CastError') {
      const castErr = new Error('Invalid leadership ID');
      castErr.statusCode = 400;
      throw castErr;
    }
    throw err;
  }
}

/**
 * Clear isFounder on all other members when promoting one.
 * @param {string | null} exceptId
 */
async function clearOtherFounders(exceptId) {
  requireDb();
  await Leadership.updateMany(
    exceptId ? { _id: { $ne: exceptId } } : {},
    { $set: { isFounder: false } }
  );
}

/**
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function create(payload) {
  requireDb();
  if (payload.isFounder) {
    await clearOtherFounders(null);
  }
  return Leadership.create(payload);
}

/**
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object | null>}
 */
export async function updateById(id, payload) {
  requireDb();
  if (payload.isFounder) {
    await clearOtherFounders(id);
  }
  try {
    return await Leadership.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      const castErr = new Error('Invalid leadership ID');
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
    return await Leadership.findByIdAndDelete(id);
  } catch (err) {
    if (err.name === 'CastError') {
      const castErr = new Error('Invalid leadership ID');
      castErr.statusCode = 400;
      throw castErr;
    }
    throw err;
  }
}
