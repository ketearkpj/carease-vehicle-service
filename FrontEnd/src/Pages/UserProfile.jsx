import React from 'react';
import Card from '../Components/Common/Card';
import { getCurrentUser } from '../Services/AuthService';
import '../Styles/InfoPages.css';

const UserProfile = () => {
  const user = getCurrentUser();

  return (
    <div className="info-page">
      <div className="info-page-shell">
        <div className="info-page-hero">
          <h1 className="info-page-title">My Profile</h1>
          <p className="info-page-subtitle">Current customer account information available in this session.</p>
        </div>

        <Card className="info-page-card">
          {user ? (
            <ul className="info-page-list">
              <li>Name: {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Not provided'}</li>
              <li>Email: {user.email || 'Not provided'}</li>
              <li>Phone: {user.phone || 'Not provided'}</li>
              <li>Role: {user.role || 'customer'}</li>
            </ul>
          ) : (
            <p>No authenticated customer profile is stored locally yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
