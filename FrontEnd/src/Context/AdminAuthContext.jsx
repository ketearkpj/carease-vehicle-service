// ===== src/Context/AdminAuthContext.jsx =====
import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from './AppContext';
import { adminLogin, verifyAdminToken, adminLogout } from '../Services/AdminService';
import { ROUTES } from '../Config/Routes';

// Create context
const AdminAuthContext = createContext(null);

/**
 * AdminAuthProvider Component - GOD MODE
 * Manages admin authentication state across the application
 */
export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const navigate = useNavigate();
  const { addNotification } = useApp();

  // Check existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Session expiry timer
  useEffect(() => {
    if (!sessionExpiry) return;

    const timeLeft = new Date(sessionExpiry) - new Date();
    if (timeLeft <= 0) {
      handleSessionExpiry();
      return;
    }

    const timer = setTimeout(() => {
      handleSessionExpiry();
    }, timeLeft);

    return () => clearTimeout(timer);
  }, [sessionExpiry]);

  // Activity tracking for auto-logout
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (!admin) return;

    const inactivityTimeout = 30 * 60 * 1000; // 30 minutes
    const checkInactivity = setInterval(() => {
      if (Date.now() - lastActivity > inactivityTimeout) {
        handleInactivityLogout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInactivity);
  }, [admin, lastActivity]);

  const checkExistingSession = useCallback(async () => {
    setInitializing(true);
    try {
      const result = await verifyAdminToken();
      
      if (result.valid) {
        setAdmin(result.admin);
        setPermissions(result.permissions || []);
        setSessionExpiry(result.expiry);
      }
    } catch (err) {
      console.error('Session check failed:', err);
    } finally {
      setInitializing(false);
    }
  }, []);

  const handleSessionExpiry = useCallback(() => {
    setAdmin(null);
    setPermissions([]);
    setSessionExpiry(null);
    addNotification('Your session has expired. Please login again.', 'warning');
    navigate(ROUTES.ADMIN_LOGIN);
  }, [navigate, addNotification]);

  const handleInactivityLogout = useCallback(() => {
    setAdmin(null);
    setPermissions([]);
    setSessionExpiry(null);
    addNotification('You have been logged out due to inactivity.', 'warning');
    navigate(ROUTES.ADMIN_LOGIN);
  }, [navigate, addNotification]);

  /**
   * Admin login
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @param {boolean} rememberMe - Remember me option
   */
  const login = useCallback(async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminLogin(email, password);

      if (result.success) {
        setAdmin(result.admin);
        setPermissions(result.permissions || []);

        // Set session expiry
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000);
        setSessionExpiry(expiryDate);
        setLastActivity(Date.now());

        addNotification(`Welcome back, ${result.admin.name}!`, 'success');
        navigate(ROUTES.ADMIN_DASHBOARD);

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

  /**
   * Admin logout
   */
  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await adminLogout();

      setAdmin(null);
      setPermissions([]);
      setSessionExpiry(null);

      addNotification('Logged out successfully', 'info');
      navigate(ROUTES.ADMIN_LOGIN);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate, addNotification]);

  /**
   * Check if admin has permission
   * @param {string} permission - Permission to check
   */
  const hasPermission = useCallback((permission) => {
    if (!admin) return false;
    return permissions.includes(permission);
  }, [admin, permissions]);

  /**
   * Check if admin has any of the given permissions
   * @param {Array} permissionList - List of permissions
   */
  const hasAnyPermission = useCallback((permissionList) => {
    if (!admin) return false;
    return permissionList.some(p => permissions.includes(p));
  }, [admin, permissions]);

  /**
   * Check if admin has all of the given permissions
   * @param {Array} permissionList - List of permissions
   */
  const hasAllPermissions = useCallback((permissionList) => {
    if (!admin) return false;
    return permissionList.every(p => permissions.includes(p));
  }, [admin, permissions]);

  /**
   * Check if admin has role
   * @param {string} role - Role to check
   */
  const hasRole = useCallback((role) => {
    if (!admin) return false;
    return admin.role === role;
  }, [admin]);

  /**
   * Refresh admin session
   */
  const refreshSession = useCallback(async () => {
    try {
      const result = await verifyAdminToken();

      if (result.valid) {
        setAdmin(result.admin);
        setPermissions(result.permissions || []);
        setSessionExpiry(result.expiry);
        setLastActivity(Date.now());
        return true;
      }

      return false;
    } catch (err) {
      console.error('Session refresh failed:', err);
      return false;
    }
  }, []);

  /**
   * Update admin profile
   * @param {Object} profileData - Profile data to update
   */
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      // This would call an API to update profile
      setAdmin(prev => ({ ...prev, ...profileData }));
      addNotification('Profile updated successfully', 'success');
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const value = useMemo(() => ({
    // State
    admin,
    loading,
    initializing,
    error,
    permissions,
    sessionExpiry,
    lastActivity,
    isAuthenticated: !!admin,
    isAdmin: hasRole('admin'),
    isSuperAdmin: hasRole('super_admin'),

    // Methods
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    refreshSession,
    updateProfile,

    // Convenience aliases
    can: hasPermission,
    canAny: hasAnyPermission,
    canAll: hasAllPermissions
  }), [
    admin, loading, initializing, error, permissions, sessionExpiry,
    lastActivity, login, logout, hasPermission, hasAnyPermission,
    hasAllPermissions, hasRole, refreshSession, updateProfile
  ]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

/**
 * useAdminAuth Hook - Custom hook to use AdminAuthContext
 * @returns {Object} - Admin auth context value
 * @throws {Error} - If used outside of AdminAuthProvider
 */
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  
  return context;
};

export default AdminAuthContext;