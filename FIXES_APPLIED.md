# FIXES APPLIED - Minimal Diffs Only

## ISSUE 1: Blackberry/Raspberry filtering - only show "12ozx6" pack_size

**File**: `src/utils/helpers.ts`

**Change**: Added explicit filtering to skip Blackberry/Raspberry items that don't match "12ozx6" pattern.

**Diff**:
```diff
-    // Normalize Blackberry and Raspberry pack_size to "12ozx6" (replace variants)
-    if ((itemNameLower === 'blackberry' || itemNameLower === 'raspberry')) {
-      const packLower = item.pack_size.toLowerCase().trim();
-      // Normalize any variant of "12ozx6" to exact "12ozx6"
-      if (packLower.includes('12') && (packLower.includes('oz') || packLower.includes('ozx')) && packLower.includes('6')) {
-        normalizedPackSize = '12ozx6';
-      }
-    }
+    // Normalize Blackberry and Raspberry pack_size to "12ozx6" (replace variants)
+    // CRITICAL: Filter out items that don't match "12ozx6" pattern - only allow 12ozx6 variants
+    if ((itemNameLower === 'blackberry' || itemNameLower === 'raspberry')) {
+      const packLower = item.pack_size.toLowerCase().trim();
+      const packNormalizedCheck = packLower.replace(/\s+/g, '').replace(/×/g, 'x').replace(/-/g, '');
+      // Only include items that match "12ozx6" pattern (12, oz/ozx, 6)
+      if (packNormalizedCheck.includes('12') && (packNormalizedCheck.includes('oz') || packNormalizedCheck.includes('ozx')) && packNormalizedCheck.includes('6')) {
+        normalizedPackSize = '12ozx6';
+      } else {
+        // Filter out items that don't match - skip this item
+        continue;
+      }
+    }
```

---

## ISSUE 2: Send Allocations button - require all priced SKUs finalized AND all locked

**File**: `src/components/AwardVolume.tsx`

**Change**: Added checks for `allPricedSKUsFinalized` and `allPricedSKUsLocked` to enable button only when:
- All priced SKUs have rf_final_fob set (finalized pricing)
- All priced SKUs are allocation-locked (week_item_volumes.locked)
- At least one awarded_volume > 0 exists

**Diff**:
```diff
-  // Check if all SKUs that have quotes from suppliers are locked (via per-SKU lock button)
-  // Changed: At least ONE SKU with quotes must be locked (not all - suppliers may not quote every SKU)
-  const atLeastOneSKULocked = useMemo(() => {
-    const quotedRows = rowsForUI.filter(r => r.hasPricing)
-    if (quotedRows.length === 0) return false
-    // At least one SKU that has quotes from suppliers must be locked
-    const quotedItemIds = quotedRows.map(r => r.item?.id).filter(Boolean) as string[]
-    const result = quotedItemIds.some(itemId => lockedSKUs.has(itemId))
-    return result
-  }, [rowsForUI, lockedSKUs])
-
-  // Global "send allocations" enabled if:
-  // 1. All quoted SKUs have finalized pricing (have rf_final_fob)
-  // 2. All SKUs with supplier quotes are locked (via per-SKU lock button)
-  // 3. At least one priced quote has award > 0
+  // Check if all priced SKUs have finalized pricing (rf_final_fob)
+  const allPricedSKUsFinalized = useMemo(() => {
+    const quotedRows = rowsForUI.filter(r => r.hasPricing)
+    if (quotedRows.length === 0) return false
+    // All priced SKUs must have rf_final_fob set for all their quotes
+    return quotedRows.every(row => 
+      row.pricedQuotes.length > 0 && 
+      row.pricedQuotes.every(q => q.rf_final_fob !== null && q.rf_final_fob !== undefined && q.rf_final_fob > 0)
+    )
+  }, [rowsForUI])
+
+  // Check if all priced SKUs are allocation-locked (week_item_volumes.locked)
+  const allPricedSKUsLocked = useMemo(() => {
+    const quotedRows = rowsForUI.filter(r => r.hasPricing)
+    if (quotedRows.length === 0) return false
+    // All priced SKUs must be locked (via per-SKU lock button)
+    const quotedItemIds = quotedRows.map(r => r.item?.id).filter(Boolean) as string[]
+    return quotedItemIds.length > 0 && quotedItemIds.every(itemId => lockedSKUs.has(itemId))
+  }, [rowsForUI, lockedSKUs])
```

