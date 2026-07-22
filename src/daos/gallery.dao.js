import { isDBConnected } from '../config/db.js';
import Gallery from '../models/Gallery.js';

/** In-memory gallery store when MongoDB is unavailable */
const mockGallery = [
  {
    _id: 'mock-gallery-1',
    imageUrl: 'https://placehold.co/800x600?text=Gallery+1',
    publicId: 'stub_mock_1',
    title: 'Community outreach',
    caption: 'Community outreach',
    description: 'Volunteers serving the community.',
    category: 'Impact Event',
    status: 'active',
    sortOrder: 1,
    mediaType: 'image',
    location: 'Lagos',
    fileSize: '',
    format: 'JPG',
    isActive: true,
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * List gallery items.
 * @param {{ all?: boolean }} [options]
 * @returns {Promise<Array>}
 */
export async function findMany({ all = false } = {}) {
  if (isDBConnected()) {
    try {
      const filter = all ? {} : { status: 'active' };
      return await Gallery.find(filter).sort({ sortOrder: 1, uploadedAt: -1 });
    } catch (err) {
      console.warn('[galleryDao/findMany] DB error:', err.message);
    }
  }

  const items = all ? mockGallery : mockGallery.filter((g) => g.status === 'active');
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
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
        : payload.uploadedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
 * Update a gallery item by id.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object | null>}
 */
export async function updateById(id, payload) {
  if (isDBConnected()) {
    try {
      return await Gallery.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });
    } catch (err) {
      console.warn('[galleryDao/updateById] DB error:', err.message);
      if (err.name === 'CastError') {
        const castErr = new Error('Invalid gallery ID');
        castErr.statusCode = 400;
        throw castErr;
      }
    }
  }

  const index = mockGallery.findIndex((g) => g._id === id);
  if (index === -1) return null;
  mockGallery[index] = {
    ...mockGallery[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  return mockGallery[index];
}

/**
 * Delete a gallery item by id.
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function deleteById(id) {
  if (isDBConnected()) {
    try {
      const item = await Gallery.findById(id);
      if (!item) return null;
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
  if (index === -1) return null;
  const [removed] = mockGallery.splice(index, 1);
  return removed;
}
