// ===== src/controllers/deliveryController.js =====
const { Op, fn, col, literal } = require('sequelize');
const { Delivery, Booking, User, Vehicle } = require('../Models');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');
const APIFeatures = require('../Utils/APIFeatures');
const { createNotification } = require('../Services/notificationService');
const { calculateDistance, getETA } = require('../Services/mapService');

// ===== CREATE DELIVERY =====
exports.createDelivery = catchAsync(async (req, res, next) => {
  const { bookingId, type, pickup, dropoff, schedule } = req.body;

  // Check if booking exists
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Calculate estimated distance and duration
  const distance = await calculateDistance(
    pickup.coordinates,
    dropoff.coordinates
  );
  
  const eta = await getETA(
    pickup.coordinates,
    dropoff.coordinates
  );

  // Calculate pricing
  const pricing = await calculateDeliveryPricing({
    distance,
    type,
    priority: schedule.priority || 'normal'
  });

  // Create delivery
  const delivery = await Delivery.create({
    deliveryNumber: await generateDeliveryNumber(),
    bookingId,
    userId: booking.userId,
    type,
    priority: schedule.priority || 'normal',
    requestedPickupDate: schedule.pickupDate,
    requestedPickupTime: schedule.pickupTime,
    requestedDropoffDate: schedule.dropoffDate,
    requestedDropoffTime: schedule.dropoffTime,
    estimatedPickup: calculateEstimatedPickup(schedule),
    estimatedDropoff: calculateEstimatedDropoff(schedule, eta.duration),
    pickupType: pickup?.type,
    pickupName: pickup?.name,
    pickupAddress: pickup?.address || pickup,
    pickupCoordinates: pickup?.coordinates,
    pickupContact: pickup?.contact,
    pickupInstructions: pickup?.instructions,
    dropoffType: dropoff?.type,
    dropoffName: dropoff?.name,
    dropoffAddress: dropoff?.address || dropoff,
    dropoffCoordinates: dropoff?.coordinates,
    dropoffContact: dropoff?.contact,
    dropoffInstructions: dropoff?.instructions,
    estimatedDistance: distance,
    estimatedDuration: eta.duration,
    baseFee: pricing.baseFee,
    distanceFee: pricing.distanceFee,
    surgeFee: pricing.surgeFee,
    tollFee: pricing.tollFee,
    taxAmount: pricing.tax,
    totalAmount: pricing.total,
    timeline: [{
      status: 'pending',
      timestamp: new Date(),
      note: 'Delivery request created'
    }]
  });

  // Send notifications
  await sendDeliveryCreatedNotifications(delivery);

  res.status(201).json({
    status: 'success',
    data: {
      delivery
    }
  });
});

// ===== GET ALL DELIVERIES =====
exports.getUserDeliveries = catchAsync(async (req, res, next) => {
  const deliveries = await Delivery.findAll({
    where: { userId: req.user.id },
    include: [
      { model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'phone', 'profileImage'] },
      { model: Booking, as: 'booking' }
    ],
    order: [['created_at', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: deliveries.length,
    data: {
      deliveries
    }
  });
});

exports.getAllDeliveries = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: deliveries, count: total } = await Delivery.findAndCountAll({
    ...options,
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phone'] },
      { model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'phone', 'profileImage'] },
      { model: Booking, as: 'booking' }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: deliveries.length,
    total,
    data: {
      deliveries
    }
  });
});

// ===== GET DELIVERY BY ID =====
exports.getDelivery = catchAsync(async (req, res, next) => {
  const delivery = await Delivery.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address'] },
      { model: User, as: 'driver', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profileImage'] },
      { model: Booking, as: 'booking' }
    ]
  });

  if (!delivery) {
    return next(new AppError('Delivery not found', 404));
  }

  // Calculate real-time ETA if delivery is in progress
  let eta = null;
  if (['en_route_pickup', 'picked_up', 'en_route_dropoff'].includes(delivery.status)) {
    eta = delivery.estimatedDropoff;
  }

  res.status(200).json({
    status: 'success',
    data: {
      delivery,
      eta
    }
  });
});

