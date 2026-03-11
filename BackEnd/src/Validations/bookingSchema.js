// ===== src/validations/booking.validation.js =====
const Joi = require('joi');

/**
 * Booking validation schemas
 * Validates all booking-related requests
 */
const bookingValidation = {
  // ===== CREATE BOOKING =====
  createBooking: Joi.object({
    vehicleId: Joi.string().hex().length(24).when('serviceType', {
      is: 'rental',
      then: Joi.required()
    }),
    serviceType: Joi.string().valid('rental', 'car_wash', 'repair', 'delivery', 'concierge', 'storage').required().messages({
      'any.only': 'Service type must be one of: rental, car_wash, repair, delivery, concierge, storage',
      'any.required': 'Service type is required'
    }),
    startDate: Joi.date().greater('now').required().messages({
      'date.greater': 'Start date must be in the future',
      'any.required': 'Start date is required'
    }),
    endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required'
    }),
    pickupTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    dropoffTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    pickupLocation: Joi.object({
      type: Joi.string().valid('showroom', 'address', 'airport', 'hotel').required(),
      name: Joi.string(),
      address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
        country: Joi.string().default('Kenya')
      }).required(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
      }).required(),
      instructions: Joi.string().max(200),
      contact: Joi.object({
        name: Joi.string(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
      })
    }).required(),
    dropoffLocation: Joi.object({
      type: Joi.string().valid('showroom', 'address', 'airport', 'hotel'),
      name: Joi.string(),
      address: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipCode: Joi.string(),
        country: Joi.string()
      }),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      }),
      instructions: Joi.string().max(200)
    }),
    extras: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().positive(),
        quantity: Joi.number().integer().min(1).default(1),
        perDay: Joi.boolean().default(false)
      })
    ),
    specialRequests: Joi.string().max(500),
    customerInfo: Joi.object({
      firstName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s\-']+$/),
      lastName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s\-']+$/),
      email: Joi.string().email(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
    }),
    driverLicense: Joi.object({
      number: Joi.string(),
      state: Joi.string(),
      expiryDate: Joi.date()
    }).when('serviceType', {
      is: 'rental',
      then: Joi.required()
    }),
    insurance: Joi.object({
      provider: Joi.string(),
      policyNumber: Joi.string(),
      expiryDate: Joi.date()
    })
  }),

  // ===== UPDATE BOOKING =====
  updateBooking: Joi.object({
    id: Joi.string().hex().length(24).required(),
    startDate: Joi.date().greater('now'),
    endDate: Joi.date().greater(Joi.ref('startDate')),
    pickupTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    dropoffTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    pickupLocation: Joi.object({
      type: Joi.string().valid('showroom', 'address', 'airport', 'hotel'),
      name: Joi.string(),
      address: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipCode: Joi.string(),
        country: Joi.string()
      }),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      }),
      instructions: Joi.string().max(200)
    }),
    dropoffLocation: Joi.object({
      type: Joi.string().valid('showroom', 'address', 'airport', 'hotel'),
      name: Joi.string(),
      address: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipCode: Joi.string(),
        country: Joi.string()
      }),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      }),
      instructions: Joi.string().max(200)
    }),
    extras: Joi.array().items(
      Joi.object({
        id: Joi.string(),
        name: Joi.string(),
        price: Joi.number().positive(),
        quantity: Joi.number().integer().min(1),
        perDay: Joi.boolean()
      })
    ),
    specialRequests: Joi.string().max(500)
  }),

  // ===== CANCEL BOOKING =====
  cancelBooking: Joi.object({
    id: Joi.string().hex().length(24).required(),
    reason: Joi.string().max(200).required()
  }),

  // ===== GET BOOKING =====
  getBooking: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),

  // ===== GET USER BOOKINGS =====
  getUserBookings: Joi.object({
    userId: Joi.string().hex().length(24).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'in_progress', 'completed', 'cancelled'),
    startDate: Joi.date(),
    endDate: Joi.date()
  }),

  // ===== CHECK AVAILABILITY =====
  checkAvailability: Joi.object({
    vehicleId: Joi.string().hex().length(24),
    serviceType: Joi.string().valid('rental', 'car_wash', 'repair'),
    startDate: Joi.date().greater('now').required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required()
  }),

  // ===== GET AVAILABLE SLOTS =====
  getAvailableSlots: Joi.object({
    date: Joi.date().greater('now').required(),
    serviceType: Joi.string().valid('car_wash', 'repair').required(),
    location: Joi.string().valid('beverly-hills', 'miami', 'manhattan')
  }),

  // ===== CALCULATE PRICE =====
  calculatePrice: Joi.object({
    vehicleId: Joi.string().hex().length(24),
    serviceType: Joi.string().valid('rental', 'car_wash', 'repair', 'delivery').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    extras: Joi.array().items(
      Joi.object({
        id: Joi.string(),
        price: Joi.number().positive(),
        quantity: Joi.number().integer().min(1),
        perDay: Joi.boolean()
      })
    ),
    discountCode: Joi.string()
  }),

  // ===== UPDATE STATUS =====
  updateStatus: Joi.object({
    id: Joi.string().hex().length(24).required(),
    status: Joi.string().valid('confirmed', 'processing', 'in_progress', 'completed', 'cancelled').required(),
    note: Joi.string().max(200)
  })
};

module.exports = bookingValidation;