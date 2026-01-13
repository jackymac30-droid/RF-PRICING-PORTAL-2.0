# 🔧 FIX LOCALHOST - Quick Guide

## The Problem
Your `.env` file has placeholder values, so Supabase can't connect. That's why you see "No Data Available".

## ✅ Quick Fix (2 minutes)

### Step 1: Get Your Supabase Credentials
1. Go to: **https://supabase.com/dashboard**
2. Click your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 2: Update .env File
1. Open `.env` file in project root
2. Replace these lines:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. With your real values:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Save the file**

### Step 3: Restart Dev Server
1. Stop current server: Press `Ctrl+C` in terminal
2. Start again:
   ```powershell
   npm run dev
   ```
3. Go to: `http://localhost:5173`

### Step 4: Seed Database
1. You should see a blue **"Seed Database"** button on the login page
2. Click it
3. Wait 2-3 seconds
4. Page will refresh automatically
5. You should now see suppliers!

---

## Alternative: Run Seed Script Manually

If the button doesn't work, run this in terminal:

```powershell
npx tsx demo-magic-button.ts
```

**Note:** This requires your **Service Role Key** (not anon key):
1. Supabase Dashboard → Settings → API
2. Copy **service_role key** (SECRET - different from anon key)
3. Add to `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
4. Then run: `npx tsx demo-magic-button.ts`

---

## Still Not Working?

1. **Check browser console (F12):** Look for error messages
2. **Verify .env file:** Make sure values are correct (no quotes, no spaces)
3. **Check Supabase connection:** Make sure your Supabase project is active
4. **Try hard refresh:** `Ctrl+Shift+R` in browser

---

## What Gets Created

After seeding, you'll have:
- ✅ 9 suppliers (including Berry Farms)
- ✅ 8 items (berry SKUs)
- ✅ Ready to use!

**The seed button will only work if your .env file has real Supabase credentials!**
