// ===== src/Pages/Contact.jsx =====
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { APP_CONFIG, COMPANY_INFO, LOCATIONS } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Input from '../Components/Common/Input';
import Card from '../Components/Common/Card';
import LoadingSpinner from '../Components/Common/LoadingSpinner';

// Services
import { sendContactFormEmail } from '../Services/EmailService';

// Hooks
import { useApp } from '../Context/AppContext';

// Styles
import '../Styles/Contact.css';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M13.5 21v-7h2.3l.4-3h-2.7V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.2 0-.9-.1-1.8-.1-1.8 0-3.1 1.1-3.1 3.3V11H9v3h2.3v7h2.2Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9Zm9.45 1.35a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8ZM12 7.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 1.8A2.7 2.7 0 1 0 14.7 12 2.7 2.7 0 0 0 12 9.3Z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M18.9 4H21l-4.6 5.3L22 20h-4.4l-3.5-6.4L8.5 20H6.4l4.9-5.7L6 4h4.5l3.2 6 5.2-6ZM18.1 18.5h1.2L9.9 5.4H8.6l9.5 13.1Z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M6.4 8.2H3.8V20h2.6V8.2Zm.2-3.6A1.5 1.5 0 1 0 5 6.1a1.5 1.5 0 0 0 1.6-1.5ZM20.2 12.6c0-3.1-1.7-4.6-4-4.6a3.5 3.5 0 0 0-3.1 1.7V8.2h-2.6V20H13v-6.3c0-1.7.3-3.3 2.4-3.3s2.1 1.9 2.1 3.4V20H20V12.6Z" />
  </svg>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    newsletter: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [activeLocation, setActiveLocation] = useState(0);
  const selectedLocation = LOCATIONS[activeLocation];
  const selectedLocationMapQuery = encodeURIComponent(
    `${selectedLocation?.name || ''} ${selectedLocation?.address || ''}`
  );

  const { addNotification } = useApp();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value || value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          error = 'Name cannot exceed 50 characters';
        } else if (!/^[a-zA-Z\s\-']+$/.test(value)) {
          error = 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;

      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (value && !/^\+?[1-9]\d{1,14}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          error = 'Please enter a valid phone number';
        }
        break;

      case 'subject':
        if (!value) {
          error = 'Subject is required';
        } else if (value.length < 3) {
          error = 'Subject must be at least 3 characters';
        } else if (value.length > 100) {
          error = 'Subject cannot exceed 100 characters';
        }
        break;

      case 'message':
        if (!value) {
          error = 'Message is required';
        } else if (value.length < 10) {
          error = 'Message must be at least 10 characters';
        } else if (value.length > 1000) {
          error = 'Message cannot exceed 1000 characters';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ['name', 'email', 'subject', 'message'];
    const newErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field];
      if (!value || value.trim() === '') {
        newErrors[field] = 'This field is required';
        isValid = false;
      } else {
        const fieldValid = validateField(field, value);
        if (!fieldValid) isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      await sendContactFormEmail(formData);
      setSubmitStatus('success');
      addNotification('Message sent successfully! We\'ll respond within 24 hours.', 'success');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email',
        newsletter: false
      });
      setTouched({});
    } catch (error) {
      setSubmitStatus('error');
      addNotification(error.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);

      // Clear status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const contactMethods = [
    {
      icon: '📞',
      title: 'Phone',
      details: COMPANY_INFO.phone,
      action: `tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`,
      description: 'Mon-Fri 9am-8pm, Sat 10am-6pm'
    },
    {
      icon: '✉️',
      title: 'Email',
      details: COMPANY_INFO.email,
      action: `mailto:${COMPANY_INFO.email}`,
      description: '24/7 support, responses within 24h'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      details: 'Chat with us',
      action: '#',
      description: 'Available during business hours'
    },
    {
      icon: '📍',
      title: 'Visit Us',
      details: COMPANY_INFO.city,
      action: '#locations',
      description: 'Three locations nationwide'
    }
  ];

  const faqs = [
    {
      question: 'How quickly do you respond to inquiries?',
      answer: 'We typically respond within 2-4 hours during business hours. For urgent matters, we recommend calling our direct line.'
    },
    {
      question: 'Do you offer virtual consultations?',
      answer: 'Yes, we offer video consultations for vehicle viewings and service discussions. Please mention this in your message.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Cancellations must be made at least 24 hours in advance for a full refund. Please refer to our terms for specific service policies.'
    },
    {
      question: 'Do you have weekend support?',
      answer: 'Yes, our team is available Saturday 10am-6pm and Sunday 11am-5pm for phone and chat support.'
    }
  ];

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      handle: '@carease',
      href: APP_CONFIG.socialMedia.facebook,
      accent: 'facebook'
    },
    {
      name: 'Instagram',
      icon: <InstagramIcon />,
      handle: '@carease',
      href: APP_CONFIG.socialMedia.instagram,
      accent: 'instagram'
    },
    {
      name: 'Twitter',
      icon: <TwitterIcon />,
      handle: '@carease',
      href: APP_CONFIG.socialMedia.twitter,
      accent: 'twitter'
    },
    {
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      handle: 'CAR EASE',
      href: APP_CONFIG.socialMedia.linkedin,
      accent: 'linkedin'
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
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
              Get in <span className="gold-text">Touch</span>
            </h2>
            <p className="hero-subtitle">
              We're here to assist you with any questions or service needs
            </p>
          </div>
        </div>
        <div className="hero-background">
          <div className="hero-particles"></div>
          <div className="hero-glow"></div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="methods-section">
        <div className="container">
          <div className="methods-grid">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                className={`method-card animate-fade-up animate-delay-${index + 1}`}
              >
                <div className="method-icon-wrapper">
                  <span className="method-icon">{method.icon}</span>
                  <div className="method-icon-glow"></div>
                </div>
                <h3 className="method-title">{method.title}</h3>
                <p className="method-details">{method.details}</p>
                <p className="method-description">{method.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="form-section">
        <div className="container">
          <div className="form-grid">
            {/* Left Column - Form */}
            <div className="form-container animate-fade-right">
              <div className="form-header">
                <span className="form-badge">SEND A MESSAGE</span>
                <h2 className="form-title">We'd Love to <span className="gold-text">Hear From You</span></h2>
                <p className="form-description">
                  Fill out the form below and we'll get back to you within 24 hours
                </p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <Input
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && errors.name}
                    required
                    icon="👤"
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-row">
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && errors.email}
                    required
                    icon="✉️"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="form-row">
                  <Input
                    label="Phone Number (Optional)"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone && errors.phone}
                    icon="📞"
                    placeholder="0758458358"
                    helper="Include country code for international numbers"
                  />
                </div>

                <div className="form-row">
                  <Input
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.subject && errors.subject}
                    required
                    icon="📝"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div className="form-row">
                  <label className="textarea-label">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Please provide details about your inquiry..."
                    rows="6"
                    className={`form-textarea ${touched.message && errors.message ? 'error' : ''}`}
                  />
                  {touched.message && errors.message && (
                    <div className="error-message">{errors.message}</div>
                  )}
                </div>

                <div className="form-row">
                  <label className="preferred-contact-label">Preferred Contact Method</label>
                  <div className="contact-options">
                    <label className="contact-option">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={handleChange}
                      />
                      <span className="option-content">
                        <span className="option-icon">✉️</span>
                        <span className="option-text">Email</span>
                      </span>
                    </label>
                    <label className="contact-option">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={handleChange}
                      />
                      <span className="option-content">
                        <span className="option-icon">📞</span>
                        <span className="option-text">Phone</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <label className="newsletter-checkbox">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleChange}
                    />
                    <span className="checkbox-text">
                      Subscribe to receive exclusive offers and updates
                    </span>
                  </label>
                </div>

                {submitStatus === 'success' && (
                  <div className="form-success-message">
                    <span className="success-icon">✓</span>
                    <span>Thank you! Your message has been sent successfully.</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="form-error-message">
                    <span className="error-icon">⚠️</span>
                    <span>Failed to send message. Please try again.</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Right Column - Additional Info */}
            <div className="info-container animate-fade-left">
              {/* Locations */}
              <div className="locations-preview">
                <h3 className="info-title">Our Locations</h3>
                <div className="location-tabs">
                  {LOCATIONS.map((loc, index) => (
                    <button
                      key={index}
                      className={`location-tab ${activeLocation === index ? 'active' : ''}`}
                      onClick={() => setActiveLocation(index)}
                    >
                      {loc.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <div className="active-location">
                  <div className="location-image">
                    <img src={selectedLocation.image} alt={selectedLocation.name} />
                  </div>
                  <h4 className="location-name">{selectedLocation.name}</h4>
                  <p className="location-address">{selectedLocation.address}</p>
                  <div className="location-contact">
                    <a href={`tel:${selectedLocation.phone}`}>
                      <span className="contact-icon">📞</span>
                      {selectedLocation.phone}
                    </a>
                    <a href={`mailto:${selectedLocation.email}`}>
                      <span className="contact-icon">✉️</span>
                      {selectedLocation.email}
                    </a>
                  </div>
                  <p className="location-hours">
                    <span className="hours-icon">🕒</span>
                    {selectedLocation.hours}
                  </p>
                </div>
              </div>

              {/* FAQ Preview */}
              <div className="faq-preview">
                <h3 className="info-title">Quick Answers</h3>
                <div className="faq-list">
                  {faqs.map((faq, index) => (
                    <details key={index} className="faq-item">
                      <summary className="faq-question">
                        <span className="question-text">{faq.question}</span>
                        <span className="question-icon">▼</span>
                      </summary>
                      <p className="faq-answer">{faq.answer}</p>
                    </details>
                  ))}
                </div>
                <div className="faq-more">
                  <Link to={ROUTES.FAQ}>
                    <Button variant="ghost" size="sm">
                      View All FAQs →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Business Hours */}
              <div className="hours-card">
                <h3 className="info-title">Business Hours</h3>
                <div className="hours-list">
                  <div className="hours-item">
                    <span className="day">Monday - Friday</span>
                    <span className="time">9:00 AM - 8:00 PM</span>
                  </div>
                  <div className="hours-item">
                    <span className="day">Saturday</span>
                    <span className="time">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="hours-item">
                    <span className="day">Sunday</span>
                    <span className="time">11:00 AM - 5:00 PM</span>
                  </div>
                  <div className="hours-item holiday">
                    <span className="day">Holidays</span>
                    <span className="time">Limited hours, call ahead</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="social-card">
                <h3 className="info-title">Connect With Us</h3>
                <p className="social-intro">
                  Follow the brand, explore updates, and stay close to the latest CarEase experiences.
                </p>
                <div className="social-grid">
                  {socialPlatforms.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.href}
                      className={`social-card-link social-${platform.accent}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="social-card-icon">{platform.icon}</span>
                      <span className="social-card-content">
                        <span className="social-card-name">{platform.name}</span>
                        <span className="social-card-handle">{platform.handle}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <div className="map-container">
            <iframe
              src={`https://www.google.com/maps?q=${selectedLocationMapQuery}&output=embed`}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title={`${selectedLocation.name} map`}
              className="map-iframe"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
