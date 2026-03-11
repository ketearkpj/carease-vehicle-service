// ===== src/Pages/FAQ.jsx =====
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import Input from '../Components/Common/Input';

// Styles
import '../Styles/FAQ.css';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState({});

  const categories = [
    { id: 'all', label: 'All Questions', icon: '📋' },
    { id: 'general', label: 'General', icon: '❓' },
    { id: 'rentals', label: 'Rentals', icon: '🚗' },
    { id: 'car_wash', label: 'Car Wash', icon: '🧼' },
    { id: 'repairs', label: 'Repairs', icon: '🔧' },
    { id: 'sales', label: 'Sales', icon: '💰' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'account', label: 'Account', icon: '👤' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'general',
      question: 'What services does CAR EASE offer?',
      answer: 'CAR EASE offers a comprehensive range of luxury automotive services including exotic car rentals, professional car wash and detailing, expert repairs and maintenance, and premium vehicle sales. We cater to discerning clients who demand excellence in every aspect of automotive care.'
    },
    {
      id: 2,
      category: 'general',
      question: 'Where are your locations?',
      answer: 'We have three flagship locations: Roysambu (next to TRM) (TRM Service Lane), Westlands (Westlands Ring Road), and Upper Hill (Upper Hill Road). Each location offers our full range of services with state-of-the-art facilities.'
    },
    {
      id: 3,
      category: 'general',
      question: 'What are your business hours?',
      answer: 'Our locations are open Monday-Friday 9am-8pm, Saturday 10am-6pm, and Sunday 11am-5pm. Our concierge team is available 24/7 for emergencies and urgent inquiries.'
    },
    {
      id: 4,
      category: 'rentals',
      question: 'What is the minimum age to rent a vehicle?',
      answer: 'The minimum age is 25 for exotic and supercar rentals, and 23 for luxury sedans and SUVs. All drivers must have a valid driver\'s license held for at least 2 years and a clean driving record.'
    },
    {
      id: 5,
      category: 'rentals',
      question: 'What documents do I need to rent a car?',
      answer: 'You\'ll need a valid driver\'s license, a credit card in your name, and proof of insurance. International renters must present a valid passport and international driver\'s permit if applicable.'
    },
    {
      id: 6,
      category: 'rentals',
      question: 'Is insurance included in the rental price?',
      answer: 'Basic liability insurance is included. We offer additional coverage options including collision damage waiver and personal accident insurance at the time of rental.'
    },
    {
      id: 7,
      category: 'rentals',
      question: 'Can I rent a car for one day only?',
      answer: 'Yes, we offer daily rentals with a 24-hour minimum. Multi-day rentals receive discounted rates. Weekly and monthly rentals are also available.'
    },
    {
      id: 8,
      category: 'rentals',
      question: 'Do you offer delivery service?',
      answer: 'Yes, we offer complimentary delivery within 25 miles of our locations. White glove concierge delivery is available for an additional fee.'
    },
    {
      id: 9,
      category: 'car_wash',
      question: 'How long does a car wash take?',
      answer: 'Express wash takes approximately 30 minutes, premium detailing 90 minutes, and complete ceramic coating 3-4 hours. We offer loaner vehicles for longer services.'
    },
    {
      id: 10,
      category: 'car_wash',
      question: 'Do you use safe products for all vehicle types?',
      answer: 'Yes, we use only premium, pH-balanced products safe for all finishes including matte paint, vinyl wraps, and ceramic coatings. Our detailers are trained on proper techniques for each vehicle type.'
    },
    {
      id: 11,
      category: 'car_wash',
      question: 'Can you remove scratches and swirl marks?',
      answer: 'Yes, our paint correction services can remove light to moderate scratches and swirl marks. Severe damage may require more extensive work. We provide a free assessment before beginning any paint correction.'
    },
    {
      id: 12,
      category: 'repairs',
      question: 'Do you work on all car makes and models?',
      answer: 'We specialize in luxury and exotic vehicles including Ferrari, Lamborghini, Porsche, Rolls-Royce, Bentley, and high-end Mercedes, BMW, and Audi models. Contact us for specific vehicle inquiries.'
    },
    {
      id: 13,
      category: 'repairs',
      question: 'Do you use genuine parts?',
      answer: 'Yes, we use only OEM and genuine parts for all repairs. For classic or exotic vehicles, we source authentic parts from manufacturers or approved suppliers.'
    },
    {
      id: 14,
      category: 'repairs',
      question: 'What warranty do you offer on repairs?',
      answer: 'All repairs come with a 24-month/24,000-mile warranty on parts and labor. We stand behind our workmanship and offer comprehensive warranty coverage.'
    },
    {
      id: 15,
      category: 'sales',
      question: 'Do you offer financing?',
      answer: 'Yes, we offer competitive financing through our network of lending partners. Rates and terms vary based on creditworthiness and vehicle selection. We can pre-qualify you with no impact to your credit score.'
    },
    {
      id: 16,
      category: 'sales',
      question: 'Can I trade in my current vehicle?',
      answer: 'Yes, we accept trade-ins and offer fair market value based on current market conditions. We\'ll provide a complimentary appraisal and can apply the value toward your purchase.'
    },
    {
      id: 17,
      category: 'sales',
      question: 'Do you provide vehicle history reports?',
      answer: 'Yes, every vehicle comes with a comprehensive vehicle history report from Carfax or AutoCheck. We also encourage independent inspections by your chosen mechanic.'
    },
    {
      id: 18,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, bank transfers, and cash. For rentals, a credit card is required for the security deposit.'
    },
    {
      id: 19,
      category: 'payments',
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption and secure payment processors. We are PCI compliant and never store full credit card numbers on our servers.'
    },
    {
      id: 20,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'You can create an account by clicking "Sign Up" in the top right corner. You\'ll need to provide your name, email address, and create a password. Account creation is free and gives you access to faster booking and exclusive offers.'
    },
    {
      id: 21,
      category: 'account',
      question: 'I forgot my password. What should I do?',
      answer: 'Click "Forgot Password" on the login page and enter your email address. We\'ll send you a link to reset your password. The link expires after 24 hours for security.'
    }
  ];

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="faq-page">
      {/* Header */}
      <section className="faq-header">
        <div className="container">
          <h1 className="faq-title">
            Frequently Asked <span className="gold-text">Questions</span>
          </h1>
          <p className="faq-subtitle">
            Find answers to common questions about our services
          </p>

          {/* Search */}
          <div className="faq-search">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              icon="🔍"
              size="lg"
              className="search-input"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="faq-content">
        <div className="container">
          <div className="faq-grid">
            {/* Categories Sidebar */}
            <div className="faq-categories">
              <h3 className="categories-title">Categories</h3>
              <div className="categories-list">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-label">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Items */}
            <div className="faq-items">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map(faq => (
                  <Card key={faq.id} className="faq-item">
                    <button
                      className={`faq-question ${openItems[faq.id] ? 'open' : ''}`}
                      onClick={() => toggleItem(faq.id)}
                    >
                      <span className="question-text">{faq.question}</span>
                      <span className="question-icon">{openItems[faq.id] ? '−' : '+'}</span>
                    </button>
                    {openItems[faq.id] && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <div className="no-results">
                  <span className="no-results-icon">🔍</span>
                  <h3>No questions found</h3>
                  <p>Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          </div>

          {/* Still Have Questions */}
          <Card className="contact-card">
            <div className="contact-content">
              <h2 className="contact-title">Still Have Questions?</h2>
              <p className="contact-text">
                Our concierge team is available 24/7 to assist you with any questions.
              </p>
              <div className="contact-buttons">
                <Link to={ROUTES.CONTACT}>
                  <Button variant="primary">Contact Us</Button>
                </Link>
                <a href="tel:+18005550123">
                  <Button variant="outline">Call Now</Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default FAQ;