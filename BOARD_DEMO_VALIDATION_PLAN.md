# PART B — END-TO-END VALIDATION PLAN

**Purpose**: Validation checklist and failure diagnosis guide for the complete RF Pricing & Volume Management workflow.

**Rules**: NO CODE CHANGES — This is a reference document for testing and validation only.

---

## **GOLDEN PATH VALIDATION CHECKLIST**

### **STEP 0 — GLOBAL NAVIGATION SANITY**

#### **0.1 Access Application**
- **PASS Criteria**:
  - ✅ Application loads at `http://localhost:5173` (or production URL)
  - ✅ Login page renders (`Login.tsx` component visible)
  - ✅ Access code input field present and functional
  - ✅ User role dropdown present and functional
  - ✅ Password field visible (if in production mode) or skipped (if in dev mode)
- **Failure Diagnosis**:
  - **Console Check**: Look for `console.error` or network errors
  - **Network Check**: Verify `GET /` returns 200, check for failed resource loads (CSS, JS bundles)
  - **DB Check**: None (this is a static page load)
  - **Query**: N/A

#### **0.2 Switch Between RF and Supplier Views**
- **PASS Criteria**:
  - ✅ Access code accepted (default: `RF2024` or from `.env` `VITE_ACCESS_CODE`)
  - ✅ RF Manager login works → RFDashboard renders
  - ✅ Supplier login works → SupplierDashboard renders
  - ✅ Logout button works → returns to Login page
  - ✅ Can switch between users without errors
  - ✅ Supplier dropdown populates with suppliers from database
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `loadSuppliers()` or `fetchSuppliers()` function
  - **Network Check**: Verify `GET /rest/v1/suppliers` returns 200 with array of suppliers
  - **DB Check**: Query `suppliers` table: `SELECT * FROM suppliers ORDER BY name;` → must return at least one row
  - **Query**: 
    ```sql
    SELECT id, name, email, created_at FROM suppliers ORDER BY name;
    ```
  - **If empty**: Suppliers table is empty → need to seed data

#### **0.3 Refresh and Navigation**
- **PASS Criteria**:
  - ✅ Refresh (F5) preserves selected week/supplier (via localStorage/sessionStorage)
  - ✅ Browser back/forward navigation works
  - ✅ Week dropdown persists selection after refresh
  - ✅ Tab switching works (Pricing → Award Volume → Acceptance)
  - ✅ No data loss on refresh
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `loadSession()`, `loadData()`, or state restoration
  - **Network Check**: Verify `GET /rest/v1/weeks` returns 200 after refresh
  - **DB Check**: Query `weeks` table to ensure data exists
  - **Query**:
    ```sql
    SELECT id, week_number, status, start_date, end_date FROM weeks ORDER BY week_number DESC;
    ```
  - **Storage Check**: Open DevTools → Application → Local Storage → Check for `app_session` or `app_access_granted` keys

---

### **STEP 1 — RF SELECTS OPEN WEEK**

#### **1.1 RF Logs In and Views Week Selection**
- **PASS Criteria**:
  - ✅ RFDashboard renders after login
  - ✅ Week dropdown shows at least one week (e.g., "Week 7 - OPEN")
  - ✅ Default selected week is Week 7 (or most recent week with `status = 'open'`)
  - ✅ Status badge shows "OPEN" (green badge)
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `loadData()`, `fetchWeeks()`, or week selection logic
  - **Network Check**: Verify `GET /rest/v1/weeks?select=*&order=week_number.desc` returns 200 with array of weeks
  - **DB Check**: Query `weeks` table for open weeks
  - **Query**:
    ```sql
    SELECT id, week_number, status, start_date, end_date, created_at 
    FROM weeks 
    WHERE status = 'open' 
    ORDER BY week_number DESC 
    LIMIT 1;
    ```
  - **If empty**: No open weeks exist → need to create a week with `status = 'open'`

#### **1.2 RF Selects Week 7**
- **PASS Criteria**:
  - ✅ Week 7 selected in dropdown
  - ✅ Status badge shows "OPEN" (green)
  - ✅ Date range displays: `{start_date} - {end_date}`
  - ✅ Supplier dropdown appears and is enabled
  - ✅ Quotes initialized automatically (no "Initialize Quotes Now" button visible)
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `ensureQuotesForWeek()`, `loadWeekData()`, or `getSuppliersWithSubmissions()`
  - **Network Check**: 
    - Verify `POST /rest/v1/rpc/ensure_quotes_for_week` or direct `GET /rest/v1/quotes?week_id=eq.{weekId}` returns quotes
    - Verify `GET /rest/v1/quotes?week_id=eq.{weekId}&select=supplier_id` returns at least one quote per supplier
  - **DB Check**: Query quotes for selected week
  - **Query**:
    ```sql
    SELECT COUNT(*) as quote_count, COUNT(DISTINCT supplier_id) as supplier_count, COUNT(DISTINCT item_id) as item_count
    FROM quotes
    WHERE week_id = '{weekId}';
    ```
  - **Expected**: `quote_count = supplier_count × item_count` (all supplier×item combinations exist)
  - **If missing quotes**: `ensureQuotesForWeek()` function may not be creating quotes automatically

---

### **STEP 2 — SUPPLIER SUBMITS PRICING FOR EXACTLY 8 SKUs**

