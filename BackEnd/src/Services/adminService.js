// ===== src/services/adminService.js =====
const Admin = require('../Models/Admin');
const User = require('../Models/User');
const Booking = require('../Models/Booking');
const Payment = require('../Models/Payment');
const Vehicle = require('../Models/Vehicle');
const AuditLog = require('../Models/AuditLog');
const SystemSettings = require('../Models/SystemSettings');
const AppError = require('../Utils/AppError');
const { logger } = require('../Middleware/Logger.md.js');
const { sendEmail } = require('./emailService');
const { createNotification } = require('./notificationService');

// ===== ADMIN AUTHENTICATION =====
exports.adminLogin = async ({ email, password, ip, userAgent }) => {
  try {
    const admin = await Admin.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!admin) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if account is locked
    if (admin.isLocked()) {
      throw new AppError('Account is locked. Please try again later.', 423);
    }

    // Verify password
    const isPasswordValid = await admin.correctPassword(password);
    if (!isPasswordValid) {
      await admin.incLoginAttempts();
      throw new AppError('Invalid email or password', 401);
    }

    // Reset login attempts on success
    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = new Date();
    await admin.save();

    // Log activity
    await admin.logActivity('LOGIN', 'admin', admin._id, { ip, userAgent });

    // Generate token
    const token = admin.generateAuthToken();

    return { admin, token };
  } catch (error) {
    logger.error('Admin login failed:', error);
    throw error;
  }
};

// ===== CREATE ADMIN =====
exports.createAdmin = async (adminData, creatorId) => {
  try {
    // Check if email exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      throw new AppError('Email already exists', 400);
    }

    // Generate employee ID
    const employeeId = await generateEmployeeId();

    const admin = await Admin.create({
      ...adminData,
      employeeId,
      employment: {
        ...adminData.employment,
        startDate: new Date()
      }
    });

    // Log activity
    const creator = await Admin.findById(creatorId);
    await creator.logActivity('CREATE', 'admin', admin._id, { email: admin.email });

    // Send welcome email
    await sendAdminWelcomeEmail(admin);

    return admin;
  } catch (error) {
    logger.error('Create admin failed:', error);
    throw error;
  }
};

// ===== UPDATE ADMIN =====
exports.updateAdmin = async (adminId, updateData, updaterId) => {
  try {
    const admin = await Admin.findByIdAndUpdate(adminId, updateData, {
      new: true,
      runValidators: true
    }).select('-password -twoFactorSecret -backupCodes');

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    // Log activity
    const updater = await Admin.findById(updaterId);
    await updater.logActivity('UPDATE', 'admin', admin._id, updateData);

    return admin;
  } catch (error) {
    logger.error('Update admin failed:', error);
    throw error;
  }
};

// ===== DELETE ADMIN (SOFT DELETE) =====
exports.deleteAdmin = async (adminId, deleterId) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    // Soft delete
    admin.employment.status = 'terminated';
    admin.employment.endDate = new Date();
    await admin.save();

    // Log activity
    const deleter = await Admin.findById(deleterId);
    await deleter.logActivity('DELETE', 'admin', admin._id, { email: admin.email });

    return admin;
  } catch (error) {
    logger.error('Delete admin failed:', error);
    throw error;
  }
};

// ===== GET ALL ADMINS =====
exports.getAllAdmins = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt' } = pagination;
    const skip = (page - 1) * limit;

    const query = Admin.find(filters)
      .select('-password -twoFactorSecret -backupCodes')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const admins = await query;
    const total = await Admin.countDocuments(filters);

    return {
      admins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get all admins failed:', error);
    throw error;
  }
};

// ===== GET ADMIN BY ID =====
exports.getAdminById = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId)
      .select('-password -twoFactorSecret -backupCodes')
      .populate('assignedLocations');

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    return admin;
  } catch (error) {
    logger.error('Get admin by ID failed:', error);
    throw error;
  }
};

