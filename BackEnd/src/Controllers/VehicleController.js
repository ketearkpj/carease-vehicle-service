// ===== src/controllers/vehicleController.js =====
const { Op, fn, col, literal } = require('sequelize');
const { Vehicle, Booking, Review, User, Wishlist } = require('../Models');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');
const APIFeatures = require('../Utils/APIFeatures');
const cloudinaryService = require('../Services/cloudinaryService');

// ===== CREATE VEHICLE =====
exports.createVehicle = catchAsync(async (req, res, next) => {
  const vehicleData = req.body;

  // Handle image uploads if any
  if (req.files) {
    if (req.files.main) {
      const result = await cloudinaryService.uploadImage(req.files.main[0].path, {
        folder: 'vehicles/main'
      });
      vehicleData.mainImage = result.secure_url;
    }

    if (req.files.gallery) {
      const galleryUploads = await Promise.all(
        req.files.gallery.map(file => 
          cloudinaryService.uploadImage(file.path, { folder: 'vehicles/gallery' })
        )
      );
      vehicleData.galleryImages = galleryUploads.map(u => u.secure_url);
    }
  }

  const vehicle = await Vehicle.create(vehicleData);

  res.status(201).json({
    status: 'success',
    data: {
      vehicle
    }
  });
});

// ===== GET ALL VEHICLES =====
exports.getAllVehicles = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: vehicles, count: total } = await Vehicle.findAndCountAll({
    ...options,
    include: [{ model: Review, as: 'reviews' }]
  });

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    total,
    data: {
      vehicles
    }
  });
});

// ===== GET FEATURED VEHICLES =====
exports.getFeaturedVehicles = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 6;
  const vehicles = await Vehicle.findAll({
    where: { isFeatured: true, isAvailable: true },
    order: [['view_count', 'DESC']],
    limit: Number(limit)
  });

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: {
      vehicles
    }
  });
});

// ===== GET VEHICLE BY ID =====
exports.getVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findByPk(req.params.id, {
    include: [{
      model: Review,
      as: 'reviews',
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage'] }]
    }]
  });

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  // Increment view count
  vehicle.viewCount += 1;
  await vehicle.save();

  res.status(200).json({
    status: 'success',
    data: {
      vehicle
    }
  });
});

// ===== UPDATE VEHICLE =====
exports.updateVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findByPk(req.params.id);
  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }
  Object.assign(vehicle, req.body);
  await vehicle.save();

  res.status(200).json({
    status: 'success',
    data: {
      vehicle
    }
  });
});

// ===== DELETE VEHICLE =====
exports.deleteVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findByPk(req.params.id);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  // Soft delete - just mark as unavailable
  vehicle.isAvailable = false;
  await vehicle.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// ===== CHECK AVAILABILITY =====
exports.checkAvailability = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const vehicle = await Vehicle.findByPk(req.params.id);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  const conflicts = await Booking.count({
    where: {
      vehicleId: vehicle.id,
      status: { [Op.notIn]: ['cancelled', 'completed'] },
      startDate: { [Op.lte]: new Date(endDate) },
      endDate: { [Op.gte]: new Date(startDate) }
    }
  });
  const isAvailable = conflicts === 0;

  res.status(200).json({
    status: 'success',
    data: {
      available: isAvailable,
      vehicle: vehicle.id
    }
  });
});

// ===== GET SIMILAR VEHICLES =====
exports.getSimilarVehicles = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findByPk(req.params.id);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  const price = Number(vehicle.dailyRate);
  const similar = await Vehicle.findAll({
    where: {
      id: { [Op.ne]: vehicle.id },
      category: vehicle.category,
      isAvailable: true,
      dailyRate: {
        [Op.gte]: price * 0.7,
        [Op.lte]: price * 1.3
      }
    },
    limit: 4,
    include: [{ model: Review, as: 'reviews' }]
  });

  res.status(200).json({
    status: 'success',
    results: similar.length,
    data: {
      vehicles: similar
    }
  });
});

