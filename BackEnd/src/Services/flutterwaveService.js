// ===== src/services/flutterwaveService.js =====
const axios = require('axios');
const { logger } = require('../Middleware/Logger.md.js');

const BASE_URL = process.env.FLUTTERWAVE_ENVIRONMENT === 'live'
  ? 'https://api.flutterwave.com/v3'
  : 'https://api.flutterwave.com/v3';

// ===== CHARGE CARD =====
exports.chargeCard = async ({ amount, currency, cardDetails, email, metadata }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/charges?type=card`,
      {
        card_number: cardDetails.number,
        cvv: cardDetails.cvv,
        expiry_month: cardDetails.expiryMonth,
        expiry_year: cardDetails.expiryYear,
        currency,
        amount,
        email,
        tx_ref: generateTxRef(),
        redirect_url: `${process.env.CLIENT_URL}/payment/success`,
        meta: metadata
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    logger.info(`Flutterwave card charge initiated: ${response.data.data.id}`);

    return {
      transactionId: response.data.data.id,
      flwRef: response.data.data.flw_ref,
      status: response.data.data.status,
      requiresAuth: response.data.data.auth_mode !== 'noauth',
      authUrl: response.data.data.redirect_url
    };
  } catch (error) {
    logger.error('Flutterwave card charge failed:', error);
    throw error;
  }
};

// ===== CHARGE USING PAYMENT METHOD =====
exports.charge = async ({ amount, currency, email, phoneNumber, paymentMethod }) => {
  try {
    let payload = {
      tx_ref: generateTxRef(),
      amount,
      currency,
      email,
      phone_number: phoneNumber,
      redirect_url: `${process.env.CLIENT_URL}/payment/success`
    };

    switch (paymentMethod) {
      case 'card':
        payload.payment_type = 'card';
        break;
      case 'mpesa':
        payload.payment_type = 'mpesa';
        break;
      case 'bank_transfer':
        payload.payment_type = 'bank_transfer';
        break;
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    const response = await axios.post(
      `${BASE_URL}/payments`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    logger.info(`Flutterwave charge initiated: ${response.data.data.id}`);

    return {
      transactionId: response.data.data.id,
      status: response.data.data.status,
      authUrl: response.data.data.link
    };
  } catch (error) {
    logger.error('Flutterwave charge failed:', error);
    throw error;
  }
};

// ===== VERIFY TRANSACTION =====
exports.verifyTransaction = async (transactionId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    const data = response.data.data;

    return {
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      chargedAmount: data.charged_amount,
      processorResponse: data.processor_response,
      paymentMethod: data.payment_type
    };
  } catch (error) {
    logger.error('Flutterwave verification failed:', error);
    throw error;
  }
};

// ===== CREATE REFUND =====
exports.createRefund = async ({ transactionId, amount }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/transactions/${transactionId}/refund`,
      {
        amount
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    logger.info(`Flutterwave refund created: ${response.data.data.id}`);

    return {
      refundId: response.data.data.id,
      amount: response.data.data.amount,
      status: response.data.data.status
    };
  } catch (error) {
    logger.error('Flutterwave refund failed:', error);
    throw error;
  }
};

// ===== HELPER FUNCTION =====
const generateTxRef = () => {
  return `CE-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};