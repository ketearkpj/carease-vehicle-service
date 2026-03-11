// ===== src/Config/permissions.js =====
/**
 * PERMISSIONS CONFIGURATION - GOD MODE
 * Centralized permission management for the entire application
 */

import { USER_ROLES, PERMISSIONS as PERMISSIONS_CONST } from '../Utils/constants';

// Re-export for convenience
export { USER_ROLES } from '../Utils/constants';

// ===== PERMISSION HIERARCHY =====
export const ROLE_HIERARCHY = {
  [USER_ROLES.SUPER_ADMIN]: 100,
  [USER_ROLES.ADMIN]: 80,
  [USER_ROLES.PROVIDER]: 50,
  [USER_ROLES.CUSTOMER]: 10
};

// ===== PERMISSION CHECK FUNCTIONS =====

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with role
 * @param {string} permission - Permission to check
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  
  const userPermissions = PERMISSIONS_CONST[user.role] || [];
  return userPermissions.includes(permission);
};

/**
 * Check if user has any of the given permissions
 * @param {Object} user - User object with role
 * @param {Array} permissions - List of permissions to check
 * @returns {boolean} - True if user has any permission
 */
export const hasAnyPermission = (user, permissions) => {
  if (!user || !user.role) return false;
  
  const userPermissions = PERMISSIONS_CONST[user.role] || [];
  return permissions.some(permission => userPermissions.includes(permission));
};

/**
 * Check if user has all of the given permissions
 * @param {Object} user - User object with role
 * @param {Array} permissions - List of permissions to check
 * @returns {boolean} - True if user has all permissions
 */
export const hasAllPermissions = (user, permissions) => {
  if (!user || !user.role) return false;
  
  const userPermissions = PERMISSIONS_CONST[user.role] || [];
  return permissions.every(permission => userPermissions.includes(permission));
};

/**
 * Check if user role meets minimum required level
 * @param {Object} user - User object with role
 * @param {string} requiredRole - Minimum required role
 * @returns {boolean} - True if user role meets requirement
 */
export const hasRoleLevel = (user, requiredRole) => {
  if (!user || !user.role) return false;
  
  const userLevel = ROLE_HIERARCHY[user.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};

/**
 * Get all permissions for a user role
 * @param {string} role - User role
 * @returns {Array} - List of permissions
 */
export const getPermissionsByRole = (role) => {
  return PERMISSIONS_CONST[role] || [];
};

// ===== ROUTE PROTECTION CONFIG =====
export const PROTECTED_ROUTES = {
  // Admin only routes
  '/admin': [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  '/admin/bookings': [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  '/admin/payments': [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  '/admin/vehicles': [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  '/admin/reports': [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  '/admin/users': [USER_ROLES.SUPER_ADMIN],
  '/admin/settings': [USER_ROLES.SUPER_ADMIN],
  
  // Provider routes
  '/provider': [USER_ROLES.PROVIDER],
  '/provider/bookings': [USER_ROLES.PROVIDER],
  '/provider/earnings': [USER_ROLES.PROVIDER],
  
  // Customer routes
  '/profile': [USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  '/bookings': [USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]
};

// ===== FEATURE ACCESS CONTROL =====
export const FEATURE_ACCESS = {
  // Booking features
  createBooking: [USER_ROLES.CUSTOMER],
  viewBookings: [USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  cancelBooking: [USER_ROLES.CUSTOMER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  modifyBooking: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  
  // Payment features
  makePayment: [USER_ROLES.CUSTOMER],
  viewPayments: [USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  refundPayment: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  
  // Vehicle features
  viewVehicles: [USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  manageVehicles: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PROVIDER],
  
  // Report features
  viewReports: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  generateReports: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  
  // User management
  viewUsers: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  manageUsers: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  manageAdmins: [USER_ROLES.SUPER_ADMIN]
};

// ===== HELPER FUNCTIONS =====

/**
 * Check if user can access a route
 * @param {string} path - Route path
 * @param {Object} user - User object with role
 * @returns {boolean} - True if user can access route
 */
export const canAccessRoute = (path, user) => {
  // Public routes (not in PROTECTED_ROUTES) are accessible to all
  if (!PROTECTED_ROUTES[path]) return true;
  
  // Check if user has required role
  const allowedRoles = PROTECTED_ROUTES[path];
  return user && user.role && allowedRoles.includes(user.role);
};

/**
 * Check if user can access a feature
 * @param {string} feature - Feature name
 * @param {Object} user - User object with role
 * @returns {boolean} - True if user can access feature
 */
export const canAccessFeature = (feature, user) => {
  if (!FEATURE_ACCESS[feature]) return false;
  
  const allowedRoles = FEATURE_ACCESS[feature];
  return user && user.role && allowedRoles.includes(user.role);
};

/**
 * Get dashboard URL based on user role
 * @param {Object} user - User object with role
 * @returns {string} - Dashboard URL
 */
export const getDashboardUrl = (user) => {
  if (!user || !user.role) return '/';
  
  switch (user.role) {
    case USER_ROLES.SUPER_ADMIN:
    case USER_ROLES.ADMIN:
      return '/admin';
    case USER_ROLES.PROVIDER:
      return '/provider';
    default:
      return '/';
  }
};

/**
 * Get allowed actions for user based on booking ownership
 * @param {Object} user - User object with role
 * @param {Object} booking - Booking object with userId
 * @returns {Object} - Allowed actions
 */
export const getAllowedBookingActions = (user, booking) => {
  const isOwner = user && booking && user.id === booking.userId;
  const isAdmin = user && [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role);
  const isProvider = user && user.role === USER_ROLES.PROVIDER;
  
  return {
    canView: isOwner || isAdmin || isProvider,
    canEdit: isAdmin || isProvider,
    canCancel: isOwner || isAdmin,
    canRefund: isAdmin,
    canUpdateStatus: isAdmin || isProvider,
    canContactCustomer: isAdmin || isProvider
  };
};

// ===== EXPORT ALL =====
export default {
  USER_ROLES,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRoleLevel,
  getPermissionsByRole,
  canAccessRoute,
  canAccessFeature,
  getDashboardUrl,
  getAllowedBookingActions,
  PROTECTED_ROUTES,
  FEATURE_ACCESS
};