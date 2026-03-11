// ===== src/Utils/constants.js =====
/**
 * CONSTANTS - GOD MODE
 * Single source of truth for all application constants
 */

// ===== APP CONFIGURATION =====
export const APP_CONFIG = {
  name: 'CAR EASE',
  shortName: 'CAR EASE',
  version: '1.0.0',
  description: 'Luxury automotive services platform offering premium rentals, car wash, repairs, and vehicle sales.',
  website: 'https://carease.com',
  supportEmail: 'support@carease.com',
  supportPhone: '+1 (800) 555-0123',
  established: 2018,
  
  socialMedia: {
    facebook: 'https://facebook.com/carease',
    instagram: 'https://instagram.com/carease',
    twitter: 'https://twitter.com/carease',
    linkedin: 'https://linkedin.com/company/carease'
  }
};

// ===== USER ROLES =====
export const USER_ROLES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// ===== SERVICE TYPES =====
export const SERVICE_TYPES = {
  RENTAL: 'rental',
  CAR_WASH: 'car_wash',
  REPAIR: 'repair',
  SALES: 'sales'
};

export const SERVICE_CATEGORIES = [
  {
    id: SERVICE_TYPES.RENTAL,
    name: 'Luxury Rentals',
    icon: '🚗',
    description: 'Premium vehicle rental service',
    features: ['Daily/Weekly Rates', 'Chauffeur Option', 'Insurance Included']
  },
  {
    id: SERVICE_TYPES.CAR_WASH,
    name: 'Car Wash & Detailing',
    icon: '🧼',
    description: 'Professional detailing services',
    features: ['Express Wash', 'Premium Detail', 'Ceramic Coating']
  },
  {
    id: SERVICE_TYPES.REPAIR,
    name: 'Repairs & Maintenance',
    icon: '🔧',
    description: 'Expert mechanical services',
    features: ['Diagnostics', 'Performance Tuning', 'Factory Repairs']
  },
  {
    id: SERVICE_TYPES.SALES,
    name: 'Vehicle Sales',
    icon: '💰',
    description: 'Curated luxury automobiles',
    features: ['Financing Options', 'Vehicle History', 'Warranty Included']
  }
];

// ===== BOOKING STATUS =====
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  REFUNDED: 'refunded'
};

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: 'Pending',
  [BOOKING_STATUS.CONFIRMED]: 'Confirmed',
  [BOOKING_STATUS.IN_PROGRESS]: 'In Progress',
  [BOOKING_STATUS.COMPLETED]: 'Completed',
  [BOOKING_STATUS.CANCELLED]: 'Cancelled',
  [BOOKING_STATUS.NO_SHOW]: 'No Show',
  [BOOKING_STATUS.REFUNDED]: 'Refunded'
};

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'warning',
  [BOOKING_STATUS.CONFIRMED]: 'info',
  [BOOKING_STATUS.IN_PROGRESS]: 'gold',
  [BOOKING_STATUS.COMPLETED]: 'success',
  [BOOKING_STATUS.CANCELLED]: 'error',
  [BOOKING_STATUS.NO_SHOW]: 'error',
  [BOOKING_STATUS.REFUNDED]: 'secondary'
};

// ===== PAYMENT STATUS =====
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PROCESSING]: 'Processing',
  [PAYMENT_STATUS.COMPLETED]: 'Completed',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'Partially Refunded'
};

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: 'warning',
  [PAYMENT_STATUS.PROCESSING]: 'info',
  [PAYMENT_STATUS.COMPLETED]: 'success',
  [PAYMENT_STATUS.FAILED]: 'error',
  [PAYMENT_STATUS.REFUNDED]: 'secondary',
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'warning'
};

// ===== PAYMENT METHODS =====
export const PAYMENT_METHODS = {
  CARD: 'card',
  PAYPAL: 'paypal',
  MPESA: 'mpesa',
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer'
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CARD]: 'Credit/Debit Card',
  [PAYMENT_METHODS.PAYPAL]: 'PayPal',
  [PAYMENT_METHODS.MPESA]: 'M-PESA',
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer'
};

export const PAYMENT_METHOD_ICONS = {
  [PAYMENT_METHODS.CARD]: '💳',
  [PAYMENT_METHODS.PAYPAL]: '📧',
  [PAYMENT_METHODS.MPESA]: '📱',
  [PAYMENT_METHODS.CASH]: '💵',
  [PAYMENT_METHODS.BANK_TRANSFER]: '🏦'
};

