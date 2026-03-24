// ===== src/Components/Admin/AdminSidebar.jsx =====
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../Context/AdminAuthContext';
import { ROUTES } from '../../Config/Routes';
import {
  getAllBookings,
  getAllPayments,
  getAllVehicles,
  getAdminNotifications
} from '../../Services/AdminService';
import '../../Styles/AdminSidebar.css';

/**
 * AdminSidebar Component - GOD MODE
 * Collapsible sidebar with navigation and user info
 * 
 * @param {Object} props
 * @param {boolean} props.collapsed - Sidebar collapsed state
 * @param {Function} props.onToggle - Toggle handler
 * @param {boolean} props.mobile - Mobile mode
 * @param {Function} props.onClose - Close handler for mobile
 */
const AdminSidebar = ({ 
  collapsed = false, 
  onToggle,
  mobile = false,
  onClose 
}) => {
  const [activeItem, setActiveItem] = useState(null);
  const [metrics, setMetrics] = useState({
    bookings: null,
    payments: null,
    vehicles: null,
    notifications: null
  });
  const { admin, logout } = useAdminAuth();
  const location = useLocation();

  useEffect(() => {
    // Find active menu item based on current path
    const findActiveItem = () => {
      for (const section of navigation) {
        const item = section.items.find(item => 
          location.pathname === item.path || 
          (item.path !== ROUTES.ADMIN_DASHBOARD && location.pathname.startsWith(item.path))
        );
        if (item) return item.id;
      }
      return null;
    };

    setActiveItem(findActiveItem());
  }, [location]);

  useEffect(() => {
    let mounted = true;

    const fetchSidebarMetrics = async () => {
      try {
        const [bookings, payments, vehicles, notifications] = await Promise.all([
          getAllBookings({ page: 1, limit: 1 }),
          getAllPayments({ page: 1, limit: 1 }),
          getAllVehicles({ page: 1, limit: 1 }),
          getAdminNotifications(50)
        ]);

        if (!mounted) return;

        setMetrics({
          bookings: Number(bookings?.total || 0),
          payments: Number(payments?.total || 0),
          vehicles: Number(vehicles?.total || 0),
          notifications: Number(notifications?.total || 0)
        });
      } catch (error) {
        if (!mounted) return;
        setMetrics({
          bookings: null,
          payments: null,
          vehicles: null,
          notifications: null
        });
      }
    };

    fetchSidebarMetrics();

    return () => {
      mounted = false;
    };
  }, [admin]);

  const formatBadge = (value) => {
    if (value == null) return null;
    if (value > 99) return '99+';
    return String(value);
  };

  const navigation = [
    {
      id: 'dashboard',
      section: 'Main',
      items: [
        { 
          id: 'dashboard', 
          path: ROUTES.ADMIN_DASHBOARD, 
          label: 'Dashboard', 
          icon: '📊',
          description: 'Overview and analytics'
        },
        { 
          id: 'bookings', 
          path: ROUTES.ADMIN_BOOKINGS, 
          label: 'Bookings', 
          icon: '📅',
          description: 'Manage all bookings',
          badge: formatBadge(metrics.bookings)
        },
        { 
          id: 'payments', 
          path: ROUTES.ADMIN_PAYMENTS, 
          label: 'Payments', 
          icon: '💰',
          description: 'Transaction management',
          badge: formatBadge(metrics.payments)
        },
        {
          id: 'notifications',
          path: ROUTES.ADMIN_NOTIFICATIONS,
          label: 'Notifications',
          icon: '🔔',
          description: 'Operational alerts',
          badge: formatBadge(metrics.notifications)
        }
      ]
    },
    {
      id: 'management',
      section: 'Management',
      items: [
        { 
          id: 'vehicles', 
          path: ROUTES.ADMIN_VEHICLES, 
          label: 'Vehicles', 
          icon: '🚗',
          description: 'Vehicle inventory',
          badge: formatBadge(metrics.vehicles)
        },
        { 
          id: 'reports-shortcut',
          path: ROUTES.ADMIN_REPORTS,
          label: 'Reports',
          icon: '📍',
          description: 'Business insights'
        }
      ]
    },
    {
      id: 'reports',
      section: 'Reports',
      items: [
        { 
          id: 'analytics', 
          path: ROUTES.ADMIN_REPORTS, 
          label: 'Analytics', 
          icon: '📈',
          description: 'Business intelligence'
        },
        { 
          id: 'audit', 
          path: ROUTES.ADMIN_AUDIT, 
          label: 'Audit Logs', 
          icon: '📋',
          description: 'System activity'
        },
        { 
          id: 'exports',
          path: ROUTES.ADMIN_REPORTS,
          label: 'Exports',
          icon: '📎',
          description: 'Export reports'
        }
      ]
    },
    {
      id: 'settings',
      section: 'Settings',
      items: [
        { 
          id: 'settings', 
          path: ROUTES.ADMIN_SETTINGS, 
          label: 'System Settings', 
          icon: '⚙️',
          description: 'Configuration'
        },
        { 
          id: 'profile', 
          path: ROUTES.ADMIN_SETTINGS, 
          label: 'Profile', 
          icon: '👤',
          description: 'Account settings'
        }
      ]
    }
  ];

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    if (mobile && onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobile ? 'mobile' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <Link to={ROUTES.ADMIN_DASHBOARD} className="sidebar-logo" onClick={() => mobile && onClose && onClose()}>
          <span className="logo-text">CAR<span className="gold-text">EASE</span></span>
          {!collapsed && <span className="logo-badge">Admin</span>}
        </Link>
        
        {!mobile && (
          <button 
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="toggle-icon">{collapsed ? '→' : '←'}</span>
          </button>
        )}
      </div>

      {/* User Info */}
      {admin && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {admin.avatar ? (
              <img src={admin.avatar} alt={admin.name} />
            ) : (
              <span className="avatar-placeholder">
                {admin.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{admin.name}</span>
              <span className="user-role">
                {admin.role === 'super_admin' ? 'Super Admin' : 'Administrator'}
              </span>
              <span className="user-email">{admin.email}</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navigation.map(section => (
          <div key={section.id} className="nav-section">
            {!collapsed && (
              <h3 className="nav-section-title">{section.section}</h3>
            )}
            <ul className="nav-items">
              {section.items.map(item => (
                <li key={item.id} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="nav-label">{item.label}</span>
                        {item.badge && (
                          <span className="nav-badge">{item.badge}</span>
                        )}
                      </>
                    )}
                    {!collapsed && item.description && (
                      <span className="nav-tooltip">{item.description}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          {!collapsed && <span className="logout-label">Logout</span>}
        </button>
        
        {!collapsed && (
          <div className="sidebar-footer-info">
            <span className="version">v1.0.0</span>
            <span className="copyright">© CAR EASE</span>
          </div>
        )}
      </div>

      {/* Mobile Close Button */}
      {mobile && (
        <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
          ×
        </button>
      )}
    </aside>
  );
};

export default AdminSidebar;
