import jwt from "jsonwebtoken";
import { error } from "../utils/ApiResponse.js";
import * as userDao from "../daos/user.dao.js";

const COOKIE_NAME = "dgdf_token";

/** Roles that can access the admin portal */
export const PORTAL_ROLES = ["super_admin", "admin", "viewer"];

/** Roles that can mutate content / gallery / messages */
export const EDITOR_ROLES = ["super_admin", "admin"];

const DEFAULT_IDLE_TIMEOUT_MINUTES = 20;

/**
 * Minutes of inactivity before a session is considered expired.
 * Token exp and cookie maxAge both slide to this value on each
 * successful /auth/heartbeat call, so the session only lasts as
 * long as the portal keeps seeing real activity.
 * @returns {number}
 */
export function getIdleTimeoutMinutes() {
  const raw = Number(process.env.IDLE_TIMEOUT_MINUTES);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_IDLE_TIMEOUT_MINUTES;
}

/**
 * Get the JWT secret, falling back to a development placeholder.
 * @returns {string}
 */
function getJwtSecret() {
  return process.env.JWT_SECRET || "dgdf_dev_secret_change_me";
}

/**
 * Sign a JWT for the given user payload. Expiry equals the idle timeout —
 * call this again (via /auth/heartbeat) on activity to slide the session forward.
 * @param {{ id: string, email: string, role: string }} payload
 * @returns {string}
 */
export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: `${getIdleTimeoutMinutes()}m`,
  });
}

/**
 * Cookie options for the auth token.
 * @returns {import('express').CookieOptions}
 */
export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: getIdleTimeoutMinutes() * 60 * 1000,
  };
}

/**
 * Cookie options used when clearing the auth cookie (no maxAge).
 * @returns {import('express').CookieOptions}
 */
export function clearAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

/**
 * Build the request user object from a DB user document.
 * @param {object} user
 * @returns {{ id: string, email: string, name: string, role: string, status: string }}
 */
function toReqUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name || "",
    role: user.role,
    status: user.status || "active",
  };
}

/**
 * Require a valid JWT from the dgdf_token cookie (or Authorization Bearer header).
 * Attaches req.user = { id, email, name, role, status }.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function protect(req, res, next) {
  const token =
    req.cookies?.[COOKIE_NAME] ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return error(res, "Not authorized — no token", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch {
    return error(res, "Not authorized — invalid token", 401);
  }

  try {
    const user = await userDao.findById(decoded.id);
    if (!user) {
      return error(res, "Not authorized — user not found", 401);
    }
    if (user.status === "inactive") {
      return error(res, "Account is deactivated", 403);
    }
    req.user = toReqUser(user);
    next();
  } catch (err) {
    return error(res, err.message || "Not authorized", err.statusCode || 500);
  }
}

/**
 * Require the authenticated user to have one of the given roles.
 * @param {...string} roles
 * @returns {import('express').RequestHandler}
 */
export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(
        res,
        "You do not have permission to perform this action",
        403,
      );
    }
    next();
  };
}

/**
 * Require any portal role (super_admin, admin, or viewer).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function adminOnly(req, res, next) {
  if (!req.user || !PORTAL_ROLES.includes(req.user.role)) {
    return error(res, "Admin access required", 403);
  }
  next();
}

/**
 * Require a role that can mutate resources (super_admin or admin).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function editorOnly(req, res, next) {
  if (!req.user || !EDITOR_ROLES.includes(req.user.role)) {
    return error(res, "You do not have permission to perform this action", 403);
  }
  next();
}

/**
 * Require super_admin role.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function superAdminOnly(req, res, next) {
  if (!req.user || req.user.role !== "super_admin") {
    return error(res, "Super admin access required", 403);
  }
  next();
}

/**
 * Attach req.user when a valid token is present; never blocks anonymous access.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function optionalProtect(req, res, next) {
  try {
    const token =
      req.cookies?.[COOKIE_NAME] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await userDao.findById(decoded.id);
    if (user && user.status !== "inactive") {
      req.user = toReqUser(user);
    }
  } catch {
    // Invalid token or DB unavailable — proceed anonymously, this auth is optional
  }
  next();
}

/**
 * Extract a client IP address from the request.
 * @param {import('express').Request} req
 * @returns {string}
 */
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "";
}

export { COOKIE_NAME };
