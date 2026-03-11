// ===== src/Components/Features/StatsSection.jsx =====
import React, { useState, useEffect, useRef } from 'react';
import '../../Styles/Features.css';

/**
 * StatsSection Component - GOD MODE
 * 
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects { id, value, label, icon, prefix, suffix }
 * @param {string} props.variant - 'default' | 'grid' | 'inline' | 'cards'
 * @param {boolean} props.animate - Enable counting animation
 * @param {number} props.duration - Animation duration in ms
 * @param {string} props.columns - Number of columns (1-4)
 * @param {string} props.className - Additional CSS classes
 */
const StatsSection = ({
  stats = [
    { id: 1, value: '500+', label: 'Luxury Vehicles', icon: '🚗' },
    { id: 2, value: '10K+', label: 'Happy Clients', icon: '👤' },
    { id: 3, value: '24/7', label: 'Concierge Support', icon: '⭐' },
    { id: 4, value: '15+', label: 'Years Excellence', icon: '🏆' }
  ],
  variant = 'default',
  animate = true,
  duration = 2000,
  columns = 4,
  className = '',
  ...props
}) => {
  const [animatedValues, setAnimatedValues] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animate numbers when visible
  useEffect(() => {
    if (!animate || !isVisible) return;

    const targets = {};
    stats.forEach(stat => {
      const numericValue = parseFloat(stat.value.toString().replace(/[^0-9.-]+/g, ''));
      if (!isNaN(numericValue)) {
        targets[stat.id] = numericValue;
      }
    });

    const animateValue = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const newValues = {};
      stats.forEach(stat => {
        const numericValue = parseFloat(stat.value.toString().replace(/[^0-9.-]+/g, ''));
        if (!isNaN(numericValue)) {
          const suffix = stat.value.toString().replace(/[0-9.-]+/g, '');
          const animated = Math.floor(numericValue * easedProgress);
          newValues[stat.id] = animated + suffix;
        } else {
          newValues[stat.id] = stat.value;
        }
      });

      setAnimatedValues(newValues);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateValue);
      }
    };

    animationRef.current = requestAnimationFrame(animateValue);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, stats, animate, duration]);

  const easeOutCubic = (t) => {
    return 1 - Math.pow(1 - t, 3);
  };

  const getGridColumns = () => {
    switch (columns) {
      case 1: return 'stats-grid-1';
      case 2: return 'stats-grid-2';
      case 3: return 'stats-grid-3';
      case 4: return 'stats-grid-4';
      default: return 'stats-grid-4';
    }
  };

  const statsClasses = [
    'stats-section',
    `stats-${variant}`,
    getGridColumns(),
    className
  ].filter(Boolean).join(' ');

  return (
    <section 
      ref={sectionRef}
      className={statsClasses}
      {...props}
    >
      <div className="stats-background">
        <div className="stats-particles"></div>
        <div className="stats-glow"></div>
      </div>

      <div className="stats-container">
        {stats.map((stat, index) => (
          <div 
            key={stat.id} 
            className="stat-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="stat-icon-wrapper">
              <span className="stat-icon">{stat.icon}</span>
              <div className="stat-icon-glow"></div>
            </div>
            
            <div className="stat-content">
              <div className="stat-value-wrapper">
                <span className="stat-prefix">{stat.prefix}</span>
                <span className="stat-value">
                  {animate && isVisible ? animatedValues[stat.id] || stat.value : stat.value}
                </span>
                <span className="stat-suffix">{stat.suffix}</span>
              </div>
              <p className="stat-label">{stat.label}</p>
            </div>

            <div className="stat-progress">
              <div 
                className="stat-progress-bar"
                style={{ 
                  width: isVisible ? '100%' : '0%',
                  transition: `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;