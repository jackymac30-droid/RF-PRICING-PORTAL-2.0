-- ============================================
-- VERIFY AND FIX FINALIZED PRICING
-- This checks if rf_final_fob is set for all quotes
-- ============================================

-- 1. CHECK CURRENT STATUS
SELECT 
  'Current Status' as check_type,
  (SELECT COUNT(*) FROM quotes WHERE rf_final_fob IS NOT NULL) as quotes_with_final_fob,
  (SELECT COUNT(*) FROM quotes WHERE rf_final_fob IS NULL AND supplier_fob IS NOT NULL) as quotes_missing_final_fob,
  (SELECT COUNT(DISTINCT supplier_id) FROM quotes WHERE rf_final_fob IS NOT NULL) as suppliers_with_finalized_pricing,
  (SELECT COUNT(*) FROM suppliers) as total_suppliers;

-- 2. CHECK BY WEEK
SELECT 
  w.week_number,
  w.status,
  COUNT(*) as total_quotes,
  COUNT(q.rf_final_fob) as quotes_with_final_fob,
  COUNT(DISTINCT q.supplier_id) FILTER (WHERE q.rf_final_fob IS NOT NULL) as suppliers_finalized,
  COUNT(DISTINCT q.supplier_id) as total_suppliers
FROM weeks w
LEFT JOIN quotes q ON q.week_id = w.id
GROUP BY w.week_number, w.status
ORDER BY w.week_number;

-- 3. FIX: Set rf_final_fob for all quotes in finalized weeks (weeks 1-7)
-- Use supplier_fob as the base if rf_final_fob is missing
UPDATE quotes q
SET rf_final_fob = q.supplier_fob,
    updated_at = NOW()
FROM weeks w
WHERE q.week_id = w.id
  AND w.week_number <= 7
  AND w.status = 'finalized'
  AND q.rf_final_fob IS NULL
  AND q.supplier_fob IS NOT NULL
  AND q.supplier_fob > 0;

-- 4. VERIFY AFTER FIX
SELECT 
  'After Fix' as check_type,
  (SELECT COUNT(*) FROM quotes WHERE rf_final_fob IS NOT NULL) as quotes_with_final_fob,
  (SELECT COUNT(*) FROM quotes WHERE rf_final_fob IS NULL AND supplier_fob IS NOT NULL) as quotes_missing_final_fob,
  (SELECT COUNT(DISTINCT supplier_id) FROM quotes WHERE rf_final_fob IS NOT NULL) as suppliers_with_finalized_pricing;

-- 5. CHECK BY SUPPLIER (to see which suppliers have finalized pricing)
SELECT 
  s.name as supplier_name,
  COUNT(*) as total_quotes,
  COUNT(q.rf_final_fob) as quotes_with_final_fob,
  ROUND((COUNT(q.rf_final_fob)::numeric / COUNT(*)::numeric * 100), 1) as percent_finalized
FROM suppliers s
LEFT JOIN quotes q ON q.supplier_id = s.id
LEFT JOIN weeks w ON q.week_id = w.id
WHERE w.week_number <= 7
GROUP BY s.id, s.name
ORDER BY s.name;
