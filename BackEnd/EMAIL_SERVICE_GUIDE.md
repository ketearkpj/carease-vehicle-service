# Email Service Documentation

## Overview

The CAR EASE email service is a production-ready, multi-provider email delivery system with advanced features including:

- **Dual-provider support**: SendGrid (primary) + Nodemailer SMTP (fallback)
- **Automatic retry logic**: 3 attempts with exponential backoff
- **Email queuing**: Asynchronous processing with batch handling
- **Comprehensive templates**: 15+ pre-designed email templates
- **Service monitoring**: Built-in diagnostics and status endpoints

## Service Architecture

### Components

1. **EmailService Class** (`src/Services/emailService.js`)
   - Manages SendGrid and Nodemailer initialization
   - Handles retry logic and email queuing
   - Provides service diagnostics

2. **Email Templates** (`src/Utils/EmailTemplates.js`)
   - Static HTML templates with consistent branding
   - Supports dynamic content injection
   - Responsive design for all devices

3. **Email Configuration** (`src/Config/mailConfig.js`)
   - Transporter setup and verification
   - Environment-based configuration

## Configuration

### Environment Variables

Required email configuration in `.env`:

```bash
# SendGrid Configuration (Primary)
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@carease.com
SENDGRID_FROM_NAME=CAR EASE

# Nodemailer Configuration (Fallback SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=CAR EASE <noreply@carease.com>
EMAIL_REPLY_TO=support@carease.com

# Client URL for Links
CLIENT_URL=http://localhost:5173
```

### Setup Instructions

#### 1. SendGrid Setup (Recommended)

1. Create a SendGrid account at https://sendgrid.com/
2. Generate an API key in Settings → API Keys
3. Add to `.env`:
   ```
   SENDGRID_API_KEY=SG.your_api_key_here
   ```

#### 2. Nodemailer Setup (Fallback)

**For Gmail:**
1. Enable 2-Factor Authentication
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

**For Other SMTP Providers:**
- Use your provider's SMTP settings
- Common ports: 587 (TLS) or 465 (SSL)

## API Reference

### Core Functions

#### 1. Send Generic Email

```javascript
const { sendEmail } = require('./Services/emailService');

await sendEmail({
  to: 'user@example.com',
  subject: 'Email Subject',
  html: '<h1>HTML Content</h1>',
  text: 'Plain text fallback',
  replyTo: 'support@carease.com',
  queued: false // Set to true for async processing
});
```

#### 2. Send Booking Confirmation

```javascript
const { sendBookingConfirmation } = require('./Services/emailService');

await sendBookingConfirmation(bookingObject, userObject);
```

**Parameters:**
- `booking`: Booking document with `bookingNumber`, `serviceType`, `dates`, `location`, `pricing`
- `user`: User document with `email`, `firstName`, `lastName`

#### 3. Send Booking Reminder

```javascript
const { sendBookingReminder } = require('./Services/emailService');

await sendBookingReminder(bookingObject, userObject);
```

#### 4. Send Payment Receipt

```javascript
const { sendPaymentReceipt } = require('./Services/emailService');

await sendPaymentReceipt(paymentObject, bookingObject, userObject);
```

**Parameters:**
- `payment`: Payment document with `paymentNumber`, `amount`, `method`, `createdAt`, `status`
- `booking`: Booking document
- `user`: User document

#### 5. Send Refund Notification

```javascript
const { sendRefundNotification } = require('./Services/emailService');

await sendRefundNotification(userObject, refundObject);
```

**Parameters:**
- `user`: User document
- `refund`: Refund data with `refundId`, `amount`, `originalPaymentMethod`, `processedAt`

#### 6. Send Delivery Update

```javascript
const { sendDeliveryStatusUpdate } = require('./Services/emailService');

await sendDeliveryStatusUpdate(userObject, deliveryObject);
```

**Parameters:**
- `user`: User document
- `delivery`: Delivery document with `deliveryNumber`, `status`, `pickupLocation`, `dropoffLocation`

#### 7. Send Email Verification

```javascript
const { sendEmailVerification } = require('./Services/emailService');

await sendEmailVerification(userObject, verificationToken);
```

#### 8. Send Welcome Email

```javascript
const { sendWelcomeEmail } = require('./Services/emailService');

await sendWelcomeEmail(userObject);
```

#### 9. Send Password Reset

```javascript
const { sendPasswordReset } = require('./Services/emailService');

await sendPasswordReset(userObject, resetToken);
```

#### 10. Send Review Request

```javascript
const { sendReviewRequest } = require('./Services/emailService');

await sendReviewRequest(userObject, bookingObject);
```

#### 11. Send Promotional Email

```javascript
const { sendPromotionalEmail } = require('./Services/emailService');

await sendPromotionalEmail(userObject, promotionObject);
```

**Parameters:**
- `user`: User document
- `promotion`: Promotion data with `title`, `description`, `discountText`, `couponCode`, `expiryDate`

#### 12. Send Contact Response

