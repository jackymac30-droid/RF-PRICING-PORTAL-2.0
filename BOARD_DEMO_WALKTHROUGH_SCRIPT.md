# BOARD DEMO WALKTHROUGH SCRIPT

**Purpose**: Step-by-step walkthrough of the complete RF Pricing & Volume Management workflow for board demonstration.

**Rules**: NO CODE CHANGES — This is a reference document only.

---

## **STEP 0 — GLOBAL NAVIGATION SANITY**

### **0.1 Access Application**
- **Actor**: Any user
- **Screen**: Login page (`src/components/Login.tsx`)
- **Action**: Navigate to `http://localhost:5173` (or production URL)
- **Expected UI**:
  - Access code entry field visible
  - User role selection (RF Manager or Supplier dropdown)
  - Password field (if in production mode)
- **DB Truth**: None (localStorage/sessionStorage access check)
- **PASS/FAIL**: ✅ PASS if login page loads, access code can be entered, user dropdown populates with suppliers
- **FAIL Criteria**: Page doesn't load, dropdown empty, access code not accepted

### **0.2 Switch Between RF and Supplier Views**
- **Actor**: Demo presenter
- **Screen**: Login page (`src/components/Login.tsx`)
- **Actions**:
  1. Enter access code (default: `RF2024` or from `.env` `VITE_ACCESS_CODE`)
  2. Select "RF Manager" from user dropdown
  3. Click login (or auto-login in dev mode)
  4. Logout via "Logout" button in header
  5. Select supplier from dropdown
  6. Click login again
- **Expected UI**: 
  - RF login → RFDashboard renders (`src/components/RFDashboard.tsx`)
  - Supplier login → SupplierDashboard renders (`src/components/SupplierDashboard.tsx`)
- **DB Truth**: 
  - RF login: `loginAsRF()` returns session (no DB query)
  - Supplier login: `fetchSuppliers()` queries `suppliers` table
- **PASS/FAIL**: ✅ PASS if both dashboards load correctly, logout works, can switch between users
- **FAIL Criteria**: Login fails, wrong dashboard appears, logout doesn't work, supplier dropdown empty

### **0.3 Refresh and Navigation**
- **Actor**: Demo presenter
- **Screens**: Any screen
- **Actions**:
  1. Refresh browser (F5)
  2. Navigate back/forward in browser history
  3. Select different week from dropdown (RF Dashboard)
  4. Switch between tabs: "1. Pricing" → "2. Award Volume" → "3. Acceptance"
- **Expected UI**: 
  - State persists on refresh (localStorage session)
  - Navigation maintains selected week/supplier
  - Tab switching works smoothly
- **DB Truth**: 
  - `loadSession()` reads from localStorage
  - Week selection queries `weeks` table via `fetchWeeks()`
- **PASS/FAIL**: ✅ PASS if state persists, navigation works, no data loss
- **FAIL Criteria**: Session lost on refresh, selected week resets, tab switching fails

---

## **STEP 1 — RF SELECTS OPEN WEEK**

### **1.1 RF Logs In and Views Week Selection**
- **Actor**: RF user
- **Screen**: RFDashboard (`src/components/RFDashboard.tsx`)
- **Action**: Login as RF Manager, view Pricing tab (default view)
- **Expected UI**:
  - Header shows "RF Dashboard"
  - Week dropdown in top-left (above pricing table)
  - Week dropdown shows: "Week 1 - CLOSED", "Week 2 - CLOSED", ..., "Week 7 - OPEN"
  - Default selected week should be Week 7 (or most recent week with status='open')
- **DB Truth**: 
  - `fetchWeeks()` queries `weeks` table: `SELECT * FROM weeks ORDER BY week_number DESC`
  - Filters: `weeks.status = 'open'` for open weeks
- **PASS/FAIL**: ✅ PASS if Week 7 (or most recent open week) is visible and selectable, status badge shows "OPEN"
- **FAIL Criteria**: No weeks in dropdown, Week 7 not listed, status shows incorrect value

### **1.2 RF Selects Week 7**
- **Actor**: RF user
- **Screen**: RFDashboard → Pricing tab
- **Action**: Click week dropdown, select "Week 7 - OPEN"
- **Expected UI**:
  - Week dropdown shows "Week 7 - OPEN" as selected
  - Status badge shows green "OPEN" badge
  - Date range displays: `{start_date} - {end_date}`
  - Supplier dropdown appears (enabled)
  - Pricing table area ready (but may show "Select supplier..." message)
- **DB Truth**: 
  - `setSelectedWeek(week)` updates React state
  - `loadWeekData()` called, which calls:
    - `ensureQuotesForWeek(week.id)` - ensures quotes exist for all supplier×item combinations
    - `getSuppliersWithSubmissions(week.id)` - queries `quotes` table to categorize suppliers
- **PASS/FAIL**: ✅ PASS if Week 7 selected, status badge shows "OPEN", supplier dropdown enabled, quotes initialized
- **FAIL Criteria**: Week selection doesn't work, status shows wrong value, quotes not initialized, supplier dropdown disabled

---

## **STEP 2 — SUPPLIER SUBMITS PRICING FOR EXACTLY 8 SKUs**

### **2.1 Supplier Logs In**
- **Actor**: Supplier user (e.g., "Fresh Farms Inc")
- **Screen**: SupplierDashboard (`src/components/SupplierDashboard.tsx`)
- **Action**: Select supplier from dropdown, enter password (if required), click login
- **Expected UI**:
  - Supplier dashboard header shows supplier name
  - Week selector shows current open week (Week 7)
  - "Submit Pricing" section visible with pricing table
- **DB Truth**: 
  - `loginAsSupplier(email)` queries `suppliers` table: `SELECT * FROM suppliers WHERE email = ?`
  - Session stored in localStorage
- **PASS/FAIL**: ✅ PASS if supplier dashboard loads, current week shown, pricing form visible
- **FAIL Criteria**: Login fails, wrong supplier shown, week not found, pricing form not visible

### **2.2 Supplier Sees Exactly 8 SKUs**
- **Actor**: Supplier user
- **Screen**: SupplierDashboard → Pricing table
- **Action**: View pricing table after selecting Week 7
- **Expected UI**:
  - Pricing table shows exactly 8 rows (filtered by `filterStandardSKUs()` from `src/utils/helpers.ts`)
  - SKUs must be:
    1. Strawberry CONV (pack_size = "4×2 lb" or normalized variant)
    2. Strawberry ORG
    3. Blueberry CONV
    4. Blueberry ORG
    5. Blackberry CONV (pack_size = "12ozx6" only)
    6. Blackberry ORG (pack_size = "12ozx6" only)
    7. Raspberry CONV (pack_size = "12ozx6" only)
    8. Raspberry ORG (pack_size = "12ozx6" only)
  - Each row has: SKU name, pack size, FOB input field, DLVD input field (optional)
  - **MUST NOT** show standalone 2lb strawberry SKUs (excluded by `filterStandardSKUs`)
