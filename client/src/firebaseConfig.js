import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCxQ0wdEoOeIH_8QZffktcI5OktHx9kJRE",
  authDomain: "park-ride.firebaseapp.com",
  projectId: "park-ride",
  storageBucket: "park-ride.firebasestorage.app",
  messagingSenderId: "369285801859",
  appId: "1:369285801859:web:6d86d60a6ae3a04d83f8b6",
  measurementId: "G-D2CZMV0C5B"
};

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export default app;
