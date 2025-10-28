import React, { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './RoutePlanner.css';

const RoutePlanner = ({ parkingData, transitData, selectedLocation }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mode, setMode] = useState('auto'); // auto | metro | bus | train | walk
  const [recent, setRecent] = useState(() => {
    try {
      const raw = localStorage.getItem('route_recent');
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  });

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

  // Basic helpers to derive coordinates and distance for rough validation/UX
  const cityLatLng = {
    'delhi': { lat: 28.6139, lng: 77.2090 },
    'new delhi': { lat: 28.6139, lng: 77.2090 },
    'patna': { lat: 25.5941, lng: 85.1376 },
    'bihar': { lat: 25.5941, lng: 85.1376 },
    'gurugram': { lat: 28.4595, lng: 77.0266 },
    'noida': { lat: 28.5355, lng: 77.3910 },
    'ghaziabad': { lat: 28.6692, lng: 77.4538 }
  };

  const parseLatLng = (text) => {
    if (!text) return null;
    const t = text.trim();
    const coordMatch = t.match(/^\s*(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)\s*$/);
    if (coordMatch) {
      return { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
    }
    const key = t.toLowerCase();
    if (cityLatLng[key]) return cityLatLng[key];
    return null;
  };

  const haversineKm = (a, b) => {
    if (!a || !b) return null;
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const originPoint = useMemo(() => parseLatLng(origin), [origin]);
  const destinationPoint = useMemo(() => parseLatLng(destination), [destination]);
  const approxDistanceKm = useMemo(() => haversineKm(originPoint, destinationPoint), [originPoint, destinationPoint]);

  const calculateRoutes = async () => {
    if (!origin.trim() || !destination.trim()) {
      alert('Please enter both origin and destination');
      return;
    }

    setIsCalculating(true);
    try {
      // Try to resolve coordinates via free OSM Nominatim if not coordinates/known city
      const geocode = async (query) => {
        const existing = parseLatLng(query);
        if (existing) return existing;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return null;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
        return null;
      };

      const resolvePoint = async (input, fallback) => {
        const p = parseLatLng(input);
        if (p) return p;
        const g = await geocode(input);
        return g || fallback;
      };

      const a = await resolvePoint(origin, originPoint);
      const b = await resolvePoint(destination, destinationPoint);
      const intercityKm = haversineKm(a, b);

      const osrmProfileMap = { auto: 'driving', walk: 'walking', metro: 'driving', bus: 'driving', train: 'driving' };
      const osrmProfile = osrmProfileMap[mode] || 'driving';

      // If distance is large (> 50km) or mode is walk/auto with resolvable points, try OSRM direct route
      if (a && b && (intercityKm == null ? false : intercityKm > 50 || mode === 'walk' || mode === 'auto')) {
        const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false&geometries=geojson`;
        const osrmRes = await fetch(osrmUrl, { headers: { 'Accept': 'application/json' } });
        if (osrmRes.ok) {
          const osrmJson = await osrmRes.json();
          const route0 = osrmJson?.routes?.[0];
          if (route0) {
            const totalMinutes = Math.round(route0.duration / 60);
            const distanceKm = Math.round(route0.distance / 1000);
            const drivingCost = osrmProfile === 'driving' ? Math.round(distanceKm * 12) : 0; // rough estimate ₹12/km
            setRoutes([{
              id: 'direct-osrm',
              parkingLot: { name: 'Direct Route', address: `${origin} → ${destination}`, availableSpots: '-', hourlyRate: 0 },
              walkingTime: osrmProfile === 'walking' ? totalMinutes : Math.max(5, Math.round(totalMinutes * 0.1)),
              transitTime: osrmProfile === 'walking' ? 0 : Math.round(totalMinutes * 0.9),
              totalTime: totalMinutes,
              cost: drivingCost,
              transitType: osrmProfile,
              rating: 5,
              description: `Direct ${osrmProfile} route • ~${distanceKm} km`
            }]);
            saveRecent(origin, destination);
            return;
          }
        }
        // If OSRM fails, fall through to local heuristic below
      }

      // Simulate route calculation with available parking and transit data
      const availableParking = parkingData.filter(lot => lot.availableSpots > 0);
      // const metroStations = transitData.filter(v => v.vehicleType === 'metro');
      // const busStations = transitData.filter(v => v.vehicleType === 'bus');

      // Simple route calculation logic
      const candidateLots = availableParking.slice(0, 5);
      const calculatedRoutes = candidateLots.slice(0, 3).map((parkingLot, index) => {
        const walkingTime = Math.floor(Math.random() * 10) + 5; // 5-15 minutes
        const baseTransit = Math.floor(Math.random() * 30) + 15; // 15-45 minutes
        const transitTime = mode === 'metro' ? Math.max(10, baseTransit - 5)
                           : mode === 'bus' ? baseTransit + 5
                           : mode === 'train' ? baseTransit
                           : mode === 'walk' ? walkingTime + 10
                           : baseTransit;
        const totalTime = walkingTime + transitTime;
        const cost = (Number(parkingLot.hourlyRate) || 0) * 2; // Safe fallback

        return {
          id: `route-${index}`,
          parkingLot,
          walkingTime,
          transitTime,
          totalTime,
          cost,
          transitType: mode === 'auto' ? (index % 2 === 0 ? 'metro' : 'bus') : mode,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          description: `Park at ${parkingLot.name}, then take ${mode === 'auto' ? (index % 2 === 0 ? 'metro' : 'bus') : mode} to destination`
        };
      });

      // Sort by total time
      calculatedRoutes.sort((a, b) => a.totalTime - b.totalTime);
      setRoutes(calculatedRoutes);
      saveRecent(origin, destination);
    } catch (error) {
      console.error('Error calculating routes:', error);
      alert('Error calculating routes. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const selectRoute = (route) => {
    setSelectedRoute(route);
  };

  return (
    <div className="route-planner">
      <h3>🗺️ Route Planner</h3>
      
      <div className="route-inputs">
        <div className="input-group">
          <label htmlFor="origin">From:</label>
          <input
            type="text"
            id="origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Enter starting location"
            className="route-input"
          />
          <div className="input-actions">
            <button className="sub-btn" onClick={() => handleUseMyLocation(setOrigin)}>Use my location</button>
            <button className="sub-btn" onClick={handleSwap}>Swap</button>
          </div>
        </div>
        
        <div className="input-group">
          <label htmlFor="destination">To:</label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination"
            className="route-input"
          />
          <div className="input-actions">
            <button className="sub-btn" onClick={() => handleUseMyLocation(setDestination)}>Use my location</button>
          </div>
        </div>

        <div className="modes">
          {['auto','metro','bus','train','walk'].map(m => (
            <button
              key={m}
              className={`mode-btn ${mode === m ? 'active' : ''}`}
              onClick={() => setMode(m)}
            >
              {m === 'auto' ? 'Auto' : m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        
        <button 
          onClick={calculateRoutes}
          disabled={isCalculating}
          className="calculate-btn"
        >
          {isCalculating ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LoadingSpinner size="small" text="" />
              Calculating...
            </div>
          ) : 'Find Best Route'}
        </button>
      </div>

      {recent.length > 0 && (
        <div className="recent">
          <h4>Recent</h4>
          <div className="recent-list">
            {recent.map((r) => (
              <button key={`${r.o}-${r.d}-${r.t}`} className="recent-item" onClick={() => { setOrigin(r.o); setDestination(r.d); }}>
                <span>{r.o}</span>
                <span>→</span>
                <span>{r.d}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {approxDistanceKm != null && approxDistanceKm > 100 && (
        <div className="route-warning">
          This planner is optimized for Delhi NCR local trips. Your inputs are approximately {Math.round(approxDistanceKm)} km apart.
        </div>
      )}

      {routes.length > 0 && (
        <div className="routes-results">
          <h4>Recommended Routes</h4>
          <div className="routes-list">
            {routes.map((route, index) => (
              <div 
                key={route.id} 
                className={`route-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                onClick={() => selectRoute(route)}
              >
                <div className="route-header">
                  <h5>Option {index + 1}</h5>
                  <div className="route-rating">
                    {'★'.repeat(route.rating)}{'☆'.repeat(5 - route.rating)}
                  </div>
                </div>
                
                <div className="route-details">
                  <div className="route-info">
                    <span className="info-item">
                      <strong>Parking:</strong> {route.parkingLot.name}
                    </span>
                    <span className="info-item">
                      <strong>Transit:</strong> {route.transitType === 'metro' ? '🚇 Metro' : '🚌 Bus'}
                    </span>
                  </div>
                  
                  <div className="route-stats">
                    <div className="stat">
                      <span className="stat-label">Total Time</span>
                      <span className="stat-value">{route.totalTime} min</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Walking</span>
                      <span className="stat-value">{route.walkingTime} min</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Transit</span>
                      <span className="stat-value">{route.transitTime} min</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Cost</span>
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

      {selectedRoute && (
        <div className="selected-route">
          <h4>Selected Route Details</h4>
          <div className="route-summary">
            <p><strong>Parking Location:</strong> {selectedRoute.parkingLot.name}</p>
            <p><strong>Address:</strong> {selectedRoute.parkingLot.address}</p>
            <p><strong>Available Spots:</strong> {selectedRoute.parkingLot.availableSpots}</p>
            <p><strong>Hourly Rate:</strong> ₹{selectedRoute.parkingLot.hourlyRate}/hr</p>
            <p><strong>Total Journey Time:</strong> {selectedRoute.totalTime} minutes</p>
            <p><strong>Estimated Cost:</strong> ₹{selectedRoute.cost}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlanner;
