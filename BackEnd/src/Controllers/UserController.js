// ===== src/controllers/userController.js =====
const { Op } = require('sequelize');
const { User, UserAddress, UserPaymentMethod, Vehicle, Notification, Wishlist } = require('../Models');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');

// ===== PROFILE =====
exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.status(200).json({ status: 'success', data: { user } });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'profileImage', 'dateOfBirth', 'address', 'preferences'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  Object.assign(user, updates);
  await user.save();

  res.status(200).json({ status: 'success', data: { user } });
});

exports.uploadAvatar = catchAsync(async (req, res) => {
  const profileImage = req.body.profileImage || req.file?.path;
  if (!profileImage) {
    throw new AppError('Profile image is required', 400);
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  user.profileImage = profileImage;
  await user.save();
  res.status(200).json({ status: 'success', data: { user } });
});

exports.deleteAvatar = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  user.profileImage = 'default-avatar.jpg';
  await user.save();
  res.status(200).json({ status: 'success', data: { user } });
});

// ===== ADDRESSES =====
exports.getAddresses = catchAsync(async (req, res) => {
  const addresses = await UserAddress.findAll({
    where: { userId: req.user.id },
    order: [['created_at', 'DESC']]
  });
  res.status(200).json({ status: 'success', data: { addresses } });
});

exports.addAddress = catchAsync(async (req, res) => {
  const address = { ...req.body, userId: req.user.id };

  if (address.isDefault) {
    await UserAddress.update({ isDefault: false }, { where: { userId: req.user.id } });
  } else {
    const existingCount = await UserAddress.count({ where: { userId: req.user.id } });
    if (existingCount === 0) {
      address.isDefault = true;
    }
  }

  await UserAddress.create(address);
  const addresses = await UserAddress.findAll({ where: { userId: req.user.id }, order: [['created_at', 'DESC']] });

  res.status(201).json({ status: 'success', data: { addresses } });
});

exports.updateAddress = catchAsync(async (req, res, next) => {
  const address = await UserAddress.findOne({
    where: { id: req.params.addressId, userId: req.user.id }
  });

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  if (req.body.isDefault) {
    await UserAddress.update({ isDefault: false }, { where: { userId: req.user.id } });
  }

  Object.assign(address, req.body);
  await address.save();

  const addresses = await UserAddress.findAll({ where: { userId: req.user.id }, order: [['created_at', 'DESC']] });
  res.status(200).json({ status: 'success', data: { addresses } });
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
  const address = await UserAddress.findOne({
    where: { id: req.params.addressId, userId: req.user.id }
  });

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  await address.destroy();
  res.status(204).json({ status: 'success' });
});

exports.setDefaultAddress = catchAsync(async (req, res, next) => {
  const address = await UserAddress.findOne({
    where: { id: req.params.addressId, userId: req.user.id }
  });

  if (!address) {
    return next(new AppError('Address not found', 404));
  }

  await UserAddress.update({ isDefault: false }, { where: { userId: req.user.id } });
  address.isDefault = true;
  await address.save();

  const addresses = await UserAddress.findAll({ where: { userId: req.user.id }, order: [['created_at', 'DESC']] });
  res.status(200).json({ status: 'success', data: { addresses } });
});

// ===== PAYMENT METHODS =====
exports.getPaymentMethods = catchAsync(async (req, res) => {
  const paymentMethods = await UserPaymentMethod.findAll({
    where: { userId: req.user.id },
    order: [['created_at', 'DESC']]
  });
  res.status(200).json({ status: 'success', data: { paymentMethods } });
});

exports.addPaymentMethod = catchAsync(async (req, res) => {
  const method = { ...req.body, userId: req.user.id };

  if (method.isDefault) {
    await UserPaymentMethod.update({ isDefault: false }, { where: { userId: req.user.id } });
  } else {
    const existingCount = await UserPaymentMethod.count({ where: { userId: req.user.id } });
    if (existingCount === 0) {
      method.isDefault = true;
    }
  }

  await UserPaymentMethod.create(method);
  const paymentMethods = await UserPaymentMethod.findAll({
    where: { userId: req.user.id },
    order: [['created_at', 'DESC']]
  });

  res.status(201).json({ status: 'success', data: { paymentMethods } });
});

