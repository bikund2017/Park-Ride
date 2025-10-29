# Comment Removal Scripts

Two scripts to remove all comments from your code files.

## Scripts Available

### 1. `remove-comments.js` (Recommended - Node.js)
**Safer and more accurate** - Uses proper parsing

**Usage:**
```bash
node remove-comments.js
```

**Features:**
- ✅ Removes `//` single-line comments
- ✅ Removes `/* */` multi-line comments
- ✅ Removes `/** */` JSDoc comments
- ✅ Handles JavaScript (.js, .jsx)
- ✅ Handles CSS (.css)
- ✅ Creates `.bak` backups automatically
- ✅ Skips node_modules, dist, build folders
- ✅ Shows progress and statistics

---

### 2. `remove-comments.sh` (Alternative - Bash)
**Faster but simpler** - Uses regex patterns

**Usage:**
```bash
./remove-comments.sh
```

**Features:**
- ✅ Works on Linux/Mac
- ✅ Removes comments using sed
- ✅ Creates backups
- ⚠️ May have issues with complex nested comments

---

## What Gets Processed

### JavaScript/JSX Files
- Removes `// single line comments`
- Removes `/* multi-line comments */`
- Removes `/** JSDoc comments */`

### CSS Files
- Removes `/* CSS comments */`

### Skipped Directories
- `node_modules/`
- `dist/`
- `build/`
- `.git/`
- `.next/`
- `coverage/`

---

## Safety Features

### Automatic Backups
Both scripts create `.bak` backup files before modifying:
```
Original: App.jsx
Backup:   App.jsx.bak
```

### Restore All Backups
```bash
find . -name "*.bak" -exec bash -c 'mv "$0" "${0%.bak}"' {} \;
```

### Delete All Backups (after reviewing changes)
```bash
find . -name "*.bak" -delete
```

---

## Example Output

```
🧹 Starting comment removal from code files...

✓ Processed: ./client/src/App.jsx
✓ Processed: ./client/src/components/Header.jsx
✓ Processed: ./api/report.js
✓ Processed: ./client/src/index.css

✅ Comment removal complete!
   JavaScript/JSX files: 45
   CSS files: 12
   Total files processed: 57
   Errors: 0
   Time taken: 1.23s

📦 Backup files created with .bak extension
💡 To restore all backups:
   find . -name "*.bak" -exec bash -c 'mv "$0" "${0%.bak}"' {} \;
💡 To remove all backups:
   find . -name "*.bak" -delete

⚠️  Review the changes before committing!
```

---

## Workflow

### Step 1: Run the script
```bash
node remove-comments.js
```

### Step 2: Review changes
```bash
git diff
```

### Step 3: Test the application
```bash
npm run dev
```

### Step 4a: If everything works - Delete backups
```bash
find . -name "*.bak" -delete
git add .
git commit -m "Remove all comments from code files"
```

### Step 4b: If something broke - Restore backups
```bash
find . -name "*.bak" -exec bash -c 'mv "$0" "${0%.bak}"' {} \;
```

---

## Important Notes

⚠️ **Before Running:**
1. Commit all your current changes first
2. Make sure you have a clean git state
3. Run on a separate branch if unsure

⚠️ **After Running:**
1. Review all changes with `git diff`
2. Test the application thoroughly
3. Check that no important comments were removed (TODO, FIXME, license headers, etc.)

⚠️ **Comments That Might Be Important:**
- License headers
- TODO/FIXME notes
- API documentation
- Complex algorithm explanations
- Configuration comments

Consider keeping critical comments and only removing redundant ones manually.

---

## Recommendation

**Use `remove-comments.js` (Node.js version)** - It's more reliable and provides better feedback.
