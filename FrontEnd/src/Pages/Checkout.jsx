// ===== src/Pages/Checkout.jsx =====
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { PAYMENT_METHODS } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import PaymentOptions from '../Components/Features/PaymentOptions';
import LoadingSpinner from '../Components/Common/LoadingSpinner';

// Services
import { getBookingById } from '../Services/BookingService';
import { processPayment } from '../Services/PaymentService';

// Hooks
import { useApp } from '../Context/AppContext';
import { usePayment } from '../Hooks/usePayment';

// Styles
import '../Styles/Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bookingId = queryParams.get('id');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [billingAddress, setBillingAddress] = useState({
    sameAsService: true,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA'
  });

  const { addNotification } = useApp();
  const { processNewPayment } = usePayment();

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    } else {
      // No booking ID - redirect to booking page
      navigate(ROUTES.BOOKING);
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const data = await getBookingById(bookingId);
      setBooking(data);
      
      // Pre-fill billing address with service address if same
      if (data.location) {
        setBillingAddress(prev => ({
          ...prev,
          addressLine1: data.location.address || '',
          city: data.location.city || '',
          state: data.location.state || '',
          postalCode: data.location.postalCode || ''
        }));
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      addNotification('Failed to load booking details', 'error');
      navigate(ROUTES.BOOKING);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoApply = async () => {
    if (!promoCode) return;

    // Simulate promo validation
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setDiscount(10);
      setPromoApplied(true);
      addNotification('Promo code applied successfully!', 'success');
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      setDiscount(20);
      setPromoApplied(true);
      addNotification('Promo code applied successfully!', 'success');
    } else {
      addNotification('Invalid promo code', 'error');
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setProcessing(true);
    try {
      // Update booking with payment info
      // This would call an API to update the booking status
      
      addNotification('Payment successful! Your booking is confirmed.', 'success');
      navigate(`${ROUTES.BOOKING_CONFIRMATION}?id=${bookingId}`);
    } catch (error) {
      addNotification('Payment succeeded but failed to update booking. Please contact support.', 'warning');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!booking) return 0;
    const subtotal = booking.totalPrice || 0;
    const discountAmount = (subtotal * discount) / 100;
    return (subtotal - discountAmount).toFixed(2);
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <LoadingSpinner size="lg" color="gold" text="Loading checkout..." />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">
          Secure <span className="gold-text">Checkout</span>
        </h1>

        <div className="checkout-grid">
          {/* Left Column - Checkout Form */}
          <div className="checkout-form">
            {/* Booking Summary */}
            <Card className="checkout-section">
              <h2 className="section-title">Booking Summary</h2>
              
              <div className="booking-details">
                <div className="detail-row">
                  <span className="detail-label">Booking ID:</span>
                  <span className="detail-value">{booking?.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Service:</span>
                  <span className="detail-value">{booking?.serviceType}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{booking?.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{booking?.time}</span>
                </div>
                {booking?.duration > 1 && (
                  <div className="detail-row">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{booking.duration} days</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Billing Address */}
            <Card className="checkout-section">
              <h2 className="section-title">Billing Address</h2>
              
              <div className="address-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={billingAddress.sameAsService}
                    onChange={(e) => setBillingAddress(prev => ({ 
                      ...prev, 
                      sameAsService: e.target.checked 
                    }))}
                  />
                  <span>Same as service location</span>
                </label>
              </div>

              {!billingAddress.sameAsService && (
                <div className="address-form">
                  <div className="form-row">
                    <Input
                      label="Address Line 1"
                      value={billingAddress.addressLine1}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                      required
                      icon="🏠"
                    />
                  </div>
                  <div className="form-row">
                    <Input
                      label="Address Line 2 (Optional)"
                      value={billingAddress.addressLine2}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                      icon="🚪"
                    />
                  </div>
                  <div className="form-row">
                    <Input
                      label="City"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                      required
                      icon="🏙️"
                    />
                  </div>
                  <div className="form-row">
                    <Input
                      label="State"
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                      required
                      icon="📍"
                    />
                  </div>
                  <div className="form-row">
                    <Input
                      label="Postal Code"
                      value={billingAddress.postalCode}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                      required
                      icon="📮"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Payment Method */}
            <Card className="checkout-section">
              <h2 className="section-title">Payment Method</h2>
              
              <PaymentOptions
                amount={calculateTotal()}
                currency="USD"
                bookingId={booking?.id}
                onSuccess={handlePaymentSuccess}
                onError={(error) => addNotification(error.message, 'error')}
                loading={processing}
              />
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="checkout-summary">
            <Card className="summary-card sticky">
              <h2 className="summary-card-title">Order Summary</h2>

              <div className="summary-items">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${booking?.totalPrice?.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount ({discount}%)</span>
                    <span>-${((booking?.totalPrice * discount) / 100).toFixed(2)}</span>
                  </div>
                )}

                <div className="summary-row total">
                  <span>Total</span>
                  <span className="total-amount">${calculateTotal()}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="promo-section">
                <h3 className="promo-title">Have a promo code?</h3>
                <div className="promo-input-group">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    disabled={promoApplied}
                  />
                  {!promoApplied ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handlePromoApply}
                      disabled={!promoCode}
                    >
                      Apply
                    </Button>
                  ) : (
                    <span className="promo-applied">✓ Applied</span>
                  )}
                </div>
              </div>

              {/* Security Badge */}
              <div className="security-badge">
                <span className="security-icon">🔒</span>
                <div className="security-text">
                  <strong>Secure Checkout</strong>
                  <p>Your payment information is encrypted</p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="trust-badges">
                <img src="/ssl-badge.png" alt="SSL Secure" />
                <img src="/norton-badge.png" alt="Norton Secured" />
                <img src="/mcafee-badge.png" alt="McAfee Secure" />
              </div>

              {/* Guarantee */}
              <p className="guarantee-text">
                ⭐ 100% Satisfaction Guarantee • Free Cancellation within 24h
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;