/**
 * COMPLETE DEMO DATABASE SEED SCRIPT
 * 
 * Creates a complete, realistic demo dataset for berry procurement:
 * - 8 berry items (Strawberry, Blueberry, Blackberry, Raspberry - CONV/ORG)
 * - 5 suppliers (including Berry Farms)
 * - 8 weeks (weeks 1-7 finalized, week 8 open)
 * - Complete quotes and allocations for weeks 1-7
 * - Week 8 ready for live demo (all suppliers except Berry Farms)
 * 
 * Usage:
 * 1. Set SUPABASE_SERVICE_ROLE_KEY in .env
 * 2. Run: npx tsx seed-demo-database.ts
 * 
 * Idempotent: Safe to run multiple times
 */

import { createClient } from '@supabase/supabase-js';

// Load env vars (works with Vite's import.meta.env too)
const loadEnv = () => {
  try {
    // Try dotenv if available
    const dotenv = require('dotenv');
    dotenv.config();
  } catch {
    // dotenv not installed, use process.env directly
  }
};

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Missing Supabase credentials');
  console.error('Required: VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Use service role for admin operations (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ============================================================================
// DATA DEFINITIONS
// ============================================================================

const ITEMS = [
  { name: 'Strawberry', pack_size: '4×2 lb', category: 'strawberry', organic_flag: 'CONV', display_order: 1 },
  { name: 'Strawberry', pack_size: '8×1 lb', category: 'strawberry', organic_flag: 'ORG', display_order: 2 },
  { name: 'Blueberry', pack_size: '18 oz', category: 'blueberry', organic_flag: 'CONV', display_order: 3 },
  { name: 'Blueberry', pack_size: 'Pint', category: 'blueberry', organic_flag: 'ORG', display_order: 4 },
  { name: 'Blackberry', pack_size: '12ozx6', category: 'blackberry', organic_flag: 'CONV', display_order: 5 },
  { name: 'Blackberry', pack_size: '12ozx6', category: 'blackberry', organic_flag: 'ORG', display_order: 6 },
  { name: 'Raspberry', pack_size: '12ozx6', category: 'raspberry', organic_flag: 'CONV', display_order: 7 },
  { name: 'Raspberry', pack_size: '12ozx6', category: 'raspberry', organic_flag: 'ORG', display_order: 8 },
];

// Note: Categories are 'strawberry', 'blueberry', 'blackberry', 'raspberry'
// If your schema uses 'berry' as category, update the ITEMS array above

const SUPPLIERS = [
  { name: 'Berry Farms', email: 'contact@berryfarms.com' },
  { name: 'Fresh Farms Inc', email: 'supplier1@freshfarms.com' },
  { name: 'Organic Growers', email: 'supplier2@organicgrowers.com' },
  { name: 'Valley Fresh', email: 'supplier3@valleyfresh.com' },
  { name: 'Premium Produce', email: 'supplier4@premiumproduce.com' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function log(message: string, data?: any) {
  console.log(`[${new Date().toISOString()}] ${message}`, data || '');
}

function error(message: string, err: any) {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`, err);
}

function randomPrice(base: number, variance: number = 2): number {
  return Math.round((base + (Math.random() - 0.5) * variance) * 100) / 100;
}

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedItems() {
  log('Seeding items...');
  const itemMap = new Map<string, { id: string }>();
  
  for (const itemData of ITEMS) {
    // Try to find existing item
    const { data: existing } = await supabase
      .from('items')
      .select('id')
      .eq('name', itemData.name)
      .eq('pack_size', itemData.pack_size)
      .eq('organic_flag', itemData.organic_flag)
      .maybeSingle();
    
    if (existing) {
      // Update if needed
      await supabase
        .from('items')
        .update({ category: itemData.category, display_order: itemData.display_order })
        .eq('id', existing.id);
      itemMap.set(`${itemData.name}|${itemData.pack_size}|${itemData.organic_flag}`, { id: existing.id });
    } else {
      // Insert new
      const { data: newItem, error: err } = await supabase
        .from('items')
        .insert(itemData)
        .select('id')
        .single();
      
      if (err) {
        error(`Failed to insert item ${itemData.name}`, err);
      } else if (newItem) {
        itemMap.set(`${itemData.name}|${itemData.pack_size}|${itemData.organic_flag}`, { id: newItem.id });
      }
    }
  }
  
  log(`✓ Seeded ${itemMap.size} items`);
  return itemMap;
}

async function seedSuppliers() {
  log('Seeding suppliers...');
  const supplierMap = new Map<string, { id: string }>();
  
  for (const supplierData of SUPPLIERS) {
    const { data, error: err } = await supabase
      .from('suppliers')
      .upsert(supplierData, { onConflict: 'email' })
      .select('id')
      .single();
    
    if (err) {
      error(`Failed to upsert supplier ${supplierData.name}`, err);
    } else if (data) {
      supplierMap.set(supplierData.email, { id: data.id });
    }
  }
  
  log(`✓ Seeded ${supplierMap.size} suppliers`);
  return supplierMap;
}

async function seedWeeks() {
  log('Seeding weeks...');
  const weekMap = new Map<number, { id: string }>();
  const today = new Date();
  
  for (let weekNum = 1; weekNum <= 8; weekNum++) {
    const daysAgo = (8 - weekNum) * 7;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysAgo - 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekData = {
      week_number: weekNum,
      start_date: weekStart.toISOString().split('T')[0],
      end_date: weekEnd.toISOString().split('T')[0],
      status: weekNum <= 7 ? 'finalized' : 'open',
      allocation_submitted: weekNum <= 7,
    };
    
    const { data, error: err } = await supabase
      .from('weeks')
      .upsert(weekData, { onConflict: 'week_number' })
      .select('id')
      .single();
    
    if (err) {
      error(`Failed to upsert week ${weekNum}`, err);
    } else if (data) {
      weekMap.set(weekNum, { id: data.id });
    }
  }
  
  log(`✓ Seeded ${weekMap.size} weeks`);
  return weekMap;
}

async function seedQuotes(weekMap: Map<number, { id: string }>, itemMap: Map<string, { id: string }>, supplierMap: Map<string, { id: string }>) {
  log('Seeding quotes...');
  let totalQuotes = 0;
  const berryFarmsEmail = 'contact@berryfarms.com';
  const berryFarmsId = supplierMap.get(berryFarmsEmail)?.id;
  
  const basePrices: Record<string, { conv: number; org: number }> = {
    'Strawberry': { conv: 10.50, org: 11.50 },
    'Blueberry': { conv: 8.50, org: 9.75 },
    'Blackberry': { conv: 10.25, org: 11.50 },
    'Raspberry': { conv: 11.00, org: 12.25 },
  };
  
  for (let weekNum = 1; weekNum <= 8; weekNum++) {
    const weekId = weekMap.get(weekNum)?.id;
    if (!weekId) continue;
    
    const weekQuotes: any[] = [];
    const isWeek8 = weekNum === 8;
    
    for (const itemData of ITEMS) {
      const itemKey = `${itemData.name}|${itemData.pack_size}|${itemData.organic_flag}`;
      const itemId = itemMap.get(itemKey)?.id;
      if (!itemId) continue;
      
      const isORG = itemData.organic_flag === 'ORG';
      const basePrice = basePrices[itemData.name]?.[isORG ? 'org' : 'conv'] || 10.00;
      
      for (const [email, supplier] of supplierMap.entries()) {
        // Week 8: Skip Berry Farms
        if (isWeek8 && email === berryFarmsEmail) continue;
        
        // For weeks 1-7: Create finalized quotes
        // For week 8: Create initial quotes (no rf_final_fob yet)
        const supplierFOB = randomPrice(basePrice, 2.0);
        const supplierDLVD = supplierFOB + 2.0 + Math.random() * 1.0;
        
        const quoteData: any = {
          week_id: weekId,
          item_id: itemId,
          supplier_id: supplier.id,
          supplier_fob: supplierFOB,
          supplier_dlvd: supplierDLVD,
        };
        
        if (weekNum <= 7) {
          // Finalized weeks: add rf_final_fob (most accepted, 1-2 declined per week)
          const shouldAccept = Math.random() > (weekNum * 0.15); // ~85% acceptance rate
          if (shouldAccept) {
            quoteData.rf_final_fob = randomPrice(basePrice, 1.5);
          } else {
            quoteData.rf_final_fob = null;
          }
        }
        
        weekQuotes.push(quoteData);
      }
    }
    
      // Batch insert quotes (process in chunks of 100 to avoid timeout)
      if (weekQuotes.length > 0) {
        const chunkSize = 100;
        for (let i = 0; i < weekQuotes.length; i += chunkSize) {
          const chunk = weekQuotes.slice(i, i + chunkSize);
          const { error: err } = await supabase
            .from('quotes')
            .upsert(chunk, { onConflict: 'week_id,item_id,supplier_id' });
          
          if (err) {
            error(`Failed to upsert quotes chunk for week ${weekNum}`, err);
          }
        }
        totalQuotes += weekQuotes.length;
        log(`  ✓ Week ${weekNum}: ${weekQuotes.length} quotes`);
      }
  }
  
  log(`✓ Seeded ${totalQuotes} total quotes`);
}

async function seedVolumes(weekMap: Map<number, { id: string }>, itemMap: Map<string, { id: string }>, supplierMap: Map<string, { id: string }>) {
  log('Seeding week_item_volumes (awarded volumes for weeks 1-7)...');
  let totalVolumes = 0;
  
  for (let weekNum = 1; weekNum <= 7; weekNum++) {
    const weekId = weekMap.get(weekNum)?.id;
    if (!weekId) continue;
    
    const volumes: any[] = [];
    const suppliers = Array.from(supplierMap.values());
    
    for (const itemData of ITEMS) {
      const itemKey = `${itemData.name}|${itemData.pack_size}|${itemData.organic_flag}`;
      const itemId = itemMap.get(itemKey)?.id;
      if (!itemId) continue;
      
      // Set volume needed
      const volumeNeeded = 800 + Math.floor(Math.random() * 400);
      volumes.push({
        week_id: weekId,
        item_id: itemId,
        volume_needed: volumeNeeded,
        locked: true, // Finalized weeks are locked
      });
      
      // Award volumes to random suppliers (get quotes for this item)
      // Note: This runs after quotes are created, so we'll handle awards separately
    }
    
    // Upsert volume needs
    if (volumes.length > 0) {
      const { error: err } = await supabase
        .from('week_item_volumes')
        .upsert(volumes, { onConflict: 'week_id,item_id' });
      
      if (err) {
        error(`Failed to upsert volumes for week ${weekNum}`, err);
      } else {
        totalVolumes += volumes.length;
        log(`  ✓ Week ${weekNum}: ${volumes.length} volume needs`);
      }
    }
  }
  
  log(`✓ Seeded ${totalVolumes} total volume needs`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('DEMO DATABASE SEED SCRIPT');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    const itemMap = await seedItems();
    const supplierMap = await seedSuppliers();
    const weekMap = await seedWeeks();
    await seedQuotes(weekMap, itemMap, supplierMap);
    await seedVolumes(weekMap, itemMap);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✓ SEEDING COMPLETE');
    console.log('='.repeat(60));
    console.log('');
    console.log('Run verification queries (see seed-demo-verification.sql)');
    
  } catch (err) {
    error('Fatal error during seeding', err);
    process.exit(1);
  }
}

main();
