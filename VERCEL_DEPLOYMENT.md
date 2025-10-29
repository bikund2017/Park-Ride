# Vercel Deployment Guide

This guide will help you deploy your Park & Ride Delhi NCR application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Firebase Project**: Set up Firebase project for backend services
4. **API Keys**: Obtain necessary API keys for Delhi transit services

## Step 1: Prepare Your Project

The project is already configured with:
- ✅ `vercel.json` configuration file
- ✅ Optimized Vite build configuration
- ✅ Production-ready package.json scripts
- ✅ Environment variables template

## Step 2: Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

### Method 2: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

### Required Variables:

```
NODE_ENV=production
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-private-key-here\n-----END PRIVATE KEY-----\n"
DELHI_TRANSIT_API_KEY=your-delhi-transit-api-key
```

### Important for Production:

```
ALLOWED_ORIGINS=https://your-app-name.vercel.app
```

⚠️ **Replace `your-app-name.vercel.app` with your actual Vercel app URL**

### Optional Variables:

```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
JWT_SECRET=your-jwt-secret
```

## Step 4: Build and Deploy

1. **Automatic Deployment**: Vercel will automatically build and deploy when you push to your main branch
2. **Manual Deployment**: Use `vercel --prod` command
3. **Build Commands**: 
   - Root: `vercel-build` (builds the frontend)
   - Backend: Serverless function deployment
   - Frontend: Static site generation

## Step 5: Verify Deployment

After deployment, test these endpoints:

1. **Frontend**: `https://your-app.vercel.app`
2. **API Health**: `https://your-app.vercel.app/api/health`
3. **Transit Data**: `https://your-app.vercel.app/api/transit-info`
4. **Reports**: `https://your-app.vercel.app/api/reports`

## Step 6: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check environment variables are set correctly
   - Ensure all dependencies are in package.json
   - Review build logs in Vercel dashboard

2. **API Errors**:
   - Verify Firebase credentials
   - Check CORS configuration
   - Ensure environment variables are properly escaped

3. **Frontend Issues**:
   - Check that API calls use relative paths (`/api/...`)
   - Verify Vite build configuration
   - Check browser console for errors

### Environment Variable Tips:

- **Firebase Private Key**: Must be properly escaped with `\n` for newlines
- **CORS Origins**: Must match your exact Vercel app URL
- **API Keys**: Keep them secure and never expose in frontend code

## Project Structure on Vercel

```
Vercel Deployment:
├── API Routes (/api/*) → server.js (Serverless Functions)
├── Static Assets → client/dist (Static Site)
├── Socket.IO → server.js (Serverless Functions)
└── File Uploads → server.js (Serverless Functions)
```

## Performance Optimization

The configuration includes:
- ✅ Code splitting for better loading
- ✅ Optimized chunk sizes
- ✅ Production build optimizations
- ✅ Serverless function optimization

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review environment variables
3. Test API endpoints individually
4. Check Firebase console for errors

---

**Your application will be available at**: `https://your-app-name.vercel.app`
