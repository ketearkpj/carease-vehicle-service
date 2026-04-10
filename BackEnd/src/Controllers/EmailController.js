const { QueryTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');
const User = require('../Models/User');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');
const { sendEmail } = require('../Services/emailService');
const EmailTemplate = require('../Utils/EmailTemplates');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ensureNewsletterTable = async () => {
  await sequelize.query(
    `
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        email VARCHAR(255) PRIMARY KEY,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        source VARCHAR(100),
        subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        unsubscribed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `
  );
};

const ensureContactInquiryTable = async () => {
  await sequelize.query(
    `
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        preferred_contact VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `
  );
};

exports.subscribeToNewsletter = catchAsync(async (req, res, next) => {
  const rawEmail = req.body?.email;
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

  if (!email || !EMAIL_REGEX.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  await ensureNewsletterTable();
  const existingSubscriber = await sequelize.query(
    'SELECT email, is_active AS "isActive" FROM newsletter_subscribers WHERE email = :email LIMIT 1',
    {
      replacements: { email },
      type: QueryTypes.SELECT,
      plain: true
    }
  );

  if (existingSubscriber?.isActive) {
    return res.status(200).json({
      status: 'success',
      message: 'This email is already subscribed.',
      data: { email, alreadySubscribed: true }
    });
  }

  const html = EmailTemplate.newsletter(
    'Welcome to CAR EASE Updates',
    `
      <p>Thank you for subscribing to CAR EASE updates.</p>
      <p>You will now receive service updates, new offers, and important announcements.</p>
      <p>If you did not request this, please contact our team immediately.</p>
    `,
    'Explore Services',
    `${process.env.CLIENT_URL || 'http://localhost:3000'}/services`
  );

  const emailPayload = {
    to: email,
    subject: 'Subscription Confirmed - CAR EASE',
    html,
    text: 'Your CAR EASE newsletter subscription is active.'
  };
  const sendResult = await sendEmail(emailPayload);
  const emailQueuedFallback = !sendResult?.success;
  if (emailQueuedFallback) {
    await sendEmail({ ...emailPayload, queued: true });
  }

  if (existingSubscriber) {
    await sequelize.query(
      `
        UPDATE newsletter_subscribers
        SET is_active = TRUE,
            subscribed_at = NOW(),
            unsubscribed_at = NULL,
            updated_at = NOW()
        WHERE email = :email
      `,
      { replacements: { email } }
    );
  } else {
    await sequelize.query(
      `
        INSERT INTO newsletter_subscribers (email, is_active, source, subscribed_at, created_at, updated_at)
        VALUES (:email, TRUE, :source, NOW(), NOW(), NOW())
      `,
      {
        replacements: {
          email,
          source: req.body?.source || 'website'
        }
      }
    );
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      const currentPreferences = user.preferences || {};
      user.preferences = {
        ...currentPreferences,
        newsletter: true
      };
      await user.save({ fields: ['preferences'] });
    }
  } catch (error) {
    // Ignore user-sync failures if users table is not yet initialized.
  }

  res.status(200).json({
    status: 'success',
    message: emailQueuedFallback
      ? 'Subscription successful. Confirmation email is queued for delivery.'
      : 'Subscription successful. A confirmation email has been sent.',
    data: {
      email,
      alreadySubscribed: false,
      emailQueued: emailQueuedFallback
    }
  });
});

exports.unsubscribeFromNewsletter = catchAsync(async (req, res, next) => {
  const rawEmail = req.body?.email;
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

  if (!email || !EMAIL_REGEX.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  await ensureNewsletterTable();
  const existingSubscriber = await sequelize.query(
    'SELECT email, is_active AS "isActive" FROM newsletter_subscribers WHERE email = :email LIMIT 1',
    {
      replacements: { email },
      type: QueryTypes.SELECT,
      plain: true
    }
  );

  if (!existingSubscriber || !existingSubscriber.isActive) {
    return res.status(200).json({
      status: 'success',
      message: 'This email is already unsubscribed.',
      data: { email, alreadyUnsubscribed: true }
    });
  }

  await sequelize.query(
    `
      UPDATE newsletter_subscribers
      SET is_active = FALSE,
          unsubscribed_at = NOW(),
          updated_at = NOW()
      WHERE email = :email
    `,
    { replacements: { email } }
  );

  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      const currentPreferences = user.preferences || {};
      user.preferences = {
        ...currentPreferences,
        newsletter: false
      };
      await user.save({ fields: ['preferences'] });
    }
  } catch (error) {
    // Ignore user-sync failures if users table is not yet initialized.
  }

  res.status(200).json({
    status: 'success',
    message: 'You have been unsubscribed from CAR EASE updates.',
    data: { email, alreadyUnsubscribed: false }
  });
});

