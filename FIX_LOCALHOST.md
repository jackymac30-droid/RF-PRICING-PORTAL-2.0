# Fix Localhost - Quick Guide

## ✅ Yes, pushed to GitHub
- Latest commit: `6421b5c` - "FINAL WORKFLOW FIX"
- All changes are on GitHub

## 🔧 Fix Localhost Issues

### Step 1: Stop Old Dev Server
```powershell
# Kill any running Vite processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 2: Check .env File
Make sure `.env` file exists in project root with:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Install Dependencies (if needed)
```powershell
npm install
```

### Step 4: Start Dev Server
```powershell
npm run dev
```

### Step 5: Open Browser
- Go to: `http://localhost:5173`
- Hard refresh: `Ctrl+Shift+R`

## 🐛 Common Issues

### Issue: "Cannot access 'loadAllQuotesForWeek' before initialization"
- **Fix**: Already fixed in latest code
- **Action**: Restart dev server

### Issue: "useApp must be used within AppProvider"
- **Fix**: Already fixed in latest code
- **Action**: Restart dev server

### Issue: Blank screen / infinite loading
- **Check**: Browser console (F12) for errors
- **Check**: .env file has correct keys
- **Action**: Hard refresh (`Ctrl+Shift+R`)

### Issue: Port 5173 already in use
- **Fix**: Kill old process, restart dev server
- **Command**: `Get-Process -Name node | Stop-Process -Force`

## ✅ After Fix
1. Dev server running on `http://localhost:5173`
2. Login page loads
3. All 8 weeks visible
4. Week 8 defaults
5. Workflow buttons work

## 🚀 Or Use Netlify
If localhost still broken, use Netlify:
1. Go to: https://app.netlify.com
2. Your site should auto-deploy from GitHub
3. Hard refresh Netlify URL
