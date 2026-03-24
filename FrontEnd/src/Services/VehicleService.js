// ===== src/Services/vehicle.service.js =====
/**
 * VEHICLE SERVICE - GOD MODE
 * Real vehicle management with database integration
 * Supports: Inventory management, real-time availability, pricing
 */

import axios from 'axios';
import { buildApiUrl } from '../Config/API';

// API base URL
const API_BASE_URL = buildApiUrl();

/**
 * Vehicle categories with real data
 */
export const VEHICLE_CATEGORIES = [
  {
    id: 'supercar',
    name: 'Supercar',
    description: 'High-performance exotic vehicles',
    icon: '🏎️',
    minAge: 25,
    depositRate: 0.5,
    insuranceRate: 0.15,
    image: '/categories/supercar.jpg'
  },
  {
    id: 'luxury',
    name: 'Luxury Sedan',
    description: 'Premium comfort and style',
    icon: '🚘',
    minAge: 23,
    depositRate: 0.3,
    insuranceRate: 0.1,
    image: '/categories/luxury.jpg'
  },
  {
    id: 'sports',
    name: 'Sports Car',
    description: 'Dynamic driving experience',
    icon: '🏁',
    minAge: 24,
    depositRate: 0.4,
    insuranceRate: 0.12,
    image: '/categories/sports.jpg'
  },
  {
    id: 'suv',
    name: 'Luxury SUV',
    description: 'Space and sophistication',
    icon: '🚙',
    minAge: 22,
    depositRate: 0.25,
    insuranceRate: 0.08,
    image: '/categories/suv.jpg'
  },
  {
    id: 'exotic',
    name: 'Exotic',
    description: 'Rare and extraordinary',
    icon: '✨',
    minAge: 25,
    depositRate: 0.6,
    insuranceRate: 0.2,
    image: '/categories/exotic.jpg'
  }
];

/**
 * Get supported vehicle categories
 * @returns {Promise<Array>} - Vehicle categories
 */
export const getVehicleCategories = async () => {
  return VEHICLE_CATEGORIES;
};

/**
 * Get all vehicles with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - List of vehicles
 */
export const getVehicles = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles`, {
      params: {
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        available: filters.available,
        location: filters.location,
        page: filters.page || 1,
        limit: filters.limit || 10,
        sort: filters.sort || 'price_asc'
      }
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
 * Get vehicles available for sale
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Vehicles with pagination
 */
export const getSalesVehicles = async (filters = {}) => {
  return getVehicles(filters);
};

/**
 * Get featured vehicles for homepage
 * @param {number} limit - Number of vehicles to return
 * @returns {Promise<Array>} - Featured vehicles
 */
export const getFeaturedVehicles = async (limit = 6) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles/featured`, {
      params: { limit }
    });

    return response.data.vehicles;
  } catch (error) {
    console.error('Failed to fetch featured vehicles:', error);
    // Return empty array instead of throwing - UI can show fallback
    return [];
  }
};

/**
 * Get vehicle by ID
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<Object>} - Vehicle details
 */
export const getVehicleById = async (vehicleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch vehicle:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch vehicle details');
  }
};

/**
 * Get vehicle availability
 * @param {string} vehicleId - Vehicle ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Object>} - Availability status
 */
export const getVehicleAvailability = async (vehicleId, startDate, endDate) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles/${vehicleId}/availability`, {
      params: { startDate, endDate }
    });

    return {
      available: response.data.available,
      bookedDates: response.data.bookedDates,
      availableDates: response.data.availableDates
    };
  } catch (error) {
    console.error('Failed to check availability:', error);
    throw new Error(error.response?.data?.message || 'Failed to check availability');
  }
};

/**
 * Check if vehicle is available for specific time slot
 * @param {string} vehicleId - Vehicle ID
 * @param {string} date - Date to check
 * @param {string} time - Time slot
 * @returns {Promise<boolean>} - Availability
 */
export const checkVehicleTimeSlot = async (vehicleId, date, time) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/vehicles/check-slot`, {
      vehicleId,
      date,
      time
    });

    return response.data.available;
  } catch (error) {
    console.error('Failed to check time slot:', error);
    return false;
  }
};

