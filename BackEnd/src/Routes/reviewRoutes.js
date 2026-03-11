// ===== src/routes/reviewRoutes.js =====
const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/ReviewController');
const authMiddleware = require('../Middleware/Auth.md.js');
const adminMiddleware = require('../Middleware/Admin.md.js');
const validationMiddleware = require('../Middleware/Validation.md.js');
const { validateReview } = require('../Utils/Validators');

// ===== PUBLIC ROUTES =====
router.get(
  '/recent',
  reviewController.getRecentReviews
);

router.get(
  '/',
  reviewController.getAllReviews
);

router.get(
  '/:id',
  validationMiddleware.validate(validateReview.getReview, 'params'),
  reviewController.getReview
);

// ===== PROTECTED ROUTES =====
router.use(authMiddleware.protect);

router.post(
  '/',
  validationMiddleware.validate(validateReview.createReview),
  reviewController.createReview
);

router.patch(
  '/:id',
  validationMiddleware.validate(validateReview.updateReview),
  reviewController.updateReview
);

router.delete(
  '/:id',
  validationMiddleware.validate(validateReview.deleteReview, 'params'),
  reviewController.deleteReview
);

router.post(
  '/:id/helpful',
  validationMiddleware.validate(validateReview.markHelpful, 'params'),
  reviewController.markHelpful
);

router.delete(
  '/:id/helpful',
  validationMiddleware.validate(validateReview.unmarkHelpful, 'params'),
  reviewController.unmarkHelpful
);

// ===== ADMIN ROUTES =====
router.use(authMiddleware.restrictTo('admin', 'super_admin'));

router.patch(
  '/:id/status',
  validationMiddleware.validate(validateReview.updateStatus),
  reviewController.updateReviewStatus
);

router.post(
  '/:id/response',
  validationMiddleware.validate(validateReview.addResponse),
  reviewController.addResponse
);

module.exports = router;