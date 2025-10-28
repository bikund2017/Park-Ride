import express from 'express';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { faker } from '@faker-js/faker';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import validator from 'validator';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import config from './config.js';
import authRoutes from './routes/auth.js';
import { db, admin } from './firebase.js';
import transitAPI from './services/transitAPI.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Park & Ride+ Delhi NCR Server...');
console.log(`Environment: ${config.nodeEnv}`);

const app = express();

console.log('🚀 Starting Park & Ride+ Delhi NCR Server...');
console.log(`Environment: ${config.nodeEnv}`);

// Security middleware
app.disable('x-powered-by');
app.use(helmet()); // Add security headers
app.use(compression()); // Enable gzip compression

// Apply CORS with configuration
app.use(cors({
  origin: config.cors.origin,
  methods: config.cors.methods,
  allowedHeaders: [...config.cors.allowedHeaders, 'Authorization'],
  credentials: config.cors.credentials
}));

// Ensure local uploads directory exists and serve it
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/auth/me', (req, res) => {
  res.json({ user: req.user });
});

// Body parsing
app.use(express.json({ limit: '10kb' })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret'
});

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const server = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    credentials: config.cors.credentials
  },
  pingTimeout: 60000, // Increase ping timeout
  pingInterval: 25000, // Send pings every 25 seconds
  maxHttpBufferSize: 1e8 // 100MB max message size (for large data transfers)
});

let parkingLots = [];
let transitVehicles = [];
let lastApiCall = 0;
const API_RATE_LIMIT_MS = 1000;

console.log('📡 Setting up Delhi Transit API integration...');

async function fetchDelhiTransitData(silent = false) {
  const now = Date.now();
  if (now - lastApiCall < API_RATE_LIMIT_MS) {
    if (!silent) console.log('⚠️ Rate limiting API calls...');
    return transitVehicles;
  }
  lastApiCall = now;

  try {
    if (!silent) console.log('🔄 Attempting to fetch REAL Delhi transit data from APIs...');
    
    const realData = await transitAPI.fetchAllRealTransitData();
    
    if (realData && realData.length > 0) {
      console.log(`✅ SUCCESS! Fetched ${realData.length} REAL transit vehicles`);
      console.log(`   - Metro: ${realData.filter(v => v.vehicleType === 'metro').length}`);
      console.log(`   - Bus: ${realData.filter(v => v.vehicleType === 'bus').length}`);
      console.log(`   - Train: ${realData.filter(v => v.vehicleType === 'train').length}`);
      return realData;
    }

    if (!silent) console.log('⚠️ No real data available from APIs');
  } catch (error) {
    if (!silent) console.log('⚠️ API fetch error:', error.message);
  }

  if (!silent) console.log('📊 Using simulated data as fallback');
  return generateFallbackTransitData();
}

function generateRoutePathForVehicle(vehicle) {
  const lat = parseFloat(vehicle.latitude) || 28.6139;
  const lng = parseFloat(vehicle.longitude) || 77.2090;
  const routePath = [];
  
  for (let i = 0; i < 10; i++) {
    const offset = (i - 5) * 0.01;
    routePath.push([lat + offset, lng + offset * 0.5]);
  }
  
  return routePath;
}

