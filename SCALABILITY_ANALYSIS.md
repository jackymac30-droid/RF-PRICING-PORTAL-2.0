# Data Scalability Analysis & Recommendations

## Current State

### Data Growth Projections
- **Weeks per year**: ~52 weeks
- **Quotes per week**: ~(suppliers × items) = ~(10 suppliers × 20 items) = ~200 quotes/week
- **Data per week**: ~200 quotes × ~10 fields = ~2,000 data points
- **Annual growth**: ~104,000 quotes/year, ~1,040,000 data points/year

### Current Performance Issues

#### 1. **No Pagination on Weeks List**
```typescript
// src/utils/database.ts:69
export async function fetchWeeks(): Promise<Week[]> {
  const { data } = await supabase
    .from('weeks')
    .select('*')
    .order('week_number', { ascending: false });
  return data || []; // ❌ Loads ALL weeks every time
}
```

**Impact**: After 1 year (52 weeks), loads 52 weeks on every page load. After 5 years (260 weeks), loads 260 weeks.

#### 2. **Analytics Processes All Historical Weeks**
```typescript
// src/components/Analytics.tsx:1029
const quotesPromises = validWeeks.map(async (week) => {
  const quotes = await fetchQuotesWithDetails(week.id);
  return quotes;
});
// ❌ Fetches quotes for ALL closed/finalized weeks every time
```

**Impact**: After 1 year, processes 52 weeks × 200 quotes = 10,400 quotes on every analytics load.

#### 3. **No Data Archiving Strategy**
- All weeks remain in active database forever
- No separation between "active" and "archived" weeks
- Analytics queries scan entire history every time

#### 4. **Client-Side Filtering**
```typescript
// Multiple places filter weeks client-side after fetching all
const closedWeeks = weeksData.filter(w => w.status === 'closed' || w.status === 'finalized');
// ❌ Fetches all weeks, then filters in JavaScript
```

## Recommendations

### Priority 1: Immediate Optimizations (Easy Wins)

#### 1. Add Pagination to Weeks List
```typescript
export async function fetchWeeks(limit: number = 20, offset: number = 0): Promise<Week[]> {
  const { data } = await supabase
    .from('weeks')
    .select('*')
    .order('week_number', { ascending: false })
    .range(offset, offset + limit - 1);
  return data || [];
}

export async function fetchRecentWeeks(limit: number = 10): Promise<Week[]> {
  const { data } = await supabase
    .from('weeks')
    .select('*')
    .order('week_number', { ascending: false })
    .limit(limit);
  return data || [];
}
```

#### 2. Limit Analytics Lookback Period
```typescript
// Only analyze last 26 weeks (6 months) by default
const validWeeks = weeks
  .filter(w => w.status === 'closed' || w.status === 'finalized')
  .sort((a, b) => b.week_number - a.week_number)
  .slice(0, 26); // Last 6 months
```

#### 3. Add Database Indexes
```sql
-- Already exists: idx_weeks_status
-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_weeks_status_week_number 
  ON weeks(status, week_number DESC);

-- Index for quotes by week and status
CREATE INDEX IF NOT EXISTS idx_quotes_week_status 
  ON quotes(week_id) 
  WHERE rf_final_fob IS NOT NULL;
```

### Priority 2: Medium-Term Optimizations

#### 1. Implement Week Archiving
```sql
-- Add archived flag to weeks table
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
CREATE INDEX idx_weeks_archived ON weeks(archived);

-- Archive weeks older than 1 year
UPDATE weeks 
SET archived = true 
WHERE status = 'closed' 
  AND end_date < NOW() - INTERVAL '1 year';
```

#### 2. Add Server-Side Filtering
```typescript
// Filter at database level, not client-side
export async function fetchClosedWeeks(limit: number = 26): Promise<Week[]> {
  const { data } = await supabase
    .from('weeks')
    .select('*')
    .in('status', ['closed', 'finalized'])
    .eq('archived', false)
    .order('week_number', { ascending: false })
    .limit(limit);
  return data || [];
}
```

#### 3. Cache Analytics Results
```typescript
// Cache analytics calculations for 1 hour
const CACHE_KEY = `analytics_${weekIds.join(',')}`;
const cached = localStorage.getItem(CACHE_KEY);
if (cached && Date.now() - JSON.parse(cached).timestamp < 3600000) {
  return JSON.parse(cached).data;
}
```

### Priority 3: Long-Term Solutions

#### 1. Data Partitioning
- Move closed weeks older than 2 years to separate archive table
- Keep only active + recent weeks in main table
- Query archive table only when needed

#### 2. Materialized Views for Analytics
```sql
-- Pre-calculate analytics aggregations
CREATE MATERIALIZED VIEW analytics_weekly_summary AS
SELECT 
  week_id,
  item_id,
  AVG(rf_final_fob) as avg_price,
  COUNT(*) as quote_count
FROM quotes
WHERE rf_final_fob IS NOT NULL
GROUP BY week_id, item_id;

-- Refresh weekly
REFRESH MATERIALIZED VIEW analytics_weekly_summary;
```

#### 3. Background Jobs for Heavy Calculations
- Move analytics calculations to background jobs
- Store results in cache/separate table
- Update on-demand or on schedule

## Capacity Estimates

### Current Capacity (No Optimizations)
- **Weeks**: ~500 weeks (10 years) before noticeable slowdown
- **Quotes**: ~100,000 quotes before query time > 1 second
- **Analytics**: ~50 weeks before calculation time > 3 seconds

### With Priority 1 Optimizations
- **Weeks**: ~2,000 weeks (40 years) before slowdown
- **Quotes**: ~500,000 quotes before query time > 1 second
- **Analytics**: ~200 weeks before calculation time > 3 seconds

### With All Optimizations
- **Weeks**: Effectively unlimited (archived weeks don't slow queries)
- **Quotes**: ~2,000,000 quotes before query time > 1 second
- **Analytics**: ~500 weeks before calculation time > 3 seconds

## Implementation Priority

1. **Week 1**: Add pagination and limit analytics lookback
2. **Week 2**: Add database indexes and server-side filtering
3. **Month 2**: Implement archiving system
4. **Month 3**: Add caching and materialized views

## Monitoring

Add performance tracking:
```typescript
const startTime = performance.now();
const weeks = await fetchWeeks();
const duration = performance.now() - startTime;
if (duration > 1000) {
  logger.warn(`Slow query: fetchWeeks took ${duration}ms`);
}
```

## Conclusion

**Current capacity**: ~1-2 years of data before performance degradation
**With optimizations**: 5-10+ years of data with good performance
**Recommendation**: Implement Priority 1 optimizations now, plan for archiving after 1 year of production use
