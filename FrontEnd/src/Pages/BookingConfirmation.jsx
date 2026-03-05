// src/pages/Booking/BookingConfirmation.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import EmailStatusAlert from '../Components/Features/EmailStatusAlert';
import '../Styles/Booking.css';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showEmailAlert, setShowEmailAlert] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(location.state?.booking || null);

  useEffect(() => {
    if (!bookingDetails) {
      navigate('/rentals');
    }
  }, [bookingDetails, navigate]);

  if (!bookingDetails) return null;

  return (
    <Layout>
      <div className="booking-page">
        {showEmailAlert && (
          <EmailStatusAlert
            type="success"
            message="Booking confirmation sent to your email!"
            details="Check your inbox for the receipt and booking details."
            onClose={() => setShowEmailAlert(false)}
          />
        )}

        <div className="booking-container">
          <div className="booking-confirmation">
            <div className="confirmation-icon">✨</div>
            <h1 className="confirmation-title">Thank You for Choosing CAR EASE</h1>
            <p className="confirmation-message">
              Your booking has been confirmed. A confirmation email has been sent.
            </p>

            <div className="confirmation-card">
              <h3>Booking Summary</h3>
              
              <div className="confirmation-details">
                <div className="detail-group">
                  <h4>Vehicle</h4>
                  <p>{bookingDetails.vehicle.name}</p>
                  <p className="detail-sub">{bookingDetails.vehicle.category}</p>
                </div>

                <div className="detail-group">
                  <h4>Dates</h4>
                  <p>{bookingDetails.startDate} - {bookingDetails.endDate}</p>
                  <p className="detail-sub">{bookingDetails.days} days</p>
                </div>

                <div className="detail-group">
                  <h4>Delivery</h4>
                  <p>{bookingDetails.deliveryMethod}</p>
                  <p className="detail-sub">{bookingDetails.address || 'Showroom pickup'}</p>
                </div>

                <div className="detail-group">
                  <h4>Payment</h4>
                  <p>{bookingDetails.paymentMethod}</p>
                  <p className="detail-sub">Total: ${bookingDetails.total}</p>
                </div>
              </div>

              <div className="confirmation-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate('/rentals')}
                >
                  Browse More Vehicles
                </button>
                <button 
                  className="btn btn-gold"
                  onClick={() => window.print()}
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingConfirmation;