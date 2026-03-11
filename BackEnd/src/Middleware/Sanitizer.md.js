// ===== src/middleware/sanitizer.js =====
const xss = require('xss');
const mongoSanitize = require('express-mongo-sanitize');

// ===== XSS SANITIZATION =====
exports.xssClean = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    });
  }

  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key]);
      }
    });
  }

  next();
};

// ===== MONGO DB INJECTION PREVENTION =====
exports.preventNoSQLInjection = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`Potential NoSQL injection attempt detected on ${key}`, {
      url: req.originalUrl,
      ip: req.ip
    });
  }
});

// ===== SQL INJECTION PREVENTION (if using SQL) =====
exports.preventSQLInjection = (req, res, next) => {
  const sqlPattern = /(\b(select|insert|update|delete|drop|union|exec|create|alter|rename|truncate|backup|restore)\b)/i;

  const checkValue = (value) => {
    if (typeof value === 'string' && sqlPattern.test(value)) {
      return true;
    }
    return false;
  };

  const checkObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkObject(obj[key])) return true;
      } else if (checkValue(obj[key])) {
        return true;
      }
    }
    return false;
  };

  if (req.body && checkObject(req.body)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid input detected'
    });
  }

  if (req.query && checkObject(req.query)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid query parameters detected'
    });
  }

  next();
};

// ===== REMOVE SENSITIVE DATA =====
exports.removeSensitiveData = (req, res, next) => {
  const sensitiveFields = ['password', 'passwordConfirm', 'twoFactorSecret', 'backupCodes', 'cardNumber', 'cvv'];

  if (req.body) {
    sensitiveFields.forEach(field => {
      if (req.body[field]) {
        delete req.body[field];
      }
    });
  }

  // Also filter response
  const originalJson = res.json;
  res.json = function(data) {
    if (data.data && typeof data.data === 'object') {
      const removeSensitive = (obj) => {
        if (Array.isArray(obj)) {
          obj.forEach(item => removeSensitive(item));
        } else if (obj && typeof obj === 'object') {
          sensitiveFields.forEach(field => {
            if (obj[field]) {
              delete obj[field];
            }
          });
          Object.values(obj).forEach(value => {
            if (value && typeof value === 'object') {
              removeSensitive(value);
            }
          });
        }
      };
      removeSensitive(data.data);
    }
    return originalJson.call(this, data);
  };

  next();
};