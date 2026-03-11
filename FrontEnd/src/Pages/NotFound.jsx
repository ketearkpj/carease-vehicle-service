// ===== src/Pages/NotFound.jsx =====
import React from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';

// Components
import Button from '../Components/Common/Button';

// Styles
import '../Styles/NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="error-code animate-float">404</div>
          
          <h1 className="error-title animate-fade-up">
            Page Not <span className="gold-text">Found</span>
          </h1>
          
          <p className="error-message animate-fade-up animate-delay-1">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="error-actions animate-fade-up animate-delay-2">
            <Link to={ROUTES.HOME}>
              <Button variant="primary" size="lg">
                Go to Homepage
              </Button>
            </Link>
            
            <Link to={ROUTES.CONTACT}>
              <Button variant="outline" size="lg">
                Contact Support
              </Button>
            </Link>
          </div>

          {/* Decorative Elements */}
          <div className="error-decoration">
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
            <div className="decoration-circle circle-3"></div>
            <div className="decoration-line line-1"></div>
            <div className="decoration-line line-2"></div>
          </div>
        </div>
      </div>

      {/* Background Particles */}
      <div className="error-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
    </div>
  );
};

export default NotFound;