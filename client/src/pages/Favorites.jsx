import React from "react";

function Favorites({
  favorites,
  onRemoveFromFavorites,
  onRefreshFavorites,
  isLoadingFavorites,
}) {
  return (
    <div className="container-page">
      <div className="card">
        <div className="card-header">
          <h2>⭐ Favorite Parking Lots</h2>
          <span className="badge">{favorites.length}</span>
          <button
            className="btn"
            onClick={onRefreshFavorites}
            disabled={isLoadingFavorites}
          >
            {isLoadingFavorites ? "Refreshing…" : "🔄 Refresh"}
          </button>
        </div>
        <div className="card-body">
          {favorites.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}
            >
              <p style={{ fontSize: "48px", margin: "0" }}>⭐</p>
              <p style={{ marginTop: "16px" }}>No favorites yet.</p>
              <p style={{ fontSize: "14px", color: "#999" }}>
                Add parking lots to your favorites from the map!
              </p>
            </div>
          )}
          <div className="favorites-grid">
            {favorites.map((fav) => {
              const lot = fav.parkingLot || {};
              const hasData = lot.name || lot.location;

              return (
                <div key={fav.id || fav.parkingLotId} className="favorite-card">
                  <div className="favorite-header">
                    <h3>{lot.name || `Parking Lot #${fav.parkingLotId}`}</h3>
                    <button
                      className="btn-remove"
                      onClick={() => onRemoveFromFavorites(fav.parkingLotId)}
                      title="Remove from favorites"
                    >
                      ❌
                    </button>
                  </div>

                  {/* Display user information */}
                  {(fav.userName || fav.userEmail) && (
                    <div className="favorite-user-info">
                      <span className="user-badge">
                        👤{" "}
                        {fav.userName || fav.userEmail?.split("@")[0] || "User"}
                      </span>
                    </div>
                  )}

                  {hasData ? (
                    <>
                      {lot.location && (
                        <div className="favorite-info">
                          <span className="info-label">📍 Address:</span>
                          <span className="info-value">
                            {lot.location[0]?.toFixed(4)},{" "}
                            {lot.location[1]?.toFixed(4)}
                          </span>
                        </div>
                      )}

                      <div className="favorite-stats">
                        {lot.availableSpots !== undefined && lot.capacity && (
                          <>
                            <div className="stat">
                              <span className="stat-label">Available</span>
                              <span className="stat-value">
                                {lot.availableSpots}
                              </span>
                            </div>
                            <div className="stat">
                              <span className="stat-label">Capacity</span>
                              <span className="stat-value">{lot.capacity}</span>
                            </div>
                            <div className="stat">
                              <span className="stat-label">Rate</span>
                              <span className="stat-value">₹/hr</span>
                            </div>
                          </>
                        )}
                      </div>

                      {lot.availableSpots !== undefined && lot.capacity && (
                        <div
                          className="availability-badge"
                          style={{
                            background:
                              lot.availableSpots > lot.capacity * 0.2
                                ? "#10b981"
                                : "#ef4444",
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            display: "inline-block",
                            marginTop: "8px",
                          }}
                        >
                          {lot.availableSpots > lot.capacity * 0.2
                            ? "AVAILABLE"
                            : "LIMITED"}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="favorite-info">
                      <span className="info-label">🕐 Added:</span>
                      <span className="info-value">
                        {fav.createdAt?._seconds
                          ? new Date(
                              fav.createdAt._seconds * 1000
                            ).toLocaleDateString()
                          : "Invalid Date"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .favorite-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
        }

        .favorite-card:hover {
          border-color: #047857;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.1);
          transform: translateY(-2px);
        }

        .favorite-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .favorite-header h3 {
          margin: 0;
          font-size: 16px;
          color: #047857;
          flex: 1;
        }

        .favorite-user-info {
          margin-bottom: 12px;
        }

        .user-badge {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .btn-remove {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          transition: transform 0.2s;
        }

        .btn-remove:hover {
          transform: scale(1.2);
        }

        .favorite-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin: 8px 0;
          font-size: 13px;
        }

        .info-label {
          color: #666;
          font-weight: 500;
        }

        .info-value {
          color: #333;
        }

        .favorite-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 12px;
        }

        .stat {
          text-align: center;
          padding: 8px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .stat-label {
          display: block;
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .stat-value {
          display: block;
          font-size: 16px;
          font-weight: bold;
          color: #047857;
        }

        .badge {
          background: #047857;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: bold;
          margin-left: 8px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-header h2 {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

export default Favorites;
