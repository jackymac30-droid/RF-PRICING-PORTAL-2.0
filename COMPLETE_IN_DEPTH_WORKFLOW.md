# 📋 COMPLETE IN-DEPTH WORKFLOW - EVERY STEP DETAILED
## Robinson Fresh - Volume & Pricing Management System

**Nothing Missing - Every Action, Every Field, Every State Change**

---

## 🎯 **SYSTEM OVERVIEW**

**Purpose**: RF (Robinson Fresh) managers negotiate pricing with suppliers, allocate volume, and manage the complete procurement cycle from week creation to final volume acceptance.

**Two User Roles**:
- **RF Manager**: Creates weeks, negotiates pricing, allocates volume, manages responses, finalizes weeks
- **Supplier**: Submits pricing, responds to counters, accepts/revises volume offers

**Database Tables**:
- `weeks`: Week metadata (status, dates, allocation_submitted, volume_finalized)
- `items`: SKUs (8 berry items: Strawberry, Blueberry, Blackberry, Raspberry)
- `suppliers`: 5 suppliers (Berry Farms + 4 others)
- `quotes`: Pricing and volume data (one row per week×item×supplier)
- `week_item_volumes`: Volume needs and lock status per SKU

---

## 🔐 **PHASE 0: LOGIN & AUTHENTICATION**

### Step 0.1: Access Application
- **URL**: `http://localhost:5173` (local) or Netlify URL
- **Access Code**: `RF2024` (default, can be changed in `.env` as `VITE_ACCESS_CODE`)
- **First Time**: Enter access code to unlock login screen
- **Database**: No changes

### Step 0.2: Login as RF Manager
- **Action**: Select "RF Manager" or enter username `rf`
- **Password**: Optional in dev mode (set in `.env` as `VITE_RF_PASSWORD`)
- **What Happens**:
  - Session created: `{ user_id: 'rf-user', user_name: 'RF Manager', role: 'rf' }`
  - Saved to `localStorage` as `rf_pricing_session`
  - Redirected to RF Dashboard
- **Database**: No changes
- **Default View**: Pricing tab, Week 8 selected (if exists and open)

### Step 0.3: Login as Supplier
- **Action**: Select supplier from dropdown (e.g., "Berry Farms")
- **Password**: Optional in dev mode
- **What Happens**:
  - Session created: `{ user_id: supplier.id, user_name: supplier.name, role: 'supplier', supplier_id: supplier.id }`
  - Saved to `localStorage` as `rf_pricing_session`
  - Redirected to Supplier Dashboard
- **Database**: No changes
- **Default View**: Current open week (if exists)

---

## 📅 **PHASE 1: WEEK CREATION (RF Only)**

### Step 1.1: Create New Week
- **Location**: RF Dashboard → Top right → "Create Week" button
- **Function**: `createNewWeek()` in `database.ts`
- **What Happens**:
  1. **Closes all existing open weeks**:
     - Updates all weeks with `status = 'open'` → `status = 'finalized'`
     - This ensures only ONE open week at a time
  2. **Creates new week**:
     - Auto-increments `week_number` (finds max week_number, adds 1)
     - Sets `status = 'open'`
     - Sets `start_date` = today
     - Sets `end_date` = today + 6 days
     - Sets `allocation_submitted = false`
     - Sets `volume_finalized = false`
  3. **Auto-creates quotes**:
     - For EVERY combination of (supplier × item)
     - Creates quote row with:
       - `week_id` = new week ID
       - `item_id` = item ID
       - `supplier_id` = supplier ID
       - `supplier_fob` = NULL (not priced yet)
       - `rf_counter_fob` = NULL
       - `supplier_response` = NULL
       - `supplier_revised_fob` = NULL
       - `rf_final_fob` = NULL
       - `awarded_volume` = NULL
       - `offered_volume` = NULL
       - All other fields = NULL
- **Database Changes**:
  - `weeks` table: New row with `status = 'open'`
  - `quotes` table: New rows for every `(week_id, item_id, supplier_id)` combination
  - `weeks` table: All previous open weeks → `status = 'finalized'`
- **UI Changes**:
  - New week appears in week dropdown
  - Week automatically selected
  - Pricing tab shows empty quotes (no pricing yet)
