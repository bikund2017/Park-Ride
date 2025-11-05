import React, { useState, useEffect, useCallback } from 'react';
import ReportForm from './ReportForm.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import RoutePlanner from './RoutePlanner.jsx';
import './Sidebar.css';

const Sidebar = ({ parkingData, transitData, selectedLocation, onClearLocation, metroCount, reports, onUpvote, onRefreshReports, isLoadingReports, isLoadingData, favorites, onAddToFavorites, onRemoveFromFavorites, onRefreshFavorites, isLoadingFavorites, onRouteCalculated, isGoogleMapsLoaded, selectedParkingId, selectedSearchResult, mapSearchQuery }) => {
  const [activeTab, setActiveTab] = useState('report');
  const [filteredReports, setFilteredReports] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedParking = selectedParkingId 
    ? parkingData.find(lot => lot.id === selectedParkingId)
    : null;

  // Get real-time Arduino data for the selected parking
  const getUpdatedParkingData = () => {
    if (!selectedSearchResult) return null;
    
    // Find Arduino-connected parking for real-time data
    const arduinoParking = parkingData.find(p => p.arduinoConnected);
    
    if (!arduinoParking) return selectedSearchResult;
    
    // Merge selected parking info with real-time Arduino data
    return {
      ...selectedSearchResult,
      availableSpots: arduinoParking.availableSpots,
      capacity: arduinoParking.capacity,
      hourlyRate: arduinoParking.hourlyRate,
      occupancyRate: Math.round((1 - arduinoParking.availableSpots / arduinoParking.capacity) * 100),
      arduinoConnected: true
    };
  };

  const updatedSelectedParking = getUpdatedParkingData();

  // Auto-switch to parking tab when parking is selected
  useEffect(() => {
    if (selectedParkingId) {
      setActiveTab('parking');
    } else if (selectedSearchResult && mapSearchQuery && mapSearchQuery.toLowerCase().includes('park')) {
      // If user searched for parking and clicked a result, switch to parking tab
      setActiveTab('parking');
    }
  }, [selectedParkingId, selectedSearchResult, mapSearchQuery]);

  const tabs = [
    { id: 'report', label: '📝 Report', emoji: '📝' },
    { id: 'reports', label: '📋 Reports', emoji: '📋' },
    { id: 'favorites', label: '⭐ Favorites', emoji: '⭐' },
    { id: 'route', label: '🗺️ Route', emoji: '🗺️' },
    { id: 'parking', label: '🅿️ Parking', emoji: '🅿️' },
    { id: 'metro', label: '🚇 Metro', emoji: '🚇' }
  ];
  
  useEffect(() => {
    let filtered = reports;
    

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }
    

    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredReports(filtered);
  }, [reports, categoryFilter, searchQuery]);

  useEffect(() => {
    if (activeTab === 'reports' && onRefreshReports) {
      const interval = setInterval(onRefreshReports, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab, onRefreshReports]);

  useEffect(() => {
    if (activeTab !== 'favorites') return;
    if (onRefreshFavorites) {
      onRefreshFavorites();
    }
  }, [activeTab, onRefreshFavorites]);

  return (
    <div className="sidebar-modern">
      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-emoji">{tab.emoji}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="sidebar-content">
        {activeTab === 'report' && (
          <ReportForm 
            selectedLocation={selectedLocation} 
            onClearLocation={onClearLocation}
            onRefreshReports={onRefreshReports}
          />
        )}

        {activeTab === 'reports' && (
          <div className="data-section">
            <div className="section-header">
              <h3>📋 Community Reports</h3>
              <span className="count-badge">{filteredReports.length}</span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
              >
                <option value="all">All Categories</option>
                <option value="parking">🚗 Parking</option>
                <option value="metro">🚇 Metro</option>
                <option value="general">📝 General</option>
              </select>
              <input
                type="text"
                placeholder="🔍 Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>

            <div className="card-list">
              {isLoadingReports ? (
                <div>
                  <div className="skeleton-card">
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                  <div className="skeleton-card">
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                  <div className="skeleton-card">
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report) => {
                  const categoryNames = {
                    parking: '🚗 Parking Issue',
                    metro: '🚇 Metro/Transit',
                    general: '📝 General Report'
                  };
                  
                  const handleUpvote = () => {
                    onUpvote(report.id);
                  };
                  
                  return (
                    <div key={report.id} className="data-card">
                      <div className="card-header">
                        <h4>{categoryNames[report.category]}</h4>
                        {report.resolved && <span style={{ color: '#10b981' }}>✓ Resolved</span>}
                      </div>
                      <p>{report.description}</p>
                      {report.imageUrl && (
                        <div style={{ margin: '0.5rem 0' }}>
                          <img 
                            src={report.imageUrl} 
                            alt="Report" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '120px', 
                              borderRadius: '4px',
                              objectFit: 'cover'
                            }} 
                          />
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#666' }}>👍 {report.upvotes || 0}</span>
                          <button 
                            onClick={handleUpvote}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '2px 8px',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '0.7rem'
                            }}
                          >
                            Upvote
                          </button>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{report.submittedAt}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <p>No reports found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="data-section">
            <div className="section-header">
              <h3>⭐ Favorite Parking</h3>
              <span className="count-badge">{favorites.length}</span>
            </div>
            
            <div className="card-list">
              {isLoadingFavorites ? (
                <LoadingSpinner text="Loading favorites..." />
              ) : favorites.length > 0 ? (
                favorites.map((favorite) => {
                  const lot = favorite.parkingLot;
                  const occupancyRate = (lot.capacity - lot.availableSpots) / lot.capacity;
                  let statusClass = 'available';
                  let statusText = 'Available';
                  
                  if (occupancyRate > 0.8) {
                    statusClass = 'full';
                    statusText = 'Nearly Full';
                  } else if (occupancyRate > 0.5) {
                    statusClass = 'limited';
                    statusText = 'Limited';
                  }
                  
                  return (
                    <div key={favorite.id} className="data-card parking favorite">
                      <div className="card-header">
                        <h4>{lot.name}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span className={`status-badge ${statusClass}`}>{statusText}</span>
                          <button 
                            onClick={() => onRemoveFromFavorites(lot.id)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              cursor: 'pointer',
                              fontSize: '0.7rem'
                            }}
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                      <div className="card-stats">
                        <div className="stat">
                          <span className="stat-label">Available</span>
                          <span className="stat-value">{lot.availableSpots}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Capacity</span>
                          <span className="stat-value">{lot.capacity}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Rate</span>
                          <span className="stat-value">₹{lot.hourlyRate}/hr</span>
                        </div>
                      </div>
                      <div className="card-details">
                        <p><span className="detail-label">📍 Address:</span> {lot.address}</p>
                        <p><span className="detail-label">⏰ Added:</span> {new Date(favorite.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <p>No favorite parking locations yet</p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Click the ⭐ button on parking lots to add them to favorites
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'route' && (
          <RoutePlanner 
            parkingData={parkingData}
            transitData={transitData}
            selectedLocation={selectedLocation}
            onRouteCalculated={onRouteCalculated}
            isLoaded={isGoogleMapsLoaded}
          />
        )}

        {activeTab === 'parking' && (
          <div className="data-section">
            {/* Show selected search result if from Google Maps search */}
            {updatedSelectedParking && mapSearchQuery && (
              <div style={{
                background: 'linear-gradient(135deg, rgb(76, 175, 80) 0%, rgb(69, 160, 73) 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                boxShadow: 'rgba(76, 175, 80, 0.3) 0px 6px 20px',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '15px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <span style={{ fontSize: '28px', marginRight: '12px' }}>🅿️</span>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    Selected Parking Location
                  </h4>
                </div>
                <div style={{ fontSize: '14px' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                      {updatedSelectedParking.name}
                    </p>
                    <p style={{ margin: '0', fontSize: '13px', opacity: 0.95, lineHeight: '1.5' }}>
                      📍 {updatedSelectedParking.address}
                    </p>
                  </div>
                  
                  {updatedSelectedParking.rating && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '12px',
                      display: 'inline-block'
                    }}>
                      <span style={{ fontSize: '13px' }}>
                        ⭐ Rating: <strong>{updatedSelectedParking.rating}</strong> / 5.0
                      </span>
                    </div>
                  )}
                  
                  {/* Arduino Data for Parking */}
                  {updatedSelectedParking.type === 'parking' && updatedSelectedParking.capacity && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>🚗 Available Spots:</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {updatedSelectedParking.availableSpots} / {updatedSelectedParking.capacity}
                        </span>
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '4px',
                        height: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: updatedSelectedParking.availableSpots > (updatedSelectedParking.capacity * 0.5)
                            ? '#4caf50'
                            : updatedSelectedParking.availableSpots > (updatedSelectedParking.capacity * 0.2)
                            ? '#ff9800'
                            : '#f44336',
                          width: `${(updatedSelectedParking.availableSpots / updatedSelectedParking.capacity) * 100}%`,
                          height: '100%',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: '12px', opacity: 0.9 }}>
                        Occupancy: {updatedSelectedParking.occupancyRate}%
                      </p>
                    </div>
                  )}
                  
                  {updatedSelectedParking.hourlyRate && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '12px',
                      display: 'inline-block'
                    }}>
                      <span style={{ fontSize: '13px' }}>
                        💰 Rate: <strong>₹{updatedSelectedParking.hourlyRate}/hour</strong>
                      </span>
                    </div>
                  )}
                  
                  <div style={{ 
                    marginTop: '12px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    borderLeft: '4px solid rgba(255, 255, 255, 0.6)'
                  }}>
                    <p style={{ margin: 0, lineHeight: '1.6' }}>
                      <strong>ℹ️ Data Source:</strong> 
                      {updatedSelectedParking.arduinoConnected
                        ? ' Real-time parking availability is being updated from Arduino sensors.'
                        : ' Real-time availability data will be displayed when Arduino sensors are connected.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="section-header">
              <h3>🅿️ Parking Status</h3>
              <span className="count-badge">{parkingData.length}</span>
            </div>
            <div className="card-list">
              {isLoadingData ? (
                <LoadingSpinner text="Loading parking data..." />
              ) : parkingData.length > 0 ? (
                parkingData
                  .sort((a, b) => {
                    // Arduino-connected parking appears first
                    if (a.arduinoConnected && !b.arduinoConnected) return -1;
                    if (!a.arduinoConnected && b.arduinoConnected) return 1;
                    return 0;
                  })
                  .map((lot) => {
                  const occupancyRate = (lot.capacity - lot.availableSpots) / lot.capacity;
                  let statusClass = 'available';
                  let statusText = 'Available';
                  
                  if (occupancyRate > 0.8) {
                    statusClass = 'full';
                    statusText = 'Nearly Full';
                  } else if (occupancyRate > 0.5) {
                    statusClass = 'limited';
                    statusText = 'Limited';
                  }
                  
                  return (
                    <div 
                      key={lot.id} 
                      className={`data-card parking ${selectedParkingId === lot.id ? 'selected-parking' : ''}`}
                      style={selectedParkingId === lot.id ? {
                        border: '3px solid #667eea',
                        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      } : {}}
                    >
                      {selectedParkingId === lot.id && (
                        <div style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '8px 12px',
                          marginBottom: '10px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}>
                          📍 Currently Selected Parking
                        </div>
                      )}
                      <div className="card-header">
                        <h4>{lot.name}</h4>
                        <span className={`status-badge ${statusClass}`}>{statusText}</span>
                      </div>
                      <div className="card-stats">
                        <div className="stat">
                          <span className="stat-label">Available</span>
                          <span className="stat-value">{lot.availableSpots}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Capacity</span>
                          <span className="stat-value">{lot.capacity}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Occupancy</span>
                          <span className="stat-value">{Math.round((1 - lot.availableSpots / lot.capacity) * 100)}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${statusClass}`}
                          style={{ width: `${(1 - lot.availableSpots / lot.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                          ₹{lot.hourlyRate}/hr • {lot.address}
                        </span>
                        <button 
                          onClick={() => onAddToFavorites(lot.id)}
                          style={{
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          ⭐ Add to Favorites
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <p>No parking data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'metro' && (
          <div className="data-section">
            <div className="section-header">
              <h3>🚇 Delhi Metro</h3>
              <span className="count-badge">{metroCount}</span>
            </div>
            <div className="card-list">
              {isLoadingData ? (
                <LoadingSpinner text="Loading metro data..." />
              ) : transitData.filter(v => v.vehicleType === 'metro').length > 0 ? (
                transitData.filter(v => v.vehicleType === 'metro').map((vehicle) => (
                  <div key={vehicle.id} className="data-card metro">
                    <div className="card-header">
                      <h4>{vehicle.routeName}</h4>
                      <span className="vehicle-badge metro">Metro</span>
                    </div>
                    <div className="card-details">
                      <p><span className="detail-label">📍 Next Station:</span> {vehicle.nextStation}</p>
                      <p><span className="detail-label">⏱️ ETA:</span> {vehicle.estimatedArrival}</p>
                      <p><span className="detail-label">👥 Crowd:</span> {vehicle.crowdLevel}</p>
                    </div>
                    <div className="card-stats">
                      <div className="stat">
                        <span className="stat-label">Speed</span>
                        <span className="stat-value">{vehicle.speed} km/h</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Stations</span>
                        <span className="stat-value">{vehicle.totalStations}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Status</span>
                        <span className="stat-value">{vehicle.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No metro data available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
