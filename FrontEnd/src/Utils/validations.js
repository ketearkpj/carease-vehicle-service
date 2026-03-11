// ===== src/Utils/validation.js =====
/**
 * VALIDATION UTILITIES - GOD MODE
 * Comprehensive validation functions for all data types
 */

// ===== EMAIL VALIDATION =====
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmailWithMessage = (email) => {
  if (!email) return { valid: false, message: 'Email is required' };
  if (!validateEmail(email)) return { valid: false, message: 'Please enter a valid email address' };
  return { valid: true, message: '' };
};

// ===== PHONE VALIDATION =====
export const validatePhone = (phone) => {
  if (!phone) return false;
  // International phone number format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validatePhoneWithMessage = (phone) => {
  if (!phone) return { valid: false, message: 'Phone number is required' };
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (!validatePhone(cleaned)) {
    return { valid: false, message: 'Please enter a valid phone number (e.g., +1234567890)' };
  }
  return { valid: true, message: '' };
};

// ===== PASSWORD VALIDATION =====
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecial = true
  } = options;

  if (!password) return false;
  if (password.length < minLength) return false;
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumbers && !/[0-9]/.test(password)) return false;
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  
  return true;
};

export const validatePasswordWithMessage = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecial = true
  } = options;

  if (!password) return { valid: false, message: 'Password is required' };
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`at least ${minLength} characters`);
  }
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }
  if (requireNumbers && !/[0-9]/.test(password)) {
    errors.push('one number');
  }
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('one special character');
  }

  if (errors.length > 0) {
    const message = `Password must contain ${errors.join(', ')}`;
    return { valid: false, message };
  }

  return { valid: true, message: '' };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const validatePasswordMatchWithMessage = (password, confirmPassword) => {
  if (!confirmPassword) return { valid: false, message: 'Please confirm your password' };
  if (password !== confirmPassword) return { valid: false, message: 'Passwords do not match' };
  return { valid: true, message: '' };
};

// ===== NAME VALIDATION =====
export const validateName = (name, field = 'Name', minLength = 2, maxLength = 50) => {
  if (!name) return false;
  if (name.length < minLength || name.length > maxLength) return false;
  if (!/^[a-zA-Z\s\-']+$/.test(name)) return false;
  return true;
};

export const validateNameWithMessage = (name, field = 'Name', minLength = 2, maxLength = 50) => {
  if (!name) return { valid: false, message: `${field} is required` };
  if (name.length < minLength) {
    return { valid: false, message: `${field} must be at least ${minLength} characters` };
  }
  if (name.length > maxLength) {
    return { valid: false, message: `${field} cannot exceed ${maxLength} characters` };
  }
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return { valid: false, message: `${field} can only contain letters, spaces, hyphens, and apostrophes` };
  }
  return { valid: true, message: '' };
};

// ===== DATE VALIDATION =====
export const validateDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

export const validateFutureDate = (date) => {
  if (!validateDate(date)) return false;
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

export const validateDateWithMessage = (date, options = {}) => {
  const { future = false, past = false, field = 'Date' } = options;

  if (!date) return { valid: false, message: `${field} is required` };
  
  const d = new Date(date);
  if (!validateDate(d)) {
    return { valid: false, message: `Please enter a valid ${field.toLowerCase()}` };
  }

  const now = new Date();
  if (future && d <= now) {
    return { valid: false, message: `${field} must be in the future` };
  }
  if (past && d >= now) {
    return { valid: false, message: `${field} must be in the past` };
  }

  return { valid: true, message: '' };
};

// ===== TIME VALIDATION =====
export const validateTime = (time) => {
  if (!time) return false;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateTimeWithMessage = (time, field = 'Time') => {
  if (!time) return { valid: false, message: `${field} is required` };
  if (!validateTime(time)) {
    return { valid: false, message: `Please enter a valid ${field.toLowerCase()} (HH:MM)` };
  }
  return { valid: true, message: '' };
};

// ===== POSTAL CODE VALIDATION =====
export const validatePostalCode = (postalCode, country = 'Kenya') => {
  if (!postalCode) return false;
  
  const patterns = {
    Kenya: /^\d{5}$/,
    CAN: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
    AUS: /^\d{4}$/,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
    JP: /^\d{3}-\d{4}$/
  };

  const pattern = patterns[country] || patterns.Kenya;
  return pattern.test(postalCode);
};

export const validatePostalCodeWithMessage = (postalCode, country = 'Kenya') => {
  if (!postalCode) return { valid: false, message: 'Postal code is required' };
  if (!validatePostalCode(postalCode, country)) {
    return { valid: false, message: 'Please enter a valid postal code' };
  }
  return { valid: true, message: '' };
};

// ===== CREDIT CARD VALIDATION =====
export const validateCreditCard = (cardNumber) => {
  if (!cardNumber) return false;
  
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Check if it's numeric and has valid length
  if (!/^\d+$/.test(cleaned)) return false;
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export const getCardType = (cardNumber) => {
  if (!cardNumber) return null;
  
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    diners: /^3(?:0[0-5]|[68])/,
    jcb: /^(?:2131|1800|35)/
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleaned)) return type;
  }
  
  return 'unknown';
};

export const validateCreditCardWithMessage = (cardNumber) => {
  if (!cardNumber) return { valid: false, message: 'Card number is required' };
  
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: 'Card number can only contain digits' };
  }
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return { valid: false, message: 'Card number must be between 13 and 19 digits' };
  }
  
  if (!validateCreditCard(cleaned)) {
    return { valid: false, message: 'Please enter a valid card number' };
  }
  
  const cardType = getCardType(cleaned);
  return { valid: true, message: '', cardType };
};

