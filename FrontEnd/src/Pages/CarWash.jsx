import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ROUTES } from '../Config/Routes';
import { WASH_PACKAGES } from '../Utils/constants';
import { formatCurrency } from '../Utils/format';

import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import HeroSection from '../Components/Features/HeroSection';

import { getWashPackages } from '../Services/Service.Service';
import { useApp } from '../Context/AppContext';
import { saveBookingDraft } from '../Utils/bookingFlow';

import '../Styles/CarWash.css';

const CarWash = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatKES = (amount) => formatCurrency(Number(amount || 0));

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const data = await getWashPackages();
        const mergedPackages = [
          ...(Array.isArray(data) ? data : []),
          ...WASH_PACKAGES.filter((fallbackPkg) => !(data || []).some((pkg) => pkg.id === fallbackPkg.id))
        ];
        setPackages(mergedPackages.length > 0 ? mergedPackages : WASH_PACKAGES);
      } catch (error) {
        console.error('Failed to fetch wash packages:', error);
        setPackages(WASH_PACKAGES);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePackageAction = (pkg, intent) => {
    const draft = {
      serviceType: 'car_wash',
      inquiryType: intent,
      packageId: pkg.id,
      packageName: pkg.name,
      listedPrice: Number(pkg.price || 0),
      startDate: '',
      endDate: '',
      time: '',
      pickupLocation: 'roysambu-trm',
      specialRequests: ''
    };

    saveBookingDraft(draft);
    navigate(ROUTES.CAR_WASH_FLOW, {
      state: { bookingPrefill: draft }
    });

    addNotification(
      intent === 'buy'
        ? `Proceeding to buy flow for ${pkg.name}.`
        : `Proceeding to booking flow for ${pkg.name}.`,
      'info'
    );
  };

  return (
    <div className="carwash-page">
      <HeroSection
        title="Professional Car Wash & Detailing"
        subtitle="Choose from complete wash tiers, then continue to service-specific checkout with add-ons, schedule, and payment options."
        ctaText="Choose Package"
        ctaLink="#packages"
        secondaryCtaText="How It Works"
        secondaryCtaLink="#service-flow"
        backgroundImage="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        alignment="center"
        fullHeight={false}
      />

      <section className="packages-section" id="packages">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">PACKAGE CATALOG</span>
            <h2 className="section-title">Choose Your <span className="gold-text">Car Wash Package</span></h2>
            <p className="section-description">
              From maintenance wash to ceramic protection, each package has its own booking or buying flow.
            </p>
          </div>

          {loading ? (
            <div className="packages-loading">
              <LoadingSpinner size="lg" color="gold" text="Loading packages..." />
            </div>
          ) : (
            <div className="packages-grid expanded">
              {packages.map((pkg, index) => (
                <Card
                  key={pkg.id}
                  className={`package-card animate-fade-up animate-delay-${(index % 6) + 1}`}
                >
                  <div className="package-badge">{pkg.duration} min</div>
                  <div className="package-icon">{pkg.icon || '🧼'}</div>
                  <h3 className="package-name">{pkg.name}</h3>
                  <p className="package-description">{pkg.description}</p>

                  <ul className="package-features">
                    {(pkg.features || []).slice(0, 6).map((feature, idx) => (
                      <li key={idx}>
                        <span className="feature-check">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="package-price">
                    <span className="price-amount">{formatKES(pkg.price)}</span>
                  </div>

                  <div className="package-cta-row">
                    <Button variant="outline" size="sm" onClick={() => handlePackageAction(pkg, 'buy')}>
                      Buy Package
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handlePackageAction(pkg, 'book')}>
                      Book Service
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="features-section" id="service-flow">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">HOW IT WORKS</span>
            <h2 className="section-title">Car Wash Flow <span className="gold-text">Built Per Service</span></h2>
          </div>

          <div className="features-grid">
            <div className="feature-card animate-fade-up animate-delay-1">
              <div className="feature-icon">1️⃣</div>
              <h3 className="feature-title">Select Package</h3>
              <p className="feature-description">Choose the exact detailing tier you want.</p>
            </div>
            <div className="feature-card animate-fade-up animate-delay-2">
              <div className="feature-icon">2️⃣</div>
              <h3 className="feature-title">Add-ons In Checkout</h3>
              <p className="feature-description">Pick optional extras while booking or buying.</p>
            </div>
            <div className="feature-card animate-fade-up animate-delay-3">
              <div className="feature-icon">3️⃣</div>
              <h3 className="feature-title">Confirm and Pay</h3>
              <p className="feature-description">Complete service order with service-specific flow.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="carwash-cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Need a Custom Detailing Plan?</h2>
            <p className="cta-description">
              Talk to Carease for fleet programs, event prep, and long-term protection plans.
            </p>
            <div className="cta-buttons">
              <Button variant="outline" size="lg" onClick={() => { window.location.href = 'tel:+254758458358'; }}>
                Call Carease
              </Button>
              <Link to={ROUTES.CONTACT}>
                <Button variant="primary" size="lg">
                  Contact Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarWash;
