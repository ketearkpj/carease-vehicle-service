// ===== src/middleware/role.js =====
const AppError = require('../Utils/AppError');
const User = require('../Models/User');
const Admin = require('../Models/Admin');

// ===== ROLE HIERARCHY =====
const ROLE_HIERARCHY = {
  // User roles
  customer: 10,
  provider: 20,
  
  // Admin roles
  support: 30,
  finance: 35,
  manager: 40,
  admin: 50,
  super_admin: 100
};

// ===== PERMISSION MATRIX =====
const PERMISSIONS = {
  // Booking permissions
  'create:booking': ['customer', 'provider', 'admin', 'super_admin'],
  'view:own_booking': ['customer', 'provider'],
  'view:all_bookings': ['admin', 'super_admin', 'manager', 'support'],
  'update:booking': ['provider', 'admin', 'super_admin', 'manager'],
  'cancel:booking': ['customer', 'admin', 'super_admin'],
  'delete:booking': ['admin', 'super_admin'],

  // Payment permissions
  'create:payment': ['customer', 'admin', 'super_admin'],
  'view:own_payments': ['customer'],
  'view:all_payments': ['admin', 'super_admin', 'finance'],
  'process:refund': ['admin', 'super_admin', 'finance'],
  'manage:payment_methods': ['customer', 'admin', 'super_admin'],

  // Vehicle permissions
  'view:vehicles': ['customer', 'provider', 'admin', 'super_admin', 'support', 'manager'],
  'create:vehicle': ['admin', 'super_admin', 'provider'],
  'update:vehicle': ['admin', 'super_admin', 'provider'],
  'delete:vehicle': ['admin', 'super_admin'],
  'manage:vehicle_images': ['admin', 'super_admin', 'provider'],

  // Service permissions
  'view:services': ['customer', 'provider', 'admin', 'super_admin', 'support', 'manager'],
  'create:service': ['admin', 'super_admin'],
  'update:service': ['admin', 'super_admin'],
  'delete:service': ['admin', 'super_admin'],

  // User permissions
  'view:own_profile': ['customer', 'provider'],
  'view:all_users': ['admin', 'super_admin', 'manager', 'support'],
  'update:user': ['admin', 'super_admin', 'manager'],
  'delete:user': ['admin', 'super_admin'],
  'manage:user_roles': ['admin', 'super_admin'],

  // Admin permissions
  'view:admins': ['admin', 'super_admin'],
  'create:admin': ['super_admin'],
  'update:admin': ['super_admin'],
  'delete:admin': ['super_admin'],

  // Delivery permissions
  'create:delivery': ['customer', 'admin', 'super_admin'],
  'view:own_delivery': ['customer'],
  'view:all_deliveries': ['admin', 'super_admin', 'manager', 'support'],
  'update:delivery_status': ['driver', 'admin', 'super_admin', 'manager'],
  'assign:driver': ['admin', 'super_manager'],

  // Review permissions
  'create:review': ['customer'],
  'view:reviews': ['customer', 'provider', 'admin', 'super_admin', 'support', 'manager'],
  'moderate:review': ['admin', 'super_admin', 'manager'],

  // Location permissions
  'view:locations': ['customer', 'provider', 'admin', 'super_admin', 'support', 'manager'],
  'manage:locations': ['admin', 'super_admin'],

  // Report permissions
  'view:reports': ['admin', 'super_admin', 'manager', 'finance'],
  'export:data': ['admin', 'super_admin', 'manager'],

  // System permissions
  'view:logs': ['admin', 'super_admin'],
  'manage:settings': ['super_admin'],
  'manage:system': ['super_admin']
};

// ===== CHECK IF USER HAS ROLE =====
exports.hasRole = (...roles) => {
  return (req, res, next) => {
    const user = req.user || req.admin;

    if (!user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (!roles.includes(user.role)) {
      return next(new AppError(`This action requires one of these roles: ${roles.join(', ')}`, 403));
    }

    next();
  };
};

// ===== CHECK IF USER HAS MINIMUM ROLE LEVEL =====
exports.minRoleLevel = (requiredRole) => {
  return (req, res, next) => {
    const user = req.user || req.admin;

    if (!user) {
      return next(new AppError('Not authenticated', 401));
    }

    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return next(new AppError(`Insufficient role level. Required: ${requiredRole}`, 403));
    }

    next();
  };
};

