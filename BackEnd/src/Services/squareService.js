// ===== src/services/squareService.js =====
const { Client } = require('square');
const { logger } = require('../Middleware/Logger.md.js');

// ===== INITIALIZE SQUARE CLIENT =====
const client = new Client({
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  accessToken: process.env.SQUARE_ACCESS_TOKEN
});

// ===== PROCESS PAYMENT =====
exports.processPayment = async ({ amount, currency, sourceId, locationId, metadata }) => {
  try {
    const response = await client.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: generateIdempotencyKey(),
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)),
        currency
      },
      locationId: locationId || process.env.SQUARE_LOCATION_ID,
      referenceId: metadata.bookingId,
      note: metadata.description || 'CAR EASE Payment'
    });

    const payment = response.result.payment;

    logger.info(`Square payment created: ${payment.id}`);

    return {
      transactionId: payment.id,
      amount: Number(payment.amountMoney.amount) / 100,
      currency: payment.amountMoney.currency,
      status: payment.status,
      cardDetails: payment.cardDetails ? {
        brand: payment.cardDetails.card.brand,
        last4: payment.cardDetails.card.last4,
        expMonth: payment.cardDetails.card.expMonth,
        expYear: payment.cardDetails.card.expYear
      } : null
    };
  } catch (error) {
    logger.error('Square payment failed:', error);
    throw error;
  }
};

// ===== REFUND PAYMENT =====
exports.refundPayment = async ({ paymentId, amount }) => {
  try {
    const response = await client.refundsApi.refundPayment({
      idempotencyKey: generateIdempotencyKey(),
      paymentId,
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)),
        currency: 'USD'
      }
    });

    const refund = response.result.refund;

    logger.info(`Square refund created: ${refund.id}`);

    return {
      refundId: refund.id,
      amount: Number(refund.amountMoney.amount) / 100,
      status: refund.status
    };
  } catch (error) {
    logger.error('Square refund failed:', error);
    throw error;
  }
};

// ===== GET PAYMENT =====
exports.getPayment = async (paymentId) => {
  try {
    const response = await client.paymentsApi.getPayment(paymentId);
    const payment = response.result.payment;

    return {
      id: payment.id,
      amount: Number(payment.amountMoney.amount) / 100,
      currency: payment.amountMoney.currency,
      status: payment.status,
      createdAt: payment.createdAt
    };
  } catch (error) {
    logger.error('Square get payment failed:', error);
    throw error;
  }
};

// ===== CREATE CUSTOMER =====
exports.createCustomer = async ({ email, name, phone }) => {
  try {
    const response = await client.customersApi.createCustomer({
      idempotencyKey: generateIdempotencyKey(),
      givenName: name.split(' ')[0],
      familyName: name.split(' ').slice(1).join(' '),
      emailAddress: email,
      phoneNumber: phone
    });

    return response.result.customer;
  } catch (error) {
    logger.error('Square create customer failed:', error);
    throw error;
  }
};

// ===== HELPER FUNCTION =====
const generateIdempotencyKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};