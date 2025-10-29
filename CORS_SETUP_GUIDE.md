# How to Set ALLOWED_ORIGINS in Vercel

## Quick Guide

### Step 1: Deploy First, Get URL Later
```bash
# Deploy to Vercel first
vercel --prod
# OR use GitHub integration
```

### Step 2: Find Your Vercel App URL
After deployment, Vercel will show you the URL:
```
✅ Deployed to https://park-ride-delhi-bikund2017.vercel.app
```

### Step 3: Set Environment Variable

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project

2. **Navigate to Settings**
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

3. **Add ALLOWED_ORIGINS Variable**
   ```
   Key: ALLOWED_ORIGINS
   Value: https://your-actual-vercel-url.vercel.app
   Environment: Production
   ```

4. **Save and Redeploy**
   - Click "Save"
   - Go to "Deployments" tab
   - Click "Redeploy" on latest deployment

## Detailed Instructions

### For Your Project Specifically:

1. **Your app will likely be deployed to:**
   ```
   https://park-ride-[random-string].vercel.app
   OR
   https://park-ride-delhi-bikund2017.vercel.app
   ```

2. **Set the environment variable exactly as:**
   ```
   ALLOWED_ORIGINS=https://your-actual-deployed-url.vercel.app
   ```

### Multiple Origins (if needed):
```
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

## Why This is Important

Without proper CORS configuration:
- ❌ Frontend can't communicate with backend
- ❌ API calls will fail with CORS errors
- ❌ WebSocket connections won't work
- ❌ Real-time features won't function

With proper CORS configuration:
- ✅ Frontend and backend communicate seamlessly
- ✅ All API calls work correctly
- ✅ WebSocket connections established
- ✅ Real-time transit updates work

## Common Mistakes to Avoid

1. **Don't use localhost in production:**
   ```
   ❌ ALLOWED_ORIGINS=http://localhost:3000
   ✅ ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

2. **Don't forget HTTPS:**
   ```
   ❌ ALLOWED_ORIGINS=http://your-app.vercel.app
   ✅ ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

3. **Match the exact URL:**
   ```
   ❌ ALLOWED_ORIGINS=https://your-app-wrong.vercel.app
   ✅ ALLOWED_ORIGINS=https://your-app-correct.vercel.app
   ```

## Testing CORS Configuration

After setting `ALLOWED_ORIGINS`:

1. **Open browser console** on your deployed app
2. **Check for CORS errors** (should be none)
3. **Test API endpoints:**
   ```javascript
   fetch('/api/health')
     .then(response => response.json())
     .then(data => console.log('API working:', data))
   ```

## Troubleshooting

### If you see CORS errors:
1. Check the exact URL in browser address bar
2. Verify `ALLOWED_ORIGINS` matches exactly
3. Ensure you redeployed after setting variable
4. Check browser console for specific error message

### Example error and fix:
```
❌ Error: "Access to fetch at 'https://your-app.vercel.app/api/health' 
   from origin 'https://your-app.vercel.app' has been blocked by CORS"

✅ Fix: Set ALLOWED_ORIGINS=https://your-app.vercel.app
```
