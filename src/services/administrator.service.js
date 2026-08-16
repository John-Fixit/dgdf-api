import { AppError } from '../utils/AppError.js';
import * as userDao from '../daos/user.dao.js';

const ASSIGNABLE_ROLES = ['admin', 'viewer'];

/**
 * Map a user document to the administrators API shape.
 * @param {object} doc
 * @returns {object}
 */
export function mapAdministrator(doc) {
  const source = doc?.toObject ? doc.toObject() : doc;
  return {
    id: String(source._id || source.id),
    name: source.name || '',
    email: source.email,
    role: source.role,
    status: source.status || 'active',
    lastLogin: source.lastLogin
      ? source.lastLogin instanceof Date
        ? source.lastLogin.toISOString()
        : source.lastLogin
      : null,
    createdAt: source.createdAt
      ? source.createdAt instanceof Date
        ? source.createdAt.toISOString()
        : source.createdAt
      : null,
    createdBy: source.createdBy ? String(source.createdBy) : null,
  };
}

/**
 * List all administrators with aggregate stats.
 * @returns {Promise<{ items: object[], stats: object }>}
 */
export async function listAdministrators() {
  const users = await userDao.findAll();
  const items = users.map(mapAdministrator);

  const stats = {
    total: items.length,
    active: items.filter((u) => u.status === 'active').length,
    viewers: items.filter((u) => u.role === 'viewer').length,
  };

  return { items, stats };
}

/**
 * Create a new administrator (admin or viewer only).
 * @param {object} body
 * @param {string} createdById
 * @returns {Promise<object>}
 */
export async function createAdministrator(body, createdById) {
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const name = String(body.name || '').trim();
  const role = body.role;
  const password = body.password;

  if (!name) {
    throw new AppError('Full name is required', 400);
  }
  if (!email) {
    throw new AppError('Email address is required', 400);
  }
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new AppError('Role must be admin or viewer', 400);
  }
  if (!password || String(password).length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const existing = await userDao.findByEmailWithPassword(email);
  if (existing) {
    throw new AppError('An administrator with this email already exists', 409);
  }

  const created = await userDao.create({
    name,
    email,
    password,
    role,
    status: 'active',
    createdBy: createdById || null,
  });

  return mapAdministrator(created);
}

/**
 * Update an administrator's role.
 * @param {string} id
 * @param {{ role: string, reason?: string }} body
 * @returns {Promise<{ admin: object, previousRole: string }>}
 */
export async function updateAdministratorRole(id, body) {
  if (!ASSIGNABLE_ROLES.includes(body.role)) {
    throw new AppError('Role must be admin or viewer', 400);
  }

  const user = await userDao.findById(id);
  if (!user) {
    throw new AppError('Administrator not found', 404);
  }

  if (user.role === 'super_admin') {
    throw new AppError('Cannot change the role of a super admin', 400);
  }

  const previousRole = user.role;
  user.role = body.role;
  await user.save();

  return {
    admin: mapAdministrator(user),
    previousRole,
    reason: body.reason || '',
  };
}

/**
 * Toggle administrator active/inactive status.
 * @param {string} id
 * @param {{ status: 'active' | 'inactive' }} body
 * @param {string} actorId
 * @returns {Promise<object>}
 */
export async function updateAdministratorStatus(id, body, actorId) {
  if (!['active', 'inactive'].includes(body.status)) {
    throw new AppError('Status must be active or inactive', 400);
  }

  const user = await userDao.findById(id);
  if (!user) {
    throw new AppError('Administrator not found', 404);
  }

  if (user.role === 'super_admin') {
    throw new AppError('Cannot deactivate a super admin', 400);
  }

  if (String(user._id) === String(actorId)) {
    throw new AppError('You cannot deactivate your own account', 400);
  }

  user.status = body.status;
  await user.save();

  return mapAdministrator(user);
}

/**
 * Reset an administrator's password.
 * @param {string} id
 * @param {{ password: string }} body
 * @returns {Promise<object>}
 */
export async function resetAdministratorPassword(id, body) {
  const password = body.password;
  if (!password || String(password).length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const user = await userDao.findByIdWithPassword(id);
  if (!user) {
    throw new AppError('Administrator not found', 404);
  }

  user.password = password;
  await user.save();

  return mapAdministrator(user);
}

export { ASSIGNABLE_ROLES };
