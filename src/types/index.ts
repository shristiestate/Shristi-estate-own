export type PropertyCategory = 
  | 'office-space'
  | 'it-business-parks'
  | 'warehouses'
  | 'factory-industrial'
  | 'land'
  | 'shops-retail';

export type ListingType = 'Rent' | 'Sale' | 'Lease';

export type PropertyStatus = 
  | 'Available'
  | 'Ready to Move'
  | 'Under Construction'
  | 'New Listing'
  | 'Featured'
  | 'Limited Availability'
  | 'Under Negotiation'
  | 'Sold'
  | 'Rented'
  | 'Leased';

export type FurnishingType = 
  | 'Furnished'
  | 'Semi-Furnished'
  | 'Bare Shell'
  | 'Plug-and-Play';

export interface Location {
  id: string;
  name: string;
  slug: string;
  city: string;
  region: string;
  description: string;
  hero_image: string;
  building_count: number;
  property_count: number;
  categories: PropertyCategory[];
  featured?: boolean;
}

export interface Building {
  id: string;
  name: string;
  slug: string;
  location_id: string;
  location_name: string;
  locations?: string[]; // Multiple linked location IDs
  location_names?: string[]; // Multiple linked location names
  category: PropertyCategory; // Primary Category
  categories?: PropertyCategory[]; // Multiple Commercial Categories
  address: string;
  description: string;
  hero_image: string;
  gallery: string[];
  total_floors: number;
  basement_floors?: string; // e.g. "2 Basements (2B)", "3 Basements (3B)"
  ground_option?: string; // e.g. "Ground (G)", "Ground + Mezzanine (G+M)", "Stilt + Ground (S+G)"
  structure_display?: string; // e.g. "2B + G + 14 Floors"
  available_floors?: string;
  towers?: string[]; // e.g. ["Tower A", "Tower B"]
  total_towers?: number;
  tower_details?: string; // e.g. "Twin Towers (Tower A & Tower B)"
  size_range: string;
  rent_range?: string;
  sale_range?: string;
  furnishing_options: string[];
  parking: string;
  lifts: string;
  security: string;
  power_backup: string;
  amenities: string[];
  nearby_landmarks: string[];
  nearby_transport: string;
  published: boolean;
  property_count?: number;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  reference_number: string; // e.g. SE-6201
  category: PropertyCategory;
  property_type: string;
  listing_type: ListingType;
  status: PropertyStatus;
  price: number;
  price_display: string; // e.g. "₹65,000/month" or "₹1.85 Cr"
  rate_per_sqft?: string; // e.g. "₹55/sq.ft"
  rent_frequency?: 'month' | 'year' | 'total';
  location_id: string;
  location_name: string;
  building_id?: string;
  building_name?: string;
  tower?: string; // e.g. "Tower A", "Tower B", "Block 1"
  address: string;
  city: string;
  built_up_area: number; // in sq.ft
  carpet_area?: number;
  land_area?: number;
  area_unit: 'sq.ft' | 'sq.meter' | 'acres';
  floor?: number | string;
  total_floors?: number;
  furnishing: FurnishingType;
  parking: string;
  power_load?: string;
  road_width?: string;
  possession: string; // e.g. "Immediate", "Ready to Move"
  description: string;
  features: string[];
  amenities: string[];
  primary_image: string;
  gallery: string[];
  featured?: boolean;
  published: boolean;
  is_seed?: boolean; // Reference / seed indicator per spec
  created_at: string;
}

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Visit Scheduled'
  | 'Converted'
  | 'Not Interested'
  | 'Closed';

export type LeadType = 
  | 'enquiry'
  | 'requirement'
  | 'list_property'
  | 'site_visit'
  | 'callback'
  | 'general';

export interface Lead {
  id: string;
  lead_type: LeadType;
  name: string;
  email: string;
  phone: string;
  preferred_contact_method?: 'phone' | 'whatsapp' | 'email';
  message?: string;
  property_id?: string;
  property_title?: string;
  building_id?: string;
  building_name?: string;
  location_id?: string;
  location_name?: string;
  requirement_details?: {
    category?: string;
    listing_type?: string;
    min_area?: number;
    max_budget?: string;
    furnishing?: string;
    preferred_locations?: string[];
  };
  list_property_details?: {
    property_category?: string;
    expected_price?: string;
    area?: string;
    address?: string;
    images?: string[];
  };
  images?: string[];
  preferred_visit_date?: string;
  preferred_visit_time?: string;
  source_page?: string;
  lead_source: 'website' | 'whatsapp' | 'phone' | 'referral' | 'other';
  status: LeadStatus;
  notes?: string;
  assigned_agent?: string;
  created_at: string;
}