- **Validation**: None (RF can always create weeks)

---

## 💰 **PHASE 2: PRICING NEGOTIATION**

### Step 2.1: Supplier Submits Initial Pricing
- **Location**: Supplier Dashboard → "Submit Pricing" section
- **Function**: `updateSupplierResponse()` in `database.ts`
- **What Supplier Does**:
  1. Selects the open week (auto-selected if only one open week)
  2. Sees all 8 items/SKUs they can price
  3. For each SKU, enters:
     - `supplier_fob` (FOB price) - **REQUIRED**
     - `supplier_dlvd` (Delivered price) - Optional
  4. Clicks "Submit Pricing" button
- **What Happens**:
  - For each quote with entered pricing:
    - Updates `quotes.supplier_fob` = entered FOB price
    - Updates `quotes.supplier_dlvd` = entered delivered price (if provided)
    - Updates `quotes.updated_at` = current timestamp
  - Custom event dispatched: `pricing-submitted` with `{ weekId, supplierId, quoteCount }`
- **Database Changes**:
  - `quotes` table: `supplier_fob` and `supplier_dlvd` updated for submitted quotes
- **UI Changes**:
  - **RF Dashboard**: 
    - Pricing tab shows supplier's submitted prices
    - Supplier appears in "Submitted" list
    - Status shows "Quoted" (supplier_fob set)
  - **Supplier Dashboard**:
    - Submitted prices show as "Submitted"
    - Can still edit and resubmit
- **Validation**: 
  - Must enter at least one FOB price
  - FOB price must be > 0
- **Status**: Quote status = "Quoted" (supplier_fob set, rf_final_fob = NULL)

### Step 2.2: RF Reviews Pricing & Sends Counter Offers (Optional)
- **Location**: RF Dashboard → Pricing Tab → Select Supplier → Counter column
- **Function**: `updateRFCounter()` in `database.ts`
- **What RF Does**:
  1. Reviews all supplier quotes per SKU
  2. For quotes they want to negotiate:
     - Enters `rf_counter_fob` (counter offer price)
     - Typically lower than supplier_fob
  3. Clicks "Send Counter Offers" button (per supplier)
- **What Happens**:
  - For each quote with counter:
    - Updates `quotes.rf_counter_fob` = counter offer price
    - Updates `quotes.updated_at` = current timestamp
  - Supplier sees counter in their dashboard
- **Database Changes**:
  - `quotes` table: `rf_counter_fob` updated for countered quotes
- **UI Changes**:
  - **RF Dashboard**: 
    - Counter prices show in "Counter" column
    - Supplier appears in "Countered" list
  - **Supplier Dashboard**:
    - Counter offers appear in "Counter Offers" section
    - Status shows "Countered" (rf_counter_fob set, supplier_response = NULL)
- **Validation**: 
  - Counter price must be > 0
  - Can counter multiple quotes at once
- **Status**: Quote status = "Countered" (rf_counter_fob set, supplier_response = NULL)

### Step 2.3: Supplier Responds to Counter (Optional)
- **Location**: Supplier Dashboard → "Counter Offers" section
- **Function**: `updateSupplierResponse()` in `database.ts`
- **What Supplier Does**:
  1. Sees counter offers from RF
  2. For each counter, chooses:
     - **Accept**: Accepts the counter price
     - **Revise**: Proposes a new price
  3. If "Revise":
     - Enters `supplier_revised_fob` (new proposed price)
  4. Clicks "Submit Responses" button
- **What Happens**:
  - For each response:
    - Updates `quotes.supplier_response` = 'accept' or 'revise'
    - If 'revise': Updates `quotes.supplier_revised_fob` = revised price
    - If 'accept': Sets `quotes.rf_final_fob` = `rf_counter_fob` (auto-finalized)
    - Updates `quotes.updated_at` = current timestamp
- **Database Changes**:
  - `quotes` table: `supplier_response`, `supplier_revised_fob`, `rf_final_fob` updated
- **UI Changes**:
  - **RF Dashboard**: 
    - Shows supplier response (Accept/Revise)
    - If Accept: Quote shows as "Finalized" (rf_final_fob set)
    - If Revise: Quote shows as "Revised" (supplier_revised_fob set)
  - **Supplier Dashboard**:
    - Response shows as submitted
