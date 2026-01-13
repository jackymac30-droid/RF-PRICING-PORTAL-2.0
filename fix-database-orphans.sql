-- FINAL NO-MANUAL-SQL FIX: Auto-generated SQL to clean orphans, add FKs, reload cache
-- This SQL will be executed automatically by the app if needed

-- 1. Clean orphaned quotes (quotes with invalid week_id, item_id, or supplier_id)
DELETE FROM quotes 
WHERE week_id NOT IN (SELECT id FROM weeks)
   OR item_id NOT IN (SELECT id FROM items)
   OR supplier_id NOT IN (SELECT id FROM suppliers);

-- 2. Ensure foreign key constraints exist (if they don't already)
-- Note: These may already exist, but we ensure they're there
DO $$
BEGIN
  -- Add FK for quotes.week_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'quotes_week_id_fkey' 
    AND conrelid = 'quotes'::regclass
  ) THEN
    ALTER TABLE quotes 
    ADD CONSTRAINT quotes_week_id_fkey 
    FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE;
  END IF;

  -- Add FK for quotes.item_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'quotes_item_id_fkey' 
    AND conrelid = 'quotes'::regclass
  ) THEN
    ALTER TABLE quotes 
    ADD CONSTRAINT quotes_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE;
  END IF;

  -- Add FK for quotes.supplier_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'quotes_supplier_id_fkey' 
    AND conrelid = 'quotes'::regclass
  ) THEN
    ALTER TABLE quotes 
    ADD CONSTRAINT quotes_supplier_id_fkey 
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Reload PostgREST schema cache (via NOTIFY)
NOTIFY pgrst, 'reload schema';

-- 4. Analyze tables for better query performance
ANALYZE quotes;
ANALYZE weeks;
ANALYZE items;
ANALYZE suppliers;

-- FINAL NO-MANUAL-SQL FIX: Database cleanup complete
