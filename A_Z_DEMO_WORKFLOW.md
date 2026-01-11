# A-Z DEMO WORKFLOW FOR BERRY PROCUREMENT APP
**Complete step-by-step guide for tomorrow's presentation to 100 people**

## PRE-DEMO SETUP (DO THIS TONIGHT)

### Step 0.1: Verify Environment Variables
- Open `.env` file
- Verify these exist:
  ```
  VITE_SUPABASE_URL=your-supabase-url
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```
- Get service role key from: Supabase Dashboard → Settings → API → service_role (SECRET key, not anon)

### Step 0.2: Run Seed Script
```bash
npx tsx scripts/seed-demo-complete.ts
```
**Expected output:**
- ✅ CHECKLIST ITEM 1: Seeded 8 items ✓
- ✅ CHECKLIST ITEM 2: Seeded 5 suppliers (including Berry Farms) ✓
- ✅ CHECKLIST ITEM 3: Seeded 8 weeks (7 finalized, 1 open) ✓
- ✅ CHECKLIST ITEM 4: Seeded quotes ✓
- ✅ CHECKLIST ITEM 5: Seeded volume needs with awarded volumes ✓
- ✅ CHECKLIST SUMMARY: All items checked
- ✅ READY FOR DEMO: YES
- Duration: ~2-3 minutes

**If errors:** Check console output, fix credentials, re-run

### Step 0.3: Verify Data
```bash
npx tsx scripts/verify-demo.ts
```
**Expected output:**
- ✅ Items: 8 (expected: 8)
- ✅ Suppliers: 5 (expected: 5, Berry Farms: YES)
- ✅ Weeks: 8 (expected: 8, finalized: 7/7, open: YES)
- ✅ Quotes: ~280 total
- ✅ Volume Needs: 56 (expected: 56)
- ✅ Awarded Volumes: >0 (expected: >0)
- ✅ Week 8 Berry Farms Quotes: 0 (expected: 0 - CONFIRMED)
- ✅ READY FOR DEMO: YES

**If fails:** Re-run seed script, check Supabase dashboard manually

### Step 0.4: Fix RLS (if app shows empty data)
1. Open `seed-demo-rls-access.sql`
2. Find "OPTION 2: Temporarily disable RLS"
3. Uncomment these lines:
   ```sql
   ALTER TABLE items DISABLE ROW LEVEL SECURITY;
   ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
   ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
   ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
   ALTER TABLE week_item_volumes DISABLE ROW LEVEL SECURITY;
   ```
4. Copy and paste into Supabase SQL Editor
5. Click Run
6. Verify: Tables should now show data in app

**Alternative (Option 1):** Grant access to authenticated user (see SQL file for UUID replacement)

