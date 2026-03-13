import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '../Config/Routes';
import { formatCurrency } from '../Utils/format';
import { createBooking } from '../Services/BookingService';
import { useApp } from '../Context/AppContext';

import Button from '../Components/Common/Button';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';

import '../Styles/ServiceCheckout.css';

const SERVICE_META = {
  rental: {
    title: 'Rental Booking Flow',
    subtitle: 'Set trip details, delivery mode, and finalize booking.',
    primaryLabel: 'Book Rental',
    intents: [
      { value: 'book', label: 'Book rental' },
      { value: 'buy', label: 'Buy vehicle instead' }
    ],
    addOns: [
      { id: 'chauffeur', name: 'Professional Chauffeur', price: 8500 },
      { id: 'gps', name: 'Premium GPS', price: 2000 },
      { id: 'child-seat', name: 'Child Seat', price: 1500 },
      { id: 'full-insurance', name: 'Full Insurance Upgrade', price: 12000 }
    ]
  },
  car_wash: {
    title: 'Car Wash Booking / Purchase',
    subtitle: 'Choose slot and add-ons for your selected wash package.',
    primaryLabel: 'Continue Car Wash Order',
    intents: [
      { value: 'book', label: 'Book wash appointment' },
      { value: 'buy', label: 'Buy detailing package' }
    ],
    addOns: [
      { id: 'interior-steam', name: 'Interior Steam Sanitize', price: 3500 },
      { id: 'engine-detail', name: 'Engine Bay Detailing', price: 4500 },
      { id: 'headlight-restore', name: 'Headlight Restoration', price: 6500 },
      { id: 'odor-treatment', name: 'Odor Removal Treatment', price: 5200 },
      { id: 'ceramic-booster', name: 'Ceramic Booster Layer', price: 14900 }
    ]
  },
  repair: {
    title: 'Repairs Service Flow',
    subtitle: 'Share fault details, choose urgency, and complete service order.',
    primaryLabel: 'Continue Repair Order',
    intents: [
      { value: 'book', label: 'Book repair service' },
      { value: 'buy', label: 'Buy repair package' }
    ],
    addOns: [
      { id: 'priority-diagnosis', name: 'Priority Diagnosis', price: 6500 },
      { id: 'pickup-return', name: 'Pickup & Return Logistics', price: 8000 },
      { id: 'oem-parts-priority', name: 'OEM Parts Priority Sourcing', price: 9500 }
    ]
  },
  sales: {
    title: 'Sales Inquiry Flow',
    subtitle: 'Send purchase/test-drive request with tailored follow-up.',
    primaryLabel: 'Submit Sales Request',
    intents: [
      { value: 'purchase', label: 'Purchase inquiry' },
      { value: 'test_drive', label: 'Test-drive booking' },
      { value: 'inspection', label: 'Vehicle inspection request' }
    ],
    addOns: [
      { id: 'valuation', name: 'Trade-in Valuation', price: 0 },
      { id: 'prepurchase', name: 'Pre-Purchase Inspection', price: 12500 },
      { id: 'home-demo', name: 'Home Demo Visit', price: 9000 }
    ]
  }
};

const LOCATIONS = [
  { value: 'roysambu-trm', label: 'Roysambu Branch (Next to TRM)' },
  { value: 'westlands', label: 'Westlands Service Hub' },
  { value: 'mombasa-road', label: 'Mombasa Road Garage' }
];

const DELIVERY_OPTIONS = [
  { value: 'pickup', label: 'Pick up at branch' },
  { value: 'delivery', label: 'Delivery to my location' },
  { value: 'mobile', label: 'Mobile service (where applicable)' }
];

const SERVICE_MAP = {
  rentals: 'rental',
  'car-wash': 'car_wash',
  repairs: 'repair',
  sales: 'sales'
};

