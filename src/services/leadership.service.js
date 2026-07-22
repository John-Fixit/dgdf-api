import { AppError } from '../utils/AppError.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import * as leadershipDao from '../daos/leadership.dao.js';

/**
 * Map leadership mongoose/mock doc to API shape.
 * @param {object} doc
 * @returns {object}
 */
export function mapLeadership(doc) {
  const source = doc?.toObject ? doc.toObject() : doc;
  return {
    id: String(source._id),
    name: source.name,
    role: source.role,
    bio: source.bio ?? '',
    photoUrl: source.photoUrl,
    sortOrder: source.sortOrder ?? 0,
    status: source.status ?? 'published',
    isFounder: Boolean(source.isFounder),
    createdAt:
      source.createdAt instanceof Date
        ? source.createdAt.toISOString()
        : source.createdAt,
    updatedAt:
      source.updatedAt instanceof Date
        ? source.updatedAt.toISOString()
        : source.updatedAt,
  };
}

/**
 * @param {boolean} all
 * @returns {Promise<object[]>}
 */
export async function listLeadership(all = false) {
  const items = await leadershipDao.findAll(!all);
  return items.map(mapLeadership);
}

/**
 * @param {{ buffer: Buffer, originalname: string } | null} file
 * @param {object} body
 * @returns {Promise<object>}
 */
export async function createLeadership(file, body) {
  let photoUrl = body.photoUrl || '';
  let publicId = '';

  if (file) {
    const uploaded = await uploadImage(
      file.buffer,
      'dgdf/leadership',
      file.originalname
    );
    photoUrl = uploaded.imageUrl;
    publicId = uploaded.publicId;
  }

  if (!photoUrl) {
    throw new AppError('Photo is required (upload image or provide photoUrl)', 400);
  }

  const created = await leadershipDao.create({
    name: body.name,
    role: body.role,
    bio: body.bio || '',
    photoUrl,
    publicId,
    sortOrder: Number(body.sortOrder) || 0,
    status: body.status === 'draft' ? 'draft' : 'published',
    isFounder: body.isFounder === true || body.isFounder === 'true',
  });

  return mapLeadership(created);
}

/**
 * @param {string} id
 * @param {{ buffer: Buffer, originalname: string } | null} file
 * @param {object} body
 * @returns {Promise<object>}
 */
export async function updateLeadership(id, file, body) {
  const existing = await leadershipDao.findById(id);
  if (!existing) {
    throw new AppError('Leadership member not found', 404);
  }

  const updates = {
    name: body.name ?? existing.name,
    role: body.role ?? existing.role,
    bio: body.bio ?? existing.bio,
    sortOrder:
      body.sortOrder !== undefined
        ? Number(body.sortOrder)
        : existing.sortOrder,
    status:
      body.status === 'draft' || body.status === 'published'
        ? body.status
        : existing.status,
    isFounder:
      body.isFounder !== undefined
        ? body.isFounder === true || body.isFounder === 'true'
        : existing.isFounder,
  };

  if (file) {
    if (existing.publicId) {
      await deleteImage(existing.publicId);
    }
    const uploaded = await uploadImage(
      file.buffer,
      'dgdf/leadership',
      file.originalname
    );
    updates.photoUrl = uploaded.imageUrl;
    updates.publicId = uploaded.publicId;
  } else if (body.photoUrl) {
    updates.photoUrl = body.photoUrl;
  }

  const updated = await leadershipDao.updateById(id, updates);
  return mapLeadership(updated);
}

/**
 * @param {string} id
 * @returns {Promise<object>} Deleted member snapshot
 */
export async function deleteLeadership(id) {
  const existing = await leadershipDao.findById(id);
  if (!existing) {
    throw new AppError('Leadership member not found', 404);
  }
  const mapped = mapLeadership(existing);
  if (existing.publicId) {
    await deleteImage(existing.publicId);
  }
  await leadershipDao.deleteById(id);
  return mapped;
}
