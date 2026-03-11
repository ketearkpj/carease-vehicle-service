// ===== src/controllers/reviewController.js =====
const { Op } = require('sequelize');
const { Review, Booking, User, Vehicle, Service } = require('../Models');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');
const APIFeatures = require('../Utils/APIFeatures');

// ===== PUBLIC =====
exports.getRecentReviews = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const reviews = await Review.findAll({
    where: { status: 'approved' },
    order: [['created_at', 'DESC']],
    limit,
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage'] },
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'name', 'make', 'model', 'year'] },
      { model: Service, as: 'service', attributes: ['id', 'name'] }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

exports.getAllReviews = catchAsync(async (req, res) => {
  const features = new APIFeatures(req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const options = features.build();
  const { rows: reviews, count: total } = await Review.findAndCountAll({
    ...options,
    where: { ...options.where, status: 'approved' },
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage'] },
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'name', 'make', 'model', 'year'] },
      { model: Service, as: 'service', attributes: ['id', 'name'] }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    data: { reviews }
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage'] },
      { model: Vehicle, as: 'vehicle', attributes: ['id', 'name', 'make', 'model', 'year'] },
      { model: Service, as: 'service', attributes: ['id', 'name'] }
    ]
  });

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  res.status(200).json({ status: 'success', data: { review } });
});

// ===== PROTECTED =====
exports.createReview = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByPk(req.body.bookingId || req.body.booking);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  const existing = await Review.findOne({ where: { bookingId: booking.id } });
  if (existing) {
    return next(new AppError('A review already exists for this booking', 400));
  }

  const review = await Review.create({
    userId: req.user.id,
    bookingId: booking.id,
    vehicleId: req.body.vehicleId,
    serviceId: req.body.serviceId,
    rating: req.body.rating,
    title: req.body.title,
    content: req.body.content,
    pros: req.body.pros,
    cons: req.body.cons,
    images: req.body.images,
    status: req.body.status || 'pending'
  });

  res.status(201).json({ status: 'success', data: { review } });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (req.user.role !== 'admin' && review.userId?.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to update this review', 403));
  }

  Object.assign(review, req.body);
  await review.save();

  res.status(200).json({ status: 'success', data: { review } });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (req.user.role !== 'admin' && review.userId?.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to delete this review', 403));
  }

  await review.destroy();
  res.status(204).json({ status: 'success' });
});

exports.markHelpful = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  const users = Array.isArray(review.helpfulUsers) ? review.helpfulUsers : [];
  if (!users.includes(req.user.id)) {
    users.push(req.user.id);
  }
  review.helpfulUsers = users;
  review.helpfulCount = users.length;
  await review.save();
  res.status(200).json({ status: 'success', data: { review } });
});

exports.unmarkHelpful = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  const users = Array.isArray(review.helpfulUsers) ? review.helpfulUsers : [];
  review.helpfulUsers = users.filter((id) => id !== req.user.id);
  review.helpfulCount = review.helpfulUsers.length;
  await review.save();
  res.status(200).json({ status: 'success', data: { review } });
});

// ===== ADMIN =====
exports.updateReviewStatus = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);
  if (review) {
    review.status = req.body.status;
    await review.save();
  }
  if (!review) {
    return next(new AppError('Review not found', 404));
  }
  res.status(200).json({ status: 'success', data: { review } });
});

exports.addResponse = catchAsync(async (req, res, next) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  review.responseContent = req.body.content;
  review.responseBy = req.user.id;
  review.responseAt = new Date();
  await review.save();

  res.status(200).json({ status: 'success', data: { review } });
});

module.exports = exports;
