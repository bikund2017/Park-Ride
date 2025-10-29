# Vite + Vercel Dev + Client-Side Routing Solution

## 🎯 The Problem

When using Vite with Vercel and client-side routing (React Router), you encounter a conflict:

- **Production (Vercel)**: Needs `vercel.json` with rewrites to handle client-side routes
- **Local Dev (`vercel dev`)**: The same `vercel.json` breaks routing because it interferes with Vite's dev server

**Symptoms:**
- Direct navigation to `/about`, `/reports`, etc. works in production
- Same URLs fail locally with `vercel dev` showing 404 errors
- But works fine with `vite dev` or `npm run dev`

## ✅ The Solution

We implement a dual-configuration approach:

1. **Production**: Use `vercel.json` with proper rewrites
2. **Local Dev**: Rename to `_vercel.json` to disable it
3. **Git Hook**: Prevent accidental commits of the deletion

## 📋 Implementation (Already Done!)

### 1. Updated `vercel.json`
Changed from `routes` to `rewrites` for proper client-side routing:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Why rewrites?**
- API calls go to serverless functions
- All other requests go to `/index.html` (React app loads, router handles the rest)

### 2. Updated `.gitignore`
Added `_vercel.json` to ignore the local version:

```
# Vercel local development (renamed to avoid routing conflicts)
_vercel.json
```

### 3. Created Git Hook
The `prevent-delete.sh` script prevents accidental deletion commits:

```bash
#!/bin/bash
# Prevent deletion of vercel.json from being committed

REGEXP="^D[[:space:]]+vercel.json$"

if git diff --cached --name-status | grep -qE "$REGEXP"; then
  echo "⚠️  Preventing deletion of vercel.json from being committed"
  git reset -- vercel.json
  exit 0
fi
```

### 4. Configured Git Hook
Created symlink: `.git/hooks/pre-commit` → `prevent-delete.sh`

## 🚀 How to Use

### For Local Development with Vercel Functions

1. **Rename the config file:**
   ```bash
   mv vercel.json _vercel.json
   ```

2. **Run Vercel dev:**
   ```bash
   vercel dev
   ```

3. **Your app now works!**
   - Navigate to `http://localhost:3000`
   - Client-side routing works
   - API functions work
   - No 404 errors

### For Regular Local Development (without Vercel functions)

Just use the normal Vite dev server:
```bash
npm run dev:full  # Both client and server
# OR
cd client && npm run dev  # Just client with proxy
```

### For Deployment

**Just commit normally!** The git hook ensures `vercel.json` stays in your repo:

```bash
git add -A
git commit -m "Your commit message"
git push origin master
```

**What happens:**
- `_vercel.json` is ignored (not committed)
- `vercel.json` deletion is prevented by the hook
- Vercel deployment gets the correct `vercel.json`
- Client-side routing works in production ✅

## 🧪 Testing the Git Hook

Try this to verify it works:

```bash
# Rename for local dev
mv vercel.json _vercel.json

# Try to commit
git add -A
git status  # You'll see vercel.json as deleted

git commit -m "Test commit"
# ⚠️  Hook prevents deletion and unstages the delete

git status  # vercel.json is still deleted but NOT staged
```

## 📊 Configuration Comparison

### Local Development (`_vercel.json`)

| Feature | Status |
|---------|--------|
| Vite Dev Server | ✅ Full control |
| Client-Side Routing | ✅ Works perfectly |
| Vercel Functions | ✅ Can test with `vercel dev` |
| Hot Module Reload | ✅ Fast |

### Production Deployment (`vercel.json`)

| Feature | Status |
|---------|--------|
| Static Files | ✅ Served from `/client/dist` |
| API Routes | ✅ Serverless functions |
| Client-Side Routing | ✅ All routes → `/index.html` |
| React Router | ✅ Handles navigation |

## 🔍 How It Works

### Production (Vercel)

1. User visits `https://your-app.vercel.app/about`
2. Vercel receives request for `/about`
3. `vercel.json` rewrites it to `/index.html`
4. React app loads
5. React Router sees `/about` in URL
6. Renders About component
7. ✅ Success!

### Local with `vercel dev` (without fix)

1. User visits `http://localhost:3000/about`
2. Vercel dev receives request for `/about`
3. `vercel.json` tries to rewrite to `/index.html`
4. Conflicts with Vite dev server
5. ❌ 404 Error!

### Local with `vercel dev` (with fix)

1. Rename to `_vercel.json`
2. User visits `http://localhost:3000/about`
3. No `vercel.json` to interfere
4. Vite dev server handles routing
5. React Router works normally
6. ✅ Success!

## 📝 Development Workflow

### Scenario 1: Working on Frontend (Client-Side)
```bash
# Use regular Vite dev (faster, no need for vercel dev)
cd client
npm run dev

# Access at http://localhost:3000
# All routing works automatically
```

### Scenario 2: Testing Serverless Functions Locally
```bash
# Rename config
mv vercel.json _vercel.json

# Run Vercel dev
vercel dev

# Test your API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/transit-data

# Client-side routing also works!
```

### Scenario 3: Ready to Deploy
```bash
# Make sure vercel.json exists (not _vercel.json)
# If you renamed it, rename it back:
mv _vercel.json vercel.json

# Commit and push
git add -A
git commit -m "Your changes"
git push origin master

# Vercel automatically deploys
# The git hook ensures vercel.json is never deleted from commits
```

## 🐛 Troubleshooting

### Issue: `vercel dev` shows 404 for routes

**Solution:** Make sure you renamed `vercel.json` to `_vercel.json`
```bash
ls -la | grep vercel
# Should show: _vercel.json (not vercel.json)
```

### Issue: Git hook not working

**Solution:** Check the symlink exists and is executable
```bash
ls -la .git/hooks/pre-commit
# Should show: pre-commit -> ../../prevent-delete.sh

chmod +x prevent-delete.sh
```

### Issue: Deployment has broken routing

**Solution:** Make sure `vercel.json` exists in your repo
```bash
# Rename it back before pushing
mv _vercel.json vercel.json
git add vercel.json
git commit -m "Restore vercel.json"
git push
```

## 🎉 Benefits

✅ **Local Development**: Fast Vite HMR with working routes  
✅ **Serverless Testing**: Test API functions with `vercel dev`  
✅ **Production Routing**: Client-side routing works perfectly  
✅ **No Manual Steps**: Git hook prevents accidents  
✅ **Best of Both Worlds**: Vite speed + Vercel serverless  

## 📚 Additional Resources

- [Original Solution Blog Post](https://twitter.com/buildsghost/status/1524798049388290049)
- [Vercel Rewrites Documentation](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)

---

**Last Updated**: October 29, 2025  
**Status**: ✅ Fully Implemented and Working
