import { isDBConnected } from '../config/db.js';
import AuditLog from '../models/AuditLog.js';

/** In-memory audit logs when MongoDB is unavailable */
const memoryLogs = [];

/**
 * Create an audit log entry.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function create(payload) {
  if (isDBConnected()) {
    try {
      return await AuditLog.create(payload);
    } catch (err) {
      console.warn('[auditDao/create] DB error:', err.message);
    }
  }

  const mockItem = {
    _id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...payload,
    createdAt: new Date().toISOString(),
    timestamp: payload.timestamp || new Date().toISOString(),
  };
  memoryLogs.unshift(mockItem);
  return mockItem;
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
  const { limit = 100, skip = 0, ...rest } = filters;

  if (isDBConnected()) {
    try {
      const query = buildQuery(rest);
      return await AuditLog.find(query)
        .sort({ timestamp: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (err) {
      console.warn('[auditDao/findMany] DB error:', err.message);
    }
  }

  let items = [...memoryLogs];
  items = filterMemory(items, rest);
  items.sort(
    (a, b) =>
      new Date(b.timestamp || b.createdAt).getTime() -
      new Date(a.timestamp || a.createdAt).getTime()
  );
  return items.slice(skip, skip + limit);
}

/**
 * Count audit logs matching filters.
 * @param {object} [filters]
 * @returns {Promise<number>}
 */
export async function count(filters = {}) {
  if (isDBConnected()) {
    try {
      return await AuditLog.countDocuments(buildQuery(filters));
    } catch (err) {
      console.warn('[auditDao/count] DB error:', err.message);
    }
  }

  return filterMemory([...memoryLogs], filters).length;
}

/**
 * Delete all audit logs.
 * @returns {Promise<number>} deleted count
 */
export async function deleteAll() {
  if (isDBConnected()) {
    try {
      const result = await AuditLog.deleteMany({});
      return result.deletedCount || 0;
    } catch (err) {
      console.warn('[auditDao/deleteAll] DB error:', err.message);
      throw err;
    }
  }

  const countDeleted = memoryLogs.length;
  memoryLogs.length = 0;
  return countDeleted;
}

/**
 * @param {object[]} items
 * @param {object} filters
 * @returns {object[]}
 */
function filterMemory(items, filters) {
  let result = items;

  if (filters.from) {
    const fromMs = filters.from.getTime();
    result = result.filter(
      (item) => new Date(item.timestamp || item.createdAt).getTime() >= fromMs
    );
  }
  if (filters.to) {
    const toMs = filters.to.getTime();
    result = result.filter(
      (item) => new Date(item.timestamp || item.createdAt).getTime() <= toMs
    );
  }
  if (filters.actorId) {
    result = result.filter(
      (item) =>
        item.actorId === filters.actorId ||
        String(item.adminId) === filters.actorId
    );
  }
  if (filters.action) {
    result = result.filter((item) => item.action === filters.action);
  }
  if (filters.entity) {
    result = result.filter((item) => item.entity === filters.entity);
  }
  if (filters.category) {
    result = result.filter((item) => item.category === filters.category);
  }
  if (filters.adminName) {
    const q = filters.adminName.toLowerCase();
    result = result.filter(
      (item) =>
        (item.adminName || '').toLowerCase().includes(q) ||
        (item.actorName || '').toLowerCase().includes(q)
    );
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((item) => {
      const haystack = [
        item.details,
        item.entityLabel,
        item.actorName,
        item.adminName,
        ...(Array.isArray(item.changes) ? item.changes : []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return result;
}
