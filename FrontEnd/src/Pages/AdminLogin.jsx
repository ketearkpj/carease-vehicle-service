// src/pages/Admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../Components/Layout/AuthLayout';
import Input from '../Components/Common/Input';
import Button from '../Components/Common/Buttons';
import '../Styles/Admin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock authentication - replace with real API
    setTimeout(() => {
      if (formData.email === 'admin@carease.com' && formData.password === 'admin123') {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('role', 'admin');
        localStorage.setItem('user', JSON.stringify({ name: 'Admin User', email: formData.email }));
        navigate('/admin');
      } else if (formData.email === 'provider@carease.com' && formData.password === 'provider123') {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('role', 'provider');
        localStorage.setItem('user', JSON.stringify({ name: 'Provider User', email: formData.email }));
        navigate('/provider');
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <AuthLayout 
      title="Welcome Back"
      subtitle="Sign in to access your dashboard"
    >
      <form onSubmit={handleSubmit} className="admin-login-form">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="admin@carease.com"
          value={formData.email}
          onChange={handleChange}
          required
          icon="📧"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          icon="🔒"
        />

        <div className="form-row">
          <div className="form-checkbox">
            <input
              type="checkbox"
              name="remember"
              id="remember"
              checked={formData.remember}
              onChange={handleChange}
            />
            <label htmlFor="remember">Remember me</label>
          </div>

          <a href="#" className="forgot-password">Forgot Password?</a>
        </div>

        <Button 
          type="submit" 
          variant="gold" 
          size="lg"
          block
          loading={loading}
        >
          Sign In
        </Button>
      </form>

      <div className="admin-login-footer">
        <p>Demo Credentials:</p>
        <p>Admin: admin@carease.com / admin123</p>
        <p>Provider: provider@carease.com / provider123</p>
      </div>
    </AuthLayout>
  );
};

export default AdminLogin;