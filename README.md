# Park & Ride+ Delhi NCR 🚗🚇

A real-time parking and transit information system for Delhi NCR, featuring interactive maps, community reporting, and favorites management.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://park-ride-new1.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2-blue)](https://reactjs.org/)

## 🌟 Overview

Park & Ride+ provides real-time parking availability and transit tracking for Delhi NCR. View parking lots across 12 major locations, track metro, bus, and train vehicles on interactive maps, submit community reports, and save favorite parking locations.

**🌐 Live Application:** [https://park-ride-new1.vercel.app/](https://park-ride-new1.vercel.app/)

## ✨ Features

### 🗺️ Dual Map Support
- **Google Maps** (Primary) - Interactive maps using Google Maps JavaScript API
- **Leaflet Maps** (Alternative) - Open-source mapping with OpenStreetMap
- **Real-time Vehicle Tracking** - Live positions of 10 metro lines, 5 bus routes, 4 train routes
- **Parking Visualization** - 12 parking lots with color-coded availability (green/orange/red)
- **Route Display** - Polylines showing transit vehicle routes
- **Marker Clustering** - Reports are clustered for better map visibility

### 📊 Transit Data (Simulated)
- **Metro Lines**: Red, Blue, Yellow, Green, Violet, Pink, Magenta, Orange, Rapid, Aqua (10 vehicles)
- **Bus Routes**: 5 DTC routes (ISBT-Nehru Place, Old Delhi-Dwarka, etc.)
- **Train Routes**: 4 routes (Rajdhani, Shatabdi, Local, Duronto)
- **HTTP Polling**: Data updates every 10 seconds
- **Faker.js**: Generates realistic simulated transit data

### 📝 Community Reports
- **Submit Reports** - Create reports for parking, traffic, facility, metro, safety, general issues
- **Photo Uploads** - Attach images (Cloudinary with local storage fallback)
- **Upvoting** - Community can upvote important reports
- **Category Filtering** - Filter by category
- **Emoji Markers** - Reports shown on map with category-specific emoji icons (🚗🚦🏢🚇⚠️📝)

### ⭐ Favorites Management
- **Save Parking Lots** - Bookmark frequently used locations
- **User-Specific** - Tied to authenticated user ID
- **Firebase Storage** - Persistent storage in Firestore
- **Quick Access** - View all favorites on dedicated page

### 🔐 Authentication
- **Firebase Auth** - Email/password authentication
- **Protected Routes** - Login required for app access
- **Auth Context** - React Context API for global auth state
- **Persistent Sessions** - Stay logged in across page refreshes

### 📍 Parking Locations (12 Total)
Connaught Place, India Gate, Red Fort, Chandni Chowk, AIIMS, Hauz Khas, Karol Bagh, Rajouri Garden, Dwarka, Gurgaon Cyber City, Noida City Centre, Faridabad

## 🏗️ Technology Stack

### Frontend
- **React 18.2.0** - UI library
- **React Router 6.30.1** - Client-side routing
- **Google Maps** - @react-google-maps/api 2.20.7
- **Leaflet 1.9.4** - Alternative mapping (react-leaflet 4.2.1, react-leaflet-cluster 3.1.1)
- **Vite 4.5.14** - Build tool
- **Firebase 10.14.1** - Client SDK for authentication

### Backend
- **Express.js 5.1.0** - Web framework (local dev)
- **Vercel Serverless Functions** - Production API routes
- **Firebase Admin 13.5.0** - Server-side SDK
- **@faker-js/faker 10.1.0** - Data simulation
- **Socket.IO 4.8.1** - WebSockets (local only)
- **Cloudinary 2.8.0** - Image storage (optional)

### Database
- **Firebase Firestore** - reports and favorites collections

## 📦 Installation

```bash
# Clone
git clone https://github.com/bikund2017/Park-Ride-.git
cd Park-Ride-

# Install dependencies
npm install
cd client && npm install && cd ..

NODE_ENV=development
PORT=5000

# Frontend: /client/.env  
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAP_API=your_google_maps_key

# Run development
npm run dev              # Backend
cd client && npm run dev # Frontend
# Or: npm run dev:full   # Run both

# Access
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```


## 📁 Project Structure

```
Park-Ride-/
├── api/                     # Vercel serverless functions
│   ├── favorites.js         # GET/POST favorites
│   ├── health.js           # Health check
│   ├── report.js           # POST report
│   ├── reports.js          # GET reports
│   ├── transit-data.js     # GET parking + transit
│   ├── favorites/delete.js # DELETE favorite
│   └── reports/[id]/upvote.js
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # Auth context
│   │   ├── pages/           # Route pages
│   │   ├── App.jsx
│   │   ├── firebaseConfig.js
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── services/transitAPI.js   # Transit API (not used - APIs unavailable)
├── utils/logger.js
├── config.js
├── firebase.js              # Firebase Admin
├── server.js                # Express (local dev)
├── package.json
└── vercel.json
```

## 🔌 API Endpoints

**GET** `/api/transit-data` - Get parking lots + transit vehicles (simulated)
**POST** `/api/report` - Submit new report
**GET** `/api/reports` - Get all reports
**POST** `/api/reports/{id}/upvote` - Upvote report
**POST** `/api/favorites` - Add favorite
**GET** `/api/favorites?userId=X` - Get user favorites
**DELETE** `/api/favorites/delete?userId=X&parkingLotId=Y` - Remove favorite
**GET** `/api/health` - Health check

## 🛠️ Development Scripts

```bash
# Backend
npm start           # Production
npm run dev         # Development
npm run lint        # ESLint

# Frontend
cd client
npm run dev         # Dev server
npm run build       # Production build

# Combined
npm run dev:full    # Run backend + frontend
```

## 🎯 How It Works

- **Map Toggle**: Change import in `App.jsx` between `MapViewGoogle` and `MapView`
- **Data Flow**: Client polls `/api/transit-data` every 10s → Server generates data → Map renders
- **Parking Colors**: Green (<50%), Orange (50-80%), Red (>80%)
- **Report Emojis**: 🚗 Parking, 🚦 Traffic, 🏢 Facility, 🚇 Metro, ⚠️ Safety, 📝 General


---

<div align="center">

**Built for Delhi NCR commuters** 🚗🚇

[Live Demo](https://park-ride-new1.vercel.app/) • [Report Issue](https://github.com/bikund2017/Park-Ride-/issues)

</div>
