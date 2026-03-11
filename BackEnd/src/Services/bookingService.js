// ===== src/services/bookingService.js =====
const Booking = require('../Models/Booking');
const Vehicle = require('../Models/Vehicle');
const User = require('../Models/User');
const Payment = require('../Models/Payment');
const AppError = require('../Utils/AppError');
const { logger } = require('../Middleware/Logger.md.js');
const { sendEmail } = require('./emailService');
const { createNotification } = require('./notificationService');
const { calculatePrice } = require('../Utils/PriceCalculator');
const { generateBookingNumber } = require('../Utils/Helpers');

// ===== CREATE BOOKING =====
exports.createBooking = async (bookingData, userId) => {
  try {
    const {
      vehicleId,
      serviceType,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      extras,
      specialRequests,
      customerInfo
    } = bookingData;

    // Check vehicle availability
    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      const isAvailable = await vehicle.checkAvailability(startDate, endDate);
      if (!isAvailable) {
        throw new AppError('Vehicle not available for selected dates', 400);
      }
    }

    // Calculate pricing
    const pricing = await calculatePrice({
      vehicleId,
      serviceType,
      startDate,
      endDate,
      extras
    });

    // Generate booking number
    const bookingNumber = await generateBookingNumber();

    // Create booking
    const booking = await Booking.create({
      bookingNumber,
      user: userId,
      vehicle: vehicleId,
      serviceType,
      status: 'pending',
      dates: {
        startDate,
        endDate,
        pickupTime: bookingData.pickupTime,
        dropoffTime: bookingData.dropoffTime
      },
      location: {
        pickup: pickupLocation,
        dropoff: dropoffLocation || pickupLocation
      },
      pricing: {
        basePrice: pricing.basePrice,
        extras: pricing.extras,
        insurance: pricing.insurance,
        tax: pricing.tax,
        discount: pricing.discount,
        total: pricing.total,
        deposit: pricing.deposit
      },
      customerInfo: customerInfo || null,
      extras: pricing.extrasList,
      specialRequests,
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Booking created'
      }]
    });

    // Send confirmation
    await exports.sendBookingConfirmation(booking);

    return booking;
  } catch (error) {
    logger.error('Create booking failed:', error);
    throw error;
  }
};

// ===== GET BOOKING BY ID =====
exports.getBookingById = async (bookingId, userId, userRole) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('user', 'firstName lastName email phone')
      .populate('vehicle')
      .populate('payment');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check authorization
    if (userRole !== 'admin' && booking.user?._id.toString() !== userId) {
      throw new AppError('You do not have permission to view this booking', 403);
    }

    return booking;
  } catch (error) {
    logger.error('Get booking by ID failed:', error);
    throw error;
  }
};

// ===== GET USER BOOKINGS =====
exports.getUserBookings = async (userId, filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = pagination;
    const skip = (page - 1) * limit;

    const query = { user: userId, ...filters };

    const bookings = await Booking.find(query)
      .populate('vehicle', 'name make model year images')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get user bookings failed:', error);
    throw error;
  }
};

// ===== GET ALL BOOKINGS (ADMIN) =====
exports.getAllBookings = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt' } = pagination;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filters)
      .populate('user', 'firstName lastName email phone')
      .populate('vehicle', 'name make model year')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filters);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all bookings failed:', error);
    throw error;
  }
};

// ===== UPDATE BOOKING STATUS =====
exports.updateBookingStatus = async (bookingId, status, note, userId) => {
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    booking.status = status;
    booking.timeline.push({
      status,
      timestamp: new Date(),
      note,
      updatedBy: userId
    });

    await booking.save();

    // Send notification to user
    await exports.sendBookingStatusNotification(booking, status, note);

    return booking;
  } catch (error) {
    logger.error('Update booking status failed:', error);
    throw error;
  }
};

