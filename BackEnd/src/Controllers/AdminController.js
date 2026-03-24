// ===== src/controllers/adminController.js =====
const bcrypt = require('bcryptjs');
const { Op, fn, col, literal, QueryTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');
const { Admin, User, Booking, Payment, Vehicle, Delivery, AuditLog, SystemSettings, Notification } = require('../Models');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');
const APIFeatures = require('../Utils/APIFeatures');
const { sendEmail } = require('../Services/emailService');
const { createNotification } = require('../Services/notificationService');
const { generateToken } = require('../Utils/Helpers');

// ===== ADMIN AUTHENTICATION =====

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if admin exists && password is correct
  const admin = await Admin.findOne({
    where: { email, role: { [Op.in]: ['admin', 'super_admin'] } },
    attributes: { include: ['passwordHash', 'loginAttempts', 'lockUntil'] }
  });

  if (!admin || !(await admin.correctPassword(password))) {
    // Log failed attempt
    if (admin) {
      await admin.incLoginAttempts();
    }
    return next(new AppError('Incorrect email or password', 401));
  }

  // Check if account is locked
  if (admin.isLocked()) {
    return next(new AppError('Account is temporarily locked. Please try again later.', 423));
  }

  // Check if admin is active
  if (!admin.isActive) {
    return next(new AppError('Account is deactivated. Contact super admin.', 403));
  }

  // Reset login attempts on successful login
  admin.loginAttempts = 0;
  admin.lockUntil = null;
  admin.lastLogin = new Date();
  await admin.save();

  // Log activity
  await admin.logActivity('LOGIN', 'admin', admin.id, { method: 'password' }, req);

  // Generate token
  const token = generateToken(admin.id, 'admin');

  // Remove password from output
  admin.passwordHash = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      admin
    }
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  const admin = await Admin.findByPk(req.admin.id);

  if (admin) {
    await admin.logActivity('LOGOUT', 'admin', admin.id, {}, req);
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

exports.getProfile = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      admin: req.admin
    }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const admin = await User.findByPk(req.admin.id);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  const allowed = ['firstName', 'lastName', 'phone', 'profileImage'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      admin[field] = req.body[field];
    }
  });

  await admin.save();

  res.status(200).json({
    status: 'success',
    data: {
      admin
    }
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const admin = await User.findByPk(req.admin.id);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  const { currentPassword, newPassword } = req.body;
  const isValid = await admin.correctPassword(currentPassword);
  if (!isValid) {
    return next(new AppError('Current password is incorrect', 401));
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  admin.passwordChangedAt = new Date();
  await admin.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
});

// ===== ADMIN MANAGEMENT =====

exports.getAllAdmins = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: admins, count: total } = await Admin.findAndCountAll({
    ...options,
    where: { ...options.where, role: { [Op.in]: ['admin', 'super_admin'] } }
  });

  res.status(200).json({
    status: 'success',
    results: admins.length,
    total,
    data: {
      admins
    }
  });
});

exports.getAdmin = catchAsync(async (req, res, next) => {
  const admin = await Admin.findByPk(req.params.id);
  if (admin && !['admin', 'super_admin'].includes(admin.role)) {
    return next(new AppError('Admin not found', 404));
  }

  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      admin
    }
  });
});

exports.createAdmin = catchAsync(async (req, res, next) => {
  const adminData = req.body;

  // Check if email already exists
  const existingAdmin = await Admin.findOne({ where: { email: adminData.email } });
  if (existingAdmin) {
    return next(new AppError('Email already exists', 400));
  }

  if (!adminData.password || !adminData.passwordConfirm) {
    return next(new AppError('Password and confirmation are required', 400));
  }
  if (adminData.password !== adminData.passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  const passwordHash = await bcrypt.hash(adminData.password, 12);
  const admin = await Admin.create({
    ...adminData,
    passwordHash,
    role: adminData.role && ['admin', 'super_admin'].includes(adminData.role) ? adminData.role : 'admin'
  });

  // Log activity
  const creator = await Admin.findByPk(req.admin.id);
  await creator.logActivity('CREATE', 'admin', admin.id, { email: admin.email }, req);

  res.status(201).json({
    status: 'success',
    data: {
      admin
    }
  });
});

exports.updateAdmin = catchAsync(async (req, res, next) => {
  const admin = await Admin.findByPk(req.params.id);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }
  Object.assign(admin, req.body);
  await admin.save();

  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  // Log activity
  const updater = await Admin.findByPk(req.admin.id);
  await updater.logActivity('UPDATE', 'admin', admin.id, { updates: req.body }, req);

  res.status(200).json({
    status: 'success',
    data: {
      admin
    }
  });
});

