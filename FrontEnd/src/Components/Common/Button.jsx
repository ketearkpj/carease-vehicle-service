// ===== src/Components/Common/Button.jsx =====
import React, { useState } from 'react';
import '../../Styles/Button.css';

/**
 * Button Component - GOD MODE
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
 * @param {string} props.size - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} props.fullWidth - Full width button
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {React.ReactNode} props.icon - Icon element (left side)
 * @param {React.ReactNode} props.iconRight - Icon element (right side)
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - 'button' | 'submit' | 'reset'
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.href - If provided, renders as Link
 * @param {Object} props - Additional props
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconRight,
  onClick,
  type = 'button',
  className = '',
  href,
  ...props
}) => {
  const [rippleEffect, setRippleEffect] = useState({ show: false, x: 0, y: 0 });

  const handleClick = (e) => {
    if (loading || disabled) return;

    // Ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    setRippleEffect({
      show: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    setTimeout(() => setRippleEffect({ show: false, x: 0, y: 0 }), 600);

    if (onClick) onClick(e);
  };

  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    loading ? 'btn-loading' : '',
    (!children && (icon || iconRight)) ? 'btn-icon-only' : '',
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {/* Ripple Effect */}
      {rippleEffect.show && (
        <span 
          className="btn-ripple"
          style={{ left: rippleEffect.x, top: rippleEffect.y }}
        />
      )}

      {/* Loading Spinner */}
      {loading && (
        <span className="btn-spinner">
          <span className="spinner"></span>
        </span>
      )}

      {/* Left Icon */}
      {icon && !loading && (
        <span className="btn-icon-left">{icon}</span>
      )}

      {/* Button Text */}
      {children && (
        <span className="btn-text">{children}</span>
      )}

      {/* Right Icon */}
      {iconRight && !loading && (
        <span className="btn-icon-right">{iconRight}</span>
      )}
    </>
  );

  // If href is provided, render as anchor tag
  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        onClick={handleClick}
        {...props}
      >
        {content}
      </a>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;