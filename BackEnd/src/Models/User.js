// ===== src/models/User.js =====
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  role: {
    type: DataTypes.ENUM('customer', 'provider', 'admin', 'super_admin'),
    defaultValue: 'customer'
  },
  profileImage: {
    type: DataTypes.STRING(500),
    field: 'profile_image'
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    field: 'date_of_birth'
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_email_verified'
  },
  isPhoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_phone_verified'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'login_attempts'
  },
  lockUntil: {
    type: DataTypes.DATE,
    field: 'lock_until'
  },
  passwordChangedAt: {
    type: DataTypes.DATE,
    field: 'password_changed_at'
  },
  passwordResetToken: {
    type: DataTypes.STRING(255),
    field: 'password_reset_token'
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    field: 'password_reset_expires'
  },
  emailVerificationToken: {
    type: DataTypes.STRING(255),
    field: 'email_verification_token'
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    field: 'email_verification_expires'
  },
  stripeCustomerId: {
    type: DataTypes.STRING(255),
    field: 'stripe_customer_id'
  },
  paypalAccountId: {
    type: DataTypes.STRING(255),
    field: 'paypal_account_id'
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'two_factor_enabled'
  },
  twoFactorSecret: {
    type: DataTypes.STRING(255),
    field: 'two_factor_secret'
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      newsletter: true,
      smsNotifications: true,
      emailNotifications: true,
      preferredLanguage: 'en',
      preferredCurrency: 'USD'
    }
  },
  permissions: {
    type: DataTypes.JSONB
  },
  assignedLocations: {
    type: DataTypes.JSONB,
    field: 'assigned_locations'
  },
  employment: {
    type: DataTypes.JSONB
  },
  address: {
    type: DataTypes.JSONB
  },
  metadata: {
    type: DataTypes.JSONB
  },
  backupCodes: {
    type: DataTypes.JSONB,
    field: 'backup_codes'
  },
  deviceTokens: {
    type: DataTypes.JSONB,
    field: 'device_tokens'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

User.prototype.correctPassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

User.prototype.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

User.prototype.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

User.prototype.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return verificationToken;
};

User.prototype.isLocked = function() {
  return Boolean(this.lockUntil && this.lockUntil > new Date());
};

User.prototype.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
    return this.save({ fields: ['loginAttempts', 'lockUntil'] });
  }

  const nextAttempts = (this.loginAttempts || 0) + 1;
  this.loginAttempts = nextAttempts;

  if (nextAttempts >= 5 && !this.isLocked()) {
    this.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
  }

  return this.save({ fields: ['loginAttempts', 'lockUntil'] });
};

User.prototype.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  const permissions = Array.isArray(this.permissions) ? this.permissions : [];
  return permissions.includes(permission);
};

User.prototype.hasAnyPermission = function(permissions) {
  if (this.role === 'super_admin') return true;
  const current = Array.isArray(this.permissions) ? this.permissions : [];
  return permissions.some((perm) => current.includes(perm));
};

User.prototype.hasAllPermissions = function(permissions) {
  if (this.role === 'super_admin') return true;
  const current = Array.isArray(this.permissions) ? this.permissions : [];
  return permissions.every((perm) => current.includes(perm));
};

User.prototype.logActivity = async function(action, entityType, entityId, changes, req = null) {
  const AuditLog = require('./AuditLog');
  return AuditLog.create({
    adminId: this.id,
    action,
    entityType,
    entityId,
    changes,
    ipAddress: req?.ip,
    userAgent: req?.get?.('user-agent'),
    requestMethod: req?.method,
    requestUrl: req?.originalUrl,
    requestParams: req?.body || req?.params || null,
    severity: 'info',
    status: 'success'
  });
};

module.exports = User;
