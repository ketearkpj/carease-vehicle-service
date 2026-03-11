// ===== src/Components/Layout/AdminLayout.jsx =====
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../Context/AdminAuthContext';
import DashboardLayout from './DashboardLayout';
import LoadingSpinner from '../Common/LoadingSpinner';
import { ROUTES } from '../../Config/Routes';
import '../../Styles/AdminLayout.css';

/**
 * AdminLayout Component - GOD MODE
 * Layout for admin pages with authentication
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title
 * @param {Array} props.breadcrumbs - Breadcrumb items
 * @param {Array} props.actions - Action buttons
 * @param {string} props.requiredPermission - Required permission
 * @param {string} props.className - Additional CSS classes
 */
const AdminLayout = ({ 
  children, 
  title,
  breadcrumbs = [],
  actions = [],
  requiredPermission,
  className = '',
  ...props 
}) => {
  const { isAuthenticated, isAdmin, isSuperAdmin, loading, initializing, hasPermission } = useAdminAuth();
  const navigate = useNavigate();

  // Check authentication and permissions
  useEffect(() => {
    if (!initializing && !loading) {
      if (!isAuthenticated) {
        navigate(ROUTES.ADMIN_LOGIN);
      } else if (!isAdmin && !isSuperAdmin) {
        navigate(ROUTES.HOME);
      } else if (requiredPermission && !hasPermission(requiredPermission)) {
        navigate(ROUTES.ADMIN_DASHBOARD);
      }
    }
  }, [initializing, loading, isAuthenticated, isAdmin, isSuperAdmin, hasPermission, requiredPermission, navigate]);

  // Show loading while checking auth
  if (initializing || loading) {
    return (
      <div className="admin-loading">
        <LoadingSpinner size="lg" color="gold" text="Verifying access..." />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || (!isAdmin && !isSuperAdmin)) {
    return null;
  }

  // Check permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="admin-unauthorized">
        <div className="unauthorized-content">
          <span className="unauthorized-icon">🔒</span>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={title}
      breadcrumbs={[
        { label: 'Admin', path: ROUTES.ADMIN_DASHBOARD },
        ...breadcrumbs
      ]}
      actions={actions}
      className={className}
      {...props}
    >
      {children}
    </DashboardLayout>
  );
};

export default AdminLayout;
