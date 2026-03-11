// ===== src/models/Payment.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  paymentNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'payment_number'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  bookingId: {
    type: DataTypes.UUID,
    field: 'booking_id'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  method: {
    type: DataTypes.ENUM('card', 'paypal', 'mpesa', 'square', 'flutterwave', 'cash', 'bank_transfer'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'),
    defaultValue: 'pending'
  },
  gateway: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING(255),
    field: 'transaction_id'
  },
  gatewayResponse: {
    type: DataTypes.JSONB,
    field: 'gateway_response'
  },
  cardLast4: {
    type: DataTypes.STRING(4),
    field: 'card_last4'
  },
  cardBrand: {
    type: DataTypes.STRING(20),
    field: 'card_brand'
  },
  paypalEmail: {
    type: DataTypes.STRING(255),
    field: 'paypal_email'
  },
  mpesaNumber: {
    type: DataTypes.STRING(20),
    field: 'mpesa_number'
  },
  mpesaReceipt: {
    type: DataTypes.STRING(50),
    field: 'mpesa_receipt'
  },
  billingFirstName: {
    type: DataTypes.STRING(50),
    field: 'billing_first_name'
  },
  billingLastName: {
    type: DataTypes.STRING(50),
    field: 'billing_last_name'
  },
  billingEmail: {
    type: DataTypes.STRING(255),
    field: 'billing_email'
  },
  billingPhone: {
    type: DataTypes.STRING(20),
    field: 'billing_phone'
  },
  billingAddress: {
    type: DataTypes.JSONB,
    field: 'billing_address'
  },
  refunds: {
    type: DataTypes.JSONB
  },
  metadata: {
    type: DataTypes.JSONB
  },
  errorMessage: {
    type: DataTypes.TEXT,
    field: 'error_message'
  },
  processedAt: {
    type: DataTypes.DATE,
    field: 'processed_at'
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Payment;
