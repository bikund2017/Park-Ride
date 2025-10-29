# Park & Ride+ Delhi NCR

Real-time Delhi NCR transit tracking and parking availability web application.

## Features

- 🚇 Real-time Delhi Metro tracking
- 🚌 DTC Bus location updates
- 🚂 Indian Railways integration
- 🅿️ Parking availability information
- 🗺️ Interactive map with route planning
- 📝 Community reports and feedback
- ⭐ Favorite locations management

## Prerequisites

- Node.js (v18.x or v20.x)
- npm (comes with Node.js)
- Firebase account (for backend services)
- Optional: Cloudinary account (for image uploads)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/bikund2017/Park-Ride-.git
cd Park-Ride-
```

2. Install backend dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase and API credentials

## Running Locally

### Development Mode

1. Start the backend server:
```bash
npm run dev
```
The server will run on `http://localhost:3002`

2. In a separate terminal, start the client:
```bash
cd client
npm start
```
The client will run on `http://localhost:3000`

### Production Build

1. Build the client:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

## Testing

Run all tests:
```bash
npm test
```

Run only client tests:
```bash
npm run test:client
```

## Linting

Lint backend code:
```bash
npm run lint
```

Lint client code (runs as part of build):
```bash
npm run lint:client
```

## CI/CD

This project uses GitHub Actions for continuous integration. The CI pipeline:
- Runs on Node.js v18.x and v20.x
- Lints backend and frontend code
- Builds the client application
- Runs all tests
- Validates server syntax

The workflow runs on:
- Push to `main`, `develop`, and `copilot/**` branches
- Pull requests to `main` and `develop` branches

## Project Structure

```
Park-Ride-/
├── api/              # API endpoint handlers
├── client/           # React frontend application
│   ├── public/       # Static files
│   └── src/          # React components and pages
├── middleware/       # Express middleware
├── models/           # Data models
├── routes/           # Express routes
├── services/         # External API integrations
├── config.js         # Configuration settings
├── firebase.js       # Firebase initialization
└── server.js         # Main server file
```

## Recent Fixes (Latest Update)

This update includes several code quality improvements and CI setup:

### Fixed Issues
1. **React Hooks Dependencies**: Fixed ESLint warnings in `RoutePlanner.js` by properly wrapping helper functions with `useCallback` and moving constants outside the component.
2. **Unused Imports**: Removed unused `useCallback` import from `Sidebar.js` and `axios` import from `server.js`.
3. **Unused Variables**: Removed unused `skip` parameter from reports API and unused `next` parameter from error handler.
4. **Unused Functions**: Removed unused `generateRoutePathForVehicle` function from `server.js`.
5. **ESLint Configuration**: Added `.eslintrc.json` for backend code linting.

### Added Features
1. **Basic Test Suite**: Added smoke test for the client application.
2. **GitHub Actions CI**: Added comprehensive CI workflow that runs linting, building, and testing.
3. **NPM Scripts**: Added convenient scripts for linting and testing both backend and frontend.

### Build Status
- ✅ Backend lints cleanly
- ✅ Client builds successfully
- ✅ Tests pass
- ✅ Server syntax validated

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and tests (`npm run lint && npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT

## Author

bikund2017
