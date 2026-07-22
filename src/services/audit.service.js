import * as auditDao from '../daos/audit.dao.js';
import { nameFromEmail } from '../utils/actorName.js';

const ENTITY_LABELS = {
  gallery: 'Gallery',
  leadership: 'Leadership',
  content: 'Content',
  settings: 'Settings',
  message: 'Message',
  donation: 'Donation',
  admin: 'Administrator',
  auth: 'Auth',
};

const ACTION_LABELS = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
};

const ENTITY_TO_CATEGORY = {
  gallery: 'gallery',
  leadership: 'content',
  content: 'content',
  settings: 'content',
  message: 'message',
  donation: 'donation',
  admin: 'admin',
  auth: 'auth',
};

/**
 * Build the human event-type label used in filters (e.g. "Created gallery").
 * @param {string} action
 * @param {string} entity
 * @returns {string}
 */
export function eventTypeLabel(action, entity) {
  if (entity === 'auth') {
    if (action === 'create') return 'Logged in';
    if (action === 'delete') return 'Logged out';
  }

  const actionLabel = ACTION_LABELS[action] || action;
  const entityLabel = (ENTITY_LABELS[entity] || entity).toLowerCase();
  return `${actionLabel} ${entityLabel}`;
}

/**
 * Build a default narrative details string when one is not provided.
 * @param {object} input
 * @returns {string}
 */
function buildDetails(input) {
  if (input.details) return input.details;

  const actorName =
    input.actor?.name || nameFromEmail(input.actor?.email) || 'Admin';
  const label = input.entityLabel || ENTITY_LABELS[input.entity] || input.entity;

  if (input.action === 'create' && input.entity === 'gallery') {
    return `${actorName} uploaded ${label} to gallery`;
  }
  if (input.action === 'delete' && input.entity === 'gallery') {
    return `${actorName} deleted ${label} from gallery`;
  }
  if (input.action === 'update' && input.entity === 'content') {
    return `${actorName} updated ${label}`;
  }
  if (input.action === 'update' && input.entity === 'message') {
    return `${actorName} read message from ${label}`;
  }
  if (input.entity === 'donation' && input.changes?.includes('export')) {
    return `${actorName} exported donation records`;
  }

  const verb = ACTION_LABELS[input.action]?.toLowerCase() || input.action;
  return `${actorName} ${verb} ${label}`;
}

/**
 * Map a stored audit document to the API shape.
 * @param {object} doc
 * @returns {object}
 */
export function mapAuditLog(doc) {
  const source = doc?.toObject ? doc.toObject() : doc;
  const action = source.action;
  const entity = source.entity;
  const actorName =
    source.adminName ||
    source.actorName ||
    nameFromEmail(source.actorEmail) ||
    'Admin';
  const createdAt =
    source.timestamp instanceof Date
      ? source.timestamp.toISOString()
      : source.timestamp ||
        (source.createdAt instanceof Date
          ? source.createdAt.toISOString()
          : source.createdAt);

  return {
    id: String(source._id),
    action,
    entity,
    entityId: source.entityId || '',
    entityLabel: source.entityLabel || '',
    entityTypeLabel: ENTITY_LABELS[entity] || entity,
    eventType: eventTypeLabel(action, entity),
    actor: {
      id: source.actorId || (source.adminId ? String(source.adminId) : ''),
      email: source.actorEmail || '',
      name: actorName,
      role: source.adminRole || '',
    },
    adminName: actorName,
    adminRole: source.adminRole || '',
    details: source.details || '',
    ipAddress: source.ipAddress || '',
    category: source.category || ENTITY_TO_CATEGORY[entity] || 'admin',
    changes: Array.isArray(source.changes) ? source.changes : [],
    metadata: source.metadata || {},
    createdAt,
    timestamp: createdAt,
  };
}

/**
 * Persist an audit trail entry. Failures are logged but never thrown.
 * @param {object} input
 * @returns {Promise<object | null>}
 */