// ===== CHECK IF USER HAS SPECIFIC PERMISSION =====
exports.hasPermission = (permission) => {
  return async (req, res, next) => {
    const user = req.user || req.admin;

    if (!user) {
      return next(new AppError('Not authenticated', 401));
    }

    // Super admin has all permissions
    if (user.role === 'super_admin') {
      return next();
    }

    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles) {
      return next(new AppError(`Permission ${permission} does not exist`, 500));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(new AppError(`You do not have permission: ${permission}`, 403));
    }

    next();
  };
};

// ===== CHECK IF USER HAS ANY OF THE PERMISSIONS =====
exports.hasAnyPermission = (permissions) => {
  return async (req, res, next) => {
    const user = req.user || req.admin;

    if (!user) {
      return next(new AppError('Not authenticated', 401));
    }

    // Super admin has all permissions
    if (user.role === 'super_admin') {
      return next();
    }

    const hasAny = permissions.some(permission => {
      const allowedRoles = PERMISSIONS[permission];
      return allowedRoles && allowedRoles.includes(user.role);
    });

    if (!hasAny) {
      return next(new AppError(`You do not have any of the required permissions`, 403));
    }

    next();
  };
};

// ===== CHECK IF USER HAS ALL PERMISSIONS =====
exports.hasAllPermissions = (permissions) => {
  return async (req, res, next) => {
    const user = req.user || req.admin;

    if (!user) {
      return next(new AppError('Not authenticated', 401));
    }

    // Super admin has all permissions
    if (user.role === 'super_admin') {
      return next();
    }

    const hasAll = permissions.every(permission => {
      const allowedRoles = PERMISSIONS[permission];
      return allowedRoles && allowedRoles.includes(user.role);
    });

    if (!hasAll) {
      return next(new AppError(`You do not have all required permissions`, 403));
    }

    next();
  };
};

// ===== CHECK IF USER CAN ACCESS RESOURCE =====
exports.canAccessResource = (resourceType) => {
  return async (req, res, next) => {
    const user = req.user || req.admin;
    const resourceId = req.params.id;

    if (!user) {
      return next(new AppError('Not authenticated', 401));
    }

    // Admin can access any resource
    if (['admin', 'super_admin', 'manager'].includes(user.role)) {
      return next();
    }

    try {
      let Model;
      switch (resourceType) {
        case 'booking':
          Model = require('../Models/Booking');
          break;
        case 'payment':
          Model = require('../Models/Payment');
          break;
        case 'vehicle':
          Model = require('../Models/Vehicle');
          break;
        case 'user':
          Model = require('../Models/User');
          break;
        default:
          return next(new AppError('Invalid resource type', 500));
      }

      const resource = await Model.findById(resourceId);

      if (!resource) {
        return next(new AppError('Resource not found', 404));
      }

      // Check ownership
      const resourceUserId = resource.user || resource.userId || resource.customerId;
      
      if (resourceUserId && resourceUserId.toString() === user._id.toString()) {
        return next();
      }

      return next(new AppError('You do not have permission to access this resource', 403));
    } catch (error) {
      return next(error);
    }
  };
};

// ===== CHECK IF USER IS RESOURCE OWNER =====
exports.isOwner = (resourceType, idField = 'user') => {
  return async (req, res, next) => {
    const user = req.user || req.admin;
    const resourceId = req.params.id;

    if (!user) {
      return next(new AppError('Not authenticated', 401));
    }

    try {
      let Model;
      switch (resourceType) {
        case 'booking':
          Model = require('../Models/Booking');
          break;
        case 'payment':
          Model = require('../Models/Payment');
          break;
        case 'review':
          Model = require('../Models/Review');
          break;
        default:
          return next(new AppError('Invalid resource type', 500));
      }

      const resource = await Model.findById(resourceId);

      if (!resource) {
        return next(new AppError('Resource not found', 404));
      }

      const ownerId = resource[idField];
      
      if (ownerId && ownerId.toString() === user._id.toString()) {
        req.resource = resource;
        return next();
      }

      return next(new AppError('You are not the owner of this resource', 403));
    } catch (error) {
      return next(error);
    }
  };
};

