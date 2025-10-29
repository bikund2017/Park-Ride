# Firebase Authentication Setup Guide

## 🔥 Firebase Console Configuration

### Step 1: Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **park-ride** project
3. Click on **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. If you haven't added a web app yet:
   - Click on **</>** (Web icon)
   - Register your app with a nickname (e.g., "Park-Ride-Web")
6. Copy your Firebase configuration object

### Step 2: Update firebaseConfig.js

Replace the placeholder config in `client/src/firebaseConfig.js` with your actual Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 3: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click on **Get Started** (if first time)
3. Go to **Sign-in method** tab

#### Enable Email/Password:
1. Click on **Email/Password**
2. Toggle **Enable**
3. Click **Save**

#### Enable Google Sign-In (Optional but Recommended):
1. Click on **Google**
2. Toggle **Enable**
3. Enter **Project support email** (your email)
4. Click **Save**

### Step 4: Add Authorized Domains

1. Still in **Authentication > Settings** tab
2. Scroll to **Authorized domains**
3. Add your domains:
   - `localhost` (for local development) - should already be there
   - Your Vercel domain: `your-app-name.vercel.app`
   - Click **Add domain** for each

### Step 5: Update Environment Variables (for Vercel)

If using Firebase config from environment variables:

1. Go to your Vercel project settings
2. Add these environment variables:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. Update `client/src/firebaseConfig.js` to use environment variables:
   ```javascript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID
   };
   ```

## 🧪 Testing Locally

### 1. Start the Backend Server

```bash
cd /home/bikund2017/Park-Ride-
npm run dev
```

Backend should run on `http://localhost:3001`

### 2. Start the Frontend Development Server

```bash
cd /home/bikund2017/Park-Ride-/client
npm run dev
```

Frontend should run on `http://localhost:5173`

### 3. Test Authentication Flow

1. **Visit the app**: Open `http://localhost:5173`
   - Should redirect to `/login` (no user logged in)

2. **Test Signup**:
   - Click "Sign up here"
   - Fill in: Name, Email, Password, Confirm Password
   - Click "Sign Up"
   - Should redirect to home page after successful signup

3. **Test Google Sign-In** (if enabled):
   - Click "Sign in with Google"
   - Select your Google account
   - Should redirect to home page

4. **Verify User Session**:
   - Check top-right corner of header
   - Should see your name/email
   - Should see "🚪 Logout" button

5. **Test User-Specific Data**:
   - Add a favorite parking lot
   - Submit a report
   - These should now be linked to your user ID

6. **Test Logout**:
   - Click "🚪 Logout" button
   - Should redirect to `/login`

7. **Test Login**:
   - Enter your email and password
   - Click "Sign In"
   - Should redirect to home page
   - Your favorites and reports should still be there

8. **Test Session Persistence**:
   - While logged in, refresh the page
   - Should remain logged in (not redirect to /login)

## 🚀 Deploying to Vercel

### 1. Push Changes to GitHub

```bash
git push origin master
```

### 2. Vercel Auto-Deploy

Vercel will automatically detect the push and start deployment.

### 3. Verify Deployment

1. Visit your Vercel app URL
2. Should redirect to `/login`
3. Test signup/login
4. Test all authentication features

### 4. Common Issues

**Issue**: "Firebase: Error (auth/unauthorized-domain)"
- **Fix**: Add your Vercel domain to Authorized domains in Firebase Console

**Issue**: Can't login after deployment
- **Fix**: Check that Firebase config environment variables are set correctly in Vercel

**Issue**: Google Sign-In not working
- **Fix**: Make sure Google OAuth is enabled in Firebase Console

## 📊 What Changed

### Files Created:
1. `client/src/firebaseConfig.js` - Firebase client configuration
2. `client/src/contexts/AuthContext.jsx` - Authentication state management
3. `client/src/pages/Login.jsx` - Login page
4. `client/src/pages/Signup.jsx` - Signup page
5. `client/src/pages/Auth.css` - Authentication styling
6. `client/src/components/ProtectedRoute.jsx` - Route guard

### Files Modified:
1. `client/package.json` - Added firebase@^10.7.1
2. `client/src/main.jsx` - Wrapped app with AuthProvider
3. `client/src/App.jsx` - Added auth routes, replaced 'anonymous' with user ID
4. `client/src/components/Header.jsx` - Added user profile and logout
5. `client/src/components/Header.css` - Added user profile styling

### Routes:
- `/login` - Public route (Login page)
- `/signup` - Public route (Signup page)
- `/*` - Protected routes (requires authentication)
  - `/` - Home page
  - `/reports` - Reports page
  - `/favorites` - Favorites page
  - `/about` - About page

## ✅ Verification Checklist

- [ ] Firebase config updated with actual credentials
- [ ] Email/Password authentication enabled in Firebase Console
- [ ] Google Sign-In enabled in Firebase Console (optional)
- [ ] Authorized domains added (localhost, vercel.app)
- [ ] Backend server running (`npm run dev`)
- [ ] Frontend server running (`cd client && npm run dev`)
- [ ] Can sign up with email/password
- [ ] Can sign in with email/password
- [ ] Can sign in with Google (if enabled)
- [ ] User profile displays in header
- [ ] Logout button works
- [ ] Session persists on page refresh
- [ ] Favorites are user-specific
- [ ] Reports are user-specific
- [ ] Protected routes redirect to /login when not authenticated
- [ ] Changes pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Production authentication working

## 🎉 You're All Set!

Your Park & Ride+ app now has complete Firebase Authentication with:
- ✅ Email/password sign-up and login
- ✅ Google OAuth (if enabled)
- ✅ Protected routes
- ✅ User-specific data (favorites, reports)
- ✅ Persistent sessions
- ✅ Professional UI
- ✅ Logout functionality

For issues or questions, check the Firebase Console logs or browser console for error messages.
