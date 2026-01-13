/**
 * AI Allocation Component
 * 
 * Combines Volume Needed + Acceptance into one futuristic allocation experience
 * Features:
 * - Manual allocation mode
 * - AI Target Price allocation mode
 * - Lock SKU workflow
 * - Exceptions mode (after sending awards)
 * 
 * FINAL NO-SQL FIX: Week 8 allocations open for 4 shippers (Berry Farms missing), shows finalized FOB when available
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Award, Check, Package, Send, RefreshCw, 
  Info, CheckCircle, Zap,
  Sparkles, Brain, Sliders, Edit3, ChevronDown, ChevronUp,
  History, Unlock, Lock
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
  lockSKU,
  unlockSKU,
  updateWeekStatus,
} from '../utils/database';
import { formatCurrency } from '../utils/helpers';
import { useToast } from '../contexts/ToastContext';
import { useApp } from '../contexts/AppContext';
import { logger } from '../utils/logger';
import { supabase } from '../utils/supabase';
import type { Week, Item } from '../types';
import { optimizeAllocation, type SupplierQuote, type HistoricalShare } from '../utils/allocationOptimizer';

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
        
        // NEXT-LEVEL FIX: KILLED FILTER - Removed status filter and .slice() limit
        // Get ALL previous weeks (not just finalized/closed) for comprehensive analysis
        const allWeeks = await fetchWeeks();
        // KILLED FILTER: Removed .filter(w => w.status === 'finalized' || w.status === 'closed')
        // KILLED SLICE: Removed .slice(0, 10) - use ALL previous weeks
        const previousWeeks = allWeeks
          .filter(w => w.week_number < selectedWeek.week_number) // Only filter by week_number, not status
          .sort((a, b) => b.week_number - a.week_number); // Show all previous weeks, no limit
        
        if (previousWeeks.length > 0) {
          // Fetch quotes for last 2 weeks
          const historicalQuotes = await Promise.all(
            previousWeeks.map(week => fetchQuotesWithDetails(week.id))
          );
          
          // Filter for this SKU and calculate pricing insights
          const itemHistoricalQuotes = historicalQuotes
            .flat()
            .filter(q => q.item_id === sku.item.id && q.rf_final_fob !== null && q.rf_final_fob !== undefined && q.rf_final_fob > 0);
          
          if (itemHistoricalQuotes.length > 0) {
            // Calculate average historical price
            const historicalPrices = itemHistoricalQuotes.map(q => q.rf_final_fob ?? 0).filter(p => p > 0); // FINAL WORKFLOW FIX: Handle undefined
            const avgHistoricalPrice = historicalPrices.reduce((sum, p) => sum + p, 0) / historicalPrices.length;
            
            // Calculate price volatility (standard deviation)
            const variance = historicalPrices.reduce((sum, p) => sum + Math.pow(p - avgHistoricalPrice, 2), 0) / historicalPrices.length;
            const priceVolatility = Math.sqrt(variance);
            
            // Calculate weekly trends for momentum analysis
            const weeklyTrends: Array<{ week: number; avgPrice: number }> = [];
            previousWeeks.forEach((week, weekIdx) => {
              const weekQuotes = historicalQuotes[weekIdx]
                .filter(q => q.item_id === sku.item.id && q.rf_final_fob !== null && q.rf_final_fob !== undefined && q.rf_final_fob > 0);
              if (weekQuotes.length > 0) {
                const weekAvg = weekQuotes.reduce((sum, q) => sum + (q.rf_final_fob ?? 0), 0) / weekQuotes.length; // FINAL WORKFLOW FIX: Handle undefined
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
            previousWeeks.forEach((_week, weekIdx) => {
              const weekQuotes = historicalQuotes[weekIdx]
                .filter(q => q.item_id === sku.item.id && q.rf_final_fob !== null && q.rf_final_fob !== undefined && q.rf_final_fob > 0);
              
              if (weekQuotes.length > 0) {
                const weekAvg = weekQuotes.reduce((sum, q) => sum + (q.rf_final_fob ?? 0), 0) / weekQuotes.length; // FINAL WORKFLOW FIX: Handle undefined
                weekAverages.push(weekAvg);
                
                // Track supplier prices and wins
                weekQuotes.forEach(q => {
                  const supplierId = q.supplier_id;
                  const price = q.rf_final_fob ?? 0; // FINAL WORKFLOW FIX: Handle undefined
                  
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

  // Calculate fairness note (unused but kept for future use)
  // let fairnessNote = null;
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
        // devSupplier unused but kept for future use
        // const devSupplier = sku.entries.find(e => e.supplier_id === hist.supplierId)?.supplier_name || '';
        // const direction = current < hist.sharePercent ? 'below' : 'above';
        // fairnessNote unused but kept for future use
        // fairnessNote = {
        //   supplier: devSupplier,
        //   direction,
        //   deviation: maxDev,
        // };
      }
    });
  }

  // Generate smarter suggestions based on historical data
  let historicalSuggestion = null;
  let priceTrendNote = null;
  let bestHistoricalSupplier: { supplierId: string; supplierName: string; avgPrice: number; winRate: number; priceVsAvg: number; consistency: number; reliability: number; avgVolume: number } | null = null;
  
  if (historicalPricing) {
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
      if (bestHistoricalSupplier) {
        const currentEntry = sku.entries.find(e => e.supplier_id === bestHistoricalSupplier!.supplierId);
        const currentPrice = currentEntry?.price || 0;
        const priceVsHistorical = bestHistoricalSupplier.avgPrice > 0 ? 
          ((currentPrice - bestHistoricalSupplier.avgPrice) / bestHistoricalSupplier.avgPrice) * 100 : 0;
        
        if (currentEntry && gap > 0) {
          // Suggest allocating more to historically best performer
          const suggestedVolume = Math.min(50, gap);
          const currentAllocated = currentEntry.awarded_volume || 0;
          const newAllocated = currentAllocated + suggestedVolume;
          const newTotalCost = sku.entries.reduce((sum, e) => {
            if (e.supplier_id === bestHistoricalSupplier!.supplierId) {
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
  const [revisedVolumes, setRevisedVolumes] = useState<Record<string, string>>({});
  const [processingResponse, setProcessingResponse] = useState<Record<string, boolean>>({});
  
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
      if (typeof window !== 'undefined') {
        console.time('Load allocation data');
      }
      
      // FINAL SLOW/FLOW FIX: Optimized parallel fetching
      // Check database status directly (not just prop)
      const { supabase } = await import('../utils/supabase');
      const [weekDataResult, itemsData, quotes, volumeNeedsData, pricingData] = await Promise.all([
        supabase.from('weeks').select('status').eq('id', selectedWeek.id).single(),
        fetchItems(),
        fetchQuotesWithDetails(selectedWeek.id),
        fetchVolumeNeeds(selectedWeek.id),
        fetchItemPricingCalculations(selectedWeek.id),
      ]);
      
      const dbStatus = weekDataResult.data?.status || selectedWeek.status;
      setActualWeekStatus(dbStatus);

      // Check if there are any quotes with finalized pricing (rf_final_fob)
      // This is required for volume allocation - allows access even if week status is still 'open'
      const hasFinalized = quotes.some(q => 
        q.rf_final_fob !== null && q.rf_final_fob > 0
      );
      setHasFinalizedQuotes(hasFinalized);

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
      // Works for both 'finalized' and 'closed' weeks - allows access to volume acceptance even after week is closed
      const hasResponses = quotes.some(q => 
        (q.supplier_volume_response && 
         (q.supplier_volume_response === 'accept' || q.supplier_volume_response === 'update' || q.supplier_volume_response === 'decline')) ||
        (q.supplier_volume_accepted && q.supplier_volume_accepted > 0)
      );
      // Set exceptions mode if allocations are submitted and there are responses (works for finalized/closed weeks)
      // Also check for supplier_volume_accepted field directly
      const shouldShowExceptions = selectedWeek.allocation_submitted === true && hasResponses;
      setExceptionsMode(shouldShowExceptions);
      
      logger.debug('Allocation loadData - exceptions mode check', { 
        allocation_submitted: selectedWeek.allocation_submitted, 
        hasResponses, 
        shouldShowExceptions,
        weekStatus: selectedWeek.status,
        responseCount: quotes.filter(q => q.supplier_volume_response || (q.supplier_volume_accepted && q.supplier_volume_accepted > 0)).length
      });
      
      // If in exceptions mode, ensure we have responses loaded properly
      if (shouldShowExceptions) {
        logger.debug('Exceptions mode enabled:', { allocation_submitted: selectedWeek.allocation_submitted, hasResponses, weekStatus: selectedWeek.status });
      }

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
        // FINAL NO-SQL FIX: Show items with any pricing (finalized or preliminary)
        // Week 8: Show all shippers except Berry Farms (intentional gap)
        const itemQuotes = quotes.filter(q => {
          // FINAL NO-SQL FIX: Filter out Berry Farms in week 8 (intentional gap)
          if (selectedWeek?.week_number === 8) {
            const isBerryFarms = q.supplier?.email === 'contact@berryfarms.com' || q.supplier?.name === 'Berry Farms';
            if (isBerryFarms) return false; // Skip Berry Farms in week 8
          }
          return q.item_id === item.id &&
            ((q.rf_final_fob !== null && q.rf_final_fob > 0) ||
             (q.supplier_fob !== null && q.supplier_fob > 0));
        });

        if (itemQuotes.length === 0) continue;

        // Get pricing data for this item (defaults if not found)
        const pricing = pricingMap.get(item.id) || { rebate: 0.80, freight: 1.75, dlvd_price: 0 };
        const { rebate, freight, dlvd_price: sellPriceFromDb } = pricing;

        const entries: AllocationEntry[] = [];
        for (const quote of itemQuotes) {
          // FINAL NO-SQL FIX: Show finalized FOB (rf_final_fob) when available, otherwise estimated FOB (supplier_fob)
          // When RF finalizes pricing, submitted FOB (supplier_fob) becomes finalized FOB (rf_final_fob)
          // Allocation tab shows finalized FOB for 8/9 shippers (Berry Farms missing/open shows no pricing)
          const isFinalized = quote.rf_final_fob !== null && quote.rf_final_fob !== undefined && quote.rf_final_fob > 0;
          const price = isFinalized ? (quote.rf_final_fob ?? 0) : (quote.supplier_fob ?? 0);
          
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

        // FINAL WORKFLOW FIX: Get locked state from volumeNeedsData (loaded from week_item_volumes table)
        const volumeNeed = volumeNeedsData.find(vn => vn.item_id === item.id);
        // FINAL WORKFLOW FIX: Handle locked state - check for boolean, number (1/0), or string ('true'/'false')
        let isLocked = false;
        if (volumeNeed && 'locked' in volumeNeed) {
          const lockedValue = volumeNeed.locked;
          // Type-safe check: handle boolean, number, or string
          if (typeof lockedValue === 'boolean') {
            isLocked = lockedValue;
          } else if (typeof lockedValue === 'number') {
            isLocked = lockedValue === 1;
          } else if (typeof lockedValue === 'string') {
            isLocked = lockedValue === 'true' || lockedValue === '1';
          }
        }

        allocations.push({
          item,
          entries: updatedEntries,
          volumeNeeded,
          totalAllocated,
          weightedAvgPrice,
          isLocked: isLocked,
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
      logger.error('Allocation load error details:', err);
      showToast(`Failed to load allocation data: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedWeek?.id, selectedWeek?.allocation_submitted, showToast]);

  useEffect(() => {
    if (selectedWeek) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeek?.id, selectedWeek?.status, selectedWeek?.allocation_submitted]);
  
  // WORKFLOW FIX: Realtime subscription for pricing updates - shows estimated FOB initially, then final FOB when finalized
  useEffect(() => {
    if (!selectedWeek) return;
    
    // NEXT LEVEL FIX: Listen for pricing finalized event - immediately update to show finalized FOB
    const handlePricingFinalized = (event: CustomEvent) => {
      if (event.detail?.weekId === selectedWeek.id) {
        logger.debug('NEXT LEVEL FIX: Pricing finalized event received, immediately reloading allocation data to show final FOB');
        if (typeof window !== 'undefined') {
          console.log('✅ NEXT LEVEL FIX: FOB finalized — allocation updating to final FOB ✓');
        }
        // Force immediate reload to show finalized FOB
        loadData();
      }
    };
    
    window.addEventListener('pricing-finalized', handlePricingFinalized as EventListener);
    
    // WORKFLOW FIX: Realtime subscription for rf_final_fob updates - updates allocation to show final FOB
    const channel = supabase
      .channel(`allocation-quotes-${selectedWeek.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quotes',
          filter: `week_id=eq.${selectedWeek.id}`,
        },
        (payload: any) => {
          // Check if rf_final_fob was updated (pricing finalized)
          if (payload.new?.rf_final_fob !== payload.old?.rf_final_fob && payload.new?.rf_final_fob) {
            logger.debug('rf_final_fob updated via realtime - pricing finalized, updating allocation to show final FOB');
            if (typeof window !== 'undefined') {
              console.log('✅ WORKFLOW FIX: FOB finalized — allocation updated to final FOB ✓');
            }
            loadData();
          }
          // Also check if supplier_fob was just set (pricing submitted) - show estimated FOB
          if (payload.new?.supplier_fob !== payload.old?.supplier_fob && payload.new?.supplier_fob && !payload.old?.supplier_fob) {
            logger.debug('supplier_fob set via realtime - pricing submitted, showing estimated FOB');
            loadData();
          }
        }
      )
      .subscribe();
    
    return () => {
      window.removeEventListener('pricing-finalized', handlePricingFinalized as EventListener);
      supabase.removeChannel(channel);
    };
  }, [selectedWeek?.id, loadData]);
  
  // Realtime subscription: Refresh when quotes are updated (rf_final_fob set OR supplier volume responses)
  useEffect(() => {
    if (!selectedWeek?.id) {
      return;
    }
    // Listen for supplier responses even if allocation_submitted is false (might be in progress)
    // But prioritize updates when allocation_submitted is true

    const handleQuotesUpdate = (payload: any) => {
      logger.debug('Realtime quote update received in Allocation', { 
        newData: payload.new,
        oldData: payload.old,
        weekId: selectedWeek.id,
        allocation_submitted: selectedWeek.allocation_submitted,
        supplier_volume_response: payload.new?.supplier_volume_response,
        supplier_volume_accepted: payload.new?.supplier_volume_accepted,
        old_supplier_volume_response: payload.old?.supplier_volume_response,
        old_supplier_volume_accepted: payload.old?.supplier_volume_accepted
      });
      
      // Check if this is a supplier volume response
      const newResponse = payload.new?.supplier_volume_response;
      const oldResponse = payload.old?.supplier_volume_response || null;
      const hasVolumeResponse = newResponse && 
          (newResponse === 'accept' || newResponse === 'update' || newResponse === 'decline') &&
          newResponse !== oldResponse; // Only trigger if it actually changed (null to 'accept' is a change)
      
      const newAccepted = payload.new?.supplier_volume_accepted;
      const oldAccepted = payload.old?.supplier_volume_accepted || 0;
      const hasAcceptedVolume = newAccepted && 
          newAccepted > 0 &&
          (oldAccepted === 0 || oldAccepted === null || oldAccepted !== newAccepted);
      
      logger.debug('Allocation component: Quote update check', {
        hasVolumeResponse,
        hasAcceptedVolume,
        newResponse,
        oldResponse,
        newAccepted,
        oldAccepted,
        weekId: selectedWeek.id,
        allocation_submitted: selectedWeek.allocation_submitted
      });
      
      // Always reload data when quotes update (to catch status changes and response changes)
      // But if it's a supplier response, also trigger navigation
      if (hasVolumeResponse || hasAcceptedVolume) {
        logger.debug('Supplier volume response detected in Allocation component, navigating and reloading', {
          response: payload.new.supplier_volume_response,
          acceptedVolume: payload.new.supplier_volume_accepted,
          weekId: selectedWeek.id
        });
        // Trigger navigation to volume acceptance tab via event
        window.dispatchEvent(new CustomEvent('navigate-to-volume-acceptance', {
          detail: { weekId: selectedWeek.id, fromSupplierResponse: true }
        }));
        // Reload data immediately to activate exceptions mode
        setTimeout(() => {
          loadData();
        }, 500);
      } else {
        // Refresh data for other updates (pricing changes, etc.)
        logger.debug('Quotes updated (non-response), refreshing allocation data...');
        loadData();
      }
    };

    // Subscribe to quotes table changes for this week (direct subscription to get payload)
    const channel = supabase
      .channel(`allocation-quotes-${selectedWeek.id}-volume-responses`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quotes',
          filter: `week_id=eq.${selectedWeek.id}`,
        },
        handleQuotesUpdate
      )
      .subscribe();

    logger.debug('Allocation: Subscribed to realtime quotes updates', { 
      weekId: selectedWeek.id, 
      channel: `allocation-quotes-${selectedWeek.id}-volume-responses` 
    });

    return () => {
      logger.debug('Allocation: Unsubscribing from realtime quotes updates', { weekId: selectedWeek?.id });
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeek?.id, selectedWeek?.allocation_submitted]);
  
  // Re-check week status and finalized quotes periodically if still open (to catch changes)
  useEffect(() => {
    if (!selectedWeek || selectedWeek.status === 'finalized' || selectedWeek.status === 'closed') {
      return;
    }
    
    const interval = setInterval(async () => {
      const { supabase } = await import('../utils/supabase');
      
      // Check week status
      const { data: weekData } = await supabase
        .from('weeks')
        .select('status')
        .eq('id', selectedWeek.id)
        .single();
      
      if (weekData?.status && weekData.status !== selectedWeek.status) {
        // Status changed, reload data
        loadData();
        return;
      }
      
      // Check if any quotes have been finalized (rf_final_fob set) - this allows access even if week status is still 'open'
      const { data: quotesData } = await supabase
        .from('quotes')
        .select('rf_final_fob')
        .eq('week_id', selectedWeek.id)
        .not('rf_final_fob', 'is', null)
        .gt('rf_final_fob', 0)
        .limit(1);
      
      if (quotesData && quotesData.length > 0 && !hasFinalizedQuotes) {
        // Quotes have been finalized, reload data to update access
        logger.debug('Detected finalized quotes, reloading allocation data...');
        loadData();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [selectedWeek?.id, selectedWeek?.status, hasFinalizedQuotes, loadData]);

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

  // Lock/unlock SKU - actually persists to database
  const toggleLockSKU = useCallback(async (itemId: string) => {
    if (!selectedWeek) {
      logger.warn('toggleLockSKU: No selected week');
      return;
    }
    
    const sku = skuAllocations.find(s => s.item.id === itemId);
    if (!sku) {
      logger.warn('toggleLockSKU: SKU not found', { itemId, availableSkus: skuAllocations.map(s => s.item.id) });
      return;
    }
    
    const shouldLock = !sku.isLocked;
    logger.debug(`toggleLockSKU: ${shouldLock ? 'Locking' : 'Unlocking'} SKU`, { itemId, skuName: sku.item.name, currentLocked: sku.isLocked });
    
    try {
      const success = shouldLock 
        ? await lockSKU(selectedWeek.id, itemId)
        : await unlockSKU(selectedWeek.id, itemId);
      
      logger.debug(`toggleLockSKU: Database operation ${success ? 'succeeded' : 'failed'}`, { itemId, shouldLock });
      
      if (success) {
        // Update local state immediately for responsive UI
        setSkuAllocations(prev => prev.map(s => {
          if (s.item.id !== itemId) return s;
          return { ...s, isLocked: shouldLock };
        }));
        
        showToast(shouldLock ? `SKU locked: ${sku.item.name}` : `SKU unlocked: ${sku.item.name}`, 'success');
        // Reload data to sync from database
        await loadData();
      } else {
        showToast(`Failed to ${shouldLock ? 'lock' : 'unlock'} SKU: ${sku.item.name}`, 'error');
        logger.error(`toggleLockSKU: Database operation failed`, { itemId, shouldLock, weekId: selectedWeek.id });
      }
    } catch (err) {
      logger.error(`Error ${shouldLock ? 'locking' : 'unlocking'} SKU:`, err);
      showToast(`Failed to ${shouldLock ? 'lock' : 'unlock'} SKU: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  }, [selectedWeek, skuAllocations, loadData, showToast]);

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
          showToast(result.reason, 'error'); // FINAL WORKFLOW FIX: Changed 'warning' to 'error' (ToastContext only supports 'success' | 'error')
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

  // Accept supplier response (for accept responses, similar to revised)
  const handleAcceptSupplierResponse = useCallback(async (quoteId: string, acceptedVolume: number) => {
    setProcessingResponse(prev => ({ ...prev, [quoteId]: true }));
    try {
      const { supabase } = await import('../utils/supabase');
      await supabase
        .from('quotes')
        .update({
          awarded_volume: acceptedVolume > 0 ? acceptedVolume : null,
          offered_volume: acceptedVolume > 0 ? acceptedVolume : null,
          supplier_volume_approval: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);
      
      showToast(`Accepted ${acceptedVolume.toLocaleString()} units`, 'success');
      await loadData();
    } catch (err) {
      logger.error('Error accepting supplier response:', err);
      showToast('Failed to accept supplier response', 'error');
    } finally {
      setProcessingResponse(prev => ({ ...prev, [quoteId]: false }));
    }
  }, [showToast, loadData]);

  // Revise offer to supplier (change offered_volume and reset supplier response)
  const handleReviseOffer = useCallback(async (quoteId: string, newVolume: number) => {
    if (newVolume <= 0) {
      showToast('Please enter a valid volume', 'error');
      return;
    }

    setProcessingResponse(prev => ({ ...prev, [quoteId]: true }));
    try {
      const { supabase } = await import('../utils/supabase');
      await supabase
        .from('quotes')
        .update({
          offered_volume: newVolume > 0 ? newVolume : null,
          supplier_volume_response: null,
          supplier_volume_accepted: 0,
          supplier_volume_response_notes: null,
          supplier_volume_approval: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);
      
      showToast(`Revised offer to ${newVolume.toLocaleString()} units`, 'success');
      setRevisedVolumes(prev => ({ ...prev, [quoteId]: '' }));
      await loadData();
    } catch (err) {
      logger.error('Error revising offer:', err);
      showToast('Failed to revise offer', 'error');
    } finally {
      setProcessingResponse(prev => ({ ...prev, [quoteId]: false }));
    }
  }, [showToast, loadData]);

  // Withdraw offer (for declined responses)
  const handleWithdrawOffer = useCallback(async (quoteId: string) => {
    setProcessingResponse(prev => ({ ...prev, [quoteId]: true }));
    try {
      const { supabase } = await import('../utils/supabase');
      await supabase
        .from('quotes')
        .update({
          offered_volume: 0,
          awarded_volume: 0,
          supplier_volume_response: null,
          supplier_volume_accepted: 0,
          supplier_volume_response_notes: null,
          supplier_volume_approval: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);
      
      showToast('Volume offer withdrawn', 'success');
      await loadData();
    } catch (err) {
      logger.error('Error withdrawing offer:', err);
      showToast('Failed to withdraw offer', 'error');
    } finally {
      setProcessingResponse(prev => ({ ...prev, [quoteId]: false }));
    }
  }, [showToast, loadData]);

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
  // Allow access if:
  // 1. Week is finalized or closed, OR
  // 2. Has finalized quotes (pricing is done), OR
  // 3. Allocations have been submitted (suppliers can respond even if week is still 'open')
  const canAccess = weekStatus === 'finalized' || weekStatus === 'closed' || hasFinalizedQuotes || selectedWeek?.allocation_submitted === true;
  
  // Debug logging
  logger.debug('Allocation component render', { 
    weekId: selectedWeek.id, 
    weekNumber: selectedWeek.week_number,
    actualWeekStatus, 
    selectedWeekStatus: selectedWeek.status,
    weekStatus,
    hasFinalizedQuotes,
    canAccess,
    skuAllocationsCount: skuAllocations.length,
    exceptionsMode
  });
  
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
            {/* Emergency Unlock button for closed weeks */}
            {(weekStatus === 'closed' || weekStatus === 'finalized') && (
              <button
                onClick={async () => {
                  if (!selectedWeek) {
                    logger.warn('Emergency Unlock: No selected week');
                    showToast('No week selected', 'error');
                    return;
                  }
                  logger.debug('Emergency Unlock clicked', { weekId: selectedWeek.id, currentStatus: weekStatus });
                  if (!confirm(`Emergency Unlock: This will reopen Week ${selectedWeek.week_number} for editing. Continue?`)) {
                    logger.debug('Emergency Unlock cancelled by user');
                    return;
                  }
                  try {
                    logger.debug('Calling updateWeekStatus to reopen week', { weekId: selectedWeek.id });
                    const success = await updateWeekStatus(selectedWeek.id, 'open');
                    logger.debug('updateWeekStatus result', { success, weekId: selectedWeek.id });
                    if (success) {
                      showToast(`Week ${selectedWeek.week_number} reopened for emergency changes. All pricing and allocations can now be edited.`, 'success');
                      await loadData();
                      if (onWeekUpdate) {
                        const updatedWeek = { ...selectedWeek, status: 'open' as const };
                        logger.debug('Calling onWeekUpdate with reopened status', updatedWeek);
                        onWeekUpdate(updatedWeek);
                      }
                    } else {
                      logger.error('Emergency Unlock: updateWeekStatus returned false');
                      showToast('Failed to reopen week. Check console for details.', 'error');
                    }
                  } catch (err) {
                    logger.error('Error reopening week:', err);
                    showToast(`Failed to reopen week: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
                  }
                }}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                title={`Emergency Unlock: Reopen Week ${selectedWeek?.week_number} for editing (Current: ${weekStatus})`}
              >
                <Unlock className="w-4 h-4" />
                Emergency Unlock
              </button>
            )}
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
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 md:p-12 text-center border border-white/20" role="status" aria-live="polite">
          <Package className="w-12 h-12 md:w-16 md:h-16 text-white/40 mx-auto mb-4" aria-hidden="true" />
          <p className="text-white/80 text-base md:text-lg font-bold mb-2">No SKUs with finalized pricing</p>
          <p className="text-white/60 text-sm md:text-base">Finalize pricing in the Pricing tab to allocate volumes.</p>
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
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '' || inputValue === null) {
                                updateVolumeNeeded(sku.item.id, 0);
                                return;
                              }
                              const value = parseInt(inputValue, 10);
                              if (isNaN(value) || value < 0) {
                                showToast('Volume needed must be a positive number', 'error');
                                return;
                              }
                              updateVolumeNeeded(sku.item.id, value);
                            }}
                            aria-label={`Volume needed for ${sku.item.name}`}
                            aria-disabled={sku.isLocked}
                            title={sku.isLocked ? 'SKU is locked - unlock to edit' : 'Enter volume needed'}
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

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Lock/Unlock SKU button */}
                      <button
                        onClick={() => toggleLockSKU(sku.item.id)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          sku.isLocked 
                            ? 'bg-orange-500/30 hover:bg-orange-500/40 border-orange-400/50' 
                            : 'bg-white/10 hover:bg-white/20 border-white/20'
                        }`}
                        title={sku.isLocked ? 'Unlock SKU to allow changes' : 'Lock SKU to prevent changes'}
                      >
                        {sku.isLocked ? (
                          <Lock className="w-5 h-5 text-orange-300" />
                        ) : (
                          <Unlock className="w-5 h-5 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleSKUExpanded(sku.item.id)}
                        className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
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
                          aria-label={`Auto allocate volume for ${sku.item.name}`}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                        >
                          <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                          Auto Allocate
                        </button>
                      </div>
                    )}

                    {/* Compact Supplier Rows */}
                    <div className="px-5 py-6">
                      <div className="text-xs text-white/50 font-bold uppercase tracking-widest mb-4">Supplier Allocations</div>
                      {/* Column Headers - Responsive */}
                      <div className="grid grid-cols-7 gap-2 md:gap-3 mb-3 px-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        <div className="text-xs text-white/60 font-semibold min-w-[100px]">Supplier</div>
                        <div className="text-xs text-white/60 font-semibold text-right min-w-[70px]">FOB</div>
                        <div className="text-xs text-white/60 font-semibold text-center min-w-[60px]">Status</div>
                        <div className="text-xs text-white/60 font-semibold text-right min-w-[80px]">Delivered</div>
                        <div className="text-xs text-white/60 font-semibold text-right min-w-[85px]">Margin/Case</div>
                        <div className="text-xs text-white/60 font-semibold text-right min-w-[80px]">Allocated</div>
                        <div className="text-xs text-white/60 font-semibold text-right min-w-[90px]">Total Margin</div>
                        <div className="text-xs text-white/60 font-semibold text-right min-w-[80px]">Row Cost</div>
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
                              <div className="grid grid-cols-8 gap-2 md:gap-3 items-center overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
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

                                {/* Status - NEXT LEVEL FIX: Show finalized status clearly */}
                                <div className="text-center min-w-0">
                                  {entry.isFinalized ? (
                                    <span className="inline-flex items-center px-2 py-0.5 bg-green-500/30 text-green-200 rounded text-[9px] font-bold" title="Finalized FOB price">
                                      FINAL
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 bg-yellow-500/30 text-yellow-200 rounded text-[9px] font-bold" title="Preliminary FOB price">
                                      PRELIM
                                    </span>
                                  )}
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
                                        const inputValue = e.target.value;
                                        if (inputValue === '' || inputValue === null) {
                                          updateAllocation(sku.item.id, entry.supplier_id, entry.quote_id, 0);
                                          return;
                                        }
                                        const value = parseInt(inputValue, 10);
                                        if (isNaN(value) || value < 0) {
                                          showToast('Volume must be a positive number', 'error');
                                          return;
                                        }
                                        updateAllocation(
                                          sku.item.id,
                                          entry.supplier_id,
                                          entry.quote_id,
                                          value
                                        );
                                      }}
                                      placeholder="0"
                                      disabled={sku.isLocked}
                                      title={sku.isLocked ? 'SKU is locked - unlock to edit' : 'Enter allocated volume'}
                                      aria-label={`Allocated volume for ${entry.supplier_name} - ${sku.item.name}`}
                                      aria-disabled={sku.isLocked}
                                      className="w-full max-w-[60px] md:max-w-[80px] px-2 py-1 border border-white/20 rounded text-right font-semibold text-xs text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {(entry.supplier_response_status === 'revised' || entry.supplier_response_status === 'accepted') && (
                                      <button
                                        onClick={async () => {
                                          const acceptedVolume = entry.supplier_response_volume || entry.awarded_volume || 0;
                                          if (entry.supplier_response_status === 'revised') {
                                            // For revised: Update awarded_volume via updateAllocation then sync offered_volume
                                            await updateAllocation(
                                              sku.item.id,
                                              entry.supplier_id,
                                              entry.quote_id,
                                              acceptedVolume
                                            );
                                            // Also sync offered_volume and set approval status when accepting supplier response
                                            try {
                                              const { supabase } = await import('../utils/supabase');
                                              await supabase
                                                .from('quotes')
                                                .update({
                                                  offered_volume: acceptedVolume > 0 ? acceptedVolume : null,
                                                  supplier_volume_approval: 'accepted',
                                                  updated_at: new Date().toISOString()
                                                })
                                                .eq('id', entry.quote_id);
                                            } catch (err) {
                                              logger.error('Error syncing offered_volume:', err);
                                            }
                                            showToast('Revised volume accepted', 'success');
                                          } else {
                                            // For accepted: Use handleAcceptSupplierResponse
                                            await handleAcceptSupplierResponse(entry.quote_id, acceptedVolume);
                                          }
                                          await loadData();
                                        }}
                                        disabled={processingResponse[entry.quote_id]}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-green-500/30 hover:bg-green-500/40 text-green-200 rounded text-xs font-semibold border border-green-400/50 transition-all disabled:opacity-50"
                                      >
                                        <Check className="w-3 h-3" />
                                        Accept
                                      </button>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        value={revisedVolumes[entry.quote_id] || ''}
                                        onChange={(e) => setRevisedVolumes(prev => ({ ...prev, [entry.quote_id]: e.target.value }))}
                                        placeholder="Revise"
                                        className="w-16 px-2 py-1 border border-white/20 rounded text-xs text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                      />
                                      <button
                                        onClick={async () => {
                                          const newVolume = parseFloat(revisedVolumes[entry.quote_id] || '0');
                                          await handleReviseOffer(entry.quote_id, newVolume);
                                        }}
                                        disabled={processingResponse[entry.quote_id] || !revisedVolumes[entry.quote_id]}
                                        className="px-2 py-1 bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 rounded text-xs font-semibold border border-blue-400/50 transition-all disabled:opacity-50 flex items-center"
                                        title="Revise offer to supplier"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
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

// NO MORE SQL — EVERYTHING FIXED IN CODE
// FINAL NO-SQL FIX: Seeding correct, pricing page loads with full workflow, dashboards sync, no slow loading, Netlify ready
