// ===== src/routes/bookingRoutes.js =====
const express = require('express');
const router = express.Router();
const bookingController = require('../Controllers/BookingController');
const authMiddleware = require('../Middleware/Auth.md.js');
const adminMiddleware = require('../Middleware/Admin.md.js');
const validationMiddleware = require('../Middleware/Validation.md.js');
const { validateBooking } = require('../Utils/Validators');

// ===== PUBLIC ROUTES =====
router.post(
  '/check-availability',
  validationMiddleware.validate(validateBooking.checkAvailability),
  bookingController.checkAvailability
);

router.get(
  '/available-slots',
  validationMiddleware.validate(validateBooking.getAvailableSlots),
  bookingController.getAvailableTimeSlots
);

router.post(
  '/calculate-price',
  validationMiddleware.validate(validateBooking.calculatePrice),
  bookingController.calculatePrice
);

// ===== PROTECTED ROUTES =====
router.use(authMiddleware.protect);

router.post(
  '/',
  validationMiddleware.validate(validateBooking.createBooking),
  bookingController.createBooking
);

router.get(
  '/my-bookings',
  bookingController.getUserBookings
);

router.get(
  '/:id',
  validationMiddleware.validate(validateBooking.getBooking, 'params'),
  bookingController.getBooking
);

router.patch(
  '/:id',
  validationMiddleware.validate(validateBooking.updateBooking),
  bookingController.updateBooking
);

router.post(
  '/:id/cancel',
  validationMiddleware.validate(validateBooking.cancelBooking),
  bookingController.cancelBooking
);

// ===== ADMIN ROUTES =====
router.use(authMiddleware.restrictTo('admin', 'super_admin'));

router.get(
  '/',
  bookingController.getAllBookings
);

router.get(
  '/user/:userId',
  validationMiddleware.validate(validateBooking.getUserBookings, 'params'),
  bookingController.getUserBookings
);

router.patch(
  '/:id/status',
  validationMiddleware.validate(validateBooking.updateStatus),
  bookingController.updateBookingStatus
);

router.get(
  '/stats/overview',
  bookingController.getBookingStatistics
);

module.exports = router;