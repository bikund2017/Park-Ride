import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase
let db;

try {
  // Try to use service account file first
  try {
    const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    
    console.log('✓ Firebase initialized with service account');
  } catch (fileError) {
    console.log('No service account file found, using default app');
    admin.initializeApp();
  }
  
  db = admin.firestore();
  console.log('✓ Firestore initialized');
} catch (error) {
  console.error('✗ Firebase initialization failed:', error.message);
  console.log('Note: Using mock database for reports');
  
  // Create a mock db object to prevent crashes
  db = {
    collection: () => ({
      add: async (data) => {
        console.log('Mock report saved:', data);
        return { id: 'mock-' + Date.now() };
      },
      where: () => ({
        limit: () => ({
          get: async () => ({
            empty: true,
            docs: []
          })
        })
      }),
      orderBy: function() {
        return {
          limit: () => ({
            get: async () => ({
              empty: true,
              docs: []
            })
          })
        };
      }
    })
  };
}

export { admin, db };
