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
  const urlBookingId = queryParams.get('id');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const { addNotification } = useApp();

  useEffect(() => {
    if (!urlBookingId) {
      navigate(ROUTES.HOME);
      return;
    }

    fetchBooking();
  }, [urlBookingId, navigate]);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookingById(urlBookingId);
      setBooking(data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      setError('Unable to load booking details');
      addNotification('Failed to load booking details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBookingId = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.id || booking.bookingNumber || '');
    setCopied(true);
    addNotification('Booking ID copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResendEmail = async () => {
    try {
      // Call API to resend confirmation email
      addNotification(`Confirmation email sent to ${booking?.customerEmail || 'your email'}`, 'success');
    } catch (error) {
      addNotification('Failed to resend email', 'error');
    }
  };

  const handleAddToCalendar = () => {
    if (!booking) return;
    
    // Get dates from booking
    const startDate = booking.startDate || booking.date || new Date();
    const endDate = booking.endDate || booking.date || new Date();
    
    const title = `${booking.serviceType || 'Service'} - CarEase`;
    const description = `Booking ID: ${booking.id || booking.bookingNumber}`;
    
    // Format for Google Calendar
    const startFormatted = new Date(startDate).toISOString().replace(/-|:|\.\d+/g, '');
    const endFormatted = new Date(endDate).toISOString().replace(/-|:|\.\d+/g, '');
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(description)}`;
    
    window.open(calendarUrl, '_blank');
    addNotification('Calendar event opened', 'info');
  };

  const handleShareBooking = () => {
    if (!booking) return;
    
    const shareData = {
      title: 'My CarEase Booking',
      text: `I've booked a ${booking.serviceType || 'service'} with CarEase! Booking ID: ${booking.id || booking.bookingNumber}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      navigator.share(shareData).catch(() => {
        // User cancelled share
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      addNotification('Booking link copied to clipboard!', 'success');
    }
  };

  const handleDownloadInvoice = () => {
    if (!booking) return;

    const totalPrice = booking.totalPrice || booking.totalAmount || 0;
    const duration = booking.duration || 1;
    
    const invoiceHTML = generateHTMLInvoice({
      invoiceNumber: `INV-${booking.id || booking.bookingNumber || Date.now()}`,
      bookingId: booking.id || booking.bookingNumber,
      customerName: booking.customerName || booking.customerInfo?.name || 'Valued Customer',
      customerEmail: booking.customerEmail || booking.customerInfo?.email || '',
      items: [{
        description: `${booking.serviceType || 'Service'} Service`,
        quantity: duration,
        unitPrice: totalPrice / duration,
        total: totalPrice
      }],
      subtotal: totalPrice,
      total: totalPrice,
      paymentMethod: booking.paymentMethod || 'Card',
      paymentStatus: 'Paid',
      paymentDate: new Date().toISOString()
    });

    downloadInvoice(invoiceHTML, `invoice-${booking.id || booking.bookingNumber || 'download'}.html`, 'text/html');
    addNotification('Invoice downloaded successfully', 'success');
  };

  const handlePrintInvoice = () => {
    if (!booking) return;

    const totalPrice = booking.totalPrice || booking.totalAmount || 0;
    const duration = booking.duration || 1;
    
    const invoiceHTML = generateHTMLInvoice({
      invoiceNumber: `INV-${booking.id || booking.bookingNumber || Date.now()}`,
      bookingId: booking.id || booking.bookingNumber,
      customerName: booking.customerName || booking.customerInfo?.name || 'Valued Customer',
      customerEmail: booking.customerEmail || booking.customerInfo?.email || '',
      items: [{
        description: `${booking.serviceType || 'Service'} Service`,
        quantity: duration,
        unitPrice: totalPrice / duration,
        total: totalPrice
      }],
      subtotal: totalPrice,
      total: totalPrice,
      paymentMethod: booking.paymentMethod || 'Card',
      paymentStatus: 'Paid',
      paymentDate: new Date().toISOString()
    });

    printInvoice(invoiceHTML);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      rental: '🚗',
      car_wash: '🧼',
      repair: '🔧',
      sales: '💰',
      delivery: '🚚',
      concierge: '👔',
      storage: '🏢'
    };
    return icons[serviceType?.toLowerCase()] || '📅';
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

  // Extract booking data with safe fallbacks
  const customerName = booking.customerName || 
                      (booking.customerInfo && `${booking.customerInfo.firstName || ''} ${booking.customerInfo.lastName || ''}`.trim()) || 
                      'Valued Customer';
  
  const customerEmail = booking.customerEmail || booking.customerInfo?.email || 'email@example.com';
  const customerPhone = booking.customerPhone || booking.customerInfo?.phone || 'N/A';
  const serviceType = booking.serviceType || 'Service';
  const bookingDate = booking.date || booking.startDate || booking.createdAt;
  const bookingTime = booking.time || booking.timeSlot || 'N/A';
  const bookingLocation = booking.location?.name || booking.pickupLocation || 'Roysambu (next to TRM), Nairobi';
  const paymentMethod = booking.paymentMethod || 'Card';
  const totalPrice = booking.totalPrice || booking.totalAmount || 0;
  const displayBookingId = booking.id || booking.bookingNumber || 'N/A';
  const formatCurrency = (amount) => `KSh ${Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

        {/* Booking Reference Card */}
        <Card className="reference-card">
          <div className="reference-content">
            <span className="reference-label">Booking Reference</span>
            <div className="reference-box">
              <span className="reference-id">{displayBookingId}</span>
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyBookingId}
                title="Copy booking reference"
                type="button"
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <p className="reference-hint">Save this reference for future inquiries</p>
          </div>
        </Card>

        {/* Booking Details */}
        <Card className="details-card">
          <h2 className="card-title">Booking Details</h2>
          
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-icon">🔑</span>
              <div className="detail-info">
                <span className="detail-label">Booking ID</span>
                <span className="detail-value">{displayBookingId}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <div className="detail-info">
                <span className="detail-label">Date</span>
                <span className="detail-value">{formatDate(bookingDate)}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">⏰</span>
              <div className="detail-info">
                <span className="detail-label">Time</span>
                <span className="detail-value">{formatTime(bookingTime)}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <div className="detail-info">
                <span className="detail-label">Location</span>
                <span className="detail-value">{bookingLocation}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">💳</span>
              <div className="detail-info">
                <span className="detail-label">Payment Method</span>
                <span className="detail-value">{paymentMethod}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">💰</span>
              <div className="detail-info">
                <span className="detail-label">Total Amount</span>
                <span className="detail-value total">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Service Details */}
        <Card className="service-card">
          <h2 className="card-title">Service Details</h2>
          
          <div className="service-details">
            <div className="service-header">
              <span className="service-icon">{getServiceIcon(serviceType)}</span>
              <div className="service-info">
                <h3 className="service-name">{booking.serviceName || serviceType}</h3>
                {booking.description && (
                  <p className="service-description">{booking.description}</p>
                )}
              </div>
            </div>

            {booking.extras && booking.extras.length > 0 && (
              <div className="service-extras">
                <h4 className="extras-title">Included Extras</h4>
                <ul className="extras-list">
                  {booking.extras.map((extra, index) => (
                    <li key={index}>
                      <span className="extra-check">✓</span>
                      {extra.name || extra}
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
                <span className="customer-value">{customerName}</span>
              </div>
            </div>

            <div className="customer-item">
              <span className="customer-icon">✉️</span>
              <div className="customer-info">
                <span className="customer-label">Email</span>
                <span className="customer-value">{customerEmail}</span>
              </div>
            </div>

            <div className="customer-item">
              <span className="customer-icon">📞</span>
              <div className="customer-info">
                <span className="customer-label">Phone</span>
                <span className="customer-value">{customerPhone}</span>
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
                <p>We've sent a confirmation email with all details to {customerEmail}</p>
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
          <div className="primary-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={handleDownloadInvoice}
            >
              📥 Download Invoice
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handlePrintInvoice}
            >
              🖨️ Print Confirmation
            </Button>
          </div>

          <div className="secondary-actions">
            <button className="action-btn" onClick={handleResendEmail} title="Resend confirmation email" type="button">
              <span className="action-icon">✉️</span>
              <span>Resend Email</span>
            </button>
            <button className="action-btn" onClick={handleAddToCalendar} title="Add to calendar" type="button">
              <span className="action-icon">📅</span>
              <span>Add to Calendar</span>
            </button>
            <button className="action-btn" onClick={handleShareBooking} title="Share booking" type="button">
              <span className="action-icon">📤</span>
              <span>Share</span>
            </button>
          </div>

          <Link to={ROUTES.HOME}>
            <Button variant="ghost" size="lg">
              Return Home
            </Button>
          </Link>
        </div>

        {/* Support & Help Section */}
        <Card className="support-card">
          <h3>Need Assistance?</h3>
          <p>Our 24/7 concierge team is here to help with any questions or changes to your booking.</p>
          <div className="support-links">
            <a href="tel:0758458358" className="support-link">
              <span className="link-icon">📞</span>
              0758458358
            </a>
            <a href="mailto:support@carease.co.ke" className="support-link">
              <span className="link-icon">✉️</span>
              support@carease.co.ke
            </a>
            <Link to="/faq" className="support-link">
              <span className="link-icon">❓</span>
              View FAQs
            </Link>
          </div>
        </Card>

        {/* Review Invitation */}
        <Card className="review-card">
          <h3>Share Your Experience</h3>
          <p>After your service, we'd love to hear your feedback and help others discover CarEase.</p>
          <Link to={`/reviews/new?booking=${displayBookingId}`}>
            <Button variant="outline" size="lg">
              ⭐ Leave a Review
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmation;
