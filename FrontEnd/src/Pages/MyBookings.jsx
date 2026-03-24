import React, { useEffect, useState } from 'react';
import Card from '../Components/Common/Card';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import { getCurrentUser } from '../Services/AuthService';
import { getUserBookings } from '../Services/BookingService';
import { formatCurrency, formatDate } from '../Utils/format';
import '../Styles/InfoPages.css';

const MyBookings = () => {
  const user = getCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(Boolean(user?.email));

  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.email) return;
      try {
        const rows = await getUserBookings(user.email);
        setBookings(Array.isArray(rows) ? rows : []);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user?.email]);

  return (
    <div className="info-page">
      <div className="info-page-shell">
        <div className="info-page-hero">
          <h1 className="info-page-title">My Bookings</h1>
          <p className="info-page-subtitle">A customer-facing view of bookings currently available for this account.</p>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading bookings..." />
        ) : (
          <div className="info-page-grid">
            {bookings.length > 0 ? bookings.map((booking) => (
              <Card className="info-page-card" key={booking.id}>
                <h3>{booking.bookingNumber || booking.id}</h3>
                <ul className="info-page-list">
                  <li>Service: {booking.serviceType || 'N/A'}</li>
                  <li>Status: {booking.status || 'pending'}</li>
                  <li>Date: {formatDate(booking.startDate || booking.createdAt)}</li>
                  <li>Total: {formatCurrency(booking.totalAmount || booking.totalPrice || 0)}</li>
                </ul>
              </Card>
            )) : (
              <Card className="info-page-card">
                <p>No bookings found for the current user session.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
