-- SCHEMA FIX: Add missing columns to match frontend expectations
-- DO NOT DROP TABLES - Only ALTER TABLE to add missing columns

-- ============================================================================
-- 1. ITEMS TABLE
-- ============================================================================
-- Expected columns: id, name, pack_size, category, organic_flag, display_order, unit_type, created_at

DO $$
BEGIN
  -- Add pack_size if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'pack_size') THEN
    ALTER TABLE items ADD COLUMN pack_size text;
  END IF;

  -- Add category if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'category') THEN
    ALTER TABLE items ADD COLUMN category text;
  END IF;

  -- Add organic_flag if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'organic_flag') THEN
    ALTER TABLE items ADD COLUMN organic_flag text;
  END IF;

  -- Add display_order if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'display_order') THEN
    ALTER TABLE items ADD COLUMN display_order integer DEFAULT 0;
  END IF;

  -- Add unit_type if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'unit_type') THEN
    ALTER TABLE items ADD COLUMN unit_type text DEFAULT 'cases';
  END IF;
END $$;

-- ============================================================================
-- 2. WEEKS TABLE
-- ============================================================================
-- Expected columns: id, week_number, start_date, end_date, status, emergency_unlock_enabled, emergency_unlock_reason, emergency_unlock_by_user, emergency_unlock_at, finalized_at, finalized_by, allocation_submitted, allocation_submitted_at, allocation_submitted_by, volume_finalized, volume_finalized_at, volume_finalized_by, created_at

DO $$
BEGIN
  -- Add end_date if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'end_date') THEN
    ALTER TABLE weeks ADD COLUMN end_date date;
  END IF;

  -- Add emergency_unlock_enabled if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'emergency_unlock_enabled') THEN
    ALTER TABLE weeks ADD COLUMN emergency_unlock_enabled boolean DEFAULT false;
  END IF;

  -- Add emergency_unlock_reason if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'emergency_unlock_reason') THEN
    ALTER TABLE weeks ADD COLUMN emergency_unlock_reason text;
  END IF;

  -- Add emergency_unlock_by_user if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'emergency_unlock_by_user') THEN
    ALTER TABLE weeks ADD COLUMN emergency_unlock_by_user text;
  END IF;

  -- Add emergency_unlock_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'emergency_unlock_at') THEN
    ALTER TABLE weeks ADD COLUMN emergency_unlock_at timestamptz;
  END IF;

  -- Add finalized_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'finalized_at') THEN
    ALTER TABLE weeks ADD COLUMN finalized_at timestamptz;
  END IF;

  -- Add finalized_by if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'finalized_by') THEN
    ALTER TABLE weeks ADD COLUMN finalized_by text;
  END IF;

  -- Add allocation_submitted if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'allocation_submitted') THEN
    ALTER TABLE weeks ADD COLUMN allocation_submitted boolean DEFAULT false;
  END IF;

  -- Add allocation_submitted_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'allocation_submitted_at') THEN
    ALTER TABLE weeks ADD COLUMN allocation_submitted_at timestamptz;
  END IF;

  -- Add allocation_submitted_by if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'allocation_submitted_by') THEN
    ALTER TABLE weeks ADD COLUMN allocation_submitted_by text;
  END IF;

  -- Add volume_finalized if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'volume_finalized') THEN
    ALTER TABLE weeks ADD COLUMN volume_finalized boolean DEFAULT false;
  END IF;

  -- Add volume_finalized_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'volume_finalized_at') THEN
    ALTER TABLE weeks ADD COLUMN volume_finalized_at timestamptz;
  END IF;

  -- Add volume_finalized_by if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weeks' AND column_name = 'volume_finalized_by') THEN
    ALTER TABLE weeks ADD COLUMN volume_finalized_by text;
  END IF;
END $$;

-- ============================================================================
-- 3. QUOTES TABLE (may be named 'negotiations' in old schema)
-- ============================================================================
-- Expected columns: id, week_id, item_id, supplier_id, supplier_fob, supplier_dlvd, rf_counter_fob, supplier_response, supplier_revised_fob, rf_final_fob, supplier_eligibility_status, offered_volume, supplier_volume_response, supplier_volume_accepted, supplier_volume_response_notes, awarded_volume, supplier_volume_approval, supplier_volume_notes, supplier_pricing_finalized, supplier_pricing_finalized_at, created_at, updated_at

-- First, check if table is named 'quotes' or 'negotiations'
DO $$
BEGIN
  -- If 'negotiations' exists but 'quotes' doesn't, rename it
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'negotiations')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN
    ALTER TABLE negotiations RENAME TO quotes;
  END IF;
END $$;

