// ===== src/services/reportService.js =====
const Booking = require('../Models/Booking');
const Payment = require('../Models/Payment');
const User = require('../Models/User');
const Vehicle = require('../Models/Vehicle');
const Delivery = require('../Models/Delivery');
const AppError = require('../Utils/AppError');
const { logger } = require('../Middleware/Logger.md.js');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// ===== GENERATE REVENUE REPORT =====
exports.generateRevenueReport = async ({ startDate, endDate, groupBy = 'day' }) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Revenue by period
    const byPeriod = await getRevenueByPeriod(start, end, groupBy);

    // Revenue by payment method
    const byMethod = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$method',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue by service type
    const byService = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'booking',
          as: 'payment'
        }
      },
      { $unwind: '$payment' },
      {
        $group: {
          _id: '$serviceType',
          total: { $sum: '$payment.amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily average
    const dailyAverage = byPeriod.length > 0
      ? byPeriod.reduce((sum, item) => sum + item.total, 0) / byPeriod.length
      : 0;

    // Totals
    const totals = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      }
    ]);

    return {
      period: { start, end },
      summary: totals[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransaction: 0
      },
      dailyAverage,
      byPeriod,
      byMethod,
      byService
    };
  } catch (error) {
    logger.error('Generate revenue report failed:', error);
    throw error;
  }
};

// ===== GENERATE BOOKINGS REPORT =====
exports.generateBookingsReport = async ({ startDate, endDate, groupBy = 'day' }) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Bookings by period
    const byPeriod = await getBookingsByPeriod(start, end, groupBy);

    // Bookings by status
    const byStatus = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Bookings by service type
    const byService = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Cancellation rate
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    const cancelledBookings = await Booking.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'cancelled'
    });

    const cancellationRate = totalBookings > 0
      ? (cancelledBookings / totalBookings) * 100
      : 0;

    // Peak hours
    const peakHours = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $hour: '$dates.startDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return {
      period: { start, end },
      summary: {
        total: totalBookings,
        cancelled: cancelledBookings,
        cancellationRate: cancellationRate.toFixed(2)
      },
      byPeriod,
      byStatus,
      byService,
      peakHours
    };
  } catch (error) {
    logger.error('Generate bookings report failed:', error);
    throw error;
  }
};

// ===== GENERATE USERS REPORT =====
exports.generateUsersReport = async ({ startDate, endDate }) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // User growth over time
    const growth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Users by role
    const byRole = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Users by location
    const byLocation = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          'address.city': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$address.city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // User acquisition
    const newUsers = await User.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    // Returning users (have bookings)
    const returningUsers = await Booking.distinct('user', {
      createdAt: { $gte: start, $lte: end }
    }).countDocuments();

    // Active vs inactive
    const activeUsers = await User.countDocuments({
      createdAt: { $gte: start, $lte: end },
      isActive: true
    });

    const inactiveUsers = await User.countDocuments({
      createdAt: { $gte: start, $lte: end },
      isActive: false
    });

    return {
      period: { start, end },
      summary: {
        newUsers,
        returningUsers,
        activeUsers,
        inactiveUsers
      },
      growth,
      byRole,
      byLocation
    };
  } catch (error) {
    logger.error('Generate users report failed:', error);
    throw error;
  }
};

// ===== GENERATE VEHICLES REPORT =====
exports.generateVehiclesReport = async ({ startDate, endDate }) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fleet composition
    const composition = await Vehicle.aggregate([
      {
        $match: {
          createdAt: { $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$availability.isAvailable', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Utilization rate
    const totalVehicles = await Vehicle.countDocuments();
    const bookedVehicles = await Booking.distinct('vehicle', {
      'dates.startDate': { $gte: start, $lte: end },
      status: { $in: ['confirmed', 'in_progress'] }
    }).countDocuments();

    const utilizationRate = totalVehicles > 0
      ? (bookedVehicles / totalVehicles) * 100
      : 0;

    // Most popular vehicles
    const popularVehicles = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$vehicle',
          bookings: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicle'
        }
      },
      { $unwind: '$vehicle' },
      {
        $project: {
          'vehicle.name': 1,
          'vehicle.make': 1,
          'vehicle.model': 1,
          bookings: 1,
          revenue: 1
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    // Average rental duration
    const avgDuration = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          serviceType: 'rental',
          status: 'completed'
        }
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ['$dates.endDate', '$dates.startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$duration' }
        }
      }
    ]);

    return {
      period: { start, end },
      summary: {
        totalVehicles,
        bookedVehicles,
        utilizationRate: utilizationRate.toFixed(2),
        averageRentalDuration: avgDuration[0]?.average.toFixed(1) || 0
      },
      composition,
      popularVehicles
    };
  } catch (error) {
    logger.error('Generate vehicles report failed:', error);
    throw error;
  }
};

