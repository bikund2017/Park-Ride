import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBON5_Y7Z1aMxKQqJ9X5QmK8vZ_fwH8yXQ", // This is safe to expose (client-side)
  authDomain: "park-ride.firebaseapp.com",
  projectId: "park-ride",
  storageBucket: "park-ride.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