```diff
-            disabled={(() => {
-              // Only require: can edit, not submitting, has allocations, and at least ONE SKU is locked
-              // Changed from "all SKUs" to "at least one SKU" since suppliers may not quote every SKU
-              const disabled = !canEdit || submitting || !hasAnyAllocation || !atLeastOneSKULocked;
-              return disabled;
-            })()}
+            disabled={(() => {
+              // Require: can edit, not submitting, all priced SKUs finalized, all priced SKUs locked, at least one allocation
+              const disabled = !canEdit || submitting || !allPricedSKUsFinalized || !allPricedSKUsLocked || !hasAnyAllocation;
+              return disabled;
+            })()}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition"
              title={
                !canEdit 
                  ? 'Week is locked' 
-                  : !atLeastOneSKULocked
-                  ? `At least one SKU must be locked before sending allocations. Currently locked: ${lockedSKUs.size} of ${rowsForUI.filter(r => r.hasPricing).length} quoted SKUs. Complete allocation and click "Lock" on at least one SKU.`
+                  : !allPricedSKUsFinalized
+                  ? 'All priced SKUs must have finalized pricing (rf_final_fob) before sending allocations'
+                  : !allPricedSKUsLocked
+                  ? `All priced SKUs must be locked before sending allocations. Currently locked: ${lockedSKUs.size} of ${rowsForUI.filter(r => r.hasPricing).length} quoted SKUs. Click "Lock" on all priced SKUs.`
                  : !hasAnyAllocation 
                  ? 'Allocate at least one volume first' 
                  : 'Send allocations to suppliers for approval or revision'
              }
```

---

## ISSUE 3: Lock/Unlock persistence - ensure load() refreshes lockedSKUs

**File**: `src/components/AwardVolume.tsx`

**Change**: Simplified lock/unlock handler to always call `load()` after success, removing direct DB query fallback logic (load() already handles lockedSKUs refresh from fetchVolumeNeeds).

**Diff**:
```diff
      if (success) {
        // Reload from DB to sync lockedSKUs state (ensures persistence)
        logger.debug('Reloading data to sync lockedSKUs state');
-        // Directly query locked state from DB to ensure accuracy (bypass column detection issues)
-        try {
-          const { data: volumeData, error: queryError } = await supabase
-            .from('week_item_volumes')
-            .select('item_id, locked')
-            .eq('week_id', selectedWeek.id)
-            .eq('item_id', itemId)
-            .maybeSingle();
-          
-          if (!queryError && volumeData && 'locked' in volumeData) {
-            const isLocked = volumeData.locked === true || 
-                           (typeof volumeData.locked === 'number' && volumeData.locked === 1) || 
-                           (typeof volumeData.locked === 'string' && volumeData.locked === 'true');
-            
-            // Update local state based on DB verification
-            setLockedSKUs(prev => {
-              const next = new Set(prev)
-              if (isLocked) {
-                next.add(itemId)
-              } else {
-                next.delete(itemId)
-              }
-              return next
-            })
-            logger.debug('Lock state verified from DB', { itemId, isLocked });
-          } else {
-            // If query fails, still call load() to refresh from fetchVolumeNeeds
-            await load()
-          }
-        } catch (verifyErr) {
-          logger.warn('Error verifying lock state directly, falling back to load():', verifyErr);
-          await load()
-        }
-        
+        await load()
         showToast(shouldLock ? `SKU locked` : `SKU unlocked`, 'success')
         logger.debug('Lock/unlock operation completed successfully', { itemId, shouldLock });
```

---

## ISSUE 4: Supplier acceptance propagation to RF Acceptance tab

**Status**: VERIFIED - Already working

The `VolumeAcceptance.tsx` component (used in RF Acceptance tab via Allocation.tsx exceptions mode) already:
- Queries `quotes` table with `supplier_volume_response`, `supplier_volume_accepted`, `supplier_volume_response_notes`
- Has realtime subscription to `quotes` table via `useRealtime('quotes', handleQuotesUpdate)`
- Refreshes allocations when quotes change
- Displays supplier responses in "Responded Allocations" section

No changes needed.

---

## TEST CHECKLIST

### 1. SKU Filtering (8 canonical SKUs only)
- [ ] RF Dashboard → Pricing tab shows exactly 8 SKUs
- [ ] Blackberry CONV shows pack_size "12ozx6" only
- [ ] Blackberry ORG shows pack_size "12ozx6" only
- [ ] Raspberry CONV shows pack_size "12ozx6" only
- [ ] Raspberry ORG shows pack_size "12ozx6" only
- [ ] No other pack_size variants appear for Blackberry/Raspberry

### 2. Award Volume Lock/Unlock
- [ ] Click "Lock" on a SKU → calls lockSKU(week_id, item_id)
- [ ] Lock state persists after page refresh
- [ ] Click "Unlock" on a locked SKU → calls unlockSKU(week_id, item_id)
- [ ] Unlock state persists after page refresh
- [ ] UI rehydrates locked state on page load (locked SKUs show lock icon)

### 3. Send Allocations Button Gating
- [ ] Button disabled when pricing not finalized (rf_final_fob missing)
- [ ] Button disabled when SKUs not locked (week_item_volumes.locked = false)
- [ ] Button disabled when no awarded_volume > 0
- [ ] Button enabled when: all priced SKUs have rf_final_fob + all priced SKUs locked + at least one awarded_volume > 0
- [ ] Tooltip shows correct reason when disabled

### 4. Supplier Acceptance → RF Acceptance Tab
- [ ] Supplier accepts volume on Supplier Dashboard
- [ ] RF Dashboard → Acceptance tab (Allocation exceptions mode) shows supplier response
- [ ] Supplier response appears in "Responded Allocations" section
- [ ] Realtime updates work (supplier response appears without page refresh)
