# Server Fix - Admin Import Error

## Problem
When submitting a report via POST /api/report, the server crashed with:
```
ReferenceError: admin is not defined
```

## Solution
Added `admin` to the import statement in `server.js`:

**Before:**
```javascript
import { db } from './firebase.js';
```

**After:**
```javascript
import { db, admin } from './firebase.js';
```

## Why This Happened
The code on line 372 was trying to use `admin.firestore.FieldValue.serverTimestamp()` but `admin` wasn't imported from firebase.js.

## Status
✅ Fixed in server.js
✅ No linting errors
⚠️ Server needs to be restarted

## To Apply Fix
1. Stop the current server (Ctrl+C in the terminal running it)
2. Restart with: `npm start`
3. Try submitting a report again
