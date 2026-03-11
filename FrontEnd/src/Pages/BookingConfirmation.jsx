// ===== src/Pages/BookingConfirmation.jsx =====
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import LoadingSpinner from '../Components/Common/LoadingSpinner';

// Services
import { getBookingById } from '../Services/BookingService';
import { generateHTMLInvoice, downloadInvoice, printInvoice } from '../Utils/generalInvoice';

// Hooks
import { useApp } from '../Context/AppContext';

// Styles
import '../Styles/BookingConfirmation.css';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bookingId = queryParams.get('id');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addNotification } = useApp();

  useEffect(() => {
    if (!bookingId) {
      navigate(ROUTES.HOME);
      return;
    }

    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const data = await getBookingById(bookingId);
      setBooking(data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      setError('Unable to load booking details');
      addNotification('Failed to load booking details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!booking) return;

    const invoiceHTML = generateHTMLInvoice({
      invoiceNumber: `INV-${booking.id}`,
      bookingId: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      items: [{
        description: `${booking.serviceType} Service`,
        quantity: booking.duration || 1,
        unitPrice: booking.totalPrice / (booking.duration || 1),
        total: booking.totalPrice
      }],
      subtotal: booking.totalPrice,
      total: booking.totalPrice,
      paymentMethod: booking.paymentMethod,
      paymentStatus: 'Paid',
      paymentDate: new Date().toISOString()
    });

    downloadInvoice(invoiceHTML, `invoice-${booking.id}.html`, 'text/html');
    addNotification('Invoice downloaded successfully', 'success');
  };

  const handlePrintInvoice = () => {
    if (!booking) return;

    const invoiceHTML = generateHTMLInvoice({
      invoiceNumber: `INV-${booking.id}`,
      bookingId: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      items: [{
        description: `${booking.serviceType} Service`,
        quantity: booking.duration || 1,
        unitPrice: booking.totalPrice / (booking.duration || 1),
        total: booking.totalPrice
      }],
      subtotal: booking.totalPrice,
      total: booking.totalPrice,
      paymentMethod: booking.paymentMethod,
      paymentStatus: 'Paid',
      paymentDate: new Date().toISOString()
    });

    printInvoice(invoiceHTML);
  };

  if (loading) {
    return (
      <div className="confirmation-loading">
        <LoadingSpinner size="lg" color="gold" text="Loading confirmation..." />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="confirmation-error">
        <div className="error-icon">⚠️</div>
        <h2>Booking Not Found</h2>
        <p>{error || 'The booking you\'re looking for doesn\'t exist.'}</p>
        <Link to={ROUTES.HOME}>
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <div className="container">
        {/* Success Header */}
        <div className="confirmation-header">
          <div className="success-animation">
            <div className="success-circle">
              <div className="success-check">✓</div>
            </div>
          </div>
          <h1 className="confirmation-title">
            Booking <span className="gold-text">Confirmed!</span>
          </h1>
          <p className="confirmation-subtitle">
            Thank you for choosing CAR EASE. Your booking has been confirmed.
          </p>
        </div>

        {/* Booking Details */}
        <div className="confirmation-content">
          <Card className="details-card">
            <h2 className="card-title">Booking Details</h2>
            
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-icon">🔑</span>
                <div className="detail-info">
                  <span className="detail-label">Booking ID</span>
                  <span className="detail-value">{booking.id}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <div className="detail-info">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{new Date(booking.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">⏰</span>
                <div className="detail-info">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">{booking.time}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <div className="detail-info">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{booking.location?.name || 'Beverly Hills'}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">💳</span>
                <div className="detail-info">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">{booking.paymentMethod || 'Card'}</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">💰</span>
                <div className="detail-info">
                  <span className="detail-label">Total Amount</span>
                  <span className="detail-value total">${booking.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Service Details */}
          <Card className="service-card">
            <h2 className="card-title">Service Details</h2>
            
            <div className="service-details">
              <div className="service-header">
                <span className="service-icon">
                  {booking.serviceType === 'rental' ? '🚗' : 
                   booking.serviceType === 'car_wash' ? '🧼' :
                   booking.serviceType === 'repair' ? '🔧' : '💰'}
                </span>
                <div className="service-info">
                  <h3 className="service-name">{booking.serviceName || booking.serviceType}</h3>
                  <p className="service-description">{booking.description}</p>
                </div>
              </div>

              {booking.extras && booking.extras.length > 0 && (
                <div className="service-extras">
                  <h4 className="extras-title">Included Extras</h4>
                  <ul className="extras-list">
                    {booking.extras.map((extra, index) => (
                      <li key={index}>
                        <span className="extra-check">✓</span>
                        {extra.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Customer Information */}
          <Card className="customer-card">
            <h2 className="card-title">Customer Information</h2>
            
            <div className="customer-details">
              <div className="customer-item">
                <span className="customer-icon">👤</span>
                <div className="customer-info">
                  <span className="customer-label">Name</span>
                  <span className="customer-value">{booking.customerName}</span>
                </div>
              </div>

              <div className="customer-item">
                <span className="customer-icon">✉️</span>
                <div className="customer-info">
                  <span className="customer-label">Email</span>
                  <span className="customer-value">{booking.customerEmail}</span>
                </div>
              </div>

              <div className="customer-item">
                <span className="customer-icon">📞</span>
                <div className="customer-info">
                  <span className="customer-label">Phone</span>
                  <span className="customer-value">{booking.customerPhone}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="steps-card">
            <h2 className="card-title">Next Steps</h2>
            
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Check Your Email</h4>
                  <p>We've sent a confirmation email with all details to {booking.customerEmail}</p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Prepare for Your Service</h4>
                  <p>Review any requirements or documents needed for your appointment</p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Contact Us if Needed</h4>
                  <p>Our concierge team is available 24/7 for any questions</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="confirmation-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={handleDownloadInvoice}
            >
              Download Invoice
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrintInvoice}
            >
              Print Confirmation
            </Button>
            <Link to={ROUTES.HOME}>
              <Button variant="ghost" size="lg">
                Return Home
              </Button>
            </Link>
          </div>

          {/* Support Info */}
          <div className="support-info">
            <p>Need help? Contact our concierge team</p>
            <div className="support-links">
              <a href="tel:+18005550123">📞 +1 (800) 555-0123</a>
              <a href="mailto:support@carease.com">✉️ support@carease.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;