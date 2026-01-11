-- ============================================
-- OPTIMIZE WEEKS QUERIES FOR SCALABILITY
-- ============================================
-- Run this SQL to add indexes and optimize queries
-- ============================================

-- 1. Add composite index for common week queries (status + week_number)
CREATE INDEX IF NOT EXISTS idx_weeks_status_week_number 
  ON weeks(status, week_number DESC);

-- 2. Add index for date-based queries
CREATE INDEX IF NOT EXISTS idx_weeks_end_date 
  ON weeks(end_date DESC);

-- 3. Add index for quotes with final pricing (most common analytics query)
CREATE INDEX IF NOT EXISTS idx_quotes_week_final_price 
  ON quotes(week_id) 
  WHERE rf_final_fob IS NOT NULL;

-- 4. Add index for quotes by week and item (common in analytics)
CREATE INDEX IF NOT EXISTS idx_quotes_week_item 
  ON quotes(week_id, item_id);

-- 5. Add index for volume queries
CREATE INDEX IF NOT EXISTS idx_week_item_volumes_week 
  ON week_item_volumes(week_id);

-- 6. Add index for pricing calculations
CREATE INDEX IF NOT EXISTS idx_pricing_calc_week_item 
  ON item_pricing_calculations(week_id, item_id);

-- 7. Verify indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('weeks', 'quotes', 'week_item_volumes', 'item_pricing_calculations')
ORDER BY tablename, indexname;

-- 8. Analyze tables to update statistics (helps query planner)
ANALYZE weeks;
ANALYZE quotes;
ANALYZE week_item_volumes;
ANALYZE item_pricing_calculations;

-- ============================================
-- OPTIONAL: Add archiving column for future use
-- ============================================
-- Uncomment when ready to implement archiving:
-- ALTER TABLE weeks ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
-- CREATE INDEX IF NOT EXISTS idx_weeks_archived ON weeks(archived);
