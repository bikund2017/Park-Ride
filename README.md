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

