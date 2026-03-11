// ===== src/Components/Layout/PublicLayout.jsx =====
import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import '../../Styles/PublicLayout.css';

/**
 * PublicLayout Component - GOD MODE
 * Layout for public pages (home, services, about, contact)
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {boolean} props.showNavbar - Show navbar
 * @param {boolean} props.showFooter - Show footer
 * @param {string} props.className - Additional CSS classes
 */
const PublicLayout = ({ 
  children, 
  showNavbar = true, 
  showFooter = true,
  className = '',
  ...props 
}) => {
  return (
    <div className={`public-layout ${className}`} {...props}>
      {showNavbar && <NavBar />}
      
      <main className="public-layout-main">
        <div className="public-layout-content">
          {children}
        </div>
      </main>
      
      {showFooter && <Footer />}
      
      {/* Decorative Elements */}
      <div className="layout-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      <div className="layout-glow"></div>
    </div>
  );
};

export default PublicLayout;
