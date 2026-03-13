// ===== src/Services/email.service.js =====
/**
 * EMAIL SERVICE - GOD MODE
 * Real email integration using EmailJS/SendGrid/Mailgun
 * Supports: SendGrid, Mailgun, AWS SES, SMTP
 */

import emailjs from '@emailjs/browser';
import axios from 'axios';
import { getEnv } from '../Config/env';
import { API_BASE_URL, API_ENDPOINTS } from '../Config/API';

// Email service configuration
const EMAIL_CONFIG = {
  // EmailJS (easiest for client-side)
  useEmailJS: true,
  serviceId: getEnv('REACT_APP_EMAILJS_SERVICE_ID') || 'service_carease',
  templateId: getEnv('REACT_APP_EMAILJS_TEMPLATE_ID') || 'template_carease',
  publicKey: getEnv('REACT_APP_EMAILJS_PUBLIC_KEY') || 'your_public_key',
  
  // SendGrid (backend recommended)
  sendGridApiKey: getEnv('REACT_APP_SENDGRID_API_KEY'),
  sendGridFromEmail: 'noreply@carease.co.ke',
  
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
    const endpoint = `${API_BASE_URL}${API_ENDPOINTS.EMAIL.NEWSLETTER_SUBSCRIBE}`;
    const response = await axios.post(endpoint, {
      email,
      source: 'website'
    });

    return { 
      success: true, 
      message: response.data?.message || 'Successfully subscribed to newsletter',
      data: response.data 
    };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    throw new Error(error.response?.data?.message || 'Subscription failed');
  }
};

/**
 * Unsubscribe email from newsletter
 * @param {string} email - Subscriber email
 * @returns {Promise} - Unsubscribe result
 */
export const unsubscribeFromNewsletter = async (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  try {
    const endpoint = `${API_BASE_URL}${API_ENDPOINTS.EMAIL.NEWSLETTER_UNSUBSCRIBE}`;
    const response = await axios.post(endpoint, { email });

    return {
      success: true,
      message: response.data?.message || 'Unsubscribed successfully',
      data: response.data
    };
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    throw new Error(error.response?.data?.message || 'Unsubscribe failed');
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
    reply_to: 'bookings@carease.co.ke',
    from_name: 'CAR EASE Concierge'
  };

  try {
    // Prefer backend SMTP pipeline for reliability.
    const backendEndpoint = `${API_BASE_URL}/email/booking-confirmation`;
    const backendResponse = await axios.post(backendEndpoint, {
      customerEmail,
      customerName,
      bookingId,
      serviceType,
      date,
      time,
      amount
    });
    if (backendResponse?.data?.status === 'success') {
      return { success: true, data: backendResponse.data };
    }

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
                <a href="https://carease.co.ke/bookings/${bookingId}" class="button">View Booking</a>
              </div>
            </div>
            
            <div class="footer">
              <p>Need help? Contact us at support@carease.co.ke or call 0758458358</p>
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
    try {
      // Fallback: log to database for retry
      await logFailedEmail({
        type: 'booking_confirmation',
        recipient: customerEmail,
        data: bookingData,
        error: error.message
      });
    } catch {
      // Ignore logging failures and return cleanly with useful message.
    }
    throw new Error(error.response?.data?.message || error.message || 'Booking confirmation email failed');
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
    reply_to: 'payments@carease.co.ke'
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
              <p>For questions about this payment, contact payments@carease.co.ke</p>
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
  const resetLink = `https://carease.co.ke/reset-password?token=${resetToken}`;

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
  const { name, email, phone, subject, message, preferredContact } = contactData;

  try {
    const endpoint = `${API_BASE_URL}${API_ENDPOINTS.EMAIL.CONTACT}`;
    const response = await axios.post(endpoint, {
      name,
      email,
      phone,
      subject,
      message,
      preferredContact
    });
    return { success: true, message: response.data?.message || 'Inquiry submitted successfully' };
  } catch (error) {
    console.error('Failed to send contact form emails:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit inquiry');
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
              <a href="https://carease.co.ke/bookings" class="button">Book Now</a>
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
      from: 'newsletter@carease.co.ke',
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
  unsubscribeFromNewsletter,
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendPasswordResetEmail,
  sendContactFormEmail,
  verifyEmailDelivery
};