- **Validation**: 
  - Must respond to all counters
  - Revised price must be > 0
- **Status**: 
  - If Accept: Quote status = "Finalized" (rf_final_fob set)
  - If Revise: Quote status = "Revised" (supplier_revised_fob set, rf_final_fob = NULL)

### Step 2.4: RF Finalizes Pricing
- **Location**: RF Dashboard → Pricing Tab → Select Supplier → Final column
- **Function**: `updateRFFinal()` in `database.ts`
- **What RF Does**:
  1. Reviews all supplier quotes
  2. For quotes to finalize:
     - If supplier accepted counter: `rf_final_fob` already set (auto-finalized)
     - If supplier revised: RF enters `rf_final_fob` (can accept revised price or set different)
     - If no counter: RF enters `rf_final_fob` directly
  3. Clicks "Push to Finalize" button (per supplier)
- **What Happens**:
  - For each quote with final price:
    - Updates `quotes.rf_final_fob` = final FOB price
    - Updates `quotes.updated_at` = current timestamp
  - Supplier appears in "Finalized" list
- **Database Changes**:
  - `quotes` table: `rf_final_fob` updated for finalized quotes
- **UI Changes**:
  - **RF Dashboard**: 
    - Final prices show in "Final" column
    - Supplier appears in "Finalized" list
    - Status shows "Finalized" (rf_final_fob set)
  - **Supplier Dashboard**:
    - Final prices visible (read-only)
- **Validation**: 
  - Final price must be > 0
  - Can finalize multiple quotes at once
- **Status**: Quote status = "Finalized" (rf_final_fob set)

### Step 2.5: RF Finalizes Week (Optional - Auto-happens when pricing finalized)
- **Location**: RF Dashboard → Pricing Tab → "Finalize Week" button
- **Function**: `finalizePricingForWeek()` in `database.ts`
- **What RF Does**:
  1. Reviews all pricing
  2. Clicks "Finalize Week" button
- **What Happens**:
  - Updates `weeks.status` = 'finalized' (if not already)
  - All quotes with `rf_final_fob` are considered finalized
- **Database Changes**:
  - `weeks` table: `status` = 'finalized'
- **UI Changes**:
  - Week status shows as "Finalized"
  - Award Volume tab becomes accessible
- **Validation**: 
  - At least one quote must have `rf_final_fob` set
- **Status**: Week status = "finalized"

---

## 📦 **PHASE 3: VOLUME ALLOCATION**

### Step 3.1: RF Enters Volume Needs
- **Location**: RF Dashboard → Award Volume tab → Select SKU → "Total Required Volume" field
- **Function**: `updateVolumeNeeded()` in `database.ts`
- **What RF Does**:
  1. Switches to "Award Volume" tab
  2. Selects a SKU
  3. Enters "Total Required Volume" (cases needed)
  4. Saves (auto-saves on blur)
- **What Happens**:
  - Creates or updates `week_item_volumes` row:
    - `week_id` = selected week ID
    - `item_id` = selected item ID
    - `volume_needed` = entered volume
    - `locked` = false (not locked yet)
- **Database Changes**:
  - `week_item_volumes` table: `volume_needed` updated
- **UI Changes**:
  - Volume needed shows in "Required" column
  - Allocation calculations update (remaining = required - awarded)
- **Validation**: 
  - Volume must be > 0
  - Week must be finalized (or have finalized quotes)
- **Status**: Volume need set, ready for allocation

### Step 3.2: RF Allocates Volume (Sandbox/Play Area)
- **Location**: RF Dashboard → Award Volume tab → Select SKU → "Award Cases" per supplier
- **Function**: Direct Supabase update in `AwardVolume.tsx`
- **What RF Does**:
  1. Sees all suppliers who priced this SKU
  2. For each supplier, enters "Award Cases" (volume to award)
  3. Sees live calculations:
     - Total Awarded = sum of all awards
     - Remaining = Required - Total Awarded
     - Weighted Avg FOB = (sum of price × volume) / total volume
     - DLVD = FOB + freight - rebate
  4. Adjusts allocations until satisfied
