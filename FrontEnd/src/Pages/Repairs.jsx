import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Repairs.css';

const Repairs = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    mileage: ''
  });
  const [issueDescription, setIssueDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Repair Services
  const services = [
    {
      id: 'diagnostic',
      name: 'Diagnostic Service',
      price: 89,
      duration: '1 hour',
      description: 'Complete vehicle diagnostics and health check',
      longDescription: 'Our advanced diagnostic equipment scans all vehicle systems to identify issues before they become problems. We provide a detailed report with maintenance recommendations.',
      suitable: ['Check engine light', 'Performance issues', 'Pre-purchase inspection'],
      features: [
        'Computer diagnostic scan',
        'Visual inspection',
        'Test drive assessment',
        'Detailed report',
        'Maintenance recommendations',
        'No obligation quote'
      ],
      icon: '🔍',
      popular: false
    },
    {
      id: 'maintenance',
      name: 'Regular Maintenance',
      price: 199,
      duration: '2-3 hours',
      description: 'Scheduled maintenance and tune-ups',
      longDescription: 'Keep your vehicle running at peak performance with our comprehensive maintenance service. We follow manufacturer specifications and use only genuine parts.',
      suitable: ['Oil changes', 'Tire rotation', 'Fluid checks'],
      features: [
        'Oil change',
        'Filter replacement',
        'Fluid top-up',
        'Tire rotation',
        'Brake inspection',
        'Battery test',
        'Multi-point inspection'
      ],
      icon: '🔧',
      popular: true
    },
    {
      id: 'brake',
      name: 'Brake Service',
      price: 299,
      duration: '2-3 hours',
      description: 'Complete brake inspection and repair',
      longDescription: 'Your safety is our priority. Our brake service includes thorough inspection and replacement of worn components using premium parts.',
      suitable: ['Squeaking brakes', 'Vibration', 'Brake warning light'],
      features: [
        'Brake pad replacement',
        'Rotor resurfacing',
        'Caliper inspection',
        'Brake fluid flush',
        'ABS system check',
        'Parking brake adjustment'
      ],
      icon: '🛑',
      popular: false
    },
    {
      id: 'engine',
      name: 'Engine Repair',
      price: 599,
      duration: '4-8 hours',
      description: 'Expert engine diagnostics and repair',
      longDescription: 'Our certified technicians have extensive experience with all types of engine issues. We diagnose and repair problems using state-of-the-art equipment.',
      suitable: ['Performance loss', 'Unusual noises', 'Warning lights'],
      features: [
        'Compression test',
        'Leak detection',
        'Sensor replacement',
        'Timing belt service',
        'Fuel system cleaning',
        'Emission system repair'
      ],
      icon: '⚙️',
      popular: false
    },
    {
      id: 'transmission',
      name: 'Transmission Service',
      price: 399,
      duration: '3-5 hours',
      description: 'Transmission fluid service and repairs',
      longDescription: 'Keep your transmission running smoothly with our comprehensive service. We use only manufacturer-approved fluids and components.',
      suitable: ['Hard shifting', 'Slipping', 'Fluid leaks'],
      features: [
        'Fluid change',
        'Filter replacement',
        'Pan gasket replacement',
        'Shift solenoid check',
        'Computer reset',
        'Road test'
      ],
      icon: '⚡',
      popular: false
    },
    {
      id: 'ac',
      name: 'AC Service',
      price: 149,
      duration: '1-2 hours',
      description: 'Air conditioning diagnosis and repair',
      longDescription: 'Stay comfortable year-round with our professional AC service. We handle everything from recharges to complete system repairs.',
      suitable: ['Warm air', 'Strange odors', 'Weak airflow'],
      features: [
        'Performance test',
        'Leak detection',
        'Refrigerant recharge',
        'Compressor check',
        'Filter replacement',
        'System sanitizing'
      ],
      icon: '❄️',
      popular: false
    }
  ];

  // Locations
  const locations = [
    {
      id: 'beverly-hills',
      name: 'Beverly Hills Service Center',
      address: '123 Luxury Lane, Beverly Hills, CA 90210',
      phone: '+1 (310) 555-0123',
      hours: 'Mon-Sat: 8am - 7pm',
      amenities: ['Waiting lounge', 'Free WiFi', 'Coffee bar', 'Shuttle service'],
      certified: ['Porsche', 'Mercedes', 'BMW', 'Audi']
    },
    {
      id: 'new-york',
      name: 'Manhattan Service Center',
      address: '789 Park Avenue, New York, NY 10022',
      phone: '+1 (212) 555-0789',
      hours: 'Mon-Fri: 8am - 8pm, Sat: 9am-5pm',
      amenities: ['Business center', 'Concierge', 'Loaner vehicles'],
      certified: ['Ferrari', 'Lamborghini', 'Rolls-Royce', 'Bentley']
    },
    {
      id: 'mobile',
      name: 'Mobile Repair Service',
      address: 'We come to your location',
      phone: '+1 (800) 555-REPAIR',
      hours: 'Mon-Sun: 8am - 8pm',
      serviceArea: ['Los Angeles County', 'Orange County', 'New York City'],
      fee: 49,
      note: 'Basic repairs and diagnostics only'
    }
  ];

  // Time slots
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM', '5:00 PM'
  ];

  // Urgency options
  const urgencyOptions = [
    { value: 'low', label: 'Low - Within 2 weeks', multiplier: 1.0, color: '#00ff88' },
    { value: 'normal', label: 'Normal - Within 1 week', multiplier: 1.0, color: '#d4af37' },
    { value: 'urgent', label: 'Urgent - Within 48 hours', multiplier: 1.5, color: '#ff4444' }
  ];

  // Calculate price
  const calculatePrice = () => {
    if (!selectedService) return 0;
    
    const urgencyMultiplier = urgencyOptions.find(u => u.value === urgency)?.multiplier || 1;
    const basePrice = selectedService.price * urgencyMultiplier;
    const mobileFee = selectedLocation?.id === 'mobile' ? 49 : 0;
    
    return {
      basePrice,
      mobileFee,
      subtotal: basePrice + mobileFee,
      tax: (basePrice + mobileFee) * 0.1,
      total: (basePrice + mobileFee) * 1.1
    };
  };

  const priceBreakdown = calculatePrice();

  // Booking steps
  const bookingSteps = [
    { number: 1, name: 'Select Service', icon: '🔧' },
    { number: 2, name: 'Vehicle Info', icon: '🚗' },
    { number: 3, name: 'Location', icon: '📍' },
    { number: 4, name: 'Schedule', icon: '📅' },
    { number: 5, name: 'Confirm', icon: '✓' }
  ];

  return (
    <div className="repairs-page">
      {/* ===== HERO SECTION ===== */}
      <section className="repairs-hero">
        <div className="repairs-hero-bg"></div>
        <div className="repairs-hero-content">
          <h1 className="repairs-hero-title animate-fade-up">
            Expert <span className="gold-text">Repairs</span>
          </h1>
          <p className="repairs-hero-description animate-fade-up">
            Factory-trained technicians, genuine parts, and guaranteed workmanship
          </p>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">👨‍🔧</span>
              <h3>Certified Technicians</h3>
              <p>Factory-trained experts</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔧</span>
              <h3>Genuine Parts</h3>
              <p>OEM quality assured</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>24-Month Warranty</h3>
              <p>Parts and labor</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🚚</span>
              <h3>Free Pickup/Delivery</h3>
              <p>Within 25 miles</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔬</span>
              <h3>Advanced Diagnostics</h3>
              <p>State-of-the-art equipment</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⭐</span>
              <h3>5-Star Service</h3>
              <p>Thousands of reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES SECTION ===== */}
      <section className="services-section" id="services">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OUR SERVICES</span>
            <h2 className="section-title">
              Professional <span className="gold-text">Repair Solutions</span>
            </h2>
            <p className="section-description">
              Choose from our comprehensive range of repair and maintenance services
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <div 
                key={service.id} 
                className={`service-card ${service.popular ? 'popular' : ''} ${selectedService?.id === service.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(service)}
              >
                {service.popular && <div className="popular-badge">MOST POPULAR</div>}
                <div className="service-icon">{service.icon}</div>
                <h3>{service.name}</h3>
                <p className="service-description">{service.description}</p>
                <p className="service-long-description">{service.longDescription}</p>
                
                <div className="service-suitable">
                  <h4>Ideal for:</h4>
                  <div className="suitable-tags">
                    {service.suitable.map((item, i) => (
                      <span key={i} className="suitable-tag">{item}</span>
                    ))}
                  </div>
                </div>

                <div className="service-price">
                  <span className="price-amount">${service.price}</span>
                  <span className="price-duration">+ parts</span>
                </div>

                <ul className="service-features">
                  {service.features.slice(0, 4).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                
                <button 
                  className={`btn-select ${selectedService?.id === service.id ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedService(service);
                    setShowBooking(true);
                    window.scrollTo({ top: document.getElementById('booking-section')?.offsetTop - 100, behavior: 'smooth' });
                  }}
                >
                  {selectedService?.id === service.id ? 'Selected' : 'Select Service'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CERTIFICATIONS SECTION ===== */}
      <section className="certifications-section">
        <div className="container">
          <div className="certifications-content">
            <h3>Factory Certified for:</h3>
            <div className="certification-badges">
              <span className="cert-badge">Porsche</span>
              <span className="cert-badge">Mercedes-Benz</span>
              <span className="cert-badge">BMW</span>
              <span className="cert-badge">Audi</span>
              <span className="cert-badge">Ferrari</span>
              <span className="cert-badge">Lamborghini</span>
              <span className="cert-badge">Rolls-Royce</span>
              <span className="cert-badge">Bentley</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BOOKING SECTION ===== */}
      {showBooking && selectedService && (
        <section className="booking-section" id="booking-section">
          <div className="container">
            <div className="booking-card">
              <h2>Schedule Your Repair</h2>

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

              {/* Step 1: Service Summary */}
              {bookingStep === 1 && (
                <div className="booking-step-content">
                  <h3>Review Your Selection</h3>
                  
                  <div className="selected-service-summary">
                    <div className="summary-item">
                      <span className="summary-label">Service:</span>
                      <span className="summary-value">{selectedService.name}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Duration:</span>
                      <span className="summary-value">{selectedService.duration}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Base Price:</span>
                      <span className="summary-value">${selectedService.price}</span>
                    </div>
                  </div>

                  <div className="service-description-full">
                    <p>{selectedService.longDescription}</p>
                  </div>

                  <div className="step-actions">
                    <button className="btn-back" onClick={() => setShowBooking(false)}>
                      Back
                    </button>
                    <button 
                      className="btn-next"
                      onClick={() => setBookingStep(2)}
                    >
                      Continue to Vehicle Info
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Vehicle Information */}
              {bookingStep === 2 && (
                <div className="booking-step-content">
                  <h3>Vehicle Information</h3>

                  <div className="vehicle-info-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Make *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g., BMW, Mercedes"
                          value={vehicleInfo.make}
                          onChange={(e) => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Model *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g., X5, S-Class"
                          value={vehicleInfo.model}
                          onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Year *</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="2024"
                          min="1990"
                          max={new Date().getFullYear() + 1}
                          value={vehicleInfo.year}
                          onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Mileage</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="e.g., 25000"
                          value={vehicleInfo.mileage}
                          onChange={(e) => setVehicleInfo({ ...vehicleInfo, mileage: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>VIN (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="17-character VIN"
                        maxLength="17"
                        value={vehicleInfo.vin}
                        onChange={(e) => setVehicleInfo({ ...vehicleInfo, vin: e.target.value.toUpperCase() })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Issue Description *</label>
                      <textarea
                        className="form-textarea"
                        rows="4"
                        placeholder="Please describe the issue in detail. Include any symptoms, when it started, and any relevant history."
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                      />
                      <div className="character-count">
                        {issueDescription.length}/500 characters
                      </div>
                    </div>
                  </div>

                  <div className="step-actions">
                    <button className="btn-back" onClick={() => setBookingStep(1)}>
                      Back
                    </button>
                    <button 
                      className="btn-next"
                      onClick={() => setBookingStep(3)}
                      disabled={!vehicleInfo.make || !vehicleInfo.model || !vehicleInfo.year || !issueDescription}
                    >
                      Continue to Location
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Location Selection */}
              {bookingStep === 3 && (
                <div className="booking-step-content">
                  <h3>Select Service Location</h3>

                  <div className="location-selection">
                    {locations.map((location) => (
                      <div
                        key={location.id}
                        className={`location-option ${selectedLocation?.id === location.id ? 'selected' : ''}`}
                        onClick={() => setSelectedLocation(location)}
                      >
                        <div className="location-option-header">
                          <span className="location-option-icon">📍</span>
                          <h4>{location.name}</h4>
                        </div>
                        <p className="location-option-address">{location.address}</p>
                        <p className="location-option-hours">{location.hours}</p>
                        
                        <div className="location-amenities">
                          {location.amenities?.map((item, i) => (
                            <span key={i} className="amenity-tag">{item}</span>
                          ))}
                        </div>

                        {location.certified && (
                          <div className="certified-brands">
                            <span className="certified-label">Certified for:</span>
                            {location.certified.map((brand, i) => (
                              <span key={i} className="brand-tag">{brand}</span>
                            ))}
                          </div>
                        )}

                        {location.fee && (
                          <p className="location-fee">+${location.fee} mobile service fee</p>
                        )}
                        {location.note && (
                          <p className="location-note">{location.note}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedLocation?.id === 'mobile' && (
                    <div className="mobile-address-form">
                      <label>Service Address *</label>
                      <textarea
                        className="form-textarea"
                        rows="2"
                        placeholder="Enter your full address for mobile service"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                      <p className="address-note">
                        Mobile service available for basic repairs and diagnostics within our service area.
                      </p>
                    </div>
                  )}

                  <div className="step-actions">
                    <button className="btn-back" onClick={() => setBookingStep(2)}>
                      Back
                    </button>
                    <button 
                      className="btn-next"
                      onClick={() => setBookingStep(4)}
                      disabled={!selectedLocation || (selectedLocation.id === 'mobile' && !deliveryAddress)}
                    >
                      Continue to Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Schedule */}
              {bookingStep === 4 && (
                <div className="booking-step-content">
                  <h3>Choose Date & Time</h3>

                  <div className="schedule-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Service Date *</label>
                        <input
                          type="date"
                          className="form-input"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div className="form-group">
                        <label>Preferred Time *</label>
                        <select
                          className="form-select"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                        >
                          <option value="">Select time</option>
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="urgency-section">
                      <label>Urgency Level</label>
                      <div className="urgency-options">
                        {urgencyOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`urgency-btn ${urgency === option.value ? 'active' : ''}`}
                            style={{ '--btn-color': option.color }}
                            onClick={() => setUrgency(option.value)}
                          >
                            {option.label}
                            {option.multiplier > 1 && (
                              <span className="urgency-multiplier">+50%</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="service-info">
                      <p>⏱️ Estimated duration: {selectedService.duration}</p>
                      <p>📍 Location: {selectedLocation?.name}</p>
                      {selectedLocation?.id === 'mobile' && (
                        <p>🚚 Mobile service to: {deliveryAddress}</p>
                      )}
                    </div>
                  </div>

                  <div className="step-actions">
                    <button className="btn-back" onClick={() => setBookingStep(3)}>
                      Back
                    </button>
                    <button 
                      className="btn-next"
                      onClick={() => setBookingStep(5)}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Review Booking
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Confirmation */}
              {bookingStep === 5 && (
                <div className="booking-step-content">
                  <h3>Review Your Repair Booking</h3>

                  <div className="booking-summary-card">
                    <div className="summary-section">
                      <h4>Service</h4>
                      <p><strong>{selectedService.name}</strong></p>
                      <p>{selectedService.description}</p>
                    </div>

                    <div className="summary-section">
                      <h4>Vehicle</h4>
                      <p><strong>{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</strong></p>
                      {vehicleInfo.mileage && <p>Mileage: {vehicleInfo.mileage} miles</p>}
                      {vehicleInfo.vin && <p>VIN: {vehicleInfo.vin}</p>}
                    </div>

                    <div className="summary-section">
                      <h4>Issue Description</h4>
                      <p className="issue-description">{issueDescription}</p>
                    </div>

                    <div className="summary-section">
                      <h4>Location</h4>
                      <p><strong>{selectedLocation?.name}</strong></p>
                      <p>{selectedLocation?.address}</p>
                      {selectedLocation?.id === 'mobile' && (
                        <p className="delivery-address">Service at: {deliveryAddress}</p>
                      )}
                    </div>

                    <div className="summary-section">
                      <h4>Schedule</h4>
                      <p><strong>{new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</strong></p>
                      <p>at {selectedTime}</p>
                      <p>Urgency: {urgencyOptions.find(u => u.value === urgency)?.label}</p>
                    </div>

                    <div className="price-breakdown">
                      <h4>Price Estimate</h4>
                      <div className="price-row">
                        <span>Base Service</span>
                        <span>${selectedService.price}</span>
                      </div>
                      {urgency === 'urgent' && (
                        <div className="price-row">
                          <span>Urgent Service Fee (50%)</span>
                          <span>${selectedService.price * 0.5}</span>
                        </div>
                      )}
                      {selectedLocation?.id === 'mobile' && (
                        <div className="price-row">
                          <span>Mobile Service Fee</span>
                          <span>$49</span>
                        </div>
                      )}
                      <div className="price-row">
                        <span>Subtotal</span>
                        <span>${priceBreakdown.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="price-row">
                        <span>Tax (10%)</span>
                        <span>${priceBreakdown.tax.toFixed(2)}</span>
                      </div>
                      <div className="price-row total">
                        <span>Total Estimate</span>
                        <span className="total-amount">${priceBreakdown.total.toFixed(2)}</span>
                      </div>
                      <p className="estimate-note">*Final cost may vary after inspection</p>
                    </div>
                  </div>

                  <div className="terms-agreement">
                    <label className="checkbox-label">
                      <input type="checkbox" required />
                      <span>I agree to the <Link to="/terms">Terms of Service</Link> and authorize the repair estimate</span>
                    </label>
                  </div>

                  <div className="step-actions">
                    <button className="btn-back" onClick={() => setBookingStep(4)}>
                      Back
                    </button>
                    <button 
                      className="btn-confirm"
                      onClick={() => {
                        navigate('/booking-confirmation', {
                          state: {
                            type: 'repair',
                            service: selectedService,
                            vehicle: vehicleInfo,
                            issue: issueDescription,
                            location: selectedLocation,
                            date: selectedDate,
                            time: selectedTime,
                            urgency,
                            deliveryAddress: selectedLocation?.id === 'mobile' ? deliveryAddress : null,
                            priceBreakdown
                          }
                        });
                      }}
                    >
                      Schedule Repair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== WHY CHOOSE US SECTION ===== */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHY CHOOSE US</span>
            <h2 className="section-title">
              The CAR EASE <span className="gold-text">Advantage</span>
            </h2>
          </div>

          <div className="why-grid">
            <div className="why-item">
              <div className="why-icon">👨‍🔧</div>
              <h3>Certified Experts</h3>
              <p>Factory-trained technicians with years of experience</p>
            </div>
            <div className="why-item">
              <div className="why-icon">🔧</div>
              <h3>Genuine Parts</h3>
              <p>OEM and quality-assured components</p>
            </div>
            <div className="why-item">
              <div className="why-icon">✓</div>
              <h3>24-Month Warranty</h3>
              <p>Comprehensive coverage on all repairs</p>
            </div>
            <div className="why-item">
              <div className="why-icon">🔬</div>
              <h3>Advanced Diagnostics</h3>
              <p>State-of-the-art equipment</p>
            </div>
            <div className="why-item">
              <div className="why-icon">🚚</div>
              <h3>Free Pickup/Delivery</h3>
              <p>Complimentary within 25 miles</p>
            </div>
            <div className="why-item">
              <div className="why-icon">⭐</div>
              <h3>5-Star Service</h3>
              <p>Thousands of satisfied customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">FAQ</span>
            <h2 className="section-title">
              Common <span className="gold-text">Questions</span>
            </h2>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h3>Do you use genuine parts?</h3>
              <p>Yes, we only use OEM and genuine parts to ensure the highest quality and longevity of repairs.</p>
            </div>
            <div className="faq-item">
              <h3>What warranty do you offer?</h3>
              <p>All repairs come with a 24-month/24,000-mile warranty on parts and labor.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer pickup and delivery?</h3>
              <p>Yes, we offer complimentary pickup and delivery within 25 miles of our service centers.</p>
            </div>
            <div className="faq-item">
              <h3>How long will my repair take?</h3>
              <p>Repair times vary by service. We'll provide an estimated completion time when you book.</p>
            </div>
            <div className="faq-item">
              <h3>Do you provide loaner vehicles?</h3>
              <p>Yes, loaner vehicles are available upon request for qualifying repairs.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, PayPal, and financing options.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="repairs-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Need Immediate Assistance?</h2>
            <p>Our emergency repair services are available 24/7</p>
            <a href="tel:+18005550123" className="btn-gold btn-large">
              Call Now: +1 (800) 555-0123
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Repairs;