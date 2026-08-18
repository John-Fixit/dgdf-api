import { success } from '../utils/ApiResponse.js';
import * as authService from '../services/auth.service.js';
import { recordAudit } from '../services/audit.service.js';
import {
  authCookieOptions,
  clearAuthCookieOptions,
  COOKIE_NAME,
  getClientIp,
  signToken,
} from '../middleware/auth.middleware.js';

/**
 * POST /auth/login
 */
export async function login(req, res) {
  const result = await authService.login(req.body);

  res.cookie(COOKIE_NAME, result.token, authCookieOptions());

  await recordAudit({
    actor: result.user,
    action: 'create',
    entity: 'auth',
    entityId: result.user.id,
    entityLabel: result.user.name,
    category: 'auth',
    details: `${result.user.name} logged in`,
    ipAddress: getClientIp(req),
    changes: ['login'],
  });

  return success(res, result.user, 'Logged in successfully');
}

/**
 * POST /auth/logout
 */
export async function logout(req, res) {
  if (req.user) {
    await recordAudit({
      actor: req.user,
      action: 'delete',
      entity: 'auth',
      entityId: req.user.id,
      entityLabel: req.user.name,
      category: 'auth',
      details: `${req.user.name} logged out`,
      ipAddress: getClientIp(req),
      changes: ['logout'],
    });
  }

  res.clearCookie(COOKIE_NAME, clearAuthCookieOptions());
  return success(res, null, 'Logged out successfully');
}

/**
 * GET /auth/me
 */
export async function me(req, res) {
  return success(res, authService.getCurrentUser(req.user), 'Current user');
}

/**
 * POST /auth/heartbeat
 * Re-issues the session token, sliding its expiry forward by the idle
 * timeout. Called by the frontend only while the admin is actively using
 * the portal — an expired/missing token here already 401s via `protect`.
 */
export async function heartbeat(req, res) {
  const token = signToken({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
  });

  res.cookie(COOKIE_NAME, token, authCookieOptions());
  return success(res, req.user, 'Session extended');
}

/**
 * POST /auth/forgot-password
 */
export async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body.email);
  return success(
    res,
    null,
    'If that email is registered, a reset link has been sent'
  );
}

/**
 * POST /auth/reset-password
 */
export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  const user = await authService.resetPassword(token, newPassword);

  await recordAudit({
    actor: user,
    action: 'update',
    entity: 'auth',
    entityId: user.id,
    entityLabel: user.name,
    category: 'auth',
    details: `${user.name} reset their password`,
    ipAddress: getClientIp(req),
    changes: ['password-reset'],
  });

  return success(res, null, 'Password reset successfully');
}

/**
 * PATCH /auth/change-password
 */
export async function changePassword(req, res) {
  const user = await authService.changePassword(req.user.id, req.body);
  return success(res, user, 'Password updated successfully');
}

/**
 * PATCH /auth/update-profile
 */
export async function updateProfile(req, res) {
  const user = await authService.updateProfile(req.user.id, req.body);
  return success(res, user, 'Profile updated');
}
