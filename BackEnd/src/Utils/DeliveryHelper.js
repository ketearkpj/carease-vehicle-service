// ===== src/utils/deliveryHelper.js =====
const { generateDeliveryNumber } = require('./Helpers');

/**
 * Calculate delivery pricing based on distance and type
 */
exports.calculateDeliveryPricing = async ({
  distance = 0,
  type = 'standard',
  priority = 'normal'
}) => {
  // Base rates
  const baseRates = {
    standard: 35,
    express: 50,
    same_day: 75,
    overnight: 100
  };

  const baseFee = baseRates[type] || 35;
  const distanceFee = distance * 2.5; // $2.50 per km

  // Surge pricing for rush hours and high demand
  const surgeFee = priority === 'urgent' ? baseFee * 0.5 : 0;

  // Toll estimation (can be refined with actual toll APIs)
  const tollFee = distance > 50 ? 15 : 0;

  // Calculate tax (assuming 10%)
  const subtotal = baseFee + distanceFee + surgeFee + tollFee;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return {
    baseFee,
    distanceFee,
    surgeFee,
    tollFee,
    subtotal,
    tax,
    total,
    currency: 'USD'
  };
};

/**
 * Calculate estimated pickup time based on schedule
 */
exports.calculateEstimatedPickup = (schedule) => {
  if (!schedule || !schedule.pickupDate || !schedule.pickupTime) {
    return new Date(Date.now() + 30 * 60000); // Default: 30 minutes from now
  }

  const date = new Date(schedule.pickupDate);
  const [hours, minutes] = schedule.pickupTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0);

  return date;
};

/**
 * Calculate estimated dropoff time based on schedule and estimated duration
 */
exports.calculateEstimatedDropoff = (schedule, estimatedDurationMinutes = 30) => {
  let estimatedDropoff;

  if (schedule && schedule.dropoffDate && schedule.dropoffTime) {
    estimatedDropoff = new Date(schedule.dropoffDate);
    const [hours, minutes] = schedule.dropoffTime.split(':');
    estimatedDropoff.setHours(parseInt(hours), parseInt(minutes), 0);
  } else {
    estimatedDropoff = new Date(Date.now() + estimatedDurationMinutes * 60000);
  }

  return estimatedDropoff;
};

/**
 * Validate delivery status transitions
 */
exports.isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    pending: ['assigned', 'cancelled'],
    assigned: ['en_route_pickup', 'cancelled'],
    en_route_pickup: ['arrived_pickup', 'cancelled'],
    arrived_pickup: ['picked_up', 'cancelled'],
    picked_up: ['en_route_dropoff', 'cancelled'],
    en_route_dropoff: ['arrived_dropoff'],
    arrived_dropoff: ['delivered'],
    delivered: [],
    cancelled: []
  };

  return Array.isArray(validTransitions[currentStatus])
    && validTransitions[currentStatus].includes(newStatus);
};

/**
 * Calculate actual delivery duration in minutes
 */
exports.calculateActualDuration = (delivery) => {
  if (!delivery.actualPickup || !delivery.actualDropoff) {
    return null;
  }

  const pickupTime = new Date(delivery.actualPickup);
  const dropoffTime = new Date(delivery.actualDropoff);
  const duration = (dropoffTime - pickupTime) / (1000 * 60); // Convert to minutes

  return Math.round(duration);
};

/**
 * Calculate actual distance traveled (uses coordinates from delivery timeline)
 */
exports.calculateActualDistance = async (delivery) => {
  // This would integrate with map service to calculate actual route distance
  // For now, return estimated distance as fallback
  return delivery.estimatedDistance;
};

/**
 * Generate delivery notifications data
 */
exports.prepareSendDeliveryCreatedNotifications = (delivery) => {
  return {
    customer: {
      userId: delivery.userId,
      title: 'Delivery Request Created',
      message: `Your delivery request #${delivery.deliveryNumber} has been created`,
      type: 'delivery_created'
    },
    admin: {
      title: 'New Delivery Request',
      message: `New delivery request #${delivery.deliveryNumber} - ${delivery.type} (${delivery.priority})`,
      type: 'delivery_alert'
    }
  };
};

/**
 * Generate delivery status notification
 */
exports.prepareSendDeliveryStatusNotification = (delivery, status) => {
  const statusMessages = {
    assigned: 'Your delivery has been assigned to a driver',
    en_route_pickup: 'Driver is on the way to pickup',
    arrived_pickup: 'Driver has arrived at pickup location',
    picked_up: 'Your delivery has been picked up',
    en_route_dropoff: 'Driver is on the way to delivery',
    arrived_dropoff: 'Driver has arrived at your location',
    delivered: 'Your delivery has been completed',
    cancelled: 'Your delivery has been cancelled'
  };

  return {
    userId: delivery.userId,
    title: 'Delivery Status Update',
    message: statusMessages[status] || `Delivery status: ${status}`,
    type: 'delivery_status',
    data: {
      deliveryId: delivery.id,
      deliveryNumber: delivery.deliveryNumber,
      status
    }
  };
};
