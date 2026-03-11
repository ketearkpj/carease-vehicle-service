// ===== src/models/Booking.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bookingNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'booking_number'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  vehicleId: {
    type: DataTypes.UUID,
    field: 'vehicle_id'
  },
  serviceId: {
    type: DataTypes.UUID,
    field: 'service_id'
  },
  serviceType: {
    type: DataTypes.ENUM('rental', 'car_wash', 'repair', 'sales', 'concierge', 'storage', 'delivery'),
    allowNull: false,
    field: 'service_type'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'in_progress', 'completed', 'cancelled', 'refunded', 'no_show'),
    defaultValue: 'pending'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_date'
  },
  pickupTime: {
    type: DataTypes.STRING(10),
    field: 'pickup_time'
  },
  dropoffTime: {
    type: DataTypes.STRING(10),
    field: 'dropoff_time'
  },
  actualPickup: {
    type: DataTypes.DATE,
    field: 'actual_pickup'
  },
  actualDropoff: {
    type: DataTypes.DATE,
    field: 'actual_dropoff'
  },
  pickupLocationType: {
    type: DataTypes.STRING(20),
    field: 'pickup_location_type'
  },
  pickupLocationName: {
    type: DataTypes.STRING(100),
    field: 'pickup_location_name'
  },
  pickupAddress: {
    type: DataTypes.JSONB,
    field: 'pickup_address'
  },
  pickupCoordinates: {
    type: DataTypes.JSONB,
    field: 'pickup_coordinates'
  },
  dropoffLocationType: {
    type: DataTypes.STRING(20),
    field: 'dropoff_location_type'
  },
  dropoffLocationName: {
    type: DataTypes.STRING(100),
    field: 'dropoff_location_name'
  },
  dropoffAddress: {
    type: DataTypes.JSONB,
    field: 'dropoff_address'
  },
  dropoffCoordinates: {
    type: DataTypes.JSONB,
    field: 'dropoff_coordinates'
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'base_price'
  },
  extrasPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'extras_price'
  },
  insurancePrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'insurance_price'
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'tax_amount'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'discount_amount'
  },
  discountCode: {
    type: DataTypes.STRING(50),
    field: 'discount_code'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'deposit_amount'
  },
  depositPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'deposit_paid'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  extras: {
    type: DataTypes.JSONB
  },
  customerFirstName: {
    type: DataTypes.STRING(50),
    field: 'customer_first_name'
  },
  customerLastName: {
    type: DataTypes.STRING(50),
    field: 'customer_last_name'
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    field: 'customer_email'
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    field: 'customer_phone'
  },
  driverLicenseNumber: {
    type: DataTypes.STRING(50),
    field: 'driver_license_number'
  },
  driverLicenseState: {
    type: DataTypes.STRING(20),
    field: 'driver_license_state'
  },
  driverLicenseExpiry: {
    type: DataTypes.DATEONLY,
    field: 'driver_license_expiry'
  },
  specialRequests: {
    type: DataTypes.TEXT,
    field: 'special_requests'
  },
  notes: {
    type: DataTypes.JSONB
  },
  timeline: {
    type: DataTypes.JSONB
  },
  cancelledAt: {
    type: DataTypes.DATE,
    field: 'cancelled_at'
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    field: 'cancellation_reason'
  },
  cancellationFee: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'cancellation_fee'
  },
  refunded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Booking;
