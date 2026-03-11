// ===== src/validations/payment.validation.js =====
const Joi = require('joi');

/**
 * Payment validation schemas
 * Validates all payment-related requests
 */
const paymentValidation = {
  // ===== PROCESS PAYMENT =====
  processPayment: Joi.object({
    bookingId: Joi.string().hex().length(24).required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).default('USD'),
    method: Joi.string().valid('card', 'paypal', 'mpesa', 'square', 'flutterwave', 'cash', 'bank_transfer').required(),
    paymentMethodId: Joi.string().when('method', {
      is: 'card',
      then: Joi.required()
    }),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).when('method', {
      is: 'mpesa',
      then: Joi.required()
    }),
    cardDetails: Joi.object({
      number: Joi.string().creditCard().when('method', {
        is: 'card',
        then: Joi.required()
      }),
      expMonth: Joi.number().min(1).max(12).when('method', {
        is: 'card',
        then: Joi.required()
      }),
      expYear: Joi.number().min(new Date().getFullYear()).max(new Date().getFullYear() + 20).when('method', {
        is: 'card',
        then: Joi.required()
      }),
      cvc: Joi.string().pattern(/^\d{3,4}$/).when('method', {
        is: 'card',
        then: Joi.required()
      }),
      name: Joi.string().when('method', {
        is: 'card',
        then: Joi.required()
      })
    }),
    billingDetails: Joi.object({
      firstName: Joi.string(),
      lastName: Joi.string(),
      email: Joi.string().email(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
      address: Joi.object({
        line1: Joi.string(),
        line2: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        postalCode: Joi.string(),
        country: Joi.string()
      })
    }),
    savePaymentMethod: Joi.boolean().default(false),
    metadata: Joi.object()
  }),

  // ===== CONFIRM PAYMENT =====
  confirmPayment: Joi.object({
    paymentIntentId: Joi.string(),
    orderId: Joi.string(),
    transactionId: Joi.string()
  }).xor('paymentIntentId', 'orderId', 'transactionId'),

  // ===== GET PAYMENT =====
  getPayment: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),

  // ===== GET USER PAYMENTS =====
  getUserPayments: Joi.object({
    userId: Joi.string().hex().length(24).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'refunded'),
    startDate: Joi.date(),
    endDate: Joi.date()
  }),

  // ===== PROCESS REFUND =====
  processRefund: Joi.object({
    id: Joi.string().hex().length(24).required(),
    amount: Joi.number().positive(),
    reason: Joi.string().max(200).required()
  }),

  // ===== ADD PAYMENT METHOD =====
  addPaymentMethod: Joi.object({
    type: Joi.string().valid('card', 'paypal', 'mpesa').required(),
    paymentMethodId: Joi.string().when('type', {
      is: 'card',
      then: Joi.required()
    }),
    details: Joi.object({
      email: Joi.string().email(),
      phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
    }).when('type', {
      is: 'paypal',
      then: Joi.object({ email: Joi.string().email().required() }),
      is: 'mpesa',
      then: Joi.object({ phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required() })
    }),
    setDefault: Joi.boolean().default(false)
  }),

  // ===== DELETE PAYMENT METHOD =====
  deletePaymentMethod: Joi.object({
    methodId: Joi.string().hex().length(24).required()
  }),

  // ===== SET DEFAULT PAYMENT METHOD =====
  setDefaultMethod: Joi.object({
    methodId: Joi.string().hex().length(24).required()
  })
};

module.exports = paymentValidation;