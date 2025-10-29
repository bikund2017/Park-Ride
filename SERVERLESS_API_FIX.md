# Vercel Serverless Functions - Final Fix

## 🎯 Problem Solved

The previous API structure used a single Express app (`api/index.js`) which doesn't work with Vercel's serverless architecture. Each API endpoint needs to be a separate serverless function.

## ✅ New Serverless API Structure

```
api/
├── health.js              # GET /api/health
├── transit-data.js        # GET /api/transit-data
├── reports.js             # GET /api/reports
├── report.js              # POST /api/report
├── favorites.js           # GET/POST /api/favorites
└── favorites/
    └── delete.js          # DELETE /api/favorites/delete
```

## 📋 API Endpoints

### Health Check
```bash
GET /api/health
```
Returns server status and configuration info.

### Transit Data (for Vercel polling)
```bash
GET /api/transit-data
```
Returns `{ parkingLots, transitVehicles, timestamp, dataMode }`

### Reports
```bash
# Get all reports
GET /api/reports?category=<category>&search=<query>&limit=<number>

# Submit a report
POST /api/report
Body: { location: [lat, lng], description: string, category: string, imageUrl?: string }
```

### Favorites
```bash
# Get user favorites
GET /api/favorites?userId=<userId>

# Add to favorites  
POST /api/favorites
Body: { parkingLotId: number, userId: string, parkingLot?: object }

# Remove from favorites
DELETE /api/favorites/delete?userId=<userId>&parkingLotId=<id>
```

## 🔧 Client Updates Made

### App.jsx Changes

**Before:**
```javascript
axios.get('/api/favorites/anonymous')
axios.delete(`/api/favorites/anonymous/${parkingLotId}`)
```

**After:**
```javascript
axios.get('/api/favorites?userId=anonymous')
axios.delete(`/api/favorites/delete?userId=anonymous&parkingLotId=${parkingLotId}`)
```

## 📝 Updated vercel.json

Simplified configuration - Vercel automatically routes `/api/*` to corresponding files:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "client/dist"
      }
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**How it works:**
- `/api/health` → automatically routes to `api/health.js`
- `/api/reports` → automatically routes to `api/reports.js`
- `/api/favorites/delete` → automatically routes to `api/favorites/delete.js`
- Everything else → `/index.html` (React Router handles client-side routing)

## 🚀 Deployment Steps

### 1. Commit All Changes
```bash
git add .
git commit -m "Fix: Restructure API for Vercel serverless functions"
git push origin master
```

### 2. Set Environment Variables in Vercel

Go to https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
```bash
FIREBASE_PROJECT_ID=park-ride
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@park-ride.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
ALLOWED_ORIGINS=https://park-ride-new1.vercel.app
```

**Optional:**
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
DELHI_TRANSIT_API_KEY=mmmMLFBaiXLuPKuiDIwJuofBcVTSG6Qt
```

### 3. Deploy
- Push triggers automatic deployment (if GitHub integration enabled)
- OR run: `vercel --prod`

### 4. Update CORS After Deployment
Get your actual deployment URL and update:
```bash
ALLOWED_ORIGINS=https://your-actual-url.vercel.app
```

Then redeploy.

## 🧪 Testing Commands

Test each endpoint after deployment:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Transit data
curl https://your-app.vercel.app/api/transit-data

# Get reports
curl https://your-app.vercel.app/api/reports

# Get favorites
curl "https://your-app.vercel.app/api/favorites?userId=anonymous"
```

## ⚡ Key Differences from Previous Version

| Aspect | Old (Broken) | New (Fixed) |
|--------|-------------|-------------|
| **Structure** | Single Express app | Individual serverless functions |
| **Exports** | `export default app` | `export default async function handler(req, res)` |
| **Routing** | Express routes | File-based routing |
| **Middleware** | Express middleware | Manual CORS in each function |
| **Parameters** | Express params (`:id`) | Query parameters (`?id=value`) |

## 🔍 Why This Works

### Vercel Serverless Architecture

1. **File-based routing**: Each file in `/api/` becomes an endpoint
2. **Function signature**: Must export `async function handler(req, res)`
3. **Stateless**: Each request is independent (no shared state)
4. **Cold starts**: First request may be slow
5. **Timeouts**: 10-second max execution time

### Example Function Structure

```javascript
export default async function handler(req, res) {
  // 1. CORS headers
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  
  // 2. Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 3. Handle actual request
  if (req.method === 'GET') {
    // Your logic here
    res.status(200).json({ data: 'your data' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

## ✅ Success Indicators

After deployment, you should see:

- ✅ `/api/health` returns status: operational
- ✅ `/api/transit-data` returns parking and transit data
- ✅ `/api/reports` returns reports array
- ✅ `/api/favorites?userId=anonymous` returns favorites array
- ✅ Frontend loads without CORS errors
- ✅ Client-side routing works (can navigate to /about, /reports, etc.)
- ✅ No `FUNCTION_INVOCATION_FAILED` errors

## 🐛 Troubleshooting

### Still getting FUNCTION_INVOCATION_FAILED?

**Check:**
1. Environment variables are set in Vercel
2. Firebase credentials are correct (check format of FIREBASE_PRIVATE_KEY)
3. Each API file exports `handler` function
4. CORS origin matches your deployment URL

**View logs:**
- Vercel Dashboard → Project → Deployments → Select deployment → Functions
- Look for specific error messages

### CORS errors?

**Fix:**
- Update `ALLOWED_ORIGINS` environment variable
- Must match exact deployment URL (case-sensitive)
- Include `https://` prefix
- No trailing slashes

### Firebase errors?

**Fix:**
- Verify all three Firebase env vars are set
- Check private key has `\n` for newlines (not actual newlines)
- Format: `"-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"`

## 📊 Performance

| Metric | Expected |
|--------|----------|
| Cold Start | 1-3 seconds |
| Warm Response | < 500ms |
| Function Timeout | 10 seconds max |
| Memory | 1024 MB default |

## 🎉 Summary

**What Changed:**
- ✅ Converted from Express app to individual serverless functions
- ✅ Updated all API calls to use query parameters
- ✅ Simplified vercel.json configuration
- ✅ Added proper CORS to each function
- ✅ Removed unused index.js

**What to Do:**
1. Commit and push changes
2. Set environment variables in Vercel
3. Wait for deployment
4. Update ALLOWED_ORIGINS
5. Test all endpoints
6. Celebrate! 🎉

---

**Last Updated:** October 29, 2025  
**Status:** ✅ Ready for Deployment
