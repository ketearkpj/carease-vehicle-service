// ===== src/controllers/reportController.js =====
const { Op, fn, col, literal, sequelize } = require('sequelize');
const { Booking, Payment, User, Vehicle, Delivery, Review } = require('../Models');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');
const PDFDocument = require('pdfkit');
const { formatCurrency } = require('../Utils/Helpers');

let ExcelJS = null;
const getExcelJS = () => {
  if (!ExcelJS) {
    // Lazy-load so missing optional export deps do not break the whole API at startup.
    // Report export routes will surface a clear runtime error if the package is unavailable.
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    ExcelJS = require('exceljs');
  }
  return ExcelJS;
};

// ===== REVENUE REPORT =====
exports.getRevenueReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  if (!startDate || !endDate) {
    return next(new AppError('Please provide startDate and endDate', 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Revenue by time period
  const revenueByPeriod = await getRevenueByPeriod(start, end, groupBy);

  // Revenue by payment method
  const revenueByMethod = await Payment.findAll({
    attributes: [
      'method',
      [fn('SUM', col('amount')), 'total'],
      [fn('COUNT', col('id')), 'count']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] },
      status: 'completed'
    },
    group: ['method'],
    raw: true
  });

  // Revenue by service type
  const revenueByService = await Payment.findAll({
    attributes: [
      [sequelize.literal('Booking.service_type'), 'serviceType'],
      [fn('SUM', col('Payment.amount')), 'total'],
      [fn('COUNT', col('Payment.id')), 'count']
    ],
    include: [
      {
        model: Booking,
        as: 'booking',
        attributes: [],
        where: {
          status: 'completed',
          createdAt: { [Op.between]: [start, end] }
        },
        required: true
      }
    ],
    group: [sequelize.literal('Booking.service_type')],
    subQuery: false,
    raw: true
  });

  // Daily average
  const dailyAverage = revenueByPeriod.length > 0
    ? revenueByPeriod.reduce((sum, item) => sum + parseFloat(item.total || 0), 0) / revenueByPeriod.length
    : 0;

  // Totals
  const totals = await Payment.findOne({
    attributes: [
      [fn('SUM', col('amount')), 'totalRevenue'],
      [fn('COUNT', col('id')), 'totalTransactions'],
      [fn('AVG', col('amount')), 'averageTransaction']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] },
      status: 'completed'
    },
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      period: {
        start,
        end,
        groupBy
      },
      summary: {
        totalRevenue: parseFloat(totals?.totalRevenue || 0),
        totalTransactions: parseInt(totals?.totalTransactions || 0),
        averageTransaction: parseFloat(totals?.averageTransaction || 0)
      },
      dailyAverage,
      byPeriod: revenueByPeriod,
      byMethod: revenueByMethod,
      byService: revenueByService
    }
  });
});

// ===== BOOKINGS REPORT =====
exports.getBookingsReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  if (!startDate || !endDate) {
    return next(new AppError('Please provide startDate and endDate', 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Bookings by period
  const bookingsByPeriod = await getBookingsByPeriod(start, end, groupBy);

  // Bookings by status
  const bookingsByStatus = await Booking.findAll({
    attributes: [
      'status',
      [fn('COUNT', col('id')), 'count']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] }
    },
    group: ['status'],
    raw: true
  });

  // Bookings by service type
  const bookingsByService = await Booking.findAll({
    attributes: [
      'serviceType',
      [fn('COUNT', col('id')), 'count']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] }
    },
    group: ['serviceType'],
    raw: true
  });

  // Cancellation rate
  const { count: totalBookings } = await Booking.findAndCountAll({
    where: {
      createdAt: { [Op.between]: [start, end] }
    }
  });

  const { count: cancelledBookings } = await Booking.findAndCountAll({
    where: {
      createdAt: { [Op.between]: [start, end] },
      status: 'cancelled'
    }
  });

  const cancellationRate = totalBookings > 0 
    ? (cancelledBookings / totalBookings) * 100 
    : 0;

  // Peak hours (bookings created at which hours)
  const peakHours = await Booking.findAll({
    attributes: [
      [sequelize.literal('EXTRACT(HOUR FROM "createdAt")'), 'hour'],
      [fn('COUNT', col('id')), 'count']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] }
    },
    group: [sequelize.literal('EXTRACT(HOUR FROM "createdAt")')],
    order: [[sequelize.literal('count'), 'DESC']],
    limit: 5,
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      period: { start, end },
      summary: {
        total: totalBookings,
        cancelled: cancelledBookings,
        cancellationRate: cancellationRate.toFixed(2)
      },
      byPeriod: bookingsByPeriod,
      byStatus: bookingsByStatus,
      byService: bookingsByService,
      peakHours
    }
  });
});

