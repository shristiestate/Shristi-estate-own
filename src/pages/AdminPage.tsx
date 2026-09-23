import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Search, 
  Filter, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  DollarSign, 
  ExternalLink,
  MessageSquare,
  Image as ImageIcon,
  X,
  Check,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  UploadCloud,
  Copy,
  FileImage,
  ArrowLeftRight,
  Phone,
  Warehouse,
  Factory,
  Store,
  Trees,
  Cpu,
  Zap,
  Truck,
  Tag,
  Hash,
  Eye,
  PlusCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Property, Building, Location, Lead, LeadStatus, PropertyStatus, PropertyCategory } from '../types';
import { handleOverviewPaste } from '../utils/textFormat';

export const CATEGORY_CONFIG: Record<PropertyCategory, {
  label: string;
  badgeClass: string;
  badgeBg: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultType: string;
  types: string[];
  defaultPower: string;
  defaultRoad: string;
  suggestedFeatures: string[];
}> = {
  'it-business-parks': {
    label: 'IT & Business Parks',
    badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    badgeBg: 'bg-indigo-500',
    icon: Cpu,
    defaultType: 'IT Office Space',
    types: [
      'IT Office Space',
      'Plug-and-Play Tech Floor',
      'Corporate IT Tower Floor',
      'IT SEZ Unit',
      'Tech R&D Facility',
      'Data Center Space',
      'Bare Shell IT Park Floor'
    ],
    defaultPower: '100% DG Backup with N+1 Redundancy',
    defaultRoad: '60 Feet Arterial Road',
    suggestedFeatures: [
      'Dual High-Speed Fiber Lines',
      '24/7 Central HVAC',
      'Grade-A Tech Infrastructure',
      'Food Court & Gym',
      'Multi-Tier Security',
      'Ample Covered Parking',
      '100% DG Backup'
    ]
  },
  'warehouses': {
    label: 'Warehouses & Logistics',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    badgeBg: 'bg-amber-500',
    icon: Warehouse,
    defaultType: 'Storage Warehouse / Industrial Shed',
    types: [
      'Storage Warehouse / Industrial Shed',
      'Grade-A Logistics Park Shed',
      '3PL Distribution Hub',
      'Cold Storage Facility',
      'E-Commerce Fulfillment Center',
      'Industrial Godown & Logistics Center'
    ],
    defaultPower: '60 KVA Industrial Power',
    defaultRoad: '60 Feet Wide Road for 40ft Multi-Axle Containers',
    suggestedFeatures: [
      '28–34 ft Clear Height',
      'Hydraulic Dock Levelers',
      'FM2 Heavy Duty Flooring',
      'K-Factor Fire Sprinklers',
      'Dedicated Container Parking',
      'Insulated Roofing',
      'Two Rolling Shutters',
      'Weighbridge Access'
    ]
  },
  'factory-industrial': {
    label: 'Factories & Industrial',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    badgeBg: 'bg-rose-500',
    icon: Factory,
    defaultType: 'Manufacturing Factory & Industrial Building',
    types: [
      'Manufacturing Factory & Industrial Building',
      'Industrial Shed & Workshop',
      'Heavy Industrial Plant',
      'Flatted Industrial Unit',
      'Assembly / Precision Engineering Unit',
      'Automotive / Electronics Workshop'
    ],
    defaultPower: '150 KVA Sanctioned Industrial Load',
    defaultRoad: '60 Feet Arterial Road',
    suggestedFeatures: [
      '150 KVA Dedicated Transformer',
      '2-Ton Goods Lift',
      'Overhead EOT Crane Provision',
      'Pollution Control Board NOC',
      'Borewell & Water Treatment',
      'Heavy Floor Loading (5T/sqm)',
      'Fire Suppression NOC',
      'Loading Ramps'
    ]
  },
  'land': {
    label: 'Commercial Land',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    badgeBg: 'bg-emerald-500',
    icon: Trees,
    defaultType: 'Commercial / Industrial Plot',
    types: [
      'Commercial / Industrial Plot',
      'Commercial Corner Plot',
      'Industrial Plot',
      'Institutional Land',
      'IT Park Land Parcel',
      'Freehold Commercial Land'
    ],
    defaultPower: 'Heavy Load Grid Feeder Connected',
    defaultRoad: '60 Feet Wide Sector Road',
    suggestedFeatures: [
      'Corner Plot with 2-Side Openings',
      'Approved Commercial/IT FAR',
      'Clear Title Deed & Authority Allotment',
      'Direct Expressway Connectivity',
      'Boundary Wall Constructed',
      'Wide Frontage Road',
      'Underground Drainage'
    ]
  },
  'shops-retail': {
    label: 'Shops & Retail',
    badgeClass: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30',
    badgeBg: 'bg-pink-500',
    icon: Store,
    defaultType: 'Ground Floor Commercial Shop',
    types: [
      'Ground Floor Commercial Shop',
      'High-Street Retail Showroom',
      'Mall Anchor Store',
      'Food Court / Restaurant Space',
      'Commercial Corner Booth',
      'Double-Height Retail Showroom'
    ],
    defaultPower: '100% DG Power Backup',
    defaultRoad: 'High Footfall Main Road Promenade',
    suggestedFeatures: [
      'Full Glass Frontage Display',
      'High Footfall Promenade',
      'Main Road Facing Visibility',
      'Central HVAC Provision',
      'Escalator Connectivity',
      'Prominent Signage Rights',
      'Direct Metro Access'
    ]
  },
  'office-space': {
    label: 'Office Space',
    badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    badgeBg: 'bg-blue-500',
    icon: Building2,
    defaultType: 'Commercial Office',
    types: [
      'Commercial Office',
      'Fully Furnished Office',
      'Plug-and-Play Office',
      'Corporate Suite',
      'Independent Commercial Floor',
      'Bare Shell Office',
      'Co-working Office Space'
    ],
    defaultPower: '100% DG Backup',
    defaultRoad: '45 Feet Wide Sector Road',
    suggestedFeatures: [
      '24/7 Security',
      '100% Power Backup',
      'Central Air Conditioning',
      'Conference Rooms',
      'Cafeteria',
      'Visitor Parking',
      'High-speed Elevators'
    ]
  }
};

