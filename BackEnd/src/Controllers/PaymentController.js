// ===== src/controllers/paymentController.js =====
const { Op, fn, col, literal } = require('sequelize');
const { Payment, Booking, User, UserPaymentMethod } = require('../Models');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');
const APIFeatures = require('../Utils/APIFeatures');
const stripeService = require('../Services/stripeService');
const paypalService = require('../Services/paypalService');
const mpesaService = require('../Services/mpesaService');
const squareService = require('../Services/squareService');
const flutterwaveService = require('../Services/flutterwaveService');
const { sendEmail, sendPaymentReceipt, sendRefundNotification } = require('../Services/emailService');
const { generateReceipt } = require('../Utils/ReceiptGenerator');

// ===== PROCESS PAYMENT =====
exports.processPayment = catchAsync(async (req, res, next) => {
  const {
    bookingId,
    amount,
    currency = 'USD',
    method,
    paymentMethodId,
    savePaymentMethod = false
  } = req.body;

  // Get booking
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if already paid
  const existingPaid = await Payment.findOne({ where: { bookingId, status: 'completed' } });
  if (existingPaid) {
    return next(new AppError('Booking already paid', 400));
  }

  // Generate payment number
  const paymentNumber = await generatePaymentNumber();

  // Create payment record
  const payment = await Payment.create({
    paymentNumber,
    userId: req.user.id,
    bookingId,
    amount,
    currency,
    method,
    status: 'pending',
    gateway: method,
    billingAddress: req.body.billingDetails,
    metadata: {
      ip: req.ip,
      userAgent: req.get('user-agent')
    }
  });

  // Process based on payment method
  let result;
  switch (method) {
    case 'card':
      result = await stripeService.processPayment({
        amount,
        currency,
        paymentMethodId,
        customer: req.user.stripeCustomerId,
        metadata: { paymentId: payment.id, bookingId }
      });
      break;

    case 'paypal':
      result = await paypalService.createOrder({
        amount,
        currency,
        reference: payment.id
      });
      break;

    case 'mpesa':
      result = await mpesaService.stkPush({
        amount,
        phoneNumber: req.body.phoneNumber,
        accountReference: payment.paymentNumber
      });
      break;

    case 'square':
      result = await squareService.processPayment({
        amount,
        currency,
        sourceId: paymentMethodId,
        locationId: process.env.SQUARE_LOCATION_ID
      });
      break;

    case 'flutterwave':
      result = await flutterwaveService.charge({
        amount,
        currency,
        email: req.user.email,
        phoneNumber: req.body.phoneNumber,
        paymentMethod: req.body.paymentMethod
      });
      break;

    default:
      return next(new AppError('Invalid payment method', 400));
  }

  // Update payment with gateway response
  payment.transactionId = result.transactionId;
  payment.gatewayResponse = result;
  payment.status = result.status === 'success' ? 'completed' : 'processing';
  payment.processedAt = new Date();

  await payment.save();

  // Update booking if payment completed
  if (payment.status === 'completed') {
    booking.status = 'confirmed';
    booking.depositPaid = true;
    await booking.save();

    // Send receipt
    await sendPaymentReceipt(payment, booking, req.user);

    // Save payment method if requested
    if (savePaymentMethod && result.paymentMethodId) {
      await saveUserPaymentMethod(req.user.id, {
        methodType: 'card',
        stripePaymentMethodId: result.paymentMethodId,
        last4: result.cardLast4,
        cardBrand: result.cardBrand,
        expiryMonth: result.expiryMonth,
        expiryYear: result.expiryYear
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment,
      clientSecret: result.clientSecret,
      approvalUrl: result.approvalUrl
    }
  });
});

// ===== GET ALL PAYMENTS =====
exports.getAllPayments = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: payments, count: total } = await Payment.findAndCountAll({
    ...options,
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Booking, as: 'booking' }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: payments.length,
    total,
    data: {
      payments
    }
  });
});

// ===== GET USER PAYMENTS =====
exports.getUserPayments = catchAsync(async (req, res, next) => {
  const userId = req.params.userId || req.user.id;

  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: payments, count: total } = await Payment.findAndCountAll({
    ...options,
    where: { ...options.where, userId },
    include: [{ model: Booking, as: 'booking' }]
  });

  res.status(200).json({
    status: 'success',
    results: payments.length,
    total,
    data: {
      payments
    }
  });
});

// ===== GET PAYMENT BY ID =====
exports.getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Booking, as: 'booking' }
    ]
  });

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check authorization
  if (req.user.role !== 'admin' && payment.userId?.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to view this payment', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});

// ===== CONFIRM PAYMENT =====
exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { paymentIntentId, orderId } = req.body;
  const payment = await Payment.findOne({
    where: {
      [Op.or]: [
        { transactionId: paymentIntentId },
        { transactionId: orderId }
      ]
    }
  });

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  let result;
  switch (payment.method) {
    case 'card':
      result = await stripeService.confirmPayment(paymentIntentId);
      break;
    case 'paypal':
      result = await paypalService.captureOrder(orderId);
      break;
    default:
      return next(new AppError('Payment confirmation not needed for this method', 400));
  }

  if (result.status === 'completed') {
    payment.status = 'completed';
    payment.processedAt = new Date();
    await payment.save();

    // Update booking
    const booking = await Booking.findByPk(payment.bookingId);
    if (booking) {
      booking.status = 'confirmed';
      booking.depositPaid = true;
      await booking.save();

      // Get user for email notification
      const user = await User.findByPk(payment.userId);
      if (user) {
        await sendPaymentReceipt(payment, booking, user);
      }
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment,
      result
    }
  });
});

