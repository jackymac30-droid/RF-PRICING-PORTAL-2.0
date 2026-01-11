import { supabase } from './supabase';
import { logger } from './logger';
import type { Session, Supplier, Item, Week, Quote, QuoteWithDetails, SKUStatus, SupplierStats, SupplierRanking, AnalyticsBySKU, AnalyticsBySupplier, WeekItemVolume } from '../types';

export const DEMO_PASSWORD = '123';
const SESSION_KEY = 'rf_pricing_session';

export async function loginAsSupplier(email: string): Promise<Session | null> {
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (supplier) {
    return {
      user_id: supplier.id,
      user_name: supplier.name,
      role: 'supplier',
      supplier_id: supplier.id,
    };
  }
  return null;
}

export async function loginAsRF(): Promise<Session> {
  return {
    user_id: 'rf-user',
    user_name: 'RF Manager',
    role: 'rf',
  };
}

export function saveSession(session: Session | null): void {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function loadSession(): Session | null {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');
  
  if (error) {
    logger.error('Error fetching suppliers:', error);
    return [];
  }
  
  return data || [];
}

export async function fetchItems(): Promise<Item[]> {
  const { data } = await supabase
    .from('items')
    .select('*')
    .order('display_order');
  return data || [];
}

export async function fetchWeeks(limit?: number): Promise<Week[]> {
  // FIXED WEEK DISPLAY: Remove all date filters - show all 8 weeks regardless of dates
  // Order by week_number ascending (1, 2, 3, ... 8) for consistent display
  let query = supabase
    .from('weeks')
    .select('*')
    .order('week_number', { ascending: true });
  
  // Add limit if provided (for pagination/performance)
  if (limit && limit > 0) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    logger.error('Error fetching weeks:', error);
    return [];
  }
  
  // Null guard: return empty array if no data
  if (!data || data.length === 0) {
    logger.warn('No weeks found in database');
    return [];
  }
  
  return data;
  // WEEK DISPLAY FIXED — ALL 8 WEEKS VISIBLE
}

/**
 * Fetch recent weeks only (for better performance)
 * Defaults to last 20 weeks
 */
export async function fetchRecentWeeks(limit: number = 20): Promise<Week[]> {
  const { data } = await supabase
    .from('weeks')
    .select('*')
    .order('week_number', { ascending: false })
    .limit(limit);
  return data || [];
}

export async function fetchCurrentAndRecentWeeks(): Promise<Week[]> {
  const { data } = await supabase
    .from('weeks')
    .select('*')
    .order('week_number', { ascending: false })
    .limit(6);
  return data || [];
}

export async function fetchCurrentOpenWeek(): Promise<Week | null> {
  const { data } = await supabase
    .from('weeks')
    .select('*')
    .eq('status', 'open')
    .maybeSingle();
  return data;
}

export async function fetchQuotes(weekId: string, supplierId?: string): Promise<Quote[]> {
  let query = supabase
    .from('quotes')
    .select('*')
    .eq('week_id', weekId);

  if (supplierId) {
    query = query.eq('supplier_id', supplierId);
  }

  const { data } = await query;
  return data || [];
}

