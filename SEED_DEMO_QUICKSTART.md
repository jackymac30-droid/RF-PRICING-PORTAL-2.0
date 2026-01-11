# DEMO SEED - QUICK START (For Tomorrow's Demo)

## Fast Setup (5 minutes)

### 1. Add Service Role Key to .env

Add this line to your `.env` file:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Get it from: Supabase Dashboard → Settings → API → `service_role` key (the SECRET one)

### 2. Run Seed Script

```bash
npx tsx seed-demo-database.ts
```

**Wait 2-3 minutes** - script creates:
- ✅ 8 items
- ✅ 5 suppliers (Berry Farms + 4 others)
- ✅ 8 weeks (1-7 finalized, 8 open)
- ✅ All quotes and volumes

### 3. Grant RLS Access (if needed)

If your app is blocked by RLS, run this SQL in Supabase SQL Editor:

```sql
-- FASTEST: Disable RLS temporarily (enable after demo!)
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE week_item_volumes DISABLE ROW LEVEL SECURITY;
```

**After demo, re-enable:**
```sql
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_item_volumes ENABLE ROW LEVEL SECURITY;
```

### 4. Verify

Run `seed-demo-verification.sql` in Supabase SQL Editor to verify data.

## What Gets Created

- **8 Items**: All berry types (Strawberry, Blueberry, Blackberry, Raspberry - CONV/ORG)
- **5 Suppliers**: Berry Farms, Fresh Farms, Organic Growers, Valley Fresh, Premium Produce
- **8 Weeks**: 
  - Weeks 1-7: `status='finalized'`, complete with quotes and volumes
  - Week 8: `status='open'`, quotes for all suppliers EXCEPT Berry Farms (demo gap)
- **Quotes**: All suppliers × all items for each week (realistic prices $5-15)
- **Volumes**: Awarded volumes for weeks 1-7

## Notes

- **Idempotent**: Safe to run multiple times
- **Week 8 Gap**: Intentionally missing Berry Farms for live demo
- **Service Role**: Bypasses RLS (required for seeding)

## Troubleshooting

**"Missing credentials"**: Check `.env` has `SUPABASE_SERVICE_ROLE_KEY`

**"RLS blocking"**: Disable RLS temporarily (see step 3)

**"tsx not found"**: Run `npm install -D tsx` or use `npx ts-node` instead

**Ready for 100 people tomorrow!** 🚀
