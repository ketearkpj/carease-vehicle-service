import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/CarEaselogo.jpeg'; // Add your logo image
import '../../Styles/Layout.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo - Click to go home */}
          <Link to="/" className="logoHolder" onClick={() => window.scrollTo(0, 0)}>
            <img src={logo} alt="CAR EASE" className="nav-logo" />
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation Links */}
          <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <ul className="nav-links">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={`nav-link ${isActive(link.path)}`}
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="nav-actions">
              <Link to="/admin-login" className="admin-btn">
                Admin
              </Link>
              <Link to="/booking" className="btn-primary">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="navbar-spacer"></div>
    </>
  );
};

export default Navbar;