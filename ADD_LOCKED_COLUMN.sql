-- ============================================================
-- EMERGENCY FIX - Add locked column to week_item_volumes
-- ============================================================
-- Run this in Supabase SQL Editor immediately
-- This adds the missing 'locked' column that prevents the
-- "Send Allocations to Suppliers" button from enabling
-- ============================================================

-- Add locked column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'week_item_volumes' 
    AND column_name = 'locked'
  ) THEN
    ALTER TABLE public.week_item_volumes
    ADD COLUMN locked boolean DEFAULT false NOT NULL;
    
    COMMENT ON COLUMN public.week_item_volumes.locked IS 'Whether this SKU is locked (allocation complete and cannot be edited)';
    
    RAISE NOTICE 'Successfully added locked column to week_item_volumes';
  ELSE
    RAISE NOTICE 'locked column already exists in week_item_volumes';
  END IF;
END $$;
