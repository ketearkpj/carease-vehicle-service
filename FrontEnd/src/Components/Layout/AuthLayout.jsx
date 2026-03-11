import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../Config/Routes';
import '../../Styles/AuthLayout.css';

/**
 * AuthLayout Component
 * Layout wrapper for authentication pages.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-logo">
            <Link to={ROUTES.HOME} className="logo-text">
              CAR<span className="gold-text">EASE</span>
            </Link>
          </div>

          <div className="auth-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
