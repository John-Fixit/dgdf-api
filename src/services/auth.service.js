import crypto from 'crypto';
import { AppError } from '../utils/AppError.js';
import * as userDao from '../daos/user.dao.js';
import { signToken } from '../middleware/auth.middleware.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';

const RESET_TOKEN_EXPIRES_MINUTES = 30;

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
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function login({ email, password }) {
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
}

/**
 * Change the authenticated admin's password.
 * @param {string} userId
 * @param {{ currentPassword: string, newPassword: string }} body
 * @returns {Promise<object>}
 */
export async function changePassword(userId, { currentPassword, newPassword }) {
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
 * Request a password-reset email. Always resolves silently (no error, no
 * indication of whether the email exists) to avoid leaking which addresses
 * have admin accounts.
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function forgotPassword(email) {
  const user = await userDao.findByEmail(email);
  if (!user || user.status === 'inactive') {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(
    Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000
  );
  await user.save();

  const adminUrl = (process.env.ADMIN_URL || '').split(',')[0];
  const resetUrl = `${adminUrl}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl, RESET_TOKEN_EXPIRES_MINUTES);
  } catch (err) {
    // Never let a mail-provider failure surface to the client — doing so
    // would leak account existence via a differing response (200 vs 500)
    // between registered and unregistered emails.
    console.warn('[auth] Failed to send password reset email:', err.message);
  }
}

/**
 * Complete a password reset using a token issued by forgotPassword.
 * @param {string} token - Raw token from the reset link
 * @param {string} newPassword
 * @returns {Promise<object>}
 */
export async function resetPassword(token, newPassword) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await userDao.findByResetToken(hashedToken);
  if (!user) {
    throw new AppError('Reset link is invalid or has expired', 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
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
