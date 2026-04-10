// ===== src/Pages/BookingConfirmation.jsx =====
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { ROUTES } from '../Config/Routes';

import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import LoadingSpinner from '../Components/Common/LoadingSpinner';

import { getBookingById } from '../Services/BookingService';
import { sendBookingConfirmation } from '../Services/EmailService';
import { generateHTMLInvoice, downloadInvoice, printInvoice } from '../Utils/generalInvoice';

import { useApp } from '../Context/AppContext';

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
    } catch (fetchError) {
      console.error('Failed to fetch booking:', fetchError);
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
    addNotification('Booking reference copied.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResendEmail = async () => {
    try {
      const recipient = booking?.customerEmail || booking?.customerInfo?.email;
      if (!recipient) {
        throw new Error('No customer email is attached to this booking');
      }

      await sendBookingConfirmation({
        customerEmail: recipient,
        customerName: booking?.customerName || `${booking?.customerFirstName || ''} ${booking?.customerLastName || ''}`.trim() || 'Customer',
        bookingId: booking?.id || booking?.bookingNumber,
        serviceType: booking?.serviceType || 'service',
        date: booking?.startDate || booking?.date,
        time: booking?.pickupTime || booking?.time,
        amount: booking?.totalAmount || booking?.totalPrice || 0
      });

      addNotification(`Confirmation email sent to ${recipient}`, 'success');
    } catch {
      addNotification('Failed to resend email', 'error');
    }
  };

  const handleAddToCalendar = () => {
    if (!booking) return;

    const startDate = booking.startDate || booking.date || new Date();
    const endDate = booking.endDate || booking.date || new Date();

    const title = `${booking.serviceType || 'Service'} - CarEase`;
    const description = `Booking ID: ${booking.id || booking.bookingNumber}`;

    const startFormatted = new Date(startDate).toISOString().replace(/-|:|\.\d+/g, '');
    const endFormatted = new Date(endDate).toISOString().replace(/-|:|\.\d+/g, '');

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(description)}`;

    window.open(calendarUrl, '_blank');
    addNotification('Calendar event opened.', 'info');
  };

  const handleShareBooking = () => {
    if (!booking) return;

    const shareData = {
      title: 'My CarEase Booking',
      text: `I've booked a ${booking.serviceType || 'service'} with CarEase. Booking ID: ${booking.id || booking.bookingNumber}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      navigator.share(shareData).catch(() => {});
      return;
    }

    navigator.clipboard.writeText(window.location.href);
    addNotification('Booking link copied to clipboard.', 'success');
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
      items: [
        {
          description: `${booking.serviceType || 'Service'} Service`,
          quantity: duration,
          unitPrice: totalPrice / duration,
          total: totalPrice
        }
      ],
      subtotal: totalPrice,
      total: totalPrice,
      paymentMethod: booking.paymentMethod || 'Card',
      paymentStatus: paymentStatusMeta.label,
      paymentDate: new Date().toISOString()
    });

    downloadInvoice(invoiceHTML, `invoice-${booking.id || booking.bookingNumber || 'download'}.html`, 'text/html');
    addNotification('Invoice downloaded.', 'success');
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
      items: [
        {
          description: `${booking.serviceType || 'Service'} Service`,
          quantity: duration,
          unitPrice: totalPrice / duration,
          total: totalPrice
        }
      ],
      subtotal: totalPrice,
      total: totalPrice,
      paymentMethod: booking.paymentMethod || 'Card',
      paymentStatus: paymentStatusMeta.label,
      paymentDate: new Date().toISOString()
    });

    printInvoice(invoiceHTML);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
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

  const humanize = (value = '') =>
    value
      .toString()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatLocationValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      const name = value.name || '';
      const address = typeof value.address === 'string'
        ? value.address
        : value.address
          ? [
              value.address.street,
              value.address.city,
              value.address.state,
              value.address.country
            ].filter(Boolean).join(', ')
          : '';
      return [name, address].filter(Boolean).join(' - ');
    }
    return String(value);
  };

  const resolvePaymentStatus = (value) => {
    const normalized = String(value || '').toLowerCase().replace(/\s+/g, '_');
    if (['completed', 'paid', 'success', 'successful'].includes(normalized)) {
      return {
        label: 'Payment Complete',
        className: 'success',
        detail: 'Payment was received successfully.'
      };
    }
    if (['processing', 'pending', 'in_progress'].includes(normalized)) {
      return {
        label: 'Payment Processing',
        className: 'processing',
        detail: 'M-PESA prompt/request was sent and payment is awaiting provider confirmation.'
      };
    }
    if (['due_on_delivery', 'on_delivery', 'cash_on_delivery'].includes(normalized)) {
      return {
        label: 'Payment On Delivery',
        className: 'neutral',
        detail: 'Booking is confirmed. Payment will be collected on service day.'
      };
    }
    if (['failed', 'cancelled', 'declined'].includes(normalized)) {
      return {
        label: 'Payment Failed',
        className: 'danger',
        detail: 'Payment was not successful. You can retry from support.'
      };
    }
    return {
      label: humanize(value || 'pending'),
      className: 'neutral',
      detail: 'Booking is confirmed and payment status will keep updating.'
    };
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
        <p>{error || 'The booking you are looking for does not exist.'}</p>
        <Link to={ROUTES.HOME}>
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  const customerName =
    booking.customerName ||
    (booking.customerInfo && `${booking.customerInfo.firstName || ''} ${booking.customerInfo.lastName || ''}`.trim()) ||
    'Valued Customer';

  const customerEmail = booking.customerEmail || booking.customerInfo?.email || 'email@example.com';
  const customerPhone = booking.customerPhone || booking.customerInfo?.phone || 'N/A';
  const serviceType = booking.serviceType || 'service';
  const bookingDate = booking.date || booking.startDate || booking.createdAt;
  const bookingTime = booking.time || booking.timeSlot || 'N/A';
  const bookingLocation = formatLocationValue(booking.location) ||
    formatLocationValue(booking.pickupLocation) ||
    'Roysambu (next to TRM), Nairobi';
  const paymentMethod = booking.paymentMethod || booking.paymentMeta?.method || 'Pending';
  const paymentStatus = booking.paymentMeta?.paymentStatus || booking.status || 'confirmed';
  const paymentStatusMeta = resolvePaymentStatus(paymentStatus);
  const totalPrice = booking.totalPrice || booking.totalAmount || 0;
  const displayBookingId = booking.id || booking.bookingNumber || 'N/A';
  const serviceLabel = booking.serviceName || humanize(serviceType);
  const formatCurrency = (amount) =>
    `KSh ${Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="confirmation-page">
      <div className="container confirmation-shell">
        <Card className="confirmation-hero-card">
          <div className="success-animation">
            <div className="success-circle">
              <div className="success-check">✓</div>
            </div>
          </div>

          <div className="hero-copy">
            <h1 className="confirmation-title">
              Booking <span className="gold-text">Confirmed</span>
            </h1>
            <p className="confirmation-subtitle">
              Your service request is locked in. A confirmation email has been sent with all details.
            </p>
          </div>

          <div className="hero-reference">
            <span className="reference-label">Reference</span>
            <div className="reference-box">
              <span className="reference-id">{displayBookingId}</span>
              <button
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyBookingId}
                type="button"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </Card>

        <div className="confirmation-grid">
          <div className="confirmation-main">
            <Card className="details-card">
              <h2 className="card-title">Booking Details</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-icon">{getServiceIcon(serviceType)}</span>
                  <div className="detail-info">
                    <span className="detail-label">Service</span>
                    <span className="detail-value">{serviceLabel}</span>
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
                    <span className="detail-value">{bookingTime}</span>
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
                    <span className="detail-value">{humanize(paymentMethod)}</span>
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

            <Card className="steps-card">
              <h2 className="card-title">What Happens Next</h2>
              <div className="steps-list">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Check Your Email</h4>
                    <p>Your confirmation details were sent to {customerEmail}.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Prepare for Service</h4>
                    <p>Keep this booking reference for support and service updates.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Need Changes?</h4>
                    <p>Reach our concierge team any time for reschedule or support.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <aside className="confirmation-side">
            <Card className="summary-card">
              <h3 className="summary-title">Confirmation Snapshot</h3>
              <div className="status-row">
                <span className="status-pill success">Confirmed</span>
                <span className={`status-pill ${paymentStatusMeta.className}`}>{paymentStatusMeta.label}</span>
              </div>
              <p className="payment-status-note">{paymentStatusMeta.detail}</p>

              <div className="summary-row">
                <span>Reference</span>
                <strong>{displayBookingId}</strong>
              </div>
              <div className="summary-row">
                <span>Service</span>
                <strong>{serviceLabel}</strong>
              </div>
              <div className="summary-row">
                <span>Total</span>
                <strong className="total-amount">{formatCurrency(totalPrice)}</strong>
              </div>

              <div className="summary-actions">
                <Button variant="primary" fullWidth onClick={handleDownloadInvoice}>
                  Download Invoice
                </Button>
                <Button variant="outline" fullWidth onClick={handlePrintInvoice}>
                  Print Confirmation
                </Button>
                <button className="action-btn" onClick={handleResendEmail} type="button">Resend Email</button>
                <button className="action-btn" onClick={handleAddToCalendar} type="button">Add to Calendar</button>
                <button className="action-btn" onClick={handleShareBooking} type="button">Share Booking</button>
              </div>
            </Card>

            <Card className="support-card">
              <h3>Need Assistance?</h3>
              <p>Our 24/7 team is ready to help with adjustments and support.</p>
              <div className="support-links">
                <a href="tel:0758458358">📞 0758458358</a>
                <a href="mailto:support@carease.co.ke">✉️ support@carease.co.ke</a>
                <Link to="/faq">❓ View FAQs</Link>
              </div>
            </Card>

            <Link to={ROUTES.HOME} className="return-link">
              <Button variant="ghost" fullWidth>Return Home</Button>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
