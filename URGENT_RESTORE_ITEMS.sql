-- URGENT: RESTORE ITEMS - Run this in Supabase SQL Editor immediately
-- This will restore the 8 canonical SKUs without deleting anything

-- Insert the 8 standard SKUs
INSERT INTO items (name, pack_size, category, organic_flag, display_order)
VALUES
  ('Strawberry', '4×2 lb', 'strawberry', 'CONV', 1),
  ('Strawberry', '8×1 lb', 'strawberry', 'ORG', 2),
  ('Blueberry', '18 oz', 'blueberry', 'CONV', 3),
  ('Blueberry', 'Pint', 'blueberry', 'ORG', 4),
  ('Blackberry', '12ozx6', 'blackberry', 'CONV', 5),
  ('Blackberry', '12ozx6', 'blackberry', 'ORG', 6),
  ('Raspberry', '12ozx6', 'raspberry', 'CONV', 7),
  ('Raspberry', '12ozx6', 'raspberry', 'ORG', 8)
ON CONFLICT DO NOTHING;
