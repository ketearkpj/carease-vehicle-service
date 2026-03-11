// ===== src/Hooks/useAuth.js =====
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  updateProfile,
  changePassword
} from '../Services/auth.service';
import { ROUTES } from '../Config/Routes';
import { useApp } from '../Context/AppContext';

/**
 * useAuth Hook - GOD MODE
 * Comprehensive user authentication hook
 * 
 * @returns {Object} - Auth state and methods
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { addNotification } = useApp();

  // Check existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(() => {
    const currentUser = getCurrentUser();
    const authenticated = isAuthenticated();
    
    if (authenticated && currentUser) {
      setUser(currentUser);
    }
    
    setInitializing(false);
  }, []);

  // Handle login
  const handleLogin = useCallback(async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await login(email, password, rememberMe);
      
      if (result.success) {
        setUser(result.user);
        addNotification(`Welcome back, ${result.user.firstName}!`, 'success');
        navigate(ROUTES.HOME);
        return result;
      }
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate, addNotification]);

  // Handle register
  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await register(userData);
      
      if (result.success) {
        setUser(result.user);
        addNotification('Registration successful! Please check your email to verify your account.', 'success');
        navigate(ROUTES.HOME);
        return result;
      }
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate, addNotification]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    setLoading(true);
    
    try {
      await logout();
      setUser(null);
      addNotification('Logged out successfully', 'info');
      navigate(ROUTES.HOME);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate, addNotification]);

  // Update profile
  const handleUpdateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await updateProfile(profileData);
      setUser(updatedUser);
      addNotification('Profile updated successfully', 'success');
      return updatedUser;
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Change password
  const handleChangePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      await changePassword(currentPassword, newPassword);
      addNotification('Password changed successfully', 'success');
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  return {
    // State
    user,
    loading,
    initializing,
    error,
    isAuthenticated: !!user,
    
    // Methods
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    
    // User info
    isAdmin: user?.role === 'admin',
    isSuperAdmin: user?.role === 'super_admin',
    isProvider: user?.role === 'provider',
    isCustomer: user?.role === 'customer'
  };
};

export default useAuth;