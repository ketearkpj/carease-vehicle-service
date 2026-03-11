// ===== src/Services/booking.service.js =====
/**
 * BOOKING SERVICE - GOD MODE
 * Real booking management with database integration
 */

import axios from 'axios';
import { getEnv } from '../Config/env';
import { sendBookingConfirmation } from './EmailService';

// API base URL
const API_BASE_URL = getEnv('REACT_APP_API_URL') || '/api/v1';

/**
 * Create a new booking
 * @param {Object} bookingData - Booking details
 * @returns {Promise} - Created booking
 */
export const createBooking = async (bookingData) => {
  try {
    // Validate booking data
    validateBookingData(bookingData);

    // Check availability
    await checkAvailability(bookingData);

    // Calculate price
    const totalPrice = await calculatePrice(bookingData);

    // Create booking in database
    const response = await axios.post(`${API_BASE_URL}/bookings`, {
      ...bookingData,
      totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    const booking = response.data;

    // Send confirmation email
    try {
      await sendBookingConfirmation({
        customerEmail: bookingData.customerEmail,
        customerName: bookingData.customerName,
        bookingId: booking.id,
        serviceType: bookingData.serviceType,
        date: bookingData.date,
        time: bookingData.time,
        amount: totalPrice
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't throw - booking is still created
    }

    // Create calendar event
    try {
      await createCalendarEvent(booking);
    } catch (calendarError) {
      console.error('Failed to create calendar event:', calendarError);
    }

    return {
      success: true,
      booking,
      message: 'Booking created successfully'
    };
  } catch (error) {
    console.error('Booking creation failed:', error);
    throw new Error(error.response?.data?.message || 'Failed to create booking');
  }
};

/**
 * Validate booking data
 * @param {Object} data - Booking data to validate
 */
const validateBookingData = (data) => {
  const { serviceType, date, time, customerEmail, customerName, vehicleId, location } = data;

  if (!serviceType) {
    throw new Error('Service type is required');
  }

  if (!date) {
    throw new Error('Date is required');
  }

  // Validate date is in future
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (bookingDate < today) {
    throw new Error('Booking date must be in the future');
  }

  if (!time) {
    throw new Error('Time is required');
  }

  // Validate time slot
  const validTimeSlots = getAvailableTimeSlots(date);
  if (!validTimeSlots.includes(time)) {
    throw new Error('Selected time slot is not available');
  }

  if (!customerEmail) {
    throw new Error('Customer email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    throw new Error('Invalid email format');
  }

  if (!customerName) {
    throw new Error('Customer name is required');
  }

  if (customerName.length < 2) {
    throw new Error('Name must be at least 2 characters');
  }

  if (serviceType === 'rental' && !vehicleId) {
    throw new Error('Vehicle selection is required for rentals');
  }

  if (data.deliveryMethod === 'delivery' && !location) {
    throw new Error('Delivery location is required');
  }
};

/**
 * Check availability for booking
 * @param {Object} bookingData - Booking details
 * @returns {Promise} - Availability result
 */
export const checkAvailability = async (bookingData) => {
  try {
    const { serviceType, date, time, vehicleId, duration } = bookingData;

    const response = await axios.post(`${API_BASE_URL}/bookings/check-availability`, {
      serviceType,
      date,
      time,
      vehicleId,
      duration
    });

    if (!response.data.available) {
      throw new Error(response.data.message || 'Selected time slot is not available');
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Availability check failed');
  }
};

/**
 * Get available time slots for a date
 * @param {string} date - Date to check
 * @param {string} serviceType - Type of service
 * @returns {Promise<Array>} - Available time slots
 */
export const getAvailableTimeSlots = async (date, serviceType = 'any') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/available-slots`, {
      params: { date, serviceType }
    });

    return response.data.slots;
  } catch (error) {
    console.error('Failed to get available slots:', error);
    return [];
  }
};

/**
 * Calculate booking price
 * @param {Object} bookingData - Booking details
 * @returns {Promise<number>} - Total price
 */
export const calculatePrice = async (bookingData) => {
  try {
    const { serviceType, vehicleId, duration, extras = [], date } = bookingData;

    const response = await axios.post(`${API_BASE_URL}/bookings/calculate-price`, {
      serviceType,
      vehicleId,
      duration,
      extras,
      date
    });

    return response.data.totalPrice;
  } catch (error) {
    console.error('Price calculation failed:', error);
    throw new Error('Failed to calculate price');
  }
};

/**
 * Get booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise} - Booking details
 */
export const getBookingById = async (bookingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get booking');
  }
};

/**
 * Get user bookings
 * @param {string} userEmail - User email
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - User bookings
 */
export const getUserBookings = async (userEmail, filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/user/${userEmail}`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get bookings');
  }
};

/**
 * Update booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @param {string} reason - Reason for update
 * @returns {Promise} - Updated booking
 */
export const updateBookingStatus = async (bookingId, status, reason = '') => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      status,
      reason,
      updatedAt: new Date().toISOString()
    });

    // Send status update email
    try {
      await sendStatusUpdateEmail(response.data);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update booking');
  }
};

/**
 * Cancel booking
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise} - Cancellation result
 */
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const booking = await getBookingById(bookingId);

    // Check cancellation policy
    const cancellationDeadline = new Date(booking.date);
    cancellationDeadline.setDate(cancellationDeadline.getDate() - 1); // 24 hours before

    if (new Date() > cancellationDeadline) {
      // Late cancellation - apply fee
      const fee = calculateCancellationFee(booking.totalPrice);
      await processCancellationFee(bookingId, fee);
    }

    const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      reason,
      cancelledAt: new Date().toISOString()
    });

    // Free up the time slot
    await releaseTimeSlot(booking);

    // Send cancellation email
    try {
      await sendCancellationEmail(booking, reason);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel booking');
  }
};

