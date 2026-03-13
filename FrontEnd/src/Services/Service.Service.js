// ===== src/Services/service.service.js =====
/**
 * SERVICE SERVICE - GOD MODE
 * Real service management with database integration
 * Supports: All service types (rentals, wash, repairs, sales)
 */

import axios from 'axios';
import { getEnv } from '../Config/env';

// API base URL
const API_BASE_URL = getEnv('REACT_APP_API_URL') || '/api/v1/services';

/**
 * Service types
 */
export const SERVICE_TYPES = {
  RENTAL: 'rental',
  CAR_WASH: 'car_wash',
  REPAIR: 'repair',
  SALES: 'sales'
};

/**
 * Get all services
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - List of services
 */
export const getServices = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {
        type: filters.type,
        available: filters.available,
        location: filters.location,
        featured: filters.featured
      }
    });

    return response.data.services;
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
};

/**
 * Get service by ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>} - Service details
 */
export const getServiceById = async (serviceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch service:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch service details');
  }
};

/**
 * Get rental services
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - Rental services
 */
export const getRentalServices = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rentals`, {
      params: {
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        location: filters.location,
        available: filters.available,
        page: filters.page || 1,
        limit: filters.limit || 10
      }
    });

    return {
      services: response.data.services,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    console.error('Failed to fetch rental services:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch rentals');
  }
};

/**
 * Get rental service details
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>} - Rental details
 */
export const getRentalDetails = async (serviceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rentals/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch rental details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch rental details');
  }
};

/**
 * Check rental availability
 * @param {string} serviceId - Service ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Object>} - Availability status
 */
export const checkRentalAvailability = async (serviceId, startDate, endDate) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/rentals/${serviceId}/check-availability`, {
      startDate,
      endDate
    });

    return {
      available: response.data.available,
      price: response.data.price,
      availableVehicles: response.data.availableVehicles
    };
  } catch (error) {
    console.error('Failed to check availability:', error);
    throw new Error(error.response?.data?.message || 'Failed to check availability');
  }
};

/**
 * Get car wash services
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - Car wash services
 */
export const getCarWashServices = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/car-wash`, {
      params: {
        package: filters.package,
        location: filters.location,
        date: filters.date,
        time: filters.time
      }
    });

    return response.data.services;
  } catch (error) {
    console.error('Failed to fetch car wash services:', error);
    return [];
  }
};

/**
 * Get car wash packages
 * @returns {Promise<Array>} - Wash packages
 */
export const getWashPackages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/car-wash/packages`);
    return response.data.packages;
  } catch (error) {
    console.error('Failed to fetch wash packages:', error);
    
    // Return default packages as fallback
    return [
      {
        id: 'express',
        name: 'Express Wash',
        price: 3500,
        duration: 30,
        description: 'Fast exterior refresh for daily maintenance',
        features: ['Exterior hand wash', 'Wheel cleaning', 'Tire shine', 'Window cleaning']
      },
      {
        id: 'interior-refresh',
        name: 'Interior Refresh',
        price: 6200,
        duration: 50,
        description: 'Cabin-focused clean for busy daily use vehicles',
        features: ['Interior vacuum', 'Dashboard detailing', 'Mat wash', 'Door panel cleaning', 'Air freshener treatment']
      },
      {
        id: 'premium',
        name: 'Premium Detail',
        price: 9500,
        duration: 90,
        description: 'Comprehensive interior and exterior detailing',
        features: ['Everything in Express', 'Deep interior cleaning', 'Leather conditioning', 'Paint sealant']
      },
      {
        id: 'executive-detail',
        name: 'Executive Detail',
        price: 14500,
        duration: 120,
        description: 'Balanced full-service package for family and business vehicles',
        features: ['Everything in Premium', 'Fabric seat shampoo', 'Tar and bug removal', 'Trim restoration']
      },
      {
        id: 'paint-protection',
        name: 'Paint Protection Plus',
        price: 18900,
        duration: 150,
        description: 'Deep gloss and protective layering for long-lasting finish',
        features: ['Everything in Executive Detail', 'Iron decontamination', 'Machine polish enhancement', 'Hydrophobic sealant']
      },
      {
        id: 'ultimate',
        name: 'Ultimate Ceramic',
        price: 24900,
        duration: 180,
        description: 'Professional ceramic coating',
        features: ['Everything in Premium', '9H ceramic coating', 'Paint correction', '24 month warranty']
      }
    ];
  }
};

