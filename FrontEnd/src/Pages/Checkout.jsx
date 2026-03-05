// src/pages/Booking/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Components/Layout/Layout';
import PaymentOptions from '../Components/Features/PaymentOptions';
import '../Styles/Booking.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  // Mock data - in real app, get from state or context
  const checkoutData = {
    vehicle: {
      name: 'Lamborghini Huracán',
      price: 1200
    },
    days: 3,
    deliveryFee: 49,
    insurance: 75,
    taxes: 180
  };

  const subtotal = checkoutData.price * checkoutData.days;
  const total = subtotal + checkoutData.deliveryFee + checkoutData.insurance + checkoutData.taxes;

  const handlePayment = (paymentData) => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      navigate('/booking-confirmation', {
        state: {
          booking: {
            ...checkoutData,
            ...paymentData,
            total,
            bookingId: `CE${Math.floor(Math.random() * 10000)}`,
            date: new Date().toISOString()
          }
        }
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="booking-page">
        <div className="booking-container">
          <div className="booking-header">
            <h1 className="booking-title">
              Secure<span className="gold-text"> Checkout</span>
            </h1>
            <p className="booking-subtitle">Complete your payment to confirm booking</p>
          </div>

          <div className="checkout-grid">
            {/* Payment Form */}
            <div className="checkout-payment">
              <PaymentOptions
                onNext={handlePayment}
                onBack={() => navigate('/booking')}
                totalAmount={total}
              />
            </div>

            {/* Order Summary */}
            <div className="checkout-summary">
              <h3 className="checkout-summary-title">Order Summary</h3>
              
              <div className="checkout-item">
                <span>{checkoutData.vehicle.name}</span>
                <span>${checkoutData.price}/day × {checkoutData.days} days</span>
              </div>

              <div className="checkout-item">
                <span>Delivery Fee</span>
                <span>${checkoutData.deliveryFee}</span>
              </div>

              <div className="checkout-item">
                <span>Insurance</span>
                <span>${checkoutData.insurance}</span>
              </div>

              <div className="checkout-item">
                <span>Taxes & Fees</span>
                <span>${checkoutData.taxes}</span>
              </div>

              <div className="checkout-total">
                <span className="total-label">Total</span>
                <span className="total-value">${total}</span>
              </div>

              {processing && (
                <div className="checkout-processing">
                  <div className="processing-spinner"></div>
                  <p>Processing your payment...</p>
                </div>
              )}

              <div className="checkout-security">
                <span>🔒</span>
                <p>Secure SSL Encrypted Payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;