// ===== USERS REPORT =====
exports.getUsersReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new AppError('Please provide startDate and endDate', 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // User growth over time
  const userGrowth = await User.findAll({
    attributes: [
      [sequelize.literal('DATE("createdAt")'), 'date'],
      [fn('COUNT', col('id')), 'count']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] }
    },
    group: [sequelize.literal('DATE("createdAt")')],
    order: [[sequelize.literal('DATE("createdAt")'), 'ASC']],
    raw: true
  });

  // Users by role
  const usersByRole = await User.findAll({
    attributes: [
      'role',
      [fn('COUNT', col('id')), 'count']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] }
    },
    group: ['role'],
    raw: true
  });

  // Users by status
  const { count: activeUsers } = await User.findAndCountAll({
    where: {
      createdAt: { [Op.between]: [start, end] },
      isActive: true
    }
  });

  const { count: inactiveUsers } = await User.findAndCountAll({
    where: {
      createdAt: { [Op.between]: [start, end] },
      isActive: false
    }
  });

  // New users
  const { count: newUsers } = await User.findAndCountAll({
    where: {
      createdAt: { [Op.between]: [start, end] }
    }
  });

  // Returning users (users with bookings)
  const returningUsers = await User.findAll({
    attributes: ['id'],
    include: [
      {
        model: Booking,
        as: 'bookings',
        attributes: [],
        required: true,
        where: {
          createdAt: { [Op.between]: [start, end] }
        }
      }
    ],
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      period: { start, end },
      summary: {
        newUsers,
        returningUsers: returningUsers.length,
        activeUsers,
        inactiveUsers
      },
      growth: userGrowth,
      byRole: usersByRole
    }
  });
});

// ===== VEHICLES REPORT =====
exports.getVehiclesReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new AppError('Please provide startDate and endDate', 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Fleet composition
  const fleetComposition = await Vehicle.findAll({
    attributes: [
      'category',
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', sequelize.literal('CASE WHEN "isAvailable" = true THEN 1 ELSE 0 END')), 'available']
    ],
    where: {
      createdAt: { [Op.lte]: end }
    },
    group: ['category'],
    raw: true
  });

  // Utilization rate
  const { count: totalVehicles } = await Vehicle.findAndCountAll();
  
  const bookedVehiclesData = await Booking.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('vehicleId'))), 'count']
    ],
    where: {
      startDate: { [Op.between]: [start, end] },
      status: { [Op.in]: ['confirmed', 'in_progress'] }
    },
    raw: true
  });

  const bookedVehicles = parseInt(bookedVehiclesData[0]?.count || 0);
  const utilizationRate = totalVehicles > 0 
    ? (bookedVehicles / totalVehicles) * 100 
    : 0;

  // Most popular vehicles
  const popularVehicles = await Booking.findAll({
    attributes: [
      'vehicleId',
      [fn('COUNT', col('id')), 'bookings'],
      [fn('SUM', col('totalPrice')), 'revenue']
    ],
    include: [
      {
        model: Vehicle,
        as: 'vehicle',
        attributes: ['id', 'name', 'make', 'model'],
        required: true
      }
    ],
    where: {
      createdAt: { [Op.between]: [start, end] },
      status: 'completed'
    },
    group: ['vehicleId'],
    order: [[sequelize.literal('bookings'), 'DESC']],
    limit: 10,
    subQuery: false,
    raw: true
  });

  // Average rental duration
  const avgDurationData = await sequelize.query(`
    SELECT AVG(EXTRACT(DAY FROM ("endDate" - "startDate"))) as average
    FROM "Bookings"
    WHERE "createdAt" BETWEEN :start AND :end
    AND "serviceType" = 'rental'
    AND status = 'completed'
  `, {
    replacements: { start, end },
    type: sequelize.QueryTypes.SELECT
  });

  res.status(200).json({
    status: 'success',
    data: {
      period: { start, end },
      summary: {
        totalVehicles,
        bookedVehicles,
        utilizationRate: utilizationRate.toFixed(2),
        averageRentalDuration: parseFloat(avgDurationData[0]?.average || 0).toFixed(1)
      },
      fleetComposition,
      popularVehicles
    }
  });
});

