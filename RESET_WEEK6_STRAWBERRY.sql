-- Reset Week 6 with Strawberry 4×2 lb CONV pricing
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  week6_id uuid;
  strawberry_item_id uuid;
  supplier_rec RECORD;
  quote_count integer := 0;
BEGIN
  -- Get Week 6 ID
  SELECT id INTO week6_id FROM weeks WHERE week_number = 6 LIMIT 1;
  
  IF week6_id IS NULL THEN
    RAISE EXCEPTION 'Week 6 not found';
  END IF;

  -- Find or create strawberry 4×2 lb CONV item
  SELECT id INTO strawberry_item_id 
  FROM items 
  WHERE name = 'Strawberry' 
    AND (organic_flag IS NULL OR organic_flag = 'CONV')
    AND (
      pack_size ILIKE '%4%2%lb%' 
      OR pack_size ILIKE '%4×2%lb%'
      OR pack_size ILIKE '%4 x 2%lb%'
    )
    AND pack_size NOT ILIKE '2%lb%'
  LIMIT 1;

  -- If not found, create it
  IF strawberry_item_id IS NULL THEN
    INSERT INTO items (name, pack_size, category, organic_flag, display_order)
    VALUES ('Strawberry', '4×2 lb', 'strawberry', 'CONV', 1)
    ON CONFLICT DO NOTHING
    RETURNING id INTO strawberry_item_id;
    
    -- If still null, try to get it
    IF strawberry_item_id IS NULL THEN
      SELECT id INTO strawberry_item_id 
      FROM items 
      WHERE name = 'Strawberry' 
        AND pack_size = '4×2 lb'
        AND (organic_flag IS NULL OR organic_flag = 'CONV')
      LIMIT 1;
    END IF;
  END IF;

  IF strawberry_item_id IS NULL THEN
    RAISE EXCEPTION 'Failed to find or create strawberry 4×2 lb CONV item';
  END IF;

  -- Delete existing quotes for strawberry in week 6
  DELETE FROM quotes 
  WHERE week_id = week6_id 
    AND item_id = strawberry_item_id;

  -- Create quotes for all suppliers
  FOR supplier_rec IN SELECT id, name FROM suppliers LOOP
    INSERT INTO quotes (
      week_id, 
      item_id, 
      supplier_id, 
      supplier_fob, 
      rf_final_fob, 
      supplier_pricing_finalized,
      created_at,
      updated_at
    )
    VALUES (
      week6_id,
      strawberry_item_id,
      supplier_rec.id,
      ROUND((10.50 + (quote_count * 0.25) + (random() * 0.50 - 0.25))::numeric, 2),
      ROUND((10.50 + (quote_count * 0.20) + (random() * 0.40 - 0.20))::numeric, 2),
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (week_id, item_id, supplier_id) 
    DO UPDATE SET
      supplier_fob = EXCLUDED.supplier_fob,
      rf_final_fob = EXCLUDED.rf_final_fob,
      supplier_pricing_finalized = true,
      updated_at = NOW();
    
    quote_count := quote_count + 1;
  END LOOP;

  -- Ensure volume need exists
  INSERT INTO week_item_volumes (week_id, item_id, volume_needed, updated_at)
  VALUES (week6_id, strawberry_item_id, 1000, NOW())
  ON CONFLICT (week_id, item_id) 
  DO UPDATE SET 
    volume_needed = 1000,
    updated_at = NOW();

  -- Create pricing calculations
  INSERT INTO item_pricing_calculations (
    week_id, 
    item_id, 
    avg_price, 
    rebate, 
    freight, 
    margin, 
    dlvd_price,
    updated_at
  )
  SELECT 
    week6_id,
    strawberry_item_id,
    AVG(rf_final_fob)::numeric(10,2),
    0.85,
    1.50,
    1.50,
    (AVG(rf_final_fob) + 0.85 + 1.50 + 1.50)::numeric(10,2),
    NOW()
  FROM quotes
  WHERE week_id = week6_id AND item_id = strawberry_item_id
  ON CONFLICT (week_id, item_id)
  DO UPDATE SET
    avg_price = EXCLUDED.avg_price,
    rebate = 0.85,
    freight = 1.50,
    margin = 1.50,
    dlvd_price = EXCLUDED.dlvd_price,
    updated_at = NOW();

  RAISE NOTICE 'Success! Created % quotes for strawberry 4×2 lb CONV in Week 6 (Item ID: %)', quote_count, strawberry_item_id;
END $$;

-- Verify the data was created
SELECT 
  q.id,
  s.name as supplier_name,
  i.name as item_name,
  i.pack_size,
  i.organic_flag,
  q.supplier_fob,
  q.rf_final_fob,
  q.supplier_pricing_finalized
FROM quotes q
JOIN items i ON q.item_id = i.id
JOIN suppliers s ON q.supplier_id = s.id
JOIN weeks w ON q.week_id = w.id
WHERE w.week_number = 6
  AND i.name = 'Strawberry'
  AND (i.organic_flag IS NULL OR i.organic_flag = 'CONV')
ORDER BY s.name;
