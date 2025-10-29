import React from 'react';

function Favorites({ favorites, onRemoveFromFavorites, onRefreshFavorites, isLoadingFavorites }) {
  return (
    <div className="container-page">
      <div className="card">
        <div className="card-header">
          <h2>Saved Parking Lots</h2>
          <button className="btn" onClick={onRefreshFavorites} disabled={isLoadingFavorites}>
            {isLoadingFavorites ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <div className="card-body">
          {favorites.length === 0 && <p>No favorites yet.</p>}
          <ul className="list">
            {favorites.map((f) => (
              <li key={f.parkingLotId} className="list-item">
                <div>
                  <div className="title">{f.name || f.parkingLotId}</div>
                  {f.location && <div className="meta">{f.location.lat}, {f.location.lng}</div>}
                </div>
                <div className="actions">
                  <button className="btn" onClick={() => onRemoveFromFavorites(f.parkingLotId)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Favorites;