// ===== DELIVERIES REPORT =====
exports.getDeliveriesReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new AppError('Please provide startDate and endDate', 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Delivery status breakdown
  const statusBreakdown = await Delivery.findAll({
    attributes: [
      'status',
      [fn('COUNT', col('id')), 'count']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] }
    },
    group: ['status'],
    raw: true
  });

  // Delivery by type
  const byType = await Delivery.findAll({
    attributes: [
      'type',
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', col('totalAmount')), 'revenue']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] }
    },
    group: ['type'],
    raw: true
  });

  // Average delivery time (in minutes)
  const avgTimeData = await sequelize.query(`
    SELECT AVG(EXTRACT(EPOCH FROM ("estimatedDropoff" - "estimatedPickup")) / 60) as average
    FROM "Deliveries"
    WHERE "createdAt" BETWEEN :start AND :end
    AND status = 'delivered'
  `, {
    replacements: { start, end },
    type: sequelize.QueryTypes.SELECT
  });

  // On-time performance
  const onTimeData = await sequelize.query(`
    SELECT 
      COUNT(CASE WHEN "estimatedDropoff" >= "requestedDropoffDate" THEN 1 END) as onTime,
      COUNT(*) as total
    FROM "Deliveries"
    WHERE "createdAt" BETWEEN :start AND :end
    AND status = 'delivered'
  `, {
    replacements: { start, end },
    type: sequelize.QueryTypes.SELECT
  });

  const onTimeRate = onTimeData[0]?.total > 0 
    ? (onTimeData[0]?.onTime / onTimeData[0]?.total) * 100 
    : 0;

  // Total revenue from deliveries
  const revenueData = await Delivery.findOne({
    attributes: [
      [fn('SUM', col('totalAmount')), 'total'],
      [fn('COUNT', col('id')), 'count']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] },
      status: 'delivered'
    },
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      period: { start, end },
      summary: {
        total: parseInt(onTimeData[0]?.total || 0),
        onTime: parseInt(onTimeData[0]?.onTime || 0),
        onTimeRate: onTimeRate.toFixed(2),
        totalRevenue: parseFloat(revenueData?.total || 0),
        averageDeliveryTime: parseFloat(avgTimeData[0]?.average || 0).toFixed(1)
      },
      byStatus: statusBreakdown,
      byType,
      onTimePerformance: onTimeRate
    }
  });
});

// ===== EXPORT REPORT =====
exports.exportReport = catchAsync(async (req, res, next) => {
  const { type, format, startDate, endDate } = req.query;

  if (!type || !format || !startDate || !endDate) {
    return next(new AppError('Missing required parameters', 400));
  }

  let data;
  let filename;

  // Get report data based on type
  switch (type) {
    case 'revenue':
      data = await getRevenueExportData(startDate, endDate);
      filename = `revenue_report_${startDate}_to_${endDate}`;
      break;
    case 'bookings':
      data = await getBookingsExportData(startDate, endDate);
      filename = `bookings_report_${startDate}_to_${endDate}`;
      break;
    case 'users':
      data = await getUsersExportData(startDate, endDate);
      filename = `users_report_${startDate}_to_${endDate}`;
      break;
    case 'vehicles':
      data = await getVehiclesExportData(startDate, endDate);
      filename = `vehicles_report_${startDate}_to_${endDate}`;
      break;
    default:
      return next(new AppError('Invalid report type', 400));
  }

  // Generate file based on format
  let fileBuffer;
  let contentType;

  switch (format) {
    case 'csv':
      fileBuffer = await generateCSV(data);
      contentType = 'text/csv';
      filename += '.csv';
      break;
    case 'excel':
      fileBuffer = await generateExcel(data, type);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename += '.xlsx';
      break;
    case 'pdf':
      fileBuffer = await generatePDF(data, type);
      contentType = 'application/pdf';
      filename += '.pdf';
      break;
    default:
      return next(new AppError('Invalid export format', 400));
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(fileBuffer);
});

// ===== DASHBOARD SUMMARY =====
exports.getDashboardSummary = catchAsync(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  // Get all stats in parallel using Sequelize
  const [
    { count: todayBookings },
    { count: weekBookings },
    { count: monthBookings },
    todayRevenueData,
    weekRevenueData,
    monthRevenueData,
    { count: totalUsers },
    { count: newUsersToday },
    { count: activeVehicles },
    { count: pendingDeliveries }
  ] = await Promise.all([
    Booking.findAndCountAll({
      where: { createdAt: { [Op.gte]: today } }
    }),
    Booking.findAndCountAll({
      where: { createdAt: { [Op.gte]: weekAgo } }
    }),
    Booking.findAndCountAll({
      where: { createdAt: { [Op.gte]: monthAgo } }
    }),
    Payment.findOne({
      attributes: [[fn('SUM', col('amount')), 'total']],
      where: {
        createdAt: { [Op.gte]: today },
        status: 'completed'
      },
      raw: true
    }),
    Payment.findOne({
      attributes: [[fn('SUM', col('amount')), 'total']],
      where: {
        createdAt: { [Op.gte]: weekAgo },
        status: 'completed'
      },
      raw: true
    }),
    Payment.findOne({
      attributes: [[fn('SUM', col('amount')), 'total']],
      where: {
        createdAt: { [Op.gte]: monthAgo },
        status: 'completed'
      },
      raw: true
    }),
    User.findAndCountAll(),
    User.findAndCountAll({
      where: { createdAt: { [Op.gte]: today } }
    }),
    Vehicle.findAndCountAll({
      where: { isAvailable: true }
    }),
    Delivery.findAndCountAll({
      where: {
        status: { [Op.in]: ['assigned', 'en_route_pickup', 'picked_up'] }
      }
    })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings: {
        today: todayBookings,
        week: weekBookings,
        month: monthBookings
      },
      revenue: {
        today: parseFloat(todayRevenueData?.total || 0),
        week: parseFloat(weekRevenueData?.total || 0),
        month: parseFloat(monthRevenueData?.total || 0)
      },
      users: {
        total: totalUsers,
        newToday: newUsersToday
      },
      vehicles: {
        available: activeVehicles
      },
      deliveries: {
        pending: pendingDeliveries
      }
    }
  });
});

