# Park & Ride+ System Architecture

## 📐 Architecture Overview

Park & Ride+ follows a modern **serverless architecture** with a React-based frontend and Firebase backend, deployed on Vercel's edge network.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React 18.2 SPA (Single Page Application)               │  │
│  │  • Google Maps / Leaflet Integration                    │  │
│  │  • Firebase Auth Client SDK                             │  │
│  │  • HTTP Polling (10s interval)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Static Assets (CDN)                                     │  │
│  │  • HTML, CSS, JS bundles                                │  │
│  │  • Optimized & Cached                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Serverless Functions (/api)                            │  │
│  │  • Node.js Runtime                                      │  │
│  │  • Auto-scaling                                         │  │
│  │  • Cold Start Optimization                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Backend Services Layer                      │
│  ┌────────────────────┐  ┌──────────────────┐                  │
│  │  Firebase Admin    │  │  Faker.js        │                  │
│  │  SDK               │  │  Data Generator  │                  │
│  │  • Firestore       │  │  • Transit Data  │                  │
│  │  • Auth Validation │  │  • Parking Data  │                  │
│  └────────────────────┘  └──────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Data Storage Layer                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Firebase Firestore (NoSQL Database)                    │  │
│  │  ┌────────────────┐  ┌────────────────┐                │  │
│  │  │  Collection:   │  │  Collection:   │                │  │
│  │  │  reports       │  │  favorites     │                │  │
│  │  │  • location    │  │  • userId      │                │  │
│  │  │  • description │  │  • parkingLotId│                │  │
│  │  │  • category    │  │  • createdAt   │                │  │
│  │  │  • imageUrl    │  │  • parkingLot  │                │  │
│  │  │  • upvotes     │  │                │                │  │
│  │  │  • timestamp   │  │                │                │  │
│  │  └────────────────┘  └────────────────┘                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🏛️ System Components

### 1. Frontend Architecture

```
client/
├── src/
│   ├── App.jsx                    # Root component, routing
│   ├── main.jsx                   # React entry point
│   │
│   ├── components/                # Reusable UI components
│   │   ├── MapViewGoogle.jsx      # Google Maps implementation
│   │   ├── MapView.jsx            # Leaflet implementation
│   │   ├── Header.jsx             # Stats header
│   │   ├── Navbar.jsx             # Navigation
│   │   ├── Sidebar.jsx            # Reports/Favorites panel
│   │   ├── ReportForm.jsx         # Report submission
│   │   ├── RoutePlanner.jsx       # Route planning
│   │   ├── LoadingSpinner.jsx     # Loading state
│   │   └── ProtectedRoute.jsx     # Auth guard
│   │
│   ├── pages/                     # Page-level components
│   │   ├── Home.jsx               # Main map view
│   │   ├── Login.jsx              # Auth pages
│   │   ├── Signup.jsx
│   │   ├── Reports.jsx            # Reports listing
│   │   ├── Favorites.jsx          # Favorites listing
│   │   ├── About.jsx
│   │   └── NotFound.jsx
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx        # Firebase Auth state
│   │
│   └── firebaseConfig.js          # Firebase client config
```

**Key Features:**
- **State Management:** React Context API for authentication
- **Routing:** React Router v6 with protected routes
- **Data Fetching:** Native Fetch API with HTTP polling
- **Map Integration:** Google Maps
- **Build Tool:** Vite for fast development & optimized builds

### 2. Backend Architecture

#### Local Development (Express Server)
```javascript
server.js
├── Express App Setup
├── Middleware Stack
│   ├── CORS
│   ├── Helmet (Security)
│   ├── Compression
│   ├── Body Parser
│   └── Multer (File Upload)
│
├── Route Handlers
│   ├── POST /api/report
│   ├── GET  /api/reports
│   ├── POST /api/reports/:id/upvote
│   ├── POST /api/favorites
│   ├── GET  /api/favorites/:userId
│   ├── DELETE /api/favorites/:userId/:lotId
│   └── GET  /api/transit-data
│
└── Data Generation
    └── Faker.js Integration
```

#### Production (Vercel Serverless Functions)
```
api/
├── favorites.js              # GET/POST favorites
├── health.js                 # Health check
├── report.js                 # POST report
├── reports.js                # GET reports
├── transit-data.js           # GET transit/parking data
├── favorites/
│   └── delete.js             # DELETE favorite
└── reports/
    └── [id]/
        └── upvote.js         # POST upvote
```

**Each serverless function:**
- Independent Node.js execution
- Auto-scaling on demand
- Stateless design
- Cold start optimized

### 3. Data Layer

#### Firebase Firestore Structure

