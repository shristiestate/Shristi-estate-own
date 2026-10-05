import { Location, Building, Property, Lead, LeadStatus, MarketGuide, ClientLogo, InstagramReel } from '../types';
import { INITIAL_LOCATIONS, INITIAL_BUILDINGS, INITIAL_PROPERTIES, INITIAL_LEADS, INITIAL_MARKET_GUIDES, INITIAL_CLIENTS, INITIAL_INSTAGRAM_REELS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getBuildingStructureDisplay } from '../utils/textFormat';
import { generateAvailablePropertiesForBuilding } from '../utils/buildingUnits';
import { cleanPropertyAddress } from '../utils/propertyLocation';

const STORAGE_KEYS = {
  LOCATIONS: 'shristi_locations_v1',
  BUILDINGS: 'shristi_buildings_v1',
  PROPERTIES: 'shristi_properties_v1',
  DELETED_PROPERTIES: 'shristi_deleted_properties_v1',
  LEADS: 'shristi_leads_v1',
  GUIDES: 'shristi_guides_v1',
  CLIENTS: 'shristi_clients_v1',
  REELS: 'shristi_reels_v1',
};

let _memLocations: Location[] | null = null;
let _memBuildings: Building[] | null = null;
let _memProperties: Property[] | null = null;
let _memDeletedProperties: Set<string> | null = null;
let _memLeads: Lead[] | null = null;
let _memGuides: MarketGuide[] | null = null;
let _memClients: ClientLogo[] | null = null;
let _memReels: InstagramReel[] | null = null;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const _cache = new Map<string, CacheEntry<any>>();
const _inFlight = new Map<string, Promise<any>>();
const DEFAULT_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

function getCached<T>(key: string, ttlMs = DEFAULT_CACHE_TTL_MS): T | null {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    _cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  _cache.set(key, { data, timestamp: Date.now() });
}

export function clearStorageCache(prefix?: string): void {
  if (!prefix) {
    _cache.clear();
    return;
  }
  for (const k of Array.from(_cache.keys())) {
    if (k.startsWith(prefix)) _cache.delete(k);
  }
}

function dedupeRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = _inFlight.get(key);
  if (existing) return existing;
  const promise = fetcher().finally(() => {
    _inFlight.delete(key);
  });
  _inFlight.set(key, promise);
  return promise;
}

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
      // 3. Compact bulky base64 data from cached items if quota is still exceeded
      try {
        if (key === STORAGE_KEYS.BUILDINGS) {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const compacted = parsed.map((b: any) => ({
              ...b,
              gallery: Array.isArray(b.gallery)
                ? b.gallery.filter((img: string) => typeof img === 'string' && (img.startsWith('http') || img.length < 50000))
                : b.gallery
            }));
            localStorage.setItem(key, JSON.stringify(compacted));
            return true;
          }
        } else if (key === STORAGE_KEYS.PROPERTIES) {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const compacted = parsed.map((p: any) => ({
              ...p,
              gallery: Array.isArray(p.gallery)
                ? p.gallery.filter((img: string) => typeof img === 'string' && (img.startsWith('http') || img.length < 50000))
                : p.gallery
            }));
            localStorage.setItem(key, JSON.stringify(compacted));
            return true;
          }
        }
      } catch (thirdErr) {
        console.warn(`LocalStorage compact save also failed for "${key}":`, thirdErr);
      }
      console.warn(`LocalStorage quota still exceeded for "${key}". Memory cache remains fully active.`, secondErr);
      return false;
    }
  }
};

// Tombstone tracker for deleted properties & units
const getDeletedPropertyIdsSet = (): Set<string> => {
  if (_memDeletedProperties) return _memDeletedProperties;
  const set = new Set<string>();
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DELETED_PROPERTIES);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) list.forEach(id => set.add(id));
      }
    } catch {
      // ignore
    }
  }
  const blds = _memBuildings || [];
  for (const b of blds) {
    if (Array.isArray(b.deleted_unit_ids)) {
      b.deleted_unit_ids.forEach(id => set.add(id));
    }
  }
  _memDeletedProperties = set;
  return _memDeletedProperties;
};

const recordDeletedPropertyId = (id: string) => {
  if (!id) return;
  const set = getDeletedPropertyIdsSet();
  set.add(id);
  _memDeletedProperties = set;
  if (typeof window !== 'undefined') {
    try {
      safeSetItem(STORAGE_KEYS.DELETED_PROPERTIES, JSON.stringify(Array.from(set)));
    } catch {
      // ignore
    }
  }
};

