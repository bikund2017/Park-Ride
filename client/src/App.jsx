import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
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
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || 'anonymous';
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  
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

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const response = await fetch('/api/reports');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleUpvote = async (reportId) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/upvote`, { method: 'POST' });
      const data = await response.json();
      
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { ...report, upvotes: data.upvotes }
            : report
        )
      );
    } catch (error) {
      console.error('Error upvoting:', error);
      alert('Failed to upvote report. Please try again.');
    }
  };

  const favoritesFetchInFlight = useRef(false);
  const lastFavoritesFetch = useRef(0);

  const fetchFavorites = useCallback(async () => {
    if (isLoadingFavorites) return;
    const now = Date.now();
    if (favoritesFetchInFlight.current) return;
    if (now - lastFavoritesFetch.current < 8000) return; 
    const shouldBlock = favorites.length === 0;
    let safetyTimer;
    try {
      favoritesFetchInFlight.current = true;
      if (shouldBlock) {
        setIsLoadingFavorites(true);
        safetyTimer = setTimeout(() => setIsLoadingFavorites(false), 5000);
      }
      const response = await fetch(`/api/favorites?userId=${userId}`);
      const data = await response.json();
      setFavorites(data.favorites || []);
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

  const addToFavorites = async (parkingLotId) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parkingLotId: Number(parkingLotId),
          userId: userId
        })
      });
      const data = await response.json();
      setFavorites(prev => [data.favorite, ...prev]);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      alert('Failed to add to favorites. Please try again.');
    }
  };

  const removeFromFavorites = async (parkingLotId) => {
    try {
      await fetch(`/api/favorites/delete?userId=${userId}&parkingLotId=${parkingLotId}`, {
        method: 'DELETE'
      });
      setFavorites(prev => prev.filter(fav => fav.parkingLotId !== parkingLotId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  useEffect(() => {
    
    const fetchDataViaHttp = async () => {
      try {
        const response = await fetch('/api/transit-data');
        const data = await response.json();
        if (data) {
          setParkingData(data.parkingLots || []);
          setTransitData(data.transitVehicles || []);
          setDataSource(data.dataMode || '🔴 Simulated (Fallback)');
          setIsConnected(true);
          setIsLoadingData(false);
        }
      } catch (error) {
        console.error('Error fetching transit data:', error);
        setIsConnected(false);
        setDataSource('Error');
      }
    };

    console.log('Using HTTP polling for data updates');
    setIsConnected(true);

    fetchDataViaHttp();

    const pollingInterval = setInterval(fetchDataViaHttp, 10000);

    fetchReports();

    return () => {
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

  useEffect(() => {
    console.log('App mounted successfully');
    console.log('Environment:', window.location.hostname);
    console.log('Is Vercel:', window.location.hostname.includes('vercel.app'));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {}
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="app-modern">
              <Navbar />
              <Header 
                isConnected={isConnected}
                metroCount={metroCount}
                busCount={busCount}
                trainCount={trainCount}
                parkingCount={parkingData.length}
                dataSource={dataSource}
                userName={userName}
                userEmail={currentUser?.email}
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
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