**Collection: `reports`**
```json
{
  "reportId": {
    "location": [28.6315, 77.2167],
    "description": "Parking lot entrance blocked",
    "category": "parking",
    "imageUrl": "https://...",
    "timestamp": "2025-10-30T10:30:00Z",
    "upvotes": 5,
    "resolved": false,
    "clientInfo": {
      "userAgent": "...",
      "ip": "..."
    }
  }
}
```

**Collection: `favorites`**
```json
{
  "userId-parkingLotId": {
    "id": "user123-0",
    "userId": "user123",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "parkingLotId": 0,
    "parkingLot": {
      "id": 0,
      "name": "Connaught Place Park & Ride",
      "location": [28.6315, 77.2167],
      "capacity": 250,
      "availableSpots": 45
    },
    "createdAt": "2025-10-30T10:30:00Z"
  }
}
```

## 🔄 Data Flow Diagrams

### Authentication Flow
```
┌────────┐                ┌──────────────┐              ┌──────────┐
│ User   │                │ React App    │              │ Firebase │
│        │                │              │              │ Auth     │
└───┬────┘                └──────┬───────┘              └────┬─────┘
    │                            │                           │
    │ 1. Enter Credentials       │                           │
    ├───────────────────────────>│                           │
    │                            │                           │
    │                            │ 2. signInWithEmailAndPassword
    │                            ├──────────────────────────>│
    │                            │                           │
    │                            │ 3. JWT Token + User Data  │
    │                            │<──────────────────────────┤
    │                            │                           │
    │                            │ 4. Update AuthContext     │
    │                            │                           │
    │ 5. Redirect to Home        │                           │
    │<───────────────────────────┤                           │
    │                            │                           │
```

### Report Submission Flow
```
┌────────┐     ┌──────────┐     ┌───────────┐     ┌──────────┐
│ User   │     │ React    │     │ Serverless│     │ Firestore│
│        │     │ App      │     │ Function  │     │          │
└───┬────┘     └────┬─────┘     └─────┬─────┘     └────┬─────┘
    │               │                 │                  │
    │ Fill Report   │                 │                  │
    │ Form          │                 │                  │
    ├──────────────>│                 │                  │
    │               │                 │                  │
    │               │ POST /api/report│                  │
    │               ├────────────────>│                  │
    │               │                 │                  │
    │               │                 │ Validate Data    │
    │               │                 │                  │
    │               │                 │ db.collection    │
    │               │                 │ .add(report)     │
    │               │                 ├─────────────────>│
    │               │                 │                  │
    │               │                 │ Document ID      │
    │               │                 │<─────────────────┤
    │               │                 │                  │
    │               │ Success Response│                  │
    │               │<────────────────┤                  │
    │               │                 │                  │
    │ Success Alert │                 │                  │
    │<──────────────┤                 │                  │
    │               │                 │                  │
```

### Transit Data Polling Flow
```
┌──────────┐         ┌───────────────┐         ┌──────────┐
│ React    │         │ Serverless    │         │ Faker.js │
│ Map      │         │ Function      │         │          │
└────┬─────┘         └───────┬───────┘         └────┬─────┘
     │                       │                      │
     │ Every 10 seconds      │                      │
     │                       │                      │
     │ GET /api/transit-data │                      │
     ├──────────────────────>│                      │
     │                       │                      │
     │                       │ generateParkingData()│
     │                       ├─────────────────────>│
     │                       │                      │
     │                       │ 12 Parking Lots      │
     │                       │<─────────────────────┤
     │                       │                      │
     │                       │ generateTransitData()│
     │                       ├─────────────────────>│
     │                       │                      │
     │                       │ 10 Metro + 5 Bus +   │
     │                       │ 4 Train Vehicles     │
     │                       │<─────────────────────┤
     │                       │                      │
     │ JSON Response         │                      │
     │<──────────────────────┤                      │
     │                       │                      │
     │ Update Map Markers    │                      │
     │                       │                      │
```

## 🔒 Security Architecture

