import React from 'react';
import './Header.css';

const Header = ({ isConnected, metroCount, busCount, trainCount, parkingCount, dataSource }) => {
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
          <div className="stat-emoji">🚌</div>
          <div className="stat-info">
            <div className="stat-value">{busCount}</div>
            <div className="stat-label">DTC Buses</div>
          </div>
        </div>
        
        <div className="stat-item-modern">
          <div className="stat-emoji">🚂</div>
          <div className="stat-info">
            <div className="stat-value">{trainCount}</div>
            <div className="stat-label">Trains</div>
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