const ServiceCheckout = ({ serviceKey }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useApp();

  const bookingPrefill = location.state?.bookingPrefill || {};
  const serviceType = SERVICE_MAP[serviceKey] || bookingPrefill.serviceType || 'rental';
  const meta = SERVICE_META[serviceType] || SERVICE_META.rental;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    intent: bookingPrefill.inquiryType || meta.intents[0].value,
    startDate: bookingPrefill.startDate || '',
    endDate: bookingPrefill.endDate || '',
    time: bookingPrefill.time || '09:00 AM',
    location: bookingPrefill.pickupLocation || 'roysambu-trm',
    deliveryMode: bookingPrefill.deliveryMode || 'pickup',
    vehicleSize: bookingPrefill.vehicleSize || 'standard',
    vehicleYear: bookingPrefill.vehicleYear || '',
    vehicleMake: bookingPrefill.vehicleMake || '',
    vehicleModel: bookingPrefill.vehicleModel || '',
    urgent: false,
    issueDescription: bookingPrefill.specialRequests || '',
    specialRequests: bookingPrefill.specialRequests || '',
    customerInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idNumber: ''
    }
  });

  const [selectedAddOns, setSelectedAddOns] = useState([]);

  const baseAmount = Number(bookingPrefill.listedPrice || 0);
  const addOnTotal = useMemo(
    () => selectedAddOns.reduce((sum, addon) => sum + Number(addon.price || 0), 0),
    [selectedAddOns]
  );
  const totalAmount = baseAmount + addOnTotal;

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateCustomer = (key, value) =>
    setForm((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [key]: value
      }
    }));

  const toggleAddOn = (addon) => {
    setSelectedAddOns((prev) => {
      if (prev.some((item) => item.id === addon.id)) {
        return prev.filter((item) => item.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.startDate) return 'Choose a start date.';
      if (!form.endDate && serviceType === 'rental') return 'Choose an end date for rental.';
      if (!form.location) return 'Choose service location.';
    }

    if (step === 2) {
      if (!form.customerInfo.firstName || !form.customerInfo.lastName) return 'Enter your full name.';
      if (!form.customerInfo.email) return 'Enter your email address.';
      if (!form.customerInfo.phone) return 'Enter your phone number.';
    }

    return null;
  };

  const nextStep = () => {
    const error = validateStep();
    if (error) {
      addNotification(error, 'warning');
      return;
    }
    setStep((prev) => Math.min(3, prev + 1));
  };

  const submitOrder = async () => {
    const error = validateStep();
    if (error) {
      addNotification(error, 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        serviceType,
        vehicleId: bookingPrefill.vehicleId || null,
        vehicleName: bookingPrefill.vehicleName || null,
        packageId: bookingPrefill.packageId || null,
        packageName: bookingPrefill.packageName || null,
        listedPrice: baseAmount,
        inquiryType: form.intent,
        startDate: form.startDate,
        endDate: serviceType === 'rental' ? form.endDate : form.startDate,
        time: form.time,
        pickupLocation: form.location,
        dropoffLocation: form.location,
        deliveryMode: form.deliveryMode,
        extras: selectedAddOns,
        specialRequests: [form.issueDescription, form.specialRequests].filter(Boolean).join(' | '),
        totalAmount: totalAmount || baseAmount || 0,
        customerInfo: form.customerInfo,
        paymentMethod: 'pending_selection'
      };

      const result = await createBooking(payload);
      if (result?.success && result?.booking?.id) {
        addNotification('Service order submitted successfully.', 'success');
        navigate(`${ROUTES.BOOKING_CONFIRMATION}?id=${result.booking.id}`);
      } else {
        addNotification('Unable to create order. Please try again.', 'error');
      }
    } catch (err) {
      addNotification(err?.message || 'Failed to submit order.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="service-checkout-page">
      <section className="service-checkout-hero">
        <div className="container">
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
          <div className="service-checkout-breadcrumbs">
            <Link to={ROUTES.SERVICES}>Services</Link>
            <span>•</span>
            <span>{meta.title}</span>
          </div>
        </div>
      </section>

      <section className="service-checkout-content">
        <div className="container service-checkout-grid">
          <div className="service-checkout-main">
            <div className="service-step-bar">
              <span className={step >= 1 ? 'active' : ''}>1. Service</span>
              <span className={step >= 2 ? 'active' : ''}>2. Add-ons & Info</span>
              <span className={step >= 3 ? 'active' : ''}>3. Confirm</span>
            </div>

            {step === 1 && (
              <div className="service-step-panel">
                <h2>Service Configuration</h2>
                <div className="form-row two-col">
                  <Select
                    label="Intent"
                    value={form.intent}
                    onChange={(e) => updateForm('intent', e.target.value)}
                    options={meta.intents}
                  />
                  <Select
                    label="Location"
                    value={form.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                    options={LOCATIONS}
                  />
                </div>

                <div className="form-row two-col">
                  <Input
                    label="Start Date"
                    type="date"
                    value={form.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateForm('startDate', e.target.value)}
                  />
                  {serviceType === 'rental' ? (
                    <Input
                      label="End Date"
                      type="date"
                      value={form.endDate}
                      min={form.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => updateForm('endDate', e.target.value)}
                    />
                  ) : (
                    <Select
                      label="Preferred Time"
                      value={form.time}
                      onChange={(e) => updateForm('time', e.target.value)}
                      options={[
                        { value: '09:00 AM', label: '09:00 AM' },
                        { value: '11:00 AM', label: '11:00 AM' },
                        { value: '01:00 PM', label: '01:00 PM' },
                        { value: '03:00 PM', label: '03:00 PM' }
                      ]}
                    />
                  )}
                </div>

                <div className="form-row two-col">
                  <Select
                    label="Delivery Mode"
                    value={form.deliveryMode}
                    onChange={(e) => updateForm('deliveryMode', e.target.value)}
                    options={DELIVERY_OPTIONS}
                  />
                  {serviceType === 'car_wash' && (
                    <Select
                      label="Vehicle Size"
                      value={form.vehicleSize}
                      onChange={(e) => updateForm('vehicleSize', e.target.value)}
                      options={[
                        { value: 'compact', label: 'Compact' },
                        { value: 'standard', label: 'Standard' },
                        { value: 'suv', label: 'SUV' },
                        { value: 'luxury', label: 'Luxury' }
                      ]}
                    />
                  )}
                  {serviceType === 'repair' && (
                    <Select
                      label="Urgency"
                      value={form.urgent ? 'urgent' : 'normal'}
                      onChange={(e) => updateForm('urgent', e.target.value === 'urgent')}
                      options={[
                        { value: 'normal', label: 'Normal Queue' },
                        { value: 'urgent', label: 'Urgent Priority' }
                      ]}
                    />
                  )}
                </div>

                {serviceType === 'repair' && (
                  <div className="form-row two-col">
                    <Input label="Vehicle Make" value={form.vehicleMake} onChange={(e) => updateForm('vehicleMake', e.target.value)} />
                    <Input label="Vehicle Model" value={form.vehicleModel} onChange={(e) => updateForm('vehicleModel', e.target.value)} />
                  </div>
                )}

                <div className="form-row">
                  <label className="textarea-label">Service Notes</label>
                  <textarea
                    className="service-textarea"
                    rows="4"
                    value={form.issueDescription}
                    onChange={(e) => updateForm('issueDescription', e.target.value)}
                    placeholder="Add any important notes for this service"
                  />
                </div>

                <div className="service-actions">
                  <Button variant="primary" onClick={nextStep}>{meta.primaryLabel}</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="service-step-panel">
                <h2>Add-ons and Customer Details</h2>
                <div className="service-addon-grid">
                  {meta.addOns.map((addon) => (
                    <label key={addon.id} className="service-addon-item">
                      <input
                        type="checkbox"
                        checked={selectedAddOns.some((item) => item.id === addon.id)}
                        onChange={() => toggleAddOn(addon)}
                      />
                      <div>
                        <strong>{addon.name}</strong>
                        <span>{addon.price > 0 ? `+${formatCurrency(addon.price)}` : 'Included / No charge'}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="form-row two-col">
                  <Input label="First Name" value={form.customerInfo.firstName} onChange={(e) => updateCustomer('firstName', e.target.value)} />
                  <Input label="Last Name" value={form.customerInfo.lastName} onChange={(e) => updateCustomer('lastName', e.target.value)} />
                </div>
                <div className="form-row two-col">
                  <Input label="Email" type="email" value={form.customerInfo.email} onChange={(e) => updateCustomer('email', e.target.value)} />
                  <Input label="Phone" type="tel" value={form.customerInfo.phone} onChange={(e) => updateCustomer('phone', e.target.value)} />
                </div>
                <div className="form-row">
                  <Input label="National ID / Passport" value={form.customerInfo.idNumber} onChange={(e) => updateCustomer('idNumber', e.target.value)} />
                </div>

                <div className="service-actions">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button variant="primary" onClick={nextStep}>Continue</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="service-step-panel">
                <h2>Review and Confirm</h2>
                <p>This order will be submitted and a confirmation email will be sent automatically.</p>
                <div className="service-actions">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button variant="primary" onClick={submitOrder} loading={saving} disabled={saving}>
                    {saving ? 'Submitting...' : 'Submit Service Order'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="service-checkout-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Service</span>
              <strong>{serviceType.replace('_', ' ')}</strong>
            </div>
            {(bookingPrefill.packageName || bookingPrefill.vehicleName) && (
              <div className="summary-row">
                <span>Selection</span>
                <strong>{bookingPrefill.packageName || bookingPrefill.vehicleName}</strong>
              </div>
            )}
            <div className="summary-row">
              <span>Base Amount</span>
              <strong>{formatCurrency(baseAmount)}</strong>
            </div>
            <div className="summary-row">
              <span>Add-ons</span>
              <strong>{formatCurrency(addOnTotal)}</strong>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ServiceCheckout;