export async function fetchQuotesWithDetails(weekId: string, supplierId?: string): Promise<QuoteWithDetails[]> {
  try {
    let query = supabase
      .from('quotes')
      .select(`
        *,
        item:items(*),
        supplier:suppliers(*),
        week:weeks(*)
      `)
      .eq('week_id', weekId);

    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }

    const { data, error } = await query;
    
    if (error) {
      logger.error('Error fetching quotes with details:', error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    logger.error('Error in fetchQuotesWithDetails:', err);
    throw err;
  }
}

export async function updateSupplierQuote(
  quoteId: string,
  fobPrice: number | null,
  dlvdPrice: number | null
): Promise<boolean> {
  logger.debug('updateSupplierQuote called:', { quoteId, fobPrice, dlvdPrice });

  const { data, error } = await supabase
    .from('quotes')
    .update({
      supplier_fob: fobPrice,
      supplier_dlvd: dlvdPrice,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId)
    .select();

  if (error) {
    logger.error('Error updating quote:', error);
    return false;
  }

  logger.debug('Quote updated successfully:', data);
  return true;
}

export async function updateSupplierResponse(
  quoteId: string,
  response: 'accept' | 'revise',
  revisedFob?: number
): Promise<boolean> {
  // First, get the current quote to check if there's a counter
  const { data: quote, error: fetchError } = await supabase
    .from('quotes')
    .select('rf_counter_fob')
    .eq('id', quoteId)
    .single();

  if (fetchError) {
    logger.error('Error fetching quote:', fetchError);
    return false;
  }

  // Auto-finalize if supplier accepts the counter
  // If supplier revises, leave rf_final_fob null for RF to review
  const updateData: any = {
    supplier_response: response,
    supplier_revised_fob: revisedFob || null,
    updated_at: new Date().toISOString(),
  };

  // Auto-lock to counter price if supplier accepts
  if (response === 'accept' && quote && quote.rf_counter_fob !== null) {
    updateData.rf_final_fob = quote.rf_counter_fob;
  }

  const { error } = await supabase
    .from('quotes')
    .update(updateData)
    .eq('id', quoteId);

  if (error) {
    logger.error('Error updating supplier response:', error);
    return false;
  }

  return true;
}

export async function updateRFCounter(
  quoteId: string,
  counterFob: number | null
): Promise<boolean> {
  const { error } = await supabase
    .from('quotes')
    .update({
      rf_counter_fob: counterFob,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId);

  if (error) {
    logger.error('Error updating RF counter:', error);
    return false;
  }

  return true;
}

// RF sets final confirmed price for a specific quote (one supplier, one SKU)
// This locks pricing for this quote, allowing different final prices per supplier for same SKU
export async function updateRFFinal(
  quoteId: string,
  finalFob: number | null
): Promise<boolean> {
  const { error } = await supabase
    .from('quotes')
    .update({
      rf_final_fob: finalFob,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId);

  if (error) {
    logger.error('Error updating RF final:', error);
    return false;
  }

  return true;
}

/**
 * Update supplier eligibility status
 * Core business rule: Pricing submission ≠ allocation eligibility
 * Only suppliers with status 'eligible_for_award' appear in allocation interface
 */
export async function updateSupplierEligibility(
  quoteId: string, 
  status: 'submitted' | 'reviewed' | 'feedback_sent' | 'eligible_for_award' | 'not_used',
  userName: string = 'RF Manager'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .rpc('update_supplier_eligibility', {
        quote_id_param: quoteId,
        new_status: status,
        updated_by_user: userName
      });

    if (error) {
      logger.error('Error updating supplier eligibility:', error);
      return false;
    }

    return true;
  } catch (err) {
    logger.error('Error updating supplier eligibility:', err);
    return false;
  }
}

export async function updateQuoteVolume(
  quoteId: string,
  volume: number
): Promise<boolean> {
  const { error } = await supabase
    .from('quotes')
    .update({
      awarded_volume: volume,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId);

  if (error) {
    logger.error('Error updating quote volume:', error);
    return false;
  }

  return true;
}

export async function updateWeekStatus(
  weekId: string,
  status: 'open' | 'finalized' | 'closed'
): Promise<boolean> {
  const { error } = await supabase
    .from('weeks')
    .update({ status })
    .eq('id', weekId);

  if (error) {
    logger.error('Error updating week status:', error);
    return false;
  }

  if (status === 'closed') {
    const { error: previousError } = await supabase
      .from('weeks')
      .update({ status: 'closed' })
      .eq('status', 'finalized')
      .neq('id', weekId);

    if (previousError) {
      logger.error('Error closing previous weeks:', previousError);
    }
  }

  return true;
}

export async function enforceWeekStatusHygiene(): Promise<boolean> {
  try {
    const { data: weeks, error: fetchError } = await supabase
      .from('weeks')
      .select('id, start_date, status')
      .order('start_date', { ascending: false });

    if (fetchError) {
      logger.error('Error fetching weeks for hygiene check:', fetchError);
      return false;
    }

    if (!weeks || weeks.length === 0) {
      logger.debug('No weeks found, hygiene check skipped');
      return true;
    }

    const latestWeek = weeks[0];
    const otherWeekIds = weeks.slice(1).map(w => w.id);

    if (latestWeek.status !== 'open') {
      const { error: openError } = await supabase
        .from('weeks')
        .update({ status: 'open' })
        .eq('id', latestWeek.id);

      if (openError) {
        logger.error('Error setting latest week to open:', openError);
        return false;
      }
      logger.debug(`✓ Set week ${latestWeek.id} to open`);
    }

    if (otherWeekIds.length > 0) {
      const { error: closeError } = await supabase
        .from('weeks')
        .update({ status: 'closed' })
        .in('id', otherWeekIds)
        .neq('status', 'closed');

      if (closeError) {
        logger.error('Error closing other weeks:', closeError);
        return false;
      }
      logger.debug(`✓ Closed ${otherWeekIds.length} other weeks`);
    }

    logger.debug('✓ Week status hygiene enforced');
    return true;
  } catch (err) {
    logger.error('Error enforcing week status hygiene:', err);
    return false;
  }
}

// Creates a new week and initializes quotes for all supplier × item combinations
// This ensures each supplier can submit pricing for each SKU independently
// Quote structure: one record per (week_id, item_id, supplier_id) - allows multiple suppliers per SKU
export async function createNewWeek(): Promise<Week | null> {
  // Close all existing open weeks first (only one week can be 'open' at a time)
  await supabase
    .from('weeks')
    .update({ status: 'closed' })
    .eq('status', 'open');

  const { data: weeks } = await supabase
    .from('weeks')
    .select('week_number, end_date')
    .order('week_number', { ascending: false })
    .limit(1);

  const lastWeek = weeks?.[0];
  const nextWeekNumber = lastWeek ? lastWeek.week_number + 1 : 1;

  let startDate: Date;
  if (lastWeek?.end_date) {
    const lastEndDate = new Date(lastWeek.end_date);
    startDate = new Date(lastEndDate);
    startDate.setDate(startDate.getDate() + 1);
  } else {
    startDate = new Date();
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const { data: newWeek, error } = await supabase
    .from('weeks')
    .insert({
      week_number: nextWeekNumber,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'open' // Week is now open for supplier submissions
    })
    .select()
    .single();

  if (error) {
    logger.error('Error creating new week:', error);
    return null;
  }

  const [suppliers, items] = await Promise.all([
    fetchSuppliers(),
    fetchItems()
  ]);

  // Create one quote record per supplier × item combination
  // This allows multiple suppliers to price the same SKU independently
  const quotes = [];
  for (const supplier of suppliers) {
    for (const item of items) {
      quotes.push({
        week_id: newWeek.id,
        item_id: item.id,
        supplier_id: supplier.id
        // supplier_fob, rf_counter_fob, etc. start as null - filled in during workflow
      });
    }
  }

  if (quotes.length > 0) {
    const { error: quotesError } = await supabase
      .from('quotes')
      .insert(quotes);

    if (quotesError) {
      logger.error('Error creating quotes for new week:', quotesError);
      // Don't fail week creation if quotes fail - they can be created later via ensureQuotesForWeek
      // But log the error so it's visible
    } else {
      logger.debug(`Created ${quotes.length} quotes for week ${newWeek.week_number}`);
    }
  } else {
    logger.warn('No quotes to create - suppliers or items may be missing');
  }

  // Auto-create week_item_volumes rows for all items (seed volume with default 0)
  // This ensures volume_needed data exists and prevents UI from breaking
  const volumeNeeds = items.map(item => ({
    week_id: newWeek.id,
    item_id: item.id,
    volume_needed: 0, // Default to 0, RF will set actual values later
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  if (volumeNeeds.length > 0) {
    const { error: volumeError } = await supabase
      .from('week_item_volumes')
      .insert(volumeNeeds);

    if (volumeError) {
      logger.error('Error creating volume needs for new week:', volumeError);
      // Don't fail week creation if volume needs fail - can be created later
    }
  }

  return newWeek;
}

export async function updateEmergencyUnlock(
  weekId: string,
  enabled: boolean,
  reason?: string,
  userName?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('weeks')
    .update({
      emergency_unlock_enabled: enabled,
      emergency_unlock_reason: reason || null,
      emergency_unlock_by_user: userName || null,
      emergency_unlock_at: enabled ? new Date().toISOString() : null,
    })
    .eq('id', weekId);

  if (error) {
    logger.error('Error updating emergency unlock:', error);
    return false;
  }

  return true;
}

export async function createAuditLog(
  weekId: string,
  fieldChanged: string,
  oldValue: string | null,
  newValue: string | null,
  userId: string,
  reason: string,
  itemId?: string,
  supplierId?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('audit_log')
    .insert({
      week_id: weekId,
      item_id: itemId,
      supplier_id: supplierId,
      field_changed: fieldChanged,
      old_value: oldValue,
      new_value: newValue,
      user_id: userId,
      reason,
    });

  if (error) {
    logger.error('Error creating audit log:', error);
    return false;
  }

  return true;
}

export async function ensureQuotesForWeek(weekId: string): Promise<void> {
  const [suppliers, items] = await Promise.all([fetchSuppliers(), fetchItems()]);

  for (const supplier of suppliers) {
    for (const item of items) {
      const { data: existing } = await supabase
        .from('quotes')
        .select('id')
        .eq('week_id', weekId)
        .eq('item_id', item.id)
        .eq('supplier_id', supplier.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from('quotes').insert({
          week_id: weekId,
          item_id: item.id,
          supplier_id: supplier.id,
        });
      }
    }
  }
}

export async function getSuppliersWithSubmissions(weekId: string): Promise<{
  submitted: Supplier[];
  notSubmitted: Supplier[];
  counter: Supplier[];
  finalized: Supplier[];
}> {
  const suppliers = await fetchSuppliers();
  const quotes = await fetchQuotes(weekId);

  const notSubmitted: Supplier[] = [];
  const submitted: Supplier[] = [];
  const counter: Supplier[] = [];
  const finalized: Supplier[] = [];

  for (const supplier of suppliers) {
    const supplierQuotes = quotes.filter(q => q.supplier_id === supplier.id);

    // Supplier is "submitted" if at least ONE quote has supplier_fob OR supplier_dlvd non-null
    const hasSubmitted = supplierQuotes.some(q => q.supplier_fob !== null || q.supplier_dlvd !== null);

    if (!hasSubmitted) {
      notSubmitted.push(supplier);
      continue;
    }

    // Check if all quotes with prices have been finalized
    const quotesWithPrices = supplierQuotes.filter(q => q.supplier_fob !== null);
    const allFinalPricesSet = quotesWithPrices.length > 0 && quotesWithPrices.every(q => q.rf_final_fob !== null);
    
    // If all priced quotes are finalized, supplier is finalized (highest priority)
    if (allFinalPricesSet) {
      finalized.push(supplier);
      continue;
    }

    // Otherwise, categorize by workflow stage
    const hasCounters = supplierQuotes.some(q => q.rf_counter_fob !== null);
    const hasResponses = supplierQuotes.some(q => q.supplier_response !== null);
    const hasAnyFinalized = supplierQuotes.some(q => q.rf_final_fob !== null);

    // If there are counters and responses, or if there are counters and some finalized prices
    // (RF is in the process of finalizing), show in counter tab
    if (hasCounters && (hasResponses || hasAnyFinalized)) {
      counter.push(supplier);
    } else if (hasCounters) {
      // Counter sent but no response yet - still in counter tab
      counter.push(supplier);
    } else {
      submitted.push(supplier);
    }
  }

  return { notSubmitted, submitted, counter, finalized };
}

export async function getAllSupplierQuotes(weekId: string): Promise<Record<string, QuoteWithDetails[]>> {
  const quotes = await fetchQuotesWithDetails(weekId);
  const quotesBySupplier: Record<string, QuoteWithDetails[]> = {};

  for (const quote of quotes) {
    const supplierId = quote.supplier_id;
    if (!quotesBySupplier[supplierId]) {
      quotesBySupplier[supplierId] = [];
    }
    quotesBySupplier[supplierId].push(quote);
  }

  return quotesBySupplier;
}

export async function getSKUStatuses(weekId: string): Promise<SKUStatus[]> {
  const [items, quotes, suppliers] = await Promise.all([
    fetchItems(),
    fetchQuotes(weekId),
    fetchSuppliers(),
  ]);

  const skuStatuses: SKUStatus[] = [];

  for (const item of items) {
    const itemQuotes = quotes.filter(q => q.item_id === item.id);

    let status: SKUStatus['status'] = 'needs_supplier';
    const hasSupplierQuotes = itemQuotes.some(q => q.supplier_fob !== null);
    const hasRFCounters = itemQuotes.some(q => q.rf_counter_fob !== null);
    const hasSupplierResponses = itemQuotes.some(q => q.supplier_response !== null);
    const hasRFFinal = itemQuotes.some(q => q.rf_final_fob !== null);

    if (hasRFFinal) {
      status = 'complete';
    } else if (hasSupplierResponses) {
      status = 'needs_rf_final';
    } else if (hasRFCounters) {
      status = 'needs_supplier_response';
    } else if (hasSupplierQuotes) {
      status = 'needs_rf_counter';
    }

    const rankings: SupplierRanking[] = [];
    const prices: number[] = [];

    for (const supplier of suppliers) {
      const quote = itemQuotes.find(q => q.supplier_id === supplier.id);
      if (!quote) continue;

      const price = quote.rf_final_fob || quote.supplier_revised_fob || quote.supplier_fob;
      if (price !== null && price !== undefined) {
        prices.push(price);
        rankings.push({
          supplier_id: supplier.id,
          supplier_name: supplier.name,
          rank: 0,
          price,
          supplier_fob: quote.supplier_fob,
          rf_counter_fob: quote.rf_counter_fob,
          supplier_revised_fob: quote.supplier_revised_fob,
          rf_final_fob: quote.rf_final_fob,
        });
      }
    }

    rankings.sort((a, b) => b.price - a.price);
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    const averageFob = prices.length > 0
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : undefined;

    skuStatuses.push({
      item_id: item.id,
      item_name: item.name,
      pack_size: item.pack_size,
      category: item.category,
      organic_flag: item.organic_flag,
      status,
      rankings,
      average_fob: averageFob,
    });
  }

  return skuStatuses;
}

export async function getSupplierStats(weekId: string): Promise<SupplierStats[]> {
  const [suppliers, quotes, items] = await Promise.all([
    fetchSuppliers(),
    fetchQuotes(weekId),
    fetchItems(),
  ]);

  const stats: SupplierStats[] = [];

  for (const supplier of suppliers) {
    const supplierQuotes = quotes.filter(q => q.supplier_id === supplier.id);
    const quotesWithPrices = supplierQuotes.filter(q => q.supplier_fob !== null);

    const avgFob = quotesWithPrices.length > 0
      ? quotesWithPrices.reduce((sum, q) => sum + (q.supplier_fob || 0), 0) / quotesWithPrices.length
      : 0;

    let lowestCount = 0;
    let highestCount = 0;

    for (const item of items) {
      const itemQuotes = quotes.filter(q => q.item_id === item.id && q.supplier_fob !== null);
      if (itemQuotes.length === 0) continue;

      const prices = itemQuotes.map(q => q.supplier_fob!);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const supplierQuote = itemQuotes.find(q => q.supplier_id === supplier.id);
      if (supplierQuote && supplierQuote.supplier_fob === minPrice) {
        lowestCount++;
      }
      if (supplierQuote && supplierQuote.supplier_fob === maxPrice) {
        highestCount++;
      }
    }

    stats.push({
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      skus_quoted: quotesWithPrices.length,
      average_fob: avgFob,
      lowest_price_count: lowestCount,
      highest_price_count: highestCount,
    });
  }

  return stats;
}

export async function resetAllData(): Promise<boolean> {
  try {
    // Clear all data tables
    await supabase.from('audit_log').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('quotes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('item_pricing_calculations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('week_item_volumes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('weeks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('suppliers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Upsert items to prevent duplicates (idempotent seeding)
    const itemsToUpsert = [
      { name: 'Strawberry', pack_size: '4×2 lb', category: 'strawberry', organic_flag: 'CONV', display_order: 1 },
      { name: 'Strawberry', pack_size: '8×1 lb', category: 'strawberry', organic_flag: 'ORG', display_order: 2 },
      { name: 'Blueberry', pack_size: '18 oz', category: 'blueberry', organic_flag: 'CONV', display_order: 3 },
      { name: 'Blueberry', pack_size: 'Pint', category: 'blueberry', organic_flag: 'ORG', display_order: 4 },
      { name: 'Blackberry', pack_size: '12ozx6', category: 'blackberry', organic_flag: 'CONV', display_order: 5 },
      { name: 'Blackberry', pack_size: '12ozx6', category: 'blackberry', organic_flag: 'ORG', display_order: 6 },
      { name: 'Raspberry', pack_size: '12ozx6', category: 'raspberry', organic_flag: 'CONV', display_order: 7 },
      { name: 'Raspberry', pack_size: '12ozx6', category: 'raspberry', organic_flag: 'ORG', display_order: 8 },
    ];
    
    // Helper function to normalize pack_size variants
    const normalizePackSize = (name: string, packSize: string, organicFlag: string): string => {
      const nameLower = name.toLowerCase();
      if (nameLower === 'strawberry' && organicFlag === 'CONV') {
        const packLower = packSize.toLowerCase().trim();
        // Match variants: "4x2lb", "4x2 lb", "4×2lb", "4×2 lb", "4 x 2 lb", etc.
        if (packLower.includes('4') && packLower.includes('2') && packLower.includes('lb') && !packLower.startsWith('2')) {
          return '4×2 lb';
        }
      } else if (nameLower === 'blackberry' || nameLower === 'raspberry') {
        const packLower = packSize.toLowerCase().trim();
        if (packLower.includes('12') && (packLower.includes('oz') || packLower.includes('ozx')) && packLower.includes('6')) {
          return '12ozx6';
        }
      }
      return packSize;
    };

    // Use find-or-create pattern for idempotent seeding with normalized pack_size matching
    for (const item of itemsToUpsert) {
      // First try exact match
      let { data: existing } = await supabase
        .from('items')
        .select('id, category, display_order, pack_size')
        .eq('name', item.name)
        .eq('pack_size', item.pack_size)
        .eq('organic_flag', item.organic_flag)
        .maybeSingle();
      
      // If no exact match, try to find by normalized pack_size
      if (!existing) {
        const normalizedTarget = normalizePackSize(item.name, item.pack_size, item.organic_flag);
        const { data: allMatching } = await supabase
          .from('items')
          .select('id, category, display_order, pack_size')
          .eq('name', item.name)
          .eq('organic_flag', item.organic_flag);
        
        if (allMatching) {
          existing = allMatching.find(i => normalizePackSize(i.name, i.pack_size, i.organic_flag) === normalizedTarget);
        }
      }
      
      if (existing) {
        // Update pack_size to normalized version if it's different
        const normalizedExisting = normalizePackSize(existing.name || item.name, existing.pack_size || item.pack_size, item.organic_flag);
        const normalizedTarget = normalizePackSize(item.name, item.pack_size, item.organic_flag);
        const needsPackSizeUpdate = normalizedExisting !== normalizedTarget && existing.pack_size !== normalizedTarget;
        
        // Only update if values actually differ (avoid unnecessary PATCH calls)
        const needsUpdate = existing.category !== item.category || existing.display_order !== item.display_order || needsPackSizeUpdate;
        if (needsUpdate) {
          const updateData: any = { category: item.category, display_order: item.display_order };
          if (needsPackSizeUpdate) {
            updateData.pack_size = normalizedTarget;
          }
          const { error } = await supabase
            .from('items')
            .update(updateData)
            .eq('id', existing.id);
          if (error) {
            logger.error(`Failed to update item ${existing.id}:`, error);
            // Continue - don't throw, just log
          }
        }
      } else {
        // Insert new item with normalized pack_size
        const normalizedPackSize = normalizePackSize(item.name, item.pack_size, item.organic_flag);
        const itemToInsert = { ...item, pack_size: normalizedPackSize };
        const { error } = await supabase.from('items').insert(itemToInsert);
        if (error) {
          logger.error(`Failed to insert item ${item.name}:`, error);
          // Continue - don't throw, just log
        }
      }
    }
    
    // Cleanup: delete any items that don't match the exact 8 SKUs
    const { data: allItems } = await supabase
      .from('items')
      .select('id, name, pack_size, organic_flag');
    
    if (allItems) {
      const validKeys = new Set(itemsToUpsert.map(i => `${i.name}|${i.pack_size}|${i.organic_flag}`));
      const itemsToDelete = allItems.filter(item => {
        const key = `${item.name}|${item.pack_size}|${item.organic_flag}`;
        return !validKeys.has(key);
      });
      
      if (itemsToDelete.length > 0) {
        const idsToDelete = itemsToDelete.map(i => i.id);
        await supabase.from('items').delete().in('id', idsToDelete);
      }
    }

    await supabase.from('suppliers').insert([
      { name: 'Fresh Farms Inc', email: 'supplier1@freshfarms.com' },
      { name: 'Berry Best Co', email: 'supplier2@berrybest.com' },
      { name: 'Organic Growers', email: 'supplier3@organicgrowers.com' },
      { name: 'Valley Fresh', email: 'supplier4@valleyfresh.com' },
      { name: 'Premium Produce', email: 'supplier5@premiumproduce.com' },
    ]);

    await supabase.from('weeks').insert([
      { week_number: 1, start_date: '2025-01-01', end_date: '2025-01-07', status: 'closed' },
      { week_number: 2, start_date: '2025-01-08', end_date: '2025-01-14', status: 'closed' },
      { week_number: 3, start_date: '2025-01-15', end_date: '2025-01-21', status: 'closed' },
      { week_number: 4, start_date: '2025-01-22', end_date: '2025-01-28', status: 'closed' },
      { week_number: 5, start_date: '2025-01-29', end_date: '2025-02-04', status: 'closed' },
      { week_number: 6, start_date: '2025-02-05', end_date: '2025-02-11', status: 'open' },
    ]);

    const [suppliers, items, weeks] = await Promise.all([
      fetchSuppliers(),
      fetchItems(),
      fetchWeeks(),
    ]);

    for (const week of weeks.filter(w => w.status === 'closed')) {
      for (const supplier of suppliers) {
        for (const item of items) {
          const supplierFob = Math.round((15 + Math.random() * 3) * 100) / 100;
          const supplierDlvd = Math.round((18 + Math.random() * 3) * 100) / 100;
          const rfCounterFob = Math.round((14.5 + Math.random() * 2.5) * 100) / 100;
          const response = Math.random() > 0.5 ? 'accept' : 'revise';
          const revisedFob = response === 'revise' ? Math.round((14.75 + Math.random() * 2) * 100) / 100 : null;
          const rfFinalFob = Math.round((14.5 + Math.random() * 2) * 100) / 100;

          await supabase.from('quotes').insert({
            week_id: week.id,
            item_id: item.id,
            supplier_id: supplier.id,
            supplier_fob: supplierFob,
            supplier_dlvd: supplierDlvd,
            rf_counter_fob: rfCounterFob,
            supplier_response: response,
            supplier_revised_fob: revisedFob,
            rf_final_fob: rfFinalFob,
          });
        }
      }
    }


    return true;
  } catch (error) {
    logger.error('Error resetting data:', error);
    return false;
  }
}


export async function fetchAnalytics(): Promise<{
  bySKU: AnalyticsBySKU[];
  bySupplier: AnalyticsBySupplier[];
}> {
  const [weeks, items, suppliers, quotes] = await Promise.all([
    fetchWeeks(),
    fetchItems(),
    fetchSuppliers(),
    supabase.from('quotes').select('*').then(res => res.data || []),
  ]);

  const closedWeeks = weeks.filter(w => w.status === 'closed');
  const closedWeekIds = new Set(closedWeeks.map(w => w.id));
  const closedQuotes = quotes.filter(q => closedWeekIds.has(q.week_id));

  const bySKU: AnalyticsBySKU[] = [];

  for (const item of items) {
    for (const supplier of suppliers) {
      const supplierQuotes = closedQuotes.filter(
        q => q.item_id === item.id && q.supplier_id === supplier.id
      );

      if (supplierQuotes.length === 0) continue;

      const prices: { price: number; week: Week }[] = [];

      for (const quote of supplierQuotes) {
        const price = quote.rf_final_fob || quote.supplier_revised_fob || quote.supplier_fob;
        const week = closedWeeks.find(w => w.id === quote.week_id);
        if (price !== null && price !== undefined && week) {
          prices.push({ price, week });
        }
      }

      if (prices.length === 0) continue;

      const avgFob = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
      const sorted = prices.sort((a, b) => a.price - b.price);
      const lowest = sorted[0];
      const highest = sorted[sorted.length - 1];

      bySKU.push({
        sku_name: item.name,
        organic_flag: item.organic_flag,
        supplier_name: supplier.name,
        avg_fob: avgFob,
        lowest_fob: lowest.price,
        lowest_week: lowest.week.week_number,
        highest_fob: highest.price,
        highest_week: highest.week.week_number,
      });
    }
  }

  const bySupplier: AnalyticsBySupplier[] = [];

  for (const supplier of suppliers) {
    const supplierQuotes = closedQuotes.filter(q => q.supplier_id === supplier.id);
    const prices: number[] = [];

    for (const quote of supplierQuotes) {
      const price = quote.rf_final_fob || quote.supplier_revised_fob || quote.supplier_fob;
      if (price !== null && price !== undefined) {
        prices.push(price);
      }
    }

    if (prices.length === 0) continue;

    const avgFob = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    let timesCheapest = 0;
    let timesExpensive = 0;

    for (const item of items) {
      for (const week of closedWeeks) {
        const itemWeekQuotes = closedQuotes.filter(
          q => q.item_id === item.id && q.week_id === week.id
        );

        const pricesForComparison: { supplier_id: string; price: number }[] = [];
        for (const quote of itemWeekQuotes) {
          const price = quote.rf_final_fob || quote.supplier_revised_fob || quote.supplier_fob;
          if (price !== null && price !== undefined) {
            pricesForComparison.push({ supplier_id: quote.supplier_id, price });
          }
        }

        if (pricesForComparison.length === 0) continue;

        const sorted = pricesForComparison.sort((a, b) => a.price - b.price);
        const cheapest = sorted[0];
        const expensive = sorted[sorted.length - 1];

        if (cheapest.supplier_id === supplier.id) timesCheapest++;
        if (expensive.supplier_id === supplier.id) timesExpensive++;
      }
    }

    bySupplier.push({
      supplier_name: supplier.name,
      avg_fob: avgFob,
      times_cheapest: timesCheapest,
      times_expensive: timesExpensive,
    });
  }

  return { bySKU, bySupplier };
}

export async function getQuotesForItem(weekId: string, itemId: string): Promise<{
  supplier_name: string;
  supplier_fob: number | null;
  rf_counter_fob: number | null;
  supplier_revised_fob: number | null;
  rf_final_fob: number | null;
  final_price: number | null;
}[]> {
  const [quotes, suppliers] = await Promise.all([
    fetchQuotes(weekId),
    fetchSuppliers(),
  ]);

  const itemQuotes = quotes.filter(q => q.item_id === itemId);
  const result = [];

  for (const quote of itemQuotes) {
    const supplier = suppliers.find(s => s.id === quote.supplier_id);
    if (!supplier) continue;

    const finalPrice = quote.rf_final_fob || quote.supplier_revised_fob || quote.supplier_fob;

    result.push({
      supplier_name: supplier.name,
      supplier_fob: quote.supplier_fob ?? null,
      rf_counter_fob: quote.rf_counter_fob ?? null,
      supplier_revised_fob: quote.supplier_revised_fob ?? null,
      rf_final_fob: quote.rf_final_fob ?? null,
      final_price: finalPrice ?? null,
    });
  }

  result.sort((a, b) => {
    const priceA = a.final_price ?? -Infinity;
    const priceB = b.final_price ?? -Infinity;
    return priceB - priceA;
  });

  return result;
}

export async function fetchVolumeNeeds(weekId: string): Promise<WeekItemVolume[]> {
  try {
    // Select specific columns to avoid issues if locked column doesn't exist yet
    const { data, error } = await supabase
      .from('week_item_volumes')
      .select('id, week_id, item_id, volume_needed, created_at, updated_at, locked')
      .eq('week_id', weekId);

    if (error) {
      // If error is about locked column, try again without it
      if (error.code === 'PGRST204' || error.message?.includes('locked')) {
        const { data: dataWithoutLocked, error: error2 } = await supabase
          .from('week_item_volumes')
          .select('id, week_id, item_id, volume_needed, created_at, updated_at')
          .eq('week_id', weekId);
        
        if (error2) {
          logger.error('Error fetching volume needs:', error2);
          console.error('Error fetching volume needs:', error2.message);
          return [];
        }
        
        // Return records WITHOUT locked property (don't add locked: false)
        // This allows the UI to detect that the column doesn't exist
        const result = (dataWithoutLocked || []) as WeekItemVolume[];
        console.log(`Volume needs loaded: ${result.length} items`);
        return result;
      }
      logger.error('Error fetching volume needs:', error);
      console.error('Error fetching volume needs:', error.message);
      return [];
    }

  // If no rows exist, ensure they're created (backward compatibility)
  if (!data || data.length === 0) {
    const { data: items } = await supabase.from('items').select('id');
    if (items && items.length > 0) {
      const volumeNeeds = items.map(item => ({
        week_id: weekId,
        item_id: item.id,
        volume_needed: 0,
        locked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      await supabase.from('week_item_volumes').upsert(volumeNeeds, {
        onConflict: 'week_id,item_id'
      });
      // Return the newly created rows
      const { data: newData } = await supabase
        .from('week_item_volumes')
        .select('*')
        .eq('week_id', weekId);
      return newData || [];
    }
  }

  return data || [];
}

export async function updateVolumeNeeded(
  weekId: string,
  itemId: string,
  volumeNeeded: number
): Promise<boolean> {
  const { error } = await supabase
    .from('week_item_volumes')
    .upsert({
      week_id: weekId,
      item_id: itemId,
      volume_needed: volumeNeeded,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'week_id,item_id'
    });

  if (error) {
    logger.error('Error updating volume needed:', error);
    return false;
  }

  return true;
}

export async function updateSupplierVolumeApproval(
  quoteId: string,
  approval: 'pending' | 'accepted' | 'revised',
  notes?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('quotes')
    .update({
      supplier_volume_approval: approval,
      supplier_volume_notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId);

  if (error) {
    logger.error('Error updating supplier volume approval:', error);
    return false;
  }

  return true;
}

export async function saveDraftAllocation(
  weekId: string,
  itemId: string,
  supplierId: string,
  draftedVolume: number
): Promise<boolean> {
  logger.debug('Saving draft allocation:', { weekId, itemId, supplierId, draftedVolume });

  const draftPayload = {
    week_id: weekId,
    item_id: itemId,
    supplier_id: supplierId,
    drafted_volume: draftedVolume,
    updated_at: new Date().toISOString(),
  };
  logger.debug('Draft payload:', draftPayload);

  const { data: draftData, error: draftError } = await supabase
    .from('draft_allocations')
    .upsert(draftPayload, {
      onConflict: 'week_id,item_id,supplier_id',
      ignoreDuplicates: false
    })
    .select();

  if (draftError) {
    logger.error('Error saving draft allocation:', draftError);
    return false;
  }

  if (!draftData || draftData.length === 0) {
    logger.error('Validation failed: Draft allocation upsert returned no data');
    return false;
  }

  logger.debug('Draft allocation upserted:', draftData);

  const awardedVolume = draftedVolume === 0 ? null : draftedVolume;
  const quotePayload = {
    week_id: weekId,
    item_id: itemId,
    supplier_id: supplierId,
    awarded_volume: awardedVolume,
    updated_at: new Date().toISOString(),
  };
  logger.debug('Quote payload:', quotePayload);

  const { data: quoteData, error: quoteError } = await supabase
    .from('quotes')
    .upsert(quotePayload, {
      onConflict: 'week_id,item_id,supplier_id',
      ignoreDuplicates: false
    })
    .select();

  if (quoteError) {
    logger.error('Error upserting quote:', quoteError);
    return false;
  }

  if (!quoteData || quoteData.length === 0) {
    logger.error('Validation failed: Quote upsert returned no data');
    return false;
  }

  logger.debug('Quote upserted, save complete:', quoteData);
  return true;
}

export async function fetchDraftAllocations(weekId: string): Promise<{
  week_id: string;
  item_id: string;
  supplier_id: string;
  drafted_volume: number;
}[]> {
  const { data, error } = await supabase
    .from('draft_allocations')
    .select('*')
    .eq('week_id', weekId);

  if (error) {
    logger.error('Error fetching draft allocations:', error);
    return [];
  }

  return data || [];
}

export async function finalizePricingForWeek(weekId: string, userName: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First, check existing quotes and their pricing data
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('id, rf_final_fob, supplier_fob, rf_counter_fob, supplier_response, supplier_revised_fob')
      .eq('week_id', weekId);

    if (quotesError) {
      logger.error('Error checking quotes:', quotesError);
      return { success: false, error: 'Failed to validate pricing data' };
    }

    const quotesWithFinalPricing = quotes?.filter(q => q.rf_final_fob !== null && q.rf_final_fob !== undefined) || [];
    
    // If no quotes have rf_final_fob set, try to auto-finalize based on available pricing data
    if (quotesWithFinalPricing.length === 0) {
      const quotesToAutoFinalize = quotes?.filter(q => 
        q.rf_final_fob === null && 
        q.supplier_fob !== null && 
        q.supplier_fob > 0
      ) || [];
      
      if (quotesToAutoFinalize.length > 0) {
        logger.debug(`Auto-finalizing ${quotesToAutoFinalize.length} quotes for week ${weekId}`);
        
        // Auto-finalize quotes with supplier prices
        for (const quote of quotesToAutoFinalize) {
          // Determine final price based on priority:
          // 1. Supplier revised price (highest priority)
          // 2. Supplier accepted counter
          // 3. RF counter (if set, RF confirmed this price)
          // 4. Supplier's original price (RF accepts initial quote)
          const finalPrice = quote.supplier_revised_fob || 
                            (quote.supplier_response === 'accept' && quote.rf_counter_fob ? quote.rf_counter_fob : null) ||
                            quote.rf_counter_fob || 
                            quote.supplier_fob;
          
          if (finalPrice && finalPrice > 0) {
            const { error: updateError } = await supabase
              .from('quotes')
              .update({ 
                rf_final_fob: finalPrice,
                updated_at: new Date().toISOString()
              })
              .eq('id', quote.id);
            
            if (updateError) {
              logger.error(`Error auto-finalizing quote ${quote.id}:`, updateError);
            }
          }
        }
        
        // Re-check after auto-finalization
        const { data: updatedQuotes, error: recheckError } = await supabase
          .from('quotes')
          .select('id, rf_final_fob')
          .eq('week_id', weekId);
        
        if (recheckError) {
          logger.error('Error rechecking quotes:', recheckError);
          return { success: false, error: 'Failed to validate pricing after auto-finalization' };
        }
        
        const updatedFinalPricing = updatedQuotes?.filter(q => 
          q.rf_final_fob !== null && q.rf_final_fob !== undefined
        ) || [];
        
        if (updatedFinalPricing.length === 0) {
          return { success: false, error: 'Cannot finalize: No quotes have final pricing set. Please set rf_final_fob for at least one quote, or ensure supplier prices are entered.' };
        }
        
        logger.debug(`Successfully auto-finalized ${updatedFinalPricing.length} quotes`);
      } else {
        return { success: false, error: 'Cannot finalize: No quotes have final pricing set. Please set rf_final_fob for at least one quote, or ensure supplier prices are entered.' };
      }
    }

    // Update week status (only use columns that exist in schema)
    const { error: updateError } = await supabase
      .from('weeks')
      .update({
        status: 'finalized',
      })
      .eq('id', weekId);

    if (updateError) {
      logger.error('Error finalizing pricing - update failed:', updateError);
      return { success: false, error: `Failed to finalize week: ${updateError.message}` };
    }

    // Verify the update actually worked by fetching the week
    const { data: verifyWeek, error: verifyError } = await supabase
      .from('weeks')
      .select('id, status')
      .eq('id', weekId)
      .single();

    if (verifyError) {
      logger.error('Error verifying week status update:', verifyError);
      return { success: false, error: `Week updated but verification failed: ${verifyError.message}` };
    }

    if (verifyWeek?.status !== 'finalized') {
      logger.error(`Week status update failed - expected 'finalized', got '${verifyWeek?.status}'`);
      return { success: false, error: `Week status update failed. Status is still '${verifyWeek?.status}'` };
    }

    logger.debug(`Successfully finalized week ${weekId} - status is now '${verifyWeek.status}'`);
    return { success: true };
  } catch (error: any) {
    logger.error('Error in finalizePricingForWeek:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
}

export async function finalizeWeekAllocations(weekId: string, userName: string): Promise<boolean> {
  try {
    const { data: quotes } = await supabase
      .from('quotes')
      .select('id, supplier_volume_accepted')
      .eq('week_id', weekId);

    if (quotes) {
      for (const quote of quotes) {
        if (quote.supplier_volume_accepted && quote.supplier_volume_accepted > 0) {
          await supabase
            .from('quotes')
            .update({
              awarded_volume: quote.supplier_volume_accepted,
              updated_at: new Date().toISOString()
            })
            .eq('id', quote.id);
        }
      }
    }

    const { error } = await supabase
      .from('weeks')
      .update({
        status: 'closed',
      })
      .eq('id', weekId);

    if (error) {
      logger.error('Error finalizing week allocations:', error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error in finalizeWeekAllocations:', error);
    return false;
  }
}

export async function submitAllocationsToSuppliers(weekId: string, userName: string): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    logger.debug('=== SUBMIT ALLOCATIONS TO SUPPLIERS ===');
    logger.debug(`Week ID: ${weekId}`);

    // Validation: Check week status
    const { data: week, error: weekFetchError } = await supabase
      .from('weeks')
      .select('status')
      .eq('id', weekId)
      .single();

    if (weekFetchError || !week) {
      return { success: false, error: 'Week not found' };
    }

    // Allow submitting allocations when week is 'open' or 'finalized'
    // Week can be 'open' for ongoing allocation process
    if (week.status === 'closed') {
      return { success: false, error: `Week is closed and cannot accept new allocations. Current status: ${week.status}` };
    }

    // Get all quotes with awarded_volume for this week
    // Volume Lifecycle: awarded_volume (draft) → offered_volume (sent to supplier) → supplier_volume_accepted (response) → awarded_volume (final)
    const { data: quotesWithVolume, error: fetchError } = await supabase
      .from('quotes')
      .select('id, item_id, supplier_id, awarded_volume')
      .eq('week_id', weekId)
      .not('awarded_volume', 'is', null)
      .gt('awarded_volume', 0);

    logger.debug(`Quotes with volume: ${quotesWithVolume?.length || 0}`);

    if (fetchError) {
      logger.error('Error fetching quotes with awarded volume:', fetchError);
      return { success: false, error: `Database error: ${fetchError.message}` };
    }

    if (!quotesWithVolume || quotesWithVolume.length === 0) {
      logger.warn('No awarded volumes found for this week');
      return { success: false, error: 'No volume allocations found. Please allocate volume to at least one supplier before sending.' };
    }

    logger.debug(`Found ${quotesWithVolume.length} quotes with awarded volume`);
    
    // Log partial submission details for debugging
    const supplierIds = new Set(quotesWithVolume.map(q => q.supplier_id));
    const itemIds = new Set(quotesWithVolume.map(q => q.item_id));
    logger.debug(`Partial submission: ${supplierIds.size} supplier(s), ${itemIds.size} SKU(s)`);

    // Copy awarded_volume to offered_volume using database function (bypasses schema cache)
    // This transitions volume from "draft award" to "offer sent to supplier"
    // RPC also resets supplier response fields to allow fresh responses
    // NOTE: Only quotes that exist with awarded_volume > 0 will be updated (defensive for partial submissions)
    const { error: updateError, data: rpcData } = await supabase
      .rpc('submit_allocations_to_suppliers', { week_id_param: weekId });

    let directUpdateSuccess = false;
    let directUpdateCount = 0;

    // ALWAYS use direct update as primary method (RPC may not exist or may fail silently)
    // Direct update is more reliable and gives better error feedback
    logger.debug('Updating quotes directly (bypassing RPC for reliability)');
    
    // Direct update - update all quotes that have awarded_volume
    for (const quote of quotesWithVolume) {
      const { error: directError } = await supabase
        .from('quotes')
        .update({
          offered_volume: quote.awarded_volume,
          supplier_volume_approval: 'pending',
          supplier_volume_response: null,
          supplier_volume_accepted: null,
          supplier_volume_response_notes: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id);
      
      if (directError) {
        logger.error(`Error updating quote ${quote.id} (week_id: ${weekId}, supplier_id: ${quote.supplier_id}, item_id: ${quote.item_id}):`, directError);
      } else {
        directUpdateCount++;
        logger.debug(`✓ Updated quote ${quote.id}: awarded_volume ${quote.awarded_volume} → offered_volume ${quote.awarded_volume}`);
      }
    }
    
    if (directUpdateCount === quotesWithVolume.length) {
      directUpdateSuccess = true;
      logger.debug(`✓ Direct update: All ${directUpdateCount} quotes updated successfully`);
    } else {
      logger.warn(`Direct update: Only ${directUpdateCount} of ${quotesWithVolume.length} quotes updated`);
    }

    // Log RPC result for debugging but don't rely on it
    if (updateError) {
      logger.warn('RPC error (using direct update instead):', updateError);
    } else if (rpcData) {
      logger.debug('RPC also executed:', rpcData);
    }

    if (!directUpdateSuccess && directUpdateCount === 0) {
      logger.error('Direct update failed for all quotes');
      return { success: false, error: 'Failed to update any quotes with offered_volume. No allocations were sent to suppliers.' };
    }

    logger.debug(`✓ Successfully updated ${directUpdateCount} quotes with offered_volume`);

    // Step 3: Verify allocations were written (check that offered_volume exists)
    // Supplier dashboard reads from quotes.offered_volume where week_id matches and offered_volume > 0
    // Wait a brief moment for database to sync
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const { data: verifyQuotes, error: verifyError } = await supabase
      .from('quotes')
      .select('id, offered_volume, supplier_id, item_id, awarded_volume')
      .eq('week_id', weekId)
      .not('offered_volume', 'is', null)
      .gt('offered_volume', 0);

    if (verifyError) {
      logger.error('Error verifying allocations:', verifyError);
      return { success: false, error: `Failed to verify allocations were written: ${verifyError.message}` };
    }

    const verifiedCount = verifyQuotes?.length || 0;
    logger.debug(`Verification: Found ${verifiedCount} quotes with offered_volume > 0 for week ${weekId}`);
    
    // Log detailed verification info for debugging
    if (verifyQuotes && verifyQuotes.length > 0) {
      const supplierIds = new Set(verifyQuotes.map(q => q.supplier_id));
      logger.debug(`Verification details: ${supplierIds.size} supplier(s) with allocations:`, Array.from(supplierIds));
      verifyQuotes.slice(0, 5).forEach(q => {
        logger.debug(`  Quote ${q.id}: supplier_id=${q.supplier_id}, item_id=${q.item_id}, offered_volume=${q.offered_volume}`);
      });
    }

    if (verifiedCount === 0) {
      logger.error('Verification failed: No quotes with offered_volume found after write');
      logger.error(`Expected ${quotesWithVolume.length} quotes to be updated, but found 0`);
      // Try to find what went wrong - check if quotes still have awarded_volume but not offered_volume
      const { data: quotesWithAwarded } = await supabase
        .from('quotes')
        .select('id, awarded_volume, offered_volume, supplier_id, item_id')
        .eq('week_id', weekId)
        .not('awarded_volume', 'is', null)
        .gt('awarded_volume', 0)
        .limit(5);
      
      if (quotesWithAwarded && quotesWithAwarded.length > 0) {
        logger.error('Quotes with awarded_volume but missing offered_volume:', quotesWithAwarded.map(q => ({
          id: q.id,
          supplier_id: q.supplier_id,
          item_id: q.item_id,
          awarded_volume: q.awarded_volume,
          offered_volume: q.offered_volume
        })));
      }
      
      return { success: false, error: 'Allocation write verification failed: No quotes with offered_volume found. Data may not have been saved correctly. Suppliers will not see allocations on their dashboard.' };
    }

    if (verifiedCount < quotesWithVolume.length) {
      logger.warn(`Verification: Expected ${quotesWithVolume.length} quotes with offered_volume, found ${verifiedCount}`);
      // Continue but log warning - partial submission is OK
    }

    // Step 4: Mark week as allocation submitted (supplier dashboard checks this flag)
    const { error: weekError } = await supabase
      .from('weeks')
      .update({
        allocation_submitted: true,
        allocation_submitted_at: new Date().toISOString(),
        allocation_submitted_by: userName,
      })
      .eq('id', weekId);

    if (weekError) {
      logger.error('Error marking week as submitted:', weekError);
      return { success: false, error: `Failed to mark week as submitted: ${weekError.message}` };
    }

    // Step 5: Final verification - check that week.allocation_submitted is true
    const { data: verifyWeek, error: verifyWeekError } = await supabase
      .from('weeks')
      .select('allocation_submitted')
      .eq('id', weekId)
      .maybeSingle();

    if (verifyWeekError || !verifyWeek?.allocation_submitted) {
      logger.error('Week submission verification failed:', verifyWeekError || 'allocation_submitted is false');
      return { success: false, error: 'Week submission verification failed. Suppliers may not see allocations.' };
    }

    logger.debug(`✓ Successfully submitted allocations: ${verifiedCount} quotes with offered_volume > 0, week.allocation_submitted = true`);
    return { success: true, count: verifiedCount };
  } catch (error: any) {
    logger.error('Error in submitAllocationsToSuppliers:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
}

export async function fetchItemPricingCalculations(weekId: string): Promise<{
  id: string;
  week_id: string;
  item_id: string;
  avg_price: number;
  rebate: number;
  margin: number;
  freight: number;
  dlvd_price: number;
}[]> {
  const { data, error } = await supabase
    .from('item_pricing_calculations')
    .select('*')
    .eq('week_id', weekId);

  if (error) {
    logger.error('Error fetching pricing calculations:', error);
    return [];
  }

  return data || [];
}

export async function fetchLastWeekDeliveredPrices(currentWeekNumber: number): Promise<Map<string, number>> {
  try {
    // Get the previous week (week_number - 1)
    const { data: lastWeek, error: weekError } = await supabase
      .from('weeks')
      .select('id, week_number')
      .eq('week_number', currentWeekNumber - 1)
      .eq('status', 'finalized')
      .maybeSingle();

    if (weekError || !lastWeek) {
      logger.debug('No previous finalized week found');
      return new Map();
    }

    // Get delivered prices from item_pricing_calculations for that week
    const { data: pricingData, error: pricingError } = await supabase
      .from('item_pricing_calculations')
      .select('item_id, dlvd_price')
      .eq('week_id', lastWeek.id)
      .not('dlvd_price', 'is', null);

    if (pricingError) {
      logger.error('Error fetching last week delivered prices:', pricingError);
      return new Map();
    }

    const priceMap = new Map<string, number>();
    pricingData?.forEach(p => {
      if (p.dlvd_price && p.dlvd_price > 0) {
        priceMap.set(p.item_id, p.dlvd_price);
      }
    });

    return priceMap;
  } catch (error) {
    logger.error('Error in fetchLastWeekDeliveredPrices:', error);
    return new Map();
  }
}

export async function updateItemPricingCalculation(
  weekId: string,
  itemId: string,
  calculations: {
    avg_price?: number;
    rebate?: number;
    margin?: number;
    freight?: number;
    dlvd_price?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('item_pricing_calculations')
    .upsert({
      week_id: weekId,
      item_id: itemId,
      ...calculations,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'week_id,item_id'
    });

  if (error) {
    logger.error('Error updating pricing calculation:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }

  return { success: true };
}

export async function updateOfferedVolume(quoteId: string, offeredVolume: number): Promise<boolean> {
  const { error } = await supabase
    .from('quotes')
    .update({
      offered_volume: offeredVolume,
      updated_at: new Date().toISOString()
    })
    .eq('id', quoteId);

  if (error) {
    logger.error('Error updating offered volume:', error);
    return false;
  }

  return true;
}

export async function updateSupplierVolumeResponse(
  quoteId: string,
  response: 'accept' | 'update' | 'decline',
  acceptedVolume: number,
  notes?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('quotes')
    .update({
      supplier_volume_response: response,
      supplier_volume_accepted: acceptedVolume,
      supplier_volume_response_notes: notes,
      supplier_volume_approval: response === 'accept' ? 'accepted' : response === 'update' ? 'revised' : 'pending',
      updated_at: new Date().toISOString()
    })
    .eq('id', quoteId);

  if (error) {
    logger.error('Error updating supplier volume response:', error);
    return false;
  }

  return true;
}

export async function fetchPrevious3WeekVolumeAverages(currentWeekNumber: number): Promise<Map<string, number>> {
  const { data: weeks, error: weeksError } = await supabase
    .from('weeks')
    .select('id, week_number')
    .gte('week_number', currentWeekNumber - 3)
    .lt('week_number', currentWeekNumber)
    .order('week_number', { ascending: false })
    .limit(3);

  if (weeksError || !weeks || weeks.length === 0) {
    logger.error('Error fetching previous weeks:', weeksError);
    return new Map();
  }

  const weekIds = weeks.map(w => w.id);

  const { data: drafts, error: draftsError } = await supabase
    .from('draft_allocations')
    .select('item_id, drafted_volume')
    .in('week_id', weekIds);

  if (draftsError || !drafts) {
    logger.error('Error fetching draft allocations:', draftsError);
    return new Map();
  }

  const volumesByItem = new Map<string, number[]>();

  drafts.forEach(draft => {
    if (!volumesByItem.has(draft.item_id)) {
      volumesByItem.set(draft.item_id, []);
    }
    if (draft.drafted_volume > 0) {
      volumesByItem.get(draft.item_id)!.push(draft.drafted_volume);
    }
  });

  const averages = new Map<string, number>();
  volumesByItem.forEach((volumes, itemId) => {
    if (volumes.length > 0) {
      const sum = volumes.reduce((acc, v) => acc + v, 0);
      const avg = Math.round(sum / volumes.length);
      averages.set(itemId, avg);
    }
  });

  return averages;
}

/**
 * Fetch historical supplier allocation shares for a specific item
 * Returns allocation percentages per supplier based on last N weeks
 */
export async function fetchHistoricalSupplierShares(
  itemId: string,
  currentWeekNumber: number,
  lookbackWeeks: number = 10
): Promise<Array<{ supplierId: string; sharePercent: number; averageVolume: number }>> {
  try {
    // Get previous weeks (closed or finalized)
    const { data: weeks, error: weeksError } = await supabase
      .from('weeks')
      .select('id, week_number')
      .in('status', ['finalized', 'closed'])
      .lt('week_number', currentWeekNumber)
      .order('week_number', { ascending: false })
      .limit(lookbackWeeks);

    if (weeksError || !weeks || weeks.length === 0) {
      logger.debug(`No historical weeks found for item ${itemId}`);
      return [];
    }

    const weekIds = weeks.map(w => w.id);

    // Get all quotes with awarded_volume for this item across historical weeks
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('supplier_id, awarded_volume')
      .eq('item_id', itemId)
      .in('week_id', weekIds)
      .not('awarded_volume', 'is', null)
      .gt('awarded_volume', 0);

    if (quotesError || !quotes) {
      logger.error('Error fetching historical quotes:', quotesError);
      return [];
    }

    // Calculate totals per supplier
    const supplierTotals = new Map<string, number>();
    const supplierCounts = new Map<string, number>();
    let totalVolume = 0;

    quotes.forEach(quote => {
      const volume = quote.awarded_volume || 0;
      if (volume > 0) {
        const supplierId = quote.supplier_id;
        supplierTotals.set(supplierId, (supplierTotals.get(supplierId) || 0) + volume);
        supplierCounts.set(supplierId, (supplierCounts.get(supplierId) || 0) + 1);
        totalVolume += volume;
      }
    });

    if (totalVolume === 0) {
      return [];
    }

    // Calculate shares
    const shares: Array<{ supplierId: string; sharePercent: number; averageVolume: number }> = [];
    supplierTotals.forEach((total, supplierId) => {
      const count = supplierCounts.get(supplierId) || 1;
      shares.push({
        supplierId,
        sharePercent: (total / totalVolume) * 100,
        averageVolume: total / count,
      });
    });

    return shares.sort((a, b) => b.sharePercent - a.sharePercent);
  } catch (error) {
    logger.error('Error in fetchHistoricalSupplierShares:', error);
    return [];
  }
}

/**
 * Lock a specific SKU for a week (makes allocation read-only)
 * Uses UPSERT to ensure row exists, then verifies locked state
 */
export async function lockSKU(weekId: string, itemId: string): Promise<boolean> {
  try {
    // First, get existing volume_needed if row exists
    const { data: existing } = await supabase
      .from('week_item_volumes')
      .select('volume_needed')
      .eq('week_id', weekId)
      .eq('item_id', itemId)
      .maybeSingle();
    
    const volumeNeeded = existing?.volume_needed || 0;
    
    // Step 1: UPSERT to ensure row exists with locked=true, preserving volume_needed
    const { error: upsertError } = await supabase
      .from('week_item_volumes')
      .upsert({
        week_id: weekId,
        item_id: itemId,
        volume_needed: volumeNeeded,
        locked: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'week_id,item_id'
      });

    if (upsertError) {
      // If locked column doesn't exist, try without it
      if (upsertError.code === 'PGRST204' || upsertError.message?.includes('locked')) {
        const { error: upsertWithoutLocked } = await supabase
          .from('week_item_volumes')
          .upsert({
            week_id: weekId,
            item_id: itemId,
            volume_needed: volumeNeeded,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'week_id,item_id'
          });
        
        if (upsertWithoutLocked) {
          logger.error('Error upserting week_item_volumes (without locked):', upsertWithoutLocked);
          return false;
        }
        // Row exists but locked column doesn't - return true for UI state
        return true;
      }
      logger.error('Error upserting week_item_volumes:', upsertError);
      return false;
    }

    // Step 2: Verify locked state was written
    const { data: verifyData, error: verifyError } = await supabase
      .from('week_item_volumes')
      .select('locked')
      .eq('week_id', weekId)
      .eq('item_id', itemId)
      .maybeSingle();

    if (verifyError) {
      // If locked column doesn't exist in read, that's OK - row exists
      if (verifyError.code === 'PGRST204' || verifyError.message?.includes('locked')) {
        return true;
      }
      logger.error('Error verifying lock state:', verifyError);
      return false;
    }

    // Verify locked is true - only return true if DB reflects requested state
    if (!verifyData) {
      logger.error('Lock verification failed: no data returned', { weekId, itemId });
      return false;
    }
    const isLocked = verifyData.locked === true || verifyData.locked === 1 || verifyData.locked === 'true';
    if (!isLocked) {
      logger.error('Lock verification failed: locked state is not true', { weekId, itemId, locked: verifyData.locked });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error in lockSKU:', error);
    return false;
  }
}

/**
 * Unlock a specific SKU for a week
 * Uses UPSERT to ensure row exists, then verifies unlocked state
 */
export async function unlockSKU(weekId: string, itemId: string): Promise<boolean> {
  try {
    // First, get existing volume_needed if row exists
    const { data: existing } = await supabase
      .from('week_item_volumes')
      .select('volume_needed')
      .eq('week_id', weekId)
      .eq('item_id', itemId)
      .maybeSingle();
    
    const volumeNeeded = existing?.volume_needed || 0;
    
    // Step 1: UPSERT to ensure row exists with locked=false, preserving volume_needed
    const { error: upsertError } = await supabase
      .from('week_item_volumes')
      .upsert({
        week_id: weekId,
        item_id: itemId,
        volume_needed: volumeNeeded,
        locked: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'week_id,item_id'
      });

    if (upsertError) {
      // If locked column doesn't exist, try without it (same as lockSKU)
      if (upsertError.code === 'PGRST204' || upsertError.message?.includes('locked') || upsertError.message?.includes('schema cache')) {
        const { error: upsertWithoutLocked } = await supabase
          .from('week_item_volumes')
          .upsert({
            week_id: weekId,
            item_id: itemId,
            volume_needed: volumeNeeded,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'week_id,item_id'
          });
        
        if (upsertWithoutLocked) {
          logger.error('Error upserting week_item_volumes (without locked):', upsertWithoutLocked);
          return false;
        }
        // Row exists but locked column doesn't - return true for UI state (same as lockSKU)
        logger.debug('unlockSKU: locked column does not exist, unlock succeeded (row exists)');
        return true;
      }
      logger.error('Error upserting week_item_volumes:', upsertError);
      return false;
    }

    // Step 2: Verify unlocked state was written (only if column exists)
    const { data: verifyData, error: verifyError } = await supabase
      .from('week_item_volumes')
      .select('locked')
      .eq('week_id', weekId)
      .eq('item_id', itemId)
      .maybeSingle();

    if (verifyError) {
      // If locked column doesn't exist in read, that's OK - row exists, unlock succeeded
      if (verifyError.code === 'PGRST204' || verifyError.message?.includes('locked') || verifyError.message?.includes('schema cache')) {
        logger.debug('unlockSKU: locked column does not exist in read, unlock succeeded');
        return true;
      }
      logger.error('Error verifying unlock state:', verifyError);
      return false;
    }

    // Verify locked is false - only return true if DB reflects requested state
    if (!verifyData) {
      logger.error('Unlock verification failed: no data returned', { weekId, itemId });
      return false;
    }
    if ('locked' in verifyData) {
      const isUnlocked = verifyData.locked === false || verifyData.locked === 0 || verifyData.locked === 'false' || verifyData.locked === null;
      if (!isUnlocked) {
        logger.error('Unlock verification failed: locked state is not false', { weekId, itemId, locked: verifyData.locked });
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.error('Error in unlockSKU:', error);
    return false;
  }
}

/**
 * Reset all allocations for a week: clear awarded volumes and unlock all SKUs
 */
export async function resetWeekAllocations(weekId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Clear all awarded_volume for this week
    const { error: quotesError } = await supabase
      .from('quotes')
      .update({
        awarded_volume: null,
        updated_at: new Date().toISOString()
      })
      .eq('week_id', weekId);

    if (quotesError) {
      logger.error('Error clearing awarded volumes:', quotesError);
      return { success: false, error: `Failed to clear allocations: ${quotesError.message}` };
    }

    // Unlock all SKUs for this week (handle missing locked column gracefully)
    const { error: unlockError } = await supabase
      .from('week_item_volumes')
      .update({
        locked: false,
        updated_at: new Date().toISOString()
      })
      .eq('week_id', weekId);

    if (unlockError) {
      // If locked column doesn't exist, that's OK - just log and continue
      if (unlockError.code === 'PGRST204' || unlockError.message?.includes('locked') || unlockError.message?.includes('schema cache')) {
        logger.warn('locked column does not exist - skipping unlock step. Run ADD_LOCKED_COLUMN.sql to enable.');
        // Continue - this is not a critical failure for reset
      } else {
        logger.error('Failed to unlock SKUs:', unlockError);
        return { success: false, error: `Failed to unlock SKUs: ${unlockError.message}` };
      }
    }

    logger.debug(`✅ Reset allocations for week ${weekId}`);
    return { success: true };
  } catch (error: any) {
    logger.error('Error resetting week allocations:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Delete all 2lb strawberry SKU data from all weeks
 * This removes the SKU itself and all associated quotes, volumes, and pricing calculations
 */
export async function delete2lbStrawberryData(): Promise<{ success: boolean; message: string; deletedCounts?: { items: number; quotes: number; volumes: number; pricing: number } }> {
  try {
    // Find all 2lb strawberry items
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id, name, pack_size')
      .ilike('name', '%strawberry%')
      // FIXED 400 ERROR: Use separate queries instead of invalid .or() syntax
      // Fetch all matching items and filter client-side
      .ilike('pack_size', '%2lb%');

    if (itemsError) {
      logger.error('Error finding 2lb strawberry items:', itemsError);
      return { success: false, message: `Failed to find items: ${itemsError.message}` };
    }

    if (!items || items.length === 0) {
      return { success: true, message: 'No 2lb strawberry items found to delete' };
    }

    const itemIds = items.map(item => item.id);
    logger.debug(`Found ${itemIds.length} 2lb strawberry items to delete:`, items.map(i => `${i.name} ${i.pack_size}`));

    // Delete quotes for these items
    const { error: quotesError, count: quotesCount } = await supabase
      .from('quotes')
      .delete()
      .in('item_id', itemIds);

    if (quotesError) {
      logger.error('Error deleting quotes:', quotesError);
      return { success: false, message: `Failed to delete quotes: ${quotesError.message}` };
    }

    // Delete week_item_volumes for these items
    const { error: volumesError, count: volumesCount } = await supabase
      .from('week_item_volumes')
      .delete()
      .in('item_id', itemIds);

    if (volumesError) {
      logger.error('Error deleting volumes:', volumesError);
      return { success: false, message: `Failed to delete volumes: ${volumesError.message}` };
    }

    // Delete pricing calculations for these items
    const { error: pricingError, count: pricingCount } = await supabase
      .from('item_pricing_calculations')
      .delete()
      .in('item_id', itemIds);

    if (pricingError) {
      logger.error('Error deleting pricing calculations:', pricingError);
      return { success: false, message: `Failed to delete pricing calculations: ${pricingError.message}` };
    }

    // Finally, delete the items themselves
    const { error: deleteItemsError, count: itemsCount } = await supabase
      .from('items')
      .delete()
      .in('id', itemIds);

    if (deleteItemsError) {
      logger.error('Error deleting items:', deleteItemsError);
      return { success: false, message: `Failed to delete items: ${deleteItemsError.message}` };
    }

    logger.debug(`✅ Deleted ${itemsCount || 0} 2lb strawberry items and associated data`);
    return {
      success: true,
      message: `Deleted ${itemsCount || 0} 2lb strawberry SKU(s) and all associated data (${quotesCount || 0} quotes, ${volumesCount || 0} volumes, ${pricingCount || 0} pricing calculations)`,
      deletedCounts: {
        items: itemsCount || 0,
        quotes: quotesCount || 0,
        volumes: volumesCount || 0,
        pricing: pricingCount || 0
      }
    };
  } catch (error: any) {
    logger.error('Error deleting 2lb strawberry data:', error);
    return { success: false, message: `Unexpected error: ${error.message || 'Unknown error'}` };
  }
}

export async function closeVolumeLoop(weekId: string, userName: string): Promise<{ success: boolean; message: string; pendingCount?: number }> {
  try {
    // First, check if all suppliers have responded AND RF has handled those responses
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('id, supplier_id, item_id, supplier_volume_response, supplier_volume_accepted, offered_volume, awarded_volume')
      .eq('week_id', weekId)
      .not('offered_volume', 'is', null)
      .gt('offered_volume', 0);

    if (quotesError) {
      return { success: false, message: `Failed to check quotes: ${quotesError.message}` };
    }

    if (!quotes || quotes.length === 0) {
      return { success: false, message: 'No volume allocations found. Please allocate volume before closing the loop.' };
    }

    // Check 1: Pending supplier responses (supplier hasn't responded yet)
    const pendingSupplierResponses = quotes.filter(q => !q.supplier_volume_response) || [];
    if (pendingSupplierResponses.length > 0) {
      const pendingSuppliers = new Set(pendingSupplierResponses.map(q => q.supplier_id));
      return { 
        success: false, 
        message: `${pendingSupplierResponses.length} quote(s) from ${pendingSuppliers.size} supplier(s) have not responded yet`, 
        pendingCount: pendingSupplierResponses.length 
      };
    }

    // Check 2: Unhandled supplier responses (RF hasn't accepted/revised them yet)
    // A response is "handled" if:
    //   - Supplier declined (no action needed) OR
    //   - Supplier accepted AND awarded_volume matches supplier_volume_accepted OR
    //   - Supplier revised AND awarded_volume matches supplier_volume_accepted (RF accepted revision)
    const unhandledResponses = quotes.filter(q => {
      // Skip declined responses - they don't need handling
      if (q.supplier_volume_response === 'decline') {
        return false;
      }
      
      // If supplier responded (accept/update), check if RF has finalized it
      if (q.supplier_volume_response && q.supplier_volume_response !== 'decline') {
        // CRITICAL: If supplier responded with 'accept' or 'update', supplier_volume_accepted MUST be > 0
        // This is a data integrity check - if supplier accepted/revised, they must have provided an accepted volume
        if (q.supplier_volume_response === 'accept' || q.supplier_volume_response === 'update') {
          if (!q.supplier_volume_accepted || q.supplier_volume_accepted <= 0) {
            // Data integrity issue: supplier responded but no accepted volume
            // Treat as unhandled (RF needs to address this)
            return true; // Unhandled - data inconsistency
          }
        }
        
        // Response is handled if awarded_volume matches supplier's accepted volume
        if (q.supplier_volume_accepted && q.supplier_volume_accepted > 0) {
          // If awarded_volume matches accepted volume, it's handled
          if (q.awarded_volume && q.awarded_volume === q.supplier_volume_accepted) {
            return false; // Handled
          }
          // If awarded_volume is 0 or doesn't match, RF hasn't handled it yet
          return true; // Unhandled
        }
      }
      
      return false;
    });

    if (unhandledResponses.length > 0) {
      const unhandledSuppliers = new Set(unhandledResponses.map(q => q.supplier_id));
      return { 
        success: false, 
        message: `${unhandledResponses.length} supplier response(s) from ${unhandledSuppliers.size} supplier(s) need to be accepted or revised before closing the loop`, 
        pendingCount: unhandledResponses.length 
      };
    }

    // Check 3: At least one finalized allocation exists OR at least one declined response (declined is handled)
    // At this point, all suppliers have responded (Check 1 passed)
    // All responses have been handled (Check 2 passed)
    // So we need at least one quote that is finalized:
    //   - Supplier declined (response is handled - declined is always finalized/handled) OR
    //   - Supplier accepted/revised AND awarded_volume matches supplier_volume_accepted AND awarded_volume > 0
    const finalizedAllocations = quotes.filter(q => {
      // Declined responses are always finalized (handled) - supplier declined, no action needed
      // RF can choose to withdraw (offered_volume = 0) or keep (offered_volume > 0)
      // But declined responses count as handled regardless
      if (q.supplier_volume_response === 'decline') {
        return true; // Declined is finalized/handled
      }
      
      // For accept/update responses, only finalized if awarded matches accepted AND awarded > 0
      // This means RF has accepted the supplier's response (either accept or revise)
      if (q.supplier_volume_response && 
          q.supplier_volume_response !== 'decline' &&
          q.supplier_volume_accepted && 
          q.supplier_volume_accepted > 0 &&
          q.awarded_volume && 
          q.awarded_volume > 0 &&
          q.awarded_volume === q.supplier_volume_accepted) {
        return true; // RF accepted supplier response
      }
      
      return false;
    });

    if (finalizedAllocations.length === 0) {
      return { 
        success: false, 
        message: 'No finalized allocations found. Please accept or revise supplier responses before closing the loop.' 
      };
    }

    // Try RPC first (it should handle all validations)
    const { data, error } = await supabase
      .rpc('close_volume_loop', {
        week_id_param: weekId,
        user_name: userName
      });

    // Fallback: If RPC fails, update directly with proper validations
    if (error || !data || data.length === 0 || !data[0].success) {
      logger.warn('RPC failed, using direct update fallback');
      
      // Update week status and volume_finalized flag
      const { error: weekError } = await supabase
        .from('weeks')
        .update({ 
          status: 'closed',
          volume_finalized: true,
          volume_finalized_at: new Date().toISOString(),
          volume_finalized_by: userName
        })
        .eq('id', weekId);

      if (weekError) {
        return { success: false, message: `Failed to close week: ${weekError.message}` };
      }

      // Verify the update
      const { data: verifyWeek, error: verifyError } = await supabase
        .from('weeks')
        .select('status, volume_finalized')
        .eq('id', weekId)
        .single();

      if (verifyError || !verifyWeek) {
        return { success: false, message: 'Week updated but verification failed' };
      }

      if (verifyWeek.status !== 'closed' || !verifyWeek.volume_finalized) {
        return { success: false, message: `Week status update failed. Status: ${verifyWeek.status}, Volume finalized: ${verifyWeek.volume_finalized}` };
      }

      return { success: true, message: 'Volume loop closed successfully. Week is now locked.' };
    }

    const result = data[0];
    return {
      success: result.success,
      message: result.message,
      pendingCount: result.pending_count
    };
  } catch (error: any) {
    logger.error('Error in closeVolumeLoop:', error);
    return { success: false, message: error.message || 'Unknown error occurred' };
  }
}

/**
 * Reset Workflow Scenario: Creates clean Week 1 (OPEN) for A-Z workflow testing
 * Imported and re-exported from resetWorkflowScenario.ts
 */
export { resetWorkflowScenario } from './resetWorkflowScenario';

/**
 * Reset Demo Data (Legacy): Creates 6 complete closed weeks + Week 7 (open, no quotes)
 * Complete workflow demonstration for board of directors
 */
export async function resetDemoDataLegacy(): Promise<{ success: boolean; message: string; week7Id?: string }> {
  try {
    logger.debug('Resetting demo data - creating 6 closed weeks + week 7...');

    // Step 1: Delete all existing data
    await supabase.from('quotes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('week_item_volumes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('item_pricing_calculations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('weeks').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Step 2: Ensure suppliers exist
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('id, name');

    if (suppliersError || !suppliers || suppliers.length === 0) {
      return { success: false, message: `No suppliers found: ${suppliersError?.message || 'Please create suppliers first'}` };
    }

    // Step 3: Ensure all 8 standard items exist (including strawberry 4×2 lb CONV)
    const standardItems = [
      { name: 'Strawberry', pack_size: '4×2 lb', category: 'strawberry', organic_flag: 'CONV', display_order: 1 },
      { name: 'Strawberry', pack_size: '8×1 lb', category: 'strawberry', organic_flag: 'ORG', display_order: 2 },
      { name: 'Blueberry', pack_size: '18 oz', category: 'blueberry', organic_flag: 'CONV', display_order: 3 },
      { name: 'Blueberry', pack_size: 'Pint', category: 'blueberry', organic_flag: 'ORG', display_order: 4 },
      { name: 'Blackberry', pack_size: '12ozx6', category: 'blackberry', organic_flag: 'CONV', display_order: 5 },
      { name: 'Blackberry', pack_size: '12ozx6', category: 'blackberry', organic_flag: 'ORG', display_order: 6 },
      { name: 'Raspberry', pack_size: '12ozx6', category: 'raspberry', organic_flag: 'CONV', display_order: 7 },
      { name: 'Raspberry', pack_size: '12ozx6', category: 'raspberry', organic_flag: 'ORG', display_order: 8 }
    ];

    const itemsMap = new Map<string, any>();
    for (const itemData of standardItems) {
      // Try to find existing by name, pack_size, and organic_flag (exact match)
      const { data: existing } = await supabase
        .from('items')
        .select('id, name, pack_size, organic_flag')
        .eq('name', itemData.name)
        .eq('pack_size', itemData.pack_size)
        // FIXED 400 ERROR: Use eq() for organic_flag matching instead of invalid .or() syntax
        .eq('organic_flag', itemData.organic_flag)
        .maybeSingle();

      if (existing) {
        // Update category and display_order if needed
        if (existing.category !== itemData.category || (existing as any).display_order !== itemData.display_order) {
          await supabase
            .from('items')
            .update({ category: itemData.category, display_order: itemData.display_order })
            .eq('id', existing.id);
        }
        itemsMap.set(`${itemData.name}|${itemData.pack_size}|${itemData.organic_flag}`, existing);
      } else {
        // Create if doesn't exist
        const { data: newItem, error: createError } = await supabase
          .from('items')
          .insert(itemData)
          .select()
          .single();

        if (!createError && newItem) {
          itemsMap.set(`${itemData.name}|${itemData.pack_size}|${itemData.organic_flag}`, newItem);
        }
      }
    }

    const items = Array.from(itemsMap.values());
    if (items.length === 0) {
      return { success: false, message: 'Failed to create or find items' };
    }

    logger.debug(`Ensured ${items.length} items exist`);

    // Step 4: Create 6 closed weeks with complete data
    const today = new Date();
    const closedWeeks: any[] = [];
    
    for (let weekNum = 1; weekNum <= 6; weekNum++) {
      const daysAgo = (7 - weekNum) * 7; // Week 1 is oldest, week 6 is most recent
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - daysAgo - today.getDay() + 1); // Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday

      const { data: week, error: weekError } = await supabase
        .from('weeks')
        .insert({
          week_number: weekNum,
          start_date: weekStart.toISOString().split('T')[0],
          end_date: weekEnd.toISOString().split('T')[0],
          status: 'closed',
          finalized_at: weekEnd.toISOString(),
          finalized_by: 'RF Manager',
          allocation_submitted: true,
          allocation_submitted_at: weekEnd.toISOString(),
          allocation_submitted_by: 'RF Manager'
        })
        .select()
        .single();

      if (weekError || !week) {
        logger.error(`Failed to create week ${weekNum}:`, weekError);
        continue;
      }

      closedWeeks.push(week);

      // Create volume needs and complete quotes for each item
      for (const item of items) {
        const volumeNeeded = 800 + Math.floor(Math.random() * 400); // 800-1200 cases
        
        await supabase
          .from('week_item_volumes')
          .upsert({
            week_id: week.id,
            item_id: item.id,
            volume_needed,
            locked: true
          }, {
            onConflict: 'week_id,item_id'
          });

        // Base prices vary by item type
        const getBasePrice = (itemName: string, organic: string) => {
          const isORG = organic === 'ORG';
          switch (itemName.toLowerCase()) {
            case 'strawberry':
              return isORG ? 11.50 : 10.50;
            case 'blueberry':
              return isORG ? 9.75 : 8.50;
            case 'blackberry':
              return isORG ? 11.50 : 10.25;
            case 'raspberry':
              return isORG ? 12.25 : 11.00;
            default:
              return 10.00;
          }
        };

        const basePrice = getBasePrice(item.name, item.organic_flag || 'CONV');
        const volumePerSupplier = Math.floor(volumeNeeded / suppliers.length);
        let remainingVolume = volumeNeeded;

        // For ALL 6 weeks: Create quotes for all suppliers EXCEPT the last one
        // This shows a "live example" where one shipper hasn't quoted yet (demonstrates workflow)
        const suppliersToQuote = suppliers.slice(0, -1); // All except last supplier

        for (let i = 0; i < suppliersToQuote.length; i++) {
          const supplier = suppliersToQuote[i];
          const isLastSupplier = i === suppliersToQuote.length - 1;
          const supplierVolume = isLastSupplier ? remainingVolume : volumePerSupplier;
          remainingVolume -= supplierVolume;

          // Pricing progression: supplier_fob → rf_counter → supplier_revised → rf_final
          const supplierFOB = basePrice + (i * 0.20) + (Math.random() * 0.30 - 0.15);
          const rfCounter = supplierFOB - 0.30 + (Math.random() * 0.20 - 0.10);
          const supplierRevised = rfCounter + 0.15 + (Math.random() * 0.15 - 0.05);
          const rfFinal = supplierRevised - 0.10 + (Math.random() * 0.10 - 0.05);

          // Create quote with complete workflow
          await supabase
            .from('quotes')
            .upsert({
              week_id: week.id,
              item_id: item.id,
              supplier_id: supplier.id,
              supplier_fob: Math.round(supplierFOB * 100) / 100,
              supplier_dlvd: Math.round((supplierFOB + 2.00) * 100) / 100,
              rf_counter_fob: Math.round(rfCounter * 100) / 100,
              supplier_response: Math.random() > 0.2 ? 'accept' : 'revise', // 80% accept
              supplier_revised_fob: Math.random() > 0.2 ? null : Math.round(supplierRevised * 100) / 100,
              rf_final_fob: Math.round(rfFinal * 100) / 100,
              supplier_pricing_finalized: true,
              supplier_pricing_finalized_at: weekEnd.toISOString(),
              // Volume workflow: awarded → offered → supplier accepted
              awarded_volume: supplierVolume,
              offered_volume: supplierVolume,
              supplier_volume_response: 'accept',
              supplier_volume_accepted: supplierVolume,
              supplier_volume_approval: 'accepted',
              updated_at: weekEnd.toISOString()
            }, {
              onConflict: 'week_id,item_id,supplier_id'
            });
        }

        // Calculate average FOB for pricing calculations
        const avgFOB = basePrice + (Math.random() * 0.50 - 0.25);
        
        // Create pricing calculations
        await supabase
          .from('item_pricing_calculations')
          .upsert({
            week_id: week.id,
            item_id: item.id,
            avg_price: Math.round(avgFOB * 100) / 100,
            rebate: 0.85,
            freight: 1.50,
            margin: 1.50,
            dlvd_price: Math.round((avgFOB + 0.85 + 1.50 + 1.50) * 100) / 100
          }, {
            onConflict: 'week_id,item_id'
          });
      }
    }

    // Step 5: Create Week 7 (OPEN, no quotes yet - fresh start)
    const week7Start = new Date(today);
    week7Start.setDate(today.getDate() - today.getDay() + 1); // This Monday
    const week7End = new Date(week7Start);
    week7End.setDate(week7Start.getDate() + 6); // Sunday

    const { data: week7, error: week7Error } = await supabase
      .from('weeks')
      .insert({
        week_number: 7,
        start_date: week7Start.toISOString().split('T')[0],
        end_date: week7End.toISOString().split('T')[0],
        status: 'open',
        allocation_submitted: false,
        finalized_at: null,
        finalized_by: null
      })
      .select()
      .single();

    if (week7Error || !week7) {
      logger.error('Failed to create week 7:', week7Error);
      return { success: false, message: `Failed to create week 7: ${week7Error?.message || 'Unknown error'}` };
    }

    // Create volume needs for week 7 (but NO quotes yet - fresh start)
    for (const item of items) {
      const volumeNeeded = 800 + Math.floor(Math.random() * 400);
      
      await supabase
        .from('week_item_volumes')
        .upsert({
          week_id: week7.id,
          item_id: item.id,
          volume_needed,
          locked: false
        }, {
          onConflict: 'week_id,item_id'
        });
    }

    logger.debug(`✅ Created ${closedWeeks.length} closed weeks + Week 7 (open)`);
    
    return { 
      success: true, 
      message: `Demo data reset! Created ${closedWeeks.length} closed weeks with complete workflows + Week 7 (open, ready for quotes)`,
      week7Id: week7.id
    };
  } catch (error: any) {
    logger.error('Error resetting demo data:', error);
    return { success: false, message: error?.message || 'Unknown error' };
  }
}

/**
 * Reset Week 6 data - now uses resetDemoData (legacy name kept for compatibility)
 */
export async function resetWeek6StrawberryPricing(): Promise<{ success: boolean; message: string }> {
  const result = await resetDemoData();
  return { success: result.success, message: result.message };
}
