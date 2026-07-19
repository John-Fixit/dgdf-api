import jwt from 'jsonwebtoken';
import { error } from '../utils/ApiResponse.js';
import { isDBConnected } from '../config/db.js';
import User from '../models/User.js';

const COOKIE_NAME = 'dgdf_token';

/**
 * Get the JWT secret, falling back to a development placeholder.
 * @returns {string}
 */
function getJwtSecret() {
  return process.env.JWT_SECRET || 'dgdf_dev_secret_change_me';
}

/**
 * Sign a JWT for the given user payload.
 * @param {{ id: string, email: string, role: string }} payload
 * @returns {string}
 */
export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Cookie options for the auth token.
 * @returns {import('express').CookieOptions}
 */
export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

/**
 * Require a valid JWT from the dgdf_token cookie (or Authorization Bearer header).
 * Attaches req.user = { id, email, role }.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function protect(req, res, next) {
  try {
    const token =
      req.cookies?.[COOKIE_NAME] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      return error(res, 'Not authorized — no token', 401);
    }

    const decoded = jwt.verify(token, getJwtSecret());

    if (isDBConnected()) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return error(res, 'Not authorized — user not found', 401);
      }
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };
    } else {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'admin',
      };
    }

    next();
  } catch (err) {
    return error(res, 'Not authorized — invalid token', 401);
  }
}

/**
 * Require the authenticated user to have the admin role.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return error(res, 'Admin access required', 403);
  }
  next();
}

export { COOKIE_NAME };