function generateFallbackTransitData() {
  console.log('🔄 Generating comprehensive Delhi Transit data (Metro, Bus, Train)...');
  
  const metroLines = [
    { name: "Red Line (Rithala - Shaheed Sthal)", color: "#E41E26", stations: 29 },
    { name: "Blue Line (Dwarka - Noida/Vaishali)", color: "#0066B3", stations: 50 },
    { name: "Yellow Line (Samaypur Badli - HUDA City Centre)", color: "#FFD100", stations: 37 },
    { name: "Green Line (Mundka - Inderlok)", color: "#00A650", stations: 23 },
    { name: "Violet Line (Kashmere Gate - Raja Nahar Singh)", color: "#9B26AF", stations: 34 },
    { name: "Pink Line (Majlis Park - Shiv Vihar)", color: "#E91E63", stations: 38 },
    { name: "Magenta Line (Janakpuri West - Botanical Garden)", color: "#FF00FF", stations: 25 },
    { name: "Orange Line (New Delhi - Dwarka)", color: "#FF6600", stations: 6 },
    { name: "Rapid Metro (Sikanderpur - Cyber City)", color: "#00CED1", stations: 5 },
    { name: "Aqua Line (Noida Sector 51 - Depot)", color: "#00BFFF", stations: 21 }
  ];

  const busRoutes = [
    { name: "DTC 764 (ISBT - Nehru Place)", stops: 45 },
    { name: "DTC 534 (Old Delhi - Dwarka)", stops: 38 },
    { name: "DTC 423 (Anand Vihar - Vasant Vihar)", stops: 52 },
    { name: "Cluster AC (Connaught Place - Gurgaon)", stops: 28 },
    { name: "DTC 181 (Kashmere Gate - Saket)", stops: 41 }
  ];

  const trainRoutes = [
    { name: "Rajdhani Express (Delhi - Mumbai)", platform: 2 },
    { name: "Shatabdi Express (Delhi - Chandigarh)", platform: 5 },
    { name: "Local Train (Delhi - Ghaziabad)", platform: 8 },
    { name: "Duronto Express (Delhi - Kolkata)", platform: 3 }
  ];

  const delhiLocations = [
    { name: "Rajiv Chowk Metro", coords: [28.6328, 77.2197], type: "metro" },
    { name: "Kashmere Gate Metro", coords: [28.6676, 77.2285], type: "metro" },
    { name: "Hauz Khas Metro", coords: [28.5494, 77.2001], type: "metro" },
    { name: "Dwarka Sector 21 Metro", coords: [28.5521, 77.0590], type: "metro" },
    { name: "Noida City Centre Metro", coords: [28.5744, 77.3564], type: "metro" },
    { name: "Chandni Chowk Metro", coords: [28.6506, 77.2303], type: "metro" },
    { name: "AIIMS Metro", coords: [28.5672, 77.2100], type: "metro" },
    { name: "Botanical Garden Metro", coords: [28.5641, 77.3344], type: "metro" },
    { name: "Vaishali Metro", coords: [28.6491, 77.3410], type: "metro" },
    { name: "Huda City Centre Metro", coords: [28.4595, 77.0727], type: "metro" },
    { name: "ISBT Kashmere Gate", coords: [28.6692, 77.2289], type: "bus" },
    { name: "Nehru Place Terminal", coords: [28.5494, 77.2501], type: "bus" },
    { name: "Anand Vihar ISBT", coords: [28.6469, 77.3160], type: "bus" },
    { name: "Dwarka Sector 9", coords: [28.5810, 77.0707], type: "bus" },
    { name: "Saket District Centre", coords: [28.5244, 77.2066], type: "bus" },
    { name: "New Delhi Railway Station", coords: [28.6431, 77.2197], type: "train" },
    { name: "Old Delhi Railway Station", coords: [28.6642, 77.2295], type: "train" },
    { name: "Hazrat Nizamuddin Station", coords: [28.5875, 77.2506], type: "train" },
    { name: "Anand Vihar Terminal", coords: [28.6469, 77.3160], type: "train" }
  ];

  const fallbackData = [];
  
  // Generate Metro vehicles
  for (let i = 0; i < 10; i++) {
    const metro = metroLines[i];
    const location = delhiLocations[i];
    const routePath = [];
    
    for (let j = 0; j < 15; j++) {
      const offset = (j - 7) * 0.02;
      routePath.push([
        location.coords[0] + offset + (Math.random() - 0.5) * 0.005,
        location.coords[1] + offset * 0.5 + (Math.random() - 0.5) * 0.005
      ]);
    }
    
    fallbackData.push({
      id: `metro-${i + 1}`,
      routeName: metro.name,
      location: location.coords,
      routePath,
      vehicleType: 'metro',
      status: ['active', 'arriving', 'departing'][Math.floor(Math.random() * 3)],
      speed: Math.floor(Math.random() * 30) + 40,
      currentStopIndex: Math.floor(Math.random() * 15),
      lineColor: metro.color,
      totalStations: metro.stations,
      nextStation: `Station ${Math.floor(Math.random() * metro.stations) + 1}`,
      estimatedArrival: `${Math.floor(Math.random() * 5) + 1} min`,
      crowdLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
    });
  }
  
  // Generate Bus vehicles
  for (let i = 0; i < 5; i++) {
    const bus = busRoutes[i];
    const location = delhiLocations[i + 10];
    const routePath = [];
    
    for (let j = 0; j < 10; j++) {
      const offset = (j - 5) * 0.015;
      routePath.push([
        location.coords[0] + offset + (Math.random() - 0.5) * 0.008,
        location.coords[1] + offset * 0.7 + (Math.random() - 0.5) * 0.008
      ]);
    }
    
    fallbackData.push({
      id: `bus-${i + 1}`,
      routeName: bus.name,
      location: location.coords,
      routePath,
      vehicleType: 'bus',
      status: ['active', 'at_stop', 'delayed'][Math.floor(Math.random() * 3)],
      speed: Math.floor(Math.random() * 30) + 15,
      currentStopIndex: Math.floor(Math.random() * 10),
      totalStops: bus.stops,
      nextStop: `Stop ${Math.floor(Math.random() * bus.stops) + 1}`,
      estimatedArrival: `${Math.floor(Math.random() * 10) + 2} min`,
      crowdLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      acAvailable: i % 2 === 0
    });
  }
  
  // Generate Train vehicles
  for (let i = 0; i < 4; i++) {
    const train = trainRoutes[i];
    const location = delhiLocations[i + 15];
    const routePath = [];
    
    for (let j = 0; j < 8; j++) {
      const offset = (j - 4) * 0.03;
      routePath.push([
        location.coords[0] + offset,
        location.coords[1] + offset * 0.6
      ]);
    }
    
    fallbackData.push({
      id: `train-${i + 1}`,
      routeName: train.name,
      location: location.coords,
      routePath,
      vehicleType: 'train',
      status: ['scheduled', 'arriving', 'boarding', 'departed'][Math.floor(Math.random() * 4)],
      speed: Math.floor(Math.random() * 50) + 60,
      currentStopIndex: 0,
      platform: train.platform,
      scheduledTime: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} PM`,
      delay: Math.floor(Math.random() * 30),
      coaches: Math.floor(Math.random() * 8) + 12
    });
  }
  
  console.log(`✅ Generated ${fallbackData.length} transit vehicles: ${fallbackData.filter(v => v.vehicleType === 'metro').length} Metro, ${fallbackData.filter(v => v.vehicleType === 'bus').length} Bus, ${fallbackData.filter(v => v.vehicleType === 'train').length} Train`);
  return fallbackData;
}

async function generateData() {
  console.log('🏗️ Setting up Delhi NCR parking locations...');
  
  const delhiLocations = [
    { name: "Connaught Place", coords: [28.6315, 77.2167] },
    { name: "India Gate", coords: [28.6129, 77.2295] },
    { name: "Red Fort", coords: [28.6562, 77.2410] },
    { name: "Chandni Chowk", coords: [28.6506, 77.2303] },
    { name: "AIIMS", coords: [28.5672, 77.2100] },
    { name: "Hauz Khas", coords: [28.5494, 77.2001] },
    { name: "Karol Bagh", coords: [28.6519, 77.1905] },
    { name: "Rajouri Garden", coords: [28.6469, 77.1201] },
    { name: "Dwarka", coords: [28.5921, 77.0460] },
    { name: "Gurgaon Cyber City", coords: [28.4950, 77.0890] },
    { name: "Noida City Centre", coords: [28.5744, 77.3564] },
    { name: "Faridabad", coords: [28.4089, 77.3178] }
  ];

  // Generate parking lots
  parkingLots = [];
  for (let i = 0; i < 12; i++) {
    const location = delhiLocations[i];
    parkingLots.push({
      id: i,
      name: `${location.name} Park & Ride`,
      location: [
        location.coords[0] + (Math.random() - 0.5) * 0.01,
        location.coords[1] + (Math.random() - 0.5) * 0.01
      ],
      capacity: faker.number.int({ min: 100, max: 500 }),
      availableSpots: faker.number.int({ min: 10, max: 100 }),
    });
  }

  // Fetch transit data
  transitVehicles = await fetchDelhiTransitData();
}

let usingRealData = false;

async function updateData() {
  parkingLots.forEach(lot => {
    const currentSpots = lot.availableSpots;
    const maxChange = Math.floor(lot.capacity * 0.05);
    const change = faker.number.int({ min: -maxChange, max: maxChange });
    lot.availableSpots = Math.max(0, Math.min(lot.capacity, currentSpots + change));
  });

  const now = Date.now();
  const apiCheckInterval = usingRealData ? 30000 : 300000;
  
  if (!updateData.lastApiCall || (now - updateData.lastApiCall) > apiCheckInterval) {
    const silent = !usingRealData && apiCheckInterval === 300000;
    const fetchedData = await fetchDelhiTransitData(silent);
    const isRealData = fetchedData && fetchedData.length > 0 && !fetchedData[0].id?.startsWith('metro-');
    
    if (fetchedData && fetchedData.length > 0) {
      transitVehicles = fetchedData;
      usingRealData = isRealData;
    }
    updateData.lastApiCall = now;
  } else {
    transitVehicles.forEach(vehicle => {
      if (vehicle.routePath && vehicle.currentStopIndex !== undefined) {
        vehicle.currentStopIndex = (vehicle.currentStopIndex + 1) % vehicle.routePath.length;
        vehicle.location = vehicle.routePath[vehicle.currentStopIndex];
      }
    });
  }

  io.emit('update-data', { parkingLots, transitVehicles });
  
  const timestamp = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
  const dataSource = usingRealData ? '🟢 Live API' : '🟡 Simulated';
  console.log(`🔄 Delhi NCR data updated at ${timestamp} - ${transitVehicles.length} vehicles ${dataSource}`);
}

io.on('connection', (socket) => {
  console.log(`👤 New client connected: ${socket.id}`);
  socket.emit('update-data', { parkingLots, transitVehicles });
  
  socket.on('disconnect', () => {
    console.log(`👋 Client disconnected: ${socket.id}`);
  });
});

app.post('/api/upload-image', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      const isSize = err.code === 'LIMIT_FILE_SIZE';
      console.error('❌ Multer error:', err.message || err);
      return res.status(isSize ? 413 : 400).json({ message: isSize ? 'Image too large (max 5MB)' : 'Invalid image upload' });
    }

    const saveLocalAndRespond = async () => {
      try {
        if (!req.file) return res.status(400).json({ message: 'No image file provided' });
        const ext = req.file.mimetype?.split('/')?.[1] || 'jpg';
        const filename = `report_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const dest = path.join(uploadsDir, filename);
        fs.writeFileSync(dest, req.file.buffer);
        const url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
        return res.json({ success: true, imageUrl: url, publicId: filename, storage: 'local' });
      } catch (e) {
        console.error('❌ Local image save failed:', e.message || e);
        return res.status(500).json({ message: 'Error uploading image' });
      }
    };

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'park-ride') {
        return await saveLocalAndRespond();
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'park-and-ride-reports',
            transformation: [
              { width: 1200, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      return res.json({ success: true, imageUrl: result.secure_url, publicId: result.public_id, storage: 'cloudinary' });
    } catch (error) {
      console.error('❌ Cloud upload failed, falling back to local:', error?.message || error);
      return await saveLocalAndRespond();
    }
  });
});

