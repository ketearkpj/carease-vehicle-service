// ===== src/controllers/bookingController.js =====
const { Op, fn, col, literal } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../Config/sequelize');
const { Booking, Vehicle, User, Payment } = require('../Models');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');
const APIFeatures = require('../Utils/APIFeatures');
const { sendEmail } = require('../Services/emailService');
const { createNotification } = require('../Services/notificationService');
const { calculatePrice } = require('../Utils/PriceCalculator');
const { generateInvoice } = require('../Utils/InvoiceGenerator');

// ===== CREATE BOOKING =====
exports.createBooking = catchAsync(async (req, res, next) => {
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
  } = req.body;

  // Check vehicle availability
  if (vehicleId) {
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404));
    }

    const conflicts = await Booking.count({
      where: {
        vehicleId,
        status: { [Op.notIn]: ['cancelled', 'refunded'] },
        [Op.or]: [
          {
            startDate: { [Op.lte]: new Date(endDate) },
            endDate: { [Op.gte]: new Date(startDate) }
          }
        ]
      }
    });

    if (conflicts > 0) {
      return next(new AppError('Vehicle not available for selected dates', 400));
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
  const customerUser = await resolveCustomerUser(req.body, req.user);

  // Create booking
  const booking = await Booking.create({
    bookingNumber,
    userId: customerUser.id,
    vehicleId: vehicleId || null,
    serviceType,
    status: 'pending',
    startDate,
    endDate,
    pickupTime: req.body.pickupTime,
    dropoffTime: req.body.dropoffTime,
    pickupLocationType: pickupLocation?.type || null,
    pickupLocationName: pickupLocation?.name || null,
    pickupAddress: pickupLocation?.address || pickupLocation || null,
    pickupCoordinates: pickupLocation?.coordinates || null,
    dropoffLocationType: dropoffLocation?.type || null,
    dropoffLocationName: dropoffLocation?.name || null,
    dropoffAddress: dropoffLocation?.address || dropoffLocation || pickupLocation || null,
    dropoffCoordinates: dropoffLocation?.coordinates || null,
    basePrice: pricing.basePrice,
    extrasPrice: pricing.extrasPrice,
    insurancePrice: pricing.insurancePrice,
    taxAmount: pricing.tax,
    discountAmount: pricing.discount,
    totalAmount: pricing.total,
    depositAmount: pricing.deposit,
    extras: pricing.extrasList || pricing.breakdown?.extras || [],
    specialRequests,
    customerFirstName: customerInfo?.firstName || customerUser.firstName || null,
    customerLastName: customerInfo?.lastName || customerUser.lastName || null,
    customerEmail: customerInfo?.email || customerUser.email || null,
    customerPhone: customerInfo?.phone || customerUser.phone || null,
    timeline: [{
      status: 'pending',
      timestamp: new Date(),
      note: 'Booking created'
    }]
  });

  // Send confirmation email
  await sendBookingConfirmation(booking);

  // Create notification
  if (booking.userId) {
    await createNotification({
      userId: booking.userId,
      type: 'booking_created',
      title: 'Booking Confirmation',
      message: `Your booking #${booking.bookingNumber} has been created successfully.`,
      data: { bookingId: booking.id }
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// ===== GET ALL BOOKINGS =====
exports.getAllBookings = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: bookings, count: total } = await Booking.findAndCountAll({
    ...options,
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
      { model: Vehicle, as: 'vehicle' }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    total,
    data: {
      bookings
    }
  });
});

// ===== GET USER BOOKINGS =====
exports.getUserBookings = catchAsync(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;

  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: bookings, count: total } = await Booking.findAndCountAll({
    ...options,
    where: { ...options.where, userId },
    include: [{ model: Vehicle, as: 'vehicle' }]
  });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    total,
    data: {
      bookings
    }
  });
});

