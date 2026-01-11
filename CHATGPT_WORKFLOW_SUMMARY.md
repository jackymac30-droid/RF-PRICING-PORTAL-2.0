# 🤖 ChatGPT-Friendly Workflow Summary
## Robinson Fresh - Volume & Pricing Management System

---

## 🎯 **SYSTEM OVERVIEW**

**Purpose**: RF (Robinson Fresh) managers negotiate pricing with suppliers, allocate volume, and manage the complete procurement cycle.

**Two User Roles**:
- **RF Manager**: Creates weeks, negotiates pricing, allocates volume, manages responses
- **Supplier**: Submits pricing, responds to counters, accepts/revises volume offers

**Tech Stack**: React + TypeScript + Vite + Supabase (PostgreSQL)

---

## 📋 **CORE WORKFLOW (9 Steps)**

### **Step 1: Create Week** (RF Only)
- **Action**: Click "Create Week" button in RF Dashboard
- **Result**: 
  - Week created with status `'open'`
  - Quotes auto-created for all supplier×item combinations
  - Week number auto-incremented

### **Step 2: Suppliers Submit Pricing**
- **Action**: Suppliers log in → Enter `supplier_fob` and `supplier_dlvd` per SKU → Submit
- **Result**: Quote status changes to "Submitted"
- **Note**: Multiple suppliers can price the same SKU independently

### **Step 3: RF Counters (Optional)**
- **Action**: RF reviews quotes → Enters `rf_counter_fob` → Clicks "Send Counter"
- **Result**: Supplier sees counter offer

### **Step 4: Suppliers Respond (Optional)**
- **Action**: Supplier clicks "Accept" or "Revise" → If revise, enters `supplier_revised_fob`
- **Result**: Quote status updates

### **Step 5: RF Finalizes Pricing**
- **Action**: RF sets `rf_final_fob` per quote → Clicks "Push to Finalize" per supplier → Clicks "Finalize Week"
- **Result**: Week status changes from `'open'` → `'finalized'`
- **Gate**: At least one quote must have `rf_final_fob`

### **Step 6: RF Enters Volume Needs**
- **Action**: RF goes to "Award Volume" tab → Selects SKU → Enters "Total Required Volume" → Saves
- **Result**: Saved to `week_item_volumes.volume_needed`
- **Gate**: Week must be `'finalized'`

### **Step 7: RF Allocates Volume (Sandbox)**
- **Action**: RF selects SKU → Enters total required → Edits "Award Cases" per supplier → Sees live calculations
- **Live Calculations**:
  - Total Awarded Cases
  - Remaining Cases (required - awarded)
  - Weighted Avg Price = `sum(price × volume) / sum(volume)`
  - Total Cost = `sum(price × volume)`
- **Validation**: Shows "Over-awarded" (red) or "Under-awarded" (orange) or "Complete" (green)
- **Result**: Saved to `quotes.awarded_volume` (draft state)

### **Step 8: RF Sends Allocations**
- **Action**: RF clicks "Send Allocations to Suppliers"
- **Result**: 
  - `awarded_volume` copied to `offered_volume`
  - `allocation_submitted = true` on week
  - Suppliers can now see offers

### **Step 9: Suppliers Respond & RF Closes Loop**
- **Supplier Actions**: Accept / Revise / Decline volume offer
- **RF Actions**: Review responses → Accept revisions → Click "Close the Loop"
- **Result**: Week status changes from `'finalized'` → `'closed'` (locked)

---

## 🔑 **KEY DATABASE FIELDS**

| Field | Table | Purpose |
|-------|-------|---------|
| `status` | `weeks` | `'open'` → `'finalized'` → `'closed'` |
| `rf_final_fob` | `quotes` | Final price RF agrees to pay (per quote) |
| `awarded_volume` | `quotes` | RF's draft allocation (sandbox) |
| `offered_volume` | `quotes` | Volume sent to supplier (final) |
| `supplier_volume_accepted` | `quotes` | Supplier's response (accepted/revised volume) |
| `volume_needed` | `week_item_volumes` | Total cases needed per SKU per week |

---

## 🚪 **ACCESS GATES (What Unlocks What)**

| Step | Gate | Unlocks |
|------|------|---------|
| Enter Volume Needs | Week status = `'finalized'` OR at least one quote has `rf_final_fob` | Volume tab becomes accessible |
| Allocate Volume | Volume needs saved (`volume_needed > 0`) | Allocation sandbox becomes active |
| Send Allocations | At least one `awarded_volume > 0` | Can send to suppliers |
| Close Loop | All suppliers responded + all responses handled | Can close week |

---

## 📊 **STATUS FLOW DIAGRAM**

