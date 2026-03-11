// ===== src/Pages/Sales.jsx =====
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { VEHICLE_CATEGORIES, CURRENCY } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import VehicleCard from '../Components/Features/VehicleCard';
import HeroSection from '../Components/Features/HeroSection';

// Services
import { getSalesVehicles, getVehicleById } from '../Services/VehicleService';

// Hooks
import { useApp } from '../Context/AppContext';
import { saveBookingDraft } from '../Utils/bookingFlow';

// Styles
import '../Styles/Sales.css';

const Sales = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    make: 'all',
    priceRange: 'all',
    yearRange: 'all',
    sortBy: 'recommended',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0
  });
  const [viewMode, setViewMode] = useState('grid');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [financing, setFinancing] = useState({
    enabled: false,
    downPayment: 20,
    term: 60,
    interestRate: 4.5
  });

  const { addNotification } = useApp();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await getSalesVehicles({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      setVehicles(data.vehicles);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages
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
          year: 2022,
          price: 289000,
          mileage: 1200,
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
            acceleration: '2.9s 0-60',
            topSpeed: '202 mph',
            transmission: '7-speed dual clutch',
            drivetrain: 'AWD'
          },
          features: ['Carbon Ceramic Brakes', 'Lift System', 'Apple CarPlay', 'Backup Camera'],
          color: 'Verde Mantis',
          interior: 'Black Alcantara',
          vin: 'ZHWUE4ZF4NLA12345',
          condition: 'Excellent',
          owners: 1,
          serviceHistory: 'Full service history',
          warranty: 'Remaining factory warranty',
          location: 'Roysambu (next to TRM)',
          featured: true
        },
        {
          id: 2,
          name: 'Ferrari F8 Tributo',
          make: 'Ferrari',
          model: 'F8 Tributo',
          year: 2021,
          price: 315000,
          mileage: 3500,
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
            acceleration: '2.9s 0-60',
            topSpeed: '211 mph',
            transmission: '7-speed dual clutch',
            drivetrain: 'RWD'
          },
          features: ['Carbon Fiber Package', 'Racing Seats', 'Telemetry System', 'JBL Audio'],
          color: 'Rosso Corsa',
          interior: 'Black Leather',
          vin: 'ZFF90HLA7N0246810',
          condition: 'Excellent',
          owners: 1,
          serviceHistory: 'Full Ferrari service history',
          warranty: 'Certified Pre-Owned',
          location: 'Westlands',
          featured: true
        },
        {
          id: 3,
          name: 'Rolls-Royce Ghost',
          make: 'Rolls-Royce',
          model: 'Ghost',
          year: 2023,
          price: 425000,
          mileage: 500,
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
            acceleration: '4.6s 0-60',
            topSpeed: '155 mph',
            transmission: '8-speed automatic',
            drivetrain: 'AWD'
          },
          features: ['Starlight Headliner', 'Massage Seats', 'Champagne Cooler', 'Theater System'],
          color: 'Arctic White',
          interior: 'Arctic White Leather',
          vin: 'SCA665L03NUX12345',
          condition: 'New',
          owners: 0,
          serviceHistory: 'New vehicle',
          warranty: 'Full factory warranty',
          location: 'Mombasa Road',
          featured: true
        },
        {
          id: 4,
          name: 'Porsche 911 Turbo S',
          make: 'Porsche',
          model: '911 Turbo S',
          year: 2022,
          price: 245000,
          mileage: 2200,
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
            acceleration: '2.6s 0-60',
            topSpeed: '205 mph',
            transmission: '8-speed dual clutch',
            drivetrain: 'AWD'
          },
          features: ['Sport Chrono Package', 'PDK Transmission', 'Sport Exhaust', 'Carbon Buckets'],
          color: 'GT Silver',
          interior: 'Black/Bordeaux Red',
          vin: 'WP0AF2A99NS123456',
          condition: 'Excellent',
          owners: 1,
          serviceHistory: 'Porsche dealer serviced',
          warranty: 'CPO warranty',
          location: 'Roysambu (next to TRM)'
        },
        {
          id: 5,
          name: 'Bentley Continental GT',
          make: 'Bentley',
          model: 'Continental GT',
          year: 2021,
          price: 198000,
          mileage: 8900,
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
            acceleration: '3.5s 0-60',
            topSpeed: '208 mph',
            transmission: '8-speed dual clutch',
            drivetrain: 'AWD'
          },
          features: ['Naim Audio', 'Rotating Display', 'Mulliner Package', 'Flying B'],
          color: 'Beluga Black',
          interior: 'Hotspur Red',
          vin: 'SCBCG3ZA5MC123456',
          condition: 'Excellent',
          owners: 2,
          serviceHistory: 'Complete service history',
          warranty: '6 months remaining',
          location: 'Westlands'
        },
        {
          id: 6,
          name: 'McLaren 720S',
          make: 'McLaren',
          model: '720S',
          year: 2020,
          price: 279000,
          mileage: 5600,
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
            acceleration: '2.7s 0-60',
            topSpeed: '212 mph',
            transmission: '7-speed dual clutch',
            drivetrain: 'RWD'
          },
          features: ['Dihedral Doors', 'Track Mode', 'Carbon Monocoque', 'Active Suspension'],
          color: 'Chicane Grey',
          interior: 'Carbon Black Alcantara',
          vin: 'SBM14SCA4LW123456',
          condition: 'Excellent',
          owners: 1,
          serviceHistory: 'McLaren dealer serviced',
          warranty: 'Extended warranty available',
          location: 'Mombasa Road'
        },
        {
          id: 7,
          name: 'Range Rover Autobiography',
          make: 'Range Rover',
          model: 'Autobiography',
          year: 2023,
          price: 159000,
          mileage: 800,
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
            acceleration: '4.4s 0-60',
            topSpeed: '155 mph',
            transmission: '8-speed automatic',
            drivetrain: 'AWD'
          },
          features: ['Executive Class Seats', 'Meridian Audio', 'Off-Road Package', 'Panoramic Roof'],
          color: 'Santorini Black',
          interior: 'Ebony Leather',
          vin: 'SALGS3EF0PA123456',
          condition: 'New',
          owners: 0,
          serviceHistory: 'New vehicle',
          warranty: 'Full factory warranty',
          location: 'Roysambu (next to TRM)'
        },
        {
          id: 8,
          name: 'Aston Martin DBS',
          make: 'Aston Martin',
          model: 'DBS Superleggera',
          year: 2022,
          price: 335000,
          mileage: 2100,
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
            acceleration: '3.2s 0-60',
            topSpeed: '211 mph',
            transmission: '8-speed automatic',
            drivetrain: 'RWD'
          },
          features: ['Carbon Fiber Body', 'Bang & Olufsen Audio', 'Sports Exhaust', 'Q Customization'],
          color: 'Q Xenon Grey',
          interior: 'Obsidian Black',
          vin: 'SCFRDMAZ8NGL12345',
          condition: 'Excellent',
          owners: 1,
          serviceHistory: 'Aston Martin dealer serviced',
          warranty: 'Remaining factory warranty',
          location: 'Mombasa Road'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = [...vehicles];

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(v => v.category === filters.category);
    }

    // Filter by make
    if (filters.make !== 'all') {
      filtered = filtered.filter(v => v.make.toLowerCase() === filters.make.toLowerCase());
    }

    // Filter by price range
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(v => v.price >= min && v.price <= max);
    }

    // Filter by year range
    if (filters.yearRange !== 'all') {
      const [min, max] = filters.yearRange.split('-').map(Number);
      filtered = filtered.filter(v => v.year >= min && v.year <= max);
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
      case 'year_desc':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'year_asc':
        filtered.sort((a, b) => a.year - b.year);
        break;
      case 'mileage_asc':
        filtered.sort((a, b) => a.mileage - b.mileage);
        break;
      default:
        // featured - featured first then newest
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.year - a.year;
        });
        break;
    }

    setFilteredVehicles(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetails(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInquirySubmit = (type) => {
    if (!selectedVehicle) return;
    const draft = {
      serviceType: 'sales',
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      listedPrice: selectedVehicle.price * 130,
      inquiryType: type,
      pickupLocation: 'roysambu-trm'
    };
    saveBookingDraft(draft);
    navigate(
      `${ROUTES.BOOKING}?service=sales&vehicle=${selectedVehicle.id}&inquiryType=${type}`,
      {
        state: { bookingPrefill: draft }
      }
    );
    addNotification('Complete your details to submit this inquiry.', 'info');
    setShowDetails(false);
  };

  const calculateFinancing = () => {
    if (!selectedVehicle) return null;

    const price = selectedVehicle.price;
    const downPaymentAmount = price * (financing.downPayment / 100);
    const loanAmount = price - downPaymentAmount;
    const monthlyRate = financing.interestRate / 100 / 12;
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, financing.term)) / 
      (Math.pow(1 + monthlyRate, financing.term) - 1);

    return {
      downPaymentAmount,
      loanAmount,
      monthlyPayment: monthlyPayment.toFixed(2),
      totalInterest: (monthlyPayment * financing.term - loanAmount).toFixed(2),
      totalPayments: (monthlyPayment * financing.term).toFixed(2)
    };
  };

  const makes = ['all', 'Lamborghini', 'Ferrari', 'Porsche', 'Rolls-Royce', 'Bentley', 'McLaren', 'Aston Martin', 'Range Rover'];
  const categories = ['all', 'supercar', 'luxury', 'sports', 'suv', 'grand_tourer'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-100000', label: 'Under $100k' },
    { value: '100000-200000', label: '$100k - $200k' },
    { value: '200000-300000', label: '$200k - $300k' },
    { value: '300000-400000', label: '$300k - $400k' },
    { value: '400000-999999', label: '$400k+' }
  ];
  const yearRanges = [
    { value: 'all', label: 'All Years' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2021-2022', label: '2021-2022' },
    { value: '2019-2020', label: '2019-2020' },
    { value: '2017-2018', label: '2017-2018' },
    { value: '2015-2016', label: '2015-2016' },
    { value: '2010-2014', label: '2010-2014' }
  ];
  const sortOptions = [
    { value: 'recommended', label: 'Featured' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'year_desc', label: 'Year: Newest First' },
    { value: 'year_asc', label: 'Year: Oldest First' },
    { value: 'mileage_asc', label: 'Mileage: Low to High' }
  ];

  const financingTerms = [36, 48, 60, 72];

  return (
    <div className="sales-page">
      {/* Hero Section */}
      <HeroSection
        title="Luxury Vehicle Sales"
        subtitle="Discover your dream car from our exclusive collection"
        ctaText="Browse Inventory"
        ctaLink="#inventory"
        secondaryCtaText="Why Buy From Us"
        secondaryCtaLink="#why-us"
        backgroundImage="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        alignment="center"
        fullHeight={false}
      />

      {/* Why Buy From Us Section */}
      <section className="why-buy-section" id="why-us">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHY CHOOSE US</span>
            <h2 className="section-title">The CAR EASE <span className="gold-text">Advantage</span></h2>
          </div>

          <div className="advantages-grid">
            <div className="advantage-card animate-fade-up animate-delay-1">
              <div className="advantage-icon">🔍</div>
              <h3 className="advantage-title">150-Point Inspection</h3>
              <p className="advantage-description">Every vehicle undergoes rigorous inspection by certified technicians</p>
            </div>

            <div className="advantage-card animate-fade-up animate-delay-2">
              <div className="advantage-icon">📋</div>
              <h3 className="advantage-title">Full History Report</h3>
              <p className="advantage-description">Comprehensive vehicle history reports included with every sale</p>
            </div>

            <div className="advantage-card animate-fade-up animate-delay-3">
              <div className="advantage-icon">🛡️</div>
              <h3 className="advantage-title">Warranty Included</h3>
              <p className="advantage-description">All vehicles come with comprehensive warranty coverage</p>
            </div>

            <div className="advantage-card animate-fade-up animate-delay-4">
              <div className="advantage-icon">💰</div>
              <h3 className="advantage-title">Financing Available</h3>
              <p className="advantage-description">Competitive rates and flexible terms through our partners</p>
            </div>

            <div className="advantage-card animate-fade-up animate-delay-5">
              <div className="advantage-icon">🚚</div>
              <h3 className="advantage-title">Worldwide Delivery</h3>
              <p className="advantage-description">Safe and insured delivery to your location</p>
            </div>

            <div className="advantage-card animate-fade-up animate-delay-6">
              <div className="advantage-icon">🤝</div>
              <h3 className="advantage-title">Trade-Ins Welcome</h3>
              <p className="advantage-description">Fair market value for your current vehicle</p>
            </div>
          </div>
        </div>
      </section>

      {/* Inventory Section */}
      <section className="inventory-section" id="inventory">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OUR INVENTORY</span>
            <h2 className="section-title">Featured <span className="gold-text">Vehicles</span></h2>
            <p className="section-description">
              Hand-picked luxury automobiles, each with verified history and certification
            </p>
          </div>

          {/* Filters */}
          <div className="inventory-filters">
            <div className="filter-group">
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...categories.filter(c => c !== 'all').map(c => ({ 
                    value: c, 
                    label: c.charAt(0).toUpperCase() + c.slice(1) 
                  }))
                ]}
                className="filter-select"
              />

              <Select
                value={filters.make}
                onChange={(e) => handleFilterChange('make', e.target.value)}
                options={makes.map(m => ({ value: m, label: m === 'all' ? 'All Makes' : m }))}
                className="filter-select"
              />

              <Select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                options={priceRanges}
                className="filter-select"
              />

              <Select
                value={filters.yearRange}
                onChange={(e) => handleFilterChange('yearRange', e.target.value)}
                options={yearRanges}
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
                  icon="🔍"
                  className="search-input"
                />
              </div>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  onClick={() => saveBookingDraft({
                    serviceType: 'sales',
                    inquiryType: 'vehicle_request',
                    pickupLocation: 'roysambu-trm'
                  })}
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
              <LoadingSpinner size="lg" color="gold" text="Loading inventory..." />
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
                  make: 'all',
                  priceRange: 'all',
                  yearRange: 'all',
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
                    onQuickView={() => handleViewDetails(vehicle)}
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

      {/* Vehicle Details Modal */}
      {showDetails && selectedVehicle && (
        <div className="vehicle-details-modal">
          <div className="modal-overlay" onClick={() => setShowDetails(false)}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowDetails(false)}>×</button>
            
            <div className="details-grid">
              {/* Images Section */}
              <div className="details-images">
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

              {/* Details Section */}
              <div className="details-info">
                <div className="vehicle-header">
                  <h2 className="vehicle-name">{selectedVehicle.name}</h2>
                  <p className="vehicle-year">{selectedVehicle.year}</p>
                </div>

                <div className="vehicle-price-tag">
                  <span className="price-amount">${selectedVehicle.price.toLocaleString()}</span>
                </div>

                <div className="vehicle-highlights">
                  <div className="highlight-item">
                    <span className="highlight-label">Mileage</span>
                    <span className="highlight-value">{selectedVehicle.mileage.toLocaleString()} miles</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-label">Condition</span>
                    <span className="highlight-value">{selectedVehicle.condition}</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-label">Owners</span>
                    <span className="highlight-value">{selectedVehicle.owners}</span>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-label">Location</span>
                    <span className="highlight-value">{selectedVehicle.location}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="details-tabs">
                  <input type="radio" name="details-tab" id="tab-specs" defaultChecked />
                  <label htmlFor="tab-specs" className="tab-label">Specifications</label>
                  
                  <input type="radio" name="details-tab" id="tab-features" />
                  <label htmlFor="tab-features" className="tab-label">Features</label>
                  
                  <input type="radio" name="details-tab" id="tab-history" />
                  <label htmlFor="tab-history" className="tab-label">History</label>
                  
                  <input type="radio" name="details-tab" id="tab-financing" />
                  <label htmlFor="tab-financing" className="tab-label">Financing</label>

                  <div className="tab-content" id="content-specs">
                    <div className="specs-grid">
                      {Object.entries(selectedVehicle.specs).map(([key, value]) => (
                        <div key={key} className="spec-item">
                          <span className="spec-key">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="spec-value">{value}</span>
                        </div>
                      ))}
                      <div className="spec-item">
                        <span className="spec-key">Color</span>
                        <span className="spec-value">{selectedVehicle.color}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-key">Interior</span>
                        <span className="spec-value">{selectedVehicle.interior}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-key">VIN</span>
                        <span className="spec-value vin">{selectedVehicle.vin}</span>
                      </div>
                    </div>
                  </div>

                  <div className="tab-content" id="content-features">
                    <ul className="features-list">
                      {selectedVehicle.features.map((feature, idx) => (
                        <li key={idx} className="feature-item">
                          <span className="feature-check">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="tab-content" id="content-history">
                    <div className="history-item">
                      <span className="history-label">Service History:</span>
                      <span className="history-value">{selectedVehicle.serviceHistory}</span>
                    </div>
                    <div className="history-item">
                      <span className="history-label">Warranty:</span>
                      <span className="history-value">{selectedVehicle.warranty}</span>
                    </div>
                    <div className="history-item">
                      <span className="history-label">Previous Owners:</span>
                      <span className="history-value">{selectedVehicle.owners}</span>
                    </div>
                    <div className="history-item">
                      <span className="history-label">Accident History:</span>
                      <span className="history-value">Clean Carfax</span>
                    </div>
                  </div>

                  <div className="tab-content" id="content-financing">
                    <div className="financing-calculator">
                      <h4 className="calculator-title">Estimate Your Payment</h4>
                      
                      <div className="calculator-row">
                        <label>Down Payment</label>
                        <div className="calculator-input">
                          <span className="input-prefix">%</span>
                          <input
                            type="number"
                            value={financing.downPayment}
                            onChange={(e) => setFinancing(prev => ({ 
                              ...prev, 
                              downPayment: Math.min(50, Math.max(0, parseInt(e.target.value) || 0))
                            }))}
                            min="0"
                            max="50"
                          />
                        </div>
                      </div>

                      <div className="calculator-row">
                        <label>Term (months)</label>
                        <select
                          value={financing.term}
                          onChange={(e) => setFinancing(prev => ({ ...prev, term: parseInt(e.target.value) }))}
                        >
                          {financingTerms.map(term => (
                            <option key={term} value={term}>{term} months</option>
                          ))}
                        </select>
                      </div>

                      <div className="calculator-row">
                        <label>Interest Rate (%)</label>
                        <div className="calculator-input">
                          <input
                            type="number"
                            value={financing.interestRate}
                            onChange={(e) => setFinancing(prev => ({ 
                              ...prev, 
                              interestRate: parseFloat(e.target.value) || 0
                            }))}
                            step="0.1"
                            min="0"
                            max="20"
                          />
                        </div>
                      </div>

                      {calculateFinancing() && (
                        <div className="calculator-results">
                          <div className="result-item">
                            <span>Down Payment:</span>
                            <span>${calculateFinancing().downPaymentAmount.toLocaleString()}</span>
                          </div>
                          <div className="result-item">
                            <span>Loan Amount:</span>
                            <span>${calculateFinancing().loanAmount.toLocaleString()}</span>
                          </div>
                          <div className="result-item highlight">
                            <span>Monthly Payment:</span>
                            <span>${calculateFinancing().monthlyPayment}</span>
                          </div>
                          <div className="result-item">
                            <span>Total Interest:</span>
                            <span>${calculateFinancing().totalInterest}</span>
                          </div>
                          <div className="result-item">
                            <span>Total Payments:</span>
                            <span>${calculateFinancing().totalPayments}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="vehicle-actions">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    fullWidth
                    onClick={() => handleInquirySubmit('purchase')}
                  >
                    Inquire About This Vehicle
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    fullWidth
                    onClick={() => handleInquirySubmit('test_drive')}
                  >
                    Schedule Test Drive
                  </Button>
                </div>

                <p className="vehicle-disclaimer">
                  *Price does not include tax, title, and license. Vehicle subject to prior sale.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="sales-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Not Finding What You're Looking For?</h2>
            <p className="cta-description">
              Let our specialists help you find the perfect vehicle
            </p>
            <div className="cta-buttons">
              <Link to={ROUTES.CONTACT}>
                <Button variant="primary" size="lg">
                  Contact a Specialist
                </Button>
              </Link>
              <Link
                to={`${ROUTES.BOOKING}?service=sales&inquiryType=vehicle_request`}
                state={{
                  bookingPrefill: {
                    serviceType: 'sales',
                    inquiryType: 'vehicle_request',
                    pickupLocation: 'roysambu-trm'
                  }
                }}
              >
                <Button variant="outline" size="lg">
                  Submit Vehicle Request
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sales;
