# 🚀 ONE-STOP FIX — Make App Demo-Ready in 5 Minutes

## Quick Fix (Run These Commands)

### Step 1: Seed Database (REQUIRED)
```bash
# Make sure you have your Supabase keys in demo-magic-button.ts
# Then run:
npx tsx demo-magic-button.ts
```

**What this does:**
- ✅ Creates 8 berry SKUs
- ✅ Creates 5 suppliers (including Berry Farms)
- ✅ Creates 8 weeks (1-7 finalized, 8 open)
- ✅ Creates quotes for all weeks
- ✅ Week 8 missing Berry Farms (intentional gap)
- ✅ Sets up volumes and awards

### Step 2: Verify Environment Variables

**Local (.env file):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DEV_MODE=true
```

**Netlify (Dashboard → Site Settings → Environment Variables):**
- `VITE_SUPABASE_URL` = Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
- `VITE_DEV_MODE` = `true` (optional, for easier login)

### Step 3: Hard Refresh Browser
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

### Step 4: Verify Everything Works

**Checklist:**
- [ ] App opens on login page
- [ ] Can login as RF Manager (no password if VITE_DEV_MODE=true)
- [ ] Dashboard shows all 8 weeks in dropdown
- [ ] Week 8 is selected by default
- [ ] Week 8 shows Berry Farms missing (intentional gap)
- [ ] Can navigate between weeks
- [ ] Lock/unlock buttons work
- [ ] Send allocations button enables when ready
- [ ] No blank screens or 400/403 errors

## If Something's Broken

### App shows empty data
1. **Check RLS:** Run `seed-demo-rls-access.sql` in Supabase SQL Editor (disable RLS temporarily)
2. **Re-run seed:** `npx tsx demo-magic-button.ts`
3. **Hard refresh:** `Ctrl+Shift+R` / `Cmd+Shift+R`

### Only shows weeks 2-5
1. **Re-run seed:** `npx tsx demo-magic-button.ts` (creates all 8 weeks)
2. **Check console:** Should see `"Fetched ALL weeks: [1,2,3,4,5,6,7,8]"`
3. **Hard refresh:** `Ctrl+Shift+R` / `Cmd+Shift+R`

### Can't login
1. **Check .env:** Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
2. **Set VITE_DEV_MODE=true:** Allows login without password
3. **Hard refresh:** `Ctrl+Shift+R` / `Cmd+Shift+R`

### Netlify shows old version
1. **Trigger deploy:** Netlify Dashboard → Deploys → "Trigger deploy" → Check "Clear cache" → Deploy
2. **Wait 2-3 minutes**
3. **Hard refresh:** `Ctrl+Shift+R` / `Cmd+Shift+R`

## Demo Flow (What to Show)

1. **Login:** Access code `RF2024`, select RF Manager, login
2. **Dashboard:** Shows week 8 by default, all 8 weeks in dropdown
3. **Week 8 Gap:** Show that Berry Farms is missing (intentional)
4. **Historical Weeks:** Switch to week 1-7, show finalized data
5. **Workflow:** Show lock/unlock, allocations, acceptance flow

## Final Checklist Before Demo

- [ ] Database seeded with all 8 weeks
- [ ] Environment variables set (local + Netlify)
- [ ] App opens on login page
- [ ] All 8 weeks visible in dropdown
- [ ] Week 8 selected by default
- [ ] No errors in browser console (F12)
- [ ] Hard refresh done (Ctrl+Shift+R)
- [ ] Netlify deployed with latest code
- [ ] Test login works
- [ ] Test navigation between weeks works
- [ ] Test lock/unlock works
- [ ] Test send allocations works

## Emergency Fix Script

If everything is broken, run this:

```bash
# 1. Seed database
npx tsx demo-magic-button.ts

# 2. Check environment variables
# (Make sure .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)

# 3. Build and test locally
npm run build
npm run preview

# 4. Push to GitHub (if changes made)
git add .
git commit -m "Final demo prep"
git push origin main

# 5. Netlify will auto-deploy, or trigger manual deploy
# 6. Hard refresh Netlify URL: Ctrl+Shift+R
```

## Success Indicators

✅ Console shows: `"Fetched ALL weeks: [1,2,3,4,5,6,7,8]"`
✅ Dropdown shows all 8 weeks
✅ Week 8 selected by default
✅ No errors in console
✅ Login works
✅ Navigation works
✅ All features work

**If all above are ✅, you're ready for high-level people!**
