// ===== src/Services/admin.service.js =====
/**
 * ADMIN SERVICE - GOD MODE
 * Real admin management with database integration
 * Supports: User management, analytics, reports, system settings
 */

import axios from 'axios';
import { getEnv } from '../Config/env';

// API base URL
const API_BASE_URL = getEnv('REACT_APP_API_URL') || '/api/v1/admin';

/**
 * Admin authentication
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} - Admin session data
 */
export const adminLogin = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
      admin: true
    });

    // Store admin token
    if (response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_data', JSON.stringify(response.data.admin));
    }

    return {
      success: true,
      token: response.data.token,
      admin: response.data.admin,
      permissions: response.data.permissions
    };
  } catch (error) {
    console.error('Admin login failed:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * Verify admin token
 * @returns {Promise<Object>} - Admin data
 */
export const verifyAdminToken = async () => {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    return { valid: false };
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      valid: true,
      admin: response.data.admin,
      permissions: response.data.permissions
    };
  } catch (error) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    return { valid: false };
  }
};

/**
 * Admin logout
 */
export const adminLogout = async () => {
  const token = localStorage.getItem('admin_token');
  
  try {
    if (token) {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
  }
};

/**
 * Get dashboard statistics
 * @param {Object} filters - Date filters
 * @returns {Promise<Object>} - Dashboard stats
 */
export const getDashboardStats = async (filters = {}) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      params: {
        startDate: filters.startDate,
        endDate: filters.endDate,
        period: filters.period || 'month'
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      revenue: response.data.revenue,
      bookings: response.data.bookings,
      users: response.data.users,
      vehicles: response.data.vehicles,
      occupancy: response.data.occupancy,
      trends: response.data.trends
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
  }
};

/**
 * Get all bookings with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Bookings with pagination
 */
export const getAllBookings = async (filters = {}) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/bookings`, {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        status: filters.status,
        serviceType: filters.serviceType,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc'
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      bookings: response.data.bookings,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
  }
};

/**
 * Get recent bookings for dashboard
 * @param {number} limit - Number of bookings
 * @returns {Promise<Array>} - Recent bookings
 */
export const getRecentBookings = async (limit = 10) => {
  const result = await getAllBookings({ page: 1, limit, sortBy: 'createdAt', sortOrder: 'desc' });
  return result.bookings || [];
};

/**
 * Get booking details
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} - Booking details
 */
export const getBookingDetails = async (bookingId) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch booking details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch booking details');
  }
};

/**
 * Update booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @param {string} note - Update note
 * @returns {Promise<Object>} - Updated booking
 */
export const updateBookingStatus = async (bookingId, status, note = '') => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      status,
      note,
      updatedAt: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to update booking status:', error);
    throw new Error(error.response?.data?.message || 'Failed to update booking');
  }
};

/**
 * Get all users
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Users with pagination
 */
export const getAllUsers = async (filters = {}) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        role: filters.role,
        status: filters.status,
        search: filters.search,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc'
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      users: response.data.users,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

/**
 * Get user details
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User details
 */
export const getUserDetails = async (userId) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch user details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user details');
  }
};

/**
 * Update user role
 * @param {string} userId - User ID
 * @param {string} role - New role
 * @returns {Promise<Object>} - Updated user
 */
export const updateUserRole = async (userId, role) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.patch(`${API_BASE_URL}/users/${userId}/role`, {
      role,
      updatedAt: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to update user role:', error);
    throw new Error(error.response?.data?.message || 'Failed to update user role');
  }
};

/**
 * Toggle user status
 * @param {string} userId - User ID
 * @param {boolean} isActive - Active status
 * @param {string} reason - Reason for change
 * @returns {Promise<Object>} - Updated user
 */
export const toggleUserStatus = async (userId, isActive, reason = '') => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.patch(`${API_BASE_URL}/users/${userId}/status`, {
      isActive,
      reason,
      updatedAt: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to update user status:', error);
    throw new Error(error.response?.data?.message || 'Failed to update user status');
  }
};

/**
 * Get all vehicles (admin view)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Vehicles with pagination
 */
export const getAllVehicles = async (filters = {}) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles`, {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        status: filters.status,
        category: filters.category,
        search: filters.search,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc'
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      vehicles: response.data.vehicles,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch vehicles');
  }
};

/**
 * Add new vehicle
 * @param {Object} vehicleData - Vehicle details
 * @returns {Promise<Object>} - Created vehicle
 */