// ===== CHECK IF USER IS ADMIN OR OWNER =====
exports.isAdminOrOwner = (resourceType, idField = 'user') => {
  return async (req, res, next) => {
    const user = req.user || req.admin;
    const resourceId = req.params.id;

    if (!user) {
      return next(new AppError('Not authenticated', 401));
    }

    // Admin can access any resource
    if (['admin', 'super_admin', 'manager'].includes(user.role)) {
      return next();
    }

    try {
      let Model;
      switch (resourceType) {
        case 'booking':
          Model = require('../Models/Booking');
          break;
        case 'payment':
          Model = require('../Models/Payment');
          break;
        case 'review':
          Model = require('../Models/Review');
          break;
        default:
          return next(new AppError('Invalid resource type', 500));
      }

      const resource = await Model.findById(resourceId);

      if (!resource) {
        return next(new AppError('Resource not found', 404));
      }

      const ownerId = resource[idField];
      
      if (ownerId && ownerId.toString() === user._id.toString()) {
        req.resource = resource;
        return next();
      }

      return next(new AppError('You do not have permission to access this resource', 403));
    } catch (error) {
      return next(error);
    }
  };
};

// ===== GET USER'S ALLOWED ACTIONS =====
exports.getAllowedActions = async (user, resource) => {
  const actions = [];

  if (!user || !resource) return actions;

  const userRole = user.role;

  // Super admin can do everything
  if (userRole === 'super_admin') {
    return ['create', 'read', 'update', 'delete', 'manage', 'approve', 'reject', 'cancel'];
  }

  // Check each action
  const actionChecks = {
    read: ['view:own_booking', 'view:all_bookings', 'view:own_payments', 'view:all_payments'],
    update: ['update:booking', 'update:user'],
    delete: ['delete:booking', 'delete:user'],
    cancel: ['cancel:booking'],
    approve: ['moderate:review'],
    manage: ['manage:user_roles', 'manage:locations']
  };

  Object.entries(actionChecks).forEach(([action, permissions]) => {
    const hasPermission = permissions.some(permission => {
      const allowedRoles = PERMISSIONS[permission];
      return allowedRoles && allowedRoles.includes(userRole);
    });

    if (hasPermission) {
      actions.push(action);
    }
  });

  // Add owner-specific actions
  if (resource.user && resource.user.toString() === user._id.toString()) {
    if (!actions.includes('read')) actions.push('read');
    if (!actions.includes('update')) actions.push('update');
    if (!actions.includes('cancel')) actions.push('cancel');
  }

  return actions;
};

// ===== MIDDLEWARE TO ATTACH ALLOWED ACTIONS TO RESPONSE =====
exports.attachAllowedActions = (resourceType) => {
  return async (req, res, next) => {
    const user = req.user || req.admin;

    if (!user || !req.resource) {
      return next();
    }

    try {
      const actions = await exports.getAllowedActions(user, req.resource);
      req.resource.allowedActions = actions;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// ===== CHECK IF USER HAS ROLE IN DEPARTMENT =====
exports.hasDepartmentRole = (department, role) => {
  return (req, res, next) => {
    const user = req.admin;

    if (!user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (user.department !== department && user.role !== 'super_admin') {
      return next(new AppError(`This action requires ${department} department`, 403));
    }

    if (role && user.role !== role && user.role !== 'super_admin') {
      return next(new AppError(`This action requires ${role} role`, 403));
    }

    next();
  };
};

// ===== CHECK IF USER HAS VALID SUBSCRIPTION =====
exports.hasValidSubscription = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new AppError('Not authenticated', 401));
  }

  // Check if user has active subscription
  if (user.subscription && user.subscription.status === 'active') {
    return next();
  }

  // Check if user has paid for service
  if (req.booking && req.booking.payment && req.booking.payment.status === 'completed') {
    return next();
  }

  return next(new AppError('Active subscription required for this action', 403));
};

// ===== CHECK IF USER IS WITHIN SERVICE AREA =====
exports.isWithinServiceArea = (req, res, next) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return next(new AppError('Location coordinates required', 400));
  }

  // Define service areas (simplified example)
  const serviceAreas = [
    { name: 'Roysambu (next to TRM)', center: { lat: 34.0736, lng: -118.4004 }, radius: 20 },
    { name: 'Miami', center: { lat: 25.7617, lng: -80.1918 }, radius: 30 },
    { name: 'Upper Hill', center: { lat: 40.7831, lng: -73.9712 }, radius: 15 }
  ];

  const isWithinAnyArea = serviceAreas.some(area => {
    const distance = calculateDistance(lat, lng, area.center.lat, area.center.lng);
    return distance <= area.radius;
  });

  if (!isWithinAnyArea) {
    return next(new AppError('Location outside service area', 400));
  }

  next();
};

// ===== HELPER FUNCTIONS =====
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// ===== EXPORT PERMISSIONS FOR USE ELSEWHERE =====
exports.ROLE_HIERARCHY = ROLE_HIERARCHY;
exports.PERMISSIONS = PERMISSIONS;