// ===== src/services/emailService.js =====
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { logger } = require('../Middleware/Logger.md.js');
const EmailTemplate = require('../Utils/EmailTemplates');

// ===== EMAIL SERVICE CONFIGURATION =====
class EmailService {
  constructor() {
    this.nodemailerTransporter = null;
    this.sendgridClient = null;
    this.nodemailerReady = false;
    this.retryAttempts = 3;
    this.retryDelay = 2000; // 2 seconds
    this.emailQueue = [];
    this.initialize();
  }

  resolveSmtpConfig() {
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || null;
    const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587', 10);
    const user = process.env.EMAIL_USERNAME || process.env.EMAIL_USER || process.env.SMTP_USER || null;
    const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS || null;
    const secureFlag = process.env.EMAIL_SECURE || process.env.SMTP_SECURE || '';
    const secure = secureFlag === 'true' || String(port) === '465';

    return { host, port, user, pass, secure };
  }

  /**
   * Initialize email services
   */
  initialize() {
    this.initializeSendGrid();
    this.initializeNodemailer();
    this.startEmailQueue();
  }

  /**
   * Initialize SendGrid
   */
  initializeSendGrid() {
    try {
      if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.sendgridClient = sgMail;
        logger.info('✅ SendGrid email service initialized');
      } else {
        this.sendgridClient = null;
      }
    } catch (error) {
      logger.error('❌ SendGrid initialization failed:', error.message);
      this.sendgridClient = null;
    }
  }

  /**
   * Initialize Nodemailer transporter
   */
  initializeNodemailer() {
    try {
      const smtp = this.resolveSmtpConfig();

      if (smtp.host && smtp.user && smtp.pass) {
        this.nodemailerTransporter = nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.secure,
          auth: {
            user: smtp.user,
            pass: smtp.pass
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateDelta: 1000,
          rateLimit: 5
        });
        this.nodemailerReady = true;
      } else {
        this.nodemailerTransporter = null;
        this.nodemailerReady = false;
        logger.warn('⚠️ SMTP disabled: missing EMAIL/SMTP host or credentials');
      }
    } catch (error) {
      logger.error('❌ Nodemailer initialization failed:', error.message);
      this.nodemailerTransporter = null;
      this.nodemailerReady = false;
    }
  }

  async ensureAvailableService() {
    if (this.sendgridClient || this.nodemailerTransporter) {
      return true;
    }

    this.initializeSendGrid();
    this.initializeNodemailer();
    return Boolean(this.sendgridClient || this.nodemailerTransporter);
  }

  /**
   * Get the preferred email service
   */
  getPreferredService() {
    if (this.sendgridClient) return 'sendgrid';
    if (this.nodemailerTransporter) return 'nodemailer';
    return null;
  }

  /**
   * Check if email service is available
   */
  isAvailable() {
    return !!(this.sendgridClient || this.nodemailerTransporter);
  }

  /**
   * Start the email queue processor
   */
  startEmailQueue() {
    setInterval(async () => {
      if (this.emailQueue.length > 0) {
        const email = this.emailQueue.shift();
        try {
          await this.sendEmailWithRetry(email);
        } catch (error) {
          logger.error('Email queue processing failed:', error.message);
        }
      }
    }, 1000);
  }

  /**
   * Add email to queue for processing
   */
  queueEmail(emailData) {
    this.emailQueue.push(emailData);
    logger.info(`Email queued: ${emailData.to}`);
  }
}

const emailService = new EmailService();

/**
 * Send email with retry logic using preferred service
 */