// ===== GET DASHBOARD STATS =====
exports.getDashboardStats = async (period = 'day') => {
  try {
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
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const [
      totalUsers,
      newUsers,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
      activeVehicles,
      onlineAdmins
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'completed', updatedAt: { $gte: startDate } }),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Vehicle.countDocuments({ 'availability.isAvailable': true }),
      Admin.countDocuments({ lastActivity: { $gte: new Date(Date.now() - 15 * 60 * 1000) } })
    ]);

    // Revenue chart data
    const revenueChart = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    // Booking chart data
    const bookingChart = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return {
      overview: {
        totalUsers,
        newUsers,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeVehicles,
        onlineAdmins
      },
      charts: {
        revenue: revenueChart,
        bookings: bookingChart
      }
    };
  } catch (error) {
    logger.error('Get dashboard stats failed:', error);
    throw error;
  }
};

// ===== GET AUDIT LOGS =====
exports.getAuditLogs = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 50, sort = '-timestamp' } = pagination;
    const skip = (page - 1) * limit;

    const query = AuditLog.find(filters)
      .populate('admin.id', 'firstName lastName email')
      .populate('user.id', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const logs = await query;
    const total = await AuditLog.countDocuments(filters);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get audit logs failed:', error);
    throw error;
  }
};

// ===== UPDATE SYSTEM SETTINGS =====
exports.updateSystemSettings = async (key, value, adminId, reason) => {
  try {
    const setting = await SystemSettings.set(key, value, adminId, reason);
    return setting;
  } catch (error) {
    logger.error('Update system settings failed:', error);
    throw error;
  }
};

// ===== GET SYSTEM SETTINGS =====
exports.getSystemSettings = async (category = null) => {
  try {
    if (category) {
      return SystemSettings.getByCategory(category);
    }
    return SystemSettings.find().sort('category group order');
  } catch (error) {
    logger.error('Get system settings failed:', error);
    throw error;
  }
};

// ===== SEND NOTIFICATION TO USERS =====
exports.sendNotificationToUsers = async (notificationData) => {
  try {
    const { recipients, type, title, message, data } = notificationData;

    let users = [];
    if (recipients === 'all') {
      users = await User.find({ isActive: true }).select('_id email');
    } else if (recipients.role) {
      users = await User.find({ role: recipients.role, isActive: true }).select('_id email');
    } else if (recipients.userIds) {
      users = await User.find({ _id: { $in: recipients.userIds } }).select('_id email');
    }

    const notifications = await Promise.all(
      users.map(user =>
        createNotification({
          recipient: { type: 'user', userId: user._id },
          type,
          title,
          message,
          data
        })
      )
    );

    return notifications;
  } catch (error) {
    logger.error('Send notification to users failed:', error);
    throw error;
  }
};

// ===== EXPORT DATA =====
exports.exportData = async ({ type, format, filters }) => {
  try {
    let data;
    switch (type) {
      case 'users':
        data = await User.find(filters).lean();
        break;
      case 'bookings':
        data = await Booking.find(filters)
          .populate('user', 'email firstName lastName')
          .populate('vehicle', 'name make model')
          .lean();
        break;
      case 'payments':
        data = await Payment.find(filters)
          .populate('user', 'email')
          .populate('booking')
          .lean();
        break;
      default:
        throw new AppError('Invalid export type', 400);
    }

    return data;
  } catch (error) {
    logger.error('Export data failed:', error);
    throw error;
  }
};

// ===== HELPER FUNCTIONS =====
const generateEmployeeId = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await Admin.countDocuments() + 1;
  return `EMP${year}${count.toString().padStart(4, '0')}`;
};

const sendAdminWelcomeEmail = async (admin) => {
  await sendEmail({
    to: admin.email,
    subject: 'Welcome to CAR EASE Admin Team',
    html: `
      <h1>Welcome, ${admin.firstName}!</h1>
      <p>You have been added as an administrator for CAR EASE.</p>
      <p>Your employee ID: <strong>${admin.employeeId}</strong></p>
      <p>Role: ${admin.role}</p>
      <p>Please log in to access the admin dashboard.</p>
    `
  });
};