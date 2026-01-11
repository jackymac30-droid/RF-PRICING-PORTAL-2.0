/*
  # Seed Week 7 with Partial Submissions for Testing
  
  This script creates a realistic partial submission scenario:
  - Week 7: open status
  - 8 items (all SKUs)
  - 5 suppliers
  - Only 4 suppliers submitted quotes (Supplier E has none)
  - Additionally: Some suppliers only quoted 4 SKUs (partial matrix)
  
  Scenario:
  - Supplier A: All 8 SKUs quoted
  - Supplier B: All 8 SKUs quoted
  - Supplier C: Only 4 SKUs quoted (Strawberry CONV, Strawberry ORG, Blueberry CONV, Blueberry ORG)
  - Supplier D: All 8 SKUs quoted
  - Supplier E: No quotes (should not appear in allocation)
  
  This tests:
  1. Allocation tab only shows suppliers with quotes
  2. Send allocations works with partial submissions
  3. Supplier acceptance works for partial SKUs
  4. Acceptance tab handles partial data correctly
*/

-- Step 1: Create Week 7 if it doesn't exist
INSERT INTO weeks (week_number, start_date, end_date, status)
VALUES (7, '2025-01-13', '2025-01-19', 'open')
ON CONFLICT (week_number) DO UPDATE
SET status = 'open', start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

-- Get Week 7 ID
DO $$
DECLARE
  v_week_7_id uuid;
  v_supplier_a_id uuid;
  v_supplier_b_id uuid;
  v_supplier_c_id uuid;
  v_supplier_d_id uuid;
  v_supplier_e_id uuid;
  v_item_ids uuid[];
BEGIN
  -- Get Week 7 ID
  SELECT id INTO v_week_7_id FROM weeks WHERE week_number = 7;
  
  -- Get supplier IDs (assuming standard demo suppliers)
  SELECT id INTO v_supplier_a_id FROM suppliers WHERE name LIKE '%Fresh Farms%' OR email LIKE '%supplier1%' LIMIT 1;
  SELECT id INTO v_supplier_b_id FROM suppliers WHERE name LIKE '%Berry Best%' OR email LIKE '%supplier2%' LIMIT 1;
  SELECT id INTO v_supplier_c_id FROM suppliers WHERE name LIKE '%Organic Growers%' OR email LIKE '%supplier3%' LIMIT 1;
  SELECT id INTO v_supplier_d_id FROM suppliers WHERE name LIKE '%Valley Fresh%' OR email LIKE '%supplier4%' LIMIT 1;
  SELECT id INTO v_supplier_e_id FROM suppliers WHERE name LIKE '%Premium Produce%' OR email LIKE '%supplier5%' LIMIT 1;
  
  -- Get all item IDs (8 SKUs)
  SELECT ARRAY_AGG(id) INTO v_item_ids FROM items ORDER BY display_order LIMIT 8;
  
  -- If suppliers not found by name, use first 5 suppliers
  IF v_supplier_a_id IS NULL THEN
    SELECT id INTO v_supplier_a_id FROM suppliers ORDER BY name LIMIT 1 OFFSET 0;
  END IF;
  IF v_supplier_b_id IS NULL THEN
    SELECT id INTO v_supplier_b_id FROM suppliers ORDER BY name LIMIT 1 OFFSET 1;
  END IF;
  IF v_supplier_c_id IS NULL THEN
    SELECT id INTO v_supplier_c_id FROM suppliers ORDER BY name LIMIT 1 OFFSET 2;
  END IF;
  IF v_supplier_d_id IS NULL THEN
    SELECT id INTO v_supplier_d_id FROM suppliers ORDER BY name LIMIT 1 OFFSET 3;
  END IF;
  IF v_supplier_e_id IS NULL THEN
    SELECT id INTO v_supplier_e_id FROM suppliers ORDER BY name LIMIT 1 OFFSET 4;
  END IF;
  
  -- Step 2: Create base quotes for all supplier×item combinations (for structure)
  -- But only populate pricing for suppliers A, B, C, D (not E)
  INSERT INTO quotes (week_id, item_id, supplier_id, supplier_fob, supplier_dlvd)
  SELECT 
    v_week_7_id,
    item_id,
    supplier_id,
    CASE 
      -- Supplier E: No pricing (NULL)
      WHEN supplier_id = v_supplier_e_id THEN NULL
      -- Supplier C: Only price first 4 items (partial matrix)
      WHEN supplier_id = v_supplier_c_id AND array_position(v_item_ids, item_id) > 4 THEN NULL
      -- Others: Price all items
      ELSE 10.00 + (random() * 3.00) -- Random price between $10-13
    END,
    CASE 
      WHEN supplier_id = v_supplier_e_id THEN NULL
      WHEN supplier_id = v_supplier_c_id AND array_position(v_item_ids, item_id) > 4 THEN NULL
      ELSE 13.00 + (random() * 3.00) -- Random delivered price
    END
  FROM 
    (SELECT unnest(v_item_ids) AS item_id) items,
    (SELECT unnest(ARRAY[v_supplier_a_id, v_supplier_b_id, v_supplier_c_id, v_supplier_d_id, v_supplier_e_id]) AS supplier_id) suppliers
  ON CONFLICT (week_id, item_id, supplier_id) DO UPDATE
  SET 
    supplier_fob = EXCLUDED.supplier_fob,
    supplier_dlvd = EXCLUDED.supplier_dlvd,
    updated_at = NOW();
  
  -- Step 3: Create week_item_volumes entries for all items (seed volume)
  INSERT INTO week_item_volumes (week_id, item_id, volume_needed)
  SELECT v_week_7_id, id, 0
  FROM items
  ORDER BY display_order
  LIMIT 8
  ON CONFLICT (week_id, item_id) DO NOTHING;
  
  RAISE NOTICE 'Week 7 partial submission scenario created:';
  RAISE NOTICE '  - Supplier A: All 8 SKUs quoted';
  RAISE NOTICE '  - Supplier B: All 8 SKUs quoted';
  RAISE NOTICE '  - Supplier C: Only 4 SKUs quoted (partial matrix)';
  RAISE NOTICE '  - Supplier D: All 8 SKUs quoted';
  RAISE NOTICE '  - Supplier E: No quotes (should not appear in allocation)';
END $$;

-- Verify the setup
SELECT 
  s.name AS supplier,
  COUNT(q.id) FILTER (WHERE q.supplier_fob IS NOT NULL) AS quoted_skus,
  COUNT(q.id) AS total_quotes
FROM suppliers s
LEFT JOIN quotes q ON q.supplier_id = s.id AND q.week_id = (SELECT id FROM weeks WHERE week_number = 7)
WHERE s.id IN (
  SELECT id FROM suppliers ORDER BY name LIMIT 5
)
GROUP BY s.id, s.name
ORDER BY s.name;