// ===== UPDATE DELIVERY STATUS =====
exports.updateDeliveryStatus = catchAsync(async (req, res, next) => {
  const { status, location, note } = req.body;
  const delivery = await Delivery.findByPk(req.params.id);

  if (!delivery) {
    return next(new AppError('Delivery not found', 404));
  }

  // Validate status transition
  if (!isValidStatusTransition(delivery.status, status)) {
    return next(new AppError(`Invalid status transition from ${delivery.status} to ${status}`, 400));
  }

  // Update status
  delivery.status = status;
  
  // Update timeline
  const timeline = Array.isArray(delivery.timeline) ? delivery.timeline : [];
  timeline.push({
    status,
    timestamp: new Date(),
    location: location || delivery.currentLocation,
    note
  });
  delivery.timeline = timeline;

  // Update actual times based on status
  switch (status) {
    case 'picked_up':
      delivery.actualPickup = new Date();
      break;
    case 'delivered':
      delivery.actualDropoff = new Date();
      delivery.actualDuration = calculateActualDuration(delivery);
      delivery.actualDistance = await calculateActualDistance(delivery);
      break;
  }

  await delivery.save();

  // Send status update notifications
  await sendDeliveryStatusNotification(delivery, status);

  res.status(200).json({
    status: 'success',
    data: {
      delivery
    }
  });
});

// ===== UPDATE DRIVER LOCATION =====
exports.updateDriverLocation = catchAsync(async (req, res, next) => {
  const { lat, lng, accuracy } = req.body;
  const delivery = await Delivery.findByPk(req.params.id);

  if (!delivery) {
    return next(new AppError('Delivery not found', 404));
  }

  // Update location
  delivery.currentLocation = { lat, lng, accuracy };
  delivery.lastLocationUpdate = new Date();
  await delivery.save();

  // Check if near dropoff and send notification
  if (delivery.status === 'en_route_dropoff') {
    const distance = await calculateDistance(
      { lat, lng },
      delivery.dropoffCoordinates
    );
    if (distance < 1) { // Less than 1km away
      await sendNearDropoffNotification(delivery);
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      location: delivery.currentLocation,
      eta: delivery.estimatedDropoff
    }
  });
});

// ===== ASSIGN DRIVER =====
exports.assignDriver = catchAsync(async (req, res, next) => {
  const { driverId } = req.body;
  const delivery = await Delivery.findByPk(req.params.id);

  if (!delivery) {
    return next(new AppError('Delivery not found', 404));
  }

  // Check if driver exists and is available
  const driver = await User.findOne({ where: { id: driverId, role: 'provider', isActive: true } });
  if (!driver) {
    return next(new AppError('Driver not found or unavailable', 404));
  }

  // Assign driver
  delivery.driverId = driverId;
  delivery.driverName = `${driver.firstName} ${driver.lastName}`.trim();
  delivery.driverPhone = driver.phone;
  delivery.driverPhoto = driver.profileImage;

  delivery.status = 'assigned';
  const timeline = Array.isArray(delivery.timeline) ? delivery.timeline : [];
  timeline.push({
    status: 'assigned',
    timestamp: new Date(),
    note: `Assigned to driver ${delivery.driverName}`
  });
  delivery.timeline = timeline;

  await delivery.save();

  // Send notifications
  await sendDriverAssignedNotification(delivery);

  res.status(200).json({
    status: 'success',
    data: {
      delivery
    }
  });
});

// ===== CANCEL DELIVERY =====
exports.cancelDelivery = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const delivery = await Delivery.findByPk(req.params.id);

  if (!delivery) {
    return next(new AppError('Delivery not found', 404));
  }

  if (['delivered', 'cancelled', 'failed'].includes(delivery.status)) {
    return next(new AppError('Delivery cannot be cancelled at this stage', 400));
  }

  delivery.status = 'cancelled';
  const timeline = Array.isArray(delivery.timeline) ? delivery.timeline : [];
  timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Cancelled: ${reason}`
  });
  delivery.timeline = timeline;

  await delivery.save();

  // Process refund if applicable
  await processDeliveryRefund(delivery);

  // Send notifications
  await sendDeliveryCancelledNotification(delivery, reason);

  res.status(200).json({
    status: 'success',
    data: {
      delivery
    }
  });
});

// ===== RATE DELIVERY =====
exports.rateDelivery = catchAsync(async (req, res, next) => {
  const { score, feedback, categories } = req.body;
  const delivery = await Delivery.findByPk(req.params.id);

  if (!delivery) {
    return next(new AppError('Delivery not found', 404));
  }

  if (delivery.status !== 'delivered') {
    return next(new AppError('Cannot rate undelivered delivery', 400));
  }

  if (delivery.ratingScore) {
    return next(new AppError('Delivery already rated', 400));
  }

  delivery.ratingScore = score;
  delivery.ratingFeedback = feedback;
  delivery.ratingCategories = categories;
  delivery.ratedAt = new Date();

  // Update driver rating
  if (delivery.driverId) {
    await updateDriverRating(delivery.driverId, score);
  }

  await delivery.save();

  res.status(200).json({
    status: 'success',
    data: {
      delivery
    }
  });
});

// ===== GET ACTIVE DELIVERIES =====
exports.getActiveDeliveries = catchAsync(async (req, res, next) => {
  const deliveries = await Delivery.findAll({
    where: { status: { [Op.notIn]: ['delivered', 'cancelled', 'failed'] } }
  });

  res.status(200).json({
    status: 'success',
    results: deliveries.length,
    data: {
      deliveries
    }
  });
});

// ===== GET DELIVERIES BY DRIVER =====
exports.getDeliveriesByDriver = catchAsync(async (req, res, next) => {
  const deliveries = await Delivery.findAll({
    where: { driverId: req.params.driverId }
  });

  res.status(200).json({
    status: 'success',
    results: deliveries.length,
    data: {
      deliveries
    }
  });
});

// ===== GET DELIVERY STATISTICS =====
exports.getDeliveryStatistics = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const statsRows = await Delivery.findAll({
    attributes: [
      [fn('count', col('id')), 'total'],
      [fn('sum', literal(`CASE WHEN status = 'delivered' THEN 1 ELSE 0 END`)), 'completed'],
      [fn('sum', literal(`CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END`)), 'cancelled'],
      [fn('sum', literal(`CASE WHEN status = 'delivered' AND actual_dropoff <= estimated_dropoff THEN 1 ELSE 0 END`)), 'onTime'],
      [fn('sum', literal(`CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END`)), 'totalRevenue']
    ],
    where: {
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) }
    },
    raw: true
  });

  const statusBreakdown = await Delivery.findAll({
    attributes: [
      ['status', 'status'],
      [fn('count', col('id')), 'count']
    ],
    where: {
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) }
    },
    group: ['status'],
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      stats: statsRows[0] || {
        total: 0,
        completed: 0,
        cancelled: 0,
        onTime: 0,
        totalRevenue: 0
      },
      statusBreakdown
    }
  });
});

// ===== HELPER FUNCTIONS =====

const generateDeliveryNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const count = await Delivery.count() + 1;
  return `DEL${year}${month}${day}-${count.toString().padStart(4, '0')}`;
};

const calculateDeliveryPricing = async ({ distance, type, priority }) => {
  const baseRates = {
    pickup: 25,
    delivery: 35,
    exchange: 45,
    concierge: 75
  };

  const priorityMultipliers = {
    normal: 1,
    express: 1.5,
    urgent: 2
  };

  const distanceRate = 2.5; // per km
  const baseFee = baseRates[type] || 35;
  const distanceFee = distance * distanceRate;
  const surgeFee = baseFee * (priorityMultipliers[priority] - 1);
  const tollFee = await estimateTolls(distance); // Would integrate with toll API
  const tax = (baseFee + distanceFee + surgeFee + tollFee) * 0.1;

  const total = baseFee + distanceFee + surgeFee + tollFee + tax;

  return {
    baseFee,
    distanceFee,
    surgeFee,
    tollFee,
    tax,
    total
  };
};

const calculateEstimatedPickup = (schedule) => {
  const pickupDate = new Date(schedule.pickupDate);
  // Add 30 minutes for preparation
  pickupDate.setMinutes(pickupDate.getMinutes() + 30);
  return pickupDate;
};

const calculateEstimatedDropoff = (schedule, duration) => {
  const dropoffDate = new Date(schedule.dropoffDate);
  // Add travel time
  dropoffDate.setMinutes(dropoffDate.getMinutes() + duration);
  return dropoffDate;
};

const getVehicleDetails = async (vehicleId) => {
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) return null;
  
  return {
    name: vehicle.name,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.colors?.[0]?.name,
    licensePlate: vehicle.licensePlate,
    images: vehicle.galleryImages?.slice(0, 3)
  };
};

const isValidStatusTransition = (current, next) => {
  const validTransitions = {
    pending: ['assigned', 'cancelled'],
    assigned: ['en_route_pickup', 'cancelled'],
    en_route_pickup: ['arrived_pickup', 'cancelled'],
    arrived_pickup: ['picked_up', 'cancelled'],
    picked_up: ['en_route_dropoff'],
    en_route_dropoff: ['arrived_dropoff'],
    arrived_dropoff: ['delivered'],
    delivered: [],
    cancelled: [],
    failed: [],
    returned: []
  };

  return validTransitions[current]?.includes(next) || false;
};

const calculateActualDuration = (delivery) => {
  if (!delivery.actualPickup || !delivery.actualDropoff) return null;
  
  const diff = delivery.actualDropoff - delivery.actualPickup;
  return Math.round(diff / (1000 * 60)); // minutes
};

const calculateActualDistance = async (delivery) => {
  if (!delivery.route || delivery.route.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < delivery.route.length; i++) {
    const point1 = delivery.route[i - 1];
    const point2 = delivery.route[i];
    
    const distance = await calculateDistance(
      { lat: point1.lat, lng: point1.lng },
      { lat: point2.lat, lng: point2.lng }
    );
    totalDistance += distance;
  }

  return Math.round(totalDistance * 100) / 100;
};

const updateDriverRating = async (driverId, newRating) => {
  const driver = await User.findByPk(driverId);
  if (!driver) return;

  const currentAvg = driver.metadata?.rating?.average || 0;
  const currentCount = driver.metadata?.rating?.count || 0;

  const newAvg = (currentAvg * currentCount + newRating) / (currentCount + 1);

  driver.metadata = driver.metadata || {};
  driver.metadata.rating = {
    average: newAvg,
    count: currentCount + 1
  };
  await driver.save();
};

const sendDeliveryCreatedNotifications = async (delivery) => {
  // Notify customer
  await createNotification({
    userId: delivery.userId,
    type: 'delivery_created',
    title: 'Delivery Request Received',
    message: `Your ${delivery.type} request has been received and is being processed.`,
    data: { deliveryId: delivery.id, deliveryNumber: delivery.deliveryNumber }
  });

  // Notify admin
  await createNotification({
    recipient: { type: 'role', role: 'admin' },
    type: 'delivery_created_admin',
    title: 'New Delivery Request',
    message: `New ${delivery.type} request #${delivery.deliveryNumber} requires assignment.`,
    data: { deliveryId: delivery.id }
  });
};

