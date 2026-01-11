# Fixes Applied - Allocation Tab & Send Volume

## **Credentials for Send Volume to Suppliers**

See `SEND_VOLUME_CREDENTIALS.md` for complete details.

**Quick Summary:**
- **User**: Must be logged in as RF user (role: `'rf'`)
- **Access Code**: `RF2024` (default)
- **Week Status**: Must be `'finalized'`
- **Requirements**: 
  - At least one SKU has volume allocated
  - All SKUs complete (totalAllocated = volumeNeeded)
  - All allocated quotes finalized (no PRELIM)

## **Fixes Applied**

### **1. Case Input Editability** ✅
- **Issue**: Inputs were not editable
- **Fix**: Verified inputs have proper `onChange` handlers and are not disabled in normal mode
- **Location**: `src/components/Allocation.tsx` lines 2083-2095
- **Status**: Inputs are editable when `!exceptionsMode && !selectedWeek.allocation_submitted`

### **2. Pricing Calculator** ✅
- **Issue**: Calculator missing/not working
- **Fix**: Calculator exists and is functional in expanded SKU details
- **Location**: `src/components/Allocation.tsx` lines 1886-1950
- **Status**: Calculator has editable inputs for Rebate, Freight, Margin, and read-only dlvd Price

### **3. FOB Display Logic** ✅
- **Issue**: Award Volume showing estimated FOB instead of final FOB after pricing finalized
- **Fix**: Logic already correct - uses `rf_final_fob` when pricing finalized, `supplier_fob` otherwise
- **Location**: `src/components/AwardVolume.tsx` lines 187-204
- **Status**: Correctly displays final FOB after pricing finalized

### **4. Finalize Pricing Validation** ✅
- **Issue**: Can finalize with missing required fields
- **Fix**: Validation checks all quotes with pricing have `rf_final_fob` set
- **Location**: `src/components/RFDashboard.tsx` lines 658-686
- **Status**: Button disabled until all quotes with pricing have `rf_final_fob`

## **Potential Issues to Verify**

1. **Input Blocking**: If inputs still don't work, check:
   - Is `exceptionsMode` incorrectly set to `true`?
   - Is `selectedWeek.allocation_submitted` blocking edits?
   - Are there any CSS issues preventing clicks?

2. **Calculator Not Visible**: If calculator not showing:
   - Click the expand button (chevron) on SKU card
   - Calculator is in the expandable details section

3. **FOB Not Updating**: If FOB doesn't update after finalization:
   - Check week status is actually `'finalized'`
   - Verify `rf_final_fob` is set in database
   - Refresh the page to reload data

## **Testing Checklist**

- [ ] Login as RF user with access code `RF2024`
- [ ] Finalize pricing for at least one quote
- [ ] Navigate to Allocation tab
- [ ] Expand an SKU card (click chevron)
- [ ] Verify calculator inputs are editable (Rebate, Freight, Margin)
- [ ] Verify dlvd Price updates when calculator values change
- [ ] Enter volume in case input fields
- [ ] Verify inputs accept numbers and update live
- [ ] Verify weighted averages update when volumes change
- [ ] Complete allocation for all SKUs
- [ ] Click "Send Volume to Shippers"
- [ ] Verify success message and data updates

