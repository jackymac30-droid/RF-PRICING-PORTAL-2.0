-- VERIFICATION QUERIES
-- Run these after seeding to verify data

-- 1. Items count (should be 8)
SELECT COUNT(*) as item_count FROM items;
SELECT name, pack_size, organic_flag, display_order FROM items ORDER BY display_order;

-- 2. Suppliers count (should be 5)
SELECT COUNT(*) as supplier_count FROM suppliers;
SELECT name, email FROM suppliers ORDER BY name;

-- 3. Weeks count and status (should be 8, weeks 1-7 finalized, week 8 open)
SELECT 
  week_number, 
  status, 
  allocation_submitted,
  start_date,
  end_date
FROM weeks 
ORDER BY week_number;

-- 4. Quotes count per week
SELECT 
  w.week_number,
  COUNT(q.id) as quote_count,
  COUNT(DISTINCT q.supplier_id) as supplier_count,
  COUNT(DISTINCT q.item_id) as item_count,
  COUNT(q.rf_final_fob) as finalized_count
FROM weeks w
LEFT JOIN quotes q ON q.week_id = w.id
GROUP BY w.week_number, w.status
ORDER BY w.week_number;

-- 5. Week 8 should NOT have Berry Farms quotes
SELECT 
  s.name as supplier_name,
  COUNT(q.id) as quote_count
FROM quotes q
JOIN suppliers s ON s.id = q.supplier_id
JOIN weeks w ON w.id = q.week_id
WHERE w.week_number = 8
GROUP BY s.name
ORDER BY s.name;
-- Berry Farms should NOT appear here

-- 6. Volume needs count (should be 8 items × 7 weeks = 56)
SELECT 
  w.week_number,
  COUNT(v.id) as volume_need_count
FROM weeks w
LEFT JOIN week_item_volumes v ON v.week_id = w.id
WHERE w.week_number <= 7
GROUP BY w.week_number
ORDER BY w.week_number;

-- 7. Awarded volumes count (should have some for weeks 1-7)
SELECT 
  w.week_number,
  COUNT(CASE WHEN q.awarded_volume > 0 THEN 1 END) as awarded_count,
  SUM(q.awarded_volume) as total_awarded
FROM weeks w
JOIN quotes q ON q.week_id = w.id
WHERE w.week_number <= 7
GROUP BY w.week_number
ORDER BY w.week_number;

-- 8. Final summary
SELECT 
  (SELECT COUNT(*) FROM items) as items,
  (SELECT COUNT(*) FROM suppliers) as suppliers,
  (SELECT COUNT(*) FROM weeks) as weeks,
  (SELECT COUNT(*) FROM quotes) as quotes,
  (SELECT COUNT(*) FROM week_item_volumes) as volume_needs,
  (SELECT COUNT(*) FROM quotes WHERE awarded_volume > 0) as awarded_quotes;