exports.deleteAdmin = catchAsync(async (req, res, next) => {
  const admin = await Admin.findByPk(req.params.id);

  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  // Soft delete - just deactivate
  admin.employment = admin.employment || {};
  admin.employment.status = 'terminated';
  admin.employment.endDate = new Date();
  await admin.save();

  // Log activity
  const deleter = await Admin.findByPk(req.admin.id);
  await deleter.logActivity('DELETE', 'admin', admin.id, { email: admin.email }, req);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// ===== DASHBOARD STATISTICS =====

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const { period = 'day' } = req.query;

  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setHours(0, 0, 0, 0));
  }

  // Get counts
  const [
    totalUsers,
    newUsers,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalRevenue,
    activeVehicles,
    activeDeliveries
  ] = await Promise.all([
    User.count(),
    User.count({ where: { created_at: { [Op.gte]: startDate } } }),
    Booking.count(),
    Booking.count({ where: { status: 'pending' } }),
    Booking.count({ where: { status: 'completed', updated_at: { [Op.gte]: startDate } } }),
    Payment.sum('amount', { where: { status: 'completed', created_at: { [Op.gte]: startDate } } }),
    Vehicle.count({ where: { isAvailable: true } }),
    Delivery.count({ where: { status: { [Op.in]: ['assigned', 'en_route_pickup', 'picked_up', 'en_route_dropoff'] } } })
  ]);

  // Get revenue chart data
  const revenueChart = await getRevenueChartData(startDate, period);

  // Get booking chart data
  const bookingChart = await getBookingChartData(startDate, period);

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalUsers,
        newUsers,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue: totalRevenue || 0,
        activeVehicles,
        activeDeliveries
      },
      charts: {
        revenue: revenueChart,
        bookings: bookingChart
      }
    }
  });
});

// ===== USER MANAGEMENT =====

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: users, count: total } = await User.findAndCountAll({
    ...options
  });

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    include: [
      { model: Booking, as: 'bookings' },
      { model: Payment, as: 'payments' }
    ]
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    Object.assign(user, req.body);
    await user.save();
  }

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Log activity
  const admin = await Admin.findByPk(req.admin.id);
  await admin.logActivity('UPDATE', 'user', user.id, { updates: req.body }, req);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.toggleUserStatus = catchAsync(async (req, res, next) => {
  const { isActive, reason } = req.body;
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isActive = isActive;
  await user.save();

  // Send notification to user
  await sendUserStatusNotification(user, isActive, reason);

  // Log activity
  const admin = await Admin.findByPk(req.admin.id);
  await admin.logActivity(isActive ? 'ENABLE' : 'DISABLE', 'user', user.id, { reason }, req);

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// ===== BOOKING MANAGEMENT =====

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: bookings, count: total } = await Booking.findAndCountAll({
    ...options,
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
      { model: Vehicle, as: 'vehicle' }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    total,
    data: {
      bookings
    }
  });
});

exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address'] },
      { model: Vehicle, as: 'vehicle' },
      { model: Payment, as: 'payments' }
    ]
  });

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

exports.updateBookingStatus = catchAsync(async (req, res, next) => {
  const { status, note } = req.body;
  const booking = await Booking.findByPk(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  booking.status = status;
  const notes = Array.isArray(booking.notes) ? booking.notes : [];
  notes.push({
    text: note,
    type: 'admin',
    createdBy: req.admin.id,
    createdAt: new Date()
  });
  booking.notes = notes;

  await booking.save();

  // Send notification to user
  await sendBookingStatusNotification(booking, status, note);

  // Log activity
  const admin = await Admin.findByPk(req.admin.id);
  await admin.logActivity('UPDATE', 'booking', booking.id, { status, note }, req);

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// ===== PAYMENT MANAGEMENT =====

exports.getAllPayments = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: payments, count: total } = await Payment.findAndCountAll({
    ...options,
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Booking, as: 'booking' }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: payments.length,
    total,
    data: {
      payments
    }
  });
});

exports.getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Booking, as: 'booking' }
    ]
  });

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});

exports.processRefund = catchAsync(async (req, res, next) => {
  const { amount, reason } = req.body;
  const payment = await Payment.findByPk(req.params.id);

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Process refund through payment gateway
  const refundAmount = amount || payment.amount;
  const refunds = Array.isArray(payment.refunds) ? payment.refunds : [];
  refunds.push({
    amount: refundAmount,
    reason,
    status: 'completed',
    createdBy: req.admin.id,
    createdAt: new Date()
  });
  payment.refunds = refunds;
  payment.status = refundAmount === payment.amount ? 'refunded' : 'partially_refunded';
  await payment.save();
  const refund = { amount: refundAmount, reason };

  // Send notification to user
  await sendRefundNotification(payment, refund);

  // Log activity
  const admin = await Admin.findByPk(req.admin.id);
  await admin.logActivity('REFUND', 'payment', payment.id, { amount, reason }, req);

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});