/**
 * Get available wash time slots
 * @param {string} date - Date to check
 * @param {string} location - Location ID
 * @returns {Promise<Array>} - Available time slots
 */
export const getWashTimeSlots = async (date, location) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/car-wash/slots`, {
      params: { date, location }
    });

    return response.data.slots;
  } catch (error) {
    console.error('Failed to fetch time slots:', error);
    return [];
  }
};

/**
 * Get available time slots for any service type
 * @param {string} date - Date to check
 * @param {string} serviceType - Service type
 * @param {string} location - Optional location ID
 * @returns {Promise<Array>} - Available time slots
 */
export const getAvailableTimeSlots = async (date, serviceType = 'car_wash', location = null) => {
  try {
    const availability = await getServiceAvailability(serviceType, { date, location });
    if (availability.available && Array.isArray(availability.slots) && availability.slots.length > 0) {
      return availability.slots;
    }
  } catch (error) {
    console.error('Failed to fetch generic time slots:', error);
  }

  return [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM'
  ];
};

/**
 * Get repair services
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - Repair services
 */
export const getRepairServices = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/repairs`, {
      params: {
        category: filters.category,
        location: filters.location,
        vehicleType: filters.vehicleType
      }
    });

    return response.data.services;
  } catch (error) {
    console.error('Failed to fetch repair services:', error);
    return [];
  }
};

/**
 * Get repair service details
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>} - Repair details
 */
export const getRepairDetails = async (serviceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/repairs/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch repair details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch repair details');
  }
};

/**
 * Get sales vehicles
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - Vehicles for sale
 */
export const getSalesVehicles = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sales`, {
      params: {
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        year: filters.year,
        make: filters.make,
        model: filters.model,
        page: filters.page || 1,
        limit: filters.limit || 12
      }
    });

    return {
      vehicles: response.data.vehicles,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    console.error('Failed to fetch sales vehicles:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch vehicles');
  }
};

/**
 * Get sales vehicle details
 * @param {string} vehicleId - Vehicle ID
 * @returns {Promise<Object>} - Vehicle details
 */
export const getSalesVehicleDetails = async (vehicleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sales/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch vehicle details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch vehicle details');
  }
};

/**
 * Schedule a test drive
 * @param {Object} testDriveData - Test drive details
 * @returns {Promise<Object>} - Scheduled test drive
 */
export const scheduleTestDrive = async (testDriveData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sales/test-drive`, testDriveData);

    return {
      success: true,
      booking: response.data.booking,
      message: 'Test drive scheduled successfully'
    };
  } catch (error) {
    console.error('Failed to schedule test drive:', error);
    throw new Error(error.response?.data?.message || 'Failed to schedule test drive');
  }
};

/**
 * Get service availability
 * @param {string} serviceType - Type of service
 * @param {Object} options - Availability options
 * @returns {Promise<Object>} - Availability status
 */
export const getServiceAvailability = async (serviceType, options = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/availability`, {
      serviceType,
      ...options
    });

    return {
      available: response.data.available,
      slots: response.data.slots,
      message: response.data.message
    };
  } catch (error) {
    console.error('Failed to check availability:', error);
    return {
      available: false,
      slots: [],
      message: 'Availability check failed'
    };
  }
};

/**
 * Get service pricing
 * @param {string} serviceType - Type of service
 * @param {Object} options - Pricing options
 * @returns {Promise<Object>} - Price details
 */
export const getServicePricing = async (serviceType, options = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/pricing`, {
      serviceType,
      ...options
    });

    return {
      basePrice: response.data.basePrice,
      discounts: response.data.discounts,
      fees: response.data.fees,
      total: response.data.total,
      currency: response.data.currency
    };
  } catch (error) {
    console.error('Failed to get pricing:', error);
    throw new Error(error.response?.data?.message || 'Failed to calculate price');
  }
};

