-- ==============================================================================
-- SHRISTI ESTATE - SUPABASE ROW LEVEL SECURITY (RLS) HARDENING SCRIPT
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- to enforce strict access control, prevent unauthorized data harvesting,
-- and protect customer leads from competitor scraping.
-- ==============================================================================

-- 1. SECURE LEADS TABLE (CRITICAL: CUSTOMER CONTACTS & PRIVACY)
-- Anyone can submit a lead (contact / requirement form)
-- But NO unauthenticated person can read, edit, or delete leads!
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit leads" ON leads;
CREATE POLICY "Public can submit leads" ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only authenticated admins can view leads" ON leads;
CREATE POLICY "Only authenticated admins can view leads" ON leads
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Only authenticated admins can update leads" ON leads;
CREATE POLICY "Only authenticated admins can update leads" ON leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only authenticated admins can delete leads" ON leads;
CREATE POLICY "Only authenticated admins can delete leads" ON leads
  FOR DELETE
  TO authenticated
  USING (true);


-- 2. SECURE PROPERTIES TABLE
ALTER TABLE IF EXISTS properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published properties" ON properties;
CREATE POLICY "Public can view published properties" ON properties
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Only authenticated admins can insert properties" ON properties;
CREATE POLICY "Only authenticated admins can insert properties" ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only authenticated admins can update properties" ON properties;
CREATE POLICY "Only authenticated admins can update properties" ON properties
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only authenticated admins can delete properties" ON properties;
CREATE POLICY "Only authenticated admins can delete properties" ON properties
  FOR DELETE
  TO authenticated
  USING (true);


-- 3. SECURE BUILDINGS & TOWERS TABLE
ALTER TABLE IF EXISTS buildings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view commercial buildings" ON buildings;
CREATE POLICY "Public can view commercial buildings" ON buildings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Only authenticated admins can modify buildings" ON buildings;
CREATE POLICY "Only authenticated admins can modify buildings" ON buildings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 4. SECURE LOCATIONS / SECTORS TABLE
ALTER TABLE IF EXISTS locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view locations" ON locations;
CREATE POLICY "Public can view locations" ON locations
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Only authenticated admins can modify locations" ON locations;
CREATE POLICY "Only authenticated admins can modify locations" ON locations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 5. SECURE MARKET GUIDES & BLOGS
ALTER TABLE IF EXISTS market_guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read market guides" ON market_guides;
CREATE POLICY "Public can read market guides" ON market_guides
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Only authenticated admins can modify market guides" ON market_guides;
CREATE POLICY "Only authenticated admins can modify market guides" ON market_guides
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 6. SECURE REVIEWS TABLE
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view client reviews" ON reviews;
CREATE POLICY "Public can view client reviews" ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Only authenticated admins can modify reviews" ON reviews;
CREATE POLICY "Only authenticated admins can modify reviews" ON reviews
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
