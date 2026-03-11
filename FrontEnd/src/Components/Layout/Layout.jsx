// ===== src/Components/Layout/Layout.jsx =====
import React from 'react';
import { useLocation } from 'react-router-dom';
import PublicLayout from './PublicLayout';
import AuthLayout from './AuthLayout';
import AdminLayout from './AdminLayout';
import { ROUTES } from '../../Config/Routes';

/**
 * Layout Component - GOD MODE
 * Main layout wrapper that selects the appropriate layout based on route
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {Object} props.layoutProps - Layout-specific props
 */
const Layout = ({ children, layoutProps = {} }) => {
  const location = useLocation();
  const path = location.pathname;

  // Determine layout type based on route
  const getLayout = () => {
    // Admin routes
    if (path.startsWith('/admin') && path !== ROUTES.ADMIN_LOGIN) {
      return 'admin';
    }
    
    // Admin login already provides its own full-page layout styles.
    // Avoid double-wrapping it with AuthLayout.
    if (path === ROUTES.ADMIN_LOGIN) {
      return 'none';
    }
    
    // Public routes (default)
    return 'public';
  };

  const layoutType = getLayout();

  // Render appropriate layout
  switch (layoutType) {
    case 'admin':
      return (
        <AdminLayout {...layoutProps.admin}>
          {children}
        </AdminLayout>
      );

    case 'auth':
      return (
        <AuthLayout {...layoutProps.auth}>
          {children}
        </AuthLayout>
      );

    case 'none':
      return children;

    case 'public':
    default:
      return (
        <PublicLayout {...layoutProps.public}>
          {children}
        </PublicLayout>
      );
  }
};

export default Layout;
