// ===== src/Utils/helpers.js =====
/**
 * HELPER UTILITIES - GOD MODE
 * General utility functions for common operations
 */

// ===== RANDOM GENERATION =====
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateNumericId = (length = 6) => {
  return Math.random().toString().slice(2, 2 + length);
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const generateOTP = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
};

export const generatePassword = (options = {}) => {
  const {
    length = 12,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true
  } = options;

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (includeUppercase) chars += uppercase;
  if (includeLowercase) chars += lowercase;
  if (includeNumbers) chars += numbers;
  if (includeSymbols) chars += symbols;

  if (chars === '') chars = lowercase + numbers;

  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
};

// ===== ARRAY OPERATIONS =====
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) result[groupKey] = [];
    result[groupKey].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (order === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    }
    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
  });
};

export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const flatten = (array) => {
  return array.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
};

export const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const paginate = (array, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: array.slice(start, end),
    total: array.length,
    page,
    limit,
    totalPages: Math.ceil(array.length / limit)
  };
};

// ===== OBJECT OPERATIONS =====
export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) result[key] = obj[key];
    return result;
  }, {});
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const merge = (target, source) => {
  return { ...target, ...source };
};

export const deepMerge = (target, source) => {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
};

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// ===== STRING OPERATIONS =====
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

export const maskString = (str, options = {}) => {
  const {
    visibleStart = 0,
    visibleEnd = 0,
    maskChar = '*',
    maskLength = 'auto'
  } = options;

  if (!str) return '';

  if (maskLength === 'auto') {
    const maskedCount = str.length - visibleStart - visibleEnd;
    const masked = maskChar.repeat(Math.max(0, maskedCount));
    return str.slice(0, visibleStart) + masked + str.slice(-visibleEnd);
  }

  return str.slice(0, visibleStart) + maskChar.repeat(maskLength) + str.slice(-visibleEnd);
};

export const maskEmail = (email) => {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  const maskedLocal = maskString(localPart, { visibleStart: 1, visibleEnd: 1 });
  return `${maskedLocal}@${domain}`;
};

export const maskPhone = (phone) => {
  if (!phone) return '';
  return maskString(phone, { visibleEnd: 4, maskChar: '*' });
};

// ===== DATE OPERATIONS =====
export const getDaysBetween = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

export const getAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// ===== COLOR OPERATIONS =====
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const getContrastColor = (hexColor) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#ffffff';
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// ===== DEBOUNCE & THROTTLE =====
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ===== STORAGE OPERATIONS =====
export const setStorage = (key, value, storage = localStorage) => {
  try {
    const serialized = JSON.stringify(value);
    storage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

export const getStorage = (key, defaultValue = null, storage = localStorage) => {
  try {
    const serialized = storage.getItem(key);
    if (serialized === null) return defaultValue;
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Storage error:', error);
    return defaultValue;
  }
};

export const removeStorage = (key, storage = localStorage) => {
  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

export const clearStorage = (storage = localStorage) => {
  try {
    storage.clear();
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

// ===== COOKIE OPERATIONS =====
export const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

export const getCookie = (name) => {
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// ===== URL OPERATIONS =====
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
};

export const updateQueryParams = (params) => {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  });
  window.history.pushState({}, '', url.toString());
};

// ===== EXPORT ALL =====
export default {
  generateId,
  generateNumericId,
  generateUUID,
  generateOTP,
  generatePassword,
  groupBy,
  sortBy,
  uniqueBy,
  chunk,
  flatten,
  shuffle,
  paginate,
  omit,
  pick,
  deepClone,
  merge,
  deepMerge,
  isEmpty,
  capitalize,
  capitalizeWords,
  slugify,
  maskString,
  maskEmail,
  maskPhone,
  getDaysBetween,
  addDays,
  isWeekend,
  getAge,
  hexToRgb,
  rgbToHex,
  getContrastColor,
  debounce,
  throttle,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  setCookie,
  getCookie,
  deleteCookie,
  getQueryParams,
  updateQueryParams
};