// ===== src/Pages/Privacy.jsx =====
import React from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { APP_CONFIG, COMPANY_INFO } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';

// Styles
import '../Styles/Privacy.css';

const Privacy = () => {
  const lastUpdated = 'January 1, 2024';

  return (
    <div className="legal-page">
      {/* Header */}
      <section className="legal-header">
        <div className="container">
          <h1 className="legal-title">
            Privacy <span className="gold-text">Policy</span>
          </h1>
          <p className="legal-subtitle">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="legal-content">
        <div className="container">
          <Card className="legal-card">
            <div className="legal-section">
              <h2 className="section-title">1. Introduction</h2>
              <p className="section-text">
                {APP_CONFIG.name} ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website or use our services.
              </p>
              <p className="section-text">
                Please read this privacy policy carefully. If you do not agree with the terms of this 
                privacy policy, please do not access the site or use our services.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">2. Information We Collect</h2>
              <h3 className="subsection-title">2.1 Personal Data</h3>
              <p className="section-text">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="legal-list">
                <li>Register for an account</li>
                <li>Make a booking or reservation</li>
                <li>Sign up for our newsletter</li>
                <li>Contact us through forms or email</li>
                <li>Participate in promotions or surveys</li>
              </ul>
              <p className="section-text">
                The personal information we may collect includes:
              </p>
              <ul className="legal-list">
                <li>Name and contact information (email, phone number, address)</li>
                <li>Payment information (credit card details, billing address)</li>
                <li>Driver's license and identification documents</li>
                <li>Booking history and preferences</li>
              </ul>

              <h3 className="subsection-title">2.2 Automatically Collected Information</h3>
              <p className="section-text">
                When you visit our website, we may automatically collect certain information about your device, 
                including:
              </p>
              <ul className="legal-list">
                <li>IP address and browser type</li>
                <li>Operating system</li>
                <li>Pages visited and time spent</li>
                <li>Referring website addresses</li>
                <li>Location information</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="section-title">3. How We Use Your Information</h2>
              <p className="section-text">
                We use the information we collect to:
              </p>
              <ul className="legal-list">
                <li>Process and manage your bookings</li>
                <li>Communicate with you about your reservations</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="section-title">4. Sharing Your Information</h2>
              <p className="section-text">
                We may share your information with:
              </p>
              <ul className="legal-list">
                <li><strong>Service Providers:</strong> Third-party vendors who help us operate our business</li>
                <li><strong>Business Partners:</strong> Partners who offer services you request</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger or sale of assets</li>
              </ul>
              <p className="section-text">
                We do not sell your personal information to third parties.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">5. Data Security</h2>
              <p className="section-text">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                over the Internet or electronic storage is 100% secure.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">6. Your Rights</h2>
              <p className="section-text">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="legal-list">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your information</li>
                <li>Object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
              <p className="section-text">
                To exercise these rights, please contact us at <a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">7. Cookies and Tracking</h2>
              <p className="section-text">
                We use cookies and similar tracking technologies to enhance your experience on our website. 
                You can control cookies through your browser settings. For more information, please see our 
                <Link to={ROUTES.COOKIES}> Cookie Policy</Link>.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">8. Children's Privacy</h2>
              <p className="section-text">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect 
                personal information from children. If you become aware that a child has provided us with 
                personal information, please contact us.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">9. International Data Transfers</h2>
              <p className="section-text">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your information in accordance 
                with this Privacy Policy.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">10. Changes to This Policy</h2>
              <p className="section-text">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new policy on this page with an updated effective date.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">11. Contact Us</h2>
              <p className="section-text">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="contact-info">
                <p><strong>{APP_CONFIG.name}</strong></p>
                <p>{COMPANY_INFO.address}</p>
                <p>Email: <a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a></p>
                <p>Phone: <a href={`tel:${COMPANY_INFO.phone}`}>{COMPANY_INFO.phone}</a></p>
              </div>
            </div>

            <div className="legal-footer">
              <Link to={ROUTES.HOME}>
                <Button variant="outline">Return Home</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Privacy;