// ===== src/models/Review.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const Review = sequelize.define('Review', {
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
  bookingId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'booking_id'
  },
  vehicleId: {
    type: DataTypes.UUID,
    field: 'vehicle_id'
  },
  serviceId: {
    type: DataTypes.UUID,
    field: 'service_id'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pros: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  cons: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  cleanlinessRating: {
    type: DataTypes.INTEGER,
    field: 'cleanliness_rating'
  },
  serviceRating: {
    type: DataTypes.INTEGER,
    field: 'service_rating'
  },
  valueRating: {
    type: DataTypes.INTEGER,
    field: 'value_rating'
  },
  communicationRating: {
    type: DataTypes.INTEGER,
    field: 'communication_rating'
  },
  conditionRating: {
    type: DataTypes.INTEGER,
    field: 'condition_rating'
  },
  wouldRecommend: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'would_recommend'
  },
  wouldRentAgain: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'would_rent_again'
  },
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'helpful_count'
  },
  helpfulUsers: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    field: 'helpful_users'
  },
  responseContent: {
    type: DataTypes.TEXT,
    field: 'response_content'
  },
  responseBy: {
    type: DataTypes.UUID,
    field: 'response_by'
  },
  responseAt: {
    type: DataTypes.DATE,
    field: 'response_at'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending'
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Review;
