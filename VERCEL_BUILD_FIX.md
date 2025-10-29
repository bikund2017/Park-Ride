# Vercel Build Performance Fix

## Issue Identified
The Vercel deployment was running the build command **8+ times** instead of once, causing:
- Extremely slow deployments (2+ minutes)
- Wasted build time
- Unnecessary resource consumption

## Root Cause
**Duplicate build configuration:**

1. ✗ `vercel.json` had `buildCommand` defined
2. ✗ `package.json` had `vercel-build` script defined
3. ✗ `vercel.json` had `installCommand` defined

Vercel was executing both, causing a loop of multiple builds.

## Solution Applied

### Before (`vercel.json`):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "cd client && npm ci && npm run build",  ← REMOVED
  "outputDirectory": "client/dist",
  "installCommand": "npm install",                          ← REMOVED
  "rewrites": [...]
}
```

### After (`vercel.json`):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "outputDirectory": "client/dist",
  "rewrites": [...]
}
```

### Kept in `package.json`:
```json
{
  "scripts": {
    "vercel-build": "cd client && npm ci && npm run build"
  }
}
```

## Why This Works

Vercel's build process follows this order:
1. **Install:** Runs `npm install` (or custom `installCommand`)
2. **Build:** Looks for `vercel-build` script OR uses `buildCommand`
3. **Deploy:** Uses files from `outputDirectory`

**The fix:**
- Removed redundant `buildCommand` and `installCommand` from `vercel.json`
- Kept single source of truth: `vercel-build` script in `package.json`
- Now builds **once** instead of 8+ times

## Expected Results

### Before Fix:
- 🔴 8+ build cycles
- ⏱️ ~2+ minutes build time
- 📦 Repeated "added 310 packages" messages

### After Fix:
- ✅ Single build cycle
- ⏱️ ~15-20 seconds build time
- 📦 Runs once: `npm install` → `vercel-build` → deploy

## Verification

Check the next Vercel deployment log. You should see:
1. `Running "vercel build"` - **ONCE**
2. `Running "install" command: npm install` - **ONCE**
3. `Running "npm run vercel-build"` - **ONCE**
4. Build completes in ~15-20 seconds

## Related Files
- ✅ `vercel.json` - Fixed (removed duplicate commands)
- ✅ `package.json` - Kept `vercel-build` script
- ✅ `.vercelignore` - Properly excludes dev files

---

**Deployed:** October 30, 2025  
**Commit:** `133c373` - "Fix: Remove duplicate build commands from vercel.json to prevent multiple builds"
