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

/**
 * Get available payment methods
 * @returns {Promise<Array>} - Supported payment methods
 */
export const getPaymentMethods = async () => {
  return [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', enabled: true },
    { id: 'paypal', name: 'PayPal', icon: '📧', enabled: true },
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
  const { amount, currency, customerEmail, bookingId } = data;

  if (!amount || amount <= 0) {
    throw new Error('Invalid payment amount');
  }

  if (!currency) {
    throw new Error('Currency is required');
  }

  if (!customerEmail) {
    throw new Error('Customer email is required');
  }

  if (!bookingId) {
    throw new Error('Booking ID is required');
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

    // Create payment intent on backend
    const response = await axios.post('/api/payments/create-stripe-intent', {
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customerEmail,
      bookingId,
      metadata: {
        booking_id: bookingId,
        customer_email: customerEmail
      }
    });

    const { clientSecret, paymentIntentId } = response.data;

    // Confirm payment (if payment method provided)
    if (paymentMethodId) {
      const stripe = await getStripe();
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });

      if (error) {
        throw new Error(error.message);
      }

      // Record successful payment
      await recordPayment({
        gateway: 'stripe',
        transactionId: paymentIntent.id,
        amount,
        currency,
        customerEmail,
        bookingId,
        status: 'completed'
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        amount,
        currency,
        status: 'completed'
      };
    }

    return {
      success: true,
      clientSecret,
      paymentIntentId,
      requiresAction: true
    };
  } catch (error) {
    console.error('Stripe payment error:', error);
    await recordFailedPayment({
      gateway: 'stripe',
      error: error.message,
      data: paymentData
    });
    throw new Error(`Stripe payment failed: ${error.message}`);
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

    // Create PayPal order
    const response = await axios.post('/api/payments/create-paypal-order', {
      amount,
      currency,
      customerEmail,
      bookingId,
      returnUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/payment/cancel`
    });

    const { orderId, approvalUrl } = response.data;

    // Redirect to PayPal for approval
    if (approvalUrl) {
      window.location.href = approvalUrl;
      return {
        success: true,
        orderId,
        requiresRedirect: true,
        redirectUrl: approvalUrl
      };
    }

    return {
      success: true,
      orderId
    };
  } catch (error) {
    console.error('PayPal payment error:', error);
    await recordFailedPayment({
      gateway: 'paypal',
      error: error.message,
      data: paymentData
    });
    throw new Error(`PayPal payment failed: ${error.message}`);
  }
};

/**
 * Capture PayPal payment after approval
 * @param {string} orderId - PayPal order ID
 * @returns {Promise} - Capture result
 */
export const capturePayPalPayment = async (orderId) => {
  try {
    const response = await axios.post('/api/payments/capture-paypal-order', {
      orderId
    });

    const { captureDetails } = response.data;

    await recordPayment({
      gateway: 'paypal',
      transactionId: captureDetails.id,
      amount: captureDetails.amount.value,
      currency: captureDetails.amount.currency_code,
      customerEmail: captureDetails.payer.email_address,
      bookingId: captureDetails.purchase_units[0].reference_id,
      status: 'completed'
    });

    return {
      success: true,
      transactionId: captureDetails.id,
      amount: captureDetails.amount.value,
      status: 'completed'
    };
  } catch (error) {
    console.error('PayPal capture error:', error);
    throw error;
  }
};

/**
 * Process M-PESA payment (Mobile money - Africa)
 * @param {Object} paymentData - Payment details
 * @returns {Promise} - M-PESA payment result
 */
const processMpesaPayment = async (paymentData) => {
  try {
    const { amount, phoneNumber, customerEmail, bookingId } = paymentData;

    // Validate phone number (Kenyan format)
    const phoneRegex = /^254[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('Invalid phone number format. Use 254XXXXXXXXX');
    }

    // Initiate STK Push (Lipa Na M-PESA Online)
    const response = await axios.post('/api/payments/mpesa-stk-push', {
      amount: Math.round(amount),
      phoneNumber,
      accountReference: bookingId,
      transactionDesc: `CAR EASE Booking ${bookingId}`
    });

    const { merchantRequestId, checkoutRequestID, responseDescription } = response.data;

    // Poll for payment confirmation
    const paymentResult = await pollMpesaPaymentStatus(checkoutRequestID);

    if (paymentResult.success) {
      await recordPayment({
        gateway: 'mpesa',
        transactionId: paymentResult.transactionId,
        amount,
        currency: 'KES',
        customerEmail,
        bookingId,
        phoneNumber,
        status: 'completed'
      });
    }

    return paymentResult;
  } catch (error) {
    console.error('M-PESA payment error:', error);
    await recordFailedPayment({
      gateway: 'mpesa',
      error: error.message,
      data: paymentData
    });
    throw new Error(`M-PESA payment failed: ${error.message}`);
  }
};

/**
 * Poll M-PESA payment status
 * @param {string} checkoutRequestID - M-PESA checkout request ID
 * @returns {Promise} - Payment status
 */
const pollMpesaPaymentStatus = async (checkoutRequestID) => {
  const maxAttempts = 30;
  const interval = 2000; // 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.get(`/api/payments/mpesa-status/${checkoutRequestID}`);
      const { statusCode, resultCode, transactionId } = response.data;

      if (resultCode === '0') {
        return {
          success: true,
          transactionId,
          message: 'Payment successful'
        };
      }

      if (resultCode !== '1037') { // 1037 = Pending
        throw new Error(`Payment failed: ${response.data.resultDesc}`);
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;
    }
  }

  throw new Error('Payment timeout');
};

/**
 * Process Square payment
 * @param {Object} paymentData - Payment details
 * @returns {Promise} - Square payment result
 */
const processSquarePayment = async (paymentData) => {
  try {
    const { amount, currency, customerEmail, bookingId, nonce } = paymentData;

    const response = await axios.post('/api/payments/square-payment', {
      amount: Math.round(amount * 100), // Square uses cents
      currency,
      customerEmail,
      bookingId,
      sourceId: nonce,
      locationId: PAYMENT_CONFIG.square.locationId
    });

    const { payment } = response.data;

    await recordPayment({
      gateway: 'square',
      transactionId: payment.id,
      amount: payment.amount_money.amount / 100,
      currency: payment.amount_money.currency,
      customerEmail,
      bookingId,
      status: 'completed'
    });

    return {
      success: true,
      transactionId: payment.id,
      amount: payment.amount_money.amount / 100,
      status: 'completed'
    };
  } catch (error) {
    console.error('Square payment error:', error);
    await recordFailedPayment({
      gateway: 'square',
      error: error.message,
      data: paymentData
    });
    throw new Error(`Square payment failed: ${error.message}`);
  }
};

/**
 * Process Flutterwave payment
 * @param {Object} paymentData - Payment details
 * @returns {Promise} - Flutterwave payment result
 */
const processFlutterwavePayment = async (paymentData) => {
  try {
    const { amount, currency, customerEmail, customerName, bookingId, cardDetails } = paymentData;

    const response = await axios.post('/api/payments/flutterwave-charge', {
      amount,
      currency,
      customerEmail,
      customerName,
      bookingId,
      card: cardDetails,
      redirectUrl: `${window.location.origin}/payment/success`
    });

    const { data } = response.data;

    if (data.auth_url) {
      // 3D Secure redirect
      window.location.href = data.auth_url;
      return {
        success: true,
        requiresRedirect: true,
        redirectUrl: data.auth_url,
        transactionId: data.id
      };
    }

    await recordPayment({
      gateway: 'flutterwave',
      transactionId: data.id,
      amount,
      currency,
      customerEmail,
      bookingId,
      status: 'completed'
    });

    return {
      success: true,
      transactionId: data.id,
      amount,
      status: 'completed'
    };
  } catch (error) {
    console.error('Flutterwave payment error:', error);
    await recordFailedPayment({
      gateway: 'flutterwave',
      error: error.message,
      data: paymentData
    });
    throw new Error(`Flutterwave payment failed: ${error.message}`);
  }
};

/**
 * Verify Flutterwave payment
 * @param {string} transactionId - Flutterwave transaction ID
 * @returns {Promise} - Verification result
 */
export const verifyFlutterwavePayment = async (transactionId) => {
  try {
    const response = await axios.get(`/api/payments/flutterwave-verify/${transactionId}`);
    const { data, status } = response.data;

    if (status === 'success') {
      return {
        success: true,
        transactionId: data.id,
        amount: data.amount,
        currency: data.currency
      };
    }

    throw new Error('Payment verification failed');
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
    const { transactionId, amount, reason, gateway } = refundData;

    const response = await axios.post('/api/payments/refund', {
      transactionId,
      amount,
      reason,
      gateway
    });

    const { refundId, status } = response.data;

    await recordRefund({
      transactionId,
      refundId,
      amount,
      reason,
      status
    });

    return {
      success: true,
      refundId,
      status
    };
  } catch (error) {
    console.error('Refund error:', error);
    throw new Error(`Refund failed: ${error.message}`);
  }
};

/**
 * Record successful payment
 * @param {Object} paymentRecord - Payment record details
 */
const recordPayment = async (paymentRecord) => {
  try {
    await axios.post('/api/payments/record', paymentRecord);
  } catch (error) {
    console.error('Failed to record payment:', error);
  }
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
  try {
    await axios.post('/api/payments/refund-record', refundRecord);
  } catch (error) {
    console.error('Failed to record refund:', error);
  }
};

/**
 * Get payment status
 * @param {string} transactionId - Transaction ID
 * @returns {Promise} - Payment status
 */
export const getPaymentStatus = async (transactionId) => {
  try {
    const response = await axios.get(`/api/payments/status/${transactionId}`);
    return response.data;
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
