import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/About.css';

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const team = [
    {
      name: 'Johnathan Pierce',
      role: 'Founder & CEO',
      bio: 'Former automotive executive with 20 years of experience in luxury vehicle management. Founded CAR EASE with a vision to revolutionize the luxury automotive service industry.',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      social: { 
        linkedin: 'https://linkedin.com/in/johnathanpierce',
        twitter: 'https://twitter.com/johnathanpierce'
      }
    },
    {
      name: 'Victoria Chen',
      role: 'Head of Operations',
      bio: 'Ensures every customer interaction exceeds expectations with meticulous attention to detail. Previously managed operations for multiple luxury brands.',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
      social: { 
        linkedin: 'https://linkedin.com/in/victoriachen',
        twitter: 'https://twitter.com/victoriachen'
      }
    },
    {
      name: 'Marcus Williams',
      role: 'Fleet Director',
      bio: 'Curates our exclusive collection of premium vehicles from around the world. Expert in luxury and exotic automobiles with 15 years of experience.',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
      social: { 
        linkedin: 'https://linkedin.com/in/marcuswilliams',
        twitter: 'https://twitter.com/marcuswilliams'
      }
    },
    {
      name: 'Isabella Rossi',
      role: 'Customer Experience',
      bio: 'Dedicated to providing white-glove service to our discerning clientele. Ensures every journey with CAR EASE is memorable and seamless.',
      image: 'https://randomuser.me/api/portraits/women/4.jpg',
      social: { 
        linkedin: 'https://linkedin.com/in/isabellarossi',
        twitter: 'https://twitter.com/isabellarossi'
      }
    }
  ];

  const milestones = [
    { year: '2018', event: 'CAR EASE founded in Beverly Hills', description: 'Opened our flagship showroom with just 12 luxury vehicles.' },
    { year: '2019', event: 'Launched luxury rental program', description: 'Expanded services to include short-term and long-term rentals.' },
    { year: '2020', event: 'Expanded to Miami and New York', description: 'Opened locations in Miami Beach and Manhattan.' },
    { year: '2021', event: 'Introduced concierge services', description: 'Launched 24/7 concierge support for all clients.' },
    { year: '2022', event: 'Added premium car wash & detailing', description: 'Opened state-of-the-art detailing facilities.' },
    { year: '2023', event: 'Launched certified pre-owned sales', description: 'Introduced rigorous certification program for pre-owned vehicles.' }
  ];

  const values = [
    {
      icon: '👑',
      title: 'Excellence',
      description: 'We never compromise on quality. Every vehicle, every service, every interaction meets the highest standards of luxury and precision.'
    },
    {
      icon: '🤝',
      title: 'Integrity',
      description: 'Honest pricing, transparent processes, and ethical business practices form the foundation of everything we do.'
    },
    {
      icon: '⚡',
      title: 'Innovation',
      description: 'Constantly evolving to provide cutting-edge solutions for modern automotive needs in a rapidly changing world.'
    },
    {
      icon: '❤️',
      title: 'Passion',
      description: 'Our team lives and breathes automotive excellence, sharing their expertise and enthusiasm with every client.'
    }
  ];

  const services = [
    {
      id: 'rentals',
      icon: '🚗',
      title: 'Luxury Car Rentals',
      description: 'Access our exclusive fleet of premium vehicles, from exotic supercars to luxury sedans. Perfect for any occasion.',
      features: ['Unlimited Mileage', 'Insurance Included', '24/7 Support'],
      link: '/rentals',
      color: '#d4af37'
    },
    {
      id: 'sales',
      icon: '💰',
      title: 'Premium Car Sales',
      description: 'Discover hand-selected pre-owned luxury vehicles, each thoroughly inspected and certified for your peace of mind.',
      features: ['Certified Pre-Owned', 'Financing Available', 'Vehicle History Reports'],
      link: '/sales',
      color: '#00ff88'
    },
    {
      id: 'wash',
      icon: '🧼',
      title: 'Elite Car Wash',
      description: 'Experience the pinnacle of automotive care with our premium hand wash, ceramic coating, and detailing services.',
      features: ['Eco-Friendly Products', 'Mobile Service', 'Satisfaction Guaranteed'],
      link: '/car-wash',
      color: '#33b5e5'
    },
    {
      id: 'repairs',
      icon: '🔧',
      title: 'Expert Maintenance',
      description: 'Factory-trained technicians using genuine parts for routine maintenance and complex repairs.',
      features: ['Certified Mechanics', 'Genuine Parts', 'Warranty Included'],
      link: '/repairs',
      color: '#ffbb33'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-bg"></div>
        <div className="about-hero-content">
          <h1 className="about-hero-title animate-fade-up">
            About <span className="gold-text">CAR EASE</span>
          </h1>
          <p className="about-hero-description animate-fade-up">
            Redefining luxury automotive experiences since 2018
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content animate-fade-left">
              <span className="section-subtitle">OUR STORY</span>
              <h2 className="section-title">
                The Pursuit of <span className="gold-text">Automotive Excellence</span>
              </h2>
              <p className="story-text">
                CAR EASE was born from a simple observation: the luxury automotive experience was fragmented and inconsistent. 
                Founded in 2018 by automotive enthusiast Johnathan Pierce, our mission was to create a seamless, premium ecosystem 
                for every vehicle need - from rentals to repairs, sales to services.
              </p>
              <p className="story-text">
                What started as a small showroom in Beverly Hills with just 12 vehicles has grown into a premier destination 
                for automotive luxury, serving thousands of discerning clients across the nation. Our commitment to excellence 
                remains unwavering, with every vehicle hand-selected, every service meticulously performed, and every interaction 
                crafted to exceed expectations.
              </p>
              <div className="story-stats">
                <div className="story-stat">
                  <span className="stat-number">7+</span>
                  <span className="stat-label">Years of Excellence</span>
                </div>
                <div className="story-stat">
                  <span className="stat-number">50k+</span>
                  <span className="stat-label">Happy Clients</span>
                </div>
                <div className="story-stat">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Luxury Vehicles</span>
                </div>
                <div className="story-stat">
                  <span className="stat-number">3</span>
                  <span className="stat-label">Prime Locations</span>
                </div>
              </div>
            </div>
            <div className="story-image animate-fade-right">
              <img 
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800" 
                alt="Luxury Showroom"
              />
              <div className="story-image-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="services-showcase">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHAT WE OFFER</span>
            <h2 className="section-title">
              Our Premium <span className="gold-text">Services</span>
            </h2>
            <p className="section-description">
              Discover our comprehensive range of luxury automotive services
            </p>
          </div>

          <div className="services-showcase-grid">
            {services.map((service, index) => (
              <div 
                key={service.id}
                className="service-showcase-card"
                onClick={() => navigate(service.link)}
                style={{ '--card-color': service.color }}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && navigate(service.link)}
              >
                <div className="service-showcase-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p className="service-showcase-description">{service.description}</p>
                <ul className="service-showcase-features">
                  {service.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
                <div className="service-showcase-link">
                  Learn More <span className="link-arrow">→</span>
                </div>
                <div className="service-showcase-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OUR VALUES</span>
            <h2 className="section-title">
              What We Stand <span className="gold-text">For</span>
            </h2>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="milestones-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">JOURNEY</span>
            <h2 className="section-title">
              Our <span className="gold-text">Milestones</span>
            </h2>
          </div>
          <div className="milestones-timeline">
            {milestones.map((milestone, index) => (
              <div key={index} className="milestone-item">
                <div className="milestone-year">{milestone.year}</div>
                <div className="milestone-dot"></div>
                <div className="milestone-content">
                  <h3>{milestone.event}</h3>
                  <p>{milestone.description}</p>
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
            <span className="section-subtitle">LEADERSHIP</span>
            <h2 className="section-title">
              Meet Our <span className="gold-text">Team</span>
            </h2>
            <p className="section-description">
              Passionate experts dedicated to your automotive journey
            </p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                  <div className="team-social">
                    <a 
                      href={member.social.linkedin}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-icon"
                      aria-label="LinkedIn"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a 
                      href={member.social.twitter}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-icon"
                      aria-label="Twitter"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.765-3.784c.48-.955.857-1.97 1.126-3.022.269-1.053.403-2.156.403-3.265 0-.5-.011-.997-.032-1.492a10.04 10.04 0 002.46-2.548l-.047-.02z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Experience the CAR EASE Difference</h2>
            <p>Join thousands of satisfied clients who trust us with their automotive needs.</p>
            <div className="cta-buttons">
              <Link to="/services" className="btn-gold">Explore All Services</Link>
              <Link to="/contact" className="btn-outline">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;