# 📋 A-Z Complete Workflow Guide
## Robinson Fresh - Volume & Pricing Management System

---

## 🚀 **A. SETUP & ACCESS**

### A1. Access the Application
- **URL**: `http://localhost:5173` (local) or your hosted preview URL
- **Access Code**: `RF2024` (default, can be changed in `.env` as `VITE_ACCESS_CODE`)
- **First Time**: Enter access code to unlock login screen

### A2. Login Options
**Two User Roles:**

1. **RF Manager** (Role: `rf`)
   - Username: `rf` or `RF Manager`
   - Password: Set in `.env` as `VITE_RF_PASSWORD` (or skip in dev mode)
   - Access: Full RF Dashboard with all features

2. **Supplier** (Role: `supplier`)
   - Username: Select from supplier dropdown
   - Password: Set in `.env` as `VITE_SUPPLIER_PASSWORD` (or skip in dev mode)
   - Access: Supplier Dashboard (only sees their own quotes)

### A3. Development Mode
- On `localhost`: Access code and passwords are **optional** (auto-granted)
- In production: Both access code and passwords are **required**

---

## 📅 **B. WEEK CREATION (RF Only)**

### B1. Create a New Week
- **Location**: RF Dashboard → Top right → "Create Week" button
- **What Happens**:
  - Closes all existing open weeks (only one open week at a time)
  - Creates new week with status `'open'`
  - Auto-generates week number (increments from last week)
  - Auto-creates quotes for **ALL** supplier × item combinations
  - Week is immediately available for supplier pricing submissions

### B2. Week Status Lifecycle
```
'open' → 'finalized' → 'closed'
  ↓         ↓           ↓
Pricing   Volume      Locked
Active    Allocation  (Read-only)
```

---

## 💰 **C. PRICING NEGOTIATION PHASE**

### C1. Suppliers Submit Initial Pricing
**Location**: Supplier Dashboard → "Submit Pricing" section

**What Suppliers Do**:
1. Select the open week
2. See all items/SKUs they can price
3. Enter for each SKU:
   - `supplier_fob` (FOB price)
   - `supplier_dlvd` (Delivered price, optional)
4. Click "Submit Pricing"
5. Status changes to "Submitted" (RF can now see it)

**Key Points**:
- Multiple suppliers can price the **same SKU** independently
- Each supplier only sees their own quotes
- Suppliers can submit/update pricing anytime while week is `'open'`

### C2. RF Reviews & Counters
**Location**: RF Dashboard → "Pricing" tab

**What RF Sees**:
- All quotes grouped by SKU/item
- Supplier name, submitted prices, status
- Color-coded: Not Submitted (gray), Submitted (blue), Countered (orange), Finalized (green)

**What RF Can Do**:
1. **Counter Offer**: Click "Counter" → Enter `rf_counter_fob` → Click "Send Counter"
2. **View Details**: See supplier's delivered price, last week's price, etc.
3. **Send Reminders**: Click "Send Reminder" to notify suppliers who haven't submitted

### C3. Suppliers Respond to Counters
**Location**: Supplier Dashboard → "Counter Offers" section

**What Suppliers Can Do**:
1. **Accept Counter**: Click "Accept" → Sets `supplier_revised_fob = rf_counter_fob`
2. **Revise**: Click "Revise" → Enter new `supplier_revised_fob` → Submit
3. **View**: See RF's counter offer and their original submission

### C4. RF Finalizes Pricing Per Quote
**Location**: RF Dashboard → "Pricing" tab → Select supplier

**What RF Does**:
1. Select a supplier from dropdown
2. Review all their quotes for the week
3. For each quote, set `rf_final_fob` (final price)
4. Click "Push to Finalize" for that supplier
   - Sets `rf_final_fob` if not already set (uses supplier pricing as fallback)
   - Marks that supplier's pricing as finalized

**After All Suppliers Finalized**:
- "Finalize Week" button appears
- Click it → Week status changes from `'open'` to `'finalized'`
- **Volume tab unlocks** (can now enter volume needs)

**Key Points**:
- RF can finalize suppliers **one at a time**
- Volume tab unlocks when **at least one quote** has `rf_final_fob`
- Week status becomes `'finalized'` when RF clicks "Finalize Week"

---

## 📦 **D. VOLUME NEEDS ENTRY (RF Only)**

### D1. Enter Total Volume Needed Per SKU
**Location**: RF Dashboard → "Award Volume" tab

