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
  const { error: bldErr } = await supabase.from('buildings').upsert(INITIAL_BUILDINGS);
  if (bldErr) console.error('Buildings error:', bldErr);
  else console.log('✓ Buildings seeded successfully');

  // 3. Properties
  console.log(`Seeding ${INITIAL_PROPERTIES.length} properties...`);
  const { error: propErr } = await supabase.from('properties').upsert(INITIAL_PROPERTIES);
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
