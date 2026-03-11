// ===== src/models/Notification.js =====
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB
  },
  channels: {
    type: DataTypes.ARRAY(DataTypes.ENUM('email', 'sms', 'push', 'in_app'))
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed'),
    defaultValue: 'pending'
  },
  readAt: {
    type: DataTypes.DATE,
    field: 'read_at'
  },
  scheduledFor: {
    type: DataTypes.DATE,
    field: 'scheduled_for'
  },
  expiresAt: {
    type: DataTypes.DATE,
    field: 'expires_at'
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    field: 'max_attempts'
  },
  lastAttempt: {
    type: DataTypes.DATE,
    field: 'last_attempt'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    field: 'error_message'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Notification;
