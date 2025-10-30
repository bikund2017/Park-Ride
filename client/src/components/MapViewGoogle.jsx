import React, { useState, useCallback, useEffect } from 'react';
import { 
  GoogleMap, 
  useJsApiLoader, 
  Marker, 
  InfoWindow, 
  Polyline, 
  MarkerClusterer,
  DirectionsRenderer 
} from '@react-google-maps/api';

const libraries = ['marker', 'places', 'directions']; // Load necessary libraries

const MapViewGoogle = ({ parkingData, transitData, onMapClick, reports, onUpvote, selectedRoute }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  // Get Google Maps API key
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAP_API;

  // Load Google Maps API with useJsApiLoader instead of LoadScript
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
    version: 'weekly' // Use the latest version
  });

  // Update directions when selectedRoute changes
  useEffect(() => {
    if (selectedRoute && isLoaded) {
      setDirectionsResponse(selectedRoute);
      // Clear selected marker when route is shown
      setSelectedMarker(null);
    } else {
      setDirectionsResponse(null);
    }
  }, [selectedRoute, isLoaded]);

  // Debug: Log API key (only first few characters for security)
  console.log('Google Maps API Key loaded:', GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 'NOT FOUND');

  // Delhi center coordinates
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
    styles: [], // Can add custom styles here
  };

  const onLoad = useCallback((map) => {
    setMap(map);
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

  // Show loading state
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

  // Show error if maps failed to load
  if (loadError) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        background: '#f3f4f6',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <h2 style={{ color: '#ef4444' }}>❌ Error Loading Google Maps</h2>
          <p>{loadError.message}</p>
        </div>
      </div>
    );
  }

  // Show error if no API key
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        background: '#f3f4f6',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <h2 style={{ color: '#ef4444' }}>❌ Google Maps API Key Not Found</h2>
          <p>Please add <code>VITE_GOOGLE_MAP_API</code> to your <code>client/.env</code> file</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Restart the dev server after adding the API key.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={delhiCenter}
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

        {/* Only show markers when no route is being displayed */}
        {!directionsResponse && (
          <>
            {/* Parking Lot Markers */}
        {parkingData.map((lot) => (
          <Marker
            key={`parking-${lot.id}`}
            position={{ lat: lot.location[0], lng: lot.location[1] }}
            icon={getParkingMarkerIcon(lot)}
            onClick={() => setSelectedMarker({ type: 'parking', data: lot })}
          />
        ))}

        {/* Transit Vehicle Markers and Routes */}
        {transitData.map((vehicle) => {
          const routeColor = vehicle.vehicleType === 'metro' 
            ? vehicle.lineColor || '#3b82f6'
            : vehicle.vehicleType === 'bus' 
            ? '#f59e0b' 
            : '#8b5cf6';

          return (
            <React.Fragment key={`transit-${vehicle.id}`}>
              {/* Route Path */}
              {vehicle.routePath && (
                <Polyline
                  path={vehicle.routePath.map(coord => ({ lat: coord[0], lng: coord[1] }))}
                  options={{
                    strokeColor: routeColor,
                    strokeOpacity: 0.6,
                    strokeWeight: 3,
                  }}
                />
              )}

              {/* Vehicle Marker */}
              <Marker
                position={{ lat: vehicle.location[0], lng: vehicle.location[1] }}
                icon={getTransitIcon(vehicle)}
                onClick={() => setSelectedMarker({ type: 'transit', data: vehicle })}
              />
            </React.Fragment>
          );
        })}

        {/* Report Markers with Clustering */}
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

        {/* InfoWindow for Selected Marker */}
        {selectedMarker && selectedMarker.type === 'parking' && (
          <InfoWindow
            position={{ 
              lat: selectedMarker.data.location[0], 
              lng: selectedMarker.data.location[1] 
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ padding: '10px', minWidth: '200px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#047857' }}>
                {selectedMarker.data.name}
              </h4>
              <p style={{ margin: '5px 0' }}>
                <strong>Available:</strong> {selectedMarker.data.availableSpots} / {selectedMarker.data.capacity}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Occupancy:</strong>{' '}
                {Math.round((1 - selectedMarker.data.availableSpots / selectedMarker.data.capacity) * 100)}%
              </p>
            </div>
          </InfoWindow>
        )}

        {selectedMarker && selectedMarker.type === 'transit' && (
          <InfoWindow
            position={{ 
              lat: selectedMarker.data.location[0], 
              lng: selectedMarker.data.location[1] 
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ padding: '10px', minWidth: '250px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>
                {selectedMarker.data.vehicleType === 'metro' ? '🚇' : 
                 selectedMarker.data.vehicleType === 'bus' ? '🚌' : '🚂'}{' '}
                {selectedMarker.data.routeName}
              </h4>
              <p><strong>Type:</strong> {selectedMarker.data.vehicleType.toUpperCase()}</p>
              <p><strong>Vehicle ID:</strong> {selectedMarker.data.id}</p>
              <p><strong>Status:</strong> {selectedMarker.data.status}</p>
              <p><strong>Speed:</strong> {selectedMarker.data.speed} km/h</p>

              {selectedMarker.data.vehicleType === 'metro' && (
                <>
                  <p><strong>Next Station:</strong> {selectedMarker.data.nextStation}</p>
                  <p><strong>ETA:</strong> {selectedMarker.data.estimatedArrival}</p>
                  <p><strong>Crowd Level:</strong> {selectedMarker.data.crowdLevel}</p>
                </>
              )}

              {selectedMarker.data.vehicleType === 'bus' && (
                <>
                  <p><strong>Next Stop:</strong> {selectedMarker.data.nextStop}</p>
                  <p><strong>ETA:</strong> {selectedMarker.data.estimatedArrival}</p>
                  <p><strong>AC:</strong> {selectedMarker.data.acAvailable ? 'Yes' : 'No'}</p>
                </>
              )}

              {selectedMarker.data.vehicleType === 'train' && (
                <>
                  <p><strong>Platform:</strong> {selectedMarker.data.platform}</p>
                  <p><strong>Scheduled:</strong> {selectedMarker.data.scheduledTime}</p>
                  <p><strong>Delay:</strong> {selectedMarker.data.delay > 0 ? `${selectedMarker.data.delay} min` : 'On Time'}</p>
                </>
              )}
            </div>
          </InfoWindow>
        )}

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
          </>
        )}
      </GoogleMap>
  );
};

export default MapViewGoogle;
