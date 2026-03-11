# Email Service Controller Integration Guide

This guide shows how to integrate the email service into your controllers to ensure automated email notifications for all critical workflows.

## Quick Integration Checklist

- [ ] Import email service functions at the top of the controller
- [ ] Add email sending calls after successful operations
- [ ] Include error handling to prevent email failures from breaking workflows
- [ ] Update .env configuration with email credentials
- [ ] Test emails with `testEmailService()`

## 1. AuthController Integration

### 1.1 User Registration (Send Welcome Email)

```javascript
const { sendWelcomeEmail, sendEmailVerification } = require('../Services/emailService');
const CatchAsync = require('../Utils/CatchAsync');

exports.register = CatchAsync(async (req, res, next) => {
  const { email, firstName, lastName, password } = req.body;

  // Create user
  const user = await User.create({
    email,
    firstName,
    lastName,
    password
  });

  // Generate verification token
  const verificationToken = generateVerificationToken(user.id);

  // Send welcome email (async, non-blocking)
  try {
    await sendWelcomeEmail(user);
    await sendEmailVerification(user, verificationToken);
  } catch (error) {
    logger.error('Email send failed during registration:', error.message);
    // Don't fail registration if email fails
  }

  // Create JWT token
  const token = signToken(user.id);

  res.status(201).json({
    status: 'success',
    token,
    data: { user }
  });
});
```

### 1.2 Forgot Password (Send Reset Email)

```javascript
const { sendPasswordReset } = require('../Services/emailService');

exports.forgotPassword = CatchAsync(async (req, res, next) => {
  const user = await User.findOne({ where: { email: req.body.email } });

  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  // Generate reset token
  const resetToken = generateResetToken(user.id);

  // Send password reset email
  try {
    await sendPasswordReset(user, resetToken);
  } catch (error) {
    logger.error('Failed to send password reset email:', error.message);
    return next(new AppError('Failed to send reset email. Try again later', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
  });
});
```

### 1.3 Email Verification (Handle Verification)

```javascript
const { sendEmailVerification } = require('../Services/emailService');

exports.verifyEmail = CatchAsync(async (req, res, next) => {
  const { token } = req.body;

  // Verify token and update user
  const user = await User.findByPk(verifyToken(token).userId);

  if (!user) {
    return next(new AppError('Invalid token', 400));
  }

  user.emailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully!'
  });
});

exports.resendVerificationEmail = CatchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id);

  const verificationToken = generateVerificationToken(user.id);

  try {
    await sendEmailVerification(user, verificationToken);
  } catch (error) {
    return next(new AppError('Failed to send verification email', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Verification email sent!'
  });
});
```

## 2. BookingController Integration

### 2.1 Create Booking (Send Confirmation)

```javascript
const { sendBookingConfirmation, sendBookingReminder } = require('../Services/emailService');
const schedule = require('node-cron');

exports.createBooking = CatchAsync(async (req, res, next) => {
  const { serviceId, startDate, endDate, locationId } = req.body;

  // Validate inputs
  const service = await Service.findByPk(serviceId);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  // Create booking
  const booking = await Booking.create({
    userId: req.user.id,
    serviceId,
    locationId,
    startDate,
    endDate,
    status: 'pending',
    bookingNumber: generateBookingNumber()
  });

  // Send confirmation email
  try {
    await sendBookingConfirmation(booking, req.user);
  } catch (error) {
    logger.error('Failed to send booking confirmation:', error.message);
    // Continue - don't fail booking creation if email fails
  }

  // Schedule reminder email 24 hours before booking
  scheduleBookingReminder(booking, req.user);

  res.status(201).json({
    status: 'success',
    data: { booking }
  });
});

// Schedule reminder email
const scheduleBookingReminder = (booking, user) => {
  const reminderTime = new Date(booking.startDate);
  reminderTime.setHours(reminderTime.getHours() - 24);

  const scheduledTask = schedule.scheduleJob(reminderTime, async () => {
    try {
      await sendBookingReminder(booking, user);
      logger.info(`Booking reminder sent for booking ${booking.id}`);
    } catch (error) {
      logger.error(`Failed to send booking reminder:, error.message);
    }
  });
};
```

### 2.2 Update Booking Status (Send Reminders)

```javascript
const { sendBookingReminder } = require('../Services/emailService');

