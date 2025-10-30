import React, { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';
import './RoutePlanner.css';

const RoutePlanner = ({ parkingData, transitData, selectedLocation, onRouteCalculated, isLoaded }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mode, setMode] = useState('DRIVING'); // DRIVING | TRANSIT | WALKING | BICYCLING
  const [directionsService, setDirectionsService] = useState(null);
  const [navigationSteps, setNavigationSteps] = useState([]);
  const [recent, setRecent] = useState(() => {
    try {
      const raw = localStorage.getItem('route_recent');
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  });

  // Initialize DirectionsService when Google Maps is loaded
  useEffect(() => {
    if (isLoaded && window.google) {
      setDirectionsService(new window.google.maps.DirectionsService());
    }
  }, [isLoaded]);

  useEffect(() => {
    if (selectedLocation && selectedLocation.lat && selectedLocation.lng && !origin) {
      setOrigin(`${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}`);
    }
  }, [selectedLocation, origin]);

  const saveRecent = (o, d) => {
    const entry = { o, d, t: Date.now() };
    const next = [entry, ...recent.filter(r => r.o !== o || r.d !== d)].slice(0, 5);
    setRecent(next);
    try { localStorage.setItem('route_recent', JSON.stringify(next)); } catch (_) {}
  };

  const handleUseMyLocation = async (setter) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setter(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      },
      () => alert('Unable to retrieve your location')
    );
  };

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const calculateRoutes = async () => {
    if (!origin.trim() || !destination.trim()) {
      alert('Please enter both origin and destination');
      return;
    }

    if (!directionsService) {
      alert('Google Maps is still loading. Please try again.');
      return;
    }

    setIsCalculating(true);
    setRoutes([]);
    setSelectedRoute(null);
    setNavigationSteps([]);

    try {
      const request = {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode[mode],
        provideRouteAlternatives: true, // Get multiple route options
        unitSystem: window.google.maps.UnitSystem.METRIC,
      };

      // Add transit options if mode is TRANSIT
      if (mode === 'TRANSIT') {
        request.transitOptions = {
          modes: [
            window.google.maps.TransitMode.BUS,
            window.google.maps.TransitMode.RAIL,
            window.google.maps.TransitMode.SUBWAY
          ],
          routingPreference: window.google.maps.TransitRoutePreference.FEWER_TRANSFERS
        };
      }

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          const calculatedRoutes = result.routes.map((route, index) => {
            const leg = route.legs[0];
            const durationMinutes = Math.round(leg.duration.value / 60);
            const distanceKm = (leg.distance.value / 1000).toFixed(1);
            
            // Calculate cost estimate
            let cost = 0;
            if (mode === 'DRIVING') {
              cost = Math.round(parseFloat(distanceKm) * 12); // ₹12/km for driving
            } else if (mode === 'TRANSIT') {
              cost = 40; // Average metro/bus fare in Delhi NCR
              if (leg.steps) {
                const transitSteps = leg.steps.filter(step => step.travel_mode === 'TRANSIT');
                cost = transitSteps.length * 20; // ₹20 per transit segment
              }
            } else if (mode === 'BICYCLING') {
              cost = 0;
            } else if (mode === 'WALKING') {
              cost = 0;
            }

            // Find nearest parking lot to origin
            const originLat = leg.start_location.lat();
            const originLng = leg.start_location.lng();
            let nearestParking = null;
            let minDistance = Infinity;

            parkingData.forEach(lot => {
              const [lat, lng] = lot.location;
              const distance = Math.sqrt(
                Math.pow(lat - originLat, 2) + Math.pow(lng - originLng, 2)
              );
              if (distance < minDistance && lot.availableSpots > 0) {
                minDistance = distance;
                nearestParking = lot;
              }
            });

            return {
              id: `route-${index}`,
              googleRoute: route,
              parkingLot: nearestParking || {
                name: 'No parking data',
                address: 'Start directly from origin',
                availableSpots: '-',
                hourlyRate: 0
              },
              distance: distanceKm,
              duration: durationMinutes,
              totalTime: durationMinutes,
              cost: cost + (nearestParking ? (nearestParking.hourlyRate || 0) * 2 : 0),
              transitType: mode.toLowerCase(),
              rating: 5 - index, // First route gets 5 stars
              description: `${leg.distance.text} • ${leg.duration.text} • via ${route.summary || 'recommended route'}`,
              steps: leg.steps
            };
          });

          calculatedRoutes.sort((a, b) => a.totalTime - b.totalTime);
          setRoutes(calculatedRoutes);
          
          // Auto-select first route and notify parent
          if (calculatedRoutes.length > 0) {
            selectRoute(calculatedRoutes[0]);
          }

          saveRecent(origin, destination);
        } else {
          console.error('Directions request failed:', status);
          alert(`Could not calculate route: ${status}. Please check your origin and destination.`);
        }
        setIsCalculating(false);
      });
    } catch (error) {
      console.error('Error calculating routes:', error);
      alert('Error calculating routes. Please try again.');
      setIsCalculating(false);
    }
  };

  const selectRoute = (route) => {
    setSelectedRoute(route);
    
    // Extract turn-by-turn navigation steps
    if (route.steps) {
      const steps = route.steps.map((step, index) => ({
        id: index,
        instruction: step.instructions.replace(/<[^>]*>/g, ''), // Strip HTML tags
        distance: step.distance.text,
        duration: step.duration.text,
        travelMode: step.travel_mode,
        transitDetails: step.transit
      }));
      setNavigationSteps(steps);
    }

    // Notify parent component to display route on map
    if (onRouteCalculated) {
      onRouteCalculated(route.googleRoute);
    }
  };

  return (
    <div className="route-planner">
      <h3>🗺️ Route Planner with Google Maps</h3>
      
      {!isLoaded && (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
          Loading Google Maps...
        </div>
      )}

      {isLoaded && (
        <>
          <div className="route-inputs">
            <div className="input-group">
              <label htmlFor="origin">From:</label>
              <input
                type="text"
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Enter starting location (e.g., Connaught Place)"
                className="route-input"
              />
              <div className="input-actions">
                <button className="sub-btn" onClick={() => handleUseMyLocation(setOrigin)}>
                  📍 My Location
                </button>
                <button className="sub-btn" onClick={handleSwap}>
                  ⇅ Swap
                </button>
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="destination">To:</label>
              <input
                type="text"
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination (e.g., India Gate)"
                className="route-input"
              />
              <div className="input-actions">
                <button className="sub-btn" onClick={() => handleUseMyLocation(setDestination)}>
                  📍 My Location
                </button>
              </div>
            </div>

            <div className="mode-selector">
              <label>Travel Mode:</label>
              <div className="modes">
                <button
                  className={`mode-btn ${mode === 'DRIVING' ? 'active' : ''}`}
                  onClick={() => setMode('DRIVING')}
                >
                  🚗 Driving
                </button>
                <button
                  className={`mode-btn ${mode === 'TRANSIT' ? 'active' : ''}`}
                  onClick={() => setMode('TRANSIT')}
                >
                  🚇 Transit
                </button>
                <button
                  className={`mode-btn ${mode === 'WALKING' ? 'active' : ''}`}
                  onClick={() => setMode('WALKING')}
                >
                  🚶 Walking
                </button>
                <button
                  className={`mode-btn ${mode === 'BICYCLING' ? 'active' : ''}`}
                  onClick={() => setMode('BICYCLING')}
                >
                  🚴 Bicycling
                </button>
              </div>
            </div>
            
            <button 
              onClick={calculateRoutes}
              disabled={isCalculating || !directionsService}
              className="calculate-btn"
            >
              {isCalculating ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LoadingSpinner size="small" text="" />
                  Calculating Real Routes...
                </div>
              ) : '🔍 Find Best Route with Google Maps'}
            </button>
          </div>

          {recent.length > 0 && (
            <div className="recent">
              <h4>📌 Recent Searches</h4>
              <div className="recent-list">
                {recent.map((r) => (
                  <button 
                    key={`${r.o}-${r.d}-${r.t}`} 
                    className="recent-item" 
                    onClick={() => { setOrigin(r.o); setDestination(r.d); }}
                  >
                    <span>{r.o}</span>
                    <span>→</span>
                    <span>{r.d}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {routes.length > 0 && (
            <div className="routes-results">
              <h4>📍 {routes.length} Route Option{routes.length > 1 ? 's' : ''} Found</h4>
              <div className="routes-list">
                {routes.map((route, index) => (
                  <div 
                    key={route.id} 
                    className={`route-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                    onClick={() => selectRoute(route)}
                  >
                    <div className="route-header">
                      <h5>
                        {index === 0 && '⭐ '}
                        Route Option {index + 1}
                        {index === 0 && ' (Fastest)'}
                      </h5>
                      <div className="route-rating">
                        {'★'.repeat(route.rating)}{'☆'.repeat(5 - route.rating)}
                      </div>
                    </div>
                    
                    <div className="route-details">
                      <div className="route-info">
                        <span className="info-item">
                          <strong>Mode:</strong> {getModeIcon(route.transitType)} {route.transitType}
                        </span>
                        {route.parkingLot.name !== 'No parking data' && (
                          <span className="info-item">
                            <strong>Parking:</strong> {route.parkingLot.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="route-stats">
                        <div className="stat stat-primary">
                          <span className="stat-label">Duration</span>
                          <span className="stat-value">{route.duration} min</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Distance</span>
                          <span className="stat-value">{route.distance} km</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Est. Cost</span>
                          <span className="stat-value">₹{route.cost}</span>
                        </div>
                      </div>
                      
                      <p className="route-description">{route.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedRoute && navigationSteps.length > 0 && (
            <div className="navigation-details">
              <h4>🧭 Turn-by-Turn Navigation</h4>
              <div className="navigation-steps">
                {navigationSteps.map((step, index) => (
                  <div key={step.id} className="nav-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <div className="step-instruction">
                        {getTravelModeIcon(step.travelMode)} {step.instruction}
                      </div>
                      <div className="step-details">
                        <span>{step.distance}</span>
                        <span>•</span>
                        <span>{step.duration}</span>
                        {step.transitDetails && (
                          <>
                            <span>•</span>
                            <span className="transit-info">
                              {step.transitDetails.line?.name || 'Transit'} 
                              {step.transitDetails.line?.short_name && ` (${step.transitDetails.line.short_name})`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedRoute && (
            <div className="selected-route">
              <h4>✓ Selected Route Summary</h4>
              <div className="route-summary">
                <div className="summary-item">
                  <span className="summary-label">📍 From:</span>
                  <span className="summary-value">{origin}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">📍 To:</span>
                  <span className="summary-value">{destination}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">🚗 Mode:</span>
                  <span className="summary-value">{mode}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">📏 Distance:</span>
                  <span className="summary-value">{selectedRoute.distance} km</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">⏱️ Duration:</span>
                  <span className="summary-value">{selectedRoute.duration} minutes</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">💰 Estimated Cost:</span>
                  <span className="summary-value">₹{selectedRoute.cost}</span>
                </div>
                {selectedRoute.parkingLot.name !== 'No parking data' && (
                  <>
                    <div className="summary-item">
                      <span className="summary-label">🅿️ Parking:</span>
                      <span className="summary-value">{selectedRoute.parkingLot.name}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">🔢 Available Spots:</span>
                      <span className="summary-value">{selectedRoute.parkingLot.availableSpots}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Helper functions for icons
const getModeIcon = (mode) => {
  const icons = {
    'driving': '🚗',
    'transit': '🚇',
    'walking': '🚶',
    'bicycling': '🚴'
  };
  return icons[mode.toLowerCase()] || '🚗';
};

const getTravelModeIcon = (mode) => {
  const icons = {
    'DRIVING': '🚗',
    'TRANSIT': '🚇',
    'WALKING': '🚶',
    'BICYCLING': '🚴'
  };
  return icons[mode] || '➡️';
};

export default RoutePlanner;
