import admin from 'firebase-admin';

// Initialize Firebase
let db;

try {
  // Check if already initialized
  if (admin.apps.length === 0) {
    // Use environment variables (required for Vercel)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // Handle various formats of private key
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      // Remove surrounding quotes if they exist
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      if (privateKey.startsWith('\'') && privateKey.endsWith('\'')) {
        privateKey = privateKey.slice(1, -1);
      }

      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });
      console.log('✓ Firebase initialized with environment variables');
    } else {
      console.log('⚠ Firebase environment variables not found');
      throw new Error('Missing Firebase credentials');
    }
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
