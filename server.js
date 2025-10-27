import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { faker } from '@faker-js/faker';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from 'redis';
import config from './config.js';
import authRoutes from './routes/auth.js';
import { db, admin } from './firebase.js';
import transitAPI from './services/transitAPI.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Park & Ride+ Delhi NCR Server...');
console.log(`Environment: ${config.nodeEnv}`);

const app = express();

// Initialize Redis client (optional for development)
let redisClient = null;
let redisAvailable = false;

// Only try to connect to Redis if explicitly configured
if (process.env.REDIS_URL) {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
      console.log('⚠️ Redis Client Error (continuing without cache):', err.message);
      redisAvailable = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Client Connected');
      redisAvailable = true;
    });

    // Try to connect to Redis, but don't fail if it's not available
    await redisClient.connect().catch((err) => {
      console.log('⚠️ Redis not available, continuing without caching');
      redisAvailable = false;
    });
  } catch (error) {
    console.log('⚠️ Redis initialization failed, continuing without caching');
    redisAvailable = false;
  }
} else {
  console.log('ℹ️ Redis not configured, running without caching');
}

// Cache helper functions
const cacheKey = (prefix, ...params) => `${prefix}:${params.join(':')}`;
const CACHE_TTL = 300; // 5 minutes

const getFromCache = async (key) => {
  if (!redisAvailable || !redisClient) {
    return null;
  }
  try {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('❌ Cache get error:', error);
    return null;
  }
};

const setCache = async (key, data, ttl = CACHE_TTL) => {
  if (!redisAvailable || !redisClient) {
    return;
  }
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('❌ Cache set error:', error);
  }
};

const invalidateCache = async (pattern) => {
  if (!redisAvailable || !redisClient) {
    return;
  }
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('❌ Cache invalidation error:', error);
  }
};

// Rate limiting configuration
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many reports submitted from this IP, please try again after an hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const favoritesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: 'Too many favorites requests from this IP, please try again later.'
});

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

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

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

// Data simulation with rate limiting
let parkingLots = [];
let transitVehicles = [];
let lastApiCall = 0;
const API_RATE_LIMIT_MS = 1000; // 1 second rate limit

console.log('📡 Setting up Delhi Transit API integration...');

// Delhi Transit API Functions - Using Real API Integration
async function fetchDelhiTransitData(silent = false) {
  // Rate limiting
  const now = Date.now();
  if (now - lastApiCall < API_RATE_LIMIT_MS) {
    if (!silent) console.log('⚠️ Rate limiting API calls...');
    return transitVehicles; // Return cached data
  }
  lastApiCall = now;

  try {
    if (!silent) console.log('🔄 Attempting to fetch REAL Delhi transit data from APIs...');
    
    // Try to fetch real data from multiple sources
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

  // Fallback to simulated data
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

// Track if we're using real API data or fallback
let usingRealData = false;

// Update function
async function updateData() {
  // Update parking availability
  parkingLots.forEach(lot => {
    const currentSpots = lot.availableSpots;
    const maxChange = Math.floor(lot.capacity * 0.05);
    const change = faker.number.int({ min: -maxChange, max: maxChange });
    lot.availableSpots = Math.max(0, Math.min(lot.capacity, currentSpots + change));
  });

  // Only fetch real API data every 5 minutes (300000 ms) when in fallback mode
  // When real APIs work, fetch every 30 seconds
  const now = Date.now();
  const apiCheckInterval = usingRealData ? 30000 : 300000; // 30 sec if real data, 5 min if fallback
  
  if (!updateData.lastApiCall || (now - updateData.lastApiCall) > apiCheckInterval) {
    // Use silent mode when checking APIs frequently in fallback mode
    const silent = !usingRealData && apiCheckInterval === 300000;
    const fetchedData = await fetchDelhiTransitData(silent);
    const isRealData = fetchedData && fetchedData.length > 0 && !fetchedData[0].id?.startsWith('metro-');
    
    if (fetchedData && fetchedData.length > 0) {
      transitVehicles = fetchedData;
      usingRealData = isRealData;
    }
    updateData.lastApiCall = now;
  } else {
    // Small position updates for existing vehicles
    transitVehicles.forEach(vehicle => {
      if (vehicle.routePath && vehicle.currentStopIndex !== undefined) {
        vehicle.currentStopIndex = (vehicle.currentStopIndex + 1) % vehicle.routePath.length;
        vehicle.location = vehicle.routePath[vehicle.currentStopIndex];
      }
    });
  }

  // Emit to all clients
  io.emit('update-data', { parkingLots, transitVehicles });
  
  const timestamp = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
  const dataSource = usingRealData ? '🟢 Live API' : '🟡 Simulated';
  console.log(`🔄 Delhi NCR data updated at ${timestamp} - ${transitVehicles.length} vehicles ${dataSource}`);
}

// Socket.IO connections
io.on('connection', (socket) => {
  console.log(`👤 New client connected: ${socket.id}`);
  socket.emit('update-data', { parkingLots, transitVehicles });
  
  socket.on('disconnect', () => {
    console.log(`👋 Client disconnected: ${socket.id}`);
  });
});

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload to Cloudinary
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

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// API Routes
app.post('/api/report', reportLimiter, async (req, res) => {
  try {
    const { location, description, category, imageUrl } = req.body;
    
    // Validate location format
    if (!location || !Array.isArray(location) || location.length !== 2) {
      return res.status(400).json({ message: 'Invalid location format. Expected [latitude, longitude]' });
    }
    
    // Validate coordinates are numbers
    const [lat, lng] = location;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'Location must contain numeric coordinates' });
    }
    
    // Validate coordinate ranges (Delhi NCR approximate bounds)
    if (lat < 28.3 || lat > 28.9 || lng < 76.8 || lng > 77.4) {
      return res.status(400).json({ message: 'Coordinates must be within Delhi NCR region' });
    }
    
    // Check and sanitize description
    if (!description?.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    
    // Sanitize description to prevent XSS attacks
    const cleanDescription = validator.escape(description.trim());
    
    // Validate description length
    if (cleanDescription.length < 10) {
      return res.status(400).json({ message: 'Description must be at least 10 characters long' });
    }
    
    if (cleanDescription.length > 1000) {
      return res.status(400).json({ message: 'Description must be less than 1000 characters' });
    }
    
    // Validate category
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
    
    // Invalidate reports cache
    await invalidateCache('reports:*');
    
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
    
    // Create cache key
    const cacheKeyStr = cacheKey('reports', category || 'all', search || 'none', limit, skip);
    
    // Try to get from cache first
    const cachedData = await getFromCache(cacheKeyStr);
    if (cachedData) {
      console.log('📦 Serving reports from cache');
      return res.json(cachedData);
    }
    
    let query = db.collection('reports');
    
    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }
    
    // Apply ordering and limit
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
    
    // Client-side search if search query provided
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      reports = reports.filter(report => 
        report.description.toLowerCase().includes(searchLower) ||
        report.category.toLowerCase().includes(searchLower)
      );
    }
    
    const responseData = { reports, total: reports.length };
    
    // Cache the results
    await setCache(cacheKeyStr, responseData);
    
    console.log(`📊 Retrieved ${reports.length} reports${category ? ` (filtered by: ${category})` : ''}${search ? ` (search: ${search})` : ''}`);
    res.json(responseData);
  } catch (error) {
    console.error('❌ Error retrieving reports:', error);
    res.status(500).json({ message: 'Error retrieving reports' });
  }
});

