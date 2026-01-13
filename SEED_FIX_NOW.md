# 🔧 FIX SEED ERRORS — Data Not Loading

## ⚡ QUICK FIX

### The Problem
Seed data isn't loading on Netlify. Getting errors when trying to seed.

### The Solution
**Seeding MUST be done LOCALLY on your computer, NOT on Netlify.**

Netlify only hosts the built app - it cannot run Node.js scripts like the seed script.

---

## ✅ DO THIS (Run Locally)

### Step 1: Run Seed Script on Your Computer

1. **Open terminal/PowerShell on your computer**
2. **Navigate to project:**
   ```bash
   cd C:\Users\jacky\OneDrive\Desktop\RF_PRICING_DASHBOARD
   ```

3. **Add your Supabase keys to `demo-magic-button.ts`:**
   - Open `demo-magic-button.ts`
   - Line 20: Replace `SERVICE_ROLE_KEY` with your service role key (SECRET key)
   - Line 21: Replace `SUPABASE_URL` with your URL (or leave if .env has it)

4. **Run seed:**
   ```bash
   npx tsx demo-magic-button.ts
   ```

5. **Wait for:**
   ```
   ✅ FINAL WORLD FIX — ALL 8 WEEKS, WEEK 8 GAP, WORKFLOW READY ✓
   ```

### Step 2: Check Netlify App

**After seeding locally:**

1. **Go to your Netlify URL**
2. **Hard refresh:** `Ctrl+Shift+R`
3. **Check console (F12):** Should see all 8 weeks fetched
4. **Test login:** Should work now

---

## 🚨 Common Errors

### Error: "relation suppliers does not exist"
**Fix:** Run database migrations first (see `SETUP_DATABASE_FROM_SCRATCH.md`)

### Error: "permission denied"
**Fix:** Check service role key is correct (SECRET key, not anon key)

### Error: "JWT expired"
**Fix:** Get new service role key from Supabase Dashboard

### Data not showing on Netlify
**Fix:** 
1. Check Netlify env vars are set (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
2. Disable RLS temporarily (see `FIX_SEED_ERRORS.md`)
3. Hard refresh: `Ctrl+Shift+R`

---

## 📋 Checklist

- [ ] Seed script run **locally** (on your computer)
- [ ] Seed completed successfully
- [ ] Netlify env vars set
- [ ] Netlify redeployed
- [ ] Hard refresh done
- [ ] Data shows on Netlify

---

**What error message do you see? Copy it and I'll give you the exact fix.**