#### **2.1 Supplier Logs In**
- **PASS Criteria**:
  - ✅ SupplierDashboard renders after login
  - ✅ Header shows supplier name
  - ✅ Week selector shows current open week (Week 7)
  - ✅ "Submit Pricing" section visible
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `loadData()`, `fetchCurrentOpenWeek()`, or session restoration
  - **Network Check**: Verify `GET /rest/v1/weeks?status=eq.open&order=week_number.desc&limit=1` returns open week
  - **DB Check**: Query open weeks
  - **Query**:
    ```sql
    SELECT id, week_number, status FROM weeks WHERE status = 'open' ORDER BY week_number DESC LIMIT 1;
    ```

#### **2.2 Supplier Sees Exactly 8 SKUs**
- **PASS Criteria**:
  - ✅ Pricing table shows exactly 8 rows (no more, no less)
  - ✅ Required SKUs present:
    1. Strawberry CONV (pack_size = "4×2 lb" or normalized variant)
    2. Strawberry ORG
    3. Blueberry CONV
    4. Blueberry ORG
    5. Blackberry CONV (pack_size = "12ozx6" only)
    6. Blackberry ORG (pack_size = "12ozx6" only)
    7. Raspberry CONV (pack_size = "12ozx6" only)
    8. Raspberry ORG (pack_size = "12ozx6" only)
  - ✅ No standalone 2lb strawberry SKUs visible (excluded by `filterStandardSKUs`)
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `filterStandardSKUs()`, `fetchItems()`, or item filtering logic
  - **Network Check**: Verify `GET /rest/v1/items?select=*` returns items array
  - **DB Check**: Query items and verify filtering
  - **Query**:
    ```sql
    SELECT name, pack_size, organic_flag, id 
    FROM items 
    WHERE (
      (name ILIKE '%strawberry%' AND (pack_size ILIKE '%4%2%lb%' OR pack_size ILIKE '%4x2%') AND organic_flag = 'CONV')
      OR (name ILIKE '%strawberry%' AND organic_flag = 'ORG')
      OR (name ILIKE '%blueberry%' AND organic_flag = 'CONV')
      OR (name ILIKE '%blueberry%' AND organic_flag = 'ORG')
      OR (name ILIKE '%blackberry%' AND pack_size = '12ozx6' AND organic_flag = 'CONV')
      OR (name ILIKE '%blackberry%' AND pack_size = '12ozx6' AND organic_flag = 'ORG')
      OR (name ILIKE '%raspberry%' AND pack_size = '12ozx6' AND organic_flag = 'CONV')
      OR (name ILIKE '%raspberry%' AND pack_size = '12ozx6' AND organic_flag = 'ORG')
    )
    ORDER BY 
      CASE WHEN name ILIKE '%strawberry%' AND organic_flag = 'CONV' THEN 1
           WHEN name ILIKE '%strawberry%' AND organic_flag = 'ORG' THEN 2
           WHEN name ILIKE '%blueberry%' AND organic_flag = 'CONV' THEN 3
           WHEN name ILIKE '%blueberry%' AND organic_flag = 'ORG' THEN 4
           WHEN name ILIKE '%blackberry%' THEN 5
           WHEN name ILIKE '%raspberry%' THEN 6
           ELSE 7 END;
    ```
  - **Expected**: Exactly 8 rows returned
  - **If wrong count**: Items table missing SKUs OR `filterStandardSKUs()` logic incorrect

#### **2.3 Supplier Enters Pricing for All 8 SKUs**
- **PASS Criteria**:
  - ✅ Input fields accept numeric values (FOB: required, DLVD: optional)
  - ✅ Values persist in React state while typing (not lost)
  - ✅ Currency formatting works (if implemented)
  - ✅ "Submit Pricing" button enables when at least one FOB entered
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in input handlers, state management, or validation
  - **Network Check**: None (this is local state)
  - **DB Check**: None (not saved yet)
  - **UI Check**: Verify input fields have `type="number"` and `onChange` handlers

#### **2.4 Supplier Submits Pricing**
- **PASS Criteria**:
  - ✅ All 8 SKUs have `supplier_fob` saved to `quotes` table
  - ✅ Optional `supplier_dlvd` values saved (if provided)
  - ✅ Success toast appears: "Pricing submitted successfully" (or similar)
  - ✅ UI updates to show submitted state (read-only style)
  - ✅ Supplier appears in "Submitted" category on RF dashboard
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `handleSubmitQuotes()`, `updateSupplierQuote()`, or Supabase update calls
  - **Network Check**: 
    - Verify `PATCH /rest/v1/quotes?id=eq.{quoteId}` returns 200 for each quote
    - Check for 400/500 errors in Network tab
  - **DB Check**: Query quotes after submission
  - **Query**:
    ```sql
    SELECT item_id, supplier_id, supplier_fob, supplier_dlvd, updated_at
    FROM quotes
    WHERE week_id = '{weekId}' AND supplier_id = '{supplierId}'
    ORDER BY item_id;
    ```
  - **Expected**: 8 rows, all with `supplier_fob IS NOT NULL AND supplier_fob > 0`
  - **If missing**: Update query failed → check `handleSubmitQuotes()` function

#### **2.5 Verification: RF Sees Supplier Pricing**
- **PASS Criteria**:
  - ✅ RF Dashboard shows supplier in "Submitted" category
  - ✅ Pricing table shows all 8 SKUs with supplier FOB/DLVD values
  - ✅ Values match what supplier entered
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `fetchQuotesWithDetails()`, `getSuppliersWithSubmissions()`, or data fetching
  - **Network Check**: Verify `GET /rest/v1/quotes?week_id=eq.{weekId}&supplier_id=eq.{supplierId}&select=*,items(*),suppliers(*)` returns quotes
  - **DB Check**: Same query as Step 2.4
  - **If values don't match**: Data fetch issue OR supplier submission didn't save correctly

