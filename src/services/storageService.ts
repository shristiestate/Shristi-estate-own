import { Location, Building, Property, Lead, LeadStatus } from '../types';
import { INITIAL_LOCATIONS, INITIAL_BUILDINGS, INITIAL_PROPERTIES, INITIAL_LEADS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  LOCATIONS: 'shristi_locations_v1',
  BUILDINGS: 'shristi_buildings_v1',
  PROPERTIES: 'shristi_properties_v1',
  LEADS: 'shristi_leads_v1',
};

// Initialize localStorage with initial seeds if not populated
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUILDINGS)) {
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(INITIAL_BUILDINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
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
    return data ? JSON.parse(data) : INITIAL_LOCATIONS;
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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('buildings').select('*');
        if (!error && data && data.length > 0) return data as Building[];
      } catch (e) {
        console.warn('Falling back to local storage for buildings:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
    return data ? JSON.parse(data) : INITIAL_BUILDINGS;
  },

  async getBuildingBySlug(slug: string): Promise<Building | null> {
    const buildings = await this.getBuildings();
    return buildings.find(b => b.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  async getBuildingsByLocation(locationId: string): Promise<Building[]> {
    const buildings = await this.getBuildings();
    return buildings.filter(b => b.location_id === locationId);
  },

  async saveBuilding(building: Building): Promise<void> {
    const sanitized: Building = {
      ...building,
      location_id: (building.location_id && String(building.location_id).trim() !== '') ? building.location_id : null as any,
      total_floors: Number(building.total_floors) || 1,
      sale_range: (building.sale_range && String(building.sale_range).trim() !== '') ? building.sale_range : null as any,
      gallery: Array.isArray(building.gallery) ? building.gallery : [],
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
          console.error('Supabase upsert building error:', error);
          throw new Error(error.message || 'Supabase upsert failed');
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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('properties').select('*');
        if (!error && data && data.length > 0) return data as Property[];
      } catch (e) {
        console.warn('Falling back to local storage for properties:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    return data ? JSON.parse(data) : INITIAL_PROPERTIES;
  },

  async getPropertyBySlug(slug: string): Promise<Property | null> {
    const properties = await this.getProperties();
    return properties.find(p => p.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  async getPropertiesByBuilding(buildingId: string): Promise<Property[]> {
    const properties = await this.getProperties();
    return properties.filter(p => p.building_id === buildingId);
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
      building_id: (property.building_id && String(property.building_id).trim() !== '') ? property.building_id : null as any,
      building_name: property.building_id ? (property.building_name || null as any) : null as any,
      location_id: (property.location_id && String(property.location_id).trim() !== '') ? property.location_id : null as any,
      carpet_area: (property.carpet_area && !isNaN(Number(property.carpet_area))) ? Number(property.carpet_area) : null as any,
      price: Number(property.price) || 0,
      built_up_area: Number(property.built_up_area) || 0,
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
          console.error('Supabase upsert property error:', error);
          throw new Error(error.message || 'Supabase upsert failed');
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

    const leads = await this.getLeads();
    leads.unshift(newLead);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('leads').insert(newLead);
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
