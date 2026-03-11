// ===== src/validations/delivery.validation.js =====
const Joi = require('joi');

/**
 * Delivery validation schemas
 * Validates all delivery-related requests
 */
const deliveryValidation = {
  // ===== CREATE DELIVERY =====
  createDelivery: Joi.object({
    bookingId: Joi.string().hex().length(24).required(),
    type: Joi.string().valid('pickup', 'delivery', 'exchange', 'concierge').required(),
    priority: Joi.string().valid('normal', 'express', 'urgent').default('normal'),
    pickup: Joi.object({
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
        name: Joi.string().required(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
        email: Joi.string().email()
      }).required()
    }).required(),
    dropoff: Joi.object({
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
        name: Joi.string().required(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
        email: Joi.string().email()
      }).required()
    }).required(),
    schedule: Joi.object({
      pickupDate: Joi.date().greater('now').required(),
      pickupTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      dropoffDate: Joi.date().greater(Joi.ref('pickupDate')).required(),
      dropoffTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    }).required(),
    items: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        description: Joi.string(),
        value: Joi.number().positive()
      })
    ),
    specialInstructions: Joi.string().max(500)
  }),

  // ===== GET DELIVERY =====
  getDelivery: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),

  // ===== GET DELIVERIES BY DRIVER =====
  getByDriver: Joi.object({
    driverId: Joi.string().hex().length(24).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    status: Joi.string().valid('assigned', 'en_route_pickup', 'arrived_pickup', 'picked_up', 'en_route_dropoff', 'arrived_dropoff', 'delivered', 'cancelled')
  }),

  // ===== UPDATE STATUS =====
  updateStatus: Joi.object({
    id: Joi.string().hex().length(24).required(),
    status: Joi.string().valid(
      'assigned', 'en_route_pickup', 'arrived_pickup', 'picked_up',
      'en_route_dropoff', 'arrived_dropoff', 'delivered'
    ).required(),
    location: Joi.object({
      lat: Joi.number().min(-90).max(90),
      lng: Joi.number().min(-180).max(180)
    }),
    note: Joi.string().max(200)
  }),

  // ===== UPDATE LOCATION =====
  updateLocation: Joi.object({
    id: Joi.string().hex().length(24).required(),
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    accuracy: Joi.number().min(0)
  }),

  // ===== ASSIGN DRIVER =====
  assignDriver: Joi.object({
    id: Joi.string().hex().length(24).required(),
    driverId: Joi.string().hex().length(24).required()
  }),

  // ===== CANCEL DELIVERY =====
  cancelDelivery: Joi.object({
    id: Joi.string().hex().length(24).required(),
    reason: Joi.string().max(200).required()
  }),

  // ===== RATE DELIVERY =====
  rateDelivery: Joi.object({
    id: Joi.string().hex().length(24).required(),
    score: Joi.number().min(1).max(5).required(),
    feedback: Joi.string().max(500),
    categories: Joi.object({
      timeliness: Joi.number().min(1).max(5),
      professionalism: Joi.number().min(1).max(5),
      vehicleCondition: Joi.number().min(1).max(5),
      communication: Joi.number().min(1).max(5)
    })
  })
};

module.exports = deliveryValidation;