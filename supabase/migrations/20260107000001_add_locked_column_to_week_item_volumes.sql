/*
  # Add locked column to week_item_volumes table
  
  1. Changes
    - Add `locked` boolean column to `week_item_volumes` table
    - Default to false (unlocked)
    - Allows per-SKU locking for allocation workflow
  
  2. Purpose
    - Enables locking individual SKUs after allocation is complete
    - Required for "Send Allocations to Suppliers" button to work
*/

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
  END IF;
END $$;