app.post('/api/report', async (req, res) => {
  try {
    const { location, description, category, imageUrl } = req.body;
    
    if (!location || !Array.isArray(location) || location.length !== 2) {
      return res.status(400).json({ message: 'Invalid location format. Expected [latitude, longitude]' });
    }
    
    const [lat, lng] = location;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'Location must contain numeric coordinates' });
    }
    
    if (lat < 28.3 || lat > 28.9 || lng < 76.8 || lng > 77.4) {
      return res.status(400).json({ message: 'Coordinates must be within Delhi NCR region' });
    }
    
    if (!description?.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    
    const cleanDescription = validator.escape(description.trim());
    
    if (cleanDescription.length < 10) {
      return res.status(400).json({ message: 'Description must be at least 10 characters long' });
    }
    
    if (cleanDescription.length > 1000) {
      return res.status(400).json({ message: 'Description must be less than 1000 characters' });
    }
    
    const validCategories = ['parking', 'traffic', 'facility', 'metro', 'safety', 'general'];
    const validCategory = validCategories.includes(category) ? category : 'general';
    
    const report = {
      location,
      description: cleanDescription,
      category: validCategory,
      imageUrl: imageUrl || null,
      timestamp: admin.firestore?.FieldValue?.serverTimestamp() || new Date(),
      upvotes: 0,
      resolved: false,
      clientInfo: {
        userAgent: req.get('User-Agent') || 'Unknown',
        ip: req.ip || req.connection.remoteAddress || 'Unknown'
      }
    };
    
    const docRef = await db.collection('reports').add(report);
    console.log(`📝 New report submitted: ${docRef.id}`);
    
    res.status(201).json({ 
      message: 'Report submitted successfully',
      reportId: docRef.id 
    });
  } catch (error) {
    console.error('❌ Error submitting report:', error);
    res.status(500).json({ message: 'Error submitting report. Please try again later.' });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const { category, search, limit = 100, skip = 0 } = req.query;
    
    let query = db.collection('reports');
    
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }
    
    query = query.orderBy('timestamp', 'desc').limit(parseInt(limit));
    
    const reportsSnapshot = await query.get();
    
    let reports = [];
    reportsSnapshot.forEach(doc => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        location: data.location,
        description: data.description,
        category: data.category || 'general',
        imageUrl: data.imageUrl || null,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
        submittedAt: data.timestamp?.toDate?.()?.toLocaleString() || new Date(data.timestamp).toLocaleString(),
        upvotes: data.upvotes || 0,
        resolved: data.resolved || false,
        clientInfo: data.clientInfo || {}
      });
    });
    
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      reports = reports.filter(report => 
        report.description.toLowerCase().includes(searchLower) ||
        report.category.toLowerCase().includes(searchLower)
      );
    }
    
    const responseData = { reports, total: reports.length };
    
    console.log(`📊 Retrieved ${reports.length} reports${category ? ` (filtered by: ${category})` : ''}${search ? ` (search: ${search})` : ''}`);
    res.json(responseData);
  } catch (error) {
    console.error('❌ Error retrieving reports:', error);
    res.status(500).json({ message: 'Error retrieving reports' });
  }
});