// ===== CVV VALIDATION =====
export const validateCVV = (cvv, cardType = 'unknown') => {
  if (!cvv) return false;
  
  const cleaned = cvv.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned)) return false;
  
  // Amex uses 4-digit CVV, others use 3-digit
  if (cardType === 'amex') {
    return cleaned.length === 4;
  }
  
  return cleaned.length === 3;
};

export const validateCVVWithMessage = (cvv, cardType = 'unknown') => {
  if (!cvv) return { valid: false, message: 'CVV is required' };
  
  const cleaned = cvv.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: 'CVV can only contain digits' };
  }
  
  const expectedLength = cardType === 'amex' ? 4 : 3;
  if (cleaned.length !== expectedLength) {
    return { valid: false, message: `CVV must be ${expectedLength} digits` };
  }
  
  return { valid: true, message: '' };
};

// ===== EXPIRY DATE VALIDATION =====
export const validateExpiryDate = (expiry) => {
  if (!expiry) return false;
  
  const cleaned = expiry.replace(/\s/g, '');
  const match = cleaned.match(/^(\d{2})\/?(\d{2})$/);
  
  if (!match) return false;
  
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  
  if (month < 1 || month > 12) return false;
  
  const now = new Date();
  const expDate = new Date(year, month - 1);
  
  return expDate > now;
};

export const validateExpiryDateWithMessage = (expiry) => {
  if (!expiry) return { valid: false, message: 'Expiry date is required' };
  
  const cleaned = expiry.replace(/\s/g, '');
  const match = cleaned.match(/^(\d{2})\/?(\d{2})$/);
  
  if (!match) {
    return { valid: false, message: 'Please enter a valid expiry date (MM/YY)' };
  }
  
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  
  if (month < 1 || month > 12) {
    return { valid: false, message: 'Month must be between 01 and 12' };
  }
  
  const now = new Date();
  const expDate = new Date(year, month - 1);
  
  if (expDate <= now) {
    return { valid: false, message: 'Card has expired' };
  }
  
  return { valid: true, message: '' };
};

// ===== URL VALIDATION =====
export const validateURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateURLWithMessage = (url) => {
  if (!url) return { valid: false, message: 'URL is required' };
  if (!validateURL(url)) {
    return { valid: false, message: 'Please enter a valid URL' };
  }
  return { valid: true, message: '' };
};

// ===== NUMBER VALIDATION =====
export const validateNumber = (value, options = {}) => {
  const { min, max, integer = false } = options;
  
  const num = Number(value);
  if (isNaN(num)) return false;
  if (integer && !Number.isInteger(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  
  return true;
};

export const validateNumberWithMessage = (value, field = 'Value', options = {}) => {
  const { min, max, integer = false } = options;
  
  if (value === undefined || value === null || value === '') {
    return { valid: false, message: `${field} is required` };
  }
  
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, message: `${field} must be a valid number` };
  }
  
  if (integer && !Number.isInteger(num)) {
    return { valid: false, message: `${field} must be an integer` };
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, message: `${field} must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, message: `${field} cannot exceed ${max}` };
  }
  
  return { valid: true, message: '' };
};

// ===== FORM VALIDATION =====
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    // Required check
    if (rule.required && !value) {
      errors[field] = rule.requiredMessage || `${field} is required`;
      isValid = false;
      continue;
    }

    // Custom validator
    if (rule.validator && value) {
      const result = rule.validator(value, data);
      if (result !== true) {
        errors[field] = result;
        isValid = false;
      }
    }

    // Pattern validation
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.patternMessage || `${field} is invalid`;
      isValid = false;
    }

    // Min length
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = rule.minLengthMessage || `${field} must be at least ${rule.minLength} characters`;
      isValid = false;
    }

    // Max length
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = rule.maxLengthMessage || `${field} cannot exceed ${rule.maxLength} characters`;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// ===== EXPORT ALL =====
export default {
  validateEmail,
  validateEmailWithMessage,
  validatePhone,
  validatePhoneWithMessage,
  validatePassword,
  validatePasswordWithMessage,
  validatePasswordMatch,
  validatePasswordMatchWithMessage,
  validateName,
  validateNameWithMessage,
  validateDate,
  validateFutureDate,
  validateDateWithMessage,
  validateTime,
  validateTimeWithMessage,
  validatePostalCode,
  validatePostalCodeWithMessage,
  validateCreditCard,
  getCardType,
  validateCreditCardWithMessage,
  validateCVV,
  validateCVVWithMessage,
  validateExpiryDate,
  validateExpiryDateWithMessage,
  validateURL,
  validateURLWithMessage,
  validateNumber,
  validateNumberWithMessage,
  validateForm
};
