// ===== src/controllers/locationController.js =====
const { Op } = require('sequelize');
const { Location, Vehicle } = require('../Models');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');
const mapService = require('../Services/mapService');

// ===== PUBLIC =====
exports.getNearbyLocations = catchAsync(async (req, res, next) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const serviceType = req.query.serviceType || null;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return next(new AppError('lat and lng query params are required', 400));
  }

  const locations = await Location.findAll({
    where: { isActive: true }
  });
  const filtered = locations.filter((loc) => {
    if (!serviceType) return true;
    return Array.isArray(loc.services) && loc.services.includes(serviceType);
  });
  const withDistance = filtered.map((loc) => {
    const coords = loc.address?.coordinates || {};
    const distance = mapService.calculateDistance(lat, lng, coords.lat, coords.lng);
    return { ...loc.get({ plain: true }), distance };
  }).sort((a, b) => a.distance - b.distance);
  res.status(200).json({ status: 'success', results: withDistance.length, data: { locations: withDistance } });
});

exports.getAllLocations = catchAsync(async (req, res) => {
  const query = {};
  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  const locations = await Location.findAll({
    where: query,
    order: [['name', 'ASC']]
  });
  res.status(200).json({ status: 'success', results: locations.length, data: { locations } });
});

exports.getLocation = catchAsync(async (req, res, next) => {
  let location = await Location.findByPk(req.params.id);
  if (!location) {
    location = await Location.findOne({ where: { code: req.params.id.toUpperCase() } });
  }

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  res.status(200).json({ status: 'success', data: { location } });
});

exports.getLocationVehicles = catchAsync(async (req, res, next) => {
  let location = await Location.findByPk(req.params.id);
  if (!location) {
    location = await Location.findOne({ where: { code: req.params.id.toUpperCase() } });
  }

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  const vehicles = await Vehicle.findAll({ where: { location: location.code.toLowerCase() } });
  res.status(200).json({ status: 'success', results: vehicles.length, data: { vehicles } });
});

exports.checkAvailability = catchAsync(async (req, res, next) => {
  let location = await Location.findByPk(req.params.id);
  if (!location) {
    location = await Location.findOne({ where: { code: req.params.id.toUpperCase() } });
  }

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  const availableVehicles = await Vehicle.count({
    where: { location: location.code.toLowerCase(), isAvailable: true }
  });

  res.status(200).json({
    status: 'success',
    data: {
      isOpenNow: isLocationOpenNow(location),
      availableVehicles
    }
  });
});

// ===== PROTECTED =====
exports.getDirections = catchAsync(async (req, res, next) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return next(new AppError('lat and lng query params are required', 400));
  }

  const location = await Location.findByPk(req.params.id);
  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  const directions = await mapService.getDirections(
    { lat, lng },
    { lat: location.address?.coordinates?.lat, lng: location.address?.coordinates?.lng },
    req.query.mode || 'driving'
  );

  res.status(200).json({ status: 'success', data: { directions } });
});

exports.geocode = catchAsync(async (req, res, next) => {
  if (!req.body.address) {
    return next(new AppError('Address is required', 400));
  }

  const data = await mapService.geocode(req.body.address);
  res.status(200).json({ status: 'success', data });
});

exports.reverseGeocode = catchAsync(async (req, res, next) => {
  const lat = Number(req.body.lat);
  const lng = Number(req.body.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return next(new AppError('lat and lng are required', 400));
  }

  const data = await mapService.reverseGeocode(lat, lng);
  res.status(200).json({ status: 'success', data });
});

exports.distanceMatrix = catchAsync(async (req, res, next) => {
  const { origin, destination, mode = 'driving' } = req.body || {};

  if (!origin || !destination) {
    return next(new AppError('origin and destination are required', 400));
  }

  const data = await mapService.getDistanceMatrix(origin, destination, mode);
  res.status(200).json({ status: 'success', data });
});

// ===== ADMIN =====
exports.createLocation = catchAsync(async (req, res) => {
  const location = await Location.create(req.body);
  res.status(201).json({ status: 'success', data: { location } });
});

exports.updateLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findByPk(req.params.id);
  if (location) {
    Object.assign(location, req.body);
    await location.save();
  }
  if (!location) {
    return next(new AppError('Location not found', 404));
  }
  res.status(200).json({ status: 'success', data: { location } });
});

exports.deleteLocation = catchAsync(async (req, res, next) => {
  const location = await Location.findByPk(req.params.id);
  if (location) {
    await location.destroy();
  }
  if (!location) {
    return next(new AppError('Location not found', 404));
  }
  res.status(204).json({ status: 'success' });
});

exports.updateBusinessHours = catchAsync(async (req, res, next) => {
  const location = await Location.findByPk(req.params.id);
  if (location) {
    location.hours = req.body;
    await location.save();
  }
  if (!location) {
    return next(new AppError('Location not found', 404));
  }
  res.status(200).json({ status: 'success', data: { location } });
});

exports.updateServices = catchAsync(async (req, res, next) => {
  const location = await Location.findByPk(req.params.id);
  if (location) {
    location.services = req.body.services;
    await location.save();
  }
  if (!location) {
    return next(new AppError('Location not found', 404));
  }
  res.status(200).json({ status: 'success', data: { location } });
});

const isLocationOpenNow = (location) => {
  const hours = location.hours;
  if (!hours) return false;
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = dayNames[new Date().getDay()];
  const today = hours[day];
  if (!today || today.closed) return false;
  const now = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: hours.timezone || 'America/Los_Angeles'
  });
  return now >= today.open && now <= today.close;
};

module.exports = exports;
