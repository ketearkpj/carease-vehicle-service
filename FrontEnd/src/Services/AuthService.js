// ===== src/Services/auth.service.js =====
/**
 * AUTH SERVICE - GOD MODE
 * Real authentication with JWT, OAuth, and session management
 * Supports: Email/password, Google, Facebook, Apple Sign-In
 */

import axios from 'axios';
import { buildApiUrl } from '../Config/API';
import { sendPasswordResetEmail } from './EmailService';

// API base URL
const API_BASE_URL = buildApiUrl('/auth');

// Token management
const TOKEN_KEY = 'carease_auth_token';
const REFRESH_TOKEN_KEY = 'carease_refresh_token';
const USER_KEY = 'carease_user';

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - User data and token
 */
export const register = async (userData) => {
  try {
    // Validate user data
    validateRegistrationData(userData);

    const response = await axios.post(`${API_BASE_URL}/register`, {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: userData.role || 'customer',
      acceptedTerms: userData.acceptedTerms,
      createdAt: new Date().toISOString()
    });

    // Store tokens
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }

    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
      refreshToken: response.data.refreshToken
    };
  } catch (error) {
    console.error('Registration failed:', error);
    
    // Handle specific errors
    if (error.response?.status === 409) {
      throw new Error('Email already registered');
    }
    
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

/**
 * Validate registration data
 * @param {Object} data - Registration data
 */
const validateRegistrationData = (data) => {
  const { email, password, firstName, lastName, phone, acceptedTerms } = data;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }

  // Password validation
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    throw new Error('Password must contain at least one special character (!@#$%^&*)');
  }

  // Name validation
  if (!firstName || firstName.length < 2) {
    throw new Error('First name must be at least 2 characters');
  }

  if (!lastName || lastName.length < 2) {
    throw new Error('Last name must be at least 2 characters');
  }

  // Phone validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
    throw new Error('Please enter a valid phone number');
  }

  // Terms acceptance
  if (!acceptedTerms) {
    throw new Error('You must accept the terms and conditions');
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Remember me option
 * @returns {Promise<Object>} - User data and token
 */
export const login = async (email, password, rememberMe = false) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email,
      password
    });

    // Store tokens
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      
      // Set longer expiry if remember me
      if (rememberMe) {
        // Token already has longer expiry from backend
      }
    }

    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
      refreshToken: response.data.refreshToken
    };
  } catch (error) {
    console.error('Login failed:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    }
    
    if (error.response?.status === 403) {
      throw new Error('Account is locked. Please contact support.');
    }
    
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * Login with Google
 * @param {string} token - Google OAuth token
 * @returns {Promise<Object>} - User data and token
 */
export const loginWithGoogle = async (token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/google`, {
      token
    });

    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }

    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
      refreshToken: response.data.refreshToken
    };
  } catch (error) {
    console.error('Google login failed:', error);
    throw new Error(error.response?.data?.message || 'Google login failed');
  }
};

/**
 * Login with Facebook
 * @param {string} token - Facebook OAuth token
 * @returns {Promise<Object>} - User data and token
 */
export const loginWithFacebook = async (token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/facebook`, {
      token
    });

    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }

    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
      refreshToken: response.data.refreshToken
    };
  } catch (error) {
    console.error('Facebook login failed:', error);
    throw new Error(error.response?.data?.message || 'Facebook login failed');
  }
};

/**
 * Login with Apple
 * @param {Object} appleData - Apple Sign-In data
 * @returns {Promise<Object>} - User data and token
 */
export const loginWithApple = async (appleData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/apple`, appleData);

    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }

    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
      refreshToken: response.data.refreshToken
    };
  } catch (error) {
    console.error('Apple login failed:', error);
    throw new Error(error.response?.data?.message || 'Apple login failed');
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  try {
    if (token) {
      await axios.post(`${API_BASE_URL}/logout`, {
        refreshToken
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Refresh access token
 * @returns {Promise<string>} - New access token
 */
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/refresh`, {
      refreshToken
    });

    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
    }

    return response.data.token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // Clear tokens on refresh failure
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    throw new Error('Session expired. Please login again.');
  }
};

/**
 * Get current user
 * @returns {Object|null} - Current user
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Get auth token
 * @returns {string|null} - Auth token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Verify email
 * @param {string} token - Verification token
 * @returns {Promise<boolean>} - Verification result
 */
