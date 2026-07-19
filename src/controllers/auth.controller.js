import bcrypt from 'bcryptjs';
import { success, error } from '../utils/ApiResponse.js';
import { isDBConnected } from '../config/db.js';
import User from '../models/User.js';
import {
  signToken,
  authCookieOptions,
  COOKIE_NAME,
} from '../middleware/auth.middleware.js';

/** In-memory fallback when MongoDB is unavailable */
const MOCK_ADMIN = {
  id: 'mock-admin-id',
  email: 'admin@dgdf.org',
  // password: "admin123"
  passwordHash: null,
  role: 'admin',
};

/**
 * Lazily hash the mock admin password.
 * @returns {Promise<string>}
 */
async function getMockPasswordHash() {
  if (!MOCK_ADMIN.passwordHash) {
    MOCK_ADMIN.passwordHash = await bcrypt.hash('admin123', 12);
  }
  return MOCK_ADMIN.passwordHash;
}

/**
 * POST /api/auth/login — authenticate admin and set JWT cookie.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return error(res, 'Email and password are required', 400);
  }

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return error(res, 'Invalid email or password', 401);
      }

      const token = signToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      res.cookie(COOKIE_NAME, token, authCookieOptions());
      return success(
        res,
        { id: user._id, email: user.email, role: user.role },
        'Logged in successfully'
      );
    } catch (err) {
      console.warn('[auth/login] DB error, falling back to mock:', err.message);
    }
  }

  const hash = await getMockPasswordHash();
  const emailOk = email.toLowerCase() === MOCK_ADMIN.email;
  const passwordOk = await bcrypt.compare(password, hash);

  if (!emailOk || !passwordOk) {
    return error(res, 'Invalid email or password', 401);
  }

  const token = signToken({
    id: MOCK_ADMIN.id,
    email: MOCK_ADMIN.email,
    role: MOCK_ADMIN.role,
  });

  res.cookie(COOKIE_NAME, token, authCookieOptions());
  return success(
    res,
    { id: MOCK_ADMIN.id, email: MOCK_ADMIN.email, role: MOCK_ADMIN.role },
    'Logged in successfully (mock)'
  );
}

/**
 * POST /api/auth/logout — clear the auth cookie.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
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
 * GET /api/auth/me — return the current authenticated user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function me(req, res) {
  return success(res, req.user, 'Current user');
}
