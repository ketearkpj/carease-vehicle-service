// ===== src/routes/serviceRoutes.js =====
const express = require('express');
const router = express.Router();
const serviceController = require('../Controllers/ServiceController');
const authMiddleware = require('../Middleware/Auth.md.js');
const adminMiddleware = require('../Middleware/Admin.md.js');
const validationMiddleware = require('../Middleware/Validation.md.js');
const { validateService } = require('../Utils/Validators');

// ===== PUBLIC ROUTES =====
router.get(
  '/featured',
  serviceController.getFeaturedServices
);

router.get(
  '/type/:type',
  validationMiddleware.validate(validateService.getByType, 'params'),
  serviceController.getServicesByType
);

router.get(
  '/',
  serviceController.getAllServices
);

router.get(
  '/:id',
  validationMiddleware.validate(validateService.getService, 'params'),
  serviceController.getService
);

router.get(
  '/:id/availability',
  validationMiddleware.validate(validateService.getAvailability, 'query'),
  serviceController.getAvailability
);

router.post(
  '/:id/calculate-price',
  validationMiddleware.validate(validateService.calculatePrice),
  serviceController.calculatePrice
);

router.get(
  '/:id/reviews',
  validationMiddleware.validate(validateService.getReviews, 'query'),
  serviceController.getServiceReviews
);

// ===== PROTECTED ROUTES =====
router.use(authMiddleware.protect);

router.post(
  '/:id/reviews',
  validationMiddleware.validate(validateService.addReview),
  serviceController.addServiceReview
);

// ===== ADMIN ROUTES =====
router.use(authMiddleware.restrictTo('admin', 'super_admin'));

router.post(
  '/',
  validationMiddleware.validate(validateService.createService),
  serviceController.createService
);

router.patch(
  '/:id',
  validationMiddleware.validate(validateService.updateService),
  serviceController.updateService
);

router.delete(
  '/:id',
  validationMiddleware.validate(validateService.deleteService, 'params'),
  serviceController.deleteService
);

router.get(
  '/stats/overview',
  serviceController.getServiceStatistics
);

module.exports = router;