// ===== src/validations/admin.validation.js =====
const Joi = require('joi');

/**
 * Admin validation schemas
 * Validates all admin-related requests
 */
const adminValidation = {
  // ===== ADMIN AUTH =====
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  // ===== ADMIN MANAGEMENT =====
  createAdmin: Joi.object({
    firstName: Joi.string().min(2).max(50).required().pattern(/^[a-zA-Z\s\-']+$/).messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().min(2).max(50).required().pattern(/^[a-zA-Z\s\-']+$/).messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'Last name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
    role: Joi.string().valid('admin', 'super_admin', 'manager', 'support', 'finance').required().messages({
      'any.only': 'Role must be one of: admin, super_admin, manager, support, finance',
      'any.required': 'Role is required'
    }),
    permissions: Joi.array().items(Joi.string()).default([]),
    department: Joi.string().valid('management', 'operations', 'finance', 'support', 'sales', 'technical'),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
      'string.pattern.base': 'Please provide a valid phone number with country code',
      'any.required': 'Phone number is required'
    }),
    position: Joi.string().max(100),
    profileImage: Joi.string().uri().allow(''),
    assignedLocations: Joi.array().items(Joi.string()),
    employment: Joi.object({
      startDate: Joi.date(),
      contractType: Joi.string().valid('full-time', 'part-time', 'contract', 'intern'),
      salary: Joi.object({
        amount: Joi.number().positive(),
        currency: Joi.string().default('USD'),
        frequency: Joi.string().valid('hourly', 'monthly', 'annual')
      })
    })
  }),

  updateAdmin: Joi.object({
    firstName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s\-']+$/),
    lastName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s\-']+$/),
    role: Joi.string().valid('admin', 'super_admin', 'manager', 'support', 'finance'),
    permissions: Joi.array().items(Joi.string()),
    department: Joi.string().valid('management', 'operations', 'finance', 'support', 'sales', 'technical'),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    position: Joi.string().max(100),
    profileImage: Joi.string().uri().allow(''),
    assignedLocations: Joi.array().items(Joi.string()),
    employment: Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date(),
      status: Joi.string().valid('active', 'inactive', 'suspended', 'terminated'),
      contractType: Joi.string().valid('full-time', 'part-time', 'contract', 'intern'),
      salary: Joi.object({
        amount: Joi.number().positive(),
        currency: Joi.string(),
        frequency: Joi.string().valid('hourly', 'monthly', 'annual')
      })
    }),
    isActive: Joi.boolean()
  }),

  getAdmin: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),

  deleteAdmin: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),

  // ===== USER MANAGEMENT =====
  getUser: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),

  updateUser: Joi.object({
    firstName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s\-']+$/),
    lastName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s\-']+$/),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    role: Joi.string().valid('customer', 'provider', 'admin'),
    isActive: Joi.boolean(),
    isEmailVerified: Joi.boolean(),
    isPhoneVerified: Joi.boolean(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
      country: Joi.string()
    })
  }),

  toggleUserStatus: Joi.object({
    id: Joi.string().hex().length(24).required(),
    isActive: Joi.boolean().required(),
    reason: Joi.string().max(200)
  }),

  // ===== BOOKING MANAGEMENT =====
  getBooking: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),

  updateBookingStatus: Joi.object({
    id: Joi.string().hex().length(24).required(),
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'in_progress', 'completed', 'cancelled', 'refunded').required(),
    note: Joi.string().max(200)
  }),

  // ===== PAYMENT MANAGEMENT =====
  getPayment: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),

  processRefund: Joi.object({
    id: Joi.string().hex().length(24).required(),
    amount: Joi.number().positive(),
    reason: Joi.string().max(200).required()
  }),

  // ===== REPORTS =====
  getRevenueReport: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    groupBy: Joi.string().valid('hour', 'day', 'week', 'month', 'year').default('day')
  }),

  getBookingReport: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    groupBy: Joi.string().valid('day', 'week', 'month').default('day')
  }),

  // ===== AUDIT LOGS =====
  getAuditLogs: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    startDate: Joi.date(),
    endDate: Joi.date(),
    adminId: Joi.string().hex().length(24),
    action: Joi.string(),
    entityType: Joi.string(),
    severity: Joi.string().valid('info', 'warning', 'error', 'critical')
  }),

  getAuditSummary: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    interval: Joi.string().valid('hour', 'day', 'week', 'month').default('day')
  }),

  // ===== SETTINGS =====
  updateSetting: Joi.object({
    key: Joi.string().required(),
    value: Joi.any().required(),
    reason: Joi.string().max(200)
  }),

  resetSetting: Joi.object({
    key: Joi.string().required()
  }),

  // ===== NOTIFICATIONS =====
  sendNotification: Joi.object({
    recipients: Joi.alternatives().try(
      Joi.string().valid('all'),
      Joi.object({
        role: Joi.string().valid('customer', 'provider', 'admin'),
        userIds: Joi.array().items(Joi.string().hex().length(24))
      })
    ).required(),
    type: Joi.string().required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
    data: Joi.object(),
    channels: Joi.array().items(Joi.string().valid('email', 'sms', 'push', 'in_app')).default(['email', 'in_app'])
  }),

  getNotifications: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    type: Joi.string(),
    status: Joi.string().valid('pending', 'sent', 'delivered', 'read', 'failed')
  }),

  // ===== EXPORT =====
  exportData: Joi.object({
    type: Joi.string().valid('users', 'bookings', 'payments', 'vehicles').required(),
    format: Joi.string().valid('csv', 'excel', 'pdf').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    filters: Joi.object()
  })
};

module.exports = adminValidation;