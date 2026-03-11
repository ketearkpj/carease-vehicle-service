// ===== src/models/UserAddress.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const UserAddress = sequelize.define('UserAddress', {
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
  addressType: {
    type: DataTypes.STRING(20),
    field: 'address_type',
    defaultValue: 'home'
  },
  street: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  state: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  zipCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'zip_code'
  },
  country: {
    type: DataTypes.STRING(50),
    defaultValue: 'Kenya'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8)
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8)
  },
  placeId: {
    type: DataTypes.STRING(255),
    field: 'place_id'
  }
}, {
  tableName: 'user_addresses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserAddress;
