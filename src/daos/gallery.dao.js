import { requireDb } from '../config/db.js';
import Gallery from '../models/Gallery.js';

/**
 * List gallery items.
 * @param {{ all?: boolean }} [options]
 * @returns {Promise<Array>}
 */
export async function findMany({ all = false } = {}) {
  requireDb();
  const filter = all ? {} : { status: 'active' };
  return Gallery.find(filter).sort({ sortOrder: 1, uploadedAt: -1 });
}

/** @deprecated use findMany */
export async function findActive() {
  return findMany({ all: false });
}

/**
 * Create a gallery item.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function create(payload) {
  requireDb();
  return Gallery.create(payload);
}

/**
 * Find a gallery item by id.
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function findById(id) {
  requireDb();
  try {
    return await Gallery.findById(id);
  } catch (err) {
    if (err.name === 'CastError') {
      const castErr = new Error('Invalid gallery ID');
      castErr.statusCode = 400;
      throw castErr;
    }
    throw err;
  }
}

/**
 * Update a gallery item by id.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object | null>}
 */
export async function updateById(id, payload) {
  requireDb();
  try {
    return await Gallery.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      const castErr = new Error('Invalid gallery ID');
      castErr.statusCode = 400;
      throw castErr;
    }
    throw err;
  }
}

/**
 * Delete a gallery item by id.
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function deleteById(id) {
  requireDb();
  try {
    const item = await Gallery.findById(id);
    if (!item) return null;
    await item.deleteOne();
    return item;
  } catch (err) {
    if (err.name === 'CastError') {
      const castErr = new Error('Invalid gallery ID');
      castErr.statusCode = 400;
      throw castErr;
    }
    throw err;
  }
}
