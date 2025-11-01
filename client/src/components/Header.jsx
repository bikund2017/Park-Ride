import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Header.css';

const Header = ({ isConnected, metroCount, parkingCount, dataSource, userName, userEmail }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <header className="header-modern">
      <div className="header-top">
        <div className="header-title">
          <h1>🚇 Park & Ride+</h1>
          <span className="subtitle">Delhi NCR Transit Hub</span>
        </div>
        <div className="header-status-group">
          <div className={`data-source-badge ${dataSource.includes('Real-time') ? 'live' : 'simulated'}`}>
            <span className="badge-icon">{dataSource.includes('Real-time') ? '✓' : '⚠'}</span>
            <span className="badge-text">{dataSource}</span>
          </div>
          <div className="connection-status">
            <div className={`status-dot ${isConnected ? 'live' : 'offline'}`}></div>
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
          <div className="user-profile-header">
            <span className="user-name" title={userEmail || userName}>👤 {userName}</span>
            <button onClick={handleLogout} className="btn-logout-header">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="header-stats">
        <div className="stat-item-modern">
          <div className="stat-emoji">🚇</div>
          <div className="stat-info">
            <div className="stat-value">{metroCount}</div>
            <div className="stat-label">Metro Lines</div>
          </div>
        </div>
        
        <div className="stat-item-modern">
          <div className="stat-emoji">🅿️</div>
          <div className="stat-info">
            <div className="stat-value">{parkingCount}</div>
            <div className="stat-label">Parking Lots</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
