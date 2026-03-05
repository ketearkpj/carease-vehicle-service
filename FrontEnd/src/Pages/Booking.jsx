import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/Booking.css';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    // Service Type
    serviceType: location.state?.service || 'rental',
    
    // Vehicle/Rental Info
    vehicle: location.state?.vehicle || null,
    servicePackage: location.state?.package || null,
    repairService: location.state?.repairService || null,
    
    // Dates & Times
    startDate: location.state?.date || '',
    endDate: '',
    startTime: location.state?.time || '',
    endTime: '',
    
    // Location
    location: location.state?.location || null,
    deliveryAddress: location.state?.deliveryAddress || '',
    
    // Customer Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    
    // Extras
    extras: location.state?.extras || {},
    addons: location.state?.addons || [],
    issueDescription: location.state?.issueDescription || '',
    vehicleInfo: location.state?.vehicleInfo || { make: '', model: '', year: '' },
    
    // Preferences
    contactMethod: 'email',
    specialRequests: '',
    
    // Price
    priceBreakdown: location.state?.priceBreakdown || null
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [bookingStep]);

  // Calculate rental price (if applicable)
  const calculateRentalPrice = () => {
    if (!bookingData.vehicle) return null;
    
    const days = 3; // This would be calculated from dates
    const basePrice = bookingData.vehicle.price * days;
    const extrasTotal = 0; // Calculate from selected extras
    const deliveryFee = bookingData.location?.id === 'delivery' ? 49 : 0;
    const subtotal = basePrice + extrasTotal + deliveryFee;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    return { basePrice, extrasTotal, deliveryFee, subtotal, tax, total };
  };

  // Calculate car wash price (if applicable)
  const calculateWashPrice = () => {
    if (!bookingData.servicePackage) return null;
    return bookingData.priceBreakdown || { total: bookingData.servicePackage.price };
  };

  // Calculate repair price (if applicable)
  const calculateRepairPrice = () => {
    if (!bookingData.repairService) return null;
    return bookingData.priceBreakdown || { total: bookingData.repairService.price };
  };

  // Get price based on service type
  const getPrice = () => {
    switch(bookingData.serviceType) {
      case 'rental':
        return calculateRentalPrice();
      case 'car-wash':
        return calculateWashPrice();
      case 'repair':
        return calculateRepairPrice();
      default:
        return null;
    }
  };

  const price = getPrice();

  // Booking steps
  const bookingSteps = [
    { number: 1, name: 'Service Details', icon: '📋' },
    { number: 2, name: 'Personal Info', icon: '👤' },
    { number: 3, name: 'Review', icon: '✓' }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  // Handle next step
  const handleNext = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Navigate to checkout with booking data
    navigate('/checkout', {
      state: {
        bookingData,
        price
      }
    });
  };

  // Validate step 1
  const isStep1Valid = () => {
    if (bookingData.serviceType === 'rental') {
      return bookingData.startDate && bookingData.startTime && bookingData.location;
    } else if (bookingData.serviceType === 'car-wash') {
      return bookingData.startDate && bookingData.startTime && bookingData.location;
    } else if (bookingData.serviceType === 'repair') {
      return bookingData.startDate && bookingData.startTime && bookingData.location;
    }
    return true;
  };

  // Validate step 2
  const isStep2Valid = () => {
    return (
      bookingData.firstName &&
      bookingData.lastName &&
      bookingData.email &&
      bookingData.phone
    );
  };

  return (
    <div className="booking-page">
      {/* ===== HERO SECTION ===== */}
      <section className="booking-hero">
        <div className="booking-hero-content">
          <h1 className="booking-hero-title animate-fade-up">
            Complete Your <span className="gold-text">Booking</span>
          </h1>
          <p className="booking-hero-description animate-fade-up">
            Just a few steps to confirm your reservation
          </p>
        </div>
      </section>

      {/* ===== BOOKING CONTAINER ===== */}
      <section className="booking-container">
        <div className="container">
          <div className="booking-card">
            {/* Booking Steps */}
            <div className="booking-steps">
              {bookingSteps.map((step) => (
                <div 
                  key={step.number}
                  className={`step ${bookingStep === step.number ? 'active' : ''} ${bookingStep > step.number ? 'completed' : ''}`}
                >
                  <div className="step-indicator">
                    <span className="step-icon">{step.icon}</span>
                    <span className="step-number">{step.number}</span>
                  </div>
                  <span className="step-name">{step.name}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Service Details */}
            {bookingStep === 1 && (
              <div className="step-content">
                <h2>Service Details</h2>

                {/* Service Summary Card */}
                <div className="service-summary-card">
                  <h3>Your Selection</h3>
                  {bookingData.serviceType === 'rental' && bookingData.vehicle && (
                    <div className="summary-vehicle">
                      <img src={bookingData.vehicle.image} alt={bookingData.vehicle.name} />
                      <div>
                        <h4>{bookingData.vehicle.name}</h4>
                        <p className="vehicle-category">{bookingData.vehicle.category} • {bookingData.vehicle.year}</p>
                        <p className="vehicle-price">${bookingData.vehicle.price}/day</p>
                      </div>
                    </div>
                  )}

                  {bookingData.serviceType === 'car-wash' && bookingData.servicePackage && (
                    <div className="summary-package">
                      <div className="package-icon">{bookingData.servicePackage.icon}</div>
                      <div>
                        <h4>{bookingData.servicePackage.name}</h4>
                        <p className="package-description">{bookingData.servicePackage.description}</p>
                        <p className="package-price">${bookingData.servicePackage.price}</p>
                      </div>
                    </div>
                  )}

                  {bookingData.serviceType === 'repair' && bookingData.repairService && (
                    <div className="summary-repair">
                      <div className="repair-icon">{bookingData.repairService.icon}</div>
                      <div>
                        <h4>{bookingData.repairService.name}</h4>
                        <p className="repair-description">{bookingData.repairService.description}</p>
                        <p className="repair-price">${bookingData.repairService.price}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date & Time Selection */}
                <div className="form-section">
                  <h3>Date & Time</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        className="form-input"
                        value={bookingData.startDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label>Time *</label>
                      <select
                        name="startTime"
                        className="form-select"
                        value={bookingData.startTime}
                        onChange={handleInputChange}
                      >
                        <option value="">Select time</option>
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {bookingData.serviceType === 'rental' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Return Date</label>
                        <input
                          type="date"
                          name="endDate"
                          className="form-input"
                          value={bookingData.endDate}
                          onChange={handleInputChange}
                          min={bookingData.startDate}
                        />
                      </div>
                      <div className="form-group">
                        <label>Return Time</label>
                        <select
                          name="endTime"
                          className="form-select"
                          value={bookingData.endTime}
                          onChange={handleInputChange}
                        >
                          <option value="">Select time</option>
                          <option value="9:00 AM">9:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="1:00 PM">1:00 PM</option>
                          <option value="2:00 PM">2:00 PM</option>
                          <option value="3:00 PM">3:00 PM</option>
                          <option value="4:00 PM">4:00 PM</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Selection */}
                <div className="form-section">
                  <h3>Location</h3>
                  {bookingData.location && (
                    <div className="selected-location">
                      <div className="location-info">
                        <span className="location-icon">📍</span>
                        <div>
                          <h4>{bookingData.location.name}</h4>
                          <p>{bookingData.location.address}</p>
                          {bookingData.location.id === 'mobile' && (
                            <p className="delivery-note">Delivery to: {bookingData.deliveryAddress}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Requests */}
                <div className="form-section">
                  <h3>Special Requests (Optional)</h3>
                  <textarea
                    name="specialRequests"
                    className="form-textarea"
                    rows="3"
                    placeholder="Any special requests or instructions..."
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="step-actions">
                  <button className="btn-next" onClick={handleNext} disabled={!isStep1Valid()}>
                    Continue to Personal Info
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {bookingStep === 2 && (
              <div className="step-content">
                <h2>Personal Information</h2>

                <div className="form-section">
                  <h3>Contact Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        className="form-input"
                        placeholder="John"
                        value={bookingData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        className="form-input"
                        placeholder="Doe"
                        value={bookingData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        placeholder="john@example.com"
                        value={bookingData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-input"
                        placeholder="(555) 123-4567"
                        value={bookingData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Preferred Contact Method</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="email"
                          checked={bookingData.contactMethod === 'email'}
                          onChange={handleInputChange}
                        />
                        <span>Email</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="phone"
                          checked={bookingData.contactMethod === 'phone'}
                          onChange={handleInputChange}
                        />
                        <span>Phone</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="text"
                          checked={bookingData.contactMethod === 'text'}
                          onChange={handleInputChange}
                        />
                        <span>Text</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Billing Address</h3>
                  <div className="form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-input"
                      placeholder="123 Main St"
                      value={bookingData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        className="form-input"
                        placeholder="Los Angeles"
                        value={bookingData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        name="state"
                        className="form-input"
                        placeholder="CA"
                        value={bookingData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        className="form-input"
                        placeholder="90210"
                        value={bookingData.zipCode}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <select
                        name="country"
                        className="form-select"
                        value={bookingData.country}
                        onChange={handleInputChange}
                      >
                        <option value="USA">United States</option>
                        <option value="CAN">Canada</option>
                        <option value="MEX">Mexico</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="step-actions">
                  <button className="btn-back" onClick={handleBack}>
                    Back
                  </button>
                  <button className="btn-next" onClick={handleNext} disabled={!isStep2Valid()}>
                    Review Booking
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {bookingStep === 3 && (
              <div className="step-content">
                <h2>Review Your Booking</h2>

                <div className="review-card">
                  {/* Service Summary */}
                  <div className="review-section">
                    <h3>Service Details</h3>
                    
                    {bookingData.serviceType === 'rental' && bookingData.vehicle && (
                      <div className="review-item">
                        <span className="review-label">Vehicle:</span>
                        <span className="review-value">{bookingData.vehicle.name}</span>
                      </div>
                    )}

                    {bookingData.serviceType === 'car-wash' && bookingData.servicePackage && (
                      <div className="review-item">
                        <span className="review-label">Package:</span>
                        <span className="review-value">{bookingData.servicePackage.name}</span>
                      </div>
                    )}

                    {bookingData.serviceType === 'repair' && bookingData.repairService && (
                      <div className="review-item">
                        <span className="review-label">Service:</span>
                        <span className="review-value">{bookingData.repairService.name}</span>
                      </div>
                    )}

                    <div className="review-item">
                      <span className="review-label">Date:</span>
                      <span className="review-value">
                        {new Date(bookingData.startDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="review-item">
                      <span className="review-label">Time:</span>
                      <span className="review-value">{bookingData.startTime}</span>
                    </div>

                    {bookingData.endDate && (
                      <div className="review-item">
                        <span className="review-label">Return:</span>
                        <span className="review-value">
                          {new Date(bookingData.endDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    <div className="review-item">
                      <span className="review-label">Location:</span>
                      <span className="review-value">{bookingData.location?.name}</span>
                    </div>

                    {bookingData.deliveryAddress && (
                      <div className="review-item">
                        <span className="review-label">Delivery:</span>
                        <span className="review-value">{bookingData.deliveryAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Customer Information */}
                  <div className="review-section">
                    <h3>Contact Information</h3>
                    <div className="review-item">
                      <span className="review-label">Name:</span>
                      <span className="review-value">{bookingData.firstName} {bookingData.lastName}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Email:</span>
                      <span className="review-value">{bookingData.email}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Phone:</span>
                      <span className="review-value">{bookingData.phone}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Contact:</span>
                      <span className="review-value">{bookingData.contactMethod}</span>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {bookingData.specialRequests && (
                    <div className="review-section">
                      <h3>Special Requests</h3>
                      <p className="review-text">{bookingData.specialRequests}</p>
                    </div>
                  )}

                  {/* Price Summary */}
                  {price && (
                    <div className="price-summary">
                      <h3>Price Summary</h3>
                      
                      {bookingData.serviceType === 'rental' && (
                        <>
                          <div className="price-row">
                            <span>Base Price (3 days)</span>
                            <span>${price.basePrice}</span>
                          </div>
                          {price.deliveryFee > 0 && (
                            <div className="price-row">
                              <span>Delivery Fee</span>
                              <span>${price.deliveryFee}</span>
                            </div>
                          )}
                        </>
                      )}

                      {bookingData.serviceType === 'car-wash' && (
                        <div className="price-row">
                          <span>{bookingData.servicePackage.name}</span>
                          <span>${price.total}</span>
                        </div>
                      )}

                      {bookingData.serviceType === 'repair' && (
                        <div className="price-row">
                          <span>{bookingData.repairService.name}</span>
                          <span>${price.total}</span>
                        </div>
                      )}

                      <div className="price-row subtotal">
                        <span>Subtotal</span>
                        <span>${price.subtotal || price.total}</span>
                      </div>
                      
                      <div className="price-row tax">
                        <span>Tax (10%)</span>
                        <span>${price.tax || (price.total * 0.1).toFixed(2)}</span>
                      </div>
                      
                      <div className="price-row total">
                        <span>Total</span>
                        <span className="total-amount">${price.total ? (price.total * 1.1).toFixed(2) : (price.total * 1.1).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="terms-agreement">
                  <label className="checkbox-label">
                    <input type="checkbox" required />
                    <span>I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a></span>
                  </label>
                </div>

                <div className="step-actions">
                  <button className="btn-back" onClick={handleBack}>
                    Back
                  </button>
                  <button className="btn-confirm" onClick={handleSubmit}>
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booking;