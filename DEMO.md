# Demo Setup Guide

Complete setup guide for berry procurement demo.

## Quick Start (5 minutes)

### 1. Set Environment Variables

Add to your `.env` file:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VITE_SUPABASE_URL=your-supabase-url
```

**Get your service role key:**
- Go to: Supabase Dashboard → Settings → API
- Copy the `service_role` key (the SECRET one, not anon key)

### 2. Run Seed Script (EASIEST: Use demo-magic-button.ts)

**Option A - EASIEST (recommended):**
```bash
# Open demo-magic-button.ts, paste your SERVICE_ROLE_KEY and SUPABASE_URL
# Then run:
npx tsx demo-magic-button.ts
```

**Option B - Alternative:**
```bash
npx tsx scripts/seed-demo-complete.ts
```

**Wait 2-3 minutes** - script creates:
- ✅ 8 items (all berry types)
- ✅ 5 suppliers (including Berry Farms)
- ✅ 8 weeks (weeks 1-7 finalized, week 8 open)
- ✅ Complete quotes and volumes
- ✅ Week 8 missing Berry Farms (intentional for demo)

### 3. Verify Data

```bash
npx tsx scripts/verify-demo.ts
```

Should show: `✅ READY FOR DEMO: YES`

### 4. Fix RLS (if app shows empty data)

If your app still shows empty data after seeding, run `seed-demo-rls-access.sql` in Supabase SQL Editor.

**FASTEST FOR DEMO**: Temporarily disable RLS (see Option 2 in SQL file)

1. Open `seed-demo-rls-access.sql`
2. Uncomment the `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` lines
3. Copy and paste into Supabase SQL Editor
4. Click Run

**After demo, re-enable RLS** (uncomment the ENABLE lines and run again)

### 5. Hard Refresh Browser

- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

## What Gets Created

### Items (8)
- Strawberry 4×2 lb (CONV)
- Strawberry 8×1 lb (ORG)
- Blueberry 18 oz (CONV)
- Blueberry Pint (ORG)
- Blackberry 12ozx6 (CONV)
- Blackberry 12ozx6 (ORG)
- Raspberry 12ozx6 (CONV)
- Raspberry 12ozx6 (ORG)

### Suppliers (5)
- Berry Farms ⭐
- Fresh Farms Inc
- Organic Growers
- Valley Fresh
- Premium Produce

### Weeks (8)
- **Weeks 1-7**: `status='finalized'`, `allocation_submitted=true`, complete with quotes (`rf_final_fob` set), awarded volumes
- **Week 8**: `status='open'`, `allocation_submitted=false`, quotes for all suppliers EXCEPT Berry Farms (intentional gap)

### Quotes
- **Weeks 1-7**: All suppliers × all items (realistic prices $5-15, `rf_final_fob` set for most, 1-2 declined per week)
- **Week 8**: All suppliers × all items EXCEPT Berry Farms (intentional gap for live demo)

### Volumes
- Volume needs for all 8 items × 7 weeks (56 total)
- Awarded volumes randomly distributed (100-5000 units per award, 2-4 suppliers per item)

## Full Demo Flow Walkthrough

### 1. Dashboard: Historical Finalized + Current Open

**RF Dashboard:**
- Select any week 1-7 → See finalized pricing, all suppliers quoted
- Select week 8 → See open week, all suppliers EXCEPT Berry Farms

**Supplier Dashboard:**
- Weeks 1-7 → Historical finalized data (read-only)
- Week 8 → Can submit pricing (except Berry Farms)

### 2. AwardVolume: 8 SKUs, Lock/Unlock, Send Allocations

**RF Dashboard → Award Volume Tab:**
- ✅ Shows all 8 SKUs
- ✅ Week 8: Prices for all suppliers EXCEPT Berry Farms (intentional gap)
- ✅ Lock/unlock buttons work and persist on refresh
- ✅ "Send Allocations" button enables when:
  - All priced SKUs have `rf_final_fob` set (finalized)
  - All priced SKUs are locked
  - At least one `awarded_volume > 0` exists

### 3. VolumeAcceptance: Acceptance Flows Back

**RF Dashboard → Volume Acceptance Tab:**
- ✅ Shows supplier responses after allocations sent
- ✅ Real-time updates when suppliers accept/revise
- ✅ Displays `supplier_volume_response` and `supplier_volume_accepted`

### 4. AI Insights: Renders (Local Deterministic)

**RF Dashboard → Analytics/Intelligence Tabs:**
- ✅ AI insights render correctly
- ✅ Historical data shows trends
- ✅ Predictions work with seeded data

## Troubleshooting

### App shows empty data

1. **Check RLS**: Run `seed-demo-rls-access.sql` (disable RLS temporarily)
2. **Hard refresh**: `Ctrl+Shift+R` / `Cmd+Shift+R`
3. **Check console**: Look for errors in browser console (F12)
4. **Re-run seed**: `npx tsx scripts/seed-demo-complete.ts`

### Seed script fails

1. **Missing credentials**: Check `.env` has `SUPABASE_SERVICE_ROLE_KEY`
2. **Wrong key**: Must be `service_role` key (not anon key)
3. **Schema mismatch**: Run `db-migrations/seed-fixes.sql` first (if needed)
4. **Network error**: Check Supabase URL is correct

### Verification fails

1. **Re-run seed**: `npx tsx scripts/seed-demo-complete.ts`
2. **Check database**: Look at Supabase dashboard to see what was created
3. **Review errors**: Check console output for specific failures

### Week 8 shows Berry Farms

- This should NOT happen - Week 8 intentionally excludes Berry Farms
- Re-run seed script: `npx tsx scripts/seed-demo-complete.ts`

## Files

- `scripts/seed-demo-complete.ts` - Main seeding script (CHECKLIST ITEMS 1-8)
- `scripts/verify-demo.ts` - Standalone verification script (CHECKLIST ITEM 9)
- `seed-demo-rls-access.sql` - RLS access policies (CHECKLIST ITEM 10)
- `db-migrations/seed-fixes.sql` - Schema fixes (if needed)

## Checklist

- [ ] Environment variables set (`.env` file)
- [ ] Seed script run successfully (`npx tsx demo-magic-button.ts` - EASIEST)
- [ ] Verification passed (magic button shows `READY FOR DEMO ON NETLIFY: YES`)
- [ ] Netlify site hard refreshed (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] If old version shows: Netlify Dashboard → Deploys → Trigger deploy (clear cache)
- [ ] Week 1-7 show finalized data
- [ ] Week 8 shows open with all suppliers except Berry Farms
- [ ] Award Volume tab shows 8 SKUs, lock/unlock works
- [ ] Volume Acceptance tab shows supplier responses
- [ ] AI Insights render correctly
- [ ] ✅ **Ready for 100 people tomorrow!** 🚀

## Netlify Deployment

### Netlify Environment Variables (REQUIRED - Set in Netlify Dashboard → Site Settings → Environment Variables):

**Required for app to work (BIG LEAGUES PRODUCTION):**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key (public)

**Optional (for seeding only - run locally, NOT in Netlify):**
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (SECRET - never expose in client code)

**How to set:**
1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Click "Add a variable"
3. Add each required variable above
4. Click "Save"
5. **IMPORTANT**: Go to Deploys → "Trigger deploy" → Check "Clear cache and deploy site" → "Deploy site" (to apply env vars)
6. Wait 2-3 minutes for deploy to complete
7. Hard refresh browser: Ctrl+Shift+R / Cmd+Shift+R

### Netlify Build Settings (Auto-configured via netlify.toml):

- **Build command**: `npm run build` (configured in `netlify.toml`)
- **Publish directory**: `dist` (configured in `netlify.toml`)
- **Auto-deploy**: Enabled (deploys on push to GitHub main branch)

### After Push to GitHub:

1. **Auto-deploy**: Netlify automatically deploys from GitHub (branch: `main`)
2. **If old version shows**: 
   - Go to Netlify Dashboard → Deploys tab
   - Click "Trigger deploy" → "Deploy site"
   - Check "Clear cache and deploy site" checkbox
   - Click "Deploy site"
   - Wait 2-3 minutes
3. **Hard refresh browser**: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Netlify URL:

Your site will be at: `https://your-site.netlify.app`