export const addVehicle = async (vehicleData) => {
  const token = localStorage.getItem('admin_token');

  try {
    // Handle image uploads
    if (vehicleData.images && vehicleData.images.length > 0) {
      const formData = new FormData();
      vehicleData.images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      
      // Upload images first
      const uploadResponse = await axios.post(`${API_BASE_URL}/vehicles/upload-images`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      vehicleData.imageUrls = uploadResponse.data.urls;
    }

    const response = await axios.post(`${API_BASE_URL}/vehicles`, vehicleData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to add vehicle:', error);
    throw new Error(error.response?.data?.message || 'Failed to add vehicle');
  }
};

/**
 * Update vehicle
 * @param {string} vehicleId - Vehicle ID
 * @param {Object} vehicleData - Updated vehicle data
 * @returns {Promise<Object>} - Updated vehicle
 */
export const updateVehicle = async (vehicleId, vehicleData) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.put(`${API_BASE_URL}/vehicles/${vehicleId}`, vehicleData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to update vehicle:', error);
    throw new Error(error.response?.data?.message || 'Failed to update vehicle');
  }
};

/**
 * Delete vehicle
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteVehicle = async (vehicleId) => {
  const token = localStorage.getItem('admin_token');

  try {
    await axios.delete(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  } catch (error) {
    console.error('Failed to delete vehicle:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete vehicle');
  }
};

/**
 * Get all payments
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Payments with pagination
 */
export const getAllPayments = async (filters = {}) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/payments`, {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        status: filters.status,
        method: filters.method,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      payments: response.data.payments,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch payments');
  }
};

/**
 * Get payment details
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} - Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch payment details');
  }
};

/**
 * Process refund
 * @param {string} paymentId - Payment ID
 * @param {Object} refundData - Refund details
 * @returns {Promise<Object>} - Refund result
 */
export const processRefund = async (paymentId, refundData) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.post(`${API_BASE_URL}/payments/${paymentId}/refund`, refundData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to process refund:', error);
    throw new Error(error.response?.data?.message || 'Failed to process refund');
  }
};

/**
 * Get revenue reports
 * @param {Object} filters - Report filters
 * @returns {Promise<Object>} - Revenue data
 */
export const getRevenueReports = async (filters = {}) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/reports/revenue`, {
      params: {
        period: filters.period || 'month',
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy || 'day'
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      total: response.data.total,
      byPeriod: response.data.byPeriod,
      byService: response.data.byService,
      byMethod: response.data.byMethod,
      trends: response.data.trends,
      projections: response.data.projections
    };
  } catch (error) {
    console.error('Failed to fetch revenue reports:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch revenue reports');
  }
};

/**
 * Get booking reports
 * @param {Object} filters - Report filters
 * @returns {Promise<Object>} - Booking data
 */
export const getBookingReports = async (filters = {}) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/reports/bookings`, {
      params: {
        period: filters.period || 'month',
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy || 'day'
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      total: response.data.total,
      byStatus: response.data.byStatus,
      byService: response.data.byService,
      byLocation: response.data.byLocation,
      cancellationRate: response.data.cancellationRate,
      occupancyRate: response.data.occupancyRate
    };
  } catch (error) {
    console.error('Failed to fetch booking reports:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch booking reports');
  }
};

/**
 * Get analytics data
 * @param {Object} filters - Analytics filters
 * @returns {Promise<Object>} - Analytics data
 */
export const getAnalytics = async (filters = {}) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/analytics`, {
      params: {
        period: filters.period || 'month',
        metrics: filters.metrics || ['users', 'bookings', 'revenue']
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
  }
};

/**
 * Export data
 * @param {string} type - Data type (bookings|users|payments|vehicles)
 * @param {string} format - Export format (csv|excel|pdf)
 * @param {Object} filters - Filter options
 * @returns {Promise<Blob>} - Exported file
 */
export const exportData = async (type, format = 'csv', filters = {}) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/export/${type}`, {
      params: {
        format,
        ...filters
      },
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });

    return response.data;
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error(error.response?.data?.message || 'Failed to export data');
  }
};

/**
 * Get system settings
 * @returns {Promise<Object>} - System settings
 */
export const getSystemSettings = async () => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch settings');
  }
};

/**
 * Update system settings
 * @param {Object} settings - Updated settings
 * @returns {Promise<Object>} - Updated settings
 */
export const updateSystemSettings = async (settings) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.put(`${API_BASE_URL}/settings`, settings, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw new Error(error.response?.data?.message || 'Failed to update settings');
  }
};

/**
 * Get audit logs
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Audit logs
 */
export const getAuditLogs = async (filters = {}) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/audit-logs`, {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        action: filters.action,
        userId: filters.userId,
        startDate: filters.startDate,
        endDate: filters.endDate
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      logs: response.data.logs,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch audit logs');
  }
};

/**
 * Send notification to users
 * @param {Object} notification - Notification details
 * @returns {Promise<Object>} - Notification result
 */
export const sendNotification = async (notification) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.post(`${API_BASE_URL}/notifications/send`, notification, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw new Error(error.response?.data?.message || 'Failed to send notification');
  }
};

/**
 * Get maintenance requests
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Maintenance requests
 */
export const getMaintenanceRequests = async (filters = {}) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.get(`${API_BASE_URL}/maintenance`, {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        status: filters.status,
        priority: filters.priority,
        vehicleId: filters.vehicleId
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      requests: response.data.requests,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    console.error('Failed to fetch maintenance requests:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch maintenance requests');
  }
};

/**
 * Update maintenance request
 * @param {string} requestId - Request ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} - Updated request
 */
export const updateMaintenanceRequest = async (requestId, updateData) => {
  const token = localStorage.getItem('admin_token');

  try {
    const response = await axios.patch(`${API_BASE_URL}/maintenance/${requestId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to update maintenance request:', error);
    throw new Error(error.response?.data?.message || 'Failed to update maintenance request');
  }
};

// Export all admin functions
export default {
  adminLogin,
  verifyAdminToken,
  adminLogout,
  getDashboardStats,
  getRecentBookings,
  getAllBookings,
  getBookingDetails,
  updateBookingStatus,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  toggleUserStatus,
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getAllPayments,
  getPaymentDetails,
  processRefund,
  getRevenueReports,
  getBookingReports,
  getAnalytics,
  exportData,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  sendNotification,
  getMaintenanceRequests,
  updateMaintenanceRequest
};
