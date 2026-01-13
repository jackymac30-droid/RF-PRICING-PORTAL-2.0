# 🚨 URGENT: Fix Netlify URL — App Broken

## ⚡ IMMEDIATE FIX (3 Steps)

### Step 1: Set Environment Variables in Netlify

1. **Go to:** https://app.netlify.com
2. **Click your site**
3. **Click "Site settings"** (top right)
4. **Click "Environment variables"** (left sidebar)
5. **Click "Add a variable"**
6. **Add these 2 variables:**

   **Variable 1:**
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co` (your actual Supabase URL)
   - Click "Save"

   **Variable 2:**
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your actual anon key)
   - Click "Save"

   **Variable 3 (Optional but recommended):**
   - Key: `VITE_DEV_MODE`
   - Value: `true`
   - Click "Save"

### Step 2: Redeploy with Cache Clear

1. **Go to "Deploys" tab** (top of Netlify dashboard)
2. **Click "Trigger deploy"** (dropdown button)
3. **Click "Deploy site"**
4. **IMPORTANT:** Check the box **"Clear cache and deploy site"**
5. **Click "Deploy site"**
6. **Wait 2-3 minutes** for build to complete

### Step 3: Hard Refresh Browser

- **Windows:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

---

## 🔍 How to Get Your Supabase Keys

1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon/public key** → Use for `VITE_SUPABASE_ANON_KEY`

---

## ✅ Verify It's Fixed

**After redeploy, check:**

1. **Open your Netlify URL**
2. **Press F12** (browser console)
3. **Look for:**
   - ✅ `"Netlify build detected"`
   - ✅ `"URL loaded ✓"`
   - ✅ `"Key loaded ✓"`
   - ✅ No red errors

4. **If you see "Configuration Error" page:**
   - Environment variables not set correctly
   - Go back to Step 1 and verify keys are correct

5. **If you see blank page:**
   - Check console for errors
   - Check Netlify build logs (Deploys → Latest → View logs)

---

## 🚨 Common Issues

### "Configuration Error" Page
- **Fix:** Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify
- **Then:** Redeploy with cache clear

### Blank White Page
- **Check:** Browser console (F12) for errors
- **Check:** Netlify build logs for build errors
- **Fix:** Fix the error and redeploy

### "404 Not Found"
- **Fix:** Verify `public/_redirects` file exists with: `/*    /index.html   200`
- **Then:** Push to GitHub and redeploy

### App Loads But Empty Data
- **Fix:** Run `npx tsx demo-magic-button.ts` to seed database
- **Then:** Hard refresh: `Ctrl+Shift+R`

---

## 📋 Complete Checklist

- [ ] `VITE_SUPABASE_URL` set in Netlify
- [ ] `VITE_SUPABASE_ANON_KEY` set in Netlify
- [ ] `VITE_DEV_MODE` = `true` (optional, for easier login)
- [ ] Redeployed with "Clear cache" checked
- [ ] Hard refresh done (`Ctrl+Shift+R`)
- [ ] Console shows no errors
- [ ] App loads (not blank page)
- [ ] Login works

---

## 🆘 Still Broken?

**Tell me:**
1. What page do you see? (Configuration Error, blank, 404, etc.)
2. What's in browser console (F12)? (Copy any red errors)
3. What's in Netlify build logs? (Any build errors?)

**I'll give you the exact fix for your specific error.**
