// ===== src/Components/Features/LocationPicker.jsx =====
import React, { useState, useEffect, useRef } from 'react';
import '../../Styles/Features.css';
import Button from '../Common/Button';
import Input from '../Common/Input';
import { loadGoogleMapsScript, getCurrentLocation } from '../../Services/location.service';

const LocationPicker = ({
  onSelect,
  onClose,
  initialLocation = null,
  showSearch = true,
  className = '',
  ...props
}) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [mapError, setMapError] = useState(null);

  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    initMap();
  }, []);

  useEffect(() => {
    if (mapLoaded && window.google) {
      try {
        setAutocompleteService(new window.google.maps.places.AutocompleteService());
        if (mapRef.current) {
          setPlacesService(new window.google.maps.places.PlacesService(mapRef.current));
        }
      } catch (error) {
        console.error('Failed to initialize places services:', error);
      }
    }
  }, [mapLoaded]);

  const initMap = async () => {
    setLoading(true);
    setMapError(null);
    try {
      await loadGoogleMapsScript();
      let defaultLocation = { lat: -1.2195, lng: 36.8869 }; // Roysambu, next to TRM
      try {
        const location = await getCurrentLocation();
        defaultLocation = location;
        setUserLocation(location);
      } catch (error) {
        console.warn('Could not get user location, using default');
      }

      if (!window.google || !window.google.maps) throw new Error('Google Maps failed to load');

      const google = window.google;
      const newMap = new google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      const newMarker = new google.maps.Marker({
        map: newMap,
        position: defaultLocation,
        draggable: true,
        animation: google.maps.Animation.DROP
      });

      newMap.addListener('click', (e) => {
        const position = e.latLng;
        newMarker.setPosition(position);
        setSelectedLocation({ lat: position.lat(), lng: position.lng() });
      });

      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        setSelectedLocation({ lat: position.lat(), lng: position.lng() });
      });

      setMap(newMap);
      setMarker(newMarker);
      setMapLoaded(true);
    } catch (error) {
      console.error('Failed to load map:', error);
      setMapError('Failed to load Google Maps. Please check your internet connection and API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || !autocompleteService) return;
    try {
      const response = await new Promise((resolve, reject) => {
        autocompleteService.getPlacePredictions(
          { input: searchQuery, types: ['address'], componentRestrictions: { country: 'ke' } },
          (results, status) => {
            if (status === 'OK' && results) resolve(results);
            else reject(status);
          }
        );
      });
      setSearchResults(response);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSelectPlace = async (placeId) => {
    if (!placesService) return;
    try {
      const place = await new Promise((resolve, reject) => {
        placesService.getDetails(
          { placeId, fields: ['geometry', 'formatted_address', 'address_components'] },
          (result, status) => {
            if (status === 'OK' && result) resolve(result);
            else reject(status);
          }
        );
      });

      const location = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      map.setCenter(location);
      map.setZoom(18);
      marker.setPosition(location);
      setSelectedLocation(location);
      setSearchQuery('');
      setSearchResults([]);

      if (onSelect) {
        onSelect({ ...location, address: place.formatted_address || '' });
      }
    } catch (error) {
      console.error('Failed to get place details:', error);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation && onSelect) onSelect(selectedLocation);
  };

  return (
    <div className={`location-picker-overlay ${className}`} {...props}>
      <div className="location-picker-container">
        <div className="location-picker-header">
          <h3 className="picker-title">Select Delivery Location</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {showSearch && (
          <div className="location-search">
            <div className="search-input-group">
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for an address"
                icon="🔍"
              />
              <Button variant="primary" size="sm" onClick={handleSearch}>Search</Button>
            </div>
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(result => (
                  <button key={result.place_id} className="search-result-item" onClick={() => handleSelectPlace(result.place_id)}>
                    <span className="result-icon">📍</span>
                    <span className="result-text">{result.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="map-container-wrapper">
          <div ref={mapRef} className="map-container" />
          {loading && (
            <div className="map-loading">
              <span className="spinner"></span>
              <span>Loading map...</span>
            </div>
          )}
          {mapError && (
            <div className="map-error">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{mapError}</span>
              <Button variant="primary" size="sm" onClick={initMap}>Retry</Button>
            </div>
          )}
          {map && (
            <div className="map-controls">
              <button className="map-control-btn" onClick={() => map.setZoom(map.getZoom() + 1)}>+</button>
              <button className="map-control-btn" onClick={() => map.setZoom(map.getZoom() - 1)}>-</button>
              {userLocation && (
                <button className="map-control-btn" onClick={() => { map.setCenter(userLocation); marker.setPosition(userLocation); }}>📍</button>
              )}
            </div>
          )}
          {map && <div className="drag-hint"><span className="hint-icon">🖱️</span><span className="hint-text">Drag the marker to adjust location</span></div>}
        </div>

        {selectedLocation && (
          <div className="selected-location-info">
            <div className="location-coordinates">
              <span className="coord-icon">📍</span>
              <span className="coord-text">{selectedLocation.lat?.toFixed(6)}, {selectedLocation.lng?.toFixed(6)}</span>
            </div>
          </div>
        )}

        <div className="location-picker-actions">
          <Button variant="primary" size="lg" onClick={handleConfirm} disabled={!selectedLocation}>Confirm Location</Button>
          <Button variant="outline" size="lg" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
