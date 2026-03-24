import React from 'react';
import Card from '../Components/Common/Card';
import '../Styles/InfoPages.css';

const Press = () => (
  <div className="info-page">
    <div className="info-page-shell">
      <div className="info-page-hero">
        <h1 className="info-page-title">Press & Media</h1>
        <p className="info-page-subtitle">
          Official company summary and media-ready talking points for the CarEase platform.
        </p>
      </div>

      <div className="info-page-grid">
        <Card className="info-page-card">
          <h2>Company Snapshot</h2>
          <p>CarEase is a full-stack automotive services platform covering rentals, detailing, repairs, sales, booking, payments, and admin reporting.</p>
        </Card>
        <Card className="info-page-card">
          <h2>Media Contacts</h2>
          <p>For interviews, demos, or feature requests, use the main support and careers channels already published in the app documentation.</p>
        </Card>
      </div>
    </div>
  </div>
);

export default Press;