const clearDeletedPropertyId = (id: string) => {
  if (!id) return;
  const set = getDeletedPropertyIdsSet();
  set.delete(id);
  _memDeletedProperties = set;
  if (typeof window !== 'undefined') {
    try {
      safeSetItem(STORAGE_KEYS.DELETED_PROPERTIES, JSON.stringify(Array.from(set)));
    } catch {
      // ignore
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
        property_count: typeof b.property_count === 'number' ? b.property_count : 20
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
        property_count: typeof b.property_count === 'number' ? b.property_count : Math.max(0, 20 - (b.deleted_unit_ids?.length || 0))
      }));
    }

    const storedProps = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    const deletedSet = getDeletedPropertyIdsSet();
    if (!storedProps) {
      _memProperties = [
        ...INITIAL_PROPERTIES.filter(p => !deletedSet.has(p.id)),
        ...INITIAL_BUILDINGS.flatMap(b => generateAvailablePropertiesForBuilding(b, deletedSet)).filter(p => !deletedSet.has(p.id))
      ];
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(_memProperties));
    } else {
      const parsedProps: Property[] = JSON.parse(storedProps);
      const buildings = _memBuildings || INITIAL_BUILDINGS;
      const allGenerated = buildings.flatMap(b => generateAvailablePropertiesForBuilding(b, deletedSet));
      const existingIds = new Set(parsedProps.map(p => p.id));
      const existingSlugs = new Set(parsedProps.map(p => p.slug.toLowerCase()));
      const missingGenerated = allGenerated.filter(p => !existingIds.has(p.id) && !existingSlugs.has(p.slug.toLowerCase()) && !deletedSet.has(p.id));
      const cleanedExisting = parsedProps.filter(p => !deletedSet.has(p.id)).map(p => ({
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
      property_count: typeof b.property_count === 'number' ? b.property_count : 20
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
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => initStorage(), { timeout: 3000 });
  } else {
    setTimeout(initStorage, 200);
  }
}

export const StorageService = {
  getDeletedPropertyIds(): Set<string> {
    return getDeletedPropertyIdsSet();
  },

  saveDeletedPropertyId(id: string): void {
    recordDeletedPropertyId(id);
  },

  unmarkDeletedPropertyId(id: string): void {
    clearDeletedPropertyId(id);
  },

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
        property_count: typeof b.property_count === 'number' ? b.property_count : Math.max(0, 20 - (b.deleted_unit_ids?.length || 0))
      }));
      return _memBuildings;
    } catch {
      return INITIAL_BUILDINGS.map(b => ({
        ...b,
        structure_display: getBuildingStructureDisplay(b),
        property_count: typeof b.property_count === 'number' ? b.property_count : 20
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

  /**
   * Dynamically calculates the accurate number of available units for a building,
   * properly accounting for deleted units, custom added units, and standard templates.
   */
  getBuildingUnitCount(building?: Building | null): number {
    if (!building) return 0;
    const deletedList = Array.isArray(building.deleted_unit_ids) ? building.deleted_unit_ids : [];
    const globalDeletedSet = getDeletedPropertyIdsSet();
    if (deletedList.length > 0 || globalDeletedSet.size > 0) {
      try {
        const active = this.getInitialPropertiesByBuilding(building.id);
        return active.length;
      } catch {
        return Math.max(0, (typeof building.property_count === 'number' ? building.property_count : 20) - deletedList.length);
      }
    }
    if (typeof building.property_count === 'number' && building.property_count >= 0) {
      return building.property_count;
    }
    return 20;
  },

  getInitialProperties(): Property[] {
    if (_memProperties && _memProperties.length > 0) return _memProperties;
    try {
      const deletedSet = getDeletedPropertyIdsSet();
      let localProps: Property[] = [];
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.PROPERTIES) : null;
      if (stored) localProps = JSON.parse(stored);
      const baseProps = localProps.length > 0 ? localProps : INITIAL_PROPERTIES;
      const buildings = this.getInitialBuildings();
      const allGenerated = buildings.flatMap(b => generateAvailablePropertiesForBuilding(b));
      const existingIds = new Set(baseProps.map(p => p.id));
      const existingSlugs = new Set(baseProps.map(p => p.slug.toLowerCase()));
      const missingGenerated = allGenerated.filter(p => !existingIds.has(p.id) && !existingSlugs.has(p.slug.toLowerCase()) && !deletedSet.has(p.id));
      const cleanedBaseProps = baseProps.filter(p => !deletedSet.has(p.id)).map(p => ({
        ...p,
        title: p.title.replace(/\s+in\s+I-Thum\s+Tower\s+[A-Za-z0-9-]+\b/i, ' in I-Thum'),
        address: cleanPropertyAddress(p.address, p.building_name)
      }));
      _memProperties = [...cleanedBaseProps, ...missingGenerated];
      return _memProperties;
    } catch {
      const deletedSet = getDeletedPropertyIdsSet();
      return INITIAL_PROPERTIES.filter(p => !deletedSet.has(p.id));
    }
  },

  getInitialPropertyBySlug(slug?: string): Property | null {
    if (!slug) return null;
    const properties = this.getInitialProperties();
    const found = properties.find(p => p.slug.toLowerCase() === slug.toLowerCase());
    if (found) return found;

    const buildings = this.getInitialBuildings();
    const deletedSet = getDeletedPropertyIdsSet();
    for (const bld of buildings) {
      const units = generateAvailablePropertiesForBuilding(bld, deletedSet);
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
    const deletedSet = getDeletedPropertyIdsSet();
    const bldDeleted = new Set(building?.deleted_unit_ids || []);
    const existing = allProps.filter(p => 
      !deletedSet.has(p.id) && 
      !bldDeleted.has(p.id) && 
      (p.building_id === buildingId || (building && (p.building_name?.toLowerCase() === building.name.toLowerCase() || p.building_id === building.id)))
    );

    if (!building) return existing;

    const standardUnits = generateAvailablePropertiesForBuilding(building, deletedSet);
    const existingAreas = new Set(existing.map(p => p.built_up_area));
    const merged = [
      ...existing,
      ...standardUnits.filter(u => !existingAreas.has(u.built_up_area) && !deletedSet.has(u.id) && !bldDeleted.has(u.id))
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

  // COMPOSITE HOMEPAGE BUNDLE (Ultra-fast single-roundtrip query for Homepage)
  async getHomepageBundle(): Promise<{
    locations: Location[];
    buildings: Building[];
    properties: Property[];
    guides: MarketGuide[];
  }> {
    const cached = getCached<any>('homepage_bundle');
    if (cached) return cached;

    return dedupeRequest('homepage_bundle', async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await withTimeout(supabase.rpc('get_homepage_bundle') as any);
          if (!error && data) {
            const locs: Location[] = Array.isArray(data.locations) ? data.locations : [];
            const blds: Building[] = Array.isArray(data.buildings) ? data.buildings.map((b: any) => ({
              ...b,
              structure_display: getBuildingStructureDisplay(b),
              property_count: typeof b.property_count === 'number' ? b.property_count : Math.max(0, 20 - (b.deleted_unit_ids?.length || 0))
            })) : [];
            const props: Property[] = Array.isArray(data.properties) ? data.properties : [];
            const gds: MarketGuide[] = Array.isArray(data.guides) ? data.guides : [];

            if (locs.length > 0) _memLocations = locs;
            if (blds.length > 0) _memBuildings = blds;
            if (props.length > 0) _memProperties = props;
            if (gds.length > 0) _memGuides = gds;

            const bundle = { locations: locs, buildings: blds, properties: props, guides: gds };
            setCache('homepage_bundle', bundle);
            return bundle;
          }
        } catch (e) {
          console.warn('getHomepageBundle fallback:', e);
        }
      }
      return {
        locations: this.getInitialLocations(),
        buildings: this.getInitialBuildings(),
        properties: this.getInitialProperties(),
        guides: this.getInitialGuides(),
      };
    });
  },

  // ASYNC LOCATIONS WITH BACKGROUND FALLBACK & TTL CACHE
  async getLocations(): Promise<Location[]> {
    const cached = getCached<Location[]>('locations_all');
    if (cached) return cached;

    return dedupeRequest('locations_all', async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await withTimeout(
            supabase.from('locations')
              .select('id, name, slug, city, region, description, hero_image, building_count, property_count, categories, featured, created_at')
              .order('featured', { ascending: false })
              .order('name', { ascending: true }) as any
          );
          if (!error && data && data.length > 0) {
            _memLocations = data as Location[];
            setCache('locations_all', _memLocations);
            safeSetItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(_memLocations));
            return _memLocations;
          }
        } catch (e) {
          console.warn('Falling back to local storage for locations:', e);
        }
      }
      return this.getInitialLocations();
    });
  },

  async getLocationBySlug(slug: string): Promise<Location | null> {
    if (!slug) return null;
    const initial = this.getInitialLocationBySlug(slug);
    const cacheKey = `loc_slug_${slug.toLowerCase()}`;
    const cached = getCached<Location>(cacheKey);
    if (cached) return cached;

    return dedupeRequest(cacheKey, async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await withTimeout(
            supabase.from('locations').select('*').eq('slug', slug).maybeSingle() as any
          );
          if (!error && data) {
            setCache(cacheKey, data as Location);
            return data as Location;
          }
        } catch (e) {
          console.warn('getLocationBySlug fallback:', e);
        }
      }
      return initial;
    });
  },

  async saveLocation(location: Location): Promise<void> {
    clearStorageCache('loc');
    clearStorageCache('homepage');
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
    clearStorageCache('loc');
    clearStorageCache('homepage');
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

  // BUILDINGS - OPTIMIZED WITH LIGHTWEIGHT CARD FIELDS & TTL CACHE
  async getBuildings(): Promise<Building[]> {
    const cached = getCached<Building[]>('buildings_cards');
    if (cached) return cached;

    return dedupeRequest('buildings_cards', async () => {
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
          // Optimized lightweight card query: excludes heavy metadata and full galleries
          const { data, error } = await withTimeout(
            supabase.from('buildings')
              .select('id, name, slug, location_id, location_name, category, address, description, hero_image, total_floors, size_range, rent_range, sale_range, published, property_count, created_at')
              .eq('published', true)
              .order('created_at', { ascending: false }) as any
          );
          if (!error && data && data.length > 0) {
            const mergedList: Building[] = (data as any[]).map(supaBld => {
              const localBld = localBuildings.find(lb => lb.id === supaBld.id || lb.slug === supaBld.slug);
              const deletedUnitCount = (localBld?.deleted_unit_ids && Array.isArray(localBld.deleted_unit_ids))
                ? localBld.deleted_unit_ids.length
                : (Array.isArray(supaBld.deleted_unit_ids) ? supaBld.deleted_unit_ids.length : 0);
              const combined: Building = {
                ...supaBld,
                ...(localBld || {}),
                hero_image: supaBld.hero_image || localBld?.hero_image,
                structure_display: getBuildingStructureDisplay(supaBld),
                property_count: typeof localBld?.property_count === 'number'
                  ? localBld.property_count
                  : (typeof supaBld.property_count === 'number' ? supaBld.property_count : Math.max(0, 20 - deletedUnitCount))
              };
              return combined;
            });

            _memBuildings = mergedList;
            setCache('buildings_cards', mergedList);
            try {
              safeSetItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(mergedList));
            } catch (e) {}
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
        property_count: typeof b.property_count === 'number' ? b.property_count : Math.max(0, 20 - (b.deleted_unit_ids?.length || 0))
      }));
      _memBuildings = finalBlds;
      return finalBlds;
    });
  },

  async getBuildingBySlug(slug: string): Promise<Building | null> {
    if (!slug) return null;
    const initial = this.getInitialBuildingBySlug(slug);
    const cacheKey = `bld_slug_${slug.toLowerCase()}`;
    const cached = getCached<Building>(cacheKey);
    if (cached) return cached;

    return dedupeRequest(cacheKey, async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await withTimeout(
            supabase.from('buildings').select('*').eq('slug', slug).maybeSingle() as any
          );
          if (!error && data) {
            const bld: Building = {
              ...data,
              structure_display: getBuildingStructureDisplay(data),
              property_count: typeof data.property_count === 'number' ? data.property_count : Math.max(0, 20 - (data.deleted_unit_ids?.length || 0))
            };
            setCache(cacheKey, bld);
            return bld;
          }
        } catch (e) {
          console.warn('getBuildingBySlug fallback:', e);
        }
      }
      return initial;
    });
  },

  async getBuildingById(buildingId: string): Promise<Building | null> {
    if (!buildingId) return null;
    if (_memBuildings) {
      const found = _memBuildings.find(b => b.id === buildingId);
      if (found && found.gallery && found.gallery.length > 0) return found;
    }
    const cacheKey = `bld_id_${buildingId}`;
    const cached = getCached<Building>(cacheKey);
    if (cached) return cached;

    return dedupeRequest(cacheKey, async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await withTimeout(
            supabase.from('buildings').select('*').eq('id', buildingId).maybeSingle() as any
          );
          if (!error && data) {
            const bld: Building = {
              ...data,
              structure_display: getBuildingStructureDisplay(data),
              property_count: typeof data.property_count === 'number' ? data.property_count : Math.max(0, 20 - (data.deleted_unit_ids?.length || 0))
            };
            setCache(cacheKey, bld);
            return bld;
          }
        } catch (e) {
          console.warn('getBuildingById fallback:', e);
        }
      }
      return this.getInitialBuildings().find(b => b.id === buildingId) || null;
    });
  },

  async getBuildingsByLocation(locationId: string): Promise<Building[]> {
    const buildings = await this.getBuildings();
    return buildings.filter(b => b.location_id === locationId || (b.locations && b.locations.includes(locationId)));
  },

  async saveBuilding(building: Building): Promise<void> {
    const structureDisplay = getBuildingStructureDisplay(building);
    const now = new Date().toISOString();
    const existingBld = (_memBuildings || []).find(b => b.id === building.id);
    const mergedDeleted = Array.from(new Set([
      ...(Array.isArray(building.deleted_unit_ids) ? building.deleted_unit_ids : []),
      ...(Array.isArray(existingBld?.deleted_unit_ids) ? existingBld.deleted_unit_ids : [])
    ]));
    if (mergedDeleted.length > 0) {
      mergedDeleted.forEach(id => recordDeletedPropertyId(id));
    }

    const sanitized: Building = {
      ...building,
      updated_at: now,
      deleted_unit_ids: mergedDeleted,
      og_image: typeof building.og_image === 'string' ? building.og_image.trim() : '',
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
        const { error } = await withTimeout(supabase.from('buildings').upsert(sanitized));
        if (error) {
          // If upsert fails due to missing optional columns on Supabase, attempt fallback with core schema columns and encode metadata
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
            og_image: sanitized.og_image !== undefined ? sanitized.og_image : '',
            hyperlinks: sanitized.hyperlinks,
            deleted_unit_ids: mergedDeleted,
            updated_at: now
          };
          const basePayload: any = {
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
          let fallbackRes = await withTimeout(supabase.from('buildings').upsert(basePayload));
          if (fallbackRes.error && fallbackRes.error.code === '23503') {
            // Foreign key violation on location_id (e.g. location not seeded in DB)
            // Retry with location_id = null since full location info is preserved in metaPayload
            basePayload.location_id = null;
            fallbackRes = await withTimeout(supabase.from('buildings').upsert(basePayload));
          }
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
    const cached = getCached<Property[]>('properties_all');
    if (cached) return cached;

    return dedupeRequest('properties_all', async () => {
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
          const { data, error } = await withTimeout(
            supabase.from('properties')
              .select('id, title, slug, building_id, building_name, location_id, location_name, category, property_type, listing_type, price, rent_price, sale_price, built_up_area, area_unit, floor, status, possession, primary_image, featured, verified, sector, tower, unit_number, block_name, created_at, updated_at')
              .order('featured', { ascending: false })
              .order('created_at', { ascending: false }) as any
          );
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
                updated_at: localProp?.updated_at || supaProp.created_at
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
      const deletedSet = getDeletedPropertyIdsSet();
      const buildings = await this.getBuildings();
      const allGenerated = buildings.flatMap(b => generateAvailablePropertiesForBuilding(b, deletedSet));
      const existingIds = new Set(baseProps.map(p => p.id));
      const existingSlugs = new Set(baseProps.map(p => p.slug.toLowerCase()));
      const missingGenerated = allGenerated.filter(p => !existingIds.has(p.id) && !existingSlugs.has(p.slug.toLowerCase()) && !deletedSet.has(p.id));
      const cleanedBaseProps = baseProps.filter(p => !deletedSet.has(p.id)).map(p => ({
        ...p,
        title: p.title.replace(/\s+in\s+I-Thum\s+Tower\s+[A-Za-z0-9-]+\b/i, ' in I-Thum'),
        address: cleanPropertyAddress(p.address, p.building_name)
      }));

      const finalProps = [...cleanedBaseProps, ...missingGenerated];
      _memProperties = finalProps;
      setCache('properties_all', finalProps);
      return finalProps;
    });
  },

  async getPropertyBySlug(slug: string): Promise<Property | null> {
    if (!slug) return null;
    const initial = this.getInitialPropertyBySlug(slug);
    const cacheKey = `prop_slug_${slug.toLowerCase()}`;
    const cached = getCached<Property>(cacheKey);
    if (cached) return cached;

    return dedupeRequest(cacheKey, async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          // Direct point lookup with select(*) to fetch the full rich payload including gallery, description, SEO
          const { data, error } = await withTimeout(
            supabase.from('properties').select('*').eq('slug', slug).maybeSingle() as any
          );
          if (!error && data) {
            let meta: any = {};
            let cleanFeatures = data.features;
            if (Array.isArray(data.features)) {
              cleanFeatures = data.features.filter((f: any) => {
                if (typeof f === 'string' && f.startsWith('__meta:')) {
                  try { meta = JSON.parse(f.replace('__meta:', '')); } catch(e){}
                  return false;
                }
                return true;
              });
            }
            const fullProp: Property = {
              ...data,
              ...meta,
              features: cleanFeatures
            };
            setCache(cacheKey, fullProp);
            return fullProp;
          }
        } catch (e) {
          console.warn('Direct getPropertyBySlug fallback to list search:', e);
        }
      }

      // Check standard units or in-memory generated properties
      const properties = await this.getProperties();
      const found = properties.find(p => p.slug.toLowerCase() === slug.toLowerCase());
      if (found) {
        setCache(cacheKey, found);
        return found;
      }

      const buildings = await this.getBuildings();
      const deletedSet = getDeletedPropertyIdsSet();
      for (const bld of buildings) {
        const units = generateAvailablePropertiesForBuilding(bld, deletedSet);
        const match = units.find(u => u.slug.toLowerCase() === slug.toLowerCase());
        if (match) {
          setCache(cacheKey, match);
          return match;
        }
      }

      return initial;
    });
  },

  async getPropertiesByBuilding(buildingId: string): Promise<Property[]> {
    if (!buildingId) return [];
    const cacheKey = `props_bld_${buildingId.toLowerCase()}`;
    const cached = getCached<Property[]>(cacheKey);
    if (cached) return cached;

    return dedupeRequest(cacheKey, async () => {
      const buildings = await this.getBuildings();
      const building = buildings.find(b => b.id === buildingId || b.slug.toLowerCase() === buildingId.toLowerCase());
      const allProps = await this.getProperties();
      const deletedSet = getDeletedPropertyIdsSet();
      const bldDeleted = new Set(building?.deleted_unit_ids || []);

      const existing = allProps.filter(p => 
        !deletedSet.has(p.id) &&
        !bldDeleted.has(p.id) &&
        (p.building_id === buildingId || (building && (p.building_name?.toLowerCase() === building.name.toLowerCase() || p.building_id === building.id)))
      );

      if (!building) {
        setCache(cacheKey, existing);
        return existing;
      }

      const standardUnits = generateAvailablePropertiesForBuilding(building, deletedSet);
      const existingAreas = new Set(existing.map(p => p.built_up_area));
      const merged = [
        ...existing,
        ...standardUnits.filter(u => !existingAreas.has(u.built_up_area) && !deletedSet.has(u.id) && !bldDeleted.has(u.id))
      ];

      const sorted = merged.sort((a, b) => a.built_up_area - b.built_up_area);
      setCache(cacheKey, sorted);
      return sorted;
    });
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
    clearStorageCache('prop');
    clearStorageCache('homepage');
    const now = new Date().toISOString();
    const sanitized: Property = {
      ...property,
      updated_at: now,
      og_image: typeof property.og_image === 'string' ? property.og_image.trim() : '',
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

    // Clear any tombstone for this property since it is actively saved/restored
    clearDeletedPropertyId(sanitized.id);
    if (sanitized.building_id) {
      try {
        const buildings = await this.getBuildings();
        const bld = buildings.find(b => b.id === sanitized.building_id);
        if (bld && bld.deleted_unit_ids && bld.deleted_unit_ids.includes(sanitized.id)) {
          bld.deleted_unit_ids = bld.deleted_unit_ids.filter(id => id !== sanitized.id);
          await this.saveBuilding(bld);
        }
      } catch (e) {
        // ignore
      }
    }

    // Always update in-memory cache so zero-delay getters reflect changes immediately
    if (_memProperties) {
      const memIndex = _memProperties.findIndex(p => p.id === sanitized.id);
      if (memIndex >= 0) _memProperties[memIndex] = sanitized;
      else _memProperties.unshift(sanitized);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await withTimeout(supabase.from('properties').upsert(sanitized));
        if (error) {
          const metaPayload = {
            og_image: sanitized.og_image !== undefined ? sanitized.og_image : '',
            seo_title: sanitized.seo_title || null,
            seo_description: sanitized.seo_description || null,
            seo_keywords: sanitized.seo_keywords || null,
            canonical_url: sanitized.canonical_url || null,
            og_title: sanitized.og_title || null,
            og_description: sanitized.og_description || null,
            primary_image_alt: sanitized.primary_image_alt || null,
            primary_image_title: sanitized.primary_image_title || null,
            primary_image_caption: sanitized.primary_image_caption || null,
            short_description: sanitized.short_description || null,
            overview: sanitized.overview || null,
            location_connectivity: sanitized.location_connectivity || null,
            highlights: sanitized.highlights || null,
            hyperlinks: sanitized.hyperlinks || [],
            updated_at: now
          };
          const baseFeatures = Array.isArray(sanitized.features)
            ? sanitized.features.filter(f => typeof f !== 'string' || !f.startsWith('__meta:'))
            : [];
          baseFeatures.push('__meta:' + JSON.stringify(metaPayload));

          const { 
            tower, block_name, unit_number, sector, rent_price, sale_price,
            short_description, overview, location_connectivity, highlights,
            primary_image_alt, primary_image_title, primary_image_caption,
            image_details, seo_title, seo_description, seo_keywords,
            canonical_url, og_title, og_description, og_image, hyperlinks,
            updated_at,
            ...basePayload 
          } = sanitized as any;
          basePayload.features = baseFeatures;
          const fallbackRes = await withTimeout(supabase.from('properties').upsert(basePayload));
          if (fallbackRes.error) {
            console.warn('Supabase fallback upsert property warning (local saved successfully):', fallbackRes.error);
          }
        }
      } catch (e) {
        console.warn('Supabase upsert property network warning (local saved successfully):', e);
      }
    }
  },

  async saveProperties(propertiesToSave: Property[]): Promise<void> {
    if (!propertiesToSave || propertiesToSave.length === 0) return;
    clearStorageCache('prop');
    clearStorageCache('homepage');
    const now = new Date().toISOString();
    const sanitizedList: Property[] = propertiesToSave.map(property => ({
      ...property,
      updated_at: now,
      og_image: typeof property.og_image === 'string' ? property.og_image.trim() : '',
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
      hyperlinks: property.hyperlinks || [],
    }));

    // Local / memory cache save in one go
    try {
      let currentProps = _memProperties;
      if (!currentProps) {
        const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
        currentProps = stored ? JSON.parse(stored) : [...INITIAL_PROPERTIES];
      }
      const map = new Map<string, Property>(currentProps!.map(p => [p.id, p]));
      sanitizedList.forEach(p => {
        map.set(p.id, p);
        clearDeletedPropertyId(p.id);
      });
      const merged = Array.from(map.values());
      _memProperties = merged;
      safeSetItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(merged));
    } catch (e) {
      console.warn('LocalStorage save warning for batch properties:', e);
    }

    // Supabase upsert in one batch with timeout
    if (isSupabaseConfigured && supabase) {
      try {
        await withTimeout(supabase.from('properties').upsert(sanitizedList));
      } catch (e) {
        console.warn('Supabase batch upsert properties warning (local saved):', e);
      }
    }
  },

  async deleteProperty(propertyId: string, buildingIdHint?: string): Promise<void> {
    if (!propertyId) return;
    clearStorageCache('prop');
    clearStorageCache('homepage');

    // 1. Locate target property BEFORE tombstoning
    let targetProp: Property | undefined = undefined;
    if (_memProperties) {
      targetProp = _memProperties.find(p => p.id === propertyId);
    }
    if (!targetProp) {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
        if (stored) {
          const list: Property[] = JSON.parse(stored);
          targetProp = list.find(p => p.id === propertyId);
        }
      } catch {
        // ignore
      }
    }
    if (!targetProp) {
      targetProp = INITIAL_PROPERTIES.find(p => p.id === propertyId);
    }

    // 2. Identify parent building
    let buildingIdToUpdate: string | null = buildingIdHint || targetProp?.building_id || null;
    if (!buildingIdToUpdate && propertyId.startsWith('prop-')) {
      const buildings = this.getInitialBuildings();
      const matchBld = buildings.find(b => propertyId.startsWith(`prop-${b.id}-`) || propertyId.startsWith(`prop-${b.slug}-`));
      if (matchBld) buildingIdToUpdate = matchBld.id;
    }

    // 3. Mark as deleted in tombstone storage & memory cache for ALL associated identifiers
    recordDeletedPropertyId(propertyId);
    if (targetProp?.slug) {
      recordDeletedPropertyId(targetProp.slug);
    }
    if (targetProp?.reference_number) {
      recordDeletedPropertyId(targetProp.reference_number);
    }
    if (buildingIdToUpdate && targetProp?.built_up_area) {
      recordDeletedPropertyId(`prop-${buildingIdToUpdate}-${targetProp.built_up_area}`);
    }

    // 4. Remove from properties memory cache & local storage
    try {
      if (_memProperties) {
        _memProperties = _memProperties.filter(p => p.id !== propertyId && (!targetProp?.slug || p.slug !== targetProp.slug));
      }
      const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      if (stored) {
        const list: Property[] = JSON.parse(stored);
        const updated = list.filter(p => p.id !== propertyId && (!targetProp?.slug || p.slug !== targetProp.slug));
        safeSetItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('LocalStorage delete warning for properties:', e);
    }

    // 5. Persist deletion in parent building's deleted_unit_ids (in local storage and Supabase)
    if (buildingIdToUpdate) {
      try {
        const buildings = await this.getBuildings();
        const bld = buildings.find(b => b.id === buildingIdToUpdate || b.slug.toLowerCase() === buildingIdToUpdate!.toLowerCase());
        if (bld) {
          const currentDeleted = new Set(bld.deleted_unit_ids || []);
          currentDeleted.add(propertyId);
          if (targetProp?.slug) currentDeleted.add(targetProp.slug);
          if (targetProp?.reference_number) currentDeleted.add(targetProp.reference_number);
          if (targetProp?.built_up_area) currentDeleted.add(`prop-${bld.id}-${targetProp.built_up_area}`);
          bld.deleted_unit_ids = Array.from(currentDeleted);
          const activeUnits = this.getInitialPropertiesByBuilding(bld.id);
          bld.property_count = activeUnits.length;
          await this.saveBuilding(bld);
        }
      } catch (err) {
        console.warn('Error updating parent building deleted_unit_ids:', err);
      }
    }

    // 6. Delete from Supabase properties table if present
    if (isSupabaseConfigured && supabase) {
      try {
        await withTimeout(supabase.from('properties').delete().eq('id', propertyId));
      } catch (e) {
        console.warn('Supabase delete property warning (local delete succeeded):', e);
      }
    }
  },

  // LEADS & INQUIRIES
  async getLeads(): Promise<Lead[]> {
    const cached = getCached<Lead[]>('admin_leads');
    if (cached) return cached;

    return dedupeRequest('admin_leads', async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          // Attempt secure admin RPC with known passcode
          const { data, error } = await withTimeout(
            supabase.rpc('get_admin_leads', { admin_passcode: 'Govind@6125119603' }) as any
          );
          if (!error && Array.isArray(data) && data.length > 0) {
            setCache('admin_leads', data as Lead[]);
            return data as Lead[];
          }
          // Direct fallback if RPC is unavailable
          const { data: directData, error: directErr } = await withTimeout(
            supabase.from('leads').select('*').order('created_at', { ascending: false }) as any
          );
          if (!directErr && directData && directData.length > 0) {
            setCache('admin_leads', directData as Lead[]);
            return directData as Lead[];
          }
        } catch (e) {
          console.warn('Falling back to local storage for leads:', e);
        }
      }
      return this.getInitialLeads();
    });
  },

  async createLead(leadData: Omit<Lead, 'id' | 'created_at' | 'status'>): Promise<Lead> {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: 'New',
      created_at: new Date().toISOString(),
    };

    clearStorageCache('admin_leads');

    // Quota-safe LocalStorage backup
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEADS);
      const leads = stored ? JSON.parse(stored) : [];
      leads.unshift(newLead);
      const trimmed = leads.slice(0, 40);
      try {
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(trimmed));
      } catch (quotaError) {
        const lightweight = trimmed.map((l: any) => ({
          ...l,
          images: (l.images || []).map((img: string) => img.startsWith('data:') ? '[uploaded image]' : img),
          list_property_details: l.list_property_details ? {
            ...l.list_property_details,
            images: (l.list_property_details.images || []).map((img: string) => img.startsWith('data:') ? '[uploaded image]' : img)
          } : undefined
        }));
        try {
          localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(lightweight.slice(0, 20)));
        } catch (innerErr) {
          console.warn('LocalStorage leads cache bypassed:', innerErr);
        }
      }
    } catch (e) {
      console.warn('LocalStorage lead warning:', e);
    }

    // Supabase Persistence (Async non-blocking insert for instant user feedback)
    if (isSupabaseConfigured && supabase) {
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

      // Fire and forget / background catch
      supabase.from('leads').insert(payload).then(({ error }: any) => {
        if (error) {
          console.warn('Supabase insert lead issue:', error.message);
          if (error.message && error.message.includes('images')) {
            delete payload.images;
            supabase.from('leads').insert(payload).catch(() => {});
          }
        }
      }).catch((e: any) => {
        console.error('Supabase insert lead error:', e);
      });
    }

    return newLead;
  },

  async updateLeadStatus(leadId: string, status: LeadStatus, notes?: string): Promise<void> {
    clearStorageCache('admin_leads');
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (stored) {
        const leads: Lead[] = JSON.parse(stored);
        const index = leads.findIndex(l => l.id === leadId);
        if (index >= 0) {
          leads[index].status = status;
          if (notes !== undefined) leads[index].notes = notes;
          localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
        }
      }
    } catch {}

    if (isSupabaseConfigured && supabase) {
      try {
        // Try secure RPC first
        const { error } = await supabase.rpc('update_admin_lead_status', {
          admin_passcode: 'Govind@6125119603',
          target_lead_id: leadId,
          new_status: status,
          new_notes: notes !== undefined ? notes : null
        }) as any;
        if (error) {
          await supabase.from('leads').update({ status, ...(notes !== undefined ? { notes } : {}) }).eq('id', leadId);
        }
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
    const cached = getCached<MarketGuide[]>('guides_all');
    if (cached) return cached;

    return dedupeRequest('guides_all', async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          try {
            const { data, error } = await withTimeout(
              supabase.from('guides')
                .select('id, title, slug, excerpt, content, category, "readTime", published, featured, featured_image_url, image, hyperlinks, created_at, updated_at')
                .order('featured', { ascending: false })
                .order('created_at', { ascending: false }) as any
            );
            if (!error && Array.isArray(data) && data.length > 0) {
              const parsed = data.map((item: any) => ({
                ...item,
                image: item.featured_image_url || item.image,
                featured_image_url: item.featured_image_url || item.image,
                hyperlinks: Array.isArray(item.hyperlinks) ? item.hyperlinks : []
              }));
              _memGuides = parsed;
              setCache('guides_all', parsed);
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
    });
  },

  async getGuideBySlug(slug: string): Promise<MarketGuide | null> {
    if (!slug) return null;
    const cacheKey = `guide_slug_${slug.toLowerCase()}`;
    const cached = getCached<MarketGuide>(cacheKey);
    if (cached) return cached;

    return dedupeRequest(cacheKey, async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await withTimeout(
            supabase.from('guides').select('*').eq('slug', slug).maybeSingle() as any
          );
          if (!error && data) {
            const guide = {
              ...data,
              image: data.featured_image_url || data.image,
              featured_image_url: data.featured_image_url || data.image,
              hyperlinks: Array.isArray(data.hyperlinks) ? data.hyperlinks : []
            };
            setCache(cacheKey, guide);
            return guide;
          }
        } catch (e) {
          console.warn('getGuideBySlug fallback:', e);
        }
      }
      const guides = await this.getGuides();
      return guides.find(g => g.slug.toLowerCase() === slug.toLowerCase()) || null;
    });
  },

  async saveGuide(guide: MarketGuide): Promise<MarketGuide> {
    clearStorageCache('guides_all');
    clearStorageCache('homepage');
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
    clearStorageCache('guides_all');
    clearStorageCache('homepage');
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

  // --- CLIENTS & BRANDS ---
  getInitialClients(): ClientLogo[] {
    if (_memClients) return _memClients;
    if (typeof window === 'undefined') return INITIAL_CLIENTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (stored) {
        _memClients = JSON.parse(stored);
        return _memClients || INITIAL_CLIENTS;
      }
    } catch (e) {
      console.error('Error reading stored clients:', e);
    }
    _memClients = INITIAL_CLIENTS;
    return INITIAL_CLIENTS;
  },

  async getClients(): Promise<ClientLogo[]> {
    return this.getInitialClients();
  },

  async saveClient(client: ClientLogo): Promise<void> {
    const list = [...this.getInitialClients()];
    const index = list.findIndex(c => c.id === client.id);
    if (index >= 0) {
      list[index] = client;
    } else {
      list.push(client);
    }
    _memClients = list;
    safeSetItem(STORAGE_KEYS.CLIENTS, JSON.stringify(list));
  },

  async deleteClient(clientId: string): Promise<void> {
    const list = this.getInitialClients().filter(c => c.id !== clientId);
    _memClients = list;
    safeSetItem(STORAGE_KEYS.CLIENTS, JSON.stringify(list));
  },

  // --- INSTAGRAM REELS ---
  getInitialInstagramReels(): InstagramReel[] {
    if (_memReels) return _memReels;
    if (typeof window === 'undefined') return INITIAL_INSTAGRAM_REELS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REELS);
      if (stored) {
        _memReels = JSON.parse(stored);
        return _memReels || INITIAL_INSTAGRAM_REELS;
      }
    } catch (e) {
      console.error('Error reading stored instagram reels:', e);
    }
    _memReels = INITIAL_INSTAGRAM_REELS;
    return INITIAL_INSTAGRAM_REELS;
  },

  async getInstagramReels(): Promise<InstagramReel[]> {
    return this.getInitialInstagramReels();
  },

  async saveInstagramReel(reel: InstagramReel): Promise<void> {
    const list = [...this.getInitialInstagramReels()];
    const index = list.findIndex(r => r.id === reel.id);
    if (index >= 0) {
      list[index] = reel;
    } else {
      list.push(reel);
    }
    _memReels = list;
    safeSetItem(STORAGE_KEYS.REELS, JSON.stringify(list));
  },

  async deleteInstagramReel(reelId: string): Promise<void> {
    const list = this.getInitialInstagramReels().filter(r => r.id !== reelId);
    _memReels = list;
    safeSetItem(STORAGE_KEYS.REELS, JSON.stringify(list));
  },

  // Reset database back to default seed data
  resetDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(INITIAL_BUILDINGS));
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
    localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(INITIAL_MARKET_GUIDES));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem(STORAGE_KEYS.REELS, JSON.stringify(INITIAL_INSTAGRAM_REELS));
  }
};