```
Week Lifecycle:
'open' → 'finalized' → 'closed'
  ↓         ↓           ↓
Pricing   Volume      Locked
Active    Allocation  (Read-only)

Quote Status Flow:
Not Submitted → Submitted → Countered → Finalized
     ↓             ↓            ↓           ↓
   (Gray)       (Blue)       (Orange)    (Green)
```

---

## 🎨 **UI COMPONENTS BREAKDOWN**

### **RF Dashboard** (`RFDashboard.tsx`)
- **Tabs**: Pricing | Award Volume | Analytics | Intelligence | Predictions | Executive | Alerts
- **Main Sections**:
  - Week selector + Create Week button
  - Supplier selector (for pricing tab)
  - Quote cards grouped by SKU
  - Volume allocation sandbox

### **Award Volume Component** (`AwardVolume.tsx`)
- **SKU Selector**: Dropdown with pack sizes
- **Total Required Input**: Number input for volume needed
- **Suppliers Table**: Rank, Name, FOB Price, Award Cases (editable), Row Cost
- **Live Calculations Panel**: Total Awarded, Remaining, Weighted Avg, Total Cost
- **Validation States**: Over/Under/Complete indicators

### **Supplier Dashboard** (`SupplierDashboard.tsx`)
- **Sections**: Submit Pricing | Counter Offers | Volume Offers
- **View**: Only sees their own quotes

---

## 🔧 **KEY FUNCTIONS**

### **Database Functions** (`src/utils/database.ts`)
- `createNewWeek()` - Creates week + auto-creates quotes
- `finalizePricingForWeek(weekId)` - Sets week status to 'finalized'
- `updateVolumeNeeded(weekId, itemId, volume)` - Saves volume needs
- `submitAllocationsToSuppliers(weekId)` - Sends offers to suppliers
- `closeVolumeLoop(weekId)` - Closes and locks week

### **Component Functions**
- `loadSKUQuotes()` - Loads suppliers with finalized pricing for selected SKU
- `updateSandboxAwardedVolume()` - Updates draft allocation (local state)
- `loadVolumeData()` - Loads quotes and volume data

---

## ⚡ **LIVE CALCULATIONS FORMULA**

```javascript
// Weighted Average Price
weightedAvg = sum(price × awarded_volume) / sum(awarded_volume)

// Total Cost
totalCost = sum(price × awarded_volume)

// Remaining Cases
remaining = totalRequired - sum(awarded_volume)

// Validation States
if (remaining === 0) → "Complete" (green)
if (remaining > 0) → "Under-awarded" (orange)
if (remaining < 0) → "Over-awarded" (red)
```

---

## 🐛 **COMMON ISSUES & FIXES**

| Issue | Cause | Fix |
|-------|-------|-----|
| Volume tab doesn't load | Week not finalized | Finalize at least one quote → Click "Finalize Week" |
| Seed volume not loading | Missing `week_item_volumes` rows | Run migration: `20260106000002_fix_week_item_volumes_rls_and_auto_seed.sql` |
| Pricing never finalizes | `rf_final_fob` not set | Click "Push to Finalize" for each supplier |
| Can't allocate volume | Volume needs not saved | Enter "Total Required Volume" and save first |

---

## 🎯 **QUICK REFERENCE: USER ACTIONS**

### **RF Manager Actions**:
1. Create Week
2. Review Quotes (grouped by SKU)
3. Counter Offers (optional)
4. Finalize Pricing (per supplier, then week)
5. Enter Volume Needs (per SKU)
6. Allocate Volume (sandbox - edit award cases)
7. Send Allocations
8. Review Supplier Responses
9. Accept/Revise Responses
10. Close Loop

### **Supplier Actions**:
1. Submit Pricing (FOB + Delivered)
2. Respond to Counters (Accept/Revise)
3. Respond to Volume Offers (Accept/Revise/Decline)

---

## 📁 **FILE STRUCTURE**

```
src/
├── components/
│   ├── RFDashboard.tsx          # Main RF interface
│   ├── AwardVolume.tsx           # Volume allocation sandbox
│   ├── SupplierDashboard.tsx     # Supplier interface
│   ├── Login.tsx                 # Authentication
│   └── ...
├── utils/
│   ├── database.ts               # Database functions
│   ├── supabase.ts              # Supabase client
│   └── helpers.ts                # Utility functions
├── contexts/
│   ├── AppContext.tsx            # Session management
│   └── ToastContext.tsx          # Notifications
└── types.ts                      # TypeScript types
```

---

