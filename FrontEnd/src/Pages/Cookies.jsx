import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../Components/Common/Card';
import { ROUTES } from '../Config/Routes';
import '../Styles/InfoPages.css';

const Cookies = () => (
  <div className="info-page">
    <div className="info-page-shell">
      <div className="info-page-hero">
        <h1 className="info-page-title">Cookie Policy</h1>
        <p className="info-page-subtitle">
          CAR EASE uses cookies to keep bookings secure, remember preferences, and improve service performance.
        </p>
      </div>

      <div className="info-page-grid">
        <Card className="info-page-card">
          <h2>What We Use</h2>
          <ul className="info-page-list">
            <li>Essential session cookies for checkout and admin access</li>
            <li>Preference cookies for theme and UI settings</li>
            <li>Performance cookies for reliability and troubleshooting</li>
          </ul>
        </Card>
        <Card className="info-page-card">
          <h2>Your Controls</h2>
          <ul className="info-page-list">
            <li>Clear browser cookies at any time</li>
            <li>Block non-essential cookies through browser settings</li>
            <li>Contact support for any privacy concern</li>
          </ul>
        </Card>
      </div>

      <div className="info-page-actions">
        <Link to={ROUTES.PRIVACY}>Back to Privacy Policy</Link>
      </div>
    </div>
  </div>
);

export default Cookies;
