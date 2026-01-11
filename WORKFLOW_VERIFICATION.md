# Workflow End-to-End Verification Checklist

## Status: ✅ ALL CODE FIXES IN PLACE

All fixes are already implemented. The only blocker is database state (0 items).

## Prerequisites

**CRITICAL**: Database must have items restored first!

1. Run `URGENT_RESTORE_ITEMS.sql` in Supabase SQL Editor
2. Verify: `SELECT COUNT(*) FROM items;` returns 8
3. Verify: Database has suppliers (should already exist)
4. Verify: Database has at least one week with status 'open'

## Manual Test Checklist

### Step 1: Pricing → Finalize
1. **RF Dashboard**: Select open week
2. **Supplier Dashboard**: Supplier logs in and submits pricing for all 8 SKUs
   - ✅ Verify: Only 8 SKUs visible (Strawberry 4×2 lb CONV, 8×1 lb ORG, Blueberry 18 oz CONV, Pint ORG, Blackberry 12ozx6 CONV, 12ozx6 ORG, Raspberry 12ozx6 CONV, 12ozx6 ORG)
   - ✅ Verify: Blackberry/Raspberry ONLY show pack_size "12ozx6"
3. **RF Dashboard**: RF sends counters to suppliers
4. **Supplier Dashboard**: Suppliers accept/reject counters
5. **RF Dashboard**: RF finalizes pricing (sets `rf_final_fob`)
   - ✅ Verify: All priced SKUs show finalized prices

### Step 2: Award → Lock
6. **RF Dashboard**: Switch to "Award Volume" tab
7. **RF Dashboard**: Enter awarded volumes for suppliers (at least one `awarded_volume > 0`)
8. **RF Dashboard**: Click "Lock" button on each priced SKU
   - ✅ Verify: Lock button toggles correctly
   - ✅ Verify: State persists after page refresh
   - ✅ Verify: `week_item_volumes.locked = true` in database after lock

### Step 3: Send Allocations
9. **RF Dashboard**: "Send Allocations to Suppliers" button should now be enabled
   - ✅ Verify: Button enabled only when:
     - All priced SKUs have `rf_final_fob` set (finalized pricing)
     - All priced SKUs are locked (`week_item_volumes.locked = true`)
     - At least one `awarded_volume > 0` exists
10. **RF Dashboard**: Click "Send Allocations to Suppliers"
    - ✅ Verify: Button disabled after click
    - ✅ Verify: `quotes.offered_volume` set to `awarded_volume` in database
    - ✅ Verify: `weeks.allocation_submitted = true` in database

### Step 4: Supplier Accepts
11. **Supplier Dashboard**: Supplier logs in and sees "Volume Offers" section
12. **Supplier Dashboard**: Supplier accepts/revises volume allocations
    - ✅ Verify: `quotes.supplier_volume_response` set to 'accept'/'update'/'decline'
    - ✅ Verify: `quotes.supplier_volume_accepted` set to accepted volume

### Step 5: RF Acceptance Updates
13. **RF Dashboard**: RF Acceptance tab should auto-navigate when supplier responds
    - ✅ Verify: Tab switches to "Volume Acceptance" automatically
    - ✅ Verify: Real-time updates show supplier responses immediately
    - ✅ Verify: `supplier_volume_response` and `supplier_volume_accepted` displayed correctly

## Code Verification

### ✅ 1. SKU Filtering (8 Canonical SKUs)
**File**: `src/utils/helpers.ts` (lines 80-230)
- `filterStandardSKUs()` filters to exactly 8 SKUs
- Blackberry/Raspberry ONLY show pack_size "12ozx6" (lines 141-150)
- Filters out any non-matching variants

### ✅ 2. Lock/Unlock Persistence
**File**: `src/components/AwardVolume.tsx` (lines 595-618)
- `handleToggleSKULock()` calls `lockSKU()` or `unlockSKU()`
- After success, calls `await load()` to refresh from DB (line 606)
- `lockedSKUs` state is rehydrated from `week_item_volumes.locked` column

### ✅ 3. Send Allocations Gating
**File**: `src/components/AwardVolume.tsx` (lines 731-791)
- `allPricedSKUsFinalized`: Checks all priced SKUs have `rf_final_fob` set (lines 731-739)
- `allPricedSKUsLocked`: Checks all priced SKUs are locked via `lockedSKUs` Set (lines 742-748)
- `hasAnyAllocation`: Checks at least one `awarded_volume > 0` exists (lines 751-761)
- Button disabled if any check fails (line 789)

### ✅ 4. Supplier Acceptance Propagation
**Files**: 
- `src/components/VolumeAcceptance.tsx` (lines 85-86, 160-161): Reads `supplier_volume_response` and `supplier_volume_accepted` from quotes
- `src/components/VolumeAcceptance.tsx` (lines 207-208): Uses `useRealtime` to refresh on quote updates
- `src/components/RFDashboard.tsx` (lines 99-148): Real-time listener navigates to acceptance tab when suppliers respond

## Next Steps

1. **RESTORE DATABASE**: Run `URGENT_RESTORE_ITEMS.sql` in Supabase SQL Editor
2. **VERIFY**: Check that `SELECT COUNT(*) FROM items;` returns 8
3. **TEST**: Follow the manual test checklist above
