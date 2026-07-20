import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

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
 * Validate req.body / req.params / req.query with Zod schemas.
 * Replaces each target with the parsed (coerced/stripped) value.
 *
 * @param {{ body?: import('zod').ZodType, params?: import('zod').ZodType, query?: import('zod').ZodType }} schemas
 * @returns {import('express').RequestHandler}
 */
export function validate(schemas = {}) {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body ?? {});
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params ?? {});
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query ?? {});
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(new AppError(formatZodError(err), 400));
        return;
      }
      next(err);
    }
  };
}