// ===== DELIVERY METHODS =====
export const DELIVERY_METHODS = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
  CONCIERGE: 'concierge'
};

export const DELIVERY_METHOD_LABELS = {
  [DELIVERY_METHODS.PICKUP]: 'Pick up from location',
  [DELIVERY_METHODS.DELIVERY]: 'Deliver to my address',
  [DELIVERY_METHODS.CONCIERGE]: 'Concierge service'
};

// ===== VEHICLE CATEGORIES =====
export const VEHICLE_CATEGORIES = [
  {
    id: 'supercar',
    label: 'Supercar',
    multiplier: 2.0,
    minAge: 25,
    deposit: 0.5,
    icon: '🏎️',
    description: 'High-performance exotic vehicles'
  },
  {
    id: 'luxury',
    label: 'Luxury Sedan',
    multiplier: 1.5,
    minAge: 23,
    deposit: 0.3,
    icon: '🚘',
    description: 'Premium comfort and style'
  },
  {
    id: 'sports',
    label: 'Sports Car',
    multiplier: 1.8,
    minAge: 24,
    deposit: 0.4,
    icon: '🏁',
    description: 'Dynamic driving experience'
  },
  {
    id: 'suv',
    label: 'Luxury SUV',
    multiplier: 1.3,
    minAge: 22,
    deposit: 0.25,
    icon: '🚙',
    description: 'Space and sophistication'
  },
  {
    id: 'exotic',
    label: 'Exotic',
    multiplier: 2.5,
    minAge: 25,
    deposit: 0.6,
    icon: '✨',
    description: 'Rare and extraordinary'
  }
];

// ===== LOCATIONS =====
export const LOCATIONS = [
  {
    id: 'beverly-hills',
    name: 'Beverly Hills Showroom',
    address: '123 Luxury Lane, Beverly Hills, CA 90210',
    coordinates: { lat: 34.0736, lng: -118.4004 },
    phone: '+1 (310) 555-0123',
    email: 'beverlyhills@carease.com',
    hours: 'Mon-Sun: 9am - 8pm',
    services: [SERVICE_TYPES.RENTAL, SERVICE_TYPES.CAR_WASH, SERVICE_TYPES.REPAIR, SERVICE_TYPES.SALES]
  },
  {
    id: 'miami',
    name: 'Miami Beach Location',
    address: '456 Ocean Drive, Miami Beach, FL 33139',
    coordinates: { lat: 25.7907, lng: -80.1300 },
    phone: '+1 (305) 555-0456',
    email: 'miami@carease.com',
    hours: 'Mon-Sun: 10am - 7pm',
    services: [SERVICE_TYPES.RENTAL, SERVICE_TYPES.CAR_WASH, SERVICE_TYPES.SALES]
  },
  {
    id: 'new-york',
    name: 'Manhattan Showroom',
    address: '789 Park Avenue, New York, NY 10022',
    coordinates: { lat: 40.7614, lng: -73.9776 },
    phone: '+1 (212) 555-0789',
    email: 'nyc@carease.com',
    hours: 'Mon-Fri: 9am - 8pm, Sat: 10am-6pm',
    services: [SERVICE_TYPES.RENTAL, SERVICE_TYPES.REPAIR, SERVICE_TYPES.SALES]
  }
];

// ===== WASH PACKAGES =====
export const WASH_PACKAGES = [
  {
    id: 'express',
    name: 'Express Wash',
    price: 29,
    duration: 30,
    description: 'Quick and efficient exterior wash',
    features: [
      'Exterior hand wash',
      'Wheel cleaning',
      'Tire shine',
      'Window cleaning',
      'Quick interior vacuum'
    ],
    icon: '🚿'
  },
  {
    id: 'premium',
    name: 'Premium Detail',
    price: 79,
    duration: 90,
    description: 'Comprehensive interior and exterior detailing',
    features: [
      'Everything in Express',
      'Deep interior cleaning',
      'Leather conditioning',
      'Clay bar treatment',
      'Paint sealant',
      'Engine bay cleaning'
    ],
    icon: '✨'
  },
  {
    id: 'ultimate',
    name: 'Ultimate Ceramic',
    price: 199,
    duration: 180,
    description: 'Professional ceramic coating for lasting protection',
    features: [
      'Everything in Premium',
      '9H ceramic coating',
      'Paint correction',
      'Headlight restoration',
      'Fabric protection',
      '24 month warranty'
    ],
    icon: '💎'
  }
];