// ===== SEARCH VEHICLES =====
exports.searchVehicles = catchAsync(async (req, res, next) => {
  const { query, ...filters } = req.query;

  const where = {};
  if (query) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query}%` } },
      { make: { [Op.iLike]: `%${query}%` } },
      { model: { [Op.iLike]: `%${query}%` } }
    ];
  }

  Object.assign(where, filters);

  const vehicles = await Vehicle.findAll({ where });

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: {
      vehicles
    }
  });
});

// ===== GET VEHICLE REVIEWS =====
exports.getVehicleReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: reviews, count: total } = await Review.findAndCountAll({
    ...options,
    where: { ...options.where, vehicleId: req.params.id, status: 'approved' },
    include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage'] }]
  });

  // Get rating distribution
  const ratingDistribution = await Review.findAll({
    attributes: [
      ['rating', 'rating'],
      [fn('count', col('id')), 'count']
    ],
    where: { vehicleId: req.params.id, status: 'approved' },
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

// ===== ADD VEHICLE REVIEW =====
exports.addVehicleReview = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findByPk(req.params.id);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  // Check if user has already reviewed
  const existingReview = await Review.findOne({
    where: { userId: req.user.id, vehicleId: req.params.id }
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this vehicle', 400));
  }

  // Create review
  const review = await Review.create({
    userId: req.user.id,
    vehicleId: req.params.id,
    bookingId: req.body.bookingId,
    rating: req.body.rating,
    title: req.body.title,
    content: req.body.content,
    pros: req.body.pros,
    cons: req.body.cons,
    images: req.body.images,
    wouldRecommend: req.body.wouldRecommend
  });

  res.status(201).json({
    status: 'success',
    data: {
      review
    }
  });
});

// ===== UPLOAD VEHICLE IMAGES =====
exports.uploadImages = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findByPk(req.params.id);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError('No files uploaded', 400));
  }

  const uploadPromises = req.files.map(file =>
    cloudinaryService.uploadImage(file.path, {
      folder: `vehicles/${vehicle.id}`,
      transformation: { width: 1200, height: 800, crop: 'limit' }
    })
  );

  const results = await Promise.all(uploadPromises);
  const imageUrls = results.map(r => r.secure_url);

  const gallery = Array.isArray(vehicle.galleryImages) ? vehicle.galleryImages : [];
  vehicle.galleryImages = [...gallery, ...imageUrls];
  await vehicle.save();

  res.status(200).json({
    status: 'success',
    data: {
      images: imageUrls
    }
  });
});

// ===== TOGGLE FAVORITE =====
exports.toggleFavorite = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findByPk(req.params.id);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  const existing = await Wishlist.findOne({
    where: { userId: req.user.id, vehicleId: vehicle.id }
  });
  const isFavorite = Boolean(existing);

  if (existing) {
    await existing.destroy();
  } else {
    await Wishlist.create({ userId: req.user.id, vehicleId: vehicle.id });
  }

  res.status(200).json({
    status: 'success',
    data: {
      isFavorite: !isFavorite
    }
  });
});

// ===== GET VEHICLE STATISTICS =====
exports.getVehicleStatistics = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const statsRows = await Vehicle.findAll({
    attributes: [
      [fn('count', col('id')), 'total'],
      [fn('sum', literal(`CASE WHEN is_available = true THEN 1 ELSE 0 END`)), 'available'],
      [fn('sum', literal(`CASE WHEN is_available = false THEN 1 ELSE 0 END`)), 'booked'],
      [fn('avg', col('daily_rate')), 'avgPrice'],
      [fn('sum', col('view_count')), 'totalViews'],
      [fn('sum', col('booking_count')), 'totalBookings']
    ],
    where: {
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) }
    },
    raw: true
  });

  const byCategory = await Vehicle.findAll({
    attributes: [
      ['category', 'category'],
      [fn('count', col('id')), 'count'],
      [fn('avg', col('daily_rate')), 'avgPrice']
    ],
    where: {
      created_at: { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) }
    },
    group: ['category'],
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      overview: statsRows[0] || {
        total: 0,
        available: 0,
        booked: 0,
        avgPrice: 0,
        totalViews: 0,
        totalBookings: 0
      },
      byCategory
    }
  });
});

module.exports = exports;
