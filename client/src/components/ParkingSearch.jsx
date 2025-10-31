import React, { useState, useEffect, useRef } from 'react';
import './ParkingSearch.css';

const ParkingSearch = ({ 
  parkingData, 
  isLoaded, 
  onParkingSelect, 
  onSearchLocationChange,
  onShowAllParking,
  onShowSearchResults,
  userLocation 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const mapDiv = useRef(null);

  useEffect(() => {
    if (isLoaded && window.google && window.google.maps) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      // Create a hidden div for PlacesService (it requires a map or div)
      if (!mapDiv.current) {
        mapDiv.current = document.createElement('div');
      }
      placesService.current = new window.google.maps.places.PlacesService(mapDiv.current);
    }
  }, [isLoaded]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);

    if (value.trim().length > 2) {
      // Don't show fake parking data in suggestions - only show Google Places results
      // Filter parking lots based on search query (commented out - using only Google Places)
      // const filteredParking = parkingData.filter(lot =>
      //   lot.name.toLowerCase().includes(value.toLowerCase()) ||
      //   lot.address.toLowerCase().includes(value.toLowerCase())
      // );

      // Get Google Places predictions for real locations only
      if (autocompleteService.current) {
        autocompleteService.current.getPlacePredictions(
          {
            input: value,
            componentRestrictions: { country: 'in' },
            location: userLocation ? new window.google.maps.LatLng(userLocation.lat, userLocation.lng) : null,
            radius: userLocation ? 50000 : null, // 50km radius
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              const placeSuggestions = predictions.slice(0, 5).map(prediction => ({
                type: 'place',
                name: prediction.description,
                placeId: prediction.place_id,
                id: prediction.place_id
              }));
              
              // Only show Google Places, not fake parking data
              setSuggestions(placeSuggestions);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }
        );
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'place') {
      // Handle Google Places selection
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: suggestion.placeId }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          setSearchQuery(suggestion.name);
          setShowSuggestions(false);
          
          if (onSearchLocationChange) {
            onSearchLocationChange({
              lat: location.lat(),
              lng: location.lng(),
              name: suggestion.name
            });
          }
        }
      });
    } else {
      // Handle parking lot selection
      setSearchQuery(suggestion.name);
      setShowSuggestions(false);
      
      if (onParkingSelect) {
        onParkingSelect(suggestion);
      }
    }
  };

  // Search Google Places and show all results on map
  const handleGooglePlacesSearch = (query) => {
    if (!placesService.current || !userLocation) {
      alert('Unable to search. Please allow location access.');
      return;
    }

    setShowSuggestions(false);

    // Use Google Places Nearby Search or Text Search
    const request = {
      query: query,
      location: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
      radius: 5000, // 5km radius
    };

    placesService.current.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        console.log(`Found ${results.length} places for "${query}"`);
        
        // Convert results to markers format
        const searchResults = results.map((place, index) => ({
          id: `place-${index}`,
          name: place.name,
          address: place.formatted_address || place.vicinity,
          location: [place.geometry.location.lat(), place.geometry.location.lng()],
          type: 'google-place',
          placeId: place.place_id,
          rating: place.rating,
          types: place.types
        }));

        // Notify parent to show these results on map
        if (onShowSearchResults) {
          onShowSearchResults(searchResults, query);
        }
      } else {
        console.error('Places search failed:', status);
        alert(`No results found for "${query}"`);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (searchQuery.trim().length > 2) {
          // Search Google Places for the query (like "parking", "restaurant", etc.)
          handleGooglePlacesSearch(searchQuery.trim());
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const getParkingStatusBadge = (lot) => {
    const occupancyRate = (lot.capacity - lot.availableSpots) / lot.capacity;
    if (occupancyRate > 0.8) {
      return { text: 'Nearly Full', class: 'full' };
    } else if (occupancyRate > 0.5) {
      return { text: 'Limited', class: 'limited' };
    } else {
      return { text: 'Available', class: 'available' };
    }
  };

  return (
    <div className="parking-search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="parking-search-input"
          placeholder="Search for parking locations..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {searchQuery && (
          <button className="clear-search-btn" onClick={handleClearSearch}>
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((suggestion, index) => {
            // All suggestions are now Google Places (real locations)
            return (
              <div
                key={suggestion.id}
                className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="suggestion-icon">
                  📍
                </div>
                <div className="suggestion-content">
                  <div className="suggestion-name">{suggestion.name}</div>
                  <div className="suggestion-details">
                    <span className="suggestion-address">Google Maps Location</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showSuggestions && searchQuery.trim().length > 2 && suggestions.length === 0 && (
        <div className="search-suggestions">
          <div className="no-results">
            <span>No parking locations found</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSearch;