---

### **STEP 3 — RF FINALIZES PRICING (rf_final_fob SET)**

#### **3.1 RF Reviews Supplier Pricing**
- **PASS Criteria**:
  - ✅ All 8 SKUs visible in pricing table
  - ✅ Supplier FOB/DLVD columns show submitted values
  - ✅ RF Counter column shows input field (if `supplier_fob` exists)
  - ✅ RF Final column shows input field (if counter sent or supplier responded)
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `loadQuotes()`, `fetchQuotesWithDetails()`, or table rendering
  - **Network Check**: Same as Step 2.5
  - **DB Check**: Same query as Step 2.4

#### **3.2 RF Sets Final Prices (rf_final_fob)**
- **PASS Criteria**:
  - ✅ Input fields accept numeric values
  - ✅ Values persist in React state (`finalInputs`)
  - ✅ "Push to Finalize" button visible at bottom of table
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in input handlers or state management
  - **Network Check**: None (local state)
  - **DB Check**: None (not saved yet)

#### **3.3 RF Clicks "Push to Finalize" Button**
- **PASS Criteria**:
  - ✅ All 8 SKUs have `rf_final_fob` set in `quotes` table
  - ✅ Success toast appears: "X quote(s) finalized for [Supplier Name]"
  - ✅ RF Final column shows finalized values (read-only style, green background)
  - ✅ Supplier moves to "Finalized" category
  - ✅ "Finalize Week" button appears (if all suppliers finalized)
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `handlePushToFinalize()`, `updateRFFinal()`, or Supabase update calls
  - **Network Check**: 
    - Verify `PATCH /rest/v1/quotes?id=eq.{quoteId}` returns 200 for each quote
    - Check for errors in `PATCH` requests
  - **DB Check**: Query quotes after finalization
  - **Query**:
    ```sql
    SELECT item_id, supplier_id, supplier_fob, rf_counter_fob, rf_final_fob, updated_at
    FROM quotes
    WHERE week_id = '{weekId}' AND supplier_id = '{supplierId}'
    ORDER BY item_id;
    ```
  - **Expected**: All 8 rows have `rf_final_fob IS NOT NULL AND rf_final_fob > 0`
  - **If missing**: `updateRFFinal()` function may be failing

#### **3.4 RF Finalizes Week Pricing (Optional but Recommended)**
- **PASS Criteria**:
  - ✅ Week status updated to `'finalized'` in `weeks` table
  - ✅ Success toast appears: "Pricing finalized! Volume allocation is now available."
  - ✅ Week status badge changes from "OPEN" to "FINALIZED" (blue badge)
  - ✅ Auto-navigation to "2. Award Volume" tab works (after 300ms delay)
  - ✅ Week dropdown still shows Week 7 but status is "FINALIZED"
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `handleFinalizePricing()`, `finalizePricingForWeek()`, or week status update
  - **Network Check**: 
    - Verify `PATCH /rest/v1/weeks?id=eq.{weekId}` returns 200
    - Verify `GET /rest/v1/weeks?id=eq.{weekId}&select=status` returns `status = 'finalized'`
  - **DB Check**: Query week status
  - **Query**:
    ```sql
    SELECT id, week_number, status, pricing_finalized, pricing_finalized_at, pricing_finalized_by
    FROM weeks
    WHERE id = '{weekId}';
    ```
  - **Expected**: `status = 'finalized'` (or `status = 'open'` if week finalization is optional)
  - **If status not updated**: `finalizePricingForWeek()` function may not be updating week status

---

### **STEP 4 — RF AWARD VOLUME ALLOCATION**

#### **4.1 RF Navigates to Award Volume Tab**
- **PASS Criteria**:
  - ✅ Award Volume tab loads (`AwardVolume.tsx` component renders)
  - ✅ Header shows "Award Volume" with "Plug-and-play sandbox" subtitle
  - ✅ "Send Allocations to Suppliers" button visible (but disabled initially)
  - ✅ Accordion list shows all 8 SKUs (filtered by `filterStandardSKUs()`)
  - ✅ Each SKU card shows: name, pack size, CONV/ORG badge, lock/unlock button
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `load()`, `fetchItems()`, `fetchQuotesWithDetails()`, or `fetchVolumeNeeds()`
  - **Network Check**: 
    - Verify `GET /rest/v1/items?select=*` returns items
    - Verify `GET /rest/v1/quotes?week_id=eq.{weekId}&select=*,items(*),suppliers(*)` returns quotes
    - Verify `GET /rest/v1/week_item_volumes?week_id=eq.{weekId}&select=item_id,volume_needed,locked` returns volume needs
  - **DB Check**: Query all three tables
  - **Query**:
    ```sql
    -- Items
    SELECT COUNT(*) FROM items;
    
    -- Quotes
    SELECT COUNT(*) FROM quotes WHERE week_id = '{weekId}';
    
    -- Volume needs
    SELECT COUNT(*) FROM week_item_volumes WHERE week_id = '{weekId}';
    ```
  - **If SKUs missing**: `filterStandardSKUs()` may be filtering incorrectly