exports.updateBookingStatus = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const booking = await Booking.findByPk(id);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  booking.status = status;
  await booking.save();

  // If status changed to confirmed, send reminder
  if (status === 'confirmed') {
    try {
      const user = await User.findByPk(booking.userId);
      await sendBookingReminder(booking, user);
    } catch (error) {
      logger.error('Failed to send booking reminder:', error.message);
    }
  }

  res.status(200).json({
    status: 'success',
    data: { booking }
  });
});
```

### 2.3 Cancel Booking (Send Cancellation Notice)

```javascript
const { sendRefundNotification } = require('../Services/emailService');

exports.cancelBooking = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findByPk(id);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if payment was made
  const payment = await Payment.findOne({ 
    where: { bookingId: id, status: 'completed' } 
  });

  // Calculate refund (implement your refund logic)
  const refundAmount = calculateRefundAmount(booking, reason);

  // Process refund
  if (payment) {
    await refundPayment(payment, refundAmount);

    // Send refund notification
    try {
      const user = await User.findByPk(booking.userId);
      const refund = {
        refundId: payment.id,
        amount: refundAmount,
        originalPaymentMethod: payment.method,
        processedAt: new Date()
      };
      await sendRefundNotification(user, refund);
    } catch (error) {
      logger.error('Failed to send refund notification:', error.message);
    }
  }

  // Cancel booking
  booking.status = 'cancelled';
  booking.cancellationReason = reason;
  booking.cancelledAt = new Date();
  await booking.save();

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled and refund processed'
  });
});
```

## 3. DeliveryController Integration

### 3.1 Create Delivery (Notify Customer)

```javascript
const { sendDeliveryStatusUpdate } = require('../Services/emailService');

exports.createDelivery = CatchAsync(async (req, res, next) => {
  const { bookingId, pickupLocation, dropoffLocation } = req.body;

  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Create delivery
  const delivery = await Delivery.create({
    bookingId,
    deliveryNumber: generateDeliveryNumber(),
    pickupLocation,
    dropoffLocation,
    status: 'pending'
  });

  // Notify customer
  try {
    const user = await User.findByPk(booking.userId);
    await sendDeliveryStatusUpdate(user, delivery);
  } catch (error) {
    logger.error('Failed to send delivery notification:', error.message);
  }

  res.status(201).json({
    status: 'success',
    data: { delivery }
  });
});
```

### 3.2 Update Delivery Status (Real-time Notifications)

```javascript
const { sendDeliveryStatusUpdate } = require('../Services/emailService');

exports.updateDeliveryStatus = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const delivery = await Delivery.findByPk(id);
  if (!delivery) {
    return next(new AppError('Delivery not found', 404));
  }

  // Update status
  delivery.status = status;
  await delivery.save();

  // Send status update notification
  if (['in_transit', 'arrived', 'completed'].includes(status)) {
    try {
      const booking = await Booking.findByPk(delivery.bookingId);
      const user = await User.findByPk(booking.userId);
      await sendDeliveryStatusUpdate(user, delivery);
    } catch (error) {
      logger.error('Failed to send delivery update:', error.message);
    }
  }

  res.status(200).json({
    status: 'success',
    data: { delivery }
  });
});
```

## 4. ReviewController Integration

### 4.1 Request Review (After Booking Completion)

```javascript
const { sendReviewRequest } = require('../Services/emailService');

exports.requestReview = CatchAsync(async (req, res, next) => {
  const { bookingId } = req.body;

  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    return next(new AppError('Can only review completed bookings', 400));
  }

  // Send review request
  try {
    const user = await User.findByPk(booking.userId);
    await sendReviewRequest(user, booking);
  } catch (error) {
    logger.error('Failed to send review request:', error.message);
    return next(new AppError('Failed to send review request', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Review request sent!'
  });
});
```

### 4.2 Create Review (Auto-request Next Booking Review)

```javascript
const { sendReviewRequest } = require('../Services/emailService');
const schedule = require('node-cron');

exports.createReview = CatchAsync(async (req, res, next) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Create review
  const review = await Review.create({
    bookingId,
    userId: req.user.id,
    rating,
    comment
  });

  // Schedule next review request for future bookings
  scheduleNextReviewRequest(req.user.id);

  res.status(201).json({
    status: 'success',
    data: { review }
  });
});

const scheduleNextReviewRequest = async (userId) => {
  // Get user's next completed booking
  const nextBooking = await Booking.findOne({
    where: {
      userId,
      status: 'completed'
    },
    order: [['endDate', 'DESC']],
    limit: 1
  });

  if (nextBooking) {
    // Schedule review request 2 days after booking completion
    const reviewTime = new Date(nextBooking.endDate);
    reviewTime.setDate(reviewTime.getDate() + 2);

    schedule.scheduleJob(reviewTime, async () => {
      try {
        const user = await User.findByPk(userId);
        await sendReviewRequest(user, nextBooking);
      } catch (error) {
        logger.error('Failed to send scheduled review request:', error.message);
      }
    });
  }
};
```

## 5. AdminController Integration

### 5.1 Alert Admins of Important Events

```javascript
const { sendAdminNotification } = require('../Services/emailService');

