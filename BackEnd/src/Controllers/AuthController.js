// ===== src/controllers/authController.js =====
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../Models/User');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/CatchAsync');
const { generateToken, generateCode } = require('../Utils/Helpers');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const sanitizeUser = (user) => {
  const safe = user?.get ? user.get({ plain: true }) : { ...user };
  delete safe.passwordHash;
  delete safe.passwordResetToken;
  delete safe.passwordResetExpires;
  delete safe.emailVerificationToken;
  delete safe.emailVerificationExpires;
  delete safe.twoFactorSecret;
  delete safe.backupCodes;
  return safe;
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: sanitizeUser(user)
    }
  });
};

const buildSocialProfile = (provider, body = {}) => {
  const normalizedProvider = String(provider || 'social').toLowerCase();
  const tokenSeed = String(body.token || '').replace(/[^a-zA-Z0-9]/g, '').slice(-12) || Date.now().toString(36);
  const email =
    body.email
    || body.profile?.email
    || `${normalizedProvider}.${tokenSeed}@carease.social`;
  const firstName =
    body.firstName
    || body.given_name
    || body.profile?.firstName
    || body.profile?.given_name
    || provider;
  const lastName =
    body.lastName
    || body.family_name
    || body.profile?.lastName
    || body.profile?.family_name
    || 'User';
  const phoneSeed = tokenSeed.padEnd(10, '0').slice(0, 10);

  return {
    email,
    firstName,
    lastName,
    phone: body.phone || body.profile?.phone || `+999${phoneSeed}`,
    profileImage: body.photo || body.picture || body.profile?.photo || body.profile?.picture || null,
    providerId: body.providerId || body.sub || body.profile?.id || tokenSeed
  };
};

const findOrCreateSocialUser = async (provider, body = {}) => {
  const profile = buildSocialProfile(provider, body);
  let user = await User.findOne({ where: { email: profile.email } });

  if (!user) {
    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
    user = await User.create({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      passwordHash,
      profileImage: profile.profileImage,
      isEmailVerified: true,
      metadata: {
        socialProviders: {
          [provider.toLowerCase()]: {
            providerId: profile.providerId,
            linkedAt: new Date().toISOString()
          }
        }
      }
    });
  } else {
    const socialProviders = user.metadata?.socialProviders || {};
    socialProviders[provider.toLowerCase()] = {
      providerId: profile.providerId,
      linkedAt: socialProviders[provider.toLowerCase()]?.linkedAt || new Date().toISOString()
    };
    user.firstName = user.firstName || profile.firstName;
    user.lastName = user.lastName || profile.lastName;
    user.profileImage = user.profileImage || profile.profileImage;
    user.isEmailVerified = true;
    user.lastLogin = new Date();
    user.metadata = {
      ...(user.metadata || {}),
      socialProviders
    };
    await user.save();
  }

  return user;
};

// ===== REGISTER =====
exports.register = catchAsync(async (req, res, next) => {
  const payload = { ...req.body };
  if (!['customer', 'provider'].includes(payload.role)) {
    payload.role = 'customer';
  }

  if (!payload.password || !payload.passwordConfirm) {
    return next(new AppError('Password and confirmation are required', 400));
  }
  if (payload.password !== payload.passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = await User.create({
    ...payload,
    passwordHash
  });

  createSendToken(user, 201, res);
});

// ===== LOGIN =====
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({
    where: { email },
    attributes: { include: ['passwordHash', 'loginAttempts', 'lockUntil'] }
  });
  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.isLocked && user.isLocked()) {
    return next(new AppError('Account is locked due to too many attempts', 423));
  }

  const isCorrect = await user.correctPassword(password);
  if (!isCorrect) {
    await user.incLoginAttempts();
    return next(new AppError('Incorrect email or password', 401));
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  user.lastLogin = new Date();
  await user.save();

  createSendToken(user, 200, res);
});

// ===== FORGOT PASSWORD =====
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset token generated',
    resetToken
  });
});

