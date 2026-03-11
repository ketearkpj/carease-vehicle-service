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
  const [discountAmount, setDiscountAmount] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [billingSameAsService, setBillingSameAsService] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Kenya'
  });
  const [agreementAccepted, setAgreementAccepted] = useState(false);

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
      
      // Pre-fill billing address with customer info
      if (data.customerInfo) {
        setBillingAddress(prev => ({
          ...prev,
          firstName: data.customerInfo.firstName || '',
          lastName: data.customerInfo.lastName || '',
          email: data.customerInfo.email || '',
          phone: data.customerInfo.phone || '',
          addressLine1: data.customerInfo.address || '',
          city: data.customerInfo.city || '',
          state: data.customerInfo.state || '',
          postalCode: data.customerInfo.zipCode || ''
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
    if (!promoCode) {
      addNotification('Please enter a promo code', 'warning');
      return;
    }

    // Simulate promo validation
    const promoCodes = {
      'WELCOME10': { discount: 10, applied: true },
      'SAVE20': { discount: 20, applied: true },
      'SUMMER15': { discount: 15, applied: true },
      'VIP25': { discount: 25, applied: true }
    };

    const promoData = promoCodes[promoCode.toUpperCase()];
    
    if (promoData) {
      const calculated = (booking?.totalPrice * promoData.discount) / 100;
      setDiscount(promoData.discount);
      setDiscountAmount(calculated);
      setPromoApplied(true);
      addNotification(`Promo code "${promoCode}" applied! You saved $${calculated.toFixed(2)}`, 'success');
    } else {
      addNotification('Invalid promo code. Please check and try again.', 'error');
      setPromoCode('');
    }
  };

  const validateBillingAddress = () => {
    const errors = {};
    
    if (!billingAddress.firstName?.trim()) errors.firstName = 'First name is required';
    if (!billingAddress.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!billingAddress.email?.trim()) errors.email = 'Email is required';
    if (!billingAddress.phone?.trim()) errors.phone = 'Phone is required';
    if (!billingAddress.addressLine1?.trim()) errors.addressLine1 = 'Address is required';
    if (!billingAddress.city?.trim()) errors.city = 'City is required';
    if (!billingAddress.state?.trim()) errors.state = 'State is required';
    if (!billingAddress.postalCode?.trim()) errors.postalCode = 'Postal code is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoApplied(false);
    setDiscount(0);
    setDiscountAmount(0);
    addNotification('Promo code removed', 'info');
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setProcessing(true);
    try {
      // Validate billing address
      if (!validateBillingAddress()) {
        addNotification('Please complete your billing information', 'error');
        setProcessing(false);
        return;
      }

      if (!agreementAccepted) {
        addNotification('Please accept the terms and conditions', 'error');
        setProcessing(false);
        return;
      }

      // Call payment processing
      const paymentData = {
        bookingId,
        billingAddress,
        paymentMethod: selectedMethod,
        transactionId: paymentResult?.transactionId || 'txn_' + Date.now(),
        amount: calculateTotal(),
        promoCode: promoApplied ? promoCode : null,
        discountApplied: discountAmount
      };

      const result = await processNewPayment(paymentData);

      if (result.success) {
        addNotification('Payment successful! Your booking is confirmed.', 'success');
        navigate(`${ROUTES.BOOKING_CONFIRMATION}?id=${bookingId}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      addNotification('Payment processing failed. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!booking) return 0;
    const subtotal = booking.totalPrice || 0;
    return (subtotal - discountAmount).toFixed(2);
  };

  const calculateSubtotal = () => {
    return booking?.totalPrice || 0;
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
              <h2 className="section-title">Billing Information</h2>
              
              <div className="address-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={billingSameAsService}
                    onChange={(e) => setBillingSameAsService(e.target.checked)}
                  />
                  <span>Billing address same as service location</span>
                </label>
              </div>

              <div className="billing-form">
                {/* Name Fields */}
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <Input
                      value={billingAddress.firstName}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      error={validationErrors.firstName}
                    />
                    {validationErrors.firstName && (
                      <span className="field-error">{validationErrors.firstName}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <Input
                      value={billingAddress.lastName}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                      error={validationErrors.lastName}
                    />
                    {validationErrors.lastName && (
                      <span className="field-error">{validationErrors.lastName}</span>
                    )}
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <Input
                      type="email"
                      value={billingAddress.email}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                      error={validationErrors.email}
                    />
                    {validationErrors.email && (
                      <span className="field-error">{validationErrors.email}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <Input
                      type="tel"
                      value={billingAddress.phone}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      error={validationErrors.phone}
                    />
                    {validationErrors.phone && (
                      <span className="field-error">{validationErrors.phone}</span>
                    )}
                  </div>
                </div>

                {/* Address Section */}
                {(!billingSameAsService || !billingAddress.addressLine1) && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Address Line 1 *</label>
                        <Input
                          value={billingAddress.addressLine1}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                          placeholder="123 Main Street"
                          error={validationErrors.addressLine1}
                        />
                        {validationErrors.addressLine1 && (
                          <span className="field-error">{validationErrors.addressLine1}</span>
                        )}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Address Line 2 (Optional)</label>
                        <Input
                          value={billingAddress.addressLine2}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                          placeholder="Apartment, suite, etc."
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <Input
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Nairobi"
                          error={validationErrors.city}
                        />
                        {validationErrors.city && (
                          <span className="field-error">{validationErrors.city}</span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <Input
                          value={billingAddress.state}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="NY"
                          maxLength="2"
                          error={validationErrors.state}
                        />
                        {validationErrors.state && (
                          <span className="field-error">{validationErrors.state}</span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Postal Code *</label>
                        <Input
                          value={billingAddress.postalCode}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="10001"
                          error={validationErrors.postalCode}
                        />
                        {validationErrors.postalCode && (
                          <span className="field-error">{validationErrors.postalCode}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
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

            {/* Terms & Conditions */}
            <div className="terms-section">
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={agreementAccepted}
                  onChange={(e) => setAgreementAccepted(e.target.checked)}
                  required
                />
                <span>
                  I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">terms and conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>
                </span>
              </label>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="checkout-summary">
            <Card className="summary-card sticky">
              <h2 className="summary-card-title">Order Summary</h2>

              <div className="summary-items">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {promoApplied && discountAmount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount ({discount}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="summary-divider"></div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span className="total-amount">${calculateTotal()}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="promo-section">
                <h3 className="promo-title">Have a promo code?</h3>
                {!promoApplied ? (
                  <div className="promo-input-group">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code (e.g., WELCOME10)"
                    />
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={handlePromoApply}
                      disabled={!promoCode || processing}
                    >
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="promo-applied-section">
                    <div className="promo-badge">
                      <span className="checkmark">✓</span>
                      <span className="promo-text">{promoCode} applied - Save ${discountAmount.toFixed(2)}</span>
                      <button 
                        className="remove-promo"
                        onClick={handleRemovePromo}
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
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