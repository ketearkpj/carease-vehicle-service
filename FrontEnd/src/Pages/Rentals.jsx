import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Rentals.css';

const Rentals = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [extras, setExtras] = useState({
    insurance: false,
    gps: false,
    childSeat: false,
    additionalDriver: false
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Vehicle Data
  const vehicles = [
    {
      id: 1,
      name: 'Lamborghini Huracán EVO',
      category: 'Supercar',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
      images: [
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
        'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800',
        'https://images.unsplash.com/photo-1555608703-a270b9e9aedd?w=800'
      ],
      specs: {
        engine: '5.2L V10',
        horsepower: '631 hp',
        transmission: '7-Speed DCT',
        drivetrain: 'AWD',
        acceleration: '3.2s 0-60',
        topSpeed: '202 mph',
        fuel: 'Premium',
        mileage: '15 mpg'
      },
      features: [
        'Carbon Ceramic Brakes',
        'Lifting System',
        'Sport Exhaust',
        'Telemetry System',
        'Apple CarPlay',
        'Heated Seats',
        'Backup Camera',
        'Keyless Entry'
      ],
      available: true,
      location: 'Beverly Hills',
      color: 'Verde Mantis',
      interior: 'Black Alcantara',
      year: 2024,
      mileage: '500 miles',
      rating: 4.9,
      reviews: 128,
      suitable: ['Special occasions', 'Car enthusiasts', 'Weekend getaways']
    },
    {
      id: 2,
      name: 'Rolls-Royce Ghost',
      category: 'Luxury Sedan',
      price: 1899,
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
        topSpeed: '155 mph',
        fuel: 'Premium',
        mileage: '12 mpg'
      },
      features: [
        'Starlight Headliner',
        'Massage Seats',
        'Rear Entertainment',
        'Refrigerator',
        'Umbrella Set',
        'Lambswool Floor Mats',
        'Champagne Cooler',
        'Picnic Tables'
      ],
      available: true,
      location: 'Beverly Hills',
      color: 'Arctic White',
      interior: 'Tan Leather',
      year: 2024,
      mileage: '800 miles',
      rating: 5.0,
      reviews: 95,
      suitable: ['Corporate events', 'Weddings', 'Executive travel']
    },
    {
      id: 3,
      name: 'Porsche 911 Turbo S',
      category: 'Sports Car',
      price: 999,
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
        topSpeed: '205 mph',
        fuel: 'Premium',
        mileage: '18 mpg'
      },
      features: [
        'Carbon Buckets',
        'Ceramic Brakes',
        'Sport Exhaust',
        'Rear Axle Steering',
        '20/21" Wheels',
        'Sport Chrono',
        'Lift System',
        'BOSE Sound'
      ],
      available: true,
      location: 'Miami',
      color: 'GT Silver',
      interior: 'Black/Bordeaux',
      year: 2024,
      mileage: '300 miles',
      rating: 4.8,
      reviews: 156,
      suitable: ['Track days', 'Mountain drives', 'Daily driving']
    },
    {
      id: 4,
      name: 'Range Rover Autobiography',
      category: 'SUV',
      price: 799,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      images: [
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'
      ],
      specs: {
        engine: '4.4L V8 Twin-Turbo',
        horsepower: '523 hp',
        transmission: '8-Speed Auto',
        drivetrain: 'AWD',
        acceleration: '4.5s 0-60',
        topSpeed: '155 mph',
        fuel: 'Diesel',
        mileage: '22 mpg'
      },
      features: [
        'Meridian Sound',
        'Panoramic Roof',
        'Massage Seats',
        'Off-Road Package',
        'Air Suspension',
        'Terrain Response',
        'Heads-Up Display',
        'Refrigerator'
      ],
      available: true,
      location: 'New York',
      color: 'Santorini Black',
      interior: 'Ebony',
      year: 2024,
      mileage: '200 miles',
      rating: 4.7,
      reviews: 203,
      suitable: ['Family trips', 'Winter driving', 'Off-road adventures']
    },
    {
      id: 5,
      name: 'Ferrari F8 Tributo',
      category: 'Supercar',
      price: 1599,
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
        topSpeed: '211 mph',
        fuel: 'Premium',
        mileage: '14 mpg'
      },
      features: [
        'Rosso Corsa Paint',
        'Carbon Fiber Package',
        'Racing Seats',
        'Telemetry System',
        'Front Lift',
        '20" Forged Wheels',
        'JBL Audio',
        'Carbon Ceramics'
      ],
      available: false,
      location: 'Miami',
      color: 'Red',
      interior: 'Alcantara',
      year: 2023,
      mileage: '3500 miles',
      rating: 4.9,
      reviews: 87,
      suitable: ['Track days', 'Car shows', 'Enthusiasts']
    },
    {
      id: 6,
      name: 'Bentley Continental GT',
      category: 'Grand Tourer',
      price: 1199,
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
        topSpeed: '207 mph',
        fuel: 'Premium',
        mileage: '16 mpg'
      },
      features: [
        'Diamond Stitching',
        'Naim Audio',
        'Rotating Display',
        'Mulliner Package',
        '22" Wheels',
        'Night Vision',
        'Massage Seats',
        'Refrigerator'
      ],
      available: true,
      location: 'New York',
      color: 'Beluga Black',
      interior: 'Hotspur Red',
      year: 2023,
      mileage: '4200 miles',
      rating: 4.8,
      reviews: 112,
      suitable: ['Long distance cruising', 'Business travel', 'Luxury getaways']
    }
  ];

  // Locations
  const locations = [
    {
      id: 'beverly-hills',
      name: 'Beverly Hills Showroom',
      address: '123 Luxury Lane, Beverly Hills, CA 90210',
      phone: '+1 (310) 555-0123',
      hours: 'Mon-Sun: 9am - 8pm',
      amenities: ['Valet parking', 'Coffee bar', 'Lounge', 'Concierge']
    },
    {
      id: 'miami',
      name: 'Miami Beach',
      address: '456 Ocean Drive, Miami Beach, FL 33139',
      phone: '+1 (305) 555-0456',
      hours: 'Mon-Sun: 10am - 7pm',
      amenities: ['Beach view', 'Refreshments', 'Valet']
    },
    {
      id: 'new-york',
      name: 'Manhattan',
      address: '789 Park Avenue, New York, NY 10022',
      phone: '+1 (212) 555-0789',
      hours: 'Mon-Fri: 9am - 8pm, Sat: 10am-6pm',
      amenities: ['Business center', 'Concierge', 'Coffee bar']
    },
    {
      id: 'delivery',
      name: 'Doorstep Delivery',
      address: 'We deliver to your location',
      phone: '+1 (800) 555-RENT',
      hours: 'Mon-Sun: 8am - 8pm',
      serviceArea: ['Los Angeles County', 'Miami-Dade County', 'New York City'],
      fee: 49
    }
  ];

  // Extras
  const extraOptions = [
    { id: 'insurance', name: 'Full Insurance Coverage', price: 25, description: 'Complete coverage including damage, theft, and liability' },
    { id: 'gps', name: 'GPS Navigation', price: 10, description: 'Premium GPS system with real-time traffic' },
    { id: 'childSeat', name: 'Child Safety Seat', price: 15, description: 'Premium child seat for ages 2-8' },
    { id: 'additionalDriver', name: 'Additional Driver', price: 20, description: 'Add another authorized driver' }
  ];

  // Categories
  const categories = ['all', 'Supercar', 'Sports Car', 'Luxury Sedan', 'SUV', 'Grand Tourer'];

  // Price ranges
  const priceRanges = [
    { id: 'all', label: 'All Prices', min: 0, max: Infinity },
    { id: 'under-1000', label: 'Under $1,000', min: 0, max: 999 },
    { id: '1000-1500', label: '$1,000 - $1,500', min: 1000, max: 1500 },
    { id: '1500-2000', label: '$1,500 - $2,000', min: 1500, max: 2000 },
    { id: 'over-2000', label: 'Over $2,000', min: 2000, max: Infinity }
  ];

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesCategory = selectedCategory === 'all' || vehicle.category === selectedCategory;
    const range = priceRanges.find(r => r.id === selectedPriceRange);
    const matchesPrice = vehicle.price >= range.min && vehicle.price <= range.max;
    return matchesCategory && matchesPrice;
  });

  // Calculate rental price
  const calculateRentalPrice = (days = 3) => {
    if (!selectedVehicle) return { total: 0 };
    
    const basePrice = selectedVehicle.price * days;
    const extrasTotal = Object.entries(extras)
      .filter(([key, value]) => value && key !== 'insurance')
      .reduce((sum, [key]) => {
        const extra = extraOptions.find(e => e.id === key);
        return sum + (extra?.price || 0) * days;
      }, 0);
    
    const insuranceTotal = extras.insurance ? 25 * days : 0;
    const deliveryFee = selectedLocation?.id === 'delivery' ? 49 : 0;
    
    const subtotal = basePrice + extrasTotal + insuranceTotal + deliveryFee;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    return {
      basePrice,
      extrasTotal,
      insuranceTotal,
      deliveryFee,
      subtotal,
      tax,
      total
    };
  };

  // Booking steps
  const bookingSteps = [
    { number: 1, name: 'Select Vehicle', icon: '🚗' },
    { number: 2, name: 'Choose Location', icon: '📍' },
    { number: 3, name: 'Add Extras', icon: '➕' },
    { number: 4, name: 'Schedule', icon: '📅' },
    { number: 5, name: 'Confirm', icon: '✓' }
  ];

  return (
    <div className="rentals-page">
      {/* ===== HERO SECTION ===== */}
      <section className="rentals-hero">
        <div className="rentals-hero-bg"></div>
        <div className="rentals-hero-content">
          <h1 className="rentals-hero-title animate-fade-up">
            Luxury <span className="gold-text">Rentals</span>
          </h1>
          <p className="rentals-hero-description animate-fade-up">
            Experience the world's finest automobiles with our premium rental service
          </p>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🛡️</span>
              <h3>Insurance Included</h3>
              <p>Comprehensive coverage with every rental</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🚚</span>
              <h3>Free Delivery</h3>
              <p>Complimentary within 25 miles</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⏰</span>
              <h3>24/7 Support</h3>
              <p>Round-the-clock assistance</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">✓</span>
              <h3>Free Cancellation</h3>
              <p>Up to 48 hours before pickup</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔑</span>
              <h3>Keyless Entry</h3>
              <p>Digital keys via our app</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⭐</span>
              <h3>5-Star Service</h3>
              <p>Thousands of happy clients</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FILTERS SECTION ===== */}
      <section className="filters-section">
        <div className="container">
          <div className="filters-wrapper">
            <div className="filter-group">
              <label>Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <select 
                value={selectedPriceRange} 
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="filter-select"
              >
                {priceRanges.map(range => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Location</label>
              <select className="filter-select">
                <option>All Locations</option>
                <option>Beverly Hills</option>
                <option>Miami</option>
                <option>New York</option>
              </select>
            </div>

            <div className="filter-group search-group">
              <label>Search</label>
              <input 
                type="text" 
                placeholder="Search vehicles..." 
                className="search-input"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== VEHICLES GRID ===== */}
      <section className="vehicles-section">
        <div className="container">
          <div className="results-header">
            <p className="results-count">
              <span className="count-number">{filteredVehicles.length}</span> vehicles available
            </p>
            <select className="sort-select">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating: High to Low</option>
            </select>
          </div>

          <div className="vehicles-grid">
            {filteredVehicles.map((vehicle) => (
              <div 
                key={vehicle.id} 
                className={`vehicle-card ${!vehicle.available ? 'unavailable' : ''}`}
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setShowDetails(true);
                }}
              >
                {!vehicle.available && (
                  <div className="vehicle-badge unavailable">Currently Unavailable</div>
                )}
                {vehicle.available && vehicle.rating >= 4.9 && (
                  <div className="vehicle-badge popular">Most Popular</div>
                )}
                <div className="vehicle-image">
                  <img src={vehicle.image} alt={vehicle.name} />
                </div>
                <div className="vehicle-details">
                  <div className="vehicle-header">
                    <h3>{vehicle.name}</h3>
                    <div className="vehicle-rating">
                      <span className="rating-star">★</span>
                      <span>{vehicle.rating}</span>
                      <span className="rating-count">({vehicle.reviews})</span>
                    </div>
                  </div>
                  
                  <p className="vehicle-category">{vehicle.category} • {vehicle.year}</p>
                  
                  <div className="vehicle-specs-mini">
                    <span className="spec-mini">⚡ {vehicle.specs.acceleration}</span>
                    <span className="spec-mini">⚙️ {vehicle.specs.transmission}</span>
                    <span className="spec-mini">👥 {vehicle.specs.horsepower}</span>
                  </div>

                  <div className="vehicle-features-mini">
                    {vehicle.features.slice(0, 3).map((feature, i) => (
                      <span key={i} className="feature-mini">{feature}</span>
                    ))}
                  </div>

                  <div className="vehicle-footer">
                    <div className="vehicle-price">
                      <span className="price-amount">${vehicle.price}</span>
                      <span className="price-period">/day</span>
                    </div>
                    <button 
                      className={`btn-rent ${!vehicle.available ? 'disabled' : ''}`}
                      disabled={!vehicle.available}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (vehicle.available) {
                          setSelectedVehicle(vehicle);
                          setShowDetails(true);
                        }
                      }}
                    >
                      {vehicle.available ? 'Rent Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VEHICLE DETAILS MODAL ===== */}
      {showDetails && selectedVehicle && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content vehicle-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetails(false)}>×</button>
            
            <div className="vehicle-gallery">
              <img src={selectedVehicle.image} alt={selectedVehicle.name} className="gallery-main" />
              <div className="gallery-thumbnails">
                {selectedVehicle.images.map((img, i) => (
                  <img key={i} src={img} alt={`${selectedVehicle.name} ${i + 1}`} className="gallery-thumb" />
                ))}
              </div>
            </div>

            <div className="vehicle-info">
              <div className="vehicle-info-header">
                <div>
                  <h2>{selectedVehicle.name}</h2>
                  <p className="vehicle-meta">{selectedVehicle.year} • {selectedVehicle.mileage} • {selectedVehicle.location}</p>
                </div>
                <div className="vehicle-info-rating">
                  <span className="rating-star">★</span>
                  <span className="rating-value">{selectedVehicle.rating}</span>
                  <span className="rating-count">({selectedVehicle.reviews} reviews)</span>
                </div>
              </div>

              <div className="vehicle-tabs">
                <button className="tab-btn active">Overview</button>
                <button className="tab-btn">Specifications</button>
                <button className="tab-btn">Features</button>
                <button className="tab-btn">Reviews</button>
              </div>

              <div className="tab-content">
                <p className="vehicle-description">
                  Experience the thrill of driving the {selectedVehicle.name}. This {selectedVehicle.year} model 
                  comes in stunning {selectedVehicle.color} with {selectedVehicle.interior} interior. 
                  Perfect for {selectedVehicle.suitable.join(', ')}.
                </p>

                <div className="suitable-for">
                  <h4>Ideal for:</h4>
                  <div className="suitable-tags">
                    {selectedVehicle.suitable.map((item, i) => (
                      <span key={i} className="suitable-tag">{item}</span>
                    ))}
                  </div>
                </div>

                <div className="key-specs">
                  <h4>Key Specifications</h4>
                  <div className="specs-grid">
                    <div className="spec-item">
                      <span className="spec-label">Engine</span>
                      <span className="spec-value">{selectedVehicle.specs.engine}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Horsepower</span>
                      <span className="spec-value">{selectedVehicle.specs.horsepower}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">0-60 mph</span>
                      <span className="spec-value">{selectedVehicle.specs.acceleration}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Top Speed</span>
                      <span className="spec-value">{selectedVehicle.specs.topSpeed}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Transmission</span>
                      <span className="spec-value">{selectedVehicle.specs.transmission}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Drivetrain</span>
                      <span className="spec-value">{selectedVehicle.specs.drivetrain}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="vehicle-modal-footer">
                <div className="modal-price">
                  <span className="price-label">Starting at</span>
                  <span className="price-amount">${selectedVehicle.price}</span>
                  <span className="price-period">/day</span>
                </div>
                <button 
                  className="btn-rent-modal"
                  onClick={() => {
                    setBookingStep(2);
                    // Scroll to booking section
                  }}
                >
                  Continue to Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== BOOKING SECTION ===== */}
      {selectedVehicle && bookingStep > 1 && (
        <section className="booking-section" id="booking-section">
          <div className="container">
            <div className="booking-card">
              <h2>Complete Your Rental</h2>

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

              {/* Step 2: Location Selection */}
              {bookingStep === 2 && (
                <div className="booking-step-content">
                  <h3>Select Pickup Location</h3>
                  
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
                        {location.fee && (
                          <p className="location-fee">+${location.fee} delivery fee</p>
                        )}
                        {location.serviceArea && (
                          <p className="service-area-note">Serves: {location.serviceArea.join(', ')}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedLocation?.id === 'delivery' && (
                    <div className="delivery-address-form">
                      <label>Delivery Address</label>
                      <textarea
                        className="form-textarea"
                        rows="2"
                        placeholder="Enter your full delivery address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                      <p className="address-note">
                        Delivery available within 25 miles of our service centers. Additional fees may apply.
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
                      disabled={!selectedLocation || (selectedLocation.id === 'delivery' && !deliveryAddress)}
                    >
                      Continue to Extras
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Extras */}
              {bookingStep === 3 && (
                <div className="booking-step-content">
                  <h3>Add Extras</h3>
                  
                  <div className="extras-grid">
                    {extraOptions.map((extra) => (
                      <div
                        key={extra.id}
                        className={`extra-card ${extras[extra.id] ? 'selected' : ''}`}
                        onClick={() => setExtras(prev => ({ ...prev, [extra.id]: !prev[extra.id] }))}
                      >
                        <div className="extra-header">
                          <h4>{extra.name}</h4>
                          <span className="extra-price">${extra.price}/day</span>
                        </div>
                        <p className="extra-description">{extra.description}</p>
                        {extras[extra.id] && (
                          <div className="extra-check">✓</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="step-actions">
                    <button className="btn-back" onClick={() => setBookingStep(2)}>
                      Back
                    </button>
                    <button 
                      className="btn-next"
                      onClick={() => setBookingStep(4)}
                    >
                      Continue to Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Schedule */}
              {bookingStep === 4 && (
                <div className="booking-step-content">
                  <h3>Choose Dates & Times</h3>

                  <div className="schedule-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Pickup Date</label>
                        <input
                          type="date"
                          className="form-input"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div className="form-group">
                        <label>Pickup Time</label>
                        <select
                          className="form-select"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
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

                    <div className="form-row">
                      <div className="form-group">
                        <label>Return Date</label>
                        <input
                          type="date"
                          className="form-input"
                          min={selectedDate}
                        />
                      </div>

                      <div className="form-group">
                        <label>Return Time</label>
                        <select className="form-select">
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

                    <div className="rental-info">
                      <p>⏱️ Minimum rental: 1 day</p>
                      <p>📍 Location: {selectedLocation?.name}</p>
                      {selectedLocation?.id === 'delivery' && (
                        <p>🚚 Delivery to: {deliveryAddress}</p>
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
                  <h3>Review Your Rental</h3>

                  <div className="booking-summary-card">
                    <div className="summary-section">
                      <h4>Vehicle</h4>
                      <p><strong>{selectedVehicle.name}</strong></p>
                      <p>{selectedVehicle.year} • {selectedVehicle.color}</p>
                    </div>

                    <div className="summary-section">
                      <h4>Location</h4>
                      <p><strong>{selectedLocation?.name}</strong></p>
                      <p>{selectedLocation?.address}</p>
                      {selectedLocation?.id === 'delivery' && (
                        <p className="delivery-address">Delivery to: {deliveryAddress}</p>
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
                    </div>

                    {Object.values(extras).some(v => v) && (
                      <div className="summary-section">
                        <h4>Extras</h4>
                        <ul className="summary-extras-list">
                          {extras.insurance && <li>Full Insurance Coverage (+$25/day)</li>}
                          {extras.gps && <li>GPS Navigation (+$10/day)</li>}
                          {extras.childSeat && <li>Child Safety Seat (+$15/day)</li>}
                          {extras.additionalDriver && <li>Additional Driver (+$20/day)</li>}
                        </ul>
                      </div>
                    )}

                    <div className="price-breakdown">
                      <h4>Price Breakdown</h4>
                      <div className="price-row">
                        <span>Base Price (3 days)</span>
                        <span>${selectedVehicle.price * 3}</span>
                      </div>
                      {extras.insurance && (
                        <div className="price-row">
                          <span>Insurance (3 days)</span>
                          <span>$75</span>
                        </div>
                      )}
                      {extras.gps && (
                        <div className="price-row">
                          <span>GPS (3 days)</span>
                          <span>$30</span>
                        </div>
                      )}
                      {selectedLocation?.id === 'delivery' && (
                        <div className="price-row">
                          <span>Delivery Fee</span>
                          <span>$49</span>
                        </div>
                      )}
                      <div className="price-row">
                        <span>Subtotal</span>
                        <span>${(selectedVehicle.price * 3 + 75 + 30 + 49).toFixed(2)}</span>
                      </div>
                      <div className="price-row">
                        <span>Tax (10%)</span>
                        <span>${((selectedVehicle.price * 3 + 75 + 30 + 49) * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="price-row total">
                        <span>Total</span>
                        <span className="total-amount">${((selectedVehicle.price * 3 + 75 + 30 + 49) * 1.1).toFixed(2)}</span>
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
                    <button className="btn-back" onClick={() => setBookingStep(4)}>
                      Back
                    </button>
                    <button 
                      className="btn-confirm"
                      onClick={() => {
                        navigate('/booking-confirmation', {
                          state: {
                            type: 'rental',
                            vehicle: selectedVehicle,
                            location: selectedLocation,
                            date: selectedDate,
                            time: selectedTime,
                            deliveryAddress: selectedLocation?.id === 'delivery' ? deliveryAddress : null,
                            extras,
                            total: (selectedVehicle.price * 3 + 75 + 30 + 49) * 1.1
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

      {/* ===== WHY RENT WITH US ===== */}
      <section className="why-rent-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHY CHOOSE US</span>
            <h2 className="section-title">
              The Ultimate <span className="gold-text">Rental Experience</span>
            </h2>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🛡️</div>
              <h3>Comprehensive Insurance</h3>
              <p>Full coverage included with every rental</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🚚</div>
              <h3>Free Delivery</h3>
              <p>Complimentary within 25 miles</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⏰</div>
              <h3>24/7 Roadside</h3>
              <p>Round-the-clock assistance</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">✓</div>
              <h3>Free Cancellation</h3>
              <p>Up to 48 hours before</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔑</div>
              <h3>Digital Keys</h3>
              <p>Access via mobile app</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⭐</div>
              <h3>5-Star Service</h3>
              <p>Thousands of reviews</p>
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
              Rental <span className="gold-text">Questions</span>
            </h2>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h3>What is the minimum age to rent?</h3>
              <p>You must be at least 25 years old with a valid driver's license. Drivers under 25 may be subject to additional fees.</p>
            </div>
            <div className="faq-item">
              <h3>What insurance is included?</h3>
              <p>Basic liability insurance is included. Collision damage waiver and comprehensive coverage are available as add-ons.</p>
            </div>
            <div className="faq-item">
              <h3>Is there a mileage limit?</h3>
              <p>All rentals include unlimited mileage. You're free to drive as much as you want.</p>
            </div>
            <div className="faq-item">
              <h3>Can I cancel my reservation?</h3>
              <p>Free cancellation up to 48 hours before your scheduled pickup. Late cancellations may incur a 50% fee.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, PayPal, and wire transfers. A security deposit is required.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer airport delivery?</h3>
              <p>Yes, we offer complimentary delivery to major airports in LA, Miami, and NYC with 24-hour notice.</p>
            </div>
          </div>
        </div>
      </section>


      {/* ===== CTA SECTION ===== */}
      <section className="rentals-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Drive?</h2>
            <p>Book your dream car today and experience luxury like never before</p>
            <button 
              className="btn-gold btn-large"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Browse Fleet
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};


export default Rentals;