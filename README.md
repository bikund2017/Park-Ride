# Park & Ride+ Delhi NCR 🚗🚇

A real-time parking and transit information system for Delhi NCR, featuring interactive maps, community reporting, and favorites management.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://park-ride-new1.vercel.app/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2-blue)](https://reactjs.org/)

## 🌟 Overview

Park & Ride+ provides real-time parking availability and transit tracking for Delhi NCR. View parking lots across 12 major locations, track metro, bus, and train vehicles on interactive maps, submit community reports, and save favorite parking locations.

**🌐 Live Application:** [https://park-ride-new1.vercel.app/](https://park-ride-new1.vercel.app/)

## ✨ Features

### 🗺️ Map Support
- **Google Maps** (Primary) - Interactive maps using Google Maps JavaScript API
- **Real-time Vehicle Tracking** - Live positions of 10 metro lines, 5 bus routes, 4 train routes
  - *Note: Currently simulated - will track live when transit APIs are integrated*
- **Parking Visualization** - 12 parking lots with color-coded availability (green/orange/red)
  - *Note: Currently simulated data - will show real-time when parking APIs are integrated*
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
- **Photo Uploads** - Attach images with Cloudinary integration (local storage fallback available)
  - *Note: Image upload API configured but optional in current deployment*
- **Upvoting** - Community can upvote important reports
- **Category Filtering** - Filter by category (parking, traffic, facility, metro, safety, general)
- **Emoji Markers** - Reports displayed on map with category-specific emoji icons
  - 🚗 Parking • 🚦 Traffic • 🏢 Facility • 🚇 Metro • ⚠️ Safety • 📝 General

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
**Current Locations:**
- Connaught Place
- India Gate
- Red Fort
- Chandni Chowk
- AIIMS
- Hauz Khas
- Karol Bagh
- Rajouri Garden
- Dwarka
- Gurgaon Cyber City
- Noida City Centre
- Faridabad

*Note: Currently using hardcoded locations - will display real parking locations when parking APIs are integrated*

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
- **Multer 2.0.2** - File upload handling
- **Cloudinary 2.8.0** - Image storage (optional)
- **Validator 13.15.20** - Input validation
- **Winston 3.18.3** - Logging


### Database
- **Firebase Firestore** - reports and favorites collections

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Firebase account ([Get started](https://console.firebase.google.com))
- Google Maps API key ([Get key](https://console.cloud.google.com))

### Step 1: Clone Repository
```bash
git clone https://github.com/bikund2017/Park-Ride-.git
cd Park-Ride-
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 3: Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** (start in test mode for development)
3. Enable **Authentication** → Email/Password provider
4. Download service account key and save as `serviceAccountKey.json` in project root

### Step 4: Environment Variables

**Backend Configuration** (Create `/.env`):
```env
NODE_ENV=development
PORT=5000

# Optional: For Cloudinary image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend Configuration** (Create `/client/.env`):
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAP_API=your_google_maps_api_key
```

### Step 5: Run Development Servers

**Option 1: Run Separately**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

**Option 2: Run Concurrently**
```bash
npm run dev:full
```

### Step 6: Access Application
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000


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

### Transit & Parking Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transit-data` | Get parking lots + transit vehicles (simulated) |
| GET | `/api/health` | Server health check |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/report` | Submit new report with location, description, category |
| GET | `/api/reports` | Get all reports (supports filtering by category) |
| POST | `/api/reports/{id}/upvote` | Upvote a specific report |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/favorites` | Add parking lot to user favorites |
| GET | `/api/favorites?userId={userId}` | Get all favorites for a user |
| DELETE | `/api/favorites/delete?userId={userId}&parkingLotId={lotId}` | Remove from favorites |

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

### Map System
- **Map Toggle**: Switch between Google Maps and Leaflet by changing the import in `App.jsx`
  ```javascript
  // Google Maps (current default)
  import MapViewGoogle from './components/MapViewGoogle.jsx';
  
  // Or Leaflet
  import MapView from './components/MapView.jsx';
  ```

### Data Flow Architecture
1. **Client** polls `/api/transit-data` every 10 seconds via HTTP requests
2. **Vercel Serverless Functions** (production) or **Express server** (local dev) handle API requests
3. **Server** generates simulated data using Faker.js on each request
4. **Map** renders parking lots and transit vehicles with real-time markers
5. **Reports** and **Favorites** stored persistently in Firebase Firestore

**Note:** Application uses HTTP polling (not WebSockets) for compatibility with Vercel serverless deployment.





## 🙏 Acknowledgments

- **Firebase** - Authentication and real-time database
- **Google Maps Platform** - Mapping services and APIs
- **Leaflet** - Open-source mapping library
- **Vercel** - Serverless deployment and hosting
- **Faker.js** - Realistic data simulation

---

<div align="center">

**Built for Delhi NCR commuters** 🚗🚇

[Live Demo](https://park-ride-new1.vercel.app/) • [Report Issue](https://github.com/bikund2017/Park-Ride-/issues)

</div>
