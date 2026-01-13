-- ============================================
-- COPY THIS ENTIRE FILE AND PASTE INTO SUPABASE SQL EDITOR
-- Then click "Run" button
-- ============================================

-- Ensure required columns exist in quotes table
DO $$
BEGIN
  -- Add rf_counter_fob if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'rf_counter_fob'
  ) THEN
    ALTER TABLE quotes ADD COLUMN rf_counter_fob decimal(10, 2);
  END IF;
  
  -- Add supplier_response if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'supplier_response'
  ) THEN
    ALTER TABLE quotes ADD COLUMN supplier_response text CHECK (supplier_response IN ('accept', 'revise'));
  END IF;
  
  -- Add supplier_revised_fob if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'supplier_revised_fob'
  ) THEN
    ALTER TABLE quotes ADD COLUMN supplier_revised_fob decimal(10, 2);
  END IF;
  
  -- Add rf_final_fob if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'rf_final_fob'
  ) THEN
    ALTER TABLE quotes ADD COLUMN rf_final_fob decimal(10, 2);
  END IF;
  
  -- Add awarded_volume if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'awarded_volume'
  ) THEN
    ALTER TABLE quotes ADD COLUMN awarded_volume integer;
  END IF;
END $$;

-- 1. SUPPLIERS (5 suppliers including Berry Farms)
INSERT INTO suppliers (name, email)
SELECT * FROM (VALUES
  ('Berry Farms', 'contact@berryfarms.com'),
  ('Fresh Farms Inc', 'supplier1@freshfarms.com'),
  ('Organic Growers', 'supplier2@organicgrowers.com'),
  ('Valley Fresh', 'supplier3@valleyfresh.com'),
  ('Premium Produce', 'supplier4@premiumproduce.com')
) AS v(name, email)
WHERE NOT EXISTS (SELECT 1 FROM suppliers s WHERE s.email = v.email);

-- 2. ITEMS (8 berry SKUs)
INSERT INTO items (name, pack_size, category, organic_flag, display_order)
SELECT * FROM (VALUES
  ('Strawberry', '4×2 lb', 'berry', 'CONV', 1),
  ('Strawberry', '8×1 lb', 'berry', 'ORG', 2),
  ('Blueberry', '18 oz', 'berry', 'CONV', 3),
  ('Blueberry', 'Pint', 'berry', 'ORG', 4),
  ('Blackberry', '12ozx6', 'berry', 'CONV', 5),
  ('Blackberry', '12ozx6', 'berry', 'ORG', 6),
  ('Raspberry', '12ozx6', 'berry', 'CONV', 7),
  ('Raspberry', '12ozx6', 'berry', 'ORG', 8)
) AS v(name, pack_size, category, organic_flag, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM items i 
  WHERE i.name = v.name AND i.pack_size = v.pack_size
);

-- 3. WEEKS (8 weeks with recent dates)
DO $$
DECLARE
  base_date DATE := CURRENT_DATE - 28;
  week_num INTEGER;
  week_start DATE;
  week_end DATE;
  week_status TEXT;
  week_submitted BOOLEAN;
  week_exists BOOLEAN;
  week_name TEXT;
BEGIN
  FOR week_num IN 1..8 LOOP
    week_start := base_date + (week_num - 1) * 7;
    week_end := week_start + 6;
    week_name := 'Week ' || week_num::TEXT;
    
    IF week_num <= 7 THEN
      week_status := 'finalized';
      week_submitted := TRUE;
    ELSE
      week_status := 'open';
      week_submitted := FALSE;
    END IF;
    
    -- Check if week exists
    SELECT EXISTS(SELECT 1 FROM weeks WHERE week_number = week_num) INTO week_exists;
    
    IF week_exists THEN
      UPDATE weeks 
      SET name = week_name,
          start_date = week_start,
          end_date = week_end,
          status = week_status,
          allocation_submitted = week_submitted
      WHERE week_number = week_num;
    ELSE
      INSERT INTO weeks (week_number, name, start_date, end_date, status, allocation_submitted)
      VALUES (week_num, week_name, week_start, week_end, week_status, week_submitted);
    END IF;
  END LOOP;
END $$;

-- 4. QUOTES (Weeks 1-7 full coverage, Week 8 missing Berry Farms)
DO $$
DECLARE
  supplier_rec RECORD;
  item_rec RECORD;
  week_rec RECORD;
  berry_farms_id UUID;
  supplier_fob_val NUMERIC;
  rf_counter_fob_val NUMERIC;
  supplier_response_val TEXT;
  supplier_revised_fob_val NUMERIC;
  rf_final_fob_val NUMERIC;
  awarded_volume_val INTEGER;
  is_week_8 BOOLEAN;
  quote_exists BOOLEAN;
