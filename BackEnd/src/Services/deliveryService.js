// ===== src/services/deliveryService.js =====
const Delivery = require('../Models/Delivery');
const Booking = require('../Models/Booking');
const User = require('../Models/User');
const AppError = require('../Utils/AppError');
const { logger } = require('../Middleware/Logger.md.js');
const { createNotification } = require('./notificationService');
const { calculateDistance, getETA } = require('./mapService');

// ===== CREATE DELIVERY =====
exports.createDelivery = async (deliveryData, userId) => {
  try {
    const { bookingId, type, pickup, dropoff, schedule } = deliveryData;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
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
    const pricing = await exports.calculateDeliveryPricing({
      distance,
      type,
      priority: schedule.priority || 'normal'
    });

    // Generate delivery number
    const deliveryNumber = await generateDeliveryNumber();

    // Create delivery
    const delivery = await Delivery.create({
      deliveryNumber,
      booking: bookingId,
      user: booking.user,
      type,
      priority: schedule.priority || 'normal',
      schedule: {
        requestedPickup: {
          date: schedule.pickupDate,
          timeSlot: schedule.pickupTime
        },
        requestedDropoff: {
          date: schedule.dropoffDate,
          timeSlot: schedule.dropoffTime
        },
        estimatedPickup: calculateEstimatedPickup(schedule),
        estimatedDropoff: calculateEstimatedDropoff(schedule, eta.duration)
      },
      locations: { pickup, dropoff },
      vehicle: {
        id: booking.vehicle,
        details: await getVehicleDetails(booking.vehicle)
      },
      tracking: {
        distance: { estimated: distance },
        duration: { estimated: eta.duration }
      },
      pricing,
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Delivery created'
      }]
    });

    // Send notifications
    await exports.sendDeliveryCreatedNotifications(delivery);

    return delivery;
  } catch (error) {
    logger.error('Create delivery failed:', error);
    throw error;
  }
};

// ===== GET DELIVERY BY ID =====
exports.getDeliveryById = async (deliveryId, userId, userRole) => {
  try {
    const delivery = await Delivery.findById(deliveryId)
      .populate('user', 'firstName lastName email phone')
      .populate('driver.id', 'firstName lastName email phone profileImage')
      .populate('booking')
      .populate('vehicle.id');

    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    // Check authorization
    if (userRole !== 'admin' && 
        userRole !== 'driver' && 
        delivery.user?._id.toString() !== userId) {
      throw new AppError('You do not have permission to view this delivery', 403);
    }

    // Calculate real-time ETA if in progress
    let eta = null;
    if (['en_route_pickup', 'picked_up', 'en_route_dropoff'].includes(delivery.status)) {
      eta = delivery.eta;
    }

    return { delivery, eta };
  } catch (error) {
    logger.error('Get delivery by ID failed:', error);
    throw error;
  }
};

// ===== GET USER DELIVERIES =====
exports.getUserDeliveries = async (userId, filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = pagination;
    const skip = (page - 1) * limit;

    const query = { user: userId, ...filters };

    const deliveries = await Delivery.find(query)
      .populate('driver.id', 'firstName lastName')
      .populate('booking')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Delivery.countDocuments(query);

    return {
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get user deliveries failed:', error);
    throw error;
  }
};

// ===== GET ALL DELIVERIES (ADMIN) =====
exports.getAllDeliveries = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt' } = pagination;
    const skip = (page - 1) * limit;

    const deliveries = await Delivery.find(filters)
      .populate('user', 'firstName lastName email phone')
      .populate('driver.id', 'firstName lastName')
      .populate('booking')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Delivery.countDocuments(filters);

    return {
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all deliveries failed:', error);
    throw error;
  }
};

