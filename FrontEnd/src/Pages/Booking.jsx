// ===== src/Pages/Booking.jsx =====
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { SERVICE_TYPES } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';
import LoadingSpinner from '../Components/Common/LoadingSpinner';

// Services
import { checkAvailability } from '../Services/BookingService';
import { getServicePricing } from '../Services/Service.Service';
import { sendBookingConfirmation } from '../Services/EmailService';
import { getBookingDraft, saveBookingDraft, clearBookingDraft } from '../Utils/bookingFlow';

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
  const bookingPrefill = location.state?.bookingPrefill || {};
  const cachedDraft = getBookingDraft() || {};
  const mergedPrefill = { ...cachedDraft, ...bookingPrefill };
  const today = new Date().toISOString().split('T')[0];

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Service -> Details -> Customer Info -> Review -> Payment
  
  const [bookingData, setBookingData] = useState({
    serviceType: queryParams.get('service') || mergedPrefill.serviceType || null,
    vehicleId: queryParams.get('vehicle') || mergedPrefill.vehicleId || null,
    vehicleName: mergedPrefill.vehicleName || '',
    packageId: queryParams.get('packageId') || mergedPrefill.packageId || null,
    packageName: mergedPrefill.packageName || '',
    listedPrice: Number(mergedPrefill.listedPrice || queryParams.get('listedPrice') || 0),
    inquiryType: queryParams.get('inquiryType') || mergedPrefill.inquiryType || null,
    startDate: queryParams.get('startDate') || mergedPrefill.startDate || '',
    endDate: queryParams.get('endDate') || mergedPrefill.endDate || queryParams.get('startDate') || '',
    time: queryParams.get('time') || mergedPrefill.time || '',
    timeSlot: queryParams.get('time') || mergedPrefill.time || '09:00 AM',
    pickupLocation: queryParams.get('location') || mergedPrefill.pickupLocation || '',
    dropoffLocation: '',
    deliveryMode: 'pickup',
    extras: mergedPrefill.extras || [],
    specialRequests: mergedPrefill.specialRequests || '',
    customerInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: ''
    },
    paymentMethod: null
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    paypalEmail: '',
    mpesaPhone: '',
    squareCustomer: ''
  });
  const [paymentHint, setPaymentHint] = useState('');

  const [pricing, setPricing] = useState({
    basePrice: 0,
    extrasPrice: 0,
    deliveryFee: 0,
    subtotal: 0,
    taxRate: 0.08,
    tax: 0,
    discount: 0,
    total: 0
  });

  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPricingBreakdown, setShowPricingBreakdown] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { addNotification } = useApp();
  const { createNewBooking } = useBooking();
  const { processNewPayment } = usePayment();

  const formatCurrency = (amount) => `KSh ${Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  useEffect(() => {
    if (!bookingPrefill || Object.keys(bookingPrefill).length === 0) return;
    setBookingData((prev) => ({
      ...prev,
      serviceType: prev.serviceType || bookingPrefill.serviceType || null,
      vehicleId: prev.vehicleId || bookingPrefill.vehicleId || null,
      vehicleName: prev.vehicleName || bookingPrefill.vehicleName || '',
      packageId: prev.packageId || bookingPrefill.packageId || null,
      packageName: prev.packageName || bookingPrefill.packageName || '',
      listedPrice: prev.listedPrice || Number(bookingPrefill.listedPrice || 0),
      inquiryType: prev.inquiryType || bookingPrefill.inquiryType || null,
      startDate: prev.startDate || bookingPrefill.startDate || '',
      endDate: prev.endDate || bookingPrefill.endDate || bookingPrefill.startDate || '',
      time: prev.time || bookingPrefill.time || '',
      timeSlot: prev.timeSlot || bookingPrefill.time || '09:00 AM',
      pickupLocation: prev.pickupLocation || bookingPrefill.pickupLocation || '',
      extras: prev.extras.length > 0 ? prev.extras : bookingPrefill.extras || [],
      specialRequests: prev.specialRequests || bookingPrefill.specialRequests || ''
    }));
  }, [location.state]);

  useEffect(() => {
    saveBookingDraft({
      serviceType: bookingData.serviceType,
      vehicleId: bookingData.vehicleId,
      vehicleName: bookingData.vehicleName,
      packageId: bookingData.packageId,
      packageName: bookingData.packageName,
      listedPrice: bookingData.listedPrice,
      inquiryType: bookingData.inquiryType,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      time: bookingData.timeSlot,
      pickupLocation: bookingData.pickupLocation,
      extras: bookingData.extras,
      specialRequests: bookingData.specialRequests
    });
  }, [
    bookingData.serviceType,
    bookingData.vehicleId,
    bookingData.vehicleName,
    bookingData.packageId,
    bookingData.packageName,
    bookingData.listedPrice,
    bookingData.inquiryType,
    bookingData.startDate,
    bookingData.endDate,
    bookingData.timeSlot,
    bookingData.pickupLocation,
    bookingData.extras,
    bookingData.specialRequests
  ]);

  // Calculate pricing whenever booking data changes
  useEffect(() => {
    if (bookingData.serviceType && currentStep >= 2) {
      calculatePricing();
    }
  }, [
    bookingData.serviceType,
    bookingData.packageId,
    bookingData.startDate,
    bookingData.endDate,
    bookingData.extras,
    bookingData.deliveryMode,
    currentStep
  ]);

  // Check availability when date changes
  useEffect(() => {
    if (bookingData.startDate && currentStep >= 2) {
      checkServiceAvailability();
    }
  }, [bookingData.startDate, bookingData.serviceType, bookingData.packageId, currentStep]);

  const calculateDuration = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 1;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  };

  const getFallbackBasePrice = () => {
    if (bookingData.listedPrice > 0) {
      if (bookingData.serviceType === SERVICE_TYPES.SALES) {
        return bookingData.inquiryType === 'purchase' ? bookingData.listedPrice : 5000;
      }
      return bookingData.listedPrice;
    }

    const defaults = {
      [SERVICE_TYPES.RENTAL]: 18000,
      [SERVICE_TYPES.CAR_WASH]: 3500,
      [SERVICE_TYPES.REPAIR]: 8500,
      [SERVICE_TYPES.SALES]: 5000
    };
    return defaults[bookingData.serviceType] || 2500;
  };

  const calculatePricing = async () => {
    const duration = calculateDuration();
    try {
      const result = await getServicePricing(bookingData.serviceType, {
        packageId: bookingData.packageId,
        duration,
        extras: bookingData.extras,
        deliveryMode: bookingData.deliveryMode
      });

      const resultBase = Number(result.basePrice || 0);
      const resultExtras = Number(result.extrasPrice || 0);
      const resultDelivery = Number(result.deliveryFee || 0);
      const fallbackBase = getFallbackBasePrice() * (bookingData.serviceType === SERVICE_TYPES.RENTAL ? duration : 1);
      const basePrice = resultBase > 0 ? resultBase : fallbackBase;
      const subtotal = basePrice + resultExtras + resultDelivery;
      const taxAmount = subtotal * (pricing.taxRate || 0.08);
      const total = subtotal + taxAmount - (pricing.discount || 0);

      setPricing(prev => ({
        ...prev,
        basePrice,
        extrasPrice: resultExtras,
        deliveryFee: resultDelivery,
        subtotal,
        tax: taxAmount,
        total
      }));
    } catch (error) {
      const basePrice = getFallbackBasePrice() * (bookingData.serviceType === SERVICE_TYPES.RENTAL ? duration : 1);
      const subtotal = basePrice;
      const taxAmount = subtotal * (pricing.taxRate || 0.08);
      const total = subtotal + taxAmount;
      setPricing((prev) => ({
        ...prev,
        basePrice,
        extrasPrice: 0,
        deliveryFee: 0,
        subtotal,
        tax: taxAmount,
        total
      }));
      addNotification('Using fallback pricing estimate', 'warning');
    }
  };

  const checkServiceAvailability = async () => {
    setLoading(true);
    try {
      const result = await checkAvailability({
        serviceType: bookingData.serviceType,
        date: bookingData.startDate,
        packageId: bookingData.packageId
      });
      setAvailability(result);

      if (!result.available) {
        setErrors(prev => ({
          ...prev,
          availability: result.message || 'Selected service not available at this time'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.availability;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Availability check failed:', error);
      addNotification('Failed to check availability', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  const normalizeMpesaPhone = (phone) => {
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('254') && digits.length === 12) return digits;
    if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
    if (digits.startsWith('7') && digits.length === 9) return `254${digits}`;
    return digits;
  };

  const handlePaymentDetailsChange = (field, value) => {
    let nextValue = value;
    if (field === 'cardNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      nextValue = digits.replace(/(.{4})/g, '$1 ').trim();
    }
    if (field === 'cardExpiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      nextValue = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }
    if (field === 'cardCvv') {
      nextValue = value.replace(/\D/g, '').slice(0, 4);
    }
    if (field === 'mpesaPhone') {
      nextValue = value.replace(/[^\d+]/g, '').slice(0, 13);
    }

    setPaymentDetails((prev) => ({ ...prev, [field]: nextValue }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const validatePaymentDetails = () => {
    const newErrors = {};
    const paymentErrorKeys = [
      'paymentMethod',
      'cardName',
      'cardNumber',
      'cardExpiry',
      'cardCvv',
      'paypalEmail',
      'mpesaPhone',
      'squareCustomer'
    ];

    if (!bookingData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return false;
    }

    if (bookingData.paymentMethod === 'card') {
      const cardDigits = paymentDetails.cardNumber.replace(/\D/g, '');
      if (!paymentDetails.cardName.trim()) newErrors.cardName = 'Card holder name is required';
      if (cardDigits.length !== 16) newErrors.cardNumber = 'Enter a valid 16-digit card number';
      if (!/^\d{2}\/\d{2}$/.test(paymentDetails.cardExpiry)) newErrors.cardExpiry = 'Use MM/YY format';
      if (!/^\d{3,4}$/.test(paymentDetails.cardCvv)) newErrors.cardCvv = 'Enter a valid CVV';
    }

    if (bookingData.paymentMethod === 'paypal') {
      if (!paymentDetails.paypalEmail.trim()) {
        newErrors.paypalEmail = 'PayPal email is required';
      } else if (!validateEmail(paymentDetails.paypalEmail)) {
        newErrors.paypalEmail = 'Enter a valid PayPal email';
      }
    }

    if (bookingData.paymentMethod === 'mpesa') {
      const normalized = normalizeMpesaPhone(paymentDetails.mpesaPhone);
      if (!/^254\d{9}$/.test(normalized)) {
        newErrors.mpesaPhone = 'Use 07XXXXXXXX, 7XXXXXXXX or 254XXXXXXXXX';
      }
    }

    if (bookingData.paymentMethod === 'square') {
      if (!paymentDetails.squareCustomer.trim()) {
        newErrors.squareCustomer = 'Enter a phone or customer reference';
      }
    }

    setErrors((prev) => {
      const remaining = { ...prev };
      paymentErrorKeys.forEach((key) => delete remaining[key]);
      return { ...remaining, ...newErrors };
    });
    return Object.keys(newErrors).length === 0;
  };

  const getPaymentPayload = () => {
    if (bookingData.paymentMethod === 'card') {
      const cardDigits = paymentDetails.cardNumber.replace(/\D/g, '');
      return {
        paymentMethodId: `pm_card_${cardDigits.slice(-4) || Date.now()}`,
        cardLast4: cardDigits.slice(-4)
      };
    }

    if (bookingData.paymentMethod === 'paypal') {
      return {
        customerEmail: paymentDetails.paypalEmail.trim(),
        payerEmail: paymentDetails.paypalEmail.trim()
      };
    }

    if (bookingData.paymentMethod === 'mpesa') {
      return { phoneNumber: normalizeMpesaPhone(paymentDetails.mpesaPhone) };
    }

    if (bookingData.paymentMethod === 'square') {
      return { customerReference: paymentDetails.squareCustomer.trim() };
    }

    return {};
  };

  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      if (!bookingData.serviceType) {
        newErrors.serviceType = 'Please select a service type';
      }
    }

    if (stepNum === 2) {
      if (!bookingData.startDate) newErrors.startDate = 'Start date is required';
      if (!bookingData.endDate) newErrors.endDate = 'End date is required';
      if (bookingData.startDate && bookingData.endDate) {
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        const requiresMultipleDays = bookingData.serviceType === SERVICE_TYPES.RENTAL;
        if (requiresMultipleDays ? start >= end : start > end) {
          newErrors.endDate = requiresMultipleDays
            ? 'End date must be after start date'
            : 'End date cannot be before start date';
        }
      }
      if (!bookingData.timeSlot) newErrors.timeSlot = 'Time slot is required';
      if (!bookingData.pickupLocation) newErrors.pickupLocation = 'Location is required';
    }

    if (stepNum === 3) {
      if (!bookingData.customerInfo.firstName?.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!bookingData.customerInfo.lastName?.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!bookingData.customerInfo.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(bookingData.customerInfo.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!bookingData.customerInfo.phone?.trim()) {
        newErrors.phone = 'Phone is required';
      } else if (!validatePhone(bookingData.customerInfo.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFieldChange = (field, value, isNested = false) => {
    if (isNested) {
      const [parent, child] = field.split('.');
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error on change
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleServiceSelect = (serviceType) => {
    setBookingData(prev => ({
      ...prev,
      serviceType,
      vehicleId: null,
      vehicleName: '',
      packageId: null,
      packageName: '',
      listedPrice: 0,
      inquiryType: null,
      startDate: '',
      endDate: '',
      timeSlot: '09:00 AM'
    }));
  };

  const serviceTypes = [
    { id: SERVICE_TYPES.RENTAL, label: 'Rentals', icon: '🚗', description: 'Luxury vehicle rentals' },
    { id: SERVICE_TYPES.CAR_WASH, label: 'Car Wash', icon: '🧼', description: 'Professional detailing' },
    { id: SERVICE_TYPES.REPAIR, label: 'Repairs', icon: '🔧', description: 'Expert maintenance' },
    { id: SERVICE_TYPES.SALES, label: 'Sales', icon: '💰', description: 'Vehicle purchases' }
  ];

  const handlePaymentSuccess = async (paymentResult) => {
    setLoading(true);
    try {
      if (bookingData.paymentMethod === 'mpesa') {
        setPaymentHint(`M-PESA prompt sent to ${normalizeMpesaPhone(paymentDetails.mpesaPhone)}. Approve on your phone to continue.`);
      }

      const paymentPayload = getPaymentPayload();
      const gateway = bookingData.paymentMethod === 'card' ? 'stripe' : bookingData.paymentMethod;
      const payment = paymentResult || await processNewPayment({
        bookingId: null,
        amount: pricing.total,
        currency: 'KES',
        customerEmail: paymentPayload.customerEmail || bookingData.customerInfo?.email,
        customerName: `${bookingData.customerInfo?.firstName || ''} ${bookingData.customerInfo?.lastName || ''}`.trim(),
        paymentMethod: bookingData.paymentMethod,
        ...paymentPayload
      }, gateway || 'stripe');

      if (!payment?.success || payment?.status !== 'completed') {
        throw new Error(
          bookingData.paymentMethod === 'mpesa'
            ? 'Payment is still pending. Complete the M-PESA prompt on your phone, then try again.'
            : 'Payment is not completed yet. Please complete the payment authorization and retry.'
        );
      }

      // Create final booking
      const finalBookingData = {
        ...bookingData,
        inquiryType: bookingData.inquiryType || queryParams.get('inquiryType') || null,
        paymentId: payment?.transactionId || `txn_${Date.now()}`,
        totalAmount: pricing.total,
        status: 'confirmed',
        paymentMeta: {
          method: bookingData.paymentMethod,
          phoneNumber: bookingData.paymentMethod === 'mpesa' ? normalizeMpesaPhone(paymentDetails.mpesaPhone) : undefined,
          paypalEmail: bookingData.paymentMethod === 'paypal' ? paymentDetails.paypalEmail.trim() : undefined,
          cardLast4: bookingData.paymentMethod === 'card' ? paymentDetails.cardNumber.replace(/\D/g, '').slice(-4) : undefined,
          customerReference: bookingData.paymentMethod === 'square' ? paymentDetails.squareCustomer.trim() : undefined
        }
      };

      const result = await createNewBooking(finalBookingData);

      if (result?.success && result?.booking) {
        addNotification('Booking confirmed! Check your email for details.', 'success');
        if (bookingData.customerInfo?.email) {
          await sendBookingConfirmation({
            customerEmail: bookingData.customerInfo.email,
            customerName: `${bookingData.customerInfo.firstName || ''} ${bookingData.customerInfo.lastName || ''}`.trim(),
            bookingId: result.booking.id,
            serviceType: bookingData.serviceType,
            date: bookingData.startDate,
            time: bookingData.timeSlot,
            amount: pricing.total
          });
        }
        navigate(`${ROUTES.BOOKING_CONFIRMATION}?id=${result.booking.id}`);
        clearBookingDraft();
      }
    } catch (error) {
      console.error('Booking error:', error);
      addNotification('Failed to complete booking. Please contact support.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteBooking = async () => {
    if (!validatePaymentDetails()) return;
    await handlePaymentSuccess();
  };

  return (
    <div className="booking-page">
      {/* Header */}
      <section className="booking-header">
        <div className="container">
          <h1 className="header-title">
            Complete Your <span className="gold-text">Booking</span>
          </h1>
          <p className="header-subtitle">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="booking-progress">
        <div className="container">
          <div className="progress-bar-wrapper">
            <div
              className="progress-bar-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          <div className="step-indicators">
            {['Service', 'Details', 'Info', 'Review', 'Payment'].map((label, idx) => (
              <div
                key={idx + 1}
                className={`step-indicator ${
                  currentStep > idx + 1 ? 'completed' : ''
                } ${currentStep === idx + 1 ? 'active' : ''}`}
              >
                <div className="step-number">{idx + 1}</div>
                <div className="step-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="booking-content">
        <div className="container">
          {loading && <LoadingSpinner size="lg" color="gold" text="Processing your request..." />}

          {!loading && (
            <>
              <div className="booking-grid">
                {/* Step 1: Service Selection */}
                {currentStep === 1 && (
                  <div className="booking-main">
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

                      {errors.serviceType && (
                        <div className="error-message show">
                          {errors.serviceType}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Booking Details */}
                {currentStep === 2 && (
                  <div className="booking-main">
                    <div className="booking-step animate-fade-in">
                      <h2 className="step-heading">Booking Details</h2>
                      <p className="step-description">Fill in your service requirements</p>

                      <div className="booking-form">
                        {/* Date Section */}
                        <div className="form-section">
                          <h3 className="section-title">When do you need this service?</h3>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Start Date *</label>
                              <Input
                                type="date"
                                value={bookingData.startDate}
                                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                                onBlur={() => handleFieldBlur('startDate')}
                                error={touched.startDate ? errors.startDate : ''}
                                min={today}
                              />
                            </div>
                            <div className="form-group">
                              <label>End Date *</label>
                              <Input
                                type="date"
                                value={bookingData.endDate}
                                onChange={(e) => handleFieldChange('endDate', e.target.value)}
                                onBlur={() => handleFieldBlur('endDate')}
                                error={touched.endDate ? errors.endDate : ''}
                                min={bookingData.startDate || today}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Time Slot Section */}
                        <div className="form-section">
                          <h3 className="section-title">Preferred Time</h3>
                          <div className="time-slot-grid">
                            {['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM'].map(slot => (
                              <button
                                key={slot}
                                className={`time-slot-btn ${bookingData.timeSlot === slot ? 'selected' : ''}`}
                                onClick={() => handleFieldChange('timeSlot', slot)}
                                type="button"
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                          {touched.timeSlot && errors.timeSlot && (
                            <div className="error-message">{errors.timeSlot}</div>
                          )}
                        </div>

                        {/* Location Section */}
                        <div className="form-section">
                          <h3 className="section-title">Location & Delivery</h3>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Pickup Location *</label>
                              <Select
                                value={bookingData.pickupLocation}
                                onChange={(e) => handleFieldChange('pickupLocation', e.target.value)}
                                onBlur={() => handleFieldBlur('pickupLocation')}
                                error={touched.pickupLocation ? errors.pickupLocation : ''}
                                options={[
                                  { value: '', label: 'Select location...' },
                                  { value: 'roysambu-trm', label: '📍 Roysambu (Next to TRM)' },
                                  { value: 'westlands', label: '🏙️ Westlands' },
                                  { value: 'mombasa-road', label: '🛣️ Mombasa Road' },
                                  { value: 'home-delivery', label: '🚚 Home Delivery - Nairobi Metro' }
                                ]}
                              />
                            </div>
                            <div className="form-group">
                              <label>Delivery Mode *</label>
                              <Select
                                value={bookingData.deliveryMode}
                                onChange={(e) => handleFieldChange('deliveryMode', e.target.value)}
                                options={[
                                  { value: 'pickup', label: 'I will pick up' },
                                  { value: 'delivery', label: 'Home delivery (+KSh 6,500)' },
                                  { value: 'mobile', label: 'Mobile service' }
                                ]}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Special Requests */}
                        <div className="form-section">
                          <h3 className="section-title">Special Requests (Optional)</h3>
                          <textarea
                            className="form-textarea"
                            placeholder="Any special requirements or notes?"
                            value={bookingData.specialRequests || ''}
                            onChange={(e) => handleFieldChange('specialRequests', e.target.value)}
                            rows="3"
                          />
                        </div>

                        {/* Pricing Preview */}
                        <div className="pricing-card">
                          <h3 className="pricing-title">
                            Estimated Price
                            <button
                              className="toggle-breakdown"
                              onClick={() => setShowPricingBreakdown(!showPricingBreakdown)}
                              type="button"
                            >
                              {showPricingBreakdown ? '▼' : '▶'}
                            </button>
                          </h3>
                          <div className="pricing-amount-large">{formatCurrency(pricing.total || 0)}</div>

                          {showPricingBreakdown && (
                            <div className="pricing-breakdown animate-fade-in">
                              <div className="pricing-row">
                                <span>Base Price:</span>
                                <span>{formatCurrency(pricing.basePrice || 0)}</span>
                              </div>
                              {pricing.extrasPrice > 0 && (
                                <div className="pricing-row">
                                  <span>Extras:</span>
                                  <span>{formatCurrency(pricing.extrasPrice || 0)}</span>
                                </div>
                              )}
                              {pricing.deliveryFee > 0 && (
                                <div className="pricing-row">
                                  <span>Delivery Fee:</span>
                                  <span>{formatCurrency(pricing.deliveryFee || 0)}</span>
                                </div>
                              )}
                              <div className="pricing-row subtotal">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(pricing.subtotal || 0)}</span>
                              </div>
                              <div className="pricing-row">
                                <span>Tax ({(pricing.taxRate * 100).toFixed(0)}%):</span>
                                <span>{formatCurrency(pricing.tax || 0)}</span>
                              </div>
                              <div className="pricing-row total">
                                <span>Total:</span>
                                <span>{formatCurrency(pricing.total || 0)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Customer Information */}
                {currentStep === 3 && (
                  <div className="booking-main">
                    <div className="booking-step animate-fade-in">
                      <h2 className="step-heading">Your Information</h2>
                      <p className="step-description">We need some details to complete your booking</p>

                      <div className="customer-form">
                        {/* Name Fields */}
                        <div className="form-row">
                          <div className="form-group">
                            <label>First Name *</label>
                            <Input
                              value={bookingData.customerInfo.firstName}
                              onChange={(e) => handleFieldChange('customerInfo.firstName', e.target.value, true)}
                              onBlur={() => handleFieldBlur('firstName')}
                              error={touched.firstName ? errors.firstName : ''}
                              placeholder="John"
                            />
                          </div>
                          <div className="form-group">
                            <label>Last Name *</label>
                            <Input
                              value={bookingData.customerInfo.lastName}
                              onChange={(e) => handleFieldChange('customerInfo.lastName', e.target.value, true)}
                              onBlur={() => handleFieldBlur('lastName')}
                              error={touched.lastName ? errors.lastName : ''}
                              placeholder="Doe"
                            />
                          </div>
                        </div>

                        {/* Email & Phone */}
                        <div className="form-row">
                          <div className="form-group">
                            <label>Email *</label>
                            <Input
                              type="email"
                              value={bookingData.customerInfo.email}
                              onChange={(e) => handleFieldChange('customerInfo.email', e.target.value, true)}
                              onBlur={() => handleFieldBlur('email')}
                              error={touched.email ? errors.email : ''}
                              placeholder="john@example.com"
                            />
                          </div>
                          <div className="form-group">
                            <label>Phone *</label>
                            <Input
                              type="tel"
                              value={bookingData.customerInfo.phone}
                              onChange={(e) => handleFieldChange('customerInfo.phone', e.target.value, true)}
                              onBlur={() => handleFieldBlur('phone')}
                              error={touched.phone ? errors.phone : ''}
                              placeholder="07XX XXX XXX"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div className="form-section">
                          <h3 className="section-title">Address</h3>
                          <div className="form-group">
                            <label>Street Address *</label>
                            <Input
                              value={bookingData.customerInfo.address}
                              onChange={(e) => handleFieldChange('customerInfo.address', e.target.value, true)}
                              placeholder="TRM Service Lane"
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>City *</label>
                              <Input
                                value={bookingData.customerInfo.city}
                                onChange={(e) => handleFieldChange('customerInfo.city', e.target.value, true)}
                                placeholder="Nairobi"
                              />
                            </div>
                            <div className="form-group">
                              <label>County *</label>
                              <Input
                                value={bookingData.customerInfo.state}
                                onChange={(e) => handleFieldChange('customerInfo.state', e.target.value, true)}
                                placeholder="Nairobi"
                              />
                            </div>
                            <div className="form-group">
                              <label>Postal Code *</label>
                              <Input
                                value={bookingData.customerInfo.zipCode}
                                onChange={(e) => handleFieldChange('customerInfo.zipCode', e.target.value, true)}
                                placeholder="00100"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="form-section">
                          <h3 className="section-title">Additional Notes (Optional)</h3>
                          <textarea
                            className="form-textarea"
                            placeholder="Any allergies, special instructions, or other info?"
                            value={bookingData.customerInfo.notes || ''}
                            onChange={(e) => handleFieldChange('customerInfo.notes', e.target.value, true)}
                            rows="2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="booking-main">
                    <div className="booking-step animate-fade-in">
                      <h2 className="step-heading">Review Your Booking</h2>
                      <p className="step-description">Please review all details before proceeding to payment</p>

                      <div className="review-container">
                        {/* Service Summary */}
                        <div className="review-section">
                          <h3 className="review-title">📋 Service Details</h3>
                          <div className="review-card">
                            <div className="detail-row">
                              <span className="label">Service Type:</span>
                              <span className="value">{bookingData.serviceType?.toUpperCase() || 'Not selected'}</span>
                            </div>
                            {bookingData.vehicleName && (
                              <div className="detail-row">
                                <span className="label">Vehicle:</span>
                                <span className="value">{bookingData.vehicleName}</span>
                              </div>
                            )}
                            {bookingData.packageName && (
                              <div className="detail-row">
                                <span className="label">Package:</span>
                                <span className="value">{bookingData.packageName}</span>
                              </div>
                            )}
                            {bookingData.startDate && (
                              <div className="detail-row">
                                <span className="label">Start Date:</span>
                                <span className="value">{new Date(bookingData.startDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {bookingData.endDate && (
                              <div className="detail-row">
                                <span className="label">End Date:</span>
                                <span className="value">{new Date(bookingData.endDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {bookingData.timeSlot && (
                              <div className="detail-row">
                                <span className="label">Time Slot:</span>
                                <span className="value">{bookingData.timeSlot}</span>
                              </div>
                            )}
                            {bookingData.pickupLocation && (
                              <div className="detail-row">
                                <span className="label">Location:</span>
                                <span className="value">{bookingData.pickupLocation}</span>
                              </div>
                            )}
                            <div className="detail-row">
                              <span className="label">Delivery Mode:</span>
                              <span className="value">{bookingData.deliveryMode}</span>
                            </div>
                            {bookingData.specialRequests && (
                              <div className="detail-row">
                                <span className="label">Special Requests:</span>
                                <span className="value">{bookingData.specialRequests}</span>
                              </div>
                            )}
                          </div>
                          <button className="edit-btn" onClick={() => setCurrentStep(2)} type="button">Edit Details</button>
                        </div>

                        {/* Customer Info Summary */}
                        <div className="review-section">
                          <h3 className="review-title">👤 Customer Information</h3>
                          <div className="review-card">
                            <div className="detail-row">
                              <span className="label">Name:</span>
                              <span className="value">{bookingData.customerInfo.firstName} {bookingData.customerInfo.lastName}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Email:</span>
                              <span className="value">{bookingData.customerInfo.email}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Phone:</span>
                              <span className="value">{bookingData.customerInfo.phone}</span>
                            </div>
                            {(bookingData.customerInfo.address || bookingData.customerInfo.city) && (
                              <div className="detail-row">
                                <span className="label">Address:</span>
                                <span className="value">
                                  {[
                                    bookingData.customerInfo.address,
                                    bookingData.customerInfo.city,
                                    bookingData.customerInfo.state,
                                    bookingData.customerInfo.zipCode
                                  ].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                          <button className="edit-btn" onClick={() => setCurrentStep(3)} type="button">Edit Information</button>
                        </div>

                        {/* Pricing Summary */}
                        <div className="review-section">
                          <h3 className="review-title">💰 Pricing Summary</h3>
                          <div className="pricing-summary">
                            <div className="summary-row">
                              <span>Base Price:</span>
                              <span className="amount">{formatCurrency(pricing.basePrice || 0)}</span>
                            </div>
                            {pricing.extrasPrice > 0 && (
                              <div className="summary-row">
                                <span>Extras:</span>
                                <span className="amount">{formatCurrency(pricing.extrasPrice || 0)}</span>
                              </div>
                            )}
                            {pricing.deliveryFee > 0 && (
                              <div className="summary-row">
                                <span>Delivery:</span>
                                <span className="amount">{formatCurrency(pricing.deliveryFee || 0)}</span>
                              </div>
                            )}
                            <div className="summary-row divider">
                              <span>Subtotal:</span>
                              <span className="amount">{formatCurrency(pricing.subtotal || 0)}</span>
                            </div>
                            <div className="summary-row">
                              <span>Tax:</span>
                              <span className="amount">{formatCurrency(pricing.tax || 0)}</span>
                            </div>
                            <div className="summary-row total">
                              <span className="label">TOTAL DUE</span>
                              <span className="amount gold">{formatCurrency(pricing.total || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Confirmation Checkbox */}
                      <div className="confirmation-check">
                        <label>
                          <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                          />
                          <span>I agree to the terms and conditions and privacy policy</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Payment */}
                {currentStep === 5 && (
                  <div className="booking-main">
                    <div className="booking-step animate-fade-in">
                      <h2 className="step-heading">Complete Payment</h2>
                      <p className="step-description">Choose your preferred payment method</p>

                      {/* Payment Method Selection */}
                      <div className="payment-methods">
                        {[
                          { id: 'card', label: '💳 Credit/Debit Card', hint: 'Visa, Mastercard, Amex' },
                          { id: 'paypal', label: '🅿️ PayPal', hint: 'Fast & secure' },
                          { id: 'mpesa', label: '📱 M-PESA', hint: 'Mobile money' },
                          { id: 'square', label: '⬜ Square', hint: 'Digital wallet' }
                        ].map(method => (
                          <label key={method.id} className="payment-method-option">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              checked={bookingData.paymentMethod === method.id}
                              onChange={(e) => {
                                setPaymentHint('');
                                handleFieldChange('paymentMethod', e.target.value);
                              }}
                              required
                            />
                            <span className="method-label">{method.label}</span>
                            <span className="method-hint">{method.hint}</span>
                          </label>
                        ))}
                      </div>
                      {errors.paymentMethod && <div className="error-message show">{errors.paymentMethod}</div>}

                      {bookingData.paymentMethod === 'card' && (
                        <div className="payment-credentials">
                          <h3 className="payment-credentials-title">Card Details</h3>
                          <div className="form-group">
                            <label>Card Holder Name *</label>
                            <Input
                              value={paymentDetails.cardName}
                              onChange={(e) => handlePaymentDetailsChange('cardName', e.target.value)}
                              placeholder="Full name on card"
                              error={errors.cardName}
                            />
                          </div>
                          <div className="form-group">
                            <label>Card Number *</label>
                            <Input
                              value={paymentDetails.cardNumber}
                              onChange={(e) => handlePaymentDetailsChange('cardNumber', e.target.value)}
                              placeholder="4242 4242 4242 4242"
                              error={errors.cardNumber}
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Expiry *</label>
                              <Input
                                value={paymentDetails.cardExpiry}
                                onChange={(e) => handlePaymentDetailsChange('cardExpiry', e.target.value)}
                                placeholder="MM/YY"
                                error={errors.cardExpiry}
                              />
                            </div>
                            <div className="form-group">
                              <label>CVV *</label>
                              <Input
                                type="password"
                                value={paymentDetails.cardCvv}
                                onChange={(e) => handlePaymentDetailsChange('cardCvv', e.target.value)}
                                placeholder="123"
                                error={errors.cardCvv}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {bookingData.paymentMethod === 'paypal' && (
                        <div className="payment-credentials">
                          <h3 className="payment-credentials-title">PayPal Account</h3>
                          <div className="form-group">
                            <label>PayPal Email *</label>
                            <Input
                              type="email"
                              value={paymentDetails.paypalEmail}
                              onChange={(e) => handlePaymentDetailsChange('paypalEmail', e.target.value)}
                              placeholder="you@example.com"
                              error={errors.paypalEmail}
                            />
                          </div>
                        </div>
                      )}

                      {bookingData.paymentMethod === 'mpesa' && (
                        <div className="payment-credentials">
                          <h3 className="payment-credentials-title">M-PESA STK Push</h3>
                          <div className="form-group">
                            <label>M-PESA Number *</label>
                            <Input
                              type="tel"
                              value={paymentDetails.mpesaPhone}
                              onChange={(e) => handlePaymentDetailsChange('mpesaPhone', e.target.value)}
                              placeholder="07XX XXX XXX"
                              error={errors.mpesaPhone}
                            />
                          </div>
                          <p className="payment-procedure">
                            After you click complete booking, we send an STK prompt to your phone. Enter your M-PESA PIN on your device to authorize payment.
                          </p>
                        </div>
                      )}

                      {bookingData.paymentMethod === 'square' && (
                        <div className="payment-credentials">
                          <h3 className="payment-credentials-title">Square Checkout</h3>
                          <div className="form-group">
                            <label>Phone / Customer Reference *</label>
                            <Input
                              value={paymentDetails.squareCustomer}
                              onChange={(e) => handlePaymentDetailsChange('squareCustomer', e.target.value)}
                              placeholder="07XX XXX XXX or customer ID"
                              error={errors.squareCustomer}
                            />
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div className="payment-summary">
                        <h3>Order Summary</h3>
                          <div className="summary-item">
                            <span>Service Charges:</span>
                            <span>{formatCurrency(pricing.subtotal || 0)}</span>
                          </div>
                          <div className="summary-item">
                            <span>Tax:</span>
                            <span>{formatCurrency(pricing.tax || 0)}</span>
                          </div>
                          <div className="summary-item total">
                            <span>TOTAL AMOUNT:</span>
                            <span className="gold-text">{formatCurrency(pricing.total || 0)}</span>
                          </div>
                      </div>

                      {/* Security Message */}
                      <div className="security-message">
                        🔒 Your payment is secure and encrypted. We never store your full card details.
                      </div>
                      {paymentHint && <div className="payment-hint">{paymentHint}</div>}
                    </div>
                  </div>
                )}

                {/* Booking Sidebar */}
                <div className="booking-sidebar">
                  {currentStep <= 4 && (
                    <Card className="summary-card">
                      <h3 className="summary-title">Booking Summary</h3>

                      {bookingData.serviceType && (
                        <div className="summary-item">
                          <span className="summary-label">Service:</span>
                          <span className="summary-value">{bookingData.serviceType}</span>
                        </div>
                      )}

                      {bookingData.startDate && (
                        <div className="summary-item">
                          <span className="summary-label">Date:</span>
                          <span className="summary-value">{new Date(bookingData.startDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      {bookingData.timeSlot && (
                        <div className="summary-item">
                          <span className="summary-label">Time:</span>
                          <span className="summary-value">{bookingData.timeSlot}</span>
                        </div>
                      )}

                      {(pricing?.total || 0) > 0 && (
                        <>
                          <div className="summary-divider"></div>
                          <div className="summary-pricing">
                            <div className="price-row">
                              <span>Subtotal:</span>
                              <span>{formatCurrency(pricing.subtotal || 0)}</span>
                            </div>
                            <div className="price-row">
                              <span>Tax:</span>
                              <span>{formatCurrency(pricing.tax || 0)}</span>
                            </div>
                            <div className="price-row total">
                              <span>Total:</span>
                              <span className="total-amount">{formatCurrency(pricing.total || 0)}</span>
                            </div>
                          </div>
                        </>
                      )}

                      {availability && !availability.available && (
                        <div className="availability-warning">
                          <span className="warning-icon">⚠️</span>
                          <span>{availability.message || 'Service not available'}</span>
                        </div>
                      )}
                    </Card>
                  )}

                  <Card className="info-card">
                    <h4 className="info-title">Need Help?</h4>
                    <p className="info-text">
                      Our concierge team is available 24/7 to assist you with your booking.
                    </p>
                    <div className="info-contact">
                      <a href="tel:+254758458358" className="info-phone">
                        <span className="info-icon">📞</span>
                        0758458358
                      </a>
                      <a href="mailto:concierge@carease.co.ke" className="info-email">
                        <span className="info-icon">✉️</span>
                        concierge@carease.co.ke
                      </a>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="booking-actions">
                {currentStep > 1 && (
                  <Button variant="secondary" onClick={handleBack} size="lg">
                    ← Back
                  </Button>
                )}

                {currentStep < totalSteps && (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    size="lg"
                    disabled={loading || Object.keys(errors).length > 0}
                  >
                    Next →
                  </Button>
                )}

                {currentStep === totalSteps && (
                  <Button
                    variant="success"
                    onClick={handleCompleteBooking}
                    size="lg"
                    disabled={!bookingData.paymentMethod || loading || !agreedToTerms}
                  >
                    {loading ? 'Processing...' : 'Complete Booking'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Booking;
