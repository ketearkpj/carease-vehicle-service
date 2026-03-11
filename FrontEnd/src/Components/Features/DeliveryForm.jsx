// ===== src/Components/Features/DeliveryForm.jsx =====
import React, { useState, useEffect } from 'react';
import '../../Styles/Features.css';
import Input from '../Common/Input';
import Button from '../Common/Button';
import LocationPicker from './LocationPicker';
import { validateAddress, validatePostalCode } from '../../Utils/validation';
import { getDeliveryEstimate, saveDeliveryAddress } from '../../Services/LocationService';

const DeliveryForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  className = '',
  ...props
}) => {
  const [formData, setFormData] = useState({
    addressLine1: initialData.addressLine1 || '',
    addressLine2: initialData.addressLine2 || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postalCode: initialData.postalCode || '',
    country: initialData.country || 'USA',
    instructions: initialData.instructions || '',
    contactName: initialData.contactName || '',
    contactPhone: initialData.contactPhone || '',
    saveAddress: initialData.saveAddress || false,
    addressName: initialData.addressName || ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [calculatingEstimate, setCalculatingEstimate] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const usStates = [
    { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAddressComplete()) calculateEstimate();
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.addressLine1, formData.city, formData.state, formData.postalCode]);

  const isAddressComplete = () => {
    return formData.addressLine1 && formData.city && formData.state && formData.postalCode;
  };

  const calculateEstimate = async () => {
    if (!isAddressComplete()) return;
    setCalculatingEstimate(true);
    try {
      const fullAddress = `${formData.addressLine1}, ${formData.city}, ${formData.state} ${formData.postalCode}`;
      const estimate = await getDeliveryEstimate(
        { lat: 34.0736, lng: -118.4004 },
        fullAddress
      );
      setDeliveryEstimate(estimate);
    } catch (error) {
      console.error('Failed to calculate estimate:', error);
    } finally {
      setCalculatingEstimate(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'addressLine1':
        if (!value || value.trim().length < 5) error = 'Please enter a valid street address';
        break;
      case 'city':
        if (!value || value.trim().length < 2) error = 'Please enter a valid city';
        break;
      case 'state':
        if (!value) error = 'Please select a state';
        break;
      case 'postalCode':
        if (!validatePostalCode(value, formData.country)) error = 'Please enter a valid postal code';
        break;
      case 'contactName':
        if (!value || value.trim().length < 2) error = 'Please enter a contact name';
        break;
      case 'contactPhone':
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) error = 'Please enter a valid phone number';
        break;
      case 'addressName':
        if (formData.saveAddress && (!value || value.trim().length < 2)) {
          error = 'Please enter a name for this address';
        }
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ['addressLine1', 'city', 'state', 'postalCode', 'contactName', 'contactPhone'];
    if (formData.saveAddress) fields.push('addressName');

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
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (formData.saveAddress) {
      try {
        await saveDeliveryAddress(formData.addressName, { ...formData, location: selectedLocation });
      } catch (error) {
        console.error('Failed to save address:', error);
      }
    }

    if (onSubmit) await onSubmit({ ...formData, location: selectedLocation, estimate: deliveryEstimate });
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      addressLine1: location.address,
      city: location.city,
      state: location.state,
      postalCode: location.postalCode,
      country: location.country || 'USA'
    }));
    setShowLocationPicker(false);
  };

  return (
    <div className={`delivery-form-container ${className}`} {...props}>
      {showLocationPicker && (
        <LocationPicker onSelect={handleLocationSelect} onClose={() => setShowLocationPicker(false)} />
      )}

      <form onSubmit={handleSubmit} className="delivery-form">
        <h3 className="form-heading">Delivery Information</h3>
        <p className="form-subheading">Where should we deliver your vehicle?</p>

        <div className="form-section">
          <h4 className="section-title">Delivery Address</h4>
          <Button type="button" variant="outline" size="sm" icon="📍" onClick={() => setShowLocationPicker(true)} className="use-location-btn">
            Pick from Map
          </Button>

          <div className="form-row">
            <div className="form-col">
              <Input
                label="Street Address"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.addressLine1 && errors.addressLine1}
                required
                icon="🏠"
                placeholder="123 Main St"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <Input
                label="Apt/Suite/Unit (Optional)"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                icon="🚪"
                placeholder="Apt 4B"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.city && errors.city}
                required
                icon="🏙️"
                placeholder="Los Angeles"
              />
            </div>
            <div className="form-col">
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-select ${touched.state && errors.state ? 'error' : ''}`}
                required
              >
                <option value="">Select State</option>
                {usStates.map(state => (
                  <option key={state.value} value={state.value}>{state.label}</option>
                ))}
              </select>
              {touched.state && errors.state && <div className="error-message">{errors.state}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <Input
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.postalCode && errors.postalCode}
                required
                icon="📮"
                placeholder="90210"
              />
            </div>
            <div className="form-col">
              <select name="country" value={formData.country} onChange={handleChange} className="form-select">
                <option value="USA">United States</option>
                <option value="CAN">Canada</option>
              </select>
            </div>
          </div>
        </div>

        {deliveryEstimate && (
          <div className="delivery-estimate">
            <h4 className="estimate-title">Delivery Estimate</h4>
            <div className="estimate-details">
              <div className="estimate-item">
                <span className="estimate-label">Distance:</span>
                <span className="estimate-value">{deliveryEstimate.distance.text}</span>
              </div>
              <div className="estimate-item">
                <span className="estimate-label">Estimated Time:</span>
                <span className="estimate-value">{deliveryEstimate.duration.text}</span>
              </div>
              <div className="estimate-item highlight">
                <span className="estimate-label">Delivery Cost:</span>
                <span className="estimate-value">${deliveryEstimate.cost.total}</span>
              </div>
            </div>
          </div>
        )}

        {calculatingEstimate && (
          <div className="calculating-estimate">
            <span className="spinner"></span>
            <span>Calculating delivery estimate...</span>
          </div>
        )}

        <div className="form-section">
          <h4 className="section-title">Contact Information</h4>
          <div className="form-row">
            <div className="form-col">
              <Input
                label="Contact Name"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.contactName && errors.contactName}
                required
                icon="👤"
                placeholder="John Doe"
                helper="Person receiving the delivery"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <Input
                label="Contact Phone"
                name="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.contactPhone && errors.contactPhone}
                required
                icon="📞"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="textarea-label">Delivery Instructions (Optional)</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Gate code, buzzer number, special instructions..."
                rows="3"
                className="instructions-textarea"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <label className="save-address-checkbox">
            <input type="checkbox" name="saveAddress" checked={formData.saveAddress} onChange={handleChange} />
            <span className="checkbox-text">Save this address to my account for future deliveries</span>
          </label>
          {formData.saveAddress && (
            <div className="form-row fade-in">
              <div className="form-col">
                <Input
                  label="Address Name"
                  name="addressName"
                  value={formData.addressName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.addressName && errors.addressName}
                  required
                  icon="🏷️"
                  placeholder="Home, Work, etc."
                />
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <Button type="submit" variant="primary" size="lg" loading={loading} disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Delivery Details'}
          </Button>
          {onCancel && <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>}
        </div>
      </form>
    </div>
  );
};

export default DeliveryForm;