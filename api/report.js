import { db, admin } from '../firebase.js';
import validator from 'validator';

export default async function handler(req, res) {
  // Enable CORS
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

  // Allow all for vercel ke liye
  if (origin && (allowedOrigins.includes(origin) || origin.includes('vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { location, description, category, imageUrl } = req.body;

      console.log('📥 Received report data:', { location, description, category, imageUrl });

      if (!location || !Array.isArray(location) || location.length !== 2) {
        console.error('❌ Invalid location:', location);
        return res.status(400).json({
          message: 'Invalid location format. Expected [latitude, longitude]',
          received: location
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
          userAgent: req.headers['user-agent'] || 'Unknown',
          ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown'
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
      res.status(500).json({
        message: 'Error submitting report. Please try again later.',
        error: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
