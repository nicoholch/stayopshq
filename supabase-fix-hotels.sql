-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Fixes: RLS insert policy + adds property_type column
-- ============================================================

-- 1. Add property_type column (safe — skips if already exists)
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS property_type TEXT;

-- 2. Fix the insert policy so any signed-in user can create a hotel
DROP POLICY IF EXISTS "hotel_insert" ON hotels;

CREATE POLICY "hotel_insert" ON hotels
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
