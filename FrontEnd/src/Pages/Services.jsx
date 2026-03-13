// ===== src/Pages/Services.jsx =====
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { APP_CONFIG, SERVICE_TYPES } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import ServiceCard from '../Components/Features/ServiceCard';

// Services
import { getServices } from '../Services/Service.Service';

// Styles
import '../Styles/Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const heroRef = useRef(null);
  // Mouse move effect for 3D parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
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

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, activeCategory, searchQuery]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      // Premium fallback data
      setServices([
        {
          id: 'rentals',
          title: 'Luxury Rentals',
          description: 'Experience the finest collection of exotic and luxury vehicles. Choose from our curated fleet of supercars, luxury sedans, and premium SUVs.',
          longDescription: 'Our luxury rental service offers an unparalleled driving experience. Each vehicle in our fleet is meticulously maintained and less than 2 years old. Choose from daily, weekly, or monthly rentals with flexible pickup and drop-off options.',
          icon: '🚗',
          image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          features: ['Daily/Weekly Rates', 'Chauffeur Option', 'Insurance Included', 'Free Delivery', '24/7 Support'],
          priceRange: 'KSh 38,900 - KSh 389,900/day',
          category: SERVICE_TYPES.RENTAL,
          popular: true,
          gradient: 'linear-gradient(135deg, #d4af37, #f5d742)',
          lightEffect: 'radial-gradient(circle at 30% 30%, rgba(212,175,55,0.4) 0%, transparent 70%)'
        },
        {
          id: 'car_wash',
          title: 'Car Wash & Detailing',
          description: 'Professional detailing and ceramic coating services to keep your vehicle in pristine condition.',
          longDescription: 'Our premium car wash and detailing services go beyond the ordinary. Using only the finest products and techniques, we ensure your vehicle receives the care it deserves. From express washes to complete ceramic coating protection.',
          icon: '🧼',
          image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          features: ['Express Wash', 'Premium Detail', 'Ceramic Coating', 'Interior Cleaning', 'Paint Correction'],
          priceRange: 'KSh 3,500 - KSh 49,900',
          category: SERVICE_TYPES.CAR_WASH,
          popular: true,
          gradient: 'linear-gradient(135deg, #00ff88, #00cc66)',
          lightEffect: 'radial-gradient(circle at 70% 40%, rgba(0,255,136,0.3) 0%, transparent 70%)'
        },
        {
          id: 'repairs',
          title: 'Repairs & Maintenance',
          description: 'Expert mechanical services for all luxury vehicles with certified technicians.',
          longDescription: 'Our state-of-the-art service center is equipped to handle all makes and models of luxury vehicles. From routine maintenance to complex repairs, our certified technicians use only genuine parts and the latest diagnostic equipment.',
          icon: '🔧',
          image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          features: ['Diagnostics', 'Performance Tuning', 'Factory Repairs', 'Genuine Parts', 'Warranty'],
          priceRange: 'KSh 8,500 - KSh 325,000',
          category: SERVICE_TYPES.REPAIR,
          gradient: 'linear-gradient(135deg, #33b5e5, #0099cc)',
          lightEffect: 'radial-gradient(circle at 40% 60%, rgba(51,181,229,0.3) 0%, transparent 70%)'
        },
        {
          id: 'sales',
          title: 'Vehicle Sales',
          description: 'Curated collection of pre-owned luxury automobiles with full history and warranty.',
          longDescription: 'Discover your dream car from our exclusive collection of pre-owned luxury vehicles. Each vehicle undergoes a rigorous 150-point inspection and comes with a comprehensive warranty. We also offer financing options and trade-ins.',
          icon: '💰',
          image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          features: ['Financing Options', 'Vehicle History', 'Warranty Included', 'Trade-ins', 'Nationwide Delivery'],
          priceRange: 'KSh 5,850,000 - KSh 45,500,000',
          category: SERVICE_TYPES.SALES,
          gradient: 'linear-gradient(135deg, #ffbb33, #ff8800)',
          lightEffect: 'radial-gradient(circle at 60% 30%, rgba(255,187,51,0.3) 0%, transparent 70%)'
        },
        {
          id: 'concierge',
          title: 'Concierge Service',
          description: 'Personalized automotive concierge for all your vehicle needs.',
          longDescription: 'Our white-glove concierge service handles everything from vehicle registration to maintenance scheduling. Let us take care of the details while you enjoy the luxury of hassle-free ownership.',
          icon: '👔',
          image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          features: ['Registration', 'Maintenance Scheduling', 'Insurance Management', 'Vehicle Sourcing', 'Event Planning'],
          priceRange: 'Custom Pricing',
          category: 'concierge',
          gradient: 'linear-gradient(135deg, #aa80ff, #884dff)',
          lightEffect: 'radial-gradient(circle at 50% 50%, rgba(170,128,255,0.3) 0%, transparent 70%)'
        },
        {
          id: 'storage',
          title: 'Vehicle Storage',
          description: 'Secure, climate-controlled storage for your luxury vehicles.',
          longDescription: 'Our state-of-the-art storage facility offers the ultimate protection for your prized possessions. With 24/7 security, climate control, and regular maintenance checks, your vehicle is in safe hands.',
          icon: '🏢',
          image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          features: ['Climate Controlled', '24/7 Security', 'Regular Maintenance', 'Vehicle Transport', 'Insurance Included'],
          priceRange: 'KSh 38,900 - KSh 116,900/month',
          category: 'storage',
          gradient: 'linear-gradient(135deg, #ff80ab, #ff4081)',
          lightEffect: 'radial-gradient(circle at 30% 70%, rgba(255,128,171,0.3) 0%, transparent 70%)'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(service => service.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.longDescription?.toLowerCase().includes(query) ||
        service.features?.some(f => f.toLowerCase().includes(query)) ||
        getServiceSearchKeywords(service).some((keyword) => keyword.toLowerCase().includes(query)) ||
        categories.some((category) =>
          category.id === (service.category || service.id) &&
          (
            category.label.toLowerCase().includes(query) ||
            category.description.toLowerCase().includes(query)
          )
        ) ||
        kenyaServiceJourneys.some((journey) =>
          journey.id === service.category &&
          (
            journey.title.toLowerCase().includes(query) ||
            journey.description.toLowerCase().includes(query)
          )
        ) ||
        serviceBlueprints.some((blueprint) =>
          blueprint.id === service.category &&
          (
            blueprint.title.toLowerCase().includes(query) ||
            blueprint.audience.toLowerCase().includes(query) ||
            blueprint.outcome.toLowerCase().includes(query) ||
            blueprint.inclusions.some((item) => item.toLowerCase().includes(query))
          )
        )
      );
    }

    setFilteredServices(filtered);
  };

  const categories = [
    {
      id: 'all',
      label: 'All Services',
      icon: '✨',
      gradient: 'linear-gradient(135deg, #d4af37, #f5d742)',
      description: 'Discover our complete service network',
      ctaLabel: 'Browse All'
    },
    {
      id: SERVICE_TYPES.RENTAL,
      label: 'Luxury Rentals',
      icon: '🚗',
      gradient: 'linear-gradient(135deg, #d4af37, #f5d742)',
      description: 'Exotic and luxury vehicles with flexible booking',
      route: ROUTES.RENTALS,
      ctaLabel: 'Open Rentals'
    },
    {
      id: SERVICE_TYPES.CAR_WASH,
      label: 'Car Wash',
      icon: '🧼',
      gradient: 'linear-gradient(135deg, #00ff88, #00cc66)',
      description: 'Express detailing, deep clean, and coating packages',
      route: ROUTES.CAR_WASH,
      ctaLabel: 'Open Car Wash'
    },
    {
      id: SERVICE_TYPES.REPAIR,
      label: 'Repairs',
      icon: '🔧',
      gradient: 'linear-gradient(135deg, #33b5e5, #0099cc)',
      description: 'Diagnostics, mechanical fixes, and scheduled maintenance',
      route: ROUTES.REPAIRS,
      ctaLabel: 'Open Repairs'
    },
    {
      id: SERVICE_TYPES.SALES,
      label: 'Sales',
      icon: '💰',
      gradient: 'linear-gradient(135deg, #ffbb33, #ff8800)',
      description: 'Verified premium stock with inquiry and test-drive flow',
      route: ROUTES.SALES,
      ctaLabel: 'Open Sales'
    },
    {
      id: 'concierge',
      label: 'Concierge',
      icon: '👔',
      gradient: 'linear-gradient(135deg, #aa80ff, #884dff)',
      description: 'White-glove planning for premium automotive requests',
      route: ROUTES.CONTACT,
      ctaLabel: 'Request Concierge'
    },
    {
      id: 'storage',
      label: 'Storage',
      icon: '🏢',
      gradient: 'linear-gradient(135deg, #ff80ab, #ff4081)',
      description: 'Climate-controlled secure storage and handling',
      route: ROUTES.CONTACT,
      ctaLabel: 'Request Storage'
    }
  ];

  const serviceHighlights = [
    {
      id: 'transparent-pricing',
      title: 'Transparent Pricing Paths',
      description: 'From first selection to checkout, pricing context stays visible so decisions are clear before payment.'
    },
    {
      id: 'single-flow',
      title: 'Single Booking Flow',
      description: 'Rentals, detailing, repairs, and sales inquiries all connect into one booking architecture.'
    },
    {
      id: 'concierge-support',
      title: 'Concierge-Backed Support',
      description: 'Need priority support or a custom request? Concierge channels stay accessible across services.'
    }
  ];

  const serviceBlueprints = [
    {
      id: SERVICE_TYPES.RENTAL,
      title: 'Rental Architecture',
      icon: '🚗',
      audience: 'For executives, events, weddings, and travel convenience',
      outcome: 'Book a premium car with transparent package and delivery options',
      route: ROUTES.RENTALS,
      cta: 'Go To Rentals',
      inclusions: ['Category filters and availability', 'Vehicle-level booking handoff', 'Checkout-ready pricing context']
    },
    {
      id: SERVICE_TYPES.CAR_WASH,
      title: 'Detailing Architecture',
      icon: '🧼',
      audience: 'For routine care, restoration, and protection',
      outcome: 'Choose wash package, slot, and add-ons in a single flow',
      route: ROUTES.CAR_WASH,
      cta: 'Go To Car Wash',
      inclusions: ['Package-based choices', 'Preferred schedule selection', 'Booking and payment continuity']
    },
    {
      id: SERVICE_TYPES.REPAIR,
      title: 'Repair Architecture',
      icon: '🔧',
      audience: 'For urgent fixes and preventive maintenance',
      outcome: 'Submit issue context and move directly into service booking',
      route: ROUTES.REPAIRS,
      cta: 'Go To Repairs',
      inclusions: ['Diagnostics and issue categories', 'Urgent vs scheduled requests', 'Structured service checkout']
    },
    {
      id: SERVICE_TYPES.SALES,
      title: 'Sales Architecture',
      icon: '💰',
      audience: 'For buyers seeking verified premium inventory',
      outcome: 'Explore vehicles and send informed purchase or test-drive requests',
      route: ROUTES.SALES,
      cta: 'Go To Sales',
      inclusions: ['Inventory browsing and details', 'Inquiry and test-drive intent', 'Direct route to next action']
    }
  ];

  const kenyaServiceJourneys = [
    {
      id: SERVICE_TYPES.RENTAL,
      title: 'Luxury Rentals in Nairobi',
      description: 'Reserve premium rides for weddings, executive travel, or weekend escapes with pickup in Roysambu (next to TRM), Westlands, and CBD.',
      link: ROUTES.RENTALS
    },
    {
      id: SERVICE_TYPES.CAR_WASH,
      title: 'Detailing & Car Wash',
      description: 'Choose express, premium, or ceramic packages with add-ons and preferred slots, then complete payment in one flow.',
      link: ROUTES.CAR_WASH
    },
    {
      id: SERVICE_TYPES.REPAIR,
      title: 'Repairs & Diagnostics',
      description: 'Book diagnostics and repair services with vehicle details, issue notes, urgent handling, and a structured checkout experience.',
      link: ROUTES.REPAIRS
    },
    {
      id: SERVICE_TYPES.SALES,
      title: 'Vehicle Sales & Inquiries',
      description: 'Browse stock, submit purchase inquiry or test-drive request, and carry selected vehicle details into booking and payment.',
      link: ROUTES.SALES
    }
  ];

  const platformSearchIndex = [
    { id: 'nav-services', title: 'All Services', description: 'Browse every service vertical in one place.', route: ROUTES.SERVICES, tags: ['services', 'all', 'overview', 'carease'] },
    { id: 'nav-rentals', title: 'Luxury Rentals', description: 'Premium fleet selection and rental booking.', route: ROUTES.RENTALS, tags: ['rental', 'rentals', 'fleet', 'supercar', 'luxury'] },
    { id: 'nav-wash', title: 'Car Wash & Detailing', description: 'Detailing packages and wash scheduling.', route: ROUTES.CAR_WASH, tags: ['car wash', 'detailing', 'ceramic', 'cleaning'] },
    { id: 'nav-repairs', title: 'Repairs & Diagnostics', description: 'Mechanical service and maintenance workflows.', route: ROUTES.REPAIRS, tags: ['repair', 'repairs', 'diagnostics', 'maintenance'] },
    { id: 'nav-sales', title: 'Vehicle Sales & Test Drives', description: 'Inventory browsing, inquiries, and test-drive requests.', route: ROUTES.SALES, tags: ['sales', 'buy', 'purchase', 'test drive', 'inventory'] },
    { id: 'nav-booking', title: 'Booking Flow', description: 'Complete your selected service in one booking journey.', route: ROUTES.BOOKING, tags: ['booking', 'checkout', 'reserve', 'schedule'] },
    { id: 'nav-contact', title: 'Concierge & Contact', description: 'Talk to the team for tailored support and custom requests.', route: ROUTES.CONTACT, tags: ['contact', 'concierge', 'support', 'help'] },
    { id: 'nav-about', title: 'About CAR EASE', description: 'Learn the brand story, values, and service standards.', route: ROUTES.ABOUT, tags: ['about', 'carease', 'company', 'story'] }
  ];

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const normalizeText = (value) => (value || '').toString().toLowerCase();

  const getServiceSearchKeywords = (service) => {
    const routeKeywords = {
      [SERVICE_TYPES.RENTAL]: ['rental', 'rentals', 'fleet', 'supercar', 'executive', 'chauffeur'],
      [SERVICE_TYPES.CAR_WASH]: ['wash', 'detailing', 'car wash', 'ceramic', 'interior'],
      [SERVICE_TYPES.REPAIR]: ['repair', 'repairs', 'diagnostics', 'maintenance', 'service center'],
      [SERVICE_TYPES.SALES]: ['sales', 'purchase', 'buy', 'inventory', 'test drive']
    };
    const categoryKey = service.category || service.id;
    return routeKeywords[categoryKey] || [];
  };

  const getServiceLink = (service) => {
    if (service.category === SERVICE_TYPES.RENTAL || service.id === 'rentals') return ROUTES.RENTALS;
    if (service.category === SERVICE_TYPES.CAR_WASH || service.id === 'car_wash') return ROUTES.CAR_WASH;
    if (service.category === SERVICE_TYPES.REPAIR || service.id === 'repairs') return ROUTES.REPAIRS;
    if (service.category === SERVICE_TYPES.SALES || service.id === 'sales') return ROUTES.SALES;
    return `${ROUTES.BOOKING}?service=${encodeURIComponent(service.category || service.id || '')}`;
  };

  const getCategoryRoute = (categoryId) => {
    const selectedCategory = categories.find((category) => category.id === categoryId);
    return selectedCategory?.route || null;
  };

  const platformSearchResults = searchQuery.trim()
    ? platformSearchIndex.filter((item) => {
        const query = normalizeText(searchQuery.trim());
        return (
          normalizeText(item.title).includes(query) ||
          normalizeText(item.description).includes(query) ||
          item.tags.some((tag) => normalizeText(tag).includes(query))
        );
      })
    : [];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="services-page">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>

      {/* ===== CINEMATIC HERO SECTION ===== */}
      <section ref={heroRef} className="services-hero-cinematic">
        <div className="services-hero-backdrop" style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
        }}>
          <div className="services-backdrop-grid"></div>
          <div className="services-backdrop-orb primary"></div>
          <div className="services-backdrop-orb secondary"></div>
        </div>

        <div className="services-hero-overlay"></div>

        {/* Hero Content */}
        <div className="hero-content-container">
          <div className="services-hero-flow">
            <div className="hero-badge-wrapper">
              <span className="hero-badge">EST. {APP_CONFIG.established}</span>
              <div className="badge-glow"></div>
            </div>

            <h1 className="services-main-title">
              CAR<span className="services-gold-text" data-text="EASE">EASE</span>
              <div className="services-title-decoration">
                <div className="services-deco-line"></div>
                <div className="services-deco-line"></div>
                <div className="services-deco-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </h1>

            <p className="services-main-description">
              Explore a complete premium service stack for rentals, detailing, repairs,
              sales, and concierge support, with clear navigation into each workflow.
            </p>

            <div className="hero-cta services-cta">
              <Link to={ROUTES.SERVICES} className="cta-primary">
                <span className="cta-text">Explore Services</span>
                <span className="cta-arrow">→</span>
                <span className="cta-glow"></span>
              </Link>
              <Link to={ROUTES.BOOKING} className="cta-secondary">
                <span className="cta-text">Start Booking</span>
                <span className="cta-glow"></span>
              </Link>
            </div>

            <div className="services-hero-stats">
              <div className="services-hero-stat">
                <span className="services-stat-number">6</span>
                <span className="services-stat-label">Service Lines</span>
              </div>
              <div className="services-hero-stat">
                <span className="services-stat-number">24/7</span>
                <span className="services-stat-label">Client Support</span>
              </div>
              <div className="services-hero-stat">
                <span className="services-stat-number">1</span>
                <span className="services-stat-label">Unified Flow</span>
              </div>
            </div>

            <div className="services-hero-links">
              <Link to={ROUTES.RENTALS}>Rentals</Link>
              <Link to={ROUTES.CAR_WASH}>Detailing</Link>
              <Link to={ROUTES.REPAIRS}>Repairs</Link>
              <Link to={ROUTES.SALES}>Sales</Link>
              <Link to={ROUTES.CONTACT}>Concierge</Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator-premium">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span className="scroll-text">Discover Services</span>
        </div>
      </section>

      <section className="services-value-pillars">
        <div className="container">
          <div className="value-pillars-grid">
            {serviceHighlights.map((pillar) => (
              <article key={pillar.id} className="value-pillar-card">
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== IMMERSIVE CATEGORIES SECTION ===== */}
      <section className="categories-immersive">
        <div className="container">
          <div className="categories-header">
            <h2 className="categories-title">
              <span className="title-accent">✦</span>
              Explore by Category
              <span className="title-accent">✦</span>
            </h2>
            <p className="categories-subtitle">Navigate by service line and jump straight to each destination</p>
          </div>

          <div className="categories-carousel">
            {categories.map((category, index) => (
              <article
                key={category.id}
                className={`category-card-3d ${activeCategory === category.id ? 'active' : ''}`}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  '--gradient': category.gradient,
                  transform: hoveredCategory === category.id ? 'translateY(-10px) rotateY(5deg)' : 'none',
                  transitionDelay: `${index * 0.05}s`
                }}
              >
                <div className="card-front">
                  <span className="category-icon-large">{category.icon}</span>
                  <span className="category-label-large">{category.label}</span>
                  <span className="category-description">{category.description}</span>
                  <div className="category-card-actions">
                    {getCategoryRoute(category.id) ? (
                      <Link to={getCategoryRoute(category.id)} className="category-route-link">
                        {category.ctaLabel}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="category-route-link"
                        onClick={() => handleCategoryChange('all')}
                      >
                        {category.ctaLabel}
                      </button>
                    )}
                    <button
                      type="button"
                      className="category-preview-btn"
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      Preview Here
                    </button>
                  </div>
                </div>
                <div className="card-glow"></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="service-blueprints">
        <div className="container">
          <div className="blueprints-header">
            <h2 className="blueprints-title">Service Architecture Hub</h2>
            <p className="blueprints-subtitle">
              Each vertical has a purpose, a clear workflow, and a direct path to action.
            </p>
          </div>

          <div className="blueprints-grid">
            {serviceBlueprints.map((blueprint) => (
              <article key={blueprint.id} className="blueprint-card">
                <div className="blueprint-icon">{blueprint.icon}</div>
                <h3>{blueprint.title}</h3>
                <p className="blueprint-audience">{blueprint.audience}</p>
                <p className="blueprint-outcome">{blueprint.outcome}</p>
                <ul className="blueprint-list">
                  {blueprint.inclusions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link to={blueprint.route} className="blueprint-link">
                  {blueprint.cta}
                  <span className="link-arrow">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SEARCH SECTION ===== */}
      <section className="search-section-premium">
        <div className="container">
          <div className="search-container-premium">
            <form onSubmit={handleSearch} className="search-form-premium">
              <div className="search-wrapper-premium">
                <input
                  type="text"
                  placeholder="Search services, booking, concierge, test drives, repairs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-premium"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="search-clear-premium"
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </button>
                )}
                <div className="search-focus-glow"></div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {searchQuery.trim() && (
        <section className="platform-search-results">
          <div className="container">
            <div className="platform-search-header">
              <h3>CAR EASE Search Results</h3>
              <p>Quick links across services, booking, and support pages related to your search.</p>
            </div>

            {platformSearchResults.length > 0 ? (
              <div className="platform-search-grid">
                {platformSearchResults.map((item) => (
                  <Link key={item.id} to={item.route} className="platform-search-card">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <span>Open Page →</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="platform-search-empty">
                <p>No direct page matches yet. Try searching by service type, booking, concierge, or test drive.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== SERVICES GRID SECTION ===== */}
      <section className="services-grid-section-premium">
        <div className="container">
          {loading ? (
            <div className="services-loading">
              <LoadingSpinner size="lg" color="gold" text="Curating experiences..." />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="no-results-premium">
              <div className="no-results-icon">✨</div>
              <h3>No Services Found</h3>
              <p>Try adjusting your filters or explore other categories</p>
              <Button 
                variant="primary" 
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="services-grid-premium">
                {filteredServices.map((service, index) => (
                  <div 
                    key={service.id} 
                    className="service-card-container"
                    style={{ 
                      '--delay': `${index * 0.1}s`,
                      '--gradient': service.gradient,
                      '--light-effect': service.lightEffect
                    }}
                  >
                    <ServiceCard
                      id={service.id}
                      title={service.title}
                      description={service.longDescription || service.description}
                      icon={service.icon}
                      image={service.image}
                      features={service.features}
                      price={service.priceRange ? { amount: service.priceRange } : null}
                      badge={service.popular ? 'Popular' : null}
                      linkTo={getServiceLink(service)}
                      variant="premium"
                    />
                    <div className="card-background-glow"></div>
                  </div>
                ))}
              </div>

              {/* Results Count */}
              <div className="results-count-premium">
                <span className="count-number">{filteredServices.length}</span>
                <span className="count-text">exceptional services</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== POPULAR SERVICES SHOWCASE ===== */}
      {!loading && filteredServices.length > 0 && filteredServices.some(s => s.popular) && (
        <section className="popular-showcase">
          <div className="container">
            <div className="showcase-header">
              <span className="showcase-tag">✦ MOST REQUESTED ✦</span>
              <h2 className="showcase-title">Client Favorites</h2>
              <p className="showcase-description">Experience our most sought-after services</p>
            </div>

            <div className="showcase-grid">
              {filteredServices.filter(s => s.popular).slice(0, 3).map((service, index) => (
                <div 
                  key={service.id} 
                  className="showcase-card"
                  style={{ 
                    '--delay': `${index * 0.2}s`,
                    '--gradient': service.gradient 
                  }}
                >
                  <div className="showcase-card-inner">
                    <div className="showcase-image">
                      <img src={service.image} alt={service.title} />
                      <div className="image-overlay"></div>
                    </div>
                    <div className="showcase-content">
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                      <div className="showcase-features">
                        {service.features.slice(0, 3).map((feature, idx) => (
                          <span key={idx} className="feature-tag">{feature}</span>
                        ))}
                      </div>
                      <Link to={getServiceLink(service)} className="showcase-link">
                        Discover Experience
                        <span className="link-arrow">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== SERVICE JOURNEYS ===== */}
      <section className="experience-timeline">
        <div className="container">
          <div className="timeline-header">
            <h2 className="timeline-title">How Services Move from Selection to Checkout</h2>
            <p className="timeline-subtitle">Each service line below shows a practical path from discovery to confirmed action.</p>
          </div>

          <div className="timeline-grid">
            {kenyaServiceJourneys.map((journey) => (
              <div key={journey.id} className="timeline-item">
                <div className="timeline-year">✓</div>
                <div className="timeline-content">
                  <h4>{journey.title}</h4>
                  <p>{journey.description}</p>
                  <Link to={journey.link} className="showcase-link">
                    Open Service
                    <span className="link-arrow">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EXPERIENCE TIMELINE ===== */}
      <section className="experience-timeline">
        <div className="container">
          <div className="timeline-header">
            <h2 className="timeline-title">The CAR EASE Journey</h2>
            <p className="timeline-subtitle">From vision to excellence</p>
          </div>

          <div className="timeline-grid">
            <div className="timeline-item">
              <div className="timeline-year">2018</div>
              <div className="timeline-content">
                <h4>Foundation</h4>
                <p>CAR EASE established with a vision to redefine luxury automotive services</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2020</div>
              <div className="timeline-content">
                <h4>Expansion</h4>
                <p>Launched nationwide services with fleet expansion</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2022</div>
              <div className="timeline-content">
                <h4>Innovation</h4>
                <p>Introduced concierge and storage services</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2024</div>
              <div className="timeline-content">
                <h4>Excellence</h4>
                <p>Serving over 10,000 distinguished clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CINEMATIC CTA ===== */}
      <section className="cinematic-cta">
        <div className="cta-background">
          <div className="cta-grid"></div>
          <div className="cta-particles"></div>
        </div>
        
        <div className="container">
          <div className="cta-content-cinematic">
            <h2 className="cta-title-cinematic">
              <span className="title-word">Begin</span>
              <span className="title-word gold">Your</span>
              <span className="title-word">Journey</span>
            </h2>
            <p className="cta-description-cinematic">
              Let our concierge team craft a personalized experience tailored to your desires
            </p>
            <div className="cta-actions-cinematic">
              <Link to={ROUTES.CONTACT} className="cta-primary-cinematic">
                <span>Contact Concierge</span>
                <span className="cta-arrow">→</span>
              </Link>
              <Link to={ROUTES.BOOKING} className="cta-secondary-cinematic">
                <span>Book Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <button 
        className={`back-to-top-premium ${scrollProgress > 30 ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <span className="arrow-up">↑</span>
        <span className="btn-ring"></span>
        <span className="btn-ring-2"></span>
      </button>
    </div>
  );
};

export default Services;