```javascript
const { sendContactResponse } = require('./Services/emailService');

await sendContactResponse(userObject, message, ticketId);
```

#### 13. Send Admin Notification

```javascript
const { sendAdminNotification } = require('./Services/emailService');

await sendAdminNotification(adminEmail, subject, details, actionUrl);
```

**Parameters:**
- `adminEmail`: Admin email address
- `subject`: Notification subject
- `details`: Object with notification details (key-value pairs)
- `actionUrl`: Optional URL for dashboard action

#### 14. Send Newsletter

```javascript
const { sendNewsletter } = require('./Services/emailService');

await sendNewsletter(subscribersArray, newsletterContent);
```

**Parameters:**
- `subscribers`: Array of subscriber objects with `email`
- `newsletterContent`: Object with `subject`, `html`, `text`

#### 15. Test Email Service

```javascript
const { testEmailService } = require('./Services/emailService');

const result = await testEmailService('test@example.com');
```

### Status & Monitoring

#### Get Service Status

```javascript
const { getEmailServiceStatus } = require('./Services/emailService');

const status = getEmailServiceStatus();
// Returns:
// {
//   sendgridAvailable: boolean,
//   nodemailerAvailable: boolean,
//   preferredService: 'sendgrid' | 'nodemailer' | null,
//   isAvailable: boolean,
//   queueLength: number,
//   retryAttempts: number
// }
```

## Email Templates

### Available Templates

1. **welcome(user)**
   - New user welcome email
   - Includes 10% discount code

2. **bookingConfirmation(booking, user)**
   - Booking confirmation with details
   - CTA to view booking

3. **bookingReminder(booking, user)**
   - Pre-arrival reminder (24 hours before)
   - Preparation tips

4. **paymentReceipt(payment, booking, user)**
   - Payment confirmation
   - Invoice details

5. **refundNotification(user, refund)**
   - Refund processing notification
   - Timeline expectations

6. **deliveryStatusUpdate(user, delivery)**
   - Real-time delivery tracking update
   - Location information

7. **passwordReset(user, resetUrl)**
   - Password reset link
   - Security warning

8. **emailVerification(user, verificationUrl)**
   - Email verification link
   - 24-hour expiry

9. **reviewRequest(user, booking)**
   - Post-booking review invitation
   - Contest entry notice

10. **promotional(user, promotion)**
    - Promotional offers and discounts
    - Expiry information

11. **contactResponse(user, message, ticketId)**
    - Support ticket confirmation
    - Ticket tracking

12. **adminNotification(subject, details, actionUrl)**
    - Admin alerts
    - Dashboard action links

13. **testEmail(recipient)**
    - Service health check
    - Configuration verification

14. **cancellationConfirmation(booking, user, reason)**
    - Booking cancellation notice
    - Refund status

15. **newsletter(title, content, ctaText, ctaUrl)**
    - Newsletter distribution
    - Custom content

## Integration Guide

### 1. Booking Controller Integration

```javascript
const { sendBookingConfirmation, sendBookingReminder } = require('./Services/emailService');

// Send confirmation when booking is created
exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    const user = await User.findByPk(booking.userId);
    
    // Send confirmation email
    await sendBookingConfirmation(booking, user);
    
    // Schedule reminder for 24 hours before
    scheduleBookingReminder(booking, user);
    
    res.json({ success: true, booking });
  } catch (error) {
    logger.error('Booking creation failed:', error);
    res.status(500).json({ error: error.message });
  }
};
```

### 2. Payment Controller Integration

```javascript
const { sendPaymentReceipt, sendRefundNotification } = require('./Services/emailService');

// Send receipt on successful payment
exports.processPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    const booking = await Booking.findByPk(payment.bookingId);
    const user = await User.findByPk(booking.userId);
    
    await sendPaymentReceipt(payment, booking, user);
    
    res.json({ success: true, payment });
  } catch (error) {
    logger.error('Payment processing failed:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send refund notification
exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    const refund = { /* refund details */ };
    const user = await User.findByPk(payment.userId);
    
    await sendRefundNotification(user, refund);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Refund failed:', error);
    res.status(500).json({ error: error.message });
  }
};
```

### 3. Auth Controller Integration

```javascript
const { sendEmailVerification, sendWelcomeEmail, sendPasswordReset } = require('./Services/emailService');

// Send verification email on signup
exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const verificationToken = generateVerificationToken(user.id);
    
    await sendEmailVerification(user, verificationToken);
    await sendWelcomeEmail(user);
    
    res.json({ success: true, user });
  } catch (error) {
    logger.error('Registration failed:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send password reset email
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const resetToken = generateResetToken(user.id);
    await sendPasswordReset(user, resetToken);
    
    res.json({ success: true, message: 'Reset link sent' });
  } catch (error) {
    logger.error('Password reset failed:', error);
    res.status(500).json({ error: error.message });
  }
};
```

### 4. Delivery Controller Integration