- **What Happens**:
  - Updates `quotes.awarded_volume` = entered volume (draft, not sent yet)
  - Updates `quotes.updated_at` = current timestamp
  - Auto-saves on blur (debounced)
- **Database Changes**:
  - `quotes` table: `awarded_volume` updated (draft allocations)
- **UI Changes**:
  - Awarded volumes show in table
  - Calculations update in real-time
  - AI insights update based on allocation
- **Validation**: 
  - Award volume can be 0 (no award)
  - Award volume cannot exceed supplier capacity (if set)
- **Status**: Draft allocations set, not sent to suppliers yet

### Step 3.3: RF Locks SKU (Per SKU)
- **Location**: RF Dashboard → Award Volume tab → Select SKU → "Lock" button
- **Function**: `lockSKU()` in `database.ts`
- **What RF Does**:
  1. Reviews allocation for a SKU
  2. Satisfied with allocation
  3. Clicks "Lock" button (toggles lock/unlock)
- **What Happens**:
  - Updates `week_item_volumes.locked` = true (or false if unlocking)
  - Updates `week_item_volumes.updated_at` = current timestamp
  - Lock persists to database
- **Database Changes**:
  - `week_item_volumes` table: `locked` = true/false
- **UI Changes**:
  - Lock icon shows locked/unlocked state
  - Locked SKUs show lock icon
  - Inputs disabled when locked (visual feedback)
- **Validation**: 
  - Can lock/unlock at any time
  - Lock state persists after page refresh
- **Status**: SKU locked, ready for sending (if all SKUs locked)

### Step 3.4: RF Sends Allocations to Suppliers
- **Location**: RF Dashboard → Award Volume tab → "Send Allocations to Suppliers" button
- **Function**: `submitAllocationsToSuppliers()` in `database.ts`
- **What RF Does**:
  1. Reviews all allocations
  2. Locks all SKUs (or at least all priced SKUs)
  3. Clicks "Send Allocations to Suppliers" button
- **What Happens**:
  1. **Validation Checks**:
     - All priced SKUs must have `rf_final_fob` set (finalized pricing)
     - All priced SKUs must be locked (`week_item_volumes.locked = true`)
     - At least one `awarded_volume > 0` must exist
  2. **If validation passes**:
     - Copies `awarded_volume` → `offered_volume` for all quotes with `awarded_volume > 0`
     - Updates `weeks.allocation_submitted = true`
     - Updates `weeks.updated_at` = current timestamp
     - Custom event dispatched: `allocations-sent` with `{ weekId }`
  3. **If validation fails**:
     - Shows error message
     - Button remains enabled
- **Database Changes**:
  - `quotes` table: `offered_volume` = `awarded_volume` (for all awarded quotes)
  - `weeks` table: `allocation_submitted = true`
- **UI Changes**:
  - **RF Dashboard**: 
    - Button disabled after sending
    - Volume Acceptance tab becomes accessible
    - Shows "Allocations Sent" status
  - **Supplier Dashboard**:
    - "Volume Offers" section appears
    - Shows offered volumes for each SKU
- **Validation Gates**:
  - ✅ All priced SKUs have `rf_final_fob` set
  - ✅ All priced SKUs are locked
  - ✅ At least one `awarded_volume > 0` exists
- **Status**: Allocations sent, suppliers can respond

---

## ✅ **PHASE 4: SUPPLIER VOLUME RESPONSES**

### Step 4.1: Supplier Sees Volume Offers
- **Location**: Supplier Dashboard → "Volume Offers" section
- **Function**: `fetchQuotesWithDetails()` in `database.ts`
- **What Supplier Sees**:
  - List of all SKUs with offered volumes
  - For each SKU:
    - Item name and pack size
    - Offered volume (cases)
    - Final FOB price (`rf_final_fob`)
    - Total value = offered_volume × rf_final_fob
- **Database**: No changes (read-only view)
- **UI Changes**:
  - Volume offers section appears
  - Shows all offers for this supplier
- **Status**: Offers visible, ready for response

