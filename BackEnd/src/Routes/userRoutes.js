// ===== src/routes/userRoutes.js =====
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UserController');
const authMiddleware = require('../Middleware/Auth.md.js');
const validationMiddleware = require('../Middleware/Validation.md.js');
const { validateUser } = require('../Utils/Validators');

// ===== ALL ROUTES REQUIRE AUTHENTICATION =====
router.use(authMiddleware.protect);

// ===== PROFILE ROUTES =====
router.get(
  '/profile',
  userController.getProfile
);

router.patch(
  '/profile',
  validationMiddleware.validate(validateUser.updateProfile),
  userController.updateProfile
);

router.post(
  '/profile/avatar',
  validationMiddleware.validate(validateUser.uploadAvatar),
  userController.uploadAvatar
);

router.delete(
  '/profile/avatar',
  userController.deleteAvatar
);

// ===== ADDRESS MANAGEMENT =====
router.get(
  '/addresses',
  userController.getAddresses
);

router.post(
  '/addresses',
  validationMiddleware.validate(validateUser.addAddress),
  userController.addAddress
);

router.patch(
  '/addresses/:addressId',
  validationMiddleware.validate(validateUser.updateAddress),
  userController.updateAddress
);

router.delete(
  '/addresses/:addressId',
  validationMiddleware.validate(validateUser.deleteAddress, 'params'),
  userController.deleteAddress
);

router.patch(
  '/addresses/:addressId/default',
  validationMiddleware.validate(validateUser.setDefaultAddress, 'params'),
  userController.setDefaultAddress
);

// ===== PAYMENT METHODS =====
router.get(
  '/payment-methods',
  userController.getPaymentMethods
);

router.post(
  '/payment-methods',
  validationMiddleware.validate(validateUser.addPaymentMethod),
  userController.addPaymentMethod
);

router.delete(
  '/payment-methods/:methodId',
  validationMiddleware.validate(validateUser.deletePaymentMethod, 'params'),
  userController.deletePaymentMethod
);

router.patch(
  '/payment-methods/:methodId/default',
  validationMiddleware.validate(validateUser.setDefaultPaymentMethod, 'params'),
  userController.setDefaultPaymentMethod
);

// ===== FAVORITES =====
router.get(
  '/favorites',
  userController.getFavorites
);

router.post(
  '/favorites/:vehicleId',
  validationMiddleware.validate(validateUser.toggleFavorite, 'params'),
  userController.toggleFavorite
);

router.delete(
  '/favorites/:vehicleId',
  validationMiddleware.validate(validateUser.toggleFavorite, 'params'),
  userController.toggleFavorite
);

// ===== NOTIFICATIONS =====
router.get(
  '/notifications',
  validationMiddleware.validate(validateUser.getNotifications, 'query'),
  userController.getNotifications
);

router.patch(
  '/notifications/:notificationId/read',
  validationMiddleware.validate(validateUser.markNotificationRead, 'params'),
  userController.markNotificationRead
);

router.patch(
  '/notifications/read-all',
  userController.markAllNotificationsRead
);

router.delete(
  '/notifications/:notificationId',
  validationMiddleware.validate(validateUser.deleteNotification, 'params'),
  userController.deleteNotification
);

// ===== PREFERENCES =====
router.get(
  '/preferences',
  userController.getPreferences
);

router.patch(
  '/preferences',
  validationMiddleware.validate(validateUser.updatePreferences),
  userController.updatePreferences
);

// ===== ACCOUNT MANAGEMENT =====
router.post(
  '/deactivate',
  validationMiddleware.validate(validateUser.deactivateAccount),
  userController.deactivateAccount
);

router.post(
  '/reactivate',
  validationMiddleware.validate(validateUser.reactivateAccount),
  userController.reactivateAccount
);

module.exports = router;