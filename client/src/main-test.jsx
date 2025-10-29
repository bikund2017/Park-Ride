import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Minimal test app
function TestApp() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial', 
      backgroundColor: '#1a202c',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>🎉 React is Working!</h1>
      <p>If you see this, React is rendering correctly.</p>
      <p>Environment: {window.location.hostname}</p>
      <button onClick={() => alert('JavaScript is working!')}>Test Click</button>
    </div>
  );
}

console.log('Test main.jsx loaded');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TestApp />);