### Step 0.5: Test App Loads
1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:5173`
3. Hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
4. **Verify:**
   - ✅ Login screen loads
   - ✅ Can select "RF Manager" or supplier
   - ✅ No password required (demo mode)
   - ✅ Dashboard loads without errors
   - ✅ Console shows no errors (F12)

### Step 0.6: Quick Smoke Tests
**RF Dashboard:**
- ✅ Week 1-7 show as "finalized"
- ✅ Week 8 shows as "open"
- ✅ Items tab shows 8 SKUs
- ✅ Pricing tab shows quotes for all suppliers (weeks 1-7)
- ✅ Week 8 pricing shows all suppliers EXCEPT Berry Farms (intentional gap)

**Supplier Dashboard:**
- ✅ Week 1-7 show finalized data (read-only)
- ✅ Week 8 shows as "open" with pricing form
- ✅ Can select different suppliers

**If any fail:** Check RLS, re-run seed, check browser console

---

## LIVE DEMO WORKFLOW (TOMORROW - STEP BY STEP)

### Part 1: Historical Data Overview (5 minutes)

#### Step 1.1: RF Dashboard - Historical Weeks
**Action:**
1. Login as "RF Manager"
2. Select "Week 1" from dropdown
3. Navigate to "Pricing" tab

**Expected:**
- ✅ Status shows "finalized"
- ✅ All 8 SKUs visible (Strawberry CONV/ORG, Blueberry CONV/ORG, Blackberry CONV/ORG 12ozx6, Raspberry CONV/ORG 12ozx6)
- ✅ All 5 suppliers have quotes with `rf_final_fob` set (finalized prices)
- ✅ Prices are realistic ($5-15 range)
- ✅ Pricing calculations show weighted averages

**What to say:**
"This is Week 1, a finalized week from our procurement cycle. You can see we have 8 berry SKUs, and all 5 suppliers submitted pricing. The RF final FOB prices are set, indicating we've completed negotiations."

#### Step 1.2: RF Dashboard - Award Volume
**Action:**
1. Still on Week 1
2. Navigate to "Award Volume" tab

**Expected:**
- ✅ All 8 SKUs show volume needs (800-1200 cases range)
- ✅ Awarded volumes displayed per supplier
- ✅ Lock/unlock buttons visible (should show "Unlock" - weeks 1-7 are locked)
- ✅ "Send Allocations" button is disabled (already finalized)

**What to say:**
"Here's where we allocate volume to suppliers. Week 1 is finalized, so allocations are locked. You can see we awarded volumes to various suppliers based on their pricing and availability."

#### Step 1.3: Supplier Dashboard - Historical View
**Action:**
1. Switch to "Supplier Dashboard" (or logout and login as supplier)
2. Select "Berry Farms" from supplier dropdown
3. Select "Week 1" from week dropdown

**Expected:**
- ✅ Week status shows "finalized"
- ✅ Awarded volumes visible (if Berry Farms won any)
- ✅ Pricing shows finalized FOB prices
- ✅ No edit buttons (read-only for finalized weeks)

**What to say:**
"From the supplier perspective, they can see their historical performance, awarded volumes, and finalized pricing. This is read-only for past weeks."

---

### Part 2: Live Week Demo (10 minutes)

#### Step 2.1: RF Dashboard - Week 8 Overview
**Action:**
1. Login as "RF Manager"
2. Select "Week 8" from dropdown
3. Navigate to "Pricing" tab

**Expected:**
- ✅ Status shows "open"
- ✅ All 8 SKUs visible
- ✅ 4 suppliers have quotes (Fresh Farms, Organic Growers, Valley Fresh, Premium Produce)
- ✅ **Berry Farms is MISSING** (intentional gap for demo)
- ✅ Quotes show `supplier_fob` but NO `rf_final_fob` (not finalized yet)

**What to say:**
"This is Week 8, our current open week. Notice that Berry Farms hasn't submitted pricing yet - this is intentional for the demo. The other 4 suppliers have submitted their initial FOB prices. We haven't finalized pricing yet, so there's no RF final FOB."

**Key point:** This is the intentional gap - Berry Farms missing for live demo

#### Step 2.2: Supplier Dashboard - Week 8 Submission
**Action:**
1. Switch to "Supplier Dashboard"
2. Select "Berry Farms" from supplier dropdown
3. Select "Week 8" from week dropdown

**Expected:**
- ✅ Week status shows "open"
- ✅ Pricing form visible
- ✅ All 8 SKUs listed
- ✅ Can enter prices for each SKU
- ✅ "Submit Pricing" button enabled

**What to say:**
"Now from Berry Farms' perspective, they can see Week 8 is open and they can submit pricing. Let me enter some prices..." (Enter realistic prices: $9.50, $10.00, $11.25, etc.)

**Action (continue):**
4. Enter prices for all 8 SKUs (realistic $8-12 range)
5. Click "Submit Pricing"

**Expected:**
- ✅ Prices saved successfully
- ✅ Confirmation message
- ✅ Form shows submitted prices (read-only after submit)

**What to say:**
"Berry Farms has now submitted their pricing for Week 8. The RF Manager will see this on their dashboard."

#### Step 2.3: RF Dashboard - Finalize Pricing
**Action:**
1. Switch back to "RF Manager"
2. Refresh page (or navigate back to Pricing tab)
3. Verify Berry Farms now appears with pricing

**Expected:**
- ✅ Berry Farms now shows in supplier list
- ✅ All 5 suppliers have quotes
- ✅ Can see all `supplier_fob` prices
- ✅ "Push to Counter" or "Finalize" buttons available

**What to say:**
"Now RF Manager can see Berry Farms' pricing. We can negotiate or finalize prices. Let me finalize pricing for this week."

**Action (continue):**
4. For each SKU with quotes, set `rf_final_fob` (can use "Finalize Pricing" button or manual entry)
5. Set final prices (slightly adjusted from supplier prices, +$0.50 to +$2.00)

**Expected:**
- ✅ `rf_final_fob` values set
- ✅ Pricing marked as finalized
- ✅ Status updated

**What to say:**
"Pricing is now finalized. We've set the RF final FOB prices based on negotiations with suppliers."

---

### Part 3: Volume Allocation (10 minutes)

#### Step 3.1: RF Dashboard - Award Volume
**Action:**
1. Still on Week 8
2. Navigate to "Award Volume" tab

**Expected:**
- ✅ All 8 SKUs listed
- ✅ Volume needs shown (or can be entered)
- ✅ Pricing finalized status visible
- ✅ Lock/unlock buttons visible

**What to say:**
"Now we move to volume allocation. We need to award volumes to suppliers based on their pricing and availability."

**Action (continue):**
3. Enter volume needs for each SKU (e.g., 1000 cases each)
4. Award volumes to suppliers (distribute across 2-4 suppliers per SKU)
5. Enter awarded volumes: 300, 250, 200, 150, 100 (totaling 1000)

**Expected:**
- ✅ Volume needs saved
- ✅ Awarded volumes displayed
- ✅ Weighted FOB and DLVD prices calculated
- ✅ Remaining volume = 0 (all allocated)

**What to say:**
"We've allocated volumes across multiple suppliers. The system calculates weighted FOB and delivered prices automatically."

#### Step 3.2: Lock SKUs
**Action:**
1. For each SKU that has volume allocated (remaining = 0)
2. Click "Lock" button

**Expected:**
- ✅ Lock button changes to "Unlock"
- ✅ SKU status shows as locked
- ✅ Lock persists after page refresh

**What to say:**
"Once allocations are complete, we lock each SKU. This prevents further changes and allows us to send allocations to suppliers."

**Key point:** Lock/unlock persists - refresh page to verify

#### Step 3.3: Send Allocations
**Action:**
1. Verify all priced SKUs are locked
2. Verify at least one `awarded_volume > 0` exists
3. Click "Send Allocations to Suppliers" button

**Expected:**
- ✅ Button enabled (all conditions met)
- ✅ Clicking button sends allocations
- ✅ Week status updates: `allocation_submitted = true`
- ✅ Success message displayed

**What to say:**
"Now we send the allocations to suppliers. They'll receive notifications and can view their awarded volumes."

---

### Part 4: Supplier Acceptance (5 minutes)

#### Step 4.1: Supplier Dashboard - View Allocations
**Action:**
1. Switch to "Supplier Dashboard"
2. Select a supplier that received awards (e.g., "Fresh Farms")
3. Select "Week 8"

**Expected:**
- ✅ Awarded volumes visible
- ✅ Can see `offered_volume` (what RF offered)
- ✅ "Accept" / "Revise" / "Decline" buttons or form

**What to say:**
"From the supplier perspective, they can now see their awarded volumes and respond."

**Action (continue):**
4. Click "Accept" or enter acceptance
5. Submit response

**Expected:**
- ✅ Response saved
- ✅ Status updated to "accepted"
- ✅ `supplier_volume_accepted` set

**What to say:**
"Supplier has accepted the allocated volume. This response flows back to the RF Manager."

#### Step 4.2: RF Dashboard - Volume Acceptance Tab
**Action:**
1. Switch back to "RF Manager"
2. Navigate to "Volume Acceptance" tab (or "Acceptance" tab)

**Expected:**
- ✅ Auto-navigated to acceptance tab (if implemented)
- ✅ Shows supplier responses
- ✅ Accepted volumes displayed
- ✅ Pending responses highlighted

**What to say:**
"The RF Manager can now see supplier responses in real-time. Accepted volumes are displayed here."

**Action (continue):**
3. Review all supplier responses
4. If all suppliers have responded, verify finalization options

**Expected:**
- ✅ All supplier responses visible
- ✅ Can close volume loop if all responded
- ✅ Finalized allocations locked

**What to say:**
"Once all suppliers have responded, we can finalize the week and close the volume loop."

---

### Part 5: Closing the Loop (5 minutes)

#### Step 5.1: Finalize Week
**Action:**
1. Verify all suppliers have responded
2. Click "Close Volume Loop" or "Finalize Week" button

**Expected:**
- ✅ Week status changes to "finalized"
- ✅ Allocations locked
- ✅ Week moved to historical data

**What to say:**
"The week is now finalized. All allocations are locked and this week becomes part of our historical data."

#### Step 5.2: Verify Historical Data
**Action:**
1. Select "Week 1" again
2. Navigate through tabs: Pricing → Award Volume → Acceptance

**Expected:**
- ✅ All data visible and locked
- ✅ No edit buttons
- ✅ Complete historical record

**What to say:**
"As you can see, finalized weeks maintain a complete historical record of pricing, allocations, and supplier responses. This data is used for analytics and future negotiations."

---

## KEY DEMO POINTS TO HIGHLIGHT

1. **Complete Workflow:** Week creation → Supplier pricing → RF finalization → Volume allocation → Supplier acceptance → Week closure
2. **Real-time Updates:** Supplier responses flow to RF Manager immediately
3. **Data Integrity:** Lock/unlock persists, allocations locked after finalization
4. **Historical Data:** Weeks 1-7 show complete finalized data
5. **Live Week:** Week 8 demonstrates the current workflow
6. **Intentional Gaps:** Week 8 initially missing Berry Farms (demonstrates workflow)
7. **8 SKUs Only:** Blackberry and Raspberry show only "12ozx6" pack size (filtered correctly)
8. **Multi-supplier:** Awards distributed across multiple suppliers per SKU

---

## TROUBLESHOOTING DURING DEMO

### Issue: Data not showing
**Quick fix:**
1. Hard refresh: `Ctrl+Shift+R`
2. Check browser console (F12) for errors
3. Verify RLS is disabled (if needed)

### Issue: Lock/unlock not working
**Quick fix:**
1. Refresh page
2. Verify pricing is finalized for that SKU
3. Check console for errors

### Issue: Send Allocations button disabled
**Check:**
- All priced SKUs have `rf_final_fob` set
- All priced SKUs are locked
- At least one `awarded_volume > 0` exists

### Issue: Supplier responses not showing
**Check:**
- Supplier actually submitted response
- RF Acceptance tab is selected
- Page refreshed or realtime updates enabled

### Issue: Week 8 shows Berry Farms (shouldn't)
**Explanation:**
- This means Berry Farms submitted pricing (which is fine for demo)
- Originally missing for demo purposes, but if they submit, that's valid
- Say: "In our live system, suppliers submit at different times. Berry Farms has now submitted."

---

## POST-DEMO CHECKLIST

- [ ] Re-enable RLS (if disabled): Run `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in Supabase SQL Editor
- [ ] Save demo state: Optional - take screenshots or notes
- [ ] Reset if needed: Re-run seed script to restore original state

