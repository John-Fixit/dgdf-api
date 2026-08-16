import { requireDb } from '../config/db.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Create an audit log entry.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function create(payload) {
  requireDb();
  return AuditLog.create(payload);
}

/**
 * Build a Mongo query from list filters.
 * @param {object} filters
 * @returns {object}
 */
function buildQuery(filters = {}) {
  const query = {};

  if (filters.from || filters.to) {
    query.$and = query.$and || [];
    const range = {};
    if (filters.from) range.$gte = filters.from;
    if (filters.to) range.$lte = filters.to;
    query.$and.push({
      $or: [{ timestamp: range }, { createdAt: range }],
    });
  }

  if (filters.actorId) {
    query.$or = [
      { actorId: filters.actorId },
      { adminId: filters.actorId },
    ];
  }

  if (filters.action) query.action = filters.action;
  if (filters.entity) query.entity = filters.entity;
  if (filters.category) query.category = filters.category;

  if (filters.adminName) {
    const regex = new RegExp(escapeRegex(filters.adminName), 'i');
    query.$and = query.$and || [];
    query.$and.push({
      $or: [{ adminName: regex }, { actorName: regex }],
    });
  }

  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search), 'i');
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { details: regex },
        { entityLabel: regex },
        { actorName: regex },
        { adminName: regex },
        { changes: regex },
      ],
    });
  }

  return query;
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find audit logs with optional filters, newest first.
 * @param {object} [filters]
 * @returns {Promise<object[]>}
 */
export async function findMany(filters = {}) {
  requireDb();
  const { limit = 100, skip = 0, ...rest } = filters;
  const query = buildQuery(rest);
  return AuditLog.find(query)
    .sort({ timestamp: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

/**
 * Count audit logs matching filters.
 * @param {object} [filters]
 * @returns {Promise<number>}
 */
export async function count(filters = {}) {
  requireDb();
  return AuditLog.countDocuments(buildQuery(filters));
}

/**
 * Delete all audit logs.
 * @returns {Promise<number>} deleted count
 */
export async function deleteAll() {
  requireDb();
  const result = await AuditLog.deleteMany({});
  return result.deletedCount || 0;
}
