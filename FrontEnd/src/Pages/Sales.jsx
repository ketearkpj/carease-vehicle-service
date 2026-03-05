import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Sales.css';

const Sales = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [inquiryStep, setInquiryStep] = useState(1);
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    testDrive: false,
    financing: false,
    tradeIn: false
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Vehicle Data
  const vehicles = [
    {
      id: 1,
      name: 'Lamborghini Urus',
      year: 2023,
      price: 245000,
      mileage: 1200,
      condition: 'Like New',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      images: [
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'
      ],
      specs: {
        engine: '4.0L V8 Twin-Turbo',
        horsepower: '641 hp',
        transmission: '8-Speed Auto',
        drivetrain: 'AWD',
        acceleration: '3.6s 0-60',
        topSpeed: '190 mph'
      },
      features: [
        'Carbon Ceramic Brakes',
        'Panoramic Roof',
        'B&O Sound System',
        'Massage Seats',
        'Night Vision',
        '22" Wheels'
      ],
      color: 'Orange',
      interior: 'Black Leather',
      history: 'Clean Carfax',
      warranty: 'Remaining factory warranty',
      certified: true,
      location: 'Beverly Hills'
    },
    {
      id: 2,
      name: 'Ferrari F8 Tributo',
      year: 2022,
      price: 295000,
      mileage: 3500,
      condition: 'Excellent',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
      images: [
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'
      ],
      specs: {
        engine: '3.9L V8 Twin-Turbo',
        horsepower: '710 hp',
        transmission: '7-Speed DCT',
        drivetrain: 'RWD',
        acceleration: '2.9s 0-60',
        topSpeed: '211 mph'
      },
      features: [
        'Rosso Corsa Paint',
        'Carbon Fiber Package',
        'Racing Seats',
        'Telemetry System',
        'Front Lift',
        '20" Forged Wheels'
      ],
      color: 'Red',
      interior: 'Alcantara',
      history: 'Clean Carfax',
      warranty: 'Extended warranty available',
      certified: true,
      location: 'Miami'
    },
    {
      id: 3,
      name: 'Rolls-Royce Ghost',
      year: 2023,
      price: 385000,
      mileage: 800,
      condition: 'New',
      image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800',
      images: [
        'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800',
        'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800',
        'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800'
      ],
      specs: {
        engine: '6.75L V12',
        horsepower: '563 hp',
        transmission: '8-Speed Auto',
        drivetrain: 'AWD',
        acceleration: '4.6s 0-60',
        topSpeed: '155 mph'
      },
      features: [
        'Starlight Headliner',
        'Rear Theater System',
        'Massage Seats',
        'Refrigerator',
        'Umbrella Set',
        '21" Polished Wheels'
      ],
      color: 'Arctic White',
      interior: 'Tan Leather',
      history: 'New Vehicle',
      warranty: 'Full factory warranty',
      certified: true,
      location: 'New York'
    },
    {
      id: 4,
      name: 'Porsche 911 Turbo S',
      year: 2023,
      price: 215000,
      mileage: 500,
      condition: 'New',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'
      ],
      specs: {
        engine: '3.8L Flat-6 Twin-Turbo',
        horsepower: '640 hp',
        transmission: '8-Speed PDK',
        drivetrain: 'AWD',
        acceleration: '2.6s 0-60',
        topSpeed: '205 mph'
      },
      features: [
        'GT Silver Metallic',
        'Carbon Buckets',
        'Ceramic Brakes',
        'Sport Exhaust',
        'Rear Axle Steering',
        '20/21" Wheels'
      ],
      color: 'Silver',
      interior: 'Black/Bordeaux',
      history: 'New Vehicle',
      warranty: 'Full factory warranty',
      certified: true,
      location: 'Beverly Hills'
    },
    {
      id: 5,
      name: 'Bentley Continental GT',
      year: 2022,
      price: 198000,
      mileage: 4200,
      condition: 'Excellent',
      image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800',
      images: [
        'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800',
        'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800',
        'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800'
      ],
      specs: {
        engine: '6.0L W12',
        horsepower: '626 hp',
        transmission: '8-Speed DCT',
        drivetrain: 'AWD',
        acceleration: '3.5s 0-60',
        topSpeed: '207 mph'
      },
      features: [
        'Diamond Stitching',
        'Naim Audio',
        'Rotating Display',
        'Mulliner Package',
        '22" Wheels',
        'Night Vision'
      ],
      color: 'Beluga Black',
      interior: 'Hotspur Red',
      history: 'Clean Carfax',
      warranty: '2-year extended warranty',
      certified: true,
      location: 'Miami'
    },
    {
      id: 6,
      name: 'McLaren 720S',
      year: 2021,
      price: 265000,
      mileage: 5800,
      condition: 'Excellent',
      image: 'https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=800',
      images: [
        'https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=800',
        'https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=800',
        'https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=800'
      ],
      specs: {
        engine: '4.0L V8 Twin-Turbo',
        horsepower: '710 hp',
        transmission: '7-Speed SSG',
        drivetrain: 'RWD',
        acceleration: '2.7s 0-60',
        topSpeed: '212 mph'
      },
      features: [
        'McLaren Orange',
        'Carbon Fiber Monocage',
        'Senna Seats',
        'Track Telemetry',
        'Hydraulic Lift',
        'Ceramic Brakes'
      ],
      color: 'Papaya Spark',
      interior: 'Black Alcantara',
      history: 'Clean Carfax',
      warranty: '1-year warranty',
      certified: true,
      location: 'New York'
    }
  ];

  // Filters
  const filters = [
    { id: 'all', label: 'All Vehicles', icon: '🚗' },
    { id: 'new', label: 'New Arrivals', icon: '✨' },
    { id: 'certified', label: 'Certified', icon: '✓' },
    { id: 'under-200k', label: 'Under $200k', icon: '💰' },
    { id: '200k-300k', label: '$200k - $300k', icon: '💰' },
    { id: 'over-300k', label: 'Over $300k', icon: '💰' }
  ];

  // Locations
  const locations = [
    { id: 'all', label: 'All Locations' },
    { id: 'beverly-hills', label: 'Beverly Hills' },
    { id: 'miami', label: 'Miami' },
    { id: 'new-york', label: 'New York' }
  ];

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    switch(selectedFilter) {
      case 'new':
        return vehicle.condition === 'New';
      case 'certified':
        return vehicle.certified;
      case 'under-200k':
        return vehicle.price < 200000;
      case '200k-300k':
        return vehicle.price >= 200000 && vehicle.price <= 300000;
      case 'over-300k':
        return vehicle.price > 300000;
      default:
        return true;
    }
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Inquiry steps
  const inquirySteps = [
    { number: 1, name: 'Contact Info', icon: '👤' },
    { number: 2, name: 'Preferences', icon: '⚙️' },
    { number: 3, name: 'Review', icon: '✓' }
  ];

  return (
    <div className="sales-page">
      {/* ===== HERO SECTION ===== */}
      <section className="sales-hero">
        <div className="sales-hero-bg"></div>
        <div className="sales-hero-content">
          <h1 className="sales-hero-title animate-fade-up">
            Premium <span className="gold-text">Sales</span>
          </h1>
          <p className="sales-hero-description animate-fade-up">
            Discover hand-selected luxury vehicles, each thoroughly inspected and certified
          </p>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🔍</span>
              <h3>150-Point Inspection</h3>
              <p>Meticulously inspected vehicles</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📋</span>
              <h3>Vehicle History</h3>
              <p>Complete Carfax reports</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <h3>Financing Options</h3>
              <p>Competitive rates available</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔄</span>
              <h3>Trade-ins Welcome</h3>
              <p>Fair market value offered</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>Certified Pre-Owned</h3>
              <p>Rigorous certification process</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🚚</span>
              <h3>Delivery Available</h3>
              <p>Worldwide shipping</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FILTERS SECTION ===== */}
      <section className="filters-section">
        <div className="container">
          <div className="filters-wrapper">
            <div className="filter-tabs">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  className={`filter-tab ${selectedFilter === filter.id ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(filter.id)}
                >
                  <span className="filter-icon">{filter.icon}</span>
                  <span className="filter-label">{filter.label}</span>
                </button>
              ))}
            </div>

            <div className="filter-options">
              <select className="location-select">
                {locations.map(loc => (
                  <option key={loc.id}>{loc.label}</option>
                ))}
              </select>

              <select className="sort-select">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Year: Newest First</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RESULTS COUNT ===== */}
      <div className="results-count">
        <div className="container">
          <p>
            <span className="count-number">{filteredVehicles.length}</span> vehicles available
          </p>
        </div>
      </div>

      {/* ===== VEHICLES GRID ===== */}
      <section className="vehicles-section">
        <div className="container">
          <div className="vehicles-grid">
            {filteredVehicles.map((vehicle) => (
              <div 
                key={vehicle.id} 
                className="vehicle-card"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setShowModal(true);
                  setInquiryStep(1);
                  setInquiryData({
                    name: '',
                    email: '',
                    phone: '',
                    message: `I'm interested in the ${vehicle.year} ${vehicle.name}. Please contact me with more information.`,
                    testDrive: false,
                    financing: false,
                    tradeIn: false
                  });
                }}
              >
                {vehicle.certified && (
                  <div className="certified-badge">✓ CERTIFIED</div>
                )}
                {vehicle.condition === 'New' && (
                  <div className="new-badge">NEW ARRIVAL</div>
                )}
                <div className="vehicle-image">
                  <img src={vehicle.image} alt={vehicle.name} />
                </div>
                <div className="vehicle-details">
                  <div className="vehicle-header">
                    <h3>{vehicle.name}</h3>
                    <span className="vehicle-year">{vehicle.year}</span>
                  </div>
                  
                  <p className="vehicle-subtitle">
                    {vehicle.mileage.toLocaleString()} miles • {vehicle.condition} • {vehicle.location}
                  </p>
                  
                  <div className="vehicle-specs">
                    <div className="spec">
                      <span className="spec-label">Engine</span>
                      <span className="spec-value">{vehicle.specs.engine}</span>
                    </div>
                    <div className="spec">
                      <span className="spec-label">Horsepower</span>
                      <span className="spec-value">{vehicle.specs.horsepower}</span>
                    </div>
                    <div className="spec">
                      <span className="spec-label">0-60</span>
                      <span className="spec-value">{vehicle.specs.acceleration}</span>
                    </div>
                  </div>

                  <div className="vehicle-features">
                    {vehicle.features.slice(0, 4).map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                  </div>

                  <div className="vehicle-footer">
                    <div className="vehicle-price">
                      <span className="price-amount">{formatPrice(vehicle.price)}</span>
                    </div>
                    <button className="btn-inquire">Inquire</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VEHICLE DETAILS MODAL ===== */}
      {showModal && selectedVehicle && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content vehicle-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            
            <div className="modal-layout">
              {/* Left Column - Vehicle Images */}
              <div className="modal-left">
                <div className="vehicle-gallery">
                  <img src={selectedVehicle.image} alt={selectedVehicle.name} className="gallery-main" />
                  <div className="gallery-thumbnails">
                    {selectedVehicle.images.map((img, i) => (
                      <img key={i} src={img} alt={`${selectedVehicle.name} ${i + 1}`} className="gallery-thumb" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Vehicle Info & Inquiry */}
              <div className="modal-right">
                <div className="vehicle-info-header">
                  <div>
                    <h2>{selectedVehicle.name}</h2>
                    <p className="vehicle-meta">
                      {selectedVehicle.year} • {selectedVehicle.mileage.toLocaleString()} miles • {selectedVehicle.location}
                    </p>
                  </div>
                  <div className="vehicle-price-large">
                    {formatPrice(selectedVehicle.price)}
                  </div>
                </div>

                {/* Inquiry Steps */}
                <div className="inquiry-steps">
                  {inquirySteps.map((step) => (
                    <div 
                      key={step.number}
                      className={`step ${inquiryStep === step.number ? 'active' : ''} ${inquiryStep > step.number ? 'completed' : ''}`}
                    >
                      <div className="step-indicator">
                        <span className="step-icon">{step.icon}</span>
                        <span className="step-number">{step.number}</span>
                      </div>
                      <span className="step-name">{step.name}</span>
                    </div>
                  ))}
                </div>

                {/* Step 1: Contact Information */}
                {inquiryStep === 1 && (
                  <div className="inquiry-step-content">
                    <h3>Contact Information</h3>
                    
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="John Doe"
                        value={inquiryData.name}
                        onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="john@example.com"
                        value={inquiryData.email}
                        onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="(555) 123-4567"
                        value={inquiryData.phone}
                        onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                      />
                    </div>

                    <div className="step-actions">
                      <button className="btn-next" onClick={() => setInquiryStep(2)}>
                        Continue to Preferences
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Preferences */}
                {inquiryStep === 2 && (
                  <div className="inquiry-step-content">
                    <h3>Your Preferences</h3>

                    <div className="preferences-grid">
                      <div className="preference-card">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={inquiryData.testDrive}
                            onChange={(e) => setInquiryData({ ...inquiryData, testDrive: e.target.checked })}
                          />
                          <span className="checkbox-custom"></span>
                          <div className="preference-content">
                            <span className="preference-icon">🚗</span>
                            <div>
                              <h4>Schedule Test Drive</h4>
                              <p>Experience the vehicle in person</p>
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="preference-card">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={inquiryData.financing}
                            onChange={(e) => setInquiryData({ ...inquiryData, financing: e.target.checked })}
                          />
                          <span className="checkbox-custom"></span>
                          <div className="preference-content">
                            <span className="preference-icon">💰</span>
                            <div>
                              <h4>Financing Options</h4>
                              <p>Get pre-approved for financing</p>
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="preference-card">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={inquiryData.tradeIn}
                            onChange={(e) => setInquiryData({ ...inquiryData, tradeIn: e.target.checked })}
                          />
                          <span className="checkbox-custom"></span>
                          <div className="preference-content">
                            <span className="preference-icon">🔄</span>
                            <div>
                              <h4>Trade-In Evaluation</h4>
                              <p>Get value for your current vehicle</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Additional Message (Optional)</label>
                      <textarea
                        className="form-textarea"
                        rows="3"
                        value={inquiryData.message}
                        onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                      />
                    </div>

                    <div className="step-actions">
                      <button className="btn-back" onClick={() => setInquiryStep(1)}>
                        Back
                      </button>
                      <button 
                        className="btn-next"
                        onClick={() => setInquiryStep(3)}
                        disabled={!inquiryData.name || !inquiryData.email || !inquiryData.phone}
                      >
                        Review Inquiry
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {inquiryStep === 3 && (
                  <div className="inquiry-step-content">
                    <h3>Review Your Inquiry</h3>

                    <div className="inquiry-summary">
                      <div className="summary-section">
                        <h4>Vehicle</h4>
                        <p><strong>{selectedVehicle.name}</strong></p>
                        <p>{selectedVehicle.year} • {selectedVehicle.mileage.toLocaleString()} miles</p>
                        <p className="summary-price">{formatPrice(selectedVehicle.price)}</p>
                      </div>

                      <div className="summary-section">
                        <h4>Contact Information</h4>
                        <p><strong>{inquiryData.name}</strong></p>
                        <p>{inquiryData.email}</p>
                        <p>{inquiryData.phone}</p>
                      </div>

                      {inquiryData.testDrive && (
                        <div className="summary-section">
                          <h4>Test Drive Requested</h4>
                        </div>
                      )}

                      {inquiryData.financing && (
                        <div className="summary-section">
                          <h4>Financing Information Requested</h4>
                        </div>
                      )}

                      {inquiryData.tradeIn && (
                        <div className="summary-section">
                          <h4>Trade-In Evaluation Requested</h4>
                        </div>
                      )}

                      <div className="summary-section">
                        <h4>Message</h4>
                        <p className="summary-message">{inquiryData.message}</p>
                      </div>
                    </div>

                    <div className="terms-agreement">
                      <label className="checkbox-label">
                        <input type="checkbox" required />
                        <span>I agree to be contacted by a sales representative</span>
                      </label>
                    </div>

                    <div className="step-actions">
                      <button className="btn-back" onClick={() => setInquiryStep(2)}>
                        Back
                      </button>
                      <button 
                        className="btn-confirm"
                        onClick={() => {
                          setShowModal(false);
                          alert('Thank you for your interest! A sales representative will contact you within 24 hours.');
                        }}
                      >
                        Submit Inquiry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== WHY BUY SECTION ===== */}
      <section className="why-buy-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHY BUY FROM US</span>
            <h2 className="section-title">
              The CAR EASE <span className="gold-text">Advantage</span>
            </h2>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">🔍</div>
              <h3>150-Point Inspection</h3>
              <p>Every vehicle undergoes rigorous inspection</p>
            </div>
            <div className="why-card">
              <div className="why-icon">📋</div>
              <h3>Complete History</h3>
              <p>Full Carfax reports on every vehicle</p>
            </div>
            <div className="why-card">
              <div className="why-icon">💰</div>
              <h3>Best Price Guarantee</h3>
              <p>We match any legitimate offer</p>
            </div>
            <div className="why-card">
              <div className="why-icon">🏦</div>
              <h3>Financing Available</h3>
              <p>Competitive rates and flexible terms</p>
            </div>
            <div className="why-card">
              <div className="why-icon">🔄</div>
              <h3>Trade-ins Welcome</h3>
              <p>Fair market value for your vehicle</p>
            </div>
            <div className="why-card">
              <div className="why-icon">🚚</div>
              <h3>Worldwide Delivery</h3>
              <p>Ship to your location</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINANCING SECTION ===== */}
      <section className="financing-section">
        <div className="container">
          <div className="financing-grid">
            <div className="financing-content">
              <span className="section-subtitle">FINANCING MADE EASY</span>
              <h2 className="section-title">
                Flexible <span className="gold-text">Payment Options</span>
              </h2>
              <p className="financing-description">
                We work with multiple lenders to offer competitive rates and flexible terms. Get pre-approved in minutes with no impact to your credit score.
              </p>
              <ul className="financing-benefits">
                <li>✓ Competitive interest rates</li>
                <li>✓ Flexible term lengths</li>
                <li>✓ Quick pre-approval</li>
                <li>✓ No hidden fees</li>
              </ul>
              <button className="btn-gold">Get Pre-Approved</button>
            </div>
            <div className="financing-image">
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800" alt="Financing" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRADE-IN SECTION ===== */}
      <section className="tradein-section">
        <div className="container">
          <div className="tradein-grid">
            <div className="tradein-image">
              <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800" alt="Trade-in" />
            </div>
            <div className="tradein-content">
              <span className="section-subtitle">TRADE-IN PROGRAM</span>
              <h2 className="section-title">
                Get Value for Your <span className="gold-text">Current Vehicle</span>
              </h2>
              <p className="tradein-description">
                Looking to upgrade? We offer competitive trade-in values for your current vehicle. Get an instant online offer or visit us for a professional appraisal.
              </p>
              <div className="tradein-features">
                <div className="tradein-feature">
                  <span className="feature-icon">⚡</span>
                  <span>Instant online offer</span>
                </div>
                <div className="tradein-feature">
                  <span className="feature-icon">✓</span>
                  <span>Professional appraisal</span>
                </div>
                <div className="tradein-feature">
                  <span className="feature-icon">💰</span>
                  <span>Fair market value</span>
                </div>
              </div>
              <button className="btn-gold">Value Your Trade</button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="sales-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Find Your Dream Car?</h2>
            <p>Browse our collection or speak with a sales specialist</p>
            <div className="cta-buttons">
              <button 
                className="btn-gold btn-large"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Browse Inventory
              </button>
              <a href="tel:+18005550123" className="btn-outline-light btn-large">
                Call Sales: +1 (800) 555-0123
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sales;