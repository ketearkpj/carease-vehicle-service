// ===== src/middleware/rateLimiter.js =====
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// ===== GENERAL API RATE LIMITER =====
exports.apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

// ===== STRICTER LIMITER FOR AUTH ROUTES =====
exports.authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
  message: 'Too many login attempts, please try again after an hour',
  skipSuccessfulRequests: true
});

// ===== LIMITER FOR BOOKING CREATION =====
exports.bookingLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:booking:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each user to 20 bookings per hour
  keyGenerator: (req) => req.user?._id || req.ip,
  message: 'Too many booking attempts, please try again later'
});

// ===== LIMITER FOR PAYMENT ATTEMPTS =====
exports.paymentLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:payment:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 payment attempts per hour
  keyGenerator: (req) => req.user?._id || req.ip,
  message: 'Too many payment attempts, please try again later'
});

// ===== LIMITER FOR REVIEW SUBMISSION =====
exports.reviewLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:review:'
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Limit each user to 3 reviews per day
  keyGenerator: (req) => req.user?._id,
  message: 'You have reached the maximum number of reviews for today'
});