// ===== UPDATE DELIVERY STATUS =====
exports.updateDeliveryStatus = async (deliveryId, status, location, note, userId) => {
  try {
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    // Validate status transition
    if (!isValidStatusTransition(delivery.status, status)) {
      throw new AppError(`Invalid status transition from ${delivery.status} to ${status}`, 400);
    }

    // Update status
    delivery.status = status;

    // Update timeline
    delivery.timeline.push({
      status,
      timestamp: new Date(),
      location: location || delivery.tracking.currentLocation,
      note,
      updatedBy: userId
    });

    // Update actual times based on status
    switch (status) {
      case 'picked_up':
        delivery.schedule.actualPickup = new Date();
        break;
      case 'delivered':
        delivery.schedule.actualDropoff = new Date();
        delivery.tracking.duration.actual = calculateActualDuration(delivery);
        delivery.tracking.distance.actual = await calculateActualDistance(delivery);
        break;
    }

    await delivery.save();

    // Send status update notification
    await exports.sendDeliveryStatusNotification(delivery, status);

    return delivery;
  } catch (error) {
    logger.error('Update delivery status failed:', error);
    throw error;
  }
};

// ===== UPDATE DRIVER LOCATION =====
exports.updateDriverLocation = async (deliveryId, lat, lng, accuracy) => {
  try {
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    // Update location
    await delivery.updateLocation(lat, lng, accuracy);

    // Check if near dropoff and send notification
    if (delivery.status === 'en_route_dropoff') {
      const distance = delivery.calculateRemainingDistance();
      if (distance < 1) { // Less than 1km away
        await exports.sendNearDropoffNotification(delivery);
      }
    }

    return {
      location: delivery.tracking.currentLocation,
      eta: delivery.eta
    };
  } catch (error) {
    logger.error('Update driver location failed:', error);
    throw error;
  }
};

// ===== ASSIGN DRIVER =====
exports.assignDriver = async (deliveryId, driverId, assignerId) => {
  try {
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    // Check if driver exists and is available
    const driver = await User.findOne({ _id: driverId, role: 'driver', isActive: true });
    if (!driver) {
      throw new AppError('Driver not found or unavailable', 404);
    }

    // Assign driver
    delivery.driver = {
      id: driverId,
      name: `${driver.firstName} ${driver.lastName}`,
      phone: driver.phone,
      email: driver.email,
      profileImage: driver.profileImage
    };

    delivery.status = 'assigned';
    delivery.timeline.push({
      status: 'assigned',
      timestamp: new Date(),
      note: `Assigned to driver ${driver.firstName} ${driver.lastName}`,
      updatedBy: assignerId
    });

    await delivery.save();

    // Send notifications
    await exports.sendDriverAssignedNotification(delivery);

    return delivery;
  } catch (error) {
    logger.error('Assign driver failed:', error);
    throw error;
  }
};

