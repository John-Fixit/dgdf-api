import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError.js';
import { isDBConnected } from '../config/db.js';
import * as userDao from '../daos/user.dao.js';
import { signToken } from '../middleware/auth.middleware.js';

/** In-memory fallback when MongoDB is unavailable */
const MOCK_ADMIN = {
  id: 'mock-admin-id',
  email: 'admin@dgdelightfound.org',
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
 * Authenticate an admin and return user + JWT.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: { id: string, email: string, role: string }, token: string, mock?: boolean }>}
 */
export async function login({ email, password }) {
  if (isDBConnected()) {
    try {
      const user = await userDao.findByEmailWithPassword(email);
      if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid email or password', 401);
      }

      const payload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      return {
        user: { id: user._id.toString(), email: user.email, role: user.role },
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

  const payload = {
    id: MOCK_ADMIN.id,
    email: MOCK_ADMIN.email,
    role: MOCK_ADMIN.role,
  };

  return {
    user: { id: MOCK_ADMIN.id, email: MOCK_ADMIN.email, role: MOCK_ADMIN.role },
    token: signToken(payload),
    mock: true,
  };
}
