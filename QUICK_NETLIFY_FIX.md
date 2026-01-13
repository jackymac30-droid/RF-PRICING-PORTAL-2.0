# ⚡ QUICK NETLIFY FIX — App Broken on URL

## 🚨 DO THIS NOW (2 Minutes)

### Step 1: Add Environment Variables to Netlify

1. **Go to:** https://app.netlify.com
2. **Your site** → **Site settings** → **Environment variables**
3. **Add these 2 variables:**

   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key-here
   VITE_DEV_MODE = true
   ```

4. **Click "Save"**

### Step 2: Redeploy

1. **Deploys tab** → **"Trigger deploy"**
2. **Check "Clear cache and deploy site"**
3. **Click "Deploy site"**
4. **Wait 2-3 minutes**

### Step 3: Hard Refresh

- **Windows:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

---

## 🔍 What Error Do You See?

**Open your Netlify URL and press F12**

**Tell me what you see:**
- Configuration Error page? → Missing env vars (do Step 1 above)
- Blank page? → Check console for errors
- 404? → Check build logs
- App loads but empty? → Run `npx tsx demo-magic-button.ts`

---

## ✅ Success Indicators

After fix, you should see:
- ✅ Login page loads
- ✅ Console shows: `"Netlify build detected"`
- ✅ Console shows: `"URL loaded ✓"` and `"Key loaded ✓"`
- ✅ No red errors in console

---

**If still broken, tell me the exact error message from the browser console (F12).**
