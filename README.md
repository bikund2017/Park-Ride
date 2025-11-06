# Park & Ride+ Delhi NCR 🚗🚇🔌

  

A comprehensive **IoT-enabled** real-time parking and transit information system for Delhi NCR, featuring **Arduino sensor integration**, interactive maps, community reporting, and intelligent parking search.

  

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://park-ride-new1.vercel.app/)

[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

[![React](https://img.shields.io/badge/react-18.2-blue)](https://reactjs.org/)

[![Arduino](https://img.shields.io/badge/Arduino-Mega_2560-00979D?logo=arduino)](https://www.arduino.cc/)

[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://vercel.com/)

  

## 🌟 Overview

  

Park & Ride+ is a full-stack **IoT web application** that combines **real Arduino hardware sensors** with cloud-based deployment to help Delhi NCR commuters find parking, track public transit, and share community reports. The platform bridges physical parking sensors with a modern web interface for real-time availability tracking.

  

**🌐 Live Application:** [https://park-ride-new1.vercel.app/](https://park-ride-new1.vercel.app/)

  

### 🎯 What Makes This Project Unique?

  

**Real Hardware Integration:**

- ✅ **Arduino Mega 2560** with IR sensors detecting actual car entry/exit

- ✅ **USB Serial Communication** forwarding sensor data to cloud

- ✅ **Node.js Serial Bridge** running on local machine

- ✅ **Vercel Serverless Functions** receiving Arduino data via HTTP POST

- ✅ **Firebase Firestore** storing real-time parking availability

- ✅ **React Frontend** displaying live Arduino data (updates every 10 seconds)

  

**Key Features:**

- 🔌 **Real Arduino Sensors** - Physical IR sensors tracking parking occupancy

- 🗺️ Interactive Google Maps with real-time transit tracking

- 🅿️ **Hybrid Data Model** - 1 real Arduino parking + 2 simulated locations

- 📝 Community reporting system with image uploads

- ⭐ User favorites and personalized parking recommendations

- 🔍 Intelligent parking search with location-based filtering

- 🔐 Secure Firebase authentication

- 🚇 10 Metro lines visualization

- ⚡ **Serverless Architecture** - Works with Arduino locally and Vercel remotely

  

## ✨ Core Features

  

### � Arduino IoT Integration (NEW!)

  

**Hardware Setup:**

- **Microcontroller:** Arduino Mega 2560

- **Sensors:** 2x IR Obstacle Sensors (Entry & Exit detection)

- **Display:** LCD 16x2 with I2C interface

- **Actuator:** SG90 Servo Motor (automated gate control)

- **Communication:** USB Serial (9600 baud)

  

**System Architecture:**

```

┌─────────────────┐

│ Arduino Mega │ ← IR Sensors (Pins 2 & 3)

│ (Hardware) │ ← LCD Display (I2C)

└────────┬────────┘ ← Servo Motor (Pin 9)

│ USB Serial (9600 baud)

↓

┌─────────────────┐

│ Serial Bridge │ ← Node.js (serialport)

│ (Local PC) │ ← Runs continuously

└────────┬────────┘

│ HTTP POST every 5s

↓

┌─────────────────┐

│ Vercel Function │ ← /api/arduino/parking

│ (Cloud API) │ ← Serverless

└────────┬────────┘

│ Store in Firestore

↓

┌─────────────────┐

│ Firebase │ ← Collection: arduino-parking

│ (Database) │ ← Real-time updates

└────────┬────────┘

│ GET /api/transit-data (10s polling)

↓

┌─────────────────┐

│ React Frontend │ ← Displays live data

│ (Vercel) │ ← Green card + parking list

└─────────────────┘

```

  

**Arduino Features:**

- ✅ Real-time car counting (entry/exit tracking)

- ✅ Available slots calculation (Total - Occupied)

- ✅ JSON output via Serial (`{"parkingLotId":"SAB_Mall_Parking","totalSlots":3,"availableSlots":2}`)

- ✅ LCD display showing availability

- ✅ Automated gate control with servo

- ✅ Entry/exit beep indicators

  

**Current Arduino Parking Locations:**

1. **SAB Mall Parking** - 3 slots (Real Arduino data)

- Location: Sector 27, Noida

- GPS: [28.567582, 77.322673]

- Hourly Rate: ₹30/hr

- Status: 🟢 Live (Real-time updates)

  

2. **Noida City Centre Parking** (Optional second Arduino)

- Location: Sector 32, Noida

- GPS: [28.5744, 77.3564]

- Status: Can be configured in bridge script

  

**Serial Bridge Configuration:**

```javascript

// arduino-serial-bridge.js

const port = '/dev/ttyUSB0';

const baudRate = 9600;

const serverUrl = 'https://park-ride-new1.vercel.app';

const postInterval = 5000; // 5 seconds

```

  

### �🗺️ Interactive Mapping

- **Google Maps Integration** - Primary mapping with `@react-google-maps/api`

- **Route Visualization** - Polylines showing complete transit routes

- **Color-coded Markers** - Green (available), Orange (limited), Red (full) for parking

- **Marker Clustering** - Smart grouping of reports for better map clarity

- **Location Search** - Google Places API integration for address lookup

  

### 🅿️ Parking Management

  

**Hybrid Data Model:**

- **1 Real Arduino Location** (SAB Mall Parking - Live sensors)

- **2 Simulated Locations** (Connaught Place, India Gate - Demo data)

  

**Arduino Parking Features:**

- ✅ Real-time occupancy from IR sensors

- ✅ Automatic availability updates (every 5 seconds from hardware)

- ✅ Visual indicators: Green (available), Orange (limited), Red (full)

- ✅ Live percentage calculation

- ✅ "🔌 Arduino Connected" badge on cards

- ✅ Appears first in parking list (sorted by Arduino connection)

- ✅ Green gradient card in sidebar for selected Arduino parking

  

**Simulated Parking Features:**

- Realistic data using Faker.js

- Random availability changes (±5% every update)

- Used for demonstration and testing

- Same UI/UX as real Arduino data

  

**Parking Card Information:**

- Real-time availability tracking (e.g., "2/3 available")

- Capacity vs occupied visualization

- Hourly rate information

- Distance calculation from user location

- Quick add to favorites

- GPS coordinates for mapping

  

### 🚇 Transit Tracking

  

**Metro Lines (10) - Simulated Data:**

- Red Line (Rithala - Shaheed Sthal) - 29 stations

- Blue Line (Dwarka - Noida/Vaishali) - 50 stations

- Yellow Line (Samaypur Badli - HUDA City Centre) - 37 stations

- Green Line (Mundka - Inderlok) - 23 stations

- Violet Line (Kashmere Gate - Raja Nahar Singh) - 34 stations

- Pink Line (Majlis Park - Shiv Vihar) - 38 stations

- Magenta Line (Janakpuri West - Botanical Garden) - 25 stations

- Orange Line (New Delhi - Dwarka) - 6 stations

- Rapid Metro (Sikanderpur - Cyber City) - 5 stations

- Aqua Line (Noida Sector 51 - Depot) - 21 stations

  

**Metro Tracking Features:**

- Route path visualization with DMRC color coding

- Speed and status indicators

- Next station information

- Simulated real-time movement

  

*Note: Transit data is currently simulated using Faker.js for demonstration purposes.*

  

### 📝 Community Reporting

**Report Categories:**

- 🚗 Parking Issues

- 🚇 Metro Updates

- 📝 General Reports

  

**Features:**

- Location-based reporting (click on map or use current location)

- Image upload support (Cloudinary + local storage fallback)

- Rich text descriptions with validation

- Community upvoting system

- Category-specific emoji markers

- Real-time report filtering

- Search functionality

- Report resolution tracking

  

### ⭐ Favorites System

- Save frequently used parking locations

- User-specific favorites tied to Firebase Auth

- Persistent storage in Firestore

- Quick access from dedicated Favorites page

- One-click add/remove functionality

- Visual indication on map for favorited lots

  

### 🔍 Parking Search

- **Location-based Search** - Find parking near any address

- **Distance Filtering** - 1km, 3km, 5km, 10km radius options

- **Google Places Integration** - Autocomplete address search

- **Visual Results** - Map markers for matching parking lots

- **Detailed Cards** - Distance, availability, and rates

- **User Location** - GPS-based current location detection

- **Route Planning** - Integration with route planner

  

### 🔐 Authentication & Security

- **Firebase Authentication** - Email/password login

- **Protected Routes** - Login required for app access

- **Auth Context** - Global authentication state management

- **Session Persistence** - Stay logged in across sessions

- **User Profile** - Display name and email management

- **Secure API** - Token-based API authentication

- **Input Validation** - Validator.js for sanitization

  

## 🏗️ Technology Stack

  

### Hardware (IoT)

| Component | Model | Purpose |

|-----------|-------|---------|

| Microcontroller | Arduino Mega 2560 | Main controller for parking system |

| Entry Sensor | IR Obstacle Sensor | Detects car entry |

| Exit Sensor | IR Obstacle Sensor | Detects car exit |

| Display | LCD 16x2 (I2C) | Shows availability to drivers |

| Gate Control | SG90 Servo Motor | Automated barrier |

| Communication | USB Serial (9600) | Data transmission to PC |

  

### Frontend

| Technology | Version | Purpose |

|------------|---------|---------|

| React | 18.2.0 | UI library |

| React Router | 6.30.1 | Client-side routing |

| Vite | 4.5.14 | Build tool & dev server |

| Google Maps API | 2.20.7 | Primary mapping solution |

| React Leaflet | 4.2.1 | Leaflet React components |

| React Leaflet Cluster | 3.1.1 | Marker clustering |

| Firebase | 10.14.1 | Client-side auth SDK |

  

### Backend

| Technology | Version | Purpose |

|------------|---------|---------|

| Express.js | 5.1.0 | Web framework (local dev) |

| Node.js | 16+ | Runtime environment |

| SerialPort | 12.0.0 | Arduino USB communication |

| Axios | 1.7.9 | HTTP client for bridge |

| Firebase Admin | 13.5.0 | Server-side SDK |

| Faker.js | 10.1.0 | Simulated data generation |

| Multer | 2.0.2 | File upload handling |

| Cloudinary | 2.8.0 | Cloud image storage |

| Validator | 13.15.20 | Input sanitization |

| Winston | 3.18.3 | Logging framework |

| Helmet | 8.1.0 | Security middleware |

| Compression | 1.8.1 | Response compression |

| CORS | 2.8.5 | Cross-origin support |

  

### Database & Storage

- **Firebase Firestore** - NoSQL database for reports, favorites, and **Arduino parking data**

- **Cloudinary** - Cloud-based image CDN (optional)

- **Local Storage** - Fallback for image uploads

  

### Deployment & Infrastructure

- **Vercel Serverless Functions** - Production API endpoints

- **Vercel Static Hosting** - React frontend deployment

- **Express Server** - Local development fallback

- **Node.js Serial Bridge** - Runs on local machine with Arduino

- **Continuous Deployment** - Auto-deploy from Git (GitHub → Vercel)

  

## 📦 Installation & Setup

  

### Prerequisites

- **Node.js** 16.0.0 or higher ([Download](https://nodejs.org/))

- **npm** (comes with Node.js)

- **Firebase Project** ([Create one](https://console.firebase.google.com))

- **Google Maps API Key** ([Get key](https://console.cloud.google.com/google/maps-apis))

- **Arduino Mega 2560** (optional - for real sensor data)

- **Arduino IDE** (if using hardware) ([Download](https://www.arduino.cc/en/software))

  

### Part 1: Software Setup

  

#### Step 1: Clone Repository

```bash

git clone https://github.com/bikund2017/Park-Ride.git

cd Park-Ride

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

  

1. **Create Firebase Project:**

- Go to [Firebase Console](https://console.firebase.google.com)

- Click "Add Project"

- Enable **Authentication** (Email/Password)

- Enable **Firestore Database**

  

2. **Download Service Account Key:**

- Go to Project Settings → Service Accounts

- Generate New Private Key

- Save as `serviceAccountKey.json` in project root

  

3. **Get Web App Credentials:**

- Go to Project Settings → General

- Add Web App

- Copy configuration values

  

### Step 4: Google Maps Setup

  

1. Go to [Google Cloud Console](https://console.cloud.google.com)

2. Create or select a project

3. Enable APIs:

- Maps JavaScript API

- Places API

- Geocoding API

4. Create credentials (API Key)

5. Restrict key (optional but recommended)

  

### Step 5: Environment Variables

  

**Backend Configuration** (Create `/.env`):

```env

# Server Configuration

NODE_ENV=development

PORT=3002

  

# Optional: Delhi Transit API

DELHI_TRANSIT_API_KEY=your_api_key_if_available

  

# Optional: Cloudinary Image Upload

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret

  

# Optional: CORS Origins (comma-separated)

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

```

  

**Frontend Configuration** (Create `/client/.env`):

```env

# Firebase Configuration

VITE_FIREBASE_API_KEY=your_firebase_api_key

VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com

VITE_FIREBASE_PROJECT_ID=your-project-id

VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com

VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id

VITE_FIREBASE_APP_ID=your_app_id

  

# Google Maps API Key

VITE_GOOGLE_MAP_API=your_google_maps_api_key

```

  

### Step 6: Run Development Servers

  

**Option 1: Run Separately**

```bash

# Terminal 1 - Backend (Port 3002)

npm run dev

  

# Terminal 2 - Frontend (Port 3000)

cd client

npm run dev

```

  

**Option 2: Run Concurrently (Recommended)**

```bash

npm run dev:full

```

  

### Step 7: Access Application

- **Frontend:** http://localhost:5173

- **Backend API:** http://localhost:3002

- **Health Check:** http://localhost:3002/api/health

  

---

  

### Part 2: Arduino Hardware Setup (Optional)

  

#### Step 1: Hardware Requirements

  

**Components Needed:**

- 1x Arduino Mega 2560

- 2x IR Obstacle Sensors

- 1x LCD 16x2 with I2C module

- 1x SG90 Servo Motor

- 1x Breadboard

- Jumper wires

- 1x USB A to B cable

- Power supply (if needed)

  

#### Step 2: Circuit Connections

  

**IR Sensors:**

- Entry Sensor:

- VCC → Arduino 5V

- GND → Arduino GND

- OUT → Arduino Pin 2

  

- Exit Sensor:

- VCC → Arduino 5V

- GND → Arduino GND

- OUT → Arduino Pin 3

  

**LCD Display (I2C):**

- VCC → Arduino 5V

- GND → Arduino GND

- SDA → Arduino SDA (Pin 20)

- SCL → Arduino SCL (Pin 21)

  

**Servo Motor:**

- Red Wire → Arduino 5V

- Brown Wire → Arduino GND

- Orange Wire → Arduino Pin 9

  

#### Step 3: Upload Arduino Code

  

1. **Open Arduino IDE**

2. **Install Required Libraries:**

- Go to **Sketch** → **Include Library** → **Manage Libraries**

- Install: `LiquidCrystal_I2C`

- Install: `Servo`

  

3. **Load the Code:**

- Open `arduino/parking_sensor_system.ino`

- Or copy code from `arduino/` folder

  

4. **Configure Settings:**

```cpp

#define TOTAL_PARKING_SLOTS 3 // Change based on your parking lot

#define PARKING_LOT_ID "SAB_Mall_Parking" // Unique identifier

```

  

5. **Upload to Arduino:**

- Select **Board:** Arduino Mega 2560

- Select **Port:** (e.g., COM3 or /dev/ttyUSB0)

- Click **Upload**

  

6. **Verify Operation:**

- LCD should display: "Available: X/3"

- Serial Monitor (9600 baud) should show JSON output

- Test sensors by moving hand in front of IR sensors

  

#### Step 4: Configure Serial Bridge

  

1. **Find Arduino Port:**

```bash

# Linux/Mac

ls /dev/tty*

# Look for /dev/ttyUSB0 or /dev/ttyACM0

# Windows

# Check Device Manager → Ports (COM & LPT)

# Look for COM3, COM4, etc.

```

  

2. **Edit Bridge Configuration:**

```bash

# Open arduino-serial-bridge.js

nano arduino-serial-bridge.js

```

  

3. **Update Port Settings:**

```javascript

const portPath = '/dev/ttyUSB0'; // Change to your port

const baudRate = 9600;

const serverUrl = 'https://park-ride-new1.vercel.app'; // Or localhost:3002 for local

```

  

4. **Install Bridge Dependencies:**

```bash

npm install serialport axios

```

  

5. **Run Serial Bridge:**

```bash

node arduino-serial-bridge.js

```

  

6. **Verify Connection:**

- You should see: `✅ Arduino connected on /dev/ttyUSB0`

- Every 5 seconds: `✅ Data sent to server successfully!`

- Check Vercel/local server logs for incoming data

  

#### Step 5: Test Arduino Integration

  

1. **Check Firebase:**

- Go to Firebase Console → Firestore

- Look for collection: `arduino-parking`

- Should see document: `SAB_Mall_Parking` with latest data

  

2. **Check Frontend:**

- Open http://localhost:5173 (or Vercel URL)

- Search for "parking"

- **SAB Mall Parking** should appear first with 🔌 badge

- Availability should match Arduino LCD display

  

3. **Test Real-Time Updates:**

- Wave hand in front of Entry IR sensor

- LCD should update: "Available: 2/3"

- After 5 seconds, website should refresh

- Green card should show: "2 / 3 available"

  

#### Step 6: Keep Bridge Running (Production)

  

**Option 1: Screen (Linux/Mac)**

```bash

screen -S arduino-bridge

node arduino-serial-bridge.js

# Press Ctrl+A, then D to detach

# Reattach: screen -r arduino-bridge

```

  

**Option 2: PM2 (Recommended)**

```bash

npm install -g pm2

pm2 start arduino-serial-bridge.js --name arduino-bridge

pm2 save

pm2 startup # Auto-start on boot

```

  

**Option 3: Systemd Service (Linux)**

Create `/etc/systemd/system/arduino-bridge.service`:

```ini

[Unit]

Description=Arduino Serial Bridge

After=network.target

  

[Service]

ExecStart=/usr/bin/node /path/to/Park-Ride/arduino-serial-bridge.js

Restart=always

User=yourusername

WorkingDirectory=/path/to/Park-Ride

  

[Install]

WantedBy=multi-user.target

```

  

Enable and start:

```bash

sudo systemctl enable arduino-bridge

sudo systemctl start arduino-bridge

```

  

---

  

### Troubleshooting Arduino Setup

  

**Issue: Port Permission Denied**

```bash

# Linux

sudo usermod -a -G dialout $USER

sudo chmod 666 /dev/ttyUSB0

# Logout and login again

```

  

**Issue: Arduino Not Detected**

- Check USB cable (must be data cable, not charge-only)

- Try different USB port

- Install CH340 drivers (if using clone Arduino)

  

**Issue: Serial Data Garbled**

- Verify baud rate is 9600 in both Arduino code and bridge

- Check for loose connections

- Add delay in Arduino loop

  

**Issue: Data Not Reaching Vercel**

- Check internet connection

- Verify serverUrl in bridge script

- Check Firebase credentials

- Look for error messages in bridge console

  

---

  

## 📁 Project Structure

  

```

Park-Ride/

├── api/ # Vercel Serverless Functions

│ ├── arduino/

│ │ └── parking.js # POST/GET Arduino sensor data

│ ├── favorites.js # GET/POST favorites

│ ├── health.js # Health check endpoint

│ ├── report.js # POST new report

│ ├── reports.js # GET all reports

│ ├── transit-data.js # GET parking + transit data (hybrid)

│ ├── favorites/

│ │ └── delete.js # DELETE favorite

│ └── reports/

│ └── [id]/

│ └── upvote.js # POST upvote report

├── arduino/ # Arduino Hardware Code

│ ├── parking_sensor_system.ino # Main Arduino sketch

│ ├── arduino-serial-bridge.js # Node.js USB→HTTP bridge

│ └── README.md # Arduino setup guide

├── client/ # React Frontend

│ ├── public/ # Static assets

│ ├── src/

│ │ ├── components/ # React components

│ │ │ ├── Header.jsx # App header

│ │ │ ├── Navbar.jsx # Navigation bar

│ │ │ ├── Sidebar.jsx # Sidebar with real-time Arduino updates

│ │ │ ├── MapViewGoogle.jsx # Google Maps component

│ │ │ ├── ParkingSearch.jsx # Search functionality

│ │ │ ├── RoutePlanner.jsx # Route planning

│ │ │ ├── ReportForm.jsx # Report submission

│ │ │ ├── ProtectedRoute.jsx# Auth guard

│ │ │ └── LoadingSpinner.jsx# Loading UI

│ │ ├── contexts/

│ │ │ └── AuthContext.jsx # Auth state management

│ │ ├── pages/ # Route pages

│ │ │ ├── Home.jsx # Landing page

│ │ │ ├── Login.jsx # Login page

│ │ │ ├── Signup.jsx # Registration page

│ │ │ ├── Reports.jsx # Reports page

│ │ │ ├── Favorites.jsx # Favorites page

│ │ │ ├── About.jsx # About page

│ │ │ └── NotFound.jsx # 404 page

│ │ ├── App.jsx # Main app component

│ │ ├── main.jsx # App entry point

│ │ ├── firebaseConfig.js # Firebase client config

│ │ ├── index.css # Global styles

│ │ └── map-fix.css # Map-specific styles

│ ├── package.json # Frontend dependencies

│ └── vite.config.js # Vite configuration

├── services/

│ └── transitAPI.js # Transit API integration

├── utils/

│ └── logger.js # Winston logger

├── uploads/ # Local image storage

├── config.js # Server configuration

├── firebase.js # Firebase Admin SDK

├── server.js # Express server (local dev)

├── package.json # Backend dependencies

├── vercel.json # Vercel deployment config

├── nodemon.json # Nodemon configuration

├── cleanup-firebase.js # Firebase cleanup utility

├── serviceAccountKey.json # Firebase credentials (gitignored)

├── VERCEL_ARDUINO_SETUP.md # Arduino deployment guide

└── README.md # This file

```

  

## 🔌 API Reference

  

### Base URL

- **Local:** `http://localhost:3002/api`

- **Production:** `https://park-ride-new1.vercel.app/api`

  

### Arduino Endpoints (NEW!)

  

**POST** `/api/arduino/parking`

- **Description:** Receive Arduino sensor data (called by serial bridge)

- **Body:**

```json

{

"parkingLotId": "SAB_Mall_Parking",

"totalSlots": 3,

"availableSlots": 2

}

```

- **Response:**

```json

{

"success": true,

"message": "Arduino parking data saved successfully",

"data": {

"parkingLotId": "SAB_Mall_Parking",

"name": "SAB Mall Parking",

"location": [28.567582, 77.322673],

"totalSlots": 3,

"availableSlots": 2,

"lastUpdated": "2025-11-06T10:30:00.000Z"

}

}

```

  

**GET** `/api/arduino/parking`

- **Description:** Get latest Arduino parking data

- **Response:**

```json

{

"data": [

{

"parkingLotId": "SAB_Mall_Parking",

"name": "SAB Mall Parking",

"totalSlots": 3,

"availableSlots": 2,

"location": [28.567582, 77.322673],

"hourlyRate": 30,

"lastUpdated": "2025-11-06T10:30:00.000Z"

}

]

}

```

  

### Transit & Parking Data

  

**GET** `/api/transit-data`

- **Description:** Get all parking lots (Arduino + simulated) and transit vehicles

- **Response:**

```json

{

"parkingLots": [

{

"id": "SAB_Mall_Parking",

"name": "SAB Mall Parking",

"location": [28.567582, 77.322673],

"capacity": 3,

"availableSpots": 2,

"hourlyRate": 30,

"arduinoConnected": true,

"lastUpdated": "2025-11-06T10:30:00.000Z"

},

{

"id": 0,

"name": "Connaught Place Park & Ride",

"location": [28.6315, 77.2167],

"capacity": 250,

"availableSpots": 180,

"arduinoConnected": false

}

],

"transitVehicles": [...],

"timestamp": "2025-11-06T10:30:00.000Z",

"dataMode": "hybrid"

}

```

  

**GET** `/api/health`

- **Description:** Server health check

- **Response:**

```json

{

"status": "operational",

"timestamp": "2025-11-01T12:00:00.000Z",

"server": { "uptime": 12345, ... },

"apis": { ... },

"data": { "transitVehicles": 19, "parkingLots": 12 }

}

```

  

#### Reports

  

**POST** `/api/report`

- **Description:** Submit a new community report

- **Body:**

```json

{

"location": [28.6139, 77.2090],

"description": "Parking lot full, overflow parking needed",

"category": "parking",

"imageUrl": "https://..."

}

```

- **Response:**

```json

{

"message": "Report submitted successfully",

"reportId": "abc123"

}

```

  

**GET** `/api/reports?category=parking&limit=100`

- **Description:** Get all reports with optional filtering

- **Query Params:**

- `category` (optional): Filter by category

- `search` (optional): Search in descriptions

- `limit` (optional): Max results (default: 100)

- **Response:**

```json

{

"reports": [...],

"total": 42

}

```

  

**POST** `/api/reports/{id}/upvote`

- **Description:** Upvote a specific report

- **Response:**

```json

{

"message": "Report upvoted successfully",

"upvotes": 15

}

```

  

#### Favorites

  

**POST** `/api/favorites`

- **Description:** Add parking lot to favorites

- **Body:**

```json

{

"userId": "firebase_user_id",

"parkingLotId": 5

}

```

  

**GET** `/api/favorites?userId={userId}`

- **Description:** Get user's favorite parking lots

- **Response:**

```json

{

"favorites": [...]

}

```

  

**DELETE** `/api/favorites/delete?userId={userId}&parkingLotId={lotId}`

- **Description:** Remove from favorites

  
  
  

## 🎯 How It Works

  

### IoT Data Flow (Arduino → Web)

  

```

1. Physical Event

└─ Car enters/exits parking lot

└─ IR Sensor detects movement (Pin 2 or 3)

└─ Arduino updates counter

└─ LCD displays: "Available: 2/3"

  

2. Serial Communication

└─ Arduino sends JSON via USB every loop

└─ {"parkingLotId":"SAB_Mall_Parking","totalSlots":3,"availableSlots":2}

└─ Serial Bridge (Node.js) receives data

  

3. HTTP POST to Cloud

└─ Bridge sends POST to Vercel

└─ https://park-ride-new1.vercel.app/api/arduino/parking

└─ Serverless function processes request

  

4. Database Storage

└─ Vercel function writes to Firebase

└─ Collection: arduino-parking

└─ Document: SAB_Mall_Parking

  

5. Frontend Polling

└─ React app fetches every 10 seconds

└─ GET /api/transit-data

└─ Merges Arduino + simulated data

  

6. UI Update

└─ Sidebar green card shows: "2 / 3 available"

└─ Parking list card updates with 🔌 badge

└─ Map marker changes color (Green/Orange/Red)

```

  

### Authentication Flow

  

1. **Client Initialization**

- User accesses app at `localhost:5173` (dev) or `park-ride-new1.vercel.app` (prod)

- React app loads with Firebase Auth check

- Google Maps API initializes with API key

  

2. **Authentication Flow**

- User logs in via Firebase Auth (email/password)

- Auth token stored in browser localStorage

- Protected routes check auth state via `AuthContext`

- User ID used for favorites and personalized features

  

3. **Data Polling**

- Client polls `/api/transit-data` every 10 seconds

- Server fetches Arduino data from Firebase

- Server generates simulated parking data (Faker.js)

- Hybrid data (1 real + 2 simulated) returned to client

  

4. **Map Rendering**

- Google Maps renders Delhi NCR centered at `[28.6139, 77.2090]`

- Arduino parking lots displayed with 🔌 badge

- Simulated parking shown with standard markers

- Real-time availability colors: Green (>50%), Orange (20-50%), Red (<20%)

  

5. **Community Reports**

- User clicks map or uses current location

- Fills out report form (description, category, optional image)

- Image uploaded to Cloudinary or local storage

- Report saved to Firestore with geolocation

- All users see report on map immediately

  

6. **Favorites System**

- User clicks star icon on parking lot (Arduino or simulated)

- Favorite saved to Firestore: `favorites/{userId}-{lotId}`

- Favorites page fetches user-specific favorites

- Real-time Arduino availability shown for favorited lots

  

7. **Parking Search**

- User enters address in search box

- Google Places Autocomplete suggests addresses

- User selects location or uses current GPS

- Map filters parking lots within selected radius

- Distance calculated using Haversine formula

  

### Data Sources

  

**Current Implementation:**

- **Arduino Data:** Real IR sensor data (SAB Mall Parking - 3 slots)

- **Simulated Data:** 2 locations using Faker.js (Connaught Place, India Gate)

- **Update Frequency:**

- Arduino: Every 5 seconds (bridge POST interval)

- Frontend: Every 10 seconds (polling interval)

- Simulated: Random changes ±5% on each update

  

**Real-Time Update Chain:**

```

Arduino (5s) → Serial Bridge (5s) → Vercel (instant) → Firebase (instant) → Frontend (10s)

Total latency: 5-15 seconds from physical event to UI update

```

  
  

### Manual Deployment

  

**Build Frontend:**

```bash

cd client

npm run build

# Output: client/dist/

```

  

**Deploy `client/dist/` to any static hosting:**

- Netlify

- GitHub Pages

- Firebase Hosting

- AWS S3 + CloudFront

  

**Deploy Serverless Functions:**

- Copy `api/` folder to serverless platform

- Configure environment variables

- Ensure Firebase Admin SDK credentials are set

  

## 📊 Data Model

  

### Firestore Collections

  

**arduino-parking** (NEW!)

```javascript

{

// Document ID: parkingLotId (e.g., "SAB_Mall_Parking")

parkingLotId: "SAB_Mall_Parking",

name: "SAB Mall Parking",

address: "313 B E, I Block, Pocket E, Sector 27, Noida",

location: [28.567582, 77.322673],

totalSlots: 3,

availableSlots: 2,

hourlyRate: 30,

lastUpdated: Timestamp

}

```

  

**reports**

```javascript

{

id: "auto-generated",

location: [28.6139, 77.2090],

description: "Parking lot full",

category: "parking",

imageUrl: "https://...",

timestamp: Timestamp,

upvotes: 0,

resolved: false,

clientInfo: {

userAgent: "...",

ip: "..."

}

}

```

  

**favorites**

```javascript

{

id: "userId-parkingLotId",

userId: "firebase_user_id",

parkingLotId: 5,

parkingLot: { /* full parking object */ },

createdAt: Date

}

```

  

## 🔒 Security

  

- ✅ Helmet.js for HTTP headers

- ✅ CORS configuration (restricted origins)

- ✅ Input validation with Validator.js

- ✅ Firebase Authentication

- ✅ Rate limiting (10kb body limit)

- ✅ Sanitized user inputs

- ✅ Secure file uploads (5MB limit, image only)

- ✅ Environment variable protection (.env files gitignored)

- ✅ API key restrictions (Google Maps - domain-locked)

- ✅ Arduino data validation (JSON schema check)

- ✅ Firebase Admin SDK server-side only (private key secured)

  
  

## 🐛 Known Issues & Limitations

  

- **Arduino Dependency:** Serial bridge must run on local machine with USB connection

- **Single Arduino:** Currently supports 1-2 Arduino devices (scalable with code changes)

- **Latency:** 5-15 seconds delay from physical event to UI update

- **USB Requirement:** Arduino must stay connected via USB (no WiFi module)

- **Local Bridge:** Bridge computer must stay online for cloud updates

- **Transit Data:** Metro tracking is simulated (real APIs pending integration)

- **Image Uploads:** Require Cloudinary account (local fallback available)

- **Google Maps Billing:** Requires enabled billing account (free tier available)

  

## 🗺️ Roadmap

  

### Phase 1: Hardware Expansion ✅ (Current)

- [x] Arduino Mega 2560 integration

- [x] IR sensor entry/exit detection

- [x] LCD display for drivers

- [x] Servo motor gate control

- [x] Serial USB communication

- [x] Node.js serial bridge

- [x] Vercel serverless endpoint

- [x] Firebase real-time storage

- [x] React frontend display

  

### Phase 2: IoT Enhancement 🚧 (In Progress)

- [ ] Add WiFi module (ESP32/ESP8266) for wireless Arduino

- [ ] Support multiple Arduino devices (scalable architecture)

- [ ] Battery backup for power outages

- [ ] SMS/Email alerts for parking full

- [ ] QR code ticket system integration

- [ ] License plate recognition (camera + OCR)

  

### Phase 3: Software Features 📋 (Planned)

- [ ] Integrate real Delhi Transit APIs (DMRC, DTC, Indian Railways)

- [ ] Push notifications for parking availability

- [ ] Reservation system (book parking spot in advance)

- [ ] Payment gateway integration (UPI, cards)

- [ ] Route optimization algorithm

- [ ] Historical analytics dashboard

- [ ] Admin panel for hardware management

- [ ] Mobile app (React Native)

  

### Phase 4: Advanced IoT 🚀 (Future)

- [ ] AI/ML parking prediction (occupancy forecasting)

- [ ] Computer vision parking spot detection

- [ ] Smart city API integrations

- [ ] EV charging station integration

- [ ] Weather-based parking suggestions

  
  

## 📸 Screenshots & Demo

  

### Arduino Hardware

![Arduino Setup](https://via.placeholder.com/800x400?text=Arduino+Mega+2560+with+IR+Sensors+%26+LCD)

- Physical parking sensor system

- IR sensors detecting car entry/exit

- LCD display showing real-time availability

- Servo motor controlling gate barrier

  

### Web Application

![Dashboard](https://via.placeholder.com/800x400?text=Park+%26+Ride+Dashboard)

- Interactive Google Maps with parking markers

- Real-time Arduino data display

- Green gradient card for selected Arduino parking

- 🔌 Badge indicating live hardware connection

  

### Real-Time Updates

![Green Card](https://via.placeholder.com/800x400?text=Real-Time+Arduino+Updates)

- Selected parking location card

- Live availability: "2 / 3 available"

- Data source indicator: "Real-time parking availability is being updated from Arduino sensors"

  

---

  
  

<div align="center">

  

**Built with ❤️ and 🔌 for Delhi NCR commuters**

  

**Real Hardware + Real Code = Real Impact**

  

[🌐 Live Demo](https://park-ride-new1.vercel.app/) • [🐛 Report Bug](https://github.com/bikund2017/Park-Ride/issues) • [✨ Request Feature](https://github.com/bikund2017/Park-Ride/issues) • [📖 Arduino Docs](./arduino/README.md)

  

*Combining IoT hardware with cloud computing to solve real-world parking challenges*

  

Made with React + Express + Arduino + Firebase + Google Maps

  

---

  

### 🔌 IoT Technology Stack

  

![Arduino](https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=arduino&logoColor=white)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)

  

</div>