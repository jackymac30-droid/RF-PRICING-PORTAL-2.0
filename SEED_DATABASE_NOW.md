# 🚀 SEED DATABASE NOW - QUICK GUIDE

Your site is loading but the database is empty. Follow these steps:

## Step 1: Get Your Supabase Keys

1. Go to: https://supabase.com/dashboard
2. Click your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (for `SUPABASE_URL`)
   - **service_role** key (SECRET key, NOT the anon key)

## Step 2: Update .env File

Open `.env` file in the project root and add/update:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** 
- `SUPABASE_SERVICE_ROLE_KEY` is the SECRET service_role key (for seeding)
- `VITE_SUPABASE_ANON_KEY` is the public anon key (for the app)

## Step 3: Run Seeding Script

In terminal, run:

```bash
npx tsx demo-magic-button.ts
```

You should see:
- ✅ Items: 8/8
- ✅ Suppliers: 5/5 (Berry Farms: YES)
- ✅ Weeks: 8/8 (7 finalized, 1 open)
- ✅ FULL DEMO READY — OPEN NETLIFY & HARD REFRESH

## Step 4: Hard Refresh Site

Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) to hard refresh.

## That's It!

The database will be populated with:
- 8 berry SKUs
- 5 suppliers (including Berry Farms)
- 8 weeks (weeks 1-7 finalized, week 8 open)
- Week 8 missing Berry Farms quotes (intentional gap)

## Troubleshooting

**Error: "Missing Supabase credentials"**
→ Make sure `.env` file has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

**Error: "permission denied"**
→ Make sure you're using the **service_role** key (SECRET), not the anon key

**Error: "relation does not exist"**
→ Run database migrations first (see `SETUP_DATABASE_FROM_SCRATCH.md`)
