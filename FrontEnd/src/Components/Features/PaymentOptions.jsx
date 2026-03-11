// ===== src/Components/Features/PaymentOptions.jsx =====
import React, { useState, useEffect } from 'react';
import '../../Styles/Features.css';
import Button from '../Common/Button';
import Input from '../Common/Input';
import { processPayment, getPaymentMethods } from '../../Services/PaymentService';

const PaymentOptions = ({
  amount,
  currency = 'USD',
  bookingId,
  onSuccess,
  onError,
  loading = false,
  className = '',
  ...props
}) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [savedCards, setSavedCards] = useState([]);
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [selectedSavedCard, setSelectedSavedCard] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPaymentMethods();
    fetchSavedCards();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      setPaymentMethods([
        { id: 'card', name: 'Credit/Debit Card', icon: '💳', enabled: true },
        { id: 'paypal', name: 'PayPal', icon: '📧', enabled: true },
        { id: 'mpesa', name: 'M-PESA', icon: '📱', enabled: true },
        { id: 'cash', name: 'Cash on Delivery', icon: '💵', enabled: true }
      ]);
    }
  };

  const fetchSavedCards = async () => {
    try {
      setSavedCards([
        { id: 1, last4: '4242', brand: 'Visa', expiry: '12/25' },
        { id: 2, last4: '1234', brand: 'Mastercard', expiry: '10/24' }
      ]);
    } catch (error) {
      console.error('Failed to fetch saved cards:', error);
    }
  };

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setErrors({});
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'number') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    }
    if (name === 'expiry') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5);
    }
    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateCardDetails = () => {
    const newErrors = {};
    if (!cardDetails.number.replace(/\s/g, '').match(/^\d{16}$/)) newErrors.number = 'Invalid card number';
    if (!cardDetails.name || cardDetails.name.length < 3) newErrors.name = 'Please enter the name on card';
    if (!cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiry = 'Invalid expiry date (MM/YY)';
    } else {
      const [month, year] = cardDetails.expiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiryDate < new Date()) newErrors.expiry = 'Card has expired';
    }
    if (!cardDetails.cvc.match(/^\d{3,4}$/)) newErrors.cvc = 'Invalid CVC';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMpesaNumber = () => {
    const phoneRegex = /^254[0-9]{9}$/;
    if (!phoneRegex.test(mpesaNumber)) {
      setErrors({ mpesa: 'Invalid M-PESA number. Use 254XXXXXXXXX' });
      return false;
    }
    return true;
  };

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    try {
      setPromoApplied(true);
      setDiscount(20);
    } catch (error) {
      setErrors({ promo: 'Invalid promo code' });
    }
  };

  const calculateFinalAmount = () => {
    if (!amount) return 0;
    const discountedAmount = amount - (amount * discount) / 100;
    return discountedAmount.toFixed(2);
  };

  const handlePayment = async () => {
    if (selectedMethod === 'card' && !useSavedCard && !validateCardDetails()) return;
    if (selectedMethod === 'mpesa' && !validateMpesaNumber()) return;
    if (!termsAccepted) {
      setErrors({ terms: 'You must accept the terms and conditions' });
      return;
    }

    setProcessing(true);
    try {
      const paymentData = {
        amount: calculateFinalAmount(),
        currency,
        bookingId,
        method: selectedMethod,
        promoCode: promoApplied ? promoCode : null
      };

      if (selectedMethod === 'card') {
        if (useSavedCard && selectedSavedCard) {
          paymentData.savedCardId = selectedSavedCard.id;
        } else {
          paymentData.cardDetails = cardDetails;
        }
      }
      if (selectedMethod === 'mpesa') paymentData.phoneNumber = mpesaNumber;

      const result = await processPayment(paymentData, selectedMethod);
      if (result.success && onSuccess) onSuccess(result);
    } catch (error) {
      if (onError) onError(error);
      setErrors({ payment: error.message || 'Payment failed. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const finalAmount = calculateFinalAmount();

  return (
    <div className={`payment-options-container ${className}`} {...props}>
      <h3 className="payment-heading">Payment Method</h3>

      <div className="payment-methods-grid">
        {paymentMethods.map(method => (
          <button
            key={method.id}
            className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
            onClick={() => handleMethodSelect(method.id)}
            disabled={!method.enabled}
          >
            <span className="method-icon">{method.icon}</span>
            <span className="method-name">{method.name}</span>
            {!method.enabled && <span className="method-disabled">Coming Soon</span>}
          </button>
        ))}
      </div>

      <div className="payment-details-section">
        {selectedMethod === 'card' && (
          <div className="card-payment-details fade-in">
            {savedCards.length > 0 && (
              <div className="saved-cards">
                <label className="use-saved-card">
                  <input type="checkbox" checked={useSavedCard} onChange={(e) => setUseSavedCard(e.target.checked)} />
                  <span>Use a saved card</span>
                </label>
                {useSavedCard && (
                  <div className="saved-cards-list">
                    {savedCards.map(card => (
                      <label key={card.id} className="saved-card-item">
                        <input
                          type="radio"
                          name="savedCard"
                          checked={selectedSavedCard?.id === card.id}
                          onChange={() => setSelectedSavedCard(card)}
                        />
                        <span className="card-info">
                          <span className="card-brand">{card.brand}</span>
                          <span className="card-last4">•••• {card.last4}</span>
                          <span className="card-expiry">Expires {card.expiry}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!useSavedCard && (
              <div className="new-card-details">
                <Input label="Card Number" name="number" value={cardDetails.number} onChange={handleCardChange} error={errors.number} placeholder="1234 5678 9012 3456" icon="💳" />
                <Input label="Name on Card" name="name" value={cardDetails.name} onChange={handleCardChange} error={errors.name} placeholder="JOHN DOE" icon="👤" />
                <div className="card-row">
                  <Input label="Expiry Date" name="expiry" value={cardDetails.expiry} onChange={handleCardChange} error={errors.expiry} placeholder="MM/YY" icon="📅" />
                  <Input label="CVC" name="cvc" value={cardDetails.cvc} onChange={handleCardChange} error={errors.cvc} placeholder="123" icon="🔒" type="password" />
                </div>
              </div>
            )}
          </div>
        )}

        {selectedMethod === 'mpesa' && (
          <div className="mpesa-details fade-in">
            <p className="method-info">Enter your M-PESA phone number to receive a payment prompt.</p>
            <Input
              label="M-PESA Phone Number"
              value={mpesaNumber}
              onChange={(e) => setMpesaNumber(e.target.value)}
              error={errors.mpesa}
              placeholder="254712345678"
              icon="📱"
              helper="Format: 254XXXXXXXXX"
            />
          </div>
        )}

        {selectedMethod === 'paypal' && (
          <div className="paypal-details fade-in">
            <p className="method-info">You will be redirected to PayPal to complete your payment securely.</p>
          </div>
        )}

        {selectedMethod === 'cash' && (
          <div className="cash-details fade-in">
            <p className="method-info">Pay with cash upon delivery. A small deposit may be required.</p>
            <div className="cash-note">
              <span className="note-icon">ℹ️</span>
              <span className="note-text">Please have exact change ready. Our driver will provide a receipt.</span>
            </div>
          </div>
        )}
      </div>

      <div className="promo-section">
        <h4 className="promo-title">Have a promo code?</h4>
        <div className="promo-input-group">
          <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="Enter promo code" disabled={promoApplied} icon="🎫" />
          {!promoApplied ? (
            <Button variant="outline" size="sm" onClick={handleApplyPromo} disabled={!promoCode}>Apply</Button>
          ) : (
            <span className="promo-applied">✓ Applied</span>
          )}
        </div>
        {errors.promo && <div className="error-message">{errors.promo}</div>}
      </div>

      <div className="order-summary">
        <h4 className="summary-title">Order Summary</h4>
        <div className="summary-row"><span>Subtotal:</span><span>${amount?.toFixed(2)}</span></div>
        {discount > 0 && (
          <div className="summary-row discount">
            <span>Discount ({discount}%):</span><span>-${((amount * discount) / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>Total:</span><span className="total-amount">${finalAmount}</span>
        </div>
      </div>

      <div className="terms-section">
        <label className="terms-checkbox">
          <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
          <span className="checkbox-text">
            I agree to the <a href="/terms" target="_blank">Terms of Service</a> and 
            understand the <a href="/cancellation" target="_blank">Cancellation Policy</a>
          </span>
        </label>
        {errors.terms && <div className="error-message">{errors.terms}</div>}
      </div>

      <Button variant="primary" size="lg" fullWidth onClick={handlePayment} loading={processing || loading} disabled={processing || loading || !termsAccepted} className="pay-button">
        {processing ? 'Processing...' : `Pay $${finalAmount}`}
      </Button>

      <div className="security-badge">
        <span className="security-icon">🔒</span>
        <span className="security-text">Secure payment. Your information is encrypted.</span>
      </div>

      {errors.payment && (
        <div className="payment-error">
          <span className="error-icon">⚠️</span>
          <span>{errors.payment}</span>
        </div>
      )}
    </div>
  );
};

export default PaymentOptions;