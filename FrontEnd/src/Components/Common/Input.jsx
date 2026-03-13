// ===== src/Components/Common/Input.jsx =====
import React, { useState, useRef, useEffect } from 'react';
import '../../Styles/Input.css';

/**
 * Input Component - GOD MODE
 * 
 * @param {Object} props
 * @param {string} props.type - 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'date' | 'time'
 * @param {string} props.label - Input label
 * @param {string} props.name - Input name
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {Function} props.onFocus - Focus handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {string} props.success - Success message
 * @param {string} props.warning - Warning message
 * @param {string} props.helper - Helper text
 * @param {React.ReactNode} props.icon - Left icon
 * @param {React.ReactNode} props.iconRight - Right icon
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.readOnly - Read only state
 * @param {boolean} props.loading - Loading state
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.variant - 'default' | 'filled' | 'outlined' | 'underlined'
 * @param {boolean} props.fullWidth - Full width input
 * @param {string} props.pattern - Regex pattern for validation
 * @param {number} props.minLength - Minimum length
 * @param {number} props.maxLength - Maximum length
 * @param {string} props.autocomplete - Autocomplete attribute
 * @param {string} props.className - Additional CSS classes
 */
const Input = ({
  type = 'text',
  label,
  name,
  value = '',
  onChange,
  onBlur,
  onFocus,
  placeholder,
  error,
  success,
  warning,
  helper,
  icon,
  iconRight,
  required = false,
  disabled = false,
  readOnly = false,
  loading = false,
  size = 'md',
  variant = 'default',
  fullWidth = true,
  pattern,
  minLength,
  maxLength,
  autocomplete,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value) {
      setCharCount(value.length);
    }
  }, [value]);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const handleFocus = (e) => {
    setFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    if (onChange) onChange(e);
    setCharCount(e.target.value.length);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    // Maintain focus after toggle
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const getStatusClass = () => {
    if (error) return 'has-error';
    if (success) return 'has-success';
    if (warning) return 'has-warning';
    return '';
  };

  const getStatusMessage = () => {
    if (error) return { text: error, icon: '⚠️' };
    if (success) return { text: success, icon: '✓' };
    if (warning) return { text: warning, icon: '!' };
    return null;
  };

  const statusMessage = getStatusMessage();

  const inputClasses = [
    'form-input',
    `input-${size}`,
    `input-${variant}`,
    getStatusClass(),
    icon ? 'has-left-icon' : '',
    (iconRight || type === 'password') ? 'has-right-icon' : '',
    focused ? 'input-focused' : '',
    loading ? 'input-loading' : '',
    fullWidth ? 'input-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    'input-wrapper',
    fullWidth ? 'wrapper-full-width' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {/* Label */}
      {label && (
        <div className="label-wrapper">
          <label htmlFor={name} className="form-label">
            {label}
            {required && <span className="required-star">*</span>}
          </label>
          {maxLength && (
            <span className={`char-counter ${charCount >= maxLength ? 'char-limit' : ''}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      {/* Input Wrapper */}
      <div className={wrapperClasses}>
        {/* Left Icon */}
        {icon && <span className="input-left-icon">{icon}</span>}
        
        {/* Input Element */}
        <input
          ref={inputRef}
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || loading}
          readOnly={readOnly}
          required={required}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autocomplete}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${name}-error` : 
            success ? `${name}-success` : 
            helper ? `${name}-helper` : undefined
          }
          {...props}
        />
        
        {/* Loading Spinner */}
        {loading && (
          <span className="input-loading-spinner">
            <span className="spinner"></span>
          </span>
        )}
        
        {/* Right Icon (custom) */}
        {iconRight && !loading && type !== 'password' && (
          <span className="input-right-icon">{iconRight}</span>
        )}
        
        {/* Password Toggle */}
        {type === 'password' && !loading && (
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
            tabIndex="-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
        
        {/* Input Status Indicator */}
        {statusMessage && !loading && type !== 'password' && !iconRight && (
          <span className="input-status-icon">
            {statusMessage.icon}
          </span>
        )}
      </div>
      
      {/* Status Messages */}
      {statusMessage && (
        <div 
          id={`${name}-${error ? 'error' : success ? 'success' : 'warning'}`}
          className={`form-message message-${error ? 'error' : success ? 'success' : 'warning'}`}
          role={error ? 'alert' : 'status'}
        >
          <span className="message-icon">{statusMessage.icon}</span>
          <span className="message-text">{statusMessage.text}</span>
        </div>
      )}
      
      {/* Helper Text */}
      {helper && !error && !success && !warning && (
        <div id={`${name}-helper`} className="form-helper">
          {helper}
        </div>
      )}
    </div>
  );
};

export default Input;
