# 🔧 FIX SEED ERRORS — Data Not Loading on Netlify

## ⚠️ IMPORTANT: Seeding Must Be Done LOCALLY, Not on Netlify

**The seed script (`demo-magic-button.ts`) MUST be run on your local computer, NOT on Netlify.**

- ✅ **Run locally:** `npx tsx demo-magic-button.ts` (on your computer)
- ❌ **Cannot run on Netlify:** Netlify only hosts the built app, not Node.js scripts

---

## 🔧 FIX SEED ERRORS

### Step 1: Run Seed Script Locally

1. **Open terminal on your computer**
2. **Navigate to project folder:**
   ```bash
   cd C:\Users\jacky\OneDrive\Desktop\RF_PRICING_DASHBOARD
   ```

3. **Make sure you have your Supabase keys:**
   - Open `demo-magic-button.ts`
   - Replace `SERVICE_ROLE_KEY` with your service role key (SECRET key)
   - Replace `SUPABASE_URL` with your Supabase URL (or leave if .env has it)

4. **Run the seed script:**
   ```bash
   npx tsx demo-magic-button.ts
   ```

5. **Wait for completion:**
   - Should see: `✅ FINAL WORLD FIX — ALL 8 WEEKS, WEEK 8 GAP, WORKFLOW READY ✓`
   - If you see errors, check the error message below

### Step 2: Common Errors & Fixes

#### Error: "relation suppliers does not exist"
**Problem:** Database tables don't exist yet

**Fix:**
1. Go to: Supabase Dashboard → SQL Editor
2. Run the main schema migration first
3. Then run the seed script again

**Or run migrations:**
- See `SETUP_DATABASE_FROM_SCRATCH.md` for migration order

#### Error: "permission denied" or "JWT expired"
**Problem:** Service role key is wrong or expired

**Fix:**
1. Go to: Supabase Dashboard → Settings → API
2. Copy the **service_role** key (SECRET, not anon key)
3. Paste into `demo-magic-button.ts` as `SERVICE_ROLE_KEY`
4. Run seed script again

#### Error: "network error" or "connection refused"
**Problem:** Supabase URL is wrong or internet issue

**Fix:**
1. Check Supabase URL is correct (starts with `https://`)
2. Check internet connection
3. Verify Supabase project is active (check Supabase dashboard)

#### Error: "duplicate key value violates unique constraint"
**Problem:** Data already exists (not a real error - just means data is already there)

**Fix:**
- This is OK - data already seeded
- Check Netlify app - should work now
- Or delete existing data and re-seed if you want fresh data

### Step 3: Verify Seed Worked

**After seeding, check console output:**

Should see:
```
✅ Items: 8/8
✅ Suppliers: 5/5 (Berry Farms: YES)
✅ Weeks: 8/8 (7 finalized, 1 open)
✅ Week 8 Berry Farms: 0 quotes (expected: 0)
✅ Volumes: 56/56
✅ Awarded volumes: X (expected: >0)
```

**If you see errors (❌), fix the issue and re-run seed.**

### Step 4: Check Netlify App

**After seeding locally:**

1. **Go to your Netlify URL**
2. **Hard refresh:** `Ctrl+Shift+R` / `Cmd+Shift+R`
3. **Check browser console (F12):**
   - Should see: `"Fetched ALL weeks: [1,2,3,4,5,6,7,8]"`
   - Should see: `"All 8 weeks successfully rendered in dropdown!"`
   - No red errors

4. **Test login:**
   - Access code: `RF2024`
   - Select RF Manager
   - Login (no password if `VITE_DEV_MODE=true`)
   - Should see dashboard with all 8 weeks

---

## 🚨 If Data Still Not Showing on Netlify

### Issue 1: RLS Blocking Data
**Problem:** Row Level Security is blocking anonymous access

**Fix (temporary for demo):**
1. Go to: Supabase Dashboard → SQL Editor
2. Run this:
   ```sql
   ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
   ALTER TABLE items DISABLE ROW LEVEL SECURITY;
   ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
   ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
   ALTER TABLE week_item_volumes DISABLE ROW LEVEL SECURITY;
   ```
3. Hard refresh Netlify: `Ctrl+Shift+R`

### Issue 2: Environment Variables Not Set
**Problem:** Netlify doesn't have Supabase keys

**Fix:**
1. Netlify Dashboard → Site settings → Environment variables
2. Add: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy: Deploys → Trigger deploy → Clear cache → Deploy

### Issue 3: Wrong Supabase Project
**Problem:** Netlify is pointing to different Supabase project

**Fix:**
1. Check Netlify env vars match your Supabase project
2. Make sure you seeded the SAME project Netlify is using

---

## ✅ Complete Checklist

- [ ] Seed script run **locally** (not on Netlify)
- [ ] Seed completed successfully (all ✅ checks pass)
- [ ] Netlify environment variables set (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] Netlify redeployed after setting env vars
- [ ] Hard refresh Netlify URL (`Ctrl+Shift+R`)
- [ ] Console shows all 8 weeks fetched
- [ ] Login works
- [ ] Data loads correctly

---

## 📞 What Error Do You See?

**Copy the exact error message from:**
- Terminal output (when running `npx tsx demo-magic-button.ts`)
- Browser console (F12 on Netlify URL)
- Netlify build logs (if applicable)

**I'll give you the exact fix for your specific error.**
