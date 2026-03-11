// ===== src/Validations/booking.validation.js =====
/**
 * BOOKING VALIDATION - GOD MODE
 * Comprehensive validation for booking operations
 */

import { validateEmail, validatePhone, validateName, validateDate, validateTime } from '../Utils/validation';

// ===== BOOKING CREATION VALIDATION =====
export const validateBookingCreation = (data) => {
  const errors = {};

  // Customer Information
  if (!data.firstName) {
    errors.firstName = 'First name is required';
  } else if (!validateName(data.firstName)) {
    errors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
  } else if (data.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }

  if (!data.lastName) {
    errors.lastName = 'Last name is required';
  } else if (!validateName(data.lastName)) {
    errors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
  } else if (data.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }

  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.phone) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // Service Information
  if (!data.serviceType) {
    errors.serviceType = 'Service type is required';
  } else if (!['rental', 'car_wash', 'repair', 'sales'].includes(data.serviceType)) {
    errors.serviceType = 'Invalid service type';
  }

  // Date and Time
  if (!data.date) {
    errors.date = 'Date is required';
  } else if (!validateDate(data.date)) {
    errors.date = 'Please enter a valid date';
  } else {
    const bookingDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      errors.date = 'Booking date cannot be in the past';
    }

    // Check advance booking limit
    const maxAdvanceDays = 90;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
    
    if (bookingDate > maxDate) {
      errors.date = `Bookings can only be made up to ${maxAdvanceDays} days in advance`;
    }
  }

  if (!data.time) {
    errors.time = 'Time is required';
  } else if (!validateTime(data.time)) {
    errors.time = 'Please enter a valid time (HH:MM)';
  }

  // Location
  if (!data.location) {
    errors.location = 'Location is required';
  }

  // Service-specific validations
  if (data.serviceType === 'rental') {
    if (!data.vehicleId) {
      errors.vehicleId = 'Vehicle selection is required';
    }

    if (!data.duration) {
      errors.duration = 'Rental duration is required';
    } else if (isNaN(data.duration) || data.duration < 1) {
      errors.duration = 'Duration must be at least 1 day';
    } else if (data.duration > 30) {
      errors.duration = 'Duration cannot exceed 30 days';
    }

    // Driver age validation
    if (data.driverAge) {
      const age = parseInt(data.driverAge);
      if (isNaN(age) || age < 21) {
        errors.driverAge = 'Driver must be at least 21 years old';
      } else if (age > 99) {
        errors.driverAge = 'Invalid age';
      }
    }
  }

  if (data.serviceType === 'car_wash') {
    if (!data.washPackage) {
      errors.washPackage = 'Wash package is required';
    } else if (!['express', 'premium', 'ultimate', 'ceramic'].includes(data.washPackage)) {
      errors.washPackage = 'Invalid wash package';
    }

    if (data.vehicleSize && !['compact', 'standard', 'suv', 'luxury', 'exotic'].includes(data.vehicleSize)) {
      errors.vehicleSize = 'Invalid vehicle size';
    }
  }

  if (data.serviceType === 'repair') {
    if (!data.repairType) {
      errors.repairType = 'Repair type is required';
    } else if (!['diagnostic', 'maintenance', 'repair', 'performance', 'emergency'].includes(data.repairType)) {
      errors.repairType = 'Invalid repair type';
    }

    if (data.vehicleType && !['compact', 'standard', 'luxury', 'exotic', 'electric'].includes(data.vehicleType)) {
      errors.vehicleType = 'Invalid vehicle type';
    }
  }

  // Delivery Method
  if (data.deliveryMethod) {
    if (!['pickup', 'delivery', 'concierge'].includes(data.deliveryMethod)) {
      errors.deliveryMethod = 'Invalid delivery method';
    }

    if (data.deliveryMethod === 'delivery' && !data.deliveryAddress) {
      errors.deliveryAddress = 'Delivery address is required';
    }
  }

  // Terms acceptance
  if (!data.termsAccepted) {
    errors.terms = 'You must accept the terms and conditions';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== BOOKING UPDATE VALIDATION =====
export const validateBookingUpdate = (data) => {
  const errors = {};

  // Booking ID validation
  if (!data.bookingId) {
    errors.bookingId = 'Booking ID is required';
  }

  // Status validation (if being updated)
  if (data.status) {
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(data.status)) {
      errors.status = 'Invalid booking status';
    }
  }

  // Date validation (if being updated)
  if (data.date) {
    if (!validateDate(data.date)) {
      errors.date = 'Please enter a valid date';
    } else {
      const newDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (newDate < today) {
        errors.date = 'Booking date cannot be in the past';
      }
    }
  }

  // Time validation (if being updated)
  if (data.time && !validateTime(data.time)) {
    errors.time = 'Please enter a valid time (HH:MM)';
  }

  // Duration validation (if being updated)
  if (data.duration !== undefined) {
    if (isNaN(data.duration) || data.duration < 1) {
      errors.duration = 'Duration must be at least 1 day';
    } else if (data.duration > 30) {
      errors.duration = 'Duration cannot exceed 30 days';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== BOOKING CANCELLATION VALIDATION =====
export const validateBookingCancellation = (data) => {
  const errors = {};

  if (!data.bookingId) {
    errors.bookingId = 'Booking ID is required';
  }

  if (!data.reason) {
    errors.reason = 'Cancellation reason is required';
  } else if (data.reason.length < 5) {
    errors.reason = 'Please provide a valid reason (minimum 5 characters)';
  } else if (data.reason.length > 500) {
    errors.reason = 'Reason cannot exceed 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== BOOKING RESCHEDULE VALIDATION =====
export const validateBookingReschedule = (data) => {
  const errors = {};

  if (!data.bookingId) {
    errors.bookingId = 'Booking ID is required';
  }

  if (!data.newDate) {
    errors.newDate = 'New date is required';
  } else if (!validateDate(data.newDate)) {
    errors.newDate = 'Please enter a valid date';
  } else {
    const newDate = new Date(data.newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (newDate < today) {
      errors.newDate = 'New date cannot be in the past';
    }
  }

  if (!data.newTime) {
    errors.newTime = 'New time is required';
  } else if (!validateTime(data.newTime)) {
    errors.newTime = 'Please enter a valid time (HH:MM)';
  }

  if (!data.reason) {
    errors.reason = 'Reschedule reason is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== BOOKING SEARCH VALIDATION =====
export const validateBookingSearch = (data) => {
  const errors = {};

  // At least one search criteria must be provided
  if (!data.bookingId && !data.email && !data.phone && !data.date) {
    errors.search = 'Please provide at least one search criteria';
  }

  // Booking ID validation (if provided)
  if (data.bookingId && typeof data.bookingId !== 'string') {
    errors.bookingId = 'Invalid booking ID';
  }

  // Email validation (if provided)
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation (if provided)
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // Date validation (if provided)
  if (data.date && !validateDate(data.date)) {
    errors.date = 'Please enter a valid date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== AVAILABILITY CHECK VALIDATION =====
export const validateAvailabilityCheck = (data) => {
  const errors = {};

  if (!data.serviceType) {
    errors.serviceType = 'Service type is required';
  }

  if (!data.date) {
    errors.date = 'Date is required';
  } else if (!validateDate(data.date)) {
    errors.date = 'Please enter a valid date';
  } else {
    const checkDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkDate < today) {
      errors.date = 'Cannot check availability for past dates';
    }
  }

  if (data.time && !validateTime(data.time)) {
    errors.time = 'Please enter a valid time (HH:MM)';
  }

  if (data.serviceType === 'rental' && !data.vehicleId) {
    errors.vehicleId = 'Vehicle ID is required for rental availability';
  }

  if (data.location && typeof data.location !== 'string') {
    errors.location = 'Invalid location';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== EXTRAS VALIDATION =====
export const validateBookingExtras = (data) => {
  const errors = {};

  if (!data.extras || !Array.isArray(data.extras)) {
    errors.extras = 'Extras must be an array';
  } else {
    const validExtras = ['insurance', 'gps', 'childSeat', 'additionalDriver', 'roadside'];
    
    data.extras.forEach((extra, index) => {
      if (typeof extra === 'string') {
        if (!validExtras.includes(extra)) {
          errors[`extra_${index}`] = `Invalid extra: ${extra}`;
        }
      } else if (typeof extra === 'object') {
        if (!extra.id || !validExtras.includes(extra.id)) {
          errors[`extra_${index}`] = 'Extra missing valid ID';
        }
        if (extra.quantity && (isNaN(extra.quantity) || extra.quantity < 1)) {
          errors[`extra_${index}`] = 'Quantity must be at least 1';
        }
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== BOOKING NOTES VALIDATION =====
export const validateBookingNotes = (data) => {
  const errors = {};

  if (!data.bookingId) {
    errors.bookingId = 'Booking ID is required';
  }

  if (!data.notes) {
    errors.notes = 'Notes are required';
  } else if (data.notes.length < 5) {
    errors.notes = 'Notes must be at least 5 characters';
  } else if (data.notes.length > 1000) {
    errors.notes = 'Notes cannot exceed 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== EXPORT ALL =====
export default {
  validateBookingCreation,
  validateBookingUpdate,
  validateBookingCancellation,
  validateBookingReschedule,
  validateBookingSearch,
  validateAvailabilityCheck,
  validateBookingExtras,
  validateBookingNotes
};