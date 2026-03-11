// ===== src/Config/api.js =====
/**
 * API CONFIGURATION - GOD MODE
 * Centralized API configuration for the entire application
 */
import { getEnv } from './env';

// API Base URLs
export const API_BASE_URL = getEnv('REACT_APP_API_URL') || '/api/v1';
export const API_TIMEOUT = 30000; // 30 seconds

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
    
    // Admin auth
    ADMIN_LOGIN: '/auth/admin/login',
    ADMIN_VERIFY: '/auth/admin/verify',
    ADMIN_LOGOUT: '/auth/admin/logout'
  },

  // User endpoints
  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    UPDATE_ROLE: (id) => `/users/${id}/role`,
    UPDATE_STATUS: (id) => `/users/${id}/status`,
    BOOKINGS: (id) => `/users/${id}/bookings`,
    PAYMENTS: (id) => `/users/${id}/payments`
  },

  // Booking endpoints
  BOOKINGS: {
    GET_ALL: '/bookings',
    GET_BY_ID: (id) => `/bookings/${id}`,
    CREATE: '/bookings',
    UPDATE: (id) => `/bookings/${id}`,
    DELETE: (id) => `/bookings/${id}`,
    STATUS: (id) => `/bookings/${id}/status`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
    RESCHEDULE: (id) => `/bookings/${id}/reschedule`,
    CHECK_AVAILABILITY: '/bookings/check-availability',
    AVAILABLE_SLOTS: '/bookings/available-slots',
    CALCULATE_PRICE: '/bookings/calculate-price',
    USER_BOOKINGS: (userId) => `/bookings/user/${userId}`
  },

  // Payment endpoints
  PAYMENTS: {
    GET_ALL: '/payments',
    GET_BY_ID: (id) => `/payments/${id}`,
    CREATE: '/payments',
    UPDATE: (id) => `/payments/${id}`,
    REFUND: (id) => `/payments/${id}/refund`,
    STATUS: (id) => `/payments/${id}/status`,
    RECEIPT: (id) => `/payments/${id}/receipt`,
    USER_PAYMENTS: (userId) => `/payments/user/${userId}`,
    
    // Payment gateway specific
    STRIPE_INTENT: '/payments/stripe/create-intent',
    PAYPAL_ORDER: '/payments/paypal/create-order',
    PAYPAL_CAPTURE: (orderId) => `/payments/paypal/${orderId}/capture`,
    MPESA_STK_PUSH: '/payments/mpesa/stk-push',
    MPESA_STATUS: (requestId) => `/payments/mpesa/${requestId}/status`,
    SQUARE_PAYMENT: '/payments/square',
    FLUTTERWAVE_CHARGE: '/payments/flutterwave/charge',
    FLUTTERWAVE_VERIFY: (id) => `/payments/flutterwave/${id}/verify`
  },

  // Vehicle endpoints
  VEHICLES: {
    GET_ALL: '/vehicles',
    GET_FEATURED: '/vehicles/featured',
    GET_BY_ID: (id) => `/vehicles/${id}`,
    CREATE: '/vehicles',
    UPDATE: (id) => `/vehicles/${id}`,
    DELETE: (id) => `/vehicles/${id}`,
    AVAILABILITY: (id) => `/vehicles/${id}/availability`,
    PRICING: (id) => `/vehicles/${id}/pricing`,
    REVIEWS: (id) => `/vehicles/${id}/reviews`,
    ADD_REVIEW: (id) => `/vehicles/${id}/reviews`,
    SIMILAR: (id) => `/vehicles/${id}/similar`,
    SEARCH: '/vehicles/search',
    RESERVE: (id) => `/vehicles/${id}/reserve`,
    SPECS: (id) => `/vehicles/${id}/specs`,
    IMAGES: (id) => `/vehicles/${id}/images`,
    FAVORITE: (id) => `/vehicles/${id}/favorite`,
    FAVORITES: (userId) => `/vehicles/favorites/${userId}`,
    MAINTENANCE: (id) => `/vehicles/${id}/maintenance`
  },

  // Service endpoints
  SERVICES: {
    GET_ALL: '/services',
    GET_BY_ID: (id) => `/services/${id}`,
    GET_RENTALS: '/services/rentals',
    GET_RENTAL_DETAILS: (id) => `/services/rentals/${id}`,
    GET_CAR_WASH: '/services/car-wash',
    GET_WASH_PACKAGES: '/services/car-wash/packages',
    GET_WASH_SLOTS: '/services/car-wash/slots',
    GET_REPAIRS: '/services/repairs',
    GET_REPAIR_DETAILS: (id) => `/services/repairs/${id}`,
    GET_SALES: '/services/sales',
    GET_SALE_DETAILS: (id) => `/services/sales/${id}`,
    TEST_DRIVE: '/services/sales/test-drive',
    AVAILABILITY: '/services/availability',
    PRICING: '/services/pricing',
    LOCATIONS: '/services/locations',
    REVIEWS: (id) => `/services/${id}/reviews`,
    ADD_REVIEW: (id) => `/services/${id}/reviews`,
    FEATURED: '/services/featured',
    SEARCH: '/services/search',
    BOOK: '/services/book',
    INSTANT_BOOKING: (id) => `/services/${id}/instant-booking`
  },

  // Location endpoints
  LOCATIONS: {
    GEOCODE: '/location/geocode',
    REVERSE_GEOCODE: '/location/reverse-geocode',
    DISTANCE_MATRIX: '/location/distance-matrix',
    PLACE_AUTOCOMPLETE: '/location/place/autocomplete',
    PLACE_DETAILS: (id) => `/location/place/${id}`,
    DELIVERY_ESTIMATE: '/location/delivery-estimate',
    SURGE: '/location/surge',
    TOLLS: '/location/tolls',
    TRACK: (id) => `/location/track/${id}`,
    NEARBY: '/location/nearby',
    ADDRESSES: '/location/addresses',
    ADDRESS_BY_ID: (id) => `/location/addresses/${id}`
  },

  // Delivery endpoints
  DELIVERY: {
    CREATE: '/delivery/create',
    GET_BY_ID: (id) => `/delivery/${id}`,
    TRACK: (id) => `/delivery/track/${id}`,
    TRACK_STREAM: (id) => `/delivery/track/${id}/stream`,
    DRIVER_LOCATION: (id) => `/delivery/${id}/driver-location`,
    ETA: (id) => `/delivery/${id}/eta`,
    STATUS: (id) => `/delivery/${id}/status`,
    CANCEL: (id) => `/delivery/${id}/cancel`,
    RATE: (id) => `/delivery/${id}/rate`,
    USER_HISTORY: (userId) => `/delivery/user/${userId}`,
    SCHEDULE: '/delivery/schedule',
    AVAILABLE_SLOTS: '/delivery/available-slots',
    CALCULATE_COST: '/delivery/calculate-cost',
    SELECT_CARRIER: '/delivery/select-carrier',
    ASSIGN_DRIVER: (id) => `/delivery/${id}/assign-driver`,
    NOTIFICATIONS: (id) => `/delivery/${id}/notifications`
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD_STATS: '/admin/dashboard/stats',
    RECENT_BOOKINGS: '/admin/recent-bookings',
    
    // Reports
    REPORTS_REVENUE: '/admin/reports/revenue',
    REPORTS_BOOKINGS: '/admin/reports/bookings',
    REPORTS_ANALYTICS: '/admin/reports/analytics',
    EXPORT: (type) => `/admin/export/${type}`,
    
    // Settings
    SETTINGS: '/admin/settings',
    AUDIT_LOGS: '/admin/audit-logs',
    
    // Notifications
    SEND_NOTIFICATION: '/admin/notifications/send',
    
    // Maintenance
    MAINTENANCE_REQUESTS: '/admin/maintenance',
    MAINTENANCE_REQUEST: (id) => `/admin/maintenance/${id}`
  },

  // Email endpoints
  EMAIL: {
    SEND: '/email/send',
    NEWSLETTER_SUBSCRIBE: '/email/newsletter/subscribe',
    CONTACT: '/email/contact',
    FAILED: '/email/failed',
    STATUS: (id) => `/email/status/${id}`
  },

  // Webhook endpoints
  WEBHOOKS: {
    STRIPE: '/webhooks/stripe',
    PAYPAL: '/webhooks/paypal',
    MPESA: '/webhooks/mpesa',
    SQUARE: '/webhooks/square',
    FLUTTERWAVE: '/webhooks/flutterwave'
  },

  // Health check
  HEALTH: '/health'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Default headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
};

// API Configuration object
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: DEFAULT_HEADERS,
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000,
    statusCodes: [
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      HTTP_STATUS.TOO_MANY_REQUESTS
    ]
  },

  // Cache configuration
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100
  },

  // Rate limiting
  rateLimit: {
    maxRequests: 100,
    perSeconds: 60
  }
};

// API Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment.',
  DEFAULT: 'An unexpected error occurred. Please try again.'
};

// Export all
export default {
  API_BASE_URL,
  API_TIMEOUT,
  API_ENDPOINTS,
  HTTP_STATUS,
  DEFAULT_HEADERS,
  API_CONFIG,
  API_ERROR_MESSAGES
};