// ===== RESET PASSWORD =====
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Op.gt]: new Date() }
    }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  if (!req.body.password || !req.body.passwordConfirm) {
    return next(new AppError('Password and confirmation are required', 400));
  }
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  user.passwordHash = await bcrypt.hash(req.body.password, 12);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  createSendToken(user, 200, res);
});

// ===== VERIFY EMAIL =====
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { [Op.gt]: new Date() }
    }
  });

  if (!user) {
    return next(new AppError('Verification token is invalid or has expired', 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

// ===== RESEND VERIFICATION =====
exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  const verificationToken = user.createEmailVerificationToken();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Verification token generated',
    verificationToken
  });
});

// ===== REFRESH TOKEN =====
exports.refreshToken = catchAsync(async (req, res, next) => {
  const token = req.body.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return next(new AppError('Refresh token is required', 400));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
  } catch (err) {
    return next(new AppError('Invalid token', 401));
  }

  const user = await User.findByPk(decoded.id);
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists', 401));
  }

  createSendToken(user, 200, res);
});

// ===== LOGOUT =====
exports.logout = (req, res) => {
  res.status(204).json({ status: 'success' });
};

// ===== GET ME =====
exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

// ===== UPDATE ME =====
exports.updateMe = catchAsync(async (req, res, next) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'profileImage', 'dateOfBirth', 'address'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  Object.assign(user, updates);
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// ===== CHANGE PASSWORD =====
exports.changePassword = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { include: ['passwordHash'] }
  });

  const isCorrect = await user.correctPassword(req.body.currentPassword);
  if (!isCorrect) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  if (!req.body.newPassword || !req.body.newPasswordConfirm) {
    return next(new AppError('New password and confirmation are required', 400));
  }
  if (req.body.newPassword !== req.body.newPasswordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();

  createSendToken(user, 200, res);
});

// ===== DELETE ACCOUNT =====
exports.deleteAccount = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (user) {
    user.isActive = false;
    await user.save();
  }
  res.status(204).json({ status: 'success' });
});

// ===== 2FA =====
exports.setup2FA = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const secret = generateToken(16);
  const backupCodes = Array.from({ length: 5 }, () => generateCode(8));

  user.twoFactorEnabled = false;
  user.twoFactorSecret = secret;
  user.backupCodes = backupCodes;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      secret,
      backupCodes
    }
  });
});

exports.verify2FA = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  if (!code) {
    return next(new AppError('Verification code is required', 400));
  }

  const user = await User.findByPk(req.user.id);
  if (!user?.backupCodes?.includes(code)) {
    return next(new AppError('Invalid verification code', 401));
  }

  user.backupCodes = user.backupCodes.filter((c) => c !== code);
  user.twoFactorEnabled = true;
  await user.save();

  res.status(200).json({ status: 'success' });
});

exports.disable2FA = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (user) {
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.backupCodes = [];
    await user.save();
  }

  res.status(200).json({ status: 'success' });
});

// ===== DEVICE MANAGEMENT =====
exports.getDevices = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.status(200).json({
    status: 'success',
    data: {
      devices: user?.deviceTokens || []
    }
  });
});

exports.removeDevice = catchAsync(async (req, res) => {
  const { deviceId } = req.params;
  const user = await User.findByPk(req.user.id);
  if (user) {
    const current = Array.isArray(user.deviceTokens) ? user.deviceTokens : [];
    user.deviceTokens = current.filter((device) => device.deviceId !== deviceId);
    await user.save();
  }

  res.status(204).json({ status: 'success' });
});

// ===== SOCIAL LOGIN =====
const socialLogin = (provider) =>
  catchAsync(async (req, res) => {
    const user = await findOrCreateSocialUser(provider, req.body);
    createSendToken(user, 200, res);
  });

exports.googleLogin = socialLogin('Google');
exports.facebookLogin = socialLogin('Facebook');
exports.appleLogin = socialLogin('Apple');

module.exports = exports;
