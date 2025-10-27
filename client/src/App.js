import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import MapView from './components/MapView';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './index.css';
import './map-fix.css';

function App() {
  const [parkingData, setParkingData] = useState([]);
  const [transitData, setTransitData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dataSource, setDataSource] = useState('checking');
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Fetch reports function
  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const response = await axios.get('/api/reports');
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Handle upvote function
  const handleUpvote = async (reportId) => {
    try {
      const response = await axios.post(`/api/reports/${reportId}/upvote`);
      // Update the specific report's upvote count in state
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { ...report, upvotes: response.data.upvotes }
            : report
        )
      );
    } catch (error) {
      console.error('Error upvoting:', error);
      alert('Failed to upvote report. Please try again.');
    }
  };

  // Fetch favorites function with debouncing
  const fetchFavorites = async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingFavorites) return;
    
    try {
      setIsLoadingFavorites(true);
      const response = await axios.get('/api/favorites/anonymous');
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Don't show error to user for rate limiting, just log it
      if (error.response?.status !== 429) {
        console.error('Favorites fetch error:', error);
      }
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  // Add to favorites function
  const addToFavorites = async (parkingLotId) => {
    try {
      const response = await axios.post('/api/favorites', {
        parkingLotId,
        userId: 'anonymous'
      });
      setFavorites(prev => [response.data.favorite, ...prev]);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      alert('Failed to add to favorites. Please try again.');
    }
  };

  // Remove from favorites function
  const removeFromFavorites = async (parkingLotId) => {
    try {
      await axios.delete(`/api/favorites/anonymous/${parkingLotId}`);
      setFavorites(prev => prev.filter(fav => fav.parkingLotId !== parkingLotId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  useEffect(() => {
    const socket = io('http://localhost:3002');

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('update-data', (data) => {
      setParkingData(data.parkingLots);
      setTransitData(data.transitVehicles);
      setIsLoadingData(false);
    });

    // Fetch transit API info to determine data source
    const fetchTransitInfo = async () => {
      try {
        const response = await fetch('/api/transit-info');
        const info = await response.json();
        console.log('Transit API Info:', info);
        setDataSource(info.dataMode || 'Checking...');
      } catch (error) {
        console.error('Error fetching transit info:', error);
        setDataSource('Unknown');
      }
    };

    fetchTransitInfo();
    // Check data source every 10 seconds
    const interval = setInterval(fetchTransitInfo, 10000);

    // Fetch reports on component mount
    fetchReports();

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleMapClick = (location) => {
    setSelectedLocation(location);
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
  };

  const metroCount = transitData.filter(v => v.vehicleType === 'metro').length;
  const busCount = transitData.filter(v => v.vehicleType === 'bus').length;
  const trainCount = transitData.filter(v => v.vehicleType === 'train').length;

  return (
    <div className="app-modern">
      <Header 
        isConnected={isConnected}
        metroCount={metroCount}
        busCount={busCount}
        trainCount={trainCount}
        parkingCount={parkingData.length}
        dataSource={dataSource}
      />
      
      <div className="main-container">
        <div className="map-wrapper">
          <MapView 
            parkingData={parkingData} 
            transitData={transitData}
            onMapClick={handleMapClick}
            reports={reports}
            onUpvote={handleUpvote}
          />
        </div>
        
        <Sidebar 
          parkingData={parkingData}
          transitData={transitData}
          selectedLocation={selectedLocation}
          onClearLocation={handleClearLocation}
          metroCount={metroCount}
          busCount={busCount}
          trainCount={trainCount}
          reports={reports}
          onUpvote={handleUpvote}
          onRefreshReports={fetchReports}
          isLoadingReports={isLoadingReports}
          isLoadingData={isLoadingData}
          favorites={favorites}
          onAddToFavorites={addToFavorites}
          onRemoveFromFavorites={removeFromFavorites}
          onRefreshFavorites={fetchFavorites}
          isLoadingFavorites={isLoadingFavorites}
        />
      </div>
    </div>
  );
}

export default App;