BEGIN
  SELECT id INTO berry_farms_id FROM suppliers WHERE email = 'contact@berryfarms.com';
  
  FOR week_rec IN SELECT * FROM weeks ORDER BY week_number LOOP
    is_week_8 := week_rec.week_number = 8;
    
    FOR supplier_rec IN SELECT * FROM suppliers ORDER BY name LOOP
      IF is_week_8 AND supplier_rec.id = berry_farms_id THEN
        CONTINUE;
      END IF;
      
      FOR item_rec IN SELECT * FROM items ORDER BY display_order LOOP
        supplier_fob_val := ROUND((8.5 + RANDOM() * 4.5)::numeric, 2);
        
        IF week_rec.week_number <= 7 THEN
          -- FINAL SLOW/FLOW FIX: Weeks 1-7 finalized - ALL suppliers finalized (rf_final_fob set)
          -- Full workflow: quoted → countered → finalized for ALL suppliers
          rf_counter_fob_val := ROUND((supplier_fob_val + (RANDOM() - 0.5) * 1.0)::numeric, 2);
          
          -- FINAL SLOW/FLOW FIX: Ensure ALL suppliers are finalized (no declined for weeks 1-7)
          supplier_response_val := 'accept';
          supplier_revised_fob_val := NULL;
          rf_final_fob_val := rf_counter_fob_val; -- Final = counter when accepted
          awarded_volume_val := 100 + FLOOR(RANDOM() * 900)::INTEGER;
        ELSIF week_rec.week_number = 8 THEN
          -- NEXT LEVEL FIX: Week 8 - 8 suppliers finalized (rf_final_fob set), 1 missing (Berry Farms)
          -- For non-Berry Farms suppliers: finalized workflow - ensures allocation tab shows finalized FOB for 8/9 shippers
          IF supplier_rec.id != berry_farms_id THEN
            rf_counter_fob_val := ROUND((supplier_fob_val + (RANDOM() - 0.5) * 1.0)::numeric, 2);
            supplier_response_val := 'accept';
            supplier_revised_fob_val := NULL;
            rf_final_fob_val := rf_counter_fob_val; -- NEXT LEVEL FIX: Finalized for 8 suppliers (Berry Farms missing)
            awarded_volume_val := 100 + FLOOR(RANDOM() * 900)::INTEGER;
          ELSE
            -- Berry Farms: no quote (already skipped above) - intentional gap for demo
            rf_counter_fob_val := NULL;
            supplier_response_val := NULL;
            supplier_revised_fob_val := NULL;
            rf_final_fob_val := NULL;
            awarded_volume_val := 0;
          END IF;
        ELSE
          -- Other weeks: Only supplier_fob set (quoted status), no counters or finalization yet
          rf_counter_fob_val := NULL;
          supplier_response_val := NULL;
          supplier_revised_fob_val := NULL;
          rf_final_fob_val := NULL;
          awarded_volume_val := 0;
        END IF;
        
        -- Check if quote exists
        SELECT EXISTS(
          SELECT 1 FROM quotes 
          WHERE week_id = week_rec.id 
          AND item_id = item_rec.id 
          AND supplier_id = supplier_rec.id
        ) INTO quote_exists;
        
        IF quote_exists THEN
          UPDATE quotes
          SET supplier_fob = supplier_fob_val,
              rf_counter_fob = rf_counter_fob_val,
              supplier_response = supplier_response_val,
              supplier_revised_fob = supplier_revised_fob_val,
              rf_final_fob = rf_final_fob_val,
              awarded_volume = awarded_volume_val
          WHERE week_id = week_rec.id 
          AND item_id = item_rec.id 
          AND supplier_id = supplier_rec.id;
        ELSE
          INSERT INTO quotes (
            week_id,
            item_id,
            supplier_id,
            supplier_fob,
            rf_counter_fob,
            supplier_response,
            supplier_revised_fob,
            rf_final_fob,
            awarded_volume
          ) VALUES (
            week_rec.id,
            item_rec.id,
            supplier_rec.id,
            supplier_fob_val,
            rf_counter_fob_val,
            supplier_response_val,
            supplier_revised_fob_val,
            rf_final_fob_val,
            awarded_volume_val
          );
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- 5. VOLUMES (Weeks 1-7 only)
DO $$
DECLARE
  week_rec RECORD;
  item_rec RECORD;
  volume_val INTEGER;
  volume_exists BOOLEAN;
BEGIN
  FOR week_rec IN SELECT * FROM weeks WHERE week_number <= 7 ORDER BY week_number LOOP
    FOR item_rec IN SELECT * FROM items ORDER BY display_order LOOP
      volume_val := 800 + FLOOR(RANDOM() * 400);
      
      -- Check if volume exists
      SELECT EXISTS(
        SELECT 1 FROM week_item_volumes 
        WHERE week_id = week_rec.id 
        AND item_id = item_rec.id
      ) INTO volume_exists;
      
      IF volume_exists THEN
        UPDATE week_item_volumes
        SET volume_needed = volume_val,
            locked = FALSE
        WHERE week_id = week_rec.id 
        AND item_id = item_rec.id;
      ELSE
        INSERT INTO week_item_volumes (week_id, item_id, volume_needed, locked)
        VALUES (week_rec.id, item_rec.id, volume_val, FALSE);
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- 6. VERIFICATION (shows you what was created)
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

-- ============================================
-- NEXT LEVEL FIXED — FAST & FINALIZED READY
-- NEXT LEVEL FIX: Weeks 1-7 all suppliers finalized (rf_final_fob set), Week 8 has 8 finalized (Berry Farms missing)
-- ============================================
