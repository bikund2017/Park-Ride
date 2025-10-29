# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### Project Configuration
- [x] `vercel.json` configuration file created
- [x] `package.json` build scripts configured
- [x] Vite configuration optimized for production
- [x] `.vercelignore` file created
- [x] `.gitignore` properly configured

### Environment Setup
- [ ] Firebase project created and configured
- [ ] Service account key downloaded
- [ ] Delhi Transit API keys obtained
- [ ] Environment variables prepared

### Code Quality
- [x] ESLint errors resolved
- [x] Build process tested locally
- [x] All dependencies properly listed
- [x] Production optimizations applied

## 🚀 Deployment Steps

### 1. Repository Setup
```bash
# Ensure your code is committed and pushed
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Vercel Project Creation
- [ ] Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Vercel auto-detects configuration

### 3. Environment Variables (Critical!)
Set these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- [ ] `NODE_ENV=production`
- [ ] `FIREBASE_PROJECT_ID=your-project-id`
- [ ] `FIREBASE_CLIENT_EMAIL=your-service-account-email`
- [ ] `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."`
- [ ] `DELHI_TRANSIT_API_KEY=your-api-key`

**Important:**
- [ ] `ALLOWED_ORIGINS=https://your-app.vercel.app`

> **How to set ALLOWED_ORIGINS:**
> 1. Deploy your app first to get the Vercel URL
> 2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
> 3. Add: `ALLOWED_ORIGINS` = `https://your-actual-vercel-url.vercel.app`
> 4. Click "Save" and redeploy if needed
> 
> **Example:** If your app deploys to `https://park-ride-delhi.vercel.app`, 
> then set `ALLOWED_ORIGINS=https://park-ride-delhi.vercel.app`

**Optional:**
- [ ] `CLOUDINARY_CLOUD_NAME=your-cloud-name`
- [ ] `CLOUDINARY_API_KEY=your-api-key`
- [ ] `CLOUDINARY_API_SECRET=your-api-secret`
- [ ] `JWT_SECRET=your-jwt-secret`

### 4. Deploy
- [ ] Automatic deployment triggered
- [ ] Monitor build logs for errors
- [ ] Wait for deployment completion

## 🔍 Post-Deployment Verification

### Frontend Testing
- [ ] Visit `https://your-app.vercel.app`
- [ ] Check if the homepage loads correctly
- [ ] Verify map rendering
- [ ] Test navigation between pages

### Backend API Testing
- [ ] Test health endpoint: `/api/health`
- [ ] Test transit data: `/api/transit-info`
- [ ] Test reports endpoint: `/api/reports`
- [ ] Verify WebSocket connectivity

### Integration Testing
- [ ] Real-time data updates working
- [ ] Form submissions working
- [ ] File uploads working (if applicable)
- [ ] Firebase authentication working

## 🛠️ Troubleshooting

### Common Build Issues
- **Build fails**: Check environment variables
- **API errors**: Verify Firebase credentials
- **CORS errors**: Update `ALLOWED_ORIGINS`
- **Module errors**: Check dependency versions

### Performance Checks
- [ ] Page load speed acceptable
- [ ] API response times reasonable
- [ ] WebSocket connections stable
- [ ] No console errors in browser

## 📝 Notes

- **Domain**: Your app will be at `https://your-app-name.vercel.app`
- **Automatic deployments**: Enabled for main branch
- **Build time**: Approximately 2-5 minutes
- **Function timeout**: 30 seconds (configured)

## 🎉 Success Criteria

✅ **Deployment successful when:**
- Frontend loads without errors
- API endpoints respond correctly
- Real-time features work
- No critical console errors
- Environment variables properly set

---

**Next Steps After Deployment:**
1. Test all features thoroughly
2. Monitor for any runtime errors
3. Set up custom domain (optional)
4. Configure monitoring/analytics
5. Plan for scaling if needed