// ===== REPORTS =====

exports.getRevenueReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  const formatMap = {
    day: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY'
  };
  const format = formatMap[groupBy] || 'YYYY-MM-DD';

  const revenue = await Payment.findAll({
    attributes: [
      [fn('to_char', col('created_at'), format), 'period'],
      [fn('sum', col('amount')), 'total']
    ],
    where: {
      status: 'completed',
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) }
    },
    group: [literal(`to_char(created_at, '${format}')`)],
    order: [[literal(`to_char(created_at, '${format}')`), 'ASC']],
    raw: true
  });

  const byMethod = await Payment.findAll({
    attributes: [
      ['method', 'method'],
      [fn('sum', col('amount')), 'total']
    ],
    where: {
      status: 'completed',
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) }
    },
    group: ['method'],
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      revenue,
      byMethod
    }
  });
});

exports.getBookingReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const bookings = await Booking.findAll({
    attributes: [
      [fn('sum', col('total_amount')), 'totalRevenue'],
      [fn('count', col('id')), 'count']
    ],
    where: { created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) } },
    raw: true
  });

  const byStatus = await Booking.findAll({
    attributes: [
      ['status', 'status'],
      [fn('count', col('id')), 'count']
    ],
    where: { created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) } },
    group: ['status'],
    raw: true
  });

  const byService = await Booking.findAll({
    attributes: [
      ['service_type', 'serviceType'],
      [fn('count', col('id')), 'count']
    ],
    where: { created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) } },
    group: ['service_type'],
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      byStatus,
      byService
    }
  });
});

// ===== AUDIT LOGS =====

exports.getAuditLogs = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: logs, count: total } = await AuditLog.findAndCountAll({
    ...options,
    include: [{ model: User, as: 'admin', attributes: ['id', 'firstName', 'lastName', 'email'] }]
  });

  res.status(200).json({
    status: 'success',
    results: logs.length,
    total,
    data: {
      logs
    }
  });
});

exports.getAuditSummary = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const byAction = await AuditLog.findAll({
    attributes: [
      ['action', 'action'],
      [fn('count', col('id')), 'count']
    ],
    where: { created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) } },
    group: ['action'],
    raw: true
  });

  const byEntity = await AuditLog.findAll({
    attributes: [
      ['entity_type', 'entityType'],
      [fn('count', col('id')), 'count']
    ],
    where: { created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) } },
    group: ['entity_type'],
    raw: true
  });

  const interval = req.query.interval || 'hour';
  const format = interval === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH24:00';
  const timeline = await AuditLog.findAll({
    attributes: [
      [fn('to_char', col('created_at'), format), 'period'],
      [fn('count', col('id')), 'count']
    ],
    where: { created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) } },
    group: [literal(`to_char(created_at, '${format}')`)],
    order: [[literal(`to_char(created_at, '${format}')`), 'ASC']],
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      byAction,
      byEntity,
      timeline
    }
  });
});

// ===== SYSTEM SETTINGS =====

exports.getSettings = catchAsync(async (req, res, next) => {
  const { category } = req.query;

  const settings = await SystemSettings.findAll({
    where: category ? { category } : {},
    order: [['category', 'ASC'], ['group_name', 'ASC'], ['display_order', 'ASC']]
  });

  res.status(200).json({
    status: 'success',
    data: {
      settings
    }
  });
});

exports.updateSetting = catchAsync(async (req, res, next) => {
  const { key } = req.params;
  const { value, reason } = req.body;

  let setting = await SystemSettings.findOne({ where: { key } });
  if (!setting) {
    setting = await SystemSettings.create({
      key,
      category: req.body.category || 'general',
      value,
      updatedBy: req.admin.id,
      description: reason || null
    });
  } else {
    setting.value = value;
    setting.updatedBy = req.admin.id;
    await setting.save();
  }

  // Log activity
  const admin = await Admin.findByPk(req.admin.id);
  await admin.logActivity('UPDATE', 'settings', setting.id, { key, value }, req);

  res.status(200).json({
    status: 'success',
    data: {
      setting
    }
  });
});