**After seeding with demo-magic-button.ts (run locally), hard refresh your Netlify URL to see the demo data.**

### Troubleshooting Netlify:

**Old version still showing:**
- Clear cache: Netlify Dashboard → Deploys → Trigger deploy → Check "Clear cache"
- Hard refresh browser: Ctrl+Shift+R / Cmd+Shift+R
- Check build logs: Netlify Dashboard → Deploys → Click latest deploy → View build log

**Empty screens / 403 errors:**
- Verify env vars are set: Netlify Dashboard → Site Settings → Environment Variables
- Redeploy after setting env vars: Trigger deploy → Clear cache
- Check browser console (F12) for errors
- Verify RLS is disabled (if needed): Run `seed-demo-rls-access.sql` in Supabase SQL Editor

## Last-Minute Push Checklist

Before pushing to GitHub, ensure everything is committed:

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "Final demo prep: complete seeded workflow, no errors"

# Push to main branch
git push origin main
```

**Note**: If you're on a different branch, adjust accordingly: `git push origin <your-branch-name>`

After push: Netlify auto-deploys — trigger manual deploy if old version shows.

## Demo Checklist (Day Of)

1. ✅ Run seed script (if needed)
2. ✅ Verify data (`npx tsx scripts/verify-demo.ts`)
3. ✅ Test app loads correctly
4. ✅ Test week 8 shows Berry Farms gap
5. ✅ Test lock/unlock works
6. ✅ Test send allocations enables
7. ✅ Test acceptance tab updates
8. ✅ Push to GitHub
9. ✅ Ready! 🎉
