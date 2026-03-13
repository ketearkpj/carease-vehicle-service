// ===== src/Components/Features/VehicleCard.jsx =====
import React, { useState } from 'react';
import Card from '../Common/Card';
import Button from '../Common/Button';
import { formatCurrency } from '../../Utils/format';
import '../../Styles/Features.css';

/**
 * VehicleCard Component - GOD MODE
 * 
 * @param {Object} props
 * @param {string} props.id - Vehicle ID
 * @param {string} props.name - Vehicle name
 * @param {string} props.price - Vehicle price
 * @param {string} props.image - Vehicle image
 * @param {string} props.category - Vehicle category
 * @param {Array} props.specs - Vehicle specifications
 * @param {Object} props.rating - Rating object { value, count }
 * @param {boolean} props.available - Availability status
 * @param {string} props.badge - Badge text
 * @param {string} props.linkTo - Link path
 * @param {string} props.variant - 'default' | 'compact' | 'featured' | 'gallery'
 * @param {Function} props.onClick - Click handler
 * @param {Function} props.onFavorite - Favorite handler
 * @param {boolean} props.isFavorite - Favorite status
 * @param {string} props.className - Additional CSS classes
 */
const VehicleCard = ({
  id,
  name,
  price,
  image,
  category,
  specs = [],
  rating,
  available = true,
  badge,
  pricePeriod = '/day',
  variant = 'default',
  onClick,
  onQuickView,
  onQuickBook,
  onBuy,
  onContact,
  showActionGrid = false,
  onFavorite,
  isFavorite = false,
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorite) onFavorite(id);
  };

  const handleViewDetails = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onQuickView) return onQuickView(id);
    if (onClick) return onClick(id);
  };

  const handleQuickBookClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickBook) onQuickBook(id);
  };

  const handleBuyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBuy) onBuy(id);
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContact) onContact(id);
  };

  const formatPrice = (price) => {
    if (typeof price === 'string') return price;
    return formatCurrency(price);
  };

  const vehicleClasses = [
    'vehicle-card',
    `vehicle-${variant}`,
    !available ? 'vehicle-unavailable' : '',
    isHovered ? 'hovered' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Card
      variant={variant === 'featured' ? 'interactive' : variant}
      hover={true}
      onClick={handleViewDetails}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={vehicleClasses}
      {...props}
    >
      {/* Image Section */}
      <div className="vehicle-image-section">
        <div className={`vehicle-image-wrapper ${imageLoaded ? 'loaded' : 'loading'}`}>
          {!imageLoaded && !imageError && (
            <div className="vehicle-image-placeholder">
              <span className="placeholder-icon">🚗</span>
            </div>
          )}
          
          {imageError ? (
            <div className="vehicle-image-error">
              <span className="error-icon">📷</span>
              <span>Image not available</span>
            </div>
          ) : (
            <img 
              src={image} 
              alt={name}
              className="vehicle-image"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}

          {/* Image Overlay */}
          <div className="vehicle-image-overlay">
            {!available && (
              <div className="availability-badge unavailable">
                <span className="badge-text">Currently Unavailable</span>
              </div>
            )}
            
            {badge && available && (
              <div className="vehicle-badge">
                <span className="badge-text">{badge}</span>
                <span className="badge-glow"></span>
              </div>
            )}

            {/* Favorite Button */}
            {onFavorite && (
              <button 
                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <span className="favorite-icon">{isFavorite ? '❤️' : '🤍'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tag */}
        {category && (
          <div className="vehicle-category">
            <span className="category-icon">
              {category === 'Supercar' ? '🏎️' : 
               category === 'Luxury' ? '👑' : 
               category === 'Sports' ? '🏁' : '🚗'}
            </span>
            <span className="category-name">{category}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="vehicle-content">
        <h3 className="vehicle-name">{name}</h3>
        
        {/* Rating */}
        {rating && (
          <div className="vehicle-rating">
            <span className="rating-stars">
              {'★'.repeat(Math.floor(rating.value))}
              {rating.value % 1 !== 0 && '½'}
            </span>
            <span className="rating-value">{rating.value}</span>
            <span className="rating-count">({rating.count})</span>
          </div>
        )}

        {/* Specifications */}
        {specs.length > 0 && (
          <div className="vehicle-specs">
            {specs.map((spec, index) => (
              <div key={index} className="spec-item">
                <span className="spec-dot"></span>
                <span className="spec-text">{spec}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="vehicle-price-section">
          <div className="vehicle-price">
            <span className="price-label">from</span>
            <span className="price-amount">{formatPrice(price)}</span>
            {pricePeriod && <span className="price-period">{pricePeriod}</span>}
          </div>
        </div>

        {showActionGrid && (
          <div className="vehicle-action-grid" onClick={(e) => e.stopPropagation()}>
            <Button variant="primary" size="sm" fullWidth onClick={handleViewDetails}>
              View Details
            </Button>
            <Button variant="success" size="sm" fullWidth onClick={handleQuickBookClick}>
              Book Now
            </Button>
            <Button variant="outline" size="sm" fullWidth onClick={handleBuyClick}>
              Buy
            </Button>
            <Button variant="secondary" size="sm" fullWidth onClick={handleContactClick}>
              Contact
            </Button>
          </div>
        )}

      </div>

      {/* Unavailable Overlay */}
      {!available && (
        <div className="unavailable-overlay">
          <span className="unavailable-text">Booked</span>
        </div>
      )}
    </Card>
  );
};

export default VehicleCard;
