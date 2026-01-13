-- ============================================
-- DEMO-READY SEED: 8 WEEKS, 5 SUPPLIERS, BERRY FARMS GAP
-- Run this in Supabase SQL Editor
-- Matches demo-magic-button.ts requirements
-- ============================================

-- Clear existing data (optional - uncomment if you want fresh start)
-- WARNING: This deletes ALL existing data!
-- DELETE FROM quotes;
-- DELETE FROM week_item_volumes;
-- DELETE FROM item_pricing_calculations;
-- DELETE FROM weeks;
-- DELETE FROM items;
-- DELETE FROM suppliers;

-- ============================================
-- 1. SUPPLIERS (5 suppliers including Berry Farms)
-- ============================================
INSERT INTO suppliers (name, email) VALUES
  ('Berry Farms', 'contact@berryfarms.com'),
  ('Fresh Farms Inc', 'supplier1@freshfarms.com'),
  ('Organic Growers', 'supplier2@organicgrowers.com'),
  ('Valley Fresh', 'supplier3@valleyfresh.com'),
  ('Premium Produce', 'supplier4@premiumproduce.com')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. ITEMS (8 berry SKUs with correct names/pack_sizes, category 'berry')
-- ============================================
INSERT INTO items (name, pack_size, category, organic_flag, display_order) VALUES
  ('Strawberry', '4×2 lb', 'berry', 'CONV', 1),
  ('Strawberry', '8×1 lb', 'berry', 'ORG', 2),
  ('Blueberry', '18 oz', 'berry', 'CONV', 3),
  ('Blueberry', 'Pint', 'berry', 'ORG', 4),
  ('Blackberry', '12ozx6', 'berry', 'CONV', 5),
  ('Blackberry', '12ozx6', 'berry', 'ORG', 6),
  ('Raspberry', '12ozx6', 'berry', 'CONV', 7),
  ('Raspberry', '12ozx6', 'berry', 'ORG', 8)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. WEEKS (8 weeks with recent dates - base today - 28 days)
-- Weeks 1-7: finalized, Week 8: open
-- ============================================
-- Calculate dates: Week 1 starts 28 days ago, each week is 7 days
DO $$
DECLARE
  base_date DATE := CURRENT_DATE - 28;
  week_num INTEGER;
  week_start DATE;
  week_end DATE;
  week_status TEXT;
  week_submitted BOOLEAN;
BEGIN
  FOR week_num IN 1..8 LOOP
    week_start := base_date + (week_num - 1) * 7;
    week_end := week_start + 6;
    
    IF week_num <= 7 THEN
      week_status := 'finalized';
      week_submitted := TRUE;
    ELSE
      week_status := 'open';
      week_submitted := FALSE;
    END IF;
    
    INSERT INTO weeks (week_number, start_date, end_date, status, allocation_submitted)
    VALUES (week_num, week_start, week_end, week_status, week_submitted)
    ON CONFLICT (week_number) DO UPDATE
    SET start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        status = EXCLUDED.status,
        allocation_submitted = EXCLUDED.allocation_submitted;
  END LOOP;
END $$;

-- ============================================
-- 4. QUOTES (Weeks 1-7: full coverage, Week 8: missing Berry Farms)
-- ============================================
DO $$
DECLARE
  supplier_rec RECORD;
  item_rec RECORD;
  week_rec RECORD;
  berry_farms_id UUID;
  supplier_fob_val NUMERIC;
  supplier_dlvd_val NUMERIC;
  rf_final_fob_val NUMERIC;
  awarded_volume_val INTEGER;
  is_week_8 BOOLEAN;
