// ===== src/Services/email.service.js =====
/**
 * EMAIL SERVICE - GOD MODE
 * Real email integration using EmailJS/SendGrid/Mailgun
 * Supports: SendGrid, Mailgun, AWS SES, SMTP
 */

import emailjs from '@emailjs/browser';
import axios from 'axios';
import { getEnv } from '../Config/env';

// Email service configuration
const EMAIL_CONFIG = {
  // EmailJS (easiest for client-side)
  useEmailJS: true,
  serviceId: getEnv('REACT_APP_EMAILJS_SERVICE_ID') || 'service_carease',
  templateId: getEnv('REACT_APP_EMAILJS_TEMPLATE_ID') || 'template_carease',
  publicKey: getEnv('REACT_APP_EMAILJS_PUBLIC_KEY') || 'your_public_key',
  
  // SendGrid (backend recommended)
  sendGridApiKey: getEnv('REACT_APP_SENDGRID_API_KEY'),
  sendGridFromEmail: 'noreply@carease.com',
  
  // SMTP (for custom setup)
  smtp: {
    host: getEnv('REACT_APP_SMTP_HOST'),
    port: getEnv('REACT_APP_SMTP_PORT'),
    secure: true,
    auth: {
      user: getEnv('REACT_APP_SMTP_USER'),
      pass: getEnv('REACT_APP_SMTP_PASS')
    }
  }
};

// Initialize EmailJS
if (EMAIL_CONFIG.useEmailJS) {
  emailjs.init(EMAIL_CONFIG.publicKey);
}

/**
 * Send email using EmailJS (client-side)
 * @param {Object} params - Email parameters
 * @returns {Promise} - EmailJS response
 */
const sendViaEmailJS = async (params) => {
  try {
    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      params
    );
    return { success: true, data: response };
  } catch (error) {
    console.error('EmailJS error:', error);
    throw error;
  }
};

/**
 * Send email via SendGrid (backend proxy)
 * @param {Object} emailData - Email data
 * @returns {Promise} - API response
 */
const sendViaSendGrid = async (emailData) => {
  try {
    // This should hit your backend endpoint that uses SendGrid
    const response = await axios.post('/api/send-email', {
      to: emailData.to,
      from: EMAIL_CONFIG.sendGridFromEmail,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    });
    return response.data;
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
};

/**
 * Subscribe to newsletter
 * @param {string} email - Subscriber email
 * @returns {Promise} - Subscription result
 */
export const subscribeToNewsletter = async (email) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  try {
    // Option 1: Store in your database (via API)
    const response = await axios.post('/api/newsletter/subscribe', { 
      email,
      subscribedAt: new Date().toISOString(),
      source: 'website'
    });

    // Option 2: Add to Mailchimp list
    // await addToMailchimp(email);

    // Option 3: Send confirmation email
    await sendConfirmationEmail(email);

    return { 
      success: true, 
      message: 'Successfully subscribed to newsletter',
      data: response.data 
    };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    throw new Error(error.response?.data?.message || 'Subscription failed');
  }
};

/**
 * Send booking confirmation email
 * @param {Object} bookingData - Booking details
 * @returns {Promise} - Email result
 */