#### **4.2 RF Enters Total Volume Needed Per SKU**
- **PASS Criteria**:
  - ✅ All 8 SKUs have `volume_needed` saved to `week_item_volumes` table
  - ✅ Values persist after refresh
  - ✅ Input shows saved state (green border or checkmark after debounce)
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `saveRequiredDebounced()`, `updateVolumeNeeded()`, or UPSERT operation
  - **Network Check**: 
    - Verify `POST /rest/v1/week_item_volumes` or `PATCH /rest/v1/week_item_volumes` returns 200 for each SKU
    - Check for UPSERT conflicts or errors
  - **DB Check**: Query volume needs after entry
  - **Query**:
    ```sql
    SELECT item_id, volume_needed, locked, updated_at
    FROM week_item_volumes
    WHERE week_id = '{weekId}'
    ORDER BY item_id;
    ```
  - **Expected**: 8 rows, all with `volume_needed IS NOT NULL AND volume_needed > 0`
  - **If missing**: UPSERT operation may be failing OR `week_item_volumes` table doesn't have unique constraint on `(week_id, item_id)`

#### **4.3 RF Allocates Volume to Suppliers Per SKU**
- **PASS Criteria**:
  - ✅ All suppliers who have finalized pricing for each SKU have `awarded_volume` saved to `quotes` table
  - ✅ Live calculations work: Row Cost, Total Cost, Weighted Avg FOB, Remaining Cases
  - ✅ Values persist after refresh
  - ✅ Remaining Cases shows green when = 0, orange when > 0, red when < 0
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `setAwarded()`, `saveAwardDraftDebounced()`, or UPSERT operation
  - **Network Check**: 
    - Verify `PATCH /rest/v1/quotes?id=eq.{quoteId}` returns 200 for each quote
    - Check for debounced save operations (may be delayed by 500ms)
  - **DB Check**: Query quotes after allocation
  - **Query**:
    ```sql
    SELECT item_id, supplier_id, awarded_volume, rf_final_fob, updated_at
    FROM quotes
    WHERE week_id = '{weekId}' AND awarded_volume IS NOT NULL AND awarded_volume > 0
    ORDER BY item_id, supplier_id;
    ```
  - **Expected**: At least one row per SKU with `awarded_volume > 0`
  - **If calculations wrong**: Check `AwardVolume.tsx` calculation logic (weighted avg, remaining, etc.)

#### **4.4 RF Verifies Weighted FOB and DLVD Display**
- **PASS Criteria**:
  - ✅ Weighted Avg FOB = `sum(FOB × awarded_volume) / sum(awarded_volume)` (correct calculation)
  - ✅ DLVD Price = `Weighted Avg FOB + Freight + Margin - Rebate` (correct formula)
  - ✅ Total Cost = `sum(FOB × awarded_volume)` (correct sum)
  - ✅ Remaining Cases = `volume_needed - sum(awarded_volume)` (correct subtraction)
  - ✅ All metrics update live as allocations change
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in calculation functions or `item_pricing_calculations` fetch
  - **Network Check**: 
    - Verify `GET /rest/v1/item_pricing_calculations?week_id=eq.{weekId}` returns pricing calculations (if table exists)
    - If table doesn't exist, default values should be used
  - **DB Check**: Query pricing calculations
  - **Query**:
    ```sql
    SELECT item_id, freight, margin, rebate, sell_price
    FROM item_pricing_calculations
    WHERE week_id = '{weekId}'
    ORDER BY item_id;
    ```
  - **If calculations wrong**: Check calculation logic in `AwardVolume.tsx:876-881` (weighted avg, DLVD formula)

---

### **STEP 5 — RF LOCKS EACH PRICED SKU**

#### **5.1 RF Completes Allocation for SKU (Remaining = 0)**
- **PASS Criteria**:
  - ✅ "Remaining Cases" shows **0** with green background/checkmark
  - ✅ Validation message: "✓ Complete" or similar
  - ✅ Lock button becomes enabled
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in calculation logic or lock button enablement condition
  - **Network Check**: None (calculation is local)
  - **DB Check**: Verify `volume_needed` and `awarded_volume` sum
  - **Query**:
    ```sql
    SELECT 
      wiv.item_id,
      wiv.volume_needed,
      COALESCE(SUM(q.awarded_volume), 0) as total_awarded,
      (wiv.volume_needed - COALESCE(SUM(q.awarded_volume), 0)) as remaining
    FROM week_item_volumes wiv
    LEFT JOIN quotes q ON q.week_id = wiv.week_id AND q.item_id = wiv.item_id AND q.awarded_volume > 0
    WHERE wiv.week_id = '{weekId}' AND wiv.item_id = '{itemId}'
    GROUP BY wiv.item_id, wiv.volume_needed;
    ```
  - **Expected**: `remaining = 0` for SKU to be lockable

#### **5.2 RF Clicks Lock Button for SKU**
- **PASS Criteria**:
  - ✅ `week_item_volumes.locked = true` saved for this SKU
  - ✅ Button changes from "Lock" (blue) to "Unlock" (orange)
  - ✅ Lock icon appears next to SKU name
  - ✅ Volume inputs become disabled (grayed out)
  - ✅ State persists after refresh
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `handleToggleSKULock()`, `lockSKU()`, or UPSERT operation
  - **Network Check**: 
    - Verify `POST /rest/v1/week_item_volumes` or `PATCH /rest/v1/week_item_volumes` returns 200
    - Check for UPSERT conflicts or errors
  - **DB Check**: Query locked status after lock
  - **Query**:
    ```sql
    SELECT item_id, locked, volume_needed, updated_at
    FROM week_item_volumes
    WHERE week_id = '{weekId}' AND item_id = '{itemId}';
    ```
  - **Expected**: `locked = true` (or `locked = 1` if boolean stored as integer)
  - **If not locked**: UPSERT operation may be failing OR `locked` column doesn't exist