// ===== HELPER FUNCTIONS =====

const getRevenueByPeriod = async (start, end, groupBy) => {
  let dateFormat;
  switch (groupBy) {
    case 'hour':
      dateFormat = sequelize.literal('DATE_TRUNC(\'hour\', "createdAt")');
      break;
    case 'day':
      dateFormat = sequelize.literal('DATE_TRUNC(\'day\', "createdAt")');
      break;
    case 'week':
      dateFormat = sequelize.literal('DATE_TRUNC(\'week\', "createdAt")');
      break;
    case 'month':
      dateFormat = sequelize.literal('DATE_TRUNC(\'month\', "createdAt")');
      break;
    case 'year':
      dateFormat = sequelize.literal('DATE_TRUNC(\'year\', "createdAt")');
      break;
    default:
      dateFormat = sequelize.literal('DATE_TRUNC(\'day\', "createdAt")');
  }

  const results = await Payment.findAll({
    attributes: [
      [dateFormat, 'period'],
      [fn('SUM', col('amount')), 'total'],
      [fn('COUNT', col('id')), 'count']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] },
      status: 'completed'
    },
    group: [dateFormat],
    order: [[dateFormat, 'ASC']],
    raw: true
  });

  return results;
};

const getBookingsByPeriod = async (start, end, groupBy) => {
  let dateFormat;
  switch (groupBy) {
    case 'hour':
      dateFormat = sequelize.literal('DATE_TRUNC(\'hour\', "createdAt")');
      break;
    case 'day':
      dateFormat = sequelize.literal('DATE_TRUNC(\'day\', "createdAt")');
      break;
    case 'week':
      dateFormat = sequelize.literal('DATE_TRUNC(\'week\', "createdAt")');
      break;
    case 'month':
      dateFormat = sequelize.literal('DATE_TRUNC(\'month\', "createdAt")');
      break;
    default:
      dateFormat = sequelize.literal('DATE_TRUNC(\'day\', "createdAt")');
  }

  return await Booking.findAll({
    attributes: [
      [dateFormat, 'period'],
      [fn('COUNT', col('id')), 'total'],
      [sequelize.literal('COUNT(CASE WHEN status = \'confirmed\' THEN 1 END)'), 'confirmed'],
      [sequelize.literal('COUNT(CASE WHEN status = \'completed\' THEN 1 END)'), 'completed'],
      [sequelize.literal('COUNT(CASE WHEN status = \'cancelled\' THEN 1 END)'), 'cancelled']
    ],
    where: {
      createdAt: { [Op.between]: [start, end] }
    },
    group: [dateFormat],
    order: [[dateFormat, 'ASC']],
    raw: true
  });
};

