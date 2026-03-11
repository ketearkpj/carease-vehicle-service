// ===== src/Components/Common/Select.jsx =====
import React, { useState, useRef, useEffect } from 'react';
import '../../Styles/Select.css';

/**
 * Select Component - GOD MODE
 * 
 * @param {Object} props
 * @param {string} props.label - Select label
 * @param {string} props.name - Select name
 * @param {string|Array} props.value - Selected value(s)
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {Array} props.options - Options array (strings or {value, label, disabled, group} objects)
 * @param {string} props.placeholder - Placeholder option
 * @param {string} props.error - Error message
 * @param {string} props.success - Success message
 * @param {string} props.warning - Warning message
 * @param {string} props.helper - Helper text
 * @param {React.ReactNode} props.icon - Left icon
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.multiple - Allow multiple selection
 * @param {boolean} props.searchable - Enable search
 * @param {boolean} props.clearable - Enable clear button
 * @param {number} props.maxSelected - Maximum number of selectable items
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.variant - 'default' | 'filled' | 'outlined' | 'underlined'
 * @param {boolean} props.fullWidth - Full width select
 * @param {string} props.className - Additional CSS classes
 */
const Select = ({
  label,
  name,
  value = '',
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  error,
  success,
  warning,
  helper,
  icon,
  required = false,
  disabled = false,
  loading = false,
  multiple = false,
  searchable = false,
  clearable = false,
  maxSelected,
  size = 'md',
  variant = 'default',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const firstOption = optionsRef.current?.querySelector('.select-option');
          if (firstOption) firstOption.focus();
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
    setTouched(true);
    if (onBlur) onBlur();
  };

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      let newValues;

      if (currentValues.includes(optionValue)) {
        newValues = currentValues.filter(v => v !== optionValue);
      } else {
        if (maxSelected && currentValues.length >= maxSelected) {
          return;
        }
        newValues = [...currentValues, optionValue];
      }

      onChange?.({ target: { name, value: newValues } });
    } else {
      onChange?.({ target: { name, value: optionValue } });
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.({ target: { name, value: multiple ? [] : '' } });
    setSearchTerm('');
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

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value) && value.length > 0) {
      const selectedLabels = value.map(v => {
        const option = options.find(opt => 
          typeof opt === 'object' ? opt.value === v : opt === v
        );
        return typeof option === 'object' ? option.label : option;
      });
      return selectedLabels.join(', ');
    }

    if (!multiple && value) {
      const option = options.find(opt => 
        typeof opt === 'object' ? opt.value === value : opt === value
      );
      return typeof option === 'object' ? option.label : option;
    }

    return placeholder;
  };

  const filterOptions = (options) => {
    if (!searchTerm) return options;

    return options.filter(option => {
      if (typeof option === 'object') {
        return option.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               option.value?.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return option.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const groupedOptions = options.reduce((acc, option) => {
    if (typeof option === 'object' && option.group) {
      if (!acc[option.group]) acc[option.group] = [];
      acc[option.group].push(option);
    } else {
      if (!acc._ungrouped) acc._ungrouped = [];
      acc._ungrouped.push(option);
    }
    return acc;
  }, {});

  const filteredGroupedOptions = Object.entries(groupedOptions).reduce((acc, [group, groupOptions]) => {
    const filtered = filterOptions(groupOptions);
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {});

  const selectClasses = [
    'select-container',
    `select-${size}`,
    `select-${variant}`,
    getStatusClass(),
    focused ? 'select-focused' : '',
    disabled ? 'select-disabled' : '',
    loading ? 'select-loading' : '',
    fullWidth ? 'select-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group" ref={selectRef}>
      {/* Label */}
      {label && (
        <div className="label-wrapper">
          <label htmlFor={name} className="form-label">
            {label}
            {required && <span className="required-star">*</span>}
          </label>
          {multiple && Array.isArray(value) && maxSelected && (
            <span className="char-counter">
              {value.length}/{maxSelected}
            </span>
          )}
        </div>
      )}

      {/* Select Trigger */}
      <div
        className={selectClasses}
        onClick={handleToggle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${name}-options`}
        aria-disabled={disabled}
      >
        {/* Left Icon */}
        {icon && <span className="select-left-icon">{icon}</span>}

        {/* Display Value */}
        <span className={`select-value ${!value || (multiple && !value.length) ? 'placeholder' : ''}`}>
          {getDisplayValue()}
        </span>

        {/* Loading Spinner */}
        {loading && (
          <span className="select-loading-spinner">
            <span className="spinner"></span>
          </span>
        )}

        {/* Clear Button */}
        {clearable && value && (multiple ? value.length > 0 : true) && !loading && !disabled && (
          <button
            className="select-clear-btn"
            onClick={handleClear}
            tabIndex={-1}
            aria-label="Clear selection"
          >
            ×
          </button>
        )}

        {/* Dropdown Arrow */}
        <span className={`select-arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </span>

        {/* Status Icon */}
        {statusMessage && !loading && (
          <span className="select-status-icon">
            {statusMessage.icon}
          </span>
        )}
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          className="select-options"
          ref={optionsRef}
          role="listbox"
          id={`${name}-options`}
          aria-multiselectable={multiple}
        >
          {/* Search Input */}
          {searchable && (
            <div className="select-search">
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options */}
          <div className="options-list">
            {Object.keys(filteredGroupedOptions).length === 0 ? (
              <div className="no-options">No options found</div>
            ) : (
              Object.entries(filteredGroupedOptions).map(([group, groupOptions]) => (
                <React.Fragment key={group}>
                  {group !== '_ungrouped' && (
                    <div className="option-group-label">{group}</div>
                  )}
                  {groupOptions.map((option, index) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const isSelected = multiple
                      ? Array.isArray(value) && value.includes(optionValue)
                      : value === optionValue;
                    const isDisabled = typeof option === 'object' && option.disabled;

                    return (
                      <div
                        key={index}
                        className={`select-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => !isDisabled && handleSelect(optionValue)}
                        role="option"
                        aria-selected={isSelected}
                        tabIndex={isDisabled ? -1 : 0}
                      >
                        {multiple && (
                          <span className="checkbox">
                            {isSelected && '✓'}
                          </span>
                        )}
                        <span className="option-label">{optionLabel}</span>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </div>

          {/* Max Selected Indicator */}
          {multiple && maxSelected && Array.isArray(value) && value.length >= maxSelected && (
            <div className="max-selected">
              Maximum {maxSelected} items selected
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {statusMessage && (
        <div 
          className={`form-message message-${error ? 'error' : success ? 'success' : 'warning'}`}
          role={error ? 'alert' : 'status'}
        >
          <span className="message-icon">{statusMessage.icon}</span>
          <span className="message-text">{statusMessage.text}</span>
        </div>
      )}

      {/* Helper Text */}
      {helper && !error && !success && !warning && (
        <div className="form-helper">{helper}</div>
      )}
    </div>
  );
};

export default Select;