// ===== src/routes/authRoutes.js =====
const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthController');
const authMiddleware = require('../Middleware/Auth.md.js');
const validationMiddleware = require('../Middleware/Validation.md.js');
const { validateAuth } = require('../Utils/Validators');

// ===== PUBLIC ROUTES =====
router.post(
  '/register',
  validationMiddleware.validate(validateAuth.register),
  authController.register
);

router.post(
  '/login',
  validationMiddleware.validate(validateAuth.login),
  authController.login
);

router.post(
  '/forgot-password',
  validationMiddleware.validate(validateAuth.forgotPassword),
  authController.forgotPassword
);

router.patch(
  '/reset-password/:token',
  validationMiddleware.validate(validateAuth.resetPassword),
  authController.resetPassword
);

router.get(
  '/verify-email/:token',
  validationMiddleware.validate(validateAuth.verifyEmail, 'params'),
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  validationMiddleware.validate(validateAuth.resendVerification),
  authController.resendVerificationEmail
);

router.post(
  '/refresh-token',
  validationMiddleware.validate(validateAuth.refreshToken),
  authController.refreshToken
);

// ===== SOCIAL LOGIN =====
router.post(
  '/google',
  validationMiddleware.validate(validateAuth.socialLogin),
  authController.googleLogin
);

router.post(
  '/facebook',
  validationMiddleware.validate(validateAuth.socialLogin),
  authController.facebookLogin
);

router.post(
  '/apple',
  validationMiddleware.validate(validateAuth.socialLogin),
  authController.appleLogin
);

// ===== PROTECTED ROUTES =====
router.use(authMiddleware.protect);

router.post(
  '/logout',
  authController.logout
);

router.get(
  '/me',
  authController.getMe
);

router.patch(
  '/update-me',
  validationMiddleware.validate(validateAuth.updateMe),
  authController.updateMe
);

router.patch(
  '/change-password',
  validationMiddleware.validate(validateAuth.changePassword),
  authController.changePassword
);

router.delete(
  '/delete-account',
  validationMiddleware.validate(validateAuth.deleteAccount),
  authController.deleteAccount
);

// ===== 2FA ROUTES =====
router.post(
  '/2fa/setup',
  authController.setup2FA
);

router.post(
  '/2fa/verify',
  validationMiddleware.validate(validateAuth.verify2FA),
  authController.verify2FA
);

router.post(
  '/2fa/disable',
  validationMiddleware.validate(validateAuth.disable2FA),
  authController.disable2FA
);

// ===== DEVICE MANAGEMENT =====
router.get(
  '/devices',
  authController.getDevices
);

router.delete(
  '/devices/:deviceId',
  validationMiddleware.validate(validateAuth.removeDevice, 'params'),
  authController.removeDevice
);

module.exports = router;