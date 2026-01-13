# 🚀 ONE-STOP FIX — Make App Ready for High-Level People Tomorrow

## ⚡ QUICK FIX (5 Minutes)

### Step 1: Seed Database (CRITICAL)
```bash
# 1. Open demo-magic-button.ts
# 2. Replace SERVICE_ROLE_KEY with your actual key (from Supabase Dashboard → Settings → API → service_role key)
# 3. Replace SUPABASE_URL with your URL (or leave if .env has it)
# 4. Run:
npx tsx demo-magic-button.ts
```

**Wait for:** `✅ FINAL WORLD FIX — ALL 8 WEEKS, WEEK 8 GAP, WORKFLOW READY ✓`

### Step 2: Set Environment Variables

**Local (.env file):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DEV_MODE=true
```

**Netlify (Dashboard → Site Settings → Environment Variables):**
- `VITE_SUPABASE_URL` = Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key  
- `VITE_DEV_MODE` = `true` (allows login without password)

**After setting Netlify vars:** Deploys → "Trigger deploy" → Check "Clear cache" → Deploy

### Step 3: Hard Refresh
- **Windows:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

### Step 4: Verify It Works

**Open browser console (F12) and check for:**
- ✅ `"Fetched ALL weeks: [1,2,3,4,5,6,7,8]"`
- ✅ `"All 8 weeks successfully rendered in dropdown!"`
- ✅ No red errors

**Test:**
1. Login: Access code `RF2024`, select RF Manager, login (no password if dev mode)
2. Dashboard: Should show week 8 selected, all 8 weeks in dropdown
3. Navigation: Switch between weeks 1-8, all should work
4. Features: Lock/unlock, allocations, acceptance all work

## ✅ Success Checklist

- [ ] Database seeded (8 weeks, 5 suppliers, 8 SKUs)
- [ ] Environment variables set (local + Netlify)
- [ ] Netlify redeployed (if env vars changed)
- [ ] Hard refresh done
- [ ] Console shows all 8 weeks fetched
- [ ] Dropdown shows all 8 weeks
- [ ] Week 8 selected by default
- [ ] Login works
- [ ] Navigation works
- [ ] No errors in console

## 🚨 If Something's Broken

### App shows empty data
1. Run seed again: `npx tsx demo-magic-button.ts`
2. Check RLS: Run `seed-demo-rls-access.sql` in Supabase SQL Editor (disable RLS)
3. Hard refresh: `Ctrl+Shift+R`

### Only shows weeks 2-5
1. Re-run seed: `npx tsx demo-magic-button.ts`
2. Check console: Should see `"Fetched ALL weeks: [1,2,3,4,5,6,7,8]"`
3. Hard refresh: `Ctrl+Shift+R`

### Can't login
1. Check `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Set `VITE_DEV_MODE=true` (allows no-password login)
3. Hard refresh: `Ctrl+Shift+R`

### Netlify shows old version
1. Netlify Dashboard → Deploys → "Trigger deploy"
2. Check "Clear cache and deploy site"
3. Click "Deploy site"
4. Wait 2-3 minutes
5. Hard refresh: `Ctrl+Shift+R`

## 📋 Demo Flow (What to Show Tomorrow)

1. **Login:** Access code `RF2024`, RF Manager, login
2. **Dashboard:** Week 8 selected, all 8 weeks visible
3. **Week 8 Gap:** Show Berry Farms missing (intentional)
4. **Historical:** Switch to weeks 1-7, show finalized data
5. **Workflow:** Lock/unlock, allocations, acceptance

## 🎯 Final Verification

**Before tomorrow, verify:**
- ✅ All 8 weeks visible in dropdown
- ✅ Week 8 selected by default
- ✅ Login works (no password if dev mode)
- ✅ Navigation between weeks works
- ✅ No console errors
- ✅ All features work (lock, allocations, acceptance)

**If all ✅, you're ready!**