BEGIN
  -- Get Berry Farms ID
  SELECT id INTO berry_farms_id FROM suppliers WHERE email = 'contact@berryfarms.com';
  
  -- Loop through weeks
  FOR week_rec IN SELECT * FROM weeks ORDER BY week_number LOOP
    is_week_8 := week_rec.week_number = 8;
    
    -- Loop through suppliers
    FOR supplier_rec IN SELECT * FROM suppliers ORDER BY name LOOP
      -- Week 8: Skip Berry Farms (intentional gap for demo)
      IF is_week_8 AND supplier_rec.id = berry_farms_id THEN
        CONTINUE;
      END IF;
      
      -- Loop through items
      FOR item_rec IN SELECT * FROM items ORDER BY display_order LOOP
        -- Generate realistic pricing
        supplier_fob_val := ROUND((8.5 + RANDOM() * 4.5)::numeric, 2);
        supplier_dlvd_val := ROUND((supplier_fob_val + 1.5 + RANDOM() * 1.5)::numeric, 2);
        
        -- Weeks 1-7: Set rf_final_fob (finalized)
        IF week_rec.week_number <= 7 THEN
          rf_final_fob_val := ROUND((supplier_fob_val + (RANDOM() - 0.5) * 2.0)::numeric, 2);
          awarded_volume_val := 100 + FLOOR(RANDOM() * 900)::INTEGER;
        ELSE
          rf_final_fob_val := NULL;
          awarded_volume_val := 0;
        END IF;
        
        -- Insert quote
        INSERT INTO quotes (
          week_id,
          item_id,
          supplier_id,
          supplier_fob,
          supplier_dlvd,
          rf_final_fob,
          awarded_volume
        ) VALUES (
          week_rec.id,
          item_rec.id,
          supplier_rec.id,
          supplier_fob_val,
          supplier_dlvd_val,
          rf_final_fob_val,
          awarded_volume_val
        )
        ON CONFLICT (week_id, item_id, supplier_id) DO UPDATE
        SET supplier_fob = EXCLUDED.supplier_fob,
            supplier_dlvd = EXCLUDED.supplier_dlvd,
            rf_final_fob = EXCLUDED.rf_final_fob,
            awarded_volume = EXCLUDED.awarded_volume;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- 5. VOLUMES (Weeks 1-7 only - week_item_volumes)
-- ============================================
DO $$
DECLARE
  week_rec RECORD;
  item_rec RECORD;
  volume_val INTEGER;
BEGIN
  -- Only create volumes for weeks 1-7 (finalized weeks)
  FOR week_rec IN SELECT * FROM weeks WHERE week_number <= 7 ORDER BY week_number LOOP
    FOR item_rec IN SELECT * FROM items ORDER BY display_order LOOP
      volume_val := 800 + FLOOR(RANDOM() * 400); -- 800-1200 cases
      
      INSERT INTO week_item_volumes (week_id, item_id, volume_needed, locked)
      VALUES (week_rec.id, item_rec.id, volume_val, FALSE)
      ON CONFLICT (week_id, item_id) DO UPDATE
      SET volume_needed = EXCLUDED.volume_needed,
          locked = EXCLUDED.locked;
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- 6. VERIFICATION
-- ============================================
SELECT 
  (SELECT COUNT(*) FROM suppliers) as supplier_count,
  (SELECT COUNT(*) FROM items) as item_count,
  (SELECT COUNT(*) FROM weeks) as week_count,
  (SELECT COUNT(*) FROM quotes) as quote_count,
  (SELECT COUNT(*) FROM week_item_volumes) as volume_count,
  (SELECT COUNT(*) FROM weeks WHERE status = 'finalized') as finalized_weeks,
  (SELECT COUNT(*) FROM weeks WHERE status = 'open') as open_weeks,
  (SELECT COUNT(*) FROM quotes q
   JOIN suppliers s ON q.supplier_id = s.id
   JOIN weeks w ON q.week_id = w.id
   WHERE w.week_number = 8 AND s.email = 'contact@berryfarms.com') as week8_berry_farms_quotes;

-- Expected results:
-- supplier_count: 5
-- item_count: 8
-- week_count: 8
-- quote_count: 280 (8 items × 5 suppliers × 7 weeks) + (8 items × 4 suppliers × 1 week) = 280 + 32 = 312
-- volume_count: 56 (8 items × 7 weeks)
-- finalized_weeks: 7
-- open_weeks: 1
-- week8_berry_farms_quotes: 0 (Berry Farms missing in week 8)
