// ===== src/routes/deliveryRoutes.js =====
const express = require('express');
const router = express.Router();
const deliveryController = require('../Controllers/DeliveryController');
const authMiddleware = require('../Middleware/Auth.md.js');
const adminMiddleware = require('../Middleware/Admin.md.js');
const validationMiddleware = require('../Middleware/Validation.md.js');
const { validateDelivery } = require('../Utils/Validators');

// ===== PROTECTED ROUTES =====
router.use(authMiddleware.protect);

router.post(
  '/',
  validationMiddleware.validate(validateDelivery.createDelivery),
  deliveryController.createDelivery
);

router.get(
  '/my-deliveries',
  deliveryController.getUserDeliveries
);

router.get(
  '/:id',
  validationMiddleware.validate(validateDelivery.getDelivery, 'params'),
  deliveryController.getDelivery
);

router.patch(
  '/:id/status',
  validationMiddleware.validate(validateDelivery.updateStatus),
  deliveryController.updateDeliveryStatus
);

router.post(
  '/:id/location',
  validationMiddleware.validate(validateDelivery.updateLocation),
  deliveryController.updateDriverLocation
);

router.post(
  '/:id/cancel',
  validationMiddleware.validate(validateDelivery.cancelDelivery),
  deliveryController.cancelDelivery
);

router.post(
  '/:id/rate',
  validationMiddleware.validate(validateDelivery.rateDelivery),
  deliveryController.rateDelivery
);

// ===== ADMIN/DRIVER ROUTES =====
router.use(authMiddleware.restrictTo('admin', 'super_admin', 'driver'));

router.get(
  '/driver/:driverId',
  validationMiddleware.validate(validateDelivery.getByDriver, 'params'),
  deliveryController.getDeliveriesByDriver
);

router.patch(
  '/:id/assign',
  validationMiddleware.validate(validateDelivery.assignDriver),
  deliveryController.assignDriver
);

// ===== ADMIN ONLY ROUTES =====
router.use(authMiddleware.restrictTo('admin', 'super_admin'));

router.get(
  '/',
  deliveryController.getAllDeliveries
);

router.get(
  '/active/ongoing',
  deliveryController.getActiveDeliveries
);

router.get(
  '/stats/overview',
  deliveryController.getDeliveryStatistics
);

module.exports = router;