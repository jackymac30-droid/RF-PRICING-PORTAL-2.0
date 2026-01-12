# COMPREHENSIVE WORKFLOW FIX — EVERYTHING WORKS TOGETHER

## THE ROOT PROBLEM

The workflow doesn't work together because:
1. Quotes aren't loaded when week is selected but no supplier is selected
2. Data loading happens in wrong order
3. Missing error handling causes silent failures

## THE COMPLETE FIX

### 1. Load Quotes for Selected Week (Even Without Supplier)

**Problem**: `loadQuotes` only runs when both `selectedWeek` AND `selectedSupplier` are set. But the pricing view needs quotes for ALL suppliers when no supplier is selected.

**Fix**: Add a new function to load all quotes for a week, regardless of supplier selection.

### 2. Fix Data Loading Order

**Problem**: `loadData` sets `selectedWeek` but doesn't immediately load quotes for that week.

**Fix**: After setting `selectedWeek`, immediately load quotes for that week.

### 3. Add Error Boundaries

**Problem**: Silent failures make debugging impossible.

**Fix**: Add comprehensive error logging and user-visible error messages.

## IMPLEMENTATION

### File: `src/components/RFDashboard.tsx`

**Add after `loadQuotes` function (around line 358):**

```typescript
// Load all quotes for selected week (for pricing overview when no supplier selected)
const loadAllQuotesForWeek = useCallback(async () => {
  if (!selectedWeek) return;
  try {
    setLoading(true);
    // Fetch quotes for all suppliers for this week
    const quotesData = await fetchQuotesWithDetails(selectedWeek.id);
    setQuotes(quotesData);
    logger.debug('Loaded all quotes for week', { 
      weekId: selectedWeek.id, 
      weekNumber: selectedWeek.week_number,
      quoteCount: quotesData.length 
    });
  } catch (err) {
    logger.error('Error loading all quotes for week:', err);
    showToast('Failed to load quotes. Please try again.', 'error');
  } finally {
    setLoading(false);
  }
}, [selectedWeek, showToast]);
```

**Update `loadData` function (around line 312):**

After `setSelectedWeek(weekToSelect)`, add:
```typescript
if (weekToSelect) {
  setSelectedWeek(weekToSelect);
  // CRITICAL FIX: Load quotes immediately after setting week
  // This ensures pricing view has data even when no supplier is selected
  setTimeout(async () => {
    const quotesData = await fetchQuotesWithDetails(weekToSelect.id);
    setQuotes(quotesData);
    logger.debug('Loaded quotes for default week', { 
      weekId: weekToSelect.id,
      quoteCount: quotesData.length 
    });
  }, 100);
  // ... rest of existing code
}
```

**Update useEffect for selectedWeek (around line 374):**

```typescript
useEffect(() => {
  if (selectedWeek) {
    loadWeekData();
    loadVolumeNeeds();
    // CRITICAL FIX: Load quotes when week changes (even if no supplier selected)
    if (!selectedSupplier) {
      loadAllQuotesForWeek();
    } else {
      loadQuotes();
    }
  }
}, [selectedWeek, selectedSupplier, loadWeekData, loadVolumeNeeds, loadAllQuotesForWeek, loadQuotes]);
```

## TESTING CHECKLIST

- [ ] Login as RF Manager
- [ ] Dashboard loads without errors
- [ ] Week 8 is selected by default
- [ ] Pricing tab shows suppliers and quotes (even without selecting supplier)
- [ ] Can select a supplier and see their quotes
- [ ] Can finalize pricing
- [ ] Award Volume tab loads
- [ ] Lock/unlock buttons work
- [ ] Can send allocations
- [ ] Supplier dashboard shows allocations
- [ ] Supplier can respond
- [ ] RF Acceptance tab shows responses
