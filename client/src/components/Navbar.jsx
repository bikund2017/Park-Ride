import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <NavLink to="/" className="brand-link">Park & Ride+</NavLink>
        </div>
        <button className="menu-btn" onClick={() => setIsMenuOpen(v => !v)} aria-label="Toggle menu">
          <span className="menu-icon" />
        </button>
        <div className={`links ${isMenuOpen ? 'open' : ''}`}>
          <NavLink end to="/" className={({ isActive }) => isActive ? 'link active' : 'link'} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
          <NavLink to="/reports" className={({ isActive }) => isActive ? 'link active' : 'link'} onClick={() => setIsMenuOpen(false)}>Reports</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => isActive ? 'link active' : 'link'} onClick={() => setIsMenuOpen(false)}>Favorites</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'link active' : 'link'} onClick={() => setIsMenuOpen(false)}>About</NavLink>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;