/**
 * Get vehicle pricing
 * @param {string} vehicleId - Vehicle ID
 * @param {Object} options - Pricing options
 * @returns {Promise<Object>} - Price details
 */
export const getVehiclePricing = async (vehicleId, options = {}) => {
  try {
    const { days = 1, insurance = false, extras = [] } = options;

    const response = await axios.post(`${API_BASE_URL}/vehicles/${vehicleId}/pricing`, {
      days,
      insurance,
      extras
    });

    return {
      basePrice: response.data.basePrice,
      insuranceCost: response.data.insuranceCost,
      extrasCost: response.data.extrasCost,
      total: response.data.total,
      currency: response.data.currency,
      breakdown: response.data.breakdown
    };
  } catch (error) {
    console.error('Failed to get pricing:', error);
    throw new Error(error.response?.data?.message || 'Failed to calculate price');
  }
};

/**
 * Get vehicle reviews
 * @param {string} vehicleId - Vehicle ID
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} - Reviews with pagination
 */
export const getVehicleReviews = async (vehicleId, pagination = {}) => {
  try {
    const { page = 1, limit = 10 } = pagination;

    const response = await axios.get(`${API_BASE_URL}/vehicles/${vehicleId}/reviews`, {
      params: { page, limit }
    });

    return {
      reviews: response.data.reviews,
      averageRating: response.data.averageRating,
      totalReviews: response.data.totalReviews,
      ratingDistribution: response.data.ratingDistribution
    };
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return {
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {}
    };
  }
};

/**
 * Add vehicle review
 * @param {string} vehicleId - Vehicle ID
 * @param {Object} reviewData - Review data
 * @returns {Promise<Object>} - Created review
 */
export const addVehicleReview = async (vehicleId, reviewData) => {
  try {
    const { rating, comment, customerName, customerEmail, bookingId } = reviewData;

    // Validate review data
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    if (!comment || comment.length < 10) {
      throw new Error('Review must be at least 10 characters');
    }

    const response = await axios.post(`${API_BASE_URL}/vehicles/${vehicleId}/reviews`, {
      rating,
      comment,
      customerName,
      customerEmail,
      bookingId,
      createdAt: new Date().toISOString()
    });

    return response.data;
  } catch (error) {
    console.error('Failed to add review:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit review');
  }
};

/**
 * Get similar vehicles
 * @param {string} vehicleId - Vehicle ID
 * @param {number} limit - Number of similar vehicles
 * @returns {Promise<Array>} - Similar vehicles
 */
export const getSimilarVehicles = async (vehicleId, limit = 4) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles/${vehicleId}/similar`, {
      params: { limit }
    });

    return response.data.vehicles;
  } catch (error) {
    console.error('Failed to fetch similar vehicles:', error);
    return [];
  }
};

/**
 * Search vehicles
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} - Search results
 */
export const searchVehicles = async (query, filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles/search`, {
      params: {
        q: query,
        ...filters
      }
    });

    return {
      results: response.data.results,
      total: response.data.total
    };
  } catch (error) {
    console.error('Failed to search vehicles:', error);
    return { results: [], total: 0 };
  }
};

/**
 * Reserve a vehicle
 * @param {string} vehicleId - Vehicle ID
 * @param {Object} reservationData - Reservation details
 * @returns {Promise<Object>} - Reservation result
 */