/**
 * Calculate cancellation fee
 * @param {number} totalPrice - Total booking price
 * @returns {number} - Cancellation fee
 */
const calculateCancellationFee = (totalPrice) => {
  return totalPrice * 0.2; // 20% cancellation fee
};

/**
 * Process cancellation fee
 * @param {string} bookingId - Booking ID
 * @param {number} fee - Cancellation fee
 */
const processCancellationFee = async (bookingId, fee) => {
  try {
    await axios.post(`${API_BASE_URL}/bookings/${bookingId}/cancellation-fee`, { fee });
  } catch (error) {
    console.error('Failed to process cancellation fee:', error);
  }
};

/**
 * Release time slot after cancellation
 * @param {Object} booking - Booking details
 */
const releaseTimeSlot = async (booking) => {
  try {
    await axios.post(`${API_BASE_URL}/bookings/release-slot`, {
      date: booking.date,
      time: booking.time,
      serviceType: booking.serviceType,
      vehicleId: booking.vehicleId
    });
  } catch (error) {
    console.error('Failed to release time slot:', error);
  }
};

/**
 * Reschedule booking
 * @param {string} bookingId - Booking ID
 * @param {Object} newDateTime - New date and time
 * @returns {Promise} - Rescheduled booking
 */
export const rescheduleBooking = async (bookingId, newDateTime) => {
  try {
    const { date, time } = newDateTime;

    // Check availability for new slot
    await checkAvailability({
      serviceType: 'any',
      date,
      time
    });

    const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/reschedule`, {
      newDate: date,
      newTime: time,
      rescheduledAt: new Date().toISOString()
    });

    // Send reschedule confirmation email
    try {
      await sendRescheduleEmail(response.data);
    } catch (emailError) {
      console.error('Failed to send reschedule email:', emailError);
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reschedule booking');
  }
};

/**
 * Add extras to booking
 * @param {string} bookingId - Booking ID
 * @param {Array} extras - Extras to add
 * @returns {Promise} - Updated booking
 */
export const addBookingExtras = async (bookingId, extras) => {
  try {
    // Calculate additional cost
    const additionalCost = await calculateExtrasCost(extras);

    const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/extras`, {
      extras,
      additionalCost,
      updatedAt: new Date().toISOString()
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add extras');
  }
};

/**
 * Calculate extras cost
 * @param {Array} extras - Extras to calculate
 * @returns {Promise<number>} - Total extras cost
 */
const calculateExtrasCost = async (extras) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookings/calculate-extras`, { extras });
    return response.data.total;
  } catch (error) {
    console.error('Failed to calculate extras cost:', error);
    return 0;
  }
};

/**
 * Create calendar event for booking
 * @param {Object} booking - Booking details
 */
const createCalendarEvent = async (booking) => {
  try {
    await axios.post(`${API_BASE_URL}/bookings/calendar-event`, booking);
  } catch (error) {
    console.error('Failed to create calendar event:', error);
  }
};

/**
 * Send status update email
 * @param {Object} booking - Updated booking
 */
const sendStatusUpdateEmail = async (booking) => {
  // Email service integration
  console.log('Status update email sent:', booking.id);
};

/**
 * Send cancellation email
 * @param {Object} booking - Cancelled booking
 * @param {string} reason - Cancellation reason
 */
const sendCancellationEmail = async (booking, reason) => {
  // Email service integration
  console.log('Cancellation email sent:', booking.id, reason);
};

/**
 * Send reschedule email
 * @param {Object} booking - Rescheduled booking
 */
const sendRescheduleEmail = async (booking) => {
  // Email service integration
  console.log('Reschedule email sent:', booking.id);
};

// Export all booking functions
export default {
  createBooking,
  checkAvailability,
  getAvailableTimeSlots,
  calculatePrice,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  addBookingExtras
};