// ===== PROCESS REFUND =====
exports.processRefund = catchAsync(async (req, res, next) => {
  const { amount, reason } = req.body;
  const payment = await Payment.findByPk(req.params.id);

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  if (payment.status !== 'completed') {
    return next(new AppError('Only completed payments can be refunded', 400));
  }

  const refundAmount = amount || payment.amount;

  let result;
  switch (payment.method) {
    case 'card':
      result = await stripeService.createRefund({
        paymentIntentId: payment.transactionId,
        amount: refundAmount
      });
      break;
    case 'paypal':
      result = await paypalService.refundPayment({
        transactionId: payment.transactionId,
        amount: refundAmount
      });
      break;
    default:
      return next(new AppError('Refund not supported for this payment method', 400));
  }

  // Add refund to payment
  const refunds = Array.isArray(payment.refunds) ? payment.refunds : [];
  refunds.push({
    amount: refundAmount,
    reason,
    status: 'completed',
    transactionId: result.transactionId,
    gatewayResponse: result,
    createdBy: req.user.id,
    createdAt: new Date()
  });
  payment.refunds = refunds;

  // Update payment status
  if (refundAmount === payment.amount) {
    payment.status = 'refunded';
  } else {
    payment.status = 'partially_refunded';
  }

  await payment.save();

  // Update booking
  const booking = await Booking.findByPk(payment.bookingId);
  if (booking) {
    booking.status = 'refunded';
    await booking.save();
  }

  // Send refund notification
  const user = await User.findByPk(payment.userId);
  if (user) {
    const refund = {
      refundId: payment.id,
      amount: refundAmount,
      originalPaymentMethod: payment.method,
      processedAt: new Date()
    };
    await sendRefundNotification(user, refund);
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});

// ===== GET PAYMENT METHODS =====
exports.getPaymentMethods = catchAsync(async (req, res, next) => {
  const paymentMethods = await UserPaymentMethod.findAll({
    where: { userId: req.user.id },
    order: [['created_at', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    data: {
      paymentMethods
    }
  });
});

// ===== ADD PAYMENT METHOD =====
exports.addPaymentMethod = catchAsync(async (req, res, next) => {
  const { paymentMethodId, type, details } = req.body;

  let paymentMethod;
  switch (type) {
    case 'card':
      const stripeMethod = await stripeService.attachPaymentMethod({
        paymentMethodId,
        customerId: req.user.stripeCustomerId
      });
      
      paymentMethod = {
        methodType: 'card',
        isDefault: false,
        last4: stripeMethod.card.last4,
        cardBrand: stripeMethod.card.brand,
        expiryMonth: stripeMethod.card.exp_month,
        expiryYear: stripeMethod.card.exp_year,
        stripePaymentMethodId: paymentMethodId
      };
      break;

    case 'paypal':
      paymentMethod = {
        methodType: 'paypal',
        isDefault: false,
        paypalEmail: details.email
      };
      break;

    case 'mpesa':
      paymentMethod = {
        methodType: 'mpesa',
        isDefault: false,
        mpesaNumber: details.phoneNumber
      };
      break;

    default:
      return next(new AppError('Invalid payment method type', 400));
  }

  const existingCount = await UserPaymentMethod.count({ where: { userId: req.user.id } });
  if (existingCount === 0) {
    paymentMethod.isDefault = true;
  }

  const created = await UserPaymentMethod.create({ ...paymentMethod, userId: req.user.id });

  res.status(201).json({
    status: 'success',
    data: {
      paymentMethod: created
    }
  });
});

// ===== DELETE PAYMENT METHOD =====
exports.deletePaymentMethod = catchAsync(async (req, res, next) => {
  const { methodId } = req.params;

  const method = await UserPaymentMethod.findOne({
    where: { id: methodId, userId: req.user.id }
  });

  if (!method) {
    return next(new AppError('Payment method not found', 404));
  }

  // If this was the default method, make another one default
  if (method.isDefault) {
    const newDefault = await UserPaymentMethod.findOne({
      where: { userId: req.user.id, id: { [Op.ne]: methodId } },
      order: [['created_at', 'DESC']]
    });
    if (newDefault) {
      newDefault.isDefault = true;
      await newDefault.save();
    }
  }

  // Remove from Stripe if it's a card
  if (method.methodType === 'card' && method.stripePaymentMethodId) {
    await stripeService.detachPaymentMethod(method.stripePaymentMethodId);
  }

  await method.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// ===== SET DEFAULT PAYMENT METHOD =====
exports.setDefaultPaymentMethod = catchAsync(async (req, res, next) => {
  const { methodId } = req.params;

  await UserPaymentMethod.update({ isDefault: false }, { where: { userId: req.user.id } });

  const method = await UserPaymentMethod.findOne({
    where: { id: methodId, userId: req.user.id }
  });
  if (!method) {
    return next(new AppError('Payment method not found', 404));
  }

  method.isDefault = true;
  await method.save();

  res.status(200).json({
    status: 'success',
    data: {
      paymentMethod: method
    }
  });
});

// ===== GET PAYMENT STATISTICS =====
exports.getPaymentStatistics = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const statsRows = await Payment.findAll({
    attributes: [
      [fn('sum', col('amount')), 'total'],
      [fn('count', col('id')), 'count'],
      [fn('sum', literal(`CASE WHEN status = 'completed' THEN 1 ELSE 0 END`)), 'completed'],
      [fn('sum', literal(`CASE WHEN status = 'refunded' THEN 1 ELSE 0 END`)), 'refunded'],
      [fn('sum', literal(`CASE WHEN status = 'failed' THEN 1 ELSE 0 END`)), 'failed']
    ],
    where: {
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) }
    },
    raw: true
  });

  // Stats by payment method
  const byMethod = await Payment.findAll({
    attributes: [
      ['method', 'method'],
      [fn('sum', col('amount')), 'total'],
      [fn('count', col('id')), 'count']
    ],
    where: {
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) },
      status: 'completed'
    },
    group: ['method'],
    raw: true
  });

  // Daily revenue for chart
  const dailyRevenue = await Payment.findAll({
    attributes: [
      [fn('to_char', col('created_at'), 'YYYY-MM-DD'), 'date'],
      [fn('sum', col('amount')), 'total'],
      [fn('count', col('id')), 'count']
    ],
    where: {
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) },
      status: 'completed'
    },
    group: [literal("to_char(created_at, 'YYYY-MM-DD')")],
    order: [[literal("to_char(created_at, 'YYYY-MM-DD')"), 'ASC']],
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      overview: statsRows[0] || {
        total: 0,
        count: 0,
        completed: 0,
        refunded: 0,
        failed: 0
      },
      byMethod,
      dailyRevenue
    }
  });
});