- **DB Truth**: 
  - `fetchItems()` queries `items` table: `SELECT * FROM items ORDER BY display_order`
  - `filterStandardSKUs(items)` filters to exactly 8 SKUs (function in `src/utils/helpers.ts:80-217`)
  - `loadQuotes()` queries quotes: `SELECT * FROM quotes WHERE week_id = ? AND supplier_id = ?`
- **PASS/FAIL**: ✅ PASS if exactly 8 SKUs shown, all required SKUs present, no 2lb strawberry standalone, Blackberry/Raspberry only show 12ozx6 pack
- **FAIL Criteria**: More or fewer than 8 SKUs, missing required SKUs, 2lb strawberry standalone visible, wrong pack sizes for Blackberry/Raspberry

### **2.3 Supplier Enters Pricing for All 8 SKUs**
- **Actor**: Supplier user
- **Screen**: SupplierDashboard → Pricing table
- **Action**: Enter `supplier_fob` and optionally `supplier_dlvd` for each of the 8 SKUs
- **Expected UI**:
  - Input fields accept numeric values (FOB: required, DLVD: optional)
  - Values display with currency formatting after entry
  - "Submit Pricing" button becomes enabled when at least one FOB entered
- **DB Truth**: 
  - Inputs stored in React state `quoteInputs` (local state, not yet persisted)
  - Format: `{ [item_id]: { fob: string, dlvd: string } }`
- **PASS/FAIL**: ✅ PASS if inputs accept values, currency formatting works, submit button enables
- **FAIL Criteria**: Inputs don't accept values, validation fails, submit button stays disabled

### **2.4 Supplier Submits Pricing**
- **Actor**: Supplier user
- **Screen**: SupplierDashboard → Pricing table
- **Action**: Click "Submit Pricing" button (or Ctrl+S keyboard shortcut)
- **Expected UI**:
  - Button shows loading state ("Submitting...")
  - Success toast: "Pricing submitted successfully" (or similar)
  - Table updates to show submitted values (read-only style)
  - Status indicator shows "Submitted" or similar
- **DB Truth**: 
  - `handleSubmitQuotes()` function (`src/components/SupplierDashboard.tsx:350-500`) called
  - For each SKU with FOB value, calls `supabase.from('quotes').update()`:
    - `quotes.supplier_fob = entered_fob`
    - `quotes.supplier_dlvd = entered_dlvd` (if provided)
    - `quotes.updated_at = CURRENT_TIMESTAMP`
  - Updates filtered by: `week_id = selectedWeek.id AND supplier_id = session.supplier_id AND item_id = item.id`
- **PASS/FAIL**: ✅ PASS if all 8 SKUs' pricing saved to `quotes` table, toast shows success, UI updates to show submitted state
- **FAIL Criteria**: Save fails, partial saves (some SKUs missing), toast shows error, UI doesn't update

### **2.5 Verification: RF Sees Supplier Pricing**
- **Actor**: RF user
- **Screen**: RFDashboard → Pricing tab
- **Action**: Switch to RF view, select Week 7, select supplier (e.g., "Fresh Farms Inc")
- **Expected UI**:
  - Pricing table shows all 8 SKUs
  - Supplier FOB column shows submitted values
  - Supplier DLVD column shows submitted values (if provided)
  - Status shows supplier as "Submitted" in supplier cards
- **DB Truth**: 
  - `fetchQuotesWithDetails(weekId)` queries:
    - `quotes` table joined with `items` and `suppliers`
    - Filter: `week_id = weekId AND supplier_id = selectedSupplier.id`
  - `getSuppliersWithSubmissions()` categorizes suppliers based on quotes with `supplier_fob IS NOT NULL`
- **PASS/FAIL**: ✅ PASS if RF sees all 8 SKUs with submitted pricing, values match what supplier entered, supplier shows in "Submitted" category
- **FAIL Criteria**: RF doesn't see pricing, missing SKUs, wrong values, supplier not in "Submitted" category

---

## **STEP 3 — RF FINALIZES PRICING (rf_final_fob SET)**

### **3.1 RF Reviews Supplier Pricing**
- **Actor**: RF user
- **Screen**: RFDashboard → Pricing tab → Selected supplier (e.g., "Fresh Farms Inc")
- **Action**: Review pricing table showing all 8 SKUs with supplier FOB prices
- **Expected UI**:
  - Table shows: SKU, Pack Size, Supplier FOB, Supplier DLVD, RF Counter (input), Supplier Response, RF Final (input), Blended Cost, Actions
  - RF Counter column: Shows input field or "Push to Counter" button (if supplier_fob exists)
  - RF Final column: Shows input field (if counter sent or supplier responded)
- **DB Truth**: 
  - `loadQuotes()` fetches quotes: `SELECT * FROM quotes WHERE week_id = ? AND supplier_id = ?`
  - Joins with `items` and `suppliers` tables via `fetchQuotesWithDetails()`
- **PASS/FAIL**: ✅ PASS if all 8 SKUs visible with supplier pricing, RF input fields enabled, table structure correct
- **FAIL Criteria**: SKUs missing, supplier pricing not visible, input fields disabled, table structure wrong

### **3.2 RF Sets Final Prices (rf_final_fob)**
- **Actor**: RF user
- **Screen**: RFDashboard → Pricing tab → Selected supplier
- **Action**: Enter `rf_final_fob` value in "RF Final" column for each of the 8 SKUs
- **Expected UI**:
  - Input field accepts numeric value
  - Value persists in input (React state `finalInputs`)
  - "Push to Finalize" button appears at bottom of table (if not all finalized yet)
- **DB Truth**: 
  - Values stored in React state: `finalInputs[item_id] = string_value`
  - **NOT YET SAVED** to database (waiting for button click)
- **PASS/FAIL**: ✅ PASS if inputs accept values, values persist, "Push to Finalize" button visible
- **FAIL Criteria**: Inputs don't work, values lost, button not visible

### **3.3 RF Clicks "Push to Finalize" Button**
- **Actor**: RF user
- **Screen**: RFDashboard → Pricing tab → Selected supplier → Pricing table footer
- **Action**: Click "Push to Finalize" button (labeled: "Push to Finalize" or "Processing..." if submitting)
- **Expected UI**:
  - Button shows loading state ("Processing...")
  - Success toast: "X quote(s) finalized for [Supplier Name]" (or similar)
  - RF Final column updates to show finalized values (read-only style, green background)
  - Lock icon appears next to SKU name (if all quotes for supplier finalized)
  - Supplier moves to "Finalized" category card
- **DB Truth**: 
  - `handlePushToFinalize()` function (`src/components/RFDashboard.tsx:570-678`) called
  - For each quote with `finalInputs[item_id]`:
    - Calls `updateRFFinal(quote.id, finalPrice)` from `src/utils/database.ts:250`
    - Executes: `UPDATE quotes SET rf_final_fob = ?, updated_at = ? WHERE id = ?`
  - After all quotes finalized for supplier:
    - Checks if all suppliers finalized via `checkAllSuppliersFinalized()`
    - If yes, shows "Finalize Week" button