## 🔐 **ENVIRONMENT VARIABLES**

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ACCESS_CODE=RF2024
VITE_RF_PASSWORD=your_rf_password
VITE_SUPPLIER_PASSWORD=your_supplier_password
```

---

## 🚀 **DEPLOYMENT**

```bash
# Build
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Or drag /dist folder to https://app.netlify.com/drop
```

---

## 💡 **KEY CONCEPTS FOR AI UNDERSTANDING**

1. **Per-Quote Finalization**: Each supplier quote is finalized independently. Volume tab unlocks when ANY quote has `rf_final_fob`.

2. **Sandbox vs Final**: 
   - `awarded_volume` = Draft (sandbox, editable)
   - `offered_volume` = Final (sent to suppliers, requires response handling)

3. **Multi-Supplier Per SKU**: Multiple suppliers can price the same SKU. Each gets their own quote row. RF allocates volume across suppliers.

4. **Live Calculations**: All calculations update on every keystroke. No save button needed - auto-updates as you type.

5. **Status-Driven UI**: Week status (`open`/`finalized`/`closed`) controls what's editable. Closed weeks are read-only unless emergency unlocked.

6. **Validation Gates**: Each step has validation. UI shows clear error messages if gates aren't met.

---

## 📝 **PROMPT TEMPLATE FOR CHATGPT**

```
I'm working on a Robinson Fresh pricing and volume allocation system.

System Overview:
- RF managers negotiate pricing with suppliers
- RF allocates volume to suppliers based on finalized pricing
- Suppliers respond to volume offers
- Week lifecycle: 'open' → 'finalized' → 'closed'

Current Issue: [Describe your issue]

Key Context:
- Week status controls edit permissions
- Volume tab unlocks when at least one quote has rf_final_fob
- Awarded volumes are draft until "Send Allocations" is clicked
- All calculations update live (no save button needed)

Question: [Your specific question]
```

---

## ✅ **VALIDATION CHECKLIST**

Before moving to next step:
- [ ] Week created (status: 'open')
- [ ] At least one supplier submitted pricing
- [ ] RF finalized at least one quote (rf_final_fob set)
- [ ] Week status is 'finalized'
- [ ] Volume needs entered (volume_needed > 0)
- [ ] Volume allocated (sum of awarded_volume = volume_needed)
- [ ] Allocations sent (offered_volume set)
- [ ] All suppliers responded
- [ ] All responses handled
- [ ] Loop closed (status: 'closed')

---

## 🎓 **EXAMPLE PROMPTS FOR CHATGPT**

### **Example 1: Understanding the Flow**
```
"Explain the complete workflow from week creation to closing the loop. 
Include what happens at each step, what database fields are updated, 
and what gates must be passed."
```

### **Example 2: Debugging**
```
"The volume tab isn't loading. Week status is 'open' but I've finalized 
one supplier's pricing. What should I check? What's the exact condition 
that unlocks the volume tab?"
```

### **Example 3: Feature Request**
```
"I want to add a feature where RF can see a comparison of total costs 
across different allocation scenarios. Where should this go? What data 
do I need?"
```

### **Example 4: Code Understanding**
```
"Explain how the live calculations work in AwardVolume.tsx. How does 
it update on every keystroke? What state variables are involved?"
```

---

## 🔍 **QUICK LOOKUP TABLE**

| What You Want | Where to Find | Key File |
|---------------|---------------|----------|
| Create Week | RF Dashboard → "Create Week" button | `RFDashboard.tsx` |
| Submit Pricing | Supplier Dashboard → "Submit Pricing" | `SupplierDashboard.tsx` |
| Finalize Pricing | RF Dashboard → Pricing tab → "Push to Finalize" | `RFDashboard.tsx` |
| Enter Volume Needs | RF Dashboard → Award Volume tab → SKU selector | `AwardVolume.tsx` |
| Allocate Volume | RF Dashboard → Award Volume tab → Suppliers table | `AwardVolume.tsx` |
| Send Allocations | RF Dashboard → Award Volume tab → "Send Allocations" | `AwardVolume.tsx` |
| Respond to Offers | Supplier Dashboard → "Volume Offers" | `SupplierDashboard.tsx` |
| Review Responses | RF Dashboard → Volume Acceptance tab | `Allocation.tsx` |
| Close Loop | RF Dashboard → Volume Acceptance → "Close Loop" | `Allocation.tsx` |

---

## 🎯 **SUMMARY FOR AI ASSISTANTS**

**System Type**: B2B procurement platform for produce/food distribution

**Main Entities**:
- Weeks (time periods)
- Items/SKUs (products)
- Suppliers (vendors)
- Quotes (pricing + volume per week×item×supplier)

**Main Workflow**:
1. RF creates week → Suppliers price → RF finalizes → RF allocates volume → Suppliers respond → RF closes

**Key Technical Details**:
- React + TypeScript + Vite
- Supabase (PostgreSQL) backend
- Real-time updates via Supabase subscriptions
- Status-driven UI (week.status controls permissions)
- Sandbox pattern for volume allocation (draft state)

**Current State**:
- Volume allocation sandbox rebuilt with live calculations
- Per-quote finalization working
- Multi-supplier per SKU supported
- Complete workflow functional

---

**Use this summary when asking ChatGPT questions about the system!**

