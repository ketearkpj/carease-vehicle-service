// ===== src/Utils/format.js =====
/**
 * FORMAT UTILITIES - GOD MODE
 * Comprehensive formatting functions for all data types
 */

// ===== CURRENCY FORMATTING =====
export const formatCurrency = (amount, options = {}) => {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    useSymbol = true
  } = options;

  if (amount === null || amount === undefined) return '';

  const formatter = new Intl.NumberFormat(locale, {
    style: useSymbol ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  });

  return formatter.format(amount);
};

export const formatCompactCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    compactDisplay: 'short'
  });

  return formatter.format(amount);
};

// ===== DATE FORMATTING =====
export const formatDate = (date, options = {}) => {
  const {
    format = 'medium',
    locale = 'en-US',
    timezone
  } = options;

  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const formats = {
    short: { year: 'numeric', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  };

  const formatOptions = {
    ...formats[format] || formats.medium,
    timeZone: timezone
  };

  return new Intl.DateTimeFormat(locale, formatOptions).format(d);
};

export const formatTime = (date, options = {}) => {
  const {
    hour12 = true,
    locale = 'en-US',
    timezone
  } = options;

  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    hour12,
    timeZone: timezone
  }).format(d);
};

export const formatDateTime = (date, options = {}) => {
  const {
    dateFormat = 'medium',
    timeFormat = true,
    locale = 'en-US',
    timezone
  } = options;

  if (!date) return '';

  const formattedDate = formatDate(date, { format: dateFormat, locale, timezone });
  if (!timeFormat) return formattedDate;

  const formattedTime = formatTime(date, { locale, timezone });
  return `${formattedDate} at ${formattedTime}`;
};

export const formatRelativeTime = (date, options = {}) => {
  const { locale = 'en-US', style = 'long' } = options;

  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  } else if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  } else if (diffInDays < 30) {
    return rtf.format(-diffInDays, 'day');
  } else if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, 'month');
  } else {
    return rtf.format(-diffInYears, 'year');
  }
};

// ===== NUMBER FORMATTING =====
export const formatNumber = (number, options = {}) => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true,
    locale = 'en-US'
  } = options;

  if (number === null || number === undefined) return '';

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  });

  return formatter.format(number);
};

export const formatCompactNumber = (number, locale = 'en-US') => {
  if (number === null || number === undefined) return '';

  const formatter = new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short'
  });

  return formatter.format(number);
};

export const formatPercentage = (number, options = {}) => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    locale = 'en-US'
  } = options;

  if (number === null || number === undefined) return '';

  const formatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  });

  return formatter.format(number / 100);
};

// ===== PHONE FORMATTING =====
export const formatPhone = (phone, country = 'KE') => {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  const formats = {
    KE: (num) => {
      if (num.length === 10 && num.startsWith('0')) {
        return `${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`;
      }
      if (num.length === 12 && num.startsWith('254')) {
        return `+254 ${num.slice(3, 6)} ${num.slice(6, 9)} ${num.slice(9)}`;
      }
      return phone;
    },
    UK: (num) => {
      if (num.length === 10) {
        return `${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`;
      }
      return phone;
    }
  };

  const formatter = formats[country] || formats.KE;
  return formatter(cleaned);
};

