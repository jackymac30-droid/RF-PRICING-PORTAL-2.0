# 🔧 FIX SEED - AUTOMATIC SOLUTION

## ✅ EASIEST WAY: Use .env File (No Code Changes!)

Since you can't add SQL anymore, use the TypeScript script with a `.env` file.

### Step 1: Create .env File

1. **In your project folder**, create a file named `.env` (with the dot at the start)
2. **Add these lines:**
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
3. **Replace the values:**
   - Get URL from: Supabase Dashboard → Settings → API → Project URL
   - Get service role key from: Supabase Dashboard → Settings → API → service_role key (SECRET key)

### Step 2: Install Dependencies

```bash
npm install
npm install -g tsx
```

(If you already have `tsx` installed, skip the second command)

### Step 3: Run Seed Script

```bash
npx tsx demo-magic-button.ts
```

Wait for it to complete - should see: `✅ FINAL WORLD FIX — ALL 8 WEEKS, WEEK 8 GAP, WORKFLOW READY ✓`

### Step 4: Check Netlify

1. Go to your Netlify URL
2. Hard refresh: `Ctrl+Shift+R`
3. Should see all 8 weeks now!

---

## 🚨 If You Don't Have Service Role Key

**The service role key is DIFFERENT from the anon key:**

1. Go to: https://supabase.com/dashboard
2. Click your project → **Settings** → **API**
3. Look for **"service_role"** key (it says "secret" next to it)
4. Click **"Reveal"** or **"Copy"** to see it
5. Copy that key (it's long, starts with `eyJ...`)

**Important:**
- ✅ Service role key = SECRET key (bypasses RLS)
- ❌ Anon key = public key (used in frontend - NOT for seeding)

---

## 📋 Quick Checklist

- [ ] Created `.env` file in project folder
- [ ] Added `SUPABASE_URL` to .env
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to .env
- [ ] Installed dependencies (`npm install`)
- [ ] Installed tsx (`npm install -g tsx` or use `npx tsx`)
- [ ] Ran seed script (`npx tsx demo-magic-button.ts`)
- [ ] Seed completed successfully
- [ ] Hard refreshed Netlify (`Ctrl+Shift+R`)
- [ ] All 8 weeks visible

---

## 🔍 Example .env File

```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Note:** Replace with your actual values!

---

## ❓ Troubleshooting

### Error: "Cannot find module 'dotenv'"
**Fix:** Run `npm install dotenv --save-dev`

### Error: "tsx: command not found"
**Fix:** Run `npm install -g tsx` or use `npx tsx demo-magic-button.ts`

### Error: "Missing Supabase credentials"
**Fix:** Check your `.env` file - make sure it's in the project root folder and has the correct variable names

### Error: "permission denied" or "JWT expired"
**Fix:** Check your service role key is correct (SECRET key, not anon key)

### Data not showing on Netlify
**Fix:** 
1. Hard refresh: `Ctrl+Shift+R`
2. Check Netlify env vars are set
3. Disable RLS temporarily if needed

---

**After following these steps, your seed data should load automatically!** 🎉