export const reserveVehicle = async (vehicleId, reservationData) => {
  try {
    const { startDate, endDate, customerEmail, customerName, deposit } = reservationData;

    // Check availability before reserving
    const availability = await getVehicleAvailability(vehicleId, startDate, endDate);
    
    if (!availability.available) {
      throw new Error('Vehicle not available for selected dates');
    }

    const response = await axios.post(`${API_BASE_URL}/vehicles/${vehicleId}/reserve`, {
      startDate,
      endDate,
      customerEmail,
      customerName,
      deposit,
      expiresAt: new Date(Date.now() + 30 * 60000) // 30 minutes expiry
    });

    return {
      success: true,
      reservationId: response.data.reservationId,
      expiresAt: response.data.expiresAt
    };
  } catch (error) {
    console.error('Failed to reserve vehicle:', error);
    throw new Error(error.response?.data?.message || 'Failed to reserve vehicle');
  }
};

/**
 * Get vehicle specifications
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<Object>} - Vehicle specs
 */
export const getVehicleSpecs = async (vehicleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles/${vehicleId}/specs`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch vehicle specs:', error);
    return {};
  }
};

/**
 * Get vehicle images
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<Array>} - Vehicle images
 */
export const getVehicleImages = async (vehicleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles/${vehicleId}/images`);
    return response.data.images;
  } catch (error) {
    console.error('Failed to fetch vehicle images:', error);
    return [];
  }
};

/**
 * Toggle favorite vehicle
 * @param {string} vehicleId - Vehicle ID
 * @param {string} userEmail - User email
 * @returns {Promise<Object>} - Updated favorite status
 */
export const toggleFavorite = async (vehicleId, userEmail) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/vehicles/${vehicleId}/favorite`, {
      userEmail
    });

    return {
      isFavorite: response.data.isFavorite,
      message: response.data.message
    };
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    throw new Error(error.response?.data?.message || 'Failed to update favorite');
  }
};

/**
 * Get user's favorite vehicles
 * @param {string} userEmail - User email
 * @returns {Promise<Array>} - Favorite vehicles
 */
export const getFavoriteVehicles = async (userEmail) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles/favorites/${userEmail}`);
    return response.data.vehicles;
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    return [];
  }
};

/**
 * Export vehicle data
 * @param {string} format - Export format (csv, pdf, excel)
 * @param {Object} filters - Filter options
 * @returns {Promise<Blob>} - Exported file
 */
export const exportVehicles = async (format = 'csv', filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles/export`, {
      params: { format, ...filters },
      responseType: 'blob'
    });

    return response.data;
  } catch (error) {
    console.error('Failed to export vehicles:', error);
    throw new Error(error.response?.data?.message || 'Failed to export vehicles');
  }
};

/**
 * Get vehicle maintenance history
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<Array>} - Maintenance records
 */
export const getMaintenanceHistory = async (vehicleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles/${vehicleId}/maintenance`);
    return response.data.records;
  } catch (error) {
    console.error('Failed to fetch maintenance history:', error);
    return [];
  }
};

/**
 * Schedule vehicle maintenance
 * @param {string} vehicleId - Vehicle ID
 * @param {Object} maintenanceData - Maintenance details
 * @returns {Promise<Object>} - Scheduled maintenance
 */
export const scheduleMaintenance = async (vehicleId, maintenanceData) => {
  try {
    const { date, type, description, technician } = maintenanceData;

    const response = await axios.post(`${API_BASE_URL}/vehicles/${vehicleId}/maintenance`, {
      date,
      type,
      description,
      technician,
      status: 'scheduled'
    });

    return response.data;
  } catch (error) {
    console.error('Failed to schedule maintenance:', error);
    throw new Error(error.response?.data?.message || 'Failed to schedule maintenance');
  }
};

// Export all vehicle functions
export default {
  getVehicleCategories,
  getVehicles,
  getSalesVehicles,
  getFeaturedVehicles,
  getVehicleById,
  getVehicleAvailability,
  checkVehicleTimeSlot,
  getVehiclePricing,
  getVehicleReviews,
  addVehicleReview,
  getSimilarVehicles,
  searchVehicles,
  reserveVehicle,
  getVehicleSpecs,
  getVehicleImages,
  toggleFavorite,
  getFavoriteVehicles,
  exportVehicles,
  getMaintenanceHistory,
  scheduleMaintenance,
  VEHICLE_CATEGORIES
};
