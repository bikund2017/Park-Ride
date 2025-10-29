# Vercel Deployment Fix - Complete Guide

## 🎯 Problem Fixed
The previous deployment was crashing because `server.js` was trying to run as a long-running server with Socket.IO, which doesn't work on Vercel's serverless platform.

## ✅ Solution Implemented
Created a proper serverless API structure in `/api/` directory:
- `api/index.js` - Main API handler for all endpoints
- `api/transit-data.js` - Transit and parking data endpoint

## 📋 Required Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

### Firebase Configuration (REQUIRED)
```bash
FIREBASE_PROJECT_ID=park-ride
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@park-ride.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### CORS Configuration (REQUIRED)
```bash
ALLOWED_ORIGINS=https://park-ride-new1.vercel.app
```
**Important**: Update this with your actual Vercel deployment URL!

### Optional (but recommended)
```bash
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
DELHI_TRANSIT_API_KEY=mmmMLFBaiXLuPKuiDIwJuofBcVTSG6Qt
```

## 🚀 Deployment Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Fix: Convert to Vercel serverless architecture"
git push origin master
```

### 2. Set Environment Variables in Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable above
5. Select "Production" environment
6. Click "Save"

### 3. Redeploy
Option A - Automatic (if GitHub integration is set up):
- Push will trigger automatic deployment

Option B - Manual:
```bash
vercel --prod
```

## 📝 Key Changes Made

### 1. New API Structure
```
api/
├── index.js          # Main API with all endpoints
└── transit-data.js   # Transit and parking data
```

### 2. Updated vercel.json
- Removed `server.js` build
- Routes all `/api/*` requests to `/api/index.js`
- Serves static files from `client/dist`

### 3. Removed Socket.IO
- Socket.IO doesn't work on Vercel serverless
- Client now polls `/api/transit-data` endpoint instead
- Update client code to use polling instead of WebSocket

## 🔧 Client-Side Changes Needed

Update your React app to use HTTP polling instead of Socket.IO:

```javascript
// Remove socket.io-client connection
// Add HTTP polling instead

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/transit-data');
      const { parkingLots, transitVehicles } = response.data;
      // Update your state
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Initial fetch
  fetchData();

  // Poll every 10 seconds
  const interval = setInterval(fetchData, 10000);

  return () => clearInterval(interval);
}, []);
```

## 🧪 Testing

### Test API Health
```bash
curl https://your-app.vercel.app/api/health
```

### Test Transit Data
```bash
curl https://your-app.vercel.app/api/transit-data
```

### Test Reports
```bash
curl https://your-app.vercel.app/api/reports
```

## ⚠️ Important Notes

1. **CORS**: Make sure `ALLOWED_ORIGINS` matches your exact Vercel URL
2. **Firebase Key**: The private key must include `\n` for newlines
3. **No Socket.IO**: Real-time updates now use polling (10-second intervals)
4. **Cold Starts**: First request may be slow (serverless cold start)
5. **Timeouts**: Vercel has a 10-second timeout for serverless functions

## 🐛 Troubleshooting

### 500 Error - FUNCTION_INVOCATION_FAILED
- Check environment variables are set correctly
- Verify Firebase credentials
- Check Vercel function logs

### CORS Errors
- Verify `ALLOWED_ORIGINS` environment variable
- Check it matches your deployment URL exactly (https://...)
- Ensure no trailing slashes

### Firebase Errors
- Verify all three Firebase environment variables are set
- Check the private key format (must have `\n` for newlines)
- Ensure Firebase project exists

## 📊 Monitor Deployment

View logs in Vercel Dashboard:
1. Go to your project
2. Click on the deployment
3. Click "Functions" tab
4. View logs for each API call

## 🎉 Success Indicators

✅ Deployment completes without errors
✅ `/api/health` returns 200 OK
✅ `/api/transit-data` returns parking and transit data
✅ Frontend loads without CORS errors
✅ Can submit and view reports

## 📞 Need Help?

Check Vercel logs for specific error messages:
- Deployment → Functions → View Logs
- Look for the specific error message
- Most issues are environment variable related
