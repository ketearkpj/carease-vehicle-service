// ===== src/Services/location.service.js =====
/**
 * LOCATION SERVICE - GOD MODE
 * Real location services with Google Maps API integration
 * Supports: Geocoding, distance calculation, real-time tracking
 */

import axios from 'axios';
import { getEnv } from '../Config/env';

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = getEnv('REACT_APP_GOOGLE_MAPS_API_KEY');
const API_BASE_URL = getEnv('REACT_APP_API_URL') || '/api/v1';

// Load Google Maps script
let mapsScriptLoaded = false;
let mapsScriptPromise = null;

/**
 * Load Google Maps API script
 * @returns {Promise} - Promise that resolves when script is loaded
 */
export const loadGoogleMapsScript = () => {
  if (mapsScriptLoaded) {
    return Promise.resolve();
  }

  if (mapsScriptPromise) {
    return mapsScriptPromise;
  }

  mapsScriptPromise = new Promise((resolve, reject) => {
    if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
      mapsScriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      mapsScriptLoaded = true;
      resolve();
    };

    script.onerror = (error) => {
      mapsScriptPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return mapsScriptPromise;
};

/**
 * Get current user location
 * @returns {Promise<Object>} - Current location {lat, lng}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Geocode address to coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} - Geocoding result
 */
export const geocodeAddress = async (address) => {
  try {
    await loadGoogleMapsScript();

    const geocoder = new window.google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: results[0].formatted_address,
            placeId: results[0].place_id,
            components: results[0].address_components
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Fallback to backend geocoding
    try {
      const response = await axios.post(`${API_BASE_URL}/location/geocode`, { address });
      return response.data;
    } catch (fallbackError) {
      throw new Error('Failed to geocode address');
    }
  }
};

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - Address details
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    await loadGoogleMapsScript();

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            formattedAddress: results[0].formatted_address,
            placeId: results[0].place_id,
            components: results[0].address_components
          });
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    
    // Fallback to backend
    try {
      const response = await axios.post(`${API_BASE_URL}/location/reverse-geocode`, { lat, lng });
      return response.data;
    } catch (fallbackError) {
      throw new Error('Failed to get address from coordinates');
    }
  }
};

/**
 * Calculate distance between two points
 * @param {Object} point1 - First point {lat, lng}
 * @param {Object} point2 - Second point {lat, lng}
 * @param {string} unit - 'km' or 'miles'
 * @returns {number} - Distance
 */