// ===== NAME FORMATTING =====
export const formatName = (firstName, lastName, options = {}) => {
  const { format = 'full', fallback = '' } = options;

  if (!firstName && !lastName) return fallback;

  const formats = {
    full: `${firstName || ''} ${lastName || ''}`.trim(),
    initials: `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase(),
    firstLast: `${firstName || ''} ${lastName?.[0] || ''}.`.trim(),
    lastFirst: `${lastName || ''}, ${firstName || ''}`.trim()
  };

  return formats[format] || formats.full;
};

export const getInitials = (name) => {
  if (!name) return '';

  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ===== ADDRESS FORMATTING =====
export const formatAddress = (address, options = {}) => {
  const {
    format = 'single',
    separator = ', '
  } = options;

  if (!address) return '';

  const parts = [];

  if (address.line1) parts.push(address.line1);
  if (address.line2) parts.push(address.line2);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);

  if (format === 'single') {
    return parts.join(separator);
  }

  if (format === 'multi') {
    return {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      full: parts.join(separator)
    };
  }

  return parts.join(separator);
};

// ===== DURATION FORMATTING =====
export const formatDuration = (minutes, options = {}) => {
  const {
    format = 'auto',
    verbose = false
  } = options;

  if (!minutes && minutes !== 0) return '';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (format === 'auto') {
    if (hours === 0) {
      return verbose ? `${mins} minutes` : `${mins}m`;
    }
    if (mins === 0) {
      return verbose ? `${hours} hours` : `${hours}h`;
    }
    return verbose ? `${hours} hours ${mins} minutes` : `${hours}h ${mins}m`;
  }

  if (format === 'hours') {
    return (minutes / 60).toFixed(1);
  }

  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

// ===== FILE SIZE FORMATTING =====
export const formatFileSize = (bytes, options = {}) => {
  const { decimal = false, locale = 'en-US' } = options;

  if (bytes === 0) return '0 B';

  const k = decimal ? 1000 : 1024;
  const sizes = decimal 
    ? ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    : ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return `${formatter.format(bytes / Math.pow(k, i))} ${sizes[i]}`;
};

// ===== DISTANCE FORMATTING =====
export const formatDistance = (meters, options = {}) => {
  const {
    unit = 'auto',
    locale = 'en-US',
    precision = 1
  } = options;

  if (!meters && meters !== 0) return '';

  const km = meters / 1000;
  const miles = meters / 1609.344;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision
  });

  if (unit === 'auto') {
    if (meters < 1000) {
      return `${formatter.format(meters)} m`;
    }
    return `${formatter.format(km)} km`;
  }

  if (unit === 'km') {
    return `${formatter.format(km)} km`;
  }

  if (unit === 'miles') {
    return `${formatter.format(miles)} mi`;
  }

  return `${formatter.format(meters)} m`;
};

// ===== TEMPERATURE FORMATTING =====
export const formatTemperature = (celsius, options = {}) => {
  const { unit = 'C', precision = 1 } = options;

  if (celsius === null || celsius === undefined) return '';

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision
  });

  if (unit === 'C') {
    return `${formatter.format(celsius)}°C`;
  }

  if (unit === 'F') {
    const fahrenheit = (celsius * 9/5) + 32;
    return `${formatter.format(fahrenheit)}°F`;
  }

  return `${formatter.format(celsius)}°C`;
};

// ===== LIST FORMATTING =====
export const formatList = (items, options = {}) => {
  const {
    type = 'conjunction',
    locale = 'en-US'
  } = options;

  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];

  const formatter = new Intl.ListFormat(locale, {
    style: 'long',
    type
  });

  return formatter.format(items);
};

// ===== CASE CONVERSION =====
export const toTitleCase = (str) => {
  if (!str) return '';
  
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
};

export const toSentenceCase = (str) => {
  if (!str) return '';
  
  return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
};

export const toCamelCase = (str) => {
  if (!str) return '';
  
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

export const toSnakeCase = (str) => {
  if (!str) return '';
  
  return str
    .replace(/\s+/g, '_')
    .toLowerCase();
};

export const toKebabCase = (str) => {
  if (!str) return '';
  
  return str
    .replace(/\s+/g, '-')
    .toLowerCase();
};

// ===== TRUNCATION =====
export const truncate = (str, length = 50, options = {}) => {
  const { ellipsis = '...', wordBoundary = true } = options;

  if (!str || str.length <= length) return str;

  let truncated = str.slice(0, length);

  if (wordBoundary) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.slice(0, lastSpace);
    }
  }

  return truncated + ellipsis;
};

// ===== EXPORT ALL =====
export default {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCompactNumber,
  formatPercentage,
  formatPhone,
  formatName,
  getInitials,
  formatAddress,
  formatDuration,
  formatFileSize,
  formatDistance,
  formatTemperature,
  formatList,
  toTitleCase,
  toSentenceCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  truncate
};
