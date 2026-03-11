// ===== src/utils/catchAsync.js =====
/**
 * Wraps async route handlers to eliminate try-catch blocks
 * Automatically passes errors to Express error handler
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function that catches errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;