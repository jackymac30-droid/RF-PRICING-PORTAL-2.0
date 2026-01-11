import type { Week, Item } from '../types';

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekDateRange(week: Week): string {
  const start = parseDate(week.start_date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startMonth = start.toLocaleString('en-US', { month: 'short' });
  const endMonth = end.toLocaleString('en-US', { month: 'short' });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}`;
  }
  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
}

export function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getNegotiationStatusLabel(status: string): string {
  switch (status) {
    case 'awaiting_supplier_quote':
      return 'Awaiting Your Quote';
    case 'awaiting_rf_response':
      return 'Awaiting RF Response';
    case 'awaiting_supplier_response':
      return 'Awaiting Your Response';
    case 'accepted':
      return 'Accepted';
    case 'finalized':
      return 'Finalized';
    default:
      return status;
  }
}

export function getNegotiationStatusColor(status: string): string {
  switch (status) {
    case 'awaiting_supplier_quote':
      return 'bg-yellow-100 text-yellow-800';
    case 'awaiting_rf_response':
      return 'bg-blue-100 text-blue-800';
    case 'awaiting_supplier_response':
      return 'bg-orange-100 text-orange-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'finalized':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Standardized item filtering function used across all components
 * Ensures the same 8 SKUs are shown consistently:
 * - Strawberry CONV, Strawberry ORG
 * - Blueberry CONV, Blueberry ORG
 * - Blackberry CONV, Blackberry ORG
 * - Raspberry CONV, Raspberry ORG
 * 
 * Always excludes 2lb strawberry SKUs
 */
import type { Item } from '../types';

export function filterStandardSKUs(items: Item[], options?: {
  /** Only include items that have pricing (from quotes) */
  requirePricing?: boolean;
  /** Set of item IDs that have pricing (used when requirePricing is true) */
  itemsWithPricing?: Set<string>;
}): Item[] {
  // First, filter by pricing if required
  let filteredItems = items;
  if (options?.requirePricing && options?.itemsWithPricing) {
    filteredItems = items.filter(item => options.itemsWithPricing!.has(item.id));
  }

  // Deduplicate items by ID (primary)
  const byId = new Map<string, Item>();
  for (const item of filteredItems) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }

  // Then deduplicate by name+pack_size+organic_flag (catch true duplicates with different IDs)
  // Include organic_flag in key to distinguish CONV vs ORG variants
  const byNamePack = new Map<string, Item>();
  for (const item of byId.values()) {
    const itemNameLower = item.name.toLowerCase();
    const packLower = item.pack_size.toLowerCase().trim();
    const packNormalized = packLower.replace(/\s+/g, '').replace(/×/g, 'x').replace(/-/g, '');
    
    // CRITICAL: ALWAYS skip standalone 2lb strawberry SKUs ONLY
    // NEVER skip "4x2lb" variants - they are the MAIN strawberry CONV SKU
    if (itemNameLower === 'strawberry') {
      // Only skip if it's EXACTLY "2lb", "2 lb", "2-lb", etc. WITHOUT "4" anywhere
      const isStandalone2lb = (packNormalized === '2lb' || packLower === '2 lb' || packLower === '2 lbs' || 
                                packLower === '2-lb' || packLower.startsWith('2lb ') || packLower.startsWith('2 lb ')) &&
                               !packNormalized.includes('4') && !packLower.includes('4');
      if (isStandalone2lb) {
        continue; // Skip ONLY standalone 2lb strawberry variants
      }
    }
    
    // Normalize pack sizes for specific items
    let normalizedPackSize = item.pack_size;
    
    // CRITICAL: Normalize Strawberry CONV variants to "4×2 lb"
    // This is the MOST IMPORTANT SKU - match ANY variant that has 4, 2, and lb
    if (itemNameLower === 'strawberry' && (item.organic_flag === 'CONV' || !item.organic_flag || item.organic_flag === 'CONV')) {
      // Match ANY variant: "4x2lb", "4x2 lb", "4×2 lb", "4 x 2 lb", "4x2-lb", etc.
      if (packNormalized.includes('4') && packNormalized.includes('2') && packNormalized.includes('lb') && !packNormalized.startsWith('2')) {
        normalizedPackSize = '4×2 lb';
      }
      // Extra safety check: if pack contains both "4" and "2" and "lb", it's definitely 4x2lb
      if ((packNormalized.includes('4x2') || packNormalized.includes('4×2') || packNormalized.includes('42')) && packNormalized.includes('lb')) {
        normalizedPackSize = '4×2 lb';
      }
    }
    
    // Normalize Blackberry and Raspberry pack_size to "12ozx6" (replace variants)
    if ((itemNameLower === 'blackberry' || itemNameLower === 'raspberry')) {
      const packLower = item.pack_size.toLowerCase().trim();
      // Normalize any variant of "12ozx6" to exact "12ozx6"
      if (packLower.includes('12') && (packLower.includes('oz') || packLower.includes('ozx')) && packLower.includes('6')) {
        normalizedPackSize = '12ozx6';
      }
    }
    
    // Include organic_flag in key to prevent CONV and ORG from being treated as duplicates
    const key = `${item.name}|${normalizedPackSize}|${item.organic_flag || 'CONV'}`;
    
    // CRITICAL: Always ensure strawberry CONV with 4x2lb variants are included
    // If key exists, prefer the one with normalized pack_size (4×2 lb, 12ozx6)
    if (!byNamePack.has(key)) {
      byNamePack.set(key, { ...item, pack_size: normalizedPackSize });
    } else {
      // If we have a normalized version, ALWAYS replace the existing one for strawberry 4×2 lb
      const existing = byNamePack.get(key)!;
      if (normalizedPackSize === '4×2 lb' && existing.pack_size !== '4×2 lb') {
        // Always prefer the normalized 4×2 lb version
        byNamePack.set(key, { ...item, pack_size: normalizedPackSize });
      } else if (normalizedPackSize === '12ozx6' && existing.pack_size !== '12ozx6') {
        byNamePack.set(key, { ...item, pack_size: normalizedPackSize });
      } else {
        // Keep existing - but ensure strawberry CONV is preserved
        if (itemNameLower === 'strawberry' && (item.organic_flag === 'CONV' || !item.organic_flag) && normalizedPackSize === '4×2 lb') {
          // Force update to normalized version for strawberry 4×2 lb
          byNamePack.set(key, { ...item, pack_size: normalizedPackSize });
        }
      }
    }
  }

  const result = Array.from(byNamePack.values());
  
  // CRITICAL FINAL CHECK: Ensure strawberry CONV 4×2 lb is ALWAYS present
  // This is the most important SKU - it must never be missing
  let hasStrawberryCONV = result.find(item => 
    item.name.toLowerCase() === 'strawberry' && 
    (item.organic_flag === 'CONV' || !item.organic_flag) &&
    (item.pack_size === '4×2 lb' || item.pack_size.toLowerCase().includes('4') && item.pack_size.toLowerCase().includes('2') && item.pack_size.toLowerCase().includes('lb'))
  );
  
  if (!hasStrawberryCONV) {
    // Look through ORIGINAL items (before any filtering) to find strawberry CONV
    // This ensures we catch it even if it was filtered out somehow
    for (const item of items) {
      const itemNameLower = item.name.toLowerCase();
      if (itemNameLower === 'strawberry' && (item.organic_flag === 'CONV' || !item.organic_flag)) {
        const packLower = item.pack_size.toLowerCase().trim();
        const packNormalized = packLower.replace(/\s+/g, '').replace(/×/g, 'x').replace(/-/g, '');
        // If it has 4 and 2 and lb (and doesn't start with 2), it's our strawberry CONV
        if (packNormalized.includes('4') && packNormalized.includes('2') && packNormalized.includes('lb') && !packNormalized.startsWith('2')) {
          // Force add it as the first item - this is the most important SKU
          result.unshift({ ...item, pack_size: '4×2 lb', display_order: item.display_order || 1 });
          hasStrawberryCONV = result[0];
          break; // Only add one
        }
      }
    }
  } else {
    // Ensure it has the correct pack_size
    const idx = result.indexOf(hasStrawberryCONV!);
    if (idx >= 0 && hasStrawberryCONV!.pack_size !== '4×2 lb') {
      result[idx] = { ...hasStrawberryCONV!, pack_size: '4×2 lb' };
    }
  }
  
  // Ensure strawberry CONV 4×2 lb is ALWAYS first (display_order: 1)
  result.sort((a, b) => {
    const aIsStrawberryCONV = a.name.toLowerCase() === 'strawberry' && (a.organic_flag === 'CONV' || !a.organic_flag) && 
                               (a.pack_size === '4×2 lb' || (a.pack_size.toLowerCase().includes('4') && a.pack_size.toLowerCase().includes('2') && a.pack_size.toLowerCase().includes('lb')));
    const bIsStrawberryCONV = b.name.toLowerCase() === 'strawberry' && (b.organic_flag === 'CONV' || !b.organic_flag) && 
                               (b.pack_size === '4×2 lb' || (b.pack_size.toLowerCase().includes('4') && b.pack_size.toLowerCase().includes('2') && b.pack_size.toLowerCase().includes('lb')));
    if (aIsStrawberryCONV && !bIsStrawberryCONV) return -1;
    if (!aIsStrawberryCONV && bIsStrawberryCONV) return 1;
    return (a.display_order || 999) - (b.display_order || 999);
  });

  return result;
}
