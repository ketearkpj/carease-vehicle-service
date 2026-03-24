// ===== src/Services/delivery.service.js =====
/**
 * DELIVERY SERVICE - GOD MODE
 * Real delivery management with real-time tracking and multiple carrier integration
 * Supports: Uber Direct, DoorDash Drive, Courier API, Google Maps integration
 */

import axios from 'axios';
import { buildApiUrl } from '../Config/API';
import { getDistanceMatrix, getDeliveryEstimate as getLocationEstimate } from './location.service';

// API base URL
const API_BASE_URL = buildApiUrl('/deliveries');

// Delivery carrier configurations
const DELIVERY_CARRIERS = {
  UBER: 'uber',
  DOORDASH: 'doordash',
  COURIER: 'courier',
  IN_HOUSE: 'in_house'
};

// Delivery status types
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  NEARBY: 'nearby',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
};

export const DELIVERY_STATUS_LABELS = {
  [DELIVERY_STATUS.PENDING]: 'Pending Assignment',
  [DELIVERY_STATUS.ASSIGNED]: 'Driver Assigned',
  [DELIVERY_STATUS.PICKED_UP]: 'Picked Up',
  [DELIVERY_STATUS.IN_TRANSIT]: 'On The Way',
  [DELIVERY_STATUS.NEARBY]: 'Nearby',
  [DELIVERY_STATUS.DELIVERED]: 'Delivered',
  [DELIVERY_STATUS.FAILED]: 'Delivery Failed',
  [DELIVERY_STATUS.CANCELLED]: 'Cancelled',
  [DELIVERY_STATUS.RETURNED]: 'Returned'
};

export const DELIVERY_STATUS_COLORS = {
  [DELIVERY_STATUS.PENDING]: 'warning',
  [DELIVERY_STATUS.ASSIGNED]: 'info',
  [DELIVERY_STATUS.PICKED_UP]: 'info',
  [DELIVERY_STATUS.IN_TRANSIT]: 'gold',
  [DELIVERY_STATUS.NEARBY]: 'success',
  [DELIVERY_STATUS.DELIVERED]: 'success',
  [DELIVERY_STATUS.FAILED]: 'error',
  [DELIVERY_STATUS.CANCELLED]: 'error',
  [DELIVERY_STATUS.RETURNED]: 'secondary'
};

// Delivery types
export const DELIVERY_TYPES = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  SCHEDULED: 'scheduled',
  WHITE_GLOVE: 'white_glove'
};

/**
 * Create a new delivery
 * @param {Object} deliveryData - Delivery details
 * @returns {Promise<Object>} - Created delivery
 */
export const createDelivery = async (deliveryData) => {
  try {
    // Validate delivery data
    validateDeliveryData(deliveryData);

    // Calculate delivery estimate
    const estimate = await calculateDeliveryEstimate(
      deliveryData.pickupLocation,
      deliveryData.dropoffLocation,
      deliveryData.type || DELIVERY_TYPES.STANDARD
    );

    // Select best carrier based on location and requirements
    const carrier = await selectOptimalCarrier(deliveryData, estimate);

    // Create delivery in database
    const response = await axios.post(`${API_BASE_URL}/create`, {
      ...deliveryData,
      estimate,
      carrier,
      status: DELIVERY_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      trackingId: generateTrackingId()
    });

    const delivery = response.data;

    // Assign driver based on carrier
    await assignDriver(delivery.id, carrier);

    // Send notifications
    await sendDeliveryNotifications(delivery);

    return {
      success: true,
      delivery,
      message: 'Delivery created successfully'
    };
  } catch (error) {
    console.error('Failed to create delivery:', error);
    throw new Error(error.response?.data?.message || 'Failed to create delivery');
  }
};

/**
 * Validate delivery data
 * @param {Object} data - Delivery data to validate
 */
const validateDeliveryData = (data) => {
  const { pickupLocation, dropoffLocation, items, customerName, customerPhone } = data;

  if (!pickupLocation) {
    throw new Error('Pickup location is required');
  }

  if (!dropoffLocation) {
    throw new Error('Dropoff location is required');
  }

  if (!items || items.length === 0) {
    throw new Error('At least one item is required');
  }

  if (!customerName) {
    throw new Error('Customer name is required');
  }

  if (!customerPhone) {
    throw new Error('Customer phone is required');
  }

  // Validate items
  items.forEach((item, index) => {
    if (!item.name) {
      throw new Error(`Item ${index + 1} name is required`);
    }
    if (!item.quantity || item.quantity < 1) {
      throw new Error(`Item ${index + 1} quantity must be at least 1`);
    }
  });
};

/**
 * Generate unique tracking ID
 * @returns {string} - Tracking ID
 */
