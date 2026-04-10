// ===== src/Services/payment.service.js =====
/**
 * PAYMENT SERVICE - GOD MODE
 * Real payment processing with multiple gateways
 * Supports: Stripe, PayPal, M-PESA, Square, Flutterwave
 */

import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { getEnv } from '../Config/env';
import { buildApiUrl } from '../Config/API';

// Payment gateway configurations
const PAYMENT_CONFIG = {
  // Stripe
  stripe: {
    publishableKey: getEnv('REACT_APP_STRIPE_PUBLISHABLE_KEY'),
    secretKey: getEnv('REACT_APP_STRIPE_SECRET_KEY'),
    webhookSecret: getEnv('REACT_APP_STRIPE_WEBHOOK_SECRET')
  },
  
  // PayPal
  paypal: {
    clientId: getEnv('REACT_APP_PAYPAL_CLIENT_ID'),
    secret: getEnv('REACT_APP_PAYPAL_SECRET'),
    environment: getEnv('REACT_APP_PAYPAL_ENVIRONMENT') || 'sandbox' // 'live' or 'sandbox'
  },
  
  // M-PESA (Africa's leading mobile money)
  mpesa: {
    consumerKey: getEnv('REACT_APP_MPESA_CONSUMER_KEY'),
    consumerSecret: getEnv('REACT_APP_MPESA_CONSUMER_SECRET'),
    passkey: getEnv('REACT_APP_MPESA_PASSKEY'),
    shortCode: getEnv('REACT_APP_MPESA_SHORT_CODE'),
    environment: getEnv('REACT_APP_MPESA_ENVIRONMENT') || 'sandbox'
  },
  
  // Square
  square: {
    applicationId: getEnv('REACT_APP_SQUARE_APPLICATION_ID'),
    locationId: getEnv('REACT_APP_SQUARE_LOCATION_ID'),
    accessToken: getEnv('REACT_APP_SQUARE_ACCESS_TOKEN')
  },
  
  // Flutterwave (African payments)
  flutterwave: {
    publicKey: getEnv('REACT_APP_FLUTTERWAVE_PUBLIC_KEY'),
    secretKey: getEnv('REACT_APP_FLUTTERWAVE_SECRET_KEY'),
    encryptionKey: getEnv('REACT_APP_FLUTTERWAVE_ENCRYPTION_KEY')
  }
};

const API_BASE_URL = buildApiUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('carease_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeKenyanPhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('254') && digits.length >= 12) return digits.slice(0, 12);
  if (digits.startsWith('0') && digits.length >= 10) return `254${digits.slice(1, 10)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
};

const extractApiErrorMessage = (error, fallbackMessage) => {
  const baseMessage = error?.response?.data?.message || error?.message || fallbackMessage;
  const fieldErrors = error?.response?.data?.errors;

  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    const detail = fieldErrors
      .map((item) => item?.message || item?.field)
      .filter(Boolean)
      .join('; ');
    if (detail) {
      return `${baseMessage}: ${detail}`;
    }
  }

  return baseMessage;
};

/**
 * Get available payment methods
 * @returns {Promise<Array>} - Supported payment methods
 */
export const getPaymentMethods = async () => {
  return [
    // Only expose methods that have a working frontend flow in this build.
    { id: 'mpesa', name: 'M-PESA', icon: '📱', enabled: true },
    { id: 'cash', name: 'Cash on Delivery', icon: '💵', enabled: true }
  ];
};

// Initialize Stripe
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(PAYMENT_CONFIG.stripe.publishableKey);
  }
  return stripePromise;
};

/**
 * Process payment with selected gateway
 * @param {Object} paymentData - Payment details
 * @param {string} gateway - Payment gateway ('stripe' | 'paypal' | 'mpesa' | 'square' | 'flutterwave')
 * @returns {Promise} - Payment result
 */
export const processPayment = async (paymentData, gateway = 'stripe') => {
  // Validate payment data
  validatePaymentData(paymentData);

  switch (gateway) {
    case 'stripe':
    case 'card':
      return await processStripePayment(paymentData);
    case 'paypal':
      return await processPayPalPayment(paymentData);
    case 'mpesa':
      return await processMpesaPayment(paymentData);
    case 'square':
      return await processSquarePayment(paymentData);
    case 'flutterwave':
      return await processFlutterwavePayment(paymentData);
    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`);
  }
};

