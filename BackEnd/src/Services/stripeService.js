// ===== src/services/stripeService.js =====
const Stripe = require('stripe');
const { logger } = require('../Middleware/Logger.md.js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// ===== CREATE PAYMENT INTENT =====
exports.createPaymentIntent = async ({ amount, currency, customerId, metadata }) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true
      }
    });

    logger.info(`Payment intent created: ${paymentIntent.id}`);
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    logger.error('Stripe create payment intent failed:', error);
    throw error;
  }
};

// ===== CONFIRM PAYMENT =====
exports.confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method_types[0]
    };
  } catch (error) {
    logger.error('Stripe confirm payment failed:', error);
    throw error;
  }
};

// ===== CREATE REFUND =====
exports.createRefund = async ({ paymentIntentId, amount }) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined
    });

    logger.info(`Refund created: ${refund.id}`);
    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    };
  } catch (error) {
    logger.error('Stripe create refund failed:', error);
    throw error;
  }
};

// ===== CREATE CUSTOMER =====
exports.createCustomer = async ({ email, name, phone }) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone
    });

    logger.info(`Stripe customer created: ${customer.id}`);
    return customer;
  } catch (error) {
    logger.error('Stripe create customer failed:', error);
    throw error;
  }
};

// ===== ATTACH PAYMENT METHOD =====
exports.attachPaymentMethod = async ({ paymentMethodId, customerId }) => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });

    // Set as default
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    return {
      id: paymentMethod.id,
      card: {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year
      }
    };
  } catch (error) {
    logger.error('Stripe attach payment method failed:', error);
    throw error;
  }
};

// ===== DETACH PAYMENT METHOD =====
exports.detachPaymentMethod = async (paymentMethodId) => {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    logger.info(`Payment method detached: ${paymentMethodId}`);
  } catch (error) {
    logger.error('Stripe detach payment method failed:', error);
    throw error;
  }
};

// ===== CONSTRUCT WEBHOOK EVENT =====
exports.constructEvent = (payload, signature) => {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    logger.error('Stripe webhook construction failed:', error);
    throw error;
  }
};

// ===== GET PAYMENT INTENT =====
exports.getPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    };
  } catch (error) {
    logger.error('Stripe get payment intent failed:', error);
    throw error;
  }
};