const generateTrackingId = () => {
  const prefix = 'CE';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

/**
 * Calculate delivery estimate
 * @param {Object} pickup - Pickup location
 * @param {Object} dropoff - Dropoff location
 * @param {string} type - Delivery type
 * @returns {Promise<Object>} - Delivery estimate
 */
export const calculateDeliveryEstimate = async (pickup, dropoff, type = DELIVERY_TYPES.STANDARD) => {
  try {
    const matrix = await getDistanceMatrix(pickup, dropoff, 'driving');

    // Base rates per km
    const rates = {
      [DELIVERY_TYPES.STANDARD]: 2.5,
      [DELIVERY_TYPES.EXPRESS]: 5.0,
      [DELIVERY_TYPES.SCHEDULED]: 3.0,
      [DELIVERY_TYPES.WHITE_GLOVE]: 10.0
    };

    const distanceKm = matrix.distance.value / 1000;
    const baseCost = distanceKm * (rates[type] || rates.standard);

    // Calculate delivery time based on type
    let deliveryTime = matrix.duration.value;
    if (type === DELIVERY_TYPES.EXPRESS) {
      deliveryTime = deliveryTime * 0.7; // 30% faster
    }

    // Additional fees
    const surgeMultiplier = await getSurgeMultiplier(dropoff);
    const tolls = await estimateTolls(pickup, dropoff);

    const totalCost = (baseCost * surgeMultiplier) + tolls;

    return {
      distance: matrix.distance,
      duration: matrix.duration,
      deliveryTime: Math.round(deliveryTime / 60), // in minutes
      cost: {
        base: Math.round(baseCost * 100) / 100,
        surge: surgeMultiplier,
        tolls,
        total: Math.round(totalCost * 100) / 100,
        currency: 'USD'
      },
      estimatedPickup: calculatePickupTime(type),
      estimatedDelivery: new Date(Date.now() + deliveryTime * 1000).toISOString()
    };
  } catch (error) {
    console.error('Failed to calculate delivery estimate:', error);
    throw new Error('Failed to calculate delivery estimate');
  }
};

/**
 * Calculate pickup time based on delivery type
 * @param {string} type - Delivery type
 * @returns {string} - Estimated pickup time
 */
const calculatePickupTime = (type) => {
  const now = new Date();
  let minutes = 30; // Default 30 minutes

  switch (type) {
    case DELIVERY_TYPES.EXPRESS:
      minutes = 15;
      break;
    case DELIVERY_TYPES.SCHEDULED:
      minutes = 60;
      break;
    case DELIVERY_TYPES.WHITE_GLOVE:
      minutes = 45;
      break;
  }

  return new Date(now.getTime() + minutes * 60000).toISOString();
};

/**
 * Select optimal carrier based on location and requirements
 * @param {Object} deliveryData - Delivery details
 * @param {Object} estimate - Delivery estimate
 * @returns {Promise<string>} - Selected carrier
 */
const selectOptimalCarrier = async (deliveryData, estimate) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/select-carrier`, {
      ...deliveryData,
      estimate
    });

    return response.data.carrier;
  } catch (error) {
    // Fallback to in-house delivery
    return DELIVERY_CARRIERS.IN_HOUSE;
  }
};

/**
 * Assign driver to delivery
 * @param {string} deliveryId - Delivery ID
 * @param {string} carrier - Selected carrier
 * @returns {Promise<Object>} - Assigned driver
 */
const assignDriver = async (deliveryId, carrier) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${deliveryId}/assign-driver`, {
      carrier
    });

    return response.data;
  } catch (error) {
    console.error('Failed to assign driver:', error);
    return null;
  }
};

/**
 * Get delivery by ID
 * @param {string} deliveryId - Delivery ID
 * @returns {Promise<Object>} - Delivery details
 */
export const getDeliveryById = async (deliveryId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${deliveryId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch delivery:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch delivery');
  }
};

/**
 * Get delivery by tracking ID
 * @param {string} trackingId - Tracking ID
 * @returns {Promise<Object>} - Delivery details
 */
export const getDeliveryByTrackingId = async (trackingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/track/${trackingId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to track delivery:', error);
    throw new Error(error.response?.data?.message || 'Failed to track delivery');
  }
};

/**
 * Update delivery status
 * @param {string} deliveryId - Delivery ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data
 * @returns {Promise<Object>} - Updated delivery
 */
