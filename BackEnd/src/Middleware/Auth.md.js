// ===== src/middleware/auth.js =====
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../Models/User');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');

// ===== PROTECT ROUTES FOR REGULAR USERS =====
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }

  try {
    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password. Please log in again.', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    // Grant access
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    return next(error);
  }
});

// ===== PROTECT ROUTES FOR ADMINS =====
exports.protectAdmin = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in as admin. Please log in to access this resource.', 401));
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const admin = await User.findByPk(decoded.id);
    if (!admin) {
      return next(new AppError('The admin belonging to this token no longer exists.', 401));
    }

    if (admin.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Admin recently changed password. Please log in again.', 401));
    }

    if (admin.role !== 'admin' && admin.role !== 'super_admin') {
      return next(new AppError('Your admin account is not active. Please contact super admin.', 403));
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid admin token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your admin token has expired. Please log in again.', 401));
    }
    return next(error);
  }
});

// ===== RESTRICT TO SPECIFIC ROLES =====
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // For admin routes
    if (req.admin) {
      if (!roles.includes(req.admin.role)) {
        return next(new AppError('You do not have permission to perform this action.', 403));
      }
      return next();
    }

    // For user routes
    if (req.user) {
      if (!roles.includes(req.user.role)) {
        return next(new AppError('You do not have permission to perform this action.', 403));
      }
      return next();
    }

    return next(new AppError('Not authenticated', 401));
  };
};

// ===== OPTIONAL AUTH (for routes that can work both with and without auth) =====
exports.optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
});

// ===== CHECK IF USER OWNS RESOURCE =====
exports.checkOwnership = (model) => {
  return catchAsync(async (req, res, next) => {
    const resource = await model.findByPk(req.params.id);
    
    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    const userId = req.user?.id;
    const resourceUserId = resource.userId || resource.user?.id;

    if (resourceUserId?.toString() !== userId?.toString() && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to modify this resource', 403));
    }

    req.resource = resource;
    next();
  });
};

// ===== CHECK IF USER HAS VERIFIED 2FA =====
exports.requireTwoFactor = catchAsync(async (req, res, next) => {
  if (req.user.twoFactorEnabled && !req.session.twoFactorVerified) {
    return next(new AppError('Two-factor authentication required', 403));
  }
  next();
});

// ===== RATE LIMIT FOR AUTH ATTEMPTS =====
exports.authRateLimiter = catchAsync(async (req, res, next) => {
  const ip = req.ip;
  const attempts = await getLoginAttempts(ip);

  if (attempts >= 5) {
    return next(new AppError('Too many login attempts. Please try again after 15 minutes.', 429));
  }

  next();
});

// ===== HELPER FUNCTIONS =====
const getLoginAttempts = async (ip) => {
  // Implementation with Redis
  return 0;
};