exports.sendBookingConfirmationEmail = catchAsync(async (req, res, next) => {
  const customerEmail = typeof req.body?.customerEmail === 'string' ? req.body.customerEmail.trim().toLowerCase() : '';
  const customerName = typeof req.body?.customerName === 'string' ? req.body.customerName.trim() : 'Customer';
  const bookingId = String(req.body?.bookingId || '').trim();
  const serviceType = String(req.body?.serviceType || 'service').trim();
  const date = String(req.body?.date || '').trim();
  const time = String(req.body?.time || '').trim();
  const amount = req.body?.amount;

  if (!customerEmail || !EMAIL_REGEX.test(customerEmail)) {
    return next(new AppError('Please provide a valid customerEmail', 400));
  }

  const html = EmailTemplate.newsletter(
    'Booking Confirmation - CAR EASE',
    `
      <p>Hello ${customerName || 'Customer'},</p>
      <p>Your booking has been received successfully.</p>
      <p><strong>Booking ID:</strong> ${bookingId || 'Pending Assignment'}</p>
      <p><strong>Service:</strong> ${serviceType}</p>
      <p><strong>Date:</strong> ${date || 'TBD'}</p>
      <p><strong>Time:</strong> ${time || 'TBD'}</p>
      <p><strong>Amount:</strong> ${amount != null ? `KES ${Number(amount).toLocaleString('en-KE')}` : 'TBD'}</p>
      <p>Our team will contact you if any additional details are required.</p>
    `,
    'Open CarEase',
    `${process.env.CLIENT_URL || 'http://localhost:5173'}`
  );

  const sendResult = await sendEmail({
    to: customerEmail,
    subject: `Booking Confirmation - ${bookingId || 'CAR EASE'}`,
    html,
    text: `Booking confirmed. ID: ${bookingId || 'Pending'}, Service: ${serviceType}, Date: ${date || 'TBD'}, Time: ${time || 'TBD'}.`
  });

  const emailQueuedFallback = !sendResult?.success;
  if (emailQueuedFallback) {
    await sendEmail({
      to: customerEmail,
      subject: `Booking Confirmation - ${bookingId || 'CAR EASE'}`,
      html,
      text: `Booking confirmed. ID: ${bookingId || 'Pending'}, Service: ${serviceType}, Date: ${date || 'TBD'}, Time: ${time || 'TBD'}.`,
      queued: true
    });
  }

  return res.status(200).json({
    status: 'success',
    message: emailQueuedFallback
      ? 'Booking confirmation email queued for delivery.'
      : 'Booking confirmation email sent.',
    data: {
      recipient: customerEmail,
      emailQueued: emailQueuedFallback
    }
  });
});

exports.submitContactInquiry = catchAsync(async (req, res, next) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const phone = String(req.body?.phone || '').trim();
  const subject = String(req.body?.subject || '').trim();
  const message = String(req.body?.message || '').trim();
  const preferredContact = String(req.body?.preferredContact || '').trim();

  if (!name || !email || !subject || !message) {
    return next(new AppError('Please provide name, email, subject and message', 400));
  }

  if (!EMAIL_REGEX.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  await ensureContactInquiryTable();
  await sequelize.query(
    `
      INSERT INTO contact_inquiries (name, email, phone, subject, message, preferred_contact, status, created_at, updated_at)
      VALUES (:name, :email, :phone, :subject, :message, :preferredContact, 'new', NOW(), NOW())
    `,
    {
      replacements: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        preferredContact: preferredContact || null
      }
    }
  );

  const adminTo = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || 'support@carease.co.ke';

  const adminSendResult = await sendEmail({
    to: adminTo,
    subject: `New Contact Inquiry: ${subject}`,
    html: `
      <h2>New Contact Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Preferred Contact:</strong> ${preferredContact || 'Not specified'}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `,
    text: `New contact inquiry from ${name} (${email}) | ${subject}`
  });

  const customerSendResult = await sendEmail({
    to: email,
    subject: 'We received your inquiry - CAR EASE',
    html: `
      <p>Hello ${name},</p>
      <p>We have received your inquiry and the CarEase team will get back to you shortly.</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p>Thank you for contacting CarEase.</p>
    `,
    text: `Hello ${name}, we received your inquiry and will respond soon.`
  });

  if (!adminSendResult?.success) {
    await sendEmail({
      to: adminTo,
      subject: `New Contact Inquiry: ${subject}`,
      html: `
      <h2>New Contact Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Preferred Contact:</strong> ${preferredContact || 'Not specified'}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `,
      text: `New contact inquiry from ${name} (${email}) | ${subject}`,
      queued: true
    });
  }

  if (!customerSendResult?.success) {
    await sendEmail({
      to: email,
      subject: 'We received your inquiry - CAR EASE',
      html: `
      <p>Hello ${name},</p>
      <p>We have received your inquiry and the CarEase team will get back to you shortly.</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p>Thank you for contacting CarEase.</p>
    `,
      text: `Hello ${name}, we received your inquiry and will respond soon.`,
      queued: true
    });
  }

  return res.status(200).json({
    status: 'success',
    message: 'Inquiry submitted successfully.'
  });
});
