// ===== src/middleware/errorHandler.js =====
const AppError = require('../Utils/AppError');
const { logger } = require('./Logger.md.js');

// ===== HANDLE CAST ERRORS (INVALID IDs) =====
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// ===== HANDLE DUPLICATE FIELD ERRORS =====
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

// ===== HANDLE VALIDATION ERRORS =====
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, errors);
};

// ===== HANDLE JWT ERRORS =====
const handleJWTError = () => 
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => 
  new AppError('Your token has expired. Please log in again.', 401);

// ===== HANDLE RATE LIMIT ERRORS =====
const handleRateLimitError = () =>
  new AppError('Too many requests. Please try again later.', 429);

// ===== SEND ERROR IN DEVELOPMENT =====
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    errors: err.errors
  });
};

// ===== SEND ERROR IN PRODUCTION =====
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// ===== MAIN ERROR HANDLER =====
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?._id
  });

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'RateLimitError') error = handleRateLimitError();

    sendErrorProd(error, res);
  }
};