// ===== src/config/mail.js =====
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { logger } = require('../Middleware/Logger.md.js');

/**
 * Email configuration and transporter management
 */
class MailConfig {
  constructor() {
    this.transporter = null;
    this.sendgridInitialized = false;
    this.initialize();
  }

  /**
   * Initialize email services
   */
  initialize() {
    this.initNodemailer();
    this.initSendGrid();
  }

  /**
   * Initialize Nodemailer transporter
   */
  initNodemailer() {
    try {
      if (process.env.EMAIL_HOST && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT, 10) || 587,
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateDelta: 1000,
          rateLimit: 5
        });

        // Verify connection
        this.transporter.verify((error) => {
          if (error) {
            logger.error('Nodemailer connection failed:', error);
          } else {
            logger.info('✅ Nodemailer transporter ready');
          }
        });
      } else {
        logger.warn('⚠️ Email credentials not found - Nodemailer disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize Nodemailer:', error);
    }
  }

  /**
   * Initialize SendGrid
   */
  initSendGrid() {
    try {
      if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.sendgridInitialized = true;
        logger.info('✅ SendGrid initialized');
      }
    } catch (error) {
      logger.error('Failed to initialize SendGrid:', error);
    }
  }

  /**
   * Get Nodemailer transporter
   */
  getTransporter() {
    if (!this.transporter) {
      throw new Error('Email transporter not configured');
    }
    return this.transporter;
  }

  /**
   * Get SendGrid mail client
   */
  getSendGrid() {
    if (!this.sendgridInitialized) {
      throw new Error('SendGrid not configured');
    }
    return sgMail;
  }

  /**
   * Get email configuration
   */
  getConfig() {
    return {
      defaultFrom: process.env.EMAIL_FROM || 'CAR EASE <noreply@carease.com>',
      replyTo: process.env.EMAIL_REPLY_TO || 'support@carease.com',
      templates: {
        welcome: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        bookingConfirmation: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        paymentReceipt: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        passwordReset: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        newsletter: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
      },
      sendgrid: {
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@carease.com',
        fromName: process.env.SENDGRID_FROM_NAME || 'CAR EASE'
      }
    };
  }

  /**
   * Check if email service is available
   */
  isAvailable() {
    return !!(this.transporter || this.sendgridInitialized);
  }

  /**
   * Get preferred email service (SendGrid first, then Nodemailer)
   */
  getPreferredService() {
    if (this.sendgridInitialized) {
      return 'sendgrid';
    }
    if (this.transporter) {
      return 'nodemailer';
    }
    return null;
  }

  /**
   * Create test email account (for development)
   */
  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      logger.info('✅ Test email account created');
      return {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      };
    } catch (error) {
      logger.error('Failed to create test account:', error);
      throw error;
    }
  }

  /**
   * Get email sending limits
   */
  getRateLimits() {
    return {
      maxPerSecond: 5,
      maxPerMinute: 100,
      maxPerHour: 1000,
      maxPerDay: 10000
    };
  }

  /**
   * Validate email configuration
   */
  validateConfig() {
    const issues = [];

    if (!this.isAvailable()) {
      issues.push('No email service configured');
    }

    if (!process.env.EMAIL_FROM) {
      issues.push('EMAIL_FROM not set - using default');
    }

    if (!process.env.CLIENT_URL) {
      issues.push('CLIENT_URL not set - email links may be broken');
    }

    return {
      valid: issues.length === 0,
      issues,
      preferredService: this.getPreferredService()
    };
  }
}

module.exports = new MailConfig();