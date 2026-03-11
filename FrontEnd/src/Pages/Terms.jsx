// ===== src/Pages/Terms.jsx =====
import React from 'react';
import { Link } from 'react-router-dom';

// Core imports
import { ROUTES } from '../Config/Routes';
import { APP_CONFIG, COMPANY_INFO } from '../Utils/constants';

// Components
import Button from '../Components/Common/Button';
import Card from '../Components/Common/Card';

// Styles
import '../Styles/Terms.css';

const Terms = () => {
  const lastUpdated = 'January 1, 2024';

  return (
    <div className="legal-page">
      {/* Header */}
      <section className="legal-header">
        <div className="container">
          <h1 className="legal-title">
            Terms of <span className="gold-text">Service</span>
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
              <h2 className="section-title">1. Agreement to Terms</h2>
              <p className="section-text">
                By accessing or using {APP_CONFIG.name}'s services, website, or mobile applications (collectively, the "Services"), 
                you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, 
                you may not access the Services.
              </p>
              <p className="section-text">
                These Terms constitute a legally binding agreement between you and {APP_CONFIG.name} LLC. 
                Please read them carefully.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">2. Eligibility</h2>
              <p className="section-text">
                By using our Services, you represent and warrant that:
              </p>
              <ul className="legal-list">
                <li>You are at least 18 years of age</li>
                <li>You have the legal capacity to enter into a binding contract</li>
                <li>You are not barred from using our Services under applicable law</li>
                <li>You will provide accurate and complete information when creating an account or making a booking</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="section-title">3. Account Registration</h2>
              <p className="section-text">
                To access certain features of our Services, you may need to create an account. You are responsible for:
              </p>
              <ul className="legal-list">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
              <p className="section-text">
                We reserve the right to suspend or terminate accounts that violate these Terms.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">4. Booking and Payment Terms</h2>
              
              <h3 className="subsection-title">4.1 Reservations</h3>
              <p className="section-text">
                When you make a booking through our Services, you agree to pay all charges associated with your reservation, 
                including applicable taxes and fees. Bookings are subject to availability and confirmation.
              </p>

              <h3 className="subsection-title">4.2 Pricing</h3>
              <p className="section-text">
                All prices are quoted in USD unless otherwise specified. We reserve the right to modify prices at any time, 
                but such changes will not affect confirmed bookings.
              </p>

              <h3 className="subsection-title">4.3 Payment</h3>
              <p className="section-text">
                We accept various payment methods as indicated during checkout. By providing payment information, you represent 
                that you are authorized to use the designated payment method. You authorize us to charge the full amount of 
                your booking to the provided payment method.
              </p>

              <h3 className="subsection-title">4.4 Cancellations and Refunds</h3>
              <p className="section-text">
                Cancellation policies vary by service type and are displayed at the time of booking. Generally:
              </p>
              <ul className="legal-list">
                <li>Rentals: Free cancellation up to 48 hours before pickup</li>
                <li>Car Wash: Free cancellation up to 24 hours before appointment</li>
                <li>Repairs: Cancellation fees may apply within 24 hours</li>
                <li>Sales: Subject to individual vehicle terms</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="section-title">5. Rental Terms</h2>
              
              <h3 className="subsection-title">5.1 Driver Requirements</h3>
              <ul className="legal-list">
                <li>Valid driver's license held for at least 2 years</li>
                <li>Minimum age of 25 for exotic vehicles (23 for standard vehicles)</li>
                <li>Valid credit card in driver's name</li>
                <li>Clean driving record</li>
              </ul>

              <h3 className="subsection-title">5.2 Insurance</h3>
              <p className="section-text">
                All rentals include basic liability insurance. Additional coverage options are available for purchase at the 
                time of rental. You are responsible for any damage not covered by insurance.
              </p>

              <h3 className="subsection-title">5.3 Fuel Policy</h3>
              <p className="section-text">
                Vehicles are provided with a full tank of fuel and must be returned with a full tank. A refueling fee will 
                be charged if the vehicle is returned with less than a full tank.
              </p>

              <h3 className="subsection-title">5.4 Mileage</h3>
              <p className="section-text">
                Most rentals include unlimited mileage. Exotic and specialty vehicles may have mileage restrictions, which 
                will be disclosed at the time of booking.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">6. Car Wash and Detailing Terms</h2>
              <ul className="legal-list">
                <li>We are not responsible for existing damage or defects</li>
                <li>Certain fabrics and materials may have limitations</li>
                <li>Results may vary based on vehicle condition</li>
                <li>We reserve the right to refuse service on excessively dirty or damaged vehicles</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="section-title">7. Repair Services Terms</h2>
              <ul className="legal-list">
                <li>Estimates are provided before work begins</li>
                <li>Parts and labor are warranted for 24 months/24,000 miles</li>
                <li>We use OEM or equivalent quality parts unless otherwise agreed</li>
                <li>Additional work requires customer approval</li>
                <li>Vehicles must be picked up within 7 days of completion</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="section-title">8. Vehicle Sales Terms</h2>
              
              <h3 className="subsection-title">8.1 Vehicle Condition</h3>
              <p className="section-text">
                All vehicles are sold "as-is" unless covered by a manufacturer or extended warranty. We provide comprehensive 
                vehicle history reports and encourage independent inspections.
              </p>

              <h3 className="subsection-title">8.2 Financing</h3>
              <p className="section-text">
                Financing is offered through third-party lenders. Terms and conditions are subject to credit approval and 
                lender requirements.
              </p>

              <h3 className="subsection-title">8.3 Deposits</h3>
              <p className="section-text">
                A deposit may be required to hold a vehicle. Deposits are refundable according to the terms agreed upon at 
                the time of deposit.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">9. User Conduct</h2>
              <p className="section-text">
                You agree not to:
              </p>
              <ul className="legal-list">
                <li>Use our Services for any illegal purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe on our intellectual property rights</li>
                <li>Harass, abuse, or harm others</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with the operation of our Services</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="section-title">10. Intellectual Property</h2>
              <p className="section-text">
                Our Services and their original content, features, and functionality are owned by {APP_CONFIG.name} and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="section-text">
                You may not reproduce, distribute, modify, create derivative works of, publicly display, or commercially 
                exploit any content from our Services without our express written consent.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">11. Limitation of Liability</h2>
              <p className="section-text">
                To the maximum extent permitted by law, {APP_CONFIG.name} shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses, resulting from:
              </p>
              <ul className="legal-list">
                <li>Your use or inability to use our Services</li>
                <li>Any conduct or content of any third party</li>
                <li>Any content obtained from our Services</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="section-title">12. Indemnification</h2>
              <p className="section-text">
                You agree to defend, indemnify, and hold harmless {APP_CONFIG.name} and its employees, contractors, and agents 
                from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses arising from:
              </p>
              <ul className="legal-list">
                <li>Your use of and access to our Services</li>
                <li>Your violation of any term of these Terms</li>
                <li>Your violation of any third-party right</li>
                <li>Any claim that your content caused damage to a third party</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="section-title">13. Termination</h2>
              <p className="section-text">
                We may terminate or suspend your account and bar access to our Services immediately, without prior notice or 
                liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach 
                the Terms.
              </p>
              <p className="section-text">
                Upon termination, your right to use our Services will immediately cease.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">14. Governing Law</h2>
              <p className="section-text">
                These Terms shall be governed and construed in accordance with the laws of the State of California, without 
                regard to its conflict of law provisions.
              </p>
              <p className="section-text">
                Any legal action or proceeding relating to your access to or use of our Services shall be instituted in the 
                state or federal courts located in Los Angeles County, California.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">15. Changes to Terms</h2>
              <p className="section-text">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to 
                provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              <p className="section-text">
                By continuing to access or use our Services after those revisions become effective, you agree to be bound by 
                the revised terms.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="section-title">16. Contact Us</h2>
              <p className="section-text">
                If you have any questions about these Terms, please contact us at:
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

export default Terms;