- **PASS/FAIL**: ✅ PASS if all 8 SKUs have `rf_final_fob` set in `quotes` table, toast shows success, UI updates to finalized state, supplier in "Finalized" category
- **FAIL Criteria**: Some SKUs missing `rf_final_fob`, save fails, toast shows error, supplier not in "Finalized" category, "Finalize Week" button doesn't appear when all suppliers finalized

### **3.4 RF Finalizes Week Pricing (Optional but Recommended)**
- **Actor**: RF user
- **Screen**: RFDashboard → Pricing tab → Week view (no supplier selected, or after all suppliers finalized)
- **Action**: Click "Finalize Week" button (appears when all suppliers have finalized pricing OR all quotes with pricing have `rf_final_fob` set)
- **Expected UI**:
  - Button labeled "Finalize Week" (or "Finalizing..." if processing)
  - Success toast: "Pricing finalized! Volume allocation is now available." (or similar)
  - Week status badge changes from "OPEN" to "FINALIZED" (blue badge)
  - Auto-navigation to "2. Award Volume" tab (after 300ms delay)
  - Week dropdown still shows Week 7 but status is now "FINALIZED"
- **DB Truth**: 
  - `handleFinalizePricing()` function (`src/components/RFDashboard.tsx:755-836`) called
  - Calls `finalizePricingForWeek(weekId, userName)` from `src/utils/database.ts:1300`
  - Executes validation:
    - Checks: `SELECT id, rf_final_fob, supplier_fob, rf_counter_fob, supplier_response, supplier_revised_fob FROM quotes WHERE week_id = ?`
    - Auto-finalizes quotes without `rf_final_fob` if `supplier_fob` exists (fallback logic)
  - Updates week: `UPDATE weeks SET status = 'finalized' WHERE id = ?`
  - Verifies: `SELECT id, status FROM weeks WHERE id = ?` (must return `status = 'finalized'`)
- **PASS/FAIL**: ✅ PASS if week.status = 'finalized' in database, status badge updates, auto-navigation to Award Volume tab works, toast shows success
- **FAIL Criteria**: Week status not updated, badge shows wrong status, navigation doesn't work, toast shows error, validation fails

---

## **STEP 4 — RF AWARD VOLUME ALLOCATION**

### **4.1 RF Navigates to Award Volume Tab**
- **Actor**: RF user
- **Screen**: RFDashboard → "2. Award Volume" tab (auto-navigated after finalization OR manual click)
- **Action**: Click "2. Award Volume" tab (or auto-navigation after Step 3.4)
- **Expected UI**:
  - Tab highlights green ("2. Award Volume" card shows active state)
  - `AwardVolume` component (`src/components/AwardVolume.tsx`) renders
  - Header shows: "Award Volume" title with "Plug-and-play sandbox" subtitle
  - "Send Allocations to Suppliers" button visible (but disabled initially)
  - Accordion list shows all 8 SKUs (filtered by `filterStandardSKUs()`)
  - Each SKU card shows: name, pack size, CONV/ORG badge, pricing status, lock/unlock button
- **DB Truth**: 
  - `fetchItems()` queries `items` table
  - `fetchQuotesWithDetails(weekId)` queries quotes with joins
  - `fetchVolumeNeeds(weekId)` queries `week_item_volumes` table: `SELECT * FROM week_item_volumes WHERE week_id = ?`
  - `load()` function (`AwardVolume.tsx:149-370`) loads all data
- **PASS/FAIL**: ✅ PASS if Award Volume tab loads, all 8 SKUs visible in accordion, header shows correct title, "Send Allocations" button visible (disabled)
- **FAIL Criteria**: Tab doesn't load, SKUs missing, wrong SKUs shown, button not visible, errors in console

### **4.2 RF Enters Total Volume Needed Per SKU**
- **Actor**: RF user
- **Screen**: RFDashboard → Award Volume tab → SKU accordion (expand a SKU card)
- **Action**: 
  1. Click to expand SKU card (e.g., "Strawberry CONV 4×2 lb")
  2. Enter value in "Total Required Volume" input field (e.g., 2000 cases)
  3. Input auto-saves after 500ms debounce (or on blur)
- **Expected UI**:
  - Accordion expands to show SKU details
  - "Total Required Volume" input field visible and editable
  - Value persists in input (React state `requiredByItem`)
  - After debounce/blur, input shows saved state (green border or checkmark)
  - Toast may show "Volume needed saved" (optional)
- **DB Truth**: 
  - `saveRequiredDebounced()` function (`AwardVolume.tsx:456-472`) called
  - Calls `updateVolumeNeeded(weekId, itemId, volume)` from `src/utils/database.ts` (or direct `supabase.from('week_item_volumes').upsert()`)
  - Executes: `UPSERT INTO week_item_volumes (week_id, item_id, volume_needed, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT (week_id, item_id)`
  - Table: `week_item_volumes.volume_needed = entered_value`
- **PASS/FAIL**: ✅ PASS if `volume_needed` saved to `week_item_volumes` table for all 8 SKUs, value persists after refresh, UI shows saved state
- **FAIL Criteria**: Save fails, value not persisted, wrong SKU updated, refresh loses data

### **4.3 RF Allocates Volume to Suppliers Per SKU**
- **Actor**: RF user
- **Screen**: RFDashboard → Award Volume tab → Expanded SKU card (e.g., "Strawberry CONV")
- **Action**: 
  1. View suppliers table within expanded SKU card (shows all suppliers who have finalized pricing for this SKU)
  2. Enter "Award Cases" value for each supplier (e.g., Supplier A: 800 cases, Supplier B: 1200 cases)
  3. Values auto-save as typed (debounced)
