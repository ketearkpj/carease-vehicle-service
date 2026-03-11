// ===== src/models/Delivery.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  deliveryNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'delivery_number'
  },
  bookingId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'booking_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'en_route_pickup', 'arrived_pickup', 'picked_up', 'en_route_dropoff', 'arrived_dropoff', 'delivered', 'cancelled', 'failed'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('normal', 'express', 'urgent'),
    defaultValue: 'normal'
  },
  requestedPickupDate: {
    type: DataTypes.DATEONLY,
    field: 'requested_pickup_date'
  },
  requestedPickupTime: {
    type: DataTypes.STRING(10),
    field: 'requested_pickup_time'
  },
  requestedDropoffDate: {
    type: DataTypes.DATEONLY,
    field: 'requested_dropoff_date'
  },
  requestedDropoffTime: {
    type: DataTypes.STRING(10),
    field: 'requested_dropoff_time'
  },
  estimatedPickup: {
    type: DataTypes.DATE,
    field: 'estimated_pickup'
  },
  estimatedDropoff: {
    type: DataTypes.DATE,
    field: 'estimated_dropoff'
  },
  actualPickup: {
    type: DataTypes.DATE,
    field: 'actual_pickup'
  },
  actualDropoff: {
    type: DataTypes.DATE,
    field: 'actual_dropoff'
  },
  pickupType: {
    type: DataTypes.STRING(20),
    field: 'pickup_type'
  },
  pickupName: {
    type: DataTypes.STRING(100),
    field: 'pickup_name'
  },
  pickupAddress: {
    type: DataTypes.JSONB,
    field: 'pickup_address'
  },
  pickupCoordinates: {
    type: DataTypes.JSONB,
    field: 'pickup_coordinates'
  },
  pickupContact: {
    type: DataTypes.JSONB,
    field: 'pickup_contact'
  },
  pickupInstructions: {
    type: DataTypes.TEXT,
    field: 'pickup_instructions'
  },
  dropoffType: {
    type: DataTypes.STRING(20),
    field: 'dropoff_type'
  },
  dropoffName: {
    type: DataTypes.STRING(100),
    field: 'dropoff_name'
  },
  dropoffAddress: {
    type: DataTypes.JSONB,
    field: 'dropoff_address'
  },
  dropoffCoordinates: {
    type: DataTypes.JSONB,
    field: 'dropoff_coordinates'
  },
  dropoffContact: {
    type: DataTypes.JSONB,
    field: 'dropoff_contact'
  },
  dropoffInstructions: {
    type: DataTypes.TEXT,
    field: 'dropoff_instructions'
  },
  driverId: {
    type: DataTypes.UUID,
    field: 'driver_id'
  },
  driverName: {
    type: DataTypes.STRING(100),
    field: 'driver_name'
  },
  driverPhone: {
    type: DataTypes.STRING(20),
    field: 'driver_phone'
  },
  driverPhoto: {
    type: DataTypes.STRING(500),
    field: 'driver_photo'
  },
  currentLocation: {
    type: DataTypes.JSONB,
    field: 'current_location'
  },
  lastLocationUpdate: {
    type: DataTypes.DATE,
    field: 'last_location_update'
  },
  route: {
    type: DataTypes.JSONB
  },
  estimatedDistance: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'estimated_distance'
  },
  actualDistance: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'actual_distance'
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    field: 'estimated_duration'
  },
  actualDuration: {
    type: DataTypes.INTEGER,
    field: 'actual_duration'
  },
  baseFee: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'base_fee'
  },
  distanceFee: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'distance_fee'
  },
  surgeFee: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'surge_fee'
  },
  tollFee: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'toll_fee'
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'tax_amount'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'total_amount'
  },
  customerNotifications: {
    type: DataTypes.JSONB,
    field: 'customer_notifications'
  },
  issues: {
    type: DataTypes.JSONB
  },
  ratingScore: {
    type: DataTypes.INTEGER,
    field: 'rating_score'
  },
  ratingFeedback: {
    type: DataTypes.TEXT,
    field: 'rating_feedback'
  },
  ratingCategories: {
    type: DataTypes.JSONB,
    field: 'rating_categories'
  },
  ratedAt: {
    type: DataTypes.DATE,
    field: 'rated_at'
  },
  timeline: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'deliveries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Delivery;
