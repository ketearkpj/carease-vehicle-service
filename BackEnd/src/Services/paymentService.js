// ===== src/services/paymentService.js =====
const stripeService = require('./stripeService');
const paypalService = require('./paypalService');
const mpesaService = require('./mpesaService');
const squareService = require('./squareService');
const flutterwaveService = require('./flutterwaveService');
const { logger } = require('../Middleware/Logger.md.js');

// ===== PROCESS PAYMENT =====
exports.processPayment = async ({ amount, currency, method, metadata }) => {
  try {
    let result;

    switch (method) {
      case 'card':
        result = await stripeService.processPayment({ amount, currency, ...metadata });
        break;
      case 'paypal':
        result = await paypalService.createOrder({ amount, currency, ...metadata });
        break;
      case 'mpesa':
        result = await mpesaService.stkPush({ amount, phoneNumber: metadata.phoneNumber });
        break;
      case 'square':
        result = await squareService.processPayment({ amount, currency, ...metadata });
        break;
      case 'flutterwave':
        result = await flutterwaveService.charge({ amount, currency, ...metadata });
        break;
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }

    logger.info(`Payment processed via ${method}: ${result.transactionId}`);
    return result;
  } catch (error) {
    logger.error('Payment processing failed:', error);
    throw error;
  }
};

// ===== CONFIRM PAYMENT =====
exports.confirmPayment = async ({ method, transactionId, metadata }) => {
  try {
    let result;

    switch (method) {
      case 'card':
        result = await stripeService.confirmPayment(transactionId);
        break;
      case 'paypal':
        result = await paypalService.captureOrder(transactionId);
        break;
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }

    logger.info(`Payment confirmed via ${method}: ${transactionId}`);
    return result;
  } catch (error) {
    logger.error('Payment confirmation failed:', error);
    throw error;
  }
};

// ===== PROCESS REFUND =====
exports.processRefund = async ({ method, transactionId, amount, reason }) => {
  try {
    let result;

    switch (method) {
      case 'card':
        result = await stripeService.createRefund({ paymentIntentId: transactionId, amount });
        break;
      case 'paypal':
        result = await paypalService.refundPayment({ transactionId, amount });
        break;
      default:
        throw new Error(`Refund not supported for payment method: ${method}`);
    }

    logger.info(`Refund processed via ${method}: ${result.refundId}`);
    return result;
  } catch (error) {
    logger.error('Refund processing failed:', error);
    throw error;
  }
};

// ===== GET PAYMENT STATUS =====
exports.getPaymentStatus = async ({ method, transactionId }) => {
  try {
    let result;

    switch (method) {
      case 'card':
        result = await stripeService.getPaymentIntent(transactionId);
        break;
      case 'paypal':
        result = await paypalService.getOrder(transactionId);
        break;
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }

    return result;
  } catch (error) {
    logger.error('Failed to get payment status:', error);
    throw error;
  }
};

// ===== VERIFY WEBHOOK =====
exports.verifyWebhook = async ({ gateway, payload, signature }) => {
  try {
    let result;

    switch (gateway) {
      case 'stripe':
        result = await stripeService.constructEvent(payload, signature);
        break;
      case 'paypal':
        result = await paypalService.verifyWebhook(payload, signature);
        break;
      case 'mpesa':
        result = await mpesaService.verifyWebhook(payload, signature);
        break;
      default:
        throw new Error(`Unsupported gateway: ${gateway}`);
    }

    return result;
  } catch (error) {
    logger.error('Webhook verification failed:', error);
    throw error;
  }
};