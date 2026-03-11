// ===== src/utils/AppError.js =====
/**
 * Custom error class for operational errors
 * Extends native Error with additional properties for better error handling
 */
class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;