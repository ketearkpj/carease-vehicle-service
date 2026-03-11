// ===== src/Hooks/useBooking.js =====
import { useState, useCallback, useMemo } from 'react';
import { createBooking, getBookingById, cancelBooking, updateBookingStatus } from '../Services/BookingService';
import { useApp } from '../Context/AppContext';

/**
 * useBooking Hook - GOD MODE
 * Comprehensive booking management hook
 * 
 * @param {string} initialBookingId - Initial booking ID
 * @returns {Object} - Booking state and methods
 */
export const useBooking = (initialBookingId = null) => {
  const [booking, setBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(initialBookingId);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    serviceType: 'all'
  });
  
  const { addNotification } = useApp();

  // Create new booking
  const createNewBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createBooking(bookingData);
      
      if (result.success) {
        setBooking(result.booking);
        addNotification('Booking created successfully!', 'success');
        return result;
      }
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Fetch booking by ID
  const fetchBooking = useCallback(async (bookingId = selectedBooking) => {
    if (!bookingId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getBookingById(bookingId);
      setBooking(data);
      return data;
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedBooking, addNotification]);

  // Cancel booking
  const cancelExistingBooking = useCallback(async (bookingId, reason = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cancelBooking(bookingId, reason);
      
      if (result.success) {
        // Update local state
        setBooking(prev => prev?.id === bookingId ? { ...prev, status: 'cancelled' } : prev);
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
        
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
  }, [addNotification]);

  // Update booking status
  const updateStatus = useCallback(async (bookingId, status, note = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const updated = await updateBookingStatus(bookingId, status, note);
      
      // Update local state
      setBooking(prev => prev?.id === bookingId ? { ...prev, ...updated } : prev);
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, ...updated } : b
      ));
      
      addNotification(`Booking status updated to ${status}`, 'success');
      return updated;
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Filter bookings
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

  // Apply filters
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      dateRange: null,
      serviceType: 'all'
    });
  }, []);

  // Select booking
  const selectBooking = useCallback((bookingId) => {
    setSelectedBooking(bookingId);
  }, []);

  // Clear selected booking
  const clearSelected = useCallback(() => {
    setSelectedBooking(null);
    setBooking(null);
  }, []);

  // Calculate booking statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    return {
      total,
      confirmed,
      pending,
      completed,
      cancelled,
      totalRevenue
    };
  }, [bookings]);

  return {
    // State
    booking,
    bookings,
    loading,
    error,
    selectedBooking,
    filters,
    filteredBookings,
    stats,
    
    // Actions
    createNewBooking,
    fetchBooking,
    cancelExistingBooking,
    updateStatus,
    applyFilters,
    clearFilters,
    selectBooking,
    clearSelected,
    setBookings
  };
};

export default useBooking;
