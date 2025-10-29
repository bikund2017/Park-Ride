import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function HomePage() {
  console.log('✅ HomePage rendering...');
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>Home Page</h2>
      <p>If you see this, React Router is working!</p>
      <button 
        onClick={() => fetch('/api/health').then(r => r.json()).then(d => alert(JSON.stringify(d, null, 2)))}
        style={{
          padding: '10px 20px',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test API
      </button>
    </div>
  );
}

function AboutPage() {
  return <div style={{ padding: '20px' }}><h2>About Page</h2></div>;
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
        <nav style={{ padding: '20px', background: 'rgba(0,0,0,0.2)' }}>
          <Link to="/" style={{ color: 'white', marginRight: '20px' }}>Home</Link>
          <Link to="/about" style={{ color: 'white' }}>About</Link>
        </nav>
        
        <div style={{ padding: '40px' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
            🚇 Park & Ride+ Delhi NCR
          </h1>
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default SimpleApp;
