// ===== src/models/Wishlist.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const Wishlist = sequelize.define('Wishlist', {
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
  vehicleId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'vehicle_id'
  }
}, {
  tableName: 'wishlist',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Wishlist;