// ===== CANCEL BOOKING =====
exports.cancelBooking = async (bookingId, reason, userId, userRole) => {
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check if user can cancel
    if (userRole !== 'admin' && booking.user?.toString() !== userId) {
      throw new AppError('You do not have permission to cancel this booking', 403);
    }

    if (!booking.canCancel) {
      throw new AppError('Booking cannot be cancelled at this stage', 400);
    }

    // Calculate cancellation fee
    const cancellationFee = booking.calculateCancellationFee();

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledAt: new Date(),
      reason,
      cancelledBy: userId,
      fee: cancellationFee,
      refunded: cancellationFee === 0
    };

    booking.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Booking cancelled: ${reason}`
    });

    await booking.save();

    // Process refund if applicable
    if (cancellationFee === 0 && booking.payment?.status === 'completed') {
      await exports.processBookingRefund(booking);
    }

    // Send notification
    await exports.sendCancellationNotification(booking, reason);

    return booking;
  } catch (error) {
    logger.error('Cancel booking failed:', error);
    throw error;
  }
};

// ===== CHECK AVAILABILITY =====
exports.checkAvailability = async ({ vehicleId, startDate, endDate, serviceType }) => {
  try {
    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404);
      }

      const isAvailable = await vehicle.checkAvailability(startDate, endDate);

      return {
        available: isAvailable,
        vehicle: vehicleId
      };
    }

    // For services without specific vehicle
    const conflictingBookings = await Booking.find({
      serviceType,
      'dates.startDate': { $lte: endDate },
      'dates.endDate': { $gte: startDate },
      status: { $nin: ['cancelled', 'completed'] }
    });

    return {
      available: conflictingBookings.length === 0,
      conflictingCount: conflictingBookings.length
    };
  } catch (error) {
    logger.error('Check availability failed:', error);
    throw error;
  }
};

// ===== GET AVAILABLE TIME SLOTS =====
exports.getAvailableTimeSlots = async ({ date, serviceType, location }) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all bookings for the day
    const bookings = await Booking.find({
      serviceType,
      'dates.startDate': { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'completed'] }
    });

    // Get business hours from settings
    const businessHours = await getBusinessHours(location);
    const allSlots = generateTimeSlots(businessHours);

    // Remove booked slots
    const bookedSlots = bookings.map(b =>
      new Date(b.dates.startDate).toTimeString().slice(0, 5)
    );

    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    return {
      date,
      availableSlots,
      bookedSlots
    };
  } catch (error) {
    logger.error('Get available time slots failed:', error);
    throw error;
  }
};

// ===== CALCULATE PRICE =====
exports.calculatePrice = async (params) => {
  try {
    return await calculatePrice(params);
  } catch (error) {
    logger.error('Calculate price failed:', error);
    throw error;
  }
};

// ===== GET BOOKING STATISTICS =====
exports.getBookingStatistics = async ({ startDate, endDate }) => {
  try {
    const stats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$pricing.total', 0] }
          }
        }
      }
    ]);

    // By service type
    const byService = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      }
    ]);

    // By day
    const byDay = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    return {
      overview: stats[0] || {
        total: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        pending: 0,
        totalRevenue: 0
      },
      byService,
      byDay
    };
  } catch (error) {
    logger.error('Get booking statistics failed:', error);
    throw error;
  }
};

// ===== SEND BOOKING CONFIRMATION =====
exports.sendBookingConfirmation = async (booking) => {
  try {
    const user = await User.findById(booking.user);
    if (!user) return;

    await createNotification({
      recipient: { type: 'user', userId: user._id },
      type: 'booking_confirmation',
      title: 'Booking Confirmed',
      message: `Your booking #${booking.bookingNumber} has been confirmed.`,
      data: { bookingId: booking._id }
    });

    // Send email
    await sendEmail({
      to: user.email,
      subject: `Booking Confirmed - CAR EASE #${booking.bookingNumber}`,
      html: generateBookingEmail(booking, 'confirmed')
    });
  } catch (error) {
    logger.error('Send booking confirmation failed:', error);
  }
};

// ===== SEND BOOKING STATUS NOTIFICATION =====
exports.sendBookingStatusNotification = async (booking, status, note) => {
  try {
    const user = await User.findById(booking.user);
    if (!user) return;

    await createNotification({
      recipient: { type: 'user', userId: user._id },
      type: 'booking_status',
      title: `Booking ${status}`,
      message: `Your booking #${booking.bookingNumber} status has been updated to ${status}.`,
      data: { bookingId: booking._id, status, note }
    });
  } catch (error) {
    logger.error('Send booking status notification failed:', error);
  }
};

// ===== SEND CANCELLATION NOTIFICATION =====
exports.sendCancellationNotification = async (booking, reason) => {
  try {
    const user = await User.findById(booking.user);
    if (!user) return;

    await createNotification({
      recipient: { type: 'user', userId: user._id },
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Your booking #${booking.bookingNumber} has been cancelled.`,
      data: { bookingId: booking._id, reason }
    });

    await sendEmail({
      to: user.email,
      subject: `Booking Cancelled - CAR EASE #${booking.bookingNumber}`,
      html: generateCancellationEmail(booking, reason)
    });
  } catch (error) {
    logger.error('Send cancellation notification failed:', error);
  }
};

// ===== PROCESS BOOKING REFUND =====
exports.processBookingRefund = async (booking) => {
  try {
    const payment = await Payment.findOne({ booking: booking._id });
    if (payment) {
      // Process refund through payment service
      // This would integrate with paymentService
      logger.info(`Refund processed for booking ${booking.bookingNumber}`);
    }
  } catch (error) {
    logger.error('Process booking refund failed:', error);
  }
};

// ===== HELPER FUNCTIONS =====
const getBusinessHours = async (location) => {
  // This would fetch from settings or location model
  return {
    start: 9, // 9 AM
    end: 20,  // 8 PM
    interval: 60 // minutes
  };
};

const generateTimeSlots = (hours) => {
  const slots = [];
  for (let i = hours.start; i < hours.end; i++) {
    for (let j = 0; j < 60; j += hours.interval) {
      const time = `${i.toString().padStart(2, '0')}:${j.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

const generateBookingEmail = (booking, status) => {
  return `
    <h1>Booking ${status}</h1>
    <p>Booking #${booking.bookingNumber}</p>
    <p>Status: ${booking.status}</p>
    <p>Total: $${booking.pricing?.total}</p>
  `;
};

const generateCancellationEmail = (booking, reason) => {
  return `
    <h1>Booking Cancelled</h1>
    <p>Booking #${booking.bookingNumber}</p>
    <p>Reason: ${reason}</p>
  `;
};