// ===== src/Pages/Rentals.jsx =====
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { VEHICLE_CATEGORIES } from '../Utils/constants';
import { formatCurrency } from '../Utils/format';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import VehicleCard from '../Components/Features/VehicleCard';
import HeroSection from '../Components/Features/HeroSection';

// Services
import { getVehicles, getVehicleCategories } from '../Services/VehicleService';

// Hooks
import { useApp } from '../Context/AppContext';
import { saveBookingDraft } from '../Utils/bookingFlow';

// Styles
import '../Styles/Rentals.css';

const Rentals = () => {
  const navigate = useNavigate();
  const toKES = (amount) => Number(amount || 0) * 130;
  const formatKES = (amount) => formatCurrency(toKES(amount));
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    sortBy: 'recommended',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  const { addNotification } = useApp();

  useEffect(() => {
    fetchVehicles();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await getVehicles({
        page: pagination.page,
        limit: pagination.limit,
        category: filters.category !== 'all' ? filters.category : undefined
      });
      setVehicles(Array.isArray(data?.vehicles) ? data.vehicles : []);
      setPagination(prev => ({
        ...prev,
        total: Number(data?.total || 0),
        totalPages: Number(data?.totalPages || 0)
      }));
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      // Fallback data
      setVehicles([
        {
          id: 1,
          name: 'Lamborghini Huracán EVO',
          make: 'Lamborghini',
          model: 'Huracán EVO',
          year: 2023,
          price: 1299,
          category: 'supercar',
          image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ],
          specs: {
            engine: '6.5L V10',
            power: '640 hp',
            acceleration: '2.9s 0-100 km/h',
            topSpeed: '202 km/h',
            transmission: '7-speed dual clutch',
            drivetrain: 'AWD'
          },
          features: ['Carbon Ceramic Brakes', 'Lift System', 'Apple CarPlay', 'Backup Camera'],
          available: true,
          rating: 4.9,
          reviews: 124,
          location: 'Roysambu (next to TRM)'
        },
        {
          id: 2,
          name: 'Ferrari F8 Tributo',
          make: 'Ferrari',
          model: 'F8 Tributo',
          year: 2023,
          price: 1399,
          category: 'supercar',
          image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ],
          specs: {
            engine: '3.9L V8',
            power: '710 hp',
            acceleration: '2.9s 0-100 km/h',
            topSpeed: '211 km/h',
            transmission: '7-speed dual clutch',
            drivetrain: 'RWD'
          },
          features: ['Carbon Fiber Package', 'Racing Seats', 'Telemetry System', 'JBL Audio'],
          available: true,
          rating: 4.8,
          reviews: 98,
          location: 'Westlands'
        },
        {
          id: 3,
          name: 'Rolls-Royce Ghost',
          make: 'Rolls-Royce',
          model: 'Ghost',
          year: 2023,
          price: 1899,
          category: 'luxury',
          image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ],
          specs: {
            engine: '6.75L V12',
            power: '563 hp',
            acceleration: '4.6s 0-100 km/h',
            topSpeed: '155 km/h',
            transmission: '8-speed automatic',
            drivetrain: 'AWD'
          },
          features: ['Starlight Headliner', 'Massage Seats', 'Champagne Cooler', 'Theater System'],
          available: true,
          rating: 5.0,
          reviews: 56,
          location: 'Mombasa Road'
        },
        {
          id: 4,
          name: 'Porsche 911 Turbo S',
          make: 'Porsche',
          model: '911 Turbo S',
          year: 2023,
          price: 899,
          category: 'sports',
          image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ],
          specs: {
            engine: '3.7L Flat-6',
            power: '640 hp',
            acceleration: '2.6s 0-100 km/h',
            topSpeed: '205 km/h',
            transmission: '8-speed dual clutch',
            drivetrain: 'AWD'
          },
          features: ['Sport Chrono Package', 'PDK Transmission', 'Sport Exhaust', 'Carbon Buckets'],
          available: true,
          rating: 4.9,
          reviews: 167,
          location: 'Roysambu (next to TRM)'
        },
        {
          id: 5,
          name: 'Bentley Continental GT',
          make: 'Bentley',
          model: 'Continental GT',
          year: 2023,
          price: 1099,
          category: 'grand_tourer',
          image: 'https://images.unsplash.com/photo-1622194996008-2c22880c0b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1622194996008-2c22880c0b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ],
          specs: {
            engine: '6.0L W12',
            power: '650 hp',
            acceleration: '3.5s 0-100 km/h',
            topSpeed: '208 km/h',
            transmission: '8-speed dual clutch',
            drivetrain: 'AWD'
          },
          features: ['Naim Audio', 'Rotating Display', 'Mulliner Package', 'Flying B'],
          available: true,
          rating: 4.8,
          reviews: 82,
          location: 'Westlands'
        },
        {
          id: 6,
          name: 'McLaren 720S',
          make: 'McLaren',
          model: '720S',
          year: 2023,
          price: 1499,
          category: 'supercar',
          image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ],
          specs: {
            engine: '4.0L V8',
            power: '710 hp',
            acceleration: '2.7s 0-100 km/h',
            topSpeed: '212 km/h',
            transmission: '7-speed dual clutch',
            drivetrain: 'RWD'
          },
          features: ['Dihedral Doors', 'Track Mode', 'Carbon Monocoque', 'Active Suspension'],
          available: true,
          rating: 4.9,
          reviews: 103,
          location: 'Mombasa Road'
        },
        {
          id: 7,
          name: 'Range Rover Autobiography',
          make: 'Range Rover',
          model: 'Autobiography',
          year: 2023,
          price: 699,
          category: 'suv',
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ],
          specs: {
            engine: '4.4L V8',
            power: '523 hp',
            acceleration: '4.4s 0-100 km/h',
            topSpeed: '155 km/h',
            transmission: '8-speed automatic',
            drivetrain: 'AWD'
          },
          features: ['Executive Class Seats', 'Meridian Audio', 'Off-Road Package', 'Panoramic Roof'],
          available: true,
          rating: 4.7,
          reviews: 145,
          location: 'Roysambu (next to TRM)'
        },
        {
          id: 8,
          name: 'Aston Martin DBS',
          make: 'Aston Martin',
          model: 'DBS Superleggera',
          year: 2023,
          price: 1599,
          category: 'grand_tourer',
          image: 'https://images.unsplash.com/photo-1603584173870-7f098fd2d1e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1603584173870-7f098fd2d1e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ],
          specs: {
            engine: '5.2L V12',
            power: '715 hp',
            acceleration: '3.2s 0-100 km/h',
            topSpeed: '211 km/h',
            transmission: '8-speed automatic',
            drivetrain: 'RWD'
          },
          features: ['Carbon Fiber Body', 'Bang & Olufsen Audio', 'Sports Exhaust', 'Q Customization'],
          available: true,
          rating: 4.9,
          reviews: 67,
          location: 'Mombasa Road'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getVehicleCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories(VEHICLE_CATEGORIES);
    }
  };

  const filterVehicles = () => {
    let filtered = Array.isArray(vehicles) ? [...vehicles] : [];

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(v => v.category === filters.category);
    }

    // Filter by price range
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(v => v.price >= min && v.price <= max);
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.make.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // recommended - keep original order
        break;
    }

    setFilteredVehicles(filtered);
  };

  const safeCategories = Array.isArray(categories) ? categories : [];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleQuickView = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowQuickView(true);
  };

  const handleQuickBook = (vehicle) => {
    const draft = {
      serviceType: 'rental',
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      listedPrice: vehicle.price * 130,
      startDate: '',
      endDate: '',
      pickupLocation: 'roysambu-trm'
    };
    saveBookingDraft(draft);
    navigate(ROUTES.RENTALS_FLOW, {
      state: { bookingPrefill: draft }
    });
    addNotification('Vehicle selected. Complete your booking details.', 'info');
  };

  const handleQuickBuy = (vehicle) => {
    const draft = {
      serviceType: 'sales',
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      inquiryType: 'purchase',
      pickupLocation: 'roysambu-trm'
    };
    saveBookingDraft(draft);
    navigate(ROUTES.SALES_FLOW, {
      state: { bookingPrefill: draft }
    });
    addNotification('Proceed to complete your purchase request.', 'info');
  };

  const handleContactConcierge = (vehicle) => {
    addNotification(`Contacting concierge for ${vehicle?.name || 'selected vehicle'}...`, 'info');
    window.location.href = 'tel:+254758458358';
  };

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-500', label: `Under ${formatKES(500)}` },
    { value: '500-1000', label: `${formatKES(500)} - ${formatKES(1000)}` },
    { value: '1000-1500', label: `${formatKES(1000)} - ${formatKES(1500)}` },
    { value: '1500-2000', label: `${formatKES(1500)} - ${formatKES(2000)}` },
    { value: '2000-9999', label: `${formatKES(2000)}+` }
  ];

  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' }
  ];

  return (
    <div className="rentals-page">
      {/* Hero Section */}
      <HeroSection
        title="Luxury Vehicle Rentals"
        subtitle="Experience the finest collection of exotic and luxury vehicles"
        ctaText="Browse Fleet"
        ctaLink="#fleet"
        secondaryCtaText="How It Works"
        secondaryCtaLink="#how-it-works"
        backgroundImage="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        alignment="center"
        fullHeight={false}
      />

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">SIMPLE PROCESS</span>
            <h2 className="section-title">How It <span className="gold-text">Works</span></h2>
            <p className="section-description">
              Rent your dream car in three simple steps
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card animate-fade-up animate-delay-1">
              <div className="step-number">1</div>
              <div className="step-icon">🔍</div>
              <h3 className="step-title">Choose Your Vehicle</h3>
              <p className="step-description">Browse our curated collection of luxury and exotic vehicles</p>
            </div>

            <div className="step-card animate-fade-up animate-delay-2">
              <div className="step-number">2</div>
              <div className="step-icon">📅</div>
              <h3 className="step-title">Select Dates</h3>
              <p className="step-description">Pick your rental dates and any additional options</p>
            </div>

            <div className="step-card animate-fade-up animate-delay-3">
              <div className="step-number">3</div>
              <div className="step-icon">🚗</div>
              <h3 className="step-title">Enjoy Your Ride</h3>
              <p className="step-description">Pick up your vehicle or have it delivered to you</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">RENTAL FLOW</span>
            <h2 className="section-title">Details to <span className="gold-text">Delivery</span></h2>
            <p className="section-description">
              Every vehicle can be viewed in full detail, contacted for clarification, and booked instantly.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card animate-fade-up animate-delay-1">
              <div className="step-number">1</div>
              <h3 className="step-title">View Details</h3>
              <p className="step-description">Open any car to see specs, features, location, and availability.</p>
            </div>
            <div className="step-card animate-fade-up animate-delay-2">
              <div className="step-number">2</div>
              <h3 className="step-title">Contact or Rent</h3>
              <p className="step-description">Talk to concierge first or proceed directly to the rent-now flow.</p>
            </div>
            <div className="step-card animate-fade-up animate-delay-3">
              <div className="step-number">3</div>
              <h3 className="step-title">Delivery + Payment</h3>
              <p className="step-description">Set delivery mode, provide details, then pay online or on delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="fleet-section" id="fleet">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OUR FLEET</span>
            <h2 className="section-title">Choose Your <span className="gold-text">Dream Car</span></h2>
            <p className="section-description">
              Select from our premium collection of luxury vehicles
            </p>
          </div>

          {/* Filters */}
          <div className="fleet-filters">
            <div className="filter-group">
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...safeCategories.map(c => ({ value: c.id, label: c.name }))
                ]}
                className="filter-select"
              />

              <Select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                options={priceRanges}
                className="filter-select"
              />

              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                options={sortOptions}
                className="filter-select"
              />
            </div>

            <div className="filter-actions">
              <div className="search-wrapper">
                <Input
                  type="text"
                  placeholder="Search vehicles..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <span className="view-icon">⊞</span>
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <span className="view-icon">☰</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="results-count">
            <span>{filteredVehicles.length} vehicles available</span>
          </div>

          {/* Vehicle Grid/List */}
          {loading ? (
            <div className="vehicles-loading">
              <LoadingSpinner size="lg" color="gold" text="Loading vehicles..." />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">🚗</span>
              <h3>No Vehicles Found</h3>
              <p>Try adjusting your filters or search criteria</p>
              <Button 
                variant="primary" 
                onClick={() => setFilters({
                  category: 'all',
                  priceRange: 'all',
                  sortBy: 'recommended',
                  search: ''
                })}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`vehicles-container ${viewMode}`}>
              {filteredVehicles.map((vehicle, index) => (
                <div key={vehicle.id} className={`vehicle-wrapper animate-fade-up animate-delay-${index % 4 + 1}`}>
                  <VehicleCard
                    {...vehicle}
                    price={toKES(vehicle.price)}
                    onQuickView={() => handleQuickView(vehicle)}
                    onQuickBook={() => handleQuickBook(vehicle)}
                    onBuy={() => handleQuickBook(vehicle)}
                    buyLabel="Rent Now"
                    onContact={() => handleContactConcierge(vehicle)}
                    showActionGrid={true}
                    variant={viewMode === 'list' ? 'horizontal' : 'featured'}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredVehicles.length > 0 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                ←
              </button>
              
              {[...Array(pagination.totalPages || 1)].map((_, i) => (
                <button
                  key={i}
                  className={`pagination-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                  onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                className="pagination-btn"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
              >
                →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      {showQuickView && selectedVehicle && (
        <div className="quick-view-modal">
          <div className="modal-overlay" onClick={() => setShowQuickView(false)}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowQuickView(false)}>×</button>
            
            <div className="quick-view-grid">
              <div className="quick-view-images">
                <div className="main-image">
                  <img src={selectedVehicle.image} alt={selectedVehicle.name} />
                </div>
                <div className="thumbnail-grid">
                  {selectedVehicle.images?.map((img, idx) => (
                    <div key={idx} className="thumbnail">
                      <img src={img} alt={`${selectedVehicle.name} ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="quick-view-details">
                <h2 className="vehicle-name">{selectedVehicle.name}</h2>
                <p className="vehicle-location">📍 {selectedVehicle.location}</p>
                
                <div className="vehicle-rating">
                  <span className="stars">{'★'.repeat(Math.floor(selectedVehicle.rating))}</span>
                  <span className="rating-value">{selectedVehicle.rating}</span>
                  <span className="review-count">({selectedVehicle.reviews} reviews)</span>
                </div>

                <div className="vehicle-price">
                  <span className="price-amount">{formatKES(selectedVehicle.price)}</span>
                  <span className="price-period">/day</span>
                </div>

                <div className="vehicle-specs">
                  <h3>Specifications</h3>
                  <div className="specs-grid">
                    <div className="spec-item">
                      <span className="spec-label">Engine</span>
                      <span className="spec-value">{selectedVehicle.specs.engine}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Power</span>
                      <span className="spec-value">{selectedVehicle.specs.power}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">0-100 km/h</span>
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

                <div className="vehicle-features">
                  <h3>Features</h3>
                  <div className="features-list">
                    {selectedVehicle.features.map((feature, idx) => (
                      <div key={idx} className="feature-item">
                        <span className="feature-check">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="quick-view-actions">
                  <Button variant="primary" size="lg" fullWidth onClick={() => handleQuickBook(selectedVehicle)}>
                    Rent Now
                  </Button>
                  <Button variant="success" size="lg" fullWidth onClick={() => handleQuickBook(selectedVehicle)}>
                    Rent Now
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => handleContactConcierge(selectedVehicle)}
                  >
                    Contact Concierge
                  </Button>
                  <Button variant="outline" size="lg" fullWidth onClick={() => setShowQuickView(false)}>
                    Continue Browsing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="rentals-cta-section">
        <div className="container">
          <div className="cta-content rentals-creative-cta">
            <div className="rental-cta-head">
              <span className="rental-cta-badge">CURATED RENTAL PATHWAYS</span>
              <h2 className="cta-title">Design Your Arrival</h2>
              <p className="cta-description">
                Choose the experience first, then follow a clear path with pickup planning and concierge support.
              </p>
            </div>

            <div className="rental-cta-metrics">
              <div className="rental-metric">
                <span className="metric-value">3</span>
                <span className="metric-label">Pickup Hubs</span>
              </div>
              <div className="rental-metric">
                <span className="metric-value">24/7</span>
                <span className="metric-label">Concierge</span>
              </div>
              <div className="rental-metric">
                <span className="metric-value">Same Day</span>
                <span className="metric-label">Fast Scheduling</span>
              </div>
            </div>

            <div className="rental-experience-grid">
              <article className="rental-experience-card">
                <div className="experience-icon">🌅</div>
                <h3>Weekend Escape</h3>
                <p>Short-term luxury setup with quick pickup and route-ready support.</p>
                <a href="#fleet" className="experience-link">Match Vehicles →</a>
              </article>
              <article className="rental-experience-card">
                <div className="experience-icon">🎬</div>
                <h3>Event Statement</h3>
                <p>Premium arrivals for weddings, shoots, and high-visibility occasions.</p>
                <a href="#fleet" className="experience-link">View Showcase Cars →</a>
              </article>
              <article className="rental-experience-card">
                <div className="experience-icon">💼</div>
                <h3>Executive Mobility</h3>
                <p>Reliable, polished fleet options for business schedules and VIP transfers.</p>
                <a href="#how-it-works" className="experience-link">Review Process →</a>
              </article>
            </div>

            <div className="cta-buttons">
              <a href="#fleet">
                <Button variant="primary" size="lg">
                  Explore Fleet
                </Button>
              </a>
              <a href="tel:+254758458358">
                <Button variant="outline" size="lg">
                  Speak to Concierge
                </Button>
              </a>
              <a href="#how-it-works">
                <Button variant="secondary" size="lg">
                  See Rental Process
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rentals;
