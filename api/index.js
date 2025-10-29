import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import validator from 'validator';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { db, admin } from '../firebase.js';
import config from '../config.js';

const app = express();

// Security middleware
app.disable('x-powered-by');
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  methods: config.cors.methods,
  allowedHeaders: [...config.cors.allowedHeaders, 'Authorization'],
  credentials: config.cors.credentials
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'park-ride',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret'
});

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
    region: process.env.VERCEL_REGION || 'unknown',
    apis: {
      firebase: !!db,
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME
    }
  };
  res.json(health);
});

// Upload image endpoint
app.post('/api/upload-image', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      const isSize = err.code === 'LIMIT_FILE_SIZE';
      console.error('❌ Multer error:', err.message || err);
      return res.status(isSize ? 413 : 400).json({ 
        message: isSize ? 'Image too large (max 5MB)' : 'Invalid image upload' 
      });
    }

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

      return res.json({ 
        success: true, 
        imageUrl: result.secure_url, 
        publicId: result.public_id, 
        storage: 'cloudinary' 
      });
    } catch (error) {
      console.error('❌ Cloud upload failed:', error?.message || error);
      return res.status(500).json({ message: 'Error uploading image' });
    }
  });
});

// Submit report endpoint
app.post('/api/report', async (req, res) => {
  try {
    const { location, description, category, imageUrl } = req.body;

    if (!location || !Array.isArray(location) || location.length !== 2) {
      return res.status(400).json({ 
        message: 'Invalid location format. Expected [latitude, longitude]' 
      });
    }

    const [lat, lng] = location;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'Location must contain numeric coordinates' });
    }

    if (lat < 28.3 || lat > 28.9 || lng < 76.8 || lng > 77.4) {
      return res.status(400).json({ 
        message: 'Coordinates must be within Delhi NCR region' 
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const cleanDescription = validator.escape(description.trim());

    if (cleanDescription.length < 10) {
      return res.status(400).json({ 
        message: 'Description must be at least 10 characters long' 
      });
    }

    if (cleanDescription.length > 1000) {
      return res.status(400).json({ 
        message: 'Description must be less than 1000 characters' 
      });
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

// Get reports endpoint
app.get('/api/reports', async (req, res) => {
  try {
    const { category, search, limit = 100 } = req.query;

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

    res.json({ reports, total: reports.length });
  } catch (error) {
    console.error('❌ Error retrieving reports:', error);
    res.status(500).json({ message: 'Error retrieving reports' });
  }
});

// Upvote report endpoint
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

// Resolve report endpoint
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

// Delete report endpoint
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('reports').doc(id).delete();

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting report:', error);
    res.status(500).json({ message: 'Error deleting report' });
  }
});

// Favorites endpoints
app.post('/api/favorites', async (req, res) => {
  try {
    const { parkingLotId, userId = 'anonymous', parkingLot } = req.body;

    if (parkingLotId === undefined || parkingLotId === null || parkingLotId === '') {
      return res.status(400).json({ message: 'Parking lot ID is required' });
    }

    const favorite = {
      id: `${userId}-${parkingLotId}`,
      userId,
      parkingLotId,
      parkingLot: parkingLot || {},
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

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Export for Vercel
export default app;
