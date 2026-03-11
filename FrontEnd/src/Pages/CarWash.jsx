// ===== src/Pages/CarWash.jsx =====
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { WASH_PACKAGES, LOCATIONS } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import HeroSection from '../Components/Features/HeroSection';
import BookingForm from '../Components/Features/BookingForm';

// Services
import { getWashPackages, getAvailableTimeSlots } from '../Services/Service.Service';

// Hooks
import { useApp } from '../Context/AppContext';
import { useBooking } from '../Hooks/useBooking';

// Styles
import '../Styles/CarWash.css';

const CarWash = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState(1);
  const [formData, setFormData] = useState({
    package: '',
    date: '',
    time: '',
    location: '',
    vehicleSize: 'standard',
    extras: [],
    specialRequests: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [price, setPrice] = useState(null);

  const { addNotification } = useApp();
  const { createNewBooking } = useBooking();

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (formData.date) {
      fetchAvailableSlots(formData.date);
    }
  }, [formData.date]);

  useEffect(() => {
    if (selectedPackage) {
      calculatePrice();
    }
  }, [selectedPackage, formData.vehicleSize, formData.extras]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await getWashPackages();
      setPackages(data);
      if (data.length > 0) {
        setSelectedPackage(data[0]);
        setFormData(prev => ({ ...prev, package: data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch wash packages:', error);
      setPackages(WASH_PACKAGES);
      setSelectedPackage(WASH_PACKAGES[0]);
      setFormData(prev => ({ ...prev, package: WASH_PACKAGES[0].id }));
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const slots = await getAvailableTimeSlots(date, 'car_wash');
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      // Mock slots
      setAvailableSlots([
        '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
      ]);
    }
  };

  const calculatePrice = () => {
    if (!selectedPackage) return;

    let total = selectedPackage.price;

    // Vehicle size multiplier
    const sizeMultipliers = {
      compact: 0.8,
      standard: 1.0,
      suv: 1.3,
      luxury: 1.5,
      exotic: 2.0
    };
    total *= sizeMultipliers[formData.vehicleSize] || 1.0;

    // Add extras
    formData.extras.forEach(extra => {
      total += extra.price || 0;
    });

    setPrice(total);
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setFormData(prev => ({ ...prev, package: pkg.id }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExtraToggle = (extra) => {
    setFormData(prev => {
      const exists = prev.extras.find(e => e.id === extra.id);
      if (exists) {
        return {
          ...prev,
          extras: prev.extras.filter(e => e.id !== extra.id)
        };
      } else {
        return {
          ...prev,
          extras: [...prev.extras, extra]
        };
      }
    });
  };

  const handleBookingSubmit = async () => {
    try {
      await createNewBooking({
        serviceType: 'car_wash',
        ...formData,
        totalPrice: price,
        packageName: selectedPackage?.name
      });
      addNotification('Booking created successfully! Check your email for confirmation.', 'success');
      setBookingStep(3);
    } catch (error) {
      addNotification(error.message || 'Failed to create booking. Please try again.', 'error');
    }
  };

  const extras = [
    { id: 'ceramic', name: 'Ceramic Coating', price: 199, description: '9H ceramic protection' },
    { id: 'interior', name: 'Deep Interior Clean', price: 79, description: 'Complete interior detailing' },
    { id: 'engine', name: 'Engine Bay Cleaning', price: 49, description: 'Professional engine detailing' },
    { id: 'headlight', name: 'Headlight Restoration', price: 89, description: 'Restore clarity to headlights' },
    { id: 'odor', name: 'Odor Removal', price: 59, description: 'Ozone treatment' },
    { id: 'paint', name: 'Paint Correction', price: 299, description: 'Remove swirl marks and scratches' }
  ];

  const vehicleSizes = [
    { value: 'compact', label: 'Compact Car' },
    { value: 'standard', label: 'Standard Sedan' },
    { value: 'suv', label: 'SUV / Crossover' },
    { value: 'luxury', label: 'Luxury Sedan' },
    { value: 'exotic', label: 'Exotic / Supercar' }
  ];

  return (
    <div className="carwash-page">
      {/* Hero Section */}
      <HeroSection
        title="Professional Car Wash & Detailing"
        subtitle="Premium care for your vehicle with state-of-the-art equipment and products"
        ctaText="Book Now"
        ctaLink="#booking"
        secondaryCtaText="View Packages"
        secondaryCtaLink="#packages"
        backgroundImage="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        alignment="center"
        fullHeight={false}
      />

      {/* Packages Section */}
      <section className="packages-section" id="packages">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OUR PACKAGES</span>
            <h2 className="section-title">Choose Your <span className="gold-text">Wash Package</span></h2>
            <p className="section-description">
              Select the perfect detailing package for your vehicle
            </p>
          </div>

          {loading ? (
            <div className="packages-loading">
              <LoadingSpinner size="lg" color="gold" text="Loading packages..." />
            </div>
          ) : (
            <div className="packages-grid">
              {packages.map((pkg, index) => (
                <Card
                  key={pkg.id}
                  className={`package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''} animate-fade-up animate-delay-${index + 1}`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <div className="package-badge">{pkg.duration} min</div>
                  <div className="package-icon">{pkg.icon || '🧼'}</div>
                  <h3 className="package-name">{pkg.name}</h3>
                  <p className="package-description">{pkg.description}</p>
                  <ul className="package-features">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx}>
                        <span className="feature-check">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="package-price">
                    <span className="price-amount">${pkg.price}</span>
                  </div>
                  <Button
                    variant={selectedPackage?.id === pkg.id ? 'primary' : 'outline'}
                    size="sm"
                    fullWidth
                    onClick={() => handlePackageSelect(pkg)}
                  >
                    {selectedPackage?.id === pkg.id ? 'Selected' : 'Select Package'}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHY CHOOSE US</span>
            <h2 className="section-title">Premium <span className="gold-text">Detailing</span> Experience</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card animate-fade-up animate-delay-1">
              <div className="feature-icon">💧</div>
              <h3 className="feature-title">Deionized Water</h3>
              <p className="feature-description">Spot-free rinse with purified water system</p>
            </div>

            <div className="feature-card animate-fade-up animate-delay-2">
              <div className="feature-icon">🧴</div>
              <h3 className="feature-title">Premium Products</h3>
              <p className="feature-description">Only the finest car care products</p>
            </div>

            <div className="feature-card animate-fade-up animate-delay-3">
              <div className="feature-icon">👨‍🔧</div>
              <h3 className="feature-title">Certified Detailers</h3>
              <p className="feature-description">Trained professionals</p>
            </div>

            <div className="feature-card animate-fade-up animate-delay-4">
              <div className="feature-icon">🛡️</div>
              <h3 className="feature-title">Satisfaction Guaranteed</h3>
              <p className="feature-description">100% satisfaction or we redo it</p>
            </div>

            <div className="feature-card animate-fade-up animate-delay-5">
              <div className="feature-icon">⏱️</div>
              <h3 className="feature-title">Express Service</h3>
              <p className="feature-description">Quick turnaround times</p>
            </div>

            <div className="feature-card animate-fade-up animate-delay-6">
              <div className="feature-icon">🚗</div>
              <h3 className="feature-title">All Vehicle Types</h3>
              <p className="feature-description">From compacts to exotics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="booking-section" id="booking">
        <div className="container">
          <div className="booking-grid">
            {/* Left Column - Booking Form */}
            <div className="booking-form-container animate-fade-right">
              <div className="form-header">
                <span className="form-badge">BOOK NOW</span>
                <h2 className="form-title">Schedule Your <span className="gold-text">Detailing</span></h2>
                <p className="form-description">
                  Fill in the details below to book your car wash service
                </p>
              </div>

              {bookingStep === 1 && (
                <div className="booking-step">
                  <div className="selected-package-info">
                    <h3>Selected Package: {selectedPackage?.name}</h3>
                    <p className="package-price">${selectedPackage?.price}</p>
                  </div>

                  <div className="form-row">
                    <Select
                      label="Vehicle Size"
                      name="vehicleSize"
                      value={formData.vehicleSize}
                      onChange={handleInputChange}
                      options={vehicleSizes}
                      required
                      icon="🚗"
                    />
                  </div>

                  <div className="form-row">
                    <Select
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      options={LOCATIONS.map(loc => ({ value: loc.id, label: loc.name }))}
                      required
                      icon="📍"
                      placeholder="Select location"
                    />
                  </div>

                  <div className="form-row">
                    <Input
                      label="Preferred Date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      icon="📅"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {formData.date && (
                    <div className="form-row">
                      <Select
                        label="Preferred Time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        options={availableSlots.map(slot => ({ value: slot, label: slot }))}
                        required
                        icon="⏰"
                        placeholder="Select time"
                      />
                    </div>
                  )}

                  <div className="form-actions">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => setBookingStep(2)}
                      disabled={!formData.location || !formData.date || !formData.time}
                    >
                      Continue to Extras →
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 2 && (
                <div className="booking-step">
                  <h3 className="step-title">Add Extras</h3>
                  <p className="step-description">Enhance your detailing experience</p>

                  <div className="extras-grid">
                    {extras.map((extra) => (
                      <label key={extra.id} className="extra-item">
                        <input
                          type="checkbox"
                          checked={formData.extras.some(e => e.id === extra.id)}
                          onChange={() => handleExtraToggle(extra)}
                        />
                        <div className="extra-content">
                          <div className="extra-info">
                            <span className="extra-name">{extra.name}</span>
                            <span className="extra-description">{extra.description}</span>
                          </div>
                          <span className="extra-price">+${extra.price}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="form-row">
                    <label className="textarea-label">Special Requests</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      placeholder="Any special instructions or requirements?"
                      rows="4"
                      className="special-requests-textarea"
                    />
                  </div>

                  <div className="form-actions">
                    <Button
                      variant="outline"
                      onClick={() => setBookingStep(1)}
                    >
                      ← Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleBookingSubmit}
                    >
                      Complete Booking
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && (
                <div className="booking-success">
                  <div className="success-icon">✓</div>
                  <h3 className="success-title">Booking Confirmed!</h3>
                  <p className="success-message">
                    Your car wash has been scheduled. Check your email for details.
                  </p>
                  <div className="success-actions">
                    <Link to={ROUTES.HOME}>
                      <Button variant="outline">Return Home</Button>
                    </Link>
                    <Link to={ROUTES.BOOKINGS}>
                      <Button variant="primary">View My Bookings</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Price Summary */}
            <div className="price-summary animate-fade-left">
              <h3 className="summary-title">Booking Summary</h3>
              
              {selectedPackage && (
                <div className="summary-content">
                  <div className="summary-item">
                    <span className="item-label">Package:</span>
                    <span className="item-value">{selectedPackage.name}</span>
                  </div>
                  <div className="summary-item">
                    <span className="item-label">Base Price:</span>
                    <span className="item-value">${selectedPackage.price}</span>
                  </div>
                  
                  {formData.vehicleSize && (
                    <div className="summary-item">
                      <span className="item-label">Vehicle Size:</span>
                      <span className="item-value">
                        {vehicleSizes.find(v => v.value === formData.vehicleSize)?.label}
                      </span>
                    </div>
                  )}

                  {formData.extras.length > 0 && (
                    <>
                      <div className="summary-divider"></div>
                      <div className="summary-subtitle">Extras</div>
                      {formData.extras.map(extra => (
                        <div key={extra.id} className="summary-item">
                          <span className="item-label">{extra.name}:</span>
                          <span className="item-value">+${extra.price}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="summary-divider"></div>
                  
                  <div className="summary-total">
                    <span className="total-label">Total:</span>
                    <span className="total-value">${price?.toFixed(2) || selectedPackage.price}</span>
                  </div>

                  {formData.location && (
                    <div className="summary-location">
                      <span className="location-icon">📍</span>
                      <span>{LOCATIONS.find(l => l.id === formData.location)?.name}</span>
                    </div>
                  )}

                  {formData.date && formData.time && (
                    <div className="summary-datetime">
                      <span className="datetime-icon">📅</span>
                      <span>{formData.date} at {formData.time}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="summary-note">
                <span className="note-icon">ℹ️</span>
                <span>Prices include tax. No hidden fees.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OUR WORK</span>
            <h2 className="section-title">Before & After <span className="gold-text">Gallery</span></h2>
          </div>

          <div className="gallery-grid">
            <div className="gallery-item before-after">
              <div className="image-container before">
                <img src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Before" />
                <span className="image-label">Before</span>
              </div>
              <div className="image-container after">
                <img src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="After" />
                <span className="image-label">After</span>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gallery 1" />
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gallery 2" />
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Gallery 3" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="carwash-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Make Your Car Shine?</h2>
            <p className="cta-description">
              Book your detailing service today and experience the difference
            </p>
            <div className="cta-buttons">
              <Link to="#booking">
                <Button variant="primary" size="lg">
                  Book Now
                </Button>
              </Link>
              <Link to={ROUTES.CONTACT}>
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarWash;