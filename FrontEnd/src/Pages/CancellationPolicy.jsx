import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../Components/Common/Card';
import { ROUTES } from '../Config/Routes';
import '../Styles/InfoPages.css';

const CancellationPolicy = () => (
  <div className="info-page">
    <div className="info-page-shell">
      <div className="info-page-hero">
        <h1 className="info-page-title">Cancellation Policy</h1>
        <p className="info-page-subtitle">
          Cancellation and refund timelines vary by service type, booking stage, and operational costs already incurred.
        </p>
      </div>

      <div className="info-page-grid">
        <Card className="info-page-card">
          <h2>General Rules</h2>
          <ul className="info-page-list">
            <li>Rentals: full refund typically requires at least 48 hours notice</li>
            <li>Car wash and detailing: same-day cancellations may incur a fee</li>
            <li>Repairs and inspections: technician allocation may affect refund amount</li>
            <li>Vehicle sales inquiries and test drives are reviewed case by case</li>
          </ul>
        </Card>
        <Card className="info-page-card">
          <h2>Need Help?</h2>
          <p>Use the contact page for urgent changes, refund follow-up, or support with a booking already in progress.</p>
          <div className="info-page-actions">
            <Link to={ROUTES.CONTACT}>Contact Support</Link>
            <Link to={ROUTES.TERMS}>View Terms</Link>
          </div>
        </Card>
      </div>
    </div>
  </div>
);

export default CancellationPolicy;