```javascript
const { sendDeliveryStatusUpdate } = require('./Services/emailService');

// Send status update when delivery status changes
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    delivery.status = req.body.status;
    await delivery.save();
    
    const user = /* get user */;
    await sendDeliveryStatusUpdate(user, delivery);
    
    res.json({ success: true, delivery });
  } catch (error) {
    logger.error('Status update failed:', error);
    res.status(500).json({ error: error.message });
  }
};
```

### 5. Review Controller Integration

```javascript
const { sendReviewRequest } = require('./Services/emailService');

// Request review after booking completion
exports.requestReview = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    const user = await User.findByPk(booking.userId);
    
    await sendReviewRequest(user, booking);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Review request failed:', error);
    res.status(500).json({ error: error.message });
  }
};
```

## Error Handling & Retry Logic

### Automatic Retries

The email service automatically retries failed sends:

```
Attempt 1: Immediate send
Attempt 2: 2 second delay (if first attempt fails)
Attempt 3: 4 second delay (if second attempt fails)
Attempt 4: Fails and logs error
```

### Error Responses

```javascript
// Successful send
{
  success: true,
  messageId: 'message-id-from-provider',
  service: 'sendgrid' | 'nodemailer'
}

// Failed send (after retries)
{
  success: false,
  reason: 'No email service available' | 'Send failed after retries'
}
```

### Logging

All email operations are logged with context:

```
✅ SendGrid email service initialized
✅ Nodemailer email service (SMTP) initialized
✅ Email sent via SendGrid to user@example.com
⚠️ Email send failed (attempt 1/3), retrying...
❌ Email send failed after 3 attempts: [error message]
```

## Testing

### Manual Testing

```javascript
const { testEmailService } = require('./Services/emailService');

// Test with specific email
const result = await testEmailService('your-test@gmail.com');
console.log(result);

// Test with default configured email
const result = await testEmailService();
console.log(result);
```

### Testing in Controllers

Create a test endpoint:

```javascript
// routes/testRoutes.js
router.post('/test-email', async (req, res) => {
  try {
    const result = await testEmailService(req.body.email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Best Practices

1. **Always queue emails for non-critical flows**
   ```javascript
   await sendEmail({ to, subject, html, queued: true });
   ```

2. **Use proper error handling**
   ```javascript
   try {
     await sendBookingConfirmation(booking, user);
   } catch (error) {
     logger.error('Email send failed:', error);
     // Continue processing even if email fails
   }
   ```

3. **Verify configurations on startup**
   ```javascript
   const status = getEmailServiceStatus();
   if (!status.isAvailable) {
     logger.warn('Email service not available!');
   }
   ```

4. **Monitor queue length in production**
   ```javascript
   setInterval(() => {
     const status = getEmailServiceStatus();
     if (status.queueLength > 100) {
       logger.warn(`Email queue building up: ${status.queueLength} pending`);
     }
   }, 60000);
   ```

5. **Use meaningful reply-to addresses**
   - bookings@carease.com for booking emails
   - finance@carease.com for payment emails
   - support@carease.com for support emails

## Troubleshooting

### Issue: "No email service configured"

**Solution:** Check `.env` file has either `SENDGRID_API_KEY` or email SMTP credentials.

### Issue: SendGrid API key error

**Solution:** Verify API key format: `SG.` prefix, correct length, no spaces.

### Issue: Nodemailer connection timeout

**Solution:** 
- For Gmail: Use app-specific password, not main password
- Check firewall allows outbound SMTP (587 or 465)
- Verify credentials in `.env`

### Issue: Emails stuck in queue

**Solution:** Check:
1. Email service status: `getEmailServiceStatus()`
2. Provider API limits
3. Log files for detailed errors

### Issue: Recipient receives wrong email

**Solution:** Verify:
1. `user.email` is correct
2. Template parameters match expected structure
3. Email provider sender address is configured

## Performance Monitoring

### Key Metrics

1. **Email Delivery Time**
   ```javascript
   const startTime = Date.now();
   await sendBookingConfirmation(booking, user);
   const duration = Date.now() - startTime;
   console.log(`Email sent in ${duration}ms`);
   ```

2. **Queue Length**
   ```javascript
   const status = getEmailServiceStatus();
   console.log(`Pending emails: ${status.queueLength}`);
   ```

3. **Success Rate**
   - Monitor logs for success/failure ratio
   - Alert if failure rate exceeds 10%

## Security Considerations

1. **API Keys**
   - Never commit keys to repository
   - Rotate keys regularly
   - Use different keys for dev/prod

2. **Email Content**
   - Sanitize user input in email content
   - Use parameterized templates
   - Validate email addresses

3. **Rate Limiting**
   - Implement rate limits on email sending
   - Monitor for abuse
   - Use queue for bulk sends

## Support & Resources

- **SendGrid Docs**: https://docs.sendgrid.com/
- **Nodemailer Docs**: https://nodemailer.com/
- **Email Templates**: Check `src/Utils/EmailTemplates.js`
- **Configuration**: Check `src/Config/mailConfig.js`
