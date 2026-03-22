-- Run this in Supabase SQL Editor → New Query
-- If you ran this before, the CREATE POLICY lines may error with "already exists" — that's fine, ignore them.

-- Drop old versions if they exist (safe to run even if they don't)
DROP POLICY IF EXISTS "hotel_insert" ON hotels;
DROP POLICY IF EXISTS "profile_insert" ON profiles;

-- Any signed-in user can create a hotel
CREATE POLICY "hotel_insert" ON hotels
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can only insert their own profile row
CREATE POLICY "profile_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());
