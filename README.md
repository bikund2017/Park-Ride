# Park & Ride+ Delhi NCR 🚗🚇

A real-time parking and transit information system for Delhi NCR metro stations.

## 🌟 Features

- 📍 **Interactive Map** - View parking lots and transit vehicles on an interactive Leaflet map
- 📝 **Report System** - Submit reports about parking, traffic, facilities, and safety
- ⭐ **Favorites** - Save your frequently used parking lots
- 🚇 **Transit Integration** - Real-time metro and bus information
- 📊 **Live Updates** - Real-time data updates via HTTP polling
- 🗺️ **Route Planning** - Plan your park & ride journey

## 🚀 Live Demo

**Production:** [https://park-ride-new1.vercel.app/](https://park-ride-new1.vercel.app/)

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI framework
- **React Router 6** - Client-side routing
- **Leaflet.js** - Interactive maps
- **Vite 4.5** - Build tool and dev server
- **Native Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework (local dev)
- **Vercel Serverless Functions** - Production API
- **Firebase Firestore** - Database
- **Faker.js** - Simulated transit data

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Firebase account with Firestore enabled
- Git

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/bikund2017/Park-Ride-.git
cd Park-Ride-
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Set up Firebase**
- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable Firestore Database
- Download service account key as `serviceAccountKey.json` in project root

5. **Start the development servers**

In one terminal (backend):
```bash
npm run dev
```

In another terminal (frontend):
```bash
cd client
npm run dev
```

6. **Open the app**
- Frontend: http://localhost:3000
- Backend: http://localhost:3002

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Your message"
git push origin master
```

2. **Deploy to Vercel**
- Connect your GitHub repository to Vercel
- Set the following environment variables in Vercel:
  - `FIREBASE_PROJECT_ID` - Your Firebase project ID
  - `FIREBASE_CLIENT_EMAIL` - Service account email
  - `FIREBASE_PRIVATE_KEY` - Private key (copy from serviceAccountKey.json, keep the `\n` escaped)

3. **Configure Vercel**
The `vercel.json` is already configured:
```json
{
  "framework": null,
  "buildCommand": "cd client && npm ci && npm run build",
  "outputDirectory": "client/dist"
}
```

4. **Automatic Deployments**
Every push to master branch triggers automatic deployment.

## 📁 Project Structure

```
Park-Ride-/
├── api/                    # Vercel serverless functions
│   ├── favorites.js
│   ├── health.js
│   ├── report.js
│   ├── reports.js
│   └── transit-data.js
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── services/               # Backend services
│   └── transitAPI.js       # Transit data generation
├── utils/                  # Utility functions
│   └── logger.js
├── firebase.js             # Firebase initialization
├── server.js               # Local development server
├── package.json
└── vercel.json             # Vercel configuration
```

## 🔧 Configuration

### Environment Variables

**Local Development:**
No environment variables needed - uses `serviceAccountKey.json`

**Production (Vercel):**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{report} {
      allow read: if true;
      allow write: if true;
    }
    match /favorites/{favorite} {
      allow read, write: if true;
    }
  }
}
```

## 🎯 API Endpoints

### GET `/api/health`
Health check endpoint
```json
{"status": "operational", "environment": "production"}
```

### GET `/api/transit-data`
Get parking lots and transit vehicles
```json
{
  "parkingLots": [...],
  "transitVehicles": [...],
  "dataMode": "🟢 Live API"
}
```

### GET `/api/reports`
Get all reports
```json
{
  "reports": [...],
  "total": 7
}
```

### POST `/api/report`
Submit a new report
```json
{
  "location": [lat, lng],
  "description": "...",
  "category": "parking"
}
```

### GET `/api/favorites?userId=anonymous`
Get user favorites

### POST `/api/favorites`
Add to favorites

### DELETE `/api/favorites/delete?userId=...&parkingLotId=...`
Remove from favorites

## 🐛 Known Issues & Solutions

### Issue: Blank screen on Vercel
**Solution:** Removed `axios` and `socket.io-client`, using native `fetch` API instead.

### Issue: Firebase credentials error
**Solution:** Updated `firebase.js` to handle quoted and escaped private keys from Vercel env vars.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

**Bikund Sharma**
- GitHub: [@bikund2017](https://github.com/bikund2017)
- Project Link: [https://github.com/bikund2017/Park-Ride-](https://github.com/bikund2017/Park-Ride-)

## 🙏 Acknowledgments

- Delhi Metro Rail Corporation (DMRC) for inspiration
- OpenStreetMap for map data
- Leaflet.js for mapping library
- Firebase for backend services
- Vercel for hosting

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ for Delhi NCR commuters
