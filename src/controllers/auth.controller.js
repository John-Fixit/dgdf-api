import { success } from '../utils/ApiResponse.js';
import * as authService from '../services/auth.service.js';
import {
  authCookieOptions,
  COOKIE_NAME,
} from '../middleware/auth.middleware.js';

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  const result = await authService.login(req.body);

  res.cookie(COOKIE_NAME, result.token, authCookieOptions());
  return success(
    res,
    { ...result.user, token: result.token },
    'Logged in successfully'
  );
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return success(res, null, 'Logged out successfully');
}

/**
 * GET /api/auth/me
 */
export async function me(req, res) {
  return success(res, req.user, 'Current user');
}
