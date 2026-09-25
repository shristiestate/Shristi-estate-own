import { Location, Building, Property, Lead, LeadStatus } from '../types';
import { INITIAL_LOCATIONS, INITIAL_BUILDINGS, INITIAL_PROPERTIES, INITIAL_LEADS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getBuildingStructureDisplay } from '../utils/textFormat';
import { generateAvailablePropertiesForBuilding } from '../utils/buildingUnits';

const STORAGE_KEYS = {
  LOCATIONS: 'shristi_locations_v1',
  BUILDINGS: 'shristi_buildings_v1',
  PROPERTIES: 'shristi_properties_v1',
  LEADS: 'shristi_leads_v1',
};

// Initialize localStorage with initial seeds if not populated, and merge any new seeds
const initStorage = () => {
  try {
    const storedLocs = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (!storedLocs) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
    } else {
      const parsedLocs: Location[] = JSON.parse(storedLocs);
      const existingIds = new Set(parsedLocs.map(l => l.id));
      const missingLocs = INITIAL_LOCATIONS.filter(il => !existingIds.has(il.id));
      const updatedLocs = [
        ...parsedLocs.map(l => {
          const initL = INITIAL_LOCATIONS.find(il => il.id === l.id);
          return initL ? { ...l, building_count: Math.max(l.building_count || 0, initL.building_count || 0) } : l;
        }),
        ...missingLocs
      ];
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(updatedLocs));
    }

    const storedBlds = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
    if (!storedBlds) {
      localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(INITIAL_BUILDINGS));
    } else {
      const parsedBlds: Building[] = JSON.parse(storedBlds);
      const existingIds = new Set(parsedBlds.map(b => b.id));
      const existingSlugs = new Set(parsedBlds.map(b => b.slug.toLowerCase()));
      const missingBlds = INITIAL_BUILDINGS.filter(b => !existingIds.has(b.id) && !existingSlugs.has(b.slug.toLowerCase()));
      if (missingBlds.length > 0) {
        localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify([...parsedBlds, ...missingBlds]));
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
    }
  } catch (e) {
    console.warn('Init storage error:', e);
  }
};

if (typeof window !== 'undefined') {
  initStorage();
}

export const StorageService = {
  // LOCATIONS
  async getLocations(): Promise<Location[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('locations').select('*');
        if (!error && data && data.length > 0) return data as Location[];
      } catch (e) {
        console.warn('Falling back to local storage for locations:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    const localLocs: Location[] = data ? JSON.parse(data) : INITIAL_LOCATIONS;
    const existingIds = new Set(localLocs.map(l => l.id));
    const missing = INITIAL_LOCATIONS.filter(l => !existingIds.has(l.id));
    return [...localLocs, ...missing];
  },

  async getLocationBySlug(slug: string): Promise<Location | null> {
    const locations = await this.getLocations();
    return locations.find(l => l.slug.toLowerCase() === slug.toLowerCase()) || null;
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
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    } catch (e) {
      console.warn('LocalStorage save warning for locations:', e);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('locations').upsert(location);
        if (error) {
          console.error('Supabase upsert location error:', error);
          throw new Error(error.message || 'Supabase upsert failed');
        }
      } catch (e) {
        console.error('Supabase upsert location error:', e);
        throw e;
      }
    }
  },

  async deleteLocation(locationId: string): Promise<void> {
    try {
      const locations = await this.getLocations();
      const updated = locations.filter(l => l.id !== locationId);
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage delete warning for locations:', e);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('locations').delete().eq('id', locationId);
      } catch (e) {
        console.error('Supabase delete location error:', e);
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
        const { data, error } = await supabase.from('buildings').select('*');
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
            localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(mergedList));
          } catch (e) {
            // ignore
          }

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
    return source.map(b => ({
      ...b,
      structure_display: getBuildingStructureDisplay(b),
      property_count: Math.max(b.property_count || 0, 20)
    }));
  },

  async getBuildingBySlug(slug: string): Promise<Building | null> {
    const buildings = await this.getBuildings();
    return buildings.find(b => b.slug.toLowerCase() === slug.toLowerCase()) || null;
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
      localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(buildings));
    } catch (e) {
      console.warn('LocalStorage save warning for buildings:', e);
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
            console.error('Supabase fallback upsert error:', fallbackRes.error);
            throw new Error(fallbackRes.error.message || 'Supabase upsert failed');
          }
        }
      } catch (e) {
        console.error('Supabase upsert building error:', e);
        throw e;
      }
    }
  },

  async deleteBuilding(buildingId: string): Promise<void> {
    try {
      const buildings = await this.getBuildings();
      const updated = buildings.filter(b => b.id !== buildingId);
      localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage delete warning for buildings:', e);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('buildings').delete().eq('id', buildingId);
      } catch (e) {
        console.error('Supabase delete building error:', e);
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
        const { data, error } = await supabase.from('properties').select('*');
        if (!error && data && data.length > 0) {
          baseProps = (data as any[]).map(supaProp => {
            const localProp = localProps.find(lp => lp.id === supaProp.id || lp.slug === supaProp.slug);
            return {
              ...supaProp,
              ...(localProp || {}),
              tower: supaProp.tower || localProp?.tower || null,
            };
          });

          try {
            localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(baseProps));
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

    return [...baseProps, ...missingGenerated];
  },

  async getPropertyBySlug(slug: string): Promise<Property | null> {
    const properties = await this.getProperties();
    const found = properties.find(p => p.slug.toLowerCase() === slug.toLowerCase());
    if (found) return found;

    const buildings = await this.getBuildings();
    for (const bld of buildings) {
      const units = generateAvailablePropertiesForBuilding(bld);
      const match = units.find(u => u.slug.toLowerCase() === slug.toLowerCase());
      if (match) return match;
    }
    return null;
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
    };

    try {
      const properties = await this.getProperties();
      const index = properties.findIndex(p => p.id === sanitized.id);
      if (index >= 0) {
        properties[index] = sanitized;
      } else {
        properties.unshift(sanitized);
      }
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    } catch (e) {
      console.warn('LocalStorage save warning for properties (quota safe):', e);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('properties').upsert(sanitized);
        if (error) {
          console.warn('Supabase upsert property error, trying fallback without optional fields:', error);
          const { tower, ...basePayload } = sanitized as any;
          const fallbackRes = await supabase.from('properties').upsert(basePayload);
          if (fallbackRes.error) {
            console.error('Supabase fallback upsert property error:', fallbackRes.error);
            throw new Error(fallbackRes.error.message || 'Supabase upsert failed');
          }
        }
      } catch (e) {
        console.error('Supabase upsert property error:', e);
        throw e;
      }
    }
  },

  async deleteProperty(propertyId: string): Promise<void> {
    try {
      const properties = await this.getProperties();
      const updated = properties.filter(p => p.id !== propertyId);
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage delete warning for properties:', e);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('properties').delete().eq('id', propertyId);
      } catch (e) {
        console.error('Supabase delete property error:', e);
      }
    }
  },

  // LEADS & INQUIRIES
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Lead[];
      } catch (e) {
        console.warn('Falling back to local storage for leads:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.LEADS);
    return data ? JSON.parse(data) : INITIAL_LEADS;
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

  // Reset database back to default seed data
  resetDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(INITIAL_BUILDINGS));
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
  }
};
