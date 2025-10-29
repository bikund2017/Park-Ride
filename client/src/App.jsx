import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Socket.IO imported conditionally to avoid errors on Vercel
import axios from 'axios';
import MapView from './components/MapView.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Reports from './pages/Reports.jsx';
import Favorites from './pages/Favorites.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';
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

  // Fetch favorites: only show blocking loader if we have no cached data
  const favoritesFetchInFlight = useRef(false);
  const lastFavoritesFetch = useRef(0);

  const fetchFavorites = useCallback(async () => {
    if (isLoadingFavorites) return;
    const now = Date.now();
    if (favoritesFetchInFlight.current) return;
    if (now - lastFavoritesFetch.current < 8000) return; // rate limit 8s
    const shouldBlock = favorites.length === 0;
    let safetyTimer;
    try {
      favoritesFetchInFlight.current = true;
      if (shouldBlock) {
        setIsLoadingFavorites(true);
        safetyTimer = setTimeout(() => setIsLoadingFavorites(false), 5000);
      }
      const response = await axios.get('/api/favorites?userId=anonymous');
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      if (error.response?.status !== 429) {
        console.error('Favorites fetch error:', error);
      }
    } finally {
      lastFavoritesFetch.current = Date.now();
      favoritesFetchInFlight.current = false;
      if (shouldBlock) {
        clearTimeout(safetyTimer);
        setIsLoadingFavorites(false);
      }
    }
  }, [favorites.length, isLoadingFavorites]);

  // Add to favorites function
  const addToFavorites = async (parkingLotId) => {
    try {
      const response = await axios.post('/api/favorites', {
        parkingLotId: Number(parkingLotId),
        userId: 'anonymous'
      });
      setFavorites(prev => [response.data.favorite, ...prev]);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      const serverMessage = error.response?.data?.message;
      alert(serverMessage ? `Failed to add to favorites: ${serverMessage}` : 'Failed to add to favorites. Please try again.');
    }
  };

  // Remove from favorites function
  const removeFromFavorites = async (parkingLotId) => {
    try {
      await axios.delete(`/api/favorites/delete?userId=anonymous&parkingLotId=${parkingLotId}`);
      setFavorites(prev => prev.filter(fav => fav.parkingLotId !== parkingLotId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  useEffect(() => {
    // Detect if running on Vercel or locally
    const isVercel = window.location.hostname.includes('vercel.app');
    let socket = null;
    let pollingInterval = null;

    // Function to fetch data via HTTP (for Vercel)
    const fetchDataViaHttp = async () => {
      try {
        const response = await axios.get('/api/transit-data');
        if (response.data) {
          setParkingData(response.data.parkingLots || []);
          setTransitData(response.data.transitVehicles || []);
          setDataSource(response.data.dataMode || '🔴 Simulated (Fallback)');
          setIsConnected(true);
          setIsLoadingData(false);
        }
      } catch (error) {
        console.error('Error fetching transit data:', error);
        setIsConnected(false);
        setDataSource('Error');
      }
    };

    if (isVercel) {
      // Use HTTP polling for Vercel deployment
      console.log('Running on Vercel - using HTTP polling');
      setIsConnected(true);
      
      // Initial fetch
      fetchDataViaHttp();
      
      // Poll every 10 seconds
      pollingInterval = setInterval(fetchDataViaHttp, 10000);
    } else {
      // Use Socket.IO for local development - import dynamically
      console.log('Running locally - using Socket.IO');
      
      import('socket.io-client').then((socketIO) => {
        const io = socketIO.default || socketIO;
        socket = io('http://localhost:3002');

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
        pollingInterval = setInterval(fetchTransitInfo, 10000);
      }).catch((error) => {
        console.error('Failed to load Socket.IO:', error);
        setIsConnected(false);
      });
    }

    // Fetch reports on component mount
    fetchReports();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
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

  // Add error logging
  useEffect(() => {
    console.log('App mounted successfully');
    console.log('Environment:', window.location.hostname);
    console.log('Is Vercel:', window.location.hostname.includes('vercel.app'));
  }, []);

  return (
    <BrowserRouter>
      <div className="app-modern">
        <Navbar />
        <Header 
          isConnected={isConnected}
          metroCount={metroCount}
          busCount={busCount}
          trainCount={trainCount}
          parkingCount={parkingData.length}
          dataSource={dataSource}
        />
        <Routes>
          <Route 
            path="/" 
            element={(
              <Home>
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
              </Home>
            )}
          />
          <Route 
            path="/reports" 
            element={(
              <Reports 
                reports={reports}
                onUpvote={handleUpvote}
                onRefreshReports={fetchReports}
                isLoadingReports={isLoadingReports}
              />
            )} 
          />
          <Route 
            path="/favorites" 
            element={(
              <Favorites 
                favorites={favorites}
                onRemoveFromFavorites={removeFromFavorites}
                onRefreshFavorites={fetchFavorites}
                isLoadingFavorites={isLoadingFavorites}
              />
            )}
          />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
