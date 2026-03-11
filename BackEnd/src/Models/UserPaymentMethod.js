// ===== src/models/UserPaymentMethod.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const UserPaymentMethod = sequelize.define('UserPaymentMethod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  methodType: {
    type: DataTypes.ENUM('card', 'paypal', 'mpesa', 'square', 'flutterwave', 'cash', 'bank_transfer'),
    allowNull: false,
    field: 'method_type'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default'
  },
  last4: {
    type: DataTypes.STRING(4)
  },
  cardBrand: {
    type: DataTypes.STRING(20),
    field: 'card_brand'
  },
  expiryMonth: {
    type: DataTypes.INTEGER,
    field: 'expiry_month'
  },
  expiryYear: {
    type: DataTypes.INTEGER,
    field: 'expiry_year'
  },
  stripePaymentMethodId: {
    type: DataTypes.STRING(255),
    field: 'stripe_payment_method_id'
  },
  paypalEmail: {
    type: DataTypes.STRING(255),
    field: 'paypal_email'
  },
  mpesaNumber: {
    type: DataTypes.STRING(20),
    field: 'mpesa_number'
  },
  billingAddressId: {
    type: DataTypes.UUID,
    field: 'billing_address_id'
  }
}, {
  tableName: 'user_payment_methods',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserPaymentMethod;
