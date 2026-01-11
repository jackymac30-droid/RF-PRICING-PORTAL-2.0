/**
 * AWARD VOLUMES SCRIPT
 * 
 * Runs after seed-demo-database.ts to award volumes for weeks 1-7
 * This is separated because quotes need to exist first
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function awardVolumes() {
  console.log('Awarding volumes for weeks 1-7...');
  
  for (let weekNum = 1; weekNum <= 7; weekNum++) {
    // Get week
    const { data: week } = await supabase
      .from('weeks')
      .select('id')
      .eq('week_number', weekNum)
      .single();
    
    if (!week) continue;
    
    // Get all items
    const { data: items } = await supabase.from('items').select('id');
    if (!items) continue;
    
    for (const item of items) {
      // Get finalized quotes for this item
      const { data: quotes } = await supabase
        .from('quotes')
        .select('id, rf_final_fob')
        .eq('week_id', week.id)
        .eq('item_id', item.id)
        .not('rf_final_fob', 'is', null);
      
      if (!quotes || quotes.length === 0) continue;
      
      // Get volume needed
      const { data: volumeNeed } = await supabase
        .from('week_item_volumes')
        .select('volume_needed')
        .eq('week_id', week.id)
        .eq('item_id', item.id)
        .single();
      
      if (!volumeNeed) continue;
      
      const volumeNeeded = volumeNeed.volume_needed || 1000;
      const totalAwarded = Math.floor(volumeNeeded * (0.6 + Math.random() * 0.2));
      let remaining = totalAwarded;
      const shuffled = [...quotes].sort(() => Math.random() - 0.5);
      
      // Award to random suppliers
      for (const quote of shuffled) {
        if (remaining <= 0) break;
        const award = Math.max(50, Math.floor(remaining * (0.3 + Math.random() * 0.4)));
        await supabase
          .from('quotes')
          .update({ awarded_volume: award })
          .eq('id', quote.id);
        remaining -= award;
      }
    }
    
    console.log(`  ✓ Week ${weekNum}: Volumes awarded`);
  }
  
  console.log('✓ Volume awards complete');
}

awardVolumes().catch(console.error);
