-- Script to identify unused indexes
-- Run this in your Supabase SQL editor to find indexes that can be safely removed

-- Check all indexes on cars table
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef,
    'cars' as table_type
FROM pg_indexes 
WHERE tablename = 'cars' AND schemaname = 'public'
UNION ALL
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef,
    'car_likes' as table_type
FROM pg_indexes 
WHERE tablename = 'car_likes' AND schemaname = 'public'
ORDER BY table_type, indexname;

-- Check index usage statistics
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED - Safe to drop'
        WHEN idx_scan < 10 THEN 'RARELY USED - Consider dropping'
        ELSE 'FREQUENTLY USED - Keep'
    END as recommendation
FROM pg_stat_user_indexes 
WHERE relname IN ('cars', 'car_likes')
ORDER BY idx_scan ASC, relname, indexrelname;

-- Check for duplicate indexes
SELECT 
    tablename,
    indexdef,
    COUNT(*) as duplicate_count,
    array_agg(indexname) as index_names
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('cars', 'car_likes')
GROUP BY tablename, indexdef
HAVING COUNT(*) > 1
ORDER BY tablename, indexdef;

-- Check for indexes that might be redundant
-- (e.g., if you have an index on (a,b) and another on (a,b,c), the first might be redundant)
SELECT 
    i1.tablename,
    i1.indexname as index1,
    i2.indexname as index2,
    i1.indexdef as index1_def,
    i2.indexdef as index2_def
FROM pg_indexes i1
JOIN pg_indexes i2 ON i1.tablename = i2.tablename 
    AND i1.schemaname = i2.schemaname
    AND i1.indexname != i2.indexname
WHERE i1.schemaname = 'public' 
    AND i1.tablename IN ('cars', 'car_likes')
    AND i1.indexdef LIKE '%' || REPLACE(REPLACE(i2.indexdef, 'CREATE INDEX ' || i2.indexname, ''), ' ON ' || i2.tablename, '') || '%'
ORDER BY i1.tablename, i1.indexname;
