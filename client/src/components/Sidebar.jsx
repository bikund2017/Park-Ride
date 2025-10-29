import React, { useState, useEffect, useCallback } from 'react';
import ReportForm from './ReportForm.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import RoutePlanner from './RoutePlanner.jsx';
import './Sidebar.css';

const Sidebar = ({ parkingData, transitData, selectedLocation, onClearLocation, metroCount, busCount, trainCount, reports, onUpvote, onRefreshReports, isLoadingReports, isLoadingData, favorites, onAddToFavorites, onRemoveFromFavorites, onRefreshFavorites, isLoadingFavorites }) => {
  const [activeTab, setActiveTab] = useState('report');
  const [filteredReports, setFilteredReports] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'report', label: '📝 Report', emoji: '📝' },
    { id: 'reports', label: '📋 Reports', emoji: '📋' },
    { id: 'favorites', label: '⭐ Favorites', emoji: '⭐' },
    { id: 'route', label: '🗺️ Route', emoji: '🗺️' },
    { id: 'parking', label: '🅿️ Parking', emoji: '🅿️' },
    { id: 'metro', label: '🚇 Metro', emoji: '🚇' },
    { id: 'bus', label: '🚌 Bus', emoji: '🚌' },
    { id: 'train', label: '🚂 Train', emoji: '🚂' }
  ];
  
  // Filter reports based on category and search query
  useEffect(() => {
    let filtered = reports;
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredReports(filtered);
  }, [reports, categoryFilter, searchQuery]);

  // Refresh reports every 10 seconds when on reports tab
  useEffect(() => {
    if (activeTab === 'reports' && onRefreshReports) {
      const interval = setInterval(onRefreshReports, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab, onRefreshReports]);

  // Fetch favorites once when favorites tab becomes active; further refresh handled by global rate limit
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
                <option value="traffic">🚦 Traffic</option>
                <option value="facility">🏢 Facility</option>
                <option value="metro">🚇 Metro</option>
                <option value="safety">⚠️ Safety</option>
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
                    traffic: '🚦 Traffic Condition',
                    facility: '🏢 Facility Issue',
                    metro: '🚇 Metro/Transit',
                    safety: '⚠️ Safety Concern',
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
          />
        )}

        {activeTab === 'parking' && (
          <div className="data-section">
            <div className="section-header">
              <h3>🅿️ Parking Status</h3>
              <span className="count-badge">{parkingData.length}</span>
            </div>
            <div className="card-list">
              {isLoadingData ? (
                <LoadingSpinner text="Loading parking data..." />
              ) : parkingData.length > 0 ? (
                parkingData.map((lot) => {
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
                    <div key={lot.id} className="data-card parking">
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

        {activeTab === 'bus' && (
          <div className="data-section">
            <div className="section-header">
              <h3>🚌 DTC Bus</h3>
              <span className="count-badge">{busCount}</span>
            </div>
            <div className="card-list">
              {isLoadingData ? (
                <LoadingSpinner text="Loading bus data..." />
              ) : transitData.filter(v => v.vehicleType === 'bus').length > 0 ? (
                transitData.filter(v => v.vehicleType === 'bus').map((vehicle) => (
                  <div key={vehicle.id} className="data-card bus">
                    <div className="card-header">
                      <h4>{vehicle.routeName}</h4>
                      <span className="vehicle-badge bus">{vehicle.acAvailable ? 'AC Bus' : 'Bus'}</span>
                    </div>
                    <div className="card-details">
                      <p><span className="detail-label">🚏 Next Stop:</span> {vehicle.nextStop}</p>
                      <p><span className="detail-label">⏱️ ETA:</span> {vehicle.estimatedArrival}</p>
                      <p><span className="detail-label">👥 Crowd:</span> {vehicle.crowdLevel}</p>
                    </div>
                    <div className="card-stats">
                      <div className="stat">
                        <span className="stat-label">Speed</span>
                        <span className="stat-value">{vehicle.speed} km/h</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Stops</span>
                        <span className="stat-value">{vehicle.totalStops}</span>
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
                  <p>No bus data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'train' && (
          <div className="data-section">
            <div className="section-header">
              <h3>🚂 Railway</h3>
              <span className="count-badge">{trainCount}</span>
            </div>
            <div className="card-list">
              {isLoadingData ? (
                <LoadingSpinner text="Loading train data..." />
              ) : transitData.filter(v => v.vehicleType === 'train').length > 0 ? (
                transitData.filter(v => v.vehicleType === 'train').map((vehicle) => (
                  <div key={vehicle.id} className="data-card train">
                    <div className="card-header">
                      <h4>{vehicle.routeName}</h4>
                      <span className="vehicle-badge train">Train</span>
                    </div>
                    <div className="card-details">
                      <p><span className="detail-label">🚉 Platform:</span> {vehicle.platform}</p>
                      <p><span className="detail-label">🕐 Scheduled:</span> {vehicle.scheduledTime}</p>
                      <p><span className="detail-label">⏱️ Delay:</span> {vehicle.delay > 0 ? `${vehicle.delay} min` : 'On Time'}</p>
                    </div>
                    <div className="card-stats">
                      <div className="stat">
                        <span className="stat-label">Speed</span>
                        <span className="stat-value">{vehicle.speed} km/h</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Coaches</span>
                        <span className="stat-value">{vehicle.coaches}</span>
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
                  <p>No train data available</p>
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
