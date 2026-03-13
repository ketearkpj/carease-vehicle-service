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
