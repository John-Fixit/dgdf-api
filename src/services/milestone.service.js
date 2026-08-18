import { AppError } from '../utils/AppError.js';
import * as milestoneDao from '../daos/milestone.dao.js';

/**
 * Map a milestone mongoose doc to API shape.
 * @param {object} doc
 * @returns {object}
 */
export function mapMilestone(doc) {
  const source = doc?.toObject ? doc.toObject() : doc;
  return {
    id: String(source._id),
    year: source.year,
    title: source.title,
    description: source.description ?? '',
    sortOrder: source.sortOrder ?? 0,
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
 * @returns {Promise<object[]>}
 */
export async function listMilestones() {
  const items = await milestoneDao.findAll();
  return items.map(mapMilestone);
}

/**
 * @param {object} body
 * @returns {Promise<object>}
 */
export async function createMilestone(body) {
  const created = await milestoneDao.create({
    year: body.year,
    title: body.title,
    description: body.description || '',
    sortOrder: Number(body.sortOrder) || 0,
  });
  return mapMilestone(created);
}

/**
 * @param {string} id
 * @param {object} body
 * @returns {Promise<object>}
 */
export async function updateMilestone(id, body) {
  const existing = await milestoneDao.findById(id);
  if (!existing) {
    throw new AppError('Milestone not found', 404);
  }

  const updates = {
    year: body.year ?? existing.year,
    title: body.title ?? existing.title,
    description: body.description ?? existing.description,
    sortOrder:
      body.sortOrder !== undefined
        ? Number(body.sortOrder)
        : existing.sortOrder,
  };

  const updated = await milestoneDao.updateById(id, updates);
  return mapMilestone(updated);
}

/**
 * @param {string} id
 * @returns {Promise<object>} Deleted milestone snapshot
 */
export async function deleteMilestone(id) {
  const existing = await milestoneDao.findById(id);
  if (!existing) {
    throw new AppError('Milestone not found', 404);
  }
  const mapped = mapMilestone(existing);
  await milestoneDao.deleteById(id);
  return mapped;
}