export const updateDeliveryStatus = async (deliveryId, status, additionalData = {}) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/${deliveryId}/status`, {
      status,
      ...additionalData,
      updatedAt: new Date().toISOString()
    });

    // Send status update notification
    await sendStatusUpdateNotification(deliveryId, status);

    return response.data;
  } catch (error) {
    console.error('Failed to update delivery status:', error);
    throw new Error(error.response?.data?.message || 'Failed to update delivery status');
  }
};

/**
 * Track delivery in real-time
 * @param {string} trackingId - Tracking ID
 * @param {Function} onUpdate - Update callback
 * @returns {Function} - Unsubscribe function
 */
export const trackDelivery = (trackingId, onUpdate) => {
  let eventSource = null;
  let interval = null;

  // Try WebSocket first
  try {
    eventSource = new EventSource(`${API_BASE_URL}/track/${trackingId}/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    eventSource.onerror = () => {
      eventSource.close();
      startPolling();
    };
  } catch (error) {
    startPolling();
  }

  const startPolling = () => {
    interval = setInterval(async () => {
      try {
        const delivery = await getDeliveryByTrackingId(trackingId);
        onUpdate(delivery);
      } catch (error) {
        console.error('Tracking polling error:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  // Return unsubscribe function
  return () => {
    if (eventSource) {
      eventSource.close();
    }
    if (interval) {
      clearInterval(interval);
    }
  };
};

/**
 * Get driver location in real-time
 * @param {string} deliveryId - Delivery ID
 * @returns {Promise<Object>} - Driver location
 */
export const getDriverLocation = async (deliveryId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${deliveryId}/driver-location`);
    return response.data;
  } catch (error) {
    console.error('Failed to get driver location:', error);
    throw new Error(error.response?.data?.message || 'Failed to get driver location');
  }
};

/**
 * Calculate estimated time of arrival
 * @param {string} deliveryId - Delivery ID
 * @returns {Promise<Object>} - ETA
 */
export const calculateETA = async (deliveryId) => {
  try {
    const delivery = await getDeliveryById(deliveryId);
    const driverLocation = await getDriverLocation(deliveryId);

    if (!driverLocation) {
      return { eta: null, message: 'Driver location unavailable' };
    }

    const matrix = await getDistanceMatrix(
      driverLocation,
      delivery.dropoffLocation,
      'driving'
    );

    const etaMinutes = Math.round(matrix.duration.value / 60);

    return {
      eta: etaMinutes,
      etaText: matrix.duration.text,
      distance: matrix.distance.text,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to calculate ETA:', error);
    return { eta: null, message: 'Unable to calculate ETA' };
  }
};

/**
 * Cancel delivery
 * @param {string} deliveryId - Delivery ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} - Cancellation result
 */
export const cancelDelivery = async (deliveryId, reason = '') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${deliveryId}/cancel`, {
      reason,
      cancelledAt: new Date().toISOString()
    });

    // Send cancellation notification
    await sendCancellationNotification(deliveryId, reason);

    return response.data;
  } catch (error) {
    console.error('Failed to cancel delivery:', error);
    throw new Error(error.response?.data?.message || 'Failed to cancel delivery');
  }
};

/**
 * Rate delivery
 * @param {string} deliveryId - Delivery ID
 * @param {number} rating - Rating (1-5)
 * @param {string} feedback - Feedback text
 * @returns {Promise<Object>} - Rating result
 */
export const rateDelivery = async (deliveryId, rating, feedback = '') => {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const response = await axios.post(`${API_BASE_URL}/${deliveryId}/rate`, {
      rating,
      feedback,
      ratedAt: new Date().toISOString()
    });

    return response.data;
  } catch (error) {
    console.error('Failed to rate delivery:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit rating');
  }
};

/**
 * Get delivery history for user
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Delivery history
 */
export const getUserDeliveryHistory = async (userId, filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate
      }
    });

    return {
      deliveries: response.data.deliveries,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    console.error('Failed to fetch delivery history:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch delivery history');
  }
};

/**
 * Get surge multiplier based on time and location
 * @param {Object} location - Location coordinates
 * @returns {Promise<number>} - Surge multiplier
 */
const getSurgeMultiplier = async (location) => {
  try {
    const hour = new Date().getHours();

    // Peak hours multiplier (5 PM - 8 PM)
    if (hour >= 17 && hour <= 20) {
      return 1.5;
    }

    // Late night multiplier (11 PM - 5 AM)
    if (hour >= 23 || hour <= 5) {
      return 1.3;
    }

    // Check if location is in busy area via API
    const response = await axios.post(`${API_BASE_URL}/surge`, { location });
    return response.data.multiplier || 1.0;
  } catch (error) {
    return 1.0;
  }
};

/**
 * Estimate toll costs
 * @param {Object} origin - Origin location
 * @param {Object} destination - Destination location
 * @returns {Promise<number>} - Estimated toll cost
 */
