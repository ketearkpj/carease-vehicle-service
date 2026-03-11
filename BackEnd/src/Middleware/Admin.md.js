// ===== src/middleware/admin.js =====
const Admin = require('../Models/Admin');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');

// ===== CHECK IF ADMIN HAS SPECIFIC PERMISSION =====
exports.hasPermission = (permission) => {
  return catchAsync(async (req, res, next) => {
    const admin = req.admin || await Admin.findByPk(req.user?.id);

    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    if (!admin.hasPermission(permission)) {
      return next(new AppError(`You do not have required permission: ${permission}`, 403));
    }

    next();
  });
};

// ===== CHECK IF ADMIN HAS ANY OF SPECIFIED PERMISSIONS =====
exports.hasAnyPermission = (permissions) => {
  return catchAsync(async (req, res, next) => {
    const admin = req.admin || await Admin.findByPk(req.user?.id);

    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    if (!admin.hasAnyPermission(permissions)) {
      return next(new AppError('You do not have any of the required permissions', 403));
    }

    next();
  });
};

// ===== CHECK IF ADMIN HAS ALL SPECIFIED PERMISSIONS =====
exports.hasAllPermissions = (permissions) => {
  return catchAsync(async (req, res, next) => {
    const admin = req.admin || await Admin.findByPk(req.user?.id);

    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    if (!admin.hasAllPermissions(permissions)) {
      return next(new AppError('You do not have all required permissions', 403));
    }

    next();
  });
};

// ===== LOG ADMIN ACTIVITY =====
exports.logActivity = (action, targetType) => {
  return catchAsync(async (req, res, next) => {
    const admin = req.admin || await Admin.findByPk(req.user?.id);

    if (admin) {
      await admin.logActivity(action, targetType, req.params.id, req.body, req);
    }

    next();
  });
};

// ===== CHECK IF ADMIN IS SUPER ADMIN =====
exports.isSuperAdmin = (req, res, next) => {
  const admin = req.admin || req.user;

  if (!admin || admin.role !== 'super_admin') {
    return next(new AppError('This action requires super admin privileges', 403));
  }

  next();
};

// ===== CHECK IF ADMIN IS ACTIVE =====
exports.isActiveAdmin = catchAsync(async (req, res, next) => {
  const admin = req.admin || await Admin.findByPk(req.user?.id);

  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  if (!admin.isActive) {
    return next(new AppError('Admin account is not active', 403));
  }

  next();
});
