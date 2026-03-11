// ===== src/models/Vehicle.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  make: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('supercar', 'luxury', 'sports', 'suv', 'exotic', 'grand_tourer', 'classic'),
    allowNull: false
  },
  vin: {
    type: DataTypes.STRING(17)
  },
  licensePlate: {
    type: DataTypes.STRING(20),
    field: 'license_plate'
  },
  dailyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'daily_rate'
  },
  weeklyRate: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'weekly_rate'
  },
  monthlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'monthly_rate'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'deposit_amount'
  },
  insuranceRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'insurance_rate'
  },
  engine: {
    type: DataTypes.STRING(100)
  },
  power: {
    type: DataTypes.STRING(50)
  },
  acceleration: {
    type: DataTypes.STRING(20)
  },
  topSpeed: {
    type: DataTypes.STRING(20),
    field: 'top_speed'
  },
  transmission: {
    type: DataTypes.ENUM('manual', 'automatic', 'semi-automatic', 'dual-clutch')
  },
  drivetrain: {
    type: DataTypes.ENUM('FWD', 'RWD', 'AWD', '4WD')
  },
  fuelType: {
    type: DataTypes.ENUM('petrol', 'diesel', 'hybrid', 'electric'),
    field: 'fuel_type'
  },
  fuelEconomy: {
    type: DataTypes.STRING(20),
    field: 'fuel_economy'
  },
  seatingCapacity: {
    type: DataTypes.INTEGER,
    field: 'seating_capacity'
  },
  doors: {
    type: DataTypes.INTEGER
  },
  features: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  colors: {
    type: DataTypes.JSONB
  },
  mainImage: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'main_image'
  },
  galleryImages: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    field: 'gallery_images'
  },
  interiorImages: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    field: 'interior_images'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_available'
  },
  location: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  currentMileage: {
    type: DataTypes.INTEGER,
    field: 'current_mileage'
  },
  lastServiceDate: {
    type: DataTypes.DATE,
    field: 'last_service_date'
  },
  nextServiceDue: {
    type: DataTypes.DATE,
    field: 'next_service_due'
  },
  serviceHistory: {
    type: DataTypes.JSONB,
    field: 'service_history'
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
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_popular'
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
  }
}, {
  tableName: 'vehicles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Vehicle;
