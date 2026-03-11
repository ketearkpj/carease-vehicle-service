// ===== src/routes/paymentRoutes.js =====
const express = require('express');
const router = express.Router();
const paymentController = require('../Controllers/PaymentController');
const authMiddleware = require('../Middleware/Auth.md.js');
const adminMiddleware = require('../Middleware/Admin.md.js');
const validationMiddleware = require('../Middleware/Validation.md.js');
const { validatePayment } = require('../Utils/Validators');

// ===== WEBHOOK ROUTES (PUBLIC) =====
router.post(
  '/webhook/:gateway',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

// ===== PUBLIC/GUEST CHECKOUT ROUTES =====
router.post(
  '/process',
  authMiddleware.optionalAuth,
  validationMiddleware.validate(validatePayment.processPayment),
  paymentController.processPayment
);

router.post(
  '/confirm',
  authMiddleware.optionalAuth,
  validationMiddleware.validate(validatePayment.confirmPayment),
  paymentController.confirmPayment
);

router.get(
  '/mpesa-status/:checkoutRequestId',
  authMiddleware.optionalAuth,
  paymentController.getMpesaStatus
);

// ===== USER PROTECTED ROUTES =====
router.use(authMiddleware.protect);

router.get(
  '/my-payments',
  paymentController.getUserPayments
);

router.get(
  '/methods',
  paymentController.getPaymentMethods
);

router.post(
  '/methods',
  validationMiddleware.validate(validatePayment.addPaymentMethod),
  paymentController.addPaymentMethod
);

router.delete(
  '/methods/:methodId',
  validationMiddleware.validate(validatePayment.deletePaymentMethod, 'params'),
  paymentController.deletePaymentMethod
);

router.patch(
  '/methods/:methodId/default',
  validationMiddleware.validate(validatePayment.setDefaultMethod, 'params'),
  paymentController.setDefaultPaymentMethod
);

router.get(
  '/:id',
  validationMiddleware.validate(validatePayment.getPayment, 'params'),
  paymentController.getPayment
);

// ===== ADMIN ROUTES =====
router.use(authMiddleware.protectAdmin);
router.use(authMiddleware.restrictTo('admin', 'super_admin'));

router.get(
  '/',
  paymentController.getAllPayments
);

router.get(
  '/user/:userId',
  validationMiddleware.validate(validatePayment.getUserPayments, 'params'),
  paymentController.getUserPayments
);

router.post(
  '/:id/refund',
  validationMiddleware.validate(validatePayment.processRefund),
  paymentController.processRefund
);

router.get(
  '/stats/overview',
  paymentController.getPaymentStatistics
);

module.exports = router;
