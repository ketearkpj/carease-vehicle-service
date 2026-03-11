// ===== src/Validations/admin.validation.js =====
/**
 * ADMIN VALIDATION - GOD MODE
 * Comprehensive validation for admin operations
 */

import { validateEmail, validateName, validatePhone, validatePassword } from '../Utils/validation';

// ===== ADMIN LOGIN VALIDATION =====
export const validateAdminLogin = (data) => {
  const errors = {};

  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== ADMIN PROFILE VALIDATION =====
export const validateAdminProfile = (data) => {
  const errors = {};

  // Name validation
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (!validateName(data.name)) {
    errors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
  } else if (data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (data.name.length > 50) {
    errors.name = 'Name cannot exceed 50 characters';
  }

  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation (optional)
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // Role validation
  if (!data.role) {
    errors.role = 'Role is required';
  } else if (!['admin', 'super_admin', 'manager'].includes(data.role)) {
    errors.role = 'Invalid role selected';
  }

  // Status validation
  if (data.status !== undefined && !['active', 'inactive', 'suspended'].includes(data.status)) {
    errors.status = 'Invalid status';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== ADMIN PASSWORD CHANGE VALIDATION =====
export const validateAdminPasswordChange = (data) => {
  const errors = {};

  // Current password validation
  if (!data.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }

  // New password validation
  if (!data.newPassword) {
    errors.newPassword = 'New password is required';
  } else {
    const passwordValidation = validatePassword(data.newPassword, {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecial: true
    });

    if (!passwordValidation.valid) {
      errors.newPassword = passwordValidation.message;
    }
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password';
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Prevent password reuse
  if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== ADMIN USER MANAGEMENT VALIDATION =====
export const validateUserManagement = (data) => {
  const errors = {};

  // User ID validation
  if (!data.userId) {
    errors.userId = 'User ID is required';
  }

  // Action validation
  if (!data.action) {
    errors.action = 'Action is required';
  } else if (!['activate', 'deactivate', 'suspend', 'delete', 'update_role'].includes(data.action)) {
    errors.action = 'Invalid action';
  }

  // Reason validation (required for certain actions)
  if (['suspend', 'delete'].includes(data.action) && !data.reason) {
    errors.reason = 'Reason is required for this action';
  }

  // Role validation (for update_role action)
  if (data.action === 'update_role' && !data.newRole) {
    errors.newRole = 'New role is required';
  } else if (data.action === 'update_role' && !['customer', 'provider', 'admin'].includes(data.newRole)) {
    errors.newRole = 'Invalid role';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== ADMIN SERVICE MANAGEMENT VALIDATION =====
export const validateServiceManagement = (data) => {
  const errors = {};

  // Service name validation
  if (!data.name) {
    errors.name = 'Service name is required';
  } else if (data.name.length < 3) {
    errors.name = 'Service name must be at least 3 characters';
  } else if (data.name.length > 100) {
    errors.name = 'Service name cannot exceed 100 characters';
  }

  // Service type validation
  if (!data.type) {
    errors.type = 'Service type is required';
  } else if (!['rental', 'car_wash', 'repair', 'sales'].includes(data.type)) {
    errors.type = 'Invalid service type';
  }

  // Description validation
  if (!data.description) {
    errors.description = 'Description is required';
  } else if (data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (data.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  // Price validation
  if (data.price !== undefined) {
    if (isNaN(data.price) || data.price < 0) {
      errors.price = 'Price must be a valid positive number';
    }
  }

  // Duration validation
  if (data.duration && (isNaN(data.duration) || data.duration < 1)) {
    errors.duration = 'Duration must be at least 1 minute';
  }

  // Status validation
  if (data.status && !['active', 'inactive', 'maintenance'].includes(data.status)) {
    errors.status = 'Invalid status';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== ADMIN VEHICLE MANAGEMENT VALIDATION =====
export const validateVehicleManagement = (data) => {
  const errors = {};

  // Vehicle name validation
  if (!data.name) {
    errors.name = 'Vehicle name is required';
  } else if (data.name.length < 2) {
    errors.name = 'Vehicle name must be at least 2 characters';
  }

  // Make validation
  if (!data.make) {
    errors.make = 'Make is required';
  }

  // Model validation
  if (!data.model) {
    errors.model = 'Model is required';
  }

  // Year validation
  if (!data.year) {
    errors.year = 'Year is required';
  } else {
    const year = parseInt(data.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      errors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }
  }

  // Category validation
  if (!data.category) {
    errors.category = 'Category is required';
  }

  // Price validation
  if (!data.price) {
    errors.price = 'Price is required';
  } else if (isNaN(data.price) || data.price < 0) {
    errors.price = 'Price must be a valid positive number';
  }

  // License plate validation
  if (data.licensePlate && data.licensePlate.length < 2) {
    errors.licensePlate = 'License plate must be at least 2 characters';
  }

  // VIN validation
  if (data.vin && data.vin.length !== 17) {
    errors.vin = 'VIN must be exactly 17 characters';
  }

  // Mileage validation
  if (data.mileage !== undefined && (isNaN(data.mileage) || data.mileage < 0)) {
    errors.mileage = 'Mileage must be a valid positive number';
  }

  // Status validation
  if (data.status && !['available', 'rented', 'maintenance', 'unavailable'].includes(data.status)) {
    errors.status = 'Invalid status';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== ADMIN REPORT FILTERS VALIDATION =====
export const validateReportFilters = (data) => {
  const errors = {};

  // Date range validation
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (isNaN(start.getTime())) {
      errors.startDate = 'Invalid start date';
    }
    if (isNaN(end.getTime())) {
      errors.endDate = 'Invalid end date';
    }
    if (start > end) {
      errors.dateRange = 'Start date must be before end date';
    }
  }

  // Report type validation
  if (data.reportType && !['revenue', 'bookings', 'users', 'vehicles', 'payments'].includes(data.reportType)) {
    errors.reportType = 'Invalid report type';
  }

  // Format validation
  if (data.format && !['pdf', 'csv', 'excel', 'json'].includes(data.format)) {
    errors.format = 'Invalid export format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== ADMIN SYSTEM SETTINGS VALIDATION =====
export const validateSystemSettings = (data) => {
  const errors = {};

  // Tax rate validation
  if (data.taxRate !== undefined) {
    const taxRate = parseFloat(data.taxRate);
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
      errors.taxRate = 'Tax rate must be between 0 and 100';
    }
  }

  // Deposit rate validation
  if (data.depositRate !== undefined) {
    const depositRate = parseFloat(data.depositRate);
    if (isNaN(depositRate) || depositRate < 0 || depositRate > 100) {
      errors.depositRate = 'Deposit rate must be between 0 and 100';
    }
  }

  // Late fee validation
  if (data.lateFee !== undefined) {
    const lateFee = parseFloat(data.lateFee);
    if (isNaN(lateFee) || lateFee < 0) {
      errors.lateFee = 'Late fee must be a valid positive number';
    }
  }

  // Booking limits validation
  if (data.minBookingDays !== undefined) {
    const minDays = parseInt(data.minBookingDays);
    if (isNaN(minDays) || minDays < 1) {
      errors.minBookingDays = 'Minimum booking days must be at least 1';
    }
  }

  if (data.maxBookingDays !== undefined) {
    const maxDays = parseInt(data.maxBookingDays);
    if (isNaN(maxDays) || maxDays < 1) {
      errors.maxBookingDays = 'Maximum booking days must be at least 1';
    }
  }

  if (data.minBookingDays && data.maxBookingDays && data.minBookingDays > data.maxBookingDays) {
    errors.bookingDays = 'Minimum days cannot exceed maximum days';
  }

  // Working hours validation
  if (data.workingHours) {
    const { start, end } = data.workingHours;
    if (start !== undefined && (start < 0 || start > 23)) {
      errors.workingHoursStart = 'Start hour must be between 0 and 23';
    }
    if (end !== undefined && (end < 0 || end > 23)) {
      errors.workingHoursEnd = 'End hour must be between 0 and 23';
    }
    if (start && end && start >= end) {
      errors.workingHours = 'Start hour must be before end hour';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== ADMIN PERMISSION VALIDATION =====
export const validatePermissionAssignment = (data) => {
  const errors = {};

  // Role validation
  if (!data.role) {
    errors.role = 'Role is required';
  } else if (!['admin', 'super_admin', 'manager', 'provider'].includes(data.role)) {
    errors.role = 'Invalid role';
  }

  // Permissions validation
  if (!data.permissions || !Array.isArray(data.permissions)) {
    errors.permissions = 'Permissions must be an array';
  } else if (data.permissions.length === 0) {
    errors.permissions = 'At least one permission is required';
  }

  // Validate each permission
  const validPermissions = [
    'view_users', 'manage_users',
    'view_bookings', 'manage_bookings',
    'view_payments', 'manage_payments',
    'view_vehicles', 'manage_vehicles',
    'view_reports', 'generate_reports',
    'manage_settings', 'manage_roles'
  ];

  data.permissions?.forEach(permission => {
    if (!validPermissions.includes(permission)) {
      errors.permissions = `Invalid permission: ${permission}`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== ADMIN AUDIT LOG FILTERS VALIDATION =====
export const validateAuditLogFilters = (data) => {
  const errors = {};

  // Date range validation
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (isNaN(start.getTime())) {
      errors.startDate = 'Invalid start date';
    }
    if (isNaN(end.getTime())) {
      errors.endDate = 'Invalid end date';
    }
    if (start > end) {
      errors.dateRange = 'Start date must be before end date';
    }
  }

  // Action type validation
  if (data.action && !['create', 'update', 'delete', 'login', 'logout', 'export'].includes(data.action)) {
    errors.action = 'Invalid action type';
  }

  // User ID validation (optional but must be valid if provided)
  if (data.userId && typeof data.userId !== 'string') {
    errors.userId = 'Invalid user ID';
  }

  // Limit validation
  if (data.limit !== undefined) {
    const limit = parseInt(data.limit);
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      errors.limit = 'Limit must be between 1 and 1000';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== EXPORT ALL =====
export default {
  validateAdminLogin,
  validateAdminProfile,
  validateAdminPasswordChange,
  validateUserManagement,
  validateServiceManagement,
  validateVehicleManagement,
  validateReportFilters,
  validateSystemSettings,
  validatePermissionAssignment,
  validateAuditLogFilters
};