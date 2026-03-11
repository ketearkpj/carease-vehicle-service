// ===== src/middleware/logger.js =====
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// ===== DEFINE LOG FORMATS =====
const formats = {
  console: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  file: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  )
};

// ===== CREATE TRANSPORTS =====
const transports = [
  // Console transport
  new winston.transports.Console({
    format: formats.console,
    level: process.env.LOG_LEVEL || 'info'
  }),

  // Daily rotate file for errors
  new DailyRotateFile({
    filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '30d',
    format: formats.file
  }),

  // Daily rotate file for all logs
  new DailyRotateFile({
    filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    format: formats.file
  })
];

// ===== CREATE LOGGER INSTANCE =====
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports,
  exitOnError: false
});

// ===== REQUEST LOGGING MIDDLEWARE =====
exports.logRequest = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?._id
    };

    if (res.statusCode >= 400) {
      logger.error('Request failed', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

// ===== EXPORT LOGGER FOR USE ELSEWHERE =====
exports.logger = logger;

// ===== STREAM FOR MORGAN =====
exports.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};