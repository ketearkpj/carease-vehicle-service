import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/CarWash.css';

const CarWash = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [vehicleType, setVehicleType] = useState('sedan');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Wash Packages
  const packages = [
    {
      id: 'express',
      name: 'Express Wash',
      price: 29,
      duration: '30 min',
      description: 'Quick and efficient exterior wash for daily maintenance',
      longDescription: 'Perfect for regular maintenance, our Express Wash delivers a thorough exterior cleaning that will have your car looking its best in just 30 minutes.',
      suitable: ['Daily drivers', 'Sedans', 'Regular maintenance'],
      features: [
        'Exterior hand wash with premium shampoo',
        'Wheel and rim cleaning',
        'Tire shine application',
        'Windows cleaned inside and out',
        'Quick interior vacuum',
        'Door jams wiped down'
      ],
      icon: '🚿',
      popular: false,
      basePrice: 29
    },
    {
      id: 'premium',
      name: 'Premium Detail',
      price: 79,
      duration: '2 hours',
      description: 'Comprehensive interior and exterior detailing',
      longDescription: 'Our most popular package, the Premium Detail provides complete interior and exterior care, leaving your vehicle showroom fresh.',
      suitable: ['Luxury vehicles', 'Special occasions', 'Quarterly maintenance'],
      features: [
        'Everything in Express Wash',
        'Deep interior carpet cleaning',
        'Leather conditioning and protection',
        'Clay bar treatment for paint',
        'Premium wax application',
        'Engine bay cleaning',
        'Plastic trim restoration',
        'Air freshener'
      ],
      icon: '✨',
      popular: true,
      basePrice: 79
    },
    {
      id: 'ultimate',
      name: 'Ultimate Ceramic',
      price: 299,
      duration: '4 hours',
      description: 'Professional ceramic coating for lasting protection',
      longDescription: 'The ultimate protection for your vehicle. Our ceramic coating provides years of protection against the elements while maintaining a perfect shine.',
      suitable: ['Exotic cars', 'New vehicles', 'Long-term protection'],
      features: [
        'Everything in Premium Detail',
        '9H ceramic coating application',
        'Paint correction and swirl removal',
        'Headlight restoration',
        'Fabric and carpet protection',
        '24 month warranty',
        'UV protection',
        'Hydrophobic properties'
      ],
      icon: '👑',
      popular: false,
      basePrice: 299
    }
  ];

  // Add-on Services
  const addons = [
    { id: 'engine', name: 'Engine Detailing', price: 49, icon: '🔧', description: 'Complete engine bay cleaning and dressing' },
    { id: 'headlight', name: 'Headlight Restoration', price: 39, icon: '💡', description: 'Restore cloudy headlights to like-new condition' },
    { id: 'odor', name: 'Odor Elimination', price: 29, icon: '🌿', description: 'Remove pet, smoke, and food odors' },
    { id: 'scratch', name: 'Scratch Removal', price: 79, icon: '✨', description: 'Light scratch and swirl mark removal' },
    { id: 'clay', name: 'Clay Bar Treatment', price: 59, icon: '🧴', description: 'Remove bonded contaminants from paint' },
    { id: 'wax', name: 'Premium Wax', price: 45, icon: '🕯️', description: 'Carnauba wax for deep shine and protection' },
    { id: 'interior', name: 'Deep Interior Clean', price: 89, icon: '🧹', description: 'Complete interior shampoo and steam cleaning' },
    { id: 'seat', name: 'Leather Treatment', price: 35, icon: '🪑', description: 'Leather cleaning and conditioning' }
  ];

  // Locations
  const locations = [
    {
      id: 'beverly-hills',
      name: 'Beverly Hills Flagship',
      address: '123 Luxury Lane, Beverly Hills, CA 90210',
      phone: '+1 (310) 555-0123',
      hours: 'Mon-Sun: 8am - 8pm',
      amenities: ['Indoor detailing', 'Waiting lounge', 'Complimentary coffee', 'Free WiFi'],
      coordinates: { lat: 34.0736, lng: -118.4004 },
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'
    },
    {
      id: 'miami',
      name: 'Miami Beach',
      address: '456 Ocean Drive, Miami Beach, FL 33139',
      phone: '+1 (305) 555-0456',
      hours: 'Mon-Sun: 9am - 7pm',
      amenities: ['Ocean view waiting area', 'Valet parking', 'Refreshments'],
      coordinates: { lat: 25.7907, lng: -80.1300 },
      image: 'https://images.unsplash.com/photo-1533107862482-0e6974b3ec9c?w=800'
    },
    {
      id: 'new-york',
      name: 'Manhattan',
      address: '789 Park Avenue, New York, NY 10022',
      phone: '+1 (212) 555-0789',
      hours: 'Mon-Fri: 8am - 8pm, Sat: 9am-6pm',
      amenities: ['Concierge service', 'Business center', 'Complimentary snacks'],
      coordinates: { lat: 40.7614, lng: -73.9776 },
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'
    },
    {
      id: 'mobile',
      name: 'Mobile Service',
      address: 'We come to your location',
      phone: '+1 (800) 555-WASH',
      hours: 'Mon-Sun: 9am - 6pm',
      amenities: ['Convenient', 'At your home/office', 'Fully equipped van'],
      image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800',
      serviceArea: ['Los Angeles County', 'Orange County', 'San Diego County']
    }
  ];

  // Vehicle Types with price multipliers
  const vehicleTypes = [
    { id: 'sedan', name: 'Sedan / Coupe', multiplier: 1.0, icon: '🚗' },
    { id: 'suv', name: 'SUV / Crossover', multiplier: 1.3, icon: '🚙' },
    { id: 'luxury', name: 'Luxury Car', multiplier: 1.5, icon: '🏎️' },
    { id: 'exotic', name: 'Exotic / Supercar', multiplier: 2.0, icon: '🏁' },
    { id: 'truck', name: 'Truck', multiplier: 1.4, icon: '🛻' },
    { id: 'van', name: 'Van / Minivan', multiplier: 1.4, icon: '🚐' }
  ];

  // Time slots
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM', '5:00 PM', '6:00 PM'
  ];

  // Calculate price with all factors
  const calculatePrice = () => {
    if (!selectedPackage) return 0;
    
    const vehicleMultiplier = vehicleTypes.find(v => v.id === vehicleType)?.multiplier || 1;
    const packagePrice = selectedPackage.basePrice * vehicleMultiplier;
    const addonsTotal = addons
      .filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    
    // Mobile service fee (if applicable)
    const mobileFee = selectedLocation?.id === 'mobile' ? 25 : 0;
    
    return {
      packagePrice: Math.round(packagePrice * 100) / 100,
      addonsTotal,
      mobileFee,
      subtotal: Math.round((packagePrice + addonsTotal + mobileFee) * 100) / 100,
      tax: Math.round((packagePrice + addonsTotal + mobileFee) * 0.1 * 100) / 100,
      total: Math.round((packagePrice + addonsTotal + mobileFee) * 1.1 * 100) / 100
    };
  };

  const priceBreakdown = calculatePrice();

  // Booking steps
  const bookingSteps = [
    { number: 1, name: 'Choose Package', icon: '📦' },
    { number: 2, name: 'Select Location', icon: '📍' },
    { number: 3, name: 'Schedule', icon: '📅' },
    { number: 4, name: 'Confirm', icon: '✓' }
  ];

  return (
    <div className="carwash-page">
      {/* ===== HERO SECTION ===== */}
      <section className="carwash-hero">
        <div className="carwash-hero-bg"></div>
        <div className="carwash-hero-content">
          <h1 className="carwash-hero-title animate-fade-up">
            Elite <span className="gold-text">Car Wash</span>
          </h1>
          <p className="carwash-hero-description animate-fade-up">
            Experience the pinnacle of automotive care at our locations or at your doorstep
          </p>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">⏱️</span>
              <h3>Express Service</h3>
              <p>30-minute express wash available</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🌿</span>
              <h3>Eco-Friendly</h3>
              <p>Biodegradable, water-saving products</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🚚</span>
              <h3>Mobile Service</h3>
              <p>We come to your home or office</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🏆</span>
              <h3>Award Winning</h3>
              <p>Recognized for excellence</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>Satisfaction Guaranteed</h3>
              <p>100% money-back guarantee</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔒</span>
              <h3>Insured & Bonded</h3>
              <p>Full liability coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PACKAGES SECTION ===== */}
      <section className="packages-section" id="packages">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">CHOOSE YOUR PACKAGE</span>
            <h2 className="section-title">
              Premium <span className="gold-text">Wash Packages</span>
            </h2>
            <p className="section-description">
              Select the perfect package for your vehicle's needs
            </p>
          </div>

          <div className="packages-grid">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`package-card ${pkg.popular ? 'popular' : ''} ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                onClick={() => setSelectedPackage(pkg)}
              >
                {pkg.popular && <div className="popular-badge">MOST POPULAR</div>}
                <div className="package-icon">{pkg.icon}</div>
                <h3>{pkg.name}</h3>
                <p className="package-description">{pkg.description}</p>
                <p className="package-long-description">{pkg.longDescription}</p>
                <div className="package-price">
                  <span className="price-amount">${pkg.basePrice}</span>
                  <span className="price-duration">/{pkg.duration}</span>
                </div>
                
                <div className="package-suitable">
                  <h4>Ideal for:</h4>
                  <ul>
                    {pkg.suitable.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <ul className="package-features">
                  {pkg.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                
                <button 
                  className={`btn-select ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPackage(pkg);
                    setShowBooking(true);
                    window.scrollTo({ top: document.getElementById('booking-flow').offsetTop - 100, behavior: 'smooth' });
                  }}
                >
                  {selectedPackage?.id === pkg.id ? 'Selected' : 'Select Package'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ADD-ONS SECTION ===== */}
      <section className="addons-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">ENHANCE YOUR EXPERIENCE</span>
            <h2 className="section-title">
              Add<span className="gold-text">-On Services</span>
            </h2>
            <p className="section-description">
              Customize your service with these premium add-ons
            </p>
          </div>

          <div className="addons-grid">
            {addons.map((addon) => (
              <div 
                key={addon.id} 
                className={`addon-card ${selectedAddons.includes(addon.id) ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedAddons(prev =>
                    prev.includes(addon.id)
                      ? prev.filter(id => id !== addon.id)
                      : [...prev, addon.id]
                  );
                }}
              >
                <div className="addon-icon">{addon.icon}</div>
                <h3>{addon.name}</h3>
                <p className="addon-description">{addon.description}</p>
                <p className="addon-price">+${addon.price}</p>
                {selectedAddons.includes(addon.id) && (
                  <div className="addon-check">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LOCATIONS SECTION ===== */}
      <section className="locations-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OUR LOCATIONS</span>
            <h2 className="section-title">
              Visit Us or <span className="gold-text">We Come to You</span>
            </h2>
            <p className="section-description">
              Choose from our premium locations or convenient mobile service
            </p>
          </div>

          <div className="locations-grid">
            {locations.map((location) => (
              <div 
                key={location.id} 
                className={`location-card ${selectedLocation?.id === location.id ? 'selected' : ''}`}
                onClick={() => setSelectedLocation(location)}
              >
                <div className="location-image">
                  <img src={location.image} alt={location.name} />
                  {location.id === 'mobile' && (
                    <div className="mobile-badge">Mobile Service</div>
                  )}
                </div>
                <div className="location-details">
                  <h3>{location.name}</h3>
                  <p className="location-address">{location.address}</p>
                  <p className="location-phone">{location.phone}</p>
                  <p className="location-hours">{location.hours}</p>
                  
                  <div className="location-amenities">
                    <h4>Amenities:</h4>
                    <ul>
                      {location.amenities.map((amenity, index) => (
                        <li key={index}>{amenity}</li>
                      ))}
                    </ul>
                  </div>

                  {location.serviceArea && (
                    <div className="service-area">
                      <h4>Service Area:</h4>
                      <p>{location.serviceArea.join(' • ')}</p>
                    </div>
                  )}

                  <button 
                    className="btn-select-location"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLocation(location);
                    }}
                  >
                    {selectedLocation?.id === location.id ? 'Selected' : 'Select Location'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VEHICLE TYPE SECTION ===== */}
      <section className="vehicle-type-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">VEHICLE TYPE</span>
            <h2 className="section-title">
              Select Your <span className="gold-text">Vehicle</span>
            </h2>
          </div>

          <div className="vehicle-type-grid">
            {vehicleTypes.map((type) => (
              <div
                key={type.id}
                className={`vehicle-type-card ${vehicleType === type.id ? 'selected' : ''}`}
                onClick={() => setVehicleType(type.id)}
              >
                <span className="vehicle-icon">{type.icon}</span>
                <h4>{type.name}</h4>
                <p className="vehicle-multiplier">x{type.multiplier}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BOOKING FLOW ===== */}
      {showBooking && selectedPackage && (
        <section className="booking-flow-section" id="booking-flow">
          <div className="container">
            <div className="booking-card">
              <h2>Complete Your Booking</h2>

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

              {/* Step 1: Package Summary */}
              {bookingStep === 1 && (
                <div className="booking-step-content">
                  <h3>Review Your Selection</h3>
                  <div className="selected-package-summary">
                    <div className="summary-item">
                      <span className="summary-label">Package:</span>
                      <span className="summary-value">{selectedPackage.name}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Duration:</span>
                      <span className="summary-value">{selectedPackage.duration}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Base Price:</span>
                      <span className="summary-value">${selectedPackage.basePrice}</span>
                    </div>
                  </div>

                  <div className="selected-addons-summary">
                    <h4>Selected Add-ons:</h4>
                    {selectedAddons.length > 0 ? (
                      <div className="addon-tags">
                        {selectedAddons.map(id => {
                          const addon = addons.find(a => a.id === id);
                          return (
                            <span key={id} className="addon-tag">
                              {addon.name} (+${addon.price})
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="no-addons">No add-ons selected</p>
                    )}
                  </div>

                  <div className="step-actions">
                    <button className="btn-back" onClick={() => setShowBooking(false)}>
                      Back
                    </button>
                    <button 
                      className="btn-next"
                      onClick={() => setBookingStep(2)}
                    >
                      Continue to Location
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Location Selection */}
              {bookingStep === 2 && (
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
                        {location.id === 'mobile' && (
                          <p className="mobile-note">+$25 service fee applies</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedLocation?.id === 'mobile' && (
                    <div className="mobile-address-form">
                      <label>Delivery Address</label>
                      <textarea
                        className="form-textarea"
                        rows="2"
                        placeholder="Enter your full address for mobile service"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                      <p className="address-note">
                        Our mobile service van will arrive at your location within the scheduled time window.
                      </p>
                    </div>
                  )}

                  <div className="step-actions">
                    <button className="btn-back" onClick={() => setBookingStep(1)}>
                      Back
                    </button>
                    <button 
                      className="btn-next"
                      onClick={() => setBookingStep(3)}
                      disabled={!selectedLocation || (selectedLocation.id === 'mobile' && !deliveryAddress)}
                    >
                      Continue to Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {bookingStep === 3 && (
                <div className="booking-step-content">
                  <h3>Choose Date & Time</h3>

                  <div className="schedule-form">
                    <div className="form-group">
                      <label>Select Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-group">
                      <label>Preferred Time</label>
                      <select
                        className="form-select"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                      >
                        <option value="">Select a time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    <div className="time-info">
                      <p>⏱️ Estimated duration: {selectedPackage.duration}</p>
                      <p>📍 Location: {selectedLocation?.name}</p>
                      {selectedLocation?.id === 'mobile' && (
                        <p>🚚 Mobile service to: {deliveryAddress}</p>
                      )}
                    </div>
                  </div>

                  <div className="step-actions">
                    <button className="btn-back" onClick={() => setBookingStep(2)}>
                      Back
                    </button>
                    <button 
                      className="btn-next"
                      onClick={() => setBookingStep(4)}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Review Booking
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {bookingStep === 4 && (
                <div className="booking-step-content">
                  <h3>Review Your Booking</h3>

                  <div className="booking-summary-card">
                    <div className="summary-section">
                      <h4>Package Details</h4>
                      <p><strong>{selectedPackage.name}</strong> - {selectedPackage.duration}</p>
                      <p>{selectedPackage.description}</p>
                    </div>

                    <div className="summary-section">
                      <h4>Vehicle</h4>
                      <p>{vehicleTypes.find(v => v.id === vehicleType)?.name}</p>
                    </div>

                    <div className="summary-section">
                      <h4>Location</h4>
                      <p><strong>{selectedLocation?.name}</strong></p>
                      <p>{selectedLocation?.address}</p>
                      {selectedLocation?.id === 'mobile' && (
                        <p className="delivery-address">Delivery to: {deliveryAddress}</p>
                      )}
                    </div>

                    <div className="summary-section">
                      <h4>Schedule</h4>
                      <p><strong>{new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</strong></p>
                      <p>at {selectedTime}</p>
                    </div>

                    {selectedAddons.length > 0 && (
                      <div className="summary-section">
                        <h4>Add-ons</h4>
                        <ul className="summary-addons-list">
                          {selectedAddons.map(id => {
                            const addon = addons.find(a => a.id === id);
                            return (
                              <li key={id}>{addon.name} - ${addon.price}</li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    <div className="price-breakdown">
                      <h4>Price Breakdown</h4>
                      <div className="price-row">
                        <span>Package ({vehicleTypes.find(v => v.id === vehicleType)?.name})</span>
                        <span>${priceBreakdown.packagePrice.toFixed(2)}</span>
                      </div>
                      {selectedAddons.length > 0 && (
                        <div className="price-row">
                          <span>Add-ons</span>
                          <span>${priceBreakdown.addonsTotal.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedLocation?.id === 'mobile' && (
                        <div className="price-row">
                          <span>Mobile Service Fee</span>
                          <span>${priceBreakdown.mobileFee.toFixed(2)}</span>
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
                        <span>Total</span>
                        <span className="total-amount">${priceBreakdown.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="terms-agreement">
                    <label className="checkbox-label">
                      <input type="checkbox" required />
                      <span>I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></span>
                    </label>
                  </div>

                  <div className="step-actions">
                    <button className="btn-back" onClick={() => setBookingStep(3)}>
                      Back
                    </button>
                    <button 
                      className="btn-confirm"
                      onClick={() => {
                        // In a real app, this would submit to backend
                        navigate('/booking-confirmation', {
                          state: {
                            service: 'Car Wash',
                            package: selectedPackage,
                            location: selectedLocation,
                            date: selectedDate,
                            time: selectedTime,
                            vehicleType,
                            addons: selectedAddons,
                            deliveryAddress: selectedLocation?.id === 'mobile' ? deliveryAddress : null,
                            priceBreakdown
                          }
                        });
                      }}
                    >
                      Confirm Booking
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
              The CAR EASE <span className="gold-text">Difference</span>
            </h2>
          </div>

          <div className="why-grid">
            <div className="why-item">
              <div className="why-icon">🏆</div>
              <h3>Award Winning</h3>
              <p>Recognized as "Best Detailer" 3 years running</p>
            </div>
            <div className="why-item">
              <div className="why-icon">🌱</div>
              <h3>Eco-Friendly</h3>
              <p>Water-saving techniques and biodegradable products</p>
            </div>
            <div className="why-item">
              <div className="why-icon">👨‍🎨</div>
              <h3>Certified Detailers</h3>
              <p>IDA certified professionals</p>
            </div>
            <div className="why-item">
              <div className="why-icon">🔬</div>
              <h3>Premium Products</h3>
              <p>Only the finest German and Swiss products</p>
            </div>
            <div className="why-item">
              <div className="why-icon">✓</div>
              <h3>100% Guarantee</h3>
              <p>Not satisfied? We'll make it right</p>
            </div>
            <div className="why-item">
              <div className="why-icon">⭐</div>
              <h3>5-Star Service</h3>
              <p>Thousands of happy customers</p>
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
              Frequently Asked <span className="gold-text">Questions</span>
            </h2>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h3>How long does a wash take?</h3>
              <p>Express wash takes 30 minutes, Premium Detail takes 2 hours, and Ultimate Ceramic takes 4 hours. Mobile service may add 15-30 minutes for setup.</p>
            </div>
            <div className="faq-item">
              <h3>Do I need to be present during service?</h3>
              <p>For location service, you're welcome to wait in our lounge. For mobile service, you can leave the vehicle with us or stay - whatever is more convenient.</p>
            </div>
            <div className="faq-item">
              <h3>What areas do you service for mobile?</h3>
              <p>We currently serve Los Angeles County, Orange County, and San Diego County. Check our locations section for specific coverage.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, PayPal, and mobile payments. Payment is required after service completion.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer recurring service discounts?</h3>
              <p>Yes! Sign up for our monthly maintenance plan and save 15% on each service.</p>
            </div>
            <div className="faq-item">
              <h3>What if it rains after my wash?</h3>
              <p>If it rains within 24 hours of your service, we offer a free complimentary rinse.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="carwash-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Make Your Car Shine?</h2>
            <p>Book your premium car wash today and experience the difference</p>
            <button 
              className="btn-gold btn-large"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              View Packages
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarWash;