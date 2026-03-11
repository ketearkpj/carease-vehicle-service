// ===== src/Components/Layout/NavBar.jsx =====
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Core imports
import { ROUTES } from '../../Config/Routes';
import { APP_CONFIG } from '../../Utils/constants';
import Button from '../Common/Button';
import logo from '../../assets/CarEaselogo.jpeg';

// Style imports
import '../../Styles/NavBar.css';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  
  const location = useLocation();
  const dropdownRef = useRef(null);
  const navbarRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Handle scroll effect with throttle
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > 50);
        timeoutId = null;
      }, 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsServicesDropdownOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsServicesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsServicesDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const isServicesActive = () => {
    const servicePaths = [
      ROUTES.SERVICES,
      ROUTES.RENTALS,
      ROUTES.CAR_WASH,
      ROUTES.REPAIRS,
      ROUTES.SALES
    ];
    return servicePaths.includes(location.pathname) ? 'active' : '';
  };

  const serviceLinks = [
    { path: ROUTES.RENTALS, label: 'Luxury Rentals', icon: '🚗', description: 'Exotic & luxury vehicles' },
    { path: ROUTES.CAR_WASH, label: 'Car Wash', icon: '🧼', description: 'Professional detailing' },
    { path: ROUTES.REPAIRS, label: 'Repairs', icon: '🔧', description: 'Expert maintenance' },
    { path: ROUTES.SALES, label: 'Sales', icon: '💰', description: 'Premium vehicles for sale' }
  ];

  const navLinks = [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.SERVICES, label: 'Services' },
    { path: ROUTES.ABOUT, label: 'About' },
    { path: ROUTES.CONTACT, label: 'Contact' }
  ];

  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsServicesDropdownOpen(true);
  };

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsServicesDropdownOpen(false);
    }, 200);
  };

  // Handle dropdown item click
  const handleDropdownItemClick = () => {
    setIsServicesDropdownOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <nav 
        ref={navbarRef}
        className={`navbar ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Background Effects */}
        <div className="navbar-bg"></div>
        <div className="navbar-glow"></div>
        <div className="navbar-particles"></div>

        <div className="navbar-container">
          {/* Logo */}
          <Link 
            to={ROUTES.HOME} 
            className="navbar-logo" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label={`${APP_CONFIG.name} Home`}
          >
            <img 
              src={logo} 
              alt={APP_CONFIG.name} 
              className="logo-image"
              loading="eager"
            />
            <span className="logo-text">CAR<span className="gold-text">EASE</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <ul className="nav-links">
              {navLinks.map((link) => (
                <li key={link.path} className="nav-item">
                  {link.label === 'Services' ? (
                    <div 
                      className="dropdown-container"
                      ref={dropdownRef}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Services Link - Now clickable */}
                      <Link
                        to={ROUTES.SERVICES}
                        className={`nav-link ${isServicesActive()}`}
                        onClick={() => window.scrollTo(0, 0)}
                      >
                        {link.label}
                        <span className={`dropdown-arrow ${isServicesDropdownOpen ? 'open' : ''}`}>▼</span>
                      </Link>

                      {/* Services Dropdown */}
                      <div className={`services-dropdown ${isServicesDropdownOpen ? 'active' : ''}`}>
                        {serviceLinks.map((service) => (
                          <Link
                            key={service.path}
                            to={service.path}
                            className={`dropdown-item ${isActive(service.path)}`}
                            onClick={handleDropdownItemClick}
                          >
                            <span className="dropdown-item-icon">{service.icon}</span>
                            <div className="dropdown-item-content">
                              <span className="dropdown-item-title">{service.label}</span>
                              <span className="dropdown-item-description">{service.description}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link 
                      to={link.path} 
                      className={`nav-link ${isActive(link.path)}`}
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Actions */}
          <div className="desktop-actions">
            <Link to={ROUTES.ADMIN_LOGIN} className="admin-link">
              Admin
            </Link>
            <Link to={ROUTES.BOOKING}>
              <Button variant="primary" size="md">
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Mobile Navigation Menu */}
          <div 
            id="mobile-navigation"
            className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}
          >
            <div className="mobile-menu-header">
              <img src={logo} alt={APP_CONFIG.name} className="mobile-logo" />
              <button 
                className="mobile-menu-close"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ×
              </button>
            </div>

            <ul className="mobile-nav-links">
              {navLinks.map((link) => (
                <li key={link.path} className="mobile-nav-item">
                  {link.label === 'Services' ? (
                    <>
                      <Link
                        to={ROUTES.SERVICES}
                        className={`mobile-nav-link ${isServicesActive()}`}
                        onClick={() => {
                          window.scrollTo(0, 0);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {link.label}
                      </Link>
                      
                      <button
                        className="mobile-services-toggle"
                        onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                      >
                        <span className={`toggle-arrow ${isServicesDropdownOpen ? 'open' : ''}`}>▼</span>
                      </button>

                      {isServicesDropdownOpen && (
                        <div className="mobile-services">
                          {serviceLinks.map((service) => (
                            <Link
                              key={service.path}
                              to={service.path}
                              className={`mobile-service-item ${isActive(service.path)}`}
                              onClick={() => {
                                window.scrollTo(0, 0);
                                setIsServicesDropdownOpen(false);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <span className="service-icon">{service.icon}</span>
                              <span className="service-label">{service.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link 
                      to={link.path} 
                      className={`mobile-nav-link ${isActive(link.path)}`}
                      onClick={() => {
                        window.scrollTo(0, 0);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="mobile-actions">
              <Link to={ROUTES.ADMIN_LOGIN} className="mobile-admin-link">
                Admin
              </Link>
              <Link to={ROUTES.BOOKING} className="mobile-book-btn">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Spacer */}
      <div className="navbar-spacer"></div>
    </>
  );
};

export default NavBar;