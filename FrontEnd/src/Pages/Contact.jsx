import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Contact.css';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    urgency: 'normal'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate form submission
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          preferredContact: 'email',
          urgency: 'normal'
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      }, 1500);
    }
  };

  const contactInfo = [
    {
      icon: '📍',
      title: 'Visit Us',
      details: ['123 Luxury Lane', 'Beverly Hills, CA 90210', 'United States']
    },
    {
      icon: '📞',
      title: 'Call Us',
      details: ['+1 (800) 555-0123', '+1 (310) 555-4567', '24/7 Concierge']
    },
    {
      icon: '✉️',
      title: 'Email Us',
      details: ['concierge@carease.com', 'support@carease.com', 'sales@carease.com']
    },
    {
      icon: '⏰',
      title: 'Business Hours',
      details: ['Mon-Fri: 9am - 8pm', 'Sat: 10am - 6pm', 'Sun: By Appointment']
    }
  ];

  const locations = [
    {
      id: 'beverly-hills',
      city: 'Beverly Hills',
      address: '123 Luxury Lane, Beverly Hills, CA 90210',
      phone: '+1 (310) 555-0123',
      hours: 'Mon-Sun: 9am - 8pm',
      coordinates: { lat: 34.0736, lng: -118.4004 }
    },
    {
      id: 'miami',
      city: 'Miami',
      address: '456 Ocean Drive, Miami Beach, FL 33139',
      phone: '+1 (305) 555-0456',
      hours: 'Mon-Sun: 10am - 7pm',
      coordinates: { lat: 25.7907, lng: -80.1300 }
    },
    {
      id: 'new-york',
      city: 'New York',
      address: '789 Park Avenue, New York, NY 10022',
      phone: '+1 (212) 555-0789',
      hours: 'Mon-Fri: 9am - 8pm, Sat: 10am-6pm',
      coordinates: { lat: 40.7614, lng: -73.9776 }
    }
  ];

  const faqs = [
    {
      question: 'How do I book a vehicle?',
      answer: 'You can book directly through our website, call our concierge, or visit any showroom. Instant confirmation available 24/7.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, Mobile Money, and bank transfers. For rentals, a security deposit is required.'
    },
    {
      question: 'Is there a cancellation policy?',
      answer: 'Free cancellation up to 48 hours before your booking. Late cancellations may incur a 50% fee.'
    },
    {
      question: 'Do you offer airport delivery?',
      answer: 'Yes, we offer complimentary delivery to major airports in LA, Miami, and NYC with 24-hour notice.'
    },
    {
      question: 'Are your vehicles insured?',
      answer: 'All rentals include comprehensive insurance coverage. Additional coverage options are available.'
    },
    {
      question: 'What is the minimum age to rent?',
      answer: 'The minimum age to rent is 21 years with a valid driver\'s license and credit card.'
    }
  ];

  const subjectOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'booking', label: 'Booking Assistance' },
    { value: 'rental', label: 'Rental Questions' },
    { value: 'sales', label: 'Sales Inquiry' },
    { value: 'service', label: 'Service Appointment' },
    { value: 'finance', label: 'Financing' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="contact-page">
      {/* ===== HERO SECTION ===== */}
      <section className="contact-hero">
        <div className="contact-hero-bg"></div>
        <div className="contact-hero-content">
          <h1 className="contact-hero-title animate-fade-up">
            Get In <span className="gold-text">Touch</span>
          </h1>
          <p className="contact-hero-description animate-fade-up">
            Our luxury concierge team is here to assist you 24/7
          </p>
        </div>
      </section>

      {/* ===== CONTACT INFO CARDS ===== */}
      <section className="contact-info-section">
        <div className="container">
          <div className="info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="info-card animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="info-icon">{info.icon}</div>
                <h3>{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i}>{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT FORM SECTION ===== */}
      <section className="contact-form-section">
        <div className="container">
          <div className="form-grid">
            <div className="form-content animate-fade-left">
              <span className="section-subtitle">SEND A MESSAGE</span>
              <h2 className="section-title">
                We'd Love to <span className="gold-text">Hear From You</span>
              </h2>
              <p className="form-description">
                Whether you have a question about our services, need assistance with a booking, 
                or want to discuss your luxury automotive needs, our team is ready to help.
              </p>

              {submitSuccess && (
                <div className="success-message">
                  <span className="success-icon">✓</span>
                  <div>
                    <h4>Message Sent Successfully!</h4>
                    <p>Thank you for contacting us. Our team will respond within 24 hours.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Your Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="John Doe"
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select a topic</option>
                      {subjectOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Message <span className="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className={`form-textarea ${errors.message ? 'error' : ''}`}
                    placeholder="How can we help you?"
                  />
                  {errors.message && <span className="error-message">{errors.message}</span>}
                  <div className="character-count">
                    {formData.message.length}/500 characters
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Preferred Contact Method</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="email"
                          checked={formData.preferredContact === 'email'}
                          onChange={handleChange}
                        />
                        <span>Email</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="phone"
                          checked={formData.preferredContact === 'phone'}
                          onChange={handleChange}
                        />
                        <span>Phone</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="preferredContact"
                          value="either"
                          checked={formData.preferredContact === 'either'}
                          onChange={handleChange}
                        />
                        <span>Either</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Urgency</label>
                    <div className="urgency-options">
                      <button
                        type="button"
                        className={`urgency-btn ${formData.urgency === 'low' ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, urgency: 'low' }))}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        className={`urgency-btn ${formData.urgency === 'normal' ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, urgency: 'normal' }))}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        className={`urgency-btn ${formData.urgency === 'urgent' ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, urgency: 'urgent' }))}
                      >
                        Urgent
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={`btn-gold btn-large ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            <div className="form-sidebar animate-fade-right">
              <div className="sidebar-card">
                <h3>Concierge Service</h3>
                <p>For immediate assistance, our VIP concierge team is available 24/7.</p>
                <a href="tel:+18005550123" className="concierge-phone">📞 +1 (800) 555-0123</a>
                <a href="mailto:concierge@carease.com" className="concierge-email">✉️ concierge@carease.com</a>
              </div>

              <div className="sidebar-card">
                <h3>Quick Links</h3>
                <ul className="quick-links">
                  <li><Link to="/services">Services</Link></li>
                  <li><Link to="/rentals">Rentals</Link></li>
                  <li><Link to="/car-wash">Car Wash</Link></li>
                  <li><Link to="/repairs">Repairs</Link></li>
                  <li><Link to="/sales">Sales</Link></li>
                </ul>
              </div>

              <div className="sidebar-card">
                <h3>Follow Us</h3>
                <div className="social-links-vertical">
                  <a href="https://facebook.com/carease" target="_blank" rel="noopener noreferrer" className="social-link-vertical">
                    📘 Facebook
                  </a>
                  <a href="https://instagram.com/carease" target="_blank" rel="noopener noreferrer" className="social-link-vertical">
                    📷 Instagram
                  </a>
                  <a href="https://twitter.com/carease" target="_blank" rel="noopener noreferrer" className="social-link-vertical">
                    🐦 Twitter
                  </a>
                  <a href="https://linkedin.com/company/carease" target="_blank" rel="noopener noreferrer" className="social-link-vertical">
                    💼 LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== LOCATIONS SECTION ===== */}
      <section className="locations-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">OUR LOCATIONS</span>
            <h2 className="section-title">
              Visit Our <span className="gold-text">Showrooms</span>
            </h2>
          </div>

          <div className="locations-grid">
            {locations.map((location, index) => (
              <div 
                key={index} 
                className="location-card animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3>{location.city}</h3>
                <p className="location-address">{location.address}</p>
                <p className="location-phone">{location.phone}</p>
                <p className="location-hours">{location.hours}</p>
                <div className="location-actions">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-small"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">FAQ</span>
            <h2 className="section-title">
              Frequently Asked <span className="gold-text">Questions</span>
            </h2>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAP SECTION ===== */}
      <section className="map-section">
        <div className="container">
          <div className="map-container">
            <div className="map-placeholder">
              <div className="map-overlay">
                <h3>Interactive Map</h3>
                <p>Find our showrooms and get directions</p>
                <a 
                  href="https://www.google.com/maps/search/CAR+EASE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;