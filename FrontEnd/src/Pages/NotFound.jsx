// src/pages/Shared/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import '../Styles/Global.css';

const NotFound = () => {
  return (
    <Layout>
      <div className="not-found-page">
        <div className="not-found-content">
          <div className="not-found-animation">
            <span className="not-found-number">4</span>
            <span className="not-found-zero">0</span>
            <span className="not-found-number">4</span>
          </div>
          
          <h1 className="not-found-title">Page Not Found</h1>
          
          <p className="not-found-description">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          <div className="not-found-actions">
            <Link to="/">
              <button className="btn btn-gold btn-lg">
                Return Home
              </button>
            </Link>
            
            <Link to="/rentals">
              <button className="btn btn-outline btn-lg">
                Browse Vehicles
              </button>
            </Link>
          </div>

          <div className="not-found-suggestions">
            <h3>Popular Destinations</h3>
            <div className="suggestion-links">
              <Link to="/services">Services</Link>
              <Link to="/rentals">Rentals</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;