/**
 * Validate payment data
 * @param {Object} data - Payment data to validate
 */
const validatePaymentData = (data) => {
  const { amount, currency, customerEmail } = data;

  if (!amount || amount <= 0) {
    throw new Error('Invalid payment amount');
  }

  if (!currency) {
    throw new Error('Currency is required');
  }

  if (!customerEmail) {
    throw new Error('Customer email is required');
  }

};

/**
 * Process Stripe payment
 * @param {Object} paymentData - Payment details
 * @returns {Promise} - Stripe payment result
 */
const processStripePayment = async (paymentData) => {
  try {
    const { amount, currency, customerEmail, bookingId, paymentMethodId } = paymentData;

    const response = await axios.post(`${API_BASE_URL}/payments/process`, {
      bookingId,
      amount,
      currency,
      method: 'card',
      paymentMethodId,
      billingDetails: {
        email: customerEmail
      }
    }, {
      headers: getAuthHeaders()
    });

    const payload = response.data?.data || {};
    const payment = payload.payment || {};
    return {
      success: payment.status === 'completed',
      transactionId: payment.transactionId || payment.id,
      amount,
      currency,
      status: payment.status || 'processing',
      clientSecret: payload.clientSecret,
      requiresAction: payment.status !== 'completed'
    };
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Stripe payment failed';
    throw new Error(message);
  }
};

/**
 * Process PayPal payment
 * @param {Object} paymentData - Payment details
 * @returns {Promise} - PayPal payment result
 */
const processPayPalPayment = async (paymentData) => {
  try {
    const { amount, currency, customerEmail, bookingId } = paymentData;

    const response = await axios.post(`${API_BASE_URL}/payments/process`, {
      bookingId,
      amount,
      currency,
      method: 'paypal',
      billingDetails: {
        email: customerEmail
      }
    }, {
      headers: getAuthHeaders()
    });

    const payload = response.data?.data || {};
    const payment = payload.payment || {};
    const approvalUrl = payload.approvalUrl;

    if (approvalUrl) {
      window.location.href = approvalUrl;
      return {
        success: false,
        transactionId: payment.transactionId || payment.id,
        status: payment.status || 'processing',
        requiresRedirect: true,
        redirectUrl: approvalUrl
      };
    }

    return {
      success: payment.status === 'completed',
      transactionId: payment.transactionId || payment.id,
      amount,
      currency,
      status: payment.status || 'processing'
    };
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'PayPal payment failed';
    throw new Error(message);
  }
};

/**
 * Capture PayPal payment after approval
 * @param {string} orderId - PayPal order ID
 * @returns {Promise} - Capture result
 */
