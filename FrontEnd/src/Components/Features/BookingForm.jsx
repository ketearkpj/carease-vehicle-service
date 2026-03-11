// ===== src/Components/Features/BookingForm.jsx =====
import React, { useState, useEffect } from 'react';
import '../../Styles/Features.css';
import Input from '../Common/Input';
import Button from '../Common/Button';
import Select from '../Common/Select';
import { validateEmail, validatePhone, validateDate } from '../../Utils/validations';
import { getAvailableTimeSlots } from '../../Services/BookingService';
import { getServiceLocations } from '../../Services/Service.Service';

const BookingForm = ({
  serviceType = 'rental',
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  className = '',
  ...props
}) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    date: initialData.date || '',
    time: initialData.time || '',
    location: initialData.location || '',
    vehicleId: initialData.vehicleId || '',
    serviceId: initialData.serviceId || '',
    duration: initialData.duration || 1,
    extras: initialData.extras || [],
    specialRequests: initialData.specialRequests || '',
    deliveryMethod: initialData.deliveryMethod || 'pickup',
    deliveryAddress: initialData.deliveryAddress || '',
    termsAccepted: initialData.termsAccepted || false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (formData.date) {
      fetchAvailableSlots(formData.date);
    }
  }, [formData.date]);

  useEffect(() => {
    const requiredFields = getRequiredFields();
    const filledFields = requiredFields.filter(field => 
      formData[field] && formData[field].toString().trim() !== ''
    ).length;
    setFormProgress(Math.round((filledFields / requiredFields.length) * 100));
  }, [formData]);

  const fetchLocations = async () => {
    try {
      const data = await getServiceLocations(serviceType);
      setLocations(data.map(loc => ({
        value: loc.id,
        label: loc.name,
        address: loc.address
      })));
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const fetchAvailableSlots = async (date) => {
    if (!date) return;
    setLoadingSlots(true);
    try {
      const slots = await getAvailableTimeSlots(date, serviceType);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      case 'firstName':
      case 'lastName':
        if (!value || value.trim().length < 2) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        }
        break;
      case 'email':
        if (!validateEmail(value)) error = 'Please enter a valid email address';
        break;
      case 'phone':
        if (!validatePhone(value)) error = 'Please enter a valid phone number';
        break;
      case 'date':
        if (!validateDate(value)) error = 'Please select a valid date';
        break;
      case 'time':
        if (!value) error = 'Please select a time slot';
        break;
      case 'location':
        if (!value) error = 'Please select a location';
        break;
      case 'vehicleId':
        if (serviceType === 'rental' && !value) error = 'Please select a vehicle';
        break;
      case 'deliveryAddress':
        if (formData.deliveryMethod === 'delivery' && !value) {
          error = 'Please enter delivery address';
        }
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const requiredFields = getRequiredFields();
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      const value = formData[field];
      if (!value || value.toString().trim() === '') {
        newErrors[field] = 'This field is required';
        isValid = false;
      } else {
        switch (field) {
          case 'email':
            if (!validateEmail(value)) {
              newErrors[field] = 'Invalid email format';
              isValid = false;
            }
            break;
          case 'phone':
            if (!validatePhone(value)) {
              newErrors[field] = 'Invalid phone number';
              isValid = false;
            }
            break;
        }
      }
    });

    if (!formData.termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const getRequiredFields = () => {
    const baseFields = ['firstName', 'lastName', 'email', 'phone', 'date', 'time', 'location'];
    if (serviceType === 'rental') baseFields.push('vehicleId');
    if (formData.deliveryMethod === 'delivery') baseFields.push('deliveryAddress');
    return baseFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (onSubmit) await onSubmit(formData);
  };

  const handleNextStep = () => {
    const steps = getSteps();
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getSteps = () => {
    const steps = [
      { number: 1, title: 'Personal Information' },
      { number: 2, title: serviceType === 'rental' ? 'Vehicle Selection' : 'Service Details' },
      { number: 3, title: 'Additional Options' }
    ];
    return steps;
  };

  const steps = getSteps();

  return (
    <div className={`booking-form-container ${className}`} {...props}>
      <div className="form-progress">
        <div className="progress-steps">
          {steps.map(step => (
            <div 
              key={step.number}
              className={`step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
              onClick={() => setCurrentStep(step.number)}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${formProgress}%` }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        {currentStep === 1 && (
          <div className="form-step fade-in">
            <h3 className="step-heading">Personal Information</h3>
            <p className="step-description">Tell us a bit about yourself</p>
            <div className="form-row">
              <div className="form-col">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstName && errors.firstName}
                  required
                  icon="👤"
                  placeholder="John"
                />
              </div>
              <div className="form-col">
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastName && errors.lastName}
                  required
                  icon="👤"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
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
                  helper="We'll send confirmation to this email"
                />
              </div>
              <div className="form-col">
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone && errors.phone}
                  required
                  icon="📞"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-step fade-in">
            <h3 className="step-heading">{serviceType === 'rental' ? 'Vehicle Selection' : 'Service Details'}</h3>
            <p className="step-description">
              {serviceType === 'rental' 
                ? 'Choose your preferred vehicle and rental period'
                : 'Select date, time, and location for your service'}
            </p>
            <div className="form-row">
              <div className="form-col">
                <Input
                  label="Service Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.date && errors.date}
                  required
                  icon="📅"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-col">
                <Select
                  label="Time Slot"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={availableSlots.map(slot => ({
                    value: slot,
                    label: slot,
                    disabled: !slot.available
                  }))}
                  error={touched.time && errors.time}
                  required
                  icon="⏰"
                  placeholder={loadingSlots ? 'Loading slots...' : 'Select time'}
                  loading={loadingSlots}
                  disabled={!formData.date || loadingSlots}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <Select
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={locations}
                  error={touched.location && errors.location}
                  required
                  icon="📍"
                  placeholder="Select location"
                />
              </div>
              {serviceType === 'rental' && (
                <div className="form-col">
                  <Select
                    label="Select Vehicle"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={[]}
                    error={touched.vehicleId && errors.vehicleId}
                    required
                    icon="🚗"
                    placeholder="Choose vehicle"
                  />
                </div>
              )}
            </div>
            {serviceType === 'rental' && (
              <div className="form-row">
                <div className="form-col">
                  <Input
                    label="Rental Duration (days)"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    max="30"
                    required
                    icon="📆"
                  />
                </div>
              </div>
            )}
            <div className="form-row">
              <div className="form-col">
                <div className="delivery-options">
                  <label className="delivery-option">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="pickup"
                      checked={formData.deliveryMethod === 'pickup'}
                      onChange={handleChange}
                    />
                    <span className="option-content">
                      <span className="option-icon">🏢</span>
                      <span className="option-text">
                        <strong>Pick up</strong>
                        <small>Collect from our location</small>
                      </span>
                    </span>
                  </label>
                  <label className="delivery-option">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={formData.deliveryMethod === 'delivery'}
                      onChange={handleChange}
                    />
                    <span className="option-content">
                      <span className="option-icon">🚚</span>
                      <span className="option-text">
                        <strong>Delivery</strong>
                        <small>We bring it to you</small>
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
            {formData.deliveryMethod === 'delivery' && (
              <div className="form-row">
                <div className="form-col">
                  <Input
                    label="Delivery Address"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.deliveryAddress && errors.deliveryAddress}
                    required
                    icon="🏠"
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-step fade-in">
            <h3 className="step-heading">Additional Options</h3>
            <p className="step-description">Customize your experience</p>
            <div className="extras-section">
              <h4 className="extras-title">Extras</h4>
              <div className="extras-grid">
                {serviceType === 'rental' && (
                  <>
                    <label className="extra-item">
                      <input
                        type="checkbox"
                        name="extras"
                        value="insurance"
                        checked={formData.extras.includes('insurance')}
                        onChange={(e) => {
                          const newExtras = e.target.checked
                            ? [...formData.extras, 'insurance']
                            : formData.extras.filter(e => e !== 'insurance');
                          setFormData(prev => ({ ...prev, extras: newExtras }));
                        }}
                      />
                      <span className="extra-content">
                        <span className="extra-name">Premium Insurance</span>
                        <span className="extra-price">+$50/day</span>
                      </span>
                    </label>
                    <label className="extra-item">
                      <input
                        type="checkbox"
                        name="extras"
                        value="gps"
                        checked={formData.extras.includes('gps')}
                        onChange={(e) => {
                          const newExtras = e.target.checked
                            ? [...formData.extras, 'gps']
                            : formData.extras.filter(e => e !== 'gps');
                          setFormData(prev => ({ ...prev, extras: newExtras }));
                        }}
                      />
                      <span className="extra-content">
                        <span className="extra-name">GPS Navigation</span>
                        <span className="extra-price">+$15/day</span>
                      </span>
                    </label>
                    <label className="extra-item">
                      <input
                        type="checkbox"
                        name="extras"
                        value="childSeat"
                        checked={formData.extras.includes('childSeat')}
                        onChange={(e) => {
                          const newExtras = e.target.checked
                            ? [...formData.extras, 'childSeat']
                            : formData.extras.filter(e => e !== 'childSeat');
                          setFormData(prev => ({ ...prev, extras: newExtras }));
                        }}
                      />
                      <span className="extra-content">
                        <span className="extra-name">Child Seat</span>
                        <span className="extra-price">+$10/day</span>
                      </span>
                    </label>
                  </>
                )}
                {serviceType === 'car_wash' && (
                  <>
                    <label className="extra-item">
                      <input
                        type="checkbox"
                        name="extras"
                        value="ceramic"
                        checked={formData.extras.includes('ceramic')}
                        onChange={(e) => {
                          const newExtras = e.target.checked
                            ? [...formData.extras, 'ceramic']
                            : formData.extras.filter(e => e !== 'ceramic');
                          setFormData(prev => ({ ...prev, extras: newExtras }));
                        }}
                      />
                      <span className="extra-content">
                        <span className="extra-name">Ceramic Coating</span>
                        <span className="extra-price">+$199</span>
                      </span>
                    </label>
                    <label className="extra-item">
                      <input
                        type="checkbox"
                        name="extras"
                        value="interior"
                        checked={formData.extras.includes('interior')}
                        onChange={(e) => {
                          const newExtras = e.target.checked
                            ? [...formData.extras, 'interior']
                            : formData.extras.filter(e => e !== 'interior');
                          setFormData(prev => ({ ...prev, extras: newExtras }));
                        }}
                      />
                      <span className="extra-content">
                        <span className="extra-name">Deep Interior Clean</span>
                        <span className="extra-price">+$79</span>
                      </span>
                    </label>
                  </>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <label className="textarea-label">Special Requests</label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Any special requirements or requests?"
                  rows="4"
                  className="special-requests-textarea"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <label className="terms-checkbox">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">
                    I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
                  </span>
                </label>
                {errors.terms && <div className="error-message">{errors.terms}</div>}
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevStep} disabled={loading}>
              ← Previous
            </Button>
          )}
          {currentStep < steps.length ? (
            <Button type="button" variant="primary" onClick={handleNextStep} disabled={loading}>
              Next →
            </Button>
          ) : (
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              {loading ? 'Processing...' : 'Complete Booking'}
            </Button>
          )}
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {currentStep === 3 && (
        <div className="booking-summary">
          <h4 className="summary-title">Booking Summary</h4>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Service:</span>
              <span className="summary-value">{serviceType.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Date:</span>
              <span className="summary-value">{formData.date}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Time:</span>
              <span className="summary-value">{formData.time}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Location:</span>
              <span className="summary-value">
                {locations.find(l => l.value === formData.location)?.label || formData.location}
              </span>
            </div>
            {serviceType === 'rental' && (
              <div className="summary-item">
                <span className="summary-label">Duration:</span>
                <span className="summary-value">{formData.duration} days</span>
              </div>
            )}
            {formData.extras.length > 0 && (
              <div className="summary-item">
                <span className="summary-label">Extras:</span>
                <span className="summary-value">{formData.extras.length} selected</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;