exports.resetSetting = catchAsync(async (req, res, next) => {
  const { key } = req.params;

  const setting = await SystemSettings.findOne({ where: { key } });
  if (!setting) {
    return next(new AppError('Setting not found', 404));
  }
  setting.value = setting.defaultValue;
  setting.updatedBy = req.admin.id;
  await setting.save();

  // Log activity
  const admin = await Admin.findByPk(req.admin.id);
  await admin.logActivity('UPDATE', 'settings', setting.id, { key, action: 'reset' }, req);

  res.status(200).json({
    status: 'success',
    data: {
      setting
    }
  });
});

// ===== NOTIFICATIONS =====

exports.sendNotification = catchAsync(async (req, res, next) => {
  const { recipient, type, title, message, data } = req.body;

  const notification = await createNotification({
    userId: recipient?.userId,
    type,
    title,
    message,
    data
  });

  res.status(201).json({
    status: 'success',
    data: {
      notification
    }
  });
});

exports.getNotifications = catchAsync(async (req, res, next) => {
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 25, 100));

  const [bookings, payments, subscriptions, inquiries] = await Promise.all([
    Booking.findAll({
      attributes: [
        'id',
        'bookingNumber',
        'serviceType',
        'status',
        'customerFirstName',
        'customerLastName',
        [col('created_at'), 'createdAt']
      ],
      order: [['created_at', 'DESC']],
      limit
    }),
    Payment.findAll({
      attributes: [
        'id',
        'paymentNumber',
        'amount',
        'method',
        'status',
        [col('created_at'), 'createdAt']
      ],
      order: [['created_at', 'DESC']],
      limit
    }),
    sequelize.query(
      `
        SELECT email, is_active AS "isActive", subscribed_at AS "subscribedAt", unsubscribed_at AS "unsubscribedAt", updated_at AS "updatedAt"
        FROM newsletter_subscribers
        ORDER BY updated_at DESC
        LIMIT :limit
      `,
      { replacements: { limit }, type: QueryTypes.SELECT }
    ).catch(() => []),
    sequelize.query(
      `
        SELECT id, name, email, subject, status, created_at AS "createdAt"
        FROM contact_inquiries
        ORDER BY created_at DESC
        LIMIT :limit
      `,
      { replacements: { limit }, type: QueryTypes.SELECT }
    ).catch(() => [])
  ]);

  const bookingNotifications = bookings.map((item) => ({
    id: `booking-${item.id}`,
    type: 'booking',
    title: 'New booking',
    message: `Booking ${item.bookingNumber} created for ${item.serviceType}.`,
    status: item.status,
    createdAt: item.createdAt || item.dataValues?.createdAt || item.get?.('createdAt') || item.created_at
  }));

  const paymentNotifications = payments.map((item) => ({
    id: `payment-${item.id}`,
    type: 'payment',
    title: 'Payment update',
    message: `Payment ${item.paymentNumber} is ${item.status} (${item.method}, ${item.amount}).`,
    status: item.status,
    createdAt: item.createdAt || item.dataValues?.createdAt || item.get?.('createdAt') || item.created_at
  }));

  const subscriptionNotifications = subscriptions.map((item) => ({
    id: `subscription-${item.email}-${item.updatedAt}`,
    type: 'subscription',
    title: item.isActive ? 'New subscription' : 'Unsubscription',
    message: `${item.email} ${item.isActive ? 'subscribed' : 'unsubscribed'} to newsletter updates.`,
    status: item.isActive ? 'active' : 'inactive',
    createdAt: item.updatedAt || item.subscribedAt || item.unsubscribedAt
  }));

  const inquiryNotifications = inquiries.map((item) => ({
    id: `inquiry-${item.id}`,
    type: 'inquiry',
    title: 'New inquiry',
    message: `${item.name} sent an inquiry: ${item.subject}.`,
    status: item.status,
    createdAt: item.createdAt
  }));

  const notifications = [
    ...bookingNotifications,
    ...paymentNotifications,
    ...subscriptionNotifications,
    ...inquiryNotifications
  ]
    .filter((n) => n.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  const total = notifications.length;

  res.status(200).json({
    status: 'success',
    results: total,
    total,
    data: {
      notifications
    }
  });
});

// ===== EXPORT DATA =====

