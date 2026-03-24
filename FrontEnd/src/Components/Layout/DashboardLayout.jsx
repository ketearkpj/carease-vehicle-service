import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../Config/Routes';
import { useAdminAuth } from '../../Hooks/useAdminAuth';
import {
  getAllBookings,
  getAllPayments,
  getAllVehicles,
  getAdminNotifications
} from '../../Services/AdminService';
import {
  getUnreadAdminNotificationCount,
  subscribeToAdminNotificationReads
} from '../../Utils/adminNotifications';
import '../../Styles/DashboardLayout.css';

// Icons as components
const Icons = {
  Dashboard: () => <span className="nav-icon">📊</span>,
  Bookings: () => <span className="nav-icon">📅</span>,
  Vehicles: () => <span className="nav-icon">🚗</span>,
  Payments: () => <span className="nav-icon">💰</span>,
  Reports: () => <span className="nav-icon">📈</span>,
  Settings: () => <span className="nav-icon">⚙️</span>,
  Earnings: () => <span className="nav-icon">💵</span>,
  Schedule: () => <span className="nav-icon">⏰</span>,
  Logout: () => <span className="nav-icon">🚪</span>,
  Notification: () => <span className="nav-icon">🔔</span>
};

/**
 * DashboardLayout Component - GOD MODE
 * Layout for admin and provider dashboards
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title
 * @param {string} props.role - User role ('admin' | 'provider')
 * @param {Object} props.user - User object (optional)
 */
const DashboardLayout = ({ 
  children, 
  title = 'Dashboard', 
  role = 'admin',
  user = null
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    bookings: null,
    vehicles: null,
    payments: null
  });
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [readVersion, setReadVersion] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { admin } = useAdminAuth();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (role !== 'admin') return undefined;

    let mounted = true;

    const fetchAdminSidebarData = async () => {
      try {
        const [bookings, vehicles, payments, notificationsResult] = await Promise.all([
          getAllBookings({ page: 1, limit: 1 }),
          getAllVehicles({ page: 1, limit: 1 }),
          getAllPayments({ page: 1, limit: 1 }),
          getAdminNotifications(250)
        ]);

        if (!mounted) return;

        setMetrics({
          bookings: Number(bookings?.total || 0),
          vehicles: Number(vehicles?.total || 0),
          payments: Number(payments?.total || 0)
        });
        setAdminNotifications(
          Array.isArray(notificationsResult?.notifications)
            ? notificationsResult.notifications
            : []
        );
      } catch (error) {
        if (!mounted) return;
        setMetrics({
          bookings: null,
          vehicles: null,
          payments: null
        });
        setAdminNotifications([]);
      }
    };

    fetchAdminSidebarData();
    const unsubscribe = subscribeToAdminNotificationReads(() => {
      if (!mounted) return;
      setReadVersion((prev) => prev + 1);
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [role, admin]);

  const handleLogout = () => {
    // Will be connected to auth service later
    console.log('Logging out...');
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const unreadCount = useMemo(() => {
    if (role !== 'admin') return 0;
    return getUnreadAdminNotificationCount(adminNotifications);
  }, [adminNotifications, readVersion, role]);

  const formatBadge = (value) => {
    if (value == null || value <= 0) return null;
    return value > 99 ? '99+' : String(value);
  };

  // Navigation items based on role
  const navItems = {
    admin: [
      { path: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: Icons.Dashboard },
      { path: ROUTES.ADMIN_BOOKINGS, label: 'Bookings', icon: Icons.Bookings, badge: formatBadge(metrics.bookings) },
      { path: ROUTES.ADMIN_VEHICLES, label: 'Vehicles', icon: Icons.Vehicles, badge: formatBadge(metrics.vehicles) },
      { path: ROUTES.ADMIN_PAYMENTS, label: 'Payments', icon: Icons.Payments, badge: formatBadge(metrics.payments) },
      { path: ROUTES.ADMIN_REPORTS, label: 'Reports', icon: Icons.Reports },
      { path: ROUTES.ADMIN_NOTIFICATIONS, label: 'Notifications', icon: Icons.Notification, badge: formatBadge(unreadCount) },
      { path: ROUTES.ADMIN_SETTINGS, label: 'Settings', icon: Icons.Settings }
    ],
    provider: [
      { path: ROUTES.HOME, label: 'Dashboard', icon: Icons.Dashboard },
      { path: ROUTES.MY_BOOKINGS, label: 'My Bookings', icon: Icons.Bookings, badge: 5 },
      { path: ROUTES.WISHLIST, label: 'My Vehicles', icon: Icons.Vehicles, badge: 8 },
      { path: ROUTES.CONTACT, label: 'Support', icon: Icons.Earnings },
      { path: ROUTES.SERVICES, label: 'Schedule', icon: Icons.Schedule },
      { path: ROUTES.PROFILE, label: 'Settings', icon: Icons.Settings }
    ]
  };

  const items = navItems[role] || navItems.admin;

  // Mock user data
  const userData = user || {
    name: role === 'admin' ? 'Admin User' : 'Provider User',
    email: role === 'admin' ? 'admin@carease.com' : 'provider@carease.com',
    avatar: null,
    role: role
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to={ROUTES.HOME} className="sidebar-logo">
            <span className="logo-full">CAR<span className="gold-text">EASE</span></span>
            <span className="logo-mini">CE</span>
          </Link>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {userData.avatar ? (
              <img src={userData.avatar} alt={userData.name} />
            ) : (
              <span className="avatar-initials">{getInitials(userData.name)}</span>
            )}
          </div>
          {sidebarOpen && (
            <div className="user-info">
              <h4>{userData.name}</h4>
              <p>{userData.email}</p>
              <span className="user-role">
                {role === 'admin' ? 'Administrator' : 'Service Provider'}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`sidebar-nav-link ${isActive(item.path)}`}
                >
                  <item.icon />
                  {sidebarOpen && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      {item.badge && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <Link to={ROUTES.ADMIN_NOTIFICATIONS} className={`sidebar-footer-item ${isActive(ROUTES.ADMIN_NOTIFICATIONS)}`}>
            <Icons.Notification />
            {sidebarOpen && (
              <>
                <span className="footer-text">Notifications</span>
                {unreadCount > 0 && (
                  <span className="footer-badge">{unreadCount}</span>
                )}
              </>
            )}
          </Link>
          <button 
            className="sidebar-footer-item logout-btn"
            onClick={handleLogout}
          >
            <Icons.Logout />
            {sidebarOpen && <span className="footer-text">Logout</span>}
          </button>
        </div>

        {/* Version Info */}
        {sidebarOpen && (
          <div className="sidebar-version">
            <p>© {new Date().getFullYear()} CAR EASE</p>
            <p>v1.0.0</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              ☰
            </button>
            <div className="header-title">
              <h1>{title}</h1>
              <p className="welcome-text">
                Welcome back, {userData.name.split(' ')[0]}!
              </p>
            </div>
          </div>

          <div className="header-right">
            <div className="header-notifications">
              <button className="notification-btn" onClick={() => navigate(ROUTES.ADMIN_NOTIFICATIONS)}>
                <Icons.Notification />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
            </div>
            <div className="header-date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="header-user">
              <div className="header-avatar">
                {userData.avatar ? (
                  <img src={userData.avatar} alt={userData.name} />
                ) : (
                  <span>{getInitials(userData.name)}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
