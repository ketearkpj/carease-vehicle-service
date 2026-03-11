// ===== src/models/Service.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('rental', 'car_wash', 'repair', 'sales', 'concierge', 'storage', 'delivery'),
    allowNull: false
  },
  descriptionShort: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'description_short'
  },
  descriptionLong: {
    type: DataTypes.TEXT,
    field: 'description_long'
  },
  icon: {
    type: DataTypes.STRING(50)
  },
  image: {
    type: DataTypes.STRING(500)
  },
  gallery: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  features: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  priceType: {
    type: DataTypes.STRING(20),
    defaultValue: 'fixed',
    field: 'price_type'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  minPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'min_price'
  },
  maxPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'max_price'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'deposit_amount'
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'tax_rate'
  },
  minDuration: {
    type: DataTypes.INTEGER,
    field: 'min_duration'
  },
  maxDuration: {
    type: DataTypes.INTEGER,
    field: 'max_duration'
  },
  durationUnit: {
    type: DataTypes.STRING(10),
    defaultValue: 'hours',
    field: 'duration_unit'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_available'
  },
  availableLocations: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    field: 'available_locations'
  },
  timeSlots: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    field: 'time_slots'
  },
  requirements: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  minAge: {
    type: DataTypes.INTEGER,
    field: 'min_age'
  },
  maxAge: {
    type: DataTypes.INTEGER,
    field: 'max_age'
  },
  addons: {
    type: DataTypes.JSONB
  },
  faqs: {
    type: DataTypes.JSONB
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_popular'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count'
  },
  bookingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'booking_count'
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    field: 'average_rating'
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'review_count'
  }
}, {
  tableName: 'services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Service;
