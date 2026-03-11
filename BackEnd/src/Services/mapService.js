// ===== src/services/mapService.js =====
const axios = require('axios');
const { logger } = require('../Middleware/Logger.md.js');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api';

// ===== GEOCODE ADDRESS =====
exports.geocode = async (address) => {
  try {
    const response = await axios.get(`${BASE_URL}/geocode/json`, {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }

    const result = response.data.results[0];
    return {
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      placeId: result.place_id,
      components: result.address_components
    };
  } catch (error) {
    logger.error('Geocoding failed:', error);
    throw error;
  }
};

// ===== REVERSE GEOCODE =====
exports.reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(`${BASE_URL}/geocode/json`, {
      params: {
        latlng: `${lat},${lng}`,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Reverse geocoding failed: ${response.data.status}`);
    }

    const result = response.data.results[0];
    return {
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      components: result.address_components
    };
  } catch (error) {
    logger.error('Reverse geocoding failed:', error);
    throw error;
  }
};

// ===== CALCULATE DISTANCE =====
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// ===== GET DISTANCE MATRIX =====
exports.getDistanceMatrix = async (origins, destinations, mode = 'driving') => {
  try {
    const response = await axios.get(`${BASE_URL}/distancematrix/json`, {
      params: {
        origins: origins.map(o => `${o.lat},${o.lng}`).join('|'),
        destinations: destinations.map(d => `${d.lat},${d.lng}`).join('|'),
        mode,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Distance matrix failed: ${response.data.status}`);
    }

    return response.data.rows.map((row, i) => ({
      origin: origins[i],
      elements: row.elements.map((element, j) => ({
        destination: destinations[j],
        distance: {
          text: element.distance.text,
          value: element.distance.value
        },
        duration: {
          text: element.duration.text,
          value: element.duration.value
        },
        status: element.status
      }))
    }));
  } catch (error) {
    logger.error('Distance matrix failed:', error);
    throw error;
  }
};

// ===== GET PLACE AUTOCOMPLETE =====
exports.getPlaceAutocomplete = async (input, sessionToken) => {
  try {
    const response = await axios.get(`${BASE_URL}/place/autocomplete/json`, {
      params: {
        input,
        key: GOOGLE_MAPS_API_KEY,
        sessiontoken: sessionToken,
        components: 'country:us'
      }
    });

    return response.data.predictions.map(prediction => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text
    }));
  } catch (error) {
    logger.error('Place autocomplete failed:', error);
    throw error;
  }
};

// ===== GET PLACE DETAILS =====
exports.getPlaceDetails = async (placeId, sessionToken) => {
  try {
    const response = await axios.get(`${BASE_URL}/place/details/json`, {
      params: {
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY,
        sessiontoken: sessionToken,
        fields: 'address_components,formatted_address,geometry,name,place_id,types,url,vicinity'
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Place details failed: ${response.data.status}`);
    }

    const result = response.data.result;
    return {
      placeId: result.place_id,
      name: result.name,
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      url: result.url,
      types: result.types
    };
  } catch (error) {
    logger.error('Place details failed:', error);
    throw error;
  }
};

// ===== GET DIRECTIONS =====
exports.getDirections = async (origin, destination, mode = 'driving') => {
  try {
    const response = await axios.get(`${BASE_URL}/directions/json`, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Directions failed: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      distance: leg.distance,
      duration: leg.duration,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions,
        distance: step.distance,
        duration: step.duration,
        startLocation: step.start_location,
        endLocation: step.end_location
      })),
      polyline: route.overview_polyline.points
    };
  } catch (error) {
    logger.error('Directions failed:', error);
    throw error;
  }
};