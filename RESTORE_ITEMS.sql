-- RESTORE ITEMS - Safe insert only (does not delete anything)
-- Run this in Supabase SQL Editor to restore the 8 canonical SKUs

-- Insert the 8 standard SKUs (safe - uses ON CONFLICT to avoid duplicates)
INSERT INTO items (name, pack_size, category, organic_flag, display_order, unit_type)
VALUES
  ('Strawberry', '4×2 lb', 'strawberry', 'CONV', 1, 'cases'),
  ('Strawberry', '8×1 lb', 'strawberry', 'ORG', 2, 'cases'),
  ('Blueberry', '18 oz', 'blueberry', 'CONV', 3, 'cases'),
  ('Blueberry', 'Pint', 'blueberry', 'ORG', 4, 'cases'),
  ('Blackberry', '12ozx6', 'blackberry', 'CONV', 5, 'cases'),
  ('Blackberry', '12ozx6', 'blackberry', 'ORG', 6, 'cases'),
  ('Raspberry', '12ozx6', 'raspberry', 'CONV', 7, 'cases'),
  ('Raspberry', '12ozx6', 'raspberry', 'ORG', 8, 'cases')
ON CONFLICT DO NOTHING;

-- Verify items were inserted
SELECT COUNT(*) as item_count FROM items;
SELECT name, pack_size, organic_flag FROM items ORDER BY display_order;
