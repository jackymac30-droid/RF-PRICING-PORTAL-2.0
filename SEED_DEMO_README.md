# Demo Database Seeding Script

**For your demo tomorrow - fast, reliable, idempotent seeding**

## Quick Start

### 1. Set Service Role Key

Add to your `.env` file:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VITE_SUPABASE_URL=your-supabase-url
```

Get your service role key from: Supabase Dashboard → Settings → API → `service_role` key

### 2. Install Dependencies (if needed)

```bash
npm install tsx
# OR
npm install ts-node
```

### 3. Run the Seed Script

```bash
npx tsx seed-demo-database.ts
```

Or with ts-node:
```bash
npx ts-node seed-demo-database.ts
```

### 4. Grant RLS Access (if needed)

If RLS is blocking, run `seed-demo-rls-access.sql` in Supabase SQL Editor.

**FASTEST FOR DEMO**: Temporarily disable RLS (see comments in SQL file)

### 5. Verify

Run `seed-demo-verification.sql` in Supabase SQL Editor to verify data.

## What Gets Created

- **8 Items**: Strawberry, Blueberry, Blackberry, Raspberry (CONV + ORG each)
- **5 Suppliers**: Berry Farms + 4 others
- **8 Weeks**: 
  - Weeks 1-7: `status='finalized'`, complete quotes and volumes
  - Week 8: `status='open'`, quotes for all suppliers EXCEPT Berry Farms (demo gap)
- **Quotes**: All suppliers × all items for each week
- **Volumes**: Awarded volumes for weeks 1-7

## Idempotent

Safe to run multiple times - uses `upsert` with `onConflict` everywhere.

## Troubleshooting

**Error: Missing credentials**
- Check `.env` file has `SUPABASE_SERVICE_ROLE_KEY`

**Error: RLS blocking**
- Run `seed-demo-rls-access.sql` OR temporarily disable RLS

**Error: Column doesn't exist**
- Check your schema matches the script expectations
- Common columns: `name`, `pack_size`, `category`, `organic_flag`, `display_order` (items)

## For the Demo

1. Run seed script (2-3 minutes)
2. Verify with SQL queries (30 seconds)
3. Test app loads and shows data (1 minute)
4. **Done!** Ready for 100 people tomorrow 🚀
