# DEBUG_DUMP.md

Generated: Tue Jan  6 22:23:39 EST 2026

## A) PROJECT MAP

### /src file tree:
- src/App.tsx
- src/components/AdvancedChart.tsx
- src/components/Allocation.tsx
- src/components/AllocationResponse.tsx
- src/components/Analytics.tsx
- src/components/AwardVolume.tsx
- src/components/BulkPricingActions.tsx
- src/components/ErrorBoundary.tsx
- src/components/ExecutiveDashboard.tsx
- src/components/ExportData.tsx
- src/components/LoadingSkeleton.tsx
- src/components/Login.tsx
- src/components/NotificationCenter.tsx
- src/components/PredictiveAnalytics.tsx
- src/components/PriceComparison.tsx
- src/components/PriceTicker.tsx
- src/components/PricingCalculations.tsx
- src/components/PricingIntelligence.tsx
- src/components/QuickStats.tsx
- src/components/RFDashboard.tsx
- src/components/SmartAlerts.tsx
- src/components/SmartPricingSuggestions.tsx
- src/components/StatusWidget.tsx
- src/components/SupplierComparison.tsx
- src/components/SupplierDashboard.tsx
- src/components/SupplierPerformanceScorecard.tsx
- src/components/Toast.tsx
- src/components/VolumeAcceptance.tsx
- src/components/VolumeOffers.tsx
- src/contexts/AppContext.tsx
- src/contexts/ToastContext.tsx
- src/hooks/useKeyboardShortcuts.ts
- src/hooks/useQuotesData.ts
- src/hooks/useRealtime.ts
- src/hooks/useWeekData.ts
- src/main.tsx
- src/types.ts
- src/utils/allocationOptimizer.ts
- src/utils/database.ts
- src/utils/emailService.ts
- src/utils/exportService.ts
- src/utils/helpers.ts
- src/utils/historicalData.ts
- src/utils/loadAllocationScenario.ts
- src/utils/logger.ts
- src/utils/seedCompleteDemo.ts
- src/utils/seedDatabase.ts
- src/utils/seedHistoricalAllocations.ts
- src/utils/seedMultiSupplierScenario.ts
- src/utils/seedSupplierTestScenario.ts
- src/utils/seedWorkflowDemo.ts
- src/utils/supabase.ts
- src/vite-env.d.ts

### supabase/migrations:
- supabase/migrations/20260101003054_create_pricing_portal_schema_v2.sql
- supabase/migrations/20260101003757_fix_rls_for_login.sql
- supabase/migrations/20260101003810_allow_public_access_for_demo.sql
- supabase/migrations/20260101004812_add_item_display_order.sql
- supabase/migrations/20260101010948_rebuild_pricing_portal_schema.sql
- supabase/migrations/20260101015659_add_volume_tracking.sql
- supabase/migrations/20260101020201_add_volume_needed_tracking.sql
- supabase/migrations/20260101020741_add_supplier_volume_approval.sql
- supabase/migrations/20260101022740_add_draft_allocations_and_finalization.sql
- supabase/migrations/20260101023943_add_pricing_calculations_and_allocation_history.sql
- supabase/migrations/20260101025001_add_volume_offer_and_response_fields.sql
- supabase/migrations/20260101034532_seed_sample_data_for_demo_v3.sql
- supabase/migrations/20260101045559_fix_week_item_volumes_rls.sql
- supabase/migrations/20260101061957_fix_week_status_and_add_volume_averages.sql
- supabase/migrations/20260101062235_reseed_historical_data_fixed.sql
- supabase/migrations/20260101063447_setup_week6_for_berry_best_demo.sql
- supabase/migrations/20260101064446_add_customer_volume_tracking.sql
- supabase/migrations/20260101081645_create_ceo_demo_week7_v2.sql
- supabase/migrations/20260101081704_create_ceo_demo_week6_gaps.sql
- supabase/migrations/20260101082338_add_supplier_pricing_finalization.sql
- supabase/migrations/20260101082901_add_allocation_confirmation_tracking.sql
- supabase/migrations/20260101194514_add_performance_indexes.sql
- supabase/migrations/20260101232035_finalize_historical_weeks_1_5_complete_loop.sql
- supabase/migrations/20260102005037_fix_security_and_performance_issues.sql
- supabase/migrations/20260103000000_enforce_single_open_week.sql
- supabase/migrations/20260103015913_create_week_item_volumes_table.sql
- supabase/migrations/20260103030927_fix_week_item_volumes_policy_conflict.sql
- supabase/migrations/20260103031058_create_week_15_and_16_with_pricing_data.sql
- supabase/migrations/20260103032044_create_submit_allocations_function.sql
- supabase/migrations/20260103032747_finalize_week_17_pricing_fixed.sql
- supabase/migrations/20260103033904_comprehensive_fix_all_missing_objects.sql
- supabase/migrations/20260103042837_fix_submit_allocations_function.sql
- supabase/migrations/20260103043555_fix_submit_allocations_function_v2.sql
- supabase/migrations/20260103043925_add_volume_loop_closure_tracking.sql
- supabase/migrations/20260103183341_add_allocation_response_workflow.sql
- supabase/migrations/20260103185547_create_week_item_internal_costs_and_fix_allocations.sql
- supabase/migrations/20260103185601_fix_week_status_hygiene.sql
- supabase/migrations/20260103191139_fix_week_status_hygiene_production.sql
- supabase/migrations/20260103192631_add_supplier_response_columns_to_quotes.sql
- supabase/migrations/20260103193504_add_supplier_response_columns_production.sql
- supabase/migrations/20260103194042_create_submit_supplier_response_function.sql
- supabase/migrations/20260103194702_fix_security_and_performance_issues.sql
- supabase/migrations/20260104000000_update_close_loop_to_lock_week.sql
- supabase/migrations/20260105000000_add_supplier_eligibility_status.sql
- supabase/migrations/20260105000001_add_update_eligibility_function.sql
- supabase/migrations/20260106000000_auto_set_rf_final_fob_trigger.sql
- supabase/migrations/20260106000001_auto_finalize_pricing_comprehensive.sql
- supabase/migrations/20260106000002_fix_week_item_volumes_rls_and_auto_seed.sql

## B) CORE FILES

### src/main.tsx
```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');

  // Missing required environment variables
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; background: #fee;">
      <div style="max-width: 500px; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <h1 style="color: #dc2626; margin: 0 0 1rem 0;">Configuration Error</h1>
        <p style="margin: 0 0 1rem 0;">Missing required environment variables:</p>
        <ul style="margin: 0 0 1rem 0; color: #dc2626; font-weight: bold;">
          ${missing.map(v => `<li>${v}</li>`).join('')}
        </ul>
        <p style="margin: 0; color: #666; font-size: 0.9rem;">
          Contact your administrator or check deployment configuration.
        </p>
      </div>
    </div>
  `;
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

// Supabase environment variables loaded

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error: any) {
  // Failed to render app - show error UI
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; background: #fee; padding: 20px;">
      <div style="max-width: 600px; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <h1 style="color: #dc2626; margin: 0 0 1rem 0; font-size: 24px;">Application Error</h1>
        <p style="margin: 0 0 1rem 0; color: #333;">The application failed to load. Please check the browser console (F12) for details.</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 1rem; margin: 1rem 0;">
          <p style="margin: 0; color: #991b1b; font-family: monospace; font-size: 14px; word-break: break-all;">
            ${error?.message || error?.toString() || 'Unknown error'}
          </p>
        </div>
        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
          Reload Page
        </button>
      </div>
    </div>
  `;
}
```

### src/App.tsx
```typescript
import { AppProvider, useApp } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { Login } from './components/Login';
import { SupplierDashboard } from './components/SupplierDashboard';
import { RFDashboard } from './components/RFDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
// Import scenario loader to register window functions
import './utils/loadAllocationScenario';
import './utils/seedHistoricalAllocations';

function AppContent() {
  const { session } = useApp();

  if (!session) {
    return <Login />;
  }

  if (session.role === 'supplier') {
    return <SupplierDashboard />;
  }

  return <RFDashboard />;
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### src/contexts/AppContext.tsx
```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Session } from '../types';
import { loadSession, saveSession } from '../utils/database';

interface AppContextType {
  session: Session | null;
  login: (userId: string, userName: string, role: 'supplier' | 'rf', supplierId?: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function validateSession(session: Session | null): Session | null {
  if (!session) return null;
  if (session.role === 'supplier' && session.supplier_id) {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(session.supplier_id)) {
      return null;
    }
  }
  return session;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const loaded = loadSession();
    const validated = validateSession(loaded);
    if (!validated && loaded) {
      saveSession(null);
    }
    return validated;
  });

  const login = (userId: string, userName: string, role: 'supplier' | 'rf', supplierId?: string) => {
    const newSession: Session = {
      user_id: userId,
      user_name: userName,
      role,
      supplier_id: supplierId,
    };

    if (role === 'supplier') {
      localStorage.removeItem('supplier_quote_inputs');
      localStorage.removeItem('supplier_response_inputs');
      localStorage.removeItem('supplier_expanded_rows');
    }

    setSession(newSession);
    saveSession(newSession);
  };

  const logout = () => {
    setSession(null);
    saveSession(null);
  };

  return (
    <AppContext.Provider value={{ session, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
```

### src/contexts/ToastContext.tsx
```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; duration?: number } | null>(null);

  const showToast = (message: string, type: 'success' | 'error', duration?: number) => {
    setToast({ message, type, duration });
  };

  const closeToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          duration={toast.duration}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
```

### src/utils/supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Production-safe error handling: main.tsx will show user-friendly error
// This file should not throw to allow graceful degradation
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase environment variables. Please check your deployment configuration.');
  }
}

// Create client with empty strings if missing (main.tsx will prevent app from loading)
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

### src/types.ts
```typescript
export interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  status: 'open' | 'finalized' | 'closed';
  emergency_unlock_enabled: boolean;
  emergency_unlock_reason?: string;
  emergency_unlock_by_user?: string;
  emergency_unlock_at?: string;
  finalized_at?: string;
  finalized_by?: string;
  allocation_submitted?: boolean;
  allocation_submitted_at?: string;
  allocation_submitted_by?: string;
  volume_finalized?: boolean;
  volume_finalized_at?: string;
  volume_finalized_by?: string;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  pack_size: string;
  category: 'strawberry' | 'blueberry' | 'blackberry' | 'raspberry';
  organic_flag: 'CONV' | 'ORG';
  display_order: number;
  unit_type: 'pallets' | 'cases';
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

// Quote: One record per (week_id, item_id, supplier_id) combination
// This allows multiple suppliers to price the same SKU independently
// RF can compare all quotes for a SKU and counter/confirm per supplier
// 
// CRITICAL BUSINESS RULE: Pricing submission ≠ allocation eligibility
// - All suppliers can submit pricing (data collection)
// - RF explicitly marks which suppliers are eligible_for_award
// - Only eligible_for_award suppliers participate in allocation
// - Weighted averages calculated only on eligible suppliers
//
// Volume fields lifecycle:
//   - awarded_volume: RF's draft award → final after accepting supplier response
//   - offered_volume: Copied from awarded_volume when sent to supplier
//   - supplier_volume_accepted: Supplier's response (accept or revise)
export interface Quote {
  id: string;
  week_id: string;
  item_id: string;
  supplier_id: string;
  supplier_fob?: number;
  supplier_dlvd?: number;
  rf_counter_fob?: number;
  supplier_response?: 'accept' | 'revise';
  supplier_revised_fob?: number;
  rf_final_fob?: number;
  // Eligibility status: RF-controlled decision layer
  // Only 'eligible_for_award' suppliers appear in allocation interface
  supplier_eligibility_status?: 'submitted' | 'reviewed' | 'feedback_sent' | 'eligible_for_award' | 'not_used';
  offered_volume?: number;
  supplier_volume_response?: 'accept' | 'update' | 'decline';
  supplier_volume_accepted?: number;
  supplier_volume_response_notes?: string;
  awarded_volume?: number;
  supplier_volume_approval?: 'pending' | 'accepted' | 'revised';
  supplier_volume_notes?: string;
  supplier_pricing_finalized?: boolean;
  supplier_pricing_finalized_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  week_id: string;
  item_id?: string;
  supplier_id?: string;
  field_changed: string;
  old_value?: string;
  new_value?: string;
  user_id: string;
  reason?: string;
  created_at: string;
}

export interface Session {
  user_id: string;
  user_name: string;
  role: 'rf' | 'supplier';
  supplier_id?: string;
}

export interface QuoteWithDetails extends Quote {
  item?: Item;
  supplier?: Supplier;
  week?: Week;
}

export interface SupplierRanking {
  supplier_id: string;
  supplier_name: string;
  rank: number;
  price: number;
  supplier_fob?: number;
  rf_counter_fob?: number;
  supplier_revised_fob?: number;
  rf_final_fob?: number;
}

export interface SKUStatus {
  item_id: string;
  item_name: string;
  pack_size: string;
  category: string;
  organic_flag: string;
  status: 'needs_supplier' | 'needs_rf_counter' | 'needs_supplier_response' | 'needs_rf_final' | 'complete';
  rankings: SupplierRanking[];
  average_fob?: number;
}

export interface SupplierStats {
  supplier_id: string;
  supplier_name: string;
  skus_quoted: number;
  average_fob: number;
  lowest_price_count: number;
  highest_price_count: number;
}

export interface AnalyticsBySKU {
  sku_name: string;
  organic_flag: string;
  supplier_name: string;
  avg_fob: number;
  lowest_fob: number;
  lowest_week: number;
  highest_fob: number;
  highest_week: number;
}

export interface AnalyticsBySupplier {
  supplier_name: string;
  avg_fob: number;
  times_cheapest: number;
  times_expensive: number;
}

export interface WeekItemVolume {
  id: string;
  week_id: string;
  item_id: string;
  volume_needed: number;
  created_at: string;
  updated_at: string;
}
```

### src/utils/database.ts
```typescript
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
    console.error('Error fetching suppliers:', error);
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

export async function fetchWeeks(): Promise<Week[]> {
  const { data } = await supabase
    .from('weeks')
    .select('*')
    .order('week_number', { ascending: false });
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
    console.error('Error updating quote volume:', error);
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
    console.error('Error updating week status:', error);
    return false;
  }

  if (status === 'closed') {
    const { error: previousError } = await supabase
      .from('weeks')
      .update({ status: 'closed' })
      .eq('status', 'finalized')
      .neq('id', weekId);

    if (previousError) {
      console.error('Error closing previous weeks:', previousError);
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
      console.error('Error fetching weeks for hygiene check:', fetchError);
      return false;
    }

    if (!weeks || weeks.length === 0) {
      console.log('No weeks found, hygiene check skipped');
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
        console.error('Error setting latest week to open:', openError);
        return false;
      }
      console.log(`✓ Set week ${latestWeek.id} to open`);
    }

    if (otherWeekIds.length > 0) {
      const { error: closeError } = await supabase
        .from('weeks')
        .update({ status: 'closed' })
        .in('id', otherWeekIds)
        .neq('status', 'closed');

      if (closeError) {
        console.error('Error closing other weeks:', closeError);
        return false;
      }
      console.log(`✓ Closed ${otherWeekIds.length} other weeks`);
    }

    console.log('✓ Week status hygiene enforced');
    return true;
  } catch (err) {
    console.error('Error enforcing week status hygiene:', err);
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
    console.error('Error creating new week:', error);
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
      console.error('Error creating quotes for new week:', quotesError);
    }
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
      console.error('Error creating volume needs for new week:', volumeError);
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
    console.error('Error updating emergency unlock:', error);
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
    console.error('Error creating audit log:', error);
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

    await supabase.from('items').insert([
      { name: 'Strawberry', pack_size: '4×2 lb', category: 'strawberry', organic_flag: 'CONV', display_order: 1 },
      { name: 'Strawberry', pack_size: '8×1 lb', category: 'strawberry', organic_flag: 'ORG', display_order: 2 },
      { name: 'Blueberry', pack_size: '18 oz', category: 'blueberry', organic_flag: 'CONV', display_order: 3 },
      { name: 'Blueberry', pack_size: 'Pint', category: 'blueberry', organic_flag: 'ORG', display_order: 4 },
      { name: 'Blackberry', pack_size: '12×6 oz', category: 'blackberry', organic_flag: 'CONV', display_order: 5 },
      { name: 'Blackberry', pack_size: '12×6 oz', category: 'blackberry', organic_flag: 'ORG', display_order: 6 },
      { name: 'Raspberry', pack_size: '12×6 oz', category: 'raspberry', organic_flag: 'CONV', display_order: 7 },
      { name: 'Raspberry', pack_size: '12×6 oz', category: 'raspberry', organic_flag: 'ORG', display_order: 8 },
    ]);

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
    console.error('Error resetting data:', error);
    return false;
  }
}

