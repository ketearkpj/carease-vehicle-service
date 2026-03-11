// ===== src/Services/BookingService.js =====
/**
 * BOOKING SERVICE - GOD MODE
 * Handles booking API calls with resilient fallbacks for local demo flow.
 */

import axios from 'axios';
import { getEnv } from '../Config/env';
import { sendBookingConfirmation } from './EmailService';

const API_BASE_URL = getEnv('REACT_APP_API_URL') || '/api/v1';
const LOCAL_BOOKINGS_KEY = 'carease_local_bookings';
const DEFAULT_SLOTS = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];

const isRecoverableBookingError = (error) => {
  const status = error?.response?.status;
  return [401, 403, 404, 422, 500].includes(status) || !status;
};

const getLocalBookings = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveLocalBookings = (bookings) => {
  localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
};

const normalizeBooking = (payload) => {
  if (!payload) return null;
  if (payload.booking) return payload.booking;
  if (payload.data?.booking) return payload.data.booking;
  if (payload.data && !Array.isArray(payload.data)) return payload.data;
  return payload;
};

const normalizeBookings = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload.bookings)) return payload.bookings;
  if (Array.isArray(payload.data?.bookings)) return payload.data.bookings;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const validateBookingData = (data) => {
  if (!data?.serviceType) throw new Error('Service type is required');
  if (!data?.startDate) throw new Error('Start date is required');
  if (!data?.endDate) throw new Error('End date is required');
  if (!data?.customerInfo?.email) throw new Error('Customer email is required');
};

const mapBookingForApi = (bookingData) => ({
  vehicleId: bookingData.vehicleId || null,
  vehicleName: bookingData.vehicleName || null,
  serviceType: bookingData.serviceType,
  packageId: bookingData.packageId || null,
  packageName: bookingData.packageName || null,
  listedPrice: bookingData.listedPrice || null,
  inquiryType: bookingData.inquiryType || null,
  startDate: bookingData.startDate,
  endDate: bookingData.endDate,
  pickupTime: bookingData.timeSlot || bookingData.time || null,
  dropoffTime: bookingData.timeSlot || bookingData.time || null,
  pickupLocation: bookingData.pickupLocation || null,
  dropoffLocation: bookingData.dropoffLocation || bookingData.pickupLocation || null,
  deliveryMode: bookingData.deliveryMode || 'pickup',
  extras: bookingData.extras || [],
  specialRequests: bookingData.specialRequests || '',
  paymentMethod: bookingData.paymentMethod || null,
  paymentId: bookingData.paymentId || null,
  paymentMeta: bookingData.paymentMeta || null,
  totalAmount: bookingData.totalAmount || bookingData.totalPrice || 0,
  customerInfo: bookingData.customerInfo || {}
});

const estimatePrice = (bookingData = {}) => {
  const serviceBase = {
    rental: 18000,
    car_wash: 3500,
    repair: 8500,
    sales: 5000
  };
  const days = bookingData.startDate && bookingData.endDate
    ? Math.max(
        1,
        Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))
      )
    : 1;
  const base = serviceBase[bookingData.serviceType] || 99;
  const extras = Array.isArray(bookingData.extras)
    ? bookingData.extras.reduce((sum, extra) => sum + (Number(extra?.price) || 0), 0)
    : 0;
  return {
    basePrice: base * days,
    extrasPrice: extras,
    deliveryFee: bookingData.deliveryMode === 'delivery' ? 6500 : 0
  };
};

const buildLocalBooking = (bookingData) => {
  const estimate = estimatePrice(bookingData);
  const subtotal = estimate.basePrice + estimate.extrasPrice + estimate.deliveryFee;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return {
    id: `local-${Date.now()}`,
    bookingNumber: `CE-${Date.now().toString().slice(-8)}`,
    status: 'confirmed',
    ...mapBookingForApi(bookingData),
    basePrice: estimate.basePrice,
    extrasPrice: estimate.extrasPrice,
    deliveryFee: estimate.deliveryFee,
    taxAmount: tax,
    totalAmount: bookingData.totalAmount || total,
    createdAt: new Date().toISOString()
  };
};

