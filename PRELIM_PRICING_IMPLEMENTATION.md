# Preliminary Pricing Implementation - Summary

## Changes Applied

### Files Changed
1. **`src/components/Allocation.tsx`** - Main implementation

### Database Fields Used
- **Preliminary Pricing**: `quotes.supplier_fob` (when `rf_final_fob` is NULL)
- **Finalized Pricing**: `quotes.rf_final_fob` (when set)
- **Calculation Logic**: `price = rf_final_fob ?? supplier_fob`

### Key Changes

#### 1. AllocationEntry Interface
**BEFORE:**
```typescript
price: number; // rf_final_fob
```

**AFTER:**
```typescript
price: number; // rf_final_fob or supplier_fob (prelim)
isFinalized: boolean; // true if rf_final_fob exists, false if using supplier_fob
```

#### 2. Quote Filtering
**BEFORE:**
```typescript
const itemQuotes = quotes.filter(q => 
  q.item_id === item.id &&
  q.rf_final_fob !== null && 
  q.rf_final_fob > 0
);
```

**AFTER:**
```typescript
const itemQuotes = quotes.filter(q => 
  q.item_id === item.id &&
  ((q.rf_final_fob !== null && q.rf_final_fob > 0) ||
   (q.supplier_fob !== null && q.supplier_fob > 0))
);
```

#### 3. Price Calculation
**BEFORE:**
```typescript
const rfFinalFob = quote.rf_final_fob!;
const deliveredCostWithoutMargin = rfFinalFob + freight - rebate;
```

**AFTER:**
```typescript
const isFinalized = quote.rf_final_fob !== null && quote.rf_final_fob > 0;
const price = isFinalized ? quote.rf_final_fob! : (quote.supplier_fob || 0);
const deliveredCostWithoutMargin = price + freight - rebate;
```

#### 4. Allocation Unlock Condition
**BEFORE:**
```typescript
const hasAnyFinalized = quotes.some(q => 
  q.rf_final_fob !== null && q.rf_final_fob > 0
);
```

**AFTER:**
```typescript
const hasAnyPricing = quotes.some(q => 
  (q.rf_final_fob !== null && q.rf_final_fob > 0) ||
  (q.supplier_fob !== null && q.supplier_fob > 0)
);
```

#### 5. Send Volume Button Gating
**BEFORE:**
```typescript
disabled={submitting || !allSKUsComplete}
title={!allSKUsComplete ? "Complete allocation..." : ""}
```

**AFTER:**
```typescript
disabled={submitting || !allSKUsComplete || !allAllocatedQuotesFinalized}
title={
  !allSKUsComplete 
    ? "Complete allocation for all SKUs..." 
    : !allAllocatedQuotesFinalized
    ? `All allocated quotes must be finalized. Still preliminary: ${prelimAllocations.map(p => `${p.supplier} (${p.sku})`).join(', ')}`
    : ""
}
```

#### 6. New Validation Logic
```typescript
// Check if all allocated quotes are finalized (no PRELIM used)
const allAllocatedQuotesFinalized = skuAllocations.every(sku =>
  sku.entries.every(entry => 
    entry.awarded_volume === 0 || entry.isFinalized
  )
);

// Find which SKUs/suppliers are still prelim (for error message)
const prelimAllocations: Array<{sku: string; supplier: string}> = [];
skuAllocations.forEach(sku => {
  sku.entries.forEach(entry => {
    if (entry.awarded_volume > 0 && !entry.isFinalized) {
      prelimAllocations.push({
        sku: sku.item.name,
        supplier: entry.supplier_name
      });
    }
  });
});
```

#### 7. UI Badges Added
**BEFORE:**
```typescript
<div className="font-semibold text-white text-xs truncate">{entry.supplier_name}</div>
{isCheapest && <span>Low FOB</span>}
```

**AFTER:**
```typescript
<div className="font-semibold text-white text-xs truncate">{entry.supplier_name}</div>
{entry.isFinalized ? (
  <span className="px-1.5 py-0.5 bg-green-500/30 text-green-200 rounded text-[8px] font-bold shrink-0">
    FINAL
  </span>
) : (
  <span className="px-1.5 py-0.5 bg-yellow-500/30 text-yellow-200 rounded text-[8px] font-bold shrink-0">
    PRELIM
  </span>
)}
{isCheapest && <span>Low FOB</span>}
```

#### 8. Unlock Message Updated
**BEFORE:**
```
"Finalize at least one shipper price to continue."
"Go to Pricing tab and finalize pricing (set rf_final_fob) for at least one supplier per SKU."
```

**AFTER:**
```
"At least one shipper must submit pricing to continue."
"You can start allocation planning with preliminary pricing, but all allocated quotes must be finalized before sending volume to shippers."
```

## Gating Logic - Before vs After

### Allocation Tab Unlock
**BEFORE:**
- Required: At least one quote with `rf_final_fob` set
- Message: "Finalize at least one shipper price to continue."

**AFTER:**
- Required: At least one quote with `supplier_fob` OR `rf_final_fob` set
- Message: "At least one shipper must submit pricing to continue."

### Send Volume Button
**BEFORE:**
- Gated by: `allSKUsComplete` (all SKUs have totalAllocated = volumeNeeded)
- Error: "Complete allocation for all SKUs..."

**AFTER:**
- Gated by: `allSKUsComplete` AND `allAllocatedQuotesFinalized`
- Error: Lists specific suppliers/SKUs that are still preliminary
- Example: "All allocated quotes must be finalized. Still preliminary: Supplier A (Strawberries), Supplier B (Blueberries)"

## Test Steps

1. **Shipper Submits Preliminary Pricing**
   - Supplier logs in and submits `supplier_fob` for SKUs
   - Allocation tab should unlock and show quotes with PRELIM badges
   - Auto allocate and manual tweaks should work

2. **RF Plans with Preliminary Pricing**
   - Enter Total Volume Needed
   - Click Auto Allocate - should work with PRELIM pricing
   - Manually adjust allocations - should work
   - See PRELIM badges on supplier rows

3. **RF Finalizes Some Pricing**
   - Go to Pricing tab
   - Finalize pricing for some suppliers (set `rf_final_fob`)
   - Return to Allocation tab
   - Those supplier rows should switch from PRELIM to FINAL badge
   - Calculations should update automatically

4. **Try to Send Volume (Should Block)**
   - Allocate volume to both PRELIM and FINAL suppliers
   - Click "Send Volume to Shippers"
   - Button should be disabled
   - Tooltip should show: "All allocated quotes must be finalized. Still preliminary: [list]"

5. **Finalize All Allocated Quotes**
   - Go to Pricing tab
   - Finalize pricing for all suppliers that have allocated volume
   - Return to Allocation tab
   - All allocated quotes should show FINAL badge
   - "Send Volume to Shippers" button should enable

6. **Send Volume**
   - Click "Send Volume to Shippers"
   - Should succeed (all allocated quotes are finalized)

## SQL/Migration Changes

**No SQL changes required** - Uses existing fields:
- `quotes.supplier_fob` (preliminary pricing)
- `quotes.rf_final_fob` (finalized pricing)

## Real-time Updates

The existing realtime subscription on `quotes` table will automatically refresh allocation data when:
- Supplier submits pricing (`supplier_fob` set)
- RF finalizes pricing (`rf_final_fob` set)

This ensures PRELIM → FINAL badge updates happen instantly.