**What RF Does**:
1. Select a SKU from dropdown (shows pack size)
2. Enter "Total Required Volume" (cases needed)
3. Click "Save Volume Needs" (or it auto-saves)
4. Repeat for each SKU

**Where It Saves**: `week_item_volumes` table → `volume_needed` field

**Validation**:
- Must have at least one SKU with volume > 0
- Week must be `'finalized'` status

---

## 🎯 **E. VOLUME ALLOCATION SANDBOX (RF Only)**

### E1. Interactive Sandbox Interface
**Location**: RF Dashboard → "Award Volume" tab

**What You See**:
1. **SKU Selector**: Dropdown showing all SKUs with pack sizes
2. **Total Required Volume**: Input field (pre-filled from volume needs)
3. **Suppliers Table**: Shows all suppliers with finalized pricing for selected SKU
   - Rank (#1 = cheapest, #2, #3, etc.)
   - Supplier name
   - FOB Price (finalized)
   - Award Cases (editable input)
   - Row Cost (auto-calculated: price × volume)

### E2. Live Calculations (Updates on Every Keystroke)
**Displayed Metrics**:
- **Total Awarded Cases**: Sum of all awarded volumes
- **Remaining Cases**: `Total Required - Total Awarded`
- **Weighted Avg Price**: `sum(price × volume) / sum(volume)`
- **Total Cost**: `sum(price × volume)` for all suppliers

### E3. Validation States
**Visual Indicators**:
- ✅ **Complete**: Remaining = 0 (green)
- ⚠️ **Under-awarded**: Remaining > 0 (orange) - "X cases remaining"
- ❌ **Over-awarded**: Remaining < 0 (red) - "X cases over requirement"
- ⚠️ **Missing Prices**: Some suppliers don't have finalized prices (orange warning)

### E4. How to Allocate Volume
1. **Select SKU** from dropdown
2. **Enter Total Required Volume** (or it's pre-filled)
3. **Edit Award Cases** for each supplier:
   - Type number in "Award Cases" input
   - See live updates: Row Cost, Total Awarded, Remaining, Weighted Avg
4. **Watch Calculations Update** in real-time as you type
5. **Validation Feedback**:
   - Green = Complete (all volume allocated)
   - Orange = Under-awarded (need more)
   - Red = Over-awarded (too much)

### E5. Empty States
- **No SKU Selected**: "Select a SKU to begin"
- **No Finalized Pricing**: "No finalized pricing for this SKU - Go to Pricing tab first"

**Note**: This is a **sandbox** - changes are saved to `awarded_volume` in database but are **draft** until you click "Send Allocations to Suppliers"

---

## 📤 **F. SEND ALLOCATIONS TO SUPPLIERS (RF Only)**

### F1. Send Awards
**Location**: RF Dashboard → "Award Volume" tab → "Send Allocations to Suppliers" button

**What Happens**:
1. Copies `awarded_volume` → `offered_volume` (for each quote)
2. Resets supplier response fields
3. Sets `allocation_submitted = true` on week
4. Suppliers can now see volume offers in their dashboard

**Validation**:
- Must have at least one allocation (`awarded_volume > 0`)
- Week must be `'finalized'` status

**After Sending**:
- Button changes to "Sent" (green checkmark)
- Navigation link appears: "View Responses" → Goes to Volume Acceptance tab

---

## 📥 **G. SUPPLIER VOLUME RESPONSE**

### G1. Suppliers See Volume Offers
**Location**: Supplier Dashboard → "Volume Offers" section

**What Suppliers See**:
- List of all SKUs they received volume offers for
- Offered volume (cases)
- Their finalized price
- Total value (price × volume)

### G2. Suppliers Respond
**Options**:
1. **Accept**: Click "Accept" → Sets `supplier_volume_accepted = offered_volume`
2. **Revise**: Click "Revise" → Enter counter-offer volume → Submit
   - Sets `supplier_volume_response = 'update'`
   - Sets `supplier_volume_accepted = revised_volume`
3. **Decline**: Click "Decline" → Sets `supplier_response_status = 'declined'`

**Status Indicators**:
- ⏳ Pending (no response yet)
- ✓ Accepted
- ↻ Revised (counter-offer)
- ✗ Declined

---

## ✅ **H. RF ACCEPTS SUPPLIER RESPONSES**

### H1. Review Supplier Responses
**Location**: RF Dashboard → "Volume Acceptance" tab (or "Allocation" tab in Exceptions Mode)

**What RF Sees**:
- All suppliers who responded
- Original offered volume vs. supplier's response
- Status: Accepted, Revised, Declined, Pending

### H2. Handle Responses
**For Each Response**:

1. **Accepted Response**:
   - Shows green checkmark
   - `awarded_volume` already matches `supplier_volume_accepted`
   - No action needed

2. **Revised Response** (Counter-offer):
   - Shows orange refresh icon
   - RF can:
     - **Accept Revision**: Click "Accept" → Updates `awarded_volume` to match supplier's counter
     - **Revise Offer**: Click "Revise" → Enter new `offered_volume` → Resends to supplier
     - **Withdraw**: Click "Withdraw" → Sets `offered_volume = 0`

3. **Declined Response**:
   - Shows red X
   - RF can withdraw offer or leave as-is

4. **Pending Response**:
   - Shows yellow clock icon
   - Supplier hasn't responded yet
   - RF can send reminder or wait

---

## 🔒 **I. CLOSE THE LOOP (RF Only)**

### I1. Close Volume Loop
**Location**: RF Dashboard → "Volume Acceptance" tab → "Close the Loop" button

**Validation Gates** (must pass all):
- ✅ No pending allocations (all suppliers have responded)
- ✅ No unhandled responses (all responses accepted/revised)
- ✅ At least one finalized allocation exists

**What Happens**:
1. Sets `volume_finalized = true` on week
2. Sets week `status = 'closed'` (**LOCKS THE WEEK**)
3. Records timestamp and user who closed it
4. Week becomes read-only (except emergency unlock)

**After Closing**:
- Week is locked (no more edits)
- Can create next week
- Previous week remains `'closed'` for historical reference

---

## 🚨 **J. EMERGENCY UNLOCK (RF Only)**

### J1. Unlock a Closed Week
**Location**: Any tab showing a closed week → "Emergency Unlock" button

**What RF Does**:
1. Click "Emergency Unlock"
2. Enter reason (required, audited)
3. Click "Unlock Week"
4. Week becomes editable again (`emergency_unlock_enabled = true`)

**Use Cases**:
- Supplier requested volume change
- Pricing correction needed
- Data entry error

**Audit Trail**: Records who, when, and why

---

## 📊 **K. ANALYTICS & REPORTING**

### K1. Available Tabs (RF Dashboard)
1. **Pricing**: Negotiation and finalization
2. **Award Volume**: Volume needs and allocation sandbox
3. **Analytics**: Historical trends, price comparisons
4. **Intelligence**: Pricing insights and recommendations
5. **Predictions**: Forecast models
6. **Executive**: High-level dashboards
7. **Alerts**: Smart notifications

### K2. Export Data
**Location**: RF Dashboard → "Export Data" button
- Export quotes, allocations, pricing data
- CSV format for Excel analysis

---

## 🔄 **L. COMPLETE CYCLE EXAMPLE**

### Full End-to-End Flow:

1. **RF Creates Week** → Week #42, status `'open'`
2. **Supplier A Submits Pricing** → SKU1: $10.50 FOB
3. **Supplier B Submits Pricing** → SKU1: $10.25 FOB (cheaper!)
4. **RF Counters Supplier A** → $10.30 FOB
5. **Supplier A Accepts Counter** → $10.30 FOB finalized
6. **RF Finalizes Supplier B** → $10.25 FOB finalized
7. **RF Finalizes Week** → Status `'finalized'`
8. **RF Enters Volume Needs** → SKU1: 1000 cases needed
9. **RF Allocates Volume** (Sandbox):
   - Supplier A: 300 cases @ $10.30 = $3,090
   - Supplier B: 700 cases @ $10.25 = $7,175
   - Total: 1000 cases, Weighted Avg: $10.265, Total Cost: $10,265
10. **RF Sends Allocations** → Offers sent to both suppliers
11. **Supplier A Accepts** → 300 cases confirmed
12. **Supplier B Revises** → Counter-offers 750 cases (wants more)
13. **RF Accepts Revision** → Updates to 750 cases
14. **RF Closes Loop** → Week status `'closed'`, locked

---

## 🛠️ **M. TECHNICAL DETAILS**

### M1. Database Tables
- `weeks`: Week metadata, status, dates
- `quotes`: Pricing and volume data (one per week×item×supplier)
- `week_item_volumes`: Total volume needed per SKU per week
- `item_pricing_calculations`: Internal pricing formulas
- `items`: SKU catalog
- `suppliers`: Supplier list

### M2. Key Fields
- `rf_final_fob`: Final price RF agrees to pay (per quote)
- `awarded_volume`: RF's draft allocation (sandbox)
- `offered_volume`: Volume sent to supplier (final)
- `supplier_volume_accepted`: Supplier's response (accepted/revised)
- `week.status`: `'open'` | `'finalized'` | `'closed'`

### M3. Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ACCESS_CODE=RF2024
VITE_RF_PASSWORD=your_rf_password
VITE_SUPPLIER_PASSWORD=your_supplier_password
```

---

## 📝 **N. QUICK REFERENCE**

### RF Dashboard Tabs:
- **Pricing**: Negotiate and finalize pricing
- **Award Volume**: Enter volume needs + allocation sandbox
- **Volume Acceptance**: Review supplier responses
- **Analytics**: Historical data and trends

### Supplier Dashboard Sections:
- **Submit Pricing**: Initial pricing submission
- **Counter Offers**: Respond to RF counters
- **Volume Offers**: Respond to volume allocations

### Status Colors:
- 🔵 Blue: Submitted/Pending
- 🟠 Orange: Countered/Revised
- 🟢 Green: Accepted/Finalized
- 🔴 Red: Declined/Error
- ⚪ Gray: Not Started

---

## ✅ **O. VALIDATION CHECKLIST**

Before moving to next step, verify:

- [ ] Week created and status is `'open'`
- [ ] At least one supplier submitted pricing
- [ ] RF finalized at least one quote (`rf_final_fob` set)
- [ ] Week status is `'finalized'`
- [ ] Volume needs entered for at least one SKU
- [ ] Volume allocated in sandbox (sum matches total needed)
- [ ] Allocations sent to suppliers
- [ ] All suppliers responded (accept/revise/decline)
- [ ] All responses handled by RF
- [ ] Loop closed (week status `'closed'`)

---

## 🎯 **P. COMMON WORKFLOWS**

### P1. Quick Pricing (No Negotiation)
1. Suppliers submit pricing
2. RF reviews and finalizes directly (no counters)
3. Proceed to volume allocation

### P2. Full Negotiation
1. Suppliers submit
2. RF counters
3. Suppliers respond (accept/revise)
4. RF finalizes
5. Proceed to volume

### P3. Multi-Supplier Competition
1. Multiple suppliers price same SKU
2. RF sees all prices ranked (cheapest first)
3. RF allocates volume to cheapest suppliers
4. Use "Fill Cheapest" helper in sandbox

---

## 🚀 **Q. DEPLOYMENT**

### Q1. Build for Production
```bash
npm run build
```
Output: `/dist` folder

### Q2. Deploy to Netlify
**Option 1: Drag & Drop**
1. Go to https://app.netlify.com/drop
2. Drag `/dist` folder
3. Get preview link

**Option 2: CLI**
```bash
netlify deploy --prod --dir=dist
```

### Q3. Set Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ACCESS_CODE`
- `VITE_RF_PASSWORD`
- `VITE_SUPPLIER_PASSWORD`

**Important**: Click "Redeploy" after adding variables!

---

## 🔍 **R. TROUBLESHOOTING**

### R1. Volume Tab Not Loading
- **Check**: Week status must be `'finalized'` OR at least one quote has `rf_final_fob`
- **Fix**: Go to Pricing tab → Finalize at least one supplier → Click "Finalize Week"

### R2. Seed Volume Not Loading
- **Check**: `week_item_volumes` table has rows for the week
- **Fix**: Run migration `20260106000002_fix_week_item_volumes_rls_and_auto_seed.sql` in Supabase

### R3. Pricing Never Finalizes
- **Check**: `rf_final_fob` is set on quotes
- **Fix**: Click "Push to Finalize" for each supplier, then "Finalize Week"

### R4. Can't Allocate Volume
- **Check**: Volume needs must be saved first
- **Fix**: Enter "Total Required Volume" and save before allocating

---

## 📚 **S. KEY CONCEPTS**

### S1. Per-Quote Finalization
- Each supplier quote is finalized independently
- `rf_final_fob` is set per quote, not per week
- Volume tab unlocks when **any** quote is finalized

### S2. Sandbox vs. Final
- **Sandbox**: `awarded_volume` (draft, can edit freely)
- **Final**: `offered_volume` (sent to suppliers, requires response handling)

### S3. Multi-Supplier Per SKU
- Multiple suppliers can price the same SKU
- Each gets their own quote row
- RF allocates volume across suppliers

### S4. Weighted Average Price
- Formula: `sum(price × volume) / sum(volume)`
- Updates live as you allocate volume
- Shows true average cost per case

---

## 🎓 **T. BEST PRACTICES**

### T1. Pricing Phase
- Review all supplier prices before finalizing
- Use counters to negotiate better prices
- Finalize suppliers one at a time for clarity

### T2. Volume Allocation
- Use sandbox to test different allocation scenarios
- Watch weighted average price as you allocate
- Ensure total awarded = total needed (validation helps)

### T3. Supplier Responses
- Review all responses before closing loop
- Accept revisions if reasonable
- Withdraw offers from declined suppliers

### T4. Week Management
- Only one open week at a time
- Close weeks promptly after completion
- Use emergency unlock sparingly (audited)

---

## 🔐 **U. SECURITY & ACCESS**

### U1. Access Control
- Access code required (first gate)
- Password required per role (second gate)
- Dev mode: Both optional on localhost

### U2. Data Isolation
- Suppliers only see their own quotes
- RF sees all quotes
- Week status controls edit permissions

### U3. Audit Trail
- All actions logged with user and timestamp
- Emergency unlocks require reason
- Week closing records who/when

---

## 📈 **V. REPORTING & ANALYTICS**

### V1. Available Reports
- Price trends over time
- Supplier performance
- Volume allocation history
- Cost analysis per SKU

### V2. Export Options
- CSV export for Excel
- Historical data queries
- Custom date ranges

---

## 🎯 **W. WORKFLOW SUMMARY**

```
1. RF Creates Week (status: 'open')
   ↓
2. Suppliers Submit Pricing
   ↓
3. RF Counters (optional)
   ↓
4. Suppliers Respond (optional)
   ↓
5. RF Finalizes Pricing (status: 'finalized')
   ↓
6. RF Enters Volume Needs
   ↓
7. RF Allocates Volume (Sandbox)
   ↓
8. RF Sends Allocations to Suppliers
   ↓
9. Suppliers Respond (Accept/Revise/Decline)
   ↓
10. RF Handles Responses
   ↓
11. RF Closes Loop (status: 'closed')
   ↓
12. Create Next Week (repeat cycle)
```

---

## ✅ **X. COMPLETION CHECKLIST**

End of week is complete when:
- [ ] All pricing finalized
- [ ] Volume needs entered
- [ ] Volume allocated and sent
- [ ] All supplier responses received
- [ ] All responses handled
- [ ] Week closed (status: 'closed')

---

## 🚀 **Y. QUICK START (5-Minute Demo)**

1. **Login as RF** → Access code: `RF2024`
2. **Create Week** → Click "Create Week"
3. **Login as Supplier** → Select any supplier
4. **Submit Pricing** → Enter prices for 2-3 SKUs
5. **Back to RF** → Go to Pricing tab
6. **Finalize Supplier** → Click "Push to Finalize"
7. **Finalize Week** → Click "Finalize Week"
8. **Award Volume Tab** → Select SKU → Enter volume → Allocate
9. **Send Allocations** → Click "Send Allocations to Suppliers"
10. **Back to Supplier** → Accept volume offer
11. **Back to RF** → Volume Acceptance tab → Close Loop

**Done!** Week is complete.

---

## 📞 **Z. SUPPORT & RESOURCES**

### Z1. Key Files
- `src/components/RFDashboard.tsx` - Main RF interface
- `src/components/AwardVolume.tsx` - Volume allocation sandbox
- `src/components/SupplierDashboard.tsx` - Supplier interface
- `src/utils/database.ts` - Database functions

### Z2. Database Functions (RPCs)
- `auto_finalize_quotes_for_week(week_id)` - Auto-finalize pricing
- `submit_allocations_to_suppliers(week_id, user_name)` - Send offers
- `close_volume_loop(week_id, user_name)` - Close week

### Z3. Migrations
- `20260106000002_fix_week_item_volumes_rls_and_auto_seed.sql` - Auto-seed volume needs
- `20260106000001_auto_finalize_pricing_comprehensive.sql` - Auto-finalization

---

## 🎉 **YOU'RE READY!**

This guide covers the complete A-Z workflow. Start with **Section A (Setup)** and work through each phase. The system is designed to guide you through each step with validation and helpful messages.

**Happy pricing! 🚀**