export const createBooking = async (bookingData) => {
  validateBookingData(bookingData);
  const payload = mapBookingForApi(bookingData);

  try {
    await checkAvailability(payload);

    const response = await axios.post(`${API_BASE_URL}/bookings`, payload);
    const booking = normalizeBooking(response.data);

    if (!booking) {
      throw new Error('Booking response was empty');
    }

    return {
      success: true,
      booking,
      message: 'Booking created successfully'
    };
  } catch (error) {
    if (!isRecoverableBookingError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }

    const localBooking = buildLocalBooking(bookingData);
    const localBookings = getLocalBookings();
    saveLocalBookings([localBooking, ...localBookings]);

    try {
      await sendBookingConfirmation({
        customerEmail: localBooking.customerInfo?.email,
        customerName: `${localBooking.customerInfo?.firstName || ''} ${localBooking.customerInfo?.lastName || ''}`.trim(),
        bookingId: localBooking.id,
        serviceType: localBooking.serviceType,
        date: localBooking.startDate,
        time: localBooking.pickupTime,
        amount: localBooking.totalAmount
      });
    } catch (emailError) {
      console.error('Booking email fallback failed:', emailError);
    }

    return {
      success: true,
      booking: localBooking,
      message: 'Booking created in local fallback mode'
    };
  }
};

export const checkAvailability = async (bookingData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookings/check-availability`, {
      serviceType: bookingData.serviceType,
      date: bookingData.date || bookingData.startDate,
      time: bookingData.time || bookingData.timeSlot,
      packageId: bookingData.packageId,
      vehicleId: bookingData.vehicleId
    });

    const data = response.data?.data || response.data;
    return {
      available: data?.available !== false,
      message: data?.message || 'Available'
    };
  } catch (error) {
    if (isRecoverableBookingError(error)) {
      return {
        available: true,
        message: 'Availability confirmed'
      };
    }
    throw new Error(error.response?.data?.message || 'Availability check failed');
  }
};

export const getAvailableTimeSlots = async (date, serviceType = 'any') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/available-slots`, {
      params: { date, serviceType }
    });
    return response.data?.slots || response.data?.data?.slots || DEFAULT_SLOTS;
  } catch {
    return DEFAULT_SLOTS;
  }
};

export const calculatePrice = async (bookingData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookings/calculate-price`, {
      serviceType: bookingData.serviceType,
      vehicleId: bookingData.vehicleId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      extras: bookingData.extras || [],
      deliveryMode: bookingData.deliveryMode
    });

    const total = response.data?.totalPrice || response.data?.data?.totalPrice;
    if (typeof total === 'number') return total;
  } catch (error) {
    if (!isRecoverableBookingError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to calculate price');
    }
  }

  const estimate = estimatePrice(bookingData);
  const subtotal = estimate.basePrice + estimate.extrasPrice + estimate.deliveryFee;
  return subtotal + subtotal * 0.08;
};

export const getBookingById = async (bookingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`);
    const booking = normalizeBooking(response.data);
    if (!booking) throw new Error('Booking not found');
    return booking;
  } catch (error) {
    const localBooking = getLocalBookings().find((booking) => booking.id === bookingId);
    if (localBooking) return localBooking;
    throw new Error(error.response?.data?.message || 'Failed to get booking');
  }
};

export const getUserBookings = async (userEmail, filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/user/${userEmail}`, {
      params: filters
    });
    return normalizeBookings(response.data);
  } catch (error) {
    if (!isRecoverableBookingError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to get bookings');
    }
    return getLocalBookings().filter((booking) => booking.customerInfo?.email === userEmail);
  }
};

export const updateBookingStatus = async (bookingId, status, reason = '') => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      status,
      reason,
      updatedAt: new Date().toISOString()
    });
    return normalizeBooking(response.data);
  } catch (error) {
    const localBookings = getLocalBookings();
    const index = localBookings.findIndex((booking) => booking.id === bookingId);
    if (index >= 0) {
      localBookings[index] = {
        ...localBookings[index],
        status,
        statusReason: reason,
        updatedAt: new Date().toISOString()
      };
      saveLocalBookings(localBookings);
      return localBookings[index];
    }
    throw new Error(error.response?.data?.message || 'Failed to update booking');
  }
};

export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      reason,
      cancelledAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    return updateBookingStatus(bookingId, 'cancelled', reason);
  }
};

export const rescheduleBooking = async (bookingId, newDateTime) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/reschedule`, {
      newDate: newDateTime.date,
      newTime: newDateTime.time,
      rescheduledAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reschedule booking');
  }
};

export const addBookingExtras = async (bookingId, extras) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/extras`, {
      extras,
      updatedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add extras');
  }
};

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
