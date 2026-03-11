// ===== src/Pages/Booking.jsx =====
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { SERVICE_TYPES, BOOKING_LIMITS } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';
import BookingForm from '../Components/Features/BookingForm';
import PaymentOptions from '../Components/Features/PaymentOptions';
import LoadingSpinner from '../Components/Common/LoadingSpinner';

// Services
import { createBooking, checkAvailability } from '../Services/BookingService';
import { getServicePricing } from '../Services/Service.Service';

// Hooks
import { useApp } from '../Context/AppContext';
import { useBooking } from '../Hooks/useBooking';
import { usePayment } from '../Hooks/usePayment';

// Styles
import '../Styles/Booking.css';

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceType: queryParams.get('service') || 'rental',
    vehicleId: queryParams.get('vehicle') || null,
    date: queryParams.get('date') || '',
    time: queryParams.get('time') || '',
    duration: 1,
    extras: [],
    customerInfo: null,
    paymentMethod: null
  });
  const [pricing, setPricing] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { addNotification } = useApp();
  const { createNewBooking } = useBooking();
  const { processNewPayment } = usePayment();

  useEffect(() => {
    if (bookingData.date && bookingData.time) {
      checkServiceAvailability();
    }
  }, [bookingData.date, bookingData.time, bookingData.serviceType, bookingData.vehicleId]);

  useEffect(() => {
    if (bookingData.serviceType && bookingData.duration) {
      calculatePricing();
    }
  }, [bookingData.serviceType, bookingData.vehicleId, bookingData.duration, bookingData.extras]);

  const checkServiceAvailability = async () => {
    setLoading(true);
    try {
      const result = await checkAvailability({
        serviceType: bookingData.serviceType,
        date: bookingData.date,
        time: bookingData.time,
        vehicleId: bookingData.vehicleId
      });
      setAvailability(result);
      if (!result.available) {
        setErrors({ availability: result.message || 'Selected time slot is not available' });
      } else {
        setErrors(prev => ({ ...prev, availability: null }));
      }
    } catch (error) {
      console.error('Availability check failed:', error);
      setErrors({ availability: 'Failed to check availability' });
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = async () => {
    try {
      const result = await getServicePricing(bookingData.serviceType, {
        vehicleId: bookingData.vehicleId,
        duration: bookingData.duration,
        extras: bookingData.extras
      });
      setPricing(result);
    } catch (error) {
      console.error('Pricing calculation failed:', error);
    }
  };

  const handleServiceSelect = (serviceType) => {
    setBookingData(prev => ({
      ...prev,
      serviceType,
      vehicleId: null,
      date: '',
      time: '',
      duration: 1
    }));
    setCurrentStep(1);
  };

  const handleBookingFormSubmit = async (formData) => {
    setBookingData(prev => ({
      ...prev,
      customerInfo: formData
    }));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setLoading(true);
    try {
      // Create final booking
      const finalBookingData = {
        ...bookingData,
        paymentId: paymentResult.transactionId,
        totalAmount: pricing?.total,
        status: 'confirmed'
      };

      const result = await createNewBooking(finalBookingData);

      if (result.success) {
        addNotification('Booking confirmed! Check your email for details.', 'success');
        navigate(`${ROUTES.BOOKING_CONFIRMATION}?id=${result.booking.id}`);
      }
    } catch (error) {
      addNotification('Failed to complete booking. Please contact support.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const serviceTypes = [
    { id: SERVICE_TYPES.RENTAL, label: 'Rentals', icon: '🚗', description: 'Luxury vehicle rentals' },
    { id: SERVICE_TYPES.CAR_WASH, label: 'Car Wash', icon: '🧼', description: 'Professional detailing' },
    { id: SERVICE_TYPES.REPAIR, label: 'Repairs', icon: '🔧', description: 'Expert maintenance' },
    { id: SERVICE_TYPES.SALES, label: 'Sales', icon: '💰', description: 'Vehicle purchases' }
  ];

  const steps = [
    { number: 1, title: 'Choose Service', icon: '🔍' },
    { number: 2, title: 'Your Details', icon: '📝' },
    { number: 3, title: 'Payment', icon: '💳' }
  ];

  return (
    <div className="booking-page">
      {/* Header */}
      <section className="booking-header">
        <div className="container">
          <h1 className="header-title">
            Complete Your <span className="gold-text">Booking</span>
          </h1>
          <p className="header-subtitle">
            Follow the simple steps below to book your service
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="booking-progress">
        <div className="container">
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`progress-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
              >
                <div className="step-indicator">
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-number">{step.number}</span>
                </div>
                <span className="step-title">{step.title}</span>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="booking-content">
        <div className="container">
          <div className="booking-grid">
            {/* Left Column - Main Form */}
            <div className="booking-main">
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <div className="booking-step animate-fade-in">
                  <h2 className="step-heading">Select Service Type</h2>
                  <p className="step-description">Choose the service you'd like to book</p>

                  <div className="service-selection">
                    {serviceTypes.map(service => (
                      <Card
                        key={service.id}
                        className={`service-option ${bookingData.serviceType === service.id ? 'selected' : ''}`}
                        onClick={() => handleServiceSelect(service.id)}
                      >
                        <div className="service-option-icon">{service.icon}</div>
                        <h3 className="service-option-title">{service.label}</h3>
                        <p className="service-option-description">{service.description}</p>
                        {bookingData.serviceType === service.id && (
                          <div className="selected-check">✓</div>
                        )}
                      </Card>
                    ))}
                  </div>

                  <div className="step-actions">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setCurrentStep(2)}
                    >
                      Continue to Details →
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Booking Form */}
              {currentStep === 2 && (
                <div className="booking-step animate-fade-in">
                  <h2 className="step-heading">Your Information</h2>
                  <p className="step-description">Please provide your details to complete the booking</p>

                  <BookingForm
                    serviceType={bookingData.serviceType}
                    initialData={bookingData}
                    onSubmit={handleBookingFormSubmit}
                    onCancel={handleBack}
                    loading={loading}
                  />
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && bookingData.customerInfo && (
                <div className="booking-step animate-fade-in">
                  <h2 className="step-heading">Payment</h2>
                  <p className="step-description">Complete your booking with secure payment</p>

                  <PaymentOptions
                    amount={pricing?.total}
                    currency="USD"
                    bookingId={bookingData.id}
                    onSuccess={handlePaymentSuccess}
                    onError={(error) => {
                      addNotification(error.message, 'error');
                    }}
                    loading={loading}
                  />

                  <div className="step-actions">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                    >
                      ← Back
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Summary */}
            <div className="booking-sidebar">
              <Card className="summary-card">
                <h3 className="summary-title">Booking Summary</h3>

                <div className="summary-service">
                  <span className="summary-label">Service:</span>
                  <span className="summary-value">
                    {serviceTypes.find(s => s.id === bookingData.serviceType)?.label || 'Not selected'}
                  </span>
                </div>

                {bookingData.date && (
                  <div className="summary-item">
                    <span className="summary-label">Date:</span>
                    <span className="summary-value">{new Date(bookingData.date).toLocaleDateString()}</span>
                  </div>
                )}

                {bookingData.time && (
                  <div className="summary-item">
                    <span className="summary-label">Time:</span>
                    <span className="summary-value">{bookingData.time}</span>
                  </div>
                )}

                {bookingData.duration > 1 && (
                  <div className="summary-item">
                    <span className="summary-label">Duration:</span>
                    <span className="summary-value">{bookingData.duration} days</span>
                  </div>
                )}

                {bookingData.extras?.length > 0 && (
                  <div className="summary-extras">
                    <span className="summary-label">Extras:</span>
                    <ul className="extras-list">
                      {bookingData.extras.map((extra, idx) => (
                        <li key={idx}>{extra.name} (+${extra.price})</li>
                      ))}
                    </ul>
                  </div>
                )}

                {pricing && (
                  <>
                    <div className="summary-divider"></div>

                    <div className="summary-pricing">
                      <div className="price-row">
                        <span>Subtotal:</span>
                        <span>${pricing.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="price-row">
                        <span>Tax:</span>
                        <span>${pricing.tax?.toFixed(2)}</span>
                      </div>
                      <div className="price-row total">
                        <span>Total:</span>
                        <span className="total-amount">${pricing.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}

                {availability && !availability.available && (
                  <div className="availability-warning">
                    <span className="warning-icon">⚠️</span>
                    <span>{availability.message}</span>
                  </div>
                )}
              </Card>

              <Card className="info-card">
                <h4 className="info-title">Need Help?</h4>
                <p className="info-text">
                  Our concierge team is available 24/7 to assist you with your booking.
                </p>
                <div className="info-contact">
                  <a href="tel:+18005550123" className="info-phone">
                    <span className="info-icon">📞</span>
                    +1 (800) 555-0123
                  </a>
                  <a href="mailto:concierge@carease.com" className="info-email">
                    <span className="info-icon">✉️</span>
                    concierge@carease.com
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;