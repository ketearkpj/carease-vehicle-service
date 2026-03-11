// ===== src/Pages/Repairs.jsx =====
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { REPAIR_SERVICES, LOCATIONS } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import HeroSection from '../Components/Features/HeroSection';

// Services
import { getRepairServices, getAvailableTimeSlots } from '../Services/Service.Service';

// Hooks
import { useApp } from '../Context/AppContext';

// Styles
import '../Styles/Repairs.css';

const Repairs = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleType: 'standard',
    date: '',
    time: '',
    location: '',
    description: '',
    urgent: false
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [diagnosticFee, setDiagnosticFee] = useState(89);

  const { addNotification } = useApp();

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (formData.date) {
      fetchAvailableSlots(formData.date);
    }
  }, [formData.date]);

  useEffect(() => {
    if (selectedService) {
      calculateEstimate();
    }
  }, [selectedService, formData.vehicleType, formData.urgent]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getRepairServices();
      setServices(data);
      if (data.length > 0) {
        setSelectedService(data[0]);
        setFormData(prev => ({ ...prev, service: data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch repair services:', error);
      setServices(REPAIR_SERVICES);
      setSelectedService(REPAIR_SERVICES[0]);
      setFormData(prev => ({ ...prev, service: REPAIR_SERVICES[0].id }));
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const slots = await getAvailableTimeSlots(date, 'repair');
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      // Mock slots
      setAvailableSlots([
        '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
      ]);
    }
  };

  const calculateEstimate = () => {
    if (!selectedService) return;

    let total = selectedService.price;

    // Vehicle type multiplier
    const typeMultipliers = {
      compact: 1.0,
      standard: 1.0,
      luxury: 1.5,
      exotic: 2.0,
      electric: 1.2
    };
    total *= typeMultipliers[formData.vehicleType] || 1.0;

    // Urgent service fee
    if (formData.urgent) {
      total *= 1.5; // 50% extra for urgent
    }

    setEstimatedPrice(total);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setFormData(prev => ({ ...prev, service: service.id }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBookingSubmit = () => {
    const params = new URLSearchParams({
      service: 'repair',
      startDate: formData.date,
      endDate: formData.date,
      time: formData.time,
      packageId: formData.service || '',
      location: formData.location || ''
    });
    navigate(`${ROUTES.BOOKING}?${params.toString()}`);
    addNotification('Continue to payment to confirm this repair booking.', 'info');
  };

  const vehicleTypes = [
    { value: 'compact', label: 'Compact Car' },
    { value: 'standard', label: 'Standard Sedan' },
    { value: 'luxury', label: 'Luxury Vehicle' },
    { value: 'exotic', label: 'Exotic / Supercar' },
    { value: 'electric', label: 'Electric Vehicle' },
    { value: 'suv', label: 'SUV / Truck' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString()
  }));

  return (
    <div className="repairs-page">
      {/* Hero Section */}
      <HeroSection
        title="Expert Repairs & Maintenance"
        subtitle="Certified technicians specializing in luxury and exotic vehicles"
        ctaText="Schedule Service"
        ctaLink="#booking"
        secondaryCtaText="Our Services"
        secondaryCtaLink="#services"
        backgroundImage="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        alignment="center"
        fullHeight={false}
      />

      {/* Services Section */}
      <section className="repair-services-section" id="services">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OUR SERVICES</span>
            <h2 className="section-title">Professional <span className="gold-text">Repair Services</span></h2>
            <p className="section-description">
              Comprehensive maintenance and repair solutions for all luxury vehicles
            </p>
          </div>

          {loading ? (
            <div className="services-loading">
              <LoadingSpinner size="lg" color="gold" text="Loading services..." />
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service, index) => (
                <Card
                  key={service.id}
                  className={`service-card ${selectedService?.id === service.id ? 'selected' : ''} animate-fade-up animate-delay-${index + 1}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="service-icon">{service.icon || '🔧'}</div>
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-price">
                    <span className="price-label">Starting at</span>
                    <span className="price-amount">${service.price}</span>
                  </div>
                  <Button
                    variant={selectedService?.id === service.id ? 'primary' : 'outline'}
                    size="sm"
                    fullWidth
                    onClick={() => handleServiceSelect(service)}
                  >
                    {selectedService?.id === service.id ? 'Selected' : 'Select Service'}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHY CHOOSE US</span>
            <h2 className="section-title">The CAR EASE <span className="gold-text">Difference</span></h2>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card animate-fade-up animate-delay-1">
              <div className="benefit-icon">🔧</div>
              <h3 className="benefit-title">Certified Technicians</h3>
              <p className="benefit-description">ASE-certified master technicians with luxury vehicle expertise</p>
            </div>

            <div className="benefit-card animate-fade-up animate-delay-2">
              <div className="benefit-icon">⚡</div>
              <h3 className="benefit-title">Latest Equipment</h3>
              <p className="benefit-description">State-of-the-art diagnostic tools and equipment</p>
            </div>

            <div className="benefit-card animate-fade-up animate-delay-3">
              <div className="benefit-icon">🛡️</div>
              <h3 className="benefit-title">Warranty Included</h3>
              <p className="benefit-description">24-month/24,000-mile warranty on all repairs</p>
            </div>

            <div className="benefit-card animate-fade-up animate-delay-4">
              <div className="benefit-icon">🚗</div>
              <h3 className="benefit-title">Genuine Parts</h3>
              <p className="benefit-description">OEM and genuine parts only</p>
            </div>

            <div className="benefit-card animate-fade-up animate-delay-5">
              <div className="benefit-icon">⏱️</div>
              <h3 className="benefit-title">Quick Turnaround</h3>
              <p className="benefit-description">Efficient service with minimal downtime</p>
            </div>

            <div className="benefit-card animate-fade-up animate-delay-6">
              <div className="benefit-icon">🤝</div>
              <h3 className="benefit-title">Free Estimates</h3>
              <p className="benefit-description">Comprehensive estimates before work begins</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="repair-booking-section" id="booking">
        <div className="container">
          <div className="booking-grid">
            {/* Left Column - Booking Form */}
            <div className="booking-form-container animate-fade-right">
              <div className="form-header">
                <span className="form-badge">SCHEDULE SERVICE</span>
                <h2 className="form-title">Book Your <span className="gold-text">Repair</span></h2>
                <p className="form-description">
                  Fill in your vehicle and service details below
                </p>
              </div>

              {bookingStep === 1 && (
                <div className="booking-step">
                  <div className="selected-service-info">
                    <h3>Selected Service: {selectedService?.name}</h3>
                    <p className="service-price">Starting at ${selectedService?.price}</p>
                  </div>

                  <div className="form-row">
                    <h4 className="form-subtitle">Vehicle Information</h4>
                  </div>

                  <div className="form-row">
                    <Input
                      label="Vehicle Make"
                      name="vehicleMake"
                      value={formData.vehicleMake}
                      onChange={handleInputChange}
                      required
                      icon="🚗"
                      placeholder="e.g., BMW, Mercedes, Porsche"
                    />
                  </div>

                  <div className="form-row">
                    <Input
                      label="Vehicle Model"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      required
                      icon="🔧"
                      placeholder="e.g., 911, S-Class, M5"
                    />
                  </div>

                  <div className="form-row">
                    <Select
                      label="Vehicle Year"
                      name="vehicleYear"
                      value={formData.vehicleYear}
                      onChange={handleInputChange}
                      options={years}
                      required
                      icon="📅"
                      placeholder="Select year"
                    />
                  </div>

                  <div className="form-row">
                    <Select
                      label="Vehicle Type"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      options={vehicleTypes}
                      required
                      icon="🚘"
                    />
                  </div>

                  <div className="form-row">
                    <h4 className="form-subtitle">Service Details</h4>
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
                      placeholder="Select service center"
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

                  <div className="form-row">
                    <label className="urgent-checkbox">
                      <input
                        type="checkbox"
                        name="urgent"
                        checked={formData.urgent}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-text">
                        Urgent service needed (50% additional fee)
                      </span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => setBookingStep(2)}
                      disabled={!formData.vehicleMake || !formData.vehicleModel || !formData.vehicleYear || !formData.location || !formData.date || !formData.time}
                    >
                      Continue to Description →
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 2 && (
                <div className="booking-step">
                  <h3 className="step-title">Describe the Issue</h3>
                  <p className="step-description">
                    Please provide details about the problem or service needed
                  </p>

                  <div className="form-row">
                    <label className="textarea-label">Description of Issue</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the symptoms, when they started, any warning lights, etc."
                      rows="6"
                      className="issue-textarea"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label className="file-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        className="file-input"
                        onChange={(e) => {
                          // Handle file upload
                        }}
                      />
                      <span className="file-upload-content">
                        <span className="upload-icon">📎</span>
                        <span className="upload-text">Upload photos (optional)</span>
                      </span>
                    </label>
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
                      disabled={!formData.description}
                    >
                      Submit Booking
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && (
                <div className="booking-success">
                  <div className="success-icon">✓</div>
                  <h3 className="success-title">Service Request Received!</h3>
                  <p className="success-message">
                    We'll contact you within 2 hours to confirm your appointment.
                  </p>
                  <div className="success-actions">
                    <Link to={ROUTES.HOME}>
                      <Button variant="outline">Return Home</Button>
                    </Link>
                    <Link to={ROUTES.BOOKING}>
                      <Button variant="primary">View My Bookings</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Price Summary */}
            <div className="price-summary animate-fade-left">
              <h3 className="summary-title">Service Summary</h3>
              
              {selectedService && (
                <div className="summary-content">
                  <div className="summary-item">
                    <span className="item-label">Service:</span>
                    <span className="item-value">{selectedService.name}</span>
                  </div>
                  
                  {selectedService.id !== 'diagnostic' && (
                    <div className="summary-item">
                      <span className="item-label">Diagnostic Fee:</span>
                      <span className="item-value">${diagnosticFee}</span>
                    </div>
                  )}

                  <div className="summary-item">
                    <span className="item-label">Base Labor:</span>
                    <span className="item-value">${selectedService.price}</span>
                  </div>
                  
                  {formData.vehicleType && formData.vehicleType !== 'standard' && (
                    <div className="summary-item">
                      <span className="item-label">Vehicle Type Multiplier:</span>
                      <span className="item-value">
                        {formData.vehicleType === 'luxury' ? '1.5x' :
                         formData.vehicleType === 'exotic' ? '2.0x' :
                         formData.vehicleType === 'electric' ? '1.2x' : '1.0x'}
                      </span>
                    </div>
                  )}

                  {formData.urgent && (
                    <div className="summary-item urgent">
                      <span className="item-label">Urgent Service Fee:</span>
                      <span className="item-value">+50%</span>
                    </div>
                  )}

                  <div className="summary-divider"></div>
                  
                  <div className="summary-total">
                    <span className="total-label">Estimated Total:</span>
                    <span className="total-value">
                      ${(estimatedPrice + (selectedService.id !== 'diagnostic' ? diagnosticFee : 0)).toFixed(2)}
                    </span>
                  </div>

                  <div className="summary-note">
                    <span className="note-icon">ℹ️</span>
                    <span>Final price may vary after inspection</span>
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
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">FAQ</span>
            <h2 className="section-title">Frequently Asked <span className="gold-text">Questions</span></h2>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">How long do repairs typically take?</h3>
              <p className="faq-answer">
                Repair times vary by service. Basic maintenance (oil change, diagnostics) takes 1-2 hours.
                Major repairs may take 1-3 days. We'll provide an estimated completion time when you book.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Do you use genuine parts?</h3>
              <p className="faq-answer">
                Yes, we only use OEM and genuine parts for all repairs. For classic or exotic vehicles,
                we source authentic parts from manufacturers or approved suppliers.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">What is your warranty policy?</h3>
              <p className="faq-answer">
                All repairs come with a 24-month/24,000-mile warranty on parts and labor.
                We stand behind our work and offer comprehensive warranty coverage.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Do you offer loaner vehicles?</h3>
              <p className="faq-answer">
                Yes, we offer complimentary loaner vehicles for repairs expected to take more than
                4 hours. Please request when booking to ensure availability.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Can you work on electric vehicles?</h3>
              <p className="faq-answer">
                Absolutely. Our technicians are certified to work on all electric and hybrid vehicles,
                including Tesla, Porsche Taycan, and other EV models.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Do you provide free estimates?</h3>
              <p className="faq-answer">
                Yes, we provide complimentary estimates for all repairs. Diagnostic fees apply
                but are credited toward any repairs performed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="repairs-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Need Immediate Assistance?</h2>
            <p className="cta-description">
              Our emergency repair services are available 24/7
            </p>
            <div className="cta-buttons">
              <Link to="#booking">
                <Button variant="primary" size="lg">
                  Schedule Service
                </Button>
              </Link>
              <a href="tel:+18005550123">
                <Button variant="outline" size="lg">
                  Call Emergency Line
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Repairs;