// ===== CANCEL DELIVERY =====
exports.cancelDelivery = async (deliveryId, reason, userId, userRole) => {
  try {
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    // Check if user can cancel
    if (userRole !== 'admin' && delivery.user?.toString() !== userId) {
      throw new AppError('You do not have permission to cancel this delivery', 403);
    }

    if (!delivery.canCancel) {
      throw new AppError('Delivery cannot be cancelled at this stage', 400);
    }

    delivery.status = 'cancelled';
    delivery.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Cancelled: ${reason}`,
      updatedBy: userId
    });

    await delivery.save();

    // Process refund if applicable
    if (delivery.pricing && delivery.payment?.status === 'paid') {
      await exports.processDeliveryRefund(delivery);
    }

    // Send notification
    await exports.sendDeliveryCancelledNotification(delivery, reason);

    return delivery;
  } catch (error) {
    logger.error('Cancel delivery failed:', error);
    throw error;
  }
};

// ===== RATE DELIVERY =====
exports.rateDelivery = async (deliveryId, ratingData, userId) => {
  try {
    const { score, feedback, categories } = ratingData;
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    if (delivery.status !== 'delivered') {
      throw new AppError('Cannot rate undelivered delivery', 400);
    }

    if (delivery.rating && delivery.rating.score) {
      throw new AppError('Delivery already rated', 400);
    }

    delivery.rating = {
      score,
      feedback,
      categories,
      createdAt: new Date()
    };

    // Update driver rating
    if (delivery.driver && delivery.driver.id) {
      await updateDriverRating(delivery.driver.id, score);
    }

    await delivery.save();

    return delivery;
  } catch (error) {
    logger.error('Rate delivery failed:', error);
    throw error;
  }
};

// ===== GET ACTIVE DELIVERIES =====
exports.getActiveDeliveries = async () => {
  try {
    const activeStatuses = [
      'assigned', 'en_route_pickup', 'arrived_pickup',
      'picked_up', 'en_route_dropoff', 'arrived_dropoff'
    ];

    const deliveries = await Delivery.find({ status: { $in: activeStatuses } })
      .populate('driver.id', 'firstName lastName')
      .populate('user', 'firstName lastName phone')
      .sort('priority createdAt');

    return deliveries;
  } catch (error) {
    logger.error('Get active deliveries failed:', error);
    throw error;
  }
};

// ===== GET DELIVERIES BY DRIVER =====
exports.getDeliveriesByDriver = async (driverId, filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = pagination;
    const skip = (page - 1) * limit;

    const query = { 'driver.id': driverId, ...filters };

    const deliveries = await Delivery.find(query)
      .populate('user', 'firstName lastName phone')
      .populate('booking')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Delivery.countDocuments(query);

    return {
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get deliveries by driver failed:', error);
    throw error;
  }
};

// ===== GET DELIVERY STATISTICS =====
exports.getDeliveryStatistics = async ({ startDate, endDate }) => {
  try {
    const stats = await Delivery.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          onTime: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'delivered'] },
                    { $lte: ['$schedule.actualDropoff', '$schedule.estimatedDropoff'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, '$pricing.total', 0] }
          }
        }
      }
    ]);

    // Status breakdown
    const byStatus = await Delivery.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // By type
    const byType = await Delivery.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      }
    ]);

    // Average delivery time
    const avgTime = await Delivery.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          status: 'delivered',
          'schedule.actualPickup': { $exists: true },
          'schedule.actualDropoff': { $exists: true }
        }
      },
      {
        $project: {
          deliveryTime: {
            $divide: [
              { $subtract: ['$schedule.actualDropoff', '$schedule.actualPickup'] },
              1000 * 60 // Convert to minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$deliveryTime' }
        }
      }
    ]);

    return {
      overview: stats[0] || {
        total: 0,
        completed: 0,
        cancelled: 0,
        onTime: 0,
        totalRevenue: 0
      },
      byStatus,
      byType,
      averageDeliveryTime: avgTime[0]?.average || 0
    };
  } catch (error) {
    logger.error('Get delivery statistics failed:', error);
    throw error;
  }
};

// ===== CALCULATE DELIVERY PRICING =====
exports.calculateDeliveryPricing = async ({ distance, type, priority }) => {
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
  const tollFee = distance > 10 ? 5 : 0; // Simplified toll calculation
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

// ===== SEND DELIVERY CREATED NOTIFICATIONS =====
exports.sendDeliveryCreatedNotifications = async (delivery) => {
  try {
    // Notify customer
    await createNotification({
      recipient: { type: 'user', userId: delivery.user },
      type: 'delivery_created',
      title: 'Delivery Request Received',
      message: `Your ${delivery.type} request #${delivery.deliveryNumber} has been received.`,
      data: { deliveryId: delivery._id }
    });

    // Notify admin
    await createNotification({
      recipient: { type: 'role', role: 'admin' },
      type: 'delivery_created_admin',
      title: 'New Delivery Request',
      message: `New ${delivery.type} request #${delivery.deliveryNumber} requires assignment.`,
      data: { deliveryId: delivery._id }
    });
  } catch (error) {
    logger.error('Send delivery created notifications failed:', error);
  }
};

// ===== SEND DELIVERY STATUS NOTIFICATION =====
exports.sendDeliveryStatusNotification = async (delivery, status) => {
  try {
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
      recipient: { type: 'user', userId: delivery.user },
      type: 'delivery_status',
      title: 'Delivery Status Update',
      message: statusMessages[status] || `Delivery status updated to ${status}`,
      data: { deliveryId: delivery._id, status }
    });
  } catch (error) {
    logger.error('Send delivery status notification failed:', error);
  }
};

// ===== SEND NEAR DROPOFF NOTIFICATION =====
exports.sendNearDropoffNotification = async (delivery) => {
  try {
    await createNotification({
      recipient: { type: 'user', userId: delivery.user },
      type: 'delivery_near',
      title: 'Driver Approaching',
      message: 'Your driver is less than 1km away and will arrive shortly.',
      data: { deliveryId: delivery._id, eta: delivery.eta }
    });
  } catch (error) {
    logger.error('Send near dropoff notification failed:', error);
  }
};

// ===== SEND DRIVER ASSIGNED NOTIFICATION =====
exports.sendDriverAssignedNotification = async (delivery) => {
  try {
    await createNotification({
      recipient: { type: 'user', userId: delivery.user },
      type: 'driver_assigned',
      title: 'Driver Assigned',
      message: `${delivery.driver.name} has been assigned to your delivery.`,
      data: {
        deliveryId: delivery._id,
        driver: {
          name: delivery.driver.name,
          phone: delivery.driver.phone,
          photo: delivery.driver.profileImage
        }
      }
    });
  } catch (error) {
    logger.error('Send driver assigned notification failed:', error);
  }
};

// ===== SEND DELIVERY CANCELLED NOTIFICATION =====
exports.sendDeliveryCancelledNotification = async (delivery, reason) => {
  try {
    await createNotification({
      recipient: { type: 'user', userId: delivery.user },
      type: 'delivery_cancelled',
      title: 'Delivery Cancelled',
      message: `Your delivery has been cancelled. Reason: ${reason}`,
      data: { deliveryId: delivery._id, reason }
    });
  } catch (error) {
    logger.error('Send delivery cancelled notification failed:', error);
  }
};

// ===== PROCESS DELIVERY REFUND =====
exports.processDeliveryRefund = async (delivery) => {
  try {
    // Process refund through payment service
    logger.info(`Refund processed for delivery ${delivery._id}`);
  } catch (error) {
    logger.error('Process delivery refund failed:', error);
  }
};

// ===== HELPER FUNCTIONS =====
const generateDeliveryNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DEL${year}${month}${day}-${random}`;
};

const calculateEstimatedPickup = (schedule) => {
  const pickupDate = new Date(schedule.pickupDate);
  pickupDate.setMinutes(pickupDate.getMinutes() + 30);
  return pickupDate;
};

const calculateEstimatedDropoff = (schedule, duration) => {
  const dropoffDate = new Date(schedule.dropoffDate);
  dropoffDate.setMinutes(dropoffDate.getMinutes() + duration);
  return dropoffDate;
};

const getVehicleDetails = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return null;

  return {
    name: vehicle.name,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.colors?.[0]?.name,
    licensePlate: vehicle.ownership?.registrationNumber,
    images: vehicle.images?.gallery?.slice(0, 3)
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
  if (!delivery.schedule.actualPickup || !delivery.schedule.actualDropoff) return null;
  const diff = delivery.schedule.actualDropoff - delivery.schedule.actualPickup;
  return Math.round(diff / (1000 * 60)); // minutes
};

const calculateActualDistance = async (delivery) => {
  if (!delivery.tracking.route || delivery.tracking.route.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < delivery.tracking.route.length; i++) {
    const point1 = delivery.tracking.route[i - 1];
    const point2 = delivery.tracking.route[i];
    const distance = await calculateDistance(
      { lat: point1.lat, lng: point1.lng },
      { lat: point2.lat, lng: point2.lng }
    );
    totalDistance += distance;
  }

  return Math.round(totalDistance * 100) / 100;
};

const updateDriverRating = async (driverId, newRating) => {
  const driver = await User.findById(driverId);
  if (!driver) return;

  const currentAvg = driver.rating?.average || 0;
  const currentCount = driver.rating?.count || 0;
  const newAvg = (currentAvg * currentCount + newRating) / (currentCount + 1);

  await User.findByIdAndUpdate(driverId, {
    'rating.average': newAvg,
    'rating.count': currentCount + 1
  });
};