#### **5.3 RF Repeats Lock for All 8 Priced SKUs**
- **PASS Criteria**:
  - ✅ All 8 SKUs have `locked = true` in `week_item_volumes` table
  - ✅ All 8 SKUs show "Unlock" button (orange)
  - ✅ All 8 SKUs show lock icon next to name
  - ✅ "Send Allocations to Suppliers" button becomes enabled (if at least one SKU locked)
- **Failure Diagnosis**:
  - **Console Check**: Same as Step 5.2 for each SKU
  - **Network Check**: Same as Step 5.2 for each SKU
  - **DB Check**: Query all locked SKUs
  - **Query**:
    ```sql
    SELECT item_id, locked
    FROM week_item_volumes
    WHERE week_id = '{weekId}' AND locked = true;
    ```
  - **Expected**: 8 rows (one per SKU)
  - **If count wrong**: Some locks didn't save → check Step 5.2 diagnosis for each missing lock

#### **5.4 Verification: Unlock Works and Persists on Refresh**
- **PASS Criteria**:
  - ✅ `week_item_volumes.locked = false` saved after unlock
  - ✅ Button changes from "Unlock" (orange) to "Lock" (blue)
  - ✅ Lock icon disappears
  - ✅ Volume inputs become enabled again
  - ✅ After refresh: SKU still shows "Lock" button (unlocked state)
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `handleToggleSKULock()`, `unlockSKU()`, or `load()` refresh logic
  - **Network Check**: Same as Step 5.2 (UPSERT to set `locked = false`)
  - **DB Check**: Query locked status after unlock and after refresh
  - **Query**:
    ```sql
    SELECT item_id, locked FROM week_item_volumes WHERE week_id = '{weekId}' AND item_id = '{itemId}';
    ```
  - **Expected**: `locked = false` (or `locked = 0`)
  - **After refresh**: `load()` should call `fetchVolumeNeeds()` which reloads `lockedSKUs` state from database

---

### **STEP 6 — RF SENDS ALLOCATIONS TO SUPPLIERS**

#### **6.1 "Send Allocations to Suppliers" Button Enablement Conditions**
- **PASS Criteria**:
  - ✅ Button enabled when: `canEdit = true` AND `atLeastOneSKULocked = true` AND `hasAnyAllocation = true` AND `submitting = false`
  - ✅ Button disabled with correct tooltip when conditions not met
  - ✅ Tooltip text accurate (e.g., "At least one SKU must be locked...")
- **Failure Diagnosis**:
  - **Console Check**: Check `canEdit`, `atLeastOneSKULocked`, `hasAnyAllocation` computed values in `AwardVolume.tsx`
  - **Network Check**: None (this is UI state check)
  - **DB Check**: Query to verify conditions
  - **Query**:
    ```sql
    -- Check at least one SKU locked
    SELECT COUNT(*) as locked_count
    FROM week_item_volumes
    WHERE week_id = '{weekId}' AND locked = true;
    
    -- Check at least one allocation exists
    SELECT COUNT(*) as allocation_count
    FROM quotes
    WHERE week_id = '{weekId}' AND awarded_volume IS NOT NULL AND awarded_volume > 0;
    
    -- Check week status
    SELECT status FROM weeks WHERE id = '{weekId}';
    ```
  - **Expected**: `locked_count > 0`, `allocation_count > 0`, `status IN ('open', 'finalized')`

#### **6.2 RF Clicks "Send Allocations to Suppliers" Button**
- **PASS Criteria**:
  - ✅ `offered_volume` copied from `awarded_volume` for all quotes with `awarded_volume > 0`
  - ✅ `quotes.supplier_volume_approval = 'pending'` for all quotes
  - ✅ `quotes.supplier_volume_response = NULL` for all quotes (reset)
  - ✅ `quotes.supplier_volume_accepted = NULL` for all quotes (reset)
  - ✅ `weeks.allocation_submitted = true` set on week
  - ✅ Success toast appears: "Allocations sent to X supplier(s)..."
  - ✅ Verification queries pass
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `handleSendAllocations()`, `submitAllocationsToSuppliers()`, or batch update operations
  - **Network Check**: 
    - Verify `PATCH /rest/v1/quotes?id=in.({quoteIds})` returns 200 for batch update
    - Verify `PATCH /rest/v1/weeks?id=eq.{weekId}` returns 200
    - Check for errors in update operations
  - **DB Check**: Query quotes and week after send
  - **Query**:
    ```sql
    -- Verify offered_volume copied from awarded_volume
    SELECT 
      item_id,
      supplier_id,
      awarded_volume,
      offered_volume,
      supplier_volume_approval,
      supplier_volume_response,
      supplier_volume_accepted
    FROM quotes
    WHERE week_id = '{weekId}' AND awarded_volume > 0
    ORDER BY item_id, supplier_id;
    ```
  - **Expected**: `offered_volume = awarded_volume` for all rows, `supplier_volume_approval = 'pending'`, `supplier_volume_response IS NULL`, `supplier_volume_accepted IS NULL`
  - **Query**:
    ```sql
    -- Verify week allocation_submitted flag
    SELECT allocation_submitted, allocation_submitted_at, allocation_submitted_by
    FROM weeks
    WHERE id = '{weekId}';
    ```
  - **Expected**: `allocation_submitted = true` (or `allocation_submitted = 1`)

