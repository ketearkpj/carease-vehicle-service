// ===== src/Components/Common/Card.jsx =====
import React, { useState } from 'react';
import '../../Styles/Card.css';

/**
 * Card Component - GOD MODE
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.variant - 'default' | 'horizontal' | 'compact' | 'interactive' | 'gradient'
 * @param {string} props.image - Image URL
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle
 * @param {string} props.description - Card description
 * @param {Object} props.price - Price object { amount: string|number, period: string, currency: string }
 * @param {string} props.badge - Badge text
 * @param {string} props.badgeVariant - 'gold' | 'success' | 'error' | 'warning' | 'info'
 * @param {Array} props.features - List of features
 * @param {React.ReactNode} props.footer - Footer content
 * @param {React.ReactNode} props.actions - Action buttons
 * @param {boolean} props.hover - Enable hover effects (default: true)
 * @param {boolean} props.clickable - Make card clickable
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props - Additional props
 */
const Card = ({
  children,
  variant = 'default',
  image,
  title,
  subtitle,
  description,
  price,
  badge,
  badgeVariant = 'gold',
  features = [],
  footer,
  actions,
  hover = true,
  clickable = false,
  onClick,
  loading = false,
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleImageLoad = () => setImageLoaded(true);

  const cardClasses = [
    'card',
    `card-${variant}`,
    hover ? 'card-hover' : '',
    (clickable || onClick) ? 'card-clickable' : '',
    loading ? 'card-loading' : '',
    isHovered ? 'card-hovered' : '',
    className
  ].filter(Boolean).join(' ');

  const renderPrice = () => {
    if (!price) return null;
    
    const { amount, period, currency = '$' } = price;
    
    return (
      <div className="card-price">
        <span className="price-currency">{currency}</span>
        <span className="price-amount">{amount}</span>
        {period && <span className="price-period">/{period}</span>}
      </div>
    );
  };

  const renderBadge = () => {
    if (!badge) return null;
    
    return (
      <div className={`card-badge badge-${badgeVariant}`}>
        <span className="badge-text">{badge}</span>
        <span className="badge-glow"></span>
      </div>
    );
  };

  const renderFeatures = () => {
    if (!features.length) return null;
    
    return (
      <div className="card-features">
        {features.map((feature, index) => (
          <div key={index} className="card-feature">
            <svg className="feature-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="feature-text">{feature}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderImage = () => {
    if (!image) return null;
    
    return (
      <div className={`card-image-wrapper ${imageLoaded ? 'loaded' : 'loading'}`}>
        {!imageLoaded && (
          <div className="image-placeholder">
            <span className="placeholder-icon">🖼️</span>
          </div>
        )}
        <img 
          src={image} 
          alt={title || 'Card image'} 
          className="card-image"
          onLoad={handleImageLoad}
          loading="lazy"
        />
        {renderBadge()}
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`card card-loading-skeleton ${variant}`}>
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={clickable || onClick ? 'button' : 'article'}
      tabIndex={clickable || onClick ? 0 : undefined}
      aria-label={clickable || onClick ? `View details for ${title}` : undefined}
      {...props}
    >
      {/* Card Glow Effect */}
      <div className="card-glow"></div>
      
      {/* Card Background Pattern */}
      <div className="card-pattern"></div>
      
      {/* Image Section */}
      {renderImage()}
      
      {/* Content Section */}
      <div className="card-content">
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
        {title && <h3 className="card-title">{title}</h3>}
        {description && <p className="card-description">{description}</p>}
        
        {renderPrice()}
        {renderFeatures()}
        
        {children}
      </div>
      
      {/* Footer Section */}
      {(footer || actions) && (
        <div className="card-footer">
          {footer}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
    </div>
  );
};

export default Card;