const estimateTolls = async (origin, destination) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tolls`, {
      origin,
      destination
    });
    return response.data.tollCost || 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Send delivery notifications
 * @param {Object} delivery - Delivery details
 */
const sendDeliveryNotifications = async (delivery) => {
  try {
    await axios.post(`${API_BASE_URL}/${delivery.id}/notifications`, {
      type: 'delivery_created',
      delivery
    });
  } catch (error) {
    console.error('Failed to send notifications:', error);
  }
};

/**
 * Send status update notification
 * @param {string} deliveryId - Delivery ID
 * @param {string} status - New status
 */
const sendStatusUpdateNotification = async (deliveryId, status) => {
  try {
    await axios.post(`${API_BASE_URL}/${deliveryId}/notifications/status`, {
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to send status notification:', error);
  }
};

/**
 * Send cancellation notification
 * @param {string} deliveryId - Delivery ID
 * @param {string} reason - Cancellation reason
 */
const sendCancellationNotification = async (deliveryId, reason) => {
  try {
    await axios.post(`${API_BASE_URL}/${deliveryId}/notifications/cancellation`, {
      reason,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to send cancellation notification:', error);
  }
};

/**
 * Schedule a delivery
 * @param {Object} scheduleData - Schedule details
 * @returns {Promise<Object>} - Scheduled delivery
 */
export const scheduleDelivery = async (scheduleData) => {
  try {
    const { pickupTime, dropoffTime, ...deliveryData } = scheduleData;

    // Validate scheduled times
    const pickupDateTime = new Date(pickupTime);
    const dropoffDateTime = new Date(dropoffTime);

    if (pickupDateTime < new Date()) {
      throw new Error('Pickup time must be in the future');
    }

    if (dropoffDateTime <= pickupDateTime) {
      throw new Error('Dropoff time must be after pickup time');
    }

    const response = await axios.post(`${API_BASE_URL}/schedule`, {
      ...deliveryData,
      pickupTime: pickupDateTime.toISOString(),
      dropoffTime: dropoffDateTime.toISOString(),
      type: DELIVERY_TYPES.SCHEDULED,
      status: DELIVERY_STATUS.PENDING,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      delivery: response.data,
      message: 'Delivery scheduled successfully'
    };
  } catch (error) {
    console.error('Failed to schedule delivery:', error);
    throw new Error(error.response?.data?.message || 'Failed to schedule delivery');
  }
};

/**
 * Get available delivery slots
 * @param {string} date - Date to check
 * @param {Object} location - Delivery location
 * @returns {Promise<Array>} - Available time slots
 */
export const getAvailableDeliverySlots = async (date, location) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/available-slots`, {
      params: { date, lat: location.lat, lng: location.lng }
    });

    return response.data.slots;
  } catch (error) {
    console.error('Failed to fetch delivery slots:', error);
    return [];
  }
};

/**
 * Calculate delivery cost
 * @param {Object} params - Cost calculation parameters
 * @returns {Promise<Object>} - Cost breakdown
 */
export const calculateDeliveryCost = async (params) => {
  try {
    const { pickup, dropoff, type = DELIVERY_TYPES.STANDARD, items = [] } = params;

    const estimate = await getLocationEstimate(pickup, dropoff, type);

    // Add item handling fees
    const itemFee = items.reduce((total, item) => {
      return total + (item.handlingFee || 0) * (item.quantity || 1);
    }, 0);

    // Add weight-based fee if applicable
    const totalWeight = items.reduce((total, item) => {
      return total + (item.weight || 0) * (item.quantity || 1);
    }, 0);

    const weightFee = totalWeight * 0.5; // $0.50 per kg

    const totalCost = estimate.cost.total + itemFee + weightFee;

    return {
      baseCost: estimate.cost.total,
      itemFee,
      weightFee,
      total: Math.round(totalCost * 100) / 100,
      currency: 'USD',
      breakdown: {
        distance: estimate.distance,
        duration: estimate.duration,
        surge: estimate.cost.surge,
        tolls: estimate.cost.tolls
      }
    };
  } catch (error) {
    console.error('Failed to calculate delivery cost:', error);
    throw new Error('Failed to calculate delivery cost');
  }
};

// Export all delivery functions
export default {
  // Constants
  DELIVERY_STATUS,
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
  DELIVERY_TYPES,
  DELIVERY_CARRIERS,

  // Core functions
  createDelivery,
  getDeliveryById,
  getDeliveryByTrackingId,
  updateDeliveryStatus,
  cancelDelivery,
  rateDelivery,
  trackDelivery,
  getDriverLocation,
  calculateETA,
  getUserDeliveryHistory,
  scheduleDelivery,
  getAvailableDeliverySlots,
  calculateDeliveryCost,
  calculateDeliveryEstimate
};
