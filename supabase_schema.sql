-- SHRISTI ESTATE (shristiestate.in) SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor to initialize the database tables.

-- 1. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  description TEXT,
  hero_image TEXT,
  building_count INTEGER DEFAULT 0,
  property_count INTEGER DEFAULT 0,
  categories JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. BUILDINGS TABLE
CREATE TABLE IF NOT EXISTS buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
  location_name TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  hero_image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  total_floors INTEGER DEFAULT 1,
  available_floors TEXT,
  size_range TEXT,
  rent_range TEXT,
  sale_range TEXT,
  furnishing_options JSONB DEFAULT '[]'::jsonb,
  parking TEXT,
  lifts TEXT,
  security TEXT,
  power_backup TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  nearby_landmarks JSONB DEFAULT '[]'::jsonb,
  nearby_transport TEXT,
  published BOOLEAN DEFAULT true,
  property_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  reference_number TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  property_type TEXT NOT NULL,
  listing_type TEXT NOT NULL, -- Rent, Sale, Lease
  status TEXT NOT NULL, -- Available, Ready to Move, Under Construction, Under Negotiation, Leased, Sold
  price NUMERIC NOT NULL,
  price_display TEXT NOT NULL,
  rate_per_sqft TEXT,
  rent_frequency TEXT,
  location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
  location_name TEXT NOT NULL,
  building_id TEXT REFERENCES buildings(id) ON DELETE SET NULL,
  building_name TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  built_up_area NUMERIC NOT NULL,
  carpet_area NUMERIC,
  land_area NUMERIC,
  area_unit TEXT DEFAULT 'sq.ft',
  floor TEXT,
  total_floors INTEGER,
  furnishing TEXT NOT NULL,
  parking TEXT,
  power_load TEXT,
  road_width TEXT,
  possession TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  primary_image TEXT NOT NULL,
  gallery JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  is_seed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  lead_type TEXT NOT NULL, -- enquiry, requirement, list_property, site_visit, callback, general
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_contact_method TEXT DEFAULT 'phone',
  message TEXT,
  property_id TEXT,
  property_title TEXT,
  building_id TEXT,
  building_name TEXT,
  location_id TEXT,
  location_name TEXT,
  requirement_details JSONB,
  list_property_details JSONB,
  images JSONB DEFAULT '[]'::jsonb,
  preferred_visit_date TEXT,
  preferred_visit_time TEXT,
  source_page TEXT,
  lead_source TEXT DEFAULT 'website', -- website, whatsapp, phone, referral, other
  status TEXT DEFAULT 'New', -- New, Contacted, Qualified, Visit Scheduled, Converted, Not Interested, Closed
  notes TEXT,
  assigned_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public read buildings" ON buildings FOR SELECT USING (published = true);
CREATE POLICY "Public read properties" ON properties FOR SELECT USING (published = true);

-- Public Leads Insertion Policy
CREATE POLICY "Public insert leads" ON leads FOR INSERT WITH CHECK (true);

-- Extensions for Commercial Buildings: Multi-locations, Categories, Structure, and Towers
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS locations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS location_names JSONB DEFAULT '[]'::jsonb;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS basement_floors TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS ground_option TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS structure_display TEXT;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS towers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS total_towers INTEGER DEFAULT 1;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS tower_details TEXT;

-- 5. GUIDES / BLOGS TABLE
CREATE TABLE IF NOT EXISTS guides (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT,
  "readTime" TEXT DEFAULT '5 min read',
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  featured_image_caption TEXT,
  seo_title TEXT,
  seo_description TEXT,
  hyperlinks JSONB DEFAULT '[]'::jsonb,
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  author TEXT DEFAULT 'Shristi Estate Advisory Desk',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read guides" ON guides FOR SELECT USING (published = true);

-- 6. STORAGE BUCKET FOR BLOG IMAGES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read blog images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'blog-images');

CREATE POLICY "Public insert/update blog images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'blog-images');


