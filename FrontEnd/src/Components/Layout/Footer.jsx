// ===== src/Components/Layout/Footer.jsx =====
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../Config/Routes';
import { subscribeToNewsletter, unsubscribeFromNewsletter } from '../../Services/EmailService';
import '../../Styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to show/hide scroll top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const socialLinks = [
    { 
      icon: '📘', 
      url: 'https://facebook.com/carease', 
      label: 'Facebook',
      svg: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z'
    },
    { 
      icon: '🐦', 
      url: 'https://twitter.com/carease', 
      label: 'Twitter',
      svg: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.765-3.784c.48-.955.857-1.97 1.126-3.022.269-1.053.403-2.156.403-3.265 0-.5-.011-.997-.032-1.492a10.04 10.04 0 002.46-2.548l-.047-.02z'
    },
    { 
      icon: '📷', 
      url: 'https://instagram.com/carease', 
      label: 'Instagram',
      svg: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z'
    },
    { 
      icon: '💼', 
      url: 'https://linkedin.com/company/carease', 
      label: 'LinkedIn',
      svg: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
    }
  ];

  const quickLinks = [
    { path: ROUTES.SERVICES, label: 'Services' },
    { path: ROUTES.ABOUT, label: 'About Us' },
    { path: ROUTES.CONTACT, label: 'Contact' },
    { path: ROUTES.RENTALS_FLOW, label: 'Start Rental Flow' }
  ];

  const supportLinks = [
    { path: '/faq', label: 'FAQ' },
    { path: '/terms', label: 'Terms' },
    { path: '/privacy', label: 'Privacy' },
    { path: ROUTES.CONTACT, label: '24/7 Support' }
  ];

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    setSubscribeStatus(null);

    try {
      const result = await subscribeToNewsletter(email);
      setSubscribeStatus({
        type: 'success',
        message: result?.message || 'Thank you for subscribing!'
      });
      setEmail('');
      setTimeout(() => setSubscribeStatus(null), 5000);
    } catch (error) {
      setSubscribeStatus({
        type: 'error',
        message: error?.message || 'Subscription failed'
      });
      setTimeout(() => setSubscribeStatus(null), 5000);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleNewsletterUnsubscribe = async () => {
    if (!email) return;

    setIsSubscribing(true);
    setSubscribeStatus(null);

    try {
      const result = await unsubscribeFromNewsletter(email);
      setSubscribeStatus({
        type: 'success',
        message: result?.message || 'Unsubscribed successfully'
      });
      setEmail('');
      setTimeout(() => setSubscribeStatus(null), 5000);
    } catch (error) {
      setSubscribeStatus({
        type: 'error',
        message: error?.message || 'Unsubscribe failed'
      });
      setTimeout(() => setSubscribeStatus(null), 5000);
    } finally {
      setIsSubscribing(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      {/* Premium Animated Background */}
      <div className="footer-gradient"></div>
      <div className="footer-overlay"></div>
      
      {/* Animated Particles */}
      <div className="footer-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Floating Gold Orbs */}
      <div className="footer-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-section brand">
              <Link to="/" className="footer-logo" onClick={scrollToTop}>
                <span className="logo-text">CAR<span className="gold-text">EASE</span></span>
                <span className="logo-glow"></span>
              </Link>
              <p className="footer-description">
                Experience the pinnacle of automotive luxury. From bespoke rentals 
                to elite maintenance, we provide a seamless journey for the driven.
              </p>
              
              {/* Social Links with Premium Effects */}
              <div className="footer-social-grid">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`footer-social-link footer-social-link-${social.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    aria-label={social.label}
                    style={{ '--social-delay': `${index * 0.1}s` }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d={social.svg} />
                    </svg>
                    <span className="footer-social-tooltip">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links with Animated Underlines */}
            <div className="footer-section">
              <h4 className="footer-heading">
                <span className="heading-text">Quick Links</span>
                <span className="heading-line"></span>
              </h4>
              <ul className="footer-links">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} onClick={scrollToTop}>
                      <span className="link-text">{link.label}</span>
                      <span className="link-glow"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support with Animated Icons */}
            <div className="footer-section">
              <h4 className="footer-heading">
                <span className="heading-text">Support</span>
                <span className="heading-line"></span>
              </h4>
              <ul className="footer-links">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} onClick={scrollToTop}>
                      <span className="link-text">{link.label}</span>
                      <span className="link-glow"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info with Animated Icons */}
            <div className="footer-section">
              <h4 className="footer-heading">
                <span className="heading-text">Contact</span>
                <span className="heading-line"></span>
              </h4>
              <ul className="footer-contact">
                <li>
                  <span className="contact-icon">📍</span>
                  <span className="contact-text">Roysambu, Nairobi (next to TRM)</span>
                </li>
                <li>
                  <span className="contact-icon">📞</span>
                  <a href="tel:0758458358" className="contact-text">0758458358</a>
                </li>
                <li>
                  <span className="contact-icon">✉️</span>
                  <a href="mailto:concierge@carease.co.ke" className="contact-text">concierge@carease.co.ke</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Premium Newsletter Section */}
          <div className="footer-newsletter-premium">
            <div className="newsletter-glow"></div>
            <div className="newsletter-content">
              <div className="newsletter-text">
                <h4 className="newsletter-title">Join the Community</h4>
                <p className="newsletter-subtitle">Get exclusive offers & updates</p>
              </div>
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <div className="newsletter-input-wrapper">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input"
                    required
                    disabled={isSubscribing}
                  />
                  <span className="input-focus-glow"></span>
                </div>
                <div className="newsletter-actions">
                  <button 
                    type="submit" 
                    className="newsletter-btn"
                    disabled={isSubscribing || !email}
                  >
                    {isSubscribing ? (
                      <span className="btn-loader"></span>
                    ) : (
                      <>
                        <span className="btn-text">Subscribe</span>
                        <span className="btn-arrow">→</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="newsletter-btn newsletter-btn-secondary"
                    disabled={isSubscribing || !email}
                    onClick={handleNewsletterUnsubscribe}
                  >
                    <span className="btn-text">Unsubscribe</span>
                  </button>
                </div>
              </form>
              {subscribeStatus?.type === 'success' && (
                <div className="newsletter-message success">
                  <span className="message-icon">✓</span>
                  <span>{subscribeStatus.message}</span>
                </div>
              )}
              {subscribeStatus?.type === 'error' && (
                <div className="newsletter-message error">
                  <span className="message-icon">⚠️</span>
                  <span>{subscribeStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Premium Badges */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} <span className="copyright-gold">CAR EASE</span>. All rights reserved.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">
                <span className="badge-icon">⚡</span>
                <span className="badge-text">EST. 2018</span>
                <span className="badge-glow"></span>
              </span>
              <span className="footer-badge">
                <span className="badge-icon">⭐</span>
                <span className="badge-text">LUXURY</span>
                <span className="badge-glow"></span>
              </span>
              <span className="footer-badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">SECURE</span>
                <span className="badge-glow"></span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Scroll to Top Button with Premium Effects */}
      <div className="scroll-top-container">
        <button 
          className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <span className="arrow-up">↑</span>
          <span className="btn-ring"></span>
          <span className="btn-ring-2"></span>
          <span className="btn-glow"></span>
        </button>
        <span className="scroll-top-text">Back to Top</span>
      </div>
    </footer>
  );
};

export default Footer;
