# 🔧 COMPLETE SEED FIX — Run This Now

## ✅ TWO WAYS TO SEED (Choose One)

### Option 1: SQL Script (EASIEST - Recommended)
**Run directly in Supabase SQL Editor - no coding required!**

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Click your project
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"**

2. **Copy and paste the seed script:**
   - Open file: `seed-demo-ready-8-weeks.sql`
   - **Copy ALL the SQL code**
   - **Paste into Supabase SQL Editor**

3. **Run it:**
   - Click **"Run"** button (or press `Ctrl+Enter`)
   - Wait 10-30 seconds

4. **Verify it worked:**
   - Should see a table with counts:
     - supplier_count: 5
     - item_count: 8
     - week_count: 8
     - finalized_weeks: 7
     - open_weeks: 1
     - week8_berry_farms_quotes: 0 ✅

5. **Check Netlify:**
   - Go to your Netlify URL
   - Hard refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`
   - Should see all 8 weeks now!

---

### Option 2: TypeScript Script (Advanced)
**Run on your local computer**

1. **Open terminal on your computer:**
   ```bash
   cd C:\Users\jacky\OneDrive\Desktop\RF_PRICING_DASHBOARD
   ```

2. **Add your Supabase keys:**
   - Open `demo-magic-button.ts`
   - Line 20: Replace `SERVICE_ROLE_KEY` with your service role key (SECRET key)
   - Line 21: Replace `SUPABASE_URL` with your URL (or leave if .env has it)

3. **Run seed:**
   ```bash
   npx tsx demo-magic-button.ts
   ```

4. **Wait for completion:**
   - Should see: `✅ FINAL WORLD FIX — ALL 8 WEEKS, WEEK 8 GAP, WORKFLOW READY ✓`

5. **Check Netlify:**
   - Go to your Netlify URL
   - Hard refresh: `Ctrl+Shift+R`

---

## 🚨 TROUBLESHOOTING

### Error: "relation suppliers does not exist"
**Problem:** Database tables don't exist yet

**Fix:**
1. Run database migrations first
2. See: `SETUP_DATABASE_FROM_SCRATCH.md`
3. Or: Go to Supabase SQL Editor and run the main schema migration

### Error: "permission denied" or "JWT expired"
**Problem:** Only affects TypeScript script (Option 2)

**Fix:**
1. Check service role key is correct (SECRET key, not anon key)
2. Get from: Supabase Dashboard → Settings → API → service_role key
3. SQL script (Option 1) doesn't need this - it uses your Supabase session

### Data not showing on Netlify
**Problem:** Data seeded but app shows empty

**Fix:**
1. **Hard refresh Netlify:** `Ctrl+Shift+R` / `Cmd+Shift+R`
2. **Check browser console (F12):** Look for errors
3. **Check Netlify env vars:**
   - `VITE_SUPABASE_URL` ✅
   - `VITE_SUPABASE_ANON_KEY` ✅
4. **Disable RLS temporarily (if needed):**
   ```sql
   ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
   ALTER TABLE items DISABLE ROW LEVEL SECURITY;
   ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
   ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
   ALTER TABLE week_item_volumes DISABLE ROW LEVEL SECURITY;
   ```
5. **Redeploy Netlify:** Trigger new deploy after disabling RLS

---

## ✅ VERIFICATION CHECKLIST

After seeding, verify:

- [ ] Supplier count = 5 (including Berry Farms)
- [ ] Item count = 8 (all berry items)
- [ ] Week count = 8
- [ ] Finalized weeks = 7 (weeks 1-7)
- [ ] Open weeks = 1 (week 8)
- [ ] Week 8 Berry Farms quotes = 0 (missing as intended)
- [ ] Netlify app shows all 8 weeks
- [ ] Can login and see dashboard
- [ ] Week 8 is selected by default
- [ ] Week 8 shows gap (Berry Farms missing)

---

## 📋 WHAT GETS CREATED

### Suppliers (5):
- ✅ Berry Farms (contact@berryfarms.com)
- ✅ Fresh Farms Inc
- ✅ Organic Growers
- ✅ Valley Fresh
- ✅ Premium Produce

### Items (8 berry SKUs):
- ✅ Strawberry 4×2 lb (CONV)
- ✅ Strawberry 8×1 lb (ORG)
- ✅ Blueberry 18 oz (CONV)
- ✅ Blueberry Pint (ORG)
- ✅ Blackberry 12ozx6 (CONV)
- ✅ Blackberry 12ozx6 (ORG)
- ✅ Raspberry 12ozx6 (CONV)
- ✅ Raspberry 12ozx6 (ORG)

### Weeks (8):
- ✅ **Weeks 1-7:** Finalized (complete quotes from all 5 suppliers, rf_final_fob, volumes)
- ✅ **Week 8:** Open (quotes from 4 suppliers only - Berry Farms missing)

---

## 🎯 RECOMMENDED APPROACH

**Use Option 1 (SQL Script):**
- ✅ No coding required
- ✅ Works directly in Supabase dashboard
- ✅ No need for service role key
- ✅ Easier to debug
- ✅ Can see results immediately

**Only use Option 2 (TypeScript) if:**
- You prefer command line
- You want to automate seeding
- You're comfortable with Node.js/TypeScript

---

**After seeding, your app should be demo-ready!** 🎉
