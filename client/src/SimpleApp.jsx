import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('✅ Fetching transit data...');
    
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/transit-data');
        console.log('✅ Data received:', response.data);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading data...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: '#ff6b6b' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Home Page with Data</h2>
      <p>✅ API is working! Data loaded successfully.</p>
      
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Transit Data Summary:</h3>
        <p>Parking Lots: {data?.parkingLots?.length || 0}</p>
        <p>Transit Vehicles: {data?.transitVehicles?.length || 0}</p>
        <p>Data Mode: {data?.dataMode || 'unknown'}</p>
      </div>

      <details style={{ marginTop: '20px' }}>
        <summary style={{ cursor: 'pointer', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
          View First Parking Lot
        </summary>
        <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
          {JSON.stringify(data?.parkingLots?.[0], null, 2)}
        </pre>
      </details>
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