#### **6.3 Verification: Supplier Dashboard Shows Awards**
- **PASS Criteria**:
  - ✅ Volume Offers section visible on supplier dashboard
  - ✅ All SKUs with `offered_volume > 0` for this supplier are shown
  - ✅ Values match what RF allocated
  - ✅ Action buttons (Accept/Revise/Decline) enabled
  - ✅ Week shows `allocation_submitted = true`
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `loadAllAwardedVolumes()`, `VolumeOffers` component, or data fetching
  - **Network Check**: 
    - Verify `GET /rest/v1/quotes?supplier_id=eq.{supplierId}&week_id=eq.{weekId}&or=(offered_volume.gt.0,awarded_volume.gt.0)` returns quotes
    - Verify `GET /rest/v1/weeks?id=eq.{weekId}&select=allocation_submitted` returns `allocation_submitted = true`
  - **DB Check**: Query quotes for supplier
  - **Query**:
    ```sql
    SELECT 
      item_id,
      offered_volume,
      awarded_volume,
      rf_final_fob,
      supplier_volume_approval
    FROM quotes
    WHERE week_id = '{weekId}' AND supplier_id = '{supplierId}' AND (offered_volume > 0 OR awarded_volume > 0)
    ORDER BY item_id;
    ```
  - **Expected**: All allocated SKUs have `offered_volume > 0` OR `awarded_volume > 0`
  - **If section not visible**: Check `SupplierDashboard.tsx:772` rendering condition

---

### **STEP 7 — SUPPLIER SEES AWARDS AND ACCEPTS/REVISES**

#### **7.1 Supplier Views Volume Offers**
- **PASS Criteria**:
  - ✅ Volume Offers section shows all SKUs where `offered_volume > 0` for this supplier
  - ✅ Each SKU shows: name, pack size, Offered Volume, Final FOB Price, Total Value
  - ✅ Action options (Accept/Revise/Decline) available for each SKU
  - ✅ If "Revise" selected: Input field for revised volume appears
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `VolumeOffers` component rendering or quote matching logic
  - **Network Check**: Same as Step 6.3
  - **DB Check**: Same query as Step 6.3
  - **If SKUs missing**: Check `VolumeOffers.tsx:24-42` quote matching logic

#### **7.2 Supplier Accepts Volume Offer**
- **PASS Criteria**:
  - ✅ `quotes.supplier_volume_response = 'accept'` saved
  - ✅ `quotes.supplier_volume_accepted = offered_volume` saved
  - ✅ `quotes.supplier_volume_approval = 'accepted'` saved
  - ✅ Success toast appears: "X volume response(s) submitted successfully"
  - ✅ SKU row shows "Accepted" status (green checkmark)
  - ✅ Custom event `navigate-to-volume-acceptance` dispatched
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `handleSubmitAll()`, `updateSupplierVolumeResponse()`, or Supabase update
  - **Network Check**: 
    - Verify `PATCH /rest/v1/quotes?id=eq.{quoteId}` returns 200
    - Check for errors in update operation
  - **DB Check**: Query quote after acceptance
  - **Query**:
    ```sql
    SELECT 
      item_id,
      supplier_id,
      offered_volume,
      supplier_volume_response,
      supplier_volume_accepted,
      supplier_volume_approval,
      updated_at
    FROM quotes
    WHERE week_id = '{weekId}' AND supplier_id = '{supplierId}' AND item_id = '{itemId}';
    ```
  - **Expected**: `supplier_volume_response = 'accept'`, `supplier_volume_accepted = offered_volume`, `supplier_volume_approval = 'accepted'`

#### **7.3 Supplier Revises Volume Offer**
- **PASS Criteria**:
  - ✅ `quotes.supplier_volume_response = 'update'` saved
  - ✅ `quotes.supplier_volume_accepted = revised_volume` saved (e.g., 750 instead of 800)
  - ✅ `quotes.supplier_volume_approval = 'revised'` saved
  - ✅ Success toast appears
  - ✅ SKU row shows "Revised" status (orange refresh icon)
- **Failure Diagnosis**:
  - **Console Check**: Same as Step 7.2
  - **Network Check**: Same as Step 7.2
  - **DB Check**: Query quote after revision
  - **Query**: Same as Step 7.2
  - **Expected**: `supplier_volume_response = 'update'`, `supplier_volume_accepted = revised_volume`, `supplier_volume_approval = 'revised'`

#### **7.4 Supplier Declines Volume Offer**
- **PASS Criteria**:
  - ✅ `quotes.supplier_volume_response = 'decline'` saved
  - ✅ `quotes.supplier_volume_accepted = 0` saved
  - ✅ `quotes.supplier_volume_approval = 'declined'` saved
  - ✅ Success toast appears
  - ✅ SKU row shows "Declined" status (red X icon)
- **Failure Diagnosis**:
  - **Console Check**: Same as Step 7.2
  - **Network Check**: Same as Step 7.2
  - **DB Check**: Query quote after decline
  - **Query**: Same as Step 7.2
  - **Expected**: `supplier_volume_response = 'decline'`, `supplier_volume_accepted = 0`, `supplier_volume_approval = 'declined'`

---

### **STEP 8 — RF ACCEPTANCE TAB UPDATES TO SHOW SUPPLIER RESPONSE**

