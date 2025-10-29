import admin from 'firebase-admin';

// Initialize Firebase
let db;

try {
  // Check if already initialized
  if (admin.apps.length === 0) {
    // Use environment variables (required for Vercel)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // Handle both escaped and non-escaped newlines in private key
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      // If the key doesn't contain actual newlines, replace \n with newlines
      if (!privateKey.includes('\n') && privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
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