export const capturePayPalPayment = async (orderId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payments/confirm`, {
      orderId
    }, {
      headers: getAuthHeaders()
    });
    const payload = response.data?.data || {};
    const payment = payload.payment || {};
    const result = payload.result || {};

    return {
      success: true,
      transactionId: result.transactionId || payment.transactionId || payment.id || orderId,
      amount: result.amount || payment.amount,
      status: payment.status || result.status || 'completed'
    };
  } catch (error) {
    console.error('PayPal capture error:', error);
    throw new Error(error.response?.data?.message || error.message || 'PayPal capture failed');
  }
};

/**
 * Process M-PESA payment (Mobile money - Africa)
 * @param {Object} paymentData - Payment details
 * @returns {Promise} - M-PESA payment result
 */
const processMpesaPayment = async (paymentData) => {
  try {
    const { amount, customerEmail, bookingId } = paymentData;
    const phoneNumber = normalizeKenyanPhone(paymentData.phoneNumber);

    // Validate phone number (Kenyan format)
    const phoneRegex = /^254[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('Invalid phone number format. Use 254XXXXXXXXX');
    }

    const response = await axios.post(`${API_BASE_URL}/payments/process`, {
      bookingId,
      amount: Math.round(amount),
      currency: 'KES',
      method: 'mpesa',
      phoneNumber,
      billingDetails: {
        email: customerEmail
      }
    }, {
      headers: getAuthHeaders()
    });

    const payload = response.data?.data || {};
    const payment = payload.payment || {};
    const checkoutRequestId = payment.transactionId;

    if (!checkoutRequestId) {
      throw new Error('M-PESA request was not accepted. Missing checkout request id.');
    }

    return {
      success: true,
      transactionId: checkoutRequestId,
      amount,
      currency: 'KES',
      status: 'processing',
      message: 'M-PESA prompt request sent successfully'
    };
  } catch (error) {
    const message = extractApiErrorMessage(error, 'M-PESA payment failed');
    throw new Error(message);
  }
};

/**
 * Poll M-PESA payment status
 * @param {string} checkoutRequestID - M-PESA checkout request ID
 * @returns {Promise} - Payment status
 */
const pollMpesaPaymentStatus = async (checkoutRequestID) => {
  if (!checkoutRequestID) {
    throw new Error('Missing M-PESA checkout request id');
  }
  const maxAttempts = 30;
  const interval = 2000; // 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/mpesa-status/${checkoutRequestID}`, {
        headers: getAuthHeaders()
      });
      const data = response.data?.data || {};
      const { resultCode, transactionId, paymentStatus } = data;

      if (resultCode === '0' || paymentStatus === 'completed') {
        return {
          status: 'completed',
          transactionId,
          message: 'Payment successful'
        };
      }

      if (resultCode === '4999' || paymentStatus === 'processing') {
        await new Promise(resolve => setTimeout(resolve, interval));
        continue;
      }

      if (resultCode !== '1037') { // 1037 = Pending
        throw new Error(`Payment failed: ${response.data.resultDesc}`);
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      const status = error?.response?.status;
      if (status === 429) {
        // Sandbox often rate-limits status polling; keep processing and continue.
        await new Promise(resolve => setTimeout(resolve, interval));
        continue;
      }
      if (attempt === maxAttempts - 1) throw error;
    }
  }

  return {
    status: 'processing',
    transactionId: checkoutRequestID,
    message: 'M-PESA request sent and still processing'
  };
};

/**
 * Process Square payment
 * @param {Object} paymentData - Payment details
 * @returns {Promise} - Square payment result
 */
const processSquarePayment = async (paymentData) => {
  try {
    const { amount, currency, customerEmail, bookingId, paymentMethodId } = paymentData;
    const response = await axios.post(`${API_BASE_URL}/payments/process`, {
      bookingId,
      amount,
      currency,
      method: 'square',
      paymentMethodId,
      billingDetails: {
        email: customerEmail
      }
    }, {
      headers: getAuthHeaders()
    });

    const payload = response.data?.data || {};
    const payment = payload.payment || {};

    return {
      success: payment.status === 'completed',
      transactionId: payment.transactionId || payment.id,
      amount,
      currency,
      status: payment.status || 'processing'
    };
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Square payment failed';
    throw new Error(message);
  }
};

/**
 * Process Flutterwave payment
 * @param {Object} paymentData - Payment details
 * @returns {Promise} - Flutterwave payment result
 */
const processFlutterwavePayment = async (paymentData) => {
  try {
    const { amount, currency, customerEmail, customerName, bookingId, paymentMethod } = paymentData;
    const response = await axios.post(`${API_BASE_URL}/payments/process`, {
      bookingId,
      amount,
      currency,
      method: 'flutterwave',
      paymentMethod,
      billingDetails: {
        email: customerEmail,
        name: customerName
      }
    }, {
      headers: getAuthHeaders()
    });

    const payload = response.data?.data || {};
    const payment = payload.payment || {};

    return {
      success: payment.status === 'completed',
      transactionId: payment.transactionId || payment.id,
      amount,
      currency,
      status: payment.status || 'processing'
    };
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Flutterwave payment failed';
    throw new Error(message);
  }
};

