// ===== src/Pages/Repairs.jsx =====
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { REPAIR_SERVICES, LOCATIONS } from '../Utils/constants';
import { formatCurrency } from '../Utils/format';

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
import { saveBookingDraft } from '../Utils/bookingFlow';

// Styles
import '../Styles/Repairs.css';

const Repairs = () => {
  const navigate = useNavigate();
  const formatKES = (amount) => formatCurrency(Number(amount || 0));
  const serviceJourney = [
    { id: 'select', title: 'Choose Service', description: 'Pick diagnostics, maintenance, repair, or performance support based on the issue.' },
    { id: 'schedule', title: 'Schedule Intake', description: 'Select location, preferred date, and service time with live slot guidance.' },
    { id: 'confirm', title: 'Confirm Scope', description: 'Describe symptoms, request urgent handling, and continue into booking checkout.' }
  ];
  const repairCoverage = [
    {
      title: 'Engine, Cooling & Driveability',
      icon: '🛠️',
      description: 'Misfires, overheating, rough idling, leaks, power loss, and drivability troubleshooting.',
      highlights: ['Diagnostics and fault tracing', 'Cooling system and leak inspection', 'Road-test validation']
    },
    {
      title: 'Brakes, Suspension & Steering',
      icon: '🛞',
      description: 'Brake wear, suspension noise, steering instability, alignment, and ride-quality concerns.',
      highlights: ['Brake inspection and servicing', 'Suspension component checks', 'Handling and safety review']
    },
    {
      title: 'Electrical, Battery & Electronics',
      icon: '🧠',
      description: 'Battery health, sensors, warning lights, ECU communication, and electrical fault isolation.',
      highlights: ['Battery and charging health', 'Electronic system scan', 'Sensor and wiring review']
    }
  ];
  const repairAdvantages = [
    { icon: '🔧', title: 'Certified Technicians', description: 'ASE-certified master technicians with luxury vehicle expertise' },
    { icon: '⚡', title: 'Latest Equipment', description: 'State-of-the-art diagnostics, inspection tooling, and calibration support' },
    { icon: '🛡️', title: 'Warranty Included', description: '24-month/40,000-km warranty on qualifying repairs and labor' },
    { icon: '🚗', title: 'Genuine Parts', description: 'OEM and genuine parts sourcing for reliable service quality' },
    { icon: '⏱️', title: 'Quick Turnaround', description: 'Efficient scheduling with transparent updates and minimal downtime' },
    { icon: '🤝', title: 'Clear Estimates', description: 'Transparent repair scope and pricing guidance before work proceeds' }
  ];
  const repairCatalog = {
    diagnostic: {
      category: 'Inspection',
      idealFor: 'Warning lights, unusual sounds, rough idling, and pre-purchase checks',
      turnaround: 'Approx. 60 minutes',
      includes: ['Full systems scan', 'Battery and charging health check', 'Fault-code report', 'Technician consultation']
    },
    maintenance: {
      category: 'Maintenance',
      idealFor: 'Routine service intervals, fleet upkeep, and reliability-focused care',
      turnaround: 'Approx. 2 hours',
      includes: ['Oil and filter service', 'Fluid top-up and inspection', 'Brake and tire check', 'Service reset and care notes']
    },
    repair: {
      category: 'Repair',
      idealFor: 'Brakes, suspension, drivability faults, cooling, and engine-related issues',
      turnaround: 'Same day to multi-day depending on parts',
      includes: ['Fault isolation and inspection', 'Parts and labor estimate', 'Repair execution', 'Post-repair road test']
    },
    performance: {
      category: 'Performance',
      idealFor: 'Tuning, response upgrades, ECU work, and enthusiast-focused setups',
      turnaround: 'Approx. 4 hours',
      includes: ['Performance consultation', 'ECU or tuning setup', 'Dyno / calibration checks', 'Setup review and recommendations']
    }
  };
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState(1);
  const [formData, setFormData] = useState({
    intent: 'book',
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
  const diagnosticFee = 8500;

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
      const enrichedServices = data.map((service) => ({
        ...service,
        ...repairCatalog[service.id]
      }));
      setServices(enrichedServices);
      if (enrichedServices.length > 0) {
        setSelectedService(enrichedServices[0]);
        setFormData(prev => ({ ...prev, service: enrichedServices[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch repair services:', error);
      const fallbackServices = REPAIR_SERVICES.map((service) => ({
        ...service,
        ...repairCatalog[service.id]
      }));
      setServices(fallbackServices);
      setSelectedService(fallbackServices[0]);
      setFormData(prev => ({ ...prev, service: fallbackServices[0].id }));
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

  const jumpToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBookingSubmit = () => {
    const draft = {
      serviceType: 'repair',
      inquiryType: formData.intent,
      packageId: selectedService?.id || formData.service,
      packageName: selectedService?.name || '',
      listedPrice: Number(estimatedPrice || selectedService?.price || 0),
      startDate: formData.date,
      endDate: formData.date,
      time: formData.time,
      pickupLocation: formData.location,
      specialRequests: formData.description
    };
    saveBookingDraft(draft);
    navigate(ROUTES.REPAIRS_FLOW, {
      state: { bookingPrefill: draft }
    });
    addNotification(
      formData.intent === 'buy'
        ? 'Continue to complete purchase details and payment.'
        : 'Continue to complete repair booking and payment.',
      'info'
    );
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
  const totalEstimate = (estimatedPrice || 0) + (selectedService && selectedService.id !== 'diagnostic' ? diagnosticFee : 0);
  const selectedLocation = LOCATIONS.find((l) => l.id === formData.location);

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

      <section className="repairs-intro-strip">
        <div className="container">
          <div className="repairs-intro-grid">
            <article className="repairs-intro-card">
              <span className="intro-kicker">Service Standards</span>
              <h3>Luxury-focused repair experience</h3>
              <p>From diagnostics to final handover, every step is structured for premium vehicles and client clarity.</p>
            </article>
            <article className="repairs-intro-metrics">
              <div className="intro-metric">
                <span className="metric-value">24/7</span>
                <span className="metric-label">Emergency Support</span>
              </div>
              <div className="intro-metric">
                <span className="metric-value">4</span>
                <span className="metric-label">Repair Pathways</span>
              </div>
              <div className="intro-metric">
                <span className="metric-value">OEM</span>
                <span className="metric-label">Parts Priority</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="repair-services-section" id="services">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OUR SERVICES</span>
            <h2 className="section-title">Professional <span className="gold-text">Repair Services</span></h2>
            <p className="section-description">
              Comprehensive maintenance and repair solutions for all luxury vehicles
            </p>
            <p className="section-helper">
              Select a service line below to compare what is included, how long it typically takes, and the kind of issue it is best suited for.
            </p>
          </div>

          <div className="repair-journey-grid">
            {serviceJourney.map((step, index) => (
              <article key={step.id} className="journey-step-card">
                <span className="journey-step-index">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
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
                  <div className="service-meta-strip">
                    <span>{service.category || 'Repair'}</span>
                    <span>{service.duration ? `${service.duration} min` : service.turnaround}</span>
                  </div>
                  {Array.isArray(service.includes) && service.includes.length > 0 && (
                    <div className="service-includes-preview">
                      {service.includes.slice(0, 3).map((item) => (
                        <span key={item} className="include-pill">{item}</span>
                      ))}
                    </div>
                  )}
                  <div className="service-price">
                    <span className="price-label">Starting at</span>
                    <span className="price-amount">{formatKES(service.price)}</span>
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

          {!loading && selectedService && (
            <div className="selected-service-showcase">
              <div className="selected-service-copy">
                <span className="selected-service-kicker">
                  {selectedService.category || 'Selected Service'}
                </span>
                <h3>{selectedService.name}</h3>
                <p>{selectedService.idealFor || selectedService.description}</p>

                <div className="selected-service-stats">
                  <div className="selected-service-stat">
                    <span className="stat-label">Turnaround</span>
                    <span className="stat-value">{selectedService.turnaround || `${selectedService.duration} min`}</span>
                  </div>
                  <div className="selected-service-stat">
                    <span className="stat-label">Starting From</span>
                    <span className="stat-value">{formatKES(selectedService.price)}</span>
                  </div>
                  <div className="selected-service-stat">
                    <span className="stat-label">Ideal For</span>
                    <span className="stat-value">{selectedService.category || 'Repair support'}</span>
                  </div>
                  <div className="selected-service-stat">
                    <span className="stat-label">Booking Mode</span>
                    <span className="stat-value">Inspection to checkout</span>
                  </div>
                </div>
              </div>

              <div className="selected-service-includes">
                <h4>Included in this service</h4>
                <ul>
                  {(selectedService.includes || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="selected-service-actions">
                  <Button variant="primary" onClick={jumpToBooking}>
                    Book This Service
                  </Button>
                  <Button variant="outline" onClick={() => setBookingStep(1)}>
                    Review Booking Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHAT WE REPAIR</span>
            <h2 className="section-title">Service Coverage <span className="gold-text">Across Systems</span></h2>
            <p className="section-helper">
              Choose the right entry point whether you need a health check, scheduled maintenance, or a targeted fault repair.
            </p>
          </div>
          <div className="benefits-grid">
            {repairCoverage.map((item, index) => (
              <div key={item.title} className={`benefit-card coverage-card animate-fade-up animate-delay-${index + 1}`}>
                <div className="benefit-icon">{item.icon}</div>
                <h3 className="benefit-title">{item.title}</h3>
                <p className="benefit-description">{item.description}</p>
                <ul className="coverage-list">
                  {item.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHY CHOOSE US</span>
            <h2 className="section-title">The CAR EASE <span className="gold-text">Difference</span></h2>
            <p className="section-helper">
              The workshop experience is designed to feel transparent, premium, and operationally dependable from first diagnosis to final release.
            </p>
          </div>

          <div className="benefits-grid">
            {repairAdvantages.map((item, index) => (
              <div key={item.title} className={`benefit-card animate-fade-up animate-delay-${index + 1}`}>
                <div className="benefit-icon">{item.icon}</div>
                <h3 className="benefit-title">{item.title}</h3>
                <p className="benefit-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="repair-booking-section" id="booking">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">SERVICE INTAKE</span>
            <h2 className="section-title">Build Your <span className="gold-text">Repair Request</span></h2>
            <p className="section-helper">
              Select the service path, provide vehicle details, choose your preferred slot, and move into checkout with a clearer repair brief.
            </p>
          </div>

          <div className="booking-progress-track">
            <div className={`booking-progress-step ${bookingStep >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Vehicle & Slot</p>
            </div>
            <div className={`booking-progress-step ${bookingStep >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Issue Details</p>
            </div>
            <div className="booking-progress-note">
              {selectedService?.name ? `Current service: ${selectedService.name}` : 'Choose a service to begin'}
            </div>
          </div>

          <div className="booking-grid">
            {/* Left Column - Booking Form */}
            <div className="booking-form-container animate-fade-right">
              <div className="form-header">
                <span className="form-badge">SCHEDULE SERVICE</span>
                <h2 className="form-title">Build Your <span className="gold-text">Service Intake</span></h2>
                <p className="form-description">
                  Share your vehicle details, preferred slot, and repair context so the workshop team can prepare the right service path before checkout.
                </p>
                <div className="form-header-highlights">
                  <span className="form-highlight-pill">Workshop-prepared intake</span>
                  <span className="form-highlight-pill">Luxury and exotic ready</span>
                  <span className="form-highlight-pill">Transparent estimate guidance</span>
                </div>
              </div>

              {bookingStep === 1 && (
                <div className="booking-step">
                  <div className="selected-service-info">
                    <h3>Selected Service: {selectedService?.name}</h3>
                    <p className="service-price">Starting at {formatKES(selectedService?.price)}</p>
                  </div>

                  <div className="booking-context-panel">
                    <div className="context-chip">{selectedService?.category || 'Repair'}</div>
                    <div className="context-chip">{selectedService?.turnaround || `${selectedService?.duration || 0} min`}</div>
                    <div className="context-chip">{formData.urgent ? 'Urgent Priority' : 'Standard Queue'}</div>
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
                    <Select
                      label="Proceed As"
                      name="intent"
                      value={formData.intent}
                      onChange={handleInputChange}
                      options={[
                        { value: 'book', label: 'Book Repair Appointment' },
                        { value: 'buy', label: 'Buy Repair Plan / Service' }
                      ]}
                    />
                  </div>

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
                      {formData.intent === 'buy' ? 'Continue to Buy Flow' : 'Continue to Booking Flow'}
                    </Button>
                    <Button variant="outline" onClick={() => { window.location.href = 'tel:+254758458358'; }}>
                      Contact Service Desk
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
                    <Link to={ROUTES.REPAIRS_FLOW}>
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
                  <div className="summary-service-hero">
                    <span className="summary-service-kicker">{selectedService.category || 'Repair Service'}</span>
                    <h4>{selectedService.name}</h4>
                    <p>{selectedService.idealFor || selectedService.description}</p>
                  </div>

                  <div className="summary-item">
                    <span className="item-label">Service:</span>
                    <span className="item-value">{selectedService.name}</span>
                  </div>
                  
                  {selectedService.id !== 'diagnostic' && (
                    <div className="summary-item">
                      <span className="item-label">Diagnostic Fee:</span>
                      <span className="item-value">{formatKES(diagnosticFee)}</span>
                    </div>
                  )}

                  <div className="summary-item">
                    <span className="item-label">Base Labor:</span>
                    <span className="item-value">{formatKES(selectedService.price)}</span>
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
                      {formatKES(totalEstimate)}
                    </span>
                  </div>

                  <div className="summary-note">
                    <span className="note-icon">ℹ️</span>
                    <span>Final price may vary after inspection</span>
                  </div>

                  <div className="summary-includes">
                    <h4>Included in selected service</h4>
                    <ul>
                      {(selectedService.includes || []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {formData.location && (
                    <div className="summary-location">
                      <span className="location-icon">📍</span>
                      <span>{selectedLocation?.name}</span>
                    </div>
                  )}

                  {formData.date && formData.time && (
                    <div className="summary-datetime">
                      <span className="datetime-icon">📅</span>
                      <span>{formData.date} at {formData.time}</span>
                    </div>
                  )}

                  <div className="summary-support-card">
                    <span className="support-kicker">Need assistance?</span>
                    <p>Talk to the service desk for urgent diagnostics, parts availability, or concierge coordination.</p>
                    <a href="tel:+254758458358" className="support-link">Call Service Desk</a>
                  </div>
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
                All repairs come with a 24-month/40,000-km warranty on parts and labor.
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
              <a href="tel:+254758458358">
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
