import { isDBConnected } from '../config/db.js';
import Leadership from '../models/Leadership.js';

/** @type {Array<object>} */
let mockLeadership = [
  {
    _id: 'mock-lead-1',
    name: 'Dr. Adebayo Ogunlesi',
    role: 'Founder & CEO',
    bio: 'A visionary philanthropist with over 20 years of experience in strategic development and international relations.',
    photoUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1000&fit=crop',
    publicId: '',
    sortOrder: 1,
    status: 'published',
    isFounder: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-lead-2',
    name: 'Chioma Nnaji',
    role: 'Operations Director',
    bio: 'Leading our ground-level execution with a focus on operational excellence and sustainable community impact.',
    photoUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1000&fit=crop',
    publicId: '',
    sortOrder: 2,
    status: 'published',
    isFounder: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * @param {boolean} publishedOnly
 * @returns {Promise<Array>}
 */
export async function findAll(publishedOnly = false) {
  if (isDBConnected()) {
    try {
      const filter = publishedOnly ? { status: 'published' } : {};
      return await Leadership.find(filter).sort({ sortOrder: 1, createdAt: 1 });
    } catch (err) {
      console.warn('[leadershipDao/findAll] DB error:', err.message);
    }
  }

  const items = publishedOnly
    ? mockLeadership.filter((m) => m.status === 'published')
    : mockLeadership;
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function findById(id) {
  if (isDBConnected()) {
    try {
      return await Leadership.findById(id);
    } catch (err) {
      console.warn('[leadershipDao/findById] DB error:', err.message);
      if (err.name === 'CastError') {
        const castErr = new Error('Invalid leadership ID');
        castErr.statusCode = 400;
        throw castErr;
      }
    }
  }

  return mockLeadership.find((m) => m._id === id) || null;
}

/**
 * Clear isFounder on all other members when promoting one.
 * @param {string | null} exceptId
 */
async function clearOtherFounders(exceptId) {
  if (isDBConnected()) {
    try {
      await Leadership.updateMany(
        exceptId ? { _id: { $ne: exceptId } } : {},
        { $set: { isFounder: false } }
      );
      return;
    } catch (err) {
      console.warn('[leadershipDao/clearOtherFounders] DB error:', err.message);
    }
  }

  mockLeadership = mockLeadership.map((m) =>
    m._id === exceptId ? m : { ...m, isFounder: false }
  );
}

/**
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function create(payload) {
  if (payload.isFounder) {
    await clearOtherFounders(null);
  }

  if (isDBConnected()) {
    try {
      return await Leadership.create(payload);
    } catch (err) {
      console.warn('[leadershipDao/create] DB error:', err.message);
    }
  }

  const item = {
    _id: `mock-lead-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockLeadership.push(item);
  return item;
}

/**
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object | null>}
 */
export async function updateById(id, payload) {
  if (payload.isFounder) {
    await clearOtherFounders(id);
  }

  if (isDBConnected()) {
    try {
      return await Leadership.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });
    } catch (err) {
      console.warn('[leadershipDao/updateById] DB error:', err.message);
      if (err.name === 'CastError') {
        const castErr = new Error('Invalid leadership ID');
        castErr.statusCode = 400;
        throw castErr;
      }
    }
  }

  const index = mockLeadership.findIndex((m) => m._id === id);
  if (index === -1) return null;
  mockLeadership[index] = {
    ...mockLeadership[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  return mockLeadership[index];
}

/**
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function deleteById(id) {
  if (isDBConnected()) {
    try {
      return await Leadership.findByIdAndDelete(id);
    } catch (err) {
      console.warn('[leadershipDao/deleteById] DB error:', err.message);
      if (err.name === 'CastError') {
        const castErr = new Error('Invalid leadership ID');
        castErr.statusCode = 400;
        throw castErr;
      }
    }
  }

  const index = mockLeadership.findIndex((m) => m._id === id);
  if (index === -1) return null;
  const [removed] = mockLeadership.splice(index, 1);
  return removed;
}
