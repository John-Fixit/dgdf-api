import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError.js';
import { isDBConnected } from '../config/db.js';
import * as userDao from '../daos/user.dao.js';
import { signToken } from '../middleware/auth.middleware.js';

/** In-memory fallback when MongoDB is unavailable */
const MOCK_ADMIN = {
  id: 'mock-admin-id',
  email: 'admin@dgdelightfound.org',
  name: 'Super Admin',
  // password: "Admin@2026"
  passwordHash: null,
  role: 'super_admin',
  status: 'active',
};

/**
 * Lazily hash the mock admin password.
 * @returns {Promise<string>}
 */
async function getMockPasswordHash() {
  if (!MOCK_ADMIN.passwordHash) {
    MOCK_ADMIN.passwordHash = await bcrypt.hash('Admin@2026', 12);
  }
  return MOCK_ADMIN.passwordHash;
}

/**
 * Public user shape returned by auth endpoints.
 * @param {{ _id?: { toString(): string }, id?: string, email: string, name?: string, role: string, status?: string }} user
 * @returns {{ id: string, email: string, name: string, role: string, status: string }}
 */
function toPublicUser(user) {
  const id = user.id ?? user._id?.toString() ?? '';
  const email = user.email;
  const name =
    (user.name && String(user.name).trim()) ||
    email.split('@')[0] ||
    'Admin';

  return {
    id,
    email,
    name,
    role: user.role,
    status: user.status || 'active',
  };
}

/**
 * Authenticate an admin and return user + JWT.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string, mock?: boolean }>}
 */
export async function login({ email, password }) {
  if (isDBConnected()) {
    try {
      const user = await userDao.findByEmailWithPassword(email);
      if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid email or password', 401);
      }

      if (user.status === 'inactive') {
        throw new AppError('Account is deactivated', 403);
      }

      user.lastLogin = new Date();
      await user.save();

      const publicUser = toPublicUser(user);
      const payload = {
        id: publicUser.id,
        email: publicUser.email,
        role: publicUser.role,
      };

      return {
        user: publicUser,
        token: signToken(payload),
      };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      console.warn('[auth/login] DB error, falling back to mock:', err.message);
    }
  }

  const hash = await getMockPasswordHash();
  const emailOk = email.toLowerCase() === MOCK_ADMIN.email;
  const passwordOk = await bcrypt.compare(password, hash);

  if (!emailOk || !passwordOk) {
    throw new AppError('Invalid email or password', 401);
  }

  const publicUser = toPublicUser(MOCK_ADMIN);
  const payload = {
    id: publicUser.id,
    email: publicUser.email,
    role: publicUser.role,
  };

  return {
    user: publicUser,
    token: signToken(payload),
    mock: true,
  };
}

/**
 * Change the authenticated admin's password.
 * @param {string} userId
 * @param {{ currentPassword: string, newPassword: string }} body
 * @returns {Promise<object>}
 */
export async function changePassword(userId, { currentPassword, newPassword }) {
  if (!isDBConnected()) {
    throw new AppError('Password changes require a database connection', 503);
  }

  const user = await userDao.findByIdWithPassword(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const matches = await user.comparePassword(currentPassword);
  if (!matches) {
    throw new AppError('Current password is incorrect', 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError(
      'New password must be different from current password',
      400
    );
  }

  user.password = newPassword;
  await user.save();

  return toPublicUser(user);
}

/**
 * Update the authenticated admin's display name.
 * @param {string} userId
 * @param {{ name: string }} body
 * @returns {Promise<object>}
 */
export async function updateProfile(userId, { name }) {
  if (!isDBConnected()) {
    throw new AppError('Profile updates require a database connection', 503);
  }

  const user = await userDao.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.name = name.trim();
  await user.save();

  return toPublicUser(user);
}

/**
 * Resolve the current user payload (used by /me when enriching from DB).
 * @param {object} user
 * @returns {object}
 */
export function getCurrentUser(user) {
  return toPublicUser(user);
}

export { toPublicUser };
