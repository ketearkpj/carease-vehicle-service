// ===== src/services/paypalService.js =====
const paypal = require('@paypal/checkout-server-sdk');
const { logger } = require('../Middleware/Logger.md.js');

// ===== CONFIGURE PAYPAL CLIENT =====
const environment = process.env.PAYPAL_ENVIRONMENT === 'live'
  ? new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    )
  : new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );

const client = new paypal.core.PayPalHttpClient(environment);

// ===== CREATE ORDER =====
exports.createOrder = async ({ amount, currency, reference }) => {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString()
        },
        reference_id: reference
      }],
      application_context: {
        brand_name: 'CAR EASE',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.CLIENT_URL}/payment/success`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`
      }
    });

    const order = await client.execute(request);
    logger.info(`PayPal order created: ${order.result.id}`);

    // Find approval URL
    const approvalUrl = order.result.links.find(link => link.rel === 'approve').href;

    return {
      orderId: order.result.id,
      approvalUrl,
      status: order.result.status
    };
  } catch (error) {
    logger.error('PayPal create order failed:', error);
    throw error;
  }
};

// ===== CAPTURE ORDER =====
exports.captureOrder = async (orderId) => {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client.execute(request);
    logger.info(`PayPal order captured: ${orderId}`);

    const payment = capture.result.purchase_units[0].payments.captures[0];

    return {
      transactionId: payment.id,
      amount: parseFloat(payment.amount.value),
      currency: payment.amount.currency_code,
      status: payment.status,
      payer: {
        email: capture.result.payer.email_address,
        name: `${capture.result.payer.name.given_name} ${capture.result.payer.name.surname}`
      }
    };
  } catch (error) {
    logger.error('PayPal capture order failed:', error);
    throw error;
  }
};

// ===== REFUND PAYMENT =====
exports.refundPayment = async ({ transactionId, amount }) => {
  try {
    const request = new paypal.payments.CapturesRefundRequest(transactionId);
    request.requestBody({
      amount: {
        value: amount.toString(),
        currency_code: 'USD'
      }
    });

    const refund = await client.execute(request);
    logger.info(`PayPal refund created: ${refund.result.id}`);

    return {
      refundId: refund.result.id,
      amount: parseFloat(refund.result.amount.value),
      status: refund.result.status
    };
  } catch (error) {
    logger.error('PayPal refund failed:', error);
    throw error;
  }
};

// ===== GET ORDER =====
exports.getOrder = async (orderId) => {
  try {
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const order = await client.execute(request);

    return {
      status: order.result.status,
      amount: parseFloat(order.result.purchase_units[0].amount.value),
      currency: order.result.purchase_units[0].amount.currency_code
    };
  } catch (error) {
    logger.error('PayPal get order failed:', error);
    throw error;
  }
};

// ===== VERIFY WEBHOOK =====
exports.verifyWebhook = async (payload, signature) => {
  // PayPal webhook verification implementation
  // Requires webhook ID from PayPal dashboard
  return { verified: true };
};