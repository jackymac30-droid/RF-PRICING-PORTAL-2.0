import { supabase } from './supabase';
import { logger } from './logger';

/**
 * Reset to A-Z Workflow Scenario
 * Creates a complete test scenario ready to walk through the entire workflow:
 * 1. ✅ Suppliers exist
 * 2. ✅ All 8 SKUs exist (including strawberry 4×2 lb CONV)
 * 3. ✅ Week 1 (OPEN) with suppliers having submitted initial pricing
 * 4. ✅ Ready for RF to send counters, finalize, allocate volumes, etc.
 */
export async function resetWorkflowScenario(): Promise<{ success: boolean; message: string; weekId?: string }> {
  try {
    logger.debug('Resetting to A-Z workflow scenario...');

    // Step 1: Delete all existing data
    await supabase.from('quotes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('week_item_volumes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('item_pricing_calculations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('weeks').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Step 2: Ensure suppliers exist (create if they don't)
    const { data: existingSuppliers } = await supabase
      .from('suppliers')
      .select('id, name');

    let suppliers = existingSuppliers || [];
    
    // If no suppliers exist, create default ones
    if (suppliers.length === 0) {
      const defaultSuppliers = [
        { name: 'Fresh Farms Inc' },
        { name: 'Berry Best Co' },
        { name: 'Organic Growers' },
        { name: 'Valley Fresh' },
        { name: 'Premium Produce' }
      ];

      const { data: newSuppliers, error: createError } = await supabase
        .from('suppliers')
        .insert(defaultSuppliers)
        .select();

      if (createError) {
        logger.error('Failed to create suppliers:', createError);
        return { success: false, message: `Failed to create suppliers: ${createError.message}` };
      }

      suppliers = newSuppliers || [];
      logger.debug(`Created ${suppliers.length} suppliers`);
    }

    if (suppliers.length === 0) {
      return { success: false, message: 'No suppliers found and could not create default suppliers' };
    }

    // Step 3: Ensure all 8 standard items exist
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
        .or(`organic_flag.is.null,organic_flag.eq.${itemData.organic_flag}`)
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

    // Step 4: Create Week 1 - OPEN status
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // This Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday

    const { data: week1, error: week1Error } = await supabase
      .from('weeks')
      .insert({
        week_number: 1,
        start_date: weekStart.toISOString().split('T')[0],
        end_date: weekEnd.toISOString().split('T')[0],
        status: 'open',
        allocation_submitted: false,
        finalized_at: null,
        finalized_by: null
      })
      .select()
      .single();

    if (week1Error || !week1) {
      logger.error('Failed to create week 1:', week1Error);
      return { success: false, message: `Failed to create week: ${week1Error?.message || 'Unknown error'}` };
    }

    // Step 5: Create volume needs for all items
    for (const item of items) {
      const volumeNeeded = 800 + Math.floor(Math.random() * 400); // 800-1200 cases
      
      await supabase
        .from('week_item_volumes')
        .upsert({
          week_id: week1.id,
          item_id: item.id,
          volume_needed,
          locked: false
        }, {
          onConflict: 'week_id,item_id'
        });
    }

    // Step 6: Create quotes for all supplier × item combinations WITH initial pricing
    // This simulates suppliers having already submitted pricing so you can test the workflow
    const basePrices: Record<string, { conv: number; org: number }> = {
      'Strawberry': { conv: 10.50, org: 11.50 },
      'Blueberry': { conv: 8.50, org: 9.75 },
      'Blackberry': { conv: 10.25, org: 11.50 },
      'Raspberry': { conv: 11.00, org: 12.25 }
    };

    for (const item of items) {
      const itemName = item.name;
      const isORG = item.organic_flag === 'ORG';
      const basePrice = basePrices[itemName]?.[isORG ? 'org' : 'conv'] || 10.00;

      for (const supplier of suppliers) {
        // Each supplier submits slightly different pricing
        const supplierFOB = basePrice + (Math.random() * 0.80 - 0.40); // ±$0.40 variation
        const supplierDLVD = supplierFOB + 2.00 + (Math.random() * 0.50 - 0.25); // DLVD is FOB + freight

        await supabase
          .from('quotes')
          .insert({
            week_id: week1.id,
            item_id: item.id,
            supplier_id: supplier.id,
            supplier_fob: Math.round(supplierFOB * 100) / 100,
            supplier_dlvd: Math.round(supplierDLVD * 100) / 100,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    }

    logger.debug(`✅ Created A-Z Workflow Scenario`);
    logger.debug(`   - Week 1 (OPEN)`);
    logger.debug(`   - ${items.length} items`);
    logger.debug(`   - ${suppliers.length} suppliers`);
    logger.debug(`   - ${items.length * suppliers.length} quotes with initial pricing submitted`);
    logger.debug(`   - Volume needs set for all SKUs`);
    logger.debug(`   - Ready to test: RF counters → supplier responses → finalize → allocate → send → accept → close`);
    
    return { 
      success: true, 
      message: `A-Z Workflow Scenario ready! Week 1 has ${suppliers.length} suppliers with pricing submitted for ${items.length} SKUs. Ready to test RF counters, finalization, volume allocation, and supplier responses.`,
      weekId: week1.id
    };
  } catch (error: any) {
    logger.error('Error resetting workflow scenario:', error);
    return { success: false, message: error?.message || 'Unknown error' };
  }
}
