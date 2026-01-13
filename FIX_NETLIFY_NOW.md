# 🚨 FIX NETLIFY NOW — App Broken on URL

## ⚡ IMMEDIATE FIX (Do This First)

### Step 1: Check What Error You See

**Open your Netlify URL and press F12 (browser console)**

**What do you see?**
- [ ] "Configuration Error" page (red box with missing env vars)
- [ ] Blank white page
- [ ] "404 Not Found"
- [ ] App loads but shows empty data
- [ ] Other error (describe it)

---

## 🔧 FIX BY ERROR TYPE

### If You See "Configuration Error" Page

**Problem:** Missing environment variables in Netlify

**Fix:**
1. Go to: **https://app.netlify.com**
2. Click your site → **"Site settings"**
3. Click **"Environment variables"**
4. **Add these (if missing):**
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`
   - `VITE_DEV_MODE` = `true`
   - `VITE_ACCESS_CODE` = `RF2024`
5. **Click "Save"**
6. **Go to "Deploys" tab**
7. **Click "Trigger deploy"**
8. **Check "Clear cache and deploy site"**
9. **Click "Deploy site"**
10. **Wait 2-3 minutes**
11. **Hard refresh:** `Ctrl+Shift+R` / `Cmd+Shift+R`

---

### If You See Blank White Page

**Problem:** Build failed or runtime error

**Fix:**
1. **Check Netlify build logs:**
   - Netlify Dashboard → Deploys → Click latest deploy
   - Look for red errors
   - If build failed, fix the error and push again

2. **Check browser console (F12):**
   - Look for red errors
   - Copy the error message
   - Common errors:
     - `Cannot read property 'X' of undefined` → Data not seeded
     - `Network error` → Supabase connection issue
     - `404` → Missing file or route

3. **If build succeeded but page is blank:**
   - Check console for runtime errors
   - Verify environment variables are set
   - Try hard refresh: `Ctrl+Shift+R`

---

### If You See "404 Not Found"

**Problem:** SPA routing not configured

**Fix:**
1. **Verify `public/_redirects` exists:**
   ```
   /*    /index.html   200
   ```

2. **Verify `netlify.toml` has redirects:**
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **If missing, create `public/_redirects`:**
   ```
   /*    /index.html   200
   ```

4. **Push to GitHub and redeploy**

---

### If App Loads But Shows Empty Data

**Problem:** Database not seeded or RLS blocking

**Fix:**
1. **Seed database:**
   ```bash
   npx tsx demo-magic-button.ts
   ```

2. **Disable RLS (temporary for demo):**
   - Go to Supabase Dashboard → SQL Editor
   - Run this:
   ```sql
   ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
   ALTER TABLE items DISABLE ROW LEVEL SECURITY;
   ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
   ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
   ALTER TABLE week_item_volumes DISABLE ROW LEVEL SECURITY;
   ```

3. **Hard refresh:** `Ctrl+Shift+R`

---

## ✅ COMPLETE CHECKLIST

**Before demo, verify ALL of these:**

### Environment Variables (Netlify)
- [ ] `VITE_SUPABASE_URL` = Your Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
- [ ] `VITE_DEV_MODE` = `true`
- [ ] `VITE_ACCESS_CODE` = `RF2024`

### Database
- [ ] Database seeded: `npx tsx demo-magic-button.ts`
- [ ] All 8 weeks exist
- [ ] 5 suppliers exist
- [ ] 8 SKUs exist

### Build
- [ ] Netlify build succeeds (check Deploys tab)
- [ ] No build errors in logs
- [ ] Build outputs `dist/` folder

### App
- [ ] App loads (not blank page)
- [ ] Login page appears
- [ ] Can login (no password if dev mode)
- [ ] Dashboard loads
- [ ] All 8 weeks visible
- [ ] No console errors (F12)

---

## 🚨 EMERGENCY FIX (If Nothing Works)

**Run this complete reset:**

1. **Seed database:**
   ```bash
   npx tsx demo-magic-button.ts
   ```

2. **Set Netlify environment variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_DEV_MODE` = `true`

3. **Trigger fresh deploy:**
   - Netlify → Deploys → "Trigger deploy"
   - Check "Clear cache and deploy site"
   - Deploy

4. **Disable RLS (temporary):**
   - Supabase SQL Editor → Run RLS disable commands above

5. **Hard refresh:** `Ctrl+Shift+R`

---

## 📞 What Error Do You See?

**Tell me exactly what you see:**
- What page loads? (Configuration Error, blank, 404, etc.)
- What's in the browser console (F12)? (Copy any red errors)
- What's in Netlify build logs? (Any build errors?)

**I'll give you the exact fix for your specific error.**
