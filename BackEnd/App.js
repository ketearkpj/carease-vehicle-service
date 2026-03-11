// ===== src/app.js =====
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const path = require('path');
const fs = require('fs');

const AppError = require('./src/Utils/AppError');
const globalErrorHandler = require('./src/Middleware/Error.md.js');
const { logger } = require('./src/Middleware/Logger.md.js');
const { xssClean } = require('./src/Middleware/Sanitizer.md.js');

// Import Routes
const authRoutes = require('./src/Routes/authRoutes');
const userRoutes = require('./src/Routes/userRoutes');
const vehicleRoutes = require('./src/Routes/vehicleRoutes');
const bookingRoutes = require('./src/Routes/bookingRoutes');
const paymentRoutes = require('./src/Routes/paymentRoutes');
const serviceRoutes = require('./src/Routes/serviceRoutes');
const reviewRoutes = require('./src/Routes/reviewRoutes');
const locationRoutes = require('./src/Routes/locationRoutes');
const adminRoutes = require('./src/Routes/adminRoutes');

const app = express();

// ===== GLOBAL MIDDLEWARE =====

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS
const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const envOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || '').split(',')
].map((origin) => origin && origin.trim()).filter(Boolean);
const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting
const limiter = rateLimit({
  max: process.env.RATE_LIMIT_MAX || 100,
  windowMs: process.env.RATE_LIMIT_WINDOW || 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xssClean);

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'price', 'year', 'rating', 'createdAt', 'category',
    'brand', 'model', 'location', 'status'
  ]
}));

// Compression
app.use(compression());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== API ROUTES =====
const mountRoutes = (basePath) => {
  app.use(`${basePath}/auth`, authRoutes);
  app.use(`${basePath}/users`, userRoutes);
  app.use(`${basePath}/vehicles`, vehicleRoutes);
  app.use(`${basePath}/bookings`, bookingRoutes);
  app.use(`${basePath}/payments`, paymentRoutes);
  app.use(`${basePath}/services`, serviceRoutes);
  app.use(`${basePath}/reviews`, reviewRoutes);
  app.use(`${basePath}/locations`, locationRoutes);
  app.use(`${basePath}/admin`, adminRoutes);
};

mountRoutes('/api/v1');
mountRoutes('/api');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CAR EASE API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  });
});

// API Documentation
if (process.env.NODE_ENV === 'development') {
  const swaggerPath = path.join(__dirname, 'docs', 'swagger.js');
  if (fs.existsSync(swaggerPath)) {
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./docs/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  } else {
    logger.warn('Swagger docs not found at BackEnd/docs/swagger.js; /api-docs is disabled.');
  }
}

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
