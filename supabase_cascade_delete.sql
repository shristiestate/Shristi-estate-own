-- SHRISTI ESTATE (shristiestate.in)
-- MIGRATION: LOCATION -> BUILDINGS -> UNITS CASCADE DELETE & INDEXES
--
-- Hierarchy: Location -> Buildings -> Units (Properties)
-- 1. Deleting a Location automatically deletes all of its Buildings and Units in a single transaction.
-- 2. Deleting a Building automatically deletes all of its Units.
-- 3. High-performance B-tree indexes on foreign keys for fast lookup and accelerated cascade deletions.

-- Step 1: Update Foreign Key Constraint on buildings (location_id -> locations.id)
ALTER TABLE buildings 
  DROP CONSTRAINT IF EXISTS buildings_location_id_fkey,
  ADD CONSTRAINT buildings_location_id_fkey 
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;

-- Step 2: Update Foreign Key Constraint on properties (building_id -> buildings.id)
ALTER TABLE properties 
  DROP CONSTRAINT IF EXISTS properties_building_id_fkey,
  ADD CONSTRAINT properties_building_id_fkey 
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

-- Step 3: Update Foreign Key Constraint on properties (location_id -> locations.id)
ALTER TABLE properties 
  DROP CONSTRAINT IF EXISTS properties_location_id_fkey,
  ADD CONSTRAINT properties_location_id_fkey 
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;

-- Step 4: Add indexes on foreign keys for rapid deletes and queries
CREATE INDEX IF NOT EXISTS idx_buildings_location_id ON buildings(location_id);
CREATE INDEX IF NOT EXISTS idx_properties_building_id ON properties(building_id);
CREATE INDEX IF NOT EXISTS idx_properties_location_id ON properties(location_id);

-- Optional: Stored procedure for single-transaction cascade delete with deleted item count reporting
CREATE OR REPLACE FUNCTION delete_location_cascade(p_location_id TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_building_count INT := 0;
  v_unit_count INT := 0;
BEGIN
  -- Count related buildings
  SELECT COUNT(*) INTO v_building_count 
  FROM buildings 
  WHERE location_id = p_location_id;

  -- Count related units
  SELECT COUNT(*) INTO v_unit_count 
  FROM properties 
  WHERE location_id = p_location_id 
     OR building_id IN (SELECT id FROM buildings WHERE location_id = p_location_id);

  -- Single atomic statement: ON DELETE CASCADE will handle all child rows
  DELETE FROM locations WHERE id = p_location_id;

  RETURN jsonb_build_object(
    'success', true,
    'location_id', p_location_id,
    'buildings_deleted', v_building_count,
    'units_deleted', v_unit_count
  );
END;
$$;
