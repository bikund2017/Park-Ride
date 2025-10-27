import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const config = {
  // Server configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3002,
  
  // API configuration
  delhiTransit: {
    apiKey: process.env.DELHI_TRANSIT_API_KEY || 'mmmMLFBaiXLuPKuiDIwJuofBcVTSG6Qt',
    baseUrl: 'https://otd.delhi.gov.in/api/realtime',
  },
  
  // CORS configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : 
      ['http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  
  // Firebase configuration (if using environment variables instead of service account file)
  firebase: process.env.FIREBASE_PROJECT_ID ? {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  } : null
};

// Validate required configuration
if (!config.delhiTransit.apiKey) {
  console.warn('Warning: DELHI_TRANSIT_API_KEY is not set. Some features may be limited.');
}

export default config;