### Step 4.2: Supplier Responds to Volume Offers
- **Location**: Supplier Dashboard → "Volume Offers" section → Response dropdown
- **Function**: `updateSupplierVolumeResponse()` in `database.ts`
- **What Supplier Does**:
  1. For each SKU with offer, chooses:
     - **Accept**: Accepts the offered volume
     - **Update**: Proposes a different volume
     - **Decline**: Declines the offer
  2. If "Update":
     - Enters new volume (can be higher or lower)
     - Optionally adds notes
  3. Clicks "Submit All Responses" button
- **What Happens**:
  - For each response:
    - Updates `quotes.supplier_volume_response` = 'accept' / 'update' / 'decline'
    - If 'accept': Updates `quotes.supplier_volume_accepted` = `offered_volume`
    - If 'update': Updates `quotes.supplier_volume_accepted` = entered volume
    - If 'decline': Updates `quotes.supplier_volume_accepted` = 0
    - Updates `quotes.supplier_volume_response_notes` = notes (if provided)
    - Updates `quotes.updated_at` = current timestamp
  - Custom event dispatched: `navigate-to-volume-acceptance` with `{ weekId, fromSupplierResponse: true }`
- **Database Changes**:
  - `quotes` table: `supplier_volume_response`, `supplier_volume_accepted`, `supplier_volume_response_notes` updated
- **UI Changes**:
  - **RF Dashboard**: 
    - Volume Acceptance tab auto-opens (if not already open)
    - Shows supplier responses
    - Status shows "Response Received"
  - **Supplier Dashboard**:
    - Response shows as submitted
    - Can still edit until RF processes
- **Validation**: 
  - Must respond to all offers
  - Updated volume must be > 0 (if not declining)
- **Status**: Supplier response received, RF can process

---

## 🔄 **PHASE 5: RF VOLUME ACCEPTANCE**

### Step 5.1: RF Reviews Supplier Responses
- **Location**: RF Dashboard → Volume Acceptance tab
- **Function**: `loadAllocations()` in `VolumeAcceptance.tsx`
- **What RF Sees**:
  - List of all allocations with supplier responses
  - For each allocation:
    - Item name and pack size
    - Supplier name
    - Offered volume
    - Supplier response (Accept/Update/Decline)
    - Supplier accepted volume (if updated)
    - Supplier notes (if provided)
- **Database**: No changes (read-only view)
- **UI Changes**:
  - Shows all responses
  - Highlights responses that need action
- **Status**: Responses visible, ready for processing

### Step 5.2: RF Processes Supplier Responses
- **Location**: RF Dashboard → Volume Acceptance tab → "Accept" / "Revise" buttons
- **Function**: `processSupplierResponse()` in `VolumeAcceptance.tsx`
- **What RF Does**:
  1. Reviews each supplier response
  2. For each response:
     - **If Accept**: RF accepts supplier's acceptance
     - **If Update**: RF can accept the updated volume or revise
     - **If Decline**: RF can allocate to another supplier
  3. Clicks "Accept" or "Revise" button per response
- **What Happens**:
  - For accepted responses:
    - Updates `quotes.awarded_volume` = `supplier_volume_accepted` (final volume)
    - Updates `quotes.updated_at` = current timestamp
  - For revised responses:
    - RF enters new volume
    - Updates `quotes.awarded_volume` = new volume
- **Database Changes**:
  - `quotes` table: `awarded_volume` updated (final volume after RF processing)
- **UI Changes**:
  - Final volumes show in table
  - Status shows "Accepted" or "Revised"
- **Validation**: 
  - Final volume must be > 0
  - Total allocated cannot exceed required (warning shown)
- **Status**: Responses processed, final volumes set

### Step 5.3: RF Closes Volume Loop (Finalizes Week)
- **Location**: RF Dashboard → Volume Acceptance tab → "Close Volume Loop" button
- **Function**: `closeVolumeLoop()` in `database.ts`
- **What RF Does**:
  1. Reviews all final volumes
  2. Satisfied with all allocations
  3. Clicks "Close Volume Loop" button
- **What Happens**:
  - Updates `weeks.volume_finalized = true`
  - Updates `weeks.status = 'closed'` (if not already)
  - Updates `weeks.updated_at` = current timestamp
  - Week is now locked (read-only)
- **Database Changes**:
  - `weeks` table: `volume_finalized = true`, `status = 'closed'`
- **UI Changes**:
  - Week status shows as "Closed"
  - All inputs disabled (read-only)
  - Can create new week