export const verifyEmail = async (token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify-email`, {
      token
    });

    return response.data.verified;
  } catch (error) {
    console.error('Email verification failed:', error);
    throw new Error(error.response?.data?.message || 'Email verification failed');
  }
};

/**
 * Resend verification email
 * @param {string} email - User email
 * @returns {Promise<boolean>} - Success status
 */
export const resendVerificationEmail = async (email) => {
  try {
    await axios.post(`${API_BASE_URL}/resend-verification`, {
      email
    });

    return true;
  } catch (error) {
    console.error('Failed to resend verification:', error);
    throw new Error(error.response?.data?.message || 'Failed to resend verification email');
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<boolean>} - Success status
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/forgot-password`, {
      email
    });

    // Send password reset email
    await sendPasswordResetEmail(email, response.data.resetToken);

    return true;
  } catch (error) {
    console.error('Password reset request failed:', error);
    
    // Don't reveal if email exists for security
    return true;
  }
};

/**
 * Reset password
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - Success status
 */
export const resetPassword = async (token, newPassword) => {
  try {
    // Validate password
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    await axios.post(`${API_BASE_URL}/reset-password`, {
      token,
      newPassword
    });

    return true;
  } catch (error) {
    console.error('Password reset failed:', error);
    throw new Error(error.response?.data?.message || 'Password reset failed');
  }
};

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - Success status
 */
export const changePassword = async (currentPassword, newPassword) => {
  const token = getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    // Validate new password
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    await axios.post(`${API_BASE_URL}/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return true;
  } catch (error) {
    console.error('Password change failed:', error);
    throw new Error(error.response?.data?.message || 'Password change failed');
  }
};

/**
 * Update profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<Object>} - Updated user
 */
export const updateProfile = async (profileData) => {
  const token = getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Update stored user data
    if (response.data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }

    return response.data.user;
  } catch (error) {
    console.error('Profile update failed:', error);
    throw new Error(error.response?.data?.message || 'Profile update failed');
  }
};

/**
 * Delete account
 * @param {string} password - Password for confirmation
 * @returns {Promise<boolean>} - Success status
 */
export const deleteAccount = async (password) => {
  const token = getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    await axios.post(`${API_BASE_URL}/delete-account`, {
      password
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Clear local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    return true;
  } catch (error) {
    console.error('Account deletion failed:', error);
    throw new Error(error.response?.data?.message || 'Account deletion failed');
  }
};

/**
 * Check session validity
 * @returns {Promise<boolean>} - Session validity
 */
export const checkSession = async () => {
  const token = getToken();

  if (!token) {
    return false;
  }

  try {
    await axios.get(`${API_BASE_URL}/check-session`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        await refreshToken();
        return true;
      } catch {
        return false;
      }
    }
    
    return false;
  }
};

/**
 * Get user permissions
 * @returns {Promise<Array>} - User permissions
 */
export const getUserPermissions = async () => {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    return [];
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/permissions`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.permissions;
  } catch (error) {
    console.error('Failed to get permissions:', error);
    return [];
  }
};

/**
 * Setup 2FA
 * @returns {Promise<Object>} - 2FA setup data
 */
export const setup2FA = async () => {
  const token = getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/2fa/setup`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return {
      secret: response.data.secret,
      qrCode: response.data.qrCode
    };
  } catch (error) {
    console.error('2FA setup failed:', error);
    throw new Error(error.response?.data?.message || '2FA setup failed');
  }
};

/**
 * Verify 2FA
 * @param {string} token - 2FA token
 * @returns {Promise<boolean>} - Verification result
 */
export const verify2FA = async (token) => {
  const authToken = getToken();

  if (!authToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/2fa/verify`, {
      token
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    return response.data.verified;
  } catch (error) {
    console.error('2FA verification failed:', error);
    throw new Error(error.response?.data?.message || '2FA verification failed');
  }
};

/**
 * Disable 2FA
 * @param {string} token - 2FA token
 * @returns {Promise<boolean>} - Success status
 */
export const disable2FA = async (token) => {
  const authToken = getToken();

  if (!authToken) {
    throw new Error('Not authenticated');
  }

  try {
    await axios.post(`${API_BASE_URL}/2fa/disable`, {
      token
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    return true;
  } catch (error) {
    console.error('2FA disable failed:', error);
    throw new Error(error.response?.data?.message || '2FA disable failed');
  }
};

// Export all auth functions
export default {
  register,
  login,
  loginWithGoogle,
  loginWithFacebook,
  loginWithApple,
  logout,
  refreshToken,
  getCurrentUser,
  getToken,
  isAuthenticated,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  updateProfile,
  deleteAccount,
  checkSession,
  getUserPermissions,
  setup2FA,
  verify2FA,
  disable2FA
};