export async function demoResetAllocations(): Promise<boolean> {
  try {
    await supabase.from('draft_allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { data: weeks } = await supabase.from('weeks').select('*');
    if (!weeks) return false;

    const openWeeks = weeks.filter(w => w.status === 'open');
    if (openWeeks.length > 1) {
      for (let i = 1; i < openWeeks.length; i++) {
        await supabase.from('weeks').update({ status: 'closed' }).eq('id', openWeeks[i].id);
      }
    }

    if (openWeeks.length === 0) {
      const latestWeek = weeks.sort((a, b) => b.week_number - a.week_number)[0];
      if (latestWeek) {
        await supabase.from('weeks').update({ status: 'open' }).eq('id', latestWeek.id);
      }
    }

    await supabase
      .from('quotes')
      .update({
        awarded_volume: null,
        offered_volume: null,
        supplier_volume_response: null,
        supplier_volume_accepted: null,
        supplier_volume_response_notes: null,
        allocation_confirmation_status: 'pending',
        allocation_confirmed_volume: null,
        allocation_confirmation_notes: null,
        allocation_confirmed_at: null,
        updated_at: new Date().toISOString(),
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    await supabase
      .from('weeks')
      .update({
        allocation_submitted: false,
        allocation_submitted_at: null,
        allocation_submitted_by: null,
        updated_at: new Date().toISOString(),
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const [suppliers, items, currentWeeks] = await Promise.all([
      fetchSuppliers(),
      fetchItems(),
      fetchWeeks(),
    ]);

    const openWeek = currentWeeks.find(w => w.status === 'open');
    if (!openWeek) return true;

    for (const supplier of suppliers) {
      for (const item of items) {
        const { data: existingQuote } = await supabase
          .from('quotes')
          .select('id')
          .eq('week_id', openWeek.id)
          .eq('supplier_id', supplier.id)
          .eq('item_id', item.id)
          .maybeSingle();

        if (!existingQuote) {
          await supabase.from('quotes').insert({
            week_id: openWeek.id,
            supplier_id: supplier.id,
            item_id: item.id,
            supplier_fob: null,
            supplier_dlvd: null,
          });
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error in demo reset:', error);
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
  const { data, error } = await supabase
    .from('week_item_volumes')
    .select('*')
    .eq('week_id', weekId);

  if (error) {
    console.error('Error fetching volume needs:', error);
    return [];
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
    console.error('Error updating supplier volume approval:', error);
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
    console.error('Error fetching draft allocations:', error);
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
      console.error('Error finalizing week allocations:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in finalizeWeekAllocations:', error);
    return false;
  }
}

export async function submitAllocationsToSuppliers(weekId: string, userName: string): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    console.log('=== SUBMIT ALLOCATIONS TO SUPPLIERS ===');
    console.log('Week ID:', weekId);

    // Validation: Check week status
    const { data: week, error: weekError } = await supabase
      .from('weeks')
      .select('status')
      .eq('id', weekId)
      .single();

    if (weekError || !week) {
      return { success: false, error: 'Week not found' };
    }

    if (week.status !== 'finalized') {
      return { success: false, error: `Week must be finalized before submitting allocations. Current status: ${week.status}` };
    }

    // Get all quotes with awarded_volume for this week
    // Volume Lifecycle: awarded_volume (draft) → offered_volume (sent to supplier) → supplier_volume_accepted (response) → awarded_volume (final)
    const { data: quotesWithVolume, error: fetchError } = await supabase
      .from('quotes')
      .select('id, item_id, supplier_id, awarded_volume')
      .eq('week_id', weekId)
      .not('awarded_volume', 'is', null)
      .gt('awarded_volume', 0);

    console.log('Fetch Error:', fetchError);
    console.log('Quotes with volume:', quotesWithVolume?.length || 0);

    if (fetchError) {
      console.error('Error fetching quotes with awarded volume:', fetchError);
      return { success: false, error: `Database error: ${fetchError.message}` };
    }

    if (!quotesWithVolume || quotesWithVolume.length === 0) {
      console.error('No awarded volumes found for this week');
      return { success: false, error: 'No volume allocations found. Please allocate volume to at least one supplier before sending.' };
    }

    console.log(`Found ${quotesWithVolume.length} quotes with awarded volume`);

    // Copy awarded_volume to offered_volume using database function (bypasses schema cache)
    // This transitions volume from "draft award" to "offer sent to supplier"
    // RPC also resets supplier response fields to allow fresh responses
    const { error: updateError } = await supabase
      .rpc('submit_allocations_to_suppliers', { week_id_param: weekId });

    console.log('RPC error:', updateError);

    if (updateError) {
      console.error('Error calling submit_allocations_to_suppliers:', updateError);
      return { success: false, error: `Failed to update quotes: ${updateError.message}` };
    }

    console.log(`✓ Successfully called submit_allocations_to_suppliers RPC`);

    // Mark week as allocation submitted
    const { error } = await supabase
      .from('weeks')
      .update({
        allocation_submitted: true,
        allocation_submitted_at: new Date().toISOString(),
        allocation_submitted_by: userName,
      })
      .eq('id', weekId);

    if (error) {
      console.error('Error submitting allocations:', error);
      return { success: false, error: `Failed to mark week as submitted: ${error.message}` };
    }

    console.log('✓ Successfully submitted allocations');
    return { success: true, count: quotesWithVolume.length };
  } catch (error: any) {
    console.error('Error in submitAllocationsToSuppliers:', error);
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
    console.error('Error fetching pricing calculations:', error);
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
      console.log('No previous finalized week found');
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
    console.error('Error updating pricing calculation:', error);
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
    console.error('Error updating offered volume:', error);
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
    console.error('Error updating supplier volume response:', error);
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
    console.error('Error fetching previous weeks:', weeksError);
    return new Map();
  }

  const weekIds = weeks.map(w => w.id);

  const { data: drafts, error: draftsError } = await supabase
    .from('draft_allocations')
    .select('item_id, drafted_volume')
    .in('week_id', weekIds);

  if (draftsError || !drafts) {
    console.error('Error fetching draft allocations:', draftsError);
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
 */
export async function lockSKU(weekId: string, itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('week_item_volumes')
      .update({ 
        locked: true,
        updated_at: new Date().toISOString()
      })
      .eq('week_id', weekId)
      .eq('item_id', itemId);

    if (error) {
      logger.error('Error locking SKU:', error);
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
 */
export async function unlockSKU(weekId: string, itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('week_item_volumes')
      .update({ 
        locked: false,
        updated_at: new Date().toISOString()
      })
      .eq('week_id', weekId)
      .eq('item_id', itemId);

    if (error) {
      logger.error('Error unlocking SKU:', error);
      return false;
    }
    return true;
  } catch (error) {
    logger.error('Error in unlockSKU:', error);
    return false;
  }
}

export async function closeVolumeLoop(weekId: string, userName: string): Promise<{ success: boolean; message: string; pendingCount?: number }> {
  try {
    const { data, error } = await supabase
      .rpc('close_volume_loop', {
        week_id_param: weekId,
        user_name: userName
      });

    if (error) {
      console.error('Error calling close_volume_loop:', error);
      return { success: false, message: `Failed to close loop: ${error.message}` };
    }

    if (!data || data.length === 0) {
      return { success: false, message: 'No response from database function' };
    }

    const result = data[0];
    return {
      success: result.success,
      message: result.message,
      pendingCount: result.pending_count
    };
  } catch (error: any) {
    console.error('Error in closeVolumeLoop:', error);
    return { success: false, message: error.message || 'Unknown error occurred' };
  }
}
```

## C) RF WORKFLOW FILES

### src/components/RFDashboard.tsx
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, RefreshCw, ChevronDown, ChevronUp, TrendingUp, Award, Plus, Zap, Unlock, AlertTriangle, CheckCircle, CheckCircle2, DollarSign, BarChart3, Package, Lock, Shield, Mail, Clock, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchWeeks,
  fetchItems,
  fetchSuppliers,
  fetchQuotes,
  fetchQuotesWithDetails,
  getSuppliersWithSubmissions,
  ensureQuotesForWeek,
  updateRFCounter,
  updateRFFinal,
  getQuotesForItem,
  createNewWeek,
  finalizePricingForWeek,
  updateWeekStatus,
  enforceWeekStatusHygiene,
  fetchVolumeNeeds
} from '../utils/database';
import { sendPricingReminder } from '../utils/emailService';
import type { Week, Item, Supplier, QuoteWithDetails } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Analytics } from './Analytics';
import { Allocation } from './Allocation';
import { AwardVolume } from './AwardVolume';
// Legacy components kept for reference but not used
// import { VolumeAcceptance } from './VolumeAcceptance';
import { QuickStats } from './QuickStats';
import { NotificationCenter } from './NotificationCenter';
import { ExportData } from './ExportData';
import { PriceTicker } from './PriceTicker';
import { PricingIntelligence } from './PricingIntelligence';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { SmartAlerts } from './SmartAlerts';
// Temporarily disabled to prevent errors
// import { ExecutiveDashboard } from './ExecutiveDashboard';
// import { SupplierPerformanceScorecard } from './SupplierPerformanceScorecard';
import { useRealtime } from '../hooks/useRealtime';
import { logger } from '../utils/logger';
import { loadAllocationScenario, removeAllocationScenario } from '../utils/loadAllocationScenario';
import { seedHistoricalAllocations } from '../utils/seedHistoricalAllocations';
import { seedCompleteDemo } from '../utils/seedCompleteDemo';

export function RFDashboard() {
  const { session, logout } = useApp();
  const { showToast } = useToast();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [quotes, setQuotes] = useState<QuoteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittedSuppliers, setSubmittedSuppliers] = useState<Supplier[]>([]);
  const [notSubmittedSuppliers, setNotSubmittedSuppliers] = useState<Supplier[]>([]);
  const [counterSuppliers, setCounterSuppliers] = useState<Supplier[]>([]);
  const [finalizedSuppliers, setFinalizedSuppliers] = useState<Supplier[]>([]);
  const [counterInputs, setCounterInputs] = useState<Record<string, string>>({});
  const [finalInputs, setFinalInputs] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'not_submitted' | 'submitted' | 'counter' | 'finalized'>('not_submitted');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [itemQuotes, setItemQuotes] = useState<Record<string, QuoteWithDetails[]>>({});
  const [mainView, setMainView] = useState<'pricing' | 'analytics' | 'award_volume' | 'volume_acceptance' | 'intelligence' | 'predictions' | 'executive' | 'alerts'>('pricing');
  const [pricingTab, setPricingTab] = useState<'manual' | 'smart' | 'bulk'>('manual');
  const [showCreateWeekModal, setShowCreateWeekModal] = useState(false);
  const [weekAverages, setWeekAverages] = useState<Record<string, number>>({});
  const [submittingCounters, setSubmittingCounters] = useState(false);
  const [submittingFinals, setSubmittingFinals] = useState(false);
  const [creatingWeek, setCreatingWeek] = useState(false);
  const [finalizingPricing, setFinalizingPricing] = useState(false);
  const [sendingReminders, setSendingReminders] = useState<Record<string, boolean>>({});
  const [finalizingItems, setFinalizingItems] = useState<Record<string, boolean>>({});
  const [volumeNeedsMap, setVolumeNeedsMap] = useState<Map<string, number>>(new Map());
  const [volumeNeeds, setVolumeNeeds] = useState<Record<string, number>>({});
  const [allSuppliersFinalized, setAllSuppliersFinalized] = useState(false);
  const [loadingScenario, setLoadingScenario] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);
  const [seedingHistory, setSeedingHistory] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);

  // Listen for navigation to Volume Acceptance from Award Volume
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setMainView('volume_acceptance');
      if (event.detail?.weekId && selectedWeek?.id !== event.detail.weekId) {
        // Week is already selected, just switch view
      }
    };

    window.addEventListener('navigate-to-volume-acceptance', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate-to-volume-acceptance', handleNavigate as EventListener);
    };
  }, [selectedWeek]);

  useEffect(() => {
    if (selectedWeek && selectedSupplier) {
      loadQuotes();
      setCounterInputs({});
      setFinalInputs({});
    }
  }, [selectedWeek, selectedSupplier]);

  useEffect(() => {
    if (selectedWeek?.status === 'open' && quotes.length > 0 && selectedSupplier) {
      const newCounterInputs: Record<string, string> = {};
      const newFinalInputs: Record<string, string> = {};

      quotes.forEach(quote => {
        if (quote.rf_counter_fob && quote.supplier_fob) {
          newCounterInputs[quote.item_id] = quote.rf_counter_fob.toString();
        }
        if (quote.rf_final_fob && quote.supplier_response) {
          newFinalInputs[quote.item_id] = quote.rf_final_fob.toString();
        }
      });

      if (Object.keys(newCounterInputs).length > 0) {
        setCounterInputs(newCounterInputs);
      }
      if (Object.keys(newFinalInputs).length > 0) {
        setFinalInputs(newFinalInputs);
      }
    }
  }, [selectedWeek?.status, quotes, selectedSupplier]);

  const loadData = useCallback(async () => {
    try {
      await enforceWeekStatusHygiene();

      const [weeksData, itemsData, suppliersData] = await Promise.all([
        fetchWeeks(),
        fetchItems(),
        fetchSuppliers(),
      ]);
      setWeeks(weeksData);
      setItems(itemsData);
      setSuppliers(suppliersData);
      
      if (suppliersData.length === 0) {
        logger.warn('No suppliers found in database');
        showToast('No suppliers found. Please add suppliers to the database.', 'warning');
      } else {
        // Suppliers loaded successfully
      }

      // Batch fetch all quotes at once instead of sequential loop (N+1 optimization)
      const { supabase } = await import('../utils/supabase');
      const weekIds = weeksData.map(w => w.id);
      const { data: allQuotes } = await supabase
        .from('quotes')
        .select('week_id, supplier_fob')
        .in('week_id', weekIds)
        .not('supplier_fob', 'is', null);

      // Calculate averages from batched data
      const averages: Record<string, number> = {};
      for (const week of weeksData) {
        const weekQuotes = allQuotes?.filter(q => q.week_id === week.id) || [];
        const prices = weekQuotes
          .map(q => q.supplier_fob)
          .filter((p): p is number => p !== null && p !== undefined);

        if (prices.length > 0) {
          const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
          averages[week.id] = avg;
        }
      }
      setWeekAverages(averages);

      // Select OPEN week ordered by start_date DESC
      const openWeeks = weeksData
        .filter(w => w.status === 'open')
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

      const openWeek = openWeeks[0];

      if (openWeek) {
        setSelectedWeek(openWeek);
      } else {
        // If no open week, select the most recent week (closed or open) for viewing
        const allWeeksSorted = [...weeksData].sort((a, b) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        if (allWeeksSorted.length > 0) {
          setSelectedWeek(allWeeksSorted[0]);
        }
      }
    } catch (err) {
      logger.error('Error loading data:', err);
      showToast('Failed to load dashboard data. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWeekData = useCallback(async () => {
    if (!selectedWeek) return;
    try {
      await ensureQuotesForWeek(selectedWeek.id);
      const supplierData = await getSuppliersWithSubmissions(selectedWeek.id);
      setSubmittedSuppliers(supplierData.submitted);
      setNotSubmittedSuppliers(supplierData.notSubmitted);
      setCounterSuppliers(supplierData.counter);
      setFinalizedSuppliers(supplierData.finalized);
    } catch (err) {
      logger.error('Error loading week data:', err);
    }
  }, [selectedWeek]);

  const loadQuotes = useCallback(async () => {
    if (!selectedWeek || !selectedSupplier) return;
    try {
      const quotesData = await fetchQuotesWithDetails(selectedWeek.id, selectedSupplier.id);
      setQuotes(quotesData);
    } catch (err) {
      logger.error('Error loading quotes:', err);
      showToast('Failed to load quotes. Please try again.', 'error');
    }
  }, [selectedWeek, selectedSupplier]);

  // Set up realtime subscriptions after functions are defined
  const handleRealtimeQuotes = useCallback(() => {
    if (selectedWeek) {
      loadWeekData().catch(err => logger.error('Error in realtime loadWeekData:', err));
    }
    if (selectedWeek && selectedSupplier) {
      loadQuotes().catch(err => logger.error('Error in realtime loadQuotes:', err));
    }
  }, [selectedWeek, selectedSupplier, loadWeekData, loadQuotes]);
  
  useRealtime('quotes', handleRealtimeQuotes);
  useRealtime('weeks', loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedWeek) {
      loadWeekData();
      loadVolumeNeeds();
    }
  }, [selectedWeek, loadWeekData]);

  async function loadVolumeNeeds() {
    if (!selectedWeek) return;
    try {
      const volumeData = await fetchVolumeNeeds(selectedWeek.id);
      const volumeMap = new Map<string, number>();
      volumeData.forEach(v => {
        volumeMap.set(v.item_id, v.volume_needed || 0);
      });
      setVolumeNeedsMap(volumeMap);
    } catch (err) {
      logger.error('Error loading volume needs:', err);
    }
  }

  useEffect(() => {
    if (selectedWeek && selectedSupplier) {
      loadQuotes();
      setCounterInputs({});
      setFinalInputs({});
    }
  }, [selectedWeek, selectedSupplier, loadQuotes]);

  // Check if all suppliers are finalized
  useEffect(() => {
    const checkAllSuppliersFinalized = async () => {
      if (!selectedWeek || selectedWeek.status !== 'open') {
        setAllSuppliersFinalized(false);
        return;
      }
      
      try {
        const allQuotes = await fetchQuotesWithDetails(selectedWeek.id);
        const supplierIds = new Set(allQuotes.map(q => q.supplier_id));
        if (supplierIds.size === 0) {
          setAllSuppliersFinalized(false);
          return;
        }
        
        const allFinalized = Array.from(supplierIds).every(supplierId => {
          const supplierQuotes = allQuotes.filter(q => q.supplier_id === supplierId && q.supplier_fob !== null);
          return supplierQuotes.length > 0 && supplierQuotes.every(q => q.rf_final_fob !== null && q.rf_final_fob !== undefined);
        });
        setAllSuppliersFinalized(allFinalized);
      } catch (err) {
        logger.error('Error checking all suppliers finalized:', err);
        setAllSuppliersFinalized(false);
      }
    };
    
    checkAllSuppliersFinalized();
  }, [selectedWeek?.id, selectedWeek?.status, submittedSuppliers, finalizedSuppliers, quotes]);

  // Multi-Supplier-Per-SKU View:
  // When RF clicks "Quotes" button, this loads ALL suppliers' quotes for that SKU
  // This allows RF to compare prices across suppliers and make informed decisions
  // Each quote is independent: (week_id, item_id, supplier_id) - one per supplier per SKU
  async function toggleItemQuotes(itemId: string) {
    if (!selectedWeek) return;

    if (expandedItem === itemId) {
      setExpandedItem(null);
      return;
    }

    setExpandedItem(itemId);

    // Always reload to get latest data
    try {
      // Load all quotes for this SKU across all suppliers
      const quotes = await getQuotesForItem(selectedWeek.id, itemId);
      setItemQuotes(prev => ({ ...prev, [itemId]: quotes }));
    } catch (err) {
      logger.error('Error loading item quotes:', err);
    }
  }

  const handleSubmitCounters = async () => {
    if (submittingCounters) return;

    const updates = Object.entries(counterInputs).filter(([_, v]) => v);

    if (updates.length === 0) {
      // Quiet UI: No warning during planning
      return;
    }

    setSubmittingCounters(true);
    try {
      let successCount = 0;
      for (const [itemId, value] of updates) {
        const quote = quotes.find(q => q.item_id === itemId);
        if (!quote) continue;

        const counter = parseFloat(parseFloat(value).toFixed(2));
        const success = await updateRFCounter(quote.id, counter);
        if (success) successCount++;
      }

      if (successCount > 0) {
        showToast(`${successCount} counter(s) submitted successfully`, 'success');
        setCounterInputs({});
        await loadWeekData();
        setSelectedSupplier(null);
      } else {
        showToast('Just a note: Counters not submitted', 'error');
      }
    } finally {
      setSubmittingCounters(false);
    }
  };

  const handleSubmitFinals = async () => {
    if (submittingFinals) return;

    const updates = Object.entries(finalInputs).filter(([_, v]) => v);

    if (updates.length === 0) {
      showToast('Please enter at least one final price', 'error');
      return;
    }

    setSubmittingFinals(true);
    try {
      let successCount = 0;

      for (const [itemId, value] of updates) {
        const quote = quotes.find(q => q.item_id === itemId);
        if (!quote) continue;

        const final = parseFloat(parseFloat(value).toFixed(2));
        const success = await updateRFFinal(quote.id, final);
        if (success) successCount++;
      }

      // Auto-finalize logic: only handle quotes that need manual finalization
      // (accepted counters are already auto-finalized when supplier responds)
      for (const quote of quotes) {
        if (!quote.rf_final_fob && !finalInputs[quote.item_id] && quote.supplier_fob !== null) {
          // Supplier revised - RF needs to review and finalize
          if (quote.supplier_revised_fob) {
            await updateRFFinal(quote.id, quote.supplier_revised_fob);
            successCount++;
          } 
          // Supplier accepted counter - already auto-finalized, skip
          // Direct accept (no counter) - finalize to supplier's price
          else if (!quote.rf_counter_fob) {
            await updateRFFinal(quote.id, quote.supplier_fob);
            successCount++;
          }
        }
      }

      if (successCount > 0) {
        showToast(`${successCount} final price(s) set successfully`, 'success');
        setFinalInputs({});
        await loadWeekData();
        setSelectedSupplier(null);
      } else {
        showToast('Heads up: Final prices not set', 'error');
      }
    } finally {
      setSubmittingFinals(false);
    }
  };

  const handlePushToFinalize = async () => {
    if (submittingCounters || submittingFinals) return;

    const hasCounters = Object.entries(counterInputs).filter(([_, v]) => v).length > 0;
    const hasFinals = Object.entries(finalInputs).filter(([_, v]) => v).length > 0;
    const hasSupplierResponses = quotes.some(q => q.supplier_response !== null);
    const hasExistingCounters = quotes.some(q => q.rf_counter_fob !== null);
    const hasSupplierPrices = quotes.some(q => q.supplier_fob !== null);

    // Allow finalization if there are any quotes with supplier prices, even without manual inputs
    if (!hasCounters && !hasFinals && !hasSupplierResponses && !hasExistingCounters && !hasSupplierPrices) {
      showToast('No pricing data to finalize. Please enter supplier prices first.', 'error');
      return;
    }

    setSubmittingCounters(true);
    setSubmittingFinals(true);
    try {
      let counterCount = 0;
      let finalCount = 0;

      // First, send any counters that were entered
      if (hasCounters) {
        for (const [itemId, value] of Object.entries(counterInputs)) {
          if (!value) continue;
          const quote = quotes.find(q => q.item_id === itemId);
          if (!quote) continue;

          const counter = parseFloat(parseFloat(value).toFixed(2));
          const success = await updateRFCounter(quote.id, counter);
          if (success) counterCount++;
        }
      }

      // Then, set final prices for all quotes that need them
      // Process manually entered final prices first
      if (hasFinals) {
        for (const [itemId, value] of Object.entries(finalInputs)) {
          if (!value) continue;
          const quote = quotes.find(q => q.item_id === itemId);
          if (!quote || quote.rf_final_fob) continue;

          const final = parseFloat(parseFloat(value).toFixed(2));
          const success = await updateRFFinal(quote.id, final);
          if (success) finalCount++;
        }
      }

      // Auto-finalize logic: handle ALL quotes that need finalization
      for (const quote of quotes) {
        // Skip if already has final price
        if (quote.rf_final_fob) continue;
        
        // Skip if manually entered in finalInputs (already processed above)
        if (finalInputs[quote.item_id]) continue;
        
        // Only process quotes with supplier prices
        if (quote.supplier_fob === null) continue;

        // Supplier revised - RF should use revised price
        if (quote.supplier_revised_fob) {
          const success = await updateRFFinal(quote.id, quote.supplier_revised_fob);
          if (success) finalCount++;
        } 
        // Supplier accepted counter - use counter price
        else if (quote.rf_counter_fob && quote.supplier_response === 'accept') {
          const success = await updateRFFinal(quote.id, quote.rf_counter_fob);
          if (success) finalCount++;
        }
        // Counter exists but no supplier response yet - finalize to counter price
        else if (quote.rf_counter_fob && !quote.supplier_response) {
          const success = await updateRFFinal(quote.id, quote.rf_counter_fob);
          if (success) finalCount++;
        }
        // No counter, just supplier price - finalize to supplier's price
        else if (!quote.rf_counter_fob && quote.supplier_fob) {
          const success = await updateRFFinal(quote.id, quote.supplier_fob);
          if (success) finalCount++;
        }
      }

      const messages = [];
      if (counterCount > 0) messages.push(`${counterCount} counter(s) sent`);
      if (finalCount > 0) messages.push(`${finalCount} final price(s) set`);

      if (messages.length > 0) {
        showToast(messages.join(', '), 'success');
        setCounterInputs({});
        setFinalInputs({});
        // Reload quotes and week data to refresh supplier statuses
        await loadQuotes();
        await loadWeekData();
        
        // Check if this supplier is now fully finalized (all quotes have rf_final_fob)
        const updatedQuotes = await fetchQuotesWithDetails(selectedWeek!.id, selectedSupplier!.id);
        const supplierFullyFinalized = updatedQuotes.length > 0 && 
          updatedQuotes.every(q => q.rf_final_fob !== null && q.rf_final_fob !== undefined);
        
        if (supplierFullyFinalized) {
          showToast(`${selectedSupplier!.name} pricing finalized!`, 'success');
          
          // Check if all suppliers for this week are finalized
          const { supabase } = await import('../utils/supabase');
          const allQuotes = await fetchQuotesWithDetails(selectedWeek!.id);
          
          // Get unique suppliers that have quotes
          const supplierIds = new Set(allQuotes.map(q => q.supplier_id));
          const allSuppliersFinalized = Array.from(supplierIds).every(supplierId => {
            const supplierQuotes = allQuotes.filter(q => q.supplier_id === supplierId && q.supplier_fob !== null);
            // Supplier is finalized if all their quotes with prices have rf_final_fob
            return supplierQuotes.length > 0 && supplierQuotes.every(q => q.rf_final_fob !== null);
          });
          
          // If all suppliers are finalized, finalize the week and switch to volume tab
          if (allSuppliersFinalized && selectedWeek && selectedWeek.status === 'open') {
            try {
              const result = await finalizePricingForWeek(selectedWeek.id, session?.user_name || 'RF Manager');
              if (result.success) {
                // Fetch updated week status
                const { data: updatedWeekData } = await supabase
                  .from('weeks')
                  .select('*')
                  .eq('id', selectedWeek.id)
                  .single();
                
                if (updatedWeekData) {
                  const updatedWeek = updatedWeekData as Week;
                  setSelectedWeek(updatedWeek);
                  setWeeks(prev => prev.map(w => w.id === selectedWeek.id ? updatedWeek : w));
                  
                  // Clear selected supplier and switch to volume tab
                  setSelectedSupplier(null);
                  setTimeout(() => {
                    setMainView('award_volume');
                    showToast('All suppliers finalized! Volume allocation is now available.', 'success');
                  }, 500);
                }
              }
            } catch (err) {
              logger.error('Error finalizing week:', err);
            }
          }
        }
      } else {
        showToast('No changes were made. All prices may already be finalized.', 'info');
        // Still reload to check if finalize button should appear
        await loadQuotes();
        await loadWeekData();
      }
    } catch (err) {
      logger.error('Error in handlePushToFinalize:', err);
      showToast('Failed to finalize prices. Please try again.', 'error');
    } finally {
      setSubmittingCounters(false);
      setSubmittingFinals(false);
    }
  };

  const handleSendReminder = async (supplier: Supplier) => {
    if (!selectedWeek || sendingReminders[supplier.id]) return;

    // Get test email from environment or use supplier email
    const testEmail = import.meta.env.VITE_TEST_EMAIL;
    const recipientEmail = testEmail || supplier.email;
    const isTestMode = !!testEmail;

    setSendingReminders(prev => ({ ...prev, [supplier.id]: true }));
    try {
      const result = await sendPricingReminder(supplier, selectedWeek, selectedWeek.id, testEmail);
      
      if (result.success) {
        const message = isTestMode 
          ? `Test reminder sent to ${testEmail} (would go to ${supplier.name})`
          : `Reminder sent to ${supplier.name}`;
        showToast(message, 'success');
      } else {
        showToast(`Failed to send reminder: ${result.error}`, 'error');
      }
    } catch (err: unknown) {
      logger.error('Error sending reminder:', err);
      showToast(`Failed to send reminder: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setSendingReminders(prev => ({ ...prev, [supplier.id]: false }));
    }
  };

  const handleCreateWeek = async () => {
    if (creatingWeek) return;

    setCreatingWeek(true);
    try {
      const newWeek = await createNewWeek();
      if (newWeek) {
        showToast(`Week ${newWeek.week_number} created and opened for all suppliers`, 'success');
        setShowCreateWeekModal(false);
        await loadData();
        setSelectedWeek(newWeek);
      } else {
        showToast('Failed to create new week', 'error');
      }
    } finally {
      setCreatingWeek(false);
    }
  };

  const handleFinalizeItem = async (itemId: string) => {
    if (!selectedWeek || finalizingItems[itemId]) return;

    setFinalizingItems(prev => ({ ...prev, [itemId]: true }));
    try {
      // Get all quotes for this item
      const itemQuotesList = itemQuotes[itemId] || [];
      const quotesToFinalize = itemQuotesList.filter(q => !q.rf_final_fob && q.supplier_fob !== null);
      
      if (quotesToFinalize.length === 0) {
        showToast('No quotes to finalize for this item', 'info');
        return;
      }

      let finalizedCount = 0;
      for (const quote of quotesToFinalize) {
        // Use supplier revised price if available, otherwise use counter or supplier price
        const finalPrice = quote.supplier_revised_fob || quote.rf_counter_fob || quote.supplier_fob;
        if (finalPrice) {
          const success = await updateRFFinal(quote.id, finalPrice);
          if (success) finalizedCount++;
        }
      }

      if (finalizedCount > 0) {
        showToast(`${finalizedCount} quote(s) finalized for ${items.find(i => i.id === itemId)?.name}`, 'success');
        // Reload quotes for this item
        await toggleItemQuotes(itemId);
        await loadQuotes();
      } else {
        showToast('No quotes were finalized', 'info');
      }
    } catch (err) {
      logger.error('Error finalizing item:', err);
      showToast('Failed to finalize item', 'error');
    } finally {
      setFinalizingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleFinalizePricing = async () => {
    if (!selectedWeek || finalizingPricing) return;

    // Validate that all quotes with pricing have rf_final_fob set
    const quotesWithPricing = quotes.filter(q => 
      (q.supplier_fob !== null && q.supplier_fob !== undefined) || 
      (q.supplier_revised_fob !== null && q.supplier_revised_fob !== undefined)
    );
    const incompleteQuotes = quotesWithPricing.filter(q => 
      q.rf_final_fob === null || q.rf_final_fob === undefined
    );
    
    if (incompleteQuotes.length > 0) {
      // Group incomplete quotes by supplier and item for clearer error message
      const incompleteBySupplier = new Map<string, string[]>();
      incompleteQuotes.forEach(q => {
        const supplierName = q.supplier?.name || 'Unknown Supplier';
        const itemName = q.item?.name || 'Unknown Item';
        const key = `${supplierName} - ${itemName}`;
        if (!incompleteBySupplier.has(key)) {
          incompleteBySupplier.set(key, []);
        }
      });
      
      const missingCount = incompleteQuotes.length;
      const errorMessage = `${missingCount} quote${missingCount > 1 ? 's' : ''} missing RF Final FOB. Please set final prices for all quotes with supplier pricing before finalizing.`;
      showToast(errorMessage, 'error');
      return;
    }

    setFinalizingPricing(true);
    try {
      logger.debug(`Finalizing pricing for week ${selectedWeek.week_number} (${selectedWeek.id})`);
      const result = await finalizePricingForWeek(selectedWeek.id, session?.user_name || 'RF Manager');
      
      if (result.success) {
        logger.debug('Pricing finalized successfully, fetching updated week...');
        
        // Fetch the updated week from database to ensure we have the latest state
        const { supabase } = await import('../utils/supabase');
        const { data: updatedWeekData, error: weekError } = await supabase
          .from('weeks')
          .select('*')
          .eq('id', selectedWeek.id)
          .single();

        if (weekError || !updatedWeekData) {
          logger.error('Error fetching updated week:', weekError);
          showToast('Pricing finalized but failed to refresh week status. Please refresh the page.', 'warning');
          // Fallback to local update
          const updatedWeek = { 
            ...selectedWeek, 
            status: 'finalized' as const
          };
          setSelectedWeek(updatedWeek);
          setWeeks(prev => prev.map(w => w.id === selectedWeek.id ? updatedWeek : w));
        } else {
          logger.debug(`Week status updated to: ${updatedWeekData.status}`);
          // Use the actual updated week from database
          const updatedWeek = updatedWeekData as Week;
          setSelectedWeek(updatedWeek);
          setWeeks(prev => prev.map(w => w.id === selectedWeek.id ? updatedWeek : w));
        }
        
        // Reload week data to refresh supplier statuses
        await loadWeekData();
        
        // Automatically switch to Award Volume tab after finalizing pricing
        // Use a small delay to ensure state is fully updated
        setTimeout(() => {
          logger.debug('Switching to award_volume tab');
          setMainView('award_volume');
          showToast('Pricing finalized! Volume allocation is now available.', 'success');
        }, 300);
      } else {
        logger.error('Failed to finalize pricing:', result.error);
        showToast(result.error || 'Failed to finalize pricing', 'error');
      }
    } catch (err) {
      logger.error('Error finalizing pricing:', err);
      showToast('Failed to finalize pricing. Please try again.', 'error');
    } finally {
      setFinalizingPricing(false);
    }
  };

  const handleEmergencyReopen = async () => {
    if (!selectedWeek || finalizingPricing) return;

    setFinalizingPricing(true);
    try {
      const success = await updateWeekStatus(selectedWeek.id, 'open');
      if (success) {
        setSelectedWeek({ ...selectedWeek, status: 'open' });
        showToast('Week reopened for emergency changes. All pricing and allocations can now be edited.', 'success');
        await loadData();
      } else {
        showToast('Failed to reopen week', 'error');
      }
    } finally {
      setFinalizingPricing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-emerald-800 font-semibold text-lg">Loading RF Dashboard...</p>
      </div>
    </div>;
  }

  // Empty state: no data at all
  if (suppliers.length === 0 || items.length === 0 || weeks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
          <p className="text-white/60 mb-4">
            The database is empty. Please seed the database to get started.
          </p>
          <div className="bg-white/5 rounded-lg border border-white/10 p-4 text-left text-sm text-white/70">
            <p className="font-semibold mb-2">Current Status:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{suppliers.length} suppliers</li>
              <li>{items.length} items</li>
              <li>{weeks.length} weeks</li>
            </ul>
            <p className="mt-4 font-semibold">To get started:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Go to the login page</li>
              <li>Click "Seed Database" button (visible in dev mode)</li>
              <li>Or run the SQL seed script in Supabase</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const handleLoadScenario = async () => {
    setLoadingScenario(true);
    try {
      const result = await loadAllocationScenario();
      if (result.success) {
        showToast(result.message, 'success');
        // Reload all data to refresh weeks list
        await loadData();
        // Auto-select the test week after data reloads
        setTimeout(async () => {
          const allWeeks = await fetchWeeks();
          const testWeek = allWeeks.find(w => w.week_number === 999);
          if (testWeek) {
            setSelectedWeek(testWeek);
          }
        }, 500);
      } else {
        showToast(result.message, 'error');
      }
    } catch (error: any) {
      logger.error('Error loading scenario:', error);
      showToast('Failed to load scenario', 'error');
    } finally {
      setLoadingScenario(false);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Are you sure you want to reset the demo? This will delete Week #999 and all its data.')) {
      return;
    }
    setResettingDemo(true);
    try {
      const result = await removeAllocationScenario();
      if (result.success) {
        showToast(result.message, 'success');
        await loadData();
        // Clear the auto-load flag so it can be reloaded
        localStorage.removeItem('allocation_scenario_loaded');
      } else {
        showToast(result.message, 'error');
      }
    } catch (error: any) {
      logger.error('Error resetting demo:', error);
      showToast('Failed to reset demo', 'error');
    } finally {
      setResettingDemo(false);
    }
  };

  const isReadOnly = selectedWeek?.status !== 'open';
  const hasInitialPrices = quotes.some(q => q.supplier_fob !== null);
  const hasCountersSent = quotes.some(q => q.rf_counter_fob !== null);
  const canSendCounters = !isReadOnly && hasInitialPrices && !hasCountersSent;
  
  // Check if current supplier is already finalized (all quotes have rf_final_fob)
  const supplierAlreadyFinalized = quotes.length > 0 && 
    quotes.filter(q => q.supplier_fob !== null).length > 0 &&
    quotes.filter(q => q.supplier_fob !== null).every(q => q.rf_final_fob !== null && q.rf_final_fob !== undefined);
  
  // Can set final if: not readonly, has counters sent, and supplier NOT already finalized
  const canSetFinal = !isReadOnly && hasCountersSent && !supplierAlreadyFinalized;

  // Pricing Finalization Gates:
  // - Week must be 'open' status
  // - ALL quotes with pricing data (supplier_fob or supplier_revised_fob) must have rf_final_fob set
  // - finalizePricingForWeek() validates that at least one quote has rf_final_fob
  const allFinalPricesSet = quotes.length > 0 && quotes.every(q => q.rf_final_fob !== null);
  const hasAnyFinalPrices = quotes.some(q => q.rf_final_fob !== null);
  
  // Find quotes that have pricing but are missing rf_final_fob
  const quotesWithPricing = quotes.filter(q => 
    (q.supplier_fob !== null && q.supplier_fob !== undefined) || 
    (q.supplier_revised_fob !== null && q.supplier_revised_fob !== undefined)
  );
  const incompleteQuotes = quotesWithPricing.filter(q => 
    q.rf_final_fob === null || q.rf_final_fob === undefined
  );
  const allQuotesWithPricingFinalized = quotesWithPricing.length > 0 && incompleteQuotes.length === 0;
  
  // Can finalize only if ALL quotes with pricing have rf_final_fob set
  const canFinalizePricing = selectedWeek?.status === 'open' && allQuotesWithPricingFinalized;
  const isPricingFinalized = selectedWeek?.status === 'finalized';

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl"></div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)'
        }}
      ></div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <header className="relative bg-white/10 backdrop-blur-2xl shadow-2xl border-b-2 border-emerald-500/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/image.png"
                alt="Robinson Fresh"
                className="h-16 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="border-l-2 border-emerald-400/30 pl-4">
                <h1 className="text-2xl font-bold text-white">Robinson Fresh</h1>
                <p className="text-sm text-emerald-300 font-semibold">Volume & Pricing Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <button
                onClick={handleLoadScenario}
                disabled={loadingScenario}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600/80 hover:bg-blue-600 border border-blue-500/50 rounded-md transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Load test scenario (Week #999 with 2 lb Strawberries)"
              >
                {loadingScenario ? (
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Zap className="w-3 h-3" />
                )}
                Load Scenario
              </button>
              <button
                onClick={handleResetDemo}
                disabled={resettingDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-orange-600/80 hover:bg-orange-600 border border-orange-500/50 rounded-md transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset demo (delete Week #999)"
              >
                {resettingDemo ? (
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Reset Demo
              </button>
              <button
                onClick={async () => {
                  setSeedingDemo(true);
                  try {
                    const result = await seedCompleteDemo();
                    if (result.success) {
                      showToast(result.message, 'success');
                      await loadData();
                      // Auto-select the finalized week
                      setTimeout(async () => {
                        const allWeeks = await fetchWeeks();
                        const finalizedWeek = allWeeks.find(w => w.status === 'finalized');
                        if (finalizedWeek) {
                          setSelectedWeek(finalizedWeek);
                          setMainView('award_volume'); // Switch to allocation tab
                        }
                      }, 500);
                    } else {
                      showToast(result.message, 'error');
                    }
                  } catch (error: any) {
                    showToast(`Failed to seed demo: ${error.message}`, 'error');
                  } finally {
                    setSeedingDemo(false);
                  }
                }}
                disabled={seedingDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-purple-600/80 hover:bg-purple-600 border border-purple-500/50 rounded-md transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Create complete demo: All suppliers priced all SKUs, countered, accepted, and finalized"
              >
                {seedingDemo ? (
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Seed Demo
              </button>
              <button
                onClick={async () => {
                  setSeedingHistory(true);
                  try {
                    const result = await seedHistoricalAllocations();
                    if (result.success) {
                      showToast(result.message, 'success');
                      await loadData();
                    } else {
                      showToast(result.message, 'error');
                    }
                  } catch (error: any) {
                    showToast(`Failed to seed historical data: ${error.message}`, 'error');
                  } finally {
                    setSeedingHistory(false);
                  }
                }}
                disabled={seedingHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/50 rounded-md transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Create historical weeks with complete allocation data for comparison mode"
              >
                {seedingHistory ? (
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                Seed History
              </button>
              <button
                onClick={() => setShowCreateWeekModal(true)}
                disabled={creatingWeek}
                className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingWeek ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Week
                  </>
                )}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Main Workflow Tabs: Pricing → Award Volume → Acceptance */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white mb-2">Volume Management Workflow</h2>
            <p className="text-sm text-emerald-200">Manage the complete cycle: Pricing negotiation → Volume allocation → Supplier acceptance</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setMainView('pricing')}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 border-2 ${
                mainView === 'pricing'
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500 shadow-2xl scale-105'
                  : 'bg-white/10 backdrop-blur-md border-white/20 hover:border-emerald-400/50 hover:bg-white/15 hover:shadow-xl hover:scale-102 shadow-lg'
              }`}
            >
              <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    mainView === 'pricing'
                      ? 'bg-white/20'
                      : 'bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors'
                  }`}>
                    <DollarSign className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  {mainView === 'pricing' && (
                    <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">1. Pricing</h3>
                <p className="text-sm text-white/90">
                  Negotiate pricing with suppliers
                </p>
              </div>
            </button>

            <button
              onClick={() => setMainView('award_volume')}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 border-2 ${
                mainView === 'award_volume'
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500 shadow-2xl scale-105'
                  : 'bg-white/10 backdrop-blur-md border-white/20 hover:border-emerald-400/50 hover:bg-white/15 hover:shadow-xl hover:scale-102 shadow-lg'
              }`}
            >
              <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    mainView === 'award_volume'
                      ? 'bg-white/20'
                      : 'bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors'
                  }`}>
                    <Award className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  {mainView === 'award_volume' && (
                    <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">2. Award Volume</h3>
                <p className="text-sm text-white/90">
                  Allocate volume to suppliers
                </p>
              </div>
            </button>

            {/* Volume Acceptance tab - DISABLED FOR DEMO (handled in Allocation exceptions mode) */}
            <button
              onClick={() => {}}
              disabled
              className="group relative overflow-hidden rounded-xl transition-all duration-300 border-2 opacity-40 cursor-not-allowed bg-white/5 backdrop-blur-md border-white/10 shadow-lg"
              title="Volume Acceptance is now handled in Allocation tab (Exceptions Mode)"
            >
              <div className="p-6 text-white/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/10">
                    <CheckCircle className="w-6 h-6 text-white/30" strokeWidth={2.5} />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">3. Acceptance</h3>
                <p className="text-sm text-white/40">
                  (Handled in Allocation tab)
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Analytics & Intelligence - Separate Section */}
        {mainView !== 'volume_acceptance' && (
        <div className="mb-10">
          <div className="border-t border-white/10 pt-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white mb-2">Analytics & Intelligence</h2>
              <p className="text-sm text-emerald-200">AI-powered insights, predictions, and comprehensive performance analytics</p>
            </div>
            
            {/* Intelligence Tabs */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setMainView('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mainView === 'analytics'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Analytics
              </button>
              <button
                onClick={() => setMainView('intelligence')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mainView === 'intelligence'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                AI Insights
              </button>
              <button
                onClick={() => setMainView('predictions')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mainView === 'predictions'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Predictions
              </button>
            </div>
            <button
              onClick={() => setMainView('analytics')}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 border-2 w-full ${
                mainView === 'analytics'
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500 shadow-2xl'
                  : 'bg-white/10 backdrop-blur-md border-white/20 hover:border-emerald-400/50 hover:bg-white/15 hover:shadow-xl shadow-lg'
              }`}
            >
              <div className="p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      mainView === 'analytics'
                        ? 'bg-white/20'
                        : 'bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors'
                    }`}>
                      <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1">Analytics</h3>
                      <p className="text-sm text-white/90">
                        View insights, trends, and performance metrics across all weeks and suppliers
                      </p>
                    </div>
                  </div>
                  {mainView === 'analytics' && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>
        )}

        {mainView === 'analytics' ? (
          <Analytics />
        ) : mainView === 'intelligence' ? (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <PricingIntelligence 
                quotes={selectedWeek ? quotes.filter(q => q.week_id === selectedWeek.id) : quotes}
                items={items}
                week={selectedWeek || undefined}
              />
            </div>
          </div>
        ) : mainView === 'predictions' ? (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <PredictiveAnalytics 
                quotes={selectedWeek ? quotes.filter(q => q.week_id === selectedWeek.id) : quotes}
                items={items}
                historicalData={[]}
              />
            </div>
          </div>
        ) : mainView === 'executive' ? (
          <ExecutiveDashboard />
        ) : mainView === 'alerts' ? (
          <SmartAlerts />
        ) : mainView === 'award_volume' ? (
          <AwardVolume 
            selectedWeek={selectedWeek} 
            onWeekUpdate={(updatedWeek) => {
              setSelectedWeek(updatedWeek);
              // Also update in weeks list
              setWeeks(prev => prev.map(w => w.id === updatedWeek.id ? updatedWeek : w));
            }}
          />
        ) : mainView === 'volume_acceptance' ? (
          // Volume Acceptance is now part of Allocation component (Exceptions mode)
          selectedWeek ? (
            <Allocation 
              selectedWeek={selectedWeek} 
              onWeekUpdate={(updatedWeek) => {
                setSelectedWeek(updatedWeek);
                setWeeks(prev => prev.map(w => w.id === updatedWeek.id ? updatedWeek : w));
              }}
            />
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-12 text-center">
              <p className="text-white/80 text-lg font-semibold mb-2">No Week Selected</p>
              <p className="text-white/60">Please select a week from the Pricing tab to view volume acceptances.</p>
            </div>
          )
        ) : (
          <div>
        {/* Week & Supplier Selection - Compact */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5 flex items-center gap-2">
                <Package className="w-3.5 h-3.5" />
                Week
              </label>
              <div className="relative">
                <select
                  value={selectedWeek?.id || ''}
                  onChange={e => {
                    const week = weeks.find(w => w.id === e.target.value);
                    setSelectedWeek(week || null);
                    setSelectedSupplier(null);
                  }}
                  className="w-full px-3 py-2 pr-8 text-sm border-2 border-white/20 bg-white/10 backdrop-blur-sm rounded-lg font-medium text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-lg hover:border-white/30 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-white">Select week...</option>
                  {weeks.map(week => (
                    <option key={week.id} value={week.id} className="bg-slate-900 text-white">
                      Week {week.week_number} - {week.status.toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-emerald-300 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {selectedWeek && (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    selectedWeek.status === 'open' ? 'bg-emerald-500/30 text-emerald-300' :
                    selectedWeek.status === 'finalized' ? 'bg-blue-500/30 text-blue-300' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {selectedWeek.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-white/60">
                    {selectedWeek.start_date} - {selectedWeek.end_date}
                  </span>
                </div>
              )}
            </div>

            {selectedWeek && (
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1.5 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" />
                  Supplier
                </label>
                <div className="relative">
                  <select
                    value={selectedSupplier?.id || ''}
                    onChange={e => {
                      const supplier = suppliers.find(s => s.id === e.target.value);
                      setSelectedSupplier(supplier || null);
                    }}
                    className="w-full px-3 py-2 pr-8 text-sm border-2 border-white/20 bg-white/10 backdrop-blur-sm rounded-lg font-medium text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-lg hover:border-white/30 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-white">Select supplier...</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id} className="bg-slate-900 text-white">
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-emerald-300 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {selectedSupplier && (
                  <div className="mt-1.5">
                    <button
                      onClick={() => setSelectedSupplier(null)}
                      className="text-xs text-emerald-300 hover:text-emerald-200 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedWeek && !selectedSupplier && mainView === 'pricing' && (
          <>
            <QuickStats weekId={selectedWeek.id} />
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 transition-all duration-300 overflow-hidden hover:bg-white/15 hover:border-emerald-400/50 hover:shadow-xl group">
              <button
                onClick={() => setExpandedCard(expandedCard === 'not_submitted' ? null : 'not_submitted')}
                className="w-full p-3.5 text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-white/90 uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                    Not Submitted
                  </h3>
                  <span className="px-2.5 py-1 bg-white/20 text-white rounded-full text-xs font-bold shadow-sm">{notSubmittedSuppliers.length}</span>
                </div>
                <div className="space-y-1.5">
                  {(expandedCard === 'not_submitted' ? notSubmittedSuppliers : notSubmittedSuppliers.slice(0, 2)).map(supplier => (
                    <div key={supplier.id} className="flex items-center justify-between gap-2 group">
                      <div className="text-xs text-white/80 truncate font-medium hover:text-white transition-colors flex-1">
                        {supplier.name}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendReminder(supplier);
                        }}
                        disabled={sendingReminders[supplier.id] || !selectedWeek || selectedWeek.status !== 'open'}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/20 rounded text-emerald-300 hover:text-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Send pricing reminder email"
                      >
                        {sendingReminders[supplier.id] ? (
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                  {notSubmittedSuppliers.length === 0 && (
                    <p className="text-emerald-300 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      All submitted
                    </p>
                  )}
                </div>
              </button>
              {notSubmittedSuppliers.length > 2 && expandedCard !== 'not_submitted' && (
                <div className="px-3.5 pb-2.5 text-xs text-white/60 font-medium border-t border-white/5 pt-2">
                  +{notSubmittedSuppliers.length - 2} more
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border-l-2 border-emerald-500 transition-all duration-300 overflow-hidden hover:bg-white/15 hover:border-emerald-400 hover:shadow-xl group">
              <button
                onClick={() => setExpandedCard(expandedCard === 'submitted' ? null : 'submitted')}
                className="w-full p-3.5 text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></div>
                    Submitted
                  </h3>
                  <span className="px-2.5 py-1 bg-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold shadow-sm">{submittedSuppliers.length}</span>
                </div>
                <div className="space-y-1.5">
                  {(expandedCard === 'submitted' ? submittedSuppliers : submittedSuppliers.slice(0, 2)).map(supplier => (
                    <button
                      key={supplier.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSupplier(supplier);
                      }}
                      className="w-full text-left px-2 py-1 text-xs text-white/80 font-medium hover:text-emerald-300 rounded transition-all truncate hover:bg-white/5"
                    >
                      {supplier.name}
                    </button>
                  ))}
                  {submittedSuppliers.length === 0 && (
                    <p className="text-white/50 text-xs">None ready</p>
                  )}
                </div>
              </button>
              {submittedSuppliers.length > 2 && expandedCard !== 'submitted' && (
                <div className="px-3.5 pb-2.5 text-xs text-emerald-300 font-medium border-t border-white/5 pt-2">
                  +{submittedSuppliers.length - 2} more
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border-l-2 border-orange-500 transition-all duration-300 overflow-hidden hover:bg-white/15 hover:border-orange-400 hover:shadow-xl group">
              <button
                onClick={() => setExpandedCard(expandedCard === 'counter' ? null : 'counter')}
                className="w-full p-3.5 text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-orange-300 uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-sm shadow-orange-400/50"></div>
                    Counter
                  </h3>
                  <span className="px-2.5 py-1 bg-orange-500/30 text-orange-300 rounded-full text-xs font-bold shadow-sm">{counterSuppliers.length}</span>
                </div>
                <div className="space-y-1.5">
                  {(expandedCard === 'counter' ? counterSuppliers : counterSuppliers.slice(0, 2)).map(supplier => (
                    <button
                      key={supplier.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSupplier(supplier);
                      }}
                      className="w-full text-left px-2 py-1 text-xs text-white/80 font-medium hover:text-orange-300 rounded transition-all truncate hover:bg-white/5"
                    >
                      {supplier.name}
                    </button>
                  ))}
                  {counterSuppliers.length === 0 && (
                    <p className="text-white/50 text-xs">No responses</p>
                  )}
                </div>
              </button>
              {counterSuppliers.length > 2 && expandedCard !== 'counter' && (
                <div className="px-3.5 pb-2.5 text-xs text-orange-300 font-medium border-t border-white/5 pt-2">
                  +{counterSuppliers.length - 2} more
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border-l-2 border-emerald-500 transition-all duration-300 overflow-hidden hover:bg-white/15 hover:border-emerald-400 hover:shadow-xl group">
              <button
                onClick={() => setExpandedCard(expandedCard === 'finalized' ? null : 'finalized')}
                className="w-full p-3.5 text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></div>
                    Finalized
                  </h3>
                  <span className="px-2.5 py-1 bg-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold shadow-sm">{finalizedSuppliers.length}</span>
                </div>
                <div className="space-y-1.5">
                  {(expandedCard === 'finalized' ? finalizedSuppliers : finalizedSuppliers.slice(0, 2)).map(supplier => (
                    <button
                      key={supplier.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSupplier(supplier);
                      }}
                      className="w-full text-left px-2 py-1 text-xs text-white/80 font-medium hover:text-emerald-300 rounded transition-all truncate hover:bg-white/5"
                    >
                      {supplier.name}
                    </button>
                  ))}
                  {finalizedSuppliers.length === 0 && (
                    <p className="text-white/50 text-xs">None finalized</p>
                  )}
                </div>
              </button>
              {finalizedSuppliers.length > 2 && expandedCard !== 'finalized' && (
                <div className="px-3.5 pb-2.5 text-xs text-emerald-300 font-medium border-t border-white/5 pt-2">
                  +{finalizedSuppliers.length - 2} more
                </div>
              )}
            </div>
          </div>
          </>
        )}

        {selectedWeek && selectedSupplier && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/15 via-lime-500/15 to-emerald-500/15 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">{selectedSupplier.name}</h2>
                  <p className="text-sm text-white/80 mt-1">Week {selectedWeek.week_number} • {selectedWeek.start_date} to {selectedWeek.end_date}</p>
                </div>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                  Back to Suppliers
                </button>
              </div>
            </div>

            {/* Blended Cost Summary - Show when items are finalized */}
            {(() => {
              const finalizedItems = items.filter(item => {
                const quotes = itemQuotes[item.id] || [];
                return quotes.some(q => q.rf_final_fob !== null);
              });
              
              if (finalizedItems.length > 0) {
                // Calculate blended cost for finalized items using actual volumes
                let totalBlendedCost = 0;
                let totalVolume = 0;
                
                finalizedItems.forEach(item => {
                  const quotes = itemQuotes[item.id] || [];
                  const finalizedQuotes = quotes.filter(q => q.rf_final_fob !== null && q.awarded_volume && q.awarded_volume > 0);
                  
                  // Get actual volume from awarded_volume or volume_needed
                  let itemVolume = 0;
                  if (finalizedQuotes.length > 0) {
                    // Use awarded volumes if available
                    itemVolume = finalizedQuotes.reduce((sum, q) => sum + (q.awarded_volume || 0), 0);
                  }
                  
                  // Fallback to volume_needed if no awarded volumes yet
                  if (itemVolume === 0) {
                    itemVolume = volumeNeedsMap.get(item.id) || 0;
                  }
                  
                  if (finalizedQuotes.length > 0 && itemVolume > 0) {
                    // Calculate weighted average FOB based on awarded volumes
                    // Formula matches PricingCalculations.tsx for consistency
                    const totalAwardedVolume = finalizedQuotes.reduce((sum, q) => sum + (q.awarded_volume || 0), 0);
                    const weightedFOB = totalAwardedVolume > 0 
                      ? finalizedQuotes.reduce((sum, q) => {
                          const volume = q.awarded_volume || 0;
                          return sum + ((q.rf_final_fob || 0) * volume);
                        }, 0) / totalAwardedVolume
                      : 0;
                    
                    // Blended cost = FOB + Rebate + Freight (consistent formula across all components)
                    // Rebate and freight should come from item_pricing_calculations, but default to standard values
                    const rebate = 0.80;
                    const freight = 1.75;
                    const blendedCost = weightedFOB + rebate + freight;
                    
                    totalBlendedCost += blendedCost * itemVolume;
                    totalVolume += itemVolume;
                  } else if (finalizedQuotes.length > 0) {
                    // If no volumes yet, use simple average
                    const avgFOB = finalizedQuotes.reduce((sum, q) => sum + (q.rf_final_fob || 0), 0) / finalizedQuotes.length;
                    const rebate = 0.80;
                    const freight = 1.75;
                    const blendedCost = avgFOB + rebate + freight;
                    // Use estimated volume for display
                    const estimatedVolume = volumeNeedsMap.get(item.id) || 1000;
                    totalBlendedCost += blendedCost * estimatedVolume;
                    totalVolume += estimatedVolume;
                  }
                });
                
                const avgBlendedCost = totalVolume > 0 ? totalBlendedCost / totalVolume : 0;
                
                return (
                  <div className="mb-4 bg-gradient-to-r from-emerald-500/20 to-lime-500/20 border-2 border-emerald-400/50 rounded-xl p-4 backdrop-blur-sm shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Blended Cost Summary</h3>
                        <p className="text-xs text-white/80">{finalizedItems.length} item{finalizedItems.length !== 1 ? 's' : ''} finalized • {totalVolume.toLocaleString()} total cases</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-emerald-200">{formatCurrency(avgBlendedCost)}</div>
                        <div className="text-xs text-white/60">Weighted Avg Blended Cost</div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="overflow-x-auto bg-white/0">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-white/8 to-white/5 border-b-2 border-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Pack Size</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Supplier FOB</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Supplier DLVD</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">RF Counter</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Supplier Response</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">RF Final</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Blended Cost</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map(item => {
                    const quote = quotes.find(q => q.item_id === item.id);
                    if (!quote) return null;

                    const showCounterInput = !isReadOnly && quote.supplier_fob !== null;
                    // Show final input if: there's a counter OR supplier responded, AND no final price yet
                    const showFinalInput = !isReadOnly && !quote.rf_final_fob && (quote.rf_counter_fob !== null || quote.supplier_response !== null);
                    const isExpanded = expandedItem === item.id;
                    const allQuotes = itemQuotes[item.id] || [];

                    return (
                      <React.Fragment key={item.id}>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-bold text-white text-base">{item.name}</div>
                            <div className="text-sm text-white/70 mt-1">{item.organic_flag}</div>
                          </td>
                          <td className="px-6 py-5 text-white font-semibold">{item.pack_size}</td>
                          <td className="px-6 py-5 text-white font-medium">
                            {quote.supplier_fob ? formatCurrency(quote.supplier_fob) : <span className="text-white/50">-</span>}
                          </td>
                          <td className="px-6 py-5 text-white/90 font-medium">
                            {quote.supplier_dlvd ? formatCurrency(quote.supplier_dlvd) : <span className="text-white/50">-</span>}
                          </td>
                          <td className="px-6 py-5">
                            {showCounterInput ? (
                              <input
                                type="number"
                                step="0.01"
                                value={counterInputs[item.id] || ''}
                                onChange={e => setCounterInputs(prev => ({
                                  ...prev,
                                  [item.id]: e.target.value
                                }))}
                                className="w-32 px-4 py-2.5 border-2 border-orange-400/30 rounded-lg text-base font-bold focus:outline-none focus:ring-4 focus:ring-orange-400/50 focus:border-orange-400/50 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 shadow-lg"
                                placeholder="0.00"
                                style={{ color: '#ffffff' }}
                              />
                            ) : (
                              <span className="inline-flex items-center px-4 py-2 bg-orange-500/20 border-2 border-orange-400/40 rounded-lg text-base font-black text-orange-200 backdrop-blur-sm shadow-lg">
                                {quote.rf_counter_fob ? formatCurrency(quote.rf_counter_fob) : '-'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            {quote.supplier_response ? (
                              <div>
                                <span className="text-sm font-bold text-white">{quote.supplier_response.toUpperCase()}</span>
                                {quote.supplier_revised_fob && (
                                  <div className="text-sm text-white/80 mt-1">
                                    Revised: {formatCurrency(quote.supplier_revised_fob)}
                                  </div>
                                )}
                              </div>
                            ) : <span className="text-white/50">-</span>}
                          </td>
                          <td className="px-6 py-5">
                            {showFinalInput ? (
                              // Show input if there's a counter (RF can manually finalize) or supplier revised
                              <input
                                type="number"
                                step="0.01"
                                value={finalInputs[item.id] || (quote.rf_counter_fob ? quote.rf_counter_fob.toString() : '')}
                                onChange={e => setFinalInputs(prev => ({
                                  ...prev,
                                  [item.id]: e.target.value
                                }))}
                                className="w-32 px-4 py-2.5 border-2 border-green-400/30 rounded-lg text-base font-bold focus:outline-none focus:ring-4 focus:ring-green-400/50 focus:border-green-400/50 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 shadow-lg"
                                placeholder={quote.rf_counter_fob ? quote.rf_counter_fob.toString() : "0.00"}
                                style={{ color: '#ffffff' }}
                              />
                            ) : (
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center px-4 py-2 bg-green-500/20 border-2 border-green-400/40 rounded-lg text-base font-black text-green-200 backdrop-blur-sm shadow-lg">
                                  {quote.rf_final_fob ? formatCurrency(quote.rf_final_fob) : '-'}
                                </span>
                                {quote.rf_final_fob && quote.rf_counter_fob && quote.supplier_response === 'accept' && (
                                  <span className="text-xs text-green-300/70 font-medium">Auto-finalized</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            {(() => {
                              // Calculate blended cost for this item using actual volumes
                              const itemQuotesList = allQuotes.length > 0 ? allQuotes : (quote ? [quote] : []);
                              const finalizedQuotes = itemQuotesList.filter(q => q.rf_final_fob !== null);
                              
                              if (finalizedQuotes.length > 0) {
                                // Get volumes from awarded_volume or volume_needed
                                const quotesWithVolume = finalizedQuotes.filter(q => q.awarded_volume && q.awarded_volume > 0);
                                const totalVolume = quotesWithVolume.reduce((sum, q) => sum + (q.awarded_volume || 0), 0) || volumeNeedsMap.get(item.id) || 0;
                                
                                let avgFOB = 0;
                                if (quotesWithVolume.length > 0 && totalVolume > 0) {
                                  // Weighted average based on awarded volumes
                                  avgFOB = quotesWithVolume.reduce((sum, q) => {
                                    const volume = q.awarded_volume || 0;
                                    return sum + ((q.rf_final_fob || 0) * volume);
                                  }, 0) / totalVolume;
                                } else {
                                  // Simple average if no volumes yet
                                  avgFOB = finalizedQuotes.reduce((sum, q) => sum + (q.rf_final_fob || 0), 0) / finalizedQuotes.length;
                                }
                                
                                // Blended cost = FOB + Rebate + Freight
                                const rebate = 0.80;
                                const freight = 1.75;
                                const blendedCost = avgFOB + rebate + freight;
                                
                                return (
                                  <div className="text-right">
                                    <div className="font-black text-emerald-300 text-base">{formatCurrency(blendedCost)}</div>
                                    <div className="text-xs text-white/60 mt-0.5">
                                      {quotesWithVolume.length > 0 ? 'Weighted' : 'Avg'} Blended
                                    </div>
                                  </div>
                                );
                              }
                              
                              // Calculate projected blended cost if we finalize with current prices
                              const projectedQuotes = itemQuotesList.filter(q => q.supplier_fob !== null);
                              if (projectedQuotes.length > 0 && !isReadOnly) {
                                const projectedFOB = projectedQuotes.reduce((sum, q) => {
                                  const price = q.rf_final_fob || q.supplier_revised_fob || q.rf_counter_fob || q.supplier_fob || 0;
                                  return sum + price;
                                }, 0) / projectedQuotes.length;
                                const rebate = 0.80;
                                const freight = 1.75;
                                const projectedBlended = projectedFOB + rebate + freight;
                                
                                return (
                                  <div className="text-right">
                                    <div className="font-bold text-white/60 text-sm">{formatCurrency(projectedBlended)}</div>
                                    <div className="text-xs text-white/40 mt-0.5">Projected</div>
                                  </div>
                                );
                              }
                              
                              return <span className="text-white/40">-</span>;
                            })()}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleItemQuotes(item.id)}
                                className="flex items-center gap-1 px-4 py-2 text-sm bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-lg transition-all font-semibold text-white shadow-lg hover:shadow-xl"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                Quotes
                              </button>
                              {!isReadOnly && allQuotes.length > 0 && allQuotes.some(q => !q.rf_final_fob && q.supplier_fob !== null) && (
                                <button
                                  onClick={() => handleFinalizeItem(item.id)}
                                  disabled={finalizingItems[item.id]}
                                  className="flex items-center gap-1 px-3 py-2 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 rounded-lg transition-all font-semibold text-emerald-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                                >
                                  {finalizingItems[item.id] ? (
                                    <>
                                      <div className="animate-spin w-3 h-3 border-2 border-emerald-200 border-t-transparent rounded-full"></div>
                                      Finalizing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      Finalize Item
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} className="px-0 py-0">
                              <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border-t border-b border-white/5">
                                <h4 className="font-bold text-base text-white mb-3">All Supplier Quotes - {item.name} {item.organic_flag}</h4>
                                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-r from-white/8 to-white/5 border-b-2 border-white/15">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Supplier</th>
                                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Supplier FOB</th>
                                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">RF Counter</th>
                                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Supplier Response</th>
                                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">RF Final</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                      {allQuotes.map((q, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                          <td className="px-4 py-3 font-bold text-white">{q.supplier_name}</td>
                                          <td className="px-4 py-3 text-white font-medium">{q.supplier_fob ? formatCurrency(q.supplier_fob) : <span className="text-white/50">-</span>}</td>
                                          <td className="px-4 py-3">
                                            {q.rf_counter_fob ? (
                                              <span className="inline-flex items-center px-3 py-1 bg-orange-500/20 border border-orange-400/40 rounded-lg text-sm font-black text-orange-200">
                                                {formatCurrency(q.rf_counter_fob)}
                                              </span>
                                            ) : (
                                              <span className="text-white/50">-</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-3 text-white font-medium">{q.supplier_response ? q.supplier_response.toUpperCase() : <span className="text-white/50">-</span>}</td>
                                          <td className="px-4 py-3">
                                            {q.rf_final_fob ? (
                                              <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center px-3 py-1 bg-green-500/20 border border-green-400/40 rounded-lg text-sm font-black text-green-200">
                                                  {formatCurrency(q.rf_final_fob)}
                                                </span>
                                                {q.rf_counter_fob && q.supplier_response === 'accept' && (
                                                  <span className="text-xs text-green-300/70 font-medium">Auto-finalized</span>
                                                )}
                                              </div>
                                            ) : (
                                              <span className="text-white/50">-</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {allQuotes.length === 0 && (
                                    <div className="text-center py-4 text-white/60 text-sm font-medium">Loading quotes...</div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {isReadOnly ? (
              <div className="p-6 border-t border-white/10 bg-gradient-to-r from-orange-600/90 to-red-600/90 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-6 h-6" />
                      <h3 className="text-xl font-black">Pricing Finalized & Locked</h3>
                    </div>
                    <p className="text-orange-100">
                      This week's pricing is finalized. Use emergency reopen if critical changes are needed.
                      Changes will cascade through pricing calculations and all volume allocations.
                    </p>
                  </div>
                  <button
                    onClick={handleEmergencyReopen}
                    disabled={finalizingPricing}
                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl hover:bg-white/30 transition font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center gap-2"
                  >
                    <Unlock className="w-5 h-5" />
                    {finalizingPricing ? 'Reopening...' : 'Emergency Reopen'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-t border-white/10 bg-white/3 backdrop-blur-sm">
                <div className="flex items-center gap-4 flex-wrap">
                  {canSendCounters && (
                    <button
                      onClick={handleSubmitCounters}
                      disabled={submittingCounters}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-bold text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 border-2 border-blue-400/50"
                    >
                      {submittingCounters ? 'Sending...' : 'Push to Counter'}
                    </button>
                  )}
                  {canSetFinal && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handlePushToFinalize}
                        disabled={submittingCounters || submittingFinals}
                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-bold text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 border-2 border-green-400/50"
                      >
                        {submittingCounters || submittingFinals ? 'Processing...' : 'Push to Finalize'}
                      </button>
                      <p className="text-white/60 text-xs text-center max-w-md mx-auto">
                        Automatically sets final prices based on negotiations (counters, supplier responses, etc.)
                      </p>
                    </div>
                  )}
                  {supplierAlreadyFinalized && (
                    <div className="flex flex-col gap-2">
                      <div className="px-8 py-4 bg-green-500/20 border-2 border-green-400/50 rounded-xl flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-300" />
                        <span className="text-green-200 font-bold text-lg">Pricing Finalized</span>
                      </div>
                      <p className="text-white/60 text-xs text-center max-w-md mx-auto">
                        {selectedSupplier?.name} pricing is already finalized. Select another supplier or go to Volume tab.
                      </p>
                    </div>
                  )}
                </div>
                {allSuppliersFinalized && selectedWeek?.status === 'open' && (
                  <div className="mt-4 p-4 bg-emerald-500/20 border-2 border-emerald-400/50 rounded-xl">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-white/90 text-sm font-bold mb-1 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-300" />
                          All suppliers finalized
                        </p>
                        <p className="text-white/70 text-xs">
                          All supplier pricing is finalized. Finalize the week to unlock volume allocation.
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          if (!selectedWeek || finalizingPricing) return;
                          
                          // Validate that all quotes with pricing have rf_final_fob set
                          const quotesWithPricing = quotes.filter(q => 
                            (q.supplier_fob !== null && q.supplier_fob !== undefined) || 
                            (q.supplier_revised_fob !== null && q.supplier_revised_fob !== undefined)
                          );
                          const incompleteQuotes = quotesWithPricing.filter(q => 
                            q.rf_final_fob === null || q.rf_final_fob === undefined
                          );
                          
                          if (incompleteQuotes.length > 0) {
                            const missingCount = incompleteQuotes.length;
                            const errorMessage = `${missingCount} quote${missingCount > 1 ? 's' : ''} missing RF Final FOB. Please set final prices for all quotes with supplier pricing before finalizing.`;
                            showToast(errorMessage, 'error');
                            return;
                          }
                          
                          setFinalizingPricing(true);
                          try {
                            const result = await finalizePricingForWeek(selectedWeek.id, session?.user_name || 'RF Manager');
                            if (result.success) {
                              const { supabase } = await import('../utils/supabase');
                              const { data: updatedWeekData } = await supabase
                                .from('weeks')
                                .select('*')
                                .eq('id', selectedWeek.id)
                                .single();
                              
                              if (updatedWeekData) {
                                const updatedWeek = updatedWeekData as Week;
                                setSelectedWeek(updatedWeek);
                                setWeeks(prev => prev.map(w => w.id === selectedWeek.id ? updatedWeek : w));
                                setSelectedSupplier(null);
                                setTimeout(() => {
                                  setMainView('award_volume');
                                  showToast('Week finalized! Volume allocation is now available.', 'success');
                                }, 500);
                              }
                            } else {
                              showToast(result.error || 'Failed to finalize week', 'error');
                            }
                          } catch (err) {
                            logger.error('Error finalizing week:', err);
                            showToast('Failed to finalize week. Please try again.', 'error');
                          } finally {
                            setFinalizingPricing(false);
                          }
                        }}
                        disabled={finalizingPricing || !canFinalizePricing}
                        title={!canFinalizePricing && incompleteQuotes.length > 0 
                          ? `${incompleteQuotes.length} quote${incompleteQuotes.length > 1 ? 's' : ''} missing RF Final FOB. Please set final prices for all quotes with supplier pricing.`
                          : finalizingPricing 
                          ? 'Finalizing pricing...'
                          : ''}
                        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {finalizingPricing ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Finalizing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Finalize Week
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {canFinalizePricing && !allSuppliersFinalized && (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
                    <p className="text-white/90 text-sm font-semibold mb-1">
                      ✓ Pricing ready to finalize
                    </p>
                    <p className="text-white/70 text-xs">
                      Go to the <strong>"Award Volume"</strong> tab to finalize week pricing and unlock volume allocation.
                    </p>
                  </div>
                )}
                {!canFinalizePricing && selectedWeek?.status === 'open' && incompleteQuotes.length > 0 && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
                    <p className="text-white/90 text-sm font-semibold mb-1">
                      ⚠ Cannot finalize pricing
                    </p>
                    <p className="text-white/70 text-xs">
                      {incompleteQuotes.length} quote{incompleteQuotes.length > 1 ? 's' : ''} missing RF Final FOB. Please set final prices for all quotes with supplier pricing before finalizing.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
          </div>
        )}
      </main>

      {showCreateWeekModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-scale-in">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Create New Week
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  A new week will be created automatically with:
                </p>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>Next sequential week number</li>
                  <li>Start date following the last week's end date</li>
                  <li>7-day duration</li>
                  <li>Status set to "Open" for all suppliers to submit pricing</li>
                  <li>Quotes created for all items and suppliers</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateWeekModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWeek}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Create Week
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### src/components/AwardVolume.tsx
```typescript
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Award,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Check,
  Calculator,
  Sparkles,
  Link2,
  Send,
} from 'lucide-react'
import { fetchItems, fetchQuotesWithDetails, fetchVolumeNeeds, submitAllocationsToSuppliers } from '../utils/database'
import { formatCurrency } from '../utils/helpers'
import { useToast } from '../contexts/ToastContext'
import { useApp } from '../contexts/AppContext'
import { logger } from '../utils/logger'
import type { Item, QuoteWithDetails, Week } from '../types'

interface AwardVolumeProps {
  selectedWeek: Week | null
}

// Your canonical 8 (DO NOT DRIFT)
const CANONICAL_SKUS: Array<{ key: string }> = [
  { key: 'STRAWBERRY CONV 4/2LB' },
  { key: 'STRAWBERRY ORG 8/1LB' },
  { key: 'BLUEBERRY CONV 18OZ' },
  { key: 'BLUEBERRY ORG PINT' },
  { key: 'BLACKBERRY 12OZX6' },
  { key: 'BLACKBERRY ORG 12OZX6' },
  { key: 'RASPBERRY CONV 12OZX6' },
  { key: 'RASPBERRY ORG 12OZX6' },
]

type CalcInputs = { rebate: number; freight: number; margin: number }
const DEFAULT_CALC: CalcInputs = { rebate: 0.85, freight: 1.5, margin: 1.5 }

function safeNum(n: unknown, fallback = 0) {
  const x = typeof n === 'number' ? n : Number(n)
  return Number.isFinite(x) ? x : fallback
}
function round2(n: number) {
  return Math.round(n * 100) / 100
}
function normWords(s: string) {
  return (s || '').toUpperCase().replace(/\s+/g, ' ').trim()
}
function normAlnum(s: string) {
  return (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}
function extractBerryTokens(canonicalKey: string) {
  const k = normWords(canonicalKey)
  const tokens: string[] = []
  if (k.includes('STRAWBERRY')) tokens.push('STRAWBERRY')
  if (k.includes('BLUEBERRY')) tokens.push('BLUEBERRY')
  if (k.includes('BLACKBERRY')) tokens.push('BLACKBERRY')
  if (k.includes('RASPBERRY')) tokens.push('RASPBERRY')
  if (k.includes('ORG')) tokens.push('ORG', 'ORGANIC')
  if (k.includes('CONV')) tokens.push('CONV', 'CONVENTIONAL')
  return tokens
}
function canonicalPackToken(canonicalKey: string) {
  const k = normWords(canonicalKey)
  const parts = k.split(' ')
  return parts[parts.length - 1] || ''
}
function itemDisplay(it: Item) {
  return `${it.name} (${it.pack_size})`
}

/**
 * Deterministic “AI insight” (no random lines), max 5 bullets
 */
function buildSkuInsight(args: {
  skuLabel: string
  required: number
  totalAwarded: number
  weightedAvgFOB: number
  dlvd: number
  prices: number[]
  awardedBySupplier: Array<{ supplier: string; vol: number; price: number }>
}) {
  const { skuLabel, required, totalAwarded, weightedAvgFOB, dlvd, prices, awardedBySupplier } = args
  const bullets: string[] = []
  const remaining = required - totalAwarded

  if (required > 0) {
    if (remaining === 0) bullets.push('Allocation is complete (awarded matches required).')
    else if (remaining > 0) bullets.push(`Under-awarded by ${remaining.toLocaleString()} cases — add volume to finish.`)
    else bullets.push(`Over-awarded by ${Math.abs(remaining).toLocaleString()} cases — pull volume back.`)
  } else {
    bullets.push('Set required cases to enable remaining + completion checks.')
  }

  if (prices.length >= 2) {
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const spread = max - min
    const spreadPct = min > 0 ? (spread / min) * 100 : 0
    if (spreadPct >= 8) bullets.push(`Wide shipper spread (${formatCurrency(min)} to ${formatCurrency(max)} / +${round2(spreadPct)}%). Favor low-cost supply if service allows.`)
    else bullets.push(`Tight shipper spread (${formatCurrency(min)} to ${formatCurrency(max)}). Allocation can prioritize coverage.`)
  }

  if (totalAwarded > 0 && awardedBySupplier.length > 0) {
    const sorted = [...awardedBySupplier].sort((a, b) => b.vol - a.vol)
    const top = sorted[0]
    const topShare = (top.vol / totalAwarded) * 100
    if (topShare >= 70) bullets.push(`Concentration risk: ${round2(topShare)}% on ${top.supplier}. Consider splitting.`)
    else if (topShare >= 50) bullets.push(`Moderate concentration: ${round2(topShare)}% on ${top.supplier}. OK if performance is strong.`)
  }

  if (prices.length >= 2 && totalAwarded > 0) {
    const min = Math.min(...prices)
    const cheapestVol = awardedBySupplier.filter(x => x.price === min).reduce((s, x) => s + x.vol, 0)
    const cheapestShare = (cheapestVol / totalAwarded) * 100
    if (cheapestShare < 30) bullets.push(`Only ${round2(cheapestShare)}% is on the lowest FOB. Shifting volume down lowers weighted cost.`)
  }

  if (weightedAvgFOB > 0) bullets.push(`Weighted FOB is ${formatCurrency(weightedAvgFOB)}; DLVD tracks ~${formatCurrency(dlvd)} using your inputs.`)

  return { title: `${skuLabel} — AI Insight`, bullets: bullets.slice(0, 5) }
}

export function AwardVolume({ selectedWeek }: AwardVolumeProps) {
  const { showToast } = useToast()
  const { session } = useApp()

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [items, setItems] = useState<Item[]>([])
  const [quotes, setQuotes] = useState<QuoteWithDetails[]>([])
  const [volumeNeeds, setVolumeNeeds] = useState<Map<string, number>>(new Map())

  // Accordion open state (by canonical key)
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set())

  // Manual mapping: canonicalKey -> itemId
  const [manualMap, setManualMap] = useState<Map<string, string>>(new Map())

  // Sandbox state
  const [requiredByItem, setRequiredByItem] = useState<Map<string, number>>(new Map())
  const [awardedByQuote, setAwardedByQuote] = useState<Map<string, number>>(new Map())
  const [calcByItem, setCalcByItem] = useState<Map<string, CalcInputs>>(new Map())

  // Debounced draft save to DB
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isFinalized = selectedWeek?.status === 'finalized' || selectedWeek?.status === 'closed'

  // Award Volume is a LIVE sandbox — editing must work even when week is open.
  // Only lock when week is closed (you can add emergency unlock logic later if needed).
  const canEdit = selectedWeek?.status !== 'closed'
  
  const load = useCallback(async () => {
    if (!selectedWeek) return
    setLoading(true)
    try {
      const [itemsData, quotesData, needsData] = await Promise.all([
        fetchItems(),
        fetchQuotesWithDetails(selectedWeek.id),
        fetchVolumeNeeds(selectedWeek.id),
      ])

      setItems(itemsData)
      setQuotes(quotesData)

      const needsMap = new Map<string, number>()
      needsData.forEach(v => needsMap.set(v.item_id, v.volume_needed || 0))
      setVolumeNeeds(needsMap)

      // Seed requiredByItem (don’t clobber ongoing sandbox edits)
      setRequiredByItem(prev => {
        const next = new Map(prev)
        for (const [itemId, vol] of needsMap.entries()) {
          if (!next.has(itemId)) next.set(itemId, vol || 0)
        }
        return next
      })

      // Seed awardedByQuote once from DB (don’t clobber active edits)
      setAwardedByQuote(prev => {
        const next = new Map(prev)
        for (const q of quotesData) {
          if (!next.has(q.id)) {
            const v = safeNum(q.awarded_volume, 0)
            if (v > 0) next.set(q.id, v)
          }
        }
        return next
      })
    } catch (err) {
      logger.error(err)
      showToast('Failed to load Award Volume data', 'error')
    } finally {
      setLoading(false)
    }
  }, [selectedWeek, showToast])

  useEffect(() => {
    load()
    setOpenKeys(new Set())
  }, [load])

  // Quotes grouped by item_id, ONLY with valid pricing (supplier_fob when open; rf_final_fob when finalized)
  const pricedQuotesByItem = useMemo(() => {
    const m = new Map<string, QuoteWithDetails[]>()
    for (const q of quotes) {
      const price = isFinalized ? safeNum(q.rf_final_fob, 0) : safeNum(q.supplier_fob, 0)
      if (price <= 0) continue
      if (!q.item_id) continue
      const arr = m.get(q.item_id) || []
      arr.push(q)
      m.set(q.item_id, arr)
    }
    for (const [itemId, arr] of m.entries()) {
      arr.sort((a, b) => {
        const pa = isFinalized ? safeNum(a.rf_final_fob, 0) : safeNum(a.supplier_fob, 0)
        const pb = isFinalized ? safeNum(b.rf_final_fob, 0) : safeNum(b.supplier_fob, 0)
        return pa - pb
      })
      m.set(itemId, arr)
    }
    return m
  }, [quotes, isFinalized])

  // Resolver: canonical -> item (manual first, then fuzzy)
  const resolvedByCanonical = useMemo(() => {
    const itemById = new Map(items.map(it => [it.id, it]))

    return CANONICAL_SKUS.map(({ key }) => {
      const manualId = manualMap.get(key)
      if (manualId && itemById.has(manualId)) return { canonicalKey: key, item: itemById.get(manualId)!, resolvedVia: 'manual' as const }

      const tokens = extractBerryTokens(key)
      const packTok = canonicalPackToken(key)
      const packA = normAlnum(packTok)

      // candidates: berry match
      const candidates = items.filter(it => tokens.some(t => normWords(it.name).includes(t)))

      let best: { item: Item; score: number } | null = null
      for (const it of candidates) {
        const nameW = normWords(it.name)
        const packW = normWords(it.pack_size)
        const packB = normAlnum(packW)
        let score = 0

        for (const t of tokens) if (nameW.includes(t)) score += 3

        if (packA && packB) {
          if (packA === packB) score += 8
          else if (packB.includes(packA) || packA.includes(packB)) score += 5
        }

        const wantsOrg = normWords(key).includes('ORG')
        const hasOrg = nameW.includes('ORG') || nameW.includes('ORGANIC')
        if (wantsOrg === hasOrg) score += 2

        if (!best || score > best.score) best = { item: it, score }
      }

      if (best && best.score >= 6) return { canonicalKey: key, item: best.item, resolvedVia: 'fuzzy' as const }

      return { canonicalKey: key, item: null, resolvedVia: 'none' as const }
    })
  }, [items, manualMap])

  // Default calculator settings for resolved items
  useEffect(() => {
    setCalcByItem(prev => {
      const next = new Map(prev)
      for (const r of resolvedByCanonical) {
        if (r.item && !next.has(r.item.id)) next.set(r.item.id, { ...DEFAULT_CALC })
      }
      return next
    })
  }, [resolvedByCanonical])

  // Only show “mapping needed” warning IF a canonical SKU is unresolved AND there exists at least one “likely match item” with pricing.
  const mappingActuallyNeeded = useMemo(() => {
    if (items.length === 0) return false

    const pricedItemIds = new Set<string>(Array.from(pricedQuotesByItem.keys()))

    return resolvedByCanonical.some(r => {
      if (r.item) return false
      const tokens = extractBerryTokens(r.canonicalKey)
      const packTok = canonicalPackToken(r.canonicalKey)
      const packA = normAlnum(packTok)

      // Find any priced item that looks like this SKU
      for (const it of items) {
        if (!pricedItemIds.has(it.id)) continue
        const nameW = normWords(it.name)
        if (!tokens.some(t => nameW.includes(t))) continue

        const packB = normAlnum(normWords(it.pack_size))
        if (packA && packB && (packA === packB || packB.includes(packA) || packA.includes(packB))) return true

        // if pack mismatch, still consider it likely for PINT / etc
        if (!packA) return true
      }
      return false
    })
  }, [resolvedByCanonical, pricedQuotesByItem, items])

  function toggleOpen(canonicalKey: string) {
    setOpenKeys(prev => {
      const next = new Set(prev)
      if (next.has(canonicalKey)) next.delete(canonicalKey)
      else next.add(canonicalKey)
      return next
    })
  }

  function setManualMapping(canonicalKey: string, itemId: string) {
    setManualMap(prev => {
      const next = new Map(prev)
      if (itemId) next.set(canonicalKey, itemId)
      else next.delete(canonicalKey)
      return next
    })
  }

  function setRequired(itemId: string, value: string) {
    const v = value === '' ? 0 : parseInt(value) || 0
    setRequiredByItem(prev => {
      const next = new Map(prev)
      next.set(itemId, v)
      return next
    })
  }

  function setCalc(itemId: string, patch: Partial<CalcInputs>) {
    setCalcByItem(prev => {
      const next = new Map(prev)
      const cur = next.get(itemId) || { ...DEFAULT_CALC }
      next.set(itemId, {
        rebate: safeNum(patch.rebate ?? cur.rebate, cur.rebate),
        freight: safeNum(patch.freight ?? cur.freight, cur.freight),
        margin: safeNum(patch.margin ?? cur.margin, cur.margin),
      })
      return next
    })
  }

  // Save awarded_volume draft on edit (debounced), using existing quotes rows (week_id,item_id,supplier_id)
  const saveAwardDraftDebounced = useCallback(
    async (q: QuoteWithDetails, volume: number) => {
      if (!selectedWeek) return
      try {
        const { supabase } = await import('../utils/supabase')

        const week_id = selectedWeek.id
        const supplier_id = q.supplier_id
        const item_id = q.item_id
        const awarded_volume = volume > 0 ? volume : null

        const { error } = await supabase
          .from('quotes')
          .upsert(
            {
              week_id,
              supplier_id,
              item_id,
              awarded_volume,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'week_id,item_id,supplier_id' }
          )

        if (error) throw error
      } catch (err: any) {
        logger.error('Save awarded_volume failed:', err)
        showToast(`Save failed: ${err?.message || 'Unknown error'}`, 'error')
      }
    },
    [selectedWeek, showToast]
  )

  function setAwarded(q: QuoteWithDetails, value: string) {
    const v = value === '' ? 0 : parseInt(value) || 0

    setAwardedByQuote(prev => {
      const next = new Map(prev)
      if (v > 0) next.set(q.id, v)
      else next.delete(q.id)
      return next
    })

    if (!canEdit) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveAwardDraftDebounced(q, v)
    }, 450)
  }

  // Send allocations to suppliers (so Acceptance tab can happen later)
  async function handleSendAllocations() {
    if (!selectedWeek) return
    if (!isFinalized) {
      showToast('Finalize pricing before sending allocations', 'error')
      return
    }

    // Must have at least one awarded volume > 0 on a priced quote
    let hasAny = false
    for (const [itemId, arr] of pricedQuotesByItem.entries()) {
      for (const q of arr) {
        const v = safeNum(awardedByQuote.get(q.id), 0)
        if (v > 0) {
          hasAny = true
          break
        }
      }
      if (hasAny) break
    }
    if (!hasAny) {
      showToast('No volumes allocated yet', 'error')
      return
    }

    setSubmitting(true)
    try {
      const result = await submitAllocationsToSuppliers(selectedWeek.id, session?.user_name || 'RF Manager')
      if (result?.success) {
        showToast(`Allocations sent to ${result.count} supplier(s)`, 'success')
      } else {
        showToast(result?.error || 'Failed to send allocations', 'error')
      }
    } catch (err: any) {
      logger.error(err)
      showToast(err?.message || 'Failed to send allocations', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!selectedWeek) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-10 text-center">
        <Award className="w-12 h-12 text-white/30 mx-auto mb-3" />
        <div className="text-white/80 font-bold text-lg">No week selected</div>
        <div className="text-white/60 text-sm mt-1">Select a week to allocate volumes</div>
      </div>
    )
  }

  // For each canonical SKU, determine whether it should show “filled out”
  // Rule: SKU is only filled out if supplier prices it (i.e., resolved item exists AND has at least 1 priced quote)
  const rowsForUI = resolvedByCanonical.map(r => {
    const item = r.item
    const itemId = item?.id || ''
    const pricedQuotes = itemId ? pricedQuotesByItem.get(itemId) || [] : []
    const hasPricing = pricedQuotes.length > 0
    return { ...r, pricedQuotes, hasPricing }
  })

  // Global “send allocations” enabled if at least one priced quote has award > 0
  const hasAnyAllocation = useMemo(() => {
    for (const row of rowsForUI) {
      if (!row.hasPricing) continue
      for (const q of row.pricedQuotes) {
        if (safeNum(awardedByQuote.get(q.id), 0) > 0) return true
      }
    }
    return false
  }, [rowsForUI, awardedByQuote])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Award className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-white font-black text-lg">Award Volume — All 8 SKUs</div>
              <div className="text-white/60 text-xs mt-1">
                Pricing source:{' '}
                <span className="text-white/80 font-semibold">
                  {isFinalized ? 'Final FOB (rf_final_fob)' : 'Submitted FOB (supplier_fob)'}
                </span>{' '}
                <span className="text-white/40">•</span>{' '}
                <span className="text-white/70">Live sandbox (no static tables)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSendAllocations}
            disabled={!canEdit || submitting || !hasAnyAllocation}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition"
            title={!canEdit ? 'Finalize pricing first' : !hasAnyAllocation ? 'Allocate at least one volume first' : 'Send allocations'}
          >
            {submitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Allocations to Suppliers
              </>
            )}
          </button>
        </div>

        {loading && <div className="mt-3 text-white/60 text-xs">Loading…</div>}

        {mappingActuallyNeeded && (
          <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-300 mt-0.5" />
              <div>
                <div className="text-white/90 text-sm font-bold">Some SKUs need mapping</div>
                <div className="text-white/70 text-xs mt-1">
                  Only SKUs with supplier pricing are filled out. If one is priced but not matching DB labels, expand it and map once.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {rowsForUI.map(r => {
          const canonicalKey = r.canonicalKey
          const isOpen = openKeys.has(canonicalKey)
          const item = r.item
          const itemId = item?.id || ''

          // If no pricing for this SKU, keep it clean/empty (per your rule)
          const hasPricing = r.hasPricing

          // Sandbox numbers only if priced + resolved
          const required =
            itemId && hasPricing ? (requiredByItem.get(itemId) ?? volumeNeeds.get(itemId) ?? 0) : 0
          const calc = itemId ? calcByItem.get(itemId) || { ...DEFAULT_CALC } : { ...DEFAULT_CALC }

          const rows = hasPricing
            ? r.pricedQuotes.map(q => {
                const price = isFinalized ? safeNum(q.rf_final_fob, 0) : safeNum(q.supplier_fob, 0)
                const awarded = safeNum(awardedByQuote.get(q.id), 0)
                const supplier = q.supplier?.name || 'Unknown'
                return { q, supplier, price, awarded, rowCost: price * awarded }
              })
            : []

          const totalAwarded = rows.reduce((s, x) => s + x.awarded, 0)
          const remaining = required - totalAwarded
          const totalCost = rows.reduce((s, x) => s + x.rowCost, 0)
          const weightedAvgFOB = totalAwarded > 0 ? totalCost / totalAwarded : 0
          const dlvd = weightedAvgFOB > 0 ? weightedAvgFOB + calc.freight + calc.margin - calc.rebate : 0

          const prices = rows.map(x => x.price).filter(p => p > 0)
          const awardedBySupplier = rows
            .filter(x => x.awarded > 0)
            .map(x => ({ supplier: x.supplier, vol: x.awarded, price: x.price }))

          const insight = buildSkuInsight({
            skuLabel: canonicalKey,
            required,
            totalAwarded,
            weightedAvgFOB,
            dlvd,
            prices,
            awardedBySupplier,
          })

          // If SKU is not priced, we keep it collapsed and “empty” (matches your rule)
          const canExpand = hasPricing || !item // allow expand for mapping if needed

          return (
            <div key={canonicalKey} className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
              <button
                type="button"
                onClick={() => (canExpand ? toggleOpen(canonicalKey) : null)}
                className={`w-full text-left p-4 flex items-center justify-between gap-3 ${
                  canExpand ? 'hover:bg-white/5' : 'cursor-default'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-white/80">
                    {canExpand ? (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : <ChevronRight className="w-4 h-4 opacity-30" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-black truncate">{canonicalKey}</div>
                    <div className="text-white/60 text-xs mt-0.5 truncate">
                      {item ? (
                        <>
                          Mapped to: <span className="text-white/80 font-semibold">{item.name}</span> ({item.pack_size}){' '}
                          <span className="text-white/40">•</span>{' '}
                          <span className="text-white/50">{hasPricing ? 'priced' : 'no supplier pricing yet'}</span>
                        </>
                      ) : (
                        'Not mapped yet — expand and map (only needed if this SKU is priced)'
                      )}
                    </div>
                  </div>
                </div>

                {/* Mini summary — ONLY meaningful if priced+resolved */}
                <div className="flex items-center gap-4 flex-wrap justify-end">
                  <Mini label="Req" value={item && hasPricing ? required.toLocaleString() : '-'} />
                  <Mini label="Awarded" value={item && hasPricing ? totalAwarded.toLocaleString() : '-'} />
                  <Mini
                    label="Remaining"
                    value={item && hasPricing && required > 0 ? remaining.toLocaleString() : '-'}
                    tone={!item || !hasPricing || required === 0 ? 'muted' : remaining === 0 ? 'good' : remaining < 0 ? 'bad' : 'warn'}
                  />
                  <Mini label="Wtd FOB" value={item && hasPricing && weightedAvgFOB > 0 ? formatCurrency(weightedAvgFOB) : '-'} />
                  <Mini label="DLVD" value={item && hasPricing && dlvd > 0 ? formatCurrency(dlvd) : '-'} />
                </div>
              </button>

              {isOpen && (
                <div className="p-4 pt-0 space-y-4">
                  {/* Mapping (if needed) */}
                  {!item && (
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Link2 className="w-4 h-4 text-orange-300" />
                        <div className="text-white font-black">Map to Item</div>
                      </div>
                      <div className="text-white/70 text-sm mb-3">
                        Choose the correct DB item for <b>{canonicalKey}</b>. This is only needed if suppliers priced this SKU.
                      </div>

                      <select
                        value={manualMap.get(canonicalKey) || ''}
                        onChange={(e) => setManualMapping(canonicalKey, e.target.value)}
                        className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20"
                      >
                        <option value="">-- Select Item --</option>
                        {items
                          .slice()
                          .sort((a, b) => {
                            // Likely matches first (berry token match)
                            const tokens = extractBerryTokens(canonicalKey)
                            const aScore = tokens.some(t => normWords(a.name).includes(t)) ? 1 : 0
                            const bScore = tokens.some(t => normWords(b.name).includes(t)) ? 1 : 0
                            return bScore - aScore
                          })
                          .map(it => (
                            <option key={it.id} value={it.id}>
                              {itemDisplay(it)}
                            </option>
                          ))}
                      </select>

                      <div className="text-white/50 text-xs mt-2">After mapping once, this SKU becomes fully interactive when priced.</div>
                    </div>
                  )}

                  {/* If mapped but NOT priced, keep it clean */}
                  {item && !hasPricing && (
                    <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center">
                      <div className="text-white/80 font-black">No supplier pricing yet</div>
                      <div className="text-white/60 text-sm mt-1">This SKU stays empty until at least one supplier submits a FOB price.</div>
                    </div>
                  )}

                  {/* Full sandbox only when mapped + priced */}
                  {item && hasPricing && (
                    <>
                      {/* Controls */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                          <div className="text-xs text-white/70 font-black uppercase tracking-wider">Required cases</div>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={required > 0 ? required : ''}
                            placeholder="0"
                            onChange={(e) => setRequired(itemId, e.target.value)}
                            className="mt-2 w-full px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-right text-2xl font-black text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                          />
                          <div className="text-xs text-white/50 mt-2">Pulled from Volume Needs; sandbox-editable here.</div>
                        </div>

                        <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                          <div className="flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-emerald-200" />
                            <div className="text-xs text-white/70 font-black uppercase tracking-wider">Internal Pricing Calculator</div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <CalcField label="Rebate" value={calc.rebate} onChange={(v) => setCalc(itemId, { rebate: v })} />
                            <CalcField label="Freight" value={calc.freight} onChange={(v) => setCalc(itemId, { freight: v })} />
                            <CalcField label="Margin" value={calc.margin} onChange={(v) => setCalc(itemId, { margin: v })} />
                          </div>

                          <div className="mt-3 p-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10">
                            <div className="text-xs text-white/70 font-semibold">DLVD (not editable)</div>
                            <div className="text-2xl font-black text-emerald-200 mt-1">{dlvd > 0 ? formatCurrency(dlvd) : '-'}</div>
                            <div className="text-xs text-white/50 mt-1">DLVD = Weighted FOB + Freight + Margin − Rebate</div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500/15 to-blue-500/10 rounded-xl border border-indigo-400/20 p-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-200" />
                            <div className="text-xs text-white/70 font-black uppercase tracking-wider">AI Insight</div>
                          </div>
                          <div className="text-white font-black mt-2">{insight.title}</div>
                          <ul className="mt-2 space-y-1 text-sm text-white/80 list-disc ml-5">
                            {insight.bullets.map((b, idx) => (
                              <li key={idx}>{b}</li>
                            ))}
                          </ul>
                          <div className="text-xs text-white/50 mt-2">Deterministic insights from pricing + allocation.</div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Summary label="Total Awarded" value={totalAwarded.toLocaleString()} />
                          <Summary
                            label="Remaining"
                            value={required === 0 ? '-' : remaining.toLocaleString()}
                            tone={required === 0 ? 'muted' : remaining === 0 ? 'good' : remaining < 0 ? 'bad' : 'warn'}
                          />
                          <Summary label="Weighted Avg FOB" value={weightedAvgFOB > 0 ? formatCurrency(weightedAvgFOB) : '-'} />
                          <Summary label="Total Cost" value={totalCost > 0 ? formatCurrency(totalCost) : '-'} />
                        </div>
                        {required > 0 && remaining === 0 && (
                          <div className="mt-3 flex items-center gap-2 text-green-300 text-sm font-semibold">
                            <Check className="w-4 h-4" /> Allocation complete for this SKU
                          </div>
                        )}
                      </div>

                      {/* Supplier pricing */}
                      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-emerald-500/20 to-lime-500/15 border-b border-emerald-400/20">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">#</th>
                              <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Supplier</th>
                              <th className="px-4 py-3 text-right text-xs font-black text-white uppercase tracking-wider">FOB</th>
                              <th className="px-4 py-3 text-right text-xs font-black text-white uppercase tracking-wider">Award Cases</th>
                              <th className="px-4 py-3 text-right text-xs font-black text-white uppercase tracking-wider">Row Cost</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {rows.map((x, idx) => {
                              const top = idx === 0
                              return (
                                <tr key={x.q.id} className={`hover:bg-white/5 ${top ? 'bg-emerald-500/10 border-l-4 border-emerald-400' : ''}`}>
                                  <td className="px-4 py-3">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                                        top ? 'bg-emerald-500/30 text-emerald-100 border-2 border-emerald-400/40' : 'bg-white/10 text-white/70 border border-white/20'
                                      }`}
                                    >
                                      {idx + 1}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-bold">{x.supplier}</span>
                                      {x.awarded > 0 && <Check className="w-4 h-4 text-green-400" />}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="text-white font-black">{formatCurrency(x.price)}</div>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <input
                                      type="number"
                                      min={0}
                                      step={1}
                                      value={x.awarded > 0 ? x.awarded : ''}
                                      placeholder="0"
                                      onChange={(e) => setAwarded(x.q, e.target.value)}
                                      disabled={!canEdit}
                                      className={`w-28 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-right font-black text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 ${
                                        !canEdit ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className={`font-black ${x.rowCost > 0 ? 'text-white' : 'text-white/40'}`}>
                                      {x.rowCost > 0 ? formatCurrency(x.rowCost) : '-'}
                                    </div>
                                    {x.rowCost > 0 && (
                                      <div className="text-xs text-white/50 mt-0.5">
                                        {formatCurrency(x.price)} × {x.awarded.toLocaleString()}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'warn' | 'bad' | 'muted' }) {
  const cls = tone === 'good' ? 'text-green-300' : tone === 'bad' ? 'text-red-300' : tone === 'warn' ? 'text-orange-300' : 'text-white/70'
  return (
    <div className="text-right">
      <div className="text-xs text-white/60 font-semibold">{label}</div>
      <div className={`font-black ${cls}`}>{value}</div>
    </div>
  )
}

function Summary({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'warn' | 'bad' | 'muted' }) {
  const cls = tone === 'good' ? 'text-green-300' : tone === 'bad' ? 'text-red-300' : tone === 'warn' ? 'text-orange-300' : 'text-white'
  return (
    <div>
      <div className="text-xs text-white/60 font-semibold uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-black mt-1 ${cls}`}>{value}</div>
    </div>
  )
}

function CalcField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="text-xs text-white/60 font-semibold">{label}</div>
      <input
        type="number"
        step="0.01"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(safeNum(e.target.value, 0))}
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-right font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
      />
    </div>
  )
}
```

### src/components/Allocation.tsx
```typescript
/**
 * AI Allocation Component
 * 
 * Combines Volume Needed + Acceptance into one futuristic allocation experience
 * Features:
 * - Manual allocation mode
 * - AI Target Price allocation mode
 * - Lock SKU workflow
 * - Exceptions mode (after sending awards)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Award, Save, Check, Package, Send, RefreshCw, 
  Info, CheckCircle, Zap, Target, TrendingUp, AlertTriangle,
  Sparkles, Brain, Sliders, XCircle, Edit3, ChevronDown, ChevronUp,
  TrendingDown, DollarSign, BarChart3, History
} from 'lucide-react';
import {
  fetchItems,
  fetchQuotesWithDetails,
  fetchVolumeNeeds,
  updateVolumeNeeded as updateVolumeNeededDB,
  submitAllocationsToSuppliers,
  fetchItemPricingCalculations,
  fetchHistoricalSupplierShares,
  closeVolumeLoop,
  updateItemPricingCalculation,
} from '../utils/database';
import { formatCurrency } from '../utils/helpers';
import { useToast } from '../contexts/ToastContext';
import { useApp } from '../contexts/AppContext';
import { logger } from '../utils/logger';
import { useRealtime } from '../hooks/useRealtime';
import type { Week, Item } from '../types';
import { optimizeAllocation, calculateHistoricalShares, type SupplierQuote, type HistoricalShare } from '../utils/allocationOptimizer';

interface AllocationEntry {
  quote_id: string;
  supplier_name: string;
  supplier_id: string;
  price: number; // rf_final_fob or supplier_fob (prelim)
  isFinalized: boolean; // true if rf_final_fob exists, false if using supplier_fob
  dlvd_price: number | null;
  awarded_volume: number;
  supplier_response_status?: string | null;
  supplier_response_volume?: number | null;
  supplier_response_notes?: string | null;
  // Profit scenario calculations
  deliveredCost: number; // rf_final_fob + freight - rebate
  marginPerCase: number; // sell_price - delivered_cost
  totalMargin: number; // margin_per_case × allocated_cases
}

interface SKUAllocation {
  item: Item;
  entries: AllocationEntry[];
  volumeNeeded: number;
  totalAllocated: number;
  weightedAvgPrice: number;
  isLocked: boolean;
  aiModeEnabled: boolean;
  targetPrice: number;
  fairnessWeight: number; // 0-100
  // Profit scenario rollups
  weightedAvgDeliveredCost: number;
  totalSKUMargin: number;
  // Pricing data for calculations
  rebate: number;
  freight: number;
  sellPrice: number; // dlvd_price from pricing calculations
}

interface AllocationProps {
  selectedWeek: Week | null;
  onWeekUpdate?: (week: Week) => void;
}

// AI Insights Panel Component
function AIInsightsPanel({ sku, selectedWeek }: { sku: SKUAllocation; selectedWeek: Week | null }) {
  const [historicalShares, setHistoricalShares] = useState<Array<{ supplierId: string; sharePercent: number; averageVolume: number }>>([]);
  const [historicalPricing, setHistoricalPricing] = useState<{
    avgPrice: number;
    priceTrend: 'up' | 'down' | 'stable';
    priceChange: number;
    priceVolatility: number; // Standard deviation of prices
    priceMomentum: number; // Recent trend strength
    supplierPerformance: Array<{
      supplierId: string;
      supplierName: string;
      avgPrice: number;
      winRate: number;
      priceVsAvg: number;
      consistency: number; // Price consistency score (lower std dev = higher consistency)
      reliability: number; // How often they submit quotes
      avgVolume: number; // Average volume allocated historically
    }>;
    weeklyTrends: Array<{ week: number; avgPrice: number }>; // Price trend over weeks
  } | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Calculate insights from real data
  const cheapestEntry = sku.entries.length > 0 ? sku.entries.reduce((min, e) => e.price < min.price ? e : min, sku.entries[0]) : null;
  const cheapestDeliveredEntry = sku.entries.length > 0 ? sku.entries.reduce((min, e) => e.deliveredCost < min.deliveredCost ? e : min, sku.entries[0]) : null;
  const highestProfitEntry = sku.entries.length > 0 ? sku.entries.reduce((max, e) => e.totalMargin > max.totalMargin ? e : max, sku.entries[0]) : null;
  const gap = sku.volumeNeeded - sku.totalAllocated;
  
  // Calculate next best move: prioritize profit impact
  let nextBestMove = null;
  let profitMove = null;
  
  if (gap > 0 && sku.totalAllocated > 0) {
    // Option 1: Add to highest margin per case supplier (profit optimization)
    const bestMarginEntry = sku.entries.reduce((max, e) => e.marginPerCase > max.marginPerCase ? e : max, sku.entries[0]);
    if (bestMarginEntry.marginPerCase > 0) {
      const testVolume = Math.min(50, gap);
      const additionalMargin = bestMarginEntry.marginPerCase * testVolume;
      profitMove = {
        supplier: bestMarginEntry.supplier_name,
        cases: testVolume,
        additionalMargin: additionalMargin,
        type: 'profit' as const,
      };
    }
    
    // Option 2: Add to cheapest FOB (cost optimization)
    if (cheapestEntry) {
      const currentTotalCost = sku.entries.reduce((sum, e) => sum + (e.price * e.awarded_volume), 0);
      const currentAvg = sku.weightedAvgPrice;
      const testVolume = Math.min(50, gap);
      const newTotalCost = currentTotalCost + (cheapestEntry.price * testVolume);
      const newTotalVolume = sku.totalAllocated + testVolume;
      const newAvg = newTotalVolume > 0 ? newTotalCost / newTotalVolume : 0;
      const avgDrop = currentAvg - newAvg;
      
      if (avgDrop > 0.01) {
        nextBestMove = {
          supplier: cheapestEntry.supplier_name,
          cases: testVolume,
          avgDrop: avgDrop,
          type: 'cost' as const,
        };
      }
    }
  }

  // Fetch historical data (shares + pricing from last 2 weeks)
  useEffect(() => {
    if (!selectedWeek || sku.entries.length === 0) return;
    
    setLoadingHistory(true);
    
    const loadHistoricalData = async () => {
      try {
        // Fetch historical shares (last 10 weeks for allocation patterns)
        const shares = await fetchHistoricalSupplierShares(sku.item.id, selectedWeek.week_number, 10);
        setHistoricalShares(shares);
        
        // Fetch historical pricing from last 8-10 weeks for deeper analysis
        const { fetchWeeks, fetchQuotesWithDetails } = await import('../utils/database');
        
        // Get last 10 weeks (finalized or closed) for comprehensive analysis
        const allWeeks = await fetchWeeks();
        const previousWeeks = allWeeks
          .filter(w => 
            (w.status === 'finalized' || w.status === 'closed') &&
            w.week_number < selectedWeek.week_number
          )
          .sort((a, b) => b.week_number - a.week_number)
          .slice(0, 10); // Last 10 weeks for deeper insights
        
        if (previousWeeks.length > 0) {
          // Fetch quotes for last 2 weeks
          const historicalQuotes = await Promise.all(
            previousWeeks.map(week => fetchQuotesWithDetails(week.id))
          );
          
          // Filter for this SKU and calculate pricing insights
          const itemHistoricalQuotes = historicalQuotes
            .flat()
            .filter(q => q.item_id === sku.item.id && q.rf_final_fob !== null && q.rf_final_fob > 0);
          
          if (itemHistoricalQuotes.length > 0) {
            // Calculate average historical price
            const historicalPrices = itemHistoricalQuotes.map(q => q.rf_final_fob!);
            const avgHistoricalPrice = historicalPrices.reduce((sum, p) => sum + p, 0) / historicalPrices.length;
            
            // Calculate price volatility (standard deviation)
            const variance = historicalPrices.reduce((sum, p) => sum + Math.pow(p - avgHistoricalPrice, 2), 0) / historicalPrices.length;
            const priceVolatility = Math.sqrt(variance);
            
            // Calculate weekly trends for momentum analysis
            const weeklyTrends: Array<{ week: number; avgPrice: number }> = [];
            previousWeeks.forEach((week, weekIdx) => {
              const weekQuotes = historicalQuotes[weekIdx]
                .filter(q => q.item_id === sku.item.id && q.rf_final_fob !== null && q.rf_final_fob > 0);
              if (weekQuotes.length > 0) {
                const weekAvg = weekQuotes.reduce((sum, q) => sum + (q.rf_final_fob || 0), 0) / weekQuotes.length;
                weeklyTrends.push({ week: week.week_number, avgPrice: weekAvg });
              }
            });
            
            // Calculate price momentum (trend strength over last 4 weeks vs previous 4 weeks)
            let priceMomentum = 0;
            if (weeklyTrends.length >= 8) {
              const recent4 = weeklyTrends.slice(0, 4).reduce((sum, w) => sum + w.avgPrice, 0) / 4;
              const previous4 = weeklyTrends.slice(4, 8).reduce((sum, w) => sum + w.avgPrice, 0) / 4;
              priceMomentum = previous4 > 0 ? ((recent4 - previous4) / previous4) * 100 : 0;
            } else if (weeklyTrends.length >= 4) {
              const recent2 = weeklyTrends.slice(0, 2).reduce((sum, w) => sum + w.avgPrice, 0) / 2;
              const previous2 = weeklyTrends.slice(2, 4).reduce((sum, w) => sum + w.avgPrice, 0) / 2;
              priceMomentum = previous2 > 0 ? ((recent2 - previous2) / previous2) * 100 : 0;
            }
            
            // Calculate current average
            const currentAvgPrice = sku.weightedAvgPrice > 0 ? sku.weightedAvgPrice : 
              sku.entries.reduce((sum, e) => sum + e.price, 0) / sku.entries.length;
            
            // Determine price trend (more sophisticated with momentum)
            const priceChange = currentAvgPrice - avgHistoricalPrice;
            const priceChangePercent = avgHistoricalPrice > 0 ? (priceChange / avgHistoricalPrice) * 100 : 0;
            const priceTrend: 'up' | 'down' | 'stable' = 
              Math.abs(priceChangePercent) < 2 && Math.abs(priceMomentum) < 3 ? 'stable' :
              (priceChangePercent > 0 || priceMomentum > 2) ? 'up' : 'down';
            
            // Calculate supplier performance
            const supplierMap = new Map<string, { prices: number[]; wins: number }>();
            const weekAverages: number[] = [];
            
            // Group by week to calculate weekly averages
            previousWeeks.forEach((week, weekIdx) => {
              const weekQuotes = historicalQuotes[weekIdx]
                .filter(q => q.item_id === sku.item.id && q.rf_final_fob !== null && q.rf_final_fob > 0);
              
              if (weekQuotes.length > 0) {
                const weekAvg = weekQuotes.reduce((sum, q) => sum + (q.rf_final_fob || 0), 0) / weekQuotes.length;
                weekAverages.push(weekAvg);
                
                // Track supplier prices and wins
                weekQuotes.forEach(q => {
                  const supplierId = q.supplier_id;
                  const price = q.rf_final_fob!;
                  
                  if (!supplierMap.has(supplierId)) {
                    supplierMap.set(supplierId, { prices: [], wins: 0 });
                  }
                  
                  const supplier = supplierMap.get(supplierId)!;
                  supplier.prices.push(price);
                  
                  // Check if this supplier had the best price this week
                  const bestPrice = Math.min(...weekQuotes.map(qq => qq.rf_final_fob || Infinity));
                  if (price === bestPrice) {
                    supplier.wins += 1;
                  }
                });
              }
            });
            
            // Build supplier performance array with enhanced metrics
            const supplierPerformance = Array.from(supplierMap.entries()).map(([supplierId, data]) => {
              const supplierName = sku.entries.find(e => e.supplier_id === supplierId)?.supplier_name || 'Unknown';
              const avgPrice = data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length;
              const winRate = previousWeeks.length > 0 ? (data.wins / previousWeeks.length) * 100 : 0;
              const priceVsAvg = avgHistoricalPrice > 0 ? ((avgPrice - avgHistoricalPrice) / avgHistoricalPrice) * 100 : 0;
              
              // Calculate price consistency (lower std dev = more consistent)
              const priceVariance = data.prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / data.prices.length;
              const priceStdDev = Math.sqrt(priceVariance);
              const consistency = avgPrice > 0 ? Math.max(0, 100 - (priceStdDev / avgPrice) * 100) : 0; // 0-100 score
              
              // Calculate reliability (how often they submit quotes)
              const reliability = previousWeeks.length > 0 ? (data.prices.length / previousWeeks.length) * 100 : 0;
              
              // Calculate average volume allocated (from historical shares)
              const historicalShare = shares.find(s => s.supplierId === supplierId);
              const avgVolume = historicalShare?.averageVolume || 0;
              
              return {
                supplierId,
                supplierName,
                avgPrice,
                winRate,
                priceVsAvg,
                consistency,
                reliability,
                avgVolume,
              };
            });
            
            setHistoricalPricing({
              avgPrice: avgHistoricalPrice,
              priceTrend,
              priceChange: priceChangePercent,
              priceVolatility,
              priceMomentum,
              supplierPerformance,
              weeklyTrends,
            });
          }
        }
        
        setLoadingHistory(false);
      } catch (err) {
        logger.error('Error loading historical data:', err);
        setLoadingHistory(false);
      }
    };
    
    loadHistoricalData();
  }, [sku.item.id, sku.entries, sku.weightedAvgPrice, selectedWeek?.week_number, selectedWeek?.id]);

  // Calculate fairness note
  let fairnessNote = null;
  if (historicalShares.length > 0 && sku.volumeNeeded > 0) {
    const currentShares = new Map<string, number>();
    sku.entries.forEach(e => {
      if (e.awarded_volume > 0) {
        const percent = (e.awarded_volume / sku.volumeNeeded) * 100;
        currentShares.set(e.supplier_id, percent);
      }
    });

    // Find largest deviation
    let maxDev = 0;
    let devSupplier = '';
    historicalShares.forEach(hist => {
      const current = currentShares.get(hist.supplierId) || 0;
      const dev = Math.abs(current - hist.sharePercent);
      if (dev > maxDev) {
        maxDev = dev;
        devSupplier = sku.entries.find(e => e.supplier_id === hist.supplierId)?.supplier_name || '';
        const direction = current < hist.sharePercent ? 'below' : 'above';
        fairnessNote = {
          supplier: devSupplier,
          direction,
          deviation: maxDev,
        };
      }
    });
  }

  // Generate smarter suggestions based on historical data
  let historicalSuggestion = null;
  let priceTrendNote = null;
  let bestHistoricalSupplier = null;
  
  if (historicalPricing) {
    const currentAvg = sku.weightedAvgPrice > 0 ? sku.weightedAvgPrice : 
      sku.entries.reduce((sum, e) => sum + e.price, 0) / sku.entries.length;
    
    // Price trend insight - enhanced with momentum
    const trendChange = Math.abs(historicalPricing.priceChange) >= 2 ? historicalPricing.priceChange : 
                       Math.abs(historicalPricing.priceMomentum) >= 2 ? historicalPricing.priceMomentum : 0;
    
    if (Math.abs(trendChange) >= 2) {
      priceTrendNote = {
        trend: historicalPricing.priceTrend,
        change: Math.abs(trendChange),
        direction: trendChange > 0 ? 'higher' : 'lower',
      };
    }
    
    // Find best historical performer (composite score: win rate + consistency + reliability + price)
    if (historicalPricing.supplierPerformance.length > 0) {
      const sorted = [...historicalPricing.supplierPerformance]
        .sort((a, b) => {
          // Composite score: (winRate * 0.4) + (consistency * 0.3) + (reliability * 0.2) - (priceVsAvg * 0.1)
          const scoreA = (a.winRate * 0.4) + (a.consistency * 0.3) + (a.reliability * 0.2) - (Math.abs(a.priceVsAvg) * 0.1);
          const scoreB = (b.winRate * 0.4) + (b.consistency * 0.3) + (b.reliability * 0.2) - (Math.abs(b.priceVsAvg) * 0.1);
          return scoreB - scoreA;
        });
      
      bestHistoricalSupplier = sorted[0];
      
      // Check if this supplier is currently allocated
      const currentEntry = sku.entries.find(e => e.supplier_id === bestHistoricalSupplier.supplierId);
      const currentPrice = currentEntry?.price || 0;
      const priceVsHistorical = bestHistoricalSupplier.avgPrice > 0 ? 
        ((currentPrice - bestHistoricalSupplier.avgPrice) / bestHistoricalSupplier.avgPrice) * 100 : 0;
      
      if (currentEntry && gap > 0) {
        // Suggest allocating more to historically best performer
        const suggestedVolume = Math.min(50, gap);
        const currentAllocated = currentEntry.awarded_volume || 0;
        const newAllocated = currentAllocated + suggestedVolume;
        const newTotalCost = sku.entries.reduce((sum, e) => {
          if (e.supplier_id === bestHistoricalSupplier.supplierId) {
            return sum + (e.price * newAllocated);
          }
          return sum + (e.price * e.awarded_volume);
        }, 0);
        const newAvg = (sku.totalAllocated + suggestedVolume) > 0 ? 
          newTotalCost / (sku.totalAllocated + suggestedVolume) : 0;
        const avgImpact = newAvg - sku.weightedAvgPrice;
        
        // Enhanced suggestion criteria: consider win rate, consistency, and reliability
        const compositeScore = (bestHistoricalSupplier.winRate * 0.4) + 
                               (bestHistoricalSupplier.consistency * 0.3) + 
                               (bestHistoricalSupplier.reliability * 0.2);
        
        if (Math.abs(priceVsHistorical) < 5 && compositeScore >= 60) {
          historicalSuggestion = {
            supplier: bestHistoricalSupplier.supplierName,
            cases: suggestedVolume,
            reason: `Best performer: ${bestHistoricalSupplier.winRate.toFixed(0)}% wins, ${bestHistoricalSupplier.consistency.toFixed(0)}% consistent, ${bestHistoricalSupplier.reliability.toFixed(0)}% reliable`,
            avgImpact: avgImpact,
            priceVsHistorical: priceVsHistorical,
          };
        }
      }
    }
  }

  // Calculate additional insights and projections
  const currentAvgPrice = sku.weightedAvgPrice > 0 ? sku.weightedAvgPrice : 
    sku.entries.reduce((sum, e) => sum + e.price, 0) / sku.entries.length;
  
  // Projection 1: Total Margin (current + projected if gap exists)
  const currentTotalMargin = sku.totalSKUMargin;
  const projectedMarginFromGap = gap > 0 ? (highestProfitEntry?.marginPerCase || 0) * gap : 0;
  const projectedTotalMargin = currentTotalMargin + projectedMarginFromGap;
  
  // Projection 2: Average cost if gap allocated to cheapest
  const projectedAvgCost = gap > 0 && cheapestEntry ? 
    ((sku.entries.reduce((sum, e) => sum + (e.price * e.awarded_volume), 0) + (cheapestEntry.price * gap)) / (sku.totalAllocated + gap)) : 
    sku.weightedAvgPrice;
  
  // Projection 3: Price vs Historical Average
  const priceVsHistorical = historicalPricing ? 
    ((currentAvgPrice - historicalPricing.avgPrice) / historicalPricing.avgPrice) * 100 : 0;
  
  // Projection 4: Cost Savings Potential
  const costSavingsPotential = gap > 0 && cheapestEntry && cheapestDeliveredEntry ? 
    (sku.weightedAvgDeliveredCost - cheapestDeliveredEntry.deliveredCost) * gap : 0;
  
  // Enhanced: Best allocation strategy based on historical data
  let optimalAllocationStrategy = null;
  if (historicalPricing && gap > 0 && bestHistoricalSupplier) {
    const bestSupplierEntry = sku.entries.find(e => e.supplier_id === bestHistoricalSupplier.supplierId);
    if (bestSupplierEntry) {
      const allocateToBest = Math.min(gap, 100); // Suggest allocating some to best performer
      const newTotalCost = sku.entries.reduce((sum, e) => {
        if (e.supplier_id === bestHistoricalSupplier.supplierId) {
          return sum + (e.price * (e.awarded_volume + allocateToBest));
        }
        return sum + (e.price * e.awarded_volume);
      }, 0);
      const newAvg = (sku.totalAllocated + allocateToBest) > 0 ? newTotalCost / (sku.totalAllocated + allocateToBest) : 0;
      const avgImpact = newAvg - sku.weightedAvgPrice;
      
      optimalAllocationStrategy = {
        supplier: bestHistoricalSupplier.supplierName,
        cases: allocateToBest,
        avgImpact,
        reason: `Historical best: ${bestHistoricalSupplier.winRate.toFixed(0)}% wins, ${bestHistoricalSupplier.consistency.toFixed(0)}% consistent`,
      };
    }
  }

  // Generate ticker insights from projections
  const tickerInsights: string[] = [];
  
  // Price trend
  if (priceTrendNote) {
    const trendIcon = priceTrendNote.trend === 'up' ? '↑' : priceTrendNote.trend === 'down' ? '↓' : '→';
    tickerInsights.push(`${trendIcon} Price ${priceTrendNote.trend === 'up' ? 'UP' : priceTrendNote.trend === 'down' ? 'DOWN' : 'STABLE'} ${priceTrendNote.change.toFixed(1)}% vs last 2 weeks`);
  } else if (historicalPricing) {
    const trendIcon = priceVsHistorical > 0 ? '↑' : priceVsHistorical < 0 ? '↓' : '→';
    tickerInsights.push(`${trendIcon} ${Math.abs(priceVsHistorical).toFixed(1)}% vs historical avg ${formatCurrency(historicalPricing.avgPrice)}`);
  }
  
  // Total margin
  tickerInsights.push(`💰 Total Margin: ${formatCurrency(currentTotalMargin)}${gap > 0 && projectedMarginFromGap > 0 ? ` • +${formatCurrency(projectedMarginFromGap)} if gap filled` : ''}`);
  
  // Top performer
  if (bestHistoricalSupplier) {
    tickerInsights.push(`⭐ Top Performer: ${bestHistoricalSupplier.supplierName} • ${bestHistoricalSupplier.winRate.toFixed(0)}% wins • ${bestHistoricalSupplier.consistency.toFixed(0)}% consistent`);
  } else if (cheapestEntry) {
    tickerInsights.push(`⭐ Lowest FOB: ${cheapestEntry.supplier_name} @ ${formatCurrency(cheapestEntry.price)}`);
  }
  
  // Price momentum
  if (historicalPricing) {
    const momentumIcon = historicalPricing.priceMomentum > 2 ? '↑' : historicalPricing.priceMomentum < -2 ? '↓' : '→';
    tickerInsights.push(`${momentumIcon} Momentum: ${Math.abs(historicalPricing.priceMomentum).toFixed(1)}% • Volatility: ${formatCurrency(historicalPricing.priceVolatility)}`);
  }
  
  // Cost savings
  if (costSavingsPotential > 0) {
    tickerInsights.push(`💵 Savings: ${formatCurrency(costSavingsPotential)} if ${gap.toLocaleString()} cases → ${cheapestDeliveredEntry?.supplier_name}`);
  }
  
  // Optimal strategy
  if (optimalAllocationStrategy && gap > 0) {
    tickerInsights.push(`🎯 Optimal: +${optimalAllocationStrategy.cases} to ${optimalAllocationStrategy.supplier}${optimalAllocationStrategy.avgImpact < -0.01 ? ` → ${formatCurrency(Math.abs(optimalAllocationStrategy.avgImpact))}↓ avg` : ''}`);
  }
  
  // Smart action
  if (historicalSuggestion) {
    tickerInsights.push(`✨ Recommended: +${historicalSuggestion.cases} to ${historicalSuggestion.supplier}${historicalSuggestion.avgImpact < -0.01 ? ` → ${formatCurrency(Math.abs(historicalSuggestion.avgImpact))}↓` : ''}`);
  } else if (profitMove && profitMove.additionalMargin > 0) {
    tickerInsights.push(`✨ Profit Boost: +${profitMove.cases} to ${profitMove.supplier} → +${formatCurrency(profitMove.additionalMargin)}`);
  } else if (nextBestMove) {
    tickerInsights.push(`✨ Next Move: +${nextBestMove.cases} to ${nextBestMove.supplier} → ${formatCurrency(nextBestMove.avgDrop)}↓ avg`);
  }
  
  // Gap reminder
  if (gap > 0) {
    tickerInsights.push(`📦 ${gap.toLocaleString()} cases remaining to allocate`);
  } else if (gap < 0) {
    tickerInsights.push(`⚠️ Over-allocated by ${Math.abs(gap).toLocaleString()} cases`);
  } else {
    tickerInsights.push(`✅ Allocation complete: ${sku.totalAllocated.toLocaleString()} cases`);
  }
  
  // Current avg vs projected
  if (projectedAvgCost !== currentAvgPrice) {
    const direction = projectedAvgCost < currentAvgPrice ? '↓' : '↑';
    tickerInsights.push(`${direction} Projected Avg: ${formatCurrency(projectedAvgCost)} vs Current ${formatCurrency(currentAvgPrice)}`);
  }

  // If no insights, add fallback
  if (tickerInsights.length === 0) {
    tickerInsights.push(`📊 ${sku.item.name}: ${sku.entries.length} suppliers • Avg ${formatCurrency(sku.weightedAvgPrice)}`);
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-purple-900/40 backdrop-blur-xl rounded-xl border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/10">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse"></div>
      <div className="flex items-center py-2 px-3">
        <div className="flex items-center gap-2 mr-4 flex-shrink-0">
          <div className="p-1 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-lg border border-cyan-400/50">
            <Brain className="w-3 h-3 text-cyan-200 animate-pulse" />
          </div>
          <span className="text-[8px] font-black text-cyan-200 uppercase tracking-widest">AI Projections</span>
          {loadingHistory && (
            <div className="animate-spin w-2.5 h-2.5 border-2 border-cyan-400/60 border-t-transparent rounded-full"></div>
          )}
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex animate-scroll space-x-6 whitespace-nowrap" style={{ width: 'max-content' }}>
            {[...tickerInsights, ...tickerInsights].map((insight, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[10px] text-white/90 font-medium flex-shrink-0">
                <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Allocation({ selectedWeek, onWeekUpdate }: AllocationProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [skuAllocations, setSkuAllocations] = useState<SKUAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exceptionsMode, setExceptionsMode] = useState(false);
  const [closingLoop, setClosingLoop] = useState(false);
  const [expandedSKUs, setExpandedSKUs] = useState<Set<string>>(new Set());
  
  const { showToast } = useToast();
  const { session } = useApp();
  const draftSaveTimerRef = useRef<NodeJS.Timeout>();

  // Track actual week status from database (not just prop)
  const [actualWeekStatus, setActualWeekStatus] = useState<string | null>(null);
  const [hasFinalizedQuotes, setHasFinalizedQuotes] = useState(false);
  
  // Collect AI insights for stock ticker from PricingIntelligence
  const [tickerInsights, setTickerInsights] = useState<string[]>([]);
  
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [previousWeekData, setPreviousWeekData] = useState<SKUAllocation[] | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    if (!selectedWeek) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Check database status directly (not just prop)
      const { supabase } = await import('../utils/supabase');
      const { data: weekData } = await supabase
        .from('weeks')
        .select('status')
        .eq('id', selectedWeek.id)
        .single();
      
      const dbStatus = weekData?.status || selectedWeek.status;
      setActualWeekStatus(dbStatus);

      const [itemsData, quotes, volumeNeedsData, pricingData] = await Promise.all([
        fetchItems(),
        fetchQuotesWithDetails(selectedWeek.id),
        fetchVolumeNeeds(selectedWeek.id),
        fetchItemPricingCalculations(selectedWeek.id),
      ]);

      // Check if there are any quotes with pricing (finalized or preliminary)
      const hasAnyPricing = quotes.some(q => 
        (q.rf_final_fob !== null && q.rf_final_fob > 0) ||
        (q.supplier_fob !== null && q.supplier_fob > 0)
      );
      setHasFinalizedQuotes(hasAnyPricing); // Reuse this state for "has pricing" check

      // Deduplicate items - remove true duplicates
      // For strawberries: keep only ONE per organic_flag (regardless of pack_size variations)
      // For other items: keep unique combinations of name + pack_size + organic_flag
      const seenItems = new Map<string, Item>();
      const seenStrawberries = new Map<string, Item>(); // Track by organic_flag only
      const sortedItems = [...itemsData].sort((a, b) => a.display_order - b.display_order);
      
      for (const item of sortedItems) {
        const isStrawberry = item.name.toLowerCase().includes('strawberry');
        
        if (isStrawberry) {
          // For strawberries: only one per organic_flag (prefer lower display_order)
          const strawberryKey = item.organic_flag;
          if (!seenStrawberries.has(strawberryKey)) {
            seenStrawberries.set(strawberryKey, item);
          } else {
            // If we already have one, keep the one with lower display_order
            const existing = seenStrawberries.get(strawberryKey)!;
            if (item.display_order < existing.display_order) {
              seenStrawberries.set(strawberryKey, item);
            }
          }
        } else {
          // For other items: keep unique combinations of name + pack_size + organic_flag
          const key = `${item.name}|${item.pack_size}|${item.organic_flag}`;
          if (!seenItems.has(key)) {
            seenItems.set(key, item);
          }
        }
      }
      
      // Combine strawberries and other items
      const finalItems = [
        ...Array.from(seenStrawberries.values()),
        ...Array.from(seenItems.values())
      ].sort((a, b) => {
        // Define commodity order: Strawberry, Blueberry, Raspberry, Blackberry
        const commodityOrder: Record<string, number> = {
          'strawberry': 1,
          'blueberry': 2,
          'raspberry': 3,
          'blackberry': 4
        };
        
        // Sort by commodity order first
        const aOrder = commodityOrder[a.category.toLowerCase()] || 99;
        const bOrder = commodityOrder[b.category.toLowerCase()] || 99;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        
        // Within same commodity: CONV before ORG
        if (a.organic_flag !== b.organic_flag) {
          return a.organic_flag === 'CONV' ? -1 : 1;
        }
        
        // Then by display_order
        return a.display_order - b.display_order;
      });
      
      // Log for debugging
      logger.debug(`Deduplicated items: ${itemsData.length} → ${finalItems.length}`);
      const strawberries = finalItems.filter(item => item.name.toLowerCase().includes('strawberry'));
      if (strawberries.length > 2) {
        logger.warn(`Found ${strawberries.length} strawberries (should be max 2: CONV + ORG)`);
      }
      
      setItems(finalItems);

      // Check if we're in exceptions mode (allocations sent and there are responses)
      const hasResponses = quotes.some(q => 
        q.supplier_volume_response && 
        (q.supplier_volume_response === 'accept' || q.supplier_volume_response === 'update' || q.supplier_volume_response === 'decline')
      );
      setExceptionsMode(selectedWeek.allocation_submitted === true && hasResponses);

      // Build pricing map for profit calculations
      const pricingMap = new Map<string, { rebate: number; freight: number; dlvd_price: number }>();
      pricingData.forEach(p => {
        pricingMap.set(p.item_id, {
          rebate: p.rebate || 0.80,
          freight: p.freight || 1.75,
          dlvd_price: p.dlvd_price || 0,
        });
      });

      // Build SKU allocations
      const allocations: SKUAllocation[] = [];
      const volumeNeedsMap = new Map<string, number>();
      volumeNeedsData.forEach(vn => {
        volumeNeedsMap.set(vn.item_id, vn.volume_needed || 0);
      });

      for (const item of finalItems) {
        // Show items with any pricing (finalized or preliminary)
        const itemQuotes = quotes.filter(q => 
          q.item_id === item.id &&
          ((q.rf_final_fob !== null && q.rf_final_fob > 0) ||
           (q.supplier_fob !== null && q.supplier_fob > 0))
        );

        if (itemQuotes.length === 0) continue;

        // Get pricing data for this item (defaults if not found)
        const pricing = pricingMap.get(item.id) || { rebate: 0.80, freight: 1.75, dlvd_price: 0 };
        const { rebate, freight, dlvd_price: sellPriceFromDb } = pricing;

        const entries: AllocationEntry[] = [];
        for (const quote of itemQuotes) {
          // Use finalized FOB if available, otherwise use preliminary supplier_fob
          const isFinalized = quote.rf_final_fob !== null && quote.rf_final_fob > 0;
          const price = isFinalized ? quote.rf_final_fob! : (quote.supplier_fob || 0);
          
          // Calculate profit scenario metrics
          // Delivered Cost (without margin) for calculation
          const deliveredCostWithoutMargin = price + freight - rebate;
          
          // Total Margin = margin_per_case × allocated_cases (will update live)
          const awardedVolume = quote.awarded_volume || 0;

          entries.push({
            quote_id: quote.id,
            supplier_name: quote.supplier?.name || 'Unknown',
            supplier_id: quote.supplier_id,
            price: price,
            isFinalized: isFinalized,
            dlvd_price: quote.supplier_dlvd ?? null,
            awarded_volume: awardedVolume,
            supplier_response_status: quote.supplier_volume_approval || 
              (quote.supplier_volume_response ? 
                (quote.supplier_volume_response === 'accept' ? 'accepted' : 
                 quote.supplier_volume_response === 'update' ? 'revised' : 
                 'pending') : null),
            supplier_response_volume: quote.supplier_volume_accepted ?? null,
            supplier_response_notes: quote.supplier_volume_response_notes ?? null,
            // Profit scenario calculations - will be calculated after weightedAvgPrice is known
            deliveredCost: 0, // Temporary, will be updated below
            marginPerCase: 0, // Temporary, will be updated below
            totalMargin: 0, // Temporary, will be updated below
          });
        }

        // Sort by price
        entries.sort((a, b) => a.price - b.price);

        const volumeNeeded = volumeNeedsMap.get(item.id) || 0;
        const totalAllocated = entries.reduce((sum, e) => sum + e.awarded_volume, 0);
        const totalCost = entries.reduce((sum, e) => sum + (e.price * e.awarded_volume), 0);
        const weightedAvgPrice = totalAllocated > 0 ? totalCost / totalAllocated : 0;
        
        // Calculate sellPrice: if not set in DB, calculate from formula: rebate + freight + margin + avgFOB
        const defaultMargin = 1.50;
        const sellPrice = sellPriceFromDb > 0 ? sellPriceFromDb : (rebate + freight + defaultMargin + weightedAvgPrice);
        
        // Now calculate profit metrics for each entry with the correct sellPrice
        // Formula: Delivered Price = Rebate + Freight + Margin + FOB (matches calculator exactly)
        // Calculate margin from sellPrice: margin = sellPrice - rebate - freight - avgFOB
        const marginPerCase = sellPrice > 0 ? Math.max(0, sellPrice - rebate - freight - weightedAvgPrice) : defaultMargin;
        const updatedEntries = entries.map(entry => {
          const rebateVal = rebate;
          const freightVal = freight;
          const marginVal = marginPerCase;
          const fob = entry.price;
          
          // Delivered Price = Rebate + Freight + Margin + FOB (matches calculator formula)
          const deliveredPrice = rebateVal + freightVal + marginVal + fob;
          const totalMargin = marginVal * entry.awarded_volume;
          
          return {
            ...entry,
            deliveredCost: deliveredPrice,
            marginPerCase: marginVal,
            totalMargin,
          };
        });

        // Calculate SKU rollups
        // Weighted Avg Delivered Price (with margin)
        const totalDeliveredPrice = updatedEntries.reduce((sum, e) => sum + (e.deliveredCost * e.awarded_volume), 0);
        const weightedAvgDeliveredCost = totalAllocated > 0 ? totalDeliveredPrice / totalAllocated : 0;

        // Total SKU Margin (sum of all shipper margins)
        const totalSKUMargin = updatedEntries.reduce((sum, e) => sum + e.totalMargin, 0);

        allocations.push({
          item,
          entries: updatedEntries,
          volumeNeeded,
          totalAllocated,
          weightedAvgPrice,
          isLocked: false, // TODO: Load from database when locked column exists
          aiModeEnabled: false,
          targetPrice: weightedAvgPrice || 0,
          fairnessWeight: 50, // Default to balanced
          // Profit scenario rollups
          weightedAvgDeliveredCost,
          totalSKUMargin,
          // Pricing data
          rebate,
          freight,
          sellPrice,
        });
      }

      setSkuAllocations(allocations);
    } catch (err: any) {
      logger.error('Error loading allocation data:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      showToast(`Failed to load allocation data: ${errorMessage}`, 'error');
      console.error('Allocation load error details:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedWeek?.id, selectedWeek?.allocation_submitted, showToast]);

  useEffect(() => {
    if (selectedWeek) {
      loadData();
    }
  }, [selectedWeek?.id, selectedWeek?.status, selectedWeek?.allocation_submitted, loadData]);
  
  // Realtime subscription: Refresh when quotes are updated (rf_final_fob set)
  const handleQuotesUpdate = useCallback(() => {
    if (selectedWeek?.id) {
      logger.debug('Quotes updated, refreshing allocation data...');
      loadData();
    }
  }, [selectedWeek?.id, loadData]);

  // Subscribe to quotes table changes for this week
  useRealtime('quotes', handleQuotesUpdate, { 
    column: 'week_id', 
    value: selectedWeek?.id 
  });
  
  // Re-check week status periodically if still open (to catch status changes)
  useEffect(() => {
    if (!selectedWeek || selectedWeek.status === 'finalized' || selectedWeek.status === 'closed') {
      return;
    }
    
    const interval = setInterval(async () => {
      const { supabase } = await import('../utils/supabase');
      const { data: weekData } = await supabase
        .from('weeks')
        .select('status')
        .eq('id', selectedWeek.id)
        .single();
      
      if (weekData?.status && weekData.status !== selectedWeek.status) {
        // Status changed, reload data
        loadData();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [selectedWeek?.id, selectedWeek?.status, loadData]);

  // Update volume needed for a SKU
  const updateVolumeNeeded = useCallback(async (itemId: string, volume: number) => {
    if (!selectedWeek) return;

    setSkuAllocations(prev => prev.map(sku => {
      if (sku.item.id !== itemId) return sku;
      return { ...sku, volumeNeeded: volume };
    }));

    // Debounced save
    if (draftSaveTimerRef.current) {
      clearTimeout(draftSaveTimerRef.current);
    }

    draftSaveTimerRef.current = setTimeout(async () => {
      try {
        const success = await updateVolumeNeededDB(selectedWeek.id, itemId, volume);
        if (!success) {
          showToast('Failed to save volume needed', 'error');
        }
      } catch (err) {
        logger.error('Error saving volume needed:', err);
      }
    }, 500);
  }, [selectedWeek, showToast]);

  // Update pricing calculations (rebate, freight, margin) - live calculator
  const updatePricingCalculation = useCallback(async (
    itemId: string,
    field: 'rebate' | 'freight' | 'margin',
    value: number
  ) => {
    if (!selectedWeek) return;

    setSkuAllocations(prev => prev.map(sku => {
      if (sku.item.id !== itemId) return sku;

      // Update the field
      const updatedRebate = field === 'rebate' ? value : sku.rebate;
      const updatedFreight = field === 'freight' ? value : sku.freight;
      
      // Calculate current margin from sellPrice (if it exists) or use the new margin value
      // Margin calculation: sellPrice = rebate + freight + margin + avgFOB
      // So: margin = sellPrice - rebate - freight - avgFOB
      let updatedMargin: number;
      if (field === 'margin') {
        // User is directly setting margin - ensure it's at least 0
        updatedMargin = Math.max(0, value);
      } else {
        // Calculate margin from existing sellPrice, or default to 1.50 if sellPrice is not set
        if (sku.sellPrice > 0) {
          // margin = sellPrice - rebate - freight - avgFOB
          updatedMargin = Math.max(0, sku.sellPrice - sku.rebate - sku.freight - sku.weightedAvgPrice);
        } else {
          updatedMargin = 1.50; // Default margin
        }
      }
      
      // Calculate dlvd_price: Rebate + Freight + Margin + Avg FOB
      const updatedDlvdPrice = updatedRebate + updatedFreight + updatedMargin + sku.weightedAvgPrice;

      // Recalculate all entries with new pricing
      // Formula: Delivered Price = Rebate + Freight + Margin + FOB (matches calculator exactly)
      const updatedEntries = sku.entries.map(entry => {
        const rebate = updatedRebate;
        const freight = updatedFreight;
        const margin = updatedMargin;
        const fob = entry.price;
        
        // Delivered Price = Rebate + Freight + Margin + FOB (matches calculator formula)
        const deliveredPrice = rebate + freight + margin + fob;
        
        // Margin per Case = margin from calculator (same for all suppliers)
        const marginPerCase = margin;
        
        // Total Margin = margin_per_case × allocated_cases
        const totalMargin = marginPerCase * entry.awarded_volume;

        return {
          ...entry,
          deliveredCost: deliveredPrice, // Store delivered price in deliveredCost field for display
          marginPerCase,
          totalMargin,
        };
      });

      // Recalculate SKU rollups
      const totalAllocated = updatedEntries.reduce((sum, e) => sum + e.awarded_volume, 0);
      const totalDeliveredPrice = updatedEntries.reduce((sum, e) => sum + (e.deliveredCost * e.awarded_volume), 0);
      const weightedAvgDeliveredCost = totalAllocated > 0 ? totalDeliveredPrice / totalAllocated : 0;
      const totalSKUMargin = updatedEntries.reduce((sum, e) => sum + e.totalMargin, 0);

      return {
        ...sku,
        entries: updatedEntries,
        rebate: updatedRebate,
        freight: updatedFreight,
        sellPrice: updatedDlvdPrice, // Store dlvd_price here
        weightedAvgDeliveredCost,
        totalSKUMargin,
      };
    }));

    // Debounced save to database
    if (draftSaveTimerRef.current) {
      clearTimeout(draftSaveTimerRef.current);
    }

    draftSaveTimerRef.current = setTimeout(async () => {
      try {
        // Get the updated SKU from state
        setSkuAllocations(current => {
          const sku = current.find(s => s.item.id === itemId);
          if (!sku) return current;

          // Calculate margin from sellPrice: margin = sellPrice - rebate - freight - avgFOB
          const margin = sku.sellPrice - sku.rebate - sku.freight - sku.weightedAvgPrice;

          // Save to database
          updateItemPricingCalculation(selectedWeek.id, itemId, {
            rebate: sku.rebate,
            freight: sku.freight,
            margin: margin,
            dlvd_price: sku.sellPrice, // dlvd_price is calculated from avgCost + margin
          }).then(result => {
            if (!result.success) {
              showToast('Failed to save pricing calculation', 'error');
            }
          }).catch(err => {
            logger.error('Error saving pricing calculation:', err);
          });

          return current;
        });
      } catch (err) {
        logger.error('Error saving pricing calculation:', err);
      }
    }, 500);
  }, [selectedWeek, showToast]);

  // Update allocated volume for a supplier
  const updateAllocation = useCallback(async (
    itemId: string, 
    supplierId: string, 
    quoteId: string, 
    volume: number
  ) => {
    if (!selectedWeek) return;

    setSkuAllocations(prev => prev.map(sku => {
      if (sku.item.id !== itemId) return sku;

      const updatedEntries = sku.entries.map(entry => {
        if (entry.quote_id === quoteId) {
          // Recalculate deliveredCost and total margin when volume changes
          // Formula: Delivered Price = Rebate + Freight + Margin + FOB
          const rebate = sku.rebate || 0;
          const freight = sku.freight || 0;
          const margin = entry.marginPerCase; // Use existing marginPerCase
          const fob = entry.price;
          const deliveredPrice = rebate + freight + margin + fob;
          const newTotalMargin = entry.marginPerCase * volume;
          return { 
            ...entry, 
            awarded_volume: volume,
            deliveredCost: deliveredPrice,
            totalMargin: newTotalMargin,
          };
        }
        return entry;
      });

      const totalAllocated = updatedEntries.reduce((sum, e) => sum + e.awarded_volume, 0);
      const totalCost = updatedEntries.reduce((sum, e) => sum + (e.price * e.awarded_volume), 0);
      const weightedAvgPrice = totalAllocated > 0 ? totalCost / totalAllocated : 0;

      // Recalculate SKU rollups
      const totalDeliveredCost = updatedEntries.reduce((sum, e) => sum + (e.deliveredCost * e.awarded_volume), 0);
      const weightedAvgDeliveredCost = totalAllocated > 0 ? totalDeliveredCost / totalAllocated : 0;
      const totalSKUMargin = updatedEntries.reduce((sum, e) => sum + e.totalMargin, 0);

      // Recalculate dlvd Price (sellPrice) when volumes change, using current margin
      // Formula: dlvd Price = Rebate + Freight + Margin + Avg FOB
      // Calculate margin from sellPrice: margin = sellPrice - rebate - freight - avgFOB
      const currentMargin = sku.sellPrice > 0 ? Math.max(0, sku.sellPrice - sku.rebate - sku.freight - weightedAvgPrice) : 1.50;
      const updatedSellPrice = sku.rebate + sku.freight + currentMargin + weightedAvgPrice;

      return {
        ...sku,
        entries: updatedEntries,
        totalAllocated,
        weightedAvgPrice,
        weightedAvgDeliveredCost,
        totalSKUMargin,
        sellPrice: updatedSellPrice, // Update sellPrice when volumes change
      };
    }));

    // Debounced save to database
    if (draftSaveTimerRef.current) {
      clearTimeout(draftSaveTimerRef.current);
    }

    draftSaveTimerRef.current = setTimeout(async () => {
      try {
        const { supabase } = await import('../utils/supabase');
        await supabase
          .from('quotes')
          .upsert({
            week_id: selectedWeek.id,
            supplier_id: supplierId,
            item_id: itemId,
            awarded_volume: volume > 0 ? volume : null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'week_id,item_id,supplier_id'
          });
      } catch (err) {
        logger.error('Error saving allocation:', err);
        showToast('Failed to save allocation', 'error');
      }
    }, 500);
  }, [selectedWeek, showToast]);

  // Toggle SKU expanded state
  const toggleSKUExpanded = useCallback((itemId: string) => {
    setExpandedSKUs(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  // Lock/unlock SKU
  const toggleLockSKU = useCallback((itemId: string) => {
    setSkuAllocations(prev => prev.map(sku => {
      if (sku.item.id !== itemId) return sku;
      return { ...sku, isLocked: !sku.isLocked };
    }));
  }, []);

  // Auto Allocate - Uses Total Volume Needed to distribute across suppliers
  const handleAIAutoAllocate = useCallback(async (sku: SKUAllocation) => {
    if (!selectedWeek || sku.volumeNeeded <= 0) {
      showToast('Please set volume needed first', 'error');
      return;
    }

    if (sku.entries.length === 0) {
      showToast('No suppliers available for allocation', 'error');
      return;
    }

    try {
      // If target price is set, use optimizer with historical shares
      if (sku.targetPrice > 0) {
        // Fetch historical shares
        const historicalShares = await fetchHistoricalSupplierShares(
          sku.item.id,
          selectedWeek.week_number,
          10
        );

        // Convert to optimizer format
        const quotes: SupplierQuote[] = sku.entries.map(entry => ({
          supplierId: entry.supplier_id,
          supplierName: entry.supplier_name,
          price: entry.price,
          maxVolume: undefined, // TODO: Add if tracked
        }));

        const historicalSharesFormatted: HistoricalShare[] = historicalShares.map(share => ({
          supplierId: share.supplierId,
          sharePercent: share.sharePercent,
          averageVolume: share.averageVolume,
        }));

        // Optimize with target price
        const result = optimizeAllocation({
          quotes,
          totalVolumeNeeded: sku.volumeNeeded,
          targetAvgPrice: sku.targetPrice,
          historicalShares: historicalSharesFormatted,
          fairnessWeight: sku.fairnessWeight,
        });

        if (!result.isAchievable && result.reason) {
          showToast(result.reason, 'warning');
        }

        // Apply allocations
        result.allocations.forEach((volume, supplierId) => {
          const entry = sku.entries.find(e => e.supplier_id === supplierId);
          if (entry && volume > 0) {
            updateAllocation(sku.item.id, supplierId, entry.quote_id, volume);
          } else if (entry && volume === 0) {
            // Clear allocation if optimizer set to 0
            updateAllocation(sku.item.id, supplierId, entry.quote_id, 0);
          }
        });

        showToast(
          `Auto allocation complete! Achieved: ${formatCurrency(result.achievedPrice)}`,
          'success'
        );
      } else {
        // Simple allocation: distribute evenly across all suppliers (or to cheapest if fairness is 0)
        // Clear existing allocations first
        sku.entries.forEach(entry => {
          updateAllocation(sku.item.id, entry.supplier_id, entry.quote_id, 0);
        });

        // Small delay to ensure clears complete, then allocate
        setTimeout(() => {
          if (sku.fairnessWeight === 0) {
            // Pure cheapest: allocate all to cheapest supplier
            const cheapest = sku.entries.reduce((min, e) => e.price < min.price ? e : min, sku.entries[0]);
            updateAllocation(sku.item.id, cheapest.supplier_id, cheapest.quote_id, sku.volumeNeeded);
            showToast(`Allocated ${sku.volumeNeeded.toLocaleString()} cases to ${cheapest.supplier_name} (cheapest)`, 'success');
          } else {
            // Distribute evenly across all suppliers
            const perSupplier = Math.floor(sku.volumeNeeded / sku.entries.length);
            const remainder = sku.volumeNeeded % sku.entries.length;
            
            sku.entries.forEach((entry, index) => {
              const volume = perSupplier + (index < remainder ? 1 : 0);
              if (volume > 0) {
                updateAllocation(sku.item.id, entry.supplier_id, entry.quote_id, volume);
              }
            });
            showToast(`Distributed ${sku.volumeNeeded.toLocaleString()} cases across ${sku.entries.length} suppliers`, 'success');
          }
        }, 100);
      }
    } catch (err) {
      logger.error('Error in auto-allocate:', err);
      showToast('Failed to run auto allocation', 'error');
    }
  }, [selectedWeek, showToast, updateAllocation]);

  // Send Awards to Suppliers
  const handleSendAwards = useCallback(async () => {
    if (!selectedWeek || !session) return;

    // All SKUs can be sent (no lock requirement)

    setSubmitting(true);
    try {
      const result = await submitAllocationsToSuppliers(selectedWeek.id, session.user_name);
      if (result.success) {
        showToast(`Awards sent to ${result.count} supplier(s)`, 'success');
        await loadData();
        
        // Update week status
        if (onWeekUpdate) {
          const { supabase } = await import('../utils/supabase');
          const { data: updatedWeek } = await supabase
            .from('weeks')
            .select('*')
            .eq('id', selectedWeek.id)
            .single();
          if (updatedWeek) {
            onWeekUpdate(updatedWeek as Week);
          }
        }
      } else {
        showToast(result.error || 'Failed to send awards', 'error');
      }
    } catch (err) {
      logger.error('Error sending awards:', err);
      showToast('Failed to send awards', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [selectedWeek, session, skuAllocations, showToast, loadData, onWeekUpdate]);

  // Close Loop
  const handleCloseLoop = useCallback(async () => {
    if (!selectedWeek || !session) return;

    setClosingLoop(true);
    try {
      const result = await closeVolumeLoop(selectedWeek.id, session.user_name);
      if (result.success) {
        showToast(result.message, 'success');
        await loadData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      logger.error('Error closing loop:', err);
      showToast('Failed to close loop', 'error');
    } finally {
      setClosingLoop(false);
    }
  }, [selectedWeek, session, showToast, loadData]);

  // Load AI insights for ticker - MUST be before any early returns
  useEffect(() => {
    const loadAIInsights = async () => {
      if (!selectedWeek || skuAllocations.length === 0) {
        setTickerInsights([]);
        return;
      }
      
      try {
        // Fetch quotes for the selected week
        const weekQuotes = await fetchQuotesWithDetails(selectedWeek.id);
        const allItems = await fetchItems();
        
        // Import PricingIntelligence logic to generate insights
        const { fetchCompleteHistoricalData, formatForPricingIntelligence } = await import('../utils/historicalData');
        const completeHistoricalData = await fetchCompleteHistoricalData();
        const historicalToUse = formatForPricingIntelligence(completeHistoricalData);
        const historicalMap = new Map(historicalToUse.map(d => [d.item_id, d]));
        
        const insights: string[] = [];
        const itemMap = new Map(allItems.map(i => [i.id, i]));
        
        // Group quotes by item
        const quotesByItem = new Map<string, typeof weekQuotes>();
        weekQuotes.forEach(q => {
          if (!quotesByItem.has(q.item_id)) {
            quotesByItem.set(q.item_id, []);
          }
          quotesByItem.get(q.item_id)!.push(q);
        });
        
        // Generate insights similar to PricingIntelligence
        quotesByItem.forEach((itemQuotes, itemId) => {
          const item = itemMap.get(itemId);
          if (!item) return;
          
          const validQuotes = itemQuotes
            .map(q => {
              const price = q.rf_final_fob ?? q.supplier_revised_fob ?? q.supplier_fob;
              return { ...q, effectivePrice: price };
            })
            .filter(q => q.effectivePrice !== null && q.effectivePrice !== undefined && q.effectivePrice > 0);
          
          if (validQuotes.length === 0) return;
          
          const prices = validQuotes.map(q => q.effectivePrice!);
          const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const spread = prices.length > 1 ? ((maxPrice - minPrice) / avgPrice) * 100 : 0;
          const historical = historicalMap.get(itemId);
          
          // Price spread opportunity
          if (spread > 10) {
            insights.push(`📊 ${item.name}: ${spread.toFixed(1)}% price spread - negotiation opportunity`);
          }
          
          // Price increase risk
          if (historical && historical.avgPrice > 0 && avgPrice > historical.avgPrice * 1.05) {
            const increasePercent = ((avgPrice / historical.avgPrice - 1) * 100);
            insights.push(`⚠️ ${item.name}: ${increasePercent.toFixed(1)}% above historical avg`);
          }
          
          // Best price recommendation
          if (validQuotes.length > 1) {
            const bestQuote = validQuotes.reduce((best, q) => 
              (!best || q.effectivePrice! < best.effectivePrice!) ? q : best
            );
            if (bestQuote && bestQuote.effectivePrice! < avgPrice * 0.98) {
              const savingsPercent = ((1 - bestQuote.effectivePrice! / avgPrice) * 100);
              insights.push(`⭐ Best Price: ${bestQuote.supplier?.name || 'Supplier'} - ${savingsPercent.toFixed(1)}% below avg`);
            }
          }
          
          // Price trend
          if (historical) {
            if (historical.trend === 'up') {
              insights.push(`📈 ${item.name}: Upward price trend detected`);
            } else if (historical.trend === 'down') {
              insights.push(`📉 ${item.name}: Declining price trend - good negotiation window`);
            }
          }
        });
        
        // Add allocation-specific insights
        skuAllocations.forEach(sku => {
          const gap = sku.volumeNeeded - sku.totalAllocated;
          if (gap > 0) {
            insights.push(`📦 ${sku.item.name}: ${gap.toLocaleString()} cases remaining to allocate`);
          }
          if (sku.totalSKUMargin > 0) {
            insights.push(`💰 ${sku.item.name}: Total Margin ${formatCurrency(sku.totalSKUMargin)}`);
          }
        });
        
        setTickerInsights(insights);
      } catch (err) {
        logger.error('Error loading AI insights for ticker:', err);
        // Fallback to basic insights
        const fallback: string[] = [];
        skuAllocations.forEach(sku => {
          if (sku.weightedAvgPrice > 0) {
            fallback.push(`${sku.item.name}: Avg ${formatCurrency(sku.weightedAvgPrice)}`);
          }
        });
        setTickerInsights(fallback);
      }
    };
    
    loadAIInsights();
  }, [selectedWeek?.id, skuAllocations.length]);

  if (!selectedWeek) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-12 text-center border border-white/20">
        <Award className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <p className="text-white text-lg font-medium">No week selected</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-12 text-center border border-white/20">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white font-semibold text-lg">Loading allocation data...</p>
      </div>
    );
  }

  // Check if week is finalized - use database status OR check for finalized quotes
  // This allows access if: week status is finalized/closed OR there are finalized quotes
  const weekStatus = actualWeekStatus || selectedWeek.status;
  const canAccess = weekStatus === 'finalized' || weekStatus === 'closed' || hasFinalizedQuotes;
  
  if (!canAccess) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-12 text-center border border-white/20">
        <Info className="w-16 h-16 text-white/40 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-white mb-3">Allocation Not Available</h3>
        <p className="text-white/70 mb-2 text-lg">At least one shipper must submit pricing to continue.</p>
        <p className="text-white/50 text-sm mt-2">
          Go to Pricing tab and have suppliers submit pricing (supplier_fob). You can start allocation planning with preliminary pricing, but all allocated quotes must be finalized before sending volume to shippers.
        </p>
      </div>
    );
  }

  const allSKUsLocked = skuAllocations.length > 0; // No lock requirement
  const hasExceptions = skuAllocations.some(sku => 
    sku.entries.some(e => 
      e.supplier_response_status === 'revised' || 
      e.supplier_response_status === 'accepted' ||
      (e.supplier_response_status === 'pending' && e.supplier_response_volume !== null)
    )
  );
  const allExceptionsResolved = !hasExceptions || skuAllocations.every(sku =>
    sku.entries.every(e => {
      // Exception is resolved if: no response, accepted, or revised and RF accepted it (awarded_volume matches supplier_response_volume)
      if (!e.supplier_response_status || e.supplier_response_status === null) return true;
      if (e.supplier_response_status === 'accepted') return true;
      if (e.supplier_response_status === 'revised') {
        // Resolved if RF accepted the revision (awarded_volume matches supplier_response_volume)
        return Math.abs((e.awarded_volume || 0) - (e.supplier_response_volume || 0)) < 0.01;
      }
      return false;
    })
  );

  // Calculate overall summary
  const overallTotalVolume = skuAllocations.reduce((sum, sku) => sum + sku.totalAllocated, 0);
  const overallTotalNeeded = skuAllocations.reduce((sum, sku) => sum + sku.volumeNeeded, 0);
  const overallTotalCost = skuAllocations.reduce((sum, sku) => {
    return sum + sku.entries.reduce((s, e) => s + (e.price * e.awarded_volume), 0);
  }, 0);
  const overallWeightedAvg = overallTotalVolume > 0 ? overallTotalCost / overallTotalVolume : 0;
  
  // Check if at least one SKU has volume allocated
  const hasAnyAllocation = skuAllocations.some(sku => 
    sku.entries.some(entry => entry.awarded_volume > 0)
  );
  
  // Check if all SKUs have complete allocation (totalAllocated = volumeNeeded for all SKUs)
  const allSKUsComplete = skuAllocations.length > 0 && skuAllocations.every(sku => 
    sku.volumeNeeded > 0 && Math.abs(sku.totalAllocated - sku.volumeNeeded) < 0.01
  );
  
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

  return (
    <div className="space-y-6">
      {/* Futuristic AI Insights Stock Ticker */}
      {tickerInsights.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-purple-900/40 backdrop-blur-xl rounded-xl border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse"></div>
          <div className="flex items-center py-3 px-4">
            <div className="flex items-center gap-2 mr-6 flex-shrink-0">
              <div className="p-1.5 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-lg border border-cyan-400/50">
                <Brain className="w-4 h-4 text-cyan-200 animate-pulse" />
              </div>
              <span className="text-xs font-black text-cyan-200 uppercase tracking-widest">AI Insights</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="flex animate-scroll space-x-8 whitespace-nowrap" style={{ width: 'max-content' }}>
                {[...tickerInsights, ...tickerInsights].map((insight, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-white/90 font-medium flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-lime-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl border-2 border-emerald-400/50 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/30 rounded-xl border border-emerald-400/50">
              <Sparkles className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                AI Allocation
                {exceptionsMode && (
                  <span className="text-sm font-normal bg-orange-500/30 text-orange-200 px-3 py-1 rounded-full border border-orange-400/50">
                    Exceptions Mode
                  </span>
                )}
                {comparisonMode && (
                  <span className="text-sm font-normal bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full border border-blue-400/50">
                    Comparison Mode
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-white/70">
                <span>Week {selectedWeek.week_number}</span>
                <span>•</span>
                <span>
                  {new Date(selectedWeek.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                  {new Date(selectedWeek.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData()}
              disabled={refreshing}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {!exceptionsMode && !selectedWeek.allocation_submitted && (
              <button
                onClick={handleSendAwards}
                disabled={submitting || !hasAnyAllocation || !allSKUsComplete || !allAllocatedQuotesFinalized}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                title={
                  !hasAnyAllocation
                    ? "Allocate volume to at least one supplier before sending"
                    : !allSKUsComplete 
                    ? "Complete allocation for all SKUs before sending (Total Allocated must equal Total Needed for each SKU)" 
                    : !allAllocatedQuotesFinalized
                    ? `All allocated quotes must be finalized. Still preliminary: ${prelimAllocations.map(p => `${p.supplier} (${p.sku})`).join(', ')}`
                    : ""
                }
              >
                {submitting ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Volume to Shippers
                  </>
                )}
              </button>
            )}

            {exceptionsMode && allExceptionsResolved && (
              <button
                onClick={handleCloseLoop}
                disabled={closingLoop}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {closingLoop ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Closing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Close Loop
                  </>
                )}
              </button>
            )}

            {/* Comparison Mode Toggle */}
            {!exceptionsMode && (
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                disabled={loadingComparison || !selectedWeek}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  comparisonMode
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                } disabled:opacity-50`}
                title={!selectedWeek ? "Select a week to enable comparison" : "Compare current week's allocation to previous week"}
              >
                {loadingComparison ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <History className="w-4 h-4" />
                )}
                {comparisonMode ? 'Hide Comparison' : 'Compare to Last Week'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overall Summary Panel */}
      {skuAllocations.length > 0 && !exceptionsMode && (
        <div className="bg-gradient-to-br from-slate-800/40 via-emerald-900/30 to-slate-800/40 backdrop-blur-xl rounded-2xl border-2 border-emerald-400/30 p-6 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-white/60 font-bold uppercase tracking-wider mb-2">Total Volume</div>
              <div className="text-3xl font-black text-white">
                {overallTotalVolume.toLocaleString()} / {overallTotalNeeded.toLocaleString()}
              </div>
              <div className="text-xs text-white/50 mt-1">cases</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-white/60 font-bold uppercase tracking-wider mb-2">Blended Avg Cost</div>
              <div className="text-3xl font-black text-emerald-300">
                {overallWeightedAvg > 0 ? formatCurrency(overallWeightedAvg) : '-'}
              </div>
              <div className="text-xs text-white/50 mt-1">per case</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-white/60 font-bold uppercase tracking-wider mb-2">Total Cost</div>
              <div className="text-3xl font-black text-lime-300">
                {formatCurrency(overallTotalCost)}
              </div>
              <div className="text-xs text-white/50 mt-1">FOB</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-white/60 font-bold uppercase tracking-wider mb-2">Ready to Send</div>
              <div className="text-3xl font-black text-blue-300">
                {skuAllocations.length} SKUs
              </div>
              <div className="text-xs text-white/50 mt-1">
                All configured
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison View */}
      {comparisonMode && previousWeekData !== null && (
        <div className="mb-6 bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-blue-900/40 backdrop-blur-xl rounded-2xl border-2 border-blue-400/30 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-5 h-5 text-blue-300" />
            <h3 className="text-lg font-black text-white">Week Comparison</h3>
            <span className="text-sm text-white/60">
              Week {selectedWeek?.week_number} vs Week {selectedWeek ? selectedWeek.week_number - 1 : 'N/A'}
            </span>
          </div>
          {loadingComparison ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-white/60">Loading previous week data...</p>
            </div>
          ) : previousWeekData.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <p>No previous week data available for comparison</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {skuAllocations.map((currentSku) => {
                const previousSku = previousWeekData.find(p => 
                  p.item.name === currentSku.item.name && 
                  p.item.organic_flag === currentSku.item.organic_flag
                );

                if (!previousSku) return null;

                const volumeChange = currentSku.totalAllocated - previousSku.totalAllocated;
                const priceChange = currentSku.weightedAvgPrice - previousSku.weightedAvgPrice;
                const priceChangePercent = previousSku.weightedAvgPrice > 0 
                  ? (priceChange / previousSku.weightedAvgPrice) * 100 
                  : 0;

                return (
                  <div key={currentSku.item.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-sm font-bold text-white">{currentSku.item.name}</h4>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        currentSku.item.organic_flag === 'ORG' 
                          ? 'bg-green-500/30 text-green-300' 
                          : 'bg-blue-500/30 text-blue-300'
                      }`}>
                        {currentSku.item.organic_flag}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-white/60 mb-1">Volume</div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{currentSku.totalAllocated.toLocaleString()}</span>
                          {volumeChange !== 0 && (
                            <span className={`text-[10px] font-bold ${
                              volumeChange > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {volumeChange > 0 ? '↑' : '↓'} {Math.abs(volumeChange).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-white/40 text-[10px] mt-0.5">
                          Prev: {previousSku.totalAllocated.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">Avg FOB</div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{formatCurrency(currentSku.weightedAvgPrice)}</span>
                          {priceChange !== 0 && (
                            <span className={`text-[10px] font-bold ${
                              priceChange > 0 ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {priceChange > 0 ? '↑' : '↓'} {Math.abs(priceChangePercent).toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <div className="text-white/40 text-[10px] mt-0.5">
                          Prev: {formatCurrency(previousSku.weightedAvgPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SKU Allocations */}
      {skuAllocations.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-12 text-center border border-white/20">
          <Package className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <p className="text-white/80 text-lg font-bold">No SKUs with finalized pricing</p>
        </div>
      ) : (
        <div className="space-y-4">
          {skuAllocations.map((sku) => {
            const remaining = sku.volumeNeeded - sku.totalAllocated;
            const isComplete = sku.totalAllocated === sku.volumeNeeded && sku.volumeNeeded > 0;
            const isOver = sku.totalAllocated > sku.volumeNeeded;
            const isExpanded = expandedSKUs.has(sku.item.id);
            const cheapestPrice = sku.entries.length > 0 ? Math.min(...sku.entries.map(e => e.price)) : 0;
            const cheapestSupplier = sku.entries.find(e => e.price === cheapestPrice);
            const targetDiff = sku.targetPrice > 0 ? sku.weightedAvgPrice - sku.targetPrice : 0;

            // In exceptions mode, only show SKUs with exceptions
            if (exceptionsMode) {
      const hasException = sku.entries.some(e => 
        e.supplier_response_status === 'revised' || 
        e.supplier_response_status === 'accepted' ||
        (e.supplier_response_status === 'pending' && e.supplier_response_volume !== null)
      );
      if (!hasException) return null;
            }

            return (
              <div key={sku.item.id} className="bg-gradient-to-br from-slate-800/40 via-emerald-900/20 to-slate-800/40 backdrop-blur-xl rounded-2xl border-2 border-emerald-400/30 overflow-hidden shadow-2xl hover:border-emerald-400/50 transition-all">
                {/* SKU Header - Clean & Futuristic */}
                <div className="bg-gradient-to-r from-emerald-500/20 via-lime-500/15 to-emerald-500/20 px-5 py-4 border-b-2 border-emerald-400/30">
                  <div className="flex items-center justify-between gap-6">
                    {/* SKU Name - Compact */}
                    <div className="min-w-[180px] shrink-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base font-black text-white truncate">{sku.item.name}</h3>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          sku.item.organic_flag === 'ORG' 
                            ? 'bg-green-500/30 text-green-300 border border-green-400/50' 
                            : 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                        }`}>
                          {sku.item.organic_flag === 'ORG' ? 'ORG' : 'CONV'}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/50">{sku.item.pack_size}</div>
                    </div>

                    {/* 6 Key Metrics - Perfectly Even & Aligned - All Shining */}
                    <div className="grid grid-cols-6 gap-2 flex-1">
                      <div className="bg-gradient-to-br from-cyan-500/25 to-blue-500/25 backdrop-blur-sm rounded-lg p-2 border border-cyan-400/40 text-center ring-1 ring-cyan-400/30 shadow-lg shadow-cyan-500/10 min-w-0 flex flex-col justify-center">
                        <div className="text-[7px] text-cyan-200/80 font-bold uppercase tracking-widest mb-1 h-3 flex items-center justify-center">Total Needed</div>
                        {exceptionsMode ? (
                          <div className="text-sm font-black text-white leading-none h-5 flex items-center justify-center">{sku.volumeNeeded.toLocaleString()}</div>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            value={sku.volumeNeeded || ''}
                            onChange={(e) => updateVolumeNeeded(sku.item.id, parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full text-sm font-black text-white bg-transparent border-none outline-none text-center focus:ring-0 p-0 leading-none h-5 placeholder:text-white/30"
                          />
                        )}
                      </div>
                      <div className={`bg-gradient-to-br backdrop-blur-sm rounded-lg p-2 border text-center ring-1 shadow-lg min-w-0 flex flex-col justify-center ${
                        isComplete ? 'from-green-500/25 to-emerald-500/25 border-green-400/40 ring-green-400/30 shadow-green-500/10' :
                        isOver ? 'from-red-500/25 to-rose-500/25 border-red-400/40 ring-red-400/30 shadow-red-500/10' :
                        'from-emerald-500/25 to-lime-500/25 border-emerald-400/40 ring-emerald-400/30 shadow-emerald-500/10'
                      }`}>
                        <div className={`text-[7px] font-bold uppercase tracking-widest mb-1 h-3 flex items-center justify-center ${
                          isComplete ? 'text-green-200/80' : isOver ? 'text-red-200/80' : 'text-emerald-200/80'
                        }`}>Allocated</div>
                        <div className={`text-sm font-black leading-none h-5 flex items-center justify-center ${
                          isComplete ? 'text-green-300' : isOver ? 'text-red-300' : 'text-emerald-300'
                        }`}>
                          {sku.totalAllocated.toLocaleString()}
                        </div>
                      </div>
                      <div className={`bg-gradient-to-br backdrop-blur-sm rounded-lg p-2 border text-center ring-1 shadow-lg min-w-0 flex flex-col justify-center ${
                        remaining === 0 ? 'from-green-500/25 to-emerald-500/25 border-green-400/40 ring-green-400/30 shadow-green-500/10' :
                        remaining > 0 ? 'from-orange-500/25 to-amber-500/25 border-orange-400/40 ring-orange-400/30 shadow-orange-500/10' :
                        'from-red-500/25 to-rose-500/25 border-red-400/40 ring-red-400/30 shadow-red-500/10'
                      }`}>
                        <div className={`text-[7px] font-bold uppercase tracking-widest mb-1 h-3 flex items-center justify-center ${
                          remaining === 0 ? 'text-green-200/80' : remaining > 0 ? 'text-orange-200/80' : 'text-red-200/80'
                        }`}>Remaining</div>
                        <div className={`text-sm font-black leading-none h-5 flex items-center justify-center ${
                          remaining === 0 ? 'text-green-300' : remaining > 0 ? 'text-orange-300' : 'text-red-300'
                        }`}>
                          {remaining === 0 ? '✓' : remaining.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-500/25 to-lime-500/25 backdrop-blur-sm rounded-lg p-2 border border-emerald-400/40 text-center ring-1 ring-emerald-400/30 shadow-lg shadow-emerald-500/10 min-w-0 flex flex-col justify-center">
                        <div className="text-[7px] text-emerald-200/80 font-bold uppercase tracking-widest mb-1 h-3 flex items-center justify-center">Avg FOB</div>
                        <div className="text-sm font-black text-white leading-none h-5 flex items-center justify-center">
                          {sku.weightedAvgPrice > 0 ? formatCurrency(sku.weightedAvgPrice) : '-'}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/25 to-cyan-500/25 backdrop-blur-sm rounded-lg p-2 border border-blue-400/40 text-center ring-1 ring-blue-400/30 shadow-lg shadow-blue-500/10 min-w-0 flex flex-col justify-center">
                        <div className="text-[7px] text-blue-200/80 font-bold uppercase tracking-widest mb-1 h-3 flex items-center justify-center">Avg Delivered</div>
                        <div className="text-sm font-black text-white leading-none h-5 flex items-center justify-center">
                          {sku.weightedAvgDeliveredCost > 0 ? formatCurrency(sku.weightedAvgDeliveredCost) : '-'}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/25 to-pink-500/25 backdrop-blur-sm rounded-lg p-2 border border-purple-400/40 text-center ring-1 ring-purple-400/30 shadow-lg shadow-purple-500/10 min-w-0 flex flex-col justify-center">
                        <div className="text-[7px] text-purple-200/80 font-bold uppercase tracking-widest mb-1 h-3 flex items-center justify-center">Total Margin</div>
                        <div className={`text-sm font-black leading-none h-5 flex items-center justify-center ${
                          sku.totalSKUMargin > 0 ? 'text-green-300' : sku.totalSKUMargin < 0 ? 'text-red-300' : 'text-white'
                        }`}>
                          {formatCurrency(sku.totalSKUMargin)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSKUExpanded(sku.item.id)}
                      className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable Details Section */}
                {isExpanded && (
                  <div className="border-t-2 border-white/10 bg-white/5">
                    {/* AI Insights Panel */}
                    {!exceptionsMode && (
                      <AIInsightsPanel sku={sku} selectedWeek={selectedWeek} />
                    )}

                    {/* Live Calculator - Rebate, Freight, Margin, dlvd_price */}
                    {!exceptionsMode && (
                      <div className="px-5 py-3 bg-white/5 border-b border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Sliders className="w-3.5 h-3.5 text-blue-300/70" />
                          <h4 className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Live Calculator</h4>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="text-[8px] text-white/50 font-semibold uppercase tracking-wider block mb-0.5">Rebate</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={sku.rebate || 0}
                              onChange={(e) => updatePricingCalculation(sku.item.id, 'rebate', parseFloat(e.target.value) || 0)}
                              disabled={false}
                              className="w-full px-1.5 py-1 bg-white/10 border border-white/20 rounded text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-white/50 font-semibold uppercase tracking-wider block mb-0.5">Freight</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={sku.freight || 0}
                              onChange={(e) => updatePricingCalculation(sku.item.id, 'freight', parseFloat(e.target.value) || 0)}
                              disabled={false}
                              className="w-full px-1.5 py-1 bg-white/10 border border-white/20 rounded text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-white/50 font-semibold uppercase tracking-wider block mb-0.5">Margin</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={(() => {
                                // Calculate margin from sellPrice: margin = sellPrice - rebate - freight - avgFOB
                                const rebate = sku.rebate || 0;
                                const freight = sku.freight || 0;
                                const avgFob = sku.weightedAvgPrice;
                                if (sku.sellPrice > 0) {
                                  return Math.max(0, sku.sellPrice - rebate - freight - avgFob);
                                }
                                return 1.50; // Default margin
                              })()}
                              onChange={(e) => {
                                const newMargin = parseFloat(e.target.value) || 1.50;
                                updatePricingCalculation(sku.item.id, 'margin', newMargin);
                              }}
                              onBlur={(e) => {
                                // Ensure minimum of 0 on blur
                                const value = parseFloat(e.target.value) || 1.50;
                                if (value < 0) {
                                  updatePricingCalculation(sku.item.id, 'margin', 1.50);
                                }
                              }}
                              disabled={false}
                              className="w-full px-1.5 py-1 bg-white/10 border border-white/20 rounded text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-400/50 disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-white/50 font-semibold uppercase tracking-wider block mb-0.5">dlvd Price</label>
                            <div className="w-full px-1.5 py-1 bg-white/5 border border-white/10 rounded text-xs font-semibold text-white/80">
                              {(() => {
                                // Formula: Delivered Price = Rebate + Freight + Margin + Avg FOB
                                const rebate = sku.rebate || 0;
                                const freight = sku.freight || 0;
                                const avgFob = sku.weightedAvgPrice;
                                // Calculate margin from sellPrice: margin = sellPrice - rebate - freight - avgFOB
                                const margin = sku.sellPrice > 0 ? Math.max(0, sku.sellPrice - rebate - freight - avgFob) : 1.50;
                                const dlvdPrice = rebate + freight + margin + avgFob;
                                return formatCurrency(dlvdPrice);
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Auto Allocate Button */}
                    {!exceptionsMode && (
                      <div className="px-5 py-2.5 border-b border-white/5 bg-white/3">
                        <button
                          onClick={() => handleAIAutoAllocate(sku)}
                          disabled={sku.volumeNeeded <= 0}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Auto Allocate
                        </button>
                      </div>
                    )}

                    {/* Compact Supplier Rows */}
                    <div className="px-5 py-6">
                      <div className="text-xs text-white/50 font-bold uppercase tracking-widest mb-4">Supplier Allocations</div>
                      {/* Column Headers */}
                      <div className="grid grid-cols-7 gap-3 mb-3 px-2">
                        <div className="text-xs text-white/60 font-semibold">Supplier</div>
                        <div className="text-xs text-white/60 font-semibold text-right">FOB</div>
                        <div className="text-xs text-white/60 font-semibold text-right">Delivered</div>
                        <div className="text-xs text-white/60 font-semibold text-right">Margin/Case</div>
                        <div className="text-xs text-white/60 font-semibold text-right">Allocated</div>
                        <div className="text-xs text-white/60 font-semibold text-right">Total Margin</div>
                        <div className="text-xs text-white/60 font-semibold text-right">Row Cost</div>
                      </div>
                      <div className="space-y-3">
                        {sku.entries.map((entry, index) => {
                          const rowCost = entry.price * entry.awarded_volume;
                          const isException = exceptionsMode && (
                            entry.supplier_response_status === 'revised' ||
                            entry.supplier_response_status === 'accepted' ||
                            (entry.supplier_response_status === 'pending' && entry.supplier_response_volume !== null)
                          );
                          const isCheapest = entry.price === cheapestPrice;
                          const cheapestDeliveredCost = Math.min(...sku.entries.map(e => e.deliveredCost));
                          const isCheapestDelivered = entry.deliveredCost === cheapestDeliveredCost;
                          const highestMargin = Math.max(...sku.entries.map(e => e.totalMargin));
                          const isHighestProfit = entry.totalMargin === highestMargin && entry.totalMargin > 0;

                          // In exceptions mode, only show exceptions
                          if (exceptionsMode && !isException) return null;

                          return (
                            <div
                              key={entry.quote_id}
                              className={`bg-white/5 hover:bg-white/8 rounded-lg p-4 border transition-all ${
                                isCheapest ? 'border-emerald-400/40 bg-emerald-500/8' :
                                isException ? 'border-orange-400/40 bg-orange-500/8' :
                                'border-white/10'
                              }`}
                            >
                              <div className="grid grid-cols-7 gap-3 items-center">
                                {/* Supplier */}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
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
                                    {isCheapest && (
                                      <span className="px-1.5 py-0.5 bg-emerald-500/30 text-emerald-200 rounded text-[8px] font-bold shrink-0">
                                        Low FOB
                                      </span>
                                    )}
                                    {isCheapestDelivered && (
                                      <span className="px-1.5 py-0.5 bg-blue-500/30 text-blue-200 rounded text-[8px] font-bold shrink-0">
                                        Low Delivered
                                      </span>
                                    )}
                                    {isHighestProfit && (
                                      <span className="px-1.5 py-0.5 bg-purple-500/30 text-purple-200 rounded text-[8px] font-bold shrink-0">
                                        Top Profit
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* FOB Price */}
                                <div className="text-right min-w-0">
                                  <div className="font-semibold text-white text-xs">{formatCurrency(entry.price)}</div>
                                </div>

                                {/* Delivered Price = FOB + Freight - Rebate + Margin (matches calculator) */}
                                <div className="text-right min-w-0">
                                  <div className={`font-semibold text-xs ${
                                    isCheapestDelivered ? 'text-blue-300' : 'text-white/80'
                                  }`}>
                                    {formatCurrency(entry.deliveredCost)}
                                  </div>
                                </div>

                                {/* Margin per Case */}
                                <div className="text-right min-w-0">
                                  <div className={`font-semibold text-xs ${
                                    entry.marginPerCase > 0 ? 'text-green-300' : entry.marginPerCase < 0 ? 'text-red-300' : 'text-white/60'
                                  }`}>
                                    {formatCurrency(entry.marginPerCase)}
                                  </div>
                                </div>

                                {/* Allocated */}
                                <div className="text-right min-w-0">
                                  {exceptionsMode || selectedWeek.allocation_submitted ? (
                                    <div className="font-semibold text-white text-xs">
                                      {entry.awarded_volume > 0 ? entry.awarded_volume.toLocaleString() : '-'}
                                    </div>
                                  ) : (
                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={entry.awarded_volume || ''}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        updateAllocation(
                                          sku.item.id,
                                          entry.supplier_id,
                                          entry.quote_id,
                                          value
                                        );
                                      }}
                                      placeholder="0"
                                      disabled={false}
                                      className="w-full max-w-[60px] px-2 py-1 border border-white/20 rounded text-right font-semibold text-xs text-white bg-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                  )}
                                </div>

                                {/* Total Margin */}
                                <div className="text-right min-w-0">
                                  <div className={`font-semibold text-xs ${
                                    isHighestProfit ? 'text-purple-300 font-bold' :
                                    entry.totalMargin > 0 ? 'text-green-300' : 
                                    entry.totalMargin < 0 ? 'text-red-300' : 'text-white/60'
                                  }`}>
                                    {formatCurrency(entry.totalMargin)}
                                  </div>
                                </div>

                                {/* Row Cost */}
                                <div className="text-right min-w-0">
                                  <div className="font-semibold text-emerald-300 text-xs">
                                    {rowCost > 0 ? formatCurrency(rowCost) : '-'}
                                  </div>
                                </div>
                              </div>

                              {/* Exception Response (if applicable) */}
                              {exceptionsMode && (entry.supplier_response_status === 'revised' || entry.supplier_response_status === 'accepted') && (
                                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    entry.supplier_response_status === 'accepted' 
                                      ? 'bg-green-500/30 text-green-200' 
                                      : 'bg-orange-500/30 text-orange-200'
                                  }`}>
                                    {entry.supplier_response_status === 'accepted' 
                                      ? `Accepted: ${entry.supplier_response_volume?.toLocaleString() || entry.awarded_volume.toLocaleString()}` 
                                      : `Revised: ${entry.supplier_response_volume?.toLocaleString()}`
                                    }
                                  </span>
                                  {entry.supplier_response_status === 'revised' && (
                                    <button
                                      onClick={async () => {
                                        await updateAllocation(
                                          sku.item.id,
                                          entry.supplier_id,
                                          entry.quote_id,
                                          entry.supplier_response_volume || 0
                                        );
                                        showToast('Revised volume accepted', 'success');
                                        await loadData();
                                      }}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-green-500/30 hover:bg-green-500/40 text-green-200 rounded text-xs font-semibold border border-green-400/50 transition-all"
                                    >
                                      <Check className="w-3 h-3" />
                                      Accept
                                    </button>
                                  )}
                                  {entry.supplier_response_status === 'accepted' && (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs font-semibold border border-green-400/30">
                                      ✓ Confirmed
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

```

### src/components/PricingCalculations.tsx
```typescript
import React, { useState, useEffect, memo } from 'react';
import { Calculator, CheckCircle2, Save } from 'lucide-react';
import { fetchItemPricingCalculations, updateItemPricingCalculation, fetchQuotesWithDetails } from '../utils/database';
import { formatCurrency } from '../utils/helpers';
import { useToast } from '../contexts/ToastContext';
import type { Item } from '../types';

interface PricingCalculationsProps {
  weekId: string;
  items: Item[];
  onPricingUpdate?: () => void;
}

interface ItemPricing {
  item_id: string;
  avg_price: number;
  rebate: number;
  margin: number;
  freight: number;
  dlvd_price: number;
  hasChanges?: boolean;
}

function PricingCalculationsComponent({ weekId, items, onPricingUpdate }: PricingCalculationsProps) {
  const { showToast } = useToast();
  const [pricingData, setPricingData] = useState<Record<string, ItemPricing>>({});
  const [loading, setLoading] = useState(true);
  const [volumeData, setVolumeData] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadPricingData();
  }, [weekId, items]);

  async function loadPricingData() {
    try {
      const [calculations, quotes] = await Promise.all([
        fetchItemPricingCalculations(weekId),
        fetchQuotesWithDetails(weekId)
      ]);

      // Calculate volume from awarded_volume in quotes
      // Also include volume from volume_needed if no awarded_volume exists yet
      const volumeMap = new Map<string, number>();
      for (const item of items) {
        // First try to get volume from awarded_volume
        const itemQuotes = quotes.filter(q => q.item_id === item.id);
        const awardedVolume = itemQuotes
          .filter(q => q.awarded_volume && q.awarded_volume > 0)
          .reduce((sum, q) => sum + (q.awarded_volume || 0), 0);
        
        // If no awarded volume, try to get from volume_needed (from week_item_volumes table)
        let totalVolume = awardedVolume;
        if (totalVolume === 0) {
          // Try to get from week_item_volumes
          const { supabase } = await import('../utils/supabase');
          const { data: volumeData } = await supabase
            .from('week_item_volumes')
            .select('volume_needed')
            .eq('week_id', weekId)
            .eq('item_id', item.id)
            .single();
          
          if (volumeData?.volume_needed) {
            totalVolume = volumeData.volume_needed;
          }
        }
        
        volumeMap.set(item.id, totalVolume);
      }
      setVolumeData(volumeMap);

      const newPricingData: Record<string, ItemPricing> = {};

      for (const item of items) {
        const existing = calculations.find(c => c.item_id === item.id);

        const itemQuotes = quotes.filter(q => q.item_id === item.id && q.rf_final_fob !== null);
        let avgPrice = 0;

        if (itemQuotes.length > 0) {
          const quotesWithVolume = itemQuotes.filter(q => q.awarded_volume && q.awarded_volume > 0);
          if (quotesWithVolume.length > 0) {
            const totalVolume = quotesWithVolume.reduce((sum, q) => sum + (q.awarded_volume || 0), 0);
            const weightedSum = quotesWithVolume.reduce((sum, q) => {
              const price = q.rf_final_fob || 0;
              return sum + (price * (q.awarded_volume || 0));
            }, 0);
            avgPrice = totalVolume > 0 ? weightedSum / totalVolume : 0;
          } else {
            const totalPrices = itemQuotes.reduce((sum, q) => sum + (q.rf_final_fob || 0), 0);
            avgPrice = totalPrices / itemQuotes.length;
          }
        }

        const rebate = existing?.rebate !== undefined ? existing.rebate : 0.80;
        const freight = existing?.freight !== undefined ? existing.freight : 1.75;

        // Formula: Our Avg Cost = FOB + Rebate + Freight
        const ourAvgCost = avgPrice + rebate + freight;

        // Default profit margin: $1.50 per case
        const defaultProfit = 1.50;
        let margin = existing?.margin !== undefined && existing.margin > 0
          ? existing.margin
          : defaultProfit;
        
        // Delivered Price is always calculated: Our Avg Cost + Profit Per Case
        // If we have an existing dlvd_price but it doesn't match the formula, recalculate margin
        if (existing?.dlvd_price !== undefined && existing.dlvd_price > 0) {
          const calculatedMargin = existing.dlvd_price - ourAvgCost;
          // If the existing margin doesn't match what the dlvd_price suggests, use the calculated margin
          if (Math.abs(calculatedMargin - (existing.margin || 0)) > 0.01) {
            margin = calculatedMargin;
          }
        }
        
        // Always calculate Delivered Price from the formula
        const dlvd_price = ourAvgCost + margin;

        newPricingData[item.id] = {
          item_id: item.id,
          avg_price: avgPrice,
          rebate: rebate,
          margin: margin,
          freight: freight,
          dlvd_price: dlvd_price,
        };
      }

      setPricingData(newPricingData);
    } catch (err) {
      console.error('Error loading pricing data:', err);
    } finally {
      setLoading(false);
    }
  }

  function updatePricing(itemId: string, field: keyof ItemPricing, value: string) {
    const numValue = parseFloat(value) || 0;

    setPricingData(prev => {
      const updated = { ...prev };
      if (updated[itemId]) {
        // Update the field first
        updated[itemId] = { ...updated[itemId], [field]: numValue, hasChanges: true };

        // Get all current values (including the just-updated field)
        const { avg_price, rebate, freight, margin } = updated[itemId];
        
        // Always recalculate ourAvgCost with current values
        // Formula: Our Avg Cost = FOB + Rebate + Freight
        const ourAvgCost = avg_price + rebate + freight;

        // Delivered Price is ALWAYS calculated: Our Avg Cost + Profit Per Case
        // This ensures it's always in sync regardless of which field changed
        const newDlvdPrice = ourAvgCost + (margin || 0);
        updated[itemId].dlvd_price = parseFloat(newDlvdPrice.toFixed(2));
        
        // Force re-render by updating the state (Est. Profit will recalculate automatically)
      }
      return updated;
    });
  }

  async function savePricing(itemId: string) {
    const pricing = pricingData[itemId];
    if (!pricing) {
      showToast('No pricing data found', 'error');
      return;
    }

    if (!weekId || !itemId) {
      showToast('Missing week or item information', 'error');
      return;
    }

    try {
      // Ensure dlvd_price is calculated before saving
      const ourAvgCost = (pricing.avg_price || 0) + (pricing.rebate || 0) + (pricing.freight || 0);
      const calculatedDlvdPrice = ourAvgCost + (pricing.margin || 0);

      const result = await updateItemPricingCalculation(weekId, itemId, {
        avg_price: parseFloat((pricing.avg_price || 0).toFixed(2)),
        rebate: parseFloat((pricing.rebate || 0).toFixed(2)),
        margin: parseFloat((pricing.margin || 0).toFixed(2)),
        freight: parseFloat((pricing.freight || 0).toFixed(2)),
        dlvd_price: parseFloat(calculatedDlvdPrice.toFixed(2)),
      });

      if (!result.success) {
        const errorMsg = result.error || 'Unknown error';
        console.error('Pricing update error:', errorMsg);
        showToast(`Failed to update pricing: ${errorMsg}`, 'error');
        return;
      }

      // Update local state to reflect saved values
      setPricingData(prev => ({
        ...prev,
        [itemId]: { 
          ...prev[itemId], 
          dlvd_price: parseFloat(calculatedDlvdPrice.toFixed(2)),
          hasChanges: false 
        }
      }));

      showToast('Pricing updated successfully', 'success');

      if (onPricingUpdate) {
        onPricingUpdate();
      }
    } catch (err) {
      console.error('Error saving pricing:', err);
      showToast('Failed to update pricing', 'error');
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Calculator className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Internal Pricing Calculations</h3>
              <p className="text-sm text-white/70">Uses volume from allocation table above • Delivered Price auto-calculated</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white/0">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-white/8 to-white/5 border-b-2 border-white/15">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">SKU</th>
              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Avg FOB</th>
              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Rebate</th>
              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Freight</th>
              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Our Avg Cost</th>
              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Profit/Case</th>
              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Delivered Price</th>
              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Est. Profit</th>
              <th className="px-6 py-4 text-center text-xs font-black text-white uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => {
              const pricing = pricingData[item.id];
              if (!pricing) return null;

              // Formula: Our Avg Cost = FOB + Rebate + Freight
              const ourAvgCost = pricing.avg_price + pricing.rebate + pricing.freight;
              // Profit Per Case is the editable margin field
              const profitPerCase = pricing.margin || 0;
              // Delivered Price is always calculated: Our Avg Cost + Profit Per Case
              // Use calculated value to ensure it's always in sync
              const calculatedDlvdPrice = ourAvgCost + profitPerCase;
              const displayDlvdPrice = pricing.dlvd_price && Math.abs(pricing.dlvd_price - calculatedDlvdPrice) < 0.01 
                ? pricing.dlvd_price 
                : calculatedDlvdPrice;
              const volume = volumeData.get(item.id) || 0;
              // Est. Profit = Profit Per Case × Amount of Cases
              // Use the current margin value from state (which updates as user types)
              const currentMargin = pricing.margin || 0;
              const estimatedProfit = currentMargin * volume;

              return (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="text-sm text-white/70">{item.pack_size} - {item.organic_flag}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-white font-black text-lg">{formatCurrency(pricing.avg_price)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={pricing.rebate || ''}
                      onChange={(e) => updatePricing(item.id, 'rebate', e.target.value)}
                      placeholder="0.00"
                      className="w-24 px-3 py-2 border border-white/20 rounded-lg text-right font-medium text-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 placeholder:text-white/40"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={pricing.freight || ''}
                      onChange={(e) => updatePricing(item.id, 'freight', e.target.value)}
                      placeholder="0.00"
                      className="w-24 px-3 py-2 border border-white/20 rounded-lg text-right font-medium text-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 placeholder:text-white/40"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-lime-300 font-black text-lg">{formatCurrency(ourAvgCost)}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {formatCurrency(pricing.avg_price)} + {formatCurrency(pricing.rebate)} + {formatCurrency(pricing.freight)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={pricing.margin || ''}
                      onChange={(e) => updatePricing(item.id, 'margin', e.target.value)}
                      placeholder="0.00"
                      className={`w-28 px-3 py-2 border-2 rounded-lg text-right font-black text-xl bg-white/5 focus:outline-none focus:ring-2 focus:border-transparent text-white ${
                        profitPerCase > 0 ? 'border-green-400/30 focus:ring-green-400/50' :
                        profitPerCase < 0 ? 'border-red-400/30 focus:ring-red-400/50' :
                        'border-white/20 focus:ring-white/30'
                      }`}
                    />
                    <div className="text-xs text-white/50 mt-1">Editable</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-blue-300 font-black text-lg">{formatCurrency(displayDlvdPrice)}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {formatCurrency(ourAvgCost)} + {formatCurrency(profitPerCase)}
                    </div>
                    <div className="text-xs text-blue-300/70 font-medium mt-1">🔒 Auto-calculated</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`font-black text-lg ${
                      estimatedProfit > 0 ? 'text-green-300' :
                      estimatedProfit < 0 ? 'text-red-300' :
                      'text-white/50'
                    }`}>
                      {formatCurrency(estimatedProfit)}
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {volume > 0 ? (
                        <>
                          {volume} cases × {formatCurrency(currentMargin)}
                        </>
                      ) : (
                        <span className="text-orange-300">No volume allocated</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {pricing.hasChanges ? (
                      <button
                        onClick={() => savePricing(item.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-all mx-auto"
                        title="Click to save pricing changes for this item"
                      >
                        <Save className="w-4 h-4" />
                        Update
                      </button>
                    ) : (
                      <div className="text-sm text-green-300 font-medium flex items-center gap-1 justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Saved</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-white/3 border-t border-white/10 text-sm text-white/80 space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-white mb-2">How It Works:</p>
            <p className="text-xs"><span className="font-medium">Our Avg Cost =</span> Avg FOB + Rebate + Freight <span className="text-white/50">(calculated)</span></p>
            <p className="text-xs"><span className="font-medium">Profit Per Case =</span> <span className="text-green-300 font-semibold">Editable</span> - set your desired profit margin</p>
            <p className="text-xs"><span className="font-medium">Delivered Price =</span> Our Avg Cost + Profit Per Case <span className="text-blue-300 font-semibold">(🔒 locked, auto-calculated)</span></p>
            <p className="text-xs mt-2 text-blue-300 font-medium">Uses volume from allocation table above</p>
          </div>
          <div>
            <p className="font-bold text-white mb-2">Editable Fields:</p>
            <p className="text-xs"><span className="font-bold">Rebate & Freight:</span> Change these to recalculate Our Avg Cost</p>
            <p className="text-xs mt-1"><span className="font-bold">Profit/Case:</span> <span className="text-green-300 font-semibold">Editable</span> - set your target margin</p>
            <p className="text-xs mt-1"><span className="font-bold">Delivered Price:</span> <span className="text-blue-300 font-semibold">🔒 Locked</span> - automatically calculated</p>
            <p className="text-xs mt-2 font-bold text-emerald-300">Click Update to save and sync with allocation table</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const PricingCalculations = memo(PricingCalculationsComponent);
```

### src/components/VolumeAcceptance.tsx
```typescript
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Edit3, AlertCircle, TrendingUp, DollarSign, Package, BarChart3, Lock, Unlock } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { formatCurrency } from '../utils/helpers';
import { useToast } from '../contexts/ToastContext';
import { closeVolumeLoop, updateEmergencyUnlock } from '../utils/database';
import { useApp } from '../contexts/AppContext';
import { logger } from '../utils/logger';
import { useRealtime } from '../hooks/useRealtime';

interface VolumeAcceptanceProps {
  weekId: string;
}

interface VolumeAllocation {
  quoteId: string;
  itemId: string;
  itemName: string;
  supplierId: string;
  supplierName: string;
  supplierFob: number;
  rfFinalFob: number;
  offeredVolume: number;
  supplierResponse: string | null;
  supplierVolumeAccepted: number;
  supplierResponseNotes: string | null;
  awardedVolume: number;
  avgPrice: number;
  dlvdPrice: number;
  rebate: number;
  freight: number;
  margin: number;
}

export function VolumeAcceptance({ weekId }: VolumeAcceptanceProps) {
  const { showToast } = useToast();
  const { session } = useApp();
  const [allocations, setAllocations] = useState<VolumeAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [revisedVolumes, setRevisedVolumes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [closingLoop, setClosingLoop] = useState(false);
  const [volumeFinalized, setVolumeFinalized] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  // Set up realtime subscription for quotes table to auto-refresh when awards are finalized
  // Only update if volume is not yet finalized
  const handleQuotesUpdate = useCallback(() => {
    if (weekId && !volumeFinalized) {
      logger.debug('Quotes updated, refreshing allocations...');
      loadAllocations();
    }
  }, [weekId, volumeFinalized]);

  // Set up realtime subscription for weeks table to check volume_finalized status
  const handleWeeksUpdate = useCallback(() => {
    if (weekId) {
      logger.debug('Week updated, checking volume finalized status...');
      checkVolumeFinalized();
      // Always reload allocations when week status changes (even if finalized, to show final state)
      loadAllocations();
    }
  }, [weekId]);

  useRealtime('quotes', handleQuotesUpdate, { column: 'week_id', value: weekId });
  useRealtime('weeks', handleWeeksUpdate, { column: 'id', value: weekId });

  useEffect(() => {
    loadAllocations();
    checkVolumeFinalized();
  }, [weekId]);

  async function checkVolumeFinalized() {
    const { data, error } = await supabase
      .from('weeks')
      .select('volume_finalized')
      .eq('id', weekId)
      .maybeSingle();

    if (data && !error) {
      setVolumeFinalized(data.volume_finalized || false);
    }
  }

  async function loadAllocations() {
    try {
      setLoading(true);
      // Volume Field Lifecycle:
      // 1. awarded_volume: RF's initial award (draft) - set in Award Volume tab
      // 2. offered_volume: Copied from awarded_volume when RF submits to suppliers
      // 3. supplier_volume_accepted: Supplier's response (accept or revise)
      // 4. awarded_volume (updated): Final volume after RF accepts supplier response
      // Show quotes that either have offered_volume OR awarded_volume (ready to be sent or already finalized)
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          item_id,
          supplier_id,
          supplier_fob,
          rf_final_fob,
          offered_volume,
          supplier_volume_response,
          supplier_volume_accepted,
          supplier_volume_response_notes,
          awarded_volume,
          item:items!inner(name),
          supplier:suppliers!inner(name)
        `)
        .eq('week_id', weekId)
        .or('offered_volume.gt.0,awarded_volume.gt.0')
        .order('item_id');

      if (error) throw error;

      const { data: pricingData, error: pricingError } = await supabase
        .from('item_pricing_calculations')
        .select('item_id, avg_price, dlvd_price, rebate, freight, margin')
        .eq('week_id', weekId);

      if (pricingError) {
        logger.error('Error loading pricing calculations:', pricingError);
        // Don't throw, continue with defaults
      }

      const pricingMap = new Map(
        (pricingData || []).map((p: { item_id: string; avg_price?: number; dlvd_price?: number; rebate?: number; freight?: number; margin?: number }) => [p.item_id, p])
      );

      const mapped: VolumeAllocation[] = data.map((q) => {
        const pricing = pricingMap.get(q.item_id) as { avg_price?: number; dlvd_price?: number; rebate?: number; freight?: number; margin?: number } | undefined;
        
        // Use defaults if pricing not found (matches PricingCalculations defaults)
        const rebate = pricing?.rebate !== undefined ? pricing.rebate : 0.80;
        const freight = pricing?.freight !== undefined ? pricing.freight : 1.75;
        const dlvdPrice = pricing?.dlvd_price || 0;
        const margin = pricing?.margin || 0;
        
        return {
          quoteId: q.id,
          itemId: q.item_id,
          itemName: Array.isArray(q.item) ? q.item[0]?.name || '' : (q.item as { name: string }).name,
          supplierId: q.supplier_id,
          supplierName: Array.isArray(q.supplier) ? q.supplier[0]?.name || '' : (q.supplier as { name: string }).name,
          supplierFob: q.supplier_fob || 0,
          rfFinalFob: q.rf_final_fob || 0,
          offeredVolume: q.offered_volume || 0,
          supplierResponse: q.supplier_volume_response,
          supplierVolumeAccepted: q.supplier_volume_accepted || 0,
          supplierResponseNotes: q.supplier_volume_response_notes,
          awardedVolume: q.awarded_volume || 0,
          avgPrice: pricing?.avg_price || 0,
          dlvdPrice: dlvdPrice,
          rebate: rebate,
          freight: freight,
          margin: margin,
        };
      });

      setAllocations(mapped);
    } catch (err) {
      logger.error('Error loading allocations:', err);
      showToast('Failed to load volume allocations', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptSupplierResponse(allocation: VolumeAllocation) {
    setProcessing({ ...processing, [allocation.quoteId]: true });
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          awarded_volume: allocation.supplierVolumeAccepted,
        })
        .eq('id', allocation.quoteId);

      if (error) throw error;

      showToast(`Accepted ${allocation.supplierVolumeAccepted} units from ${allocation.supplierName}`, 'success');
      await loadAllocations();
    } catch (err) {
      logger.error('Error accepting volume:', err);
      showToast('Failed to accept volume', 'error');
    } finally {
      setProcessing({ ...processing, [allocation.quoteId]: false });
    }
  }

  async function handleReviseOffer(allocation: VolumeAllocation) {
    const newVolume = parseFloat(revisedVolumes[allocation.quoteId] || '0');

    if (newVolume <= 0) {
      showToast('Please enter a valid volume', 'error');
      return;
    }

    setProcessing({ ...processing, [allocation.quoteId]: true });
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          offered_volume: newVolume,
          supplier_volume_response: null,
          supplier_volume_accepted: 0,
          supplier_volume_response_notes: null,
        })
        .eq('id', allocation.quoteId);

      if (error) throw error;

      showToast(`Revised offer to ${newVolume} units for ${allocation.supplierName}`, 'success');
      setRevisedVolumes({ ...revisedVolumes, [allocation.quoteId]: '' });
      await loadAllocations();
    } catch (err) {
      logger.error('Error revising offer:', err);
      showToast('Failed to revise offer', 'error');
    } finally {
      setProcessing({ ...processing, [allocation.quoteId]: false });
    }
  }

  async function handleDeclineOffer(allocation: VolumeAllocation) {
    setProcessing({ ...processing, [allocation.quoteId]: true });
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          offered_volume: 0,
          supplier_volume_response: null,
          supplier_volume_accepted: 0,
          supplier_volume_response_notes: null,
        })
        .eq('id', allocation.quoteId);

      if (error) throw error;

      showToast(`Withdrawn volume offer from ${allocation.supplierName}`, 'success');
      await loadAllocations();
    } catch (err) {
      logger.error('Error declining offer:', err);
      showToast('Failed to withdraw offer', 'error');
    } finally {
      setProcessing({ ...processing, [allocation.quoteId]: false });
    }
  }

  async function handleCloseLoop() {
    if (!session || session.role !== 'rf') {
      showToast('Only RF users can close the volume loop', 'error');
      return;
    }

    // Validation: Check that all supplier responses have been handled
    const hasPending = pendingAllocations.length > 0;
    const hasUnhandledResponses = respondedAllocations.length > 0;

    if (hasPending) {
      showToast(`Heads up: ${pendingAllocations.length} allocation(s) still pending`, 'error');
      return;
    }

    if (hasUnhandledResponses) {
      showToast(`Just a note: ${respondedAllocations.length} response(s) need review`, 'error');
      return;
    }

    if (finalizedAllocations.length === 0) {
      showToast('Heads up: No finalized allocations found', 'error');
      return;
    }

    setClosingLoop(true);
    try {
      const result = await closeVolumeLoop(weekId, session.user_name);

      if (result.success) {
        showToast('Volume allocation loop closed successfully. Week is now locked.', 'success');
        setVolumeFinalized(true);
        await loadAllocations();
        await checkVolumeFinalized();
      } else {
        if (result.pendingCount && result.pendingCount > 0) {
          showToast(`Cannot close: ${result.pendingCount} supplier response(s) still pending`, 'error');
        } else {
          showToast(result.message || 'Failed to close loop', 'error');
        }
      }
    } catch (err) {
      logger.error('Error closing loop:', err);
      showToast('Failed to close volume loop', 'error');
    } finally {
      setClosingLoop(false);
    }
  }

  async function handleEmergencyUnlock() {
    if (!session || session.role !== 'rf') {
      showToast('Only RF users can unlock weeks', 'error');
      return;
    }

    if (!unlockReason.trim()) {
      showToast('Please provide a reason for the emergency unlock', 'error');
      return;
    }

    setUnlocking(true);
    try {
      const success = await updateEmergencyUnlock(
        weekId,
        true,
        unlockReason,
        session.user_name
      );

      if (success) {
        showToast('Week unlocked for emergency changes. You can now modify volumes and pricing.', 'success');
        setShowUnlockModal(false);
        setUnlockReason('');
        await loadAllocations();
      } else {
        showToast('Failed to unlock week', 'error');
      }
    } catch (err) {
      logger.error('Error unlocking week:', err);
      showToast('Failed to unlock week', 'error');
    } finally {
      setUnlocking(false);
    }
  }

  // Allocation Status Categories:
  // - Pending: RF sent offer (offered_volume > 0) but supplier hasn't responded yet
  // - Responded: Supplier responded (accept/revise/decline) but RF hasn't finalized
  // - Finalized: RF accepted supplier response (awarded_volume > 0, matches supplier_volume_accepted)
  // - Ready to Send: RF awarded volume (awarded_volume > 0) but hasn't sent to supplier yet (offered_volume = 0)
  
  // Pending: has offered_volume but no supplier response yet
  const pendingAllocations = allocations.filter((a: VolumeAllocation) => a.offeredVolume > 0 && !a.supplierResponse && a.awardedVolume === 0);
  // Exclude declined responses from responded allocations - they should not be in financial calculations
  const respondedAllocations = allocations.filter((a: VolumeAllocation) => a.offeredVolume > 0 && a.supplierResponse && a.supplierResponse !== 'decline' && a.awardedVolume === 0);
  // Separate declined allocations for display only (not included in financials)
  const declinedAllocations = allocations.filter((a: VolumeAllocation) => a.offeredVolume > 0 && a.supplierResponse === 'decline' && a.awardedVolume === 0);
  // Finalized: has awarded_volume (RF accepted supplier response)
  const finalizedAllocations = allocations.filter((a: VolumeAllocation) => a.awardedVolume > 0);
  // Ready to send: has awarded_volume but not yet offered (not sent to suppliers)
  const readyToSendAllocations = allocations.filter((a: VolumeAllocation) => a.awardedVolume > 0 && a.offeredVolume === 0);

  // Group allocations by item for clean display
  const groupByItem = (allocs: VolumeAllocation[]) => {
    const grouped = new Map<string, VolumeAllocation[]>();
    allocs.forEach(alloc => {
      const existing = grouped.get(alloc.itemId) || [];
      existing.push(alloc);
      grouped.set(alloc.itemId, existing);
    });
    return grouped;
  };

  // Calculate weighted average FOB cost for an item
  const calculateWeightedAvgFOB = (itemAllocs: VolumeAllocation[], useAwarded: boolean = false) => {
    const validAllocs = itemAllocs.filter(a => a.supplierResponse !== 'decline');
    const totalVolume = validAllocs.reduce((sum, a) => sum + (useAwarded ? a.awardedVolume : a.supplierVolumeAccepted), 0);
    if (totalVolume === 0) return 0;
    const weightedSum = validAllocs.reduce((sum, a) => {
      const volume = useAwarded ? a.awardedVolume : a.supplierVolumeAccepted;
      return sum + (a.rfFinalFob * volume);
    }, 0);
    return weightedSum / totalVolume;
  };

  const allResponsesHandled = pendingAllocations.length === 0 && respondedAllocations.length === 0 && finalizedAllocations.length > 0;

  // Calculate cost per unit using the same formula as Allocate Volume tab
  // Formula: Our Cost = FOB + Rebate + Freight
  // For individual suppliers, use their FOB price with item-level rebate/freight
  const calculateOurCostPerUnit = (allocation: VolumeAllocation): number => {
    // Use the item's rebate and freight from pricing calculations (same for all suppliers of that item)
    // Formula: ourCost = rfFinalFob + rebate + freight
    // This matches PricingCalculations where avgPrice is weighted average, but here we use individual supplier FOB
    const rebate = allocation.rebate || 0;
    const freight = allocation.freight || 0;
    return allocation.rfFinalFob + rebate + freight;
  };

  // Calculate weighted average cost for an item (matching PricingCalculations logic)
  const calculateItemWeightedAvgCost = (itemAllocs: VolumeAllocation[], useAwarded: boolean = false): number => {
    const validAllocs = itemAllocs.filter(a => a.supplierResponse !== 'decline');
    if (validAllocs.length === 0) return 0;
    
    // Get rebate and freight from first allocation (same for all suppliers of item)
    const rebate = validAllocs[0].rebate || 0;
    const freight = validAllocs[0].freight || 0;
    
    // Calculate weighted average FOB
    const totalVolume = validAllocs.reduce((sum, a) => sum + (useAwarded ? a.awardedVolume : a.supplierVolumeAccepted), 0);
    if (totalVolume === 0) return 0;
    
    const weightedFOB = validAllocs.reduce((sum, a) => {
      const volume = useAwarded ? a.awardedVolume : a.supplierVolumeAccepted;
      return sum + (a.rfFinalFob * volume);
    }, 0) / totalVolume;
    
    // Apply same formula: Our Avg Cost = FOB + Rebate + Freight
    return weightedFOB + rebate + freight;
  };

  // Single source of truth: useAwarded=true uses awarded_volume (finalized), false uses supplier_volume_accepted (provisional)
  // Both exclude declined responses - they have zero financial impact
  // All calculations use values from internal pricing calculations (item_pricing_calculations table)
  const calculateFinancials = (allocs: VolumeAllocation[], useAwarded: boolean = false) => {
    // Filter out declined responses - they should never be in financial calculations
    const validAllocs = allocs.filter((a: VolumeAllocation) => a.supplierResponse !== 'decline');
    
    const totalVolume = validAllocs.reduce((sum, a) => sum + (useAwarded ? a.awardedVolume : a.supplierVolumeAccepted), 0);
    
    // Cost: Our Cost Per Unit × Volume (using FOB + Rebate + Freight from pricing calculations)
    const totalCost = validAllocs.reduce((sum, a) => {
      const volume = useAwarded ? a.awardedVolume : a.supplierVolumeAccepted;
      const ourCostPerUnit = calculateOurCostPerUnit(a);
      return sum + (ourCostPerUnit * volume);
    }, 0);
    
    // Revenue: Delivered Price × Volume (from pricing calculations)
    const totalRevenue = validAllocs.reduce((sum, a) => sum + (a.dlvdPrice * (useAwarded ? a.awardedVolume : a.supplierVolumeAccepted)), 0);
    
    // Est Profit: Revenue - Cost (calculated per supplier since each has different FOB/cost)
    const totalProfit = validAllocs.reduce((sum, a) => {
      const volume = useAwarded ? a.awardedVolume : a.supplierVolumeAccepted;
      const ourCostPerUnit = calculateOurCostPerUnit(a);
      const revenue = a.dlvdPrice * volume;
      const cost = ourCostPerUnit * volume;
      return sum + (revenue - cost);
    }, 0);
    
    // Margin: (Est Profit / Revenue) × 100
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    return { totalCost, totalRevenue, totalProfit, profitMargin, totalVolume };
  };

  // Financial calculations only include non-declined responses
  const respondedFinancials = calculateFinancials(respondedAllocations, false);
  const finalizedFinancials = calculateFinancials(finalizedAllocations, true);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
        <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Volume Allocations</h3>
        <p className="text-gray-600 mb-6 text-lg">Volume allocations will appear here once they are sent to suppliers.</p>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 max-w-2xl mx-auto text-left shadow-sm">
          <p className="text-base text-blue-900 font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Next Steps:
          </p>
          <ol className="text-sm text-blue-800 list-decimal list-inside space-y-2 font-medium">
            <li>Navigate to <strong className="text-blue-900">"Award Volume"</strong> to allocate cases to suppliers</li>
            <li>Review and adjust volume allocations as needed</li>
            <li>Click <strong className="text-blue-900">"Send Allocation to Suppliers"</strong> to submit offers</li>
            <li>Supplier responses will appear here for review and finalization</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border px-6 py-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Volume Acceptance</h2>
        </div>
        <div className="flex items-center gap-3">
          {allResponsesHandled && !volumeFinalized && (
            <button
              onClick={handleCloseLoop}
              disabled={closingLoop}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 border-2 border-emerald-400"
            >
              {closingLoop ? (
                <>
                  <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                  Closing Loop...
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6" />
                  Close the Loop
                </>
              )}
            </button>
          )}
          {volumeFinalized && (
            <>
              <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-lg border-2 border-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-bold">Volume Loop Closed - Week Locked</span>
              </div>
              {session?.role === 'rf' && (
                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
                >
                  <Unlock className="w-5 h-5" />
                  Emergency Unlock
                </button>
              )}
            </>
          )}
          <img
            src="/image.png"
            alt="Robinson Fresh"
            className="h-12 w-auto opacity-60"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      </div>

      {(respondedAllocations.length > 0 || declinedAllocations.length > 0) && (
        <>
          {respondedAllocations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Package className="w-4 h-4 text-blue-300" />
                  </div>
                  <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Total Volume</p>
                </div>
                <p className="text-3xl font-black text-white mb-1">{respondedFinancials.totalVolume.toLocaleString()}</p>
                <p className="text-blue-300/70 text-xs">units</p>
              </div>

            <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <DollarSign className="w-4 h-4 text-red-300" />
                </div>
                <p className="text-red-200 text-xs font-semibold uppercase tracking-wider">Total Cost</p>
              </div>
              <p className="text-3xl font-black text-white mb-1">{formatCurrency(respondedFinancials.totalCost)}</p>
              <p className="text-red-300/70 text-xs">supplier costs</p>
            </div>

            <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                </div>
                <p className="text-green-200 text-xs font-semibold uppercase tracking-wider">Revenue</p>
              </div>
              <p className="text-3xl font-black text-white mb-1">{formatCurrency(respondedFinancials.totalRevenue)}</p>
              <p className="text-green-300/70 text-xs">customer sales</p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-emerald-300" />
                </div>
                <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">Gross Profit</p>
              </div>
              <p className="text-3xl font-black text-white mb-1">{formatCurrency(respondedFinancials.totalProfit)}</p>
              <p className="text-emerald-300/70 text-xs">net gain</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-amber-300" />
                </div>
                <p className="text-amber-200 text-xs font-semibold uppercase tracking-wider">Margin</p>
              </div>
              <p className="text-3xl font-black text-white mb-1">{respondedFinancials.profitMargin.toFixed(1)}%</p>
              <p className="text-amber-300/70 text-xs">profit margin</p>
            </div>
          </div>
          )}

          {respondedAllocations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  Supplier Responses - Action Required ({respondedAllocations.length})
                </h2>
              </div>
              <div className="p-6 space-y-6">
              {Array.from(groupByItem(respondedAllocations).entries()).map(([itemId, itemAllocs]) => {
                  const firstAlloc = itemAllocs[0];
                  const weightedAvgFOB = calculateWeightedAvgFOB(itemAllocs, false);
                  const weightedAvgCost = calculateItemWeightedAvgCost(itemAllocs, false);
                  const totalVolume = itemAllocs.reduce((sum, a) => sum + a.supplierVolumeAccepted, 0);
                  
                  // Calculate totals using individual supplier costs (sum of line items)
                  const totalCost = itemAllocs.reduce((sum, a) => {
                    const ourCostPerUnit = calculateOurCostPerUnit(a);
                    return sum + (ourCostPerUnit * a.supplierVolumeAccepted);
                  }, 0);
                  
                  // Revenue uses item's delivered price (same for all suppliers)
                  const totalRevenue = itemAllocs.reduce((sum, a) => sum + (a.dlvdPrice * a.supplierVolumeAccepted), 0);
                  // Est Profit: Profit Per Case × Volume (from internal pricing calculations)
                  const totalProfit = itemAllocs.reduce((sum, a) => {
                    const profitPerCase = a.margin || 0; // Profit per case from internal pricing calculations
                    return sum + (profitPerCase * a.supplierVolumeAccepted);
                  }, 0);
                  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

                  return (
                    <div key={itemId} className="border-2 border-orange-200 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-white">
                      <div className="bg-gradient-to-r from-orange-100 to-orange-50 px-6 py-4 border-b border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-2xl text-gray-900">{firstAlloc.itemName}</h3>
                            <p className="text-sm text-gray-600 mt-1">{itemAllocs.length} supplier{itemAllocs.length > 1 ? 's' : ''} responded</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Weighted Avg FOB</p>
                            <p className="text-xl font-bold text-orange-700">{formatCurrency(weightedAvgFOB)}</p>
                            <p className="text-xs text-gray-500 mb-2 mt-1">Our Avg Cost: {formatCurrency(weightedAvgCost)}</p>
                            <p className="text-xs text-gray-500">Total Volume: {totalVolume.toLocaleString()} cases</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Supplier</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Response</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">FOB + R + F</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase bg-lime-50">Our Cost/Case</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase bg-blue-50">Dlvd Price</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase bg-green-50">Profit/Case</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Volume</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Offered</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Total Cost</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Revenue</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Profit</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {itemAllocs.map((allocation: VolumeAllocation) => {
                                // Use same calculation as Allocate Volume tab
                                const ourCostPerUnit = calculateOurCostPerUnit(allocation);
                                const cost = ourCostPerUnit * allocation.supplierVolumeAccepted;
                                const revenue = allocation.dlvdPrice * allocation.supplierVolumeAccepted;
                                // Est Profit: Profit Per Case × Volume (from internal pricing calculations)
                                const profitPerCase = allocation.margin || 0;
                                const profit = profitPerCase * allocation.supplierVolumeAccepted;
                                const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

                                return (
                                  <tr key={allocation.quoteId} className="hover:bg-orange-50">
                                    <td className="px-4 py-4">
                                      <div className="font-semibold text-gray-900">{allocation.supplierName}</div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      {allocation.supplierResponse === 'accept' && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold border border-green-300">Accepted</span>
                                      )}
                                      {allocation.supplierResponse === 'update' && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-300">Counter</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="font-bold text-gray-900">{formatCurrency(allocation.rfFinalFob)}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        + {formatCurrency(allocation.rebate)} R
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        + {formatCurrency(allocation.freight)} F
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-right bg-lime-50">
                                      <div className="font-bold text-lime-900">{formatCurrency(ourCostPerUnit)}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">FOB + R + F</div>
                                    </td>
                                    <td className="px-4 py-4 text-right bg-blue-50">
                                      <div className="font-bold text-blue-900">{formatCurrency(allocation.dlvdPrice)}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">from pricing</div>
                                    </td>
                                    <td className="px-4 py-4 text-right bg-green-50">
                                      <div className="font-bold text-green-900">{formatCurrency(profitPerCase)}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">from pricing calc</div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="font-bold text-blue-600">{allocation.supplierVolumeAccepted.toLocaleString()}</div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="text-sm text-gray-600">{allocation.offeredVolume.toLocaleString()}</div>
                                      {allocation.supplierVolumeAccepted !== allocation.offeredVolume && (
                                        <div className={`text-xs ${allocation.supplierVolumeAccepted > allocation.offeredVolume ? 'text-green-600' : 'text-red-600'}`}>
                                          {allocation.supplierVolumeAccepted > allocation.offeredVolume ? '+' : ''}
                                          {(allocation.supplierVolumeAccepted - allocation.offeredVolume).toLocaleString()}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="font-semibold text-red-600">{formatCurrency(cost)}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        {formatCurrency(ourCostPerUnit)} × {allocation.supplierVolumeAccepted.toLocaleString()}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className="font-semibold text-green-600">{formatCurrency(revenue)}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        {formatCurrency(allocation.dlvdPrice)} × {allocation.supplierVolumeAccepted.toLocaleString()}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <div className={`font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {formatCurrency(profit)}
                                      </div>
                                      <div className="text-xs text-gray-500">{margin.toFixed(1)}%</div>
                                    </td>
                                    <td className="px-4 py-4">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => handleAcceptSupplierResponse(allocation)}
                                          disabled={processing[allocation.quoteId]}
                                          className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-1"
                                        >
                                          <CheckCircle className="w-3 h-3" />
                                          Accept
                                        </button>
                                        <div className="flex gap-1">
                                          <input
                                            type="number"
                                            value={revisedVolumes[allocation.quoteId] || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRevisedVolumes({ ...revisedVolumes, [allocation.quoteId]: e.target.value })}
                                            placeholder="Revise"
                                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                                          />
                                          <button
                                            onClick={() => handleReviseOffer(allocation)}
                                            disabled={processing[allocation.quoteId]}
                                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr className="bg-orange-100 font-bold">
                                <td colSpan={3} className="px-4 py-3 text-right">
                                  <span className="text-gray-900">Item Total:</span>
                                </td>
                                <td className="px-4 py-3 text-right text-blue-700">{totalVolume.toLocaleString()}</td>
                                <td colSpan={1}></td>
                                <td className="px-4 py-3 text-right text-red-700">{formatCurrency(totalCost)}</td>
                                <td className="px-4 py-3 text-right text-green-700">{formatCurrency(totalRevenue)}</td>
                                <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(totalProfit)}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-600">{avgMargin.toFixed(1)}% margin</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {itemAllocs.some(a => a.supplierResponseNotes) && (
                          <div className="mt-4 space-y-2">
                            {itemAllocs.filter(a => a.supplierResponseNotes).map(a => (
                              <div key={a.quoteId} className="p-3 bg-white rounded-lg border-l-4 border-orange-400 text-sm">
                                <p className="font-semibold text-gray-700">{a.supplierName}:</p>
                                <p className="text-gray-600">{a.supplierResponseNotes}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {readyToSendAllocations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-300">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  Ready to Send to Suppliers ({readyToSendAllocations.length})
                </h2>
                <p className="text-blue-100 text-sm mt-1">These allocations are ready but haven't been sent to suppliers yet. Go to the "Award Volume" tab and click "Send Allocation to Suppliers".</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-3">
                  {readyToSendAllocations.map((allocation: VolumeAllocation) => (
                    <div key={allocation.quoteId} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{allocation.itemName}</h3>
                          <p className="text-sm text-gray-600">{allocation.supplierName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Allocated Volume</p>
                          <p className="text-lg font-bold text-blue-600">{allocation.awardedVolume.toLocaleString()} cases</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {declinedAllocations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <XCircle className="w-6 h-6" />
                  Declined Offers ({declinedAllocations.length})
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-3">
                  {declinedAllocations.map((allocation: VolumeAllocation) => (
                    <div key={allocation.quoteId} className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{allocation.itemName}</h3>
                          <p className="text-sm text-gray-600">{allocation.supplierName}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold border-2 border-red-300">Declined</span>
                          {allocation.supplierResponseNotes && (
                            <p className="text-xs text-gray-500 mt-2 max-w-xs">{allocation.supplierResponseNotes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {pendingAllocations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Pending Supplier Response ({pendingAllocations.length})</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-3">
              {pendingAllocations.map((allocation: VolumeAllocation) => (
                <div key={allocation.quoteId} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{allocation.itemName}</h3>
                    <p className="text-sm text-gray-600">{allocation.supplierName} • {formatCurrency(allocation.supplierFob)}/unit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Offered Volume</p>
                    <p className="text-lg font-bold text-gray-900">{allocation.offeredVolume.toLocaleString()} units</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={revisedVolumes[allocation.quoteId] || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRevisedVolumes({ ...revisedVolumes, [allocation.quoteId]: e.target.value })}
                      placeholder="Revise volume"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => handleReviseOffer(allocation)}
                      disabled={processing[allocation.quoteId]}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    >
                      Revise
                    </button>
                    <button
                      onClick={() => handleDeclineOffer(allocation)}
                      disabled={processing[allocation.quoteId]}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium disabled:opacity-50"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {finalizedAllocations.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Package className="w-4 h-4 text-blue-300" />
                </div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Finalized Volume</p>
              </div>
              <p className="text-3xl font-black text-white mb-1">{finalizedFinancials.totalVolume.toLocaleString()}</p>
              <p className="text-blue-300/70 text-xs">units locked</p>
            </div>

            <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <DollarSign className="w-4 h-4 text-red-300" />
                </div>
                <p className="text-red-200 text-xs font-semibold uppercase tracking-wider">Committed Cost</p>
              </div>
              <p className="text-3xl font-black text-white mb-1">{formatCurrency(finalizedFinancials.totalCost)}</p>
              <p className="text-red-300/70 text-xs">supplier costs</p>
            </div>

            <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                </div>
                <p className="text-green-200 text-xs font-semibold uppercase tracking-wider">Revenue</p>
              </div>
              <p className="text-3xl font-black text-white mb-1">{formatCurrency(finalizedFinancials.totalRevenue)}</p>
              <p className="text-green-300/70 text-xs">customer sales</p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-emerald-300" />
                </div>
                <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">Est. Profit</p>
              </div>
              <p className="text-3xl font-black text-white mb-1">{formatCurrency(finalizedFinancials.totalProfit)}</p>
              <p className="text-emerald-300/70 text-xs">Profit/Case × Volume</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-amber-300" />
                </div>
                <p className="text-amber-200 text-xs font-semibold uppercase tracking-wider">Margin</p>
              </div>
              <p className="text-3xl font-black text-white mb-1">{finalizedFinancials.profitMargin.toFixed(1)}%</p>
              <p className="text-amber-300/70 text-xs">profit margin</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
            <div className="bg-emerald-500/20 px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-300" />
                Finalized Allocations ({finalizedAllocations.length})
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {Array.from(groupByItem(finalizedAllocations).entries()).map(([itemId, itemAllocs]) => {
                const firstAlloc = itemAllocs[0];
                const weightedAvgFOB = calculateWeightedAvgFOB(itemAllocs, true);
                const weightedAvgCost = calculateItemWeightedAvgCost(itemAllocs, true);
                const totalVolume = itemAllocs.reduce((sum, a) => sum + a.awardedVolume, 0);
                
                // Calculate totals using individual supplier costs (sum of line items)
                const totalCost = itemAllocs.reduce((sum, a) => {
                  const ourCostPerUnit = calculateOurCostPerUnit(a);
                  return sum + (ourCostPerUnit * a.awardedVolume);
                }, 0);
                
                // Revenue uses item's delivered price (same for all suppliers)
                const totalRevenue = itemAllocs.reduce((sum, a) => sum + (a.dlvdPrice * a.awardedVolume), 0);
                // Est Profit: Profit Per Case × Volume (from internal pricing calculations)
                const totalProfit = itemAllocs.reduce((sum, a) => {
                  const profitPerCase = a.margin || 0; // Profit per case from internal pricing calculations
                  return sum + (profitPerCase * a.awardedVolume);
                }, 0);

                return (
                  <div key={itemId} className="border border-emerald-400/20 rounded-xl overflow-hidden bg-white/5">
                    <div className="bg-emerald-500/10 px-6 py-4 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-2xl text-white">{firstAlloc.itemName}</h3>
                          <p className="text-sm text-white/70 mt-1">{itemAllocs.length} supplier{itemAllocs.length > 1 ? 's' : ''} finalized</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/60 mb-1">Weighted Avg FOB</p>
                          <p className="text-xl font-bold text-emerald-300">{formatCurrency(weightedAvgFOB)}</p>
                          <p className="text-xs text-white/60 mb-2 mt-1">Our Avg Cost: {formatCurrency(weightedAvgCost)}</p>
                          <p className="text-xs text-white/60">Total Volume: {totalVolume.toLocaleString()} cases</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="overflow-x-auto bg-white/0">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-white/8 to-white/5 border-b-2 border-white/15">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Supplier</th>
                              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">FOB + R + F</th>
                              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Our Cost/Case</th>
                              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Dlvd Price</th>
                              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Profit/Case</th>
                              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Volume</th>
                              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Total Cost</th>
                              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Revenue</th>
                              <th className="px-6 py-4 text-right text-xs font-black text-white uppercase tracking-wider">Profit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {itemAllocs.map((allocation: VolumeAllocation) => {
                              // Use same calculation as Allocate Volume tab
                              const ourCostPerUnit = calculateOurCostPerUnit(allocation);
                              const cost = ourCostPerUnit * allocation.awardedVolume;
                              const revenue = allocation.dlvdPrice * allocation.awardedVolume;
                              // Est Profit: Profit Per Case × Volume (from internal pricing calculations)
                              const profitPerCase = allocation.margin || 0;
                              const profit = profitPerCase * allocation.awardedVolume;
                              const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

                              return (
                                <tr key={allocation.quoteId} className="hover:bg-white/5 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="font-bold text-white">{allocation.supplierName}</div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="font-black text-white text-lg">{formatCurrency(allocation.rfFinalFob)}</div>
                                    <div className="text-xs text-white/60 mt-0.5">
                                      + {formatCurrency(allocation.rebate)} R
                                    </div>
                                    <div className="text-xs text-white/60">
                                      + {formatCurrency(allocation.freight)} F
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="font-black text-lime-300 text-lg">{formatCurrency(ourCostPerUnit)}</div>
                                    <div className="text-xs text-white/60 mt-0.5">FOB + R + F</div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="font-black text-blue-300 text-lg">{formatCurrency(allocation.dlvdPrice)}</div>
                                    <div className="text-xs text-white/60 mt-0.5">from pricing</div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="font-black text-green-300 text-lg">{formatCurrency(profitPerCase)}</div>
                                    <div className="text-xs text-white/60 mt-0.5">from pricing calc</div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="font-black text-blue-300 text-lg">{allocation.awardedVolume.toLocaleString()}</div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="font-bold text-red-300 text-lg">{formatCurrency(cost)}</div>
                                    <div className="text-xs text-white/60 mt-0.5">
                                      {formatCurrency(ourCostPerUnit)} × {allocation.awardedVolume.toLocaleString()}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="font-bold text-green-300 text-lg">{formatCurrency(revenue)}</div>
                                    <div className="text-xs text-white/60 mt-0.5">
                                      {formatCurrency(allocation.dlvdPrice)} × {allocation.awardedVolume.toLocaleString()}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className={`font-black text-lg ${profit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                                      {formatCurrency(profit)}
                                    </div>
                                    <div className="text-xs text-white/60">{margin.toFixed(1)}%</div>
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-emerald-500/10 font-bold border-t-2 border-white/10">
                              <td colSpan={5} className="px-6 py-4 text-right">
                                <span className="text-white">Item Total:</span>
                              </td>
                              <td className="px-6 py-4 text-right text-blue-300 font-black">{totalVolume.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right text-red-300 font-black">{formatCurrency(totalCost)}</td>
                              <td className="px-6 py-4 text-right text-green-300 font-black">{formatCurrency(totalRevenue)}</td>
                              <td className="px-6 py-4 text-right text-emerald-300 font-black">{formatCurrency(totalProfit)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Emergency Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-scale-in">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-900">Emergency Unlock</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                This week is locked. Unlocking will allow you to make changes to volumes and pricing.
                Please provide a reason for this emergency unlock:
              </p>
              <textarea
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="Enter reason for emergency unlock (e.g., 'Supplier requested volume change', 'Pricing error correction')"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUnlockModal(false);
                  setUnlockReason('');
                }}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencyUnlock}
                disabled={unlocking || !unlockReason.trim()}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {unlocking ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Unlock Week
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## D) SUPPLIER WORKFLOW FILES

### src/components/SupplierDashboard.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { LogOut, CheckCircle2, XCircle, MessageSquare, Award, AlertCircle, Check, Sparkles, Download, Zap, ChevronDown, Lock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchCurrentOpenWeek,
  fetchWeeks,
  fetchItems,
  updateSupplierResponse,
} from '../utils/database';
import { supabase } from '../utils/supabase';
import type { Week, Item, Quote } from '../types';
import { formatCurrency } from '../utils/helpers';
import { VolumeOffers } from './VolumeOffers';
import AllocationResponse from './AllocationResponse';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ExportData } from './ExportData';
import { NotificationCenter } from './NotificationCenter';
import { useRealtime } from '../hooks/useRealtime';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { logger } from '../utils/logger';

export function SupplierDashboard() {
  const { session, login, logout } = useApp();
  const { showToast } = useToast();
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [allAwardedQuotes, setAllAwardedQuotes] = useState<(Quote & { week_number: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteInputs, setQuoteInputs] = useState<Record<string, { fob: string; dlvd: string }>>({});
  const [responseInputs, setResponseInputs] = useState<Record<string, { response: 'accept' | 'revise'; revised: string }>>({});
  const [submittingQuotes, setSubmittingQuotes] = useState(false);
  const [submittingResponses, setSubmittingResponses] = useState(false);

  useEffect(() => {
    if (session?.supplier_id) {
      setQuoteInputs({});
      setResponseInputs({});
    }
  }, [session?.supplier_id]);

  useRealtime('quotes', () => {
    loadQuotes();
    loadAllAwardedVolumes();
  });
  useRealtime('weeks', loadData);

  useKeyboardShortcuts([
    { key: 's', ctrl: true, action: () => !submittingQuotes && handleSubmitQuotes(), description: 'Submit prices' },
    { key: 'r', ctrl: true, action: () => !submittingResponses && handleSubmitResponses(), description: 'Submit responses' },
    { key: 'e', ctrl: true, action: () => {}, description: 'Export data' },
  ]);

  useEffect(() => {
    loadData();
  }, [session]);

  useEffect(() => {
    if (currentWeek && session?.supplier_id) {
      logger.debug('Rendering table:', { itemsCount: items.length, quotesCount: quotes.length });
      loadQuotes();
    }
  }, [currentWeek, session]);

  useEffect(() => {
    if (session?.supplier_id) {
      loadAllAwardedVolumes();
    }
  }, [session]);

  useEffect(() => {
    if (quotes.length > 0) {
      const needsResponse = quotes.filter(q => q.rf_counter_fob !== null && q.supplier_response === null);
      if (needsResponse.length > 0) {
        const initialResponses: Record<string, { response: 'accept' | 'revise'; revised: string }> = {};
        needsResponse.forEach(q => {
          if (!responseInputs[q.item_id]) {
            initialResponses[q.item_id] = { response: 'accept', revised: '' };
          }
        });
        if (Object.keys(initialResponses).length > 0) {
          setResponseInputs(prev => ({ ...prev, ...initialResponses }));
        }
      }
    }
  }, [quotes]);

  async function loadData() {
    if (!session?.supplier_id) {
      logger.debug('No session or supplier_id, skipping loadData');
      return;
    }

    logger.debug('Loading supplier dashboard data');

    try {
      const [weeksData, itemsData, suppliersData] = await Promise.all([
        fetchWeeks(),
        fetchItems(),
        supabase.from('suppliers').select('id, name')
      ]);

      logger.debug('Data loaded:', { weeksCount: weeksData.length, itemsCount: itemsData.length });

      const validSupplierIds = new Set(suppliersData.data?.map(s => s.id) || []);

      if (!validSupplierIds.has(session.supplier_id)) {
        const allSuppliers = suppliersData.data || [];
        if (allSuppliers.length > 0) {
          const firstSupplier = allSuppliers[0];
          logger.warn('Stored supplier ID invalid, auto-selecting:', firstSupplier.name);
          login(session.user_id, session.user_name, 'supplier', firstSupplier.id);
          // Silently auto-select without showing toast (happens after fresh demo reset)
          return;
        } else {
          logger.error('No suppliers found in database');
          showToast('No suppliers found', 'error');
          setLoading(false);
          return;
        }
      }

      setWeeks(weeksData.sort((a, b) => b.week_number - a.week_number));
      setItems(itemsData);

      // Suppliers can view ALL weeks (open, closed, finalized)
      // Select most relevant week by default:
      // Priority 1: Open weeks (for quoting)
      // Priority 2: Weeks with allocations sent
      // Priority 3: Most recent week by start_date
      const allWeeksSorted = [...weeksData].sort((a, b) => {
        // Prioritize open weeks first
        if (a.status === 'open' && b.status !== 'open') return -1;
        if (b.status === 'open' && a.status !== 'open') return 1;
        // Then weeks with allocations
        if (a.allocation_submitted && !b.allocation_submitted) return -1;
        if (b.allocation_submitted && !a.allocation_submitted) return 1;
        // Finally by start_date descending (newest first)
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      });

      const selectedWeek = allWeeksSorted[0];

      if (!selectedWeek) {
        logger.error('No weeks found in database');
        showToast('No weeks available', 'error');
        setLoading(false);
        return;
      }

      logger.debug('Supplier dashboard loaded successfully');

      setCurrentWeek(selectedWeek);
    } catch (err: unknown) {
      logger.error('Error loading data:', err);
      showToast(`Failed to load data: ${err?.message || 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadQuotes() {
    if (!currentWeek || !session?.supplier_id) {
      logger.debug('Cannot load quotes: missing currentWeek or supplier_id');
      return;
    }
    try {
      logger.debug('Loading quotes for week:', currentWeek.id);

      const { data: quotesData, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('week_id', currentWeek.id)
        .eq('supplier_id', session.supplier_id);

      if (error) {
        logger.error('=== QUOTES FETCH ERROR ===');
        logger.error('Error code:', error.code);
        logger.error('Error message:', error.message);
        logger.error('Error details:', error.details);
        showToast(`Failed to load quotes: ${error.message}`, 'error');
        return;
      }

      logger.debug('✓ Fetched quotes count:', quotesData?.length || 0);
      logger.debug('  Items count:', items.length);
      
      // Ensure we only show quotes for this specific supplier
      const filteredQuotes = (quotesData || []).filter(q => q.supplier_id === session.supplier_id);
      logger.debug('  Filtered quotes count:', filteredQuotes.length);
      
      setQuotes(filteredQuotes);
      await loadAllAwardedVolumes();
    } catch (err: unknown) {
      logger.error('=== ERROR IN LOAD QUOTES ===');
      logger.error('Error:', err);
      showToast(`Failed to load quotes: ${err?.message || 'Unknown error'}`, 'error');
    }
  }

  async function loadAllAwardedVolumes() {
    if (!session?.supplier_id) return;
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          week:weeks!inner(week_number, status, id),
          item:items!inner(name, pack_size, organic_flag)
        `)
        .eq('supplier_id', session.supplier_id)
        .order('week(week_number)', { ascending: false });

      if (error) throw error;

      const quotesWithWeek = data?.filter(q =>
        (q.awarded_volume && q.awarded_volume > 0) ||
        (q.supplier_volume_accepted && q.supplier_volume_accepted > 0)
      ).map(q => ({
        ...q,
        week_number: q.week.week_number,
      })) || [];

      setAllAwardedQuotes(quotesWithWeek);
    } catch (err) {
      logger.error('Error loading awarded volumes:', err);
      showToast('Failed to load awarded volumes', 'error');
    }
  }

  const handleSubmitQuotes = async () => {
    if (submittingQuotes || !currentWeek || !session?.supplier_id) return;

    // Block submission if week is finalized or closed
    if (currentWeek.status !== 'open') {
      showToast('Pricing is closed for this week. RF has finalized pricing.', 'error');
      return;
    }

    // Submitting quotes for week
    console.log('items.length:', items.length);
    console.log('quotes.length:', quotes.length);
    console.log('quoteInputs:', quoteInputs);

    const updates = Object.entries(quoteInputs).filter(([_, v]) => v.fob || v.dlvd);
    console.log('updates to process:', updates.length);

    if (updates.length === 0) {
      showToast('Please enter at least one price', 'error');
      return;
    }

    setSubmittingQuotes(true);
    try {
      const payloads = updates.map(([itemId, values]) => {
        const fobValue = values.fob?.trim();
        const dlvdValue = values.dlvd?.trim();

        return {
          week_id: currentWeek.id,
          supplier_id: session.supplier_id,
          item_id: itemId,
          supplier_fob: fobValue && fobValue !== '' ? Number(fobValue) : null,
          supplier_dlvd: dlvdValue && dlvdValue !== '' ? Number(dlvdValue) : null,
          updated_at: new Date().toISOString()
        };
      });

      // Upserting quote payloads

      const { data, error } = await supabase
        .from('quotes')
        .upsert(payloads, {
          onConflict: 'week_id,item_id,supplier_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        logger.error('Upsert error:', error);
        showToast(`Failed to submit prices: ${error.message}`, 'error');
        return;
      }

      // Upsert may succeed while returning no rows depending on PostgREST return preferences.
      // Treat empty-return as success to avoid false-negative toasts.
      if (!data || data.length === 0) {
        console.warn('Upsert returned no rows; proceeding as success.');
      }

      console.log('✓ Pricing submitted and finalized:', data.length, 'quotes');
      showToast(`${data.length} price(s) submitted successfully`, 'success');
      setQuoteInputs({});
      await loadQuotes();
    } catch (err) {
      console.error('Submit error:', err);
      showToast(`Failed to submit prices: ${err}`, 'error');
    } finally {
      setSubmittingQuotes(false);
    }
  };

  const handleSubmitResponses = async () => {
    if (submittingResponses || !currentWeek) return;

    // Block submission if week is finalized or closed
    if (currentWeek.status !== 'open') {
      showToast('Pricing is closed for this week. RF has finalized pricing.', 'error');
      return;
    }

    const quotesNeedingResponse = quotes.filter(q => q.rf_counter_fob !== null && q.supplier_response === null);

    if (quotesNeedingResponse.length === 0) {
      showToast('No responses needed', 'error');
      return;
    }

    for (const quote of quotesNeedingResponse) {
      const response = responseInputs[quote.item_id];
      if (!response || !response.response) {
        showToast('Please respond to all counters', 'error');
        return;
      }
      if (response.response === 'revise' && !response.revised) {
        showToast('Please enter revised price for all "revise" responses', 'error');
        return;
      }
    }

    setSubmittingResponses(true);
    try {
      let successCount = 0;
      for (const quote of quotesNeedingResponse) {
        const values = responseInputs[quote.item_id];
        const revised = values.response === 'revise' && values.revised ? parseFloat(parseFloat(values.revised).toFixed(2)) : undefined;
        const success = await updateSupplierResponse(quote.id, values.response, revised);
        if (success) successCount++;
      }

      if (successCount > 0) {
        showToast(`${successCount} response(s) submitted successfully`, 'success');
        setResponseInputs({});
        await loadQuotes();
      } else {
        showToast('Failed to submit responses', 'error');
      }
    } finally {
      setSubmittingResponses(false);
    }
  };


  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg5ZTJiOCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      <header className="relative bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-800 shadow-2xl border-b-4 border-lime-500">
        <div className="max-w-7xl mx-auto px-6 py-7">
          <div className="flex items-center gap-6">
            <div className="border-l-2 border-lime-400/30 pl-6">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Robinson Fresh
              </h1>
              <LoadingSkeleton type="header" rows={1} />
            </div>
          </div>
        </div>
      </header>
      <main className="relative max-w-7xl mx-auto px-6 py-8">
        <LoadingSkeleton type="card" rows={3} />
      </main>
    </div>;
  }

  if (!currentWeek && !loading) {
    return <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 relative flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-10 max-w-lg text-center border-2 border-gray-100">
        <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Active Week Available</h2>
        <p className="text-gray-600 mb-6 text-base">
          There are currently no open weeks available for pricing submission. Please check back later or contact your Robinson Fresh representative.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg"
          >
            Refresh
          </button>
          <button
            onClick={logout}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold border border-gray-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>;
  }

  const isReadOnly = currentWeek?.status !== 'open';
  const hasAnyQuotedItems = quotes.some(q => q.supplier_fob !== null);
  const needsResponse = quotes.some(q => q.rf_counter_fob !== null && q.supplier_response === null);
  const hasParticipated = quotes.length > 0;
  const hasFinalPrices = quotes.some(q => q.rf_final_fob !== null);
  const hasVolumeOffers = quotes.some(q => q.offered_volume && q.offered_volume > 0 && !q.supplier_volume_response);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl"></div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)'
        }}
      ></div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <header className="relative bg-white/10 backdrop-blur-2xl shadow-2xl border-b-2 border-emerald-500/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="border-l-2 border-emerald-400/30 pl-4">
                <h1 className="text-2xl font-bold text-white">Robinson Fresh</h1>
                <p className="text-sm text-emerald-300 font-semibold">Supplier Portal - {session?.user_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
        {currentWeek && allAwardedQuotes.filter(q => q.week.id === currentWeek.id).length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden relative">
            <div className="relative z-10 bg-gradient-to-r from-emerald-600/90 via-emerald-700/90 to-emerald-600/90 backdrop-blur-sm px-8 py-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Awarded Volumes</h2>
                    <p className="text-emerald-50 text-sm mt-0.5">Week {currentWeek.week_number} awarded volumes</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ExportData
                    data={allAwardedQuotes.filter(q => q.week.id === currentWeek.id).map(q => {
                      const volume = q.awarded_volume || q.supplier_volume_accepted || 0;
                      const price = q.rf_final_fob || q.supplier_revised_fob || q.supplier_fob || 0;
                      return {
                        week: q.week_number,
                        sku: q.item.name,
                        organic: q.item.organic_flag,
                        pack_size: q.item.pack_size,
                        awarded_volume: volume,
                        final_fob_price: price,
                        your_dlvd_price: q.supplier_dlvd || '',
                        total_value: price * volume,
                        status: q.supplier_volume_response === 'accept' ? 'Accepted' :
                               q.supplier_volume_response === 'update' ? 'Updated' :
                               q.supplier_volume_approval || 'Confirmed',
                      };
                    })}
                    filename="awarded_volumes"
                  />
                </div>
              </div>
            </div>

            <div className="relative z-10 overflow-x-auto bg-white/0">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-white/8 to-white/5 border-b-2 border-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-white/90 uppercase tracking-wider">Week</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white/90 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white/90 uppercase tracking-wider">Pack</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-white/90 uppercase tracking-wider">Volume</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-white/90 uppercase tracking-wider">FOB Price</th>
                    {allAwardedQuotes.filter(q => q.week.id === currentWeek.id).some(q => q.supplier_dlvd) && (
                      <th className="px-6 py-4 text-right text-xs font-black text-white/90 uppercase tracking-wider">Your DLVD</th>
                    )}
                    <th className="px-6 py-4 text-right text-xs font-black text-white/90 uppercase tracking-wider">Total Value</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-white/90 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {allAwardedQuotes.filter(q => q.week.id === currentWeek.id).map((quote) => {
                    const displayVolume = quote.awarded_volume || quote.supplier_volume_accepted || 0;
                    const displayPrice = quote.rf_final_fob || quote.supplier_revised_fob || quote.supplier_fob || 0;
                    const totalValue = displayPrice * displayVolume;
                    const hasAnyDlvdQuotes = allAwardedQuotes.filter(q => q.week.id === currentWeek.id).some(q => q.supplier_dlvd);
                    return (
                      <tr key={quote.id} className="hover:bg-white/10 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            Week {quote.week_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-base">{quote.item.name}</div>
                          <div className="text-xs text-white/70 mt-0.5">{quote.item.organic_flag}</div>
                        </td>
                        <td className="px-6 py-4 text-white/90 text-sm font-medium">{quote.item.pack_size}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-lg font-black text-white">
                            {displayVolume.toLocaleString()}
                          </div>
                          <div className="text-xs text-white/60">cases</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-lg font-black text-white">{formatCurrency(displayPrice)}</div>
                          <div className="text-xs text-white/60">per case</div>
                        </td>
                        {hasAnyDlvdQuotes && (
                          <td className="px-6 py-4 text-right">
                            <div className="text-lg font-black text-white">
                              {quote.supplier_dlvd ? formatCurrency(quote.supplier_dlvd) : '-'}
                            </div>
                            {quote.supplier_dlvd && <div className="text-xs text-white/60">per case</div>}
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <div className="text-xl font-black text-emerald-300">{formatCurrency(totalValue)}</div>
                          <div className="text-xs text-white/60">total</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                            quote.supplier_volume_response === 'accept' ? 'bg-green-500/20 text-green-300 border-green-400/50' :
                            quote.supplier_volume_response === 'update' ? 'bg-orange-500/20 text-orange-300 border-orange-400/50' :
                            quote.supplier_volume_approval === 'accepted' ? 'bg-green-500/20 text-green-300 border-green-400/50' :
                            quote.supplier_volume_approval === 'revised' ? 'bg-orange-500/20 text-orange-300 border-orange-400/50' :
                            quote.supplier_volume_approval === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50' :
                            'bg-white/10 text-white/70 border-white/20'
                          }`}>
                            {(quote.supplier_volume_response === 'accept' || quote.supplier_volume_approval === 'accepted') && <Check className="w-3.5 h-3.5" />}
                            {quote.supplier_volume_response === 'accept' ? 'Accepted' :
                             quote.supplier_volume_response === 'update' ? 'Updated' :
                             quote.supplier_volume_approval || 'Confirmed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gradient-to-r from-white/10 to-white/5 border-t-2 border-white/20">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-white/90">Week {currentWeek.week_number} Total</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-lg font-black text-white">
                        {allAwardedQuotes.filter(q => q.week.id === currentWeek.id).reduce((sum, q) => sum + (q.awarded_volume || q.supplier_volume_accepted || 0), 0).toLocaleString()} cases
                      </div>
                    </td>
                    <td colSpan={allAwardedQuotes.filter(q => q.week.id === currentWeek.id).some(q => q.supplier_dlvd) ? 2 : 1} className="px-6 py-4"></td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-2xl font-black text-emerald-300">
                        {formatCurrency(allAwardedQuotes.filter(q => q.week.id === currentWeek.id).reduce((sum, q) => {
                          const volume = q.awarded_volume || q.supplier_volume_accepted || 0;
                          const price = q.rf_final_fob || q.supplier_revised_fob || q.supplier_fob || 0;
                          return sum + (price * volume);
                        }, 0))}
                      </div>
                    </td>
                    <td colSpan={2} className="px-6 py-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {!currentWeek && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">No active week available at the moment. Please check back later.</p>
          </div>
        )}

        {currentWeek && hasVolumeOffers && (
          <div className="bg-gradient-to-r from-orange-600/90 via-orange-500/90 to-amber-500/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-2 border-orange-400/50 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <div className="text-white flex-1">
                <h3 className="text-2xl font-extrabold mb-2 drop-shadow">Volume Allocation Available</h3>
                <p className="text-orange-50 font-medium">You have volume offers pending your response. Scroll down to the Volume Offers section to accept or revise.</p>
              </div>
            </div>
          </div>
        )}

        {currentWeek && (
          <>
            {/* Show VolumeOffers when allocations have been sent (offered_volume > 0) */}
            {hasParticipated && currentWeek.allocation_submitted && hasVolumeOffers && (
              <VolumeOffers
                items={items}
                quotes={quotes}
                weekNumber={currentWeek.week_number}
                onRefresh={loadQuotes}
              />
            )}

            {/* Show AllocationResponse when awarded_volume exists but not yet sent (offered_volume is null) */}
            {hasParticipated && !currentWeek.allocation_submitted && quotes.some(q => q.awarded_volume && q.awarded_volume > 0 && !q.offered_volume) && session?.supplier_id && (
              <AllocationResponse
                items={items}
                quotes={quotes}
                weekId={currentWeek.id}
                weekNumber={currentWeek.week_number}
                supplierId={session.supplier_id}
                onRefresh={loadQuotes}
              />
            )}

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden relative">
              <div className="relative z-10 p-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/15 via-lime-500/15 to-emerald-500/15 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-white">Week {currentWeek.week_number} Pricing</h2>
                        <p className="text-sm text-white/80 mt-1">{currentWeek.start_date} to {currentWeek.end_date}</p>
                      </div>
                      {weeks.length > 1 && (
                        <div className="relative">
                          <select
                            value={currentWeek.id}
                            onChange={(e) => {
                              const selectedWeek = weeks.find(w => w.id === e.target.value);
                              if (selectedWeek) setCurrentWeek(selectedWeek);
                            }}
                            className="appearance-none bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg px-4 py-2 pr-10 font-medium text-white hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent cursor-pointer shadow-lg"
                          >
                            {weeks.map(week => (
                              <option key={week.id} value={week.id} className="bg-slate-900 text-white">
                                Week {week.week_number} - {week.status}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-5 h-5 text-white/70 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                        <div className={`w-3 h-3 rounded-full ${
                          currentWeek.status === 'open' ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' :
                          currentWeek.status === 'finalized' ? 'bg-blue-400' :
                          'bg-gray-400'
                        }`}></div>
                        <span className="text-sm font-bold text-white uppercase">{currentWeek.status}</span>
                      </div>
                    </div>
                  </div>
              </div>

            <div className="relative z-10 overflow-x-auto bg-white/0">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-white/8 to-white/5 border-b-2 border-white/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">SKU Details</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Pack Size</th>
                      <th className="px-6 py-4 text-center text-xs font-black text-white uppercase tracking-wider">Your FOB</th>
                      <th className="px-6 py-4 text-center text-xs font-black text-white uppercase tracking-wider">Your DLVD</th>
                      {hasAnyQuotedItems && <th className="px-6 py-4 text-center text-xs font-black text-orange-200 uppercase tracking-wider">RF Counter</th>}
                      {needsResponse && <th className="px-6 py-4 text-center text-xs font-black text-green-200 uppercase tracking-wider">Your Response</th>}
                      {hasFinalPrices && <th className="px-6 py-4 text-center text-xs font-black text-blue-200 uppercase tracking-wider">Final Price</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={hasFinalPrices ? 7 : needsResponse ? 6 : hasAnyQuotedItems ? 5 : 4} className="px-6 py-8 text-center text-white/80 font-medium">
                          No items available. Loading...
                        </td>
                      </tr>
                    )}
                    {items.map((item, index) => {
                      // Ensure we only get quotes for this specific supplier
                      const quote = quotes.find(q => q.item_id === item.id && q.supplier_id === session?.supplier_id);

                      const canEditInitial = !isReadOnly && (!quote || quote.supplier_fob === null);
                      const canRespond = !isReadOnly && quote?.rf_counter_fob !== null && quote?.supplier_response === null;
                      const showCounterColumn = hasAnyQuotedItems || (quote?.rf_counter_fob !== null);

                      return (
                        <React.Fragment key={item.id}>
                        <tr className={`transition-all hover:bg-white/5 ${index % 2 === 0 ? 'bg-white/3' : 'bg-white/0'}`}>
                          <td className="px-6 py-5">
                            <div>
                              <div className="font-bold text-white text-lg">{item.name}</div>
                              <div className="text-sm text-white/80 mt-1.5 flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-white/15 rounded-md text-xs font-semibold border border-white/25">{item.organic_flag}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-white font-semibold">{item.pack_size}</td>
                          <td className="px-6 py-5 text-center">
                            {canEditInitial ? (
                              <input
                                type="number"
                                step="0.01"
                                value={quoteInputs[item.id]?.fob ?? (quote?.supplier_fob || '')}
                                onChange={e => setQuoteInputs(prev => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], fob: e.target.value }
                                }))}
                                className="w-32 px-4 py-2.5 border-2 border-emerald-400/30 rounded-lg text-lg font-bold focus:outline-none focus:ring-4 focus:ring-emerald-400/50 focus:border-emerald-400/50 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 shadow-lg"
                                placeholder="0.00"
                                style={{ color: '#ffffff' }}
                              />
                            ) : (
                              <span className="inline-flex items-center px-4 py-2 bg-white/8 backdrop-blur-sm rounded-lg text-base font-black text-white border border-white/20 shadow-md">{quote?.supplier_fob ? formatCurrency(quote.supplier_fob) : '-'}</span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-center">
                            {canEditInitial ? (
                              <input
                                type="number"
                                step="0.01"
                                value={quoteInputs[item.id]?.dlvd ?? (quote?.supplier_dlvd || '')}
                                onChange={e => setQuoteInputs(prev => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], dlvd: e.target.value }
                                }))}
                                className="w-32 px-4 py-2.5 border-2 border-white/30 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-emerald-400/50 focus:border-emerald-400/50 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 shadow-lg"
                                placeholder="0.00"
                                style={{ color: '#ffffff' }}
                              />
                            ) : (
                              <span className="inline-flex items-center px-4 py-2 bg-white/8 backdrop-blur-sm rounded-lg text-base font-bold text-white border border-white/20 shadow-md">{quote?.supplier_dlvd ? formatCurrency(quote.supplier_dlvd) : '-'}</span>
                            )}
                          </td>
                          {showCounterColumn && (
                            <td className="px-6 py-5 text-center">
                              {quote?.rf_counter_fob ? (
                                <span className="inline-flex items-center px-4 py-2 bg-orange-500/20 border-2 border-orange-400/40 rounded-lg text-base font-black text-orange-200 backdrop-blur-sm shadow-lg">{formatCurrency(quote.rf_counter_fob)}</span>
                              ) : (
                                <span className="text-white/50">-</span>
                              )}
                            </td>
                          )}
                          {needsResponse && (
                            <td className="px-6 py-5 text-center">
                              {canRespond && quote?.rf_counter_fob ? (
                                <div className="flex gap-2 items-center justify-center">
                                  <select
                                    value={responseInputs[item.id]?.response || 'accept'}
                                    onChange={e => {
                                      const newResponse = e.target.value as 'accept' | 'revise';
                                      setResponseInputs(prev => ({
                                        ...prev,
                                        [item.id]: {
                                          response: newResponse,
                                          revised: newResponse === 'accept' ? '' : (prev[item.id]?.revised || '')
                                        }
                                      }));
                                    }}
                                    className="px-4 py-2.5 border-2 border-green-400/40 rounded-lg font-bold bg-green-500/20 backdrop-blur-sm text-white focus:outline-none focus:ring-4 focus:ring-green-400/50 shadow-lg"
                                  >
                                    <option value="accept" className="bg-slate-900">Accept</option>
                                    <option value="revise" className="bg-slate-900">Revise</option>
                                  </select>
                                  {(responseInputs[item.id]?.response === 'revise') && (
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={responseInputs[item.id]?.revised || ''}
                                      onChange={e => setResponseInputs(prev => ({
                                        ...prev,
                                        [item.id]: { ...prev[item.id], response: 'revise', revised: e.target.value }
                                      }))}
                                      className="w-32 px-4 py-2.5 border-2 border-green-400/40 rounded-lg font-bold bg-green-500/20 backdrop-blur-sm text-white focus:outline-none focus:ring-4 focus:ring-green-400/50 placeholder:text-white/40 shadow-lg"
                                      placeholder="Revised FOB"
                                      required
                                    />
                                  )}
                                </div>
                              ) : (
                                <span className={`inline-flex items-center px-4 py-2 rounded-lg font-bold border-2 shadow-md ${
                                  quote?.supplier_response === 'accept' ? 'bg-green-500/20 text-green-200 border-green-400/40' :
                                  quote?.supplier_response === 'revise' ? 'bg-orange-500/20 text-orange-200 border-orange-400/40' :
                                  'bg-white/8 text-white/80 border-white/20'
                                }`}>
                                  {quote?.supplier_response ? `${quote.supplier_response.toUpperCase()}${quote.supplier_revised_fob ? ': ' + formatCurrency(quote.supplier_revised_fob) : ''}` : '-'}
                                </span>
                              )}
                            </td>
                          )}
                          {hasFinalPrices && (
                            <td className="px-6 py-5 text-center">
                              {quote?.rf_final_fob ? (
                                <span className="inline-flex items-center px-4 py-2.5 bg-blue-500/20 border-2 border-blue-400/40 rounded-lg text-lg font-black text-blue-200 backdrop-blur-sm shadow-lg">{formatCurrency(quote.rf_final_fob)}</span>
                              ) : (
                                <span className="text-white/50">-</span>
                              )}
                            </td>
                          )}
                        </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {!isReadOnly && (
                <div className="relative z-10 p-6 border-t border-white/10 bg-white/3 backdrop-blur-sm flex gap-4">
                  {!hasAnyQuotedItems && !needsResponse && (
                    <button
                      onClick={handleSubmitQuotes}
                      disabled={submittingQuotes || currentWeek?.status !== 'open'}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {submittingQuotes ? 'Submitting...' : 'Submit Prices'}
                    </button>
                  )}
                  {hasAnyQuotedItems && !needsResponse && (
                    <div className="flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-300 rounded-xl border border-green-400/50 backdrop-blur-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-bold">Pricing Submitted</span>
                    </div>
                  )}
                  {needsResponse && (
                    <button
                      onClick={handleSubmitResponses}
                      disabled={submittingResponses || currentWeek?.status !== 'open'}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {submittingResponses ? 'Submitting...' : 'Submit Responses'}
                    </button>
                  )}
                </div>
              )}
              {isReadOnly && currentWeek?.status === 'finalized' && (
                <div className="relative z-10 p-6 border-t border-white/10 bg-orange-500/20 backdrop-blur-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-300" />
                  <div>
                    <p className="font-bold text-white">Pricing Closed</p>
                    <p className="text-sm text-white/90">RF has finalized pricing for this week. You can no longer submit or edit prices.</p>
                  </div>
                </div>
              )}
              {isReadOnly && currentWeek?.status === 'closed' && (
                <div className="relative z-10 p-6 border-t border-white/10 bg-white/5 backdrop-blur-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-white/60" />
                  <div>
                    <p className="font-bold text-white">Week Closed</p>
                    <p className="text-sm text-white/80">This week has been closed. Pricing and volume allocation are locked.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
```

### src/components/VolumeOffers.tsx
```typescript
import React, { useState } from 'react';
import { Check, X, Edit3, Send, RotateCcw, Shield } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { updateSupplierVolumeResponse } from '../utils/database';
import { useToast } from '../contexts/ToastContext';
import type { Item, Quote } from '../types';

interface VolumeOffersProps {
  items: Item[];
  quotes: Quote[];
  weekNumber: number;
  onRefresh: () => void;
}

export function VolumeOffers({ items, quotes, weekNumber, onRefresh }: VolumeOffersProps) {
  const { showToast } = useToast();
  const [responses, setResponses] = useState<Record<string, { action: 'accept' | 'update' | 'decline'; volume: string; notes: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  const itemsWithOffers = items
    .map(item => {
      const quote = quotes.find(q => q.item_id === item.id);
      return { item, quote };
    })
    .filter(({ quote }) => quote && quote.offered_volume && quote.offered_volume > 0);

  const handleResponse = (itemId: string, action: 'accept' | 'update' | 'decline', quote: Quote) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        action,
        volume: action === 'accept' ? (quote.offered_volume?.toString() || '0') : (prev[itemId]?.volume || '0'),
        notes: prev[itemId]?.notes || ''
      }
    }));
  };

  const handleClearResponse = (itemId: string) => {
    setResponses(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const handleVolumeChange = (itemId: string, volume: string) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        volume
      }
    }));
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  };

  const handleSubmitAll = async () => {
    const pendingResponses = itemsWithOffers.filter(({ item, quote }) =>
      !quote?.supplier_volume_response && responses[item.id]
    );

    if (pendingResponses.length === 0) {
      showToast('No responses to submit', 'error');
      return;
    }

    setSubmitting(true);
    let successCount = 0;

    for (const { item, quote } of pendingResponses) {
      const response = responses[item.id];
      if (!response || !quote) continue;

      let acceptedVolume = 0;
      if (response.action === 'accept') {
        acceptedVolume = quote.offered_volume || 0;
      } else if (response.action === 'update') {
        acceptedVolume = parseInt(response.volume) || 0;
      }

      const success = await updateSupplierVolumeResponse(
        quote.id,
        response.action,
        acceptedVolume,
        response.notes
      );

      if (success) successCount++;
    }

    setSubmitting(false);

    if (successCount > 0) {
      showToast(`${successCount} volume response(s) submitted successfully`, 'success');
      setResponses({});
      onRefresh();
    } else {
      showToast('Failed to submit volume responses', 'error');
    }
  };

  if (itemsWithOffers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-xl border-2 border-emerald-500 overflow-hidden">
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-lime-700 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Volume Offers - Week {weekNumber}</h2>
            <p className="text-lime-200 text-lg">Review and respond to volume allocations</p>
          </div>
          <div className="flex items-center gap-4">
            <img
              src="/image.png"
              alt="Robinson Fresh"
              className="h-14 w-auto brightness-0 invert opacity-80"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <button
              onClick={handleSubmitAll}
              disabled={submitting || Object.keys(responses).length === 0}
              className="flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-lime-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-3 border-emerald-700 border-t-transparent rounded-full"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">SKU</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Pack Size</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wide">Your Price</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wide">Offered Volume</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wide">Your Response</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {itemsWithOffers.map(({ item, quote }) => {
              if (!quote) return null;

              const offeredVolume = quote.offered_volume || 0;
              const finalPrice = quote.rf_final_fob || quote.supplier_revised_fob || quote.supplier_fob;
              const hasResponded = !!quote.supplier_volume_response;
              const currentResponse = responses[item.id];

              return (
                <tr key={item.id} className="hover:bg-emerald-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-semibold text-gray-900 text-base">{item.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.organic_flag}</div>
                  </td>
                  <td className="px-6 py-5 text-gray-800 font-medium">{item.pack_size}</td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(finalPrice || 0)}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="inline-flex items-center px-4 py-2 rounded-lg text-base font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {offeredVolume} cases
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {hasResponded ? (
                      <div className="text-center">
                        {quote.supplier_volume_response === 'accept' && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300">
                            <Check className="w-5 h-5" />
                            <span className="font-semibold">Accepted: {quote.supplier_volume_accepted} cases</span>
                          </div>
                        )}
                        {quote.supplier_volume_response === 'update' && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg border border-orange-300">
                            <Edit3 className="w-5 h-5" />
                            <span className="font-semibold">Counter: {quote.supplier_volume_accepted} cases</span>
                          </div>
                        )}
                        {quote.supplier_volume_response === 'decline' && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg border border-red-300">
                            <X className="w-5 h-5" />
                            <span className="font-semibold">Declined</span>
                          </div>
                        )}
                        {quote.supplier_volume_response_notes && (
                          <div className="mt-2 text-sm text-gray-600 italic text-left">
                            Note: {quote.supplier_volume_response_notes}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleResponse(item.id, 'accept', quote)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              currentResponse?.action === 'accept'
                                ? 'bg-green-600 text-white shadow-lg scale-105'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleResponse(item.id, 'update', quote)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              currentResponse?.action === 'update'
                                ? 'bg-orange-600 text-white shadow-lg scale-105'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }`}
                          >
                            <Edit3 className="w-4 h-4" />
                            Update
                          </button>
                          <button
                            onClick={() => handleResponse(item.id, 'decline', quote)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              currentResponse?.action === 'decline'
                                ? 'bg-red-600 text-white shadow-lg scale-105'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            <X className="w-4 h-4" />
                            Decline
                          </button>
                          {currentResponse && (
                            <button
                              onClick={() => handleClearResponse(item.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                              title="Clear selection"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Clear
                            </button>
                          )}
                        </div>

                        {currentResponse?.action === 'update' && (
                          <div className="flex items-center gap-2 justify-center">
                            <label className="text-sm font-medium text-gray-700">Counter Volume:</label>
                            <input
                              type="number"
                              min="0"
                              value={currentResponse.volume}
                              onChange={(e) => handleVolumeChange(item.id, e.target.value)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right font-semibold focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="0"
                            />
                            <span className="text-sm text-gray-600">cases</span>
                          </div>
                        )}

                        {currentResponse && (
                          <div className="px-2">
                            <input
                              type="text"
                              value={currentResponse.notes}
                              onChange={(e) => handleNotesChange(item.id, e.target.value)}
                              placeholder="Add optional notes..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## E) LAYOUT / CLICK-BLOCKERS

### src/components/ErrorBoundary.tsx
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-500/20 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-white/70 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

```

## F) TOP 10 CONSOLE/RUNTIME ERRORS

### Error Analysis

Based on code review, here are the top potential runtime errors:

1. **Missing rf_final_fob when finalizing pricing**
   - Location: RFDashboard.tsx, finalizePricingForWeek()
   - Steps: Create week → Supplier submits pricing → RF clicks 'Finalize Week' without setting rf_final_fob
   - Error: Week status doesn't change to 'finalized', Volume tab remains locked

2. **Week status not updating after finalization**
   - Location: database.ts, finalizePricingForWeek()
   - Steps: RF sets rf_final_fob → Clicks 'Finalize Week' → Status check fails
   - Error: Week status remains 'open' despite rf_final_fob being set

3. **Volume tab not unlocking**
   - Location: AwardVolume.tsx, useEffect hooks
   - Steps: Week finalized → AwardVolume component checks hasFinalizedQuotes → Returns false
   - Error: Volume tab shows 'Not Available Yet' even when week is finalized

4. **Missing week_item_volumes rows**
   - Location: AwardVolume.tsx, fetchVolumeNeeds()
   - Steps: Create new week → Navigate to Award Volume → No volume_needed data
   - Error: UI breaks or shows empty state, calculations fail

5. **awarded_volume not persisting in sandbox**
   - Location: AwardVolume.tsx, updateSandboxAwardedVolume()
   - Steps: RF edits award cases → Changes not saved → Refresh loses data
   - Error: Draft allocations lost on page refresh

6. **submitAllocationsToSuppliers RPC failure**
   - Location: database.ts, submitAllocationsToSuppliers()
   - Steps: RF allocates volume → Clicks 'Send Allocations' → RPC call fails
   - Error: awarded_volume not copied to offered_volume, suppliers don't see offers

7. **Supplier volume response not updating quotes**
   - Location: SupplierDashboard.tsx, handleSubmitResponses()
   - Steps: Supplier responds to volume offer → Response not saved
   - Error: supplier_volume_response remains null, RF can't see response

8. **Volume acceptance not updating awarded_volume**
   - Location: VolumeAcceptance.tsx, handleAcceptSupplierResponse()
   - Steps: RF accepts supplier revision → awarded_volume not updated
   - Error: Final volume doesn't reflect supplier's accepted amount

9. **closeVolumeLoop RPC failure**
   - Location: database.ts, closeVolumeLoop()
   - Steps: All responses handled → RF clicks 'Close Loop' → Week not closed
   - Error: Week status remains 'finalized', not 'closed'

10. **Realtime subscription not updating UI**
    - Location: useRealtime hook, AwardVolume.tsx
    - Steps: Supplier submits pricing → RF dashboard doesn't refresh
    - Error: UI shows stale data, requires manual refresh