// ===== GET BOOKING BY ID =====
exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address'] },
      { model: Vehicle, as: 'vehicle' },
      { model: Payment, as: 'payments' }
    ]
  });

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check authorization
  if (req.user && 
      req.user.role !== 'admin' && 
      booking.userId?.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to view this booking', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// ===== UPDATE BOOKING =====
exports.updateBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if booking can be modified
  if (!['pending', 'confirmed'].includes(booking.status)) {
    return next(new AppError('Booking cannot be modified at this stage', 400));
  }

  // Update fields
  const updates = { ...req.body };
  delete updates.status;
  delete updates.payment;

  if (updates.dates) {
    updates.startDate = updates.dates.startDate || booking.startDate;
    updates.endDate = updates.dates.endDate || booking.endDate;
    updates.pickupTime = updates.dates.pickupTime || booking.pickupTime;
    updates.dropoffTime = updates.dates.dropoffTime || booking.dropoffTime;
    delete updates.dates;
  }

  if (updates.location) {
    updates.pickupAddress = updates.location.pickup || booking.pickupAddress;
    updates.dropoffAddress = updates.location.dropoff || booking.dropoffAddress;
    delete updates.location;
  }

  if (updates.pricing) {
    updates.basePrice = updates.pricing.basePrice ?? booking.basePrice;
    updates.extrasPrice = updates.pricing.extrasPrice ?? booking.extrasPrice;
    updates.insurancePrice = updates.pricing.insurancePrice ?? booking.insurancePrice;
    updates.taxAmount = updates.pricing.tax ?? booking.taxAmount;
    updates.discountAmount = updates.pricing.discount ?? booking.discountAmount;
    updates.totalAmount = updates.pricing.total ?? booking.totalAmount;
    updates.depositAmount = updates.pricing.deposit ?? booking.depositAmount;
    delete updates.pricing;
  }

  Object.assign(booking, updates);

  // Recalculate pricing if dates or extras changed
  if (req.body.dates || req.body.extras) {
    const pricing = await calculatePrice({
      vehicleId: booking.vehicleId,
      serviceType: booking.serviceType,
      startDate: booking.startDate,
      endDate: booking.endDate,
      extras: booking.extras
    });
    booking.basePrice = pricing.basePrice;
    booking.extrasPrice = pricing.extrasPrice;
    booking.insurancePrice = pricing.insurancePrice;
    booking.taxAmount = pricing.tax;
    booking.discountAmount = pricing.discount;
    booking.totalAmount = pricing.total;
    booking.depositAmount = pricing.deposit;
  }

  const timeline = Array.isArray(booking.timeline) ? booking.timeline : [];
  timeline.push({
    status: booking.status,
    timestamp: new Date(),
    note: 'Booking updated',
    updatedBy: req.user?.id
  });
  booking.timeline = timeline;

  await booking.save();

  // Send update notification
  await sendBookingUpdateNotification(booking);

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// ===== CANCEL BOOKING =====
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const booking = await Booking.findByPk(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (!['pending', 'confirmed'].includes(booking.status)) {
    return next(new AppError('Booking cannot be cancelled at this stage', 400));
  }

  // Calculate cancellation fee
  const cancellationFee = 0;

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason;
  booking.cancellationFee = cancellationFee;
  booking.refunded = cancellationFee === 0;

  const cancelTimeline = Array.isArray(booking.timeline) ? booking.timeline : [];
  cancelTimeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Booking cancelled: ${reason}`
  });
  booking.timeline = cancelTimeline;

  await booking.save();

  // Process refund if applicable
  if (cancellationFee === 0) {
    await processBookingRefund(booking);
  }

  // Send cancellation notification
  await sendCancellationNotification(booking, reason);

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// ===== CHECK AVAILABILITY =====
exports.checkAvailability = catchAsync(async (req, res, next) => {
  const { vehicleId, startDate, endDate, serviceType } = req.body;

  if (vehicleId) {
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404));
    }

    const conflicts = await Booking.count({
      where: {
        vehicleId,
        status: { [Op.notIn]: ['cancelled', 'completed'] },
        startDate: { [Op.lte]: new Date(endDate) },
        endDate: { [Op.gte]: new Date(startDate) }
      }
    });
    const isAvailable = conflicts === 0;

    return res.status(200).json({
      status: 'success',
      data: {
        available: isAvailable,
        vehicle: vehicleId
      }
    });
  }

  // For services without specific vehicle
  const conflictingBookings = await Booking.count({
    where: {
      serviceType,
      startDate: { [Op.lte]: new Date(endDate) },
      endDate: { [Op.gte]: new Date(startDate) },
      status: { [Op.notIn]: ['cancelled', 'completed'] }
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      available: conflictingBookings === 0,
      conflictingBookings
    }
  });
});

// ===== GET AVAILABLE TIME SLOTS =====
exports.getAvailableTimeSlots = catchAsync(async (req, res, next) => {
  const { date, serviceType, location } = req.query;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all bookings for the day
  const bookings = await Booking.findAll({
    where: {
      serviceType,
      startDate: { [Op.gte]: startOfDay, [Op.lte]: endOfDay },
      status: { [Op.notIn]: ['cancelled', 'completed'] }
    }
  });

  // Generate available slots based on business hours
  const businessHours = await getBusinessHours(location);
  const allSlots = generateTimeSlots(businessHours);

  // Remove booked slots
  const bookedSlots = bookings.map(b => 
    new Date(b.startDate).toTimeString().slice(0, 5)
  );

  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

  res.status(200).json({
    status: 'success',
    data: {
      date,
      availableSlots,
      bookedSlots
    }
  });
});

// ===== CALCULATE PRICE =====
exports.calculatePrice = catchAsync(async (req, res, next) => {
  const pricing = await calculatePrice(req.body);

  res.status(200).json({
    status: 'success',
    data: pricing
  });
});

// ===== GET BOOKING STATISTICS =====
exports.getBookingStatistics = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const overviewRows = await Booking.findAll({
    attributes: [
      [fn('count', col('id')), 'total'],
      [fn('sum', literal(`CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END`)), 'confirmed'],
      [fn('sum', literal(`CASE WHEN status = 'completed' THEN 1 ELSE 0 END`)), 'completed'],
      [fn('sum', literal(`CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END`)), 'cancelled'],
      [fn('sum', literal(`CASE WHEN status = 'pending' THEN 1 ELSE 0 END`)), 'pending'],
      [fn('sum', literal(`CASE WHEN status = 'completed' THEN total_amount ELSE 0 END`)), 'totalRevenue']
    ],
    where: {
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) }
    },
    raw: true
  });

  const byService = await Booking.findAll({
    attributes: [
      ['service_type', 'serviceType'],
      [fn('count', col('id')), 'count'],
      [fn('sum', col('total_amount')), 'revenue']
    ],
    where: {
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) }
    },
    group: ['service_type'],
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      overview: overviewRows[0] || {
        total: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        pending: 0,
        totalRevenue: 0
      },
      byService
    }
  });
});

// ===== HELPER FUNCTIONS =====

const sanitizeKenyanPhone = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length >= 12) return digits.slice(0, 12);
  if (digits.startsWith('0') && digits.length >= 10) return `254${digits.slice(1, 10)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits || null;
};

const generateGuestPhone = async () => {
  let phone = null;
  let exists = true;

  while (exists) {
    const candidate = `2547${Math.floor(10000000 + Math.random() * 89999999)}`;
    const user = await User.findOne({ where: { phone: candidate }, attributes: ['id'] });
    if (!user) {
      phone = candidate;
      exists = false;
    }
  }

  return phone;
};

const resolveCustomerUser = async (payload, authUser) => {
  if (authUser) return authUser;

  const customerInfo = payload?.customerInfo || {};
  const email = customerInfo.email;
  if (!email) {
    throw new AppError('Customer email is required for guest bookings', 400);
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) return existingUser;

  const passwordHash = await bcrypt.hash(`guest_${Date.now()}_${Math.random()}`, 12);
  const phone = sanitizeKenyanPhone(customerInfo.phone) || await generateGuestPhone();

  return User.create({
    firstName: customerInfo.firstName || 'Guest',
    lastName: customerInfo.lastName || 'Customer',
    email,
    phone,
    passwordHash,
    role: 'customer',
    isActive: true
  });
};

const generateBookingNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `BK${year}${month}${day}-${random}`;
};

const getBusinessHours = async (location) => {
  // Would fetch from settings or location model
  return {
    start: 9, // 9 AM
    end: 20, // 8 PM
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

const sendBookingConfirmation = async (booking) => {
  const user = booking.customerEmail
    ? { email: booking.customerEmail }
    : await User.findByPk(booking.userId);
  if (!user?.email) return;

  const invoice = await generateInvoice(booking);

  await sendEmail({
    to: user.email,
    subject: `CAR EASE - Booking Confirmation #${booking.bookingNumber}`,
    html: generateBookingEmail(booking, 'confirmed'),
    attachments: [{
      filename: `invoice-${booking.bookingNumber}.pdf`,
      content: invoice
    }]
  });
};

const sendBookingUpdateNotification = async (booking) => {
  const user = booking.customerEmail
    ? { email: booking.customerEmail }
    : await User.findByPk(booking.userId);
  if (!user?.email) return;

  await sendEmail({
    to: user.email,
    subject: `CAR EASE - Booking Update #${booking.bookingNumber}`,
    html: generateBookingEmail(booking, 'updated')
  });
};

const sendCancellationNotification = async (booking, reason) => {
  const user = booking.customerEmail
    ? { email: booking.customerEmail }
    : await User.findByPk(booking.userId);
  if (!user?.email) return;

  await sendEmail({
    to: user.email,
    subject: `CAR EASE - Booking Cancelled #${booking.bookingNumber}`,
    html: generateCancellationEmail(booking, reason)
  });
};

const processBookingRefund = async (booking) => {
  // Process refund through payment service
  const payment = await Payment.findOne({ where: { bookingId: booking.id } });
  if (payment) {
    payment.status = 'refunded';
    payment.errorMessage = 'Booking cancelled';
    await payment.save();
  }
};

const generateBookingEmail = (booking, status, note = '') => {
  // Generate HTML email content
  return `
    <h1>Booking ${status}</h1>
    <p>Booking #${booking.bookingNumber}</p>
    <p>Status: ${booking.status}</p>
    ${note ? `<p>Note: ${note}</p>` : ''}
  `;
};

const generateCancellationEmail = (booking, reason) => {
  return `
    <h1>Booking Cancelled</h1>
    <p>Booking #${booking.bookingNumber}</p>
    <p>Reason: ${reason}</p>
  `;
};

module.exports = exports;
