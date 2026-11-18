import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "../map-fix.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different marker types

const metroIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const busIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const trainIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const getReportIcon = (category) => {
  const colors = {
    parking: "#e74c3c",
    traffic: "#f39c12",
    facility: "#3498db",
    metro: "#9b59b6",
    safety: "#e67e22",
    general: "#95a5a6",
  };

  const emojis = {
    parking: "🚗",
    traffic: "🚦",
    facility: "🏢",
    metro: "🚇",
    safety: "⚠️",
    general: "📝",
  };

  const color = colors[category] || colors.general;
  const emoji = emojis[category] || emojis.general;

  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; font-size: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
    className: "custom-report-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const MapView = ({
  parkingData,
  transitData,
  onMapClick,
  reports,
  onUpvote,
}) => {
  // Delhi center coordinates (New Delhi, India Gate area)
  const delhiCenter = [28.6139, 77.209];

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (onMapClick) {
          onMapClick([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  };

  const getParkingMarkerColor = (lot) => {
    const occupancyRate = (lot.capacity - lot.availableSpots) / lot.capacity;

    if (occupancyRate > 0.8) {
      return new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
    } else if (occupancyRate > 0.5) {
      return new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
    } else {
      return new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
    }
  };

  return (
    <MapContainer
      center={delhiCenter}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
      whenCreated={(map) => {
        setTimeout(() => {
          map.invalidateSize();
          window.addEventListener("resize", () => map.invalidateSize());
        }, 100);
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        minZoom={3}
      />

      <MapClickHandler />

      {/* Render parking lots */}
      {parkingData.map((lot) => (
        <Marker
          key={`parking-${lot.id}`}
          position={lot.location}
          icon={getParkingMarkerColor(lot)}
        >
          <Popup>
            <div>
              <h4>{lot.name}</h4>
              <p>
                <strong>Available Spots:</strong> {lot.availableSpots} /{" "}
                {lot.capacity}
              </p>
              <p>
                <strong>Occupancy:</strong>{" "}
                {Math.round((1 - lot.availableSpots / lot.capacity) * 100)}%
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {}
      {transitData.map((vehicle) => {
        // Only Metro vehicles
        const vehicleIcon = metroIcon;
        const routeColor = vehicle.lineColor || "#3498db";

        return (
          <React.Fragment key={`transit-${vehicle.id}`}>
            {/* Render route path */}
            <Polyline
              positions={vehicle.routePath}
              color={routeColor}
              weight={3}
              opacity={0.5}
            />

            {/* Render vehicle marker */}
            <Marker position={vehicle.location} icon={vehicleIcon}>
              <Popup>
                <div>
                  <h4 style={{ marginTop: 0, color: routeColor }}>
                    🚇 {vehicle.routeName}
                  </h4>
                  <p>
                    <strong>Type:</strong> METRO
                  </p>
                  <p>
                    <strong>Vehicle ID:</strong> {vehicle.id}
                  </p>
                  <p>
                    <strong>Status:</strong> {vehicle.status}
                  </p>
                  <p>
                    <strong>Speed:</strong> {vehicle.speed} km/h
                  </p>

                  <p>
                    <strong>Next Station:</strong> {vehicle.nextStation}
                  </p>
                  <p>
                    <strong>ETA:</strong> {vehicle.estimatedArrival}
                  </p>
                  <p>
                    <strong>Total Stations:</strong> {vehicle.totalStations}
                  </p>
                  <p>
                    <strong>Crowd Level:</strong> {vehicle.crowdLevel}
                  </p>

                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#666",
                      marginBottom: 0,
                    }}
                  >
                    <strong>Location:</strong> {vehicle.location[0].toFixed(4)},{" "}
                    {vehicle.location[1].toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}

      {/* Render user reports with clustering */}
      <MarkerClusterGroup>
        {reports.map((report) => {
          const category = report.category || "general";
          const categoryNames = {
            parking: "🚗 Parking Issue",
            traffic: "🚦 Traffic Condition",
            facility: "🏢 Facility Issue",
            metro: "🚇 Metro/Transit",
            safety: "⚠️ Safety Concern",
            general: "📝 General Report",
          };

          const handleUpvote = () => {
            onUpvote(report.id);
          };

          return (
            <Marker
              key={`report-${report.id}`}
              position={report.location}
              icon={getReportIcon(category)}
            >
              <Popup>
                <div style={{ minWidth: "200px" }}>
                  <h4 style={{ marginTop: 0 }}>
                    {categoryNames[category]}
                    {report.resolved && (
                      <span style={{ color: "#10b981", marginLeft: "5px" }}>
                        ✓
                      </span>
                    )}
                  </h4>
                  <p>
                    <strong>Description:</strong> {report.description}
                  </p>
                  {report.imageUrl && (
                    <div style={{ margin: "10px 0" }}>
                      <img
                        src={report.imageUrl}
                        alt="Report"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "150px",
                          borderRadius: "5px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                  <p>
                    <strong>Submitted:</strong> {report.submittedAt}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "10px",
                    }}
                  >
                    <span>👍 {report.upvotes || 0}</span>
                    <button
                      onClick={handleUpvote}
                      style={{
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      Upvote
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#666",
                      marginBottom: 0,
                    }}
                  >
                    <strong>Location:</strong> {report.location[0].toFixed(4)},{" "}
                    {report.location[1].toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapView;