const sendEmailWithRetry = async (emailData, attempt = 1) => {
  try {
    await emailService.ensureAvailableService();

    if (!emailService.isAvailable()) {
      logger.warn('⚠️ No email service configured');
      return { success: false, reason: 'No email service available' };
    }

    const primaryService = emailService.getPreferredService();
    const servicesToTry = primaryService === 'sendgrid'
      ? ['sendgrid', 'nodemailer']
      : ['nodemailer', 'sendgrid'];

    let lastError = null;

    for (const service of servicesToTry) {
      if (service === 'sendgrid' && !emailService.sendgridClient) continue;
      if (service === 'nodemailer' && !emailService.nodemailerTransporter) continue;

      try {
        if (service === 'sendgrid') {
          return await sendViaSendGrid(emailData);
        }
        return await sendViaNodemailer(emailData);
      } catch (error) {
        lastError = error;
        logger.warn(`Email send via ${service} failed; trying next available provider.`);
      }
    }

    if (lastError) {
      throw lastError;
    }
  } catch (error) {
    if (attempt < emailService.retryAttempts) {
      logger.warn(`Email send failed (attempt ${attempt}/${emailService.retryAttempts}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, emailService.retryDelay * attempt));
      return sendEmailWithRetry(emailData, attempt + 1);
    } else {
      logger.error(`❌ Email send failed after ${emailService.retryAttempts} attempts:`, error);
      throw error;
    }
  }
};

/**
 * Send email via SendGrid
 */
const sendViaSendGrid = async ({ to, subject, html, text, replyTo, attachments = [] }) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@carease.com',
      replyTo: replyTo || process.env.EMAIL_REPLY_TO || 'support@carease.com',
      subject,
      html,
      text,
      attachments: attachments.map(att => ({
        content: att.content.toString('base64'),
        filename: att.filename,
        type: att.contentType,
        disposition: 'attachment'
      }))
    };

    const result = await emailService.sendgridClient.send(msg);
    logger.info(`✅ Email sent via SendGrid to ${to}`);
    return { success: true, messageId: result[0].headers['x-message-id'], service: 'sendgrid' };
  } catch (error) {
    logger.error('❌ SendGrid email send failed:', error);
    throw error;
  }
};

/**
 * Send email via Nodemailer
 */
const sendViaNodemailer = async ({ to, subject, html, text, replyTo, attachments = [] }) => {
  try {
    if (!emailService.nodemailerTransporter) {
      throw new Error('SMTP transporter is not configured');
    }

    if (!emailService.nodemailerReady) {
      await emailService.nodemailerTransporter.verify();
      emailService.nodemailerReady = true;
      logger.info('✅ Nodemailer email service (SMTP) verified on demand');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'CAR EASE <noreply@carease.com>',
      to,
      replyTo: replyTo || process.env.EMAIL_REPLY_TO || 'support@carease.com',
      subject,
      html,
      text,
      attachments
    };

    const result = await emailService.nodemailerTransporter.sendMail(mailOptions);
    logger.info(`✅ Email sent via Nodemailer (SMTP) to ${to}`);
    return { success: true, messageId: result.messageId, service: 'nodemailer' };
  } catch (error) {
    emailService.nodemailerReady = false;
    logger.error('❌ Nodemailer email send failed:', error);
    throw error;
  }
};

// ===== SEND EMAIL (Main export function) =====
exports.sendEmail = async ({ to, subject, html, text, replyTo, attachments = [], queued = false }) => {
  const emailData = { to, subject, html, text, replyTo, attachments };

  if (queued) {
    await emailService.ensureAvailableService();
    if (!emailService.isAvailable()) {
      logger.warn(`⚠️ Email not queued because no provider is configured: ${to}`);
      return { success: false, queued: false, reason: 'No email service available' };
    }
    emailService.queueEmail(emailData);
    return { success: true, queued: true };
  }

  return await sendEmailWithRetry(emailData);
};

// ===== SEND BOOKING CONFIRMATION =====
exports.sendBookingConfirmation = async (booking, user) => {
  try {
    const subject = `Booking Confirmed - CAR EASE #${booking.bookingNumber}`;
    const html = EmailTemplate.bookingConfirmation(booking, user);
    const text = `Your booking #${booking.bookingNumber} has been confirmed. Total: $${booking.totalPrice}`;

    return await exports.sendEmail({
      to: user.email,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'bookings@carease.com'
    });
  } catch (error) {
    logger.error('Error sending booking confirmation:', error);
    throw error;
  }
};

// ===== SEND BOOKING REMINDER =====
exports.sendBookingReminder = async (booking, user) => {
  try {
    const subject = `Reminder: Your Booking is Coming Up - ${booking.bookingNumber}`;
    const html = EmailTemplate.bookingReminder(booking, user);
    const text = `Reminder: Your booking #${booking.bookingNumber} is on ${new Date(booking.startDate).toLocaleDateString()}`;

    return await exports.sendEmail({
      to: user.email,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'bookings@carease.com'
    });
  } catch (error) {
    logger.error('Error sending booking reminder:', error);
    throw error;
  }
};

// ===== SEND PAYMENT RECEIPT =====
exports.sendPaymentReceipt = async (payment, booking, user) => {
  try {
    const subject = `Payment Receipt - CAR EASE #${payment.paymentNumber}`;
    const html = EmailTemplate.paymentReceipt(payment, booking, user);
    const text = `Payment of $${payment.amount} received for booking #${booking.bookingNumber}`;

    return await exports.sendEmail({
      to: user.email,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'finance@carease.com'
    });
  } catch (error) {
    logger.error('Error sending payment receipt:', error);
    throw error;
  }
};

// ===== SEND REFUND NOTIFICATION =====
exports.sendRefundNotification = async (user, refund) => {
  try {
    const subject = `Refund Processed - CAR EASE #${refund.refundId}`;
    const html = EmailTemplate.refundNotification(user, refund);
    const text = `Your refund of $${refund.amount} has been processed`;

    return await exports.sendEmail({
      to: user.email,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'finance@carease.com'
    });
  } catch (error) {
    logger.error('Error sending refund notification:', error);
    throw error;
  }
};

// ===== SEND DELIVERY UPDATE =====
exports.sendDeliveryStatusUpdate = async (user, delivery) => {
  try {
    const subject = `Delivery Update - Order #${delivery.deliveryNumber}`;
    const html = EmailTemplate.deliveryStatusUpdate(user, delivery);
    const text = `Your delivery status: ${delivery.status}`;

    return await exports.sendEmail({
      to: user.email,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'deliveries@carease.com'
    });
  } catch (error) {
    logger.error('Error sending delivery update:', error);
    throw error;
  }
};

// ===== SEND PASSWORD RESET =====
exports.sendPasswordReset = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request - CAR EASE';
    const html = EmailTemplate.passwordReset(user, resetUrl);
    const text = `Reset your password here: ${resetUrl}`;

    return await exports.sendEmail({
      to: user.email,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'support@carease.com'
    });
  } catch (error) {
    logger.error('Error sending password reset:', error);
    throw error;
  }
};