export const calculateDistance = (point1, point2, unit = 'km') => {
  const R = unit === 'km' ? 6371 : 3959; // Earth's radius in km or miles
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

/**
 * Get distance and duration using Google Maps Distance Matrix
 * @param {Object} origin - Origin {lat, lng} or address
 * @param {Object} destination - Destination {lat, lng} or address
 * @param {string} mode - 'driving' | 'walking' | 'bicycling' | 'transit'
 * @returns {Promise<Object>} - Distance and duration
 */
export const getDistanceMatrix = async (origin, destination, mode = 'driving') => {
  try {
    await loadGoogleMapsScript();

    const service = new window.google.maps.DistanceMatrixService();

    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: window.google.maps.TravelMode[mode.toUpperCase()],
          unitSystem: window.google.maps.UnitSystem.IMPERIAL,
          avoidHighways: false,
          avoidTolls: false,
        },
        (response, status) => {
          if (status === 'OK') {
            const result = response.rows[0].elements[0];
            resolve({
              distance: {
                text: result.distance.text,
                value: result.distance.value // in meters
              },
              duration: {
                text: result.duration.text,
                value: result.duration.value // in seconds
              },
              status: result.status
            });
          } else {
            reject(new Error(`Distance Matrix failed: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Distance Matrix error:', error);
    
    // Fallback to backend
    try {
      const response = await axios.post(`${API_BASE_URL}/location/distance-matrix`, {
        origin,
        destination,
        mode
      });
      return response.data;
    } catch (fallbackError) {
      // Fallback to simple distance calculation
      if (origin.lat && origin.lng && destination.lat && destination.lng) {
        const distance = calculateDistance(origin, destination);
        return {
          distance: {
            text: `${distance} km`,
            value: distance * 1000
          },
          duration: {
            text: '~30 mins',
            value: 1800
          }
        };
      }
      throw new Error('Failed to calculate distance');
    }
  }
};

/**
 * Get place autocomplete suggestions
 * @param {string} input - User input
 * @param {Object} options - Autocomplete options
 * @returns {Promise<Array>} - Place predictions
 */
export const getPlaceAutocomplete = async (input, options = {}) => {
  try {
    await loadGoogleMapsScript();

    const service = new window.google.maps.places.AutocompleteService();

    return new Promise((resolve, reject) => {
      service.getPlacePredictions(
        {
          input,
          types: options.types || ['address'],
          componentRestrictions: options.country ? { country: options.country } : null,
          location: options.location ? new window.google.maps.LatLng(options.location.lat, options.location.lng) : null,
          radius: options.radius || 50000
        },
        (predictions, status) => {
          if (status === 'OK' && predictions) {
            resolve(predictions.map(prediction => ({
              placeId: prediction.place_id,
              description: prediction.description,
              mainText: prediction.structured_formatting.main_text,
              secondaryText: prediction.structured_formatting.secondary_text,
              types: prediction.types
            })));
          } else {
            resolve([]);
          }
        }
      );
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
};

/**
 * Get place details by Place ID
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} - Place details
 */
export const getPlaceDetails = async (placeId) => {
  try {
    await loadGoogleMapsScript();

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    return new Promise((resolve, reject) => {
      service.getDetails({ placeId }, (place, status) => {
        if (status === 'OK' && place) {
          resolve({
            name: place.name,
            address: place.formatted_address,
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            },
            phone: place.international_phone_number,
            website: place.website,
            rating: place.rating,
            reviews: place.reviews,
            photos: place.photos?.map(photo => photo.getUrl()),
            openingHours: place.opening_hours?.weekday_text,
            placeId: place.place_id
          });
        } else {
          reject(new Error(`Failed to get place details: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Place details error:', error);
    
    // Fallback to backend
    try {
      const response = await axios.get(`${API_BASE_URL}/location/place/${placeId}`);
      return response.data;
    } catch (fallbackError) {
      throw new Error('Failed to get place details');
    }
  }
};

/**
 * Get delivery estimate
 * @param {Object} origin - Origin location
 * @param {Object} destination - Destination location
 * @param {string} vehicleType - Type of delivery vehicle
 * @returns {Promise<Object>} - Delivery estimate
 */
export const getDeliveryEstimate = async (origin, destination, vehicleType = 'standard') => {
  try {
    const matrix = await getDistanceMatrix(origin, destination);
    
    // Base rates per km
    const rates = {
      standard: 2.5,
      premium: 5.0,
      express: 8.0
    };

    const distanceKm = matrix.distance.value / 1000;
    const baseCost = distanceKm * (rates[vehicleType] || rates.standard);
    
    // Additional fees
    const surgeMultiplier = await getSurgeMultiplier(destination);
    const tolls = await estimateTolls(origin, destination);
    
    const totalCost = (baseCost * surgeMultiplier) + tolls;

    return {
      distance: matrix.distance,
      duration: matrix.duration,
      cost: {
        base: Math.round(baseCost * 100) / 100,
        surge: surgeMultiplier,
        tolls,
        total: Math.round(totalCost * 100) / 100,
        currency: 'USD'
      },
      estimatedPickup: new Date(Date.now() + 30 * 60000).toISOString(), // 30 mins from now
      estimatedDelivery: new Date(Date.now() + matrix.duration.value * 1000).toISOString()
    };
  } catch (error) {
    console.error('Failed to get delivery estimate:', error);
    throw new Error(error.message || 'Failed to calculate delivery estimate');
  }
};

/**
 * Get surge multiplier based on time and location
 * @param {Object} location - Destination location
 * @returns {Promise<number>} - Surge multiplier
 */
const getSurgeMultiplier = async (location) => {
  try {
    const hour = new Date().getHours();
    
    // Peak hours multiplier (5 PM - 8 PM)
    if (hour >= 17 && hour <= 20) {
      return 1.5;
    }
    
    // Late night multiplier (11 PM - 5 AM)
    if (hour >= 23 || hour <= 5) {
      return 1.3;
    }
    
    // Check if location is in busy area
    const response = await axios.post(`${API_BASE_URL}/location/surge`, { location });
    return response.data.multiplier || 1.0;
  } catch (error) {
    return 1.0;
  }
};

/**
 * Estimate toll costs
 * @param {Object} origin - Origin location
 * @param {Object} destination - Destination location
 * @returns {Promise<number>} - Estimated toll cost
 */
const estimateTolls = async (origin, destination) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/location/tolls`, {
      origin,
      destination
    });
    return response.data.tollCost || 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Track delivery in real-time
 * @param {string} deliveryId - Delivery ID
 * @param {Function} onUpdate - Update callback
 * @returns {Function} - Unsubscribe function
 */
export const trackDelivery = (deliveryId, onUpdate) => {
  let eventSource = null;
  let interval = null;

  // Try WebSocket first
  try {
    eventSource = new EventSource(`${API_BASE_URL}/location/track/${deliveryId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Fallback to polling
      startPolling();
    };
  } catch (error) {
    // Fallback to polling
    startPolling();
  }

  const startPolling = () => {
    interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/location/track/${deliveryId}`);
        onUpdate(response.data);
      } catch (error) {
        console.error('Tracking error:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  // Return unsubscribe function
  return () => {
    if (eventSource) {
      eventSource.close();
    }
    if (interval) {
      clearInterval(interval);
    }
  };
};

/**
 * Get nearby locations
 * @param {Object} center - Center coordinates {lat, lng}
 * @param {number} radius - Search radius in meters
 * @param {string} type - Place type
 * @returns {Promise<Array>} - Nearby places
 */
export const getNearbyLocations = async (center, radius = 5000, type = 'car_rental') => {
  try {
    await loadGoogleMapsScript();

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    return new Promise((resolve, reject) => {
      service.nearbySearch(
        {
          location: new window.google.maps.LatLng(center.lat, center.lng),
          radius,
          type
        },
        (results, status) => {
          if (status === 'OK' && results) {
            resolve(results.map(place => ({
              placeId: place.place_id,
              name: place.name,
              address: place.vicinity,
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              },
              rating: place.rating,
              photos: place.photos?.map(photo => photo.getUrl()),
              distance: calculateDistance(center, {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              })
            })));
          } else {
            resolve([]);
          }
        }
      );
    });
  } catch (error) {
    console.error('Nearby search error:', error);
    
    // Fallback to backend
    try {
      const response = await axios.get(`${API_BASE_URL}/location/nearby`, {
        params: { ...center, radius, type }
      });
      return response.data.locations;
    } catch (fallbackError) {
      return [];
    }
  }
};

/**
 * Save delivery address
 * @param {string} userId - User ID
 * @param {Object} address - Address details
 * @returns {Promise<Object>} - Saved address
 */
export const saveDeliveryAddress = async (userId, address) => {
  try {
    // Geocode to get coordinates if not provided
    if (!address.lat || !address.lng) {
      const geocoded = await geocodeAddress(address.formatted);
      address.lat = geocoded.lat;
      address.lng = geocoded.lng;
    }

    const response = await axios.post(`${API_BASE_URL}/location/addresses`, {
      userId,
      ...address,
      savedAt: new Date().toISOString()
    });

    return response.data;
  } catch (error) {
    console.error('Failed to save address:', error);
    throw new Error(error.response?.data?.message || 'Failed to save address');
  }
};

/**
 * Get saved addresses
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Saved addresses
 */
export const getSavedAddresses = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/location/addresses/${userId}`);
    return response.data.addresses;
  } catch (error) {
    console.error('Failed to get addresses:', error);
    return [];
  }
};

/**
 * Delete saved address
 * @param {string} addressId - Address ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteSavedAddress = async (addressId) => {
  try {
    await axios.delete(`${API_BASE_URL}/location/addresses/${addressId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete address:', error);
    return false;
  }
};

// Export all location functions
export default {
  loadGoogleMapsScript,
  getCurrentLocation,
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  getDistanceMatrix,
  getPlaceAutocomplete,
  getPlaceDetails,
  getDeliveryEstimate,
  trackDelivery,
  getNearbyLocations,
  saveDeliveryAddress,
  getSavedAddresses,
  deleteSavedAddress
};