const sendDeliveryStatusNotification = async (delivery, status) => {
  const statusMessages = {
    assigned: 'Your driver has been assigned',
    en_route_pickup: 'Your driver is on the way to pickup',
    arrived_pickup: 'Driver has arrived at pickup location',
    picked_up: 'Vehicle has been picked up',
    en_route_dropoff: 'Vehicle is on the way to you',
    arrived_dropoff: 'Driver has arrived at your location',
    delivered: 'Vehicle has been delivered'
  };

  await createNotification({
    userId: delivery.userId,
    type: 'delivery_status',
    title: 'Delivery Status Update',
    message: statusMessages[status] || `Delivery status updated to ${status}`,
    data: { deliveryId: delivery.id, status }
  });
};

const sendNearDropoffNotification = async (delivery) => {
  await createNotification({
    userId: delivery.userId,
    type: 'delivery_near',
    title: 'Driver Approaching',
    message: 'Your driver is less than 1km away and will arrive shortly.',
    data: { deliveryId: delivery.id, eta: delivery.estimatedDropoff }
  });
};

const sendDriverAssignedNotification = async (delivery) => {
  await createNotification({
    userId: delivery.userId,
    type: 'driver_assigned',
    title: 'Driver Assigned',
    message: `${delivery.driverName} has been assigned to your delivery.`,
    data: { 
      deliveryId: delivery.id,
      driver: {
        name: delivery.driverName,
        phone: delivery.driverPhone,
        photo: delivery.driverPhoto
      }
    }
  });
};

const sendDeliveryCancelledNotification = async (delivery, reason) => {
  await createNotification({
    userId: delivery.userId,
    type: 'delivery_cancelled',
    title: 'Delivery Cancelled',
    message: `Your delivery has been cancelled. Reason: ${reason}`,
    data: { deliveryId: delivery.id, reason }
  });
};

const processDeliveryRefund = async (delivery) => {
  // Process refund through payment service
  // Implementation depends on payment gateway
  console.log(`Processing refund for delivery ${delivery.id}`);
};

const estimateTolls = async (distance) => {
  // Would integrate with toll road API
  return distance > 10 ? 5 : 0;
};

module.exports = exports;
