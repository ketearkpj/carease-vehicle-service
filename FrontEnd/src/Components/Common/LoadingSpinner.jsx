// ===== src/Components/Common/LoadingSpinner.jsx =====
import React, { useEffect, useState } from 'react';
import '../../Styles/LoadingSpinner.css';

/**
 * LoadingSpinner Component - GOD MODE
 * 
 * @param {Object} props
 * @param {string} props.size - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.color - 'gold' | 'white' | 'black' | 'primary' | 'secondary'
 * @param {boolean} props.fullScreen - Full screen overlay
 * @param {string} props.text - Loading text
 * @param {string} props.variant - 'spinner' | 'dots' | 'pulse' | 'ring' | 'progress'
 * @param {number} props.progress - Progress percentage (0-100) for progress variant
 * @param {boolean} props.overlay - Show overlay background
 * @param {number} props.blur - Blur intensity for overlay (0-10)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Accessibility label
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'gold',
  fullScreen = false,
  text = 'Loading...',
  variant = 'spinner',
  progress = 0,
  overlay = true,
  blur = 5,
  className = '',
  label = 'Loading content',
  ...props
}) => {
  const [showText, setShowText] = useState(false);
  const [progressValue, setProgressValue] = useState(progress);

  // Show text after delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Animate progress
  useEffect(() => {
    if (variant === 'progress') {
      const timer = setTimeout(() => {
        setProgressValue(prev => Math.min(prev + 1, progress));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [progressValue, progress, variant]);

  const spinnerClasses = [
    'loading-spinner',
    `spinner-${variant}`,
    `spinner-${size}`,
    `spinner-${color}`,
    fullScreen ? 'spinner-fullscreen' : '',
    overlay ? 'spinner-with-overlay' : '',
    className
  ].filter(Boolean).join(' ');

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="spinner-dots">
            <span className="dot dot-1"></span>
            <span className="dot dot-2"></span>
            <span className="dot dot-3"></span>
            <span className="dot dot-4"></span>
          </div>
        );

      case 'pulse':
        return (
          <div className="spinner-pulse">
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
          </div>
        );

      case 'ring':
        return (
          <div className="spinner-ring-container">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
          </div>
        );

      case 'progress':
        return (
          <div className="spinner-progress">
            <div className="progress-track">
              <div 
                className="progress-fill"
                style={{ width: `${progressValue}%` }}
              >
                <div className="progress-glow"></div>
              </div>
            </div>
            <span className="progress-text">{progressValue}%</span>
          </div>
        );

      case 'spinner':
      default:
        return (
          <div className="spinner-default">
            <div className="spinner-blade blade-1"></div>
            <div className="spinner-blade blade-2"></div>
            <div className="spinner-blade blade-3"></div>
            <div className="spinner-blade blade-4"></div>
            <div className="spinner-blade blade-5"></div>
            <div className="spinner-blade blade-6"></div>
            <div className="spinner-blade blade-7"></div>
            <div className="spinner-blade blade-8"></div>
          </div>
        );
    }
  };

  const spinnerContent = (
    <div 
      className="spinner-content"
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      {renderSpinner()}
      {text && showText && (
        <p className="spinner-text">
          <span className="text-content">{text}</span>
          <span className="text-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className={`spinner-overlay ${overlay ? 'with-overlay' : ''}`}
        style={{ backdropFilter: overlay ? `blur(${blur}px)` : 'none' }}
      >
        <div className="spinner-container">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-wrapper">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;