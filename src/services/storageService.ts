import { Location, Building, Property, Lead, LeadStatus, MarketGuide } from '../types';
import { INITIAL_LOCATIONS, INITIAL_BUILDINGS, INITIAL_PROPERTIES, INITIAL_LEADS, INITIAL_MARKET_GUIDES } from '../data/mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getBuildingStructureDisplay } from '../utils/textFormat';
import { generateAvailablePropertiesForBuilding } from '../utils/buildingUnits';
import { cleanPropertyAddress } from '../utils/propertyLocation';

const STORAGE_KEYS = {
  LOCATIONS: 'shristi_locations_v1',
  BUILDINGS: 'shristi_buildings_v1',
  PROPERTIES: 'shristi_properties_v1',
  LEADS: 'shristi_leads_v1',
  GUIDES: 'shristi_guides_v1',
};

let _memLocations: Location[] | null = null;
let _memBuildings: Building[] | null = null;
let _memProperties: Property[] | null = null;
let _memLeads: Lead[] | null = null;
let _memGuides: MarketGuide[] | null = null;

// Safe localStorage setter that prunes non-critical data if quota is exceeded
const safeSetItem = (key: string, value: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`LocalStorage quota reached when setting "${key}". Pruning non-essential caches...`, err);
    try {
      // 1. Prune custom media if bulky
      const mediaStr = localStorage.getItem('shristi_custom_media');
      if (mediaStr) {
        try {
          const media = JSON.parse(mediaStr);
          if (Array.isArray(media) && media.length > 5) {
            localStorage.setItem('shristi_custom_media', JSON.stringify(media.slice(0, 5)));
          } else {
            localStorage.removeItem('shristi_custom_media');
          }
        } catch {
          localStorage.removeItem('shristi_custom_media');
        }
      }
      // 2. Prune old leads
      const leadsStr = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (leadsStr) {
        try {
          const parsed = JSON.parse(leadsStr);
          if (Array.isArray(parsed) && parsed.length > 10) {
            localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(parsed.slice(0, 10)));
          }
        } catch {
          // ignore
        }
      }
      // Try again
      localStorage.setItem(key, value);
      return true;
    } catch (secondErr) {
      console.warn(`LocalStorage quota still exceeded for "${key}". Memory cache remains fully active.`, secondErr);
      return false;
    }
  }
};

// Initialize in-memory cache and localStorage with initial seeds if not populated
const initStorage = () => {
  try {
    const storedLocs = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (!storedLocs) {
      _memLocations = INITIAL_LOCATIONS;
      safeSetItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
    } else {
      const parsedLocs: Location[] = JSON.parse(storedLocs);
      const existingIds = new Set(parsedLocs.map(l => l.id));
      const missingLocs = INITIAL_LOCATIONS.filter(il => !existingIds.has(il.id));
      if (missingLocs.length > 0) {
        _memLocations = [
          ...parsedLocs.map(l => {
            const initL = INITIAL_LOCATIONS.find(il => il.id === l.id);
            return initL ? { ...l, building_count: Math.max(l.building_count || 0, initL.building_count || 0) } : l;
          }),
          ...missingLocs
        ];
        localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(_memLocations));
      } else {
        _memLocations = parsedLocs;
      }
    }

    const storedBlds = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
    if (!storedBlds) {
      _memBuildings = INITIAL_BUILDINGS.map(b => ({
        ...b,
        structure_display: getBuildingStructureDisplay(b),
        property_count: Math.max(b.property_count || 0, 20)
      }));
      localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(INITIAL_BUILDINGS));
    } else {
      let parsedBlds: Building[] = JSON.parse(storedBlds);
      // Auto-purge any stale residential villa photos from older local seeds
      let hasPurgedVilla = false;
      parsedBlds = parsedBlds.map(b => {
        let bldChanged = false;
        let hero = b.hero_image;
        let gal = Array.isArray(b.gallery) ? [...b.gallery] : [];
        if (hero && hero.includes('photo-1512917774080-9991f1c4c750')) {
          hero = 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=80';
          bldChanged = true;
        }
        if (gal.some(img => img && img.includes('photo-1512917774080-9991f1c4c750'))) {
          gal = gal.filter(img => img && !img.includes('photo-1512917774080-9991f1c4c750'));
          bldChanged = true;
        }
        if (bldChanged) {
          hasPurgedVilla = true;
          return { ...b, hero_image: hero, gallery: gal };
        }
        return b;
      });

      const existingIds = new Set(parsedBlds.map(b => b.id));
      const existingSlugs = new Set(parsedBlds.map(b => b.slug.toLowerCase()));
      const missingBlds = INITIAL_BUILDINGS.filter(b => !existingIds.has(b.id) && !existingSlugs.has(b.slug.toLowerCase()));
      const source = missingBlds.length > 0 ? [...parsedBlds, ...missingBlds] : parsedBlds;
      if (missingBlds.length > 0 || hasPurgedVilla) {
        localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(source));
      }
      _memBuildings = source.map(b => ({
        ...b,
        structure_display: getBuildingStructureDisplay(b),
        property_count: Math.max(b.property_count || 0, 20)
      }));
    }

    const storedProps = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    if (!storedProps) {
      _memProperties = [
        ...INITIAL_PROPERTIES,
        ...INITIAL_BUILDINGS.flatMap(b => generateAvailablePropertiesForBuilding(b))
      ];
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
    } else {
      const parsedProps: Property[] = JSON.parse(storedProps);
      const buildings = _memBuildings || INITIAL_BUILDINGS;
      const allGenerated = buildings.flatMap(b => generateAvailablePropertiesForBuilding(b));
      const existingIds = new Set(parsedProps.map(p => p.id));
      const existingSlugs = new Set(parsedProps.map(p => p.slug.toLowerCase()));
      const missingGenerated = allGenerated.filter(p => !existingIds.has(p.id) && !existingSlugs.has(p.slug.toLowerCase()));
      const cleanedExisting = parsedProps.map(p => ({
        ...p,
        title: p.title.replace(/\s+in\s+I-Thum\s+Tower\s+[A-Za-z0-9-]+\b/i, ' in I-Thum'),
        address: cleanPropertyAddress(p.address, p.building_name)
      }));
      _memProperties = [...cleanedExisting, ...missingGenerated];
    }

    const storedGuides = localStorage.getItem(STORAGE_KEYS.GUIDES);
    if (!storedGuides) {
      _memGuides = INITIAL_MARKET_GUIDES;
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(INITIAL_MARKET_GUIDES));
    } else {
      const parsedGuides: MarketGuide[] = JSON.parse(storedGuides);
      const existingIds = new Set(parsedGuides.map(g => g.id));
      const missingGuides = INITIAL_MARKET_GUIDES.filter(g => !existingIds.has(g.id));
      _memGuides = missingGuides.length > 0 ? [...parsedGuides, ...missingGuides] : parsedGuides;
    }
  } catch (e) {
    console.warn('Init storage error:', e);
    _memLocations = INITIAL_LOCATIONS;
    _memBuildings = INITIAL_BUILDINGS.map(b => ({
      ...b,
      structure_display: getBuildingStructureDisplay(b),
      property_count: Math.max(b.property_count || 0, 20)
    }));
    _memProperties = [
      ...INITIAL_PROPERTIES,
      ...INITIAL_BUILDINGS.flatMap(b => generateAvailablePropertiesForBuilding(b))
    ];
    _memGuides = INITIAL_MARKET_GUIDES;
  }
};

