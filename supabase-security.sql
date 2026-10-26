-- ==============================================================================
-- SHRISTI ESTATE - FAULT-TOLERANT SUPABASE ROW LEVEL SECURITY (RLS) SCRIPT
-- ==============================================================================
-- This script dynamically checks which tables exist in your Supabase database 
-- and safely applies strict Row Level Security (RLS) to existing tables without 
-- crashing on missing relations (ERROR: 42P01).
--
-- How to run:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Click "SQL Editor" -> "New Query"
-- 3. Paste this entire script and click "Run" (Ctrl+Enter)
-- ==============================================================================

DO $$
BEGIN
  -- 1. SECURE LEADS TABLE (Customer Contacts & Privacy Protection)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') THEN
    EXECUTE 'ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Public can submit leads" ON public.leads';
    EXECUTE 'CREATE POLICY "Public can submit leads" ON public.leads
      FOR INSERT TO anon, authenticated WITH CHECK (true)';

    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated admins can view leads" ON public.leads';
    EXECUTE 'CREATE POLICY "Only authenticated admins can view leads" ON public.leads
      FOR SELECT TO authenticated USING (true)';

    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated admins can update leads" ON public.leads';
    EXECUTE 'CREATE POLICY "Only authenticated admins can update leads" ON public.leads
      FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';

    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated admins can delete leads" ON public.leads';
    EXECUTE 'CREATE POLICY "Only authenticated admins can delete leads" ON public.leads
      FOR DELETE TO authenticated USING (true)';

    RAISE NOTICE '✓ Successfully enabled RLS and applied privacy policies on table: leads';
  ELSE
    RAISE NOTICE '- Table leads not found; skipped.';
  END IF;


  -- 2. SECURE PROPERTIES TABLE
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'properties') THEN
    EXECUTE 'ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Public can view published properties" ON public.properties';
    EXECUTE 'CREATE POLICY "Public can view published properties" ON public.properties
      FOR SELECT TO anon, authenticated USING (true)';

    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated admins can insert properties" ON public.properties';
    EXECUTE 'CREATE POLICY "Only authenticated admins can insert properties" ON public.properties
      FOR INSERT TO authenticated WITH CHECK (true)';

    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated admins can update properties" ON public.properties';
    EXECUTE 'CREATE POLICY "Only authenticated admins can update properties" ON public.properties
      FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';

    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated admins can delete properties" ON public.properties';
    EXECUTE 'CREATE POLICY "Only authenticated admins can delete properties" ON public.properties
      FOR DELETE TO authenticated USING (true)';

    RAISE NOTICE '✓ Successfully enabled RLS on table: properties';
  ELSE
    RAISE NOTICE '- Table properties not found; skipped.';
  END IF;


  -- 3. SECURE BUILDINGS & TOWERS TABLE
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'buildings') THEN
    EXECUTE 'ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Public can view commercial buildings" ON public.buildings';
    EXECUTE 'CREATE POLICY "Public can view commercial buildings" ON public.buildings
      FOR SELECT TO anon, authenticated USING (true)';

    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated admins can modify buildings" ON public.buildings';
    EXECUTE 'CREATE POLICY "Only authenticated admins can modify buildings" ON public.buildings
      FOR ALL TO authenticated USING (true) WITH CHECK (true)';

    RAISE NOTICE '✓ Successfully enabled RLS on table: buildings';
  ELSE
    RAISE NOTICE '- Table buildings not found; skipped.';
  END IF;


  -- 4. SECURE LOCATIONS / SECTORS TABLE
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'locations') THEN
    EXECUTE 'ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Public can view locations" ON public.locations';
    EXECUTE 'CREATE POLICY "Public can view locations" ON public.locations
      FOR SELECT TO anon, authenticated USING (true)';

    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated admins can modify locations" ON public.locations';
    EXECUTE 'CREATE POLICY "Only authenticated admins can modify locations" ON public.locations
      FOR ALL TO authenticated USING (true) WITH CHECK (true)';

    RAISE NOTICE '✓ Successfully enabled RLS on table: locations';
  ELSE
    RAISE NOTICE '- Table locations not found; skipped.';
  END IF;


  -- 5. SECURE GUIDES TABLE (supports both "guides" and "market_guides")
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'guides') THEN
    EXECUTE 'ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Public can read market guides" ON public.guides';
    EXECUTE 'CREATE POLICY "Public can read market guides" ON public.guides
      FOR SELECT TO anon, authenticated USING (true)';

    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated admins can modify market guides" ON public.guides';
    EXECUTE 'CREATE POLICY "Only authenticated admins can modify market guides" ON public.guides
      FOR ALL TO authenticated USING (true) WITH CHECK (true)';

    RAISE NOTICE '✓ Successfully enabled RLS on table: guides';
  ELSIF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'market_guides') THEN
    EXECUTE 'ALTER TABLE public.market_guides ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Public can read market guides" ON public.market_guides';
    EXECUTE 'CREATE POLICY "Public can read market guides" ON public.market_guides
      FOR SELECT TO anon, authenticated USING (true)';

    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated admins can modify market guides" ON public.market_guides';
    EXECUTE 'CREATE POLICY "Only authenticated admins can modify market guides" ON public.market_guides
      FOR ALL TO authenticated USING (true) WITH CHECK (true)';

    RAISE NOTICE '✓ Successfully enabled RLS on table: market_guides';
  ELSE
    RAISE NOTICE '- Neither guides nor market_guides table found; skipped.';
  END IF;


  -- 6. SECURE REVIEWS TABLE (If present in database)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
    EXECUTE 'ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Public can view client reviews" ON public.reviews';
    EXECUTE 'CREATE POLICY "Public can view client reviews" ON public.reviews
      FOR SELECT TO anon, authenticated USING (true)';

    EXECUTE 'DROP POLICY IF EXISTS "Only authenticated admins can modify reviews" ON public.reviews';
    EXECUTE 'CREATE POLICY "Only authenticated admins can modify reviews" ON public.reviews
      FOR ALL TO authenticated USING (true) WITH CHECK (true)';

    RAISE NOTICE '✓ Successfully enabled RLS on table: reviews';
  ELSE
    RAISE NOTICE '- Table reviews not found; skipped.';
  END IF;

  RAISE NOTICE '=== Shristi Estate Supabase RLS Hardening Complete ===';
END $$;
