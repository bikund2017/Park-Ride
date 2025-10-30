import React, { useState, useCallback, useEffect } from 'react';
import { 
  GoogleMap, 
  Marker, 
  InfoWindow, 
  Polyline, 
  MarkerClusterer,
  DirectionsRenderer 
} from '@react-google-maps/api';

const MapViewGoogle = ({ parkingData, transitData, onMapClick, reports, onUpvote, selectedRoute, isLoaded }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi center
  const [hasInitialized, setHasInitialized] = useState(false);

  // Update directions when selectedRoute changes
  useEffect(() => {
    if (selectedRoute && isLoaded) {
      // Validate that selectedRoute has the required DirectionsResult structure
      if (selectedRoute.routes && Array.isArray(selectedRoute.routes) && selectedRoute.routes.length > 0) {
        console.log('Valid route data received, displaying on map');
        setDirectionsResponse(selectedRoute);
        // Clear selected marker when route is shown
        setSelectedMarker(null);
      } else {
        console.error('Invalid route data received - missing routes array:', selectedRoute);
        setDirectionsResponse(null);
      }
    } else {
      setDirectionsResponse(null);
    }
  }, [selectedRoute, isLoaded]);

  // Delhi center coordinates (only used for initial load)
  const delhiCenter = { lat: 28.6139, lng: 77.2090 };

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const mapOptions = {
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    gestureHandling: 'greedy', // Better handling of mouse/touch gestures
    styles: [], // Can add custom styles here
  };

  const onLoad = useCallback((map) => {
    setMap(map);
    setHasInitialized(true);
  }, []);

  const handleMapClick = (event) => {
    if (onMapClick) {
      onMapClick([event.latLng.lat(), event.latLng.lng()]);
    }
    setSelectedMarker(null);
  };

  // Get parking marker color based on occupancy
  const getParkingMarkerIcon = (lot) => {
    const occupancyRate = (lot.capacity - lot.availableSpots) / lot.capacity;
    let color = '#10b981'; // Green

    if (occupancyRate > 0.8) {
      color = '#ef4444'; // Red
    } else if (occupancyRate > 0.5) {
      color = '#f59e0b'; // Orange
    }

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    };
  };

  // Get transit vehicle icon
  const getTransitIcon = (vehicle) => {
    let color = '#3b82f6'; // Blue for metro

    if (vehicle.vehicleType === 'bus') {
      color = '#f59e0b'; // Orange
    } else if (vehicle.vehicleType === 'train') {
      color = '#8b5cf6'; // Purple
    }

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
      parking: '#e74c3c',
      traffic: '#f39c12',
      facility: '#3498db',
      metro: '#9b59b6',
      safety: '#e67e22',
      general: '#95a5a6'
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

  // Show loading if Google Maps not loaded yet
  if (!isLoaded) {
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
    <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={hasInitialized ? undefined : delhiCenter}
        zoom={11}
        options={mapOptions}
        onLoad={onLoad}
        onClick={handleMapClick}
      >
        {/* Display route directions if available */}
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
                 selectedMarker.data.category === 'traffic' ? '🚦 Traffic Condition' :
                 selectedMarker.data.category === 'facility' ? '🏢 Facility Issue' :
                 selectedMarker.data.category === 'metro' ? '🚇 Metro/Transit' :
                 selectedMarker.data.category === 'safety' ? '⚠️ Safety Concern' :
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
  );
};

export default MapViewGoogle;