- **Expected UI**:
  - Suppliers table shows: Rank (#1, #2, etc.), Supplier name, FOB Price (finalized or estimated), Award Cases (input), Row Cost (calculated: FOB × Award), status indicators
  - "Award Cases" input accepts numeric values
  - Row Cost updates live as values entered
  - Summary metrics update live: Total Awarded Cases, Remaining Cases, Weighted Avg Price, Total Cost, DLVD Price
  - Remaining Cases shows green when = 0, orange when > 0, red when < 0
- **DB Truth**: 
  - `setAwarded(q, value)` function (`AwardVolume.tsx:541-556`) updates React state `awardedByQuote`
  - `saveAwardDraftDebounced(q, volume)` function (`AwardVolume.tsx:508-539`) called
  - Calls `supabase.from('quotes').upsert()`:
    - `UPSERT INTO quotes (week_id, item_id, supplier_id, awarded_volume, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT (week_id, item_id, supplier_id)`
  - Table: `quotes.awarded_volume = entered_value` (draft, not sent yet)
- **PASS/FAIL**: ✅ PASS if `awarded_volume` saved to `quotes` table for all suppliers, live calculations correct (weighted avg, total cost, remaining), values persist after refresh
- **FAIL Criteria**: Save fails, calculations wrong, values not persisted, refresh loses data, remaining calculation incorrect

### **4.4 RF Verifies Weighted FOB and DLVD Display**
- **Actor**: RF user
- **Screen**: RFDashboard → Award Volume tab → Expanded SKU card → Summary metrics
- **Action**: Review calculated metrics after entering allocations
- **Expected UI**:
  - **Weighted Avg Price** (FOB): Shows `sum(FOB × awarded_volume) / sum(awarded_volume)` for all suppliers with `awarded_volume > 0`
  - **DLVD Price**: Shows `Weighted Avg FOB + Freight + Margin - Rebate` (from `item_pricing_calculations` or default values)
  - **Total Cost**: Shows `sum(FOB × awarded_volume)` for all suppliers
  - **Remaining Cases**: Shows `volume_needed - sum(awarded_volume)`
  - All metrics update live as allocations change
- **DB Truth**: 
  - Calculations performed in component (`AwardVolume.tsx:876-881`):
    - `totalAwarded = rows.reduce((s, x) => s + x.awarded, 0)`
    - `totalCost = rows.reduce((s, x) => s + x.rowCost, 0)`
    - `weightedAvgFOB = totalAwarded > 0 ? totalCost / totalAwarded : 0`
    - `dlvd = weightedAvgFOB > 0 ? weightedAvgFOB + calc.freight + calc.margin - calc.rebate : 0`
  - Pricing calculations from `item_pricing_calculations` table (if exists) or default values
- **PASS/FAIL**: ✅ PASS if weighted FOB calculation correct, DLVD calculation correct, metrics update live, values match manual calculation
- **FAIL Criteria**: Calculations wrong, metrics don't update, DLVD formula incorrect, missing pricing calculations data

---

## **STEP 5 — RF LOCKS EACH PRICED SKU**

### **5.1 RF Completes Allocation for SKU (Remaining = 0)**
- **Actor**: RF user
- **Screen**: RFDashboard → Award Volume tab → Expanded SKU card
- **Action**: Enter allocations such that `sum(awarded_volume) = volume_needed` (Remaining = 0)
- **Expected UI**:
  - "Remaining Cases" shows **0** with green background/checkmark
  - Validation message: "✓ Complete" or similar
  - Lock button becomes enabled (or already enabled if pricing finalized)
- **DB Truth**: 
  - Calculation: `remaining = required - totalAwarded` (`AwardVolume.tsx:878`)
  - Check: `remaining === 0` (`AwardVolume.tsx:960`)
- **PASS/FAIL**: ✅ PASS if remaining shows 0, validation passes, lock button enabled
- **FAIL Criteria**: Remaining not 0, validation fails, lock button disabled incorrectly

### **5.2 RF Clicks Lock Button for SKU**
- **Actor**: RF user
- **Screen**: RFDashboard → Award Volume tab → SKU card header (lock button outside accordion)
- **Action**: Click "Lock" button (labeled "Lock" with Lock icon) for a SKU where `remaining = 0` OR `rf_final_fob` exists (pricing finalized)
- **Expected UI**:
  - Button changes from "Lock" (blue) to "Unlock" (orange) state
  - Lock icon changes to Unlock icon
  - SKU card shows lock indicator (lock icon next to SKU name)
  - Volume inputs become disabled (grayed out, not editable)
  - Toast: "SKU locked successfully" (optional)
- **DB Truth**: 
  - `handleToggleSKULock(itemId, true, allocationComplete)` function (`AwardVolume.tsx:559-648`) called
  - Calls `lockSKU(weekId, itemId)` from `src/utils/database.ts:1045`
  - Executes: `UPSERT INTO week_item_volumes (week_id, item_id, locked, volume_needed, updated_at) VALUES (?, ?, true, ?, ?) ON CONFLICT (week_id, item_id)`
  - Table: `week_item_volumes.locked = true`
  - **Verification**: After upsert, queries: `SELECT locked FROM week_item_volumes WHERE week_id = ? AND item_id = ?` (must return `locked = true`)
- **PASS/FAIL**: ✅ PASS if `week_item_volumes.locked = true` for this SKU in database, button state changes, inputs disabled, state persists after refresh
- **FAIL Criteria**: Lock not saved, button state wrong, inputs still editable, state lost on refresh, verification query fails

### **5.3 RF Repeats Lock for All 8 Priced SKUs**
- **Actor**: RF user
- **Screen**: RFDashboard → Award Volume tab → All SKU cards
- **Action**: Complete allocation and click "Lock" for each of the 8 SKUs that have supplier pricing
- **Expected UI**:
  - All 8 SKUs show "Unlock" button (orange) after locking
  - All 8 SKUs show lock icon next to name
  - All 8 SKUs have disabled volume inputs
  - "Send Allocations to Suppliers" button may become enabled (if at least one SKU locked)
- **DB Truth**: 
  - `week_item_volumes` table has 8 rows (one per SKU) with `locked = true`
  - Query: `SELECT item_id, locked FROM week_item_volumes WHERE week_id = ? AND locked = true` returns 8 rows
- **PASS/FAIL**: ✅ PASS if all 8 SKUs have `locked = true` in database, all show unlock state, "Send Allocations" button enabled (if condition met)
- **FAIL Criteria**: Some SKUs not locked, database state inconsistent, button state wrong, "Send Allocations" not enabled

### **5.4 Verification: Unlock Works and Persists on Refresh**
- **Actor**: RF user
- **Screen**: RFDashboard → Award Volume tab → Locked SKU card
- **Action**: 
  1. Click "Unlock" button (orange) for a locked SKU
  2. Refresh page (F5)
  3. Verify SKU remains unlocked
- **Expected UI**:
  - Button changes from "Unlock" (orange) to "Lock" (blue)
  - Lock icon disappears
  - Volume inputs become enabled again
  - After refresh: SKU still shows "Lock" button (unlocked state)
- **DB Truth**: 
  - `handleToggleSKULock(itemId, false, ...)` calls `unlockSKU(weekId, itemId)` from `src/utils/database.ts:1087`
  - Executes: `UPSERT INTO week_item_volumes (week_id, item_id, locked, volume_needed, updated_at) VALUES (?, ?, false, ?, ?) ON CONFLICT (week_id, item_id)`
  - Table: `week_item_volumes.locked = false`
  - After refresh: `load()` function calls `fetchVolumeNeeds(weekId)` which queries: `SELECT item_id, volume_needed, locked FROM week_item_volumes WHERE week_id = ?`
  - `lockedSKUs` state repopulated from database
- **PASS/FAIL**: ✅ PASS if `locked = false` saved, unlock persists after refresh, button state correct, inputs enabled
- **FAIL Criteria**: Unlock not saved, state lost on refresh, button state wrong, inputs still disabled

---

## **STEP 6 — RF SENDS ALLOCATIONS TO SUPPLIERS**

### **6.1 "Send Allocations to Suppliers" Button Enablement Conditions**
- **Actor**: RF user
- **Screen**: RFDashboard → Award Volume tab → Header section
- **Action**: Review button state and tooltip
- **Expected UI**:
  - Button labeled: "Send Allocations to Suppliers" (with Send icon) OR "Sending..." (if processing)
  - **Button ENABLED when ALL of these are true**:
    1. `canEdit = true` (week status is 'open' or 'finalized', not 'closed')
    2. `atLeastOneSKULocked = true` (at least one SKU with supplier pricing is locked via lock button)
    3. `hasAnyAllocation = true` (at least one quote has `awarded_volume > 0`)
    4. `submitting = false` (not currently sending)
  - **Button DISABLED** with tooltip showing why:
    - "Week is locked" (if `canEdit = false`)
    - "At least one SKU must be locked before sending allocations..." (if `atLeastOneSKULocked = false`)
    - "Allocate at least one volume first" (if `hasAnyAllocation = false`)
- **DB Truth**: 
  - `canEdit` check: `selectedWeek.status !== 'closed'` (`AwardVolume.tsx:107`)
  - `atLeastOneSKULocked` check: `quotedItemIds.some(itemId => lockedSKUs.has(itemId))` (`AwardVolume.tsx:760-767`)
  - `hasAnyAllocation` check: `awardedByQuote` Map has at least one value > 0 (`AwardVolume.tsx:773-783`)
  - Queries: `fetchVolumeNeeds()` to check `locked` status, `fetchQuotesWithDetails()` to check `awarded_volume`
- **PASS/FAIL**: ✅ PASS if button enabled only when all conditions met, disabled with correct tooltip when conditions not met, tooltip text accurate
- **FAIL Criteria**: Button enabled when shouldn't be, disabled when should be enabled, tooltip shows wrong reason

### **6.2 RF Clicks "Send Allocations to Suppliers" Button**
- **Actor**: RF user
- **Screen**: RFDashboard → Award Volume tab → Header → "Send Allocations to Suppliers" button
- **Action**: Click "Send Allocations to Suppliers" button (when enabled)
- **Expected UI**:
  - Button shows loading state: "Sending..." with spinner
  - Success toast: "Allocations sent to X supplier(s). They will see these on their dashboard." (or similar)
  - Button may change to "Sent" state (green checkmark) OR remain enabled for potential re-send
  - Navigation link may appear: "View Responses" → goes to Volume Acceptance tab (optional)
- **DB Truth**: 
  - `handleSendAllocations()` function (`AwardVolume.tsx:650-725`) called
  - Calls `submitAllocationsToSuppliers(weekId, userName)` from `src/utils/database.ts:1456`
  - **Step 1**: Validates week status (must not be 'closed')
  - **Step 2**: Fetches quotes with `awarded_volume > 0`: `SELECT id, item_id, supplier_id, awarded_volume FROM quotes WHERE week_id = ? AND awarded_volume IS NOT NULL AND awarded_volume > 0`
  - **Step 3**: For each quote, updates:
    - `UPDATE quotes SET offered_volume = awarded_volume, supplier_volume_approval = 'pending', supplier_volume_response = NULL, supplier_volume_accepted = NULL, supplier_volume_response_notes = NULL, updated_at = ? WHERE id = ?`
  - **Step 4**: Updates week: `UPDATE weeks SET allocation_submitted = true, allocation_submitted_at = ?, allocation_submitted_by = ? WHERE id = ?`
  - **Step 5**: Verifies writes:
    - `SELECT id, offered_volume, supplier_id, item_id, awarded_volume FROM quotes WHERE week_id = ? AND offered_volume IS NOT NULL AND offered_volume > 0`
    - `SELECT allocation_submitted FROM weeks WHERE id = ?` (must return `true`)
- **PASS/FAIL**: ✅ PASS if `offered_volume` copied from `awarded_volume` for all quotes, `allocation_submitted = true` on week, verification queries pass, toast shows success, suppliers will see allocations
- **FAIL Criteria**: `offered_volume` not updated, `allocation_submitted` not set, verification fails, toast shows error, suppliers won't see allocations

### **6.3 Verification: Supplier Dashboard Shows Awards**
- **Actor**: Supplier user (same supplier who submitted pricing)
- **Screen**: SupplierDashboard (`src/components/SupplierDashboard.tsx`)
- **Action**: Login as supplier, select Week 7, scroll to "Volume Offers" section
- **Expected UI**:
  - "Volume Offers" section visible (rendered by `VolumeOffers` component, `src/components/VolumeOffers.tsx`)
  - Section header: "Volume Offers - Week 7"
  - List shows all SKUs where `offered_volume > 0` for this supplier
  - Each SKU shows: SKU name, Offered Volume (cases), Final FOB Price, Total Value (FOB × Volume)
  - Action buttons: "Accept", "Revise", "Decline" for each SKU
  - "Submit All Responses" button at bottom (disabled until at least one response selected)
- **DB Truth**: 
  - `loadAllAwardedVolumes()` function (`SupplierDashboard.tsx:263-350`) queries:
    - `SELECT * FROM quotes WHERE supplier_id = ? AND (offered_volume > 0 OR awarded_volume > 0) ORDER BY week_number DESC, created_at DESC`
  - `VolumeOffers` component filters: `quotes.filter(q => q.offered_volume && q.offered_volume > 0)`
  - Also checks: `week.allocation_submitted = true` to show section
- **PASS/FAIL**: ✅ PASS if Volume Offers section visible, all SKUs with `offered_volume > 0` shown, values match what RF allocated, action buttons enabled, week shows `allocation_submitted = true`
- **FAIL Criteria**: Volume Offers section not visible, missing SKUs, wrong volumes shown, buttons disabled, `allocation_submitted` not true

---

## **STEP 7 — SUPPLIER SEES AWARDS AND ACCEPTS/REVISES**

### **7.1 Supplier Views Volume Offers**
- **Actor**: Supplier user
- **Screen**: SupplierDashboard → Volume Offers section (`VolumeOffers` component, `src/components/VolumeOffers.tsx`)
- **Action**: Scroll to "Volume Offers" section, review list of SKUs with offered volumes
- **Expected UI**:
  - Section shows all SKUs where `offered_volume > 0` for this supplier
  - For each SKU:
    - SKU name and pack size
    - Offered Volume (cases) - e.g., "800 cases"
    - Final FOB Price - e.g., "$10.50"
    - Total Value - calculated: `offered_volume × rf_final_fob`
    - Radio buttons or dropdown: "Accept", "Revise", "Decline"
    - If "Revise" selected: Input field for revised volume appears
    - Optional notes field
- **DB Truth**: 
  - Query: `SELECT * FROM quotes WHERE supplier_id = ? AND week_id = ? AND offered_volume > 0`
  - Joins with `items` table to get SKU details
  - Uses `rf_final_fob` (or `supplier_fob` as fallback) for price display
- **PASS/FAIL**: ✅ PASS if all SKUs with offers visible, values correct, action options available, UI structure correct
- **FAIL Criteria**: SKUs missing, wrong volumes, wrong prices, action options not available, UI broken

### **7.2 Supplier Accepts Volume Offer**
- **Actor**: Supplier user
- **Screen**: SupplierDashboard → Volume Offers section → SKU row
- **Action**: 
  1. Select "Accept" radio button for a SKU (e.g., "Strawberry CONV")
  2. Click "Submit All Responses" button (or individual submit if available)
- **Expected UI**:
  - Radio button shows selected state
  - "Submit All Responses" button becomes enabled
  - After click: Button shows "Submitting..." state
  - Success toast: "X volume response(s) submitted successfully" (or similar)
  - SKU row updates to show "Accepted" status (green checkmark)
  - Response inputs clear (ready for next SKU if multiple)
- **DB Truth**: 
  - `handleSubmitAll()` function (`VolumeOffers.tsx:88-138`) called
  - For "Accept" action:
    - Calls `updateSupplierVolumeResponse(quoteId, 'accept', offeredVolume, notes)` from `src/utils/database.ts:1768`
    - Executes: `UPDATE quotes SET supplier_volume_response = 'accept', supplier_volume_accepted = offered_volume, supplier_volume_approval = 'accepted', supplier_volume_response_notes = ?, updated_at = ? WHERE id = ?`
  - Table changes: `quotes.supplier_volume_response = 'accept'`, `quotes.supplier_volume_accepted = offered_volume`
  - Custom event dispatched: `window.dispatchEvent(new CustomEvent('navigate-to-volume-acceptance', { detail: { weekNumber, fromSupplierResponse: true } }))`
- **PASS/FAIL**: ✅ PASS if `supplier_volume_response = 'accept'` and `supplier_volume_accepted = offered_volume` saved to database, toast shows success, UI updates, custom event dispatched
- **FAIL Criteria**: Save fails, wrong values saved, toast shows error, UI doesn't update, custom event not dispatched

### **7.3 Supplier Revises Volume Offer (Alternative Action)**
- **Actor**: Supplier user
- **Screen**: SupplierDashboard → Volume Offers section → SKU row
- **Action**: 
  1. Select "Revise" radio button for a SKU
  2. Enter revised volume in input field (e.g., 750 cases instead of 800)
  3. Optionally enter notes
  4. Click "Submit All Responses"
- **Expected UI**:
  - "Revise" selection shows revised volume input field
  - Input accepts numeric value (must be > 0)
  - After submit: Success toast, SKU row shows "Revised" status (orange refresh icon)
- **DB Truth**: 
  - For "Revise" action:
    - Calls `updateSupplierVolumeResponse(quoteId, 'update', revisedVolume, notes)`
    - Executes: `UPDATE quotes SET supplier_volume_response = 'update', supplier_volume_accepted = revised_volume, supplier_volume_approval = 'revised', supplier_volume_response_notes = ?, updated_at = ? WHERE id = ?`
  - Table changes: `quotes.supplier_volume_response = 'update'`, `quotes.supplier_volume_accepted = revised_volume`
- **PASS/FAIL**: ✅ PASS if `supplier_volume_response = 'update'` and `supplier_volume_accepted = revised_volume` saved, toast shows success, UI updates
- **FAIL Criteria**: Save fails, wrong response type, wrong volume saved, toast shows error

### **7.4 Supplier Declines Volume Offer (Alternative Action)**
- **Actor**: Supplier user
- **Screen**: SupplierDashboard → Volume Offers section → SKU row
- **Action**: Select "Decline" radio button, click "Submit All Responses"
- **Expected UI**:
  - SKU row shows "Declined" status (red X icon)
  - Toast shows success
- **DB Truth**: 
  - Calls `updateSupplierVolumeResponse(quoteId, 'decline', 0, notes)`
  - Executes: `UPDATE quotes SET supplier_volume_response = 'decline', supplier_volume_accepted = 0, supplier_volume_approval = 'declined', supplier_volume_response_notes = ?, updated_at = ? WHERE id = ?`
  - Table changes: `quotes.supplier_volume_response = 'decline'`, `quotes.supplier_volume_accepted = 0`
- **PASS/FAIL**: ✅ PASS if decline response saved correctly, UI updates, status shows declined
- **FAIL Criteria**: Save fails, wrong response type, UI doesn't update

---

## **STEP 8 — RF ACCEPTANCE TAB UPDATES TO SHOW SUPPLIER RESPONSE**

### **8.1 RF Dashboard Auto-Navigates to Acceptance Tab**
- **Actor**: RF user
- **Screen**: RFDashboard → Auto-navigation triggered
- **Action**: Supplier submits volume response (Step 7.2/7.3/7.4) triggers realtime event
- **Expected UI**:
  - **Realtime Listener** (`RFDashboard.tsx:99-148`): Detects supplier response via Supabase realtime subscription
  - Auto-navigation: `setMainView('volume_acceptance')` called
  - Tab "3. Acceptance" becomes active (renders `Allocation` component in exceptions mode)
  - Toast: "Supplier responded to volume offer - switched to Acceptance tab" (or similar)
  - **Note**: The `volume_acceptance` view renders the `Allocation` component (`src/components/Allocation.tsx`) in exceptions mode, NOT `VolumeAcceptance` component
- **DB Truth**: 
  - Realtime subscription: `supabase.channel('rf-dashboard-quotes-${weekId}').on('postgres_changes', { event: 'UPDATE', table: 'quotes', filter: 'week_id=eq.${weekId}' })`
  - Listener checks: `payload.new?.supplier_volume_response !== payload.old?.supplier_volume_response` OR `payload.new?.supplier_volume_accepted > 0` AND changed
  - Query check (`RFDashboard.tsx:183-188`): `SELECT id FROM quotes WHERE week_id = ? AND (supplier_volume_response IS NOT NULL OR supplier_volume_accepted > 0) LIMIT 1`
- **PASS/FAIL**: ✅ PASS if auto-navigation triggers, correct tab/view shows, toast appears, realtime subscription works
- **FAIL Criteria**: Auto-navigation doesn't trigger, wrong tab/view shows, toast doesn't appear, realtime subscription fails

### **8.2 RF Views Volume Acceptance Tab (Allocation Component in Exceptions Mode)**
- **Actor**: RF user
- **Screen**: RFDashboard → "3. Acceptance" tab → `Allocation` component (`src/components/Allocation.tsx`) in exceptions mode
- **Action**: Navigate to Volume Acceptance tab (auto or manual)
- **Expected UI**:
  - **Component**: `Allocation` component renders in exceptions mode (NOT `VolumeAcceptance` component)
  - **Exceptions Mode Activation**: Triggered when `allocation_submitted === true` AND `hasResponses === true` (`Allocation.tsx:691-711`)
  - Header shows: "Volume Allocation" or similar (Allocation component header)
  - Table/list shows supplier responses grouped by SKU:
    - **Pending Allocations**: Quotes with `offered_volume > 0` but `supplier_volume_response IS NULL`
    - **Responded Allocations**: Quotes where supplier responded (`supplier_volume_response IS NOT NULL` AND `supplier_volume_response != 'decline'`) but RF hasn't finalized (`awarded_volume != supplier_volume_accepted` OR `awarded_volume === 0`)
    - **Finalized Allocations**: Quotes where `awarded_volume > 0` AND (`supplier_volume_response === 'decline'` OR (`supplier_volume_response IS NOT NULL` AND `supplier_volume_response != 'decline'` AND `awarded_volume === supplier_volume_accepted`))
  - For each responded allocation, shows: Supplier name, SKU, Offered Volume, Supplier Response (accept/update/decline), Supplier Accepted Volume, Action buttons (Accept Response, Revise Offer, Withdraw)
- **DB Truth**: 
  - `loadData()` function (`Allocation.tsx:587-849`) queries:
    - `fetchQuotesWithDetails(weekId)` → `SELECT * FROM quotes WHERE week_id = ?` joined with `items` and `suppliers`
    - `fetchVolumeNeeds(weekId)` → `SELECT item_id, volume_needed, locked FROM week_item_volumes WHERE week_id = ?`
  - Exceptions mode check (`Allocation.tsx:691-711`):
    - `hasResponses`: `quotes.some(q => (q.supplier_volume_response === 'accept' || q.supplier_volume_response === 'update' || q.supplier_volume_response === 'decline') || (q.supplier_volume_accepted && q.supplier_volume_accepted > 0))`
    - `shouldShowExceptions`: `selectedWeek.allocation_submitted === true && hasResponses`
  - Filters applied within Allocation component's data structure (grouped by SKU)
- **PASS/FAIL**: ✅ PASS if Allocation component loads in exceptions mode, responded allocations visible, pending/finalized correctly categorized, supplier response data displayed correctly
- **FAIL Criteria**: Component doesn't load, exceptions mode not activated, responded allocations missing, wrong categorization, supplier response data missing or incorrect

### **8.3 RF Accepts Supplier Response**
- **Actor**: RF user
- **Screen**: RFDashboard → Volume Acceptance tab (Allocation component) → Responded Allocations section → SKU row with "Accept Response" button
- **Action**: Click "Accept Response" button (or "Accept" button) for a supplier response
- **Expected UI**:
  - Button shows loading state (processing state)
  - Success toast: "Accepted X units from [Supplier Name]" (or similar) (`Allocation.tsx:230`)
  - SKU row moves from "Responded Allocations" to "Finalized Allocations" section (after reload)
  - `awarded_volume` updates to match `supplier_volume_accepted`
  - Status shows finalized indicator
- **DB Truth**: 
  - `handleAcceptSupplierResponse()` function (`Allocation.tsx:216-238`) called
  - Executes: `UPDATE quotes SET awarded_volume = supplier_volume_accepted, offered_volume = supplier_volume_accepted, updated_at = ? WHERE id = ?`
  - Table changes: `quotes.awarded_volume = supplier_volume_accepted` (matches supplier's accepted/revised volume)
  - Reload: `loadData()` called to refresh UI (`Allocation.tsx:231`)
- **PASS/FAIL**: ✅ PASS if `awarded_volume` updated to match `supplier_volume_accepted`, row moves to finalized section after reload, toast shows success, UI refreshes correctly
- **FAIL Criteria**: Update fails, wrong volume saved, row doesn't move, toast shows error, UI doesn't refresh

### **8.4 RF Revises Offer (Alternative Action)**
- **Actor**: RF user
- **Screen**: RFDashboard → Volume Acceptance tab (Allocation component) → Responded Allocations section → SKU row
- **Action**: 
  1. Enter new volume in "Revise Offer" input field (stored in `revisedVolumes` state)
  2. Click "Revise Offer" button
- **Expected UI**:
  - Input field accepts numeric value (must be > 0)
  - After submit: Success toast: "Revised offer to X units for [Supplier Name]" (`Allocation.tsx:262`)
  - `offered_volume` updates to new volume, supplier response fields reset (`supplier_volume_response = NULL`, `supplier_volume_accepted = 0`)
  - SKU row may move back to "Pending" section (supplier can respond again)
- **DB Truth**: 
  - `handleReviseOffer()` function (`Allocation.tsx:240-271`) called
  - Executes: `UPDATE quotes SET offered_volume = new_volume, supplier_volume_response = NULL, supplier_volume_accepted = 0, supplier_volume_response_notes = NULL, updated_at = ? WHERE id = ?`
  - Table changes: `quotes.offered_volume = new_volume`, supplier response fields reset to NULL/0
  - Reload: `loadData()` called to refresh UI (`Allocation.tsx:264`)
- **PASS/FAIL**: ✅ PASS if `offered_volume` updated, supplier response reset, toast shows success, supplier can respond again, UI refreshes
- **FAIL Criteria**: Update fails, wrong volume saved, supplier response not reset, toast shows error, UI doesn't refresh

### **8.5 RF Closes Volume Loop (Final Step)**
- **Actor**: RF user
- **Screen**: RFDashboard → Volume Acceptance tab (Allocation component) → "Close the Loop" button (when all responses handled)
- **Action**: Click "Close the Loop" button (labeled "Close the Loop" with Lock icon, enabled when `allResponsesHandled === true` AND `!volumeFinalized`)
- **Expected UI**:
  - Button shows loading state: "Closing Loop..." (with spinner, `Allocation.tsx:638`)
  - Success toast: "Volume allocation loop closed successfully. Week is now locked." (`Allocation.tsx:328`)
  - Week status badge changes from "FINALIZED" to "CLOSED" (gray badge)
  - Week becomes read-only (except emergency unlock)
  - Button changes to disabled state with "Volume Loop Closed - Week Locked" indicator
- **DB Truth**: 
  - `handleCloseLoop()` function (`Allocation.tsx:298-345`) called
  - **Validation Checks** (`Allocation.tsx:304-321`):
    1. **Check 1**: No pending allocations: `pendingAllocations.length > 0` → must be false
    2. **Check 2**: No unhandled responses: `respondedAllocations.length > 0` → must be false
    3. **Check 3**: At least one finalized allocation: `finalizedAllocations.length === 0` → must be false
  - Calls `closeVolumeLoop(weekId, userName)` from `src/utils/database.ts:2234`
  - **Backend Validation** (in `closeVolumeLoop` function):
    1. No pending supplier responses: `SELECT COUNT(*) FROM quotes WHERE week_id = ? AND offered_volume > 0 AND (supplier_volume_response IS NULL OR supplier_volume_response = '')` → must return 0
    2. No unhandled responses: `SELECT COUNT(*) FROM quotes WHERE week_id = ? AND offered_volume > 0 AND supplier_volume_response IS NOT NULL AND supplier_volume_response != 'decline' AND supplier_volume_accepted > 0 AND (awarded_volume IS NULL OR awarded_volume != supplier_volume_accepted)` → must return 0
    3. At least one finalized allocation: `SELECT COUNT(*) FROM quotes WHERE week_id = ? AND ((supplier_volume_response = 'decline') OR (supplier_volume_response IS NOT NULL AND supplier_volume_response != 'decline' AND supplier_volume_accepted > 0 AND awarded_volume > 0 AND awarded_volume = supplier_volume_accepted))` → must return > 0
  - **If all checks pass**:
    - Updates week: `UPDATE weeks SET status = 'closed', volume_finalized = true, volume_finalized_at = ?, volume_finalized_by = ? WHERE id = ?`
    - Verifies: `SELECT status, volume_finalized FROM weeks WHERE id = ?` (must return `status = 'closed'` AND `volume_finalized = true`)
  - Reload: `loadAllocations()` and `checkVolumeFinalized()` called (`Allocation.tsx:330-331`)
- **PASS/FAIL**: ✅ PASS if all validation checks pass (frontend and backend), week.status = 'closed' and volume_finalized = true in database, status badge updates, toast shows success, week becomes read-only, button shows closed state
- **FAIL Criteria**: Validation fails (pending/unhandled responses exist), week status not updated, verification fails, toast shows error, week still editable, button state incorrect

---

## **STEP-BY-STEP SUMMARY TABLE**

| Step | Actor | Screen/Component | Button/Action | DB Write | DB Read | PASS Criteria |
|------|-------|------------------|---------------|----------|---------|---------------|
| 0.1 | Any | Login.tsx | Enter access code | None | None | Login page loads, access code works |
| 0.2 | Demo | Login.tsx | Switch RF ↔ Supplier | None | suppliers table | Both dashboards load, logout works |
| 0.3 | Demo | Any | Refresh/Navigate | None | weeks table | State persists, navigation works |
| 1.1 | RF | RFDashboard.tsx | View week dropdown | None | weeks table | Week 7 (OPEN) visible |
| 1.2 | RF | RFDashboard.tsx | Select Week 7 | None | quotes, suppliers | Week selected, quotes initialized |
| 2.1 | Supplier | SupplierDashboard.tsx | Login as supplier | None | suppliers table | Supplier dashboard loads |
| 2.2 | Supplier | SupplierDashboard.tsx | View pricing table | None | items, quotes | Exactly 8 SKUs shown |
| 2.3 | Supplier | SupplierDashboard.tsx | Enter FOB/DLVD | None (state) | None | Inputs work, values persist |
| 2.4 | Supplier | SupplierDashboard.tsx | Submit Pricing | quotes table (supplier_fob, supplier_dlvd) | None | All 8 SKUs saved, toast success |
| 2.5 | RF | RFDashboard.tsx | View supplier pricing | None | quotes table | RF sees all 8 SKUs with pricing |
| 3.1 | RF | RFDashboard.tsx | Review pricing table | None | quotes table | All 8 SKUs visible with supplier pricing |
| 3.2 | RF | RFDashboard.tsx | Enter RF Final | None (state) | None | Inputs work, values persist |
| 3.3 | RF | RFDashboard.tsx | Push to Finalize | quotes table (rf_final_fob) | quotes table | All 8 SKUs have rf_final_fob, toast success |
| 3.4 | RF | RFDashboard.tsx | Finalize Week | weeks table (status='finalized') | quotes, weeks | Week status='finalized', auto-navigate works |
| 4.1 | RF | AwardVolume.tsx | Navigate to tab | None | items, quotes, week_item_volumes | Award Volume tab loads, all 8 SKUs visible |
| 4.2 | RF | AwardVolume.tsx | Enter volume needed | week_item_volumes (volume_needed) | week_item_volumes | All 8 SKUs have volume_needed saved |
| 4.3 | RF | AwardVolume.tsx | Allocate to suppliers | quotes table (awarded_volume) | quotes table | awarded_volume saved, calculations correct |
| 4.4 | RF | AwardVolume.tsx | Review metrics | None | quotes, item_pricing_calculations | Weighted FOB and DLVD display correctly |
| 5.1 | RF | AwardVolume.tsx | Complete allocation | None | week_item_volumes | Remaining = 0, lock button enabled |
| 5.2 | RF | AwardVolume.tsx | Click Lock | week_item_volumes (locked=true) | week_item_volumes | locked=true saved, button state changes |
| 5.3 | RF | AwardVolume.tsx | Lock all 8 SKUs | week_item_volumes (8 rows locked=true) | week_item_volumes | All 8 SKUs locked, Send button enabled |
| 5.4 | RF | AwardVolume.tsx | Unlock + Refresh | week_item_volumes (locked=false) | week_item_volumes | Unlock persists after refresh |
| 6.1 | RF | AwardVolume.tsx | Review button state | None | weeks, week_item_volumes, quotes | Button enabled only when conditions met |
| 6.2 | RF | AwardVolume.tsx | Send Allocations | quotes (offered_volume), weeks (allocation_submitted=true) | quotes, weeks | offered_volume copied, allocation_submitted=true |
| 6.3 | Supplier | SupplierDashboard.tsx | View Volume Offers | None | quotes, weeks | Volume Offers section visible, all SKUs shown |
| 7.1 | Supplier | VolumeOffers.tsx | View offers list | None | quotes, items | All offered SKUs visible, values correct |
| 7.2 | Supplier | VolumeOffers.tsx | Accept offer | quotes (supplier_volume_response, supplier_volume_accepted) | quotes | Accept response saved, toast success |
| 7.3 | Supplier | VolumeOffers.tsx | Revise offer | quotes (supplier_volume_response='update', supplier_volume_accepted) | quotes | Revise response saved, toast success |
| 7.4 | Supplier | VolumeOffers.tsx | Decline offer | quotes (supplier_volume_response='decline', supplier_volume_accepted=0) | quotes | Decline response saved, toast success |
| 8.1 | RF | RFDashboard.tsx | Auto-navigate | None | quotes (realtime) | Auto-navigation triggers, correct tab shows |
| 8.2 | RF | Allocation.tsx (exceptions mode) | View acceptance tab | None | quotes, items, suppliers, week_item_volumes | Allocation in exceptions mode, responded allocations visible, correctly categorized |
| 8.3 | RF | Allocation.tsx | Accept response | quotes (awarded_volume=supplier_volume_accepted) | quotes | awarded_volume updated, row moves to finalized |
| 8.4 | RF | Allocation.tsx | Revise offer | quotes (offered_volume, supplier response reset) | quotes | offered_volume updated, supplier response reset |
| 8.5 | RF | Allocation.tsx | Close Loop | weeks (status='closed', volume_finalized=true) | quotes, weeks | All validations pass (frontend + backend), week closed, read-only |

---

## **CRITICAL SKU FILTERING REQUIREMENTS**

**Function**: `filterStandardSKUs()` in `src/utils/helpers.ts:80-217`

**Required 8 SKUs**:
1. **Strawberry CONV** - pack_size must be "4×2 lb" (normalized from variants like "4x2lb", "4×2 lb", etc.)
2. **Strawberry ORG** - any pack size (no normalization required)
3. **Blueberry CONV** - any pack size
4. **Blueberry ORG** - any pack size
5. **Blackberry CONV** - pack_size must be "12ozx6" ONLY (normalized from variants)
6. **Blackberry ORG** - pack_size must be "12ozx6" ONLY
7. **Raspberry CONV** - pack_size must be "12ozx6" ONLY
8. **Raspberry ORG** - pack_size must be "12ozx6" ONLY

**MUST EXCLUDE**: Standalone 2lb strawberry SKUs (pack_size = "2lb", "2 lb", etc. WITHOUT "4" in pack size)

**PASS Criteria**: Exactly 8 SKUs shown, all required SKUs present, Blackberry/Raspberry only show 12ozx6, no standalone 2lb strawberry
**FAIL Criteria**: More/fewer than 8 SKUs, missing required SKUs, wrong pack sizes, standalone 2lb strawberry visible

---

**END OF PART A — BOARD-DEMO WALKTHROUGH SCRIPT**

**STOP HERE — WAITING FOR APPROVAL BEFORE PROCEEDING TO PART B**