app.post('/api/reports/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;
    const reportRef = db.collection('reports').doc(id);
    const reportDoc = await reportRef.get();
    
    if (!reportDoc.exists) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const currentUpvotes = reportDoc.data().upvotes || 0;
    await reportRef.update({ upvotes: currentUpvotes + 1 });
    
    res.json({ message: 'Report upvoted successfully', upvotes: currentUpvotes + 1 });
  } catch (error) {
    console.error('❌ Error upvoting report:', error);
    res.status(500).json({ message: 'Error upvoting report' });
  }
});

app.post('/api/reports/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const reportRef = db.collection('reports').doc(id);
    const reportDoc = await reportRef.get();
    
    if (!reportDoc.exists) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    await reportRef.update({ 
      resolved: true,
      resolvedAt: admin.firestore?.FieldValue?.serverTimestamp() || new Date()
    });
    
    res.json({ message: 'Report marked as resolved' });
  } catch (error) {
    console.error('❌ Error resolving report:', error);
    res.status(500).json({ message: 'Error resolving report' });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('reports').doc(id).delete();
    
    console.log(`🗑️ Report deleted: ${id}`);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting report:', error);
    res.status(500).json({ message: 'Error deleting report' });
  }
});

app.get('/api/transit-info', (req, res) => {
  const metroCount = transitVehicles.filter(v => v.vehicleType === 'metro').length;
  const busCount = transitVehicles.filter(v => v.vehicleType === 'bus').length;
  const trainCount = transitVehicles.filter(v => v.vehicleType === 'train').length;
  
  res.json({
    message: 'Delhi Transit Data API Integration',
    dataSource: 'Real-time Multi-Source Integration',
    apiStatus: {
      delhiOTD: config.delhiTransit.apiKey ? '✓ Configured' : '✗ Missing',
      dmrc: process.env.DMRC_API_KEY ? '✓ Configured' : '⏳ Pending',
      dtc: process.env.DTC_API_KEY ? '✓ Configured' : '⏳ Pending',
      indianRailways: process.env.IRCTC_API_KEY || process.env.RAPIDAPI_KEY ? '✓ Configured' : '⏳ Pending',
      parking: process.env.PARKING_API_KEY ? '✓ Configured' : '⏳ Pending'
    },
    vehicleCounts: {
      total: transitVehicles.length,
      metro: metroCount,
      bus: busCount,
      train: trainCount
    },
    dataMode: transitVehicles.some(v => v.id.startsWith('metro-') && v.totalStations > 0) ? 
      '🔴 Simulated (Fallback)' : '🟢 Real-time (Live APIs)',
    lastUpdate: new Date().toISOString(),
    parkingLots: parkingLots.length,
    sampleVehicles: transitVehicles.slice(0, 3).map(v => ({
      id: v.id,
      route: v.routeName,
      type: v.vehicleType,
      status: v.status,
      speed: v.speed,
      location: v.location
    }))
  });
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { parkingLotId, userId = 'anonymous' } = req.body;
    
    if (parkingLotId === undefined || parkingLotId === null || parkingLotId === '') {
      return res.status(400).json({ message: 'Parking lot ID is required' });
    }
    const parsedId = typeof parkingLotId === 'string' ? Number(parkingLotId) : parkingLotId;
    if (Number.isNaN(parsedId)) {
      return res.status(400).json({ message: 'Parking lot ID must be a number' });
    }
    
    const parkingLot = parkingLots.find(lot => Number(lot.id) === Number(parsedId));
    if (!parkingLot) {
      const availableIds = parkingLots.map(l => l.id);
      return res.status(404).json({ message: `Parking lot not found`, availableIds });
    }
    
    const favorite = {
      id: `${userId}-${parsedId}`,
      userId,
      parkingLotId: parsedId,
      parkingLot,
      createdAt: new Date()
    };
    
    await db.collection('favorites').doc(favorite.id).set(favorite);
    
    res.json({ message: 'Added to favorites', favorite });
  } catch (error) {
    console.error('❌ Error adding favorite:', error);
    res.status(500).json({ message: 'Error adding to favorites' });
  }
});