export const AdminPage: React.FC = () => {
  // Simple administrative authorization
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('shristi_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'leads' | 'properties' | 'buildings' | 'locations' | 'media'>('properties');

  // Data
  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filter for Leads & Properties
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('All');
  const [leadSearch, setLeadSearch] = useState('');
  const [propertySearch, setPropertySearch] = useState('');
  const [propertyCategoryFilter, setPropertyCategoryFilter] = useState<string>('all');
  const [newFeatureTag, setNewFeatureTag] = useState('');
  const [customPropertyTypeInput, setCustomPropertyTypeInput] = useState('');

  // Property Modal Form (Add & Edit)
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Partial<Property>>({
    title: '',
    category: 'office-space',
    property_type: 'Commercial Office',
    listing_type: 'Rent',
    status: 'Available',
    price: 65000,
    price_display: '₹65,000/month',
    rate_per_sqft: '₹55/sq.ft',
    location_id: 'loc-sec-62',
    location_name: 'Sector 62, Noida',
    address: 'Sector 62, Noida',
    city: 'Noida',
    built_up_area: 1150,
    carpet_area: undefined,
    land_area: undefined,
    area_unit: 'sq.ft',
    floor: 'Ground Floor',
    total_floors: 1,
    furnishing: 'Furnished',
    parking: '1 Covered Bay',
    power_load: '100% DG Backup',
    road_width: '45 Feet Wide Sector Road',
    possession: 'Ready to Move',
    description: '',
    features: ['24/7 Security', '100% Power Backup', 'Central Air Conditioning'],
    amenities: ['High-speed Elevators', 'Cafeteria Provision'],
    primary_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    gallery: [],
    published: true,
  });

  // Building Modal Form (Add & Edit)
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [isEditingBuilding, setIsEditingBuilding] = useState(false);
  const [showQuickLocationModal, setShowQuickLocationModal] = useState(false);
  const [quickLocationName, setQuickLocationName] = useState('');
  const [quickLocationCity, setQuickLocationCity] = useState('Noida');
  const [newTowerInput, setNewTowerInput] = useState('');

  const [currentBuilding, setCurrentBuilding] = useState<Partial<Building>>({
    name: '',
    location_id: 'loc-sec-62',
    location_name: 'Sector 62, Noida',
    locations: ['loc-sec-62'],
    location_names: ['Sector 62, Noida'],
    category: 'office-space',
    categories: ['office-space'],
    address: 'Plot A-40, Sector 62, Noida',
    description: '',
    hero_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    total_floors: 14,
    basement_floors: '2 Basements (2B)',
    ground_option: 'Ground (G)',
    structure_display: '2B + G + 14 Floors',
    towers: ['Tower A', 'Tower B'],
    total_towers: 2,
    tower_details: 'Twin Towers (Tower A & Tower B)',
    size_range: '750 sq.ft – 25,000 sq.ft',
    rent_range: '₹55 – ₹70/sq.ft',
    sale_range: '',
    furnishing_options: ['Fully Furnished', 'Semi-Furnished', 'Bare Shell', 'Plug & Play'],
    parking: 'Multi-level covered parking',
    lifts: 'High speed elevators',
    security: '24/7 guarded security & CCTV',
    power_backup: '100% DG backup',
    amenities: ['Central Air Conditioning', 'Food Court', 'High-speed Elevators', 'Power Backup'],
    nearby_landmarks: ['Metro Station'],
    nearby_transport: '500m from Metro Station',
    published: true,
  });

  // Helper to dynamically calculate human-readable building structure
  const getComputedStructureDisplay = (basement?: string, ground?: string, floors?: number) => {
    const parts: string[] = [];
    const b = (basement || '').trim();
    if (b && b !== 'No Basement' && b !== 'None') {
      if (b.includes('5')) parts.push('5B');
      else if (b.includes('4')) parts.push('4B');
      else if (b.includes('3')) parts.push('3B');
      else if (b.includes('2')) parts.push('2B');
      else if (b.includes('1') || b.toLowerCase().includes('single')) parts.push('B');
      else parts.push(b);
    }
    
    const g = (ground || 'Ground (G)').trim();
    if (g === 'Ground (G)') parts.push('G');
    else if (g === 'Ground + Mezzanine (G + M)') parts.push('G + M');
    else if (g === 'Lower Ground + Upper Ground (LG + UG)') parts.push('LG + UG');
    else if (g === 'Stilt + Ground (S + G)') parts.push('S + G');
    else if (g === 'Stilt Only (S)') parts.push('S');
    else if (g === 'Ground Only') parts.push('Ground');
    else if (g && g !== 'No Ground') parts.push(g);

    const f = Number(floors) || 0;
    if (f > 0 && g !== 'Ground Only') {
      parts.push(`${f} Floors`);
    }
    return parts.join(' + ') || `${f || 1} Floors`;
  };

  // Location Modal Form (Add & Edit)
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Partial<Location>>({
    name: '',
    city: 'Noida',
    region: 'Delhi-NCR',
    description: '',
    hero_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    categories: ['office-space', 'it-business-parks'],
    featured: true,
  });

  // Media / Image Library State
  const [customMedia, setCustomMedia] = useState<{ id: string; url: string; title: string; source: string; created_at: string }[]>(() => {
    try {
      const stored = localStorage.getItem('shristi_custom_media');
      return stored ? JSON.parse(stored) : [
        {
          id: 'media-1',
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
          title: 'Modern Corporate Office Interior',
          source: 'System Asset',
          created_at: '2026-09-01'
        },
        {
          id: 'media-2',
          url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
          title: 'Glass Tower Facade Sector 62',
          source: 'System Asset',
          created_at: '2026-09-02'
        },
        {
          id: 'media-3',
          url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
          title: 'Plug and Play Workstations Hall',
          source: 'System Asset',
          created_at: '2026-09-03'
        },
        {
          id: 'media-4',
          url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
          title: 'Executive Boardroom & Conference Suite',
          source: 'System Asset',
          created_at: '2026-09-04'
        },
        {
          id: 'media-5',
          url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
          title: 'Corporate Reception & Waiting Lounge',
          source: 'System Asset',
          created_at: '2026-09-05'
        },
        {
          id: 'media-6',
          url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
          title: 'Premium Collaborative Workstations',
          source: 'System Asset',
          created_at: '2026-09-06'
        },
        {
          id: 'media-7',
          url: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80',
          title: 'Executive Director Cabin with Skyline View',
          source: 'System Asset',
          created_at: '2026-09-07'
        },
        {
          id: 'media-8',
          url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
          title: 'Modern Cafeteria & Breakout Lounge',
          source: 'System Asset',
          created_at: '2026-09-08'
        }
      ];
    } catch {
      return [];
    }
  });

  const [copiedMediaId, setCopiedMediaId] = useState<string | null>(null);
  const [mediaUploadUrl, setMediaUploadUrl] = useState('');
  const [mediaUploadTitle, setMediaUploadTitle] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'admin' | 'landlord'>('all');
  const [mediaUploadMode, setMediaUploadMode] = useState<'device' | 'url'>('device');
  const [newPropertyGalleryUrl, setNewPropertyGalleryUrl] = useState('');
  const [newBuildingGalleryUrl, setNewBuildingGalleryUrl] = useState('');
  const [viewingImageModal, setViewingImageModal] = useState<{ url: string; title: string; allImages?: string[]; activeIndex?: number } | null>(null);

  // Helper to safely extract all photos from a lead
  const getLeadPhotos = (lead: Lead): string[] => {
    let rawImgs: any[] = [];
    if (Array.isArray(lead.images)) {
      rawImgs = lead.images;
    } else if (typeof lead.images === 'string') {
      try { rawImgs = JSON.parse(lead.images); } catch { rawImgs = [lead.images]; }
    }
    if (rawImgs.length === 0 && lead.list_property_details?.images) {
      rawImgs = Array.isArray(lead.list_property_details.images)
        ? lead.list_property_details.images
        : [lead.list_property_details.images];
    }
    return rawImgs.filter(img => typeof img === 'string' && img.length > 10 && !img.includes('[uploaded image]'));
  };

  const compressImageFile = (file: File, maxWidth = 1400, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve((e.target?.result as string) || '');
          }
        };
        img.onerror = () => resolve((e.target?.result as string) || '');
        img.src = (e.target?.result as string) || '';
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const compressed = await compressImageFile(file);
      if (compressed) {
        const newMedia = {
          id: `media-${Date.now()}-${i}`,
          url: compressed,
          title: file.name.replace(/\.[^/.]+$/, "") || 'Uploaded Image',
          source: 'Admin Upload',
          created_at: new Date().toISOString().slice(0, 10)
        };
        setCustomMedia(prev => {
          const updated = [newMedia, ...prev];
          try {
            localStorage.setItem('shristi_custom_media', JSON.stringify(updated));
          } catch (err) {
            console.warn('LocalStorage quota warning for custom media:', err);
          }
          return updated;
        });
      }
    }

    e.target.value = '';
  };

  const handleAddMediaUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUploadUrl.trim()) return;
    const newMedia = {
      id: `media-${Date.now()}`,
      url: mediaUploadUrl.trim(),
      title: mediaUploadTitle.trim() || 'Direct Cloud Image',
      source: 'Admin URL',
      created_at: new Date().toISOString().slice(0, 10)
    };
    setCustomMedia(prev => {
      const updated = [newMedia, ...prev];
      try {
        localStorage.setItem('shristi_custom_media', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage quota warning for custom media:', err);
      }
      return updated;
    });
    setMediaUploadUrl('');
    setMediaUploadTitle('');
  };

  const handleDeleteMedia = (id: string) => {
    setCustomMedia(prev => {
      const updated = prev.filter(m => m.id !== id);
      try {
        localStorage.setItem('shristi_custom_media', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage quota warning for custom media:', err);
      }
      return updated;
    });
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedMediaId(id);
    setTimeout(() => setCopiedMediaId(null), 2000);
  };

  const handlePropertyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    if (compressed) {
      setCurrentProperty(prev => ({ ...prev, primary_image: compressed }));
    }
    e.target.value = '';
  };

  const handleBuildingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    if (compressed) {
      setCurrentBuilding(prev => ({ ...prev, hero_image: compressed }));
    }
    e.target.value = '';
  };

  const handleLocationImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    if (compressed) {
      setCurrentLocation(prev => ({ ...prev, hero_image: compressed }));
    }
    e.target.value = '';
  };

  // Property Gallery Handlers (Rest of Images)
  const handlePropertyGalleryMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const promises = fileList.map(f => compressImageFile(f));
    const results = await Promise.all(promises);
    const valid = results.filter(Boolean);
    setCurrentProperty(prev => ({
      ...prev,
      gallery: [...(prev.gallery || []), ...valid]
    }));
    e.target.value = '';
  };

  const handlePropertyGalleryReplace = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    if (compressed) {
      setCurrentProperty(prev => {
        const next = [...(prev.gallery || [])];
        next[index] = compressed;
        return { ...prev, gallery: next };
      });
    }
    e.target.value = '';
  };

  const handleUpdatePropertyGalleryUrl = (index: number, val: string) => {
    setCurrentProperty(prev => {
      const next = [...(prev.gallery || [])];
      next[index] = val;
      return { ...prev, gallery: next };
    });
  };

  const handleDeletePropertyGalleryItem = (index: number) => {
    setCurrentProperty(prev => {
      const next = (prev.gallery || []).filter((_, i) => i !== index);
      return { ...prev, gallery: next };
    });
  };

  const handleSetPropertyPrimary = (index: number) => {
    setCurrentProperty(prev => {
      const currentPrimary = prev.primary_image || '';
      const currentGallery = [...(prev.gallery || [])];
      const targetImg = currentGallery[index];
      if (!targetImg) return prev;
      currentGallery[index] = currentPrimary;
      return {
        ...prev,
        primary_image: targetImg,
        gallery: currentGallery
      };
    });
  };

  const handleAddPropertyGalleryUrl = () => {
    if (!newPropertyGalleryUrl.trim()) return;
    setCurrentProperty(prev => ({
      ...prev,
      gallery: [...(prev.gallery || []), newPropertyGalleryUrl.trim()]
    }));
    setNewPropertyGalleryUrl('');
  };

  // Building Gallery Handlers
  const handleBuildingGalleryMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const promises = fileList.map(f => compressImageFile(f));
    const results = await Promise.all(promises);
    const valid = results.filter(Boolean);
    setCurrentBuilding(prev => ({
      ...prev,
      gallery: [...(prev.gallery || []), ...valid]
    }));
    e.target.value = '';
  };

  const handleBuildingGalleryReplace = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    if (compressed) {
      setCurrentBuilding(prev => {
        const next = [...(prev.gallery || [])];
        next[index] = compressed;
        return { ...prev, gallery: next };
      });
    }
    e.target.value = '';
  };

  const handleUpdateBuildingGalleryUrl = (index: number, val: string) => {
    setCurrentBuilding(prev => {
      const next = [...(prev.gallery || [])];
      next[index] = val;
      return { ...prev, gallery: next };
    });
  };

  const handleDeleteBuildingGalleryItem = (index: number) => {
    setCurrentBuilding(prev => {
      const next = (prev.gallery || []).filter((_, i) => i !== index);
      return { ...prev, gallery: next };
    });
  };

  const handleSetBuildingHero = (index: number) => {
    setCurrentBuilding(prev => {
      const currentHero = prev.hero_image || '';
      const currentGallery = [...(prev.gallery || [])];
      const targetImg = currentGallery[index];
      if (!targetImg) return prev;
      currentGallery[index] = currentHero;
      return {
        ...prev,
        hero_image: targetImg,
        gallery: currentGallery
      };
    });
  };

  const handleAddBuildingGalleryUrl = () => {
    if (!newBuildingGalleryUrl.trim()) return;
    setCurrentBuilding(prev => ({
      ...prev,
      gallery: [...(prev.gallery || []), newBuildingGalleryUrl.trim()]
    }));
    setNewBuildingGalleryUrl('');
  };

  const loadAllData = async () => {
    setLoading(true);
    const [p, b, l, ld] = await Promise.all([
      StorageService.getProperties(),
      StorageService.getBuildings(),
      StorageService.getLocations(),
      StorageService.getLeads(),
    ]);
    setProperties(p);
    setBuildings(b);
    setLocations(l);
    setLeads(ld);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'Govind@6125119603') {
      setIsAuthenticated(true);
      localStorage.setItem('shristi_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid administrator passcode. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('shristi_admin_auth');
  };

  // Lead Status Update
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await StorageService.updateLeadStatus(leadId, newStatus);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  };

  // --- PROPERTY ACTIONS ---
  const handleOpenAddProperty = () => {
    setIsEditingProperty(false);
    const initialCat = (propertyCategoryFilter !== 'all' ? propertyCategoryFilter : 'office-space') as PropertyCategory;
    const config = CATEGORY_CONFIG[initialCat] || CATEGORY_CONFIG['office-space'];
    
    setCurrentProperty({
      title: '',
      category: initialCat,
      property_type: config.defaultType,
      listing_type: initialCat === 'land' ? 'Sale' : 'Rent',
      status: 'Available',
      price: initialCat === 'land' ? 50000000 : (initialCat === 'warehouses' || initialCat === 'factory-industrial' ? 150000 : 65000),
      price_display: initialCat === 'land' ? '₹5.00 Cr' : (initialCat === 'warehouses' ? '₹1,50,000/month' : '₹65,000/month'),
      rate_per_sqft: initialCat === 'land' ? '₹85,000/sq.m' : (initialCat === 'warehouses' || initialCat === 'factory-industrial' ? '₹35/sq.ft' : '₹55/sq.ft'),
      location_id: locations[0]?.id || 'loc-sec-62',
      location_name: locations[0]?.name || 'Sector 62, Noida',
      building_id: undefined,
      building_name: undefined,
      address: locations[0]?.name || 'Sector 62, Noida',
      city: locations[0]?.city || 'Noida',
      built_up_area: initialCat === 'land' ? 5000 : (initialCat === 'warehouses' || initialCat === 'factory-industrial' ? 5000 : 1150),
      carpet_area: undefined,
      land_area: initialCat === 'land' ? 500 : undefined,
      area_unit: initialCat === 'land' ? 'sq.meter' : 'sq.ft',
      floor: initialCat === 'shops-retail' || initialCat === 'warehouses' || initialCat === 'land' ? 'Ground Floor' : '4th Floor',
      total_floors: initialCat === 'warehouses' || initialCat === 'land' ? 1 : 12,
      furnishing: initialCat === 'warehouses' || initialCat === 'factory-industrial' || initialCat === 'land' ? 'Bare Shell' : 'Furnished',
      parking: initialCat === 'warehouses' || initialCat === 'factory-industrial' 
        ? 'Internal trailer maneuvering & loading bays' 
        : (initialCat === 'land' ? 'Freehold Open Plot' : '1 Covered Slot'),
      power_load: config.defaultPower,
      road_width: config.defaultRoad,
      possession: initialCat === 'land' ? 'Immediate Clear Title' : 'Ready to Move',
      description: '',
      features: [...config.suggestedFeatures.slice(0, 4)],
      amenities: ['24/7 Security', 'Power Backup'],
      primary_image: initialCat === 'warehouses' 
        ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80'
        : initialCat === 'factory-industrial'
        ? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80'
        : initialCat === 'land'
        ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80'
        : initialCat === 'shops-retail'
        ? 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=1000&q=80'
        : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
      gallery: [],
      published: true,
    });
    setCustomPropertyTypeInput('');
    setNewFeatureTag('');
    setNewPropertyGalleryUrl('');
    setShowPropertyModal(true);
  };

  const handleOpenEditProperty = (prop: Property) => {
    setIsEditingProperty(true);
    setCurrentProperty({
      ...prop,
      category: prop.category || 'office-space',
      property_type: prop.property_type || 'Commercial Office',
      area_unit: prop.area_unit || 'sq.ft',
      land_area: prop.land_area,
      floor: prop.floor || 'Ground Floor',
      total_floors: prop.total_floors || 1,
      power_load: prop.power_load || '',
      road_width: prop.road_width || '',
      possession: prop.possession || 'Ready to Move',
      parking: prop.parking || '',
      features: prop.features && Array.isArray(prop.features) ? [...prop.features] : [],
      amenities: prop.amenities && Array.isArray(prop.amenities) ? [...prop.amenities] : [],
      gallery: prop.gallery && Array.isArray(prop.gallery) ? [...prop.gallery] : []
    });
    setCustomPropertyTypeInput('');
    setNewFeatureTag('');
    setNewPropertyGalleryUrl('');
    setShowPropertyModal(true);
  };

  const handleAddFeatureTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || newFeatureTag).trim();
    if (!tag) return;
    const existing = currentProperty.features || [];
    if (!existing.includes(tag)) {
      setCurrentProperty({
        ...currentProperty,
        features: [...existing, tag]
      });
    }
    setNewFeatureTag('');
  };

  const handleRemoveFeatureTag = (index: number) => {
    const existing = currentProperty.features || [];
    setCurrentProperty({
      ...currentProperty,
      features: existing.filter((_, i) => i !== index)
    });
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to remove this property listing?')) {
      await StorageService.deleteProperty(propertyId);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    }
  };

  const handlePropertyStatus = async (property: Property, status: PropertyStatus) => {
    const updated = { ...property, status };
    await StorageService.saveProperty(updated);
    setProperties(prev => prev.map(p => p.id === property.id ? updated : p));
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProperty.title || currentProperty.price === undefined || currentProperty.price === null) {
      alert('Please fill in both Property Title and Price.');
      return;
    }

    setIsSaving(true);
    try {
      const loc = locations.find(l => l.id === currentProperty.location_id);
      const bld = buildings.find(b => b.id === currentProperty.building_id);

      const propertyObj: Property = {
        id: currentProperty.id || `prop-${Date.now()}`,
        title: currentProperty.title.trim(),
        slug: currentProperty.slug || currentProperty.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        reference_number: currentProperty.reference_number || `SE-${Math.floor(1000 + Math.random() * 9000)}`,
        category: (currentProperty.category || 'office-space') as PropertyCategory,
        property_type: currentProperty.property_type || 'Commercial Office',
        listing_type: (currentProperty.listing_type || 'Rent') as any,
        status: (currentProperty.status || 'Available') as any,
        price: Number(currentProperty.price) || 0,
        price_display: currentProperty.price_display || `₹${Number(currentProperty.price).toLocaleString()}/month`,
        rate_per_sqft: currentProperty.rate_per_sqft || '',
        location_id: (currentProperty.location_id && currentProperty.location_id.trim() !== '') ? currentProperty.location_id : (locations[0]?.id || 'loc-sec-62'),
        location_name: loc ? loc.name : (currentProperty.location_name || 'Sector 62, Noida'),
        building_id: (currentProperty.building_id && currentProperty.building_id.trim() !== '') ? currentProperty.building_id : null as any,
        building_name: (currentProperty.building_id && bld) ? bld.name : (currentProperty.building_name || null as any),
        address: currentProperty.address || (loc ? loc.name : 'Sector 62, Noida'),
        city: currentProperty.city || 'Noida',
        built_up_area: Number(currentProperty.built_up_area) || 1200,
        carpet_area: (currentProperty.carpet_area && !isNaN(Number(currentProperty.carpet_area))) ? Number(currentProperty.carpet_area) : null as any,
        land_area: (currentProperty.land_area && !isNaN(Number(currentProperty.land_area))) ? Number(currentProperty.land_area) : null as any,
        area_unit: currentProperty.area_unit || 'sq.ft',
        floor: currentProperty.floor || 'Ground Floor',
        total_floors: (currentProperty.total_floors && !isNaN(Number(currentProperty.total_floors))) ? Number(currentProperty.total_floors) : null as any,
        furnishing: (currentProperty.furnishing || 'Furnished') as any,
        parking: currentProperty.parking || '1 Covered Slot',
        power_load: currentProperty.power_load || '',
        road_width: currentProperty.road_width || '',
        possession: currentProperty.possession || 'Ready to Move',
        description: currentProperty.description || '',
        features: Array.isArray(currentProperty.features) && currentProperty.features.length > 0 ? currentProperty.features : ['24/7 Security', 'Power Backup'],
        amenities: Array.isArray(currentProperty.amenities) ? currentProperty.amenities : [],
        primary_image: currentProperty.primary_image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
        gallery: Array.isArray(currentProperty.gallery) ? currentProperty.gallery : [],
        published: true,
        created_at: currentProperty.created_at || new Date().toISOString(),
      };

      await StorageService.saveProperty(propertyObj);

      if (isEditingProperty) {
        setProperties(prev => prev.map(p => p.id === propertyObj.id ? propertyObj : p));
      } else {
        setProperties(prev => [propertyObj, ...prev]);
      }

      setShowPropertyModal(false);
    } catch (err: any) {
      console.error('Error saving property:', err);
      alert('Update Error: ' + (err?.message || 'Could not save changes.'));
    } finally {
      setIsSaving(false);
    }
  };

  // --- BUILDING ACTIONS ---
  const handleOpenAddBuilding = () => {
    setIsEditingBuilding(false);
    const initialLoc = locations[0]?.id || 'loc-sec-62';
    const initialLocName = locations[0]?.name || 'Sector 62, Noida';
    setCurrentBuilding({
      name: '',
      location_id: initialLoc,
      location_name: initialLocName,
      locations: [initialLoc],
      location_names: [initialLocName],
      category: 'office-space',
      categories: ['office-space'],
      address: 'Plot A-40, Sector 62, Noida',
      description: '',
      hero_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      gallery: [],
      total_floors: 14,
      basement_floors: '2 Basements (2B)',
      ground_option: 'Ground (G)',
      structure_display: '2B + G + 14 Floors',
      towers: ['Tower A', 'Tower B'],
      total_towers: 2,
      tower_details: 'Twin Towers (Tower A & Tower B)',
      size_range: '750 sq.ft – 25,000 sq.ft',
      rent_range: '₹55 – ₹70/sq.ft',
      sale_range: '',
      furnishing_options: ['Fully Furnished', 'Semi-Furnished', 'Bare Shell', 'Plug & Play'],
      parking: 'Covered basement parking',
      lifts: 'High-speed passenger lifts',
      security: '24/7 CCTV & security guards',
      power_backup: '100% DG power backup',
      amenities: ['Central Air Conditioning', 'Food Court', 'High-speed Elevators'],
      nearby_landmarks: ['Metro Station'],
      nearby_transport: 'Immediate metro connectivity',
      published: true,
    });
    setNewBuildingGalleryUrl('');
    setNewTowerInput('');
    setShowBuildingModal(true);
  };

  const handleOpenEditBuilding = (bld: Building) => {
    setIsEditingBuilding(true);
    const existingCats: PropertyCategory[] = Array.isArray(bld.categories) && bld.categories.length > 0 
      ? bld.categories 
      : [bld.category || 'office-space'];
    const existingLocs = Array.isArray(bld.locations) && bld.locations.length > 0
      ? bld.locations
      : [bld.location_id];
    const existingTowers = Array.isArray(bld.towers) ? [...bld.towers] : [];
    const basement = bld.basement_floors || '2 Basements (2B)';
    const ground = bld.ground_option || 'Ground (G)';
    const floors = Number(bld.total_floors) || 14;
    const structureDisplay = bld.structure_display || getComputedStructureDisplay(basement, ground, floors);

    setCurrentBuilding({
      ...bld,
      categories: existingCats,
      locations: existingLocs,
      towers: existingTowers,
      basement_floors: basement,
      ground_option: ground,
      structure_display: structureDisplay,
      tower_details: bld.tower_details || (existingTowers.length > 1 ? `${existingTowers.length} Towers (${existingTowers.join(', ')})` : (existingTowers[0] || 'Single Tower')),
      gallery: bld.gallery && Array.isArray(bld.gallery) ? [...bld.gallery] : []
    });
    setNewBuildingGalleryUrl('');
    setNewTowerInput('');
    setShowBuildingModal(true);
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    if (window.confirm('Are you sure you want to delete this commercial building?')) {
      await StorageService.deleteBuilding(buildingId);
      setBuildings(prev => prev.filter(b => b.id !== buildingId));
    }
  };

  const handleSaveQuickLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLocationName.trim()) return;
    try {
      const slug = quickLocationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newLoc: Location = {
        id: `loc-${slug}`,
        name: quickLocationName.trim(),
        city: quickLocationCity.trim() || 'Noida',
        region: 'Delhi-NCR',
        slug: slug,
        description: `Premier commercial hubs and IT centers in ${quickLocationName.trim()}, ${quickLocationCity.trim()}.`,
        hero_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        categories: ['office-space', 'it-business-parks'],
        featured: true,
        building_count: 1,
        property_count: 0
      };
      await StorageService.saveLocation(newLoc);
      setLocations(prev => [newLoc, ...prev.filter(l => l.id !== newLoc.id)]);
      
      const currentLocs = currentBuilding.locations || [];
      const updatedLocs = currentLocs.includes(newLoc.id) ? currentLocs : [newLoc.id, ...currentLocs];
      const currentLocNames = currentBuilding.location_names || [];
      const updatedLocNames = currentLocNames.includes(newLoc.name) ? currentLocNames : [newLoc.name, ...currentLocNames];
      
      setCurrentBuilding(prev => ({
        ...prev,
        location_id: newLoc.id,
        location_name: newLoc.name,
        locations: updatedLocs,
        location_names: updatedLocNames,
      }));
      setQuickLocationName('');
      setShowQuickLocationModal(false);
    } catch (err: any) {
      alert('Error creating location: ' + err.message);
    }
  };

  const handleSaveBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBuilding.name) {
      alert('Please enter Building Name.');
      return;
    }

    setIsSaving(true);
    try {
      const selectedLocationIds = Array.isArray(currentBuilding.locations) && currentBuilding.locations.length > 0
        ? currentBuilding.locations
        : [currentBuilding.location_id || (locations[0]?.id || 'loc-sec-62')];
      
      const primaryLocId = currentBuilding.location_id || selectedLocationIds[0];
      const primaryLoc = locations.find(l => l.id === primaryLocId);
      const selectedLocationNames = selectedLocationIds.map(id => locations.find(l => l.id === id)?.name).filter(Boolean) as string[];

      const selectedCategories: PropertyCategory[] = Array.isArray(currentBuilding.categories) && currentBuilding.categories.length > 0
        ? currentBuilding.categories
        : [currentBuilding.category || 'office-space'];
      const primaryCategory = selectedCategories[0];

      const towersList = Array.isArray(currentBuilding.towers) ? currentBuilding.towers : [];

      const buildingObj: Building = {
        id: currentBuilding.id || `bld-${Date.now()}`,
        name: currentBuilding.name.trim(),
        slug: currentBuilding.slug || currentBuilding.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        location_id: primaryLocId,
        location_name: primaryLoc ? primaryLoc.name : (currentBuilding.location_name || 'Sector 62, Noida'),
        locations: selectedLocationIds,
        location_names: selectedLocationNames,
        category: primaryCategory,
        categories: selectedCategories,
        address: currentBuilding.address || (primaryLoc ? primaryLoc.name : 'Sector 62, Noida'),
        description: currentBuilding.description || '',
        hero_image: currentBuilding.hero_image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        gallery: Array.isArray(currentBuilding.gallery) ? currentBuilding.gallery : [],
        total_floors: Number(currentBuilding.total_floors) || 1,
        basement_floors: currentBuilding.basement_floors || '2 Basements (2B)',
        ground_option: currentBuilding.ground_option || 'Ground (G)',
        structure_display: currentBuilding.structure_display || getComputedStructureDisplay(currentBuilding.basement_floors, currentBuilding.ground_option, currentBuilding.total_floors || 14),
        towers: towersList,
        total_towers: towersList.length > 0 ? towersList.length : (currentBuilding.total_towers || 1),
        tower_details: currentBuilding.tower_details || (towersList.length > 1 ? `${towersList.length} Towers (${towersList.join(', ')})` : (towersList[0] || 'Single Tower')),
        size_range: currentBuilding.size_range || '1,000 sq.ft – 20,000 sq.ft',
        rent_range: currentBuilding.rent_range || '₹55 – ₹70/sq.ft',
        sale_range: currentBuilding.sale_range || undefined,
        furnishing_options: currentBuilding.furnishing_options || ['Furnished', 'Bare Shell'],
        parking: currentBuilding.parking || 'Multi-tier covered parking',
        lifts: currentBuilding.lifts || 'High-speed lifts',
        security: currentBuilding.security || '24/7 CCTV & Guards',
        power_backup: currentBuilding.power_backup || '100% DG Backup',
        amenities: currentBuilding.amenities || ['Central AC', 'Power Backup', 'Cafeteria'],
        nearby_landmarks: currentBuilding.nearby_landmarks || ['Metro Station'],
        nearby_transport: currentBuilding.nearby_transport || 'Short walk to metro station',
        published: true,
        property_count: currentBuilding.property_count || 1,
      };

      await StorageService.saveBuilding(buildingObj);

      if (isEditingBuilding) {
        setBuildings(prev => prev.map(b => b.id === buildingObj.id ? buildingObj : b));
      } else {
        setBuildings(prev => [buildingObj, ...prev]);
      }

      setShowBuildingModal(false);
    } catch (err: any) {
      console.error('Error saving building:', err);
      alert('Update Error: ' + (err?.message || 'Could not save building.'));
    } finally {
      setIsSaving(false);
    }
  };

  // --- LOCATION ACTIONS ---
  const handleOpenAddLocation = () => {
    setIsEditingLocation(false);
    setCurrentLocation({
      name: '',
      city: 'Noida',
      region: 'Delhi-NCR',
      description: '',
      hero_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      categories: ['office-space', 'it-business-parks'],
      featured: true,
      building_count: 0,
      property_count: 0,
    });
    setShowLocationModal(true);
  };

  const handleOpenEditLocation = (loc: Location) => {
    setIsEditingLocation(true);
    setCurrentLocation({ ...loc });
    setShowLocationModal(true);
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (window.confirm('Are you sure you want to delete this commercial location?')) {
      await StorageService.deleteLocation(locationId);
      setLocations(prev => prev.filter(l => l.id !== locationId));
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLocation.name) {
      alert('Please enter Location Name.');
      return;
    }

    setIsSaving(true);
    try {
      const locationObj: Location = {
        id: currentLocation.id || `loc-${Date.now()}`,
        name: currentLocation.name.trim(),
        slug: currentLocation.slug || currentLocation.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        city: currentLocation.city || 'Noida',
        region: currentLocation.region || 'Delhi-NCR',
        description: currentLocation.description || '',
        hero_image: currentLocation.hero_image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        building_count: currentLocation.building_count !== undefined ? currentLocation.building_count : 1,
        property_count: currentLocation.property_count !== undefined ? currentLocation.property_count : 1,
        categories: currentLocation.categories && currentLocation.categories.length > 0 ? currentLocation.categories : ['office-space'],
        featured: currentLocation.featured !== undefined ? currentLocation.featured : true,
      };

      await StorageService.saveLocation(locationObj);

      if (isEditingLocation) {
        setLocations(prev => prev.map(l => l.id === locationObj.id ? locationObj : l));
      } else {
        setLocations(prev => [locationObj, ...prev]);
      }

      setShowLocationModal(false);
    } catch (err: any) {
      console.error('Error saving location:', err);
      alert('Update Error: ' + (err?.message || 'Could not save location.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Export Leads to CSV
  const exportLeadsCSV = () => {
    const headers = ['ID', 'Type', 'Name', 'Phone', 'Email', 'Status', 'Property/Building', 'Location', 'Visit Date', 'Created At'];
    const rows = leads.map(l => [
      l.id,
      l.lead_type,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      l.status,
      `"${(l.property_title || l.building_name || '').replace(/"/g, '""')}"`,
      `"${(l.location_name || '').replace(/"/g, '""')}"`,
      l.preferred_visit_date || 'N/A',
      l.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shristi_estate_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B132B]/85 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Shristi Estate Admin
            </h1>
            <p className="text-xs text-slate-500">
              Commercial management desk for properties, buildings, images, tariffs, and qualified leads.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs text-center font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Admin Security Passcode
              </label>
              <input
                type="password"
                required
                placeholder="Enter secret admin passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
              />
            </div>
            <button
              type="submit"
              className="btn-glass-primary w-full py-2.5 rounded-xl font-semibold text-sm"
            >
              Sign In to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered Properties
  const filteredProperties = properties.filter(p => {
    if (propertyCategoryFilter !== 'all' && p.category !== propertyCategoryFilter) return false;
    if (!propertySearch) return true;
    const q = propertySearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.reference_number.toLowerCase().includes(q) ||
      p.location_name.toLowerCase().includes(q) ||
      (p.property_type && p.property_type.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.building_name && p.building_name.toLowerCase().includes(q))
    );
  });

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    if (leadStatusFilter !== 'All' && l.status !== leadStatusFilter) return false;
    if (leadSearch) {
      const q = leadSearch.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.property_title && l.property_title.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Media Items (Custom Uploads + Landlord Submissions)
  const landlordUploads = leads
    .filter(l => l.lead_type === 'list_property')
    .flatMap(l => {
      const photos = getLeadPhotos(l);
      return photos.map((img, idx) => ({
        id: `lead-img-${l.id}-${idx}`,
        url: img,
        title: `${l.name} • ${l.property_title || l.building_name || l.location_name || 'Owner Property'}`,
        source: `Landlord (${l.phone})`,
        created_at: (l.created_at || '').slice(0, 10),
        lead_id: l.id
      }));
    });

  // Convert a Landlord Listing Submission directly into a Live Property
  const handleConvertLeadToProperty = (lead: Lead) => {
    const photos = getLeadPhotos(lead);
    const details = lead.list_property_details || {};
    const cleanArea = Number(String(details.area || '').replace(/[^0-9.]/g, '')) || 2000;
    const cleanPrice = Number(String(details.expected_price || '').replace(/[^0-9.]/g, '')) || 60;
    const category = (details.property_category as PropertyCategory) || 'office-space';

    setCurrentProperty({
      id: `prop-${Date.now()}`,
      title: `${details.area || 'Commercial'} ${category.replace(/-/g, ' ')} in ${lead.location_name || 'Sector 62, Noida'}`,
      slug: `commercial-${category}-${Date.now()}`,
      reference_number: `SE-L-${Math.floor(1000 + Math.random() * 9000)}`,
      category: category,
      property_type: 'Commercial Office',
      listing_type: 'Rent',
      status: 'Available',
      price: cleanPrice,
      price_display: details.expected_price || `₹${cleanPrice}/sq.ft`,
      rate_per_sqft: `₹${cleanPrice}`,
      rent_frequency: 'month',
      location_id: lead.location_id || 'loc-sector-62',
      location_name: lead.location_name || 'Sector 62, Noida',
      building_id: lead.building_id || undefined,
      building_name: lead.building_name || undefined,
      address: details.address || `${lead.location_name || 'Noida'}, Uttar Pradesh`,
      city: 'Noida',
      built_up_area: cleanArea,
      carpet_area: Math.round(cleanArea * 0.75),
      area_unit: 'sq.ft',
      floor: 'Middle Floor',
      furnishing: 'Semi-Furnished',
      possession: 'Immediate',
      description: lead.message || 'Commercial property listed directly by owner/representative.',
      features: ['24/7 Power Backup', 'Car Parking', 'High Speed Elevators', 'Security'],
      amenities: ['CCTV', 'Reserved Parking', 'Fire Fighting System'],
      primary_image: photos[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      gallery: photos.length > 1 ? photos.slice(1) : [],
      featured: false,
      published: true,
      created_at: new Date().toISOString(),
    });
    setIsEditingProperty(false);
    setShowPropertyModal(true);
    setActiveTab('properties');
  };

  const allMediaItems = [
    ...customMedia,
    ...landlordUploads
  ];

  const filteredMediaItems = allMediaItems.filter(m => {
    if (mediaFilter === 'admin') return m.source.includes('Admin') || m.source.includes('System');
    if (mediaFilter === 'landlord') return m.source.includes('Landlord');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8">
      {/* Top Header & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Commercial Content & Inventory Editor
            </span>
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Supabase Live Cloud DB
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
            Admin Management Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full edit control over property images, building tariffs, floor areas, and live statuses.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:border-brand-300 dark:hover:border-brand-800 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:text-brand-400 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 group cursor-pointer"
            title="Sync & Update Live Data from Supabase Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 transition-transform ${loading ? 'animate-spin text-brand-500' : 'group-hover:rotate-180 duration-500'}`} />
            <span>{loading ? 'Syncing...' : 'Sync & Update'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* METRICS DASHBOARD (SECTION 48) */}
      {/* OPTIMIZED METRIC BUTTONS & QUICK SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Properties Button */}
        <button
          onClick={() => setActiveTab('properties')}
          className={`glass-card rounded-2xl p-3.5 sm:p-5 text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between border cursor-pointer select-none active:scale-[0.98] ${
            activeTab === 'properties'
              ? 'border-brand-500/80 dark:border-brand-400/80 bg-brand-50/90 dark:bg-brand-950/40 shadow-lg shadow-brand-500/15 ring-2 ring-brand-500/25'
              : 'border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-slate-900/70 hover:border-brand-500/40 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40'
          }`}
        >
          {/* Ambient Corner Glow */}
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-brand-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          {activeTab === 'properties' && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-cyan-400" />
          )}

          <div>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/25 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 group-hover:border-brand-500/40 transition-all duration-300 shadow-inner">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mt-2.5 sm:mt-3.5">
              Properties
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit'] tracking-tight leading-none">
              {properties.length}
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{properties.filter(p => p.status === 'Available' || p.status === 'Ready to Move').length} Active</span>
            </div>
            {activeTab === 'properties' && (
              <span className="text-[9px] sm:text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Active</span>
            )}
          </div>
        </button>

        {/* Buildings Button */}
        <button
          onClick={() => setActiveTab('buildings')}
          className={`glass-card rounded-2xl p-3.5 sm:p-5 text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between border cursor-pointer select-none active:scale-[0.98] ${
            activeTab === 'buildings'
              ? 'border-cyan-500/80 dark:border-cyan-400/80 bg-cyan-50/90 dark:bg-cyan-950/40 shadow-lg shadow-cyan-500/15 ring-2 ring-cyan-500/25'
              : 'border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-slate-900/70 hover:border-cyan-500/40 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40'
          }`}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-cyan-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          {activeTab === 'buildings' && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-400" />
          )}

          <div>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-500/40 transition-all duration-300 shadow-inner">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mt-2.5 sm:mt-3.5">
              Buildings
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit'] tracking-tight leading-none">
              {buildings.length}
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] sm:text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span>In {locations.length} Sectors</span>
            </div>
            {activeTab === 'buildings' && (
              <span className="text-[9px] sm:text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Active</span>
            )}
          </div>
        </button>

        {/* Total Inquiries Button */}
        <button
          onClick={() => {
            setActiveTab('leads');
            setLeadStatusFilter('All');
          }}
          className={`glass-card rounded-2xl p-3.5 sm:p-5 text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between border cursor-pointer select-none active:scale-[0.98] ${
            activeTab === 'leads' && leadStatusFilter === 'All'
              ? 'border-blue-500/80 dark:border-blue-400/80 bg-blue-50/90 dark:bg-blue-950/40 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/25'
              : 'border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-slate-900/70 hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40'
          }`}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          {activeTab === 'leads' && leadStatusFilter === 'All' && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-400" />
          )}

          <div>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:border-blue-500/40 transition-all duration-300 shadow-inner">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <span>Leads</span>
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mt-2.5 sm:mt-3.5">
              Total Inquiries
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit'] tracking-tight leading-none">
              {leads.length}
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] sm:text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>{leads.filter(l => l.status === 'New').length} New Unread</span>
            </div>
            {activeTab === 'leads' && leadStatusFilter === 'All' && (
              <span className="text-[9px] sm:text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active</span>
            )}
          </div>
        </button>

        {/* Site Visits Button */}
        <button
          onClick={() => {
            setActiveTab('leads');
            setLeadStatusFilter('Visit Scheduled');
          }}
          className={`glass-card rounded-2xl p-3.5 sm:p-5 text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between border cursor-pointer select-none active:scale-[0.98] ${
            activeTab === 'leads' && leadStatusFilter === 'Visit Scheduled'
              ? 'border-teal-500/80 dark:border-teal-400/80 bg-teal-50/90 dark:bg-teal-950/40 shadow-lg shadow-teal-500/15 ring-2 ring-teal-500/25'
              : 'border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-slate-900/70 hover:border-teal-500/40 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40'
          }`}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-teal-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          {activeTab === 'leads' && leadStatusFilter === 'Visit Scheduled' && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
          )}

          <div>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/25 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 group-hover:border-teal-500/40 transition-all duration-300 shadow-inner">
                <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                <span>Visits</span>
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mt-2.5 sm:mt-3.5">
              Site Visits
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit'] tracking-tight leading-none">
              {leads.filter(l => l.status === 'Visit Scheduled').length}
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] sm:text-[11px] font-semibold text-teal-600 dark:text-teal-400">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>Scheduled</span>
            </div>
            {activeTab === 'leads' && leadStatusFilter === 'Visit Scheduled' && (
              <span className="text-[9px] sm:text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Active</span>
            )}
          </div>
        </button>

        {/* Conversions Button */}
        <button
          onClick={() => {
            setActiveTab('leads');
            setLeadStatusFilter('Converted');
          }}
          className={`glass-card rounded-2xl p-3.5 sm:p-5 text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between border cursor-pointer select-none active:scale-[0.98] col-span-2 sm:col-span-1 ${
            activeTab === 'leads' && leadStatusFilter === 'Converted'
              ? 'border-emerald-500/80 dark:border-emerald-400/80 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/25'
              : 'border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-slate-900/70 hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40'
          }`}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          {activeTab === 'leads' && leadStatusFilter === 'Converted' && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          )}

          <div>
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:border-emerald-500/40 transition-all duration-300 shadow-inner">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <span>Deals</span>
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mt-2.5 sm:mt-3.5">
              Conversions
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit'] tracking-tight leading-none">
              {leads.filter(l => l.status === 'Converted').length}
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Closed Deals</span>
            </div>
            {activeTab === 'leads' && leadStatusFilter === 'Converted' && (
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active</span>
            )}
          </div>
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'properties' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Properties & Tariffs ({properties.length})
        </button>
        <button
          onClick={() => setActiveTab('buildings')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'buildings' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Buildings & Rates ({buildings.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'leads' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Leads & Inquiries ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'locations' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Locations ({locations.length})
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 ${
            activeTab === 'media' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Image Uploader & Media ({allMediaItems.length})</span>
        </button>
      </div>

      {/* TAB 1: PROPERTIES MANAGER WITH EDITABLE IMAGES, TARIFFS & SPECS */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search property by title, ID, building, type, or sector..."
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-xs"
              />
            </div>

            <button
              onClick={handleOpenAddProperty}
              className="btn-glass-primary w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>
                {propertyCategoryFilter !== 'all' 
                  ? `Add ${CATEGORY_CONFIG[propertyCategoryFilter as PropertyCategory]?.label || 'Commercial'} Property`
                  : 'Add Commercial Property'}
              </span>
            </button>
          </div>

          {/* CATEGORY QUICK-FILTER TABS (ALL 6 ASSET CLASSES) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setPropertyCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                propertyCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Properties</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                propertyCategoryFilter === 'all' 
                  ? 'bg-white/20 text-white dark:bg-black/20 dark:text-slate-900' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}>
                {properties.length}
              </span>
            </button>

            {(['it-business-parks', 'warehouses', 'factory-industrial', 'land', 'shops-retail', 'office-space'] as PropertyCategory[]).map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const IconComp = cfg?.icon || Building2;
              const count = properties.filter(p => p.category === cat).length;
              const isActive = propertyCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setPropertyCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? `${cfg.badgeBg} text-white shadow-md shadow-brand-500/20`
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cfg.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop & Tablet Table (>= md) */}
          <div className="hidden md:block glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Property & Category</th>
                    <th className="p-3.5">Building & Location</th>
                    <th className="p-3.5">Area & Technical Specs</th>
                    <th className="p-3.5">Tariff / Price</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredProperties.map((prop) => {
                    const cfg = CATEGORY_CONFIG[prop.category] || CATEGORY_CONFIG['office-space'];
                    const CatIcon = cfg?.icon || Building2;
                    return (
                      <tr key={prop.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Image & Title & Category Badge */}
                        <td className="p-3.5 flex items-start gap-3">
                          <div className="relative group/img cursor-pointer shrink-0 mt-0.5" onClick={() => handleOpenEditProperty(prop)}>
                            <img 
                              src={prop.primary_image} 
                              alt="" 
                              className="w-16 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 group-hover/img:opacity-80 transition-opacity" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <Edit3 className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cfg.badgeClass}`}>
                                <CatIcon className="w-3 h-3" />
                                <span>{cfg.label}</span>
                              </span>
                              <span className="text-[10px] font-mono text-brand-500 font-bold">
                                {prop.reference_number}
                              </span>
                            </div>

                            <span 
                              onClick={() => handleOpenEditProperty(prop)}
                              className="font-bold text-slate-900 dark:text-white text-xs block line-clamp-1 hover:text-brand-600 cursor-pointer"
                              title={prop.title}
                            >
                              {prop.title}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                              {prop.property_type || 'Commercial Property'}
                            </span>
                          </div>
                        </td>

                        {/* Building & Location */}
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{prop.building_name || 'Independent / Standalone'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{prop.location_name}</span>
                          </div>
                        </td>

                        {/* Area & Technical Specs */}
                        <td className="p-3.5 space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            <span>{prop.built_up_area?.toLocaleString()} {prop.area_unit || 'sq.ft'}</span>
                            <span className="text-[10px] font-normal text-slate-400">({prop.furnishing})</span>
                          </div>
                          {prop.land_area && (
                            <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Trees className="w-3 h-3" />
                              <span>Plot: {prop.land_area.toLocaleString()} {prop.area_unit || 'sq.m'}</span>
                            </div>
                          )}
                          {prop.power_load && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 truncate max-w-[200px]" title={prop.power_load}>
                              <Zap className="w-3 h-3 shrink-0" />
                              <span className="truncate">{prop.power_load}</span>
                            </div>
                          )}
                          {prop.road_width && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[200px]" title={prop.road_width}>
                              <Truck className="w-3 h-3 shrink-0" />
                              <span className="truncate">{prop.road_width}</span>
                            </div>
                          )}
                        </td>

                        {/* Tariff / Pricing */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {prop.price_display}
                          </div>
                          {prop.rate_per_sqft && (
                            <div className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                              {prop.rate_per_sqft}
                            </div>
                          )}
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            For {prop.listing_type}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <select
                            value={prop.status}
                            onChange={(e) => handlePropertyStatus(prop, e.target.value as PropertyStatus)}
                            className="glass-input px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-colors"
                          >
                            <option value="Available">Available</option>
                            <option value="Ready to Move">Ready to Move</option>
                            <option value="Under Negotiation">Under Negotiation</option>
                            <option value="Rented">Rented</option>
                            <option value="Leased">Leased</option>
                            <option value="Sold">Sold</option>
                          </select>
                        </td>

                        {/* Action buttons: Edit, View, Delete */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditProperty(prop)}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-600 dark:bg-brand-950/80 dark:hover:bg-brand-600 text-brand-700 dark:text-brand-300 hover:text-white border border-brand-200/90 dark:border-brand-800/80 flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:shadow-brand-500/20 active:scale-95 group cursor-pointer"
                              title="Edit All Details & Technical Specs"
                            >
                              <Edit3 className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
                              <span>Update</span>
                            </button>

                            <Link
                              to={`/properties/${prop.slug}`}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleDeleteProperty(prop.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Property Cards (< md) */}
          <div className="block md:hidden space-y-3">
            {filteredProperties.map((prop) => {
              const cfg = CATEGORY_CONFIG[prop.category] || CATEGORY_CONFIG['office-space'];
              const CatIcon = cfg?.icon || Building2;
              return (
                <div 
                  key={prop.id}
                  className="glass-card rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0B132B]/85 shadow-sm space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="relative rounded-xl overflow-hidden w-20 h-16 shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      onClick={() => handleOpenEditProperty(prop)}
                    >
                      <img src={prop.primary_image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Edit3 className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${cfg.badgeClass}`}>
                          <CatIcon className="w-2.5 h-2.5" />
                          <span>{cfg.label}</span>
                        </span>
                        <span className="text-[10px] font-mono text-brand-500 font-bold px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                          {prop.reference_number}
                        </span>
                      </div>
                      <h3 
                        onClick={() => handleOpenEditProperty(prop)}
                        className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-brand-600"
                      >
                        {prop.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{prop.building_name ? `${prop.building_name}, ` : ''}{prop.location_name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Mobile specs chips */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold">
                      {prop.built_up_area?.toLocaleString()} {prop.area_unit || 'sq.ft'}
                    </span>
                    {prop.land_area && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                        Plot: {prop.land_area.toLocaleString()} {prop.area_unit || 'sq.m'}
                      </span>
                    )}
                    {prop.power_load && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] truncate max-w-[140px]">
                        ⚡ {prop.power_load}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                        {prop.price_display}
                      </span>
                      {prop.rate_per_sqft && (
                        <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
                          {prop.rate_per_sqft}
                        </span>
                      )}
                    </div>
                    <select
                      value={prop.status}
                      onChange={(e) => handlePropertyStatus(prop, e.target.value as PropertyStatus)}
                      className="glass-input px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Available">Available</option>
                      <option value="Ready to Move">Ready to Move</option>
                      <option value="Under Negotiation">Under Negotiation</option>
                      <option value="Rented">Rented</option>
                      <option value="Leased">Leased</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEditProperty(prop)}
                      className="py-2 px-2 rounded-xl text-xs font-semibold bg-brand-600 text-white flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update</span>
                    </button>
                    <Link
                      to={`/properties/${prop.slug}`}
                      className="py-2 px-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live View</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteProperty(prop.id)}
                      className="py-2 px-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30 flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredProperties.length === 0 && (
              <div className="text-center py-10 glass-card rounded-2xl p-4 text-xs text-slate-400">
                No properties matched your criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BUILDINGS MANAGER WITH EDITABLE IMAGES, TARIFFS & DETAILS */}
      {activeTab === 'buildings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                Commercial Towers & IT Parks
              </h2>
              <p className="text-xs text-slate-500">
                Manage commercial buildings, hero images, rent tariffs, and available floors
              </p>
            </div>
            <button
              onClick={handleOpenAddBuilding}
              className="btn-glass-primary w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Commercial Building</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {buildings.map((bld) => (
              <div key={bld.id} className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 flex flex-col justify-between shadow-md group">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={bld.hero_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditBuilding(bld)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-brand-600 dark:text-brand-400 shadow-md backdrop-blur-md hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white transition-all text-xs font-semibold flex items-center gap-1 group/btn cursor-pointer"
                      title="Update Building Details & Tariff"
                    >
                      <Edit3 className="w-3.5 h-3.5 transition-transform group-hover/btn:rotate-12" />
                      <span className="hidden sm:inline">Update</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBuilding(bld.id)}
                      className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-rose-500 shadow-md backdrop-blur-md hover:scale-105 transition-all"
                      title="Delete Building"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-base text-white font-['Outfit'] drop-shadow-sm">{bld.name}</h3>
                    <div className="text-xs text-slate-300">{bld.location_name}</div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Tariff Range:</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">{bld.rent_range || 'On Request'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Structure:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {bld.structure_display || `G + ${bld.total_floors} Floors`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Size Range:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{bld.size_range}</span>
                    </div>
                    {bld.towers && bld.towers.length > 0 && (
                      <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1 text-[11px] text-brand-700 dark:text-brand-300 font-semibold truncate">
                        <Building2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span className="truncate">{bld.tower_details || `${bld.towers.length} Towers (${bld.towers.join(', ')})`}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 block">Power:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{bld.power_backup}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 gap-2">
                    <button
                      onClick={() => handleOpenEditBuilding(bld)}
                      className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-md shadow-brand-500/20 active:scale-95 flex items-center gap-1.5 transition-all group cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
                      <span>Update Specs & Tariff</span>
                    </button>

                    <Link to={`/buildings/${bld.slug}`} className="text-xs text-slate-500 hover:text-brand-500 font-semibold flex items-center gap-1 shrink-0 py-1">
                      View Page <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LEADS CRM TABLE */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-lg w-full">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search lead by name, phone, property..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-xs"
                />
              </div>

              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="glass-input px-3 py-2 rounded-xl text-xs font-semibold shrink-0"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Visit Scheduled">Visit Scheduled</option>
                <option value="Converted">Converted</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <button
              onClick={exportLeadsCSV}
              className="btn-glass-primary w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Desktop Table (>= lg) */}
          <div className="hidden lg:block glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Client & Contact</th>
                    <th className="p-3.5">Type & Source</th>
                    <th className="p-3.5">Property / Requirement</th>
                    <th className="p-3.5">Visit Preference</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {lead.name}
                        </div>
                        <div className="text-slate-500 mt-0.5">{lead.phone}</div>
                        <div className="text-slate-400 text-[11px]">{lead.email}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                          {lead.lead_type.replace('_', ' ')}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Source: {lead.lead_source}
                        </div>
                      </td>

                      <td className="p-3.5 max-w-sm">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {lead.property_title || lead.building_name || (lead.lead_type === 'list_property' ? 'Owner Commercial Listing' : 'Custom Space Requirement')}
                        </div>
                        <p className="overview-card-text text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {lead.message}
                        </p>
                        {/* Attached Photos Preview */}
                        {(() => {
                          const photos = getLeadPhotos(lead);
                          if (photos.length === 0) return null;
                          return (
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" />
                                {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}:
                              </span>
                              <div className="flex items-center gap-1">
                                {photos.map((imgUrl, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setViewingImageModal({ url: imgUrl, title: `${lead.name} • Photo ${i + 1}`, allImages: photos, activeIndex: i })}
                                    className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-110 hover:border-brand-500 transition-all cursor-pointer shadow-sm relative group"
                                    title="Click to view full photo"
                                  >
                                    <img src={imgUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {lead.preferred_visit_date ? (
                          <div>
                            <span className="font-semibold">{lead.preferred_visit_date}</span>
                            <div className="text-[11px] text-slate-400">{lead.preferred_visit_time || 'Anytime'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">Not Specified</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className="glass-input px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-colors"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Visit Scheduled">Visit Scheduled</option>
                          <option value="Converted">Converted</option>
                          <option value="Not Interested">Not Interested</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {lead.lead_type === 'list_property' && (
                            <button
                              type="button"
                              onClick={() => handleConvertLeadToProperty(lead)}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/80 dark:hover:bg-brand-900 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-[10px] font-bold inline-flex items-center gap-1 transition-all shadow-sm"
                              title="Publish this Landlord Submission as a Live Property"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Publish</span>
                            </button>
                          )}
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${lead.name}, thank you for contacting Shristi Estate. We have received your commercial inquiry for ${lead.property_title || 'commercial space'}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg btn-whatsapp inline-flex items-center justify-center text-white"
                            title="Message on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile & Tablet Leads Cards (< lg) */}
          <div className="block lg:hidden space-y-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0B132B]/85 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {lead.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                        {lead.lead_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5 font-medium">{lead.phone}</div>
                    {lead.email && <div className="text-slate-400 text-[11px] truncate">{lead.email}</div>}
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Source: {lead.lead_source} • {lead.created_at?.slice(0, 10)}
                    </span>
                  </div>
                </div>

                {/* Direct Call & WhatsApp Action Buttons for Mobile Screen */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Client</span>
                  </a>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${lead.name}, thank you for contacting Shristi Estate regarding your commercial inquiry for ${lead.property_title || 'commercial real estate'}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Requirement / Message */}
                {(lead.property_title || lead.message) && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    {lead.property_title && (
                      <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {lead.property_title}
                      </div>
                    )}
                    {lead.message && (
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                        {lead.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Attached Photos in Mobile Card */}
                {(() => {
                  const photos = getLeadPhotos(lead);
                  if (photos.length === 0) return null;
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400">
                          <ImageIcon className="w-3.5 h-3.5" />
                          Attached Photos ({photos.length})
                        </span>
                        <span className="text-[10px] text-slate-400">Tap to expand</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {photos.map((imgUrl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setViewingImageModal({ url: imgUrl, title: `${lead.name} • Photo ${i + 1}`, allImages: photos, activeIndex: i })}
                            className="aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm"
                          >
                            <img src={imgUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Visit Schedule info if any */}
                {lead.preferred_visit_date && (
                  <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 p-2 rounded-xl border border-teal-200 dark:border-teal-800/50">
                    <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium">
                      Site Visit: {lead.preferred_visit_date} ({lead.preferred_visit_time || 'Anytime'})
                    </span>
                  </div>
                )}

                {/* Status Selector & Publish Action */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {lead.lead_type === 'list_property' && (
                    <button
                      type="button"
                      onClick={() => handleConvertLeadToProperty(lead)}
                      className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs font-bold flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Publish Property</span>
                    </button>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs font-semibold text-slate-500">Status:</span>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className="glass-input px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-colors"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Visit Scheduled">Visit Scheduled</option>
                      <option value="Converted">Converted</option>
                      <option value="Not Interested">Not Interested</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {filteredLeads.length === 0 && (
              <div className="text-center py-10 glass-card rounded-2xl p-4 text-xs text-slate-400">
                No inquiries matched this filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LOCATIONS MANAGER WITH FULL EDIT & ADD CONTROLS */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                Commercial Sectors & Nodes
              </h2>
              <p className="text-xs text-slate-500">
                Manage commercial sectors, hero images, descriptions, and categories
              </p>
            </div>
            <button
              onClick={handleOpenAddLocation}
              className="btn-glass-primary w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Commercial Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {locations.map((loc) => (
              <div key={loc.id} className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 flex flex-col justify-between shadow-md group">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={loc.hero_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditLocation(loc)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-brand-600 dark:text-brand-400 shadow-md backdrop-blur-md hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white transition-all text-xs font-semibold flex items-center gap-1 group/btn cursor-pointer"
                      title="Update Sector Image & Info"
                    >
                      <Edit3 className="w-3.5 h-3.5 transition-transform group-hover/btn:rotate-12" />
                      <span className="hidden sm:inline">Update</span>
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-rose-500 shadow-md backdrop-blur-md hover:scale-105 transition-all"
                      title="Delete Sector"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-base text-white font-['Outfit'] drop-shadow-sm">{loc.name}</h3>
                    <div className="text-xs text-slate-300">{loc.city}, {loc.region}</div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <p className="overview-card-text text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {loc.description}
                  </p>

                  <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100 dark:border-slate-800 font-semibold text-emerald-500">
                    <span>{loc.building_count} Commercial Buildings</span>
                    <span>•</span>
                    <span>{loc.property_count} Properties</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 gap-2">
                    <button
                      onClick={() => handleOpenEditLocation(loc)}
                      className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-md shadow-brand-500/20 active:scale-95 flex items-center gap-1.5 transition-all group cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
                      <span>Update Sector Profile</span>
                    </button>

                    <Link to={`/locations/${loc.slug}`} className="text-xs text-slate-500 hover:text-brand-500 font-semibold flex items-center gap-1 shrink-0 py-1">
                      View Page <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: IMAGE UPLOADER & MEDIA LIBRARY */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          {/* Top Info & Upload Action Card */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 shadow-md space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Media Center & Asset Manager
                </span>
                <h2 className="text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-0.5">
                  Commercial Image Uploader
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload local property photos, building elevations, and access owner-submitted unit pictures.
                </p>
              </div>

              {/* Upload Mode Selector */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setMediaUploadMode('device')}
                  className={`flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mediaUploadMode === 'device'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Files</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaUploadMode('url')}
                  className={`flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    mediaUploadMode === 'url'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Direct URL Link</span>
                </button>
              </div>
            </div>

            {/* Upload Area */}
            {mediaUploadMode === 'device' ? (
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/40 dark:bg-slate-900/40 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 group">
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleMediaFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-500/10 group-hover:scale-110 text-brand-600 dark:text-brand-400 flex items-center justify-center transition-transform mb-2">
                  <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                  Click to select photos or drag & drop files here
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 text-center">
                  Supports multiple JPG, PNG, WebP files. Uploaded photos are stored instantly in your media library.
                </p>
              </label>
            ) : (
              <form onSubmit={handleAddMediaUrl} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Image Title / Reference (optional)"
                  value={mediaUploadTitle}
                  onChange={(e) => setMediaUploadTitle(e.target.value)}
                  className="glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
                <input
                  type="url"
                  required
                  placeholder="Paste direct image URL (https://...)"
                  value={mediaUploadUrl}
                  onChange={(e) => setMediaUploadUrl(e.target.value)}
                  className="glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-md shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-1.5 transition-all group cursor-pointer"
                >
                  <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                  <span>Save Image to Library</span>
                </button>
              </form>
            )}

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Filter:</span>
              <button
                type="button"
                onClick={() => setMediaFilter('all')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mediaFilter === 'all'
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({allMediaItems.length})
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter('admin')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mediaFilter === 'admin'
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Admin ({customMedia.length})
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter('landlord')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mediaFilter === 'landlord'
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Landlord Submissions ({landlordUploads.length})
              </button>
            </div>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredMediaItems.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 shadow-sm group flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 max-w-[70%]">
                    <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-sm border border-white/10 truncate block">
                      {item.source}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-brand-600 transition-colors shadow backdrop-blur-sm"
                      title="Copy Image URL to Clipboard"
                    >
                      {copiedMediaId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3.5 space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.created_at}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentProperty(prev => ({ ...prev, primary_image: item.url }));
                        setShowPropertyModal(true);
                      }}
                      className="flex-1 py-1.5 sm:py-1 px-2 rounded-lg text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors text-center"
                    >
                      In Property
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentBuilding(prev => ({ ...prev, hero_image: item.url }));
                        setShowBuildingModal(true);
                      }}
                      className="flex-1 py-1.5 sm:py-1 px-2 rounded-lg text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors text-center"
                    >
                      In Building
                    </button>
                    {item.id.startsWith('media-') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors self-center sm:self-auto"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMediaItems.length === 0 && (
            <div className="text-center py-12 glass-card rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No media files found
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload images above or review landlord submissions.
              </p>
            </div>
          )}
        </div>
      )}

      {/* PROPERTY ADD / EDIT MODAL */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex min-h-full items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl my-auto max-h-[96vh] sm:max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setShowPropertyModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 sm:bg-transparent z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-3 sm:mb-4 shrink-0 pr-8">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {isEditingProperty ? 'Edit Property Listing' : 'New Commercial Listing'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit']">
                {isEditingProperty ? `Edit: ${currentProperty.reference_number}` : 'Add Commercial Property'}
              </h2>
            </div>
            
            <form onSubmit={handleSaveProperty} className="space-y-4 overflow-y-auto pr-1 flex-1 -mr-1">
              {/* Title & Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Property Title *</label>
                  <input
                    type="text"
                    required
                    value={currentProperty.title}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, title: e.target.value })}
                    placeholder="e.g. 1,150 sq.ft Furnished Corporate Office in I-Thum"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Ref ID</label>
                  <input
                    type="text"
                    value={currentProperty.reference_number || ''}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, reference_number: e.target.value })}
                    placeholder="e.g. SE-6201"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              {/* IMAGE URL & LIVE PREVIEW & UPLOAD */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold">Primary Property Image URL *</label>
                  <label className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePropertyImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={currentProperty.primary_image}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, primary_image: e.target.value })}
                    placeholder="Paste image link or click 'Upload from Device' above"
                    className="glass-input flex-1 px-3 py-2 rounded-xl text-sm"
                  />
                  {currentProperty.primary_image && (
                    <div className="w-12 h-9 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                      <img src={currentProperty.primary_image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* PROPERTY GALLERY (REST OF IMAGES - EDITABLE) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Property Photo Gallery (Rest of Images - {currentProperty.gallery?.length || 0})
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Edit, upload, replace, or reorder all gallery thumbnails displayed on the property page.
                    </p>
                  </div>

                  {/* Multi-file upload button */}
                  <label className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow cursor-pointer flex items-center gap-1.5 transition-all">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Photos from Device</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePropertyGalleryMultiUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Add via URL input bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPropertyGalleryUrl}
                    onChange={(e) => setNewPropertyGalleryUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPropertyGalleryUrl(); } }}
                    placeholder="Paste image URL here and click 'Add Photo'..."
                    className="glass-input flex-1 px-3 py-1.5 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddPropertyGalleryUrl}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {/* Gallery List Cards */}
                {(!currentProperty.gallery || currentProperty.gallery.length === 0) ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                    No extra gallery photos yet. Click "Upload Photos from Device" or paste a URL above to add images.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {currentProperty.gallery.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 shadow-sm"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-900">
                          <img
                            src={imgUrl}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 text-[9px] font-mono font-bold bg-black/70 text-white rounded">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Editable URL input */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={imgUrl}
                            onChange={(e) => handleUpdatePropertyGalleryUrl(idx, e.target.value)}
                            placeholder="Image URL"
                            className="glass-input w-full px-2.5 py-1.5 rounded-lg text-xs font-mono"
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Replace button with file input */}
                          <label
                            title="Replace image from device"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-600 cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePropertyGalleryReplace(idx, e)}
                              className="hidden"
                            />
                          </label>

                          {/* Swap with Primary Cover Image */}
                          <button
                            type="button"
                            title="Update Primary Cover (swaps with current cover image)"
                            onClick={() => handleSetPropertyPrimary(idx)}
                            className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-600 dark:bg-brand-950/60 dark:hover:bg-brand-600 text-brand-700 dark:text-brand-300 hover:text-white border border-brand-200/90 dark:border-brand-800/80 transition-all flex items-center gap-1 text-[11px] font-semibold active:scale-95 group/cover cursor-pointer"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 transition-transform group-hover/cover:rotate-180 duration-300" />
                            <span>Update Cover</span>
                          </button>

                          {/* Delete from gallery */}
                          <button
                            type="button"
                            title="Remove this photo"
                            onClick={() => handleDeletePropertyGalleryItem(idx)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TARIFF / PRICING (USER REQUEST) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/50">
                <div>
                  <label className="block text-xs font-bold text-brand-700 dark:text-brand-300 mb-1">
                    Tariff Display Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentProperty.price_display}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, price_display: e.target.value })}
                    placeholder="e.g. ₹65,000/month or ₹1.85 Cr"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Numeric Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={currentProperty.price}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, price: Number(e.target.value) })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Rate / Tariff per sq.ft</label>
                  <input
                    type="text"
                    value={currentProperty.rate_per_sqft || ''}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, rate_per_sqft: e.target.value })}
                    placeholder="e.g. ₹56.5/sq.ft"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* CATEGORY & PROPERTY TYPE (ALL 6 ASSET CLASSES) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-brand-500" />
                    <span>Commercial Category & Asset Class *</span>
                  </span>
                  {currentProperty.category && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${CATEGORY_CONFIG[currentProperty.category as PropertyCategory]?.badgeClass}`}>
                      {CATEGORY_CONFIG[currentProperty.category as PropertyCategory]?.label}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Select Asset Class *</label>
                    <select
                      value={currentProperty.category}
                      onChange={(e) => {
                        const newCat = e.target.value as PropertyCategory;
                        const config = CATEGORY_CONFIG[newCat] || CATEGORY_CONFIG['office-space'];
                        setCurrentProperty({ 
                          ...currentProperty, 
                          category: newCat,
                          property_type: config.defaultType,
                          power_load: currentProperty.power_load || config.defaultPower,
                          road_width: currentProperty.road_width || config.defaultRoad,
                          listing_type: newCat === 'land' ? 'Sale' : (currentProperty.listing_type || 'Rent'),
                          area_unit: newCat === 'land' ? 'sq.meter' : (currentProperty.area_unit || 'sq.ft'),
                          features: currentProperty.features && currentProperty.features.length > 0 
                            ? currentProperty.features 
                            : [...config.suggestedFeatures.slice(0, 4)],
                        });
                      }}
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold"
                    >
                      <option value="it-business-parks">IT & Business Parks</option>
                      <option value="warehouses">Warehouses & Logistics</option>
                      <option value="factory-industrial">Factories & Industrial</option>
                      <option value="land">Commercial Land & Industrial Plots</option>
                      <option value="shops-retail">Shops & Retail Showrooms</option>
                      <option value="office-space">Commercial Office Space</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Property Type ({CATEGORY_CONFIG[(currentProperty.category || 'office-space') as PropertyCategory]?.label}) *
                    </label>
                    <select
                      value={currentProperty.property_type || ''}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCurrentProperty({ ...currentProperty, property_type: '' });
                          setCustomPropertyTypeInput('custom');
                        } else {
                          setCurrentProperty({ ...currentProperty, property_type: e.target.value });
                        }
                      }}
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold"
                    >
                      {(CATEGORY_CONFIG[(currentProperty.category || 'office-space') as PropertyCategory]?.types || []).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="__custom__">✍️ Custom Property Type...</option>
                    </select>
                  </div>
                </div>

                {/* Custom Property Type Input if selected */}
                {(!CATEGORY_CONFIG[(currentProperty.category || 'office-space') as PropertyCategory]?.types.includes(currentProperty.property_type || '') || customPropertyTypeInput !== '') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Custom Property Type Description
                    </label>
                    <input
                      type="text"
                      value={currentProperty.property_type || ''}
                      onChange={(e) => {
                        setCurrentProperty({ ...currentProperty, property_type: e.target.value });
                        setCustomPropertyTypeInput(e.target.value);
                      }}
                      placeholder="e.g. Temperature Controlled Cold Storage or High-Street Anchor Store"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>
                )}
              </div>

              {/* LISTING TYPE & STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Listing Commercial Model *</label>
                  <select
                    value={currentProperty.listing_type}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, listing_type: e.target.value as any })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  >
                    <option value="Rent">Rent (Monthly / Lease)</option>
                    <option value="Lease">Long-term Leasehold</option>
                    <option value="Sale">Direct Sale / Freehold Outright</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Live Inventory Status *</label>
                  <select
                    value={currentProperty.status}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, status: e.target.value as any })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold"
                  >
                    <option value="Available">Available</option>
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="Under Negotiation">Under Negotiation</option>
                    <option value="Rented">Rented</option>
                    <option value="Leased">Leased</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>

              {/* LOCATION, BUILDING & ADDRESS */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  <span>Location, Sector & Building Association</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Sector / Locality *</label>
                    <select
                      value={currentProperty.location_id}
                      onChange={(e) => {
                        const loc = locations.find(l => l.id === e.target.value);
                        setCurrentProperty({ 
                          ...currentProperty, 
                          location_id: e.target.value,
                          location_name: loc ? loc.name : currentProperty.location_name
                        });
                      }}
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    >
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Building Association</label>
                    <select
                      value={currentProperty.building_id || ''}
                      onChange={(e) => {
                        const bld = buildings.find(b => b.id === e.target.value);
                        setCurrentProperty({ 
                          ...currentProperty, 
                          building_id: e.target.value || undefined,
                          building_name: bld ? bld.name : undefined
                        });
                      }}
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    >
                      <option value="">Independent / Standalone Plot / Premises</option>
                      {buildings.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.location_name})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">Full Specific Address / Plot No.</label>
                    <input
                      type="text"
                      value={currentProperty.address || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, address: e.target.value })}
                      placeholder="e.g. Plot 18, Block B, Sector 83, Noida"
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">City</label>
                    <input
                      type="text"
                      value={currentProperty.city || 'Noida'}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, city: e.target.value })}
                      placeholder="Noida"
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* AREA MEASUREMENTS & LAND SPECIFICATIONS */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-500" />
                    <span>Area & Dimensions</span>
                  </span>
                  {(currentProperty.category === 'land' || currentProperty.category === 'warehouses' || currentProperty.category === 'factory-industrial') && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Plot Area Supported
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Built-Up Area *</label>
                    <input
                      type="number"
                      required
                      value={currentProperty.built_up_area || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, built_up_area: Number(e.target.value) })}
                      placeholder="e.g. 4500"
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Carpet Area</label>
                    <input
                      type="number"
                      value={currentProperty.carpet_area || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, carpet_area: Number(e.target.value) || undefined })}
                      placeholder="e.g. 3600"
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Plot / Land Area {currentProperty.category === 'land' ? '*' : ''}
                    </label>
                    <input
                      type="number"
                      value={currentProperty.land_area || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, land_area: Number(e.target.value) || undefined })}
                      placeholder="e.g. 1000"
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold border-brand-300 dark:border-brand-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Area Unit</label>
                    <select
                      value={currentProperty.area_unit || 'sq.ft'}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, area_unit: e.target.value as any })}
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    >
                      <option value="sq.ft">sq.ft</option>
                      <option value="sq.meter">sq.meter</option>
                      <option value="acres">acres</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* INFRASTRUCTURE, POWER, ROAD & FLOORS */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Technical & Industrial Infrastructure Details</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Power Load / DG Backup</label>
                    <input
                      type="text"
                      value={currentProperty.power_load || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, power_load: e.target.value })}
                      placeholder="e.g. 150 KVA Sanctioned Industrial Load or 100% DG Backup"
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Approach Road Width / Frontage</label>
                    <input
                      type="text"
                      value={currentProperty.road_width || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, road_width: e.target.value })}
                      placeholder="e.g. 60 Feet Wide Arterial Road (40ft Trailer access)"
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Floor Level</label>
                    <input
                      type="text"
                      value={currentProperty.floor || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, floor: e.target.value })}
                      placeholder="e.g. Ground Floor, 4th Floor"
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Total Floors</label>
                    <input
                      type="number"
                      value={currentProperty.total_floors || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, total_floors: Number(e.target.value) || undefined })}
                      placeholder="e.g. 1 or 12"
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Furnishing / Shell</label>
                    <select
                      value={currentProperty.furnishing}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, furnishing: e.target.value as any })}
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    >
                      <option value="Furnished">Furnished</option>
                      <option value="Plug-and-Play">Plug-and-Play</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Bare Shell">Bare Shell</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Possession Timeline</label>
                    <input
                      type="text"
                      value={currentProperty.possession || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, possession: e.target.value })}
                      placeholder="e.g. Immediate or Ready to Move"
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Parking, Truck Loading Bays & Open Yard</label>
                  <input
                    type="text"
                    value={currentProperty.parking || ''}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, parking: e.target.value })}
                    placeholder="e.g. Internal trailer maneuvering & 4 loading bays, or 2 Covered Bays"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* FEATURES & KEY HIGHLIGHTS (CUSTOM TAGS & CATEGORY SUGGESTIONS) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-brand-500" />
                    <span>Key Features & Specifications ({currentProperty.features?.length || 0})</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click suggested pills to add
                  </span>
                </div>

                {/* Suggested quick chips */}
                {CATEGORY_CONFIG[(currentProperty.category || 'office-space') as PropertyCategory]?.suggestedFeatures && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {CATEGORY_CONFIG[(currentProperty.category || 'office-space') as PropertyCategory].suggestedFeatures.map((sug) => {
                      const isAdded = (currentProperty.features || []).includes(sug);
                      return (
                        <button
                          key={sug}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddFeatureTag(sug)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                            isAdded
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
                              : 'bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 text-slate-700 dark:text-slate-200 hover:text-brand-600 border border-slate-200 dark:border-slate-700 active:scale-95 cursor-pointer'
                          }`}
                        >
                          <Plus className="w-3 h-3 text-brand-500" />
                          <span>{sug}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Current Active Tags */}
                {currentProperty.features && currentProperty.features.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    {currentProperty.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/80"
                      >
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeatureTag(idx)}
                          className="hover:text-red-500 rounded-full p-0.5 cursor-pointer"
                          title="Remove feature"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Custom Feature Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeatureTag}
                    onChange={(e) => setNewFeatureTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeatureTag();
                      }
                    }}
                    placeholder="Type custom feature and click Add (e.g. 5-Ton Overhead Crane, Direct Metro Access)..."
                    className="glass-input flex-1 px-3 py-1.5 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFeatureTag()}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-brand-600 hover:text-white text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tag</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold mb-1">Description & Commercial Overview</label>
                <textarea
                  rows={5}
                  value={currentProperty.description || ''}
                  onChange={(e) => setCurrentProperty({ ...currentProperty, description: e.target.value })}
                  onPaste={(e) => handleOverviewPaste(e, (val) => setCurrentProperty({ ...currentProperty, description: val }), currentProperty.description)}
                  placeholder="Describe location advantages, industrial NOCs, ceiling clearances, immediate availability, or retail footfall..."
                  className="glass-input overview-input w-full px-3 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPropertyModal(false)}
                  className="px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-600 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-brand-500/25 active:scale-95 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Syncing to Supabase...</span>
                    </>
                  ) : isEditingProperty ? (
                    <>
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      <span>Update Property & Live Data</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Publish Listing</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUILDING ADD / EDIT MODAL */}
      {showBuildingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex min-h-full items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl my-auto max-h-[96vh] sm:max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setShowBuildingModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 sm:bg-transparent z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-3 sm:mb-4 shrink-0 pr-8">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {isEditingBuilding ? 'Edit Commercial Building' : 'New Commercial Building'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit']">
                {isEditingBuilding ? `Edit: ${currentBuilding.name}` : 'Add Commercial Building'}
              </h2>
            </div>

            <form onSubmit={handleSaveBuilding} className="space-y-4 overflow-y-auto pr-1 flex-1 -mr-1">
              {/* Building Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Building Name *</label>
                  <input
                    type="text"
                    required
                    value={currentBuilding.name}
                    onChange={(e) => setCurrentBuilding({ ...currentBuilding, name: e.target.value })}
                    placeholder="e.g. I-Thum Tower, Noida One"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold">Primary Location / Sector *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickLocationName('');
                        setQuickLocationCity('Noida');
                        setShowQuickLocationModal(true);
                      }}
                      className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add Location</span>
                    </button>
                  </div>
                  <select
                    value={currentBuilding.location_id}
                    onChange={(e) => {
                      const loc = locations.find(l => l.id === e.target.value);
                      const currentLocs = currentBuilding.locations || [];
                      const updatedLocs = currentLocs.includes(e.target.value) ? currentLocs : [e.target.value, ...currentLocs];
                      const currentNames = currentBuilding.location_names || [];
                      const updatedNames = loc && !currentNames.includes(loc.name) ? [loc.name, ...currentNames] : currentNames;
                      setCurrentBuilding({ 
                        ...currentBuilding, 
                        location_id: e.target.value,
                        location_name: loc ? loc.name : currentBuilding.location_name,
                        locations: updatedLocs,
                        location_names: updatedNames
                      });
                    }}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Location / Linked Serving Sectors */}
              <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    <span>Associate Locations / Sectors (Multi-Location Option)</span>
                  </label>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {(currentBuilding.locations?.length || 1)} selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select all sectors or micromarkets this building serves or spans.
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {locations.map(loc => {
                    const isSelected = (currentBuilding.locations || [currentBuilding.location_id]).includes(loc.id);
                    const isPrimary = currentBuilding.location_id === loc.id;
                    return (
                      <button
                        type="button"
                        key={loc.id}
                        onClick={() => {
                          const existing = currentBuilding.locations || [currentBuilding.location_id || ''];
                          let updated: string[];
                          if (isSelected) {
                            if (isPrimary && existing.length > 1) {
                              const nextPrimary = existing.find(id => id !== loc.id)!;
                              const nextLoc = locations.find(l => l.id === nextPrimary);
                              updated = existing.filter(id => id !== loc.id);
                              setCurrentBuilding({
                                ...currentBuilding,
                                locations: updated,
                                location_id: nextPrimary,
                                location_name: nextLoc ? nextLoc.name : currentBuilding.location_name
                              });
                              return;
                            } else if (existing.length <= 1) {
                              return; // Keep at least one
                            } else {
                              updated = existing.filter(id => id !== loc.id);
                            }
                          } else {
                            updated = [...existing, loc.id];
                          }
                          const updatedNames = updated.map(id => locations.find(l => l.id === id)?.name).filter(Boolean) as string[];
                          setCurrentBuilding({ 
                            ...currentBuilding, 
                            locations: updated,
                            location_names: updatedNames
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? isPrimary
                              ? 'bg-brand-600 text-white border-brand-600 shadow-sm font-semibold'
                              : 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border-brand-300 dark:border-brand-700 font-medium'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                        }`}
                      >
                        <span>{loc.name}</span>
                        {isPrimary && (
                          <span className="text-[9px] uppercase px-1 py-0.2 bg-white/20 rounded font-bold">
                            Primary
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BUILDING HERO IMAGE & UPLOAD */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold">Building Hero Image URL *</label>
                  <label className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBuildingImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={currentBuilding.hero_image}
                    onChange={(e) => setCurrentBuilding({ ...currentBuilding, hero_image: e.target.value })}
                    placeholder="Paste image URL or click 'Upload from Device' above"
                    className="glass-input flex-1 px-3 py-2 rounded-xl text-sm"
                  />
                  {currentBuilding.hero_image && (
                    <div className="w-12 h-9 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                      <img src={currentBuilding.hero_image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* BUILDING GALLERY (REST OF IMAGES - EDITABLE) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Building Photo Gallery (Rest of Images - {currentBuilding.gallery?.length || 0})
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Edit, upload, replace, or reorder all gallery thumbnails displayed on the building page.
                    </p>
                  </div>

                  {/* Multi-file upload button */}
                  <label className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow cursor-pointer flex items-center gap-1.5 transition-all">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Photos from Device</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleBuildingGalleryMultiUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Add via URL input bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newBuildingGalleryUrl}
                    onChange={(e) => setNewBuildingGalleryUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBuildingGalleryUrl(); } }}
                    placeholder="Paste image URL here and click 'Add Photo'..."
                    className="glass-input flex-1 px-3 py-1.5 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddBuildingGalleryUrl}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {/* Gallery List Cards */}
                {(!currentBuilding.gallery || currentBuilding.gallery.length === 0) ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                    No extra gallery photos yet. Click "Upload Photos from Device" or paste a URL above to add images.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {currentBuilding.gallery.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 shadow-sm"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-900">
                          <img
                            src={imgUrl}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 text-[9px] font-mono font-bold bg-black/70 text-white rounded">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Editable URL input */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={imgUrl}
                            onChange={(e) => handleUpdateBuildingGalleryUrl(idx, e.target.value)}
                            placeholder="Image URL"
                            className="glass-input w-full px-2.5 py-1.5 rounded-lg text-xs font-mono"
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Replace button with file input */}
                          <label
                            title="Replace image from device"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-600 cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleBuildingGalleryReplace(idx, e)}
                              className="hidden"
                            />
                          </label>

                          {/* Swap with Hero Cover Image */}
                          <button
                            type="button"
                            title="Update Hero Photo (swaps with current building hero)"
                            onClick={() => handleSetBuildingHero(idx)}
                            className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-600 dark:bg-brand-950/60 dark:hover:bg-brand-600 text-brand-700 dark:text-brand-300 hover:text-white border border-brand-200/90 dark:border-brand-800/80 transition-all flex items-center gap-1 text-[11px] font-semibold active:scale-95 group/cover cursor-pointer"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 transition-transform group-hover/cover:rotate-180 duration-300" />
                            <span>Update Hero</span>
                          </button>

                          {/* Delete from gallery */}
                          <button
                            type="button"
                            title="Remove this photo"
                            onClick={() => handleDeleteBuildingGalleryItem(idx)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TARIFF / RENT RANGE & SALE RANGE (USER REQUEST) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/50">
                <div>
                  <label className="block text-xs font-bold text-brand-700 dark:text-brand-300 mb-1">
                    Building Tariff / Rent Range *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentBuilding.rent_range}
                    onChange={(e) => setCurrentBuilding({ ...currentBuilding, rent_range: e.target.value })}
                    placeholder="e.g. ₹55 – ₹70/sq.ft"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Sale Price Range (Optional)</label>
                  <input
                    type="text"
                    value={currentBuilding.sale_range || ''}
                    onChange={(e) => setCurrentBuilding({ ...currentBuilding, sale_range: e.target.value })}
                    placeholder="e.g. ₹8,000 – ₹11,000/sq.ft"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* 1. TOTAL FLOORS (STRUCTURE) - MULTI BASEMENT & GROUND OPTION */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-brand-500" />
                      <span>Total Floors & Building Structure</span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Configure multi-basement levels, ground level type, and superstructure floors.
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold">
                    Structure: {currentBuilding.structure_display || getComputedStructureDisplay(currentBuilding.basement_floors, currentBuilding.ground_option, currentBuilding.total_floors || 14)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Multi Basement Selector */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Multi Basement Level
                    </label>
                    <select
                      value={currentBuilding.basement_floors || '2 Basements (2B)'}
                      onChange={(e) => {
                        const newBasement = e.target.value;
                        const newDisplay = getComputedStructureDisplay(newBasement, currentBuilding.ground_option, currentBuilding.total_floors || 14);
                        setCurrentBuilding({
                          ...currentBuilding,
                          basement_floors: newBasement,
                          structure_display: newDisplay
                        });
                      }}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium"
                    >
                      <option value="No Basement">No Basement (Ground direct)</option>
                      <option value="1 Basement (B1)">1 Basement (B1 - Single Basement)</option>
                      <option value="2 Basements (2B)">2 Basements (2B - B1 + B2)</option>
                      <option value="3 Basements (3B)">3 Basements (3B - B1 + B2 + B3)</option>
                      <option value="4 Basements (4B)">4 Basements (4B - B1 to B4)</option>
                      <option value="5 Basements (5B)">5 Basements (5B - Mega Parking)</option>
                      <option value="Multi-Level Basement">Custom Multi-Level Basement</option>
                    </select>
                  </div>

                  {/* Ground Level Option */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Ground Level Option
                    </label>
                    <select
                      value={currentBuilding.ground_option || 'Ground (G)'}
                      onChange={(e) => {
                        const newGround = e.target.value;
                        const newDisplay = getComputedStructureDisplay(currentBuilding.basement_floors, newGround, currentBuilding.total_floors || 14);
                        setCurrentBuilding({
                          ...currentBuilding,
                          ground_option: newGround,
                          structure_display: newDisplay
                        });
                      }}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium"
                    >
                      <option value="Ground (G)">Standard Ground (G)</option>
                      <option value="Ground + Mezzanine (G + M)">Ground + Mezzanine (G + M)</option>
                      <option value="Lower Ground + Upper Ground (LG + UG)">Lower Ground + Upper Ground (LG + UG)</option>
                      <option value="Stilt + Ground (S + G)">Stilt + Ground (S + G)</option>
                      <option value="Stilt Only (S)">Stilt Parking Only (S)</option>
                      <option value="Ground Only">Ground Floor Only (Single Level)</option>
                    </select>
                  </div>

                  {/* Superstructure Floors */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Superstructure Floors *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={currentBuilding.total_floors || 14}
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        const newDisplay = getComputedStructureDisplay(currentBuilding.basement_floors, currentBuilding.ground_option, num);
                        setCurrentBuilding({
                          ...currentBuilding,
                          total_floors: num,
                          structure_display: newDisplay
                        });
                      }}
                      placeholder="e.g. 14"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Editable Final Structure Display String */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Display Structure Spec (Customizable / Auto-generated)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const regenerated = getComputedStructureDisplay(currentBuilding.basement_floors, currentBuilding.ground_option, currentBuilding.total_floors || 14);
                        setCurrentBuilding({ ...currentBuilding, structure_display: regenerated });
                      }}
                      className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Reset to Auto-format</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={currentBuilding.structure_display || ''}
                    onChange={(e) => setCurrentBuilding({ ...currentBuilding, structure_display: e.target.value })}
                    placeholder="e.g. 2B + G + 14 Floors"
                    className="glass-input w-full px-3 py-1.5 rounded-xl text-xs font-mono font-medium"
                  />
                </div>
              </div>

              {/* 2. MULTI TOWERS & BLOCKS */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-brand-500" />
                      <span>Towers & Blocks (Multi-Tower Option)</span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Specify standalone tower or multiple towers/blocks (e.g. Twin Towers, Tower A/B/C, IT Blocks).
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Tower presets */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentBuilding({
                          ...currentBuilding,
                          towers: ['Tower 1'],
                          total_towers: 1,
                          tower_details: 'Single Tower'
                        });
                      }}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-600 dark:text-slate-300"
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentBuilding({
                          ...currentBuilding,
                          towers: ['Tower A', 'Tower B'],
                          total_towers: 2,
                          tower_details: 'Twin Towers (Tower A & Tower B)'
                        });
                      }}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-600 dark:text-slate-300"
                    >
                      Twin Towers (2)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentBuilding({
                          ...currentBuilding,
                          towers: ['Tower A', 'Tower B', 'Tower C'],
                          total_towers: 3,
                          tower_details: '3 Towers (Tower A, B & C)'
                        });
                      }}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-600 dark:text-slate-300"
                    >
                      3 Towers
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentBuilding({
                          ...currentBuilding,
                          towers: ['Block 1', 'Block 2'],
                          total_towers: 2,
                          tower_details: 'Campus Blocks (Block 1 & 2)'
                        });
                      }}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-600 dark:text-slate-300"
                    >
                      Blocks 1 & 2
                    </button>
                  </div>
                </div>

                {/* Active Tower Tags */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                  {(!currentBuilding.towers || currentBuilding.towers.length === 0) ? (
                    <span className="text-xs text-slate-400 italic">No specific towers defined (Single Standalone Building).</span>
                  ) : (
                    currentBuilding.towers.map((tower, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                      >
                        <Building2 className="w-3 h-3 text-brand-500" />
                        <span>{tower}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (currentBuilding.towers || []).filter((_, i) => i !== idx);
                            const count = updated.length;
                            const details = count > 1 ? `${count} Towers (${updated.join(', ')})` : (updated[0] || 'Single Tower');
                            setCurrentBuilding({
                              ...currentBuilding,
                              towers: updated,
                              total_towers: count,
                              tower_details: details
                            });
                          }}
                          className="hover:text-red-500 ml-0.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Custom Tower Input Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTowerInput}
                      onChange={(e) => setNewTowerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmed = newTowerInput.trim();
                          if (trimmed && !(currentBuilding.towers || []).includes(trimmed)) {
                            const updated = [...(currentBuilding.towers || []), trimmed];
                            const count = updated.length;
                            const details = count > 1 ? `${count} Towers (${updated.join(', ')})` : (updated[0] || 'Single Tower');
                            setCurrentBuilding({
                              ...currentBuilding,
                              towers: updated,
                              total_towers: count,
                              tower_details: details
                            });
                            setNewTowerInput('');
                          }
                        }
                      }}
                      placeholder="Type tower name (e.g. Tower C, Block 3)..."
                      className="glass-input flex-1 px-3 py-1.5 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newTowerInput.trim();
                        if (trimmed && !(currentBuilding.towers || []).includes(trimmed)) {
                          const updated = [...(currentBuilding.towers || []), trimmed];
                          const count = updated.length;
                          const details = count > 1 ? `${count} Towers (${updated.join(', ')})` : (updated[0] || 'Single Tower');
                          setCurrentBuilding({
                            ...currentBuilding,
                            towers: updated,
                            total_towers: count,
                            tower_details: details
                          });
                          setNewTowerInput('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tower</span>
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={currentBuilding.tower_details || ''}
                      onChange={(e) => setCurrentBuilding({ ...currentBuilding, tower_details: e.target.value })}
                      placeholder="Summary: e.g. Twin Towers (Tower A & Tower B)"
                      className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. MULTI PRIMARY CATEGORY OPTION & AVAILABLE SIZES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Available Sizes Range (1 Col) */}
                <div>
                  <label className="block text-xs font-semibold mb-1">Available Sizes Range</label>
                  <input
                    type="text"
                    value={currentBuilding.size_range}
                    onChange={(e) => setCurrentBuilding({ ...currentBuilding, size_range: e.target.value })}
                    placeholder="e.g. 750 sq.ft – 25,000 sq.ft"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Min & max floor plates available.
                  </p>
                </div>

                {/* Multi Primary Category Option (2 Cols) */}
                <div className="md:col-span-2 p-3.5 rounded-2xl bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brand-800 dark:text-brand-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Commercial Categories (Multi-Category Option) *</span>
                    </label>
                    <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                      {(currentBuilding.categories?.length || 1)} selected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Click to toggle all applicable categories for this commercial building. First is Primary.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: 'office-space' as PropertyCategory, label: 'Office Space', icon: Building2 },
                      { id: 'it-business-parks' as PropertyCategory, label: 'IT & Business Parks', icon: Cpu },
                      { id: 'warehouses' as PropertyCategory, label: 'Warehouses & Logistics', icon: Warehouse },
                      { id: 'factory-industrial' as PropertyCategory, label: 'Factories & Industrial', icon: Factory },
                      { id: 'land' as PropertyCategory, label: 'Land & Plots', icon: Trees },
                      { id: 'shops-retail' as PropertyCategory, label: 'Shops, Malls & Retail', icon: Store },
                    ].map((catItem) => {
                      const isSelected = (currentBuilding.categories || [currentBuilding.category || 'office-space']).includes(catItem.id);
                      const isPrimary = (currentBuilding.categories && currentBuilding.categories[0] === catItem.id) || currentBuilding.category === catItem.id;
                      const Icon = catItem.icon;

                      return (
                        <button
                          type="button"
                          key={catItem.id}
                          onClick={() => {
                            const existing = currentBuilding.categories || [currentBuilding.category || 'office-space'];
                            let updated: PropertyCategory[];
                            if (isSelected) {
                              if (isPrimary && existing.length > 1) {
                                updated = existing.filter(c => c !== catItem.id);
                              } else if (existing.length <= 1) {
                                return; // Keep at least 1 category
                              } else {
                                updated = existing.filter(c => c !== catItem.id);
                              }
                            } else {
                              updated = [...existing, catItem.id];
                            }
                            setCurrentBuilding({
                              ...currentBuilding,
                              categories: updated,
                              category: updated[0] || 'office-space'
                            });
                          }}
                          className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? isPrimary
                                ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-400/40'
                                : 'bg-brand-50/90 text-brand-800 dark:bg-brand-950/80 dark:text-brand-200 border-brand-300 dark:border-brand-700 font-semibold'
                              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? (isPrimary ? 'text-white' : 'text-brand-600 dark:text-brand-400') : 'text-slate-400'}`} />
                            {isPrimary && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-white text-brand-700 dark:bg-white dark:text-brand-800">
                                Primary
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                            {catItem.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Power Backup & Lifts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Power Backup Infrastructure</label>
                  <input
                    type="text"
                    value={currentBuilding.power_backup}
                    onChange={(e) => setCurrentBuilding({ ...currentBuilding, power_backup: e.target.value })}
                    placeholder="e.g. 100% DG backup"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Lifts / Elevators</label>
                  <input
                    type="text"
                    value={currentBuilding.lifts}
                    onChange={(e) => setCurrentBuilding({ ...currentBuilding, lifts: e.target.value })}
                    placeholder="e.g. 12 high-speed passenger lifts"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold mb-1">Building Overview & Features</label>
                <textarea
                  rows={5}
                  value={currentBuilding.description}
                  onChange={(e) => setCurrentBuilding({ ...currentBuilding, description: e.target.value })}
                  onPaste={(e) => handleOverviewPaste(e, (val) => setCurrentBuilding({ ...currentBuilding, description: val }), currentBuilding.description)}
                  placeholder="Overview of commercial amenities, tenant profile, and accessibility..."
                  className="glass-input overview-input w-full px-3 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBuildingModal(false)}
                  className="px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-600 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-brand-500/25 active:scale-95 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Syncing to Supabase...</span>
                    </>
                  ) : isEditingBuilding ? (
                    <>
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      <span>Update Building Specs & Tariff</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Commercial Building</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD LOCATION SUB-MODAL */}
      {showQuickLocationModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto p-4 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-card rounded-2xl p-5 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" />
                <h3 className="font-bold text-base font-['Outfit']">Add New Sector / Location</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowQuickLocationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveQuickLocation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Sector / Location Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={quickLocationName}
                  onChange={(e) => setQuickLocationName(e.target.value)}
                  placeholder="e.g. Sector 135, Noida Expressway"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={quickLocationCity}
                  onChange={(e) => setQuickLocationCity(e.target.value)}
                  placeholder="e.g. Noida"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickLocationModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create & Select</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION ADD / EDIT MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex min-h-full items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl my-auto max-h-[96vh] sm:max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setShowLocationModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 sm:bg-transparent z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-3 sm:mb-4 shrink-0 pr-8">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {isEditingLocation ? 'Edit Commercial Location' : 'New Commercial Location'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit']">
                {isEditingLocation ? `Edit: ${currentLocation.name}` : 'Add Commercial Sector'}
              </h2>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4 overflow-y-auto pr-1 flex-1 -mr-1">
              {/* Location Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Sector / Location Name *</label>
                  <input
                    type="text"
                    required
                    value={currentLocation.name}
                    onChange={(e) => setCurrentLocation({ ...currentLocation, name: e.target.value })}
                    placeholder="e.g. Sector 62, Noida"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={currentLocation.city}
                    onChange={(e) => setCurrentLocation({ ...currentLocation, city: e.target.value })}
                    placeholder="e.g. Noida"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* LOCATION HERO IMAGE & UPLOAD */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold">Sector Hero Image URL *</label>
                  <label className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLocationImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={currentLocation.hero_image}
                    onChange={(e) => setCurrentLocation({ ...currentLocation, hero_image: e.target.value })}
                    placeholder="Paste image URL or click 'Upload from Device' above"
                    className="glass-input flex-1 px-3 py-2 rounded-xl text-sm"
                  />
                  {currentLocation.hero_image && (
                    <div className="w-12 h-9 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                      <img src={currentLocation.hero_image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Region & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Region / Zone</label>
                  <input
                    type="text"
                    value={currentLocation.region}
                    onChange={(e) => setCurrentLocation({ ...currentLocation, region: e.target.value })}
                    placeholder="e.g. Delhi-NCR"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="loc-featured"
                    checked={currentLocation.featured}
                    onChange={(e) => setCurrentLocation({ ...currentLocation, featured: e.target.checked })}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="loc-featured" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Feature on Homepage Strategic Corridors
                  </label>
                </div>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Commercial Buildings Count</label>
                  <input
                    type="number"
                    value={currentLocation.building_count}
                    onChange={(e) => setCurrentLocation({ ...currentLocation, building_count: Number(e.target.value) })}
                    placeholder="e.g. 4"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Available Properties Count</label>
                  <input
                    type="number"
                    value={currentLocation.property_count}
                    onChange={(e) => setCurrentLocation({ ...currentLocation, property_count: Number(e.target.value) })}
                    placeholder="e.g. 8"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold mb-1">Sector Overview & Commercial Advantages</label>
                <textarea
                  rows={5}
                  value={currentLocation.description}
                  onChange={(e) => setCurrentLocation({ ...currentLocation, description: e.target.value })}
                  onPaste={(e) => handleOverviewPaste(e, (val) => setCurrentLocation({ ...currentLocation, description: val }), currentLocation.description)}
                  placeholder="Overview of institutional corporate hub, metro connectivity, power infrastructure..."
                  className="glass-input overview-input w-full px-3 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-600 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-brand-500/25 active:scale-95 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Syncing to Supabase...</span>
                    </>
                  ) : isEditingLocation ? (
                    <>
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      <span>Update Sector Profile & Metrics</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Commercial Sector</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Photo Viewer Modal */}
      {viewingImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {viewingImageModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingImageModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview Container */}
            <div className="relative flex-1 flex items-center justify-center p-4 bg-slate-950/90 overflow-hidden min-h-[300px]">
              <img
                src={viewingImageModal.url}
                alt={viewingImageModal.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />

              {/* Next/Prev Navigation */}
              {viewingImageModal.allImages && viewingImageModal.allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const list = viewingImageModal.allImages!;
                      const cur = viewingImageModal.activeIndex ?? 0;
                      const prev = (cur - 1 + list.length) % list.length;
                      setViewingImageModal({
                        ...viewingImageModal,
                        url: list[prev],
                        activeIndex: prev,
                        title: `${viewingImageModal.title.split('•')[0]}• Photo ${prev + 1}`
                      });
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-brand-600 text-white transition-all shadow"
                    title="Previous Photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const list = viewingImageModal.allImages!;
                      const cur = viewingImageModal.activeIndex ?? 0;
                      const next = (cur + 1) % list.length;
                      setViewingImageModal({
                        ...viewingImageModal,
                        url: list[next],
                        activeIndex: next,
                        title: `${viewingImageModal.title.split('•')[0]}• Photo ${next + 1}`
                      });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-brand-600 text-white transition-all shadow"
                    title="Next Photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/60 text-xs">
              <span className="text-[11px] text-slate-400">
                {viewingImageModal.allImages && viewingImageModal.allImages.length > 1
                  ? `Photo ${(viewingImageModal.activeIndex ?? 0) + 1} of ${viewingImageModal.allImages.length}`
                  : 'Single Photo'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(viewingImageModal.url, 'modal-view')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentProperty(prev => ({ ...prev, primary_image: viewingImageModal.url }));
                    setViewingImageModal(null);
                    setShowPropertyModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Use in Property</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