const getRevenueExportData = async (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const payments = await Payment.findAll({
    attributes: [
      'paymentNumber',
      'createdAt',
      'amount',
      'method',
      'status',
      'transactionId'
    ],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['email']
      },
      {
        model: Booking,
        as: 'booking',
        attributes: ['bookingNumber']
      }
    ],
    where: {
      createdAt: { [Op.between]: [start, end] },
      status: 'completed'
    },
    order: [['createdAt', 'DESC']],
    raw: true
  });

  return payments.map(p => ({
    'Payment ID': p.paymentNumber,
    'Date': new Date(p.createdAt).toISOString(),
    'Customer': p['user.email'] || 'N/A',
    'Amount': p.amount,
    'Method': p.method,
    'Status': p.status,
    'Booking ID': p['booking.bookingNumber'] || 'N/A'
  }));
};

const getBookingsExportData = async (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const bookings = await Booking.findAll({
    attributes: ['bookingNumber', 'createdAt', 'serviceType', 'status', 'totalPrice'],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['email', 'firstName', 'lastName']
      },
      {
        model: Vehicle,
        as: 'vehicle',
        attributes: ['name']
      }
    ],
    where: {
      createdAt: { [Op.between]: [start, end] }
    },
    raw: true
  });

  return bookings.map(b => ({
    'Booking ID': b.bookingNumber,
    'Date': new Date(b.createdAt).toISOString(),
    'Customer': b['user.email'] || 'N/A',
    'Service': b.serviceType,
    'Status': b.status,
    'Total': b.totalPrice || 0,
    'Vehicle': b['vehicle.name'] || 'N/A'
  }));
};

const getUsersExportData = async (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const users = await User.findAll({
    attributes: ['firstName', 'lastName', 'email', 'phone', 'role', 'createdAt', 'lastLogin', 'isActive'],
    where: {
      createdAt: { [Op.between]: [start, end] }
    },
    raw: true
  });

  return users.map(u => ({
    'Name': `${u.firstName} ${u.lastName}`,
    'Email': u.email,
    'Phone': u.phone,
    'Role': u.role,
    'Joined': new Date(u.createdAt).toISOString(),
    'Last Login': u.lastLogin ? new Date(u.lastLogin).toISOString() : 'Never',
    'Status': u.isActive ? 'Active' : 'Inactive'
  }));
};

const getVehiclesExportData = async (startDate, endDate) => {
  const vehicles = await Vehicle.find();

  return vehicles.map(v => ({
    'Name': v.name,
    'Make': v.make,
    'Model': v.model,
    'Year': v.year,
    'Category': v.category,
    'Daily Rate': v.price.daily,
    'Status': v.availability.isAvailable ? 'Available' : 'Unavailable',
    'Location': v.location,
    'Rating': v.rating.average.toFixed(1)
  }));
};

const generateCSV = async (data) => {
  if (data.length === 0) return Buffer.from('');

  const headers = Object.keys(data[0]);
  const csvRows = [];

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]?.toString() || '';
      return `"${value.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  return Buffer.from(csvRows.join('\n'));
};

const generateExcel = async (data, type) => {
  const workbook = new (getExcelJS()).Workbook();
  const worksheet = workbook.addWorksheet(type);

  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key,
      key,
      width: 20
    }));

    worksheet.addRows(data);

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD4AF37' }
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

const generatePDF = async (data, type) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Title
    doc.fontSize(20).text(`${type.toUpperCase()} REPORT`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const columnWidth = 500 / headers.length;

      // Draw table headers
      let y = doc.y;
      headers.forEach((header, i) => {
        doc.fontSize(8).text(header, 50 + i * columnWidth, y, {
          width: columnWidth - 5,
          align: 'left'
        });
      });

      // Draw line under headers
      y += 15;
      doc.moveTo(50, y).lineTo(550, y).stroke();

      // Draw data rows
      data.slice(0, 30).forEach((row, rowIndex) => { // Limit to 30 rows for PDF
        y += 20;
        headers.forEach((header, i) => {
          const value = row[header]?.toString() || '';
          doc.fontSize(7).text(value.substring(0, 30), 50 + i * columnWidth, y, {
            width: columnWidth - 5,
            align: 'left'
          });
        });
      });
    }

    doc.end();
  });
};

module.exports = exports;