/**
 * Get service locations
 * @param {string} serviceType - Type of service
 * @returns {Promise<Array>} - Service locations
 */
export const getServiceLocations = async (serviceType = null) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/locations`, {
      params: { type: serviceType }
    });

    return response.data.locations;
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return [];
  }
};

/**
 * Get service reviews
 * @param {string} serviceId - Service ID
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} - Reviews with pagination
 */
export const getServiceReviews = async (serviceId, pagination = {}) => {
  try {
    const { page = 1, limit = 10 } = pagination;

    const response = await axios.get(`${API_BASE_URL}/${serviceId}/reviews`, {
      params: { page, limit }
    });

    return {
      reviews: response.data.reviews,
      averageRating: response.data.averageRating,
      totalReviews: response.data.totalReviews
    };
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return {
      reviews: [],
      averageRating: 0,
      totalReviews: 0
    };
  }
};

/**
 * Add service review
 * @param {string} serviceId - Service ID
 * @param {Object} reviewData - Review data
 * @returns {Promise<Object>} - Created review
 */
export const addServiceReview = async (serviceId, reviewData) => {
  try {
    const { rating, comment, customerName, customerEmail, bookingId } = reviewData;

    const response = await axios.post(`${API_BASE_URL}/${serviceId}/reviews`, {
      rating,
      comment,
      customerName,
      customerEmail,
      bookingId
    });

    return response.data;
  } catch (error) {
    console.error('Failed to add review:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit review');
  }
};

/**
 * Get featured services for homepage
 * @returns {Promise<Array>} - Featured services
 */
export const getFeaturedServices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/featured`);
    return response.data.services;
  } catch (error) {
    console.error('Failed to fetch featured services:', error);
    return [];
  }
};

/**
 * Search services
 * @param {string} query - Search query
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - Search results
 */
export const searchServices = async (query, filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: {
        q: query,
        type: filters.type,
        location: filters.location,
        ...filters
      }
    });

    return {
      results: response.data.results,
      total: response.data.total
    };
  } catch (error) {
    console.error('Failed to search services:', error);
    return { results: [], total: 0 };
  }
};

/**
 * Book a service
 * @param {Object} bookingData - Booking details
 * @returns {Promise<Object>} - Created booking
 */
export const bookService = async (bookingData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/book`, bookingData);

    return {
      success: true,
      booking: response.data.booking,
      message: 'Service booked successfully'
    };
  } catch (error) {
    console.error('Failed to book service:', error);
    throw new Error(error.response?.data?.message || 'Failed to book service');
  }
};

/**
 * Check if service is available for instant booking
 * @param {string} serviceId - Service ID
 * @returns {Promise<boolean>} - Instant booking availability
 */
export const isInstantBookingAvailable = async (serviceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${serviceId}/instant-booking`);
    return response.data.available;
  } catch (error) {
    console.error('Failed to check instant booking:', error);
    return false;
  }
};

// Export all service functions
export default {
  SERVICE_TYPES,
  getServices,
  getServiceById,
  getRentalServices,
  getRentalDetails,
  checkRentalAvailability,
  getCarWashServices,
  getWashPackages,
  getWashTimeSlots,
  getRepairServices,
  getRepairDetails,
  getSalesVehicles,
  getSalesVehicleDetails,
  scheduleTestDrive,
  getServiceAvailability,
  getServicePricing,
  getServiceLocations,
  getServiceReviews,
  addServiceReview,
  getFeaturedServices,
  searchServices,
  bookService,
  isInstantBookingAvailable
};
