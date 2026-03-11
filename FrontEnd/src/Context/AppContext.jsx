// ===== src/Context/AppContext.jsx =====
import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';

// Create context
const AppContext = createContext(null);

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Theme options
export const THEME_OPTIONS = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system'
};

/**
 * AppProvider Component - GOD MODE
 * Manages global application state
 */
export const AppProvider = ({ children }) => {
  const resolveInitialTheme = () => {
    const saved = localStorage.getItem('carease_theme');
    // Force dark-first startup to avoid stale light-theme artifacts from older builds.
    if (saved === THEME_OPTIONS.DARK || saved === THEME_OPTIONS.SYSTEM) {
      return saved;
    }
    return THEME_OPTIONS.DARK;
  };

  const getAppliedTheme = (selectedTheme) => {
    if (selectedTheme === THEME_OPTIONS.SYSTEM) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? THEME_OPTIONS.DARK
        : THEME_OPTIONS.LIGHT;
    }
    return selectedTheme;
  };

  // ===== STATE =====
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState(resolveInitialTheme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalStack, setModalStack] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const [pageTitle, setPageTitle] = useState('CAR EASE');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [userPreferences, setUserPreferences] = useState(() => {
    const saved = localStorage.getItem('carease_preferences');
    return saved ? JSON.parse(saved) : {
      animations: true,
      compactMode: false,
      fontSize: 'medium',
      reducedMotion: false
    };
  });

  // ===== EFFECTS =====

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const appliedTheme = getAppliedTheme(theme);
    root.setAttribute('data-theme', appliedTheme);
    localStorage.setItem('carease_theme', theme);
    
    // Apply reduced motion if preference set
    if (userPreferences.reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }
  }, [theme, userPreferences.reducedMotion]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => {
      setOnlineStatus(false);
      addNotification('You are offline. Some features may be unavailable.', NOTIFICATION_TYPES.WARNING);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('carease_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  // ===== NOTIFICATION METHODS =====

  /**
   * Add a notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {number} duration - Auto-close duration (ms), 0 for no auto-close
   * @returns {string} - Notification ID
   */
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  /**
   * Remove a notification
   * @param {string} id - Notification ID
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   */
  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  // ===== MODAL METHODS =====

  /**
   * Open a modal
   * @param {string} id - Modal ID
   * @param {Object} props - Modal props
   */
  const openModal = useCallback((id, props = {}) => {
    setModalStack(prev => [...prev, { id, props, timestamp: Date.now() }]);
  }, []);

  /**
   * Close a modal
   * @param {string} id - Modal ID
   */
  const closeModal = useCallback((id) => {
    setModalStack(prev => prev.filter(modal => modal.id !== id));
  }, []);

  /**
   * Close the top modal
   */
  const closeTopModal = useCallback(() => {
    setModalStack(prev => prev.slice(0, -1));
  }, []);

  /**
   * Close all modals
   */
  const closeAllModals = useCallback(() => {
    setModalStack([]);
  }, []);

  // ===== PREFERENCES METHODS =====

  /**
   * Update user preferences
   * @param {Object} newPreferences - New preferences
   */
  const updatePreferences = useCallback((newPreferences) => {
    setUserPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
  }, []);

  /**
   * Toggle theme
   */
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === THEME_OPTIONS.DARK ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK);
  }, []);

  /**
   * Toggle sidebar
   */
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // ===== BREADCRUMB METHODS =====

  /**
   * Set breadcrumbs
   * @param {Array} items - Breadcrumb items
   */
  const setBreadcrumbItems = useCallback((items) => {
    setBreadcrumbs(items);
  }, []);

  /**
   * Add breadcrumb item
   * @param {Object} item - Breadcrumb item
   */
  const addBreadcrumbItem = useCallback((item) => {
    setBreadcrumbs(prev => [...prev, item]);
  }, []);

  /**
   * Clear breadcrumbs
   */
  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbs([]);
  }, []);

  // ===== COMPUTED PROPERTIES =====

  // Unread notifications count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Current modal
  const currentModal = useMemo(() => {
    return modalStack[modalStack.length - 1] || null;
  }, [modalStack]);

  // Is any modal open
  const isModalOpen = useMemo(() => {
    return modalStack.length > 0;
  }, [modalStack]);

  // Context value
  const value = useMemo(() => ({
    // State
    isLoading,
    setIsLoading,
    notifications,
    theme,
    sidebarCollapsed,
    modalStack,
    onlineStatus,
    pageTitle,
    breadcrumbs,
    userPreferences,
    unreadCount,
    currentModal,
    isModalOpen,

    // Notification methods
    addNotification,
    removeNotification,
    clearNotifications,
    markAsRead,
    markAllAsRead,

    // Modal methods
    openModal,
    closeModal,
    closeTopModal,
    closeAllModals,

    // Preference methods
    setTheme,
    toggleTheme,
    toggleSidebar,
    updatePreferences,

    // Breadcrumb methods
    setPageTitle,
    setBreadcrumbItems,
    addBreadcrumbItem,
    clearBreadcrumbs,

    // Helper methods
    isOnline: onlineStatus,
    isOffline: !onlineStatus
  }), [
    isLoading, notifications, theme, sidebarCollapsed, modalStack,
    onlineStatus, pageTitle, breadcrumbs, userPreferences, unreadCount,
    currentModal, isModalOpen, addNotification, removeNotification,
    clearNotifications, markAsRead, markAllAsRead, openModal, closeModal,
    closeTopModal, closeAllModals, toggleTheme, toggleSidebar,
    updatePreferences, setBreadcrumbItems, addBreadcrumbItem,
    clearBreadcrumbs, setPageTitle
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * useApp Hook - Custom hook to use AppContext
 * @returns {Object} - App context value
 * @throws {Error} - If used outside of AppProvider
 */
export const useApp = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};

// Convenience hooks for specific features
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications, unreadCount } = useApp();
  return { notifications, addNotification, removeNotification, clearNotifications, unreadCount };
};

export const useModals = () => {
  const { openModal, closeModal, closeTopModal, closeAllModals, currentModal, isModalOpen } = useApp();
  return { openModal, closeModal, closeTopModal, closeAllModals, currentModal, isModalOpen };
};

export const useTheme = () => {
  const { theme, setTheme, toggleTheme, userPreferences, updatePreferences } = useApp();
  return { theme, setTheme, toggleTheme, userPreferences, updatePreferences };
};

export default AppContext;
