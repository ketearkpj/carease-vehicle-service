// ===== src/routes/reportRoutes.js =====
const express = require('express');
const router = express.Router();
const reportController = require('../Controllers/ReportController');
const authMiddleware = require('../Middleware/Auth.md.js');
const adminMiddleware = require('../Middleware/Admin.md.js');
const validationMiddleware = require('../Middleware/Validation.md.js');
const { validateReport } = require('../Utils/Validators');

// ===== ALL ROUTES REQUIRE ADMIN AUTH =====
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin', 'super_admin'));

// ===== REPORT ROUTES =====
router.get(
  '/dashboard',
  reportController.getDashboardSummary
);

router.get(
  '/revenue',
  validationMiddleware.validate(validateReport.getRevenueReport, 'query'),
  reportController.getRevenueReport
);

router.get(
  '/bookings',
  validationMiddleware.validate(validateReport.getBookingsReport, 'query'),
  reportController.getBookingsReport
);

router.get(
  '/users',
  validationMiddleware.validate(validateReport.getUsersReport, 'query'),
  reportController.getUsersReport
);

router.get(
  '/vehicles',
  validationMiddleware.validate(validateReport.getVehiclesReport, 'query'),
  reportController.getVehiclesReport
);

router.get(
  '/deliveries',
  validationMiddleware.validate(validateReport.getDeliveriesReport, 'query'),
  reportController.getDeliveriesReport
);

// ===== EXPORT ROUTES =====
router.get(
  '/export',
  validationMiddleware.validate(validateReport.exportReport, 'query'),
  reportController.exportReport
);

module.exports = router;