#### **8.1 RF Dashboard Auto-Navigates to Acceptance Tab**
- **PASS Criteria**:
  - ✅ Realtime subscription detects supplier response (`supplier_volume_response` or `supplier_volume_accepted` changed)
  - ✅ Auto-navigation: `setMainView('volume_acceptance')` called
  - ✅ Tab "3. Acceptance" becomes active (renders `Allocation` component in exceptions mode)
  - ✅ Toast appears: "Supplier responded to volume offer - switched to Acceptance tab"
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in realtime subscription setup, `RFDashboard.tsx:99-148` listener, or navigation logic
  - **Network Check**: 
    - Verify Supabase realtime subscription is active (check Network tab for WebSocket connection)
    - Verify `POST /rest/v1/realtime` or WebSocket connection established
  - **DB Check**: Trigger manual update to test realtime
  - **Query**: Manual update to trigger realtime
    ```sql
    UPDATE quotes 
    SET supplier_volume_response = 'accept', supplier_volume_accepted = 800, updated_at = NOW()
    WHERE week_id = '{weekId}' AND supplier_id = '{supplierId}' AND item_id = '{itemId}'
    RETURNING id;
    ```
  - **Expected**: Realtime event fires, listener detects change, navigation triggers
  - **If realtime not working**: Check Supabase realtime enabled on `quotes` table, check subscription channel name, check listener logic

#### **8.2 RF Views Volume Acceptance Tab (Allocation Component in Exceptions Mode)**
- **PASS Criteria**:
  - ✅ Allocation component renders in exceptions mode
  - ✅ Exceptions mode activated: `allocation_submitted === true` AND `hasResponses === true`
  - ✅ Responded allocations visible: Quotes with `supplier_volume_response IS NOT NULL` AND `supplier_volume_response != 'decline'` AND (`awarded_volume = 0` OR `awarded_volume != supplier_volume_accepted`)
  - ✅ Pending allocations visible: Quotes with `offered_volume > 0` AND `supplier_volume_response IS NULL`
  - ✅ Finalized allocations visible: Quotes with `awarded_volume > 0` AND (`supplier_volume_response = 'decline'` OR (`awarded_volume = supplier_volume_accepted`))
  - ✅ Supplier response data displayed correctly (response type, accepted volume, notes)
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `loadData()`, `fetchQuotesWithDetails()`, or exceptions mode activation logic (`Allocation.tsx:691-711`)
  - **Network Check**: 
    - Verify `GET /rest/v1/quotes?week_id=eq.{weekId}&select=*,items(*),suppliers(*)` returns quotes with supplier responses
    - Verify `GET /rest/v1/week_item_volumes?week_id=eq.{weekId}&select=item_id,locked` returns volume needs
  - **DB Check**: Query quotes to verify categorization
  - **Query**:
    ```sql
    SELECT 
      item_id,
      supplier_id,
      offered_volume,
      supplier_volume_response,
      supplier_volume_accepted,
      awarded_volume,
      CASE
        WHEN supplier_volume_response IS NULL AND offered_volume > 0 THEN 'pending'
        WHEN supplier_volume_response = 'decline' THEN 'declined'
        WHEN supplier_volume_response IS NOT NULL AND supplier_volume_response != 'decline' AND (awarded_volume IS NULL OR awarded_volume != supplier_volume_accepted) THEN 'responded'
        WHEN awarded_volume > 0 AND (supplier_volume_response = 'decline' OR (supplier_volume_response IS NOT NULL AND awarded_volume = supplier_volume_accepted)) THEN 'finalized'
        ELSE 'other'
      END as category
    FROM quotes
    WHERE week_id = '{weekId}' AND (offered_volume > 0 OR awarded_volume > 0)
    ORDER BY item_id, supplier_id;
    ```
  - **Expected**: At least one row with `category = 'responded'` (from Step 7.2/7.3)
  - **If exceptions mode not activated**: Check `Allocation.tsx:691-711` conditions

