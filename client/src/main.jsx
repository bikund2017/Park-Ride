import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

console.log('Main.jsx loaded - React version:', React.version);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