### Authentication & Authorization
```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Firebase Authentication                             │
│     • Email/Password authentication                     │
│     • JWT token-based sessions                          │
│     • Automatic token refresh                           │
│                                                         │
│  2. Protected Routes (Client-side)                      │
│     • ProtectedRoute component wraps app                │
│     • Redirects unauthenticated users to /login         │
│     • AuthContext provides global auth state            │
│                                                         │
│  3. Input Validation (Server-side)                      │
│     • Validator library for sanitization                │
│     • Coordinate bounds checking                        │
│     • Description length limits                         │
│     • Category validation                               │
│                                                         │
│  4. Firestore Security Rules                            │
│     • Read: Public access to reports                    │
│     • Write: Authenticated users only                   │
│     • Favorites: User-specific access control           │
│                                                         │
│  5. CORS Configuration                                  │
│     • Restricted origins                                │
│     • Allowed methods: GET, POST, DELETE                │
│     • Credentials support                               │
│                                                         │
│  6. API Security Headers (Helmet.js)                    │
│     • XSS Protection                                    │
│     • Content Security Policy                           │
│     • X-Frame-Options                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Data Security
- **In Transit:** HTTPS/TLS encryption for all communications
- **At Rest:** Firebase Firestore encryption by default
- **Authentication:** JWT tokens with expiration
- **Input Sanitization:** validator.escape() for all user inputs
- **File Upload:** Size limits (5MB), type validation (images only)

## ⚡ Performance Optimization

### Frontend Optimization
```
┌─────────────────────────────────────────────────────────┐
│  Build Optimization (Vite)                              │
│  • Code splitting                                       │
│  • Tree shaking                                         │
│  • Minification                                         │
│  • Asset optimization                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Runtime Optimization                                   │
│  • React component memoization                          │
│  • Lazy loading for routes                              │
│  • Debounced polling (10s interval)                     │
│  • Map marker clustering                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  CDN Delivery (Vercel Edge)                             │
│  • Global edge network                                  │
│  • Automatic caching                                    │
│  • Brotli compression                                   │
│  • HTTP/2 support                                       │
└─────────────────────────────────────────────────────────┘
```

### Backend Optimization
- **Serverless Functions:** Auto-scaling based on demand
- **Cold Start Mitigation:** Minimal dependencies per function
- **Database Queries:** Indexed fields (timestamp for reports)
- **Response Caching:** Immutable data cached at edge

## 🌐 Deployment Architecture

### Production Environment (Vercel)
```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Platform                          │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Git Integration                                  │     │
│  │  • GitHub repository connected                    │     │
│  │  • Auto-deploy on push to master                  │     │
│  │  • Preview deployments for PRs                    │     │
│  └───────────────────────────────────────────────────┘     │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Build Process                                    │     │
│  │  1. npm install (root & client)                   │     │
│  │  2. cd client && npm run build                    │     │
│  │  3. Output: client/dist                           │     │
│  └───────────────────────────────────────────────────┘     │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Deployment                                       │     │
│  │  • Static files → CDN                             │     │
│  │  • API functions → Serverless                     │     │
│  │  • Environment variables injected                 │     │
│  └───────────────────────────────────────────────────┘     │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Edge Network (Global)                            │     │
│  │  • 50+ global regions                             │     │
│  │  • Intelligent routing                            │     │
│  │  • DDoS protection                                │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Development Environment (Local)
```
┌─────────────────────────────────────────────────────────────┐
│  Local Development Setup                                    │
│                                                             │
│  Terminal 1: Backend                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  npm run dev                                        │   │
│  │  • Nodemon watches server.js                        │   │
│  │  • Express server on :5000                          │   │
│  │  • Hot reload on changes                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Terminal 2: Frontend                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  cd client && npm run dev                           │   │
│  │  • Vite dev server on :5173                         │   │
│  │  • HMR (Hot Module Replacement)                     │   │
│  │  • Fast refresh for React                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 System Scalability

### Current Limitations
- **Simulated Data:** Transit data is generated, not from real APIs
- **No Caching:** Transit data regenerated on each request
- **No Rate Limiting:** API endpoints are open (relies on Vercel limits)
- **Manual Parking Locations:** 12 hardcoded locations


```

## 🔧 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18.2 | UI framework |
| | React Router 6.30.1 | Client-side routing |
| | Vite 4.5.14 | Build tool & dev server |
| | Google Maps API | Primary mapping |
| | Leaflet 1.9.4 | Alternative mapping |
| **Backend** | Express.js 5.1.0 | Local dev server |
| | Vercel Serverless | Production API |
| | Firebase Admin 13.5.0 | Server-side SDK |
| | Faker.js 10.1.0 | Data simulation |
| **Database** | Firebase Firestore | NoSQL database |
| **Authentication** | Firebase Auth | User management |
| **Deployment** | Vercel | Hosting & CDN |
| **Storage** | Cloudinary | Image hosting (optional) |
| **Monitoring** | Winston 3.18.3 | Logging |

## 📈 Monitoring & Logging

### Application Logs
```javascript
// Winston logger configuration
logger.info('Server started')
logger.error('Database connection failed')
logger.warn('API rate limit approaching')
```

### Metrics Tracked
- API response times
- Database query performance
- User authentication events
- Report submissions
- Error rates

### Health Checks
- `GET /api/health` - System status
- Environment configuration check
- Database connectivity

---

**Last Updated:** October 30, 2025
**Version:** 1.0.0
**Maintained by:** Bikund Kumar
