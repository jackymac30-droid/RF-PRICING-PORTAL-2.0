/**
 * DEMO VERIFICATION SCRIPT
 * 
 * Standalone verification script to check demo data integrity.
 * Run after seed-demo-complete.ts or independently.
 * 
 * Usage: npx tsx scripts/verify-demo.ts
 */

import { createClient } from '@supabase/supabase-js';

// Load env vars - dotenv is optional
try {
  require('dotenv').config();
} catch {
  // dotenv not installed, use process.env directly
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ ERROR: Missing Supabase credentials\n');
  console.error('Required: SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ITEMS_COUNT = 8;
const SUPPLIERS_COUNT = 5;
const WEEKS_COUNT = 8;
const BERRY_FARMS_EMAIL = 'contact@berryfarms.com';

async function verify() {
  console.log('\n' + '='.repeat(60));
  console.log('DEMO DATA VERIFICATION');
  console.log('='.repeat(60));
  console.log('');
  
  let allChecksPass = true;
  
  try {
    // 1. Items count (should be 8)
    const { data: items, count: itemCount, error: itemError } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: false });
    
    if (itemError) {
      console.error('❌ Failed to verify items:', itemError);
      allChecksPass = false;
    } else {
      const itemCheck = itemCount === ITEMS_COUNT;
      console.log(`${itemCheck ? '✅' : '❌'} Items: ${itemCount || 0} (expected: ${ITEMS_COUNT})`);
      if (!itemCheck) allChecksPass = false;
      
      if (items && items.length > 0) {
        console.log('  Item Details:');
        items.forEach((item: any) => {
          console.log(`    - ${item.name} ${item.pack_size} (${item.organic_flag}) [${item.category}]`);
        });
      }
    }
    
    // 2. Suppliers count (should be 5, including Berry Farms)
    const { data: suppliers, count: supplierCount, error: supplierError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: false });
    
    if (supplierError) {
      console.error('❌ Failed to verify suppliers:', supplierError);
      allChecksPass = false;
    } else {
      const hasBerryFarms = suppliers?.some((s: any) => s.email === BERRY_FARMS_EMAIL) || false;
      const supplierCheck = supplierCount === SUPPLIERS_COUNT && hasBerryFarms;
      console.log(`${supplierCheck ? '✅' : '❌'} Suppliers: ${supplierCount || 0} (expected: ${SUPPLIERS_COUNT}, Berry Farms: ${hasBerryFarms ? 'YES' : 'NO'})`);
      if (!supplierCheck) allChecksPass = false;
      
      if (suppliers && suppliers.length > 0) {
        console.log('  Supplier Details:');
        suppliers.forEach((s: any) => {
          const isBerryFarms = s.email === BERRY_FARMS_EMAIL;
          console.log(`    - ${s.name}${isBerryFarms ? ' ⭐ (Berry Farms)' : ''}`);
        });
      }
    }
    
    // 3. Weeks count and status
    const { data: weeks, count: weekCount, error: weekError } = await supabase
      .from('weeks')
      .select('id, week_number, status, allocation_submitted, start_date, end_date', { count: 'exact', head: false })
      .order('week_number');
    
    if (weekError) {
      console.error('❌ Failed to verify weeks:', weekError);
      allChecksPass = false;
    } else {
      const finalizedWeeks = weeks?.filter((w: any) => w.week_number <= 7 && w.status === 'finalized' && w.allocation_submitted === true) || [];
      const openWeek = weeks?.find((w: any) => w.week_number === 8 && w.status === 'open' && w.allocation_submitted === false);
      const weekCheck = weekCount === WEEKS_COUNT && finalizedWeeks.length === 7 && !!openWeek;
      console.log(`${weekCheck ? '✅' : '❌'} Weeks: ${weekCount || 0} (expected: ${WEEKS_COUNT}, finalized: ${finalizedWeeks.length}/7, open: ${openWeek ? 'YES' : 'NO'})`);
      if (!weekCheck) allChecksPass = false;
      
      if (weeks && weeks.length > 0) {
        console.log('  Week Status:');
        weeks.forEach((w: any) => {
          console.log(`    Week ${w.week_number}: ${w.status} (allocation_submitted: ${w.allocation_submitted}, ${w.start_date} to ${w.end_date})`);
        });
      }
    }
    
    // 4. Quotes count per week
    const { count: quoteCount, error: quoteError } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true });
    
    if (quoteError) {
      console.error('❌ Failed to verify quotes:', quoteError);
      allChecksPass = false;
    } else {
      console.log(`✅ Quotes: ${quoteCount || 0} total`);
      
      if (weeks) {
        console.log('  Quotes per Week:');
        for (const week of weeks) {
          const { count: weekQuoteCount } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true })
            .eq('week_id', week.id);
          
          const expected = week.week_number === 8 ? (ITEMS_COUNT * (SUPPLIERS_COUNT - 1)) : (ITEMS_COUNT * SUPPLIERS_COUNT);
          const status = week.week_number === 8 ? '(Berry Farms excluded)' : '';
          console.log(`    Week ${week.week_number}: ${weekQuoteCount || 0} quotes (expected: ~${expected}) ${status}`);
        }
      }
    }
    
    // 5. Volumes (should only be on weeks 1-7)
    const { count: volumeCount, error: volumeError } = await supabase
      .from('week_item_volumes')
      .select('*', { count: 'exact', head: true });
    
    if (volumeError) {
      console.error('❌ Failed to verify volumes:', volumeError);
      allChecksPass = false;
    } else {
      const expectedVolumeCount = ITEMS_COUNT * 7; // 8 items × 7 weeks
      const volumeCheck = (volumeCount || 0) >= expectedVolumeCount;
      console.log(`${volumeCheck ? '✅' : '❌'} Volume Needs: ${volumeCount || 0} (expected: ${expectedVolumeCount})`);
      if (!volumeCheck) allChecksPass = false;
    }
    
    // 6. Awarded volumes
    const { count: awardedCount, error: awardedError } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .gt('awarded_volume', 0);
    
    if (awardedError) {
      console.error('❌ Failed to verify awarded volumes:', awardedError);
      allChecksPass = false;
    } else {
      const awardedCheck = (awardedCount || 0) > 0;
      console.log(`${awardedCheck ? '✅' : '❌'} Awarded Volumes: ${awardedCount || 0} (expected: >0)`);
      if (!awardedCheck) allChecksPass = false;
    }
    
    // 7. Week 8 has NO Berry Farms quotes (intentional gap)
    const week8Id = weeks?.find((w: any) => w.week_number === 8)?.id;
    if (week8Id) {
      const { data: berryFarms } = await supabase
        .from('suppliers')
        .select('id')
        .eq('email', BERRY_FARMS_EMAIL)
        .single();
      
      if (berryFarms) {
        const { count: week8BerryFarmsQuotes } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('week_id', week8Id)
          .eq('supplier_id', berryFarms.id);
        
        const berryFarmsCheck = (week8BerryFarmsQuotes || 0) === 0;
        console.log(`${berryFarmsCheck ? '✅' : '❌'} Week 8 Berry Farms Quotes: ${week8BerryFarmsQuotes || 0} (expected: 0 - CONFIRMED)`);
        if (!berryFarmsCheck) allChecksPass = false;
      }
    }
    
    // 8. Final summary
    console.log('');
    console.log('='.repeat(60));
    if (allChecksPass) {
      console.log('\x1b[1m\x1b[32m✅ ALL SYSTEMS GO — DEMO IS 100% READY\x1b[0m');
      console.log('='.repeat(60));
      console.log('');
      console.log('All verification checks passed. Demo is ready! 🚀\n');
    } else {
      console.log('❌ READY FOR DEMO: NO - Some checks failed');
      console.log('='.repeat(60));
      console.log('');
      console.log('Please review the errors above and re-run seed-demo-complete.ts.\n');
    }
    
    return allChecksPass;
    
  } catch (err) {
    console.error('❌ Verification failed with exception:', err);
    return false;
  }
}

verify().then(passed => process.exit(passed ? 0 : 1));

// FINAL DEMO READY — NETLIFY PUSH OK
