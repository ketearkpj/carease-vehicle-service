import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Services.css';

const Services = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      id: 'rentals',
      icon: '🚗',
      title: 'Luxury Car Rentals',
      subtitle: 'EXOTIC FLEET',
      shortDescription: 'Access our exclusive fleet of premium vehicles, from exotic supercars to luxury sedans.',
      description: 'Experience the thrill of driving the world\'s finest automobiles with our premium rental service. Whether you need a sophisticated sedan for business, a powerful SUV for a family getaway, or an exotic supercar for a special occasion, we have the perfect vehicle for you.',
      longDescription: 'Our rental fleet consists of meticulously maintained vehicles from the world\'s most prestigious manufacturers. Each car undergoes rigorous inspection before every rental to ensure peak performance and safety. With flexible rental periods, comprehensive insurance coverage, and 24/7 roadside assistance, we provide a seamless and luxurious experience from start to finish.',
      badge: 'Starting $199/day',
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
      features: [
        'Unlimited mileage',
        'Comprehensive insurance',
        '24/7 roadside assistance',
        'GPS navigation included',
        'Free cancellation (48h)',
        'Airport delivery available',
        'Additional driver option',
        'Child seat available'
      ],
      pricing: [
        { period: 'Daily', price: '$199' },
        { period: 'Weekly', price: '$1,199' },
        { period: 'Monthly', price: '$3,999' },
        { period: 'Corporate', price: 'Custom' }
      ],
      faq: [
        { q: 'What is the minimum age to rent?', a: 'You must be at least 21 years old with a valid driver\'s license.' },
        { q: 'What insurance is included?', a: 'Basic liability insurance is included. Additional coverage is available.' },
        { q: 'Is there a mileage limit?', a: 'No, all rentals include unlimited mileage.' }
      ],
      link: '/rentals',
      color: '#d4af37'
    },
    {
      id: 'wash',
      icon: '🧼',
      title: 'Elite Car Wash & Detailing',
      subtitle: 'DETAILING EXPERTS',
      shortDescription: 'Premium hand wash, ceramic coating, and interior detailing for the perfect finish.',
      description: 'Experience the pinnacle of automotive care with our comprehensive detailing services. From express washes to full ceramic coatings, we treat every vehicle with the utmost care and precision using only eco-friendly products.',
      longDescription: 'Our state-of-the-art detailing facility uses the latest techniques and highest quality products to restore and protect your vehicle\'s finish. Whether you need a quick refresh or a complete concours-level detail, our certified technicians deliver exceptional results. We also offer mobile detailing services, bringing our expertise directly to your location.',
      badge: 'From $49',
      image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800',
      features: [
        'Eco-friendly products',
        'Hand wash only',
        'Ceramic coating',
        'Interior detailing',
        'Engine bay cleaning',
        'Paint correction',
        'Headlight restoration',
        'Mobile service available'
      ],
      packages: [
        { name: 'Express Wash', price: '$49', duration: '30 min', includes: ['Exterior wash', 'Wheel cleaning', 'Tire shine'] },
        { name: 'Premium Detail', price: '$149', duration: '2 hours', includes: ['Express Wash', 'Interior detail', 'Wax'] },
        { name: 'Ultimate Ceramic', price: '$499', duration: '4 hours', includes: ['Premium Detail', 'Ceramic coating', 'Paint correction'] }
      ],
      faq: [
        { q: 'How long does a wash take?', a: 'Express wash takes 30 minutes, premium detail takes 2 hours.' },
        { q: 'Do you offer mobile service?', a: 'Yes, we offer mobile detailing at your location.' },
        { q: 'Are your products eco-friendly?', a: 'Yes, we use only biodegradable, eco-friendly products.' }
      ],
      link: '/car-wash',
      color: '#00ff88'
    },
    {
      id: 'repairs',
      icon: '🔧',
      title: 'Expert Repairs & Maintenance',
      subtitle: 'CERTIFIED MECHANICS',
      shortDescription: 'Factory-trained technicians using genuine parts for your peace of mind.',
      description: 'From routine maintenance to complex repairs, our certified technicians have the expertise to keep your vehicle performing at its best. We use state-of-the-art diagnostic equipment and genuine parts for all repairs.',
      longDescription: 'Our service center is equipped with the latest diagnostic technology and staffed by factory-trained technicians who specialize in luxury and exotic vehicles. We perform everything from oil changes to major engine overhauls, always using genuine parts and following manufacturer specifications. Every repair comes with our comprehensive warranty for your peace of mind.',
      badge: 'Free Inspection',
      image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800',
      features: [
        'Certified technicians',
        'Genuine parts',
        '24-month warranty',
        'Free pickup/dropoff',
        'Computer diagnostics',
        'Performance tuning',
        'AC service',
        'Brake service'
      ],
      services: [
        { name: 'Diagnostic', price: '$89', description: 'Complete vehicle diagnostics' },
        { name: 'Oil Change', price: '$99', description: 'Synthetic oil and filter' },
        { name: 'Brake Service', price: '$299', description: 'Pad replacement and rotor resurfacing' },
        { name: 'Major Service', price: '$599', description: 'Comprehensive inspection and service' }
      ],
      faq: [
        { q: 'Do you use genuine parts?', a: 'Yes, we only use OEM and genuine parts.' },
        { q: 'What warranty do you offer?', a: 'All repairs come with a 24-month warranty.' },
        { q: 'Do you offer pickup and delivery?', a: 'Yes, complimentary pickup and delivery is available.' }
      ],
      link: '/repairs',
      color: '#33b5e5'
    },
    {
      id: 'sales',
      icon: '💰',
      title: 'Premium Car Sales',
      subtitle: 'CURATED COLLECTION',
      shortDescription: 'Discover hand-selected pre-owned luxury vehicles, each thoroughly inspected and certified.',
      description: 'Every vehicle in our sales inventory undergoes a rigorous 150-point inspection and comes with a complete vehicle history report. We stand behind every car we sell with comprehensive warranty options.',
      longDescription: 'Our sales gallery features a constantly rotating selection of the finest pre-owned luxury and exotic vehicles. Each car is hand-selected by our expert team and thoroughly reconditioned to meet our exacting standards. We provide complete transparency with full vehicle history reports and offer flexible financing options to suit your needs.',
      badge: 'Certified',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
      features: [
        '150-point inspection',
        'Vehicle history report',
        'Financing available',
        'Trade-ins welcome',
        'Extended warranty',
        'Test drives',
        'Delivery options',
        'Certified pre-owned'
      ],
      benefits: [
        { icon: '🔍', text: 'Thoroughly inspected' },
        { icon: '📋', text: 'Full history report' },
        { icon: '💰', text: 'Financing options' },
        { icon: '🔄', text: 'Trade-in accepted' }
      ],
      faq: [
        { q: 'Are vehicles certified?', a: 'Yes, all vehicles undergo a rigorous certification process.' },
        { q: 'Do you offer financing?', a: 'Yes, we work with multiple lenders to offer competitive rates.' },
        { q: 'Can I trade in my vehicle?', a: 'Yes, we accept trade-ins and offer fair market value.' }
      ],
      link: '/sales',
      color: '#ffbb33'
    }
  ];

  const stats = [
    { number: '500+', label: 'Luxury Vehicles', icon: '🚗' },
    { number: '50k+', label: 'Happy Clients', icon: '👤' },
    { number: '98%', label: 'Satisfaction Rate', icon: '⭐' },
    { number: '24/7', label: 'Concierge Support', icon: '🛎️' }
  ];

  const testimonials = [
    {
      name: 'James Donaldson',
      role: 'CEO, TechCorp',
      content: 'The most seamless luxury car rental experience I\'ve ever had. From booking to drop-off, everything was perfect.',
      rating: 5,
      service: 'Rentals',
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      name: 'Sarah Reynolds',
      role: 'Investor',
      content: 'Exceptional service and an incredible fleet. The concierge team anticipated every need. Truly five-star treatment.',
      rating: 5,
      service: 'Detailing',
      image: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      name: 'Michael Wong',
      role: 'Entrepreneur',
      content: 'I\'ve used CAR EASE for both personal and business needs. They never disappoint. The vehicles are always immaculate.',
      rating: 5,
      service: 'Sales',
      image: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  ];

  const filteredServices = activeTab === 'all' 
    ? services 
    : services.filter(s => s.id === activeTab);

  return (
    <div className="services-page">
      {/* ===== HERO SECTION ===== */}
      <section className="services-hero">
        <div className="services-hero-bg"></div>
        <div className="services-hero-content">
          <h1 className="services-hero-title animate-fade-up">
            Our <span className="gold-text">Services</span>
          </h1>
          <p className="services-hero-description animate-fade-up">
            Comprehensive automotive excellence, tailored to your every need
          </p>
        </div>
      </section>

      {/* ===== SERVICE TABS ===== */}
      <section className="service-tabs-section">
        <div className="container">
          <div className="service-tabs">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Services
            </button>
            <button 
              className={`tab-btn ${activeTab === 'rentals' ? 'active' : ''}`}
              onClick={() => setActiveTab('rentals')}
            >
              🚗 Rentals
            </button>
            <button 
              className={`tab-btn ${activeTab === 'wash' ? 'active' : ''}`}
              onClick={() => setActiveTab('wash')}
            >
              🧼 Car Wash
            </button>
            <button 
              className={`tab-btn ${activeTab === 'repairs' ? 'active' : ''}`}
              onClick={() => setActiveTab('repairs')}
            >
              🔧 Repairs
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
              onClick={() => setActiveTab('sales')}
            >
              💰 Sales
            </button>
          </div>
        </div>
      </section>

      {/* ===== SERVICES SHOWCASE ===== */}
      <section className="services-showcase-section">
        <div className="container">
          {filteredServices.map((service, index) => (
            <div key={service.id} className="service-showcase">
              <div className="service-showcase-header">
                <div 
                  className="service-showcase-icon"
                  style={{ backgroundColor: `${service.color}20`, color: service.color }}
                >
                  {service.icon}
                </div>
                <div className="service-showcase-title">
                  <span className="service-subtitle">{service.subtitle}</span>
                  <h2>{service.title}</h2>
                </div>
                <div className="service-showcase-badge">{service.badge}</div>
              </div>

              <div className="service-showcase-content">
                <div className="service-showcase-main">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="service-showcase-image"
                  />
                  <div className="service-showcase-info">
                    <p className="service-description">{service.description}</p>
                    <p className="service-long-description">{service.longDescription}</p>
                    <div className="service-actions">
                      <button 
                        className="btn-gold"
                        onClick={() => navigate(service.link)}
                      >
                        Explore {service.title.split(' ')[0]}
                      </button>
                      <Link to="/contact" className="btn-outline">
                        Inquire Now
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="service-showcase-details">
                  <div className="details-column">
                    <h3>Key Features</h3>
                    <ul className="features-list">
                      {service.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="details-column">
                    {service.pricing && (
                      <>
                        <h3>Pricing</h3>
                        <div className="pricing-list">
                          {service.pricing.map((item, i) => (
                            <div key={i} className="pricing-item">
                              <span className="pricing-period">{item.period}</span>
                              <span className="pricing-price">{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {service.packages && (
                      <>
                        <h3>Packages</h3>
                        <div className="packages-list">
                          {service.packages.map((pkg, i) => (
                            <div key={i} className="package-item">
                              <h4>{pkg.name}</h4>
                              <p className="package-price">{pkg.price}</p>
                              <p className="package-duration">⏱️ {pkg.duration}</p>
                              <ul className="package-includes">
                                {pkg.includes.map((item, j) => (
                                  <li key={j}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {service.services && (
                      <>
                        <h3>Services</h3>
                        <div className="services-list">
                          {service.services.map((item, i) => (
                            <div key={i} className="service-item">
                              <div>
                                <h4>{item.name}</h4>
                                <p>{item.description}</p>
                              </div>
                              <span className="service-price">{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {service.benefits && (
                      <>
                        <h3>Benefits</h3>
                        <div className="benefits-grid">
                          {service.benefits.map((benefit, i) => (
                            <div key={i} className="benefit-item">
                              <span className="benefit-icon">{benefit.icon}</span>
                              <span>{benefit.text}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="details-column">
                    <h3>FAQ</h3>
                    <div className="faq-list">
                      {service.faq.map((item, i) => (
                        <div key={i} className="faq-item">
                          <h4>{item.q}</h4>
                          <p>{item.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="services-stats">
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

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="services-testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">TESTIMONIALS</span>
            <h2 className="section-title">
              What Our <span className="gold-text">Clients</span> Say
            </h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <img src={testimonial.image} alt={testimonial.name} />
                  <div>
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role} • {testimonial.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="services-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Excellence?</h2>
            <p>Choose from our premium services and let us exceed your expectations</p>
            <div className="cta-buttons">
              <button 
                className="btn-gold btn-large"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setActiveTab('all');
                }}
              >
                Browse All Services
              </button>
              <Link to="/contact" className="btn-outline-light btn-large">
                Contact Concierge
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;