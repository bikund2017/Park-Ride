import React from 'react';

function SimpleApp() {
  console.log('✅ SimpleApp rendering...');
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '40px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        🚇 Park & Ride+ Delhi NCR
      </h1>
      <p style={{ fontSize: '24px', marginBottom: '30px' }}>
        ✅ React is Working on Vercel!
      </p>
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
        <p><strong>Environment:</strong> {window.location.hostname}</p>
        <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
      </div>
      <button 
        onClick={() => fetch('/api/health').then(r => r.json()).then(d => alert(JSON.stringify(d, null, 2)))}
        style={{
          marginTop: '30px',
          padding: '15px 30px',
          fontSize: '18px',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Test API Connection
      </button>
    </div>
  );
}

export default SimpleApp;
