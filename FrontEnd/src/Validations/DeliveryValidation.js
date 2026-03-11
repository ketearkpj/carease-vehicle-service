// ===== src/Validations/delivery.validation.js =====
/**
 * DELIVERY VALIDATION - GOD MODE
 * Comprehensive validation for delivery operations
 */

import { validatePhone, validateName, validatePostalCode } from '../Utils/validation';

// ===== DELIVERY ADDRESS VALIDATION =====
export const validateDeliveryAddress = (data) => {
  const errors = {};

  // Street address validation
  if (!data.addressLine1) {
    errors.addressLine1 = 'Street address is required';
  } else if (data.addressLine1.length < 5) {
    errors.addressLine1 = 'Please enter a complete street address';
  } else if (data.addressLine1.length > 200) {
    errors.addressLine1 = 'Address is too long';
  }

  // City validation
  if (!data.city) {
    errors.city = 'City is required';
  } else if (data.city.length < 2) {
    errors.city = 'Please enter a valid city name';
  } else if (!/^[a-zA-Z\s\-']+$/.test(data.city)) {
    errors.city = 'City name can only contain letters, spaces, hyphens, and apostrophes';
  }

  // State validation
  if (!data.state) {
    errors.state = 'State is required';
  } else if (data.state.length !== 2) {
    errors.state = 'Please use 2-letter state code';
  }

  // Postal code validation
  if (!data.postalCode) {
    errors.postalCode = 'Postal code is required';
  } else if (!validatePostalCode(data.postalCode, data.country || 'USA')) {
    errors.postalCode = 'Please enter a valid postal code';
  }

  // Country validation
  if (!data.country) {
    errors.country = 'Country is required';
  }

  // Address line 2 is optional, but validate if provided
  if (data.addressLine2 && data.addressLine2.length > 100) {
    errors.addressLine2 = 'Address line 2 is too long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== DELIVERY CONTACT VALIDATION =====
export const validateDeliveryContact = (data) => {
  const errors = {};

  // Contact name validation
  if (!data.contactName) {
    errors.contactName = 'Contact name is required';
  } else if (!validateName(data.contactName)) {
    errors.contactName = 'Name can only contain letters, spaces, hyphens, and apostrophes';
  } else if (data.contactName.length < 2) {
    errors.contactName = 'Name must be at least 2 characters';
  } else if (data.contactName.length > 50) {
    errors.contactName = 'Name cannot exceed 50 characters';
  }

  // Contact phone validation
  if (!data.contactPhone) {
    errors.contactPhone = 'Contact phone is required';
  } else if (!validatePhone(data.contactPhone)) {
    errors.contactPhone = 'Please enter a valid phone number';
  }

  // Alternative phone (optional)
  if (data.alternativePhone && !validatePhone(data.alternativePhone)) {
    errors.alternativePhone = 'Please enter a valid alternative phone number';
  }

  // Email (optional but must be valid if provided)
  if (data.contactEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== DELIVERY SCHEDULE VALIDATION =====
export const validateDeliverySchedule = (data) => {
  const errors = {};

  const now = new Date();
  const minTime = new Date(now.getTime() + 60 * 60 * 1000); // Minimum 1 hour from now

  // Pickup time validation
  if (!data.pickupTime) {
    errors.pickupTime = 'Pickup time is required';
  } else {
    const pickupTime = new Date(data.pickupTime);
    if (isNaN(pickupTime.getTime())) {
      errors.pickupTime = 'Invalid pickup time';
    } else if (pickupTime < minTime) {
      errors.pickupTime = 'Pickup must be at least 1 hour from now';
    }
  }

  // Dropoff time validation
  if (!data.dropoffTime) {
    errors.dropoffTime = 'Dropoff time is required';
  } else {
    const dropoffTime = new Date(data.dropoffTime);
    if (isNaN(dropoffTime.getTime())) {
      errors.dropoffTime = 'Invalid dropoff time';
    } else if (data.pickupTime && dropoffTime <= new Date(data.pickupTime)) {
      errors.dropoffTime = 'Dropoff time must be after pickup time';
    }
  }

  // Delivery type validation
  if (data.deliveryType && !['standard', 'express', 'scheduled', 'white_glove'].includes(data.deliveryType)) {
    errors.deliveryType = 'Invalid delivery type';
  }

  // Time window validation (optional)
  if (data.timeWindow) {
    const { start, end } = data.timeWindow;
    if (start && end && start >= end) {
      errors.timeWindow = 'Time window start must be before end';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== DELIVERY ITEMS VALIDATION =====
export const validateDeliveryItems = (data) => {
  const errors = {};

  if (!data.items || !Array.isArray(data.items)) {
    errors.items = 'Items must be an array';
  } else if (data.items.length === 0) {
    errors.items = 'At least one item is required';
  } else {
    data.items.forEach((item, index) => {
      const itemErrors = [];

      if (!item.name) {
        itemErrors.push('Item name is required');
      } else if (item.name.length < 2) {
        itemErrors.push('Item name must be at least 2 characters');
      }

      if (!item.quantity || item.quantity < 1) {
        itemErrors.push('Quantity must be at least 1');
      } else if (item.quantity > 100) {
        itemErrors.push('Quantity cannot exceed 100');
      }

      if (item.weight && (isNaN(item.weight) || item.weight < 0)) {
        itemErrors.push('Invalid weight');
      }

      if (item.value && (isNaN(item.value) || item.value < 0)) {
        itemErrors.push('Invalid value');
      }

      if (itemErrors.length > 0) {
        errors[`item_${index}`] = itemErrors.join(', ');
      }
    });
  }

  // Total weight validation
  if (data.totalWeight) {
    const totalWeight = parseFloat(data.totalWeight);
    if (isNaN(totalWeight) || totalWeight < 0) {
      errors.totalWeight = 'Invalid total weight';
    } else if (totalWeight > 1000) {
      errors.totalWeight = 'Total weight exceeds maximum limit (1000kg)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== DELIVERY INSTRUCTIONS VALIDATION =====
export const validateDeliveryInstructions = (data) => {
  const errors = {};

  // Instructions are optional, but validate if provided
  if (data.instructions && data.instructions.length > 500) {
    errors.instructions = 'Instructions cannot exceed 500 characters';
  }

  // Special handling instructions
  if (data.specialHandling && !['fragile', 'perishable', 'hazardous', 'heavy'].includes(data.specialHandling)) {
    errors.specialHandling = 'Invalid special handling type';
  }

  // Access instructions
  if (data.accessInstructions && data.accessInstructions.length > 200) {
    errors.accessInstructions = 'Access instructions too long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== DELIVERY CREATION VALIDATION =====
export const validateDeliveryCreation = (data) => {
  const addressValidation = validateDeliveryAddress(data);
  const contactValidation = validateDeliveryContact(data);
  const scheduleValidation = validateDeliverySchedule(data);
  const itemsValidation = validateDeliveryItems(data);
  const instructionsValidation = validateDeliveryInstructions(data);

  const errors = {
    ...addressValidation.errors,
    ...contactValidation.errors,
    ...scheduleValidation.errors,
    ...itemsValidation.errors,
    ...instructionsValidation.errors
  };

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== DELIVERY TRACKING VALIDATION =====
export const validateDeliveryTracking = (data) => {
  const errors = {};

  if (!data.trackingId) {
    errors.trackingId = 'Tracking ID is required';
  } else if (typeof data.trackingId !== 'string') {
    errors.trackingId = 'Invalid tracking ID';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== DELIVERY STATUS UPDATE VALIDATION =====
export const validateDeliveryStatusUpdate = (data) => {
  const errors = {};

  if (!data.deliveryId) {
    errors.deliveryId = 'Delivery ID is required';
  }

  if (!data.status) {
    errors.status = 'Status is required';
  } else if (!['pending', 'assigned', 'picked_up', 'in_transit', 'nearby', 'delivered', 'failed', 'cancelled'].includes(data.status)) {
    errors.status = 'Invalid delivery status';
  }

  // Location validation for certain statuses
  if (['picked_up', 'in_transit', 'nearby'].includes(data.status) && !data.location) {
    errors.location = 'Location is required for this status';
  }

  if (data.location) {
    if (!data.location.lat || !data.location.lng) {
      errors.location = 'Invalid location coordinates';
    }
  }

  // Reason validation for failed/cancelled status
  if (['failed', 'cancelled'].includes(data.status) && !data.reason) {
    errors.reason = 'Reason is required for failed/cancelled deliveries';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== DELIVERY RATING VALIDATION =====
export const validateDeliveryRating = (data) => {
  const errors = {};

  if (!data.deliveryId) {
    errors.deliveryId = 'Delivery ID is required';
  }

  if (!data.rating) {
    errors.rating = 'Rating is required';
  } else {
    const rating = parseInt(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }
  }

  if (data.feedback && data.feedback.length > 500) {
    errors.feedback = 'Feedback cannot exceed 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== DELIVERY SEARCH VALIDATION =====
export const validateDeliverySearch = (data) => {
  const errors = {};

  // At least one search criteria must be provided
  if (!data.trackingId && !data.deliveryId && !data.customerEmail && !data.customerPhone) {
    errors.search = 'Please provide at least one search criteria';
  }

  // Tracking ID validation
  if (data.trackingId && typeof data.trackingId !== 'string') {
    errors.trackingId = 'Invalid tracking ID';
  }

  // Delivery ID validation
  if (data.deliveryId && typeof data.deliveryId !== 'string') {
    errors.deliveryId = 'Invalid delivery ID';
  }

  // Customer email validation
  if (data.customerEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      errors.customerEmail = 'Invalid email format';
    }
  }

  // Customer phone validation
  if (data.customerPhone && !validatePhone(data.customerPhone)) {
    errors.customerPhone = 'Invalid phone number';
  }

  // Date range validation
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (isNaN(start.getTime())) {
      errors.startDate = 'Invalid start date';
    }
    if (isNaN(end.getTime())) {
      errors.endDate = 'Invalid end date';
    }
    if (start > end) {
      errors.dateRange = 'Start date must be before end date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== EXPORT ALL =====
export default {
  validateDeliveryAddress,
  validateDeliveryContact,
  validateDeliverySchedule,
  validateDeliveryItems,
  validateDeliveryInstructions,
  validateDeliveryCreation,
  validateDeliveryTracking,
  validateDeliveryStatusUpdate,
  validateDeliveryRating,
  validateDeliverySearch
};