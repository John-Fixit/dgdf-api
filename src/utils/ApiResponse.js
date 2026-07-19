/**
 * Send a successful JSON response.
 * @param {import('express').Response} res - Express response object
 * @param {*} data - Response payload
 * @param {string} [message='Success'] - Human-readable message
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {import('express').Response}
 */
export function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send an error JSON response.
 * @param {import('express').Response} res - Express response object
 * @param {string} [message='Something went wrong'] - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @returns {import('express').Response}
 */
export function error(res, message = 'Something went wrong', statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
}
