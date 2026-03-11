// ===== src/middleware/validation.js =====
const AppError = require('../Utils/AppError');

// ===== VALIDATE REQUEST AGAINST JOI SCHEMA =====
exports.validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: { label: '' }
      }
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return next(new AppError('Validation failed', 400, errors));
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

// ===== VALIDATE MULTIPLE REQUEST PARTS =====
exports.validateAll = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    Object.entries(schemas).forEach(([property, schema]) => {
      const { error } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        error.details.forEach(detail => {
          errors.push({
            field: `${property}.${detail.path.join('.')}`,
            message: detail.message
          });
        });
      }
    });

    if (errors.length > 0) {
      return next(new AppError('Validation failed', 400, errors));
    }

    next();
  };
};

// ===== CUSTOM VALIDATORS =====
exports.validators = {
  // Validate MongoDB ObjectId
  objectId: (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
      return helpers.error('any.invalid');
    }
    return value;
  },

  // Validate email
  email: (value, helpers) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  },

  // Validate phone number
  phone: (value, helpers) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return helpers.error('any.invalid');
    }
    return value;
  },

  // Validate password strength
  password: (value, helpers) => {
    if (value.length < 8) {
      return helpers.error('password.min');
    }
    if (!/[A-Z]/.test(value)) {
      return helpers.error('password.uppercase');
    }
    if (!/[a-z]/.test(value)) {
      return helpers.error('password.lowercase');
    }
    if (!/[0-9]/.test(value)) {
      return helpers.error('password.number');
    }
    if (!/[!@#$%^&*]/.test(value)) {
      return helpers.error('password.special');
    }
    return value;
  },

  // Validate date range
  dateRange: (value, helpers) => {
    const { startDate, endDate } = value;
    if (new Date(startDate) >= new Date(endDate)) {
      return helpers.error('date.range');
    }
    return value;
  },

  // Validate future date
  futureDate: (value, helpers) => {
    if (new Date(value) <= new Date()) {
      return helpers.error('date.future');
    }
    return value;
  }
};