// ===== src/routes/vehicleRoutes.js =====
const express = require('express');
const router = express.Router();
const vehicleController = require('../Controllers/VehicleController');
const authMiddleware = require('../Middleware/Auth.md.js');
const adminMiddleware = require('../Middleware/Admin.md.js');
const uploadMiddleware = require('../Middleware/Upload.md.js');
const validationMiddleware = require('../Middleware/Validation.md.js');
const { validateVehicle } = require('../Utils/Validators');

// ===== PUBLIC ROUTES =====
router.get(
  '/featured',
  vehicleController.getFeaturedVehicles
);

router.get(
  '/search',
  validationMiddleware.validate(validateVehicle.searchVehicles, 'query'),
  vehicleController.searchVehicles
);

router.get(
  '/',
  vehicleController.getAllVehicles
);

router.get(
  '/:id',
  validationMiddleware.validate(validateVehicle.getVehicle, 'params'),
  vehicleController.getVehicle
);

router.get(
  '/:id/availability',
  validationMiddleware.validate(validateVehicle.checkAvailability, 'query'),
  vehicleController.checkAvailability
);

router.get(
  '/:id/similar',
  validationMiddleware.validate(validateVehicle.getSimilar, 'params'),
  vehicleController.getSimilarVehicles
);

router.get(
  '/:id/reviews',
  validationMiddleware.validate(validateVehicle.getReviews, 'query'),
  vehicleController.getVehicleReviews
);

// ===== PROTECTED ROUTES =====
router.use(authMiddleware.protect);

router.post(
  '/:id/reviews',
  validationMiddleware.validate(validateVehicle.addReview),
  vehicleController.addVehicleReview
);

router.post(
  '/:id/favorite',
  validationMiddleware.validate(validateVehicle.toggleFavorite, 'params'),
  vehicleController.toggleFavorite
);

// ===== ADMIN ROUTES =====
router.use(authMiddleware.restrictTo('admin', 'super_admin'));

router.post(
  '/',
  uploadMiddleware.uploadMultiple,
  validationMiddleware.validate(validateVehicle.createVehicle),
  vehicleController.createVehicle
);

router.patch(
  '/:id',
  validationMiddleware.validate(validateVehicle.updateVehicle),
  vehicleController.updateVehicle
);

router.delete(
  '/:id',
  validationMiddleware.validate(validateVehicle.deleteVehicle, 'params'),
  vehicleController.deleteVehicle
);

router.post(
  '/:id/images',
  uploadMiddleware.uploadMultiple,
  validationMiddleware.validate(validateVehicle.uploadImages, 'params'),
  vehicleController.uploadImages
);

router.get(
  '/stats/overview',
  vehicleController.getVehicleStatistics
);

module.exports = router;