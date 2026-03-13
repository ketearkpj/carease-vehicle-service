// ===== src/Pages/CarWash.jsx =====
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { WASH_PACKAGES, LOCATIONS } from '../Utils/constants';
import { formatCurrency } from '../Utils/format';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import HeroSection from '../Components/Features/HeroSection';

// Services
import { getWashPackages, getAvailableTimeSlots } from '../Services/Service.Service';

// Hooks
import { useApp } from '../Context/AppContext';
import { saveBookingDraft } from '../Utils/bookingFlow';

// Styles
import '../Styles/CarWash.css';

const CarWash = () => {
  const navigate = useNavigate();
  const acquirePanelRef = useRef(null);
  const formatKES = (amount) => formatCurrency(Number(amount || 0));

  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    intent: 'book',
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
      const mergedPackages = [
        ...(Array.isArray(data) ? data : []),
        ...WASH_PACKAGES.filter((fallbackPkg) => !(data || []).some((pkg) => pkg.id === fallbackPkg.id))
      ];
      const safePackages = mergedPackages.length > 0 ? mergedPackages : WASH_PACKAGES;

      setPackages(safePackages);
      setSelectedPackage(safePackages[0]);
      setFormData((prev) => ({ ...prev, package: safePackages[0].id }));
    } catch (error) {
      console.error('Failed to fetch wash packages:', error);
      setPackages(WASH_PACKAGES);
      setSelectedPackage(WASH_PACKAGES[0]);
      setFormData((prev) => ({ ...prev, package: WASH_PACKAGES[0].id }));
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
      setAvailableSlots(['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']);
    }
  };

  const calculatePrice = () => {
    if (!selectedPackage) return;

    let total = Number(selectedPackage.price || 0);

    const sizeMultipliers = {
      compact: 0.85,
      standard: 1.0,
      suv: 1.25,
      luxury: 1.45,
      exotic: 1.75
    };
    total *= sizeMultipliers[formData.vehicleSize] || 1.0;

    formData.extras.forEach((extra) => {
      total += Number(extra.price || 0);
    });

    setPrice(total);
  };

  const handlePackageSelect = (pkg, intent = null) => {
    setSelectedPackage(pkg);
    setFormData((prev) => ({
      ...prev,
      package: pkg.id,
      intent: intent || prev.intent
    }));
    acquirePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExtraToggle = (extra) => {
    setFormData((prev) => {
      const exists = prev.extras.find((e) => e.id === extra.id);
      if (exists) {
        return {
          ...prev,
          extras: prev.extras.filter((e) => e.id !== extra.id)
        };
      }
      return {
        ...prev,
        extras: [...prev.extras, extra]
      };
    });
  };

  const isReadyForCheckout = useMemo(() => {
    return Boolean(selectedPackage && formData.location && formData.date && formData.time);
  }, [selectedPackage, formData.location, formData.date, formData.time]);

  const handleBookingSubmit = () => {
    if (!isReadyForCheckout) {
      addNotification('Select package, location, date, and time before continuing.', 'warning');
      return;
    }

    const draft = {
      serviceType: 'car_wash',
      inquiryType: formData.intent,
      packageId: selectedPackage?.id || formData.package,
      packageName: selectedPackage?.name || '',
      listedPrice: Number(price || selectedPackage?.price || 0),
      startDate: formData.date,
      endDate: formData.date,
      time: formData.time,
      pickupLocation: formData.location,
      extras: formData.extras,
      specialRequests: formData.specialRequests
    };

    saveBookingDraft(draft);

    const params = new URLSearchParams({
      service: 'car_wash',
      inquiryType: formData.intent,
      startDate: formData.date,
      endDate: formData.date,
      time: formData.time,
      packageId: formData.package || '',
      location: formData.location || ''
    });

    navigate(`${ROUTES.BOOKING}?${params.toString()}`, {
      state: { bookingPrefill: draft }
    });

    addNotification(
      formData.intent === 'buy'
        ? 'Continue to complete purchase details and payment.'
        : 'Continue to complete booking details and payment.',
      'info'
    );
  };

  const extras = [
    { id: 'interior', name: 'Cabin Steam Sanitize', price: 3500, description: 'Kills odor and bacteria in seats and vents' },
    { id: 'engine', name: 'Engine Bay Detailing', price: 4500, description: 'Safe degrease and polished finish' },
    { id: 'headlight', name: 'Headlight Restoration', price: 6500, description: 'Improves night visibility and clarity' },
    { id: 'odor', name: 'Advanced Odor Removal', price: 5200, description: 'Ozone and enzyme interior treatment' },
    { id: 'paint', name: 'Single-Stage Paint Correction', price: 29500, description: 'Reduces swirls and light scratches' },
    { id: 'ceramic', name: 'Ceramic Booster Layer', price: 14900, description: 'Extra hydrophobic protection and gloss' }
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
      <HeroSection
        title="Professional Car Wash & Detailing"
        subtitle="Pick your exact package, configure service options, and continue to checkout in one streamlined flow."
        ctaText="Build Your Wash Plan"
        ctaLink="#packages"
        secondaryCtaText="How It Works"
        secondaryCtaLink="#service-flow"
        backgroundImage="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        alignment="center"
        fullHeight={false}
      />

      <section className="packages-section" id="packages">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">SERVICE BUILDER</span>
            <h2 className="section-title">Choose Your <span className="gold-text">Car Wash Package</span></h2>
            <p className="section-description">
              Select from quick maintenance, deep detailing, or paint protection programs and continue instantly.
            </p>
          </div>

          <div className="wash-builder-layout">
            <div className="packages-column">
              {loading ? (
                <div className="packages-loading">
                  <LoadingSpinner size="lg" color="gold" text="Loading packages..." />
                </div>
              ) : (
                <div className="packages-grid">
                  {packages.map((pkg, index) => (
                    <Card
                      key={pkg.id}
                      className={`package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''} animate-fade-up animate-delay-${(index % 6) + 1}`}
                      onClick={() => handlePackageSelect(pkg)}
                    >
                      <div className="package-badge">{pkg.duration} min</div>
                      <div className="package-icon">{pkg.icon || '🧼'}</div>
                      <h3 className="package-name">{pkg.name}</h3>
                      <p className="package-description">{pkg.description}</p>
                      <ul className="package-features">
                        {(pkg.features || []).slice(0, 5).map((feature, idx) => (
                          <li key={idx}>
                            <span className="feature-check">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="package-price">
                        <span className="price-amount">{formatKES(pkg.price)}</span>
                      </div>
                      <div className="package-cta-row">
                        <Button variant="outline" size="sm" onClick={() => handlePackageSelect(pkg, 'buy')}>
                          Buy Package
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => handlePackageSelect(pkg, 'book')}>
                          Book Now
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <aside className="acquire-panel animate-fade-left" ref={acquirePanelRef}>
              <span className="form-badge">INSTANT ACQUISITION</span>
              <h3 className="summary-title">Configure and Continue</h3>

              <div className="selected-package-info">
                <h3>{selectedPackage?.name || 'Select a Package'}</h3>
                <p className="package-price">{formatKES(price || selectedPackage?.price || 0)}</p>
              </div>

              <div className="form-row">
                <Select
                  label="Proceed As"
                  name="intent"
                  value={formData.intent}
                  onChange={handleInputChange}
                  options={[
                    { value: 'book', label: 'Book Service Appointment' },
                    { value: 'buy', label: 'Buy Detailing Package' }
                  ]}
                  icon="🛒"
                />
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
                  label="Service Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  options={LOCATIONS.map((loc) => ({ value: loc.id, label: loc.name }))}
                  required
                  icon="📍"
                  placeholder="Select location"
                />
              </div>

              <div className="form-row two-col-dates">
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
                <Select
                  label="Preferred Time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  options={availableSlots.map((slot) => ({ value: slot, label: slot }))}
                  required
                  icon="⏰"
                  placeholder={formData.date ? 'Select time' : 'Pick date first'}
                  disabled={!formData.date}
                />
              </div>

              <div className="extras-grid compact">
                {extras.map((extra) => (
                  <label key={extra.id} className="extra-item">
                    <input
                      type="checkbox"
                      checked={formData.extras.some((e) => e.id === extra.id)}
                      onChange={() => handleExtraToggle(extra)}
                    />
                    <div className="extra-content">
                      <div className="extra-info">
                        <span className="extra-name">{extra.name}</span>
                        <span className="extra-description">{extra.description}</span>
                      </div>
                      <span className="extra-price">+{formatKES(extra.price)}</span>
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
                  placeholder="Pickup notes, preferred products, stain or odor concerns..."
                  rows="3"
                  className="special-requests-textarea"
                />
              </div>

              <div className="form-actions stacked-actions">
                <Button variant="primary" size="lg" fullWidth onClick={handleBookingSubmit} disabled={!isReadyForCheckout}>
                  {formData.intent === 'buy' ? 'Continue to Buy Flow' : 'Continue to Booking Flow'}
                </Button>
                <Button variant="outline" fullWidth onClick={() => { window.location.href = 'tel:+254758458358'; }}>
                  Contact Service Advisor
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="features-section" id="service-flow">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">HOW IT WORKS</span>
            <h2 className="section-title">From Package Choice to <span className="gold-text">Final Checkout</span></h2>
          </div>

          <div className="features-grid">
            <div className="feature-card animate-fade-up animate-delay-1">
              <div className="feature-icon">1️⃣</div>
              <h3 className="feature-title">Pick Your Service Depth</h3>
              <p className="feature-description">Choose maintenance, premium detailing, or full paint protection.</p>
            </div>
            <div className="feature-card animate-fade-up animate-delay-2">
              <div className="feature-icon">2️⃣</div>
              <h3 className="feature-title">Configure Instantly</h3>
              <p className="feature-description">Set location, date, vehicle size, and add-ons in one panel.</p>
            </div>
            <div className="feature-card animate-fade-up animate-delay-3">
              <div className="feature-icon">3️⃣</div>
              <h3 className="feature-title">Complete Book or Buy</h3>
              <p className="feature-description">Continue to full booking or purchase flow with payment options.</p>
            </div>
          </div>
        </div>
      </section>

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

      <section className="carwash-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Need a Custom Detailing Plan?</h2>
            <p className="cta-description">
              Speak with our team for fleet, pre-sale prep, wedding/event detailing, or long-term protection plans.
            </p>
            <div className="cta-buttons">
              <Button variant="outline" size="lg" onClick={() => { window.location.href = 'tel:+254758458358'; }}>
                Call Carease
              </Button>
              <Link to={ROUTES.CONTACT}>
                <Button variant="primary" size="lg">
                  Send Service Request
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