const SUPABASE_TIMEOUT_MS = 3500;

async function withTimeout<T = any>(promise: any, timeoutMs = SUPABASE_TIMEOUT_MS): Promise<any> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Supabase request timeout')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

if (typeof window !== 'undefined') {
  initStorage();
}

export const StorageService = {
  // SYNCHRONOUS IMMEDIATE GETTERS (Zero delay, instant page shell rendering)
  getInitialLocations(): Location[] {
    if (_memLocations && _memLocations.length > 0) return _memLocations;
    try {
      const data = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LOCATIONS) : null;
      const localLocs: Location[] = data ? JSON.parse(data) : INITIAL_LOCATIONS;
      const existingIds = new Set(localLocs.map(l => l.id));
      const missing = INITIAL_LOCATIONS.filter(l => !existingIds.has(l.id));
      _memLocations = [...localLocs, ...missing];
      return _memLocations;
    } catch {
      return INITIAL_LOCATIONS;
    }
  },

  getInitialLocationBySlug(slug?: string): Location | null {
    if (!slug) return null;
    const locations = this.getInitialLocations();
    return locations.find(l => l.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  getInitialBuildings(): Building[] {
    if (_memBuildings && _memBuildings.length > 0) return _memBuildings;
    try {
      let localBuildings: Building[] = [];
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.BUILDINGS) : null;
      if (stored) {
        localBuildings = JSON.parse(stored);
      }
      const existingIds = new Set(localBuildings.map(b => b.id));
      const existingSlugs = new Set(localBuildings.map(b => b.slug.toLowerCase()));
      const missing = INITIAL_BUILDINGS.filter(b => !existingIds.has(b.id) && !existingSlugs.has(b.slug.toLowerCase()));
      const source = [...localBuildings, ...missing];
      _memBuildings = source.map(b => ({
        ...b,
        structure_display: getBuildingStructureDisplay(b),
        property_count: Math.max(b.property_count || 0, 20)
      }));
      return _memBuildings;
    } catch {
      return INITIAL_BUILDINGS.map(b => ({
        ...b,
        structure_display: getBuildingStructureDisplay(b),
        property_count: Math.max(b.property_count || 0, 20)
      }));
    }
  },

  getInitialBuildingBySlug(slug?: string): Building | null {
    if (!slug) return null;
    const buildings = this.getInitialBuildings();
    return buildings.find(b => b.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  getInitialBuildingsByLocation(locationId?: string): Building[] {
    if (!locationId) return [];
    const buildings = this.getInitialBuildings();
    return buildings.filter(b => b.location_id === locationId || (b.locations && b.locations.includes(locationId)));
  },

  getInitialProperties(): Property[] {
    if (_memProperties && _memProperties.length > 0) return _memProperties;
    try {
      let localProps: Property[] = [];
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.PROPERTIES) : null;
      if (stored) localProps = JSON.parse(stored);
      const baseProps = localProps.length > 0 ? localProps : INITIAL_PROPERTIES;
      const buildings = this.getInitialBuildings();
      const allGenerated = buildings.flatMap(b => generateAvailablePropertiesForBuilding(b));
      const existingIds = new Set(baseProps.map(p => p.id));
      const existingSlugs = new Set(baseProps.map(p => p.slug.toLowerCase()));
      const missingGenerated = allGenerated.filter(p => !existingIds.has(p.id) && !existingSlugs.has(p.slug.toLowerCase()));
      const cleanedBaseProps = baseProps.map(p => ({
        ...p,
        title: p.title.replace(/\s+in\s+I-Thum\s+Tower\s+[A-Za-z0-9-]+\b/i, ' in I-Thum'),
        address: cleanPropertyAddress(p.address, p.building_name)
      }));
      _memProperties = [...cleanedBaseProps, ...missingGenerated];
      return _memProperties;
    } catch {
      return INITIAL_PROPERTIES;
    }
  },

  getInitialPropertyBySlug(slug?: string): Property | null {
    if (!slug) return null;
    const properties = this.getInitialProperties();
    const found = properties.find(p => p.slug.toLowerCase() === slug.toLowerCase());
    if (found) return found;

    const buildings = this.getInitialBuildings();
    for (const bld of buildings) {
      const units = generateAvailablePropertiesForBuilding(bld);
      const match = units.find(u => u.slug.toLowerCase() === slug.toLowerCase());
      if (match) return match;
    }
    return null;
  },

  getInitialPropertiesByBuilding(buildingId?: string): Property[] {
    if (!buildingId) return [];
    const buildings = this.getInitialBuildings();
    const building = buildings.find(b => b.id === buildingId || b.slug.toLowerCase() === buildingId.toLowerCase());
    const allProps = this.getInitialProperties();
    const existing = allProps.filter(p => p.building_id === buildingId || (building && (p.building_name?.toLowerCase() === building.name.toLowerCase() || p.building_id === building.id)));

    if (!building) return existing;

    const standardUnits = generateAvailablePropertiesForBuilding(building);
    const existingAreas = new Set(existing.map(p => p.built_up_area));
    const merged = [
      ...existing,
      ...standardUnits.filter(u => !existingAreas.has(u.built_up_area))
    ];

    return merged.sort((a, b) => a.built_up_area - b.built_up_area);
  },

  getInitialPropertiesByLocation(locationId?: string): Property[] {
    if (!locationId) return [];
    const properties = this.getInitialProperties();
    return properties.filter(p => p.location_id === locationId);
  },

  getInitialPropertiesByCategory(category?: string): Property[] {
    if (!category) return [];
    const properties = this.getInitialProperties();
    return properties.filter(p => p.category === category);
  },

  getInitialLeads(): Lead[] {
    if (_memLeads && _memLeads.length > 0) return _memLeads;
    try {
      const data = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LEADS) : null;
      _memLeads = data ? JSON.parse(data) : INITIAL_LEADS;
      return _memLeads!;
    } catch {
      return INITIAL_LEADS;
    }
  },

  // ASYNC LOCATIONS WITH BACKGROUND FALLBACK
  async getLocations(): Promise<Location[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('locations').select('*') as any);
        if (!error && data && data.length > 0) {
          _memLocations = data as Location[];
          return _memLocations;
        }
      } catch (e) {
        console.warn('Falling back to local storage for locations:', e);
      }
    }
    return this.getInitialLocations();
  },

  async getLocationBySlug(slug: string): Promise<Location | null> {
    if (!slug) return null;
    const initial = this.getInitialLocationBySlug(slug);
    if (isSupabaseConfigured && supabase) {
      try {
        const locations = await this.getLocations();
        return locations.find(l => l.slug.toLowerCase() === slug.toLowerCase()) || initial;
      } catch {
        return initial;
      }
    }
    return initial;
  },

  async saveLocation(location: Location): Promise<void> {
    try {
      const locations = await this.getLocations();
      const index = locations.findIndex(l => l.id === location.id);
      if (index >= 0) {
        locations[index] = location;
      } else {
        locations.push(location);
      }
      safeSetItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
      _memLocations = locations;
    } catch (e) {
      console.warn('LocalStorage save warning for locations:', e);
    }

    // Always update in-memory cache
    if (_memLocations) {
      const memIndex = _memLocations.findIndex(l => l.id === location.id);
      if (memIndex >= 0) _memLocations[memIndex] = location;
      else _memLocations.push(location);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('locations').upsert(location);
        if (error) {
          console.warn('Supabase upsert location warning (local saved successfully):', error);
        }
      } catch (e) {
        console.warn('Supabase upsert location network warning (local saved successfully):', e);
      }
    }
  },

  async deleteLocation(locationId: string): Promise<void> {
    try {
      const locations = await this.getLocations();
      const updated = locations.filter(l => l.id !== locationId);
      safeSetItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(updated));
      _memLocations = updated;
    } catch (e) {
      console.warn('LocalStorage delete warning for locations:', e);
    }

    if (_memLocations) {
      _memLocations = _memLocations.filter(l => l.id !== locationId);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('locations').delete().eq('id', locationId);
      } catch (e) {
        console.warn('Supabase delete location warning:', e);
      }
    }
  },

  // BUILDINGS
  async getBuildings(): Promise<Building[]> {
    let localBuildings: Building[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
      if (stored) {
        localBuildings = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading local buildings:', e);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('buildings').select('*') as any);
        if (!error && data && data.length > 0) {
          const mergedList: Building[] = (data as any[]).map(supaBld => {
            const localBld = localBuildings.find(lb => lb.id === supaBld.id || lb.slug === supaBld.slug);
            let meta: any = {};
            if (typeof supaBld.available_floors === 'string' && supaBld.available_floors.startsWith('__meta:')) {
              try {
                meta = JSON.parse(supaBld.available_floors.replace('__meta:', ''));
              } catch (e) {
                // ignore
              }
            }

            const combined: Building = {
              ...supaBld,
              ...meta,
              ...(localBld || {}),
              building_name: supaBld.building_name || meta.building_name || localBld?.building_name,
              block_name: supaBld.block_name || meta.block_name || localBld?.block_name,
              tower_number: supaBld.tower_number || meta.tower_number || localBld?.tower_number,
              sector: supaBld.sector || meta.sector || localBld?.sector,
              gmaps_direction: supaBld.gmaps_direction || meta.gmaps_direction || localBld?.gmaps_direction,
              status: supaBld.status || meta.status || localBld?.status,
              short_description: supaBld.short_description || meta.short_description || localBld?.short_description,
              overview: supaBld.overview || meta.overview || localBld?.overview,
              location_connectivity: supaBld.location_connectivity || meta.location_connectivity || localBld?.location_connectivity,
              specs: supaBld.specs || meta.specs || localBld?.specs,
              hero_image_alt: supaBld.hero_image_alt || meta.hero_image_alt || localBld?.hero_image_alt,
              hero_image_title: supaBld.hero_image_title || meta.hero_image_title || localBld?.hero_image_title,
              hero_image_caption: supaBld.hero_image_caption || meta.hero_image_caption || localBld?.hero_image_caption,
              image_details: supaBld.image_details || meta.image_details || localBld?.image_details,
              seo_title: supaBld.seo_title || meta.seo_title || localBld?.seo_title,
              seo_description: supaBld.seo_description || meta.seo_description || localBld?.seo_description,
              seo_keywords: supaBld.seo_keywords || meta.seo_keywords || localBld?.seo_keywords,
              canonical_url: supaBld.canonical_url || meta.canonical_url || localBld?.canonical_url,
              og_title: supaBld.og_title || meta.og_title || localBld?.og_title,
              og_description: supaBld.og_description || meta.og_description || localBld?.og_description,
              og_image: supaBld.og_image || meta.og_image || localBld?.og_image,
              hyperlinks: supaBld.hyperlinks || meta.hyperlinks || localBld?.hyperlinks || [],
              available_floors: meta.available_floors !== undefined ? meta.available_floors : (supaBld.available_floors?.startsWith('__meta:') ? null : supaBld.available_floors),
              structure_display: supaBld.structure_display || meta.structure_display || localBld?.structure_display,
              basement_floors: supaBld.basement_floors || meta.basement_floors || localBld?.basement_floors,
              ground_option: supaBld.ground_option || meta.ground_option || localBld?.ground_option,
              towers: (Array.isArray(supaBld.towers) && supaBld.towers.length > 0) ? supaBld.towers : (meta.towers || localBld?.towers || []),
              tower_details: supaBld.tower_details || meta.tower_details || localBld?.tower_details,
              categories: (Array.isArray(supaBld.categories) && supaBld.categories.length > 0) ? supaBld.categories : (meta.categories || localBld?.categories || [supaBld.category || 'office-space']),
              locations: (Array.isArray(supaBld.locations) && supaBld.locations.length > 0) ? supaBld.locations : (meta.locations || localBld?.locations || (supaBld.location_id ? [supaBld.location_id] : [])),
              location_names: (Array.isArray(supaBld.location_names) && supaBld.location_names.length > 0) ? supaBld.location_names : (meta.location_names || localBld?.location_names || (supaBld.location_name ? [supaBld.location_name] : []))
            };

            combined.structure_display = getBuildingStructureDisplay(combined);
            combined.property_count = Math.max(combined.property_count || 0, 20);
            return combined;
          });

          // Sync back to local storage cache so next render is consistent
          try {
            safeSetItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(mergedList));
          } catch (e) {
            // ignore
          }

          _memBuildings = mergedList;
          return mergedList;
        }
      } catch (e) {
        console.warn('Falling back to local storage for buildings:', e);
      }
    }

    const existingIds = new Set(localBuildings.map(b => b.id));
    const existingSlugs = new Set(localBuildings.map(b => b.slug.toLowerCase()));
    const missing = INITIAL_BUILDINGS.filter(b => !existingIds.has(b.id) && !existingSlugs.has(b.slug.toLowerCase()));
    const source = [...localBuildings, ...missing];
    const finalBlds = source.map(b => ({
      ...b,
      structure_display: getBuildingStructureDisplay(b),
      property_count: Math.max(b.property_count || 0, 20)
    }));
    _memBuildings = finalBlds;
    return finalBlds;
  },

  async getBuildingBySlug(slug: string): Promise<Building | null> {
    if (!slug) return null;
    const initial = this.getInitialBuildingBySlug(slug);
    if (isSupabaseConfigured && supabase) {
      try {
        const buildings = await this.getBuildings();
        return buildings.find(b => b.slug.toLowerCase() === slug.toLowerCase()) || initial;
      } catch {
        return initial;
      }
    }
    return initial;
  },

  async getBuildingsByLocation(locationId: string): Promise<Building[]> {
    const buildings = await this.getBuildings();
    return buildings.filter(b => b.location_id === locationId || (b.locations && b.locations.includes(locationId)));
  },

  async saveBuilding(building: Building): Promise<void> {
    const structureDisplay = getBuildingStructureDisplay(building);
    const sanitized: Building = {
      ...building,
      location_id: (building.location_id && String(building.location_id).trim() !== '') ? building.location_id : null as any,
      locations: Array.isArray(building.locations) ? building.locations : (building.location_id ? [building.location_id] : []),
      location_names: Array.isArray(building.location_names) ? building.location_names : (building.location_name ? [building.location_name] : []),
      category: building.category || (building.categories && building.categories[0]) || 'office-space',
      categories: Array.isArray(building.categories) && building.categories.length > 0 ? building.categories : [building.category || 'office-space'],
      total_floors: Number(building.total_floors) || 1,
      basement_floors: building.basement_floors || '2 Basements (2B)',
      ground_option: building.ground_option || 'Ground (G)',
      structure_display: structureDisplay,
      sale_range: (building.sale_range && String(building.sale_range).trim() !== '') ? building.sale_range : null as any,
      gallery: Array.isArray(building.gallery) ? building.gallery : [],
      towers: Array.isArray(building.towers) ? building.towers : [],
    };

    try {
      const buildings = await this.getBuildings();
      const index = buildings.findIndex(b => b.id === sanitized.id);
      if (index >= 0) {
        buildings[index] = sanitized;
      } else {
        buildings.push(sanitized);
      }
      safeSetItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(buildings));
      _memBuildings = buildings;
    } catch (e) {
      console.warn('LocalStorage save warning for buildings:', e);
    }

    // Always update in-memory cache so zero-delay getters reflect changes immediately
    if (_memBuildings) {
      const memIndex = _memBuildings.findIndex(b => b.id === sanitized.id);
      if (memIndex >= 0) _memBuildings[memIndex] = sanitized;
      else _memBuildings.push(sanitized);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('buildings').upsert(sanitized);
        if (error) {
          // If upsert fails due to missing optional columns on Supabase, attempt fallback with core schema columns and encode metadata
          console.warn('Supabase upsert building error, trying fallback with base columns and packed metadata:', error);
          const metaPayload = {
            available_floors: sanitized.available_floors || null,
            structure_display: sanitized.structure_display,
            basement_floors: sanitized.basement_floors,
            ground_option: sanitized.ground_option,
            towers: sanitized.towers,
            total_towers: sanitized.total_towers,
            tower_details: sanitized.tower_details,
            categories: sanitized.categories,
            locations: sanitized.locations,
            location_names: sanitized.location_names,
            building_name: sanitized.building_name,
            block_name: sanitized.block_name,
            tower_number: sanitized.tower_number,
            sector: sanitized.sector,
            gmaps_direction: sanitized.gmaps_direction,
            status: sanitized.status,
            short_description: sanitized.short_description,
            overview: sanitized.overview,
            location_connectivity: sanitized.location_connectivity,
            specs: sanitized.specs,
            hero_image_alt: sanitized.hero_image_alt,
            hero_image_title: sanitized.hero_image_title,
            hero_image_caption: sanitized.hero_image_caption,
            image_details: sanitized.image_details,
            seo_title: sanitized.seo_title,
            seo_description: sanitized.seo_description,
            seo_keywords: sanitized.seo_keywords,
            canonical_url: sanitized.canonical_url,
            og_title: sanitized.og_title,
            og_description: sanitized.og_description,
            og_image: sanitized.og_image,
            hyperlinks: sanitized.hyperlinks,
          };
          const basePayload = {
            id: sanitized.id,
            name: sanitized.name,
            slug: sanitized.slug,
            location_id: sanitized.location_id,
            location_name: sanitized.location_name,
            category: sanitized.category,
            address: sanitized.address,
            description: sanitized.description,
            hero_image: sanitized.hero_image,
            gallery: sanitized.gallery,
            total_floors: sanitized.total_floors,
            available_floors: '__meta:' + JSON.stringify(metaPayload),
            size_range: sanitized.size_range,
            rent_range: sanitized.rent_range || null,
            sale_range: sanitized.sale_range || null,
            furnishing_options: sanitized.furnishing_options,
            parking: sanitized.parking,
            lifts: sanitized.lifts,
            security: sanitized.security,
            power_backup: sanitized.power_backup,
            amenities: sanitized.amenities,
            nearby_landmarks: sanitized.nearby_landmarks,
            nearby_transport: sanitized.nearby_transport,
            published: sanitized.published,
            property_count: sanitized.property_count || 0
          };
          const fallbackRes = await supabase.from('buildings').upsert(basePayload);
          if (fallbackRes.error) {
            console.warn('Supabase fallback upsert warning (local saved successfully):', fallbackRes.error);
          }
        }
      } catch (e) {
        console.warn('Supabase upsert building network warning (local saved successfully):', e);
      }
    }
  },

  async deleteBuilding(buildingId: string): Promise<void> {
    try {
      const buildings = await this.getBuildings();
      const updated = buildings.filter(b => b.id !== buildingId);
      safeSetItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(updated));
      _memBuildings = updated;
    } catch (e) {
      console.warn('LocalStorage delete warning for buildings:', e);
    }

    if (_memBuildings) {
      _memBuildings = _memBuildings.filter(b => b.id !== buildingId);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('buildings').delete().eq('id', buildingId);
      } catch (e) {
        console.warn('Supabase delete building warning:', e);
      }
    }
  },

  // PROPERTIES
  async getProperties(): Promise<Property[]> {
    let localProps: Property[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      if (stored) localProps = JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading local properties:', e);
    }

    let baseProps = localProps.length > 0 ? localProps : INITIAL_PROPERTIES;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('properties').select('*') as any);
        if (!error && data && data.length > 0) {
          baseProps = (data as any[]).map(supaProp => {
            const localProp = localProps.find(lp => lp.id === supaProp.id || lp.slug === supaProp.slug);
            return {
              ...supaProp,
              ...(localProp || {}),
              tower: supaProp.tower || localProp?.tower || null,
              block_name: supaProp.block_name || localProp?.block_name,
              unit_number: supaProp.unit_number || localProp?.unit_number,
              sector: supaProp.sector || localProp?.sector,
              rent_price: supaProp.rent_price || localProp?.rent_price,
              sale_price: supaProp.sale_price || localProp?.sale_price,
              short_description: supaProp.short_description || localProp?.short_description,
              overview: supaProp.overview || localProp?.overview,
              location_connectivity: supaProp.location_connectivity || localProp?.location_connectivity,
              highlights: supaProp.highlights || localProp?.highlights,
              primary_image_alt: supaProp.primary_image_alt || localProp?.primary_image_alt,
              primary_image_title: supaProp.primary_image_title || localProp?.primary_image_title,
              primary_image_caption: supaProp.primary_image_caption || localProp?.primary_image_caption,
              image_details: supaProp.image_details || localProp?.image_details,
              seo_title: supaProp.seo_title || localProp?.seo_title,
              seo_description: supaProp.seo_description || localProp?.seo_description,
              seo_keywords: supaProp.seo_keywords || localProp?.seo_keywords,
              canonical_url: supaProp.canonical_url || localProp?.canonical_url,
              og_title: supaProp.og_title || localProp?.og_title,
              og_description: supaProp.og_description || localProp?.og_description,
              og_image: supaProp.og_image || localProp?.og_image,
              hyperlinks: supaProp.hyperlinks || localProp?.hyperlinks || [],
            };
          });

          try {
            safeSetItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(baseProps));
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        console.warn('Falling back to local storage for properties:', e);
      }
    }

    // Merge standard available unit tiers for all buildings
    const buildings = await this.getBuildings();
    const allGenerated = buildings.flatMap(b => generateAvailablePropertiesForBuilding(b));
    const existingIds = new Set(baseProps.map(p => p.id));
    const existingSlugs = new Set(baseProps.map(p => p.slug.toLowerCase()));
    const missingGenerated = allGenerated.filter(p => !existingIds.has(p.id) && !existingSlugs.has(p.slug.toLowerCase()));
    const cleanedBaseProps = baseProps.map(p => ({
      ...p,
      title: p.title.replace(/\s+in\s+I-Thum\s+Tower\s+[A-Za-z0-9-]+\b/i, ' in I-Thum'),
      address: cleanPropertyAddress(p.address, p.building_name)
    }));

    const finalProps = [...cleanedBaseProps, ...missingGenerated];
    _memProperties = finalProps;
    return finalProps;
  },

  async getPropertyBySlug(slug: string): Promise<Property | null> {
    if (!slug) return null;
    const initial = this.getInitialPropertyBySlug(slug);
    if (isSupabaseConfigured && supabase) {
      try {
        const properties = await this.getProperties();
        const found = properties.find(p => p.slug.toLowerCase() === slug.toLowerCase());
        if (found) return found;

        const buildings = await this.getBuildings();
        for (const bld of buildings) {
          const units = generateAvailablePropertiesForBuilding(bld);
          const match = units.find(u => u.slug.toLowerCase() === slug.toLowerCase());
          if (match) return match;
        }
      } catch {
        return initial;
      }
    }
    return initial;
  },

  async getPropertiesByBuilding(buildingId: string): Promise<Property[]> {
    const buildings = await this.getBuildings();
    const building = buildings.find(b => b.id === buildingId || b.slug.toLowerCase() === buildingId.toLowerCase());
    const allProps = await this.getProperties();
    const existing = allProps.filter(p => p.building_id === buildingId || (building && (p.building_name?.toLowerCase() === building.name.toLowerCase() || p.building_id === building.id)));

    if (!building) return existing;

    const standardUnits = generateAvailablePropertiesForBuilding(building);
    const existingAreas = new Set(existing.map(p => p.built_up_area));
    const merged = [
      ...existing,
      ...standardUnits.filter(u => !existingAreas.has(u.built_up_area))
    ];

    return merged.sort((a, b) => a.built_up_area - b.built_up_area);
  },

  async getPropertiesByLocation(locationId: string): Promise<Property[]> {
    const properties = await this.getProperties();
    return properties.filter(p => p.location_id === locationId);
  },

  async getPropertiesByCategory(category: string): Promise<Property[]> {
    const properties = await this.getProperties();
    return properties.filter(p => p.category === category);
  },

  async saveProperty(property: Property): Promise<void> {
    const sanitized: Property = {
      ...property,
      category: property.category || 'office-space',
      property_type: property.property_type || 'Commercial Office',
      building_id: (property.building_id && String(property.building_id).trim() !== '') ? property.building_id : null as any,
      building_name: property.building_id ? (property.building_name || null as any) : null as any,
      tower: property.tower || null as any,
      location_id: (property.location_id && String(property.location_id).trim() !== '') ? property.location_id : null as any,
      carpet_area: (property.carpet_area && !isNaN(Number(property.carpet_area))) ? Number(property.carpet_area) : null as any,
      land_area: (property.land_area && !isNaN(Number(property.land_area))) ? Number(property.land_area) : null as any,
      area_unit: property.area_unit || 'sq.ft',
      price: Number(property.price) || 0,
      built_up_area: Number(property.built_up_area) || 0,
      floor: property.floor || 'Ground',
      total_floors: (property.total_floors && !isNaN(Number(property.total_floors))) ? Number(property.total_floors) : null as any,
      power_load: property.power_load || '',
      road_width: property.road_width || '',
      possession: property.possession || 'Ready to Move',
      parking: property.parking || '',
      features: Array.isArray(property.features) ? property.features : [],
      amenities: Array.isArray(property.amenities) ? property.amenities : [],
      gallery: Array.isArray(property.gallery) ? property.gallery : [],
      block_name: property.block_name || null,
      unit_number: property.unit_number || null,
      sector: property.sector || null,
      rent_price: property.rent_price || null,
      sale_price: property.sale_price || null,
      short_description: property.short_description || null,
      overview: property.overview || null,
      location_connectivity: property.location_connectivity || null,
      highlights: property.highlights || null,
      primary_image_alt: property.primary_image_alt || null,
      primary_image_title: property.primary_image_title || null,
      primary_image_caption: property.primary_image_caption || null,
      image_details: property.image_details || [],
      seo_title: property.seo_title || null,
      seo_description: property.seo_description || null,
      seo_keywords: property.seo_keywords || null,
      canonical_url: property.canonical_url || null,
      og_title: property.og_title || null,
      og_description: property.og_description || null,
      og_image: property.og_image || null,
      hyperlinks: property.hyperlinks || [],
    };

    try {
      const properties = await this.getProperties();
      const index = properties.findIndex(p => p.id === sanitized.id);
      if (index >= 0) {
        properties[index] = sanitized;
      } else {
        properties.unshift(sanitized);
      }
      safeSetItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
      _memProperties = properties;
    } catch (e) {
      console.warn('LocalStorage save warning for properties (quota safe):', e);
    }

    // Always update in-memory cache so zero-delay getters reflect changes immediately
    if (_memProperties) {
      const memIndex = _memProperties.findIndex(p => p.id === sanitized.id);
      if (memIndex >= 0) _memProperties[memIndex] = sanitized;
      else _memProperties.unshift(sanitized);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('properties').upsert(sanitized);
        if (error) {
          console.warn('Supabase upsert property error, trying fallback without optional fields:', error);
          const { 
            tower, block_name, unit_number, sector, rent_price, sale_price,
            short_description, overview, location_connectivity, highlights,
            primary_image_alt, primary_image_title, primary_image_caption,
            image_details, seo_title, seo_description, seo_keywords,
            canonical_url, og_title, og_description, og_image, hyperlinks,
            ...basePayload 
          } = sanitized as any;
          const fallbackRes = await supabase.from('properties').upsert(basePayload);
          if (fallbackRes.error) {
            console.warn('Supabase fallback upsert property warning (local saved successfully):', fallbackRes.error);
          }
        }
      } catch (e) {
        console.warn('Supabase upsert property network warning (local saved successfully):', e);
      }
    }
  },

  async deleteProperty(propertyId: string): Promise<void> {
    try {
      const properties = await this.getProperties();
      const updated = properties.filter(p => p.id !== propertyId);
      safeSetItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updated));
      _memProperties = updated;
    } catch (e) {
      console.warn('LocalStorage delete warning for properties:', e);
    }

    if (_memProperties) {
      _memProperties = _memProperties.filter(p => p.id !== propertyId);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('properties').delete().eq('id', propertyId);
      } catch (e) {
        console.warn('Supabase delete property warning:', e);
      }
    }
  },

  // LEADS & INQUIRIES
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('leads').select('*').order('created_at', { ascending: false }) as any);
        if (!error && data && data.length > 0) return data as Lead[];
      } catch (e) {
        console.warn('Falling back to local storage for leads:', e);
      }
    }
    return this.getInitialLeads();
  },

  async createLead(leadData: Omit<Lead, 'id' | 'created_at' | 'status'>): Promise<Lead> {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: 'New',
      created_at: new Date().toISOString(),
    };

    // Quota-safe LocalStorage backup
    try {
      const leads = await this.getLeads();
      leads.unshift(newLead);
      // Keep only recent 40 leads in local cache to prevent quota overload
      const trimmed = leads.slice(0, 40);
      try {
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(trimmed));
      } catch (quotaError) {
        // If quota exceeded, strip heavy data URLs for local cache
        const lightweight = trimmed.map(l => ({
          ...l,
          images: (l.images || []).map(img => img.startsWith('data:') ? '[uploaded image]' : img),
          list_property_details: l.list_property_details ? {
            ...l.list_property_details,
            images: (l.list_property_details.images || []).map(img => img.startsWith('data:') ? '[uploaded image]' : img)
          } : undefined
        }));
        try {
          localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(lightweight.slice(0, 20)));
        } catch (innerErr) {
          console.warn('LocalStorage leads cache bypassed due to storage limits:', innerErr);
        }
      }
    } catch (e) {
      console.warn('LocalStorage lead warning:', e);
    }

    // Supabase Persistence
    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, any> = {
          id: newLead.id,
          lead_type: newLead.lead_type,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          preferred_contact_method: newLead.preferred_contact_method || 'phone',
          message: newLead.message || null,
          property_id: newLead.property_id || null,
          property_title: newLead.property_title || null,
          building_id: newLead.building_id || null,
          building_name: newLead.building_name || null,
          location_id: newLead.location_id || null,
          location_name: newLead.location_name || null,
          requirement_details: newLead.requirement_details || null,
          list_property_details: newLead.list_property_details || null,
          images: newLead.images || [],
          preferred_visit_date: newLead.preferred_visit_date || null,
          preferred_visit_time: newLead.preferred_visit_time || null,
          source_page: newLead.source_page || null,
          lead_source: newLead.lead_source || 'website',
          status: newLead.status || 'New',
          notes: newLead.notes || null,
          assigned_agent: newLead.assigned_agent || null,
          created_at: newLead.created_at,
        };

        const { error } = await supabase.from('leads').insert(payload);
        if (error) {
          console.warn('Supabase insert lead issue:', error.message);
          // If column mismatch on images, retry without top-level images column
          if (error.message && error.message.includes('images')) {
            delete payload.images;
            await supabase.from('leads').insert(payload);
          }
        }
      } catch (e) {
        console.error('Supabase insert lead error:', e);
      }
    }

    return newLead;
  },

  async updateLeadStatus(leadId: string, status: LeadStatus, notes?: string): Promise<void> {
    const leads = await this.getLeads();
    const index = leads.findIndex(l => l.id === leadId);
    if (index >= 0) {
      leads[index].status = status;
      if (notes !== undefined) {
        leads[index].notes = notes;
      }
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('leads').update({ status, ...(notes !== undefined ? { notes } : {}) }).eq('id', leadId);
      } catch (e) {
        console.error('Supabase update lead error:', e);
      }
    }
  },

  // GUIDES & MARKET INSIGHTS
  getInitialGuides(): MarketGuide[] {
    if (_memGuides && _memGuides.length > 0) return _memGuides;
    try {
      const data = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.GUIDES) : null;
      const localGuides: MarketGuide[] = data ? JSON.parse(data) : INITIAL_MARKET_GUIDES;
      _memGuides = localGuides;
      return _memGuides;
    } catch {
      return INITIAL_MARKET_GUIDES;
    }
  },

  getInitialGuideBySlug(slug?: string): MarketGuide | null {
    if (!slug) return null;
    const guides = this.getInitialGuides();
    return guides.find(g => g.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  async getGuides(): Promise<MarketGuide[]> {
    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await withTimeout(supabase.from('guides').select('*') as any);
          if (!error && Array.isArray(data) && data.length > 0) {
            const parsed = data.map((item: any) => ({
              ...item,
              image: item.featured_image_url || item.image,
              featured_image_url: item.featured_image_url || item.image,
              hyperlinks: Array.isArray(item.hyperlinks) ? item.hyperlinks : []
            }));
            _memGuides = parsed;
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(parsed));
            }
            return parsed;
          }
        } catch (sbErr) {
          console.warn('Supabase guides read fallback:', sbErr);
        }
      }
      const local = this.getInitialGuides();
      return local;
    } catch {
      return INITIAL_MARKET_GUIDES;
    }
  },

  async getGuideBySlug(slug: string): Promise<MarketGuide | null> {
    const guides = await this.getGuides();
    return guides.find(g => g.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  async saveGuide(guide: MarketGuide): Promise<MarketGuide> {
    const guides = await this.getGuides();
    const existingIndex = guides.findIndex(g => g.id === guide.id);
    let updatedGuides: MarketGuide[];

    const sanitizedGuide: MarketGuide = {
      ...guide,
      image: guide.featured_image_url || guide.image,
      featured_image_url: guide.featured_image_url || guide.image,
      hyperlinks: Array.isArray(guide.hyperlinks) ? guide.hyperlinks : []
    };

    if (existingIndex >= 0) {
      updatedGuides = [...guides];
      updatedGuides[existingIndex] = { ...sanitizedGuide, updated_at: new Date().toISOString() };
    } else {
      updatedGuides = [{ ...sanitizedGuide, created_at: sanitizedGuide.created_at || new Date().toISOString() }, ...guides];
    }

    _memGuides = updatedGuides;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(updatedGuides));
    }

    // Upsert to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('guides').upsert(sanitizedGuide);
      } catch (err) {
        console.warn('Supabase guides upsert fallback:', err);
      }
    }

    return sanitizedGuide;
  },

  async deleteGuide(guideId: string): Promise<boolean> {
    const guides = await this.getGuides();
    const targetGuide = guides.find(g => g.id === guideId);
    const filtered = guides.filter(g => g.id !== guideId);
    _memGuides = filtered;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(filtered));
    }

    // Clean up Supabase image if applicable
    if (targetGuide?.featured_image_url) {
      this.deleteBlogImage(targetGuide.featured_image_url).catch(() => {});
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('guides').delete().eq('id', guideId);
      } catch (err) {
        console.warn('Supabase guides delete fallback:', err);
      }
    }

    return true;
  },

  /**
   * Uploads a blog featured image to Supabase Storage ('blog-images' bucket)
   * if configured, with graceful fallback to high-quality compressed data URL.
   */
  async uploadBlogImage(file: File, previousImageUrl?: string): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `featured/${cleanName}`;

        const { data, error } = await supabase.storage
          .from('blog-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('blog-images')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            // Remove previous image from Supabase storage if it was stored there
            if (previousImageUrl && previousImageUrl.includes('blog-images')) {
              try {
                const parts = previousImageUrl.split('blog-images/');
                if (parts.length > 1) {
                  const oldPath = decodeURIComponent(parts[1].split('?')[0]);
                  await supabase.storage.from('blog-images').remove([oldPath]);
                }
              } catch (remErr) {
                console.warn('Failed to clean up old blog image:', remErr);
              }
            }
            return publicUrlData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload failed, falling back to local compressed image:', storageErr);
      }
    }

    // Fallback: Compress locally as Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1400;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  },

  async deleteBlogImage(imageUrl: string): Promise<void> {
    if (!imageUrl || !isSupabaseConfigured || !supabase) return;
    if (imageUrl.includes('blog-images')) {
      try {
        const parts = imageUrl.split('blog-images/');
        if (parts.length > 1) {
          const oldPath = decodeURIComponent(parts[1].split('?')[0]);
          await supabase.storage.from('blog-images').remove([oldPath]);
        }
      } catch (err) {
        console.warn('Failed to delete blog image from storage:', err);
      }
    }
  },

  // Reset database back to default seed data
  resetDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(INITIAL_BUILDINGS));
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
    localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(INITIAL_MARKET_GUIDES));
  }
};
