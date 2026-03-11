// ===== src/Context/BookingContext.jsx =====
import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { useApp } from './AppContext';
import { createBooking, getBookingById, getUserBookings, cancelBooking } from '../Services/BookingService';

// Create context
const BookingContext = createContext(null);

/**
 * BookingProvider Component - GOD MODE
 * Manages booking state across the application
 */
export const BookingProvider = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    serviceType: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { addNotification } = useApp();

  /**
   * Fetch user bookings
   * @param {string} userEmail - User email
   * @param {Object} options - Fetch options
   */
  const fetchUserBookings = useCallback(async (userEmail, options = {}) => {
    if (!userEmail) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getUserBookings(userEmail, {
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        ...filters,
        ...options
      });

      setBookings(result.bookings || []);
      setPagination({
        page: result.page || 1,
        limit: result.limit || 10,
        total: result.total || 0,
        totalPages: result.totalPages || 0
      });
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, addNotification]);

  /**
   * Fetch booking by ID
   * @param {string} bookingId - Booking ID
   */
  const fetchBooking = useCallback(async (bookingId) => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);

    try {
      const booking = await getBookingById(bookingId);
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data
   */
  const createNewBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createBooking(bookingData);

      if (result.success) {
        setCurrentBooking(result.booking);
        setBookings(prev => [result.booking, ...prev]);
        addNotification('Booking created successfully!', 'success');
        return result.booking;
      }
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  /**
   * Cancel a booking
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   */
  const cancelExistingBooking = useCallback(async (bookingId, reason = '') => {
    setLoading(true);
    setError(null);

    try {
      const result = await cancelBooking(bookingId, reason);

      if (result.success) {
        // Update in bookings list
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ));

        // Update current booking if it's the one being cancelled
        if (currentBooking?.id === bookingId) {
          setCurrentBooking(prev => ({ ...prev, status: 'cancelled' }));
        }

        addNotification('Booking cancelled successfully', 'success');
        return result;
      }
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBooking, addNotification]);

  /**
   * Update filters
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      dateRange: null,
      serviceType: 'all',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Change page
   * @param {number} page - Page number
   */
  const changePage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  /**
   * Change items per page
   * @param {number} limit - Items per page
   */
  const changeLimit = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  /**
   * Clear current booking
   */
  const clearCurrentBooking = useCallback(() => {
    setCurrentBooking(null);
  }, []);

  // Filtered and sorted bookings
  const filteredBookings = useMemo(() => {
    if (!bookings.length) return [];

    return bookings.filter(booking => {
      // Filter by status
      if (filters.status !== 'all' && booking.status !== filters.status) {
        return false;
      }

      // Filter by service type
      if (filters.serviceType !== 'all' && booking.serviceType !== filters.serviceType) {
        return false;
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          booking.id?.toLowerCase().includes(searchLower) ||
          booking.serviceType?.toLowerCase().includes(searchLower) ||
          booking.location?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by date range
      if (filters.dateRange) {
        const bookingDate = new Date(booking.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);

        if (bookingDate < startDate || bookingDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, filters]);

  // Booking statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;

    const totalSpent = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const upcoming = bookings.filter(b => 
      b.status === 'confirmed' && new Date(b.date) > new Date()
    ).length;

    return {
      total,
      confirmed,
      pending,
      completed,
      cancelled,
      totalSpent,
      upcoming
    };
  }, [bookings]);

  const value = useMemo(() => ({
    // State
    currentBooking,
    bookings,
    filteredBookings,
    loading,
    error,
    filters,
    pagination,
    stats,

    // Methods
    fetchUserBookings,
    fetchBooking,
    createNewBooking,
    cancelExistingBooking,
    updateFilters,
    clearFilters,
    changePage,
    changeLimit,
    clearCurrentBooking,
    setBookings
  }), [
    currentBooking, bookings, filteredBookings, loading, error,
    filters, pagination, stats, fetchUserBookings, fetchBooking,
    createNewBooking, cancelExistingBooking, updateFilters,
    clearFilters, changePage, changeLimit, clearCurrentBooking
  ]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

/**
 * useBookingContext Hook - Custom hook to use BookingContext
 * @returns {Object} - Booking context value
 * @throws {Error} - If used outside of BookingProvider
 */
export const useBookingContext = () => {
  const context = useContext(BookingContext);
  
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  
  return context;
};

export default BookingContext;