# 🔐 Security Setup Guide

## ⚠️ CRITICAL: New Firebase Service Account Required

**Your previous Firebase credentials have been compromised and removed from the project.**

### 1. Create New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or create a new project
3. Name it something like `park-ride-delhi-secure`
4. Enable Google Analytics (optional)

### 2. Generate New Service Account

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. Rename it to `serviceAccountKey.json`
6. Replace the template file in your project

### 3. Enable Required Services

1. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"
   - Select region closest to your users

2. **Authentication** (if using auth features):
   - Go to Authentication
   - Click "Get started"
   - Enable Email/Password provider

### 4. Update Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reports collection - allow read for all, write with validation
    match /reports/{document} {
      allow read: if true;
      allow create: if request.auth != null 
        || (resource == null && isValidReport(request.resource.data));
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Users collection - only authenticated users can access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Helper function to validate report data
    function isValidReport(data) {
      return data.keys().hasAll(['location', 'description', 'category', 'timestamp'])
        && data.description is string
        && data.description.size() >= 10
        && data.description.size() <= 1000
        && data.category in ['parking', 'traffic', 'facility', 'metro', 'safety', 'general']
        && data.location is list
        && data.location.size() == 2;
    }
  }
}
```

### 5. Secure Your Environment

1. **Never commit these files:**
   - `serviceAccountKey.json`
   - `.env`
   - Any file with API keys

2. **Generate strong secrets:**
   ```bash
   # Generate JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Use environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your real values
   - Never commit `.env` to Git

### 6. Production Deployment

**For Vercel/Production:**

1. **Environment Variables** (in Vercel dashboard):
   ```
   NODE_ENV=production
   JWT_SECRET=your_secure_jwt_secret
   FIREBASE_PROJECT_ID=your_new_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY=your_private_key_with_escaped_newlines
   ```

2. **Upload Service Account** (alternative):
   - In Vercel, add environment variable `FIREBASE_SERVICE_ACCOUNT`
   - Paste entire contents of serviceAccountKey.json as the value

### 7. Verify Security

✅ **Checklist:**
- [ ] New Firebase project created
- [ ] Old credentials revoked/deleted
- [ ] New serviceAccountKey.json downloaded
- [ ] Strong JWT secret generated  
- [ ] .env file not committed to Git
- [ ] Firestore security rules updated
- [ ] Production environment variables set

### 8. Test the Setup

```bash
# Test Firebase connection
npm start

# Check logs for:
✅ "Firebase Admin initialized successfully"
❌ "Firebase initialization failed" (fix configuration)
```

## 🚨 Security Best Practices

### Immediate Actions:
1. **Revoke old credentials** in Firebase Console
2. **Change all API keys** that were in the old repository
3. **Generate new JWT secrets** for all environments
4. **Review Git history** for any other exposed secrets

### Ongoing Security:
1. **Regular key rotation** (every 90 days)
2. **Monitor Firebase usage** for unusual activity
3. **Use least privilege** for service accounts
4. **Enable Firebase Security Center**
5. **Set up monitoring and alerts**

## 📞 Emergency Response

If you suspect credentials are compromised:

1. **Immediately revoke** all Firebase service account keys
2. **Regenerate all API keys** 
3. **Change JWT secrets** in all environments
4. **Review Firebase logs** for unauthorized access
5. **Check billing** for unusual usage spikes

---

**🔒 Remember: Security is an ongoing process, not a one-time setup!**
