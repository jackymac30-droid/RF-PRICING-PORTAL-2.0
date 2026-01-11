# Schema Reference - Key Tables & Constraints

## 1. QUOTES TABLE

### Unique Constraint
**YES** - `quotes` has a UNIQUE constraint on `(week_id, item_id, supplier_id)`
- Defined in: `supabase/migrations/20260101010948_rebuild_pricing_portal_schema.sql` line 164
- Ensures one quote per supplier per item per week

### Pricing Columns
- `supplier_fob` (decimal 10,2) - Supplier's initial FOB price
- `supplier_dlvd` (decimal 10,2) - Supplier's initial delivered price
- `rf_counter_fob` (decimal 10,2) - RF's counter offer
- `supplier_response` (text) - 'accept' | 'revise' | null
- `supplier_revised_fob` (decimal 10,2) - Supplier's revised price after counter
- `rf_final_fob` (decimal 10,2) - **FINAL PRICE** - RF's confirmed final price per quote

### Volume/Award Columns
- `awarded_volume` (integer) - RF's draft allocation (sandbox) → final after supplier response
- `offered_volume` (numeric) - Volume sent to supplier (copied from awarded_volume)
- `supplier_volume_response` (text) - 'accept' | 'update' | 'decline' | null
- `supplier_volume_accepted` (numeric) - Supplier's accepted/revised volume
- `supplier_volume_response_notes` (text) - Optional notes

### Other Columns
- `supplier_eligibility_status` (text) - 'submitted' | 'reviewed' | 'feedback_sent' | 'eligible_for_award' | 'not_used'
- `supplier_pricing_finalized` (boolean)
- `supplier_pricing_finalized_at` (timestamptz)
- `supplier_volume_approval` (text) - 'pending' | 'accepted' | 'revised'

---

## 2. WEEKS TABLE

### Status Column
**YES** - `weeks.status` is CHECK constrained (not enum, but effectively enum'd)
- **Exact values**: `'open'`, `'finalized'`, `'closed'`
- Defined in: `supabase/migrations/20260101010948_rebuild_pricing_portal_schema.sql` line 84
- Default: `'closed'` (in rebuild schema) or `'open'` (in v2 schema)

### Other Columns
- `week_number` (integer, UNIQUE)
- `start_date` (date)
- `end_date` (date)
- `allocation_submitted` (boolean)
- `allocation_submitted_at` (timestamptz)
- `allocation_submitted_by` (text)
- `emergency_unlock_enabled` (boolean)
- `finalized_at` (timestamptz)
- `finalized_by` (text)

---

## 3. WEEK_ITEM_VOLUMES TABLE

### Structure
- `id` (uuid, primary key)
- `week_id` (uuid, FK to weeks)
- `item_id` (uuid, FK to items)
- `volume_needed` (integer) - **SEED VOLUME** - Total cases needed per SKU per week
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- **UNIQUE constraint**: `(week_id, item_id)` - One volume need per item per week

---

## 4. ITEMS TABLE

### Columns
- `id` (uuid, primary key)
- `name` (text)
- `pack_size` (text)
- `category` (text) - CHECK: 'strawberry' | 'blueberry' | 'blackberry' | 'raspberry'
- `organic_flag` (text) - CHECK: 'CONV' | 'ORG'
- `display_order` (integer)
- `unit_type` (text) - CHECK: 'pallets' | 'cases' (default: 'pallets')

---

## 5. SUPPLIERS TABLE

### Columns
- `id` (uuid, primary key)
- `name` (text, UNIQUE)
- `email` (text, UNIQUE)
- `created_at` (timestamptz)

---

## KEY FILES REFERENCE

### Migrations (in order)
1. `20260101010948_rebuild_pricing_portal_schema.sql` - Base schema (quotes, weeks, items, suppliers)
2. `20260101015659_add_volume_tracking.sql` - Adds `awarded_volume` to quotes
3. `20260101025001_add_volume_offer_and_response_fields.sql` - Adds volume response fields
4. `20260103015913_create_week_item_volumes_table.sql` - Creates week_item_volumes table
5. `20260106000002_fix_week_item_volumes_rls_and_auto_seed.sql` - Auto-seed trigger

### TypeScript Files
- `src/types.ts` - TypeScript interfaces matching schema
- `src/utils/database.ts` - Database functions
- `src/utils/supabase.ts` - Supabase client setup

---

## ANSWERS TO QUESTIONS

### Q1: Does quotes have a unique constraint on (week_id,item_id,supplier_id)?
**YES** - Line 164 in `20260101010948_rebuild_pricing_portal_schema.sql`:
```sql
UNIQUE(week_id, item_id, supplier_id)
```

### Q2: What are the exact columns on quotes related to pricing + awarded volume?

**Pricing Columns:**
- `supplier_fob` (decimal 10,2)
- `supplier_dlvd` (decimal 10,2)
- `rf_counter_fob` (decimal 10,2)
- `supplier_response` (text: 'accept' | 'revise')
- `supplier_revised_fob` (decimal 10,2)
- `rf_final_fob` (decimal 10,2) ⭐ **KEY: Final price per quote**

**Volume/Award Columns:**
- `awarded_volume` (integer) ⭐ **KEY: Draft allocation → final**
- `offered_volume` (numeric) - Sent to supplier
- `supplier_volume_response` (text: 'accept' | 'update' | 'decline')
- `supplier_volume_accepted` (numeric) - Supplier's response
- `supplier_volume_response_notes` (text)

### Q3: Are week statuses enum'd? What exact values exist?
**YES** (CHECK constraint, not PostgreSQL enum):
- `'open'` - Week is open for pricing submissions
- `'finalized'` - Pricing finalized, volume allocation unlocked
- `'closed'` - Week is closed/locked (read-only)

Defined in: `20260101010948_rebuild_pricing_portal_schema.sql` line 84:
```sql
status text NOT NULL DEFAULT 'closed' CHECK (status IN ('open', 'finalized', 'closed'))
```