export const sendBookingConfirmation = async (bookingData) => {
  const { customerEmail, customerName, bookingId, serviceType, date, time, amount } = bookingData;

  const emailParams = {
    to_email: customerEmail,
    to_name: customerName,
    booking_id: bookingId,
    service_type: serviceType,
    booking_date: date,
    booking_time: time,
    booking_amount: `$${amount}`,
    reply_to: 'bookings@carease.com',
    from_name: 'CAR EASE Concierge'
  };

  try {
    if (EMAIL_CONFIG.useEmailJS) {
      return await sendViaEmailJS({
        ...emailParams,
        template_id: 'booking_confirmation'
      });
    } else {
      // HTML email template
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; background: #0a0c14; color: #e2e8f0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: 800; }
            .gold { color: #d4af37; }
            .content { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 30px; }
            .details { margin: 20px 0; }
            .detail-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(212,175,55,0.2); }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #d4af37, #f5d742); color: #0a0c14; text-decoration: none; border-radius: 50px; font-weight: 600; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">CAR <span class="gold">EASE</span></div>
              <h1>Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear ${customerName},</p>
              <p>Your booking has been confirmed. Here are the details:</p>
              
              <div class="details">
                <div class="detail-item">
                  <span>Booking ID:</span>
                  <strong>${bookingId}</strong>
                </div>
                <div class="detail-item">
                  <span>Service:</span>
                  <strong>${serviceType}</strong>
                </div>
                <div class="detail-item">
                  <span>Date:</span>
                  <strong>${date}</strong>
                </div>
                <div class="detail-item">
                  <span>Time:</span>
                  <strong>${time}</strong>
                </div>
                <div class="detail-item">
                  <span>Total Amount:</span>
                  <strong style="color: #d4af37;">$${amount}</strong>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="https://carease.com/bookings/${bookingId}" class="button">View Booking</a>
              </div>
            </div>
            
            <div class="footer">
              <p>Need help? Contact us at support@carease.com or call +1 (800) 555-0123</p>
              <p>© ${new Date().getFullYear()} CAR EASE. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await sendViaSendGrid({
        to: customerEmail,
        subject: `Booking Confirmed - CAR EASE (${bookingId})`,
        html: htmlContent,
        text: `Booking confirmed! ID: ${bookingId}, Service: ${serviceType}, Date: ${date}, Time: ${time}, Amount: $${amount}`
      });
    }
  } catch (error) {
    console.error('Failed to send booking confirmation:', error);
    // Fallback: log to database for retry
    await logFailedEmail({
      type: 'booking_confirmation',
      recipient: customerEmail,
      data: bookingData,
      error: error.message
    });
    throw error;
  }
};

/**
 * Send payment receipt email
 * @param {Object} paymentData - Payment details
 * @returns {Promise} - Email result
 */