export async function recordAudit(input) {
  try {
    const actor = input.actor || {};
    const entity = input.entity;
    const category =
      input.category || ENTITY_TO_CATEGORY[entity] || 'admin';
    const details = buildDetails({ ...input, actor });
    const now = new Date();

    const created = await auditDao.create({
      action: input.action,
      entity,
      entityId: input.entityId ? String(input.entityId) : '',
      entityLabel: input.entityLabel || '',
      actorId: actor.id ? String(actor.id) : '',
      actorEmail: actor.email || '',
      actorName: actor.name || nameFromEmail(actor.email),
      adminId: actor.id || null,
      adminName: actor.name || nameFromEmail(actor.email),
      adminRole: actor.role || '',
      details,
      ipAddress: input.ipAddress || '',
      category,
      changes: input.changes || [],
      metadata: input.metadata || {},
      timestamp: now,
    });
    return mapAuditLog(created);
  } catch (err) {
    console.warn('[audit] Failed to record audit log:', err.message);
    return null;
  }
}

/**
 * List audit logs with filters, search, and pagination.
 * @param {object} [query]
 * @returns {Promise<object>}
 */
export async function listAuditLogs(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(query.limit) || 15));
  const skip = (page - 1) * limit;

  const filters = {
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
    actorId: query.actorId || undefined,
    action: query.action || undefined,
    entity: query.entity || undefined,
    category: query.category || undefined,
    adminName: query.adminName || undefined,
    search: query.search || undefined,
  };

  if (filters.from && Number.isNaN(filters.from.getTime())) {
    filters.from = undefined;
  }
  if (filters.to && Number.isNaN(filters.to.getTime())) {
    filters.to = undefined;
  }

  // Facets from a broader window (same filters minus pagination)
  const facetFilters = {
    from: filters.from,
    to: filters.to,
    limit: 500,
    skip: 0,
  };
  const allForFacets = await auditDao.findMany(facetFilters);
  const mappedFacets = allForFacets.map(mapAuditLog);

  let eventTypeFiltered = null;
  if (query.eventType) {
    eventTypeFiltered = mappedFacets.filter(
      (item) => item.eventType === query.eventType
    );
  }

  // Prefer DB-level pagination when not filtering by computed eventType
  let items;
  let total;

  if (query.eventType && eventTypeFiltered) {
    let filtered = eventTypeFiltered;
    if (filters.actorId) {
      filtered = filtered.filter((item) => item.actor.id === filters.actorId);
    }
    if (filters.adminName) {
      const q = filters.adminName.toLowerCase();
      filtered = filtered.filter((item) =>
        item.adminName.toLowerCase().includes(q)
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.details.toLowerCase().includes(q) ||
          item.entityLabel.toLowerCase().includes(q) ||
          item.adminName.toLowerCase().includes(q)
      );
    }
    total = filtered.length;
    items = filtered.slice(skip, skip + limit);
  } else {
    total = await auditDao.count(filters);
    const docs = await auditDao.findMany({ ...filters, limit, skip });
    items = docs.map(mapAuditLog);
  }

  const usersMap = new Map();
  for (const item of mappedFacets) {
    if (!item.actor.id && !item.actor.name) continue;
    const key = item.actor.id || item.actor.email || item.actor.name;
    if (!usersMap.has(key)) {
      usersMap.set(key, {
        id: item.actor.id || key,
        name: item.actor.name,
        email: item.actor.email,
      });
    }
  }

  const eventTypes = [
    ...new Set(mappedFacets.map((item) => item.eventType).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));

  const pageCount = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    users: [...usersMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    eventTypes,
    page,
    limit,
    total,
    pageCount,
  };
}

/**
 * Delete all audit log entries.
 * @returns {Promise<{ deletedCount: number }>}
 */
export async function clearAuditLogs() {
  const deletedCount = await auditDao.deleteAll();
  return { deletedCount };
}
