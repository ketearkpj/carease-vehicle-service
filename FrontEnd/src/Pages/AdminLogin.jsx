// ===== src/Pages/AdminLogin.jsx =====
import React, { useState } from 'react';

// Components
import Button from '../Components/Common/Button';
import Input from '../Components/Common/Input';
import Card from '../Components/Common/Card';

// Hooks
import { useAdminAuth } from '../Hooks/useAdminAuth';
import { useApp } from '../Context/AppContext';

// Styles
import '../Styles/AdminLogin.css';

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const { addNotification } = useApp();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

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
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ['email', 'password'];
    const newErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field];
      if (!value) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password, formData.rememberMe);
      addNotification('Login successful!', 'success');
    } catch (error) {
      addNotification(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    addNotification('Password reset link sent to your email', 'info');
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-brand">
          <div className="brand-background"></div>
          <div className="brand-grid"></div>
          <div className="brand-content">
            <p className="brand-eyebrow">Control Center</p>
            <h1 className="brand-logo">
              CAR<span className="gold-text">EASE</span>
            </h1>
            <p className="brand-tagline">Administrative access for bookings, payments, fleet operations, and reporting.</p>

            <div className="brand-stat-strip">
              <div className="brand-stat">
                <span className="brand-stat-value">Bookings</span>
                <span className="brand-stat-label">Manage customer activity</span>
              </div>
              <div className="brand-stat">
                <span className="brand-stat-value">Payments</span>
                <span className="brand-stat-label">Track transactions and refunds</span>
              </div>
              <div className="brand-stat">
                <span className="brand-stat-value">Reports</span>
                <span className="brand-stat-label">Review operational performance</span>
              </div>
            </div>

            <div className="brand-notes">
              <div className="brand-note">
                <span className="brand-note-title">Protected Access</span>
                <span className="brand-note-text">Reserved for approved staff and demo administrators.</span>
              </div>
              <div className="brand-note">
                <span className="brand-note-title">Operational Visibility</span>
                <span className="brand-note-text">Designed to monitor bookings, vehicles, notifications, and service activity from one place.</span>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            <div className="security-badge">Secure session</div>
            <p>Use your admin credentials to continue into the CarEase dashboard.</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="login-form-card">
          <div className="form-header">
            <p className="form-kicker">Administrator Sign In</p>
            <h2 className="form-title">Admin Login</h2>
            <p className="form-subtitle">Enter your credentials to access the CarEase control center.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email}
                required
                placeholder="admin@carease.co.ke"
                autocomplete="email"
              />
            </div>

            <div className="form-group">
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && errors.password}
                required
                placeholder="Enter your password"
                autocomplete="current-password"
              />
            </div>

            <div className="form-options">
              <label className="remember-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-link"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </Button>

            <div className="demo-credentials">
              <p className="demo-title">Presentation Demo Access</p>
              <div className="demo-item">
                <span>Email</span>
                <strong>admin@carease.co.ke</strong>
              </div>
              <div className="demo-item">
                <span>Password</span>
                <strong>admin123</strong>
              </div>
              <p className="demo-note">Use these credentials for classroom presentation mode only.</p>
            </div>
          </form>

          <div className="form-footer">
            <p>Need help accessing the dashboard?</p>
            <a href="mailto:it@carease.co.ke">it@carease.co.ke</a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
