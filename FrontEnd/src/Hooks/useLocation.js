// ===== src/Hooks/useLocation.js =====
import { useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentLocation, geocodeAddress, reverseGeocode, trackDelivery } from '../Services/LocationService';

/**
 * useLocation Hook - GOD MODE
 * Comprehensive location management hook
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} - Location state and methods
 */
const useLocation = (options = {}) => {
  const {
    autoTrack = false,
    watchPosition = false,
    highAccuracy = true,
    timeout = 10000,
    maximumAge = 0
  } = options;

  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [trackingDelivery, setTrackingDelivery] = useState(null);
  const [deliveryUpdate, setDeliveryUpdate] = useState(null);
  
  const watchRef = useRef(null);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
    
    return () => {
      if (watchRef.current) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  // Auto track if enabled
  useEffect(() => {
    if (autoTrack) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [autoTrack]);

  // Check location permission
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setPermission('unknown');
      return;
    }
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermission(result.state);
      
      result.addEventListener('change', () => {
        setPermission(result.state);
      });
    } catch (err) {
      console.error('Permission check failed:', err);
      setPermission('unknown');
    }
  }, []);

  // Get current location
  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const location = await getCurrentLocation({
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge
      });
      
      setCurrentLocation(location);
      
      // Reverse geocode to get address
      try {
        const addressData = await reverseGeocode(location.lat, location.lng);
        setAddress(addressData);
      } catch (geoErr) {
        console.warn('Reverse geocoding failed:', geoErr);
      }
      
      return location;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [highAccuracy, timeout, maximumAge]);

  // Start watching position
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current);
    }
    
    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        setCurrentLocation(location);
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge
      }
    );
    
    setWatchId(watchRef.current);
  }, [highAccuracy, timeout, maximumAge]);

  // Stop watching position
  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
      setWatchId(null);
    }
  }, []);

  // Search address
  const searchAddress = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await geocodeAddress(query);
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get address from coordinates
  const getAddressFromCoords = useCallback(async (lat, lng) => {
    setLoading(true);
    setError(null);
    
    try {
      const addressData = await reverseGeocode(lat, lng);
      setAddress(addressData);
      return addressData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((point1, point2, unit = 'km') => {
    const toRad = (value) => value * Math.PI / 180;
    
    const R = unit === 'km' ? 6371 : 3959;
    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100;
  }, []);

  // Track delivery in real-time
  const trackDeliveryStatus = useCallback((deliveryId) => {
    if (trackingDelivery) {
      trackingDelivery();
    }
    
    setLoading(true);
    
    try {
      const unsubscribe = trackDelivery(deliveryId, (update) => {
        setDeliveryUpdate(update);
        setLoading(false);
      });
      
      setTrackingDelivery(() => unsubscribe);
      return unsubscribe;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [trackingDelivery]);

  // Stop tracking delivery
  const stopTrackingDelivery = useCallback(() => {
    if (trackingDelivery) {
      trackingDelivery();
      setTrackingDelivery(null);
      setDeliveryUpdate(null);
    }
  }, [trackingDelivery]);

  // Clear location
  const clearLocation = useCallback(() => {
    setCurrentLocation(null);
    setAddress(null);
    setError(null);
  }, []);

  return {
    // State
    currentLocation,
    address,
    loading,
    error,
    permission,
    watchId,
    isWatching: !!watchId,
    deliveryUpdate,
    isTrackingDelivery: !!trackingDelivery,
    
    // Methods
    getLocation,
    startTracking,
    stopTracking,
    searchAddress,
    getAddressFromCoords,
    calculateDistance,
    trackDeliveryStatus,
    stopTrackingDelivery,
    clearLocation,
    
    // Helpers
    hasPermission: permission === 'granted'
  };
};

export default useLocation;