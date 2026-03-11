// ===== src/routes/locationRoutes.js =====
const express = require('express');
const router = express.Router();
const locationController = require('../Controllers/LocationController');
const authMiddleware = require('../Middleware/Auth.md.js');
const adminMiddleware = require('../Middleware/Admin.md.js');
const validationMiddleware = require('../Middleware/Validation.md.js');
const { validateLocation } = require('../Utils/Validators');

// ===== PUBLIC ROUTES =====
router.get(
  '/nearby',
  validationMiddleware.validate(validateLocation.getNearby, 'query'),
  locationController.getNearbyLocations
);

router.get(
  '/',
  locationController.getAllLocations
);

router.get(
  '/:id',
  validationMiddleware.validate(validateLocation.getLocation, 'params'),
  locationController.getLocation
);

router.get(
  '/:id/vehicles',
  validationMiddleware.validate(validateLocation.getLocationVehicles, 'params'),
  locationController.getLocationVehicles
);

router.get(
  '/:id/availability',
  validationMiddleware.validate(validateLocation.getAvailability, 'query'),
  locationController.checkAvailability
);

// ===== PROTECTED ROUTES =====
router.use(authMiddleware.protect);

router.get(
  '/:id/directions',
  validationMiddleware.validate(validateLocation.getDirections, 'query'),
  locationController.getDirections
);

router.post(
  '/geocode',
  validationMiddleware.validate(validateLocation.geocode),
  locationController.geocode
);

router.post(
  '/reverse-geocode',
  validationMiddleware.validate(validateLocation.reverseGeocode),
  locationController.reverseGeocode
);

// ===== ADMIN ROUTES =====
router.use(authMiddleware.restrictTo('admin', 'super_admin'));

router.post(
  '/',
  validationMiddleware.validate(validateLocation.createLocation),
  locationController.createLocation
);

router.patch(
  '/:id',
  validationMiddleware.validate(validateLocation.updateLocation),
  locationController.updateLocation
);

router.delete(
  '/:id',
  validationMiddleware.validate(validateLocation.deleteLocation, 'params'),
  locationController.deleteLocation
);

router.post(
  '/:id/hours',
  validationMiddleware.validate(validateLocation.updateHours),
  locationController.updateBusinessHours
);

router.post(
  '/:id/services',
  validationMiddleware.validate(validateLocation.updateServices),
  locationController.updateServices
);

module.exports = router;