# Demo Seeding Scripts

Complete database seeding for berry procurement demo.

## Quick Start (5 minutes)

### 1. Set Service Role Key

Add to your `.env` file:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VITE_SUPABASE_URL=your-supabase-url
```

**Get your service role key:**
- Go to: Supabase Dashboard → Settings → API
- Copy the `service_role` key (the SECRET one, not anon key)

### 2. Run Seed Script

```bash
npx tsx scripts/seed-demo-complete.ts
```

**Wait 2-3 minutes** - script creates:
- ✅ 8 items (all berry types)
- ✅ 5 suppliers (including Berry Farms)
- ✅ 8 weeks (weeks 1-7 finalized, week 8 open)
- ✅ Complete quotes and volumes
- ✅ Week 8 missing Berry Farms (intentional for demo)

### 3. Fix RLS (if app shows empty data)

If your app still shows empty data after seeding, run `seed-demo-rls-access.sql` in Supabase SQL Editor.

**FASTEST FOR DEMO**: Temporarily disable RLS (see comments in SQL file)

### 4. Hard Refresh Browser

- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

## What Gets Created

- **8 Items**: Strawberry, Blueberry, Blackberry, Raspberry (CONV + ORG each)
- **5 Suppliers**: Berry Farms, Fresh Farms, Organic Growers, Valley Fresh, Premium Produce
- **8 Weeks**: 
  - Weeks 1-7: `status='finalized'`, `allocation_submitted=true`, complete quotes with `rf_final_fob`, awarded volumes
  - Week 8: `status='open'`, quotes for all suppliers EXCEPT Berry Farms (demo gap)
- **Quotes**: All suppliers × all items for each week (realistic prices $5-15)
- **Volumes**: Volume needs and awarded volumes for weeks 1-7

## Schema Fixes (if needed)

If you get "column does not exist" errors, run `db-migrations/seed-fixes.sql` in Supabase SQL Editor first.

## Idempotent

Safe to run multiple times - uses `upsert` with `onConflict` everywhere.

## Troubleshooting

**"Missing credentials"**
- Check `.env` has `SUPABASE_SERVICE_ROLE_KEY`
- Verify key is the `service_role` key (not anon key)

**"RLS blocking"**
- Run `seed-demo-rls-access.sql` OR temporarily disable RLS

**"Column doesn't exist"**
- Run `db-migrations/seed-fixes.sql` first
- Or check your schema matches expected columns

**"tsx not found"**
- Run `npm install -D tsx` or use `npx ts-node` instead

## Files

- `scripts/seed-demo-complete.ts` - Main seeding script
- `seed-demo-rls-access.sql` - RLS access policies
- `db-migrations/seed-fixes.sql` - Schema fixes (if needed)

## Demo Checklist

- [ ] Run seed script
- [ ] Verify data with script output
- [ ] Fix RLS if needed
- [ ] Hard refresh browser
- [ ] Test: Historical weeks show finalized data
- [ ] Test: Week 8 shows open with all suppliers except Berry Farms
- [ ] Test: Award volume screen works (lock/unlock, send allocations)
- [ ] ✅ Ready for 100 people! 🚀