// Upvote a report
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
    
    // Invalidate reports cache
    await invalidateCache('reports:*');
    
    res.json({ message: 'Report upvoted successfully', upvotes: currentUpvotes + 1 });
  } catch (error) {
    console.error('❌ Error upvoting report:', error);
    res.status(500).json({ message: 'Error upvoting report' });
  }
});

// Mark report as resolved
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

// Delete report (admin/moderation)
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

// New endpoint: API Health Check
// Favorites endpoints
app.post('/api/favorites', favoritesLimiter, async (req, res) => {
  try {
    const { parkingLotId, userId = 'anonymous' } = req.body;
    
    if (!parkingLotId) {
      return res.status(400).json({ message: 'Parking lot ID is required' });
    }
    
    // Check if parking lot exists
    const parkingLot = parkingLots.find(lot => lot.id === parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }
    
    // Add to favorites (using a simple in-memory store for now)
    const favorite = {
      id: `${userId}-${parkingLotId}`,
      userId,
      parkingLotId,
      parkingLot,
      createdAt: new Date()
    };
    
    // Store in Firestore
    await db.collection('favorites').doc(favorite.id).set(favorite);
    
    res.json({ message: 'Added to favorites', favorite });
  } catch (error) {
    console.error('❌ Error adding favorite:', error);
    res.status(500).json({ message: 'Error adding to favorites' });
  }
});

app.get('/api/favorites/:userId', favoritesLimiter, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const favoritesSnapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .get();
    
    const favorites = [];
    favoritesSnapshot.forEach(doc => {
      favorites.push(doc.data());
    });
    
    // Sort by createdAt on the client side to avoid Firestore index requirement
    favorites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ favorites });
  } catch (error) {
    console.error('❌ Error fetching favorites:', error);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

app.delete('/api/favorites/:userId/:parkingLotId', favoritesLimiter, async (req, res) => {
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

// Initialize and start
async function initializeApplication() {
  try {
    console.log('🌟 Initializing Delhi NCR data...');
    await generateData();
    console.log(`✅ Generated ${parkingLots.length} parking lots and ${transitVehicles.length} transit vehicles`);

    // Start real-time updates
    setInterval(updateData, 3000);

    // Periodic full refresh - always uses verbose logging
    setInterval(async () => {
      console.log('🔄 Scheduled transit data refresh...');
      const fetchedData = await fetchDelhiTransitData(false); // verbose
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

// Error handling middleware (must be after all other middleware and routes)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Consider whether to crash the app or continue
  // process.exit(1);
});

// Start the server
const PORT = config.port;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`🗺️  Map: Delhi NCR centered at 28.6139°N, 77.2090°E`);
  console.log(`🔑 API Key: ${config.delhiTransit.apiKey ? 'Configured' : 'Missing'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 WebSocket: ${io ? 'Enabled' : 'Disabled'}`);
});

// Start the application
initializeApplication().catch(error => {
  console.error('💥 Failed to initialize:', error.message);
  process.exit(1);
});
