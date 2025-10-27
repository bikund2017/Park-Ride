# 🚀 Vercel Deployment Guide
## Park & Ride+ Delhi NCR

This guide will help you deploy your application to Vercel.

---

## 📋 **Prerequisites**

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: For code repository
3. **Environment Variables**: Prepare your API keys

---

## 🔧 **Step 1: Prepare Your Repository**

### 1.1 Initialize Git (if not already done)
```bash
cd /home/bikund2017/server
git init
git add .
git commit -m "Initial commit - Park & Ride+ Delhi NCR"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Create a new repository named `park-and-ride-delhi-ncr`
3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/park-and-ride-delhi-ncr.git
git branch -M main
git push -u origin main
```

---

## 🌐 **Step 2: Deploy to Vercel**

### 2.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `park-and-ride-delhi-ncr`

### 2.2 Configure Build Settings
- **Framework Preset**: Other
- **Root Directory**: `/` (root)
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `client/build`
- **Install Command**: `npm install`

### 2.3 Environment Variables
Add these in Vercel Dashboard > Settings > Environment Variables:

#### Required Variables:
```
NODE_ENV=production
PORT=3002
JWT_SECRET=your_secure_jwt_secret_here
```

#### API Keys (Optional - for real data):
```
DELHI_TRANSIT_API_KEY=your_delhi_transit_api_key
DMRC_API_KEY=your_dmrc_api_key
DTC_API_KEY=your_dtc_api_key
IRCTC_API_KEY=your_irctc_api_key
RAPIDAPI_KEY=your_rapidapi_key
```

#### Cloudinary (for image uploads):
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Firebase (if using env vars):
```
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

#### CORS Configuration:
```
ALLOWED_ORIGINS=https://your-app-name.vercel.app
```

---

## 🔑 **Step 3: Generate JWT Secret**

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET` in Vercel.

---

## 📁 **Step 4: Firebase Setup**

### 4.1 Upload Service Account Key
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add `FIREBASE_SERVICE_ACCOUNT` as a variable
3. Copy the entire contents of `serviceAccountKey.json`
4. Paste it as the value

### 4.2 Alternative: Use Environment Variables
Instead of the service account file, you can use individual Firebase environment variables as listed above.

---

## 🚀 **Step 5: Deploy**

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at: `https://your-app-name.vercel.app`

---

## ✅ **Step 6: Verify Deployment**

### 6.1 Test API Endpoints
- Health Check: `https://your-app.vercel.app/api/health`
- Reports API: `https://your-app.vercel.app/api/reports`
- Transit Info: `https://your-app.vercel.app/api/transit-info`

### 6.2 Test Frontend
- Main App: `https://your-app.vercel.app`
- Check if map loads correctly
- Test report submission
- Verify real-time updates

---

## 🔧 **Troubleshooting**

### Common Issues:

#### 1. Build Fails
- Check if all dependencies are in `package.json`
- Ensure `client/build` directory exists
- Run `npm run build` locally first

#### 2. API Routes Not Working
- Verify `vercel.json` configuration
- Check environment variables
- Ensure server.js is in root directory

#### 3. Firebase Connection Issues
- Verify service account key is correct
- Check Firebase project ID
- Ensure Firestore is enabled

#### 4. CORS Errors
- Update `ALLOWED_ORIGINS` with your Vercel domain
- Check CORS configuration in `server.js`

#### 5. WebSocket Issues
- Vercel has limitations with WebSockets
- Consider using Vercel's serverless functions
- Or use a separate WebSocket service

---

## 📊 **Performance Optimization**

### 1. Enable Caching
- Add Redis URL for caching
- Configure CDN settings in Vercel

### 2. Image Optimization
- Use Vercel's built-in image optimization
- Configure Cloudinary for better performance

### 3. Database Optimization
- Add Firestore indexes
- Use pagination for large datasets

---

## 🔄 **Continuous Deployment**

Once set up, Vercel will automatically deploy when you push to your main branch:

```bash
git add .
git commit -m "Update application"
git push origin main
```

---

## 📱 **Mobile Optimization**

Your app is already mobile-responsive, but you can further optimize:

1. **PWA Features**: Add service worker
2. **Offline Support**: Cache static assets
3. **Push Notifications**: For real-time updates

---

## 🎯 **Production Checklist**

- [ ] Environment variables configured
- [ ] Firebase service account uploaded
- [ ] JWT secret generated
- [ ] CORS origins updated
- [ ] API endpoints tested
- [ ] Frontend loads correctly
- [ ] Real-time features working
- [ ] Mobile responsive
- [ ] Error handling working
- [ ] Performance optimized

---

## 🆘 **Support**

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check browser console for errors
5. Review server logs in Vercel dashboard

---

## 🎉 **Success!**

Once deployed, your Park & Ride+ Delhi NCR application will be live and accessible worldwide!

**Your app URL**: `https://your-app-name.vercel.app`

---

**Last Updated**: October 2025  
**Version**: 1.0.0