#### **8.3 RF Accepts Supplier Response**
- **PASS Criteria**:
  - ✅ `quotes.awarded_volume = supplier_volume_accepted` updated (matches supplier's accepted/revised volume)
  - ✅ `quotes.offered_volume = supplier_volume_accepted` updated (keeps in sync)
  - ✅ Success toast appears: "Accepted X units from [Supplier Name]"
  - ✅ SKU row moves from "Responded Allocations" to "Finalized Allocations" section (after reload)
  - ✅ Status shows finalized indicator
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `handleAcceptSupplierResponse()`, `Allocation.tsx:216-238`, or Supabase update
  - **Network Check**: 
    - Verify `PATCH /rest/v1/quotes?id=eq.{quoteId}` returns 200
    - Check for errors in update operation
  - **DB Check**: Query quote after acceptance
  - **Query**:
    ```sql
    SELECT 
      item_id,
      supplier_id,
      supplier_volume_accepted,
      awarded_volume,
      offered_volume,
      updated_at
    FROM quotes
    WHERE week_id = '{weekId}' AND supplier_id = '{supplierId}' AND item_id = '{itemId}';
    ```
  - **Expected**: `awarded_volume = supplier_volume_accepted`, `offered_volume = supplier_volume_accepted`
  - **If not updated**: `handleAcceptSupplierResponse()` function may be failing

#### **8.4 RF Revises Offer**
- **PASS Criteria**:
  - ✅ `quotes.offered_volume = new_volume` updated
  - ✅ `quotes.supplier_volume_response = NULL` reset
  - ✅ `quotes.supplier_volume_accepted = 0` reset
  - ✅ `quotes.supplier_volume_response_notes = NULL` reset
  - ✅ Success toast appears: "Revised offer to X units for [Supplier Name]"
  - ✅ SKU row moves back to "Pending" section (supplier can respond again)
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `handleReviseOffer()`, `Allocation.tsx:240-271`, or Supabase update
  - **Network Check**: Same as Step 8.3
  - **DB Check**: Query quote after revision
  - **Query**: Same as Step 8.3
  - **Expected**: `offered_volume = new_volume`, `supplier_volume_response IS NULL`, `supplier_volume_accepted = 0`

#### **8.5 RF Closes Volume Loop (Final Step)**
- **PASS Criteria**:
  - ✅ **Frontend Validation Passes**: 
    - `pendingAllocations.length === 0` (no pending responses)
    - `respondedAllocations.length === 0` (no unhandled responses)
    - `finalizedAllocations.length > 0` (at least one finalized allocation)
  - ✅ **Backend Validation Passes** (in `closeVolumeLoop` function):
    - No pending supplier responses: `COUNT(*) = 0` where `offered_volume > 0` AND `supplier_volume_response IS NULL`
    - No unhandled responses: `COUNT(*) = 0` where `offered_volume > 0` AND `supplier_volume_response IS NOT NULL` AND `supplier_volume_response != 'decline'` AND `supplier_volume_accepted > 0` AND (`awarded_volume IS NULL` OR `awarded_volume != supplier_volume_accepted`)
    - At least one finalized allocation: `COUNT(*) > 0` where (`supplier_volume_response = 'decline'` OR (`supplier_volume_response IS NOT NULL` AND `supplier_volume_response != 'decline'` AND `supplier_volume_accepted > 0` AND `awarded_volume > 0` AND `awarded_volume = supplier_volume_accepted`))
  - ✅ `weeks.status = 'closed'` updated
  - ✅ `weeks.volume_finalized = true` updated
  - ✅ `weeks.volume_finalized_at` and `weeks.volume_finalized_by` set
  - ✅ Success toast appears: "Volume allocation loop closed successfully. Week is now locked."
  - ✅ Week status badge changes to "CLOSED" (gray badge)
  - ✅ Week becomes read-only (except emergency unlock)
- **Failure Diagnosis**:
  - **Console Check**: Check for errors in `handleCloseLoop()`, `closeVolumeLoop()`, validation checks, or week status update
  - **Network Check**: 
    - Verify `POST /rest/v1/rpc/close_volume_loop` or direct `PATCH /rest/v1/weeks?id=eq.{weekId}` returns 200
    - Check for validation error messages (400 responses)
  - **DB Check**: Query to verify validations and final state
  - **Query** (Validation Checks):
    ```sql
    -- Check 1: Pending supplier responses
    SELECT COUNT(*) as pending_count
    FROM quotes
    WHERE week_id = '{weekId}' AND offered_volume > 0 AND (supplier_volume_response IS NULL OR supplier_volume_response = '');
    
    -- Check 2: Unhandled responses
    SELECT COUNT(*) as unhandled_count
    FROM quotes
    WHERE week_id = '{weekId}' 
      AND offered_volume > 0 
      AND supplier_volume_response IS NOT NULL 
      AND supplier_volume_response != 'decline'
      AND supplier_volume_accepted > 0
      AND (awarded_volume IS NULL OR awarded_volume != supplier_volume_accepted);
    
    -- Check 3: Finalized allocations
    SELECT COUNT(*) as finalized_count
    FROM quotes
    WHERE week_id = '{weekId}'
      AND (
        (supplier_volume_response = 'decline')
        OR (supplier_volume_response IS NOT NULL 
            AND supplier_volume_response != 'decline' 
            AND supplier_volume_accepted > 0 
            AND awarded_volume > 0 
            AND awarded_volume = supplier_volume_accepted)
      );
    ```
  - **Expected**: `pending_count = 0`, `unhandled_count = 0`, `finalized_count > 0`
  - **Query** (Final State):
    ```sql
    SELECT status, volume_finalized, volume_finalized_at, volume_finalized_by
    FROM weeks
    WHERE id = '{weekId}';
    ```
  - **Expected**: `status = 'closed'`, `volume_finalized = true` (or `volume_finalized = 1`)
  - **If validation fails**: Fix pending/unhandled responses first (Steps 8.3-8.4)
  - **If week not closed**: `closeVolumeLoop()` function may not be updating week status OR RPC function `close_volume_loop` may be failing

---

## **FAILURE DIAGNOSIS QUICK REFERENCE**

### **Common Failure Points**

1. **No Data in Tables**
   - **Symptom**: Dropdowns empty, "No data" messages
   - **Check**: `suppliers`, `items`, `weeks`, `quotes` tables
   - **Fix**: Seed database or create test data

2. **Realtime Subscriptions Not Working**
   - **Symptom**: Auto-navigation doesn't trigger, supplier responses not detected
   - **Check**: Supabase realtime enabled on `quotes` table, WebSocket connection active
   - **Fix**: Enable realtime in Supabase dashboard, check subscription channel names

3. **SKU Filtering Issues**
   - **Symptom**: Wrong SKU count, missing SKUs, wrong pack sizes
   - **Check**: `filterStandardSKUs()` function, `items` table data
   - **Fix**: Verify items table has correct SKUs with correct pack_size values

4. **Lock/Unlock Not Persisting**
   - **Symptom**: Lock state lost on refresh, button state wrong
   - **Check**: `week_item_volumes.locked` column exists, UPSERT operation works
   - **Fix**: Add `locked` column if missing, verify UPSERT conflict resolution

5. **Validation Failures in Close Loop**
   - **Symptom**: "Cannot close loop" error, pending/unhandled responses
   - **Check**: All supplier responses handled, all RF responses finalized
   - **Fix**: Complete Steps 7.2-8.4 before closing loop

---

**END OF PART B — END-TO-END VALIDATION PLAN**
