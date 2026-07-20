import { ZodError } from 'zod';
import { error } from '../utils/ApiResponse.js';

/**
 * Format Zod issues into a single readable message.
 * @param {ZodError} err
 * @returns {string}
 */
function formatZodError(err) {
  return err.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join('.') : 'request';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}

/**
 * Global Express error-handling middleware.
 * @param {Error} err - Error thrown or passed to next()
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 * @returns {import('express').Response}
 */
export function errorMiddleware(err, req, res, _next) {
  console.error('[error]', err.message);

  if (err instanceof ZodError) {
    return error(res, formatZodError(err), 400);
  }

  if (err.name === 'ValidationError') {
    return error(res, err.message, 400);
  }

  if (err.name === 'CastError') {
    return error(res, 'Invalid resource ID', 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return error(res, `Duplicate value for ${field}`, 409);
  }

  if (err.name === 'MulterError') {
    return error(res, err.message, 400);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  return error(res, message, statusCode);
}
