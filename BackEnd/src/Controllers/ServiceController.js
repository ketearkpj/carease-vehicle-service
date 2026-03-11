// ===== src/controllers/serviceController.js =====
const { Op, fn, col, literal } = require('sequelize');
const { Service, Booking, Review, User } = require('../Models');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');
const APIFeatures = require('../Utils/APIFeatures');

// ===== CREATE SERVICE =====
exports.createService = catchAsync(async (req, res, next) => {
  const service = await Service.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      service
    }
  });
});

// ===== GET ALL SERVICES =====
exports.getAllServices = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: services, count: total } = await Service.findAndCountAll({
    ...options,
    include: [{ model: Review, as: 'reviews' }]
  });

  res.status(200).json({
    status: 'success',
    results: services.length,
    total,
    data: {
      services
    }
  });
});

// ===== GET SERVICES BY TYPE =====
exports.getServicesByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  const services = await Service.findAll({ where: { type } });

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services
    }
  });
});

// ===== GET FEATURED SERVICES =====
exports.getFeaturedServices = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 4;
  const services = await Service.findAll({
    where: { isFeatured: true, isAvailable: true },
    order: [['view_count', 'DESC']],
    limit: Number(limit)
  });

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services
    }
  });
});

// ===== GET SERVICE BY ID =====
exports.getService = catchAsync(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id, {
    include: [{
      model: Review,
      as: 'reviews',
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage'] }]
    }]
  });

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  // Increment view count
  service.viewCount += 1;
  await service.save();

  res.status(200).json({
    status: 'success',
    data: {
      service
    }
  });
});

// ===== UPDATE SERVICE =====
exports.updateService = catchAsync(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }
  Object.assign(service, req.body);
  await service.save();

  res.status(200).json({
    status: 'success',
    data: {
      service
    }
  });
});

// ===== DELETE SERVICE =====
exports.deleteService = catchAsync(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  service.isAvailable = false;
  await service.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// ===== GET SERVICE AVAILABILITY =====
exports.getAvailability = catchAsync(async (req, res, next) => {
  const { date, location } = req.query;
  const service = await Service.findByPk(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  // Check if location is supported
  if (location && Array.isArray(service.availableLocations) && !service.availableLocations.includes(location)) {
    return res.status(200).json({
      status: 'success',
      data: {
        available: false,
        message: 'Service not available at this location'
      }
    });
  }

  // Get bookings for this service on the date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await Booking.findAll({
    where: {
      serviceType: service.type,
      startDate: { [Op.gte]: startOfDay, [Op.lte]: endOfDay },
      status: { [Op.notIn]: ['cancelled', 'completed'] }
    }
  });

  // Get available time slots
  const timeSlots = Array.isArray(service.timeSlots) ? service.timeSlots : [];
  const availableSlots = timeSlots.filter(slot => {
    const slotTime = new Date(`${date}T${slot}`);
    return !bookings.some(booking => {
      const bookingTime = new Date(booking.startDate);
      return Math.abs(bookingTime - slotTime) < 60 * 60 * 1000; // 1 hour buffer
    });
  });

  res.status(200).json({
    status: 'success',
    data: {
      available: availableSlots?.length > 0,
      availableSlots,
      bookedSlots: timeSlots.filter(
        slot => !availableSlots?.includes(slot)
      )
    }
  });
});

// ===== CALCULATE SERVICE PRICE =====
exports.calculatePrice = catchAsync(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  const quantity = Number(req.body.quantity || 1);
  const base = Number(service.price || service.minPrice || 0);
  const pricing = {
    amount: base * quantity,
    currency: service.currency || 'USD',
    breakdown: {
      base,
      quantity
    }
  };

  res.status(200).json({
    status: 'success',
    data: pricing
  });
});

// ===== GET SERVICE REVIEWS =====
exports.getServiceReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: reviews, count: total } = await Review.findAndCountAll({
    ...options,
    where: { ...options.where, serviceId: req.params.id, status: 'approved' },
    include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage'] }]
  });

  const ratingDistribution = await Review.findAll({
    attributes: [
      ['rating', 'rating'],
      [fn('count', col('id')), 'count']
    ],
    where: { serviceId: req.params.id, status: 'approved' },
    group: ['rating'],
    order: [['rating', 'ASC']],
    raw: true
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    ratingDistribution,
    data: {
      reviews
    }
  });
});

// ===== ADD SERVICE REVIEW =====
exports.addServiceReview = catchAsync(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  // Check if user has already reviewed
  const existingReview = await Review.findOne({
    where: { userId: req.user.id, serviceId: req.params.id }
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this service', 400));
  }

  // Create review
  const review = await Review.create({
    userId: req.user.id,
    serviceId: req.params.id,
    bookingId: req.body.bookingId,
    rating: req.body.rating,
    title: req.body.title,
    content: req.body.content,
    wouldRecommend: req.body.wouldRecommend
  });

  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});

// ===== GET SERVICE STATISTICS =====
exports.getServiceStatistics = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const statsRows = await Service.findAll({
    attributes: [
      [fn('count', col('id')), 'total'],
      [fn('sum', col('view_count')), 'totalViews'],
      [fn('sum', col('booking_count')), 'totalBookings'],
      [fn('avg', col('average_rating')), 'avgRating']
    ],
    where: {
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) }
    },
    raw: true
  });

  const byType = await Service.findAll({
    attributes: [
      ['type', 'type'],
      [fn('count', col('id')), 'count'],
      [fn('sum', col('booking_count')), 'bookings']
    ],
    where: {
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) }
    },
    group: ['type'],
    raw: true
  });

  const popular = await Service.findAll({
    where: { isPopular: true },
    order: [['booking_count', 'DESC']],
    limit: 5
  });

  res.status(200).json({
    status: 'success',
    data: {
      overview: statsRows[0] || {
        total: 0,
        totalViews: 0,
        totalBookings: 0,
        avgRating: 0
      },
      byType,
      popular
    }
  });
});

module.exports = exports;