---

## DEMO TIMELINE SUMMARY

- **Pre-demo setup:** 10 minutes (tonight)
- **Part 1: Historical data:** 5 minutes
- **Part 2: Live week:** 10 minutes
- **Part 3: Volume allocation:** 10 minutes
- **Part 4: Supplier acceptance:** 5 minutes
- **Part 5: Closing the loop:** 5 minutes
- **Q&A buffer:** 5 minutes

**Total:** ~50 minutes for demo + 10 minutes buffer = 1 hour

---

## CRITICAL VERIFICATION BEFORE DEMO

1. ✅ Seed script runs successfully
2. ✅ Verification script shows "READY FOR DEMO: YES"
3. ✅ App loads without errors
4. ✅ Week 1-7 show finalized data
5. ✅ Week 8 shows as open
6. ✅ Week 8 pricing shows 4 suppliers (Berry Farms missing)
7. ✅ Lock/unlock buttons work
8. ✅ Send Allocations button enables when conditions met
9. ✅ Supplier responses flow to RF Acceptance tab
10. ✅ Browser console shows no errors (F12)

**If all 10 pass → Ready for 100 people! 🚀**

---

## ONE-LINER SUMMARY FOR GROK

**"Complete A-Z workflow: Seed database (8 items, 5 suppliers, 8 weeks), verify data, disable RLS if needed, demonstrate RF Dashboard (historical weeks 1-7 finalized, week 8 open missing Berry Farms), supplier submits pricing, RF finalizes, allocates volumes, locks SKUs, sends allocations, supplier accepts, RF views acceptance tab, finalizes week. All steps verified with console checks and data validation."**
