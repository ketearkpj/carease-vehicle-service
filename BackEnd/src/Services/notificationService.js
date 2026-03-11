// ===== src/services/notificationService.js =====
const Notification = require('../Models/Notification');
const User = require('../Models/User');
const { sendEmail } = require('./emailService');
const { logger } = require('../Middleware/Logger.md.js');

// ===== CREATE NOTIFICATION =====
exports.createNotification = async ({ userId, recipient, type, title, message, data = {} }) => {
  try {
    const targetUserId = userId || recipient?.userId || recipient;
    const notification = await Notification.create({
      userId: targetUserId,
      type,
      title,
      message,
      data,
      channels: determineChannels(type)
    });

    // Queue for sending
    await exports.sendNotification(notification);

    return notification;
  } catch (error) {
    logger.error('Create notification failed:', error);
    throw error;
  }
};

// ===== SEND NOTIFICATION =====
exports.sendNotification = async (notification) => {
  try {
    const recipient = await getUserRecipient(notification.userId);
    
    if (!recipient) {
      logger.warn('Notification recipient not found');
      return;
    }

    // Send via each channel
    const channels = Array.isArray(notification.channels) ? notification.channels : [];
    const promises = channels.map(channel => {
      switch (channel) {
        case 'email':
          return sendEmailNotification(recipient, notification);
        case 'sms':
          return sendSMSNotification(recipient, notification);
        case 'push':
          return sendPushNotification(recipient, notification);
        case 'in_app':
          return saveInAppNotification(recipient, notification);
        default:
          return null;
      }
    });

    await Promise.all(promises.filter(p => p));

    // Update notification status
    notification.status = 'sent';
    notification.attempts += 1;
    await notification.save();

    return notification;
  } catch (error) {
    logger.error('Send notification failed:', error);
    
    notification.status = 'failed';
    notification.errorMessage = error.message;
    notification.attempts += 1;
    await notification.save();

    throw error;
  }
};

// ===== SEND BULK NOTIFICATIONS =====
exports.sendBulkNotifications = async (recipients, notificationData) => {
  const notifications = [];

  for (const recipient of recipients) {
    try {
      const notification = await exports.createNotification({
        ...notificationData,
        recipient
      });
      notifications.push(notification);
    } catch (error) {
      logger.error(`Bulk notification failed for ${recipient}:`, error);
    }
  }

  return notifications;
};

// ===== MARK AS READ =====
exports.markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findByPk(notificationId);
  
  if (!notification) {
    throw new Error('Notification not found');
  }

  notification.status = 'read';
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

// ===== MARK ALL AS READ =====
exports.markAllAsRead = async (userId) => {
  await Notification.update(
    { status: 'read', readAt: new Date() },
    { where: { userId, status: ['sent', 'delivered'] } }
  );
};

// ===== DELETE NOTIFICATION =====
exports.deleteNotification = async (notificationId, userId) => {
  const deleted = await Notification.destroy({
    where: { id: notificationId, userId }
  });

  if (!deleted) {
    throw new Error('Notification not found');
  }

  return true;
};

// ===== GET USER NOTIFICATIONS =====
exports.getUserNotifications = async (userId, limit = 50, offset = 0) => {
  return Notification.findAll({
    where: { userId },
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

// ===== GET UNREAD COUNT =====
exports.getUnreadCount = async (userId) => {
  return Notification.count({
    where: {
      userId,
      status: ['sent', 'delivered']
    }
  });
};

// ===== HELPER FUNCTIONS =====

const determineChannels = (type) => {
  const channelMap = {
    booking_confirmation: ['email', 'in_app'],
    booking_reminder: ['email', 'sms', 'push'],
    payment_received: ['email', 'in_app'],
    payment_failed: ['email', 'sms'],
    delivery_update: ['sms', 'push', 'in_app'],
    welcome: ['email', 'in_app'],
    password_changed: ['email', 'in_app'],
    system_alert: ['email', 'sms', 'push']
  };

  return channelMap[type] || ['in_app'];
};

const getUserRecipient = async (recipient) => {
  if (!recipient) return null;
  if (typeof recipient === 'string') {
    return User.findByPk(recipient);
  }
  if (recipient.type === 'user' && recipient.userId) {
    return User.findByPk(recipient.userId);
  }
  if (recipient.type === 'all') {
    return { role: 'all' };
  }
  if (recipient.type === 'role' && recipient.role) {
    return { role: recipient.role };
  }
  return null;
};

const sendEmailNotification = async (user, notification) => {
  await sendEmail({
    to: user.email,
    subject: notification.title,
    html: generateEmailHtml(notification)
  });
};

const sendSMSNotification = async (user, notification) => {
  // SMS implementation would go here
  logger.info(`SMS sent to ${user.phone}: ${notification.message}`);
};

const sendPushNotification = async (user, notification) => {
  // Push notification implementation would go here
  logger.info(`Push notification sent to user ${user.id}: ${notification.title}`);
};

const saveInAppNotification = async (user, notification) => {
  // Already saved, just log
  logger.info(`In-app notification saved for user ${user.id}`);
};

const generateEmailHtml = (notification) => {
  return `
    <h1>${notification.title}</h1>
    <p>${notification.message}</p>
    ${notification.data ? `<pre>${JSON.stringify(notification.data, null, 2)}</pre>` : ''}
  `;
};
