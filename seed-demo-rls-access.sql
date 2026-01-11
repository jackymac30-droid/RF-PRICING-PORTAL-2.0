-- RLS ACCESS FOR DEMO
-- Run this in Supabase SQL Editor if your app shows empty data after seeding
-- 
-- IMPORTANT: Replace 'YOUR-UUID-HERE' with your actual auth.uid() value (see Option 1)
-- Then run the CREATE POLICY statements OR use Option 2 (faster for demo)
--
-- Re-enable RLS after demo for production!

-- ============================================================================
-- OPTION 1: Grant full access to your authenticated user
-- ============================================================================

-- Step 1: Find your user ID
-- Run this query first to get your UUID:
SELECT auth.uid() as current_user_id;

-- Step 2: Copy the UUID from step 1, then replace 'YOUR-UUID-HERE' below
-- Step 3: Run the CREATE POLICY statements below

-- Items
DROP POLICY IF EXISTS "temp_demo_user_items" ON items;
CREATE POLICY "temp_demo_user_items" ON items
  FOR ALL
  TO authenticated
  USING (auth.uid() = 'YOUR-UUID-HERE')
  WITH CHECK (auth.uid() = 'YOUR-UUID-HERE');

-- Suppliers
DROP POLICY IF EXISTS "temp_demo_user_suppliers" ON suppliers;
CREATE POLICY "temp_demo_user_suppliers" ON suppliers
  FOR ALL
  TO authenticated
  USING (auth.uid() = 'YOUR-UUID-HERE')
  WITH CHECK (auth.uid() = 'YOUR-UUID-HERE');

-- Weeks
DROP POLICY IF EXISTS "temp_demo_user_weeks" ON weeks;
CREATE POLICY "temp_demo_user_weeks" ON weeks
  FOR ALL
  TO authenticated
  USING (auth.uid() = 'YOUR-UUID-HERE')
  WITH CHECK (auth.uid() = 'YOUR-UUID-HERE');

-- Quotes
DROP POLICY IF EXISTS "temp_demo_user_quotes" ON quotes;
CREATE POLICY "temp_demo_user_quotes" ON quotes
  FOR ALL
  TO authenticated
  USING (auth.uid() = 'YOUR-UUID-HERE')
  WITH CHECK (auth.uid() = 'YOUR-UUID-HERE');

-- Week Item Volumes
DROP POLICY IF EXISTS "temp_demo_user_week_item_volumes" ON week_item_volumes;
CREATE POLICY "temp_demo_user_week_item_volumes" ON week_item_volumes
  FOR ALL
  TO authenticated
  USING (auth.uid() = 'YOUR-UUID-HERE')
  WITH CHECK (auth.uid() = 'YOUR-UUID-HERE');

-- ============================================================================
-- OPTION 2: Temporarily disable RLS (FASTEST FOR DEMO - RECOMMENDED)
-- ============================================================================
-- WARNING: Only use for demo! Re-enable after demo for production.

-- Disable RLS (run this before demo - UNCOMMENT these lines):
/*
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE week_item_volumes DISABLE ROW LEVEL SECURITY;
*/

-- Re-enable RLS (run this after demo - UNCOMMENT these lines):
/*
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_item_volumes ENABLE ROW LEVEL SECURITY;
*/
