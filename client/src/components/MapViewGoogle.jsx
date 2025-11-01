import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  GoogleMap, 
  Marker, 
  InfoWindow, 
  Polyline, 
  MarkerClusterer,
  DirectionsRenderer,
  Circle
} from '@react-google-maps/api';

const MapViewGoogle = ({ 
  parkingData, 
  transitData, 
  onMapClick, 
  reports, 
  onUpvote, 
  selectedRoute, 
  isLoaded,
  onParkingClick,
  selectedParkingId,
  searchLocation,
  userLocation,
  showAllParkingMarkers,
  searchResults,
  searchQuery,
  onSearchResultClick
}) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const hasInitializedRef = useRef(false);
  
  // Delhi center coordinates (used for initial map position)
  const delhiCenter = { lat: 28.6139, lng: 77.2090 };

  // Function to center map on user's location
  const goToMyLocation = () => {
    if (userLocation && map) {
      map.panTo({ lat: userLocation.lat, lng: userLocation.lng });
      map.setZoom(16);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          if (map) {
            map.panTo(pos);
            map.setZoom(16);
          }
        },
        () => {
          alert('Unable to get your location. Please allow location access.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Pan to search location when it changes
  useEffect(() => {
    if (searchLocation && map) {
      map.panTo({ lat: searchLocation.lat, lng: searchLocation.lng });
      map.setZoom(15);
    }
  }, [searchLocation, map]);

  // Highlight selected parking location
  useEffect(() => {
    if (selectedParkingId && map) {
      const selectedParking = parkingData.find(p => p.id === selectedParkingId);
      if (selectedParking) {
        map.panTo({ lat: selectedParking.location[0], lng: selectedParking.location[1] });
        map.setZoom(16);
        setSelectedMarker({ type: 'parking', data: selectedParking });
      }
    }
  }, [selectedParkingId, parkingData, map]);


  useEffect(() => {
    if (selectedRoute && isLoaded) {

      if (selectedRoute.routes && Array.isArray(selectedRoute.routes) && selectedRoute.routes.length > 0) {
        console.log('Valid route data received, displaying on map');
        setDirectionsResponse(selectedRoute);

        setSelectedMarker(null);
      } else {
        console.error('Invalid route data received - missing routes array:', selectedRoute);
        setDirectionsResponse(null);
      }
    } else {
      setDirectionsResponse(null);
    }
  }, [selectedRoute, isLoaded]);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const mapOptions = {
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    gestureHandling: 'greedy',
    disableDefaultUI: false,
    styles: [], 
  };

  const onLoad = useCallback((map) => {
    setMap(map);
    hasInitializedRef.current = true;

    map.setCenter(delhiCenter);
    console.log('Google Map loaded successfully');
  }, []);

  const handleMapClick = (event) => {
    if (onMapClick) {
      onMapClick([event.latLng.lat(), event.latLng.lng()]);
    }
    setSelectedMarker(null);
  };

  const getParkingMarkerIcon = (lot, isSelected) => {
    // Use standard Google Maps parking pin icon - simple and consistent
    const iconUrl = `https://www.google.com/maps/vt/icon/name=assets/icons/spotlight/spotlight_pin_v4_outline-2-medium.png,assets/icons/spotlight/spotlight_pin_v4-2-medium.png,assets/icons/spotlight/spotlight_pin_v4_dot-2-medium.png&highlight=c5221f,ea4335,b31412&scale=2`;

    return {
      url: iconUrl,
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 40),
      labelOrigin: new window.google.maps.Point(20, 15)
    };
  };

  // Blue dot icon for user location (like Google Maps)
  const getUserLocationIcon = () => {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3,
    };
  };

  // Generic marker icon for Google Places search results
  const getSearchResultIcon = (result) => {
    // Use red pin for search results (like Google Maps)
    const iconUrl = `https://www.google.com/maps/vt/icon/name=assets/icons/spotlight/spotlight_pin_v4_outline-2-medium.png,assets/icons/spotlight/spotlight_pin_v4-2-medium.png,assets/icons/spotlight/spotlight_pin_v4_dot-2-medium.png&highlight=ea4335,c5221f,b31412&scale=2`;
    
    return {
      url: iconUrl,
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 32),
    };
  };

  const getTransitIcon = (vehicle) => {
    // Only Metro - Blue color
    const color = '#3b82f6';

    return {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      rotation: 0,
    };
  };

  // Get report marker icon
  const getReportIcon = (category) => {
    const colors = {
      parking: '#e74c3c',    // Red
      metro: '#9b59b6',       // Purple
      general: '#95a5a6'      // Gray
    };

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: colors[category] || colors.general,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    };
  };

  if (!isLoaded || !window.google) {
    console.log('Waiting for Google Maps to load...', { isLoaded, hasWindow: !!window.google });
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        background: '#f3f4f6' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <p style={{ color: '#666' }}>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={11}
        options={mapOptions}
        onLoad={onLoad}
        onClick={handleMapClick}
      >
        {}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: '#10b981',
                strokeWeight: 5,
                strokeOpacity: 0.8,
              }
            }}
          />
        )}

        {/* User Location Marker - Blue Dot with Accuracy Circle (like Google Maps) */}
        {userLocation && (
          <>
            {/* Accuracy Circle - Light blue circle around user location */}
            <Circle
              center={{ lat: userLocation.lat, lng: userLocation.lng }}
              radius={50} // 50 meters accuracy radius
              options={{
                fillColor: '#4285F4',
                fillOpacity: 0.15,
                strokeColor: '#4285F4',
                strokeOpacity: 0.3,
                strokeWeight: 1,
                clickable: false,
                zIndex: 1
              }}
            />
            {/* Blue Dot Marker */}
            <Marker
              position={{ lat: userLocation.lat, lng: userLocation.lng }}
              icon={getUserLocationIcon()}
              title="Your Location"
              zIndex={1000}
            />
          </>
        )}

        {/* Google Places Search Results - Show when user searches */}
        {searchResults && searchResults.length > 0 && searchResults.map((result) => (
          <Marker
            key={result.id}
            position={{ lat: result.location[0], lng: result.location[1] }}
            icon={getSearchResultIcon(result)}
            title={result.name}
            onClick={() => {
              // Notify parent to set this as destination
              if (onSearchResultClick) {
                onSearchResultClick(result);
              }
            }}
          />
        ))}

        {/* Parking Markers - Show all when searched for "parking" or only selected one */}
        {(showAllParkingMarkers ? parkingData : parkingData.filter(lot => lot.id === selectedParkingId)).map((lot) => {
          const isSelected = selectedParkingId === lot.id;
          return (
            <Marker
              key={`parking-${lot.id}`}
              position={{ lat: lot.location[0], lng: lot.location[1] }}
              icon={getParkingMarkerIcon(lot, isSelected)}
              onClick={() => {
                if (onParkingClick) {
                  onParkingClick(lot);
                }
              }}
            />
          );
        })}

        {/* Report Markers - Only show user-submitted reports */}
        <MarkerClusterer>
          {(clusterer) =>
            reports.map((report) => (
              <Marker
                key={`report-${report.id}`}
                position={{ lat: report.location[0], lng: report.location[1] }}
                icon={getReportIcon(report.category || 'general')}
                onClick={() => setSelectedMarker({ type: 'report', data: report })}
                clusterer={clusterer}
              />
            ))
          }
        </MarkerClusterer>

        {/* InfoWindow for Report Markers */}
        {selectedMarker && selectedMarker.type === 'report' && (
          <InfoWindow
            position={{ 
              lat: selectedMarker.data.location[0], 
              lng: selectedMarker.data.location[1] 
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ padding: '10px', minWidth: '250px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>
                {selectedMarker.data.category === 'parking' ? '🚗 Parking Issue' :
                 selectedMarker.data.category === 'metro' ? '🚇 Metro/Transit' :
                 '📝 General Report'}
                {selectedMarker.data.resolved && <span style={{ color: '#10b981' }}> ✓</span>}
              </h4>
              <p><strong>Description:</strong> {selectedMarker.data.description}</p>
              {selectedMarker.data.imageUrl && (
                <img 
                  src={selectedMarker.data.imageUrl} 
                  alt="Report" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '150px', 
                    objectFit: 'cover',
                    borderRadius: '5px',
                    margin: '10px 0'
                  }} 
                />
              )}
              <p style={{ fontSize: '12px', color: '#666' }}>
                <strong>Submitted:</strong> {selectedMarker.data.submittedAt}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span>👍 {selectedMarker.data.upvotes || 0}</span>
                <button 
                  onClick={() => onUpvote(selectedMarker.data.id)}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Upvote
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {/* My Location Button - Like Google Maps */}
      <button
        onClick={goToMyLocation}
        style={{
          position: 'absolute',
          bottom: '105px',
          right: '10px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          zIndex: 1000,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f5f5f5';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'white';
          e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        }}
        title="Go to my location"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
            fill="#666"
          />
        </svg>
      </button>
    </div>
  );
};

export default MapViewGoogle;