// ===== SEND EMAIL VERIFICATION =====
exports.sendEmailVerification = async (user, verificationToken) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const subject = 'Verify Your Email - CAR EASE';
    const html = EmailTemplate.emailVerification(user, verificationUrl);
    const text = `Verify your email here: ${verificationUrl}`;

    return await exports.sendEmail({
      to: user.email,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'support@carease.com'
    });
  } catch (error) {
    logger.error('Error sending email verification:', error);
    throw error;
  }
};

// ===== SEND WELCOME EMAIL =====
exports.sendWelcomeEmail = async (user) => {
  try {
    const subject = 'Welcome to CAR EASE';
    const html = EmailTemplate.welcome(user);
    const text = `Welcome to CAR EASE, ${user.firstName}!`;

    return await exports.sendEmail({
      to: user.email,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'support@carease.com'
    });
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    throw error;
  }
};

// ===== SEND NEWSLETTER =====
exports.sendNewsletter = async (subscribers, newsletterContent) => {
  try {
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failureCount = 0;

    for (const batch of batches) {
      const promises = batch.map(subscriber =>
        exports.sendEmail({
          to: subscriber.email,
          subject: newsletterContent.subject,
          html: newsletterContent.html,
          text: newsletterContent.text,
          replyTo: process.env.EMAIL_REPLY_TO || 'newsletter@carease.com',
          queued: true
        }).then(() => {
          successCount++;
        }).catch(err => {
          logger.error(`Newsletter failed for ${subscriber.email}:`, err.message);
          failureCount++;
        })
      );

      await Promise.all(promises);
      // Rate limiting between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info(`Newsletter sent: ${successCount} success, ${failureCount} failures`);
    return { success: true, successCount, failureCount };
  } catch (error) {
    logger.error('Error sending newsletter:', error);
    throw error;
  }
};

// ===== SEND CONTACT REQUEST RESPONSE =====
exports.sendContactResponse = async (user, message, ticketId) => {
  try {
    const subject = 'Thank You for Contacting CAR EASE';
    const html = EmailTemplate.contactResponse(user, message, ticketId);
    const text = `Thank you for reaching out to CAR EASE. We will respond shortly. Ticket: ${ticketId}`;

    return await exports.sendEmail({
      to: user.email || user,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'support@carease.com'
    });
  } catch (error) {
    logger.error('Error sending contact response:', error);
    throw error;
  }
};

// ===== SEND REVIEW REQUEST =====
exports.sendReviewRequest = async (user, booking) => {
  try {
    const subject = `Share Your Experience - ${booking.serviceType} Review`;
    const html = EmailTemplate.reviewRequest(user, booking);
    const text = `We'd love to hear about your ${booking.serviceType} experience with CAR EASE`;

    return await exports.sendEmail({
      to: user.email,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'reviews@carease.com'
    });
  } catch (error) {
    logger.error('Error sending review request:', error);
    throw error;
  }
};

// ===== SEND PROMOTIONAL EMAIL =====
exports.sendPromotionalEmail = async (user, promotion) => {
  try {
    const subject = promotion.subject || `Special Offer - CAR EASE`;
    const html = EmailTemplate.promotional(user, promotion);
    const text = promotion.text || 'Check out our special offers!';

    return await exports.sendEmail({
      to: user.email,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'promotions@carease.com'
    });
  } catch (error) {
    logger.error('Error sending promotional email:', error);
    throw error;
  }
};

// ===== SEND ADMIN NOTIFICATION =====
exports.sendAdminNotification = async (adminEmail, subject, details, actionUrl = null) => {
  try {
    const html = EmailTemplate.adminNotification(subject, details, actionUrl);
    const text = `New admin notification: ${subject}`;

    return await exports.sendEmail({
      to: adminEmail,
      subject: `Admin Alert: ${subject} - CAR EASE`,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'admin@carease.com'
    });
  } catch (error) {
    logger.error('Error sending admin notification:', error);
    throw error;
  }
};

// ===== TEST EMAIL SERVICE =====
exports.testEmailService = async (testEmail) => {
  try {
    const recipient = testEmail || process.env.EMAIL_USERNAME || 'test@carease.com';
    const html = EmailTemplate.testEmail(recipient);
    const result = await exports.sendEmail({
      to: recipient,
      subject: 'Test Email - CAR EASE',
      html,
      text: 'This is a test email from CAR EASE'
    });

    return { success: true, message: 'Test email sent successfully', result };
  } catch (error) {
    logger.error('Error sending test email:', error);
    return { success: false, message: 'Test email failed', error: error.message };
  }
};

// ===== CHECK EMAIL SERVICE STATUS =====
exports.getEmailServiceStatus = () => {
  return {
    sendgridAvailable: !!emailService.sendgridClient,
    nodemailerAvailable: !!emailService.nodemailerTransporter,
    preferredService: emailService.getPreferredService(),
    isAvailable: emailService.isAvailable(),
    queueLength: emailService.emailQueue.length,
    retryAttempts: emailService.retryAttempts
  };
};
