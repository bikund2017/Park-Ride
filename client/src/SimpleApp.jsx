import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function HomePage() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Initial message');

  useEffect(() => {
    console.log('✅ useEffect running in HomePage');
    setMessage('useEffect executed successfully!');
    
    const timer = setTimeout(() => {
      setCount(c => c + 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  console.log('HomePage render - count:', count, 'message:', message);

  return (
    <div style={{ padding: '20px' }}>
      <h2>✅ Home Page</h2>
      <p>Message: {message}</p>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: '10px 20px',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Increment ({count})
      </button>
    </div>
  );
}

function AboutPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>About Page</h2>
      <p>Park & Ride+ Delhi NCR - Real-time transit tracking</p>
    </div>
  );
}

function SimpleApp() {
  console.log('✅ SimpleApp rendering...');
  
  return (
    <BrowserRouter>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <nav style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '20px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>🏠 Home</Link>
          <Link to="/about" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>ℹ️ About</Link>
        </nav>
        
        <div style={{ padding: '40px' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
            🚇 Park & Ride+ Delhi NCR
          </h1>
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<div style={{ padding: '20px' }}>❌ Page Not Found</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default SimpleApp;
