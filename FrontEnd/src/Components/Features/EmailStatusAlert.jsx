// ===== src/Components/Features/EmailStatusAlert.jsx =====
import React, { useState, useEffect } from 'react';
import '../../Styles/Features.css';

/**
 * EmailStatusAlert Component - GOD MODE
 * 
 * @param {Object} props
 * @param {string} props.status - 'success' | 'error' | 'warning' | 'info'
 * @param {string} props.message - Alert message
 * @param {string} props.title - Alert title
 * @param {Function} props.onClose - Close handler
 * @param {number} props.autoClose - Auto close duration in ms (0 to disable)
 * @param {string} props.position - 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom'
 * @param {boolean} props.showIcon - Show status icon
 * @param {boolean} props.dismissible - Show close button
 * @param {string} props.className - Additional CSS classes
 */
const EmailStatusAlert = ({
  status = 'info',
  message,
  title,
  onClose,
  autoClose = 5000,
  position = 'bottom-right',
  showIcon = true,
  dismissible = true,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  // Auto close timer
  useEffect(() => {
    if (autoClose <= 0 || !isVisible) return;

    const interval = 50;
    const steps = autoClose / interval;
    const decrement = 100 / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleClose();
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoClose, isVisible]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <div className="status-icon success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="status-icon error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round"/>
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="status-icon warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 7V13M12 17H12.01" strokeLinecap="round"/>
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="status-icon info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none"/>
              <path d="M12 8V12M12 16H12.01" strokeLinecap="round"/>
            </svg>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'var(--success)';
      case 'error': return 'var(--error)';
      case 'warning': return 'var(--warning)';
      case 'info': return 'var(--info)';
      default: return 'var(--gold-primary)';
    }
  };

  if (!isVisible) return null;

  const alertClasses = [
    'email-alert',
    `alert-${status}`,
    `alert-${position}`,
    isExiting ? 'exiting' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={alertClasses}
      role="alert"
      aria-live="assertive"
      {...props}
    >
      {/* Progress Bar */}
      {autoClose > 0 && (
        <div className="alert-progress">
          <div 
            className="progress-bar"
            style={{ 
              width: `${progress}%`,
              backgroundColor: getStatusColor()
            }}
          ></div>
        </div>
      )}

      <div className="alert-content">
        {/* Icon */}
        {showIcon && getStatusIcon()}

        {/* Text Content */}
        <div className="alert-text">
          {title && <h4 className="alert-title">{title}</h4>}
          {message && <p className="alert-message">{message}</p>}
        </div>

        {/* Close Button */}
        {dismissible && (
          <button 
            className="alert-close-btn"
            onClick={handleClose}
            aria-label="Close alert"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Glow Effect */}
      <div className="alert-glow" style={{ backgroundColor: getStatusColor() }}></div>
    </div>
  );
};

export default EmailStatusAlert;