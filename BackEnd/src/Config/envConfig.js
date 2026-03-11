// ===== src/config/env.js =====
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Environment configuration validator and manager
 */
class EnvConfig {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.validateRequired();
  }

  /**
   * Validate required environment variables
   */
  validateRequired() {
    const required = {
      production: [
        'DATABASE_URL',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'STRIPE_SECRET_KEY',
        'PAYPAL_CLIENT_SECRET',
        'EMAIL_HOST',
        'EMAIL_USERNAME',
        'EMAIL_PASSWORD'
      ],
      development: [
        'JWT_SECRET'
      ],
      test: [
        'JWT_SECRET'
      ]
    };

    const requiredVars = required[this.env] || required.development;
    const dbRequired = process.env.DATABASE_URL
      ? []
      : ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missing = [];

    requiredVars.concat(dbRequired).forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  /**
   * Get application configuration
   */
  get app() {
    return {
      name: process.env.APP_NAME || 'CAR EASE',
      version: process.env.APP_VERSION || '1.0.0',
      env: this.env,
      debug: process.env.DEBUG === 'true',
      url: process.env.APP_URL || 'http://localhost:5000',
      clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      port: parseInt(process.env.PORT, 10) || 5000
    };
  }

  /**
   * Get database configuration
   */
  get database() {
    return {
      url: process.env.DATABASE_URL || null,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      name: process.env.DB_NAME || 'carease_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: this.env === 'production'
    };
  }

  /**
   * Get JWT configuration
   */
  get jwt() {
    return {
      secret: process.env.JWT_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7
    };
  }

  /**
   * Get Redis configuration
   */
  get redis() {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD,
      url: process.env.REDIS_URL,
      ttl: parseInt(process.env.CACHE_TTL, 10) || 300
    };
  }

  /**
   * Get email configuration
   */
  get email() {
    return {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      from: process.env.EMAIL_FROM || 'CAR EASE <noreply@carease.com>',
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL
      }
    };
  }

  /**
   * Get payment gateway configuration
   */
  get payment() {
    return {
      stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        currency: process.env.STRIPE_CURRENCY || 'usd'
      },
      paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
        currency: process.env.PAYPAL_CURRENCY || 'USD'
      },
      mpesa: {
        consumerKey: process.env.MPESA_CONSUMER_KEY,
        consumerSecret: process.env.MPESA_CONSUMER_SECRET,
        passkey: process.env.MPESA_PASSKEY,
        shortCode: process.env.MPESA_SHORT_CODE,
        environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
        callbackUrl: process.env.MPESA_CALLBACK_URL
      },
      square: {
        applicationId: process.env.SQUARE_APPLICATION_ID,
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        locationId: process.env.SQUARE_LOCATION_ID,
        environment: process.env.SQUARE_ENVIRONMENT || 'sandbox'
      },
      flutterwave: {
        publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
        encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY,
        environment: process.env.FLUTTERWAVE_ENVIRONMENT || 'sandbox'
      }
    };
  }

  /**
   * Get rate limiting configuration
   */
  get rateLimit() {
    return {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
      auth: {
        windowMs: 60 * 60 * 1000,
        max: 10
      },
      booking: {
        windowMs: 60 * 60 * 1000,
        max: 20
      },
      payment: {
        windowMs: 60 * 60 * 1000,
        max: 10
      }
    };
  }

  /**
   * Get file upload configuration
   */
  get upload() {
    return {
      maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
      allowedTypes: {
        image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        video: ['video/mp4', 'video/quicktime']
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
      },
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_BUCKET_NAME
      }
    };
  }

  /**
   * Get CORS configuration
   */
  get cors() {
    const origins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : [this.app.clientUrl];

    return {
      origin: origins,
      credentials: true,
      optionsSuccessStatus: 200
    };
  }

  /**
   * Get logging configuration
   */
  get logging() {
    return {
      level: process.env.LOG_LEVEL || 'info',
      dir: process.env.LOG_DIR || 'logs',
      maxFiles: process.env.LOG_MAX_FILES || '30d',
      format: process.env.NODE_ENV === 'production' ? 'json' : 'dev'
    };
  }

  /**
   * Get cache configuration
   */
  get cache() {
    return {
      ttl: parseInt(process.env.CACHE_TTL, 10) || 300,
      maxSize: parseInt(process.env.CACHE_MAX_SIZE, 10) || 100,
      enabled: process.env.CACHE_ENABLED !== 'false'
    };
  }

  /**
   * Get feature flags
   */
  get features() {
    return {
      payments: process.env.ENABLE_PAYMENTS !== 'false',
      notifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
      analytics: process.env.ENABLE_ANALYTICS !== 'false',
      chat: process.env.ENABLE_CHAT === 'true',
      reviews: process.env.ENABLE_REVIEWS !== 'false',
      loyalty: process.env.ENABLE_LOYALTY === 'true'
    };
  }

  /**
   * Get all configuration
   */
  getAll() {
    return {
      app: this.app,
      database: this.database,
      jwt: this.jwt,
      redis: this.redis,
      email: this.email,
      payment: this.payment,
      rateLimit: this.rateLimit,
      upload: this.upload,
      cors: this.cors,
      logging: this.logging,
      cache: this.cache,
      features: this.features
    };
  }
}

module.exports = new EnvConfig();
