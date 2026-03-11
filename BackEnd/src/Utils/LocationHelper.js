// ===== src/utils/locationHelper.js =====
const axios = require('axios');
const NodeGeocoder = require('node-geocoder');

/**
 * Advanced location helper with multiple geocoding services
 * Supports Google Maps, OpenStreetMap, and custom calculations
 */
class LocationHelper {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // Initialize geocoder with multiple providers
    this.geocoder = NodeGeocoder({
      provider: 'google',
      apiKey: this.googleMapsApiKey,
      formatter: null
    });
  }

  /**
   * Geocode address to coordinates
   */
  async geocode(address) {
    try {
      // Try Google Maps first
      if (this.googleMapsApiKey) {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
          params: {
            address,
            key: this.googleMapsApiKey
          }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
          const result = response.data.results[0];
          return {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            formattedAddress: result.formatted_address,
            placeId: result.place_id,
            components: this.parseAddressComponents(result.address_components)
          };
        }
      }

      // Fallback to OpenStreetMap
      const osmResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1
        }
      });

      if (osmResponse.data && osmResponse.data.length > 0) {
        const result = osmResponse.data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          formattedAddress: result.display_name,
          placeId: result.place_id,
          components: {}
        };
      }

      throw new Error('Address not found');
    } catch (error) {
      console.error('Geocoding failed:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat, lng) {
    try {
      // Try Google Maps first
      if (this.googleMapsApiKey) {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
          params: {
            latlng: `${lat},${lng}`,
            key: this.googleMapsApiKey
          }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
          const result = response.data.results[0];
          return {
            formattedAddress: result.formatted_address,
            placeId: result.place_id,
            components: this.parseAddressComponents(result.address_components)
          };
        }
      }

      // Fallback to OpenStreetMap
      const osmResponse = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json'
        }
      });

      if (osmResponse.data) {
        return {
          formattedAddress: osmResponse.data.display_name,
          placeId: osmResponse.data.osm_id,
          components: {}
        };
      }

      throw new Error('Location not found');
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
    const R = unit === 'km' ? 6371 : 3959; // Earth's radius in km or miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return {
      value: Math.round(distance * 100) / 100,
      unit,
      text: `${Math.round(distance * 100) / 100} ${unit}`
    };
  }

  /**
   * Convert degrees to radians
   */
  toRad(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * Get distance matrix for multiple origins and destinations
   */
  async getDistanceMatrix(origins, destinations, mode = 'driving') {
    try {
      if (!this.googleMapsApiKey) {
        // Fallback to simple distance calculations
        return this.calculateDistanceMatrix(origins, destinations);
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: origins.map(o => `${o.lat},${o.lng}`).join('|'),
          destinations: destinations.map(d => `${d.lat},${d.lng}`).join('|'),
          mode,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Distance matrix failed: ${response.data.status}`);
      }

      return response.data.rows.map((row, i) => ({
        origin: origins[i],
        elements: row.elements.map((element, j) => ({
          destination: destinations[j],
          distance: element.distance ? {
            text: element.distance.text,
            value: element.distance.value
          } : null,
          duration: element.duration ? {
            text: element.duration.text,
            value: element.duration.value
          } : null,
          status: element.status
        }))
      }));
    } catch (error) {
      console.error('Distance matrix failed:', error);
      // Fallback to simple calculations
      return this.calculateDistanceMatrix(origins, destinations);
    }
  }

  /**
   * Calculate distance matrix (fallback method)
   */
  calculateDistanceMatrix(origins, destinations) {
    return origins.map(origin => ({
      origin,
      elements: destinations.map(destination => {
        const distance = this.calculateDistance(
          origin.lat, origin.lng,
          destination.lat, destination.lng
        );
        
        // Rough time estimate (assuming 50 km/h average speed)
        const hours = distance.value / 50;
        const minutes = Math.round(hours * 60);

        return {
          destination,
          distance: {
            text: distance.text,
            value: distance.value * 1000 // convert to meters
          },
          duration: {
            text: `${minutes} mins`,
            value: minutes * 60 // convert to seconds
          },
          status: 'OK'
        };
      })
    }));
  }

  /**
   * Get place autocomplete suggestions
   */
  async getPlaceAutocomplete(input, sessionToken) {
    try {
      if (!this.googleMapsApiKey) {
        return [];
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
        params: {
          input,
          key: this.googleMapsApiKey,
          sessiontoken: sessionToken,
          components: 'country:us'
        }
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Place autocomplete failed: ${response.data.status}`);
      }

      return response.data.predictions.map(prediction => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text,
        types: prediction.types
      }));
    } catch (error) {
      console.error('Place autocomplete failed:', error);
      return [];
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId, sessionToken) {
    try {
      if (!this.googleMapsApiKey) {
        throw new Error('Google Maps API key required');
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          place_id: placeId,
          key: this.googleMapsApiKey,
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
        types: result.types,
        components: this.parseAddressComponents(result.address_components)
      };
    } catch (error) {
      console.error('Place details failed:', error);
      throw error;
    }
  }

  /**
   * Parse address components
   */
  parseAddressComponents(components) {
    const result = {
      streetNumber: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    };

    if (!components) return result;

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        result.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        result.street = component.long_name;
      }
      if (types.includes('locality')) {
        result.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        result.state = component.short_name;
      }
      if (types.includes('postal_code')) {
        result.postalCode = component.long_name;
      }
      if (types.includes('country')) {
        result.country = component.long_name;
      }
    });

    return result;
  }

  /**
   * Get timezone for location
   */
  async getTimezone(lat, lng, timestamp = Date.now() / 1000) {
    try {
      if (!this.googleMapsApiKey) {
        // Default to US/Pacific
        return 'America/Los_Angeles';
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/timezone/json', {
        params: {
          location: `${lat},${lng}`,
          timestamp,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK') {
        return response.data.timeZoneId;
      }

      return 'America/Los_Angeles';
    } catch (error) {
      console.error('Timezone lookup failed:', error);
      return 'America/Los_Angeles';
    }
  }

  /**
   * Get elevation for location
   */
  async getElevation(lat, lng) {
    try {
      if (!this.googleMapsApiKey) {
        return 0;
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/elevation/json', {
        params: {
          locations: `${lat},${lng}`,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].elevation;
      }

      return 0;
    } catch (error) {
      console.error('Elevation lookup failed:', error);
      return 0;
    }
  }

  /**
   * Check if location is within service area
   */
  async isWithinServiceArea(lat, lng, radius = 50) {
    const serviceCenters = [
      { name: 'Roysambu (next to TRM)', lat: 34.0736, lng: -118.4004, radius: 30 },
      { name: 'Miami', lat: 25.7617, lng: -80.1918, radius: 40 },
      { name: 'Upper Hill', lat: 40.7831, lng: -73.9712, radius: 25 },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, radius: 50 },
      { name: 'San Francisco', lat: 37.7749, lng: -122.4194, radius: 45 }
    ];

    for (const center of serviceCenters) {
      const distance = this.calculateDistance(lat, lng, center.lat, center.lng);
      if (distance.value <= center.radius) {
        return {
          withinArea: true,
          center,
          distance: distance.value
        };
      }
    }

    return {
      withinArea: false,
      center: null,
      distance: null
    };
  }

  /**
   * Get optimal route between points
   */
  async getOptimalRoute(points, optimize = 'distance') {
    if (points.length < 2) {
      return {
        waypoints: points,
        totalDistance: 0,
        totalDuration: 0
      };
    }

    // Simple implementation - could be enhanced with Google Directions API
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const distance = this.calculateDistance(
        points[i].lat, points[i].lng,
        points[i + 1].lat, points[i + 1].lng
      );
      totalDistance += distance.value;

      // Rough time estimate (50 km/h average)
      totalDuration += (distance.value / 50) * 60;
    }

    return {
      waypoints: points,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalDuration: Math.round(totalDuration),
      totalDistanceText: `${Math.round(totalDistance * 100) / 100} km`,
      totalDurationText: `${Math.round(totalDuration)} mins`
    };
  }

  /**
   * Format address components
   */
  formatAddress(components) {
    const parts = [];

    if (components.streetNumber && components.street) {
      parts.push(`${components.streetNumber} ${components.street}`);
    } else if (components.street) {
      parts.push(components.street);
    }

    if (components.city) parts.push(components.city);
    if (components.state) parts.push(components.state);
    if (components.postalCode) parts.push(components.postalCode);
    if (components.country) parts.push(components.country);

    return parts.join(', ');
  }
}

module.exports = new LocationHelper();