import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './RoutePlanner.css';

const RoutePlanner = ({ parkingData, transitData }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const calculateRoutes = async () => {
    if (!origin.trim() || !destination.trim()) {
      alert('Please enter both origin and destination');
      return;
    }

    setIsCalculating(true);
    try {
      // Simulate route calculation with available parking and transit data
      const availableParking = parkingData.filter(lot => lot.availableSpots > 0);
      // const metroStations = transitData.filter(v => v.vehicleType === 'metro');
      // const busStations = transitData.filter(v => v.vehicleType === 'bus');

      // Simple route calculation logic
      const calculatedRoutes = availableParking.slice(0, 3).map((parkingLot, index) => {
        const walkingTime = Math.floor(Math.random() * 10) + 5; // 5-15 minutes
        const transitTime = Math.floor(Math.random() * 30) + 15; // 15-45 minutes
        const totalTime = walkingTime + transitTime;
        const cost = parkingLot.hourlyRate * 2; // Assume 2 hours parking

        return {
          id: `route-${index}`,
          parkingLot,
          walkingTime,
          transitTime,
          totalTime,
          cost,
          transitType: index % 2 === 0 ? 'metro' : 'bus',
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          description: `Park at ${parkingLot.name}, then take ${index % 2 === 0 ? 'metro' : 'bus'} to destination`
        };
      });

      // Sort by total time
      calculatedRoutes.sort((a, b) => a.totalTime - b.totalTime);
      setRoutes(calculatedRoutes);
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
