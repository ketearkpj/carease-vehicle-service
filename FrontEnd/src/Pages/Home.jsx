// ===== src/Pages/Home.jsx =====
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { APP_CONFIG, SERVICE_TYPES } from '../Utils/constants';

// Common Components
import Button from '../Components/Common/Button';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import Card from '../Components/Common/Card';

// Feature Components
import ServiceCard from '../Components/Features/ServiceCard';
import VehicleCard from '../Components/Features/VehicleCard';

// Services
import { getFeaturedVehicles } from '../Services/VehicleService';
import { getServices } from '../Services/Service.Service';

// Hooks
import { useApp } from '../Context/AppContext';

// Styles
import '../Styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  const heroRef = useRef(null);
  const statsRef = useRef(null);

  const { addNotification } = useApp();

  // Feature highlights - replaced newsletter section
  const highlights = [
    {
      icon: '✨',
      title: 'Bespoke Experiences',
      description: 'Every journey is uniquely crafted to your preferences, from vehicle selection to personalized concierge service.',
      color: '#d4af37'
    },
    {
      icon: '🌍',
      title: 'Global Access',
      description: 'Access our premium fleet across multiple locations with seamless pickup and drop-off worldwide.',
      color: '#00ff88'
    },
    {
      icon: '👑',
      title: 'VIP Treatment',
      description: 'Enjoy priority booking, exclusive events, and white-glove service reserved for our distinguished clientele.',
      color: '#33b5e5'
    }
  ];

  const servicePillars = [
    {
      id: 'rental',
      title: 'Luxury Rentals',
      summary: 'Choose from premium fleets for weddings, executive travel, airport runs, and weekend escapes.',
      details: ['Daily and multi-day options', 'Pickup and delivery coordination', 'Quick route to booking and checkout'],
      route: ROUTES.RENTALS
    },
    {
      id: 'detailing',
      title: 'Car Wash & Detailing',
      summary: 'From express wash to full detailing and protective treatments for long-term finish quality.',
      details: ['Package and add-on selection', 'Slot-based scheduling', 'Straight-through booking experience'],
      route: ROUTES.CAR_WASH
    },
    {
      id: 'repair',
      title: 'Repairs & Maintenance',
      summary: 'Trusted diagnostics, maintenance, and corrective work with service reporting and follow-up.',
      details: ['Issue-based service intake', 'Urgent and planned visits', 'Support from booking to confirmation'],
      route: ROUTES.REPAIRS
    },
    {
      id: 'sales',
      title: 'Vehicle Sales',
      summary: 'Explore curated listings, submit inquiries, and move into test-drive or purchase discussions quickly.',
      details: ['Verified listing information', 'Inquiry and test-drive intent', 'Sales team follow-through'],
      route: ROUTES.SALES
    }
  ];

  const customerFlow = [
    {
      id: 1,
      title: 'Choose Your Service',
      description: 'Start from rentals, detailing, repairs, or sales and select what fits your immediate need.'
    },
    {
      id: 2,
      title: 'Share Your Preferences',
      description: 'Provide location, schedule, vehicle or service details so the booking is contextual and accurate.'
    },
    {
      id: 3,
      title: 'Confirm and Track',
      description: 'Complete booking and payment, then proceed with clear confirmation and support channels.'
    }
  ];

  // Stats data
  const stats = [
    { number: '500+', label: 'Luxury Vehicles', icon: '🚗' },
    { number: '50k+', label: 'Happy Clients', icon: '👤' },
    { number: '24/7', label: 'Concierge Support', icon: '⭐' },
    { number: '15+', label: 'Years Excellence', icon: '🏆' }
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'James Wilson',
      role: 'CEO, Tech Corp',
      content: 'The service at CAR EASE is unparalleled. I rented a Lamborghini for my wedding and the experience was flawless from start to finish.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Entrepreneur',
      content: 'Their detailing service is absolutely incredible. My Ferrari looks better than the day I bought it. Highly recommended!',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Investor',
      content: 'I\'ve been using CAR EASE for all my vehicle needs for years. Professional, reliable, and always exceeding expectations.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/75.jpg'
    }
  ];

  // Fetch data on mount
  useEffect(() => {
    fetchFeaturedVehicles();
    fetchServices();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Mouse move effect for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchFeaturedVehicles = async () => {
    setIsLoadingVehicles(true);
    try {
      const vehicles = await getFeaturedVehicles(3);
      const normalizedVehicles = Array.isArray(vehicles)
        ? vehicles
        : vehicles?.vehicles || vehicles?.data?.vehicles || [];
      setFeaturedVehicles(normalizedVehicles);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      // Fallback data - only 3 for better spacing
      setFeaturedVehicles([
        {
          id: 1,
          name: 'Lamborghini Huracán',
          price: 899,
          image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: 'Supercar',
          specs: ['V10', '610hp', '2.9s 0-60'],
          rating: 4.9,
          available: true
        },
        {
          id: 2,
          name: 'Rolls-Royce Ghost',
          price: 1299,
          image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: 'Luxury',
          specs: ['V12', '563hp', '4.6s 0-60'],
          rating: 5.0,
          available: true
        },
        {
          id: 3,
          name: 'Porsche 911 Turbo S',
          price: 749,
          image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          category: 'Sports',
          specs: ['6-Cyl', '640hp', '2.6s 0-60'],
          rating: 4.9,
          available: true
        }
      ]);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const fetchServices = async () => {
    setIsLoadingServices(true);
    try {
      const servicesData = await getServices({ featured: true });
      setServices(servicesData);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([
        {
          id: 'rentals',
          title: 'Luxury Rentals',
          description: 'Experience the finest collection of exotic and luxury vehicles.',
          icon: '🚗',
          path: ROUTES.RENTALS,
          features: ['Daily/Weekly Rates', 'Insurance Included', 'Free Delivery'],
          price: { amount: 899, period: 'day', currency: '$' },
          badge: 'Popular'
        },
        {
          id: 'car_wash',
          title: 'Car Wash & Detailing',
          description: 'Professional detailing and ceramic coating services.',
          icon: '🧼',
          path: ROUTES.CAR_WASH,
          features: ['Express Wash', 'Premium Detail', 'Ceramic Coating'],
          price: { amount: 79, period: 'service', currency: '$' },
          badge: 'Best Value'
        },
        {
          id: 'repairs',
          title: 'Repairs & Maintenance',
          description: 'Expert mechanical services for all luxury vehicles.',
          icon: '🔧',
          path: ROUTES.REPAIRS,
          features: ['Diagnostics', 'Performance Tuning', 'Genuine Parts'],
          price: { amount: 199, period: 'hour', currency: '$' },
          badge: 'Certified'
        },
        {
          id: 'sales',
          title: 'Vehicle Sales',
          description: 'Curated collection of pre-owned luxury automobiles.',
          icon: '💰',
          path: ROUTES.SALES,
          features: ['Financing', 'Vehicle History', 'Warranty'],
          price: { amount: 'Market', period: 'value', currency: '' },
          badge: 'Featured'
        }
      ]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const safeFeaturedVehicles = Array.isArray(featuredVehicles) ? featuredVehicles : [];

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>

      {/* ===== HERO SECTION - PERFECT WITH CAR EASE & 2018 ===== */}
      <section ref={heroRef} className="hero-elegant">
        {/* Background with parallax */}
        <div className="hero-backdrop" style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
        }}>
          <div className="backdrop-grid"></div>
          <div className="backdrop-orb primary"></div>
          <div className="backdrop-orb secondary"></div>
        </div>
        
        <div className="hero-overlay"></div>
        
        <div className="hero-container">
          <div className="hero-content-flow">
            {/* EST. 2018 Badge - Restored exactly as you wanted */}
            <div className="gold-subtitle">
              <span className="year-badge">EST. {APP_CONFIG.established}</span>
            </div>
            
            {/* CAR EASE Title - Restored exactly as you wanted */}
            <h1 className="main-brand-title">
              CAR<span className="gold-text" data-text="EASE">EASE</span>
              <div className="title-decoration">
                <div className="deco-line left"></div>
                <div className="deco-line right"></div>
                <div className="deco-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </h1>
            
            <p className="hero-description">
              Experience the pinnacle of automotive luxury with our exclusive collection 
              of hand-picked vehicles and white-glove services.
            </p>
            
            <div className="hero-actions-vertical">
              <Link to={ROUTES.SERVICES} className="hero-btn-primary">
                <span>View Collection</span>
                <span className="btn-arrow">→</span>
              </Link>
              <Link to={ROUTES.ABOUT} className="hero-btn-secondary">
                Discover Our Story
              </Link>
            </div>

            <div className="hero-stats-compact">
              {stats.slice(0, 2).map((stat, index) => (
                <div key={index} className="hero-stat-item">
                  <span className="hero-stat-number">{stat.number}</span>
                  <span className="hero-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
            
            {/* Experience Tray - Now with clickable items */}
            <div className="hero-feature-tray">
              <div className="tray-label">EXPERIENCES</div>
              <div className="tray-items">
                <span onClick={() => navigate(ROUTES.RENTALS)}>Rentals</span>
                <span onClick={() => navigate(ROUTES.CAR_WASH)}>Detailing</span>
                <span onClick={() => navigate(ROUTES.REPAIRS)}>Repairs</span>
                <span onClick={() => navigate(ROUTES.SALES)}>Sales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exotic Fleet Tray - Added exactly as you wanted, just after explore */}
        <div className="feature-tray">
          <div className="tray-item" onClick={() => navigate(ROUTES.RENTALS)}>
            <span className="tray-number">01</span>
            <span className="tray-label">Exotic Fleet</span>
            <span className="tray-line"></span>
          </div>
          <div className="tray-item" onClick={() => navigate(ROUTES.SERVICES)}>
            <span className="tray-number">02</span>
            <span className="tray-label">VIP Concierge</span>
            <span className="tray-line"></span>
          </div>
          <div className="tray-item" onClick={() => navigate(ROUTES.ABOUT)}>
            <span className="tray-number">03</span>
            <span className="tray-label">Global Access</span>
            <span className="tray-line"></span>
          </div>
          <div className="tray-item" onClick={() => navigate(ROUTES.CONTACT)}>
            <span className="tray-number">04</span>
            <span className="tray-label">24/7 Support</span>
            <span className="tray-line"></span>
          </div>
        </div>

        {/* Minimal Scroll Indicator */}
        <div className="scroll-minimal" onClick={() => scrollToSection(statsRef)}>
          <span className="scroll-minimal-text">Explore</span>
          <div className="scroll-minimal-line"></div>
        </div>
      </section>

      {/* ===== STATS BAR - CLEAN & MINIMAL ===== */}
      <section ref={statsRef} className="stats-bar">
        <div className="container">
          <div className="stats-bar-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stats-bar-item">
                <span className="stats-bar-number">{stat.number}</span>
                <span className="stats-bar-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pillars-section">
        <div className="container">
          <div className="section-header-elegant">
            <span className="section-tag">WHY CAR EASE</span>
            <h2 className="section-title-large">
              Built for <span className="gold-gradient">Complete Automotive Journeys</span>
            </h2>
            <p className="section-description-wide">
              CAR EASE is structured to cover end-to-end mobility, care, maintenance, and purchase needs from one platform.
            </p>
          </div>

          <div className="pillars-grid">
            {servicePillars.map((pillar) => (
              <article key={pillar.id} className="pillar-card">
                <h3>{pillar.title}</h3>
                <p>{pillar.summary}</p>
                <ul>
                  {pillar.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <Link to={pillar.route} className="pillar-link">
                  Explore {pillar.title}
                  <span>→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="customer-flow-section">
        <div className="container">
          <div className="section-header-elegant">
            <span className="section-tag">HOW IT WORKS</span>
            <h2 className="section-title-large">Three Steps to Get Started</h2>
          </div>
          <div className="customer-flow-grid">
            {customerFlow.map((step) => (
              <article key={step.id} className="customer-flow-card">
                <span className="flow-step-number">0{step.id}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES SECTION - VERTICAL LAYOUT ===== */}
      <section className="services-vertical">
        <div className="container">
          <div className="services-vertical-header">
            <span className="section-tag">WHAT WE OFFER</span>
            <h2 className="section-title-large">
              Curated <span className="gold-gradient">Services</span>
            </h2>
            <p className="section-description-wide">
              From exotic rentals to expert maintenance, each service is delivered 
              with the utmost attention to detail and luxury.
            </p>
          </div>

          {isLoadingServices ? (
            <div className="services-loading">
              <LoadingSpinner size="lg" color="gold" text="Loading services..." />
            </div>
          ) : (
            <div className="services-vertical-grid">
              {services.map((service, index) => (
                <div key={service.id} className="service-vertical-card">
                  <div className="service-vertical-icon">{service.icon}</div>
                  <div className="service-vertical-content">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <Link to={service.path} className="service-vertical-link">
                      Learn More <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="services-vertical-footer">
            <Link to={ROUTES.SERVICES}>
              <Button variant="outline" size="lg">
                Explore All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED VEHICLES - ELEGANT GRID ===== */}
      <section className="featured-vehicles-elegant">
        <div className="container">
          <div className="section-header-elegant">
            <span className="section-tag">THE FLEET</span>
            <h2 className="section-title-large">
              Featured <span className="gold-gradient">Vehicles</span>
            </h2>
          </div>

          {isLoadingVehicles ? (
            <div className="vehicles-loading">
              <LoadingSpinner size="lg" color="gold" text="Loading vehicles..." />
            </div>
          ) : (
            <>
              <div className="vehicles-grid-elegant">
                {safeFeaturedVehicles.map((vehicle, index) => (
                  <div key={vehicle.id} className="vehicle-elegant-card">
                    <div className="vehicle-elegant-image">
                      <img src={vehicle.image} alt={vehicle.name} />
                      <div className="vehicle-elegant-overlay">
                        <span className="vehicle-category">{vehicle.category}</span>
                      </div>
                    </div>
                    <div className="vehicle-elegant-info">
                      <h3>{vehicle.name}</h3>
                      <div className="vehicle-elegant-specs">
                        {(Array.isArray(vehicle.specs) ? vehicle.specs : Object.values(vehicle.specs || {})).slice(0, 2).map((spec, idx) => (
                          <span key={idx}>{spec}</span>
                        ))}
                      </div>
                      <div className="vehicle-elegant-price">
                        <span className="price-amount">${vehicle.price}</span>
                        <span className="price-period">/day</span>
                      </div>
                      <Link to={ROUTES.RENTALS} className="vehicle-elegant-link">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="vehicles-footer">
                <Link to={ROUTES.RENTALS}>
                  <Button variant="primary" size="lg">
                    Browse Full Collection
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== HIGHLIGHTS SECTION - REPLACED NEWSLETTER ===== */}
      <section className="highlights-section">
        <div className="container">
          <div className="highlights-intro">
            <span className="section-tag">SIGNATURE SERVICE</span>
            <h2 className="section-title-large">
              Crafted for <span className="gold-gradient">Exceptional</span> Expectations
            </h2>
            <p className="highlights-intro-copy">
              CarEase is designed around more than transport. Every touchpoint is shaped to feel seamless,
              elevated, and unmistakably premium from first inquiry to final handover.
            </p>
          </div>
          <div className="highlights-grid">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="highlight-card"
                style={{ '--highlight-accent': highlight.color }}
              >
                <div className="highlight-card-top">
                  <span className="highlight-index">0{index + 1}</span>
                  <div className="highlight-icon">
                    <span>{highlight.icon}</span>
                  </div>
                </div>
                <div className="highlight-copy">
                  <h3>{highlight.title}</h3>
                  <p>{highlight.description}</p>
                </div>
                <div className="highlight-footer-line"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS - ELEGANT SLIDER ===== */}
      <section className="testimonials-elegant">
        <div className="container">
          <div className="testimonials-elegant-content">
            <span className="section-tag">CLIENT VOICES</span>
            <h2 className="section-title-large">Trusted by <span className="gold-gradient">Discerning</span> Clients</h2>
            
            <div className="testimonials-elegant-slider">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`testimonial-elegant-card ${index === activeTestimonial ? 'active' : ''}`}
                >
                  <div className="testimonial-elegant-quote">"</div>
                  <p className="testimonial-elegant-text">{testimonial.content}</p>
                  <div className="testimonial-elegant-author">
                    <img src={testimonial.image} alt={testimonial.name} />
                    <div>
                      <h4>{testimonial.name}</h4>
                      <p>{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="testimonial-elegant-controls">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`testimonial-dot ${index === activeTestimonial ? 'active' : ''}`}
                    onClick={() => setActiveTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA - CLEAN & POWERFUL ===== */}
      <section className="final-cta">
        <div className="container">
          <div className="final-cta-content">
            <h2>Begin Your Journey</h2>
            <p>Experience the difference of true automotive luxury.</p>
            <div className="final-cta-actions">
              <Link to={ROUTES.RENTALS_FLOW}>
                <Button variant="primary" size="lg">
                  Start Service Flow
                </Button>
              </Link>
              <Link to={ROUTES.CONTACT}>
                <Button variant="outline" size="lg">
                  Contact Concierge
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
