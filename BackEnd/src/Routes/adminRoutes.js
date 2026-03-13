// ===== src/routes/adminRoutes.js =====
const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/AdminController');
const authMiddleware = require('../Middleware/Auth.md.js');
const adminMiddleware = require('../Middleware/Admin.md.js');
const validationMiddleware = require('../Middleware/Validation.md.js');
const { validateAdmin } = require('../Utils/Validators');

// ===== PUBLIC ROUTES =====
router.post(
  '/login',
  validationMiddleware.validate(validateAdmin.login),
  adminController.login
);

router.post(
  '/logout',
  authMiddleware.protectAdmin,
  adminController.logout
);

// Demo-safe notifications feed (no auth) for local/testing environments.
router.get(
  '/notifications-feed',
  adminController.getNotifications
);

// ===== PROTECTED ROUTES (ALL ADMIN ROUTES REQUIRE AUTH) =====
router.use(authMiddleware.protectAdmin);

// ===== ADMIN MANAGEMENT =====
router.get(
  '/profile',
  adminController.getProfile
);

router.patch(
  '/profile',
  validationMiddleware.validate(validateAdmin.updateProfile),
  adminController.updateProfile
);

router.post(
  '/change-password',
  validationMiddleware.validate(validateAdmin.changePassword),
  adminController.changePassword
);

// ===== SUPER ADMIN ONLY ROUTES =====
router.use(authMiddleware.restrictTo('super_admin'));

router.get(
  '/admins',
  adminController.getAllAdmins
);

router.post(
  '/admins',
  validationMiddleware.validate(validateAdmin.createAdmin),
  adminController.createAdmin
);

router.get(
  '/admins/:id',
  validationMiddleware.validate(validateAdmin.getAdmin, 'params'),
  adminController.getAdmin
);

router.patch(
  '/admins/:id',
  validationMiddleware.validate(validateAdmin.updateAdmin),
  adminController.updateAdmin
);

router.delete(
  '/admins/:id',
  validationMiddleware.validate(validateAdmin.deleteAdmin, 'params'),
  adminController.deleteAdmin
);

// ===== DASHBOARD =====
router.get(
  '/dashboard',
  adminController.getDashboardStats
);

// ===== USER MANAGEMENT =====
router.get(
  '/users',
  adminController.getAllUsers
);

router.get(
  '/users/:id',
  validationMiddleware.validate(validateAdmin.getUser, 'params'),
  adminController.getUser
);

router.patch(
  '/users/:id',
  validationMiddleware.validate(validateAdmin.updateUser),
  adminController.updateUser
);

router.patch(
  '/users/:id/status',
  validationMiddleware.validate(validateAdmin.toggleUserStatus),
  adminController.toggleUserStatus
);

// ===== BOOKING MANAGEMENT =====
router.get(
  '/bookings',
  adminController.getAllBookings
);

router.get(
  '/bookings/:id',
  validationMiddleware.validate(validateAdmin.getBooking, 'params'),
  adminController.getBooking
);

router.patch(
  '/bookings/:id/status',
  validationMiddleware.validate(validateAdmin.updateBookingStatus),
  adminController.updateBookingStatus
);

// ===== PAYMENT MANAGEMENT =====
router.get(
  '/payments',
  adminController.getAllPayments
);

router.get(
  '/payments/:id',
  validationMiddleware.validate(validateAdmin.getPayment, 'params'),
  adminController.getPayment
);

router.post(
  '/payments/:id/refund',
  validationMiddleware.validate(validateAdmin.processRefund),
  adminController.processRefund
);

// ===== REPORTS =====
router.get(
  '/reports/revenue',
  validationMiddleware.validate(validateAdmin.getRevenueReport, 'query'),
  adminController.getRevenueReport
);

router.get(
  '/reports/bookings',
  validationMiddleware.validate(validateAdmin.getBookingReport, 'query'),
  adminController.getBookingReport
);

// ===== AUDIT LOGS =====
router.get(
  '/audit-logs',
  validationMiddleware.validate(validateAdmin.getAuditLogs, 'query'),
  adminController.getAuditLogs
);

router.get(
  '/audit-logs/summary',
  validationMiddleware.validate(validateAdmin.getAuditSummary, 'query'),
  adminController.getAuditSummary
);

// ===== SYSTEM SETTINGS =====
router.get(
  '/settings',
  adminController.getSettings
);

router.patch(
  '/settings/:key',
  validationMiddleware.validate(validateAdmin.updateSetting),
  adminController.updateSetting
);

router.post(
  '/settings/:key/reset',
  validationMiddleware.validate(validateAdmin.resetSetting, 'params'),
  adminController.resetSetting
);

// ===== NOTIFICATIONS =====
router.post(
  '/notifications/send',
  validationMiddleware.validate(validateAdmin.sendNotification),
  adminController.sendNotification
);

router.get(
  '/notifications',
  validationMiddleware.validate(validateAdmin.getNotifications, 'query'),
  adminController.getNotifications
);

// ===== EXPORT DATA =====
router.get(
  '/export/:type',
  validationMiddleware.validate(validateAdmin.exportData, 'params'),
  adminController.exportData
);

module.exports = router;