// ===== REPAIR SERVICES =====
export const REPAIR_SERVICES = [
  {
    id: 'diagnostic',
    name: 'Diagnostic Service',
    price: 89,
    duration: 60,
    description: 'Complete vehicle diagnostics and health check',
    icon: '🔍'
  },
  {
    id: 'maintenance',
    name: 'Regular Maintenance',
    price: 199,
    duration: 120,
    description: 'Oil change, filters, fluid top-up, tire rotation',
    icon: '🔧'
  },
  {
    id: 'repair',
    name: 'General Repairs',
    price: 349,
    duration: 180,
    description: 'Brakes, suspension, engine repairs',
    icon: '⚙️'
  },
  {
    id: 'performance',
    name: 'Performance Tuning',
    price: 599,
    duration: 240,
    description: 'ECU tuning, dyno testing, custom mapping',
    icon: '🚀'
  }
];

// ===== MESSAGES =====
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  BOOKING_ERROR: 'Failed to create booking. Please try again.',
  PAYMENT_ERROR: 'Payment processing failed. Please try again.',
  VALIDATION_ERROR: 'Please check your inputs and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.'
};

export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: 'Booking created successfully! Check your email for confirmation.',
  PAYMENT_COMPLETED: 'Payment completed successfully!',
  CONTACT_SENT: 'Message sent successfully! We\'ll respond within 24 hours.',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!'
};

// ===== VALIDATION =====
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  ADDRESS_MIN_LENGTH: 5,
  ADDRESS_MAX_LENGTH: 200
};

// ===== TIME SLOTS =====
export const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
];

export const WORKING_HOURS = {
  start: 8,
  end: 18,
  interval: 60
};

// ===== DATE FORMATS =====
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY h:mm A',
  ISO: 'YYYY-MM-DD',
  ISO_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  API: 'YYYY-MM-DD',
  TIME: 'h:mm A'
};

// ===== CURRENCY =====
export const CURRENCY = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  locale: 'en-US'
};

// ===== TAX RATE =====
export const TAX_RATE = 0.1;

// ===== DEPOSIT RATES =====
export const DEPOSIT_RATES = {
  standard: 0.2,
  luxury: 0.3,
  exotic: 0.5
};

// ===== LATE FEES =====
export const LATE_FEE_DAILY = 50;

// ===== BOOKING LIMITS =====
export const BOOKING_LIMITS = {
  MIN_DAYS: 1,
  MAX_DAYS: 30,
  ADVANCE_BOOKING_DAYS: 90,
  CANCELLATION_HOURS: 48,
  MIN_DRIVER_AGE: 21,
  MAX_DRIVER_AGE: 99
};

// ===== PAGINATION =====
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100]
};

// ===== FILE UPLOAD =====
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword']
};

// ===== LOCAL STORAGE KEYS =====
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'carease_auth_token',
  REFRESH_TOKEN: 'carease_refresh_token',
  USER_DATA: 'carease_user_data',
  USER_ROLE: 'carease_user_role',
  THEME: 'carease_theme',
  CART: 'carease_cart',
  RECENT_SEARCHES: 'carease_recent_searches'
};

// ===== THEME OPTIONS =====
export const THEME_OPTIONS = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system'
};

// ===== BREAKPOINTS =====
export const BREAKPOINTS = {
  XS: 480,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// ===== ANIMATION DURATIONS =====
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  SLOWER: 1000
};

// ===== COMPANY INFO =====
export const COMPANY_INFO = {
  name: 'CAR EASE LLC',
  phone: '+1 (800) 555-0123',
  email: 'info@carease.com',
  supportEmail: 'support@carease.com',
  city: 'Beverly Hills',
  state: 'California',
  country: 'USA'
};

// ===== EXPORT ALL =====
export default {
  APP_CONFIG,
  USER_ROLES,
  SERVICE_TYPES,
  SERVICE_CATEGORIES,
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
  DELIVERY_METHODS,
  DELIVERY_METHOD_LABELS,
  VEHICLE_CATEGORIES,
  LOCATIONS,
  WASH_PACKAGES,
  REPAIR_SERVICES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  TIME_SLOTS,
  WORKING_HOURS,
  DATE_FORMATS,
  CURRENCY,
  TAX_RATE,
  DEPOSIT_RATES,
  LATE_FEE_DAILY,
  BOOKING_LIMITS,
  PAGINATION,
  FILE_UPLOAD,
  STORAGE_KEYS,
  THEME_OPTIONS,
  BREAKPOINTS,
  ANIMATION,
  COMPANY_INFO
};