// ===== WEBHOOK HANDLER =====
exports.handleWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'] || 
                    req.headers['paypal-transmission-id'] ||
                    req.headers['x-mpesa-signature'];

  // Verify webhook signature
  const event = await verifyWebhookSignature(req.body, signature, req.params.gateway);

  // Process based on event type
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    case 'charge.refunded':
      await handleRefund(event.data.object);
      break;
  }

  res.status(200).json({ received: true });
});

// ===== HELPER FUNCTIONS =====

const generatePaymentNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `PAY${year}${month}${day}-${random}`;
};

const saveUserPaymentMethod = async (userId, methodData) => {
  await UserPaymentMethod.create({ ...methodData, userId });
};

const verifyWebhookSignature = async (payload, signature, gateway) => {
  switch (gateway) {
    case 'stripe':
      return stripeService.constructEvent(payload, signature);
    case 'paypal':
      return paypalService.verifyWebhook(payload, signature);
    case 'mpesa':
      return mpesaService.verifyWebhook(payload, signature);
    default:
      throw new Error('Invalid gateway');
  }
};

const handlePaymentSuccess = async (paymentIntent) => {
  const payment = await Payment.findOne({ where: { transactionId: paymentIntent.id } });
  if (payment) {
    payment.status = 'completed';
    payment.processedAt = new Date();
    await payment.save();

    const booking = await Booking.findByPk(payment.bookingId);
    if (booking) {
      booking.status = 'confirmed';
      booking.depositPaid = true;
      await booking.save();
    }
  }
};

const handlePaymentFailure = async (paymentIntent) => {
  const payment = await Payment.findOne({ where: { transactionId: paymentIntent.id } });
  if (payment) {
    payment.status = 'failed';
    payment.errorMessage = paymentIntent.last_payment_error?.message;
    await payment.save();
  }
};

const handleRefund = async (charge) => {
  const payment = await Payment.findOne({ where: { transactionId: charge.payment_intent } });
  if (payment) {
    payment.status = 'refunded';
    await payment.save();
  }
};

const generateReceiptEmail = (payment, booking) => {
  // Generate HTML email content
  return `
    <h1>Payment Receipt</h1>
    <p>Payment #${payment.paymentNumber}</p>
    <p>Amount: $${payment.amount}</p>
    <p>Booking #${booking.bookingNumber}</p>
  `;
};

const generateRefundEmail = (payment, amount, reason) => {
  return `
    <h1>Refund Processed</h1>
    <p>Payment #${payment.paymentNumber}</p>
    <p>Refund Amount: $${amount}</p>
    <p>Reason: ${reason}</p>
  `;
};

module.exports = exports;
