import React from 'react';
import { NavLink } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container-page">
      <div className="card">
        <div className="card-body">
          <h2>Page not found</h2>
          <p>The page you’re looking for doesn’t exist.</p>
          <NavLink to="/" className="btn">Go Home</NavLink>
        </div>
      </div>
    </div>
  );
}

export default NotFound;