exports.exportData = catchAsync(async (req, res, next) => {
  const type = req.params.type || req.query.type;
  const { format = 'csv', startDate, endDate } = req.query;

  let data;
  let filename;

  switch (type) {
    case 'users':
      data = await User.findAll({
        where: { created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) } }
      });
      filename = `users_export_${Date.now()}`;
      break;

    case 'bookings':
      data = await Booking.findAll({
        where: { created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) } },
        include: [
          { model: User, as: 'user', attributes: ['email'] },
          { model: Vehicle, as: 'vehicle', attributes: ['name'] }
        ]
      });
      filename = `bookings_export_${Date.now()}`;
      break;

    case 'payments':
      data = await Payment.findAll({
        where: { created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) } },
        include: [{ model: User, as: 'user', attributes: ['email'] }]
      });
      filename = `payments_export_${Date.now()}`;
      break;

    case 'vehicles':
      data = await Vehicle.findAll();
      filename = `vehicles_export_${Date.now()}`;
      break;

    default:
      return next(new AppError('Invalid export type', 400));
  }

  // Generate export file (CSV, Excel, PDF)
  const file = await generateExportFile(data, format);

  // Log activity
  const admin = await Admin.findByPk(req.admin.id);
  await admin.logActivity('EXPORT', type, null, { format, count: data.length }, req);

  res.setHeader('Content-Type', getContentType(format));
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.${format}`);
  res.send(file);
});

// ===== HELPER FUNCTIONS =====

const getRevenueChartData = async (startDate, period) => {
  const formatMap = {
    day: 'YYYY-MM-DD HH24:00',
    week: 'YYYY-MM-DD',
    month: 'YYYY-MM-DD',
    year: 'YYYY-MM'
  };
  const format = formatMap[period] || 'YYYY-MM-DD';

  const data = await Payment.findAll({
    attributes: [
      [fn('to_char', col('created_at'), format), 'period'],
      [fn('sum', col('amount')), 'total'],
      [fn('count', col('id')), 'count']
    ],
    where: {
      created_at: { [Op.gte]: startDate },
      status: 'completed'
    },
    group: [literal(`to_char(created_at, '${format}')`)],
    order: [[literal(`to_char(created_at, '${format}')`), 'ASC']],
    raw: true
  });

  return {
    labels: data.map(d => d.period),
    values: data.map(d => d.total)
  };
};

const getBookingChartData = async (startDate, period) => {
  const formatMap = {
    day: 'YYYY-MM-DD HH24:00',
    week: 'YYYY-MM-DD',
    month: 'YYYY-MM-DD',
    year: 'YYYY-MM'
  };
  const format = formatMap[period] || 'YYYY-MM-DD';

  const data = await Booking.findAll({
    attributes: [
      [fn('to_char', col('created_at'), format), 'period'],
      [fn('count', col('id')), 'count'],
      [fn('sum', literal(`CASE WHEN status = 'completed' THEN 1 ELSE 0 END`)), 'completed'],
      [fn('sum', literal(`CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END`)), 'cancelled']
    ],
    where: { created_at: { [Op.gte]: startDate } },
    group: [literal(`to_char(created_at, '${format}')`)],
    order: [[literal(`to_char(created_at, '${format}')`), 'ASC']],
    raw: true
  });

  return {
    labels: data.map(d => d.period),
    total: data.map(d => d.count),
    completed: data.map(d => d.completed),
    cancelled: data.map(d => d.cancelled)
  };
};

const sendUserStatusNotification = async (user, isActive, reason) => {
  const subject = isActive ? 'Account Reactivated' : 'Account Deactivated';
  const message = isActive
    ? 'Your account has been reactivated. You can now log in and use our services.'
    : `Your account has been deactivated. Reason: ${reason || 'No reason provided'}`;

  await sendEmail({
    to: user.email,
    subject: `CAR EASE - ${subject}`,
    html: generateEmailTemplate(subject, message)
  });
};

const sendBookingStatusNotification = async (booking, status, note) => {
  const user = await User.findByPk(booking.userId);
  if (!user) return;

  const statusMessages = {
    confirmed: 'Your booking has been confirmed',
    processing: 'Your booking is being processed',
    completed: 'Your booking has been completed',
    cancelled: 'Your booking has been cancelled'
  };

  await sendEmail({
    to: user.email,
    subject: `CAR EASE - Booking ${status}`,
    html: generateBookingEmail(booking, statusMessages[status] || `Status updated to ${status}`, note)
  });
};

const sendRefundNotification = async (payment, refund) => {
  const user = await User.findByPk(payment.userId);
  if (!user) return;

  await sendEmail({
    to: user.email,
    subject: 'CAR EASE - Refund Processed',
    html: generateRefundEmail(payment, refund)
  });
};

const generateExportFile = async (data, format) => {
  // Implementation would use appropriate library (csv-writer, exceljs, pdfkit)
  return Buffer.from(JSON.stringify(data));
};

const getContentType = (format) => {
  const types = {
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf',
    json: 'application/json'
  };
  return types[format] || 'application/octet-stream';
};

module.exports = exports;
