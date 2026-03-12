// ===== src/Pages/About.jsx =====
import React from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { APP_CONFIG, COMPANY_INFO } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';

// Styles
import '../Styles/About.css';

const About = () => {
  const team = [
    {
      id: 1,
      name: 'James Wilson',
      position: 'Founder & CEO',
      bio: 'Former automotive executive with 20+ years of experience in luxury vehicle markets. James founded CAR EASE with a vision to create the ultimate luxury automotive experience.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      id: 2,
      name: 'Sarah Chen',
      position: 'Chief Operating Officer',
      bio: 'Expert in luxury service operations and customer experience management. Sarah ensures that every client interaction exceeds expectations.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      id: 3,
      name: 'Michael Rodriguez',
      position: 'Head of Fleet Operations',
      bio: 'Passionate about exotic cars with 15 years in vehicle procurement and maintenance. Michael curates our exceptional vehicle collection.',
      image: 'https://randomuser.me/api/portraits/men/46.jpg',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      id: 4,
      name: 'Emma Thompson',
      position: 'Customer Experience Director',
      bio: 'Dedicated to providing white-glove service to our distinguished clientele. Emma leads our concierge team to deliver personalized experiences.',
      image: 'https://randomuser.me/api/portraits/women/63.jpg',
      social: { linkedin: '#', twitter: '#' }
    }
  ];

  const milestones = [
    { year: 2018, title: 'Company Founded', description: 'CAR EASE established in Roysambu (next to TRM) with a vision to transform luxury automotive services.' },
    { year: 2019, title: 'First Expansion', description: 'Opened Westlands location to serve Nairobi’s growing premium mobility market.' },
    { year: 2020, title: 'Luxury Rentals Launch', description: 'Introduced exotic car rentals with a fleet of premium supercars and luxury vehicles.' },
    { year: 2021, title: 'Service Expansion', description: 'Added professional detailing and certified repair services to our portfolio.' },
    { year: 2022, title: 'Upper Hill Showroom', description: 'Opened Upper Hill showroom to support corporate and executive clients.' },
    { year: 2023, title: '10,000+ Clients', description: 'Reached milestone of serving over 10,000 satisfied clients across all locations.' }
  ];

  const values = [
    {
      icon: '⭐',
      title: 'Excellence',
      description: 'We strive for perfection in every service we provide, leaving no detail overlooked.'
    },
    {
      icon: '🤝',
      title: 'Integrity',
      description: 'Honest, transparent, and ethical in all our dealings with clients and partners.'
    },
    {
      icon: '💎',
      title: 'Luxury',
      description: 'Providing premium experiences worthy of our discerning clientele.'
    },
    {
      icon: '❤️',
      title: 'Passion',
      description: 'Driven by genuine love for automobiles and dedication to service.'
    }
  ];

  const locations = [
    {
      city: 'Roysambu (next to TRM)',
      address: 'TRM Service Lane, Roysambu (next to TRM), Nairobi',
      phone: '0758458358',
      email: 'roysambu@carease.co.ke',
      hours: 'Mon-Sun: 9am - 8pm',
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      city: 'Westlands',
      address: 'Westlands Ring Road, Westlands, Nairobi',
      phone: '0758458358',
      email: 'westlands@carease.co.ke',
      hours: 'Mon-Sun: 10am - 7pm',
      image: 'https://images.unsplash.com/photo-1533106418989-8840c7ff8f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      city: 'Upper Hill',
      address: 'Upper Hill Road, Nairobi, Nairobi',
      phone: '0758458358',
      email: 'upperhill@carease.co.ke',
      hours: 'Mon-Fri: 9am - 8pm, Sat: 10am-6pm',
      image: 'https://images.unsplash.com/photo-1496582490289-5cff8c8f2672?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content animate-fade-up">
            <span className="hero-badge">EST. {APP_CONFIG.established}</span>
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
            <h2 className="hero-title">
              Redefining <span className="gold-text">Luxury</span> Automotive Service
            </h2>
            <p className="hero-subtitle">
              Since 2018, CAR EASE has been the premier destination for discerning 
              automotive enthusiasts seeking excellence in rentals, care, and sales.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">5+</span>
                <span className="stat-label">Locations</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Vehicles</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Clients</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-background">
          <div className="hero-particles"></div>
          <div className="hero-glow"></div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content animate-fade-right">
              <span className="section-subtitle">OUR STORY</span>
              <h2 className="section-title">A Passion for <span className="gold-text">Automotive Excellence</span></h2>
              <div className="story-text">
                <p>
                  CAR EASE was born from a simple observation: the luxury automotive market 
                  lacked a comprehensive service provider that could cater to every need of 
                  the discerning car enthusiast. From rentals to repairs, purchases to maintenance, 
                  clients had to navigate multiple vendors for their automotive needs.
                </p>
                <p>
                  Today, we've built the region's most comprehensive luxury automotive platform, 
                  serving clients from our flagship locations in Roysambu (next to TRM), Westlands, and Upper Hill, Nairobi. 
                  Our integrated approach means you can rent an exotic car today, have it detailed 
                  tomorrow, and purchase your dream vehicle next month - all with the same trusted partner.
                </p>
              </div>
              <div className="story-features">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Integrated Services</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Expert Team</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Premium Facilities</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Global Network</span>
                </div>
              </div>
            </div>
            
            <div className="story-image animate-fade-left">
              <div className="image-grid">
                <div className="grid-item grid-item-1"></div>
                <div className="grid-item grid-item-2"></div>
                <div className="grid-item grid-item-3"></div>
                <div className="grid-item grid-item-4"></div>
              </div>
              <div className="experience-badge">
                <span className="years">{new Date().getFullYear() - 2018}+</span>
                <span className="text">Years of Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHAT WE STAND FOR</span>
            <h2 className="section-title">Our Core <span className="gold-text">Values</span></h2>
            <p className="section-description">
              The principles that guide everything we do
            </p>
          </div>

          <div className="values-grid">
            {values.map((value, index) => (
              <Card key={index} variant="gradient" className={`value-card animate-fade-up animate-delay-${index + 1}`}>
                <div className="value-icon-wrapper">
                  <span className="value-icon">{value.icon}</span>
                  <div className="value-icon-glow"></div>
                </div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
                <div className="value-glow"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="milestones-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OUR JOURNEY</span>
            <h2 className="section-title">Key <span className="gold-text">Milestones</span></h2>
          </div>

          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-year">{milestone.year}</span>
                  <h3 className="timeline-title">{milestone.title}</h3>
                  <p className="timeline-description">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">MEET THE TEAM</span>
            <h2 className="section-title">Our <span className="gold-text">Leadership</span></h2>
            <p className="section-description">
              Experienced professionals dedicated to your satisfaction
            </p>
          </div>

          <div className="team-grid">
            {team.map((member, index) => (
              <Card key={member.id} className={`team-card animate-fade-up animate-delay-${index + 1}`}>
                <div className="team-image-wrapper">
                  <img src={member.image} alt={member.name} className="team-image" />
                  <div className="team-social">
                    <a href={member.social.linkedin} className="social-link" target="_blank" rel="noopener noreferrer">
                      <span className="social-icon">in</span>
                    </a>
                    <a href={member.social.twitter} className="social-link" target="_blank" rel="noopener noreferrer">
                      <span className="social-icon">𝕏</span>
                    </a>
                  </div>
                </div>
                <div className="team-info">
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-position">{member.position}</p>
                  <p className="team-bio">{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="locations-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">VISIT US</span>
            <h2 className="section-title">Our <span className="gold-text">Locations</span></h2>
            <p className="section-description">
              Experience our luxury service in person
            </p>
          </div>

          <div className="locations-grid">
            {locations.map((location, index) => (
              <Card key={index} className={`location-card animate-fade-up animate-delay-${index + 1}`}>
                <div className="location-image">
                  <img src={location.image} alt={location.city} />
                  <div className="location-overlay"></div>
                </div>
                <div className="location-content">
                  <h3 className="location-city">{location.city}</h3>
                  <p className="location-address">{location.address}</p>
                  <div className="location-details">
                    <div className="detail-item">
                      <span className="detail-icon">📞</span>
                      <a href={`tel:${location.phone}`}>{location.phone}</a>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">✉️</span>
                      <a href={`mailto:${location.email}`}>{location.email}</a>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🕒</span>
                      <span>{location.hours}</span>
                    </div>
                  </div>
                  <Link to={ROUTES.CONTACT} className="location-link">
                    <Button variant="outline" size="sm">Contact Location</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Experience the CAR EASE Difference</h2>
            <p className="cta-description">
              Join our community of discerning automotive enthusiasts today.
            </p>
            <div className="cta-buttons">
              <Link to={ROUTES.CONTACT}>
                <Button variant="primary" size="lg">
                  Contact Us
                </Button>
              </Link>
              <Link to={ROUTES.BOOKING}>
                <Button variant="outline" size="lg">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
