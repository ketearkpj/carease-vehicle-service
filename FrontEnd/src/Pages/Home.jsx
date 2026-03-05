// src/pages/Home.jsx
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Feature cards data
  const features = [
    {
      icon: '🚗',
      title: 'Premium Fleet',
      description: 'Access to the finest luxury vehicles from world-renowned manufacturers',
      stats: '500+ Vehicles',
      link: '/rentals'
    },
    {
      icon: '⭐',
      title: '5-Star Service',
      description: 'Exceptional customer experience with personalized concierge support',
      stats: '50k+ Clients',
      link: '/services'
    },
    {
      icon: '🔒',
      title: 'Secure Booking',
      description: 'Safe and encrypted transactions with instant confirmation',
      stats: '100% Secure',
      link: '/booking'
    },
    {
      icon: '⚡',
      title: '24/7 Support',
      description: 'Round-the-clock assistance for your peace of mind',
      stats: 'Always Available',
      link: '/contact'
    }
  ];

  // Quick stats data
  const stats = [
    { number: '500+', label: 'Luxury Vehicles', icon: '🚗' },
    { number: '50k+', label: 'Happy Clients', icon: '👤' },
    { number: '1000+', label: 'Services Daily', icon: '⚡' },
    { number: '98%', label: 'Satisfaction Rate', icon: '⭐' }
  ];

  return (
    <div className="home-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-master">
        {/* Advanced Background System */}
        <div className="hero-background">
          <div className="bg-grid"></div>
          <div className="bg-orb primary"></div>
          <div className="bg-orb secondary"></div>
          <div className="bg-orb tertiary"></div>
          <div className="bg-particles"></div>
          <div className="bg-light-leak"></div>
        </div>
        
        <div className="video-overlay"></div>
        
        {/* Hero Content with Parallax */}
        <div className="hero-inner" ref={heroRef}>
          <h3 className="gold-subtitle animate-fade-up">
            <span className="year-badge">EST. 2018</span>
          </h3>
          
          <h1 className="main-brand-title animate-fade-left">
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
          
          <div className="prestige-line animate-scale">
            <span className="gold-dot"></span>
          </div>
          
          <p className="master-description animate-fade-right">
            Experience the pinnacle of automotive luxury. From bespoke rentals 
            to elite maintenance, we provide a seamless journey for the driven 
            few who demand nothing but excellence.
          </p>
          
          {/* CTA Buttons */}
          <div className="cta-group animate-fade-up">
            <Link to="/services" className="btn-gold btn-lg btn-arrow">
              VIEW COLLECTION
            </Link>
            
            <Link to="/about" className="btn-outline btn-lg">
              OUR SERVICES
            </Link>
          </div>
        </div>

        {/* Feature Tray */}
        <div className="feature-tray">
          <div className="tray-item" onClick={() => navigate('/rentals')} role="button" tabIndex={0}>
            <span className="tray-number">01</span>
            <span className="tray-label">Exotic Fleet</span>
            <span className="tray-line"></span>
          </div>
          <div className="tray-item" onClick={() => navigate('/services')} role="button" tabIndex={0}>
            <span className="tray-number">02</span>
            <span className="tray-label">VIP Concierge</span>
            <span className="tray-line"></span>
          </div>
          <div className="tray-item" onClick={() => navigate('/about')} role="button" tabIndex={0}>
            <span className="tray-number">03</span>
            <span className="tray-label">Global Access</span>
            <span className="tray-line"></span>
          </div>
          <div className="tray-item" onClick={() => navigate('/contact')} role="button" tabIndex={0}>
            <span className="tray-number">04</span>
            <span className="tray-label">24/7 Support</span>
            <span className="tray-line"></span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator" onClick={scrollToFeatures}>
          <span className="scroll-text">DISCOVER</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section" ref={featuresRef}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHY CHOOSE US</span>
            <h2 className="section-title">
              The <span className="gold-text">CAR EASE</span> Experience
            </h2>
            <p className="section-description">
              Discover why discerning clients choose us for their automotive needs
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card"
                onClick={() => navigate(feature.link)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && navigate(feature.link)}
              >
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">{feature.icon}</span>
                  <div className="feature-icon-glow"></div>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-stats">{feature.stats}</div>
                <div className="feature-link">
                  Learn More <span className="feature-arrow">→</span>
                </div>
                <div className="feature-card-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-banner-content">
            <h2>Ready to Experience Excellence?</h2>
            <p>Join thousands of satisfied clients who trust CAR EASE for their luxury automotive needs.</p>
            <div className="cta-banner-buttons">
              <Link to="/services" className="btn-gold btn-lg">Get Started</Link>
              <Link to="/contact" className="btn-outline-light btn-lg">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;