import { createClient } from '@supabase/supabase-js';
import { INITIAL_LOCATIONS, INITIAL_BUILDINGS, INITIAL_PROPERTIES, INITIAL_LEADS } from '../src/data/mockData.js';

const supabaseUrl = 'https://vdrqvvxvvuqqgxwqjfyy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcnF2dnh2dnVxcWd4d3FqZnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NzQwOTMsImV4cCI6MjEwNDU1MDA5M30.ulf1wysrZSTp4tWKozQC0-AVHarj0-u8pMjTUjCJCe8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('--- Seeding Supabase Database for Shristi Estate ---');

  // 1. Locations
  console.log(`Seeding ${INITIAL_LOCATIONS.length} locations...`);
  const { error: locErr } = await supabase.from('locations').upsert(INITIAL_LOCATIONS);
  if (locErr) console.error('Locations error:', locErr);
  else console.log('✓ Locations seeded successfully');

  // 2. Buildings
  console.log(`Seeding ${INITIAL_BUILDINGS.length} buildings...`);
  const sanitizedBuildings = INITIAL_BUILDINGS.map(b => {
    const metaPayload = {
      available_floors: b.available_floors || null,
      structure_display: b.structure_display,
      basement_floors: b.basement_floors,
      ground_option: b.ground_option,
      towers: b.towers,
      total_towers: b.total_towers,
      tower_details: b.tower_details,
      categories: b.categories,
      locations: b.locations,
      location_names: b.location_names,
    };
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      location_id: b.location_id,
      location_name: b.location_name,
      category: b.category,
      address: b.address,
      description: b.description,
      hero_image: b.hero_image,
      gallery: b.gallery || [],
      total_floors: b.total_floors,
      available_floors: '__meta:' + JSON.stringify(metaPayload),
      size_range: b.size_range,
      rent_range: b.rent_range || null,
      sale_range: b.sale_range || null,
      furnishing_options: b.furnishing_options || [],
      parking: b.parking,
      lifts: b.lifts,
      security: b.security,
      power_backup: b.power_backup,
      amenities: b.amenities || [],
      nearby_landmarks: b.nearby_landmarks || [],
      nearby_transport: b.nearby_transport,
      published: b.published ?? true,
      property_count: b.property_count || 0
    };
  });
  const { error: bldErr } = await supabase.from('buildings').upsert(sanitizedBuildings);
  if (bldErr) console.error('Buildings error:', bldErr);
  else console.log('✓ All 28 buildings seeded successfully into Supabase');

  // 3. Properties
  console.log(`Seeding ${INITIAL_PROPERTIES.length} properties...`);
  const sanitizedProperties = INITIAL_PROPERTIES.map(p => {
    const { tower, is_seed, ...rest } = p as any;
    return rest;
  });
  const { error: propErr } = await supabase.from('properties').upsert(sanitizedProperties);
  if (propErr) console.error('Properties error:', propErr);
  else console.log('✓ Properties seeded successfully');

  // 4. Leads
  console.log(`Seeding ${INITIAL_LEADS.length} sample leads...`);
  const { error: leadErr } = await supabase.from('leads').upsert(INITIAL_LEADS);
  if (leadErr) console.error('Leads error:', leadErr);
  else console.log('✓ Leads seeded successfully');

  console.log('--- All Seeding Finished ---');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
