-- SCHEMA FIXES FOR DEMO SEEDING
-- Run this ONLY if the seed script fails with "column does not exist" errors
-- These are safe ALTER TABLE statements that won't break existing data

-- ============================================================================
-- QUOTES TABLE FIXES
-- ============================================================================

-- rf_final_fob (finalized FOB price)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'rf_final_fob'
  ) THEN
    ALTER TABLE quotes ADD COLUMN rf_final_fob decimal(10,2);
    COMMENT ON COLUMN quotes.rf_final_fob IS 'RF final FOB price after negotiation';
  END IF;
END $$;

-- awarded_volume (volume awarded to supplier)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'awarded_volume'
  ) THEN
    ALTER TABLE quotes ADD COLUMN awarded_volume integer;
    COMMENT ON COLUMN quotes.awarded_volume IS 'Volume awarded to supplier (cases)';
  END IF;
END $$;

-- supplier_dlvd (supplier delivered price)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'supplier_dlvd'
  ) THEN
    ALTER TABLE quotes ADD COLUMN supplier_dlvd decimal(10,2);
    COMMENT ON COLUMN quotes.supplier_dlvd IS 'Supplier delivered price';
  END IF;
END $$;

-- ============================================================================
-- WEEKS TABLE FIXES
-- ============================================================================

-- allocation_submitted (flag for allocation submission)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'weeks' AND column_name = 'allocation_submitted'
  ) THEN
    ALTER TABLE weeks ADD COLUMN allocation_submitted boolean DEFAULT false;
    COMMENT ON COLUMN weeks.allocation_submitted IS 'Whether allocations have been submitted to suppliers';
  END IF;
END $$;

-- ============================================================================
-- WEEK_ITEM_VOLUMES TABLE FIXES
-- ============================================================================

-- locked (lock status for volume needs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'week_item_volumes' AND column_name = 'locked'
  ) THEN
    ALTER TABLE week_item_volumes ADD COLUMN locked boolean DEFAULT false;
    COMMENT ON COLUMN week_item_volumes.locked IS 'Whether volume allocation is locked';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify columns exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('quotes', 'weeks', 'week_item_volumes')
  AND column_name IN ('rf_final_fob', 'awarded_volume', 'supplier_dlvd', 'allocation_submitted', 'locked')
ORDER BY table_name, column_name;