// ===== GENERATE DELIVERIES REPORT =====
exports.generateDeliveriesReport = async ({ startDate, endDate }) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Status breakdown
    const byStatus = await Delivery.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // By type
    const byType = await Delivery.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      }
    ]);

    // Average delivery time
    const avgTime = await Delivery.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'delivered',
          'schedule.actualPickup': { $exists: true },
          'schedule.actualDropoff': { $exists: true }
        }
      },
      {
        $project: {
          deliveryTime: {
            $divide: [
              { $subtract: ['$schedule.actualDropoff', '$schedule.actualPickup'] },
              1000 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$deliveryTime' }
        }
      }
    ]);

    // On-time performance
    const onTimeDeliveries = await Delivery.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'delivered',
      $expr: { $lte: ['$schedule.actualDropoff', '$schedule.estimatedDropoff'] }
    });

    const totalDeliveries = await Delivery.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'delivered'
    });

    const onTimeRate = totalDeliveries > 0
      ? (onTimeDeliveries / totalDeliveries) * 100
      : 0;

    return {
      period: { start, end },
      summary: {
        total: totalDeliveries,
        onTime: onTimeDeliveries,
        onTimeRate: onTimeRate.toFixed(2),
        averageDeliveryTime: avgTime[0]?.average.toFixed(0) || 0
      },
      byStatus,
      byType
    };
  } catch (error) {
    logger.error('Generate deliveries report failed:', error);
    throw error;
  }
};

// ===== EXPORT REPORT =====
exports.exportReport = async ({ type, format, startDate, endDate }) => {
  try {
    let data;
    let reportData;

    // Get report data
    switch (type) {
      case 'revenue':
        reportData = await exports.generateRevenueReport({ startDate, endDate });
        data = await getRevenueExportData(startDate, endDate);
        break;
      case 'bookings':
        reportData = await exports.generateBookingsReport({ startDate, endDate });
        data = await getBookingsExportData(startDate, endDate);
        break;
      case 'users':
        reportData = await exports.generateUsersReport({ startDate, endDate });
        data = await getUsersExportData(startDate, endDate);
        break;
      case 'vehicles':
        reportData = await exports.generateVehiclesReport({ startDate, endDate });
        data = await getVehiclesExportData(startDate, endDate);
        break;
      case 'deliveries':
        reportData = await exports.generateDeliveriesReport({ startDate, endDate });
        data = await getDeliveriesExportData(startDate, endDate);
        break;
      default:
        throw new AppError('Invalid report type', 400);
    }

    // Generate file
    let fileBuffer;
    let contentType;
    let filename = `${type}_report_${startDate}_to_${endDate}`;

    switch (format) {
      case 'csv':
        fileBuffer = await generateCSV(data);
        contentType = 'text/csv';
        filename += '.csv';
        break;
      case 'excel':
        fileBuffer = await generateExcel(data, type, reportData);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename += '.xlsx';
        break;
      case 'pdf':
        fileBuffer = await generatePDF(data, type, reportData);
        contentType = 'application/pdf';
        filename += '.pdf';
        break;
      default:
        throw new AppError('Invalid export format', 400);
    }

    return {
      buffer: fileBuffer,
      contentType,
      filename
    };
  } catch (error) {
    logger.error('Export report failed:', error);
    throw error;
  }
};

