// ===== src/utils/helpers.js =====
const crypto = require('crypto');

/**
 * Generate a random token
 */
exports.generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a random numeric code (for OTP, verification, etc.)
 */
exports.generateCode = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
};

/**
 * Generate unique booking number
 */
exports.generateBookingNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BK${year}${month}${day}-${random}`;
};

/**
 * Generate unique payment number
 */
exports.generatePaymentNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PAY${year}${month}${day}-${random}`;
};

/**
 * Generate unique delivery number
 */
exports.generateDeliveryNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DEL${year}${month}${day}-${random}`;
};

/**
 * Generate unique invoice number
 */
exports.generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

/**
 * Format date to ISO string without time
 */
exports.formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Calculate days between two dates
 */
exports.daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

/**
 * Calculate age from birth date
 */
exports.calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Mask email address (e.g., j***@gmail.com)
 */
exports.maskEmail = (email) => {
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
};

/**
 * Mask phone number (e.g., +1 *** *** 1234)
 */
exports.maskPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const last4 = cleaned.slice(-4);
  return `*** *** ${last4}`;
};

/**
 * Format currency
 */
exports.formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Parse comma-separated string to array
 */
exports.parseCSV = (str) => {
  if (!str) return [];
  return str.split(',').map(item => item.trim());
};

/**
 * Deep clone object
 */
exports.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
exports.isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Generate random password
 */
exports.generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

/**
 * Extract pagination parameters from request
 */
exports.getPaginationParams = (req) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const sort = req.query.sort || '-createdAt';

  return { page, limit, sort };
};

/**
 * Calculate pagination metadata
 */
exports.getPaginationMeta = (total, page, limit) => {
  const pages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1
  };
};

/**
 * Sleep for specified milliseconds
 */
exports.sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 */
exports.retry = async (fn, maxAttempts = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await exports.sleep(delay);
    }
  }

  throw lastError;
};

/**
 * Sanitize object by removing specified fields
 */
exports.sanitize = (obj, fieldsToRemove = ['password', '__v', 'twoFactorSecret', 'backupCodes']) => {
  const sanitized = { ...obj };

  fieldsToRemove.forEach(field => {
    if (sanitized[field]) delete sanitized[field];
  });

  return sanitized;
};

/**
 * Group array by key
 */
exports.groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) result[groupKey] = [];
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Chunk array into smaller arrays
 */
exports.chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Merge objects recursively
 */
exports.mergeDeep = (target, source) => {
  const output = { ...target };

  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      output[key] = exports.mergeDeep(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }

  return output;
};