-- Now add missing columns to quotes table
DO $$
BEGIN
  -- Add supplier_fob if missing (may be named current_fob_price in old schema)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_fob') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'current_fob_price') THEN
      ALTER TABLE quotes RENAME COLUMN current_fob_price TO supplier_fob;
    ELSE
      ALTER TABLE quotes ADD COLUMN supplier_fob numeric(10,2);
    END IF;
  END IF;

  -- Add supplier_dlvd if missing (may be named current_dlvd_price in old schema)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_dlvd') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'current_dlvd_price') THEN
      ALTER TABLE quotes RENAME COLUMN current_dlvd_price TO supplier_dlvd;
    ELSE
      ALTER TABLE quotes ADD COLUMN supplier_dlvd numeric(10,2);
    END IF;
  END IF;

  -- Add rf_counter_fob if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'rf_counter_fob') THEN
    ALTER TABLE quotes ADD COLUMN rf_counter_fob numeric(10,2);
  END IF;

  -- Add supplier_response if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_response') THEN
    ALTER TABLE quotes ADD COLUMN supplier_response text;
  END IF;

  -- Add supplier_revised_fob if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_revised_fob') THEN
    ALTER TABLE quotes ADD COLUMN supplier_revised_fob numeric(10,2);
  END IF;

  -- Add rf_final_fob if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'rf_final_fob') THEN
    ALTER TABLE quotes ADD COLUMN rf_final_fob numeric(10,2);
  END IF;

  -- Add supplier_eligibility_status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_eligibility_status') THEN
    ALTER TABLE quotes ADD COLUMN supplier_eligibility_status text;
  END IF;

  -- Add offered_volume if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'offered_volume') THEN
    ALTER TABLE quotes ADD COLUMN offered_volume numeric;
  END IF;

  -- Add supplier_volume_response if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_volume_response') THEN
    ALTER TABLE quotes ADD COLUMN supplier_volume_response text;
  END IF;

  -- Add supplier_volume_accepted if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_volume_accepted') THEN
    ALTER TABLE quotes ADD COLUMN supplier_volume_accepted numeric;
  END IF;

  -- Add supplier_volume_response_notes if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_volume_response_notes') THEN
    ALTER TABLE quotes ADD COLUMN supplier_volume_response_notes text;
  END IF;

  -- Add awarded_volume if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'awarded_volume') THEN
    ALTER TABLE quotes ADD COLUMN awarded_volume numeric;
  END IF;

  -- Add supplier_volume_approval if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_volume_approval') THEN
    ALTER TABLE quotes ADD COLUMN supplier_volume_approval text;
  END IF;

  -- Add supplier_volume_notes if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_volume_notes') THEN
    ALTER TABLE quotes ADD COLUMN supplier_volume_notes text;
  END IF;

  -- Add supplier_pricing_finalized if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_pricing_finalized') THEN
    ALTER TABLE quotes ADD COLUMN supplier_pricing_finalized boolean DEFAULT false;
  END IF;

  -- Add supplier_pricing_finalized_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'supplier_pricing_finalized_at') THEN
    ALTER TABLE quotes ADD COLUMN supplier_pricing_finalized_at timestamptz;
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'updated_at') THEN
    ALTER TABLE quotes ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Ensure unique constraint on quotes (week_id, item_id, supplier_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'quotes_week_id_item_id_supplier_id_key'
    AND conrelid = 'quotes'::regclass
  ) THEN
    ALTER TABLE quotes ADD CONSTRAINT quotes_week_id_item_id_supplier_id_key UNIQUE (week_id, item_id, supplier_id);
  END IF;
END $$;

-- ============================================================================
-- 4. WEEK_ITEM_VOLUMES TABLE
-- ============================================================================
-- Expected columns: id, week_id, item_id, volume_needed, locked, created_at, updated_at

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'week_item_volumes') THEN
    CREATE TABLE week_item_volumes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      week_id uuid REFERENCES weeks(id) ON DELETE CASCADE NOT NULL,
      item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
      volume_needed numeric DEFAULT 0,
      locked boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE(week_id, item_id)
    );
  ELSE
    -- Table exists, add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'week_item_volumes' AND column_name = 'locked') THEN
      ALTER TABLE week_item_volumes ADD COLUMN locked boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'week_item_volumes' AND column_name = 'created_at') THEN
      ALTER TABLE week_item_volumes ADD COLUMN created_at timestamptz DEFAULT now();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'week_item_volumes' AND column_name = 'updated_at') THEN
      ALTER TABLE week_item_volumes ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 5. ITEM_PRICING_CALCULATIONS TABLE
-- ============================================================================
-- Expected columns: id, week_id, item_id, avg_price, dlvd_price, rebate, freight, margin, created_at, updated_at

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'item_pricing_calculations') THEN
    CREATE TABLE item_pricing_calculations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      week_id uuid REFERENCES weeks(id) ON DELETE CASCADE NOT NULL,
      item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
      avg_price numeric DEFAULT 0,
      dlvd_price numeric DEFAULT 0,
      rebate numeric DEFAULT 0,
      freight numeric DEFAULT 0,
      margin numeric DEFAULT 0,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE(week_id, item_id)
    );
  END IF;
END $$;

-- ============================================================================
-- 6. DRAFT_ALLOCATIONS TABLE
-- ============================================================================
-- Expected columns: id, week_id, item_id, supplier_id, drafted_volume, created_at, updated_at

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'draft_allocations') THEN
    CREATE TABLE draft_allocations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      week_id uuid REFERENCES weeks(id) ON DELETE CASCADE NOT NULL,
      item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
      supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
      drafted_volume integer DEFAULT 0,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE(week_id, item_id, supplier_id)
    );
  END IF;
END $$;

-- ============================================================================
-- 7. AUDIT_LOG TABLE
-- ============================================================================
-- Expected columns: id, week_id, item_id, supplier_id, field_changed, old_value, new_value, user_id, reason, created_at

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    CREATE TABLE audit_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      week_id uuid REFERENCES weeks(id) ON DELETE CASCADE NOT NULL,
      item_id uuid REFERENCES items(id) ON DELETE CASCADE,
      supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
      field_changed text NOT NULL,
      old_value text,
      new_value text,
      user_id text NOT NULL,
      reason text,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;
