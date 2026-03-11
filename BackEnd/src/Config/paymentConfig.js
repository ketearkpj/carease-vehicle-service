// ===== src/config/payment.js =====
const stripe = require('stripe');
const paypal = require('@paypal/checkout-server-sdk');
const { logger } = require('../Middleware/Logger.md.js');

/**
 * Payment gateway configuration and client initialization
 */
class PaymentConfig {
  constructor() {
    this.stripeClient = null;
    this.paypalClient = null;
    this.initialize();
  }

  /**
   * Initialize payment clients
   */
  initialize() {
    this.initStripe();
    this.initPayPal();
  }

  /**
   * Initialize Stripe client
   */
  initStripe() {
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        this.stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
        logger.info('✅ Stripe client initialized');
      } else {
        logger.warn('⚠️ Stripe secret key not found - Stripe payments disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize Stripe client:', error);
    }
  }

  /**
   * Initialize PayPal client
   */
  initPayPal() {
    try {
      if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
        const environment = process.env.PAYPAL_ENVIRONMENT === 'live'
          ? new paypal.core.LiveEnvironment(
              process.env.PAYPAL_CLIENT_ID,
              process.env.PAYPAL_CLIENT_SECRET
            )
          : new paypal.core.SandboxEnvironment(
              process.env.PAYPAL_CLIENT_ID,
              process.env.PAYPAL_CLIENT_SECRET
            );

        this.paypalClient = new paypal.core.PayPalHttpClient(environment);
        logger.info('✅ PayPal client initialized');
      } else {
        logger.warn('⚠️ PayPal credentials not found - PayPal payments disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize PayPal client:', error);
    }
  }

  /**
   * Get Stripe client
   */
  getStripe() {
    if (!this.stripeClient) {
      throw new Error('Stripe client not initialized');
    }
    return this.stripeClient;
  }

  /**
   * Get PayPal client
   */
  getPayPal() {
    if (!this.paypalClient) {
      throw new Error('PayPal client not initialized');
    }
    return this.paypalClient;
  }

  /**
   * Get M-PESA configuration
   */
  getMpesaConfig() {
    return {
      consumerKey: process.env.MPESA_CONSUMER_KEY,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET,
      passkey: process.env.MPESA_PASSKEY,
      shortCode: process.env.MPESA_SHORT_CODE,
      environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
      callbackUrl: process.env.MPESA_CALLBACK_URL,
      baseUrl: process.env.MPESA_ENVIRONMENT === 'live'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke'
    };
  }

  /**
   * Get Square configuration
   */
  getSquareConfig() {
    return {
      applicationId: process.env.SQUARE_APPLICATION_ID,
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      locationId: process.env.SQUARE_LOCATION_ID,
      environment: process.env.SQUARE_ENVIRONMENT || 'sandbox'
    };
  }

  /**
   * Get Flutterwave configuration
   */
  getFlutterwaveConfig() {
    return {
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
      encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY,
      environment: process.env.FLUTTERWAVE_ENVIRONMENT || 'sandbox',
      baseUrl: process.env.FLUTTERWAVE_ENVIRONMENT === 'live'
        ? 'https://api.flutterwave.com/v3'
        : 'https://api.flutterwave.com/v3'
    };
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies() {
    return {
      stripe: ['usd', 'eur', 'gbp', 'cad', 'aud'],
      paypal: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      mpesa: ['KES'],
      square: ['USD', 'CAD'],
      flutterwave: ['NGN', 'KES', 'GHS', 'ZAR', 'UGX']
    };
  }

  /**
   * Check if payment method is available
   */
  isMethodAvailable(method) {
    const availability = {
      stripe: !!this.stripeClient,
      paypal: !!this.paypalClient,
      mpesa: !!process.env.MPESA_CONSUMER_KEY,
      square: !!process.env.SQUARE_ACCESS_TOKEN,
      flutterwave: !!process.env.FLUTTERWAVE_SECRET_KEY
    };

    return availability[method] || false;
  }

  /**
   * Get available payment methods
   */
  getAvailableMethods() {
    return {
      card: this.isMethodAvailable('stripe'),
      paypal: this.isMethodAvailable('paypal'),
      mpesa: this.isMethodAvailable('mpesa'),
      square: this.isMethodAvailable('square'),
      flutterwave: this.isMethodAvailable('flutterwave'),
      cash: true,
      bank_transfer: true
    };
  }

  /**
   * Get webhook configurations
   */
  getWebhookConfigs() {
    return {
      stripe: {
        secret: process.env.STRIPE_WEBHOOK_SECRET,
        endpoint: '/webhooks/stripe'
      },
      paypal: {
        webhookId: process.env.PAYPAL_WEBHOOK_ID,
        endpoint: '/webhooks/paypal'
      },
      mpesa: {
        endpoint: '/webhooks/mpesa'
      },
      square: {
        signatureKey: process.env.SQUARE_SIGNATURE_KEY,
        endpoint: '/webhooks/square'
      },
      flutterwave: {
        secret: process.env.FLUTTERWAVE_WEBHOOK_SECRET,
        endpoint: '/webhooks/flutterwave'
      }
    };
  }
}

module.exports = new PaymentConfig();