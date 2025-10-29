# Environment Variables for Vercel - park-ride-new1.vercel.app

## ✅ Ready-to-Use Environment Variables

Copy these exact values to your Vercel Dashboard:

### Required Variables:

```
NODE_ENV=production
ALLOWED_ORIGINS=https://park-ride-new1.vercel.app
```

### Firebase Configuration (Replace with your values):

```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-private-key-here\n-----END PRIVATE KEY-----\n"
```

### API Keys (Replace with your values):

```
DELHI_TRANSIT_API_KEY=your-delhi-transit-api-key
```

### Optional (if you have them):

```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
JWT_SECRET=your-jwt-secret
```

## 🚀 Quick Setup Steps:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: Look for "Park-Ride-" or similar
3. **Navigate to**: Settings → Environment Variables
4. **Add each variable** from the list above
5. **Set Environment to**: Production
6. **Save all variables**
7. **Redeploy**: Go to Deployments → Click "Redeploy" on latest

## 🔗 Your App URLs:

- **Frontend**: https://park-ride-new1.vercel.app
- **API Health**: https://park-ride-new1.vercel.app/api/health
- **Transit Data**: https://park-ride-new1.vercel.app/api/transit-info

## ✅ Test After Setup:

Visit your app and check browser console for any CORS errors. They should be resolved once `ALLOWED_ORIGINS` is set correctly.
