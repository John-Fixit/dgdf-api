/**
 * Application error with an HTTP status code for the global error middleware.
 */
export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} [statusCode=500]
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
