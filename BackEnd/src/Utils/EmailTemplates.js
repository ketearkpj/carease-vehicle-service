// ===== src/utils/emailTemplates.js =====
/**
 * Centralized email template generator
 * All email templates in one place with consistent styling
 */
class EmailTemplate {
  /**
   * Base HTML template with common structure
   */
  static base(content, title = 'CAR EASE') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #e2e8f0;
            background: linear-gradient(135deg, #0a0c14 0%, #0f172a 100%);
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-family: 'Montserrat', sans-serif;
            font-size: 36px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -1px;
          }
          .gold {
            background: linear-gradient(135deg, #d4af37, #f5d742);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .content {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 30px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #94a3b8;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #d4af37, #f5d742);
            color: #0a0c14;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            margin: 20px 0;
          }
          .details {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 20px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(212, 175, 55, 0.1);
          }
          .detail-label {
            color: #94a3b8;
          }
          .detail-value {
            color: #d4af37;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CAR <span class="gold">EASE</span></div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CAR EASE. All rights reserved.</p>
            <p>123 Luxury Lane, Beverly Hills, CA 90210</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Welcome email for new users
   */
  static welcome(user) {
    const content = `
      <h1>Welcome to CAR EASE, ${user.firstName}!</h1>
      <p>Thank you for joining the CAR EASE family. We're thrilled to have you on board.</p>
      
      <div class="details">
        <h3>Your Account Details</h3>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${user.firstName} ${user.lastName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${user.email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Member Since:</span>
          <span class="detail-value">${new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <p>Get 10% off your first booking with code: <strong style="color: #d4af37;">WELCOME10</strong></p>

      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/services" class="button">Explore Services</a>
      </div>

      <p>Our concierge team is available 24/7 to assist you with any requests.</p>
    `;

    return this.base(content, 'Welcome to CAR EASE');
  }

  /**
   * Booking confirmation email
   */
  static bookingConfirmation(booking, user) {
    const content = `
      <h1>Booking Confirmed!</h1>
      <p>Dear ${user.firstName}, your booking has been confirmed.</p>

      <div class="details">
        <h3>Booking Details</h3>
        <div class="detail-row">
          <span class="detail-label">Booking #:</span>
          <span class="detail-value">${booking.bookingNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">${booking.serviceType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${new Date(booking.dates.startDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${booking.dates.pickupTime || 'Flexible'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Location:</span>
          <span class="detail-value">${booking.location.pickup.name || 'Beverly Hills'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total:</span>
          <span class="detail-value">$${booking.pricing?.total}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" class="button">View Booking</a>
      </div>

      <p>Need to make changes? Contact our concierge team at <a href="mailto:concierge@carease.com" style="color: #d4af37;">concierge@carease.com</a></p>
    `;

    return this.base(content, 'Booking Confirmed');
  }

  /**
   * Payment receipt email
   */
  static paymentReceipt(payment, booking, user) {
    const content = `
      <h1>Payment Receipt</h1>
      <p>Thank you for your payment, ${user.firstName}.</p>

      <div class="details">
        <h3>Payment Details</h3>
        <div class="detail-row">
          <span class="detail-label">Receipt #:</span>
          <span class="detail-value">${payment.paymentNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Booking #:</span>
          <span class="detail-value">${booking.bookingNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount:</span>
          <span class="detail-value">$${payment.amount}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">${payment.method}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${new Date(payment.createdAt).toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value">${payment.status}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/payments/${payment._id}" class="button">View Receipt</a>
      </div>

      <p>For questions about this payment, contact <a href="mailto:finance@carease.com" style="color: #d4af37;">finance@carease.com</a></p>
    `;

    return this.base(content, 'Payment Receipt');
  }

  /**
   * Password reset email
   */
  static passwordReset(user, resetUrl) {
    const content = `
      <h1>Reset Your Password</h1>
      <p>Hi ${user.firstName}, we received a request to reset your password.</p>

      <p>Click the button below to set a new password. This link will expire in 1 hour.</p>

      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>

      <p>If you didn't request this, please ignore this email or contact support if you're concerned.</p>

      <div style="background: rgba(255, 68, 68, 0.1); border-left: 4px solid #ff4444; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #ff4444;">⚠️ For security, never share this link with anyone.</p>
      </div>
    `;

    return this.base(content, 'Password Reset');
  }

  /**
   * Booking reminder email
   */
  static bookingReminder(booking, user) {
    const content = `
      <h1>Booking Reminder</h1>
      <p>Dear ${user.firstName}, this is a reminder for your upcoming booking.</p>

      <div class="details">
        <h3>Booking Details</h3>
        <div class="detail-row">
          <span class="detail-label">Booking #:</span>
          <span class="detail-value">${booking.bookingNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">${booking.serviceType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${new Date(booking.dates.startDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${booking.dates.pickupTime || 'Flexible'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Location:</span>
          <span class="detail-value">${booking.location.pickup.name || 'Beverly Hills'}</span>
        </div>
      </div>

      <p>Please arrive 15 minutes before your scheduled time. Don't forget to bring your driver's license and insurance.</p>

      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" class="button">Manage Booking</a>
      </div>
    `;

    return this.base(content, 'Booking Reminder');
  }

  /**
   * Cancellation confirmation email
   */
  static cancellationConfirmation(booking, user, reason) {
    const content = `
      <h1>Booking Cancelled</h1>
      <p>Dear ${user.firstName}, your booking has been cancelled.</p>

      <div class="details">
        <h3>Cancellation Details</h3>
        <div class="detail-row">
          <span class="detail-label">Booking #:</span>
          <span class="detail-value">${booking.bookingNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Reason:</span>
          <span class="detail-value">${reason || 'Requested by customer'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cancellation Fee:</span>
          <span class="detail-value">$${booking.cancellation?.fee || 0}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Refund Status:</span>
          <span class="detail-value">${booking.cancellation?.refunded ? 'Processed' : 'Pending'}</span>
        </div>
      </div>

      <p>If you have any questions about your cancellation, please contact our support team.</p>

      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/contact" class="button">Contact Support</a>
      </div>
    `;

    return this.base(content, 'Booking Cancelled');
  }

  /**
   * Newsletter email
   */
  static newsletter(title, content, ctaText, ctaUrl) {
    const newsletterContent = `
      <h1>${title}</h1>
      ${content}

      ${ctaText && ctaUrl ? `
        <div style="text-align: center;">
          <a href="${ctaUrl}" class="button">${ctaText}</a>
        </div>
      ` : ''}
    `;

    return this.base(newsletterContent, title);
  }

  /**
   * Invoice email
   */
  static invoice(booking, invoiceData) {
    const content = `
      <h1>Invoice #${invoiceData.invoiceNumber}</h1>
      <p>Thank you for your business, ${booking.customerInfo?.firstName || 'Valued Customer'}.</p>

      <div class="details">
        <h3>Invoice Details</h3>
        <div class="detail-row">
          <span class="detail-label">Invoice #:</span>
          <span class="detail-value">${invoiceData.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Booking #:</span>
          <span class="detail-value">${booking.bookingNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${new Date().toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Due Date:</span>
          <span class="detail-value">${invoiceData.dueDate}</span>
        </div>
      </div>

      <div class="details">
        <h3>Amount Due</h3>
        <div style="text-align: center; font-size: 36px; color: #d4af37; margin: 20px 0;">
          $${invoiceData.amountDue}
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/payments/${booking._id}" class="button">Pay Now</a>
      </div>

      <p>For questions about this invoice, contact <a href="mailto:billing@carease.com" style="color: #d4af37;">billing@carease.com</a></p>
    `;

    return this.base(content, `Invoice #${invoiceData.invoiceNumber}`);
  }

  /**
   * Verification email
   */
  static emailVerification(user, verificationUrl) {
    const content = `
      <h1>Verify Your Email</h1>
      <p>Hi ${user.firstName}, please verify your email address to activate your account.</p>

      <p>Click the button below to verify your email. This link will expire in 24 hours.</p>

      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email</a>
      </div>

      <p>If you didn't create an account with CAR EASE, please ignore this email.</p>
    `;

    return this.base(content, 'Verify Your Email');
  }

  /**
   * Refund notification email
   */
  static refundNotification(user, refund) {
    const content = `
      <h1>Refund Processed</h1>
      <p>Dear ${user.firstName}, your refund has been successfully processed.</p>

      <div class="details">
        <h3>Refund Details</h3>
        <div class="detail-row">
          <span class="detail-label">Booking #:</span>
          <span class="detail-value">${refund.bookingId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Refund Amount:</span>
          <span class="detail-value">$${refund.amount}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">${refund.originalPaymentMethod}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Processing Date:</span>
          <span class="detail-value">${new Date(refund.processedAt).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Expected in Account:</span>
          <span class="detail-value">3-5 business days</span>
        </div>
      </div>

      <p>If you have questions about this refund, please contact our finance team at <a href="mailto:finance@carease.com" style="color: #d4af37;">finance@carease.com</a></p>

      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}" class="button">Back to Dashboard</a>
      </div>
    `;

    return this.base(content, 'Refund Processed');
  }

  /**
   * Delivery status update email
   */
  static deliveryStatusUpdate(user, delivery) {
    const content = `
      <h1>Delivery Update</h1>
      <p>Hi ${user.firstName}, your delivery status has been updated.</p>

      <div class="details">
        <h3>Delivery Information</h3>
        <div class="detail-row">
          <span class="detail-label">Delivery #:</span>
          <span class="detail-value">${delivery.deliveryNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Current Status:</span>
          <span class="detail-value" style="text-transform: capitalize;">${delivery.status}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Location:</span>
          <span class="detail-value">${delivery.pickupLocation?.name || 'Beverly Hills'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Dropoff Location:</span>
          <span class="detail-value">${delivery.dropoffLocation?.name || 'Destination'}</span>
        </div>
        ${delivery.estimatedTime ? `
          <div class="detail-row">
            <span class="detail-label">Estimated Arrival:</span>
            <span class="detail-value">${new Date(delivery.estimatedTime).toLocaleTimeString()}</span>
          </div>
        ` : ''}
      </div>

      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/deliveries/${delivery._id}" class="button">Track Delivery</a>
      </div>

      <p>For real-time tracking updates, visit your dashboard or contact our support team.</p>
    `;

    return this.base(content, 'Delivery Status Update');
  }

  /**
   * Review request email
   */
  static reviewRequest(user, booking) {
    const content = `
      <h1>Share Your Experience</h1>
      <p>Dear ${user.firstName}, we'd love to hear about your recent booking with CAR EASE!</p>

      <div class="details">
        <h3>Your Booking</h3>
        <div class="detail-row">
          <span class="detail-label">Booking #:</span>
          <span class="detail-value">${booking.bookingNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">${booking.serviceType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${new Date(booking.completedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <p>Your feedback helps us improve our services and assists other users in making informed decisions.</p>

      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/bookings/${booking._id}/review" class="button">Write a Review</a>
      </div>

      <p>As a thank you, you'll be entered to win a $100 CAR EASE voucher!</p>

      <div style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;">⭐ Reviews take just 2-3 minutes to write and make a real difference.</p>
      </div>
    `;

    return this.base(content, 'Share Your Experience');
  }

  /**
   * Promotional email
   */
  static promotional(user, promotion) {
    const content = `
      <h1>${promotion.title || 'Special Offer Just for You'}</h1>
      <p>Dear ${user.firstName},</p>

      <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(245, 215, 66, 0.1)); border-radius: 20px; padding: 30px; text-align: center; margin: 20px 0;">
        <div style="font-size: 48px; color: #d4af37; font-weight: bold; margin-bottom: 10px;">
          ${promotion.discountText || 'SAVE 20%'}
        </div>
        <p style="color: #e2e8f0; margin: 0;">Use code: <strong style="color: #f5d742;">${promotion.couponCode}</strong></p>
        ${promotion.expiryDate ? `
          <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Valid until ${new Date(promotion.expiryDate).toLocaleDateString()}</p>
        ` : ''}
      </div>

      <p>${promotion.description || 'We have something special for you this season!'}</p>

      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/services?promo=${promotion.couponCode}" class="button">Claim Your Offer</a>
      </div>

      <p>This exclusive offer is only available for a limited time. Don't miss out!</p>
    `;

    return this.base(content, promotion.title || 'Special Offer');
  }

  /**
   * Contact/Support response email
   */
  static contactResponse(user, message, ticketId) {
    const content = `
      <h1>We've Received Your Message</h1>
      <p>Dear ${user.firstName}, thank you for contacting CAR EASE support.</p>

      <p>We've received your inquiry and our team will get back to you as soon as possible. Typically, we respond within 2-4 hours during business hours.</p>

      <div class="details">
        <h3>Support Ticket Information</h3>
        <div class="detail-row">
          <span class="detail-label">Ticket ID:</span>
          <span class="detail-value">${ticketId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Submitted:</span>
          <span class="detail-value">${new Date().toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value">Open</span>
        </div>
      </div>

      <p>Your message:</p>
      <div style="background: rgba(255, 255, 255, 0.02); border-left: 4px solid #d4af37; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <p style="margin: 0; color: #cbd5e1;">"${message}"</p>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/support/ticket/${ticketId}" class="button">View Ticket</a>
      </div>

      <p>In the meantime, you can track your ticket status in your dashboard. Our concierge team is available at <a href="mailto:support@carease.com" style="color: #d4af37;">support@carease.com</a></p>
    `;

    return this.base(content, 'Support Ticket Received');
  }

  /**
   * Admin notification email
   */
  static adminNotification(subject, details, actionUrl) {
    const content = `
      <h1>🔔 Admin Alert: ${subject}</h1>
      <p>An important event has occurred in your CAR EASE admin dashboard.</p>

      <div class="details">
        ${Object.entries(details).map(([key, value]) => `
          <div class="detail-row">
            <span class="detail-label">${key.charAt(0).toUpperCase() + key.slice(1)}:</span>
            <span class="detail-value">${value}</span>
          </div>
        `).join('')}
      </div>

      ${actionUrl ? `
        <div style="text-align: center;">
          <a href="${actionUrl}" class="button">Review in Dashboard</a>
        </div>
      ` : ''}

      <p>This is an automated notification. Please review your admin dashboard for more details.</p>

      <div style="background: rgba(255, 68, 68, 0.05); border-left: 4px solid #ff6666; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #ffa0a0; font-size: 14px;">⚠️ If this alert seems incorrect, please contact your system administrator.</p>
      </div>
    `;

    return this.base(content, `Admin Alert: ${subject}`);
  }

  /**
   * Test email
   */
  static testEmail(recipient) {
    const content = `
      <h1>🧪 Email Service Test Successful</h1>
      <p>Congratulations! The CAR EASE email service is working properly.</p>

      <div class="details">
        <h3>Test Details</h3>
        <div class="detail-row">
          <span class="detail-label">Recipient:</span>
          <span class="detail-value">${recipient}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Timestamp:</span>
          <span class="detail-value">${new Date().toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value">✅ Active</span>
        </div>
      </div>

      <p>This confirms that your email configuration is correctly set up and operational.</p>

      <div style="background: rgba(100, 200, 100, 0.1); border-left: 4px solid #68d391; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #68d391;">✅ All email services are operational and ready for use.</p>
      </div>

      <p>System Information:</p>
      <div style="background: rgba(255, 255, 255, 0.02); padding: 15px; margin: 15px 0; border-radius: 5px; font-family: monospace; font-size: 12px;">
        <p style="margin: 5px 0;">API Version: v1.0</p>
        <p style="margin: 5px 0;">Environment: ${process.env.NODE_ENV || 'production'}</p>
        <p style="margin: 5px 0;">Service: CAR EASE Email Service</p>
      </div>
    `;

    return this.base(content, 'Email Service Test');
  }
}

module.exports = EmailTemplate;