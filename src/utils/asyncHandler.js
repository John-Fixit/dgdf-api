/**
 * Wrap an async route handler so rejected promises are forwarded to Express error middleware.
 * @param {Function} fn - Async Express route handler (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
