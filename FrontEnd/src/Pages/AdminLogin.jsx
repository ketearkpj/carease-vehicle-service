// ===== src/Pages/AdminLogin.jsx =====
import React, { useState } from 'react';

// Components
import Button from '../Components/Common/Button';
import Input from '../Components/Common/Input';
import Card from '../Components/Common/Card';

// Services
import { adminLogin } from '../Services/AdminService';

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
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="brand-content">
            <h1 className="brand-logo">
              CAR<span className="gold-text">EASE</span>
            </h1>
            <p className="brand-tagline">Admin Portal</p>
            
            <div className="brand-features">
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span>Dashboard Analytics</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📅</span>
                <span>Booking Management</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💰</span>
                <span>Payment Processing</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🚗</span>
                <span>Vehicle Inventory</span>
              </div>
            </div>

            <div className="brand-footer">
              <p>Secure access for authorized personnel only</p>
              <div className="security-badge">🔒 SSL Encrypted</div>
            </div>
          </div>
          <div className="brand-background"></div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="login-form-card">
          <div className="form-header">
            <h2 className="form-title">Admin Login</h2>
            <p className="form-subtitle">Enter your credentials to access the dashboard</p>
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
                icon="✉️"
                placeholder="admin@carease.co.ke"
              />
            </div>

            <div className="form-group">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && errors.password}
                required
                icon="🔒"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
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
              <p className="demo-title">Demo Credentials</p>
              <p className="demo-item">
                <span>Email:</span> admin@carease.co.ke
              </p>
              <p className="demo-item">
                <span>Password:</span> admin123
              </p>
              <p className="demo-note">* For demo purposes only</p>
            </div>
          </form>

          <div className="form-footer">
            <p>Need help? Contact IT Support</p>
            <a href="mailto:it@carease.co.ke">it@carease.co.ke</a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
