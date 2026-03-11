// ===== src/Pages/Services.jsx =====
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { SERVICE_TYPES, SERVICE_CATEGORIES } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import ServiceCard from '../Components/Features/ServiceCard';

// Services
import { getServices } from '../Services/Service.Service';

// Hooks
import { useApp } from '../Context/AppContext';

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
  const [activeService, setActiveService] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const heroRef = useRef(null);
  const particlesRef = useRef(null);
  const { addNotification } = useApp();

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

  // Particle animation
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const particles = particlesRef.current.children;
    let time = 0;
    
    const animateParticles = () => {
      time += 0.002;
      
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const y = Math.sin(time + i) * 20;
        const x = Math.cos(time + i) * 20;
        particle.style.transform = `translate(${x}px, ${y}px)`;
      }
      
      requestAnimationFrame(animateParticles);
    };
    
    const animation = requestAnimationFrame(animateParticles);
    return () => cancelAnimationFrame(animation);
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
          priceRange: '$299 - $2,999/day',
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
          priceRange: '$29 - $399',
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
          priceRange: '$89 - $2,500',
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
          priceRange: '$45,000 - $350,000',
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
          priceRange: '$299 - $899/month',
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
        service.features?.some(f => f.toLowerCase().includes(query))
      );
    }

    setFilteredServices(filtered);
  };

  const categories = [
    { id: 'all', label: 'All Services', icon: '✨', gradient: 'linear-gradient(135deg, #d4af37, #f5d742)', description: 'Discover our complete collection' },
    { id: SERVICE_TYPES.RENTAL, label: 'Luxury Rentals', icon: '🚗', gradient: 'linear-gradient(135deg, #d4af37, #f5d742)', description: 'Exotic & luxury vehicles' },
    { id: SERVICE_TYPES.CAR_WASH, label: 'Car Wash', icon: '🧼', gradient: 'linear-gradient(135deg, #00ff88, #00cc66)', description: 'Professional detailing' },
    { id: SERVICE_TYPES.REPAIR, label: 'Repairs', icon: '🔧', gradient: 'linear-gradient(135deg, #33b5e5, #0099cc)', description: 'Expert maintenance' },
    { id: SERVICE_TYPES.SALES, label: 'Sales', icon: '💰', gradient: 'linear-gradient(135deg, #ffbb33, #ff8800)', description: 'Premium vehicle sales' },
    { id: 'concierge', label: 'Concierge', icon: '👔', gradient: 'linear-gradient(135deg, #aa80ff, #884dff)', description: 'White-glove service' },
    { id: 'storage', label: 'Storage', icon: '🏢', gradient: 'linear-gradient(135deg, #ff80ab, #ff4081)', description: 'Climate-controlled storage' }
  ];

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="services-page">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>

      {/* ===== CINEMATIC HERO SECTION ===== */}
      <section ref={heroRef} className="services-hero-cinematic">
        {/* 3D Parallax Layers */}
        <div className="parallax-layer layer-1" style={{
          transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`
        }}></div>
        <div className="parallax-layer layer-2" style={{
          transform: `translate3d(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px, 0)`
        }}></div>
        <div className="parallax-layer layer-3" style={{
          transform: `translate3d(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px, 0)`
        }}></div>

        {/* Animated Particle Field */}
        <div ref={particlesRef} className="particle-field">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              animationDelay: `${Math.random() * 5}s`,
              background: i % 3 === 0 ? 'var(--gold-primary)' : 
                         i % 3 === 1 ? 'rgba(255,255,255,0.5)' : 'rgba(212,175,55,0.3)'
            }}></div>
          ))}
        </div>

        {/* Light Leaks */}
        <div className="light-leak leak-1"></div>
        <div className="light-leak leak-2"></div>
        <div className="light-leak leak-3"></div>

        {/* Floating Orbs */}
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="floating-orb orb-4"></div>

        {/* Hero Content */}
        <div className="hero-content-container">
          <div className="hero-badge-wrapper">
            <span className="hero-badge">✦ PREMIUM SERVICES ✦</span>
            <div className="badge-glow"></div>
          </div>
          
          <h1 className="hero-title">
            <span className="title-line">Crafting</span>
            <span className="title-gradient">Automotive</span>
            <span className="title-line">Excellence</span>
          </h1>
          
          <div className="hero-description-wrapper">
            <p className="hero-description">
              Where precision meets passion. Each service is meticulously crafted 
              to exceed the expectations of the world's most discerning drivers.
            </p>
            <div className="description-glow"></div>
          </div>

          {/* Floating Stats Cards */}
          <div className="floating-stats">
            <div className="stat-card stat-1">
              <span className="stat-number">15+</span>
              <span className="stat-label">Years</span>
            </div>
            <div className="stat-card stat-2">
              <span className="stat-number">6</span>
              <span className="stat-label">Services</span>
            </div>
            <div className="stat-card stat-3">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>

          {/* CTA Buttons with 3D Effect */}
          <div className="hero-cta">
            <Link to={ROUTES.BOOKING} className="cta-primary">
              <span className="cta-text">Begin Journey</span>
              <span className="cta-arrow">→</span>
              <span className="cta-glow"></span>
            </Link>
            <Link to={ROUTES.CONTACT} className="cta-secondary">
              <span className="cta-text">Talk to Concierge</span>
              <span className="cta-glow"></span>
            </Link>
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

      {/* ===== IMMERSIVE CATEGORIES SECTION ===== */}
      <section className="categories-immersive">
        <div className="container">
          <div className="categories-header">
            <h2 className="categories-title">
              <span className="title-accent">✦</span>
              Explore by Category
              <span className="title-accent">✦</span>
            </h2>
            <p className="categories-subtitle">Navigate through our specialized services</p>
          </div>

          <div className="categories-carousel">
            {categories.map((category, index) => (
              <button
                key={category.id}
                className={`category-card-3d ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
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
                </div>
                <div className="card-glow"></div>
              </button>
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
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by service, feature, or description..."
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
                    onMouseEnter={() => setActiveService(service.id)}
                    onMouseLeave={() => setActiveService(null)}
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
                      linkTo={`${ROUTES.SERVICES}/${service.id}`}
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
                      <Link to={`${ROUTES.SERVICES}/${service.id}`} className="showcase-link">
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