app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const favoritesSnapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .get();
    
    const favorites = [];
    favoritesSnapshot.forEach(doc => {
      favorites.push(doc.data());
    });
    
    favorites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ favorites });
  } catch (error) {
    console.error('❌ Error fetching favorites:', error);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

app.delete('/api/favorites/:userId/:parkingLotId', async (req, res) => {
  try {
    const { userId, parkingLotId } = req.params;
    const favoriteId = `${userId}-${parkingLotId}`;
    
    await db.collection('favorites').doc(favoriteId).delete();
    
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('❌ Error removing favorite:', error);
    res.status(500).json({ message: 'Error removing from favorites' });
  }
});

app.get('/api/health', async (req, res) => {
  const health = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    },
    apis: {
      delhiOTD: {
        configured: !!config.delhiTransit.apiKey,
        status: config.delhiTransit.apiKey ? 'ready' : 'missing_key'
      },
      dmrc: {
        configured: !!process.env.DMRC_API_KEY,
        status: process.env.DMRC_API_KEY ? 'ready' : 'pending_key'
      },
      dtc: {
        configured: !!process.env.DTC_API_KEY,
        status: process.env.DTC_API_KEY ? 'ready' : 'pending_key'
      },
      railways: {
        configured: !!(process.env.IRCTC_API_KEY || process.env.RAPIDAPI_KEY),
        status: (process.env.IRCTC_API_KEY || process.env.RAPIDAPI_KEY) ? 'ready' : 'pending_key'
      }
    },
    data: {
      transitVehicles: transitVehicles.length,
      parkingLots: parkingLots.length,
      connectedClients: io.engine.clientsCount
    }
  };
  
  res.json(health);
});

async function initializeApplication() {
  try {
    console.log('🌟 Initializing Delhi NCR data...');
    await generateData();
    console.log(`✅ Generated ${parkingLots.length} parking lots and ${transitVehicles.length} transit vehicles`);

    setInterval(updateData, 3000);

    setInterval(async () => {
      console.log('🔄 Scheduled transit data refresh...');
      const fetchedData = await fetchDelhiTransitData(false);
      if (fetchedData && fetchedData.length > 0) {
        const isRealData = !fetchedData[0].id?.startsWith('metro-');
        usingRealData = isRealData;
        transitVehicles = fetchedData;
      }
    }, 5 * 60 * 1000);

    console.log('🎯 Delhi NCR Park & Ride+ server initialized successfully!');
  } catch (error) {
    console.error('💥 Initialization failed:', error);
    throw error;
  }
}

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

const PORT = config.port;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`🗺️  Map: Delhi NCR centered at 28.6139°N, 77.2090°E`);
  console.log(`🔑 API Key: ${config.delhiTransit.apiKey ? 'Configured' : 'Missing'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 WebSocket: ${io ? 'Enabled' : 'Disabled'}`);
});

initializeApplication().catch(error => {
  console.error('💥 Failed to initialize:', error.message);
  process.exit(1);
});
