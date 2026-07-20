import { isDBConnected } from '../config/db.js';
import Gallery from '../models/Gallery.js';

/** In-memory gallery store when MongoDB is unavailable */
const mockGallery = [
  {
    _id: 'mock-gallery-1',
    imageUrl: 'https://placehold.co/800x600?text=Gallery+1',
    publicId: 'stub_mock_1',
    caption: 'Community outreach',
    category: 'events',
    isActive: true,
    uploadedAt: new Date().toISOString(),
  },
];

/**
 * List active gallery items, newest first.
 * @returns {Promise<Array>}
 */
export async function findActive() {
  if (isDBConnected()) {
    try {
      return await Gallery.find({ isActive: true }).sort({ uploadedAt: -1 });
    } catch (err) {
      console.warn('[galleryDao/findActive] DB error:', err.message);
    }
  }

  return mockGallery.filter((g) => g.isActive);
}

/**
 * Create a gallery item.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function create(payload) {
  if (isDBConnected()) {
    try {
      return await Gallery.create(payload);
    } catch (err) {
      console.warn('[galleryDao/create] DB error:', err.message);
    }
  }

  const mockItem = {
    _id: `mock-gallery-${Date.now()}`,
    ...payload,
    uploadedAt:
      payload.uploadedAt instanceof Date
        ? payload.uploadedAt.toISOString()
        : payload.uploadedAt,
  };
  mockGallery.unshift(mockItem);
  return mockItem;
}

/**
 * Find a gallery item by id.
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function findById(id) {
  if (isDBConnected()) {
    try {
      return await Gallery.findById(id);
    } catch (err) {
      console.warn('[galleryDao/findById] DB error:', err.message);
      if (err.name === 'CastError') {
        const castErr = new Error('Invalid gallery ID');
        castErr.statusCode = 400;
        throw castErr;
      }
    }
  }

  return mockGallery.find((g) => g._id === id) || null;
}

/**
 * Delete a gallery item by id. Returns the removed document, or null if missing.
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function deleteById(id) {
  if (isDBConnected()) {
    try {
      const item = await Gallery.findById(id);
      if (!item) {
        return null;
      }
      await item.deleteOne();
      return item;
    } catch (err) {
      console.warn('[galleryDao/deleteById] DB error:', err.message);
      if (err.name === 'CastError') {
        const castErr = new Error('Invalid gallery ID');
        castErr.statusCode = 400;
        throw castErr;
      }
    }
  }

  const index = mockGallery.findIndex((g) => g._id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = mockGallery.splice(index, 1);
  return removed;
}