// ===== GET DASHBOARD SUMMARY =====
exports.getDashboardSummary = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [
      todayBookings,
      weekBookings,
      monthBookings,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalUsers,
      newUsersToday,
      activeVehicles,
      pendingDeliveries,
      onlineAdmins
    ] = await Promise.all([
      Booking.countDocuments({ createdAt: { $gte: today } }),
      Booking.countDocuments({ createdAt: { $gte: weekAgo } }),
      Booking.countDocuments({ createdAt: { $gte: monthAgo } }),
      Payment.aggregate([
        { $match: { createdAt: { $gte: today }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { createdAt: { $gte: weekAgo }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { createdAt: { $gte: monthAgo }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      Vehicle.countDocuments({ 'availability.isAvailable': true }),
      Delivery.countDocuments({
        status: { $in: ['assigned', 'en_route_pickup', 'picked_up'] }
      }),
      Admin.countDocuments({ lastActivity: { $gte: new Date(Date.now() - 15 * 60 * 1000) } })
    ]);

    return {
      bookings: {
        today: todayBookings,
        week: weekBookings,
        month: monthBookings
      },
      revenue: {
        today: todayRevenue[0]?.total || 0,
        week: weekRevenue[0]?.total || 0,
        month: monthRevenue[0]?.total || 0
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
      },
      admins: {
        online: onlineAdmins
      }
    };
  } catch (error) {
    logger.error('Get dashboard summary failed:', error);
    throw error;
  }
};

// ===== HELPER FUNCTIONS =====

const getRevenueByPeriod = async (start, end, groupBy) => {
  let groupFormat;
  switch (groupBy) {
    case 'hour':
      groupFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' } };
      break;
    case 'day':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case 'week':
      groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
      break;
    case 'month':
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      break;
    default:
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  return await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: groupFormat,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

const getBookingsByPeriod = async (start, end, groupBy) => {
  let groupFormat;
  switch (groupBy) {
    case 'hour':
      groupFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' } };
      break;
    case 'day':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case 'week':
      groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
      break;
    case 'month':
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      break;
    default:
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  return await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: groupFormat,
        total: { $sum: 1 },
        confirmed: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

const getRevenueExportData = async (startDate, endDate) => {
  const payments = await Payment.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    status: 'completed'
  })
    .populate('user', 'email')
    .populate('booking')
    .sort('-createdAt');

  return payments.map(p => ({
    'Payment ID': p.paymentNumber,
    'Date': p.createdAt.toLocaleString(),
    'Customer': p.user?.email || 'N/A',
    'Amount': p.amount,
    'Method': p.method,
    'Status': p.status,
    'Booking ID': p.booking?.bookingNumber || 'N/A'
  }));
};

const getBookingsExportData = async (startDate, endDate) => {
  const bookings = await Booking.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  })
    .populate('user', 'email')
    .populate('vehicle', 'name');

  return bookings.map(b => ({
    'Booking ID': b.bookingNumber,
    'Date': b.createdAt.toLocaleString(),
    'Customer': b.customerInfo?.email || b.user?.email || 'N/A',
    'Service': b.serviceType,
    'Status': b.status,
    'Total': b.pricing?.total || 0,
    'Vehicle': b.vehicle?.name || 'N/A'
  }));
};

const getUsersExportData = async (startDate, endDate) => {
  const users = await User.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  return users.map(u => ({
    'Name': `${u.firstName} ${u.lastName}`,
    'Email': u.email,
    'Phone': u.phone,
    'Role': u.role,
    'Joined': u.createdAt.toLocaleString(),
    'Last Login': u.lastLogin?.toLocaleString() || 'Never',
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

const getDeliveriesExportData = async (startDate, endDate) => {
  const deliveries = await Delivery.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  })
    .populate('user', 'email')
    .populate('driver.id', 'firstName lastName');

  return deliveries.map(d => ({
    'Delivery ID': d.deliveryNumber,
    'Date': d.createdAt.toLocaleString(),
    'Customer': d.user?.email || 'N/A',
    'Type': d.type,
    'Status': d.status,
    'Driver': d.driver?.name || 'Unassigned',
    'Total': d.pricing?.total || 0
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

const generateExcel = async (data, reportType, summary) => {
  const workbook = new ExcelJS.Workbook();

  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 }
  ];

  if (summary.summary) {
    Object.entries(summary.summary).forEach(([key, value]) => {
      summarySheet.addRow({ metric: key, value });
    });
  }

  // Data sheet
  const dataSheet = workbook.addWorksheet(reportType);
  if (data.length > 0) {
    dataSheet.columns = Object.keys(data[0]).map(key => ({
      header: key,
      key,
      width: 20
    }));

    dataSheet.addRows(data);

    // Style header row
    dataSheet.getRow(1).font = { bold: true };
    dataSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD4AF37' }
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

const generatePDF = async (data, reportType, summary) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Title
    doc.fontSize(20)
       .fillColor('#d4af37')
       .text(`${reportType.toUpperCase()} REPORT`, { align: 'center' });

    doc.moveDown();
    doc.fontSize(10)
       .fillColor('#000000')
       .text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });

    doc.moveDown();

    // Summary
    if (summary.summary) {
      doc.fontSize(14).fillColor('#d4af37').text('Summary', { underline: true });
      doc.moveDown(0.5);

      Object.entries(summary.summary).forEach(([key, value]) => {
        doc.fontSize(10)
           .fillColor('#000000')
           .text(`${key}: ${value}`, { continued: false });
      });
      doc.moveDown();
    }

    // Data table
    if (data.length > 0) {
      doc.fontSize(14).fillColor('#d4af37').text('Details', { underline: true });
      doc.moveDown(0.5);

      const headers = Object.keys(data[0]);
      const columnWidth = 500 / headers.length;
      let y = doc.y;

      // Headers
      headers.forEach((header, i) => {
        doc.fontSize(8)
           .fillColor('#000000')
           .text(header, 50 + i * columnWidth, y, {
             width: columnWidth - 5,
             align: 'left'
           });
      });

      y += 15;
      doc.moveTo(50, y).lineTo(550, y).stroke();

      // Data rows (limit to 30 for PDF)
      data.slice(0, 30).forEach((row, rowIndex) => {
        y += 20;
        headers.forEach((header, i) => {
          const value = row[header]?.toString() || '';
          doc.fontSize(7)
             .text(value.substring(0, 30), 50 + i * columnWidth, y, {
               width: columnWidth - 5,
               align: 'left'
             });
        });
      });
    }

    doc.end();
  });
};