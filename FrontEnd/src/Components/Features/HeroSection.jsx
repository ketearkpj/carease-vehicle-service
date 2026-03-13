// ===== src/Components/Features/HeroSection.jsx =====
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../Common/Button';
import { APP_CONFIG } from '../../Utils/constants';

const HeroSection = ({
  title = 'Experience Luxury on Wheels',
  subtitle = 'Premium car rentals, wash, repairs & sales',
  ctaText = 'Explore Services',
  ctaLink = '/services',
  secondaryCtaText = 'Book Now',
  secondaryCtaLink = '/booking',
  backgroundImage,
  backgroundVideo,
  fullHeight = true,
  alignment = 'center',
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (Array.isArray(backgroundImage) && backgroundImage.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % backgroundImage.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [backgroundImage]);

  const getAlignmentClass = () => {
    switch (alignment) {
      case 'left': return 'hero-left';
      case 'right': return 'hero-right';
      default: return 'hero-center';
    }
  };

  const scrollToSection = (targetId) => {
    if (!targetId || !targetId.startsWith('#')) return;
    const section = document.querySelector(targetId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderCta = (text, link, variant = 'primary', withArrow = false) => {
    if (link?.startsWith('#')) {
      return (
        <Button variant={variant} size="lg" onClick={() => scrollToSection(link)}>
          {text}
          {withArrow && <span className="btn-arrow">→</span>}
        </Button>
      );
    }

    return (
      <Link to={link}>
        <Button variant={variant} size="lg">
          {text}
          {withArrow && <span className="btn-arrow">→</span>}
        </Button>
      </Link>
    );
  };

  const renderBackground = () => {
    if (backgroundVideo) {
      return (
        <div className="hero-background-video">
          <video
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            className={isVideoLoaded ? 'loaded' : 'loading'}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
          <div className="hero-video-overlay"></div>
        </div>
      );
    }

    if (Array.isArray(backgroundImage)) {
      return (
        <div className="hero-background-slideshow">
          {backgroundImage.map((img, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            >
              <div className="hero-slide-overlay"></div>
            </div>
          ))}
        </div>
      );
    }

    if (backgroundImage) {
      return (
        <div
          className="hero-background-image"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="hero-image-overlay"></div>
        </div>
      );
    }

    return (
      <div className="hero-background-gradient">
        <div className="gradient-particles"></div>
        <div className="gradient-orb"></div>
      </div>
    );
  };

  return (
    <section
      className={`hero-section ${fullHeight ? 'hero-full-height' : ''} ${getAlignmentClass()} ${className}`}
      {...props}
    >
      {renderBackground()}

      <div className="hero-particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
      </div>

      <div className="hero-glow"></div>

      <div className="hero-container">
        <div className={`hero-content ${isVisible ? 'animate-in' : ''}`}>
          <div className="hero-badge">EST. {APP_CONFIG.established}</div>
          
          <h1 className="hero-brand-title">
            CAR<span className="gold-text" data-text="EASE">EASE</span>
            <div className="hero-title-decoration">
              <div className="hero-deco-line"></div>
              <div className="hero-deco-line"></div>
              <div className="hero-deco-dots">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </h1>

          <h2 className="hero-title">{title}</h2>
          
          <p className="hero-subtitle">{subtitle}</p>
          
          <div className="hero-cta">
            {renderCta(ctaText, ctaLink, 'primary', true)}
            {renderCta(secondaryCtaText, secondaryCtaLink, 'outline')}
          </div>

          <div className="hero-stats">
            <div className="hero-stat-item">
              <span className="hero-stat-value">500+</span>
              <span className="hero-stat-label">Luxury Cars</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">Support</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-value">15+</span>
              <span className="hero-stat-label">Years</span>
            </div>
          </div>

          <div className="scroll-indicator">
            <span className="scroll-text">Scroll</span>
            <span className="scroll-line"></span>
          </div>
        </div>
      </div>

      <div className="hero-bottom-gradient"></div>
    </section>
  );
};

export default HeroSection;