exports.deletePaymentMethod = catchAsync(async (req, res, next) => {
  const method = await UserPaymentMethod.findOne({
    where: { id: req.params.methodId, userId: req.user.id }
  });

  if (!method) {
    return next(new AppError('Payment method not found', 404));
  }

  await method.destroy();
  res.status(204).json({ status: 'success' });
});

exports.setDefaultPaymentMethod = catchAsync(async (req, res, next) => {
  const method = await UserPaymentMethod.findOne({
    where: { id: req.params.methodId, userId: req.user.id }
  });

  if (!method) {
    return next(new AppError('Payment method not found', 404));
  }

  await UserPaymentMethod.update({ isDefault: false }, { where: { userId: req.user.id } });
  method.isDefault = true;
  await method.save();

  const paymentMethods = await UserPaymentMethod.findAll({
    where: { userId: req.user.id },
    order: [['created_at', 'DESC']]
  });

  res.status(200).json({ status: 'success', data: { paymentMethods } });
});

// ===== FAVORITES =====
exports.getFavorites = catchAsync(async (req, res) => {
  const favorites = await Wishlist.findAll({
    where: { userId: req.user.id },
    include: [{ model: Vehicle, as: 'vehicle' }]
  });
  res.status(200).json({ status: 'success', data: { favorites: favorites.map((item) => item.vehicle) } });
});

exports.toggleFavorite = catchAsync(async (req, res) => {
  const { vehicleId } = req.params;
  const vehicle = await Vehicle.findByPk(vehicleId);
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  const existing = await Wishlist.findOne({ where: { userId: req.user.id, vehicleId } });
  if (existing) {
    await existing.destroy();
  } else {
    await Wishlist.create({ userId: req.user.id, vehicleId });
  }

  const favorites = await Wishlist.findAll({
    where: { userId: req.user.id },
    include: [{ model: Vehicle, as: 'vehicle' }]
  });

  res.status(200).json({ status: 'success', data: { favorites: favorites.map((item) => item.vehicle) } });
});

// ===== NOTIFICATIONS =====
exports.getNotifications = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const offset = Number(req.query.offset) || 0;
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
  const unreadCount = await Notification.count({
    where: { userId: req.user.id, status: { [Op.ne]: 'read' } }
  });

  res.status(200).json({
    status: 'success',
    data: { notifications, unreadCount }
  });
});

exports.markNotificationRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOne({
    where: { id: req.params.notificationId, userId: req.user.id }
  });
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  notification.status = 'read';
  notification.readAt = new Date();
  await notification.save();
  res.status(200).json({ status: 'success', data: { notification } });
});

exports.markAllNotificationsRead = catchAsync(async (req, res) => {
  await Notification.update(
    { status: 'read', readAt: new Date() },
    { where: { userId: req.user.id, status: { [Op.ne]: 'read' } } }
  );
  res.status(200).json({ status: 'success' });
});

exports.deleteNotification = catchAsync(async (req, res) => {
  await Notification.destroy({ where: { id: req.params.notificationId, userId: req.user.id } });
  res.status(204).json({ status: 'success' });
});

// ===== PREFERENCES =====
exports.getPreferences = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ['preferences'] });
  res.status(200).json({ status: 'success', data: { preferences: user?.preferences } });
});

exports.updatePreferences = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  user.preferences = req.body;
  await user.save();
  res.status(200).json({ status: 'success', data: { preferences: user.preferences } });
});

// ===== ACCOUNT MANAGEMENT =====
exports.deactivateAccount = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (user) {
    user.isActive = false;
    await user.save();
  }
  res.status(204).json({ status: 'success' });
});

exports.reactivateAccount = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (user) {
    user.isActive = true;
    await user.save();
  }
  res.status(200).json({ status: 'success' });
});

module.exports = exports;