- **Validation**: 
  - All supplier responses must be processed
  - All final volumes must be set
- **Status**: Week closed, complete

---

## 📊 **COMPLETE WORKFLOW SUMMARY**

### Full Cycle (12 Steps):

```
1. RF Creates Week
   ↓
2. Suppliers Submit Pricing (supplier_fob)
   ↓
3. RF Counters (optional) (rf_counter_fob)
   ↓
4. Suppliers Respond (optional) (supplier_response, supplier_revised_fob)
   ↓
5. RF Finalizes Pricing (rf_final_fob)
   ↓
6. RF Enters Volume Needs (volume_needed)
   ↓
7. RF Allocates Volume (awarded_volume - draft)
   ↓
8. RF Locks SKUs (locked = true)
   ↓
9. RF Sends Allocations (offered_volume = awarded_volume, allocation_submitted = true)
   ↓
10. Suppliers Respond (supplier_volume_response, supplier_volume_accepted)
   ↓
11. RF Processes Responses (awarded_volume = final volume)
   ↓
12. RF Closes Loop (volume_finalized = true, status = 'closed')
```

---

## 🗄️ **DATABASE FIELD LIFECYCLE**

### Quotes Table Fields:

**Pricing Fields**:
- `supplier_fob`: Set when supplier submits pricing (Step 2.1)
- `rf_counter_fob`: Set when RF sends counter (Step 2.2)
- `supplier_response`: Set when supplier responds ('accept'/'revise') (Step 2.3)
- `supplier_revised_fob`: Set when supplier revises (Step 2.3)
- `rf_final_fob`: Set when RF finalizes pricing (Step 2.4) OR auto-set when supplier accepts counter (Step 2.3)

**Volume Fields**:
- `awarded_volume`: Set when RF allocates volume (Step 3.2) → Updated when RF processes responses (Step 5.2)
- `offered_volume`: Set when RF sends allocations (Step 3.4) = copy of `awarded_volume`
- `supplier_volume_response`: Set when supplier responds ('accept'/'update'/'decline') (Step 4.2)
- `supplier_volume_accepted`: Set when supplier responds (Step 4.2)
- `supplier_volume_response_notes`: Set when supplier adds notes (Step 4.2)

### Weeks Table Fields:

- `status`: 'open' → 'finalized' → 'closed'
- `allocation_submitted`: false → true (Step 3.4)
- `volume_finalized`: false → true (Step 5.3)

### Week Item Volumes Table Fields:

- `volume_needed`: Set when RF enters volume needs (Step 3.1)
- `locked`: false → true when RF locks SKU (Step 3.3)

---

## ✅ **VALIDATION GATES**

### Gate 1: Send Allocations
- ✅ All priced SKUs have `rf_final_fob` set
- ✅ All priced SKUs are locked (`locked = true`)
- ✅ At least one `awarded_volume > 0` exists

### Gate 2: Close Volume Loop
- ✅ All supplier responses processed
- ✅ All final volumes set
- ✅ `allocation_submitted = true`

---

## 🎯 **KEY FEATURES**

### Lock/Unlock Per SKU:
- RF can lock/unlock individual SKUs
- Lock persists to database
- Locked SKUs disable inputs (visual feedback)
- All SKUs must be locked to send allocations

### Real-time Updates:
- Realtime subscriptions for quotes and weeks tables
- UI updates automatically when data changes
- No page refresh needed

### Auto-Navigation:
- Pricing submitted → Allocation tab opens
- Allocations sent → Volume Acceptance tab opens
- Supplier responds → Volume Acceptance tab opens

### Status Indicators:
- **Quoted**: supplier_fob set
- **Countered**: rf_counter_fob set
- **Finalized**: rf_final_fob set
- **Revised**: supplier_revised_fob set

---

## 📝 **NOTES**

- **Week 8 Gap**: Berry Farms missing quotes in Week 8 (intentional for demo)
- **All 8 Weeks Visible**: No filters, all weeks shown in dropdown
- **Default Week**: Week 8 (if exists and open)
- **Workflow Persistence**: All state persists to database
- **Error Handling**: Graceful error messages, no crashes

---

**This is the complete, in-depth workflow. Every step, every field, every state change is documented above.**
