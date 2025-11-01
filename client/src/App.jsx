import React, { useState, useEffect, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
import { useAuth } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import MapViewGoogle from "./components/MapViewGoogle.jsx"; // Google Maps
import ParkingSearch from "./components/ParkingSearch.jsx";

import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Reports from "./pages/Reports.jsx";
import Favorites from "./pages/Favorites.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import "./index.css";
import "./map-fix.css";

const libraries = ["places"];

function App() {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || "anonymous";
  const userName =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "User";

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAP_API;

  console.log(
    "Google Maps API Key loaded:",
    GOOGLE_MAPS_API_KEY
      ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...`
      : "MISSING"
  );

  const { isLoaded: isGoogleMapsLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  if (loadError) {
    console.error("Google Maps load error:", loadError);
  }

  const [parkingData, setParkingData] = useState([]);
  const [transitData, setTransitData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dataSource, setDataSource] = useState("checking");
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [selectedParkingId, setSelectedParkingId] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showAllParkingMarkers, setShowAllParkingMarkers] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);

  const fetchReports = async () => {
    try {
      setIsLoadingReports(true);
      const response = await fetch("/api/reports");
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleUpvote = async (reportId) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/upvote`, {
        method: "POST",
      });
      const data = await response.json();

      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, upvotes: data.upvotes } : report
        )
      );
    } catch (error) {
      console.error("Error upvoting:", error);
      alert("Failed to upvote report. Please try again.");
    }
  };

  const favoritesFetchInFlight = useRef(false);
  const lastFavoritesFetch = useRef(0);

  const fetchFavorites = useCallback(async () => {
    if (isLoadingFavorites) return;
    const now = Date.now();
    if (favoritesFetchInFlight.current) return;
    if (now - lastFavoritesFetch.current < 8000) return;
    const shouldBlock = favorites.length === 0;
    let safetyTimer;
    try {
      favoritesFetchInFlight.current = true;
      if (shouldBlock) {
        setIsLoadingFavorites(true);
        safetyTimer = setTimeout(() => setIsLoadingFavorites(false), 5000);
      }
      const response = await fetch(`/api/favorites?userId=${userId}`);
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      if (error.response?.status !== 429) {
        console.error("Favorites fetch error:", error);
      }
    } finally {
      lastFavoritesFetch.current = Date.now();
      favoritesFetchInFlight.current = false;
      if (shouldBlock) {
        clearTimeout(safetyTimer);
        setIsLoadingFavorites(false);
      }
    }
  }, [favorites.length, isLoadingFavorites]);

  const addToFavorites = async (parkingLotId) => {
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parkingLotId: Number(parkingLotId),
          userId: userId,
          userName: userName,
          userEmail: currentUser?.email || "",
        }),
      });
      const data = await response.json();
      setFavorites((prev) => [data.favorite, ...prev]);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      alert("Failed to add to favorites. Please try again.");
    }
  };

  const removeFromFavorites = async (parkingLotId) => {
    try {
      await fetch(
        `/api/favorites/delete?userId=${userId}&parkingLotId=${parkingLotId}`,
        {
          method: "DELETE",
        }
      );
      setFavorites((prev) =>
        prev.filter((fav) => fav.parkingLotId !== parkingLotId)
      );
    } catch (error) {
      console.error("Error removing from favorites:", error);
      alert("Failed to remove from favorites. Please try again.");
    }
  };

  useEffect(() => {
    const fetchDataViaHttp = async () => {
      try {
        const response = await fetch("/api/transit-data");
        const data = await response.json();
        if (data) {
          setParkingData(data.parkingLots || []);
          setTransitData(data.transitVehicles || []);
          setDataSource(data.dataMode || "🔴 Simulated (Fallback)");
          setIsConnected(true);
          setIsLoadingData(false);
        }
      } catch (error) {
        console.error("Error fetching transit data:", error);
        setIsConnected(false);
        setDataSource("Error");
      }
    };
    // Polling
    console.log("Using HTTP polling for data updates");
    setIsConnected(true);

    fetchDataViaHttp();

    const pollingInterval = setInterval(fetchDataViaHttp, 10000);

    // Fetch reports on component mount
    fetchReports();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const handleMapClick = (location) => {
    setSelectedLocation(location);
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
  };

  const handleParkingClick = (parkingLot) => {
    // Set the parking location as destination automatically
    setSelectedLocation({
      lat: parkingLot.location[0],
      lng: parkingLot.location[1],
      name: parkingLot.name,
      parkingData: parkingLot,
    });
    setSelectedParkingId(parkingLot.id);
  };

  const handleParkingSelect = (parkingLot) => {
    // When user selects from search
    setSelectedParkingId(parkingLot.id);
    setSearchLocation({
      lat: parkingLot.location[0],
      lng: parkingLot.location[1],
      name: parkingLot.name,
    });
    handleParkingClick(parkingLot);
  };

  const handleSearchLocationChange = (location) => {
    setSearchLocation(location);
  };

  const handleShowSearchResults = (results, query) => {
    console.log(`Showing ${results.length} results for "${query}"`);
    setSearchResults(results);
    setSearchQuery(query);
    setShowAllParkingMarkers(false); // Hide parking markers when showing search results

    // Center map on first result if available
    if (results.length > 0) {
      setSearchLocation({
        lat: results[0].location[0],
        lng: results[0].location[1],
        name: results[0].name,
      });
    }
  };

  const handleSearchResultClick = (searchResult) => {
    // When user clicks a search result marker, set it as destination
    setSelectedLocation({
      lat: searchResult.location[0],
      lng: searchResult.location[1],
      name: searchResult.name,
      address: searchResult.address,
    });

    // Store the selected search result
    setSelectedSearchResult(searchResult);

    // Pan map to this location
    setSearchLocation({
      lat: searchResult.location[0],
      lng: searchResult.location[1],
      name: searchResult.name,
    });
  };

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setSelectedLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Error getting user location:", error);
          // Default to Delhi center if geolocation fails
          setUserLocation({ lat: 28.6139, lng: 77.209 });
        }
      );
    }
  }, []);

  const metroCount = transitData.filter(
    (v) => v.vehicleType === "metro"
  ).length;
  const busCount = transitData.filter((v) => v.vehicleType === "bus").length;
  const trainCount = transitData.filter(
    (v) => v.vehicleType === "train"
  ).length;

  useEffect(() => {
    console.log("App mounted successfully");
    console.log("Environment:", window.location.hostname);
    console.log("Is Vercel:", window.location.hostname.includes("vercel.app"));
  }, []);
  // Error MAP
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <h1 style={{ color: "#ef4444", marginBottom: "1rem" }}>
          ⚠️ Configuration Error
        </h1>
        <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
          Google Maps API key is not configured.
        </p>
        <div
          style={{
            background: "#fee",
            padding: "1rem",
            borderRadius: "8px",
            maxWidth: "600px",
            textAlign: "left",
            fontSize: "0.9rem",
          }}
        >
          <p>
            <strong>For Vercel deployment:</strong>
          </p>
          <ol style={{ marginLeft: "1.5rem" }}>
            <li>Go to your Vercel project settings</li>
            <li>Navigate to Environment Variables</li>
            <li>
              Add:{" "}
              <code
                style={{
                  background: "#ddd",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                VITE_GOOGLE_MAP_API
              </code>
            </li>
            <li>Set the value to your Google Maps API key</li>
            <li>Redeploy the application</li>
          </ol>
          <p style={{ marginTop: "1rem" }}>
            <strong>For local development:</strong>
          </p>
          <ol style={{ marginLeft: "1.5rem" }}>
            <li>
              Create{" "}
              <code
                style={{
                  background: "#ddd",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                client/.env
              </code>{" "}
              file
            </li>
            <li>
              Add:{" "}
              <code
                style={{
                  background: "#ddd",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                VITE_GOOGLE_MAP_API=your_api_key_here
              </code>
            </li>
            <li>Restart the dev server</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-modern">
                <Navbar />
                <Header
                  isConnected={isConnected}
                  metroCount={metroCount}
                  parkingCount={parkingData.length}
                  dataSource={dataSource}
                  userName={userName}
                  userEmail={currentUser?.email}
                />
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Home>
                        <div
                          className="map-wrapper"
                          style={{ position: "relative" }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: "20px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              zIndex: 1000,
                              width: "90%",
                              maxWidth: "500px",
                            }}
                          >
                            <ParkingSearch
                              parkingData={parkingData}
                              isLoaded={isGoogleMapsLoaded}
                              onParkingSelect={handleParkingSelect}
                              onSearchLocationChange={
                                handleSearchLocationChange
                              }
                              onShowAllParking={() =>
                                setShowAllParkingMarkers(true)
                              }
                              onShowSearchResults={handleShowSearchResults}
                              userLocation={userLocation}
                            />
                          </div>
                          <MapViewGoogle
                            parkingData={parkingData}
                            transitData={transitData}
                            onMapClick={handleMapClick}
                            reports={reports}
                            onUpvote={handleUpvote}
                            selectedRoute={selectedRoute}
                            isLoaded={isGoogleMapsLoaded}
                            onParkingClick={handleParkingClick}
                            selectedParkingId={selectedParkingId}
                            searchLocation={searchLocation}
                            userLocation={userLocation}
                            showAllParkingMarkers={showAllParkingMarkers}
                            searchResults={searchResults}
                            searchQuery={searchQuery}
                            onSearchResultClick={handleSearchResultClick}
                          />
                        </div>
                        <Sidebar
                          parkingData={parkingData}
                          transitData={transitData}
                          selectedLocation={selectedLocation}
                          onClearLocation={handleClearLocation}
                          metroCount={metroCount}
                          busCount={busCount}
                          trainCount={trainCount}
                          reports={reports}
                          onUpvote={handleUpvote}
                          onRefreshReports={fetchReports}
                          isLoadingReports={isLoadingReports}
                          isLoadingData={isLoadingData}
                          favorites={favorites}
                          onAddToFavorites={addToFavorites}
                          onRemoveFromFavorites={removeFromFavorites}
                          onRefreshFavorites={fetchFavorites}
                          isLoadingFavorites={isLoadingFavorites}
                          onRouteCalculated={setSelectedRoute}
                          isGoogleMapsLoaded={isGoogleMapsLoaded}
                          selectedParkingId={selectedParkingId}
                          selectedSearchResult={selectedSearchResult}
                          mapSearchQuery={searchQuery}
                        />
                      </Home>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <Reports
                        reports={reports}
                        onUpvote={handleUpvote}
                        onRefreshReports={fetchReports}
                        isLoadingReports={isLoadingReports}
                      />
                    }
                  />
                  <Route
                    path="/favorites"
                    element={
                      <Favorites
                        favorites={favorites}
                        onRemoveFromFavorites={removeFromFavorites}
                        onRefreshFavorites={fetchFavorites}
                        isLoadingFavorites={isLoadingFavorites}
                      />
                    }
                  />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
