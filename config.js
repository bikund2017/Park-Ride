import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3002,
  
  delhiTransit: {
    apiKey: process.env.DELHI_TRANSIT_API_KEY,
    baseUrl: 'https://otd.delhi.gov.in/api/realtime',
  },
  
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : 
      ['http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  
  firebase: process.env.FIREBASE_PROJECT_ID ? {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  } : null
};

if (!config.delhiTransit.apiKey) {
  console.warn('Warning: DELHI_TRANSIT_API_KEY is not set. Some features may be limited.');
}

export default config;
