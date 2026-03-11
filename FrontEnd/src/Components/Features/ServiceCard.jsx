// ===== src/Components/Features/ServiceCard.jsx =====
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../Common/Card';
import Button from '../Common/Button';
import '../../Styles/Features.css';

/**
 * ServiceCard Component - GOD MODE
 * 
 * @param {Object} props
 * @param {string} props.id - Service ID
 * @param {string} props.title - Service title
 * @param {string} props.description - Service description
 * @param {string} props.icon - Service icon
 * @param {Array} props.features - List of features
 * @param {string} props.image - Service image
 * @param {string} props.linkTo - Link path
 * @param {Object} props.price - Price object { amount, period, currency }
 * @param {string} props.badge - Badge text
 * @param {string} props.variant - 'default' | 'compact' | 'horizontal' | 'featured'
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
const ServiceCard = ({
  id,
  title,
  description,
  icon,
  features = [],
  image,
  linkTo,
  price,
  badge,
  variant = 'default',
  onClick,
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const cardContent = (
    <>
      {/* Icon or Image */}
      {icon && !image && (
        <div className={`service-icon-wrapper ${isHovered ? 'hovered' : ''}`}>
          <span className="service-icon">{icon}</span>
          <div className="service-icon-glow"></div>
        </div>
      )}

      {image && (
        <div className="service-image-wrapper">
          <img src={image} alt={title} className="service-image" />
          <div className="service-image-overlay"></div>
        </div>
      )}

      {/* Content */}
      <div className="service-content">
        {badge && (
          <div className="service-badge">
            <span className="badge-text">{badge}</span>
            <span className="badge-glow"></span>
          </div>
        )}

        <h3 className="service-title">{title}</h3>
        <p className="service-description">{description}</p>

        {/* Features */}
        {features.length > 0 && (
          <div className="service-features">
            {features.slice(0, 3).map((feature, index) => (
              <div key={index} className="service-feature">
                <svg className="feature-check" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{feature}</span>
              </div>
            ))}
            {features.length > 3 && (
              <div className="service-feature-more">
                +{features.length - 3} more
              </div>
            )}
          </div>
        )}

        {/* Price */}
        {price && (
          <div className="service-price">
            <span className="price-currency">{price.currency || '$'}</span>
            <span className="price-amount">{price.amount}</span>
            {price.period && <span className="price-period">/{price.period}</span>}
          </div>
        )}
      </div>

      {/* Hover Info (for featured variant) */}
      {variant === 'featured' && isHovered && (
        <div className="service-hover-info">
          <p className="hover-description">{description}</p>
          <div className="hover-features">
            {features.map((feature, index) => (
              <span key={index} className="hover-feature">{feature}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <Card
      variant={variant === 'featured' ? 'interactive' : variant}
      hover={true}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`service-card service-${variant} ${className}`}
      {...props}
    >
      {linkTo ? (
        <Link to={linkTo} className="service-card-link">
          {cardContent}
          <div className="service-card-overlay">
            <Button variant="primary" size="sm" className="learn-more-btn">
              Learn More →
            </Button>
          </div>
        </Link>
      ) : (
        cardContent
      )}
    </Card>
  );
};

export default ServiceCard;