/**
 * Verify Flutterwave payment
 * @param {string} transactionId - Flutterwave transaction ID
 * @returns {Promise} - Verification result
 */
export const verifyFlutterwavePayment = async (transactionId) => {
  try {
    const payment = await getPaymentStatus(transactionId);
    return {
      success: payment?.status === 'completed',
      transactionId: payment?.transactionId || payment?.id || transactionId,
      amount: payment?.amount,
      currency: payment?.currency,
      status: payment?.status
    };
  } catch (error) {
    console.error('Flutterwave verification error:', error);
    throw error;
  }
};

/**
 * Process refund
 * @param {Object} refundData - Refund details
 * @returns {Promise} - Refund result
 */
export const processRefund = async (refundData) => {
  try {
    const { paymentId, transactionId, amount, reason } = refundData;
    const targetId = paymentId || transactionId;
    if (!targetId) {
      throw new Error('Payment id is required to process a refund');
    }

    const response = await axios.post(`${API_BASE_URL}/payments/${targetId}/refund`, {
      amount,
      reason
    }, {
      headers: getAuthHeaders()
    });
    const payload = response.data?.data || {};
    const payment = payload.payment || {};
    const latestRefund = Array.isArray(payment.refunds) ? payment.refunds[payment.refunds.length - 1] : null;

    return {
      success: true,
      refundId: latestRefund?.transactionId || latestRefund?.id || payment.id,
      status: payment.status || latestRefund?.status || 'processing'
    };
  } catch (error) {
    console.error('Refund error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Refund failed');
  }
};

/**
 * Record successful payment
 * @param {Object} paymentRecord - Payment record details
 */
const recordPayment = async (paymentRecord) => {
  return paymentRecord;
};

/**
 * Record failed payment
 * @param {Object} failedRecord - Failed payment details
 */
const recordFailedPayment = async (failedRecord) => {
  try {
    await axios.post('/api/payments/failed', failedRecord);
  } catch (error) {
    console.error('Failed to record payment error:', error);
  }
};

/**
 * Record refund
 * @param {Object} refundRecord - Refund details
 */
const recordRefund = async (refundRecord) => {
  return refundRecord;
};

/**
 * Get payment status
 * @param {string} transactionId - Transaction ID
 * @returns {Promise} - Payment status
 */
export const getPaymentStatus = async (transactionId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payments/${transactionId}`, {
      headers: getAuthHeaders()
    });
    return response.data?.data?.payment || response.data;
  } catch (error) {
    console.error('Failed to get payment status:', error);
    throw error;
  }
};

/**
 * Generate payment receipt
 * @param {string} transactionId - Transaction ID
 * @returns {Promise} - Receipt data
 */
export const generateReceipt = async (transactionId) => {
  try {
    const response = await axios.get(`/api/payments/receipt/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to generate receipt:', error);
    throw error;
  }
};

/**
 * Validate payment webhook
 * @param {Object} webhookData - Webhook data
 * @param {string} signature - Webhook signature
 * @param {string} gateway - Payment gateway
 * @returns {Promise} - Validation result
 */
export const validateWebhook = async (webhookData, signature, gateway) => {
  try {
    const response = await axios.post('/api/payments/webhook/validate', {
      data: webhookData,
      signature,
      gateway
    });
    return response.data.valid;
  } catch (error) {
    console.error('Webhook validation failed:', error);
    return false;
  }
};

// Export all payment functions
export default {
  processPayment,
  getPaymentMethods,
  capturePayPalPayment,
  verifyFlutterwavePayment,
  processRefund,
  getPaymentStatus,
  generateReceipt,
  validateWebhook
};
