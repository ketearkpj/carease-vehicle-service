// ===== src/models/index.js =====
const User = require('./User');
const UserAddress = require('./UserAddress');
const UserPaymentMethod = require('./UserPaymentMethod');
const Vehicle = require('./Vehicle');
const Service = require('./Service');
const Booking = require('./Booking');
const Payment = require('./Payment');
const Delivery = require('./Delivery');
const Review = require('./Review');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');
const SystemSettings = require('./SystemSettings');
const Location = require('./Location');
const Maintenance = require('./Maintenance');
const Wishlist = require('./Wishlist');

User.hasMany(UserAddress, { foreignKey: 'userId', as: 'addresses' });
User.hasMany(UserPaymentMethod, { foreignKey: 'userId', as: 'paymentMethods' });
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
User.hasMany(Delivery, { foreignKey: 'userId', as: 'deliveries' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlist' });

UserAddress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserPaymentMethod.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserPaymentMethod.belongsTo(UserAddress, { foreignKey: 'billingAddressId', as: 'billingAddress' });

Vehicle.hasMany(Booking, { foreignKey: 'vehicleId', as: 'bookings' });
Vehicle.hasMany(Review, { foreignKey: 'vehicleId', as: 'reviews' });
Vehicle.hasMany(Maintenance, { foreignKey: 'vehicleId', as: 'maintenance' });
Vehicle.hasMany(Wishlist, { foreignKey: 'vehicleId', as: 'wishlistedBy' });

Service.hasMany(Booking, { foreignKey: 'serviceId', as: 'bookings' });
Service.hasMany(Review, { foreignKey: 'serviceId', as: 'reviews' });

Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Booking.hasMany(Payment, { foreignKey: 'bookingId', as: 'payments' });
Booking.hasMany(Delivery, { foreignKey: 'bookingId', as: 'deliveries' });
Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });

Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

Delivery.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Delivery.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Delivery.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Review.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Review.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

AuditLog.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

SystemSettings.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });

Maintenance.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wishlist.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

module.exports = {
  User,
  UserAddress,
  UserPaymentMethod,
  Vehicle,
  Service,
  Booking,
  Payment,
  Delivery,
  Review,
  Notification,
  AuditLog,
  SystemSettings,
  Location,
  Maintenance,
  Wishlist
};