export const sendPaymentReceipt = async (paymentData) => {
  const { customerEmail, customerName, paymentId, amount, method, date } = paymentData;

  const emailParams = {
    to_email: customerEmail,
    to_name: customerName,
    payment_id: paymentId,
    payment_amount: `$${amount}`,
    payment_method: method,
    payment_date: date,
    reply_to: 'payments@carease.com'
  };

  try {
    if (EMAIL_CONFIG.useEmailJS) {
      return await sendViaEmailJS({
        ...emailParams,
        template_id: 'payment_receipt'
      });
    } else {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; background: #0a0c14; color: #e2e8f0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: 800; }
            .gold { color: #d4af37; }
            .receipt { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 30px; }
            .amount { font-size: 36px; color: #d4af37; font-weight: 800; text-align: center; margin: 20px 0; }
            .details { margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(212,175,55,0.2); }
            .status-badge { background: #00ff88; color: #0a0c14; padding: 4px 12px; border-radius: 50px; display: inline-block; font-size: 14px; font-weight: 600; }
            .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">CAR <span class="gold">EASE</span></div>
              <h2>Payment Receipt</h2>
            </div>
            
            <div class="receipt">
              <div style="text-align: center; margin-bottom: 20px;">
                <span class="status-badge">PAID</span>
              </div>
              
              <div class="amount">$${amount}</div>
              
              <div class="details">
                <div class="detail-row">
                  <span>Receipt ID:</span>
                  <strong>${paymentId}</strong>
                </div>
                <div class="detail-row">
                  <span>Date:</span>
                  <strong>${date}</strong>
                </div>
                <div class="detail-row">
                  <span>Payment Method:</span>
                  <strong>${method}</strong>
                </div>
                <div class="detail-row">
                  <span>Customer:</span>
                  <strong>${customerName}</strong>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #94a3b8;">Thank you for choosing CAR EASE</p>
              </div>
            </div>
            
            <div class="footer">
              <p>For questions about this payment, contact payments@carease.com</p>
              <p>© ${new Date().getFullYear()} CAR EASE</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await sendViaSendGrid({
        to: customerEmail,
        subject: `Payment Receipt - CAR EASE (${paymentId})`,
        html: htmlContent,
        text: `Payment receipt: $${amount} paid on ${date} via ${method}. Receipt ID: ${paymentId}`
      });
    }
  } catch (error) {
    console.error('Failed to send payment receipt:', error);
    await logFailedEmail({
      type: 'payment_receipt',
      recipient: customerEmail,
      data: paymentData,
      error: error.message
    });
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Password reset token
 * @returns {Promise} - Email result
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `https://carease.com/reset-password?token=${resetToken}`;

  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', sans-serif; background: #0a0c14; color: #e2e8f0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: 800; }
          .gold { color: #d4af37; }
          .content { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 30px; }
          .button { display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #d4af37, #f5d742); color: #0a0c14; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 20px 0; }
          .warning { color: #ffbb33; font-size: 14px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CAR <span class="gold">EASE</span></div>
            <h2>Reset Your Password</h2>
          </div>
          
          <div class="content">
            <p>We received a request to reset your password.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px;">This link will expire in 1 hour.</p>
            
            <div class="warning">
              ⚠️ If you didn't request this, please ignore this email or contact support.
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} CAR EASE</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendViaSendGrid({
      to: email,
      subject: 'Reset Your CAR EASE Password',
      html: htmlContent,
      text: `Reset your password here: ${resetLink}`
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

/**
 * Send contact form email
 * @param {Object} contactData - Contact form data
 * @returns {Promise} - Email result
 */
export const sendContactFormEmail = async (contactData) => {
  const { name, email, phone, subject, message } = contactData;

  try {
    // Send to admin
    await sendViaSendGrid({
      to: 'info@carease.com',
      from: 'contact@carease.com',
      subject: `New Contact Form: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    // Send auto-reply to customer
    await sendViaSendGrid({
      to: email,
      from: 'info@carease.com',
      subject: 'Thank you for contacting CAR EASE',
      html: `
        <h3>Thank you for reaching out, ${name}!</h3>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p>Your inquiry details:</p>
        <ul>
          <li>Subject: ${subject}</li>
          <li>Message: ${message}</li>
        </ul>
        <p>If you need immediate assistance, please call us at +1 (800) 555-0123.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>CAR EASE Concierge Team</strong></p>
      `
    });

    return { success: true, message: 'Emails sent successfully' };
  } catch (error) {
    console.error('Failed to send contact form emails:', error);
    throw error;
  }
};

/**
 * Send welcome email to new subscribers
 * @param {string} email - Subscriber email
 * @returns {Promise} - Email result
 */
const sendConfirmationEmail = async (email) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', sans-serif; background: #0a0c14; color: #e2e8f0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: 800; }
          .gold { color: #d4af37; }
          .content { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 30px; text-align: center; }
          .benefits { margin: 30px 0; text-align: left; }
          .benefit-item { margin: 10px 0; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #d4af37, #f5d742); color: #0a0c14; text-decoration: none; border-radius: 50px; font-weight: 600; }
          .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CAR <span class="gold">EASE</span></div>
            <h2>Welcome to the CAR EASE Community! 🎉</h2>
          </div>
          
          <div class="content">
            <p>Thank you for subscribing to our newsletter!</p>
            
            <div class="benefits">
              <p style="color: #d4af37; font-weight: 600;">You'll now receive:</p>
              <div class="benefit-item">✨ Exclusive offers on luxury rentals</div>
              <div class="benefit-item">🚗 First access to new vehicle arrivals</div>
              <div class="benefit-item">💎 VIP event invitations</div>
              <div class="benefit-item">🔧 Expert maintenance tips</div>
            </div>
            
            <p>Get 10% off your first booking with code: <strong style="color: #d4af37;">WELCOME10</strong></p>
            
            <div style="margin: 30px 0;">
              <a href="https://carease.com/bookings" class="button">Book Now</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Follow us on social media for daily luxury automotive content</p>
            <p>© ${new Date().getFullYear()} CAR EASE</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendViaSendGrid({
      to: email,
      from: 'newsletter@carease.com',
      subject: 'Welcome to CAR EASE! 🚗✨',
      html: htmlContent,
      text: 'Thank you for subscribing to CAR EASE newsletter!'
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    // Don't throw - this is non-critical
  }
};

/**
 * Log failed emails for retry
 * @param {Object} failedEmailData - Failed email details
 */
const logFailedEmail = async (failedEmailData) => {
  try {
    await axios.post('/api/emails/failed', failedEmailData);
  } catch (error) {
    console.error('Failed to log email error:', error);
  }
};

/**
 * Verify email delivery status
 * @param {string} emailId - Email ID to verify
 * @returns {Promise} - Delivery status
 */
export const verifyEmailDelivery = async (emailId) => {
  try {
    const response = await axios.get(`/api/emails/status/${emailId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to verify email delivery:', error);
    throw error;
  }
};

// Export all email functions
export default {
  subscribeToNewsletter,
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendPasswordResetEmail,
  sendContactFormEmail,
  verifyEmailDelivery
};