// Helper to notify all admins
const notifyAdmins = async (subject, details, actionUrl) => {
  const admins = await User.findAll({ where: { role: 'admin' } });
  
  for (const admin of admins) {
    try {
      await sendAdminNotification(admin.email, subject, details, actionUrl);
    } catch (error) {
      logger.error(`Failed to notify admin ${admin.email}:`, error.message);
    }
  }
};

// Notify on high-value booking
exports.createBooking = CatchAsync(async (req, res, next) => {
  const booking = await Booking.create(req.body);

  // Notify admins if booking is high-value
  if (booking.totalPrice > 1000) {
    await notifyAdmins(
      'High-Value Booking Created',
      {
        bookingNumber: booking.bookingNumber,
        totalPrice: `$${booking.totalPrice}`,
        customer: booking.customerName,
        service: booking.serviceType
      },
      `/admin/bookings/${booking.id}`
    );
  }

  res.status(201).json({ status: 'success', data: { booking } });
});

// Notify on payment failure
exports.handlePaymentFailure = CatchAsync(async (req, res, next) => {
  const { paymentId, reason } = req.body;
  const payment = await Payment.findByPk(paymentId);

  await notifyAdmins(
    'Payment Processing Failed',
    {
      paymentNumber: payment.paymentNumber,
      amount: `$${payment.amount}`,
      reason: reason,
      timestamp: new Date().toLocaleString()
    },
    `/admin/payments/${paymentId}`
  );

  res.status(200).json({ status: 'success' });
});
```

## 6. General Integration Pattern

Here's the general pattern to follow for all email integrations:

```javascript
// 1. Import email functions
const { sendX } = require('../Services/emailService');
const CatchAsync = require('../Utils/CatchAsync');

// 2. Use in controller methods with error handling
exports.someAction = CatchAsync(async (req, res, next) => {
  // Perform main action
  const result = await SomeModel.create(data);

  // Send email (non-blocking with try-catch)
  try {
    const user = await User.findByPk(req.user.id);
    await sendX(user, result);
  } catch (error) {
    logger.error('Email send failed:', error.message);
    // Don't fail the main operation if email fails
  }

  // Return response
  res.status(201).json({
    status: 'success',
    data: { result }
  });
});
```

## Testing Integration

### 1. Test Each Integration

```bash
# Send test email
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@gmail.com"}'
```

### 2. Check Email Service Status

```javascript
const { getEmailServiceStatus } = require('../Services/emailService');

router.get('/admin/email-status', (req, res) => {
  const status = getEmailServiceStatus();
  res.json(status);
});
```

### 3. Verify Email Logs

```bash
# Monitor sent emails
tail -f ./logs/email.log | grep "✅ Email sent"

# Monitor failures
tail -f ./logs/email.log | grep "❌"
```

## Common Issues & Solutions

### Issue: Emails not sending in development

**Solution:** 
- Ensure .env has `SENDGRID_API_KEY` OR email SMTP credentials
- Check `NODE_ENV` is not 'test' (might skip email)
- Verify email address exists (Gmail may reject new accounts)

### Issue: Queue building up

**Solution:**
- Check email service status: `getEmailServiceStatus()`
- Ensure provider API is responding
- Check network connectivity
- Monitor queue length: `status.queueLength`

### Issue: Emails sent but not received

**Solution:**
- Check spam/junk folder
- Verify sender email is correct
- Check recipient email is correct
- Verify email templates have proper HTML formatting

## Deployment Checklist

Before deploying to production:

- [ ] Configure all email environment variables
- [ ] Test with real email providers (SendGrid/Gmail)
- [ ] Verify retry logic works with provider rate limits
- [ ] Set up email logging and monitoring
- [ ] Test queue system under load
- [ ] Implement email bounce handling
- [ ] Set up admin alerts for email failures
- [ ] Documents email sender/reply-to addresses
- [ ] Enable email verification for new users
- [ ] Test all email workflows in staging

## Support

For issues with email integration:
1. Check [EMAIL_SERVICE_GUIDE.md](./EMAIL_SERVICE_GUIDE.md) for full API reference
2. Review logs for detailed error messages
3. Test email service: `await testEmailService('your@email.com')`
4. Check provider status pages (SendGrid, Gmail SMTP)
