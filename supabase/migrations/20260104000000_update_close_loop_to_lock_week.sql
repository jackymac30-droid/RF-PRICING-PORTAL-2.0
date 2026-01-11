/*
  # Update Close Volume Loop to Lock Week Status

  1. Purpose
    - When RF closes the volume loop, the week status should be set to 'closed'
    - This prevents further changes to pricing and volumes
    - Emergency unlock allows RF to reopen for critical changes

  2. Changes
    - Update close_volume_loop function to set status = 'closed'
    - Keep volume_finalized flag for tracking
*/

CREATE OR REPLACE FUNCTION public.close_volume_loop(
  week_id_param uuid,
  user_name text
)
RETURNS TABLE (
  success boolean,
  message text,
  pending_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_pending_count integer := 0;
  v_unhandled_count integer := 0;
BEGIN
  -- Check 1: Pending supplier responses (supplier hasn't responded yet)
  SELECT COUNT(*)
  INTO v_pending_count
  FROM public.quotes
  WHERE week_id = week_id_param
    AND offered_volume > 0
    AND (supplier_volume_response IS NULL OR supplier_volume_response = '');
  
  -- If there are pending supplier responses, don't allow closing
  IF v_pending_count > 0 THEN
    RETURN QUERY SELECT false, 
      'Cannot close loop: ' || v_pending_count || ' supplier response(s) still pending. All suppliers must respond before closing.',
      v_pending_count;
    RETURN;
  END IF;
  
  -- Check 2: Unhandled supplier responses (RF hasn't accepted/revised them yet)
  -- A response is "handled" if:
  --   - Supplier declined (no action needed) OR
  --   - Supplier accepted/revised AND awarded_volume matches supplier_volume_accepted
  -- CRITICAL: If supplier responded with 'accept' or 'update', supplier_volume_accepted MUST be > 0
  -- This is a data integrity check - if supplier accepted/revised, they must have provided an accepted volume
  SELECT COUNT(*)
  INTO v_unhandled_count
  FROM public.quotes
  WHERE week_id = week_id_param
    AND offered_volume > 0
    AND supplier_volume_response IS NOT NULL
    AND supplier_volume_response != 'decline'
    AND (
      -- Data integrity check: if supplier responded with 'accept' or 'update', supplier_volume_accepted must be > 0
      (supplier_volume_response IN ('accept', 'update') AND (supplier_volume_accepted IS NULL OR supplier_volume_accepted <= 0))
      OR
      -- Unhandled response: supplier accepted/revised but RF hasn't finalized (awarded_volume doesn't match)
      (supplier_volume_accepted > 0 AND (awarded_volume IS NULL OR awarded_volume != supplier_volume_accepted))
    );
  
  -- If there are unhandled responses, don't allow closing
  IF v_unhandled_count > 0 THEN
    RETURN QUERY SELECT false, 
      'Cannot close loop: ' || v_unhandled_count || ' supplier response(s) need to be accepted or revised before closing.',
      v_unhandled_count;
    RETURN;
  END IF;
  
  -- Check 3: At least one finalized allocation exists OR at least one declined response (declined is handled)
  -- At this point, all suppliers have responded (Check 1 passed)
  -- All responses have been handled (Check 2 passed)
  -- So we need at least one quote that is finalized:
  --   - Supplier declined (response is handled - RF decided to withdraw or keep) OR
  --   - Supplier accepted/revised AND awarded_volume matches supplier_volume_accepted AND awarded_volume > 0
  IF NOT EXISTS (
    SELECT 1
    FROM public.quotes
    WHERE week_id = week_id_param
      AND offered_volume > 0
      AND (
        supplier_volume_response = 'decline' OR -- Declined is finalized (handled) regardless of awarded_volume
        (supplier_volume_response IS NOT NULL 
         AND supplier_volume_response != 'decline'
         AND supplier_volume_accepted > 0 
         AND awarded_volume > 0
         AND awarded_volume = supplier_volume_accepted) -- RF accepted supplier response
      )
  ) THEN
    RETURN QUERY SELECT false, 
      'Cannot close loop: No finalized allocations found. Please accept or revise supplier responses before closing.',
      0;
    RETURN;
  END IF;
  
  -- Mark the week as volume finalized AND lock the week status
  UPDATE public.weeks
  SET
    volume_finalized = true,
    volume_finalized_at = CURRENT_TIMESTAMP,
    volume_finalized_by = user_name,
    status = 'closed'  -- Lock the week status
  WHERE id = week_id_param;
  
  -- Return success
  RETURN QUERY SELECT true, 'Volume allocation loop closed successfully. Week is now locked.', 0;
  
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false, 'Error: ' || SQLERRM, 0;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.close_volume_loop(uuid, text) TO anon, authenticated;

