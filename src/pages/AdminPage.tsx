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
  ChevronRight,
  BookOpen,
  Clock,
  Calendar,
  Link2,
  Globe,
  Mail,
  Sparkles,
  ArrowRight,
  FileText,
  AlertCircle,
  Share2
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Property, Building, Location, Lead, LeadStatus, PropertyStatus, PropertyCategory, MarketGuide, HyperlinkConfig } from '../types';
import { handleOverviewPaste, computeStructureDisplay, getBuildingStructureDisplay } from '../utils/textFormat';
import { EditBuildingPropertiesModal } from '../components/modals/EditBuildingPropertiesModal';
import { INTERNAL_PAGE_PRESETS, formatHyperlinkUrl, applyHyperlinksToContent } from '../utils/hyperlinks';
import { DEFAULT_BLOG_PLACEHOLDER_IMAGE, getBlogFeaturedImage, getBlogImageAlt, generateBlogSlug } from '../utils/blogConstants';
import { AdminSeoPreviewSection } from '../components/common/AdminSeoPreviewSection';
import { AdminMediaManager } from '../components/common/AdminMediaManager';
import { compressImageFile } from '../utils/imageCompression';
import { AdminHyperlinksManager } from '../components/common/AdminHyperlinksManager';
import { 
  computeSeoStatus, 
  getTowerImageAlt, 
  getPropertyImageAlt, 
  getTowerCanonicalUrl, 
  getPropertyCanonicalUrl 
} from '../utils/seoHelpers';

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
  const [activeTab, setActiveTab] = useState<'leads' | 'properties' | 'buildings' | 'locations' | 'media' | 'guides'>('properties');

  // Data
  const [properties, setProperties] = useState<Property[]>(() => StorageService.getInitialProperties());
  const [buildings, setBuildings] = useState<Building[]>(() => StorageService.getInitialBuildings());
  const [locations, setLocations] = useState<Location[]>(() => StorageService.getInitialLocations());
  const [leads, setLeads] = useState<Lead[]>(() => StorageService.getInitialLeads());
  const [guides, setGuides] = useState<MarketGuide[]>(() => StorageService.getInitialGuides());

  // Market Guides Admin State
  const [guideSearch, setGuideSearch] = useState('');
  const [guideCategoryFilter, setGuideCategoryFilter] = useState('All');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isEditingGuide, setIsEditingGuide] = useState(false);
  const [guideModalTab, setGuideModalTab] = useState<'edit' | 'preview'>('edit');
  const [guidePreviewSubTab, setGuidePreviewSubTab] = useState<'card' | 'article'>('card');
  const [isUploadingGuideImage, setIsUploadingGuideImage] = useState(false);
  const [showHyperlinkForm, setShowHyperlinkForm] = useState(false);
  const [editingHyperlinkIndex, setEditingHyperlinkIndex] = useState<number | null>(null);
  const [hyperlinkInput, setHyperlinkInput] = useState<HyperlinkConfig>({
    text: '',
    url: '',
    type: 'internal',
    open_in_new_tab: false,
    title: '',
    match_mode: 'first',
    max_occurrences: 1
  });
  const [currentGuide, setCurrentGuide] = useState<Partial<MarketGuide>>({
    title: '',
    slug: '',
    category: 'Office Market',
    date: 'March 2026',
    readTime: '6 min read',
    excerpt: '',
    content: '',
    image: '',
    featured_image_url: '',
    featured_image_alt: '',
    featured_image_caption: '',
    seo_title: '',
    seo_description: '',
    hyperlinks: [],
    published: true,
    featured: false,
    author: 'Shristi Estate Advisory Desk'
  });
  const [loading, setLoading] = useState(false);
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

  // Active Tab inside Property Modal
  const [propertyModalTab, setPropertyModalTab] = useState<'specs' | 'content' | 'images' | 'seo' | 'hyperlinks' | 'preview'>('specs');
  const [showPropertyHyperlinkForm, setShowPropertyHyperlinkForm] = useState(false);
  const [editingPropertyHyperlinkIdx, setEditingPropertyHyperlinkIdx] = useState<number | null>(null);
  const [propertyHyperlinkInput, setPropertyHyperlinkInput] = useState<HyperlinkConfig>({
    text: '',
    url: '',
    type: 'internal',
    open_in_new_tab: false,
    title: '',
    match_mode: 'first',
    max_occurrences: 1
  });
  const [isUploadingPropertyImg, setIsUploadingPropertyImg] = useState(false);

  // Building Modal Form (Add & Edit)
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [isEditingBuilding, setIsEditingBuilding] = useState(false);
  const [buildingModalTab, setBuildingModalTab] = useState<'specs' | 'content' | 'images' | 'seo' | 'hyperlinks' | 'preview'>('specs');
  const [showBuildingHyperlinkForm, setShowBuildingHyperlinkForm] = useState(false);
  const [editingBuildingHyperlinkIdx, setEditingBuildingHyperlinkIdx] = useState<number | null>(null);
  const [buildingHyperlinkInput, setBuildingHyperlinkInput] = useState<HyperlinkConfig>({
    text: '',
    url: '',
    type: 'internal',
    open_in_new_tab: false,
    title: '',
    match_mode: 'first',
    max_occurrences: 1
  });
  const [isUploadingBuildingImg, setIsUploadingBuildingImg] = useState(false);
  const [isUploadingBuildingOgImg, setIsUploadingBuildingOgImg] = useState(false);
  const [isUploadingPropertyOgImg, setIsUploadingPropertyOgImg] = useState(false);
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
    return computeStructureDisplay(basement, ground, floors);
  };

  // Building Available Properties Manager Modal
  const [managingBuildingProps, setManagingBuildingProps] = useState<Building | null>(null);
  const [showManagePropsModal, setShowManagePropsModal] = useState(false);

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
    setIsUploadingPropertyImg(true);
    try {
      const compressed = await compressImageFile(file);
      if (compressed) {
        setCurrentProperty(prev => ({ 
          ...prev, 
          primary_image: compressed,
          og_image: prev.og_image || '' 
        }));
      }
    } finally {
      setIsUploadingPropertyImg(false);
      e.target.value = '';
    }
  };

  const handlePropertyOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPropertyOgImg(true);
    try {
      const compressed = await compressImageFile(file, 1200, 0.76);
      if (compressed) {
        setCurrentProperty(prev => ({ 
          ...prev, 
          og_image: compressed 
        }));
      }
    } finally {
      setIsUploadingPropertyOgImg(false);
      e.target.value = '';
    }
  };

  const handleBuildingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBuildingImg(true);
    try {
      const compressed = await compressImageFile(file);
      if (compressed) {
        setCurrentBuilding(prev => ({ 
          ...prev, 
          hero_image: compressed,
          og_image: prev.og_image || '' 
        }));
      }
    } finally {
      setIsUploadingBuildingImg(false);
      e.target.value = '';
    }
  };

  const handleBuildingOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBuildingOgImg(true);
    try {
      const compressed = await compressImageFile(file, 1200, 0.76);
      if (compressed) {
        setCurrentBuilding(prev => ({ 
          ...prev, 
          og_image: compressed 
        }));
      }
    } finally {
      setIsUploadingBuildingOgImg(false);
      e.target.value = '';
    }
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
    const [p, b, l, ld, gd] = await Promise.all([
      StorageService.getProperties(),
      StorageService.getBuildings(),
      StorageService.getLocations(),
      StorageService.getLeads(),
      StorageService.getGuides(),
    ]);
    setProperties(p);
    setBuildings(b);
    setLocations(l);
    setLeads(ld);
    setGuides(gd);
    setLoading(false);
  };

  // --- MARKET GUIDE ACTIONS ---
  const handleGuideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingGuideImage(true);
    try {
      const prevImg = currentGuide.featured_image_url || currentGuide.image;
      const uploadedUrl = await StorageService.uploadBlogImage(file, prevImg);
      setCurrentGuide(prev => ({
        ...prev,
        image: uploadedUrl,
        featured_image_url: uploadedUrl
      }));
    } catch (err) {
      console.error('Guide image upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingGuideImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveGuideImage = () => {
    setCurrentGuide(prev => ({
      ...prev,
      image: '',
      featured_image_url: ''
    }));
  };

  const handleOpenAddGuide = () => {
    setIsEditingGuide(false);
    setGuideModalTab('edit');
    setShowHyperlinkForm(false);
    setEditingHyperlinkIndex(null);
    setCurrentGuide({
      id: `guide-${Date.now()}`,
      title: '',
      slug: '',
      category: 'Office Market',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      readTime: '5 min read',
      excerpt: '',
      content: '',
      image: '',
      featured_image_url: '',
      featured_image_alt: '',
      featured_image_caption: '',
      seo_title: '',
      seo_description: '',
      hyperlinks: [],
      published: true,
      featured: false,
      author: 'Shristi Estate Advisory Desk'
    });
    setShowGuideModal(true);
  };

  const handleOpenEditGuide = (guide: MarketGuide) => {
    setIsEditingGuide(true);
    setGuideModalTab('edit');
    setShowHyperlinkForm(false);
    setEditingHyperlinkIndex(null);
    const existingImg = guide.featured_image_url || guide.image || '';
    setCurrentGuide({
      ...guide,
      image: existingImg,
      featured_image_url: existingImg,
      featured_image_alt: guide.featured_image_alt || '',
      featured_image_caption: guide.featured_image_caption || '',
      seo_title: guide.seo_title || '',
      seo_description: guide.seo_description || '',
      hyperlinks: Array.isArray(guide.hyperlinks) ? [...guide.hyperlinks] : []
    });
    setShowGuideModal(true);
  };

  const handleSaveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGuide.title?.trim()) {
      alert('Please enter a guide title.');
      return;
    }

    setIsSaving(true);
    try {
      const generatedSlug = generateBlogSlug(currentGuide.title);
      const slug = currentGuide.slug?.trim() || generatedSlug || `guide-${Date.now()}`;
      const featuredImg = currentGuide.featured_image_url?.trim() || currentGuide.image?.trim() || '';

      const guideToSave: MarketGuide = {
        id: currentGuide.id || `guide-${Date.now()}`,
        slug,
        title: currentGuide.title.trim(),
        excerpt: currentGuide.excerpt?.trim() || '',
        content: currentGuide.content?.trim() || currentGuide.excerpt?.trim() || '',
        readTime: currentGuide.readTime?.trim() || '5 min read',
        date: currentGuide.date?.trim() || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        category: currentGuide.category?.trim() || 'Office Market',
        image: featuredImg,
        featured_image_url: featuredImg,
        featured_image_alt: currentGuide.featured_image_alt?.trim() || '',
        featured_image_caption: currentGuide.featured_image_caption?.trim() || '',
        seo_title: currentGuide.seo_title?.trim() || '',
        seo_description: currentGuide.seo_description?.trim() || '',
        hyperlinks: currentGuide.hyperlinks || [],
        published: currentGuide.published ?? true,
        featured: currentGuide.featured ?? false,
        author: currentGuide.author?.trim() || 'Shristi Estate Advisory Desk'
      };

      await StorageService.saveGuide(guideToSave);
      const updated = await StorageService.getGuides();
      setGuides(updated);
      setShowGuideModal(false);
    } catch (err) {
      console.error('Error saving guide:', err);
      alert('Failed to save market guide. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddHyperlink = () => {
    setEditingHyperlinkIndex(null);
    setHyperlinkInput({
      text: '',
      url: '',
      type: 'internal',
      open_in_new_tab: false,
      title: '',
      match_mode: 'first',
      max_occurrences: 1
    });
    setShowHyperlinkForm(true);
  };

  const handleOpenEditHyperlink = (index: number) => {
    const target = (currentGuide.hyperlinks || [])[index];
    if (!target) return;
    setEditingHyperlinkIndex(index);
    setHyperlinkInput({ ...target });
    setShowHyperlinkForm(true);
  };

  const handleSaveHyperlink = () => {
    if (!hyperlinkInput.text.trim()) {
      alert('Please enter a word or phrase to link.');
      return;
    }
    if (!hyperlinkInput.url.trim()) {
      alert('Please enter or select a destination URL.');
      return;
    }

    const formattedUrl = formatHyperlinkUrl(hyperlinkInput.url.trim(), hyperlinkInput.type);

    const newHl: HyperlinkConfig = {
      id: hyperlinkInput.id || `hl-${Date.now()}`,
      text: hyperlinkInput.text.trim(),
      url: formattedUrl,
      type: hyperlinkInput.type,
      open_in_new_tab: hyperlinkInput.open_in_new_tab ?? (hyperlinkInput.type === 'external'),
      title: hyperlinkInput.title?.trim() || hyperlinkInput.text.trim(),
      match_mode: hyperlinkInput.match_mode || 'first',
      max_occurrences: hyperlinkInput.match_mode === 'all' ? (hyperlinkInput.max_occurrences || 99) : 1
    };

    const updatedList = [...(currentGuide.hyperlinks || [])];
    if (editingHyperlinkIndex !== null && editingHyperlinkIndex >= 0) {
      updatedList[editingHyperlinkIndex] = newHl;
    } else {
      updatedList.push(newHl);
    }

    setCurrentGuide(prev => ({ ...prev, hyperlinks: updatedList }));
    setShowHyperlinkForm(false);
    setEditingHyperlinkIndex(null);
  };

  const handleDeleteHyperlink = (index: number) => {
    const updatedList = [...(currentGuide.hyperlinks || [])];
    updatedList.splice(index, 1);
    setCurrentGuide(prev => ({ ...prev, hyperlinks: updatedList }));
  };

  const handleDeleteGuide = async (guideId: string) => {
    if (window.confirm('Are you sure you want to delete this Market Guide / Insight? This action cannot be undone.')) {
      await StorageService.deleteGuide(guideId);
      const updated = await StorageService.getGuides();
      setGuides(updated);
    }
  };

  const handleTogglePublishGuide = async (guide: MarketGuide) => {
    const updatedGuide: MarketGuide = {
      ...guide,
      published: !guide.published
    };
    await StorageService.saveGuide(updatedGuide);
    const updated = await StorageService.getGuides();
    setGuides(updated);
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
      tower: '',
      block_name: '',
      unit_number: '',
      sector: locations[0]?.name || 'Sector 62, Noida',
      short_description: '',
      overview: '',
      location_connectivity: '',
      highlights: '',
      primary_image_alt: '',
      primary_image_title: '',
      primary_image_caption: '',
      image_details: [],
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      canonical_url: '',
      og_title: '',
      og_description: '',
      og_image: '',
      hyperlinks: [],
      published: true,
    });
    setPropertyModalTab('specs');
    setCustomPropertyTypeInput('');
    setNewFeatureTag('');
    setNewPropertyGalleryUrl('');
    setShowPropertyModal(true);
  };

  const handleOpenEditProperty = (prop: Property) => {
    setIsEditingProperty(true);
    setPropertyModalTab('specs');
    setCurrentProperty({
      ...prop,
      category: prop.category || 'office-space',
      property_type: prop.property_type || 'Commercial Office',
      area_unit: prop.area_unit || 'sq.ft',
      land_area: prop.land_area,
      floor: prop.floor || 'Ground Floor',
      total_floors: prop.total_floors || 1,
      tower: prop.tower || '',
      block_name: prop.block_name || '',
      unit_number: prop.unit_number || '',
      sector: prop.sector || prop.location_name || '',
      power_load: prop.power_load || '',
      road_width: prop.road_width || '',
      possession: prop.possession || 'Ready to Move',
      parking: prop.parking || '',
      short_description: prop.short_description || '',
      overview: prop.overview || prop.description || '',
      location_connectivity: prop.location_connectivity || '',
      highlights: prop.highlights || '',
      primary_image_alt: prop.primary_image_alt || '',
      primary_image_title: prop.primary_image_title || '',
      primary_image_caption: prop.primary_image_caption || '',
      image_details: prop.image_details || [],
      seo_title: prop.seo_title || '',
      seo_description: prop.seo_description || '',
      seo_keywords: prop.seo_keywords || '',
      canonical_url: prop.canonical_url || '',
      og_title: prop.og_title || '',
      og_description: prop.og_description || '',
      og_image: prop.og_image ?? '',
      hyperlinks: Array.isArray(prop.hyperlinks) ? [...prop.hyperlinks] : [],
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
        tower: currentProperty.tower || (bld && bld.towers && bld.towers.length > 0 ? bld.towers[0] : null) as any,
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
        block_name: currentProperty.block_name || undefined,
        unit_number: currentProperty.unit_number || undefined,
        sector: currentProperty.sector || loc?.name || currentProperty.location_name,
        rent_price: currentProperty.rent_price !== undefined ? Number(currentProperty.rent_price) : undefined,
        sale_price: currentProperty.sale_price !== undefined ? Number(currentProperty.sale_price) : undefined,
        short_description: currentProperty.short_description || undefined,
        overview: currentProperty.overview || currentProperty.description || '',
        location_connectivity: currentProperty.location_connectivity || undefined,
        highlights: currentProperty.highlights || undefined,
        primary_image_alt: currentProperty.primary_image_alt || undefined,
        primary_image_title: currentProperty.primary_image_title || undefined,
        primary_image_caption: currentProperty.primary_image_caption || undefined,
        image_details: currentProperty.image_details || [],
        seo_title: currentProperty.seo_title || undefined,
        seo_description: currentProperty.seo_description || undefined,
        seo_keywords: currentProperty.seo_keywords || undefined,
        canonical_url: currentProperty.canonical_url || undefined,
        og_title: currentProperty.og_title || undefined,
        og_description: currentProperty.og_description || undefined,
        og_image: currentProperty.og_image ? currentProperty.og_image.trim() : '',
        hyperlinks: Array.isArray(currentProperty.hyperlinks) ? currentProperty.hyperlinks : [],
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

  // --- PROPERTY HYPERLINK HANDLERS ---
  const handleSavePropertyHyperlink = () => {
    if (!propertyHyperlinkInput.text.trim() || !propertyHyperlinkInput.url.trim()) {
      alert('Please enter both Words/Phrase and Destination URL.');
      return;
    }
    const formattedUrl = formatHyperlinkUrl(propertyHyperlinkInput.url.trim(), propertyHyperlinkInput.type);
    const item: HyperlinkConfig = {
      ...propertyHyperlinkInput,
      id: propertyHyperlinkInput.id || `hl-${Date.now()}`,
      text: propertyHyperlinkInput.text.trim(),
      url: formattedUrl,
      title: propertyHyperlinkInput.title?.trim() || propertyHyperlinkInput.text.trim()
    };
    const current = currentProperty.hyperlinks || [];
    let updated: HyperlinkConfig[];
    if (editingPropertyHyperlinkIdx !== null && editingPropertyHyperlinkIdx >= 0) {
      updated = [...current];
      updated[editingPropertyHyperlinkIdx] = item;
    } else {
      updated = [...current, item];
    }
    setCurrentProperty(prev => ({ ...prev, hyperlinks: updated }));
    setPropertyHyperlinkInput({
      text: '',
      url: '',
      type: 'internal',
      open_in_new_tab: false,
      title: '',
      match_mode: 'first',
      max_occurrences: 1
    });
    setEditingPropertyHyperlinkIdx(null);
    setShowPropertyHyperlinkForm(false);
  };

  const handleDeletePropertyHyperlink = (index: number) => {
    const updated = (currentProperty.hyperlinks || []).filter((_, i) => i !== index);
    setCurrentProperty(prev => ({ ...prev, hyperlinks: updated }));
  };

  const handleOpenEditPropertyHyperlink = (index: number) => {
    const hl = (currentProperty.hyperlinks || [])[index];
    if (!hl) return;
    setPropertyHyperlinkInput({ ...hl });
    setEditingPropertyHyperlinkIdx(index);
    setShowPropertyHyperlinkForm(true);
  };

  // --- BUILDING ACTIONS & HYPERLINK HANDLERS ---
  const handleSaveBuildingHyperlink = () => {
    if (!buildingHyperlinkInput.text.trim() || !buildingHyperlinkInput.url.trim()) {
      alert('Please enter both Words/Phrase and Destination URL.');
      return;
    }
    const formattedUrl = formatHyperlinkUrl(buildingHyperlinkInput.url.trim(), buildingHyperlinkInput.type);
    const item: HyperlinkConfig = {
      ...buildingHyperlinkInput,
      id: buildingHyperlinkInput.id || `hl-${Date.now()}`,
      text: buildingHyperlinkInput.text.trim(),
      url: formattedUrl,
      title: buildingHyperlinkInput.title?.trim() || buildingHyperlinkInput.text.trim()
    };
    const current = currentBuilding.hyperlinks || [];
    let updated: HyperlinkConfig[];
    if (editingBuildingHyperlinkIdx !== null && editingBuildingHyperlinkIdx >= 0) {
      updated = [...current];
      updated[editingBuildingHyperlinkIdx] = item;
    } else {
      updated = [...current, item];
    }
    setCurrentBuilding(prev => ({ ...prev, hyperlinks: updated }));
    setBuildingHyperlinkInput({
      text: '',
      url: '',
      type: 'internal',
      open_in_new_tab: false,
      title: '',
      match_mode: 'first',
      max_occurrences: 1
    });
    setEditingBuildingHyperlinkIdx(null);
    setShowBuildingHyperlinkForm(false);
  };

  const handleDeleteBuildingHyperlink = (index: number) => {
    const updated = (currentBuilding.hyperlinks || []).filter((_, i) => i !== index);
    setCurrentBuilding(prev => ({ ...prev, hyperlinks: updated }));
  };

  const handleOpenEditBuildingHyperlink = (index: number) => {
    const hl = (currentBuilding.hyperlinks || [])[index];
    if (!hl) return;
    setBuildingHyperlinkInput({ ...hl });
    setEditingBuildingHyperlinkIdx(index);
    setShowBuildingHyperlinkForm(true);
  };

  const handleOpenAddBuilding = () => {
    setIsEditingBuilding(false);
    setBuildingModalTab('specs');
    const initialLoc = locations[0]?.id || 'loc-sec-62';
    const initialLocName = locations[0]?.name || 'Sector 62, Noida';
    setCurrentBuilding({
      name: '',
      building_name: '',
      block_name: '',
      tower_number: '',
      sector: initialLocName,
      gmaps_direction: '',
      status: 'Active',
      short_description: '',
      overview: '',
      location_connectivity: '',
      hero_image_alt: '',
      hero_image_title: '',
      hero_image_caption: '',
      image_details: [],
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      canonical_url: '',
      og_title: '',
      og_description: '',
      og_image: '',
      hyperlinks: [],
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
    setBuildingModalTab('specs');
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
    const structureDisplay = getBuildingStructureDisplay({ ...bld, basement_floors: basement, ground_option: ground, total_floors: floors, structure_display: bld.structure_display });

    setCurrentBuilding({
      ...bld,
      building_name: bld.building_name || bld.name || '',
      block_name: bld.block_name || '',
      tower_number: bld.tower_number || '',
      sector: bld.sector || bld.location_name || '',
      gmaps_direction: bld.gmaps_direction || '',
      status: bld.status || 'Active',
      short_description: bld.short_description || '',
      overview: bld.overview || bld.description || '',
      location_connectivity: bld.location_connectivity || '',
      hero_image_alt: bld.hero_image_alt || '',
      hero_image_title: bld.hero_image_title || '',
      hero_image_caption: bld.hero_image_caption || '',
      image_details: bld.image_details || [],
      seo_title: bld.seo_title || '',
      seo_description: bld.seo_description || '',
      seo_keywords: bld.seo_keywords || '',
      canonical_url: bld.canonical_url || '',
      og_title: bld.og_title || '',
      og_description: bld.og_description || '',
      og_image: bld.og_image ?? '',
      hyperlinks: Array.isArray(bld.hyperlinks) ? [...bld.hyperlinks] : [],
      categories: existingCats,
      locations: existingLocs,
      towers: existingTowers,
      basement_floors: basement,
      ground_option: ground,
      structure_display: structureDisplay,
      tower_details: bld.tower_details || (existingTowers.length > 1 ? `${existingTowers.length} Towers (${existingTowers.join(', ')})` : (existingTowers[0] || 'Single Tower')),
      gallery: bld.gallery && Array.isArray(bld.gallery) ? [...bld.gallery] : [],
      deleted_unit_ids: bld.deleted_unit_ids || []
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
        building_name: currentBuilding.building_name || currentBuilding.name.trim(),
        block_name: currentBuilding.block_name || undefined,
        tower_number: currentBuilding.tower_number || undefined,
        sector: currentBuilding.sector || primaryLoc?.name || currentBuilding.location_name,
        gmaps_direction: currentBuilding.gmaps_direction || undefined,
        status: currentBuilding.status || 'Active',
        slug: currentBuilding.slug || currentBuilding.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        location_id: primaryLocId,
        location_name: primaryLoc ? primaryLoc.name : (currentBuilding.location_name || 'Sector 62, Noida'),
        locations: selectedLocationIds,
        location_names: selectedLocationNames,
        category: primaryCategory,
        categories: selectedCategories,
        address: currentBuilding.address || (primaryLoc ? primaryLoc.name : 'Sector 62, Noida'),
        description: currentBuilding.description || '',
        short_description: currentBuilding.short_description || undefined,
        overview: currentBuilding.overview || currentBuilding.description || '',
        location_connectivity: currentBuilding.location_connectivity || undefined,
        specs: currentBuilding.specs || undefined,
        hero_image: currentBuilding.hero_image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        hero_image_alt: currentBuilding.hero_image_alt || undefined,
        hero_image_title: currentBuilding.hero_image_title || undefined,
        hero_image_caption: currentBuilding.hero_image_caption || undefined,
        image_details: currentBuilding.image_details || [],
        gallery: Array.isArray(currentBuilding.gallery) ? currentBuilding.gallery : [],
        seo_title: currentBuilding.seo_title || undefined,
        seo_description: currentBuilding.seo_description || undefined,
        seo_keywords: currentBuilding.seo_keywords || undefined,
        canonical_url: currentBuilding.canonical_url || undefined,
        og_title: currentBuilding.og_title || undefined,
        og_description: currentBuilding.og_description || undefined,
        og_image: currentBuilding.og_image ? currentBuilding.og_image.trim() : '',
        hyperlinks: Array.isArray(currentBuilding.hyperlinks) ? currentBuilding.hyperlinks : [],
        total_floors: Number(currentBuilding.total_floors) || 1,
        basement_floors: currentBuilding.basement_floors || '2 Basements (2B)',
        ground_option: currentBuilding.ground_option || 'Ground (G)',
        structure_display: getBuildingStructureDisplay(currentBuilding),
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
        deleted_unit_ids: currentBuilding.deleted_unit_ids || (buildings.find(b => b.id === currentBuilding.id)?.deleted_unit_ids || []),
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
          onClick={() => setActiveTab('guides')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 ${
            activeTab === 'guides' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Market Insights & Guides ({guides.length})</span>
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
                    <th className="p-3.5">SEO Status</th>
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
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.dataset.failed) {
                                  target.dataset.failed = 'true';
                                  target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
                                }
                              }}
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

                        {/* SEO Status */}
                        <td className="p-3.5">
                          {(() => {
                            const seoStatus = computeSeoStatus(prop, 'property');
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  handleOpenEditProperty(prop);
                                  setPropertyModalTab('seo');
                                }}
                                className="group/seo text-left cursor-pointer"
                                title={seoStatus.isComplete ? 'SEO Complete. Click to review SEO settings.' : `Missing: ${seoStatus.missingFields.join(', ')}. Click to fix.`}
                              >
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                                  seoStatus.isComplete
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 group-hover/seo:bg-emerald-500/25'
                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 group-hover/seo:bg-amber-500/25'
                                }`}>
                                  {seoStatus.isComplete ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> : <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />}
                                  <span>{seoStatus.isComplete ? 'Complete' : 'Needs Attention'}</span>
                                </span>
                                {!seoStatus.isComplete && (
                                  <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-[110px]">
                                    {seoStatus.missingFields.length} missing
                                  </span>
                                )}
                              </button>
                            );
                          })()}
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
                      <img 
                        src={prop.primary_image} 
                        alt="" 
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.failed) {
                            target.dataset.failed = 'true';
                            target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
                          }
                        }}
                        className="w-full h-full object-cover" 
                      />
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

                  {/* Mobile SEO Badge */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">SEO Status:</span>
                    {(() => {
                      const seoStatus = computeSeoStatus(prop, 'property');
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenEditProperty(prop);
                            setPropertyModalTab('seo');
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            seoStatus.isComplete
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {seoStatus.isComplete ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                          <span>{seoStatus.isComplete ? 'Complete' : 'Needs Attention'}</span>
                        </button>
                      );
                    })()}
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
              <div key={bld.id} className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 group">
                {/* Card Image Header with Non-overlapping Badge and Actions */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={bld.hero_image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'} 
                    alt={bld.name} 
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.failed) {
                        target.dataset.failed = 'true';
                        target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/20 pointer-events-none" />
                  
                  {/* Top Bar: Left = SEO Status Badge, Right = Delete Action */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    {/* SEO Status Badge */}
                    {(() => {
                      const seoStatus = computeSeoStatus(bld, 'building');
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenEditBuilding(bld);
                            setBuildingModalTab('seo');
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-md backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 ${
                            seoStatus.isComplete
                              ? 'bg-emerald-600/90 text-white hover:bg-emerald-500'
                              : 'bg-amber-600/90 text-white hover:bg-amber-500'
                          }`}
                          title={seoStatus.isComplete ? 'SEO Complete. Click to review SEO settings.' : `Missing: ${seoStatus.missingFields.join(', ')}. Click to fix.`}
                        >
                          {seoStatus.isComplete ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <AlertCircle className="w-3.5 h-3.5 text-white" />}
                          <span>{seoStatus.isComplete ? 'SEO Complete' : 'Needs Attention'}</span>
                        </button>
                      );
                    })()}

                    {/* Compact Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBuilding(bld.id)}
                      className="p-1.5 rounded-xl bg-slate-950/60 hover:bg-rose-600 text-white/90 hover:text-white shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer shrink-0"
                      title="Delete Commercial Building"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Location Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                    <h3 className="font-bold text-base text-white font-['Outfit'] drop-shadow-sm leading-tight line-clamp-1">{bld.name}</h3>
                    <div className="text-xs text-slate-200/90 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-brand-400 shrink-0" />
                      <span className="truncate">{bld.location_name}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body & Specs */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[11px] text-slate-400 block font-medium">Tariff Range:</span>
                        <span className="font-bold text-brand-600 dark:text-brand-400 block text-xs truncate">
                          {bld.rent_range || 'On Request'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[11px] text-slate-400 block font-medium">Structure:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs truncate">
                          {getBuildingStructureDisplay(bld)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[11px] text-slate-400 block font-medium">Size Range:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs truncate">
                          {bld.size_range || 'Flexible'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                        <span className="text-[11px] text-slate-400 block font-medium">Power Backup:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs truncate">
                          {bld.power_backup || '100% DG'}
                        </span>
                      </div>
                    </div>

                    {bld.towers && bld.towers.length > 0 && (
                      <div className="px-2.5 py-1.5 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/70 dark:border-brand-800/60 flex items-center gap-1.5 text-[11px] text-brand-700 dark:text-brand-300 font-semibold truncate">
                        <Building2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span className="truncate">{bld.tower_details || `${bld.towers.length} Towers (${bld.towers.join(', ')})`}</span>
                      </div>
                    )}
                  </div>

                  {/* Clean 2-Button Action Bar */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBuilding(bld)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-md shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate"
                        title="Update Building Specs, Content, Images & SEO"
                      >
                        <Edit3 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Edit Specs & SEO</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setManagingBuildingProps(bld);
                          setShowManagePropsModal(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-slate-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-800 dark:hover:bg-brand-950/80 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate"
                        title="Manage individual units, monthly rents, rates and sizes for this building"
                      >
                        <Layers className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span className="truncate">Units ({bld.property_count || 20})</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {CATEGORY_CONFIG[bld.category || 'office-space']?.label || 'Commercial'}
                      </span>
                      <Link 
                        to={`/buildings/${bld.slug}`} 
                        className="text-xs text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>View Live Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
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

      {/* TAB 6: MARKET INSIGHTS & GUIDES MANAGER */}
      {activeTab === 'guides' && (
        <div className="space-y-6">
          {/* Top Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Editorial & Content Strategy
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-0.5">
                Market Insights & Guides ({guides.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage commercial leasing guides, sector analyses, and corporate real estate reports displayed on the website.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/blog"
                target="_blank"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-card border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleOpenAddGuide}
                className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Guide / Insight</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-card rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Articles</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
                {guides.length}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Published Live</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-['Outfit'] mt-1">
                {guides.filter(g => g.published !== false).length}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Drafts / Hidden</span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-['Outfit'] mt-1">
                {guides.filter(g => g.published === false).length}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Featured</span>
              <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 font-['Outfit'] mt-1">
                {guides.filter(g => g.featured).length}
              </div>
            </div>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search guides by title, category, topic, or author..."
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
                className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {['All', ...Array.from(new Set(guides.map(g => g.category)))].map(cat => (
                <button
                  key={cat}
                  onClick={() => setGuideCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    guideCategoryFilter === cat
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Guides Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides
              .filter((g) => {
                if (guideCategoryFilter !== 'All' && g.category !== guideCategoryFilter) return false;
                if (guideSearch.trim()) {
                  const q = guideSearch.toLowerCase();
                  return (
                    g.title.toLowerCase().includes(q) ||
                    g.category.toLowerCase().includes(q) ||
                    g.excerpt.toLowerCase().includes(q) ||
                    (g.author && g.author.toLowerCase().includes(q))
                  );
                }
                return true;
              })
              .map((guide) => (
                <div
                  key={guide.id}
                  className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 flex flex-col justify-between shadow-md hover:shadow-xl transition-all group"
                >
                  {/* Hero / Cover */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={getBlogFeaturedImage(guide)}
                      alt={getBlogImageAlt(guide)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-brand-600 text-white shadow-md">
                        {guide.category}
                      </span>
                      {guide.featured && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white shadow-sm">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Top Right Status & Quick Toggle */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePublishGuide(guide)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border shadow transition-all flex items-center gap-1 ${
                          guide.published !== false
                            ? 'bg-emerald-500/90 text-white border-emerald-400/40 hover:bg-emerald-600'
                            : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                        title={guide.published !== false ? 'Click to unpublish (hide from website)' : 'Click to publish live'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${guide.published !== false ? 'bg-white' : 'bg-amber-400'}`} />
                        <span>{guide.published !== false ? 'Live' : 'Draft'}</span>
                      </button>
                    </div>

                    {/* Meta date / readtime at bottom of cover */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {guide.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {guide.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Outfit'] line-clamp-2 leading-snug">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {guide.excerpt}
                      </p>
                      {guide.author && (
                        <span className="text-[10px] text-slate-400 font-medium block">
                          By {guide.author}
                        </span>
                      )}

                      {guide.hyperlinks && guide.hyperlinks.length > 0 && (
                        <div className="pt-1 flex items-center gap-1 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                          <Link2 className="w-3 h-3" />
                          <span>{guide.hyperlinks.length} text links</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleOpenEditGuide(guide)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold text-xs hover:bg-brand-600 dark:hover:bg-brand-400 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Guide</span>
                      </button>

                      <Link
                        to={`/blog/${guide.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="View Public Article"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteGuide(guide.id)}
                        className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Delete Guide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {guides.filter((g) => {
              if (guideCategoryFilter !== 'All' && g.category !== guideCategoryFilter) return false;
              if (guideSearch.trim()) {
                const q = guideSearch.toLowerCase();
                return (
                  g.title.toLowerCase().includes(q) ||
                  g.category.toLowerCase().includes(q) ||
                  g.excerpt.toLowerCase().includes(q) ||
                  (g.author && g.author.toLowerCase().includes(q))
                );
              }
              return true;
            }).length === 0 && (
              <div className="col-span-full py-16 text-center glass-card rounded-3xl p-8 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  No market guides matched your search or category filter.
                </p>
                <button
                  onClick={handleOpenAddGuide}
                  className="btn-glass-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Guide</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROPERTY ADD / EDIT MODAL */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex min-h-full items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl my-auto max-h-[96vh] sm:max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setShowPropertyModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 sm:bg-transparent z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-3 shrink-0 pr-8">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {isEditingProperty ? 'Edit Property Listing & SEO' : 'New Commercial Listing'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit']">
                {isEditingProperty ? `Edit: ${currentProperty.title || currentProperty.reference_number}` : 'Add Commercial Property'}
              </h2>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 border-b border-slate-200 dark:border-slate-800 no-scrollbar shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setPropertyModalTab('specs')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  propertyModalTab === 'specs'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>1. Basic & Specs</span>
              </button>
              <button
                type="button"
                onClick={() => setPropertyModalTab('content')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  propertyModalTab === 'content'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>2. Content & Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setPropertyModalTab('images')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  propertyModalTab === 'images'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>3. Images & Alt Text ({(currentProperty.gallery?.length || 0) + (currentProperty.primary_image ? 1 : 0)})</span>
              </button>
              <button
                type="button"
                onClick={() => setPropertyModalTab('seo')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  propertyModalTab === 'seo'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>4. SEO & URLs</span>
              </button>
              <button
                type="button"
                onClick={() => setPropertyModalTab('hyperlinks')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  propertyModalTab === 'hyperlinks'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>5. Hyperlink Words ({currentProperty.hyperlinks?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setPropertyModalTab('preview')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  propertyModalTab === 'preview'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>6. SEO Preview</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveProperty} className="space-y-4 overflow-y-auto pr-1 flex-1 -mr-1">
              {/* TAB 1: BASIC & SPECS */}
              {propertyModalTab === 'specs' && (
                <div className="space-y-4">
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

                  {/* TARIFF / PRICING */}
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

                  {/* CATEGORY & PROPERTY TYPE */}
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

                  {/* LOCATION, BUILDING, TOWER & FLOOR HIERARCHY */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-500" />
                      <span>Building, Tower, Sector & Floor Association</span>
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
                              location_name: loc ? loc.name : currentProperty.location_name,
                              sector: loc ? loc.name : currentProperty.sector
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
                              building_name: bld ? bld.name : undefined,
                              tower: bld && bld.towers && bld.towers.length > 0 ? bld.towers[0] : (currentProperty.tower || '')
                            });
                          }}
                          className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                        >
                          <option value="">Independent / Standalone Premises</option>
                          {buildings.map(b => (
                            <option key={b.id} value={b.id}>{b.name} ({b.location_name})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Tower Name */}
                      <div>
                        <label className="block text-xs font-semibold mb-1">Tower / Wing</label>
                        {(() => {
                          const selectedBld = buildings.find(b => b.id === currentProperty.building_id);
                          if (selectedBld && selectedBld.towers && selectedBld.towers.length > 0) {
                            return (
                              <select
                                value={currentProperty.tower || ''}
                                onChange={(e) => setCurrentProperty({ ...currentProperty, tower: e.target.value })}
                                className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                              >
                                {selectedBld.towers.map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                                <option value="">Other / Standalone</option>
                              </select>
                            );
                          }
                          return (
                            <input
                              type="text"
                              value={currentProperty.tower || ''}
                              onChange={(e) => setCurrentProperty({ ...currentProperty, tower: e.target.value })}
                              placeholder="e.g. Tower A"
                              className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                            />
                          );
                        })()}
                      </div>

                      {/* Block Name */}
                      <div>
                        <label className="block text-xs font-semibold mb-1">Block Name</label>
                        <input
                          type="text"
                          value={currentProperty.block_name || ''}
                          onChange={(e) => setCurrentProperty({ ...currentProperty, block_name: e.target.value })}
                          placeholder="e.g. Block B"
                          className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                        />
                      </div>

                      {/* Floor */}
                      <div>
                        <label className="block text-xs font-semibold mb-1">Floor Level</label>
                        <input
                          type="text"
                          value={currentProperty.floor || ''}
                          onChange={(e) => setCurrentProperty({ ...currentProperty, floor: e.target.value })}
                          placeholder="e.g. 4th Floor"
                          className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                        />
                      </div>

                      {/* Unit Number */}
                      <div>
                        <label className="block text-xs font-semibold mb-1">Unit / Suite #</label>
                        <input
                          type="text"
                          value={currentProperty.unit_number || ''}
                          onChange={(e) => setCurrentProperty({ ...currentProperty, unit_number: e.target.value })}
                          placeholder="e.g. Unit 402"
                          className="glass-input w-full px-3 py-2 rounded-xl text-sm font-mono"
                        />
                      </div>
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

                  {/* AREA MEASUREMENTS */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-brand-500" />
                        <span>Area & Dimensions</span>
                      </span>
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

                  {/* TECHNICAL INFRASTRUCTURE */}
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                      <div>
                        <label className="block text-xs font-semibold mb-1">Parking & Loading Bays</label>
                        <input
                          type="text"
                          value={currentProperty.parking || ''}
                          onChange={(e) => setCurrentProperty({ ...currentProperty, parking: e.target.value })}
                          placeholder="e.g. 2 Covered Bays or Trailer Maneuvering"
                          className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FEATURES & KEY HIGHLIGHTS */}
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
                        placeholder="Type custom feature and click Add (e.g. 5-Ton Overhead Crane)..."
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
                </div>
              )}

              {/* TAB 2: CONTENT & OVERVIEW */}
              {propertyModalTab === 'content' && (
                <div className="space-y-4">
                  {/* Short Description */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Property Short Description
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Used for property cards, search previews, and snippet summaries across the site.
                    </p>
                    <textarea
                      rows={2}
                      value={currentProperty.short_description || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, short_description: e.target.value })}
                      placeholder="e.g. Fully furnished 1,150 sq.ft corporate office on 4th floor with 16 workstations, manager cabins, and 100% DG backup..."
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>

                  {/* Commercial Overview */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Property Overview & Commercial Description *
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Detailed overview of this property unit. Configured Hyperlink Words will automatically link inside this text.
                    </p>
                    <textarea
                      rows={6}
                      value={currentProperty.overview || currentProperty.description || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, overview: e.target.value, description: e.target.value })}
                      onPaste={(e) => handleOverviewPaste(e, (val) => setCurrentProperty({ ...currentProperty, overview: val, description: val }), currentProperty.overview || currentProperty.description || '')}
                      placeholder="Comprehensive commercial details, layout features, ceiling heights, HVAC, and immediate business advantages..."
                      className="glass-input overview-input w-full px-3 py-2.5 rounded-xl text-sm"
                    />
                  </div>

                  {/* Location & Connectivity */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Location & Connectivity
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Proximity to metro stations, expressways, airports, and major commercial hubs.
                    </p>
                    <textarea
                      rows={4}
                      value={currentProperty.location_connectivity || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, location_connectivity: e.target.value })}
                      placeholder="e.g. Located right next to Sector 62 Metro Station with direct access to NH-24 and DND Flyway..."
                      className="glass-input w-full px-3 py-2.5 rounded-xl text-sm"
                    />
                  </div>

                  {/* Highlights */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Property Highlights & Key Points
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Key bullet points or standout commercial aspects.
                    </p>
                    <textarea
                      rows={3}
                      value={currentProperty.highlights || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, highlights: e.target.value })}
                      placeholder="e.g. • Corner unit with panoramic glass facade&#10;• Plug-and-play setup with high-speed fiber&#10;• Reserved basement car parking"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: IMAGES & MEDIA */}
              {propertyModalTab === 'images' && (
                <div className="p-1">
                  <AdminMediaManager
                    primaryImage={currentProperty.primary_image || ''}
                    onPrimaryImageChange={(url) => setCurrentProperty(prev => ({ 
                      ...prev, 
                      primary_image: url,
                      og_image: prev.og_image && prev.og_image !== prev.primary_image ? prev.og_image : url
                    }))}
                    primaryAlt={currentProperty.primary_image_alt || ''}
                    onPrimaryAltChange={(alt) => setCurrentProperty(prev => ({ ...prev, primary_image_alt: alt }))}
                    primaryTitle={currentProperty.primary_image_title || ''}
                    onPrimaryTitleChange={(title) => setCurrentProperty(prev => ({ ...prev, primary_image_title: title }))}
                    primaryCaption={currentProperty.primary_image_caption || ''}
                    onPrimaryCaptionChange={(cap) => setCurrentProperty(prev => ({ ...prev, primary_image_caption: cap }))}
                    fallbackAltText={getPropertyImageAlt(currentProperty)}
                    gallery={currentProperty.gallery || []}
                    onGalleryChange={(gal) => setCurrentProperty(prev => ({ ...prev, gallery: gal }))}
                    imageDetails={currentProperty.image_details || []}
                    onImageDetailsChange={(details) => setCurrentProperty(prev => ({ ...prev, image_details: details }))}
                    entityType="property"
                    entityName={currentProperty.title || 'Property'}
                  />
                </div>
              )}

              {/* TAB 4: SEO & URLS */}
              {propertyModalTab === 'seo' && (
                <div className="space-y-4">
                  {/* SEO Title */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        SEO Title (Page Title)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const auto = `${currentProperty.built_up_area || ''} ${currentProperty.area_unit || 'Sq Ft'} ${currentProperty.property_type || 'Office Space'} for ${currentProperty.listing_type || 'Rent'} in ${currentProperty.location_name || 'Noida'}`.trim();
                          setCurrentProperty({ ...currentProperty, seo_title: auto });
                        }}
                        className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Suggest SEO Title</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={currentProperty.seo_title || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, seo_title: e.target.value })}
                      placeholder={`e.g. ${currentProperty.built_up_area || 1200} Sq Ft Office Space for Rent in Sector 62 Noida`}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Recommended: 50–60 characters.</span>
                      <span className={(currentProperty.seo_title?.length || 0) > 60 ? 'text-amber-500 font-bold' : ''}>
                        {currentProperty.seo_title?.length || 0}/60
                      </span>
                    </div>
                  </div>

                  {/* SEO Description */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        SEO Meta Description
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const auto = `Explore a ${currentProperty.built_up_area || ''} ${currentProperty.area_unit || 'sq ft'} commercial ${currentProperty.property_type?.toLowerCase() || 'office space'} for ${currentProperty.listing_type?.toLowerCase() || 'rent'} in ${currentProperty.location_name || 'Noida'}. View property details, furnishing, rent and availability.`.trim();
                          setCurrentProperty({ ...currentProperty, seo_description: auto });
                        }}
                        className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Suggest Meta Description</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={currentProperty.seo_description || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, seo_description: e.target.value })}
                      placeholder="Explore commercial space available for rent/lease in Sector 62 Noida. View verified property specifications and rental tariffs."
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Recommended: 120–160 characters.</span>
                      <span className={(currentProperty.seo_description?.length || 0) > 160 ? 'text-amber-500 font-bold' : ''}>
                        {currentProperty.seo_description?.length || 0}/160
                      </span>
                    </div>
                  </div>

                  {/* SEO Keywords */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      SEO Keywords (Optional)
                    </label>
                    <input
                      type="text"
                      value={currentProperty.seo_keywords || ''}
                      onChange={(e) => setCurrentProperty({ ...currentProperty, seo_keywords: e.target.value })}
                      placeholder="e.g. office for rent sector 62, commercial space noida, furnished office ithum"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                    <p className="text-[11px] text-slate-400">
                      Separate keywords with commas. Do not keyword-stuff.
                    </p>
                  </div>

                  {/* URL Slug & Canonical URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          URL Slug *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const slug = (currentProperty.title || `prop-${Date.now()}`)
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/(^-|-$)/g, '');
                            setCurrentProperty({ ...currentProperty, slug });
                          }}
                          className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Generate from Title</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={currentProperty.slug || ''}
                        onChange={(e) => setCurrentProperty({ ...currentProperty, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        placeholder="e.g. 1200-sq-ft-office-space-sector-62-noida"
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                      />
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        Live Route: /property/{currentProperty.slug || 'url-slug'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Canonical URL
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentProperty({ ...currentProperty, canonical_url: getPropertyCanonicalUrl(currentProperty) });
                          }}
                          className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-2.5 h-2.5" />
                          <span>Set Default</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={currentProperty.canonical_url || ''}
                        onChange={(e) => setCurrentProperty({ ...currentProperty, canonical_url: e.target.value })}
                        placeholder={getPropertyCanonicalUrl(currentProperty)}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Leave blank to auto-use standard property canonical URL.
                      </span>
                    </div>
                  </div>

                  {/* Open Graph / Social Sharing */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-brand-500" />
                      <span>Social / Open Graph SEO (WhatsApp, LinkedIn, X, Facebook)</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">OG Title</label>
                        <input
                          type="text"
                          value={currentProperty.og_title || ''}
                          onChange={(e) => setCurrentProperty({ ...currentProperty, og_title: e.target.value })}
                          placeholder={currentProperty.seo_title || currentProperty.title || 'Social sharing title'}
                          className="glass-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold flex items-center gap-1">
                            <span>OG Image URL</span>
                            <span className="text-[10px] text-slate-400 font-normal">(WhatsApp / Social Preview)</span>
                          </label>
                          <div className="flex items-center gap-2">
                            {currentProperty.primary_image && (
                              <button
                                type="button"
                                onClick={() => setCurrentProperty({ ...currentProperty, og_image: currentProperty.primary_image })}
                                className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                              >
                                Use Primary
                              </button>
                            )}
                            {currentProperty.og_image && (
                              <button
                                type="button"
                                onClick={() => setCurrentProperty({ ...currentProperty, og_image: '' })}
                                className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentProperty.og_image || ''}
                            onChange={(e) => setCurrentProperty({ ...currentProperty, og_image: e.target.value })}
                            placeholder={currentProperty.primary_image || 'Primary Image URL fallback'}
                            className="glass-input flex-1 px-3 py-2 rounded-xl text-xs font-mono"
                          />
                          <label className="cursor-pointer px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 border border-slate-200 dark:border-slate-700">
                            {isUploadingPropertyOgImg ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UploadCloud className="w-3.5 h-3.5" />
                            )}
                            <span>{isUploadingPropertyOgImg ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePropertyOgImageUpload}
                              disabled={isUploadingPropertyOgImg}
                            />
                          </label>
                        </div>

                        {/* Preview thumbnail */}
                        <div className="mt-2 flex items-center gap-2">
                          {currentProperty.og_image ? (
                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-1.5 rounded-lg w-full">
                              <img
                                src={currentProperty.og_image}
                                alt="OG Preview"
                                className="w-10 h-10 object-cover rounded border border-emerald-300 dark:border-emerald-700 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
                                  Custom OG Image Active
                                </p>
                                <p className="text-[9px] text-slate-500 truncate font-mono">
                                  {currentProperty.og_image.startsWith('data:') ? 'Custom Uploaded Image (Base64)' : currentProperty.og_image}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCurrentProperty({ ...currentProperty, og_image: '' })}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                title="Remove OG image (fall back to Primary Image)"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : currentProperty.primary_image ? (
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-1.5 rounded-lg w-full">
                              <img
                                src={currentProperty.primary_image}
                                alt="Fallback Primary"
                                className="w-10 h-10 object-cover rounded border border-slate-300 dark:border-slate-600 opacity-70 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                  Using Primary Image as OG fallback
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">OG Description</label>
                      <input
                        type="text"
                        value={currentProperty.og_description || ''}
                        onChange={(e) => setCurrentProperty({ ...currentProperty, og_description: e.target.value })}
                        placeholder={currentProperty.seo_description || currentProperty.short_description || 'Social sharing summary'}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: HYPERLINK WORDS */}
              {propertyModalTab === 'hyperlinks' && (
                <div className="p-1">
                  <AdminHyperlinksManager
                    hyperlinks={currentProperty.hyperlinks || []}
                    onChange={(updated) => setCurrentProperty(prev => ({ ...prev, hyperlinks: updated }))}
                    entityName={currentProperty.title || 'Property'}
                  />
                </div>
              )}

              {/* TAB 6: SEO PREVIEW & COMPLETENESS */}
              {propertyModalTab === 'preview' && (
                <div className="p-1">
                  <AdminSeoPreviewSection
                    title={currentProperty.title || ''}
                    seoTitle={currentProperty.seo_title}
                    description={currentProperty.short_description || currentProperty.overview || currentProperty.description || ''}
                    seoDescription={currentProperty.seo_description}
                    slug={currentProperty.slug || ''}
                    urlPrefix="https://shristiestate.in/property/"
                    featuredImage={currentProperty.primary_image}
                    ogImage={currentProperty.og_image}
                    ogTitle={currentProperty.og_title}
                    ogDescription={currentProperty.og_description}
                    type="property"
                    entity={currentProperty}
                  />
                </div>
              )}

              {/* FORM FOOTER & SUBMIT */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPropertyModal(false)}
                    className="px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-center"
                  >
                    Cancel
                  </button>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    Tab: <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{propertyModalTab}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-600 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-brand-500/25 active:scale-95 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Syncing to Supabase...</span>
                      </>
                    ) : isEditingProperty ? (
                      <>
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Update Property & SEO</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save & Publish Listing</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUILDING ADD / EDIT MODAL */}
      {showBuildingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex min-h-full items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl my-auto max-h-[96vh] sm:max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setShowBuildingModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 sm:bg-transparent z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-3 shrink-0 pr-8">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {isEditingBuilding ? 'Edit Commercial Tower & Building SEO' : 'New Commercial Building / Tower'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit']">
                {isEditingBuilding ? `Edit: ${currentBuilding.name}` : 'Add Commercial Building'}
              </h2>
            </div>

            {isEditingBuilding && currentBuilding.id && (
              <div className="p-3 mb-3 rounded-2xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex items-center justify-between gap-3 shrink-0">
                <div>
                  <span className="text-xs font-bold text-brand-900 dark:text-brand-200 block">Available Property Units</span>
                  <span className="text-[11px] text-brand-700 dark:text-brand-400">Edit individual monthly rents, rate/sq.ft, furnishings, and statuses for this building</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const fullBuilding = buildings.find(b => b.id === currentBuilding.id) || (currentBuilding as Building);
                    setManagingBuildingProps(fullBuilding);
                    setShowManagePropsModal(true);
                  }}
                  className="btn-glass-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Edit Available Units</span>
                </button>
              </div>
            )}

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 border-b border-slate-200 dark:border-slate-800 no-scrollbar shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setBuildingModalTab('specs')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  buildingModalTab === 'specs'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>1. Basic & Specs</span>
              </button>
              <button
                type="button"
                onClick={() => setBuildingModalTab('content')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  buildingModalTab === 'content'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>2. Content & Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setBuildingModalTab('images')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  buildingModalTab === 'images'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>3. Images & Alt Text ({(currentBuilding.gallery?.length || 0) + (currentBuilding.hero_image ? 1 : 0)})</span>
              </button>
              <button
                type="button"
                onClick={() => setBuildingModalTab('seo')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  buildingModalTab === 'seo'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>4. SEO & URLs</span>
              </button>
              <button
                type="button"
                onClick={() => setBuildingModalTab('hyperlinks')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  buildingModalTab === 'hyperlinks'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>5. Hyperlink Words ({currentBuilding.hyperlinks?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setBuildingModalTab('preview')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  buildingModalTab === 'preview'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>6. SEO Preview</span>
              </button>
            </div>

            <form onSubmit={handleSaveBuilding} className="space-y-4 overflow-y-auto pr-1 flex-1 -mr-1">
              {/* TAB 1: BASIC INFORMATION & SPECS */}
              {buildingModalTab === 'specs' && (
                <div className="space-y-4">
                  {/* Building Name & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Tower / Building Name *</label>
                      <input
                        type="text"
                        required
                        value={currentBuilding.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                          setCurrentBuilding({ 
                            ...currentBuilding, 
                            name: val,
                            tower_name: val,
                            slug: currentBuilding.slug || autoSlug 
                          });
                        }}
                        placeholder="e.g. I-Thum Tower D, Candor TechSpace Tower 5"
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
                            sector: loc ? loc.name : currentBuilding.sector,
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

                  {/* Complex Name, Block Name & Tower Letter */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Complex / Building Name</label>
                      <input
                        type="text"
                        value={currentBuilding.building_name || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, building_name: e.target.value })}
                        placeholder="e.g. IThums 62, Candor TechSpace"
                        className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Block / Wing Name</label>
                      <input
                        type="text"
                        value={currentBuilding.block_name || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, block_name: e.target.value })}
                        placeholder="e.g. Block A, Phase 2"
                        className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Tower Number / Letter</label>
                      <input
                        type="text"
                        value={currentBuilding.tower_number || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, tower_number: e.target.value })}
                        placeholder="e.g. Tower D, Wing 2"
                        className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Status & Google Maps Direction */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Development / Occupancy Status</label>
                      <select
                        value={currentBuilding.status || 'Active'}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, status: e.target.value })}
                        className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold"
                      >
                        <option value="Active">Active / Operational</option>
                        <option value="Ready to Move">Ready to Move</option>
                        <option value="Under Construction">Under Construction</option>
                        <option value="Fully Leased">Fully Leased</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Google Maps Direction URL</label>
                      <input
                        type="text"
                        value={currentBuilding.gmaps_direction || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, gmaps_direction: e.target.value })}
                        placeholder="e.g. https://maps.google.com/?q=..."
                        className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                      />
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
                                  return;
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

                  {/* TARIFF / RENT RANGE & SALE RANGE */}
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

                  {/* TOTAL FLOORS (STRUCTURE) - MULTI BASEMENT & GROUND OPTION */}
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
                        Structure: {currentBuilding.structure_display || getBuildingStructureDisplay(currentBuilding)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                          Multi Basement Level
                        </label>
                        <select
                          value={currentBuilding.basement_floors || '2 Basements (2B)'}
                          onChange={(e) => {
                            const newBasement = e.target.value;
                            const newDisplay = computeStructureDisplay(newBasement, currentBuilding.ground_option, currentBuilding.total_floors || 14);
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

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                          Ground Level Option
                        </label>
                        <select
                          value={currentBuilding.ground_option || 'Ground (G)'}
                          onChange={(e) => {
                            const newGround = e.target.value;
                            const newDisplay = computeStructureDisplay(currentBuilding.basement_floors, newGround, currentBuilding.total_floors || 14);
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
                            const newDisplay = computeStructureDisplay(currentBuilding.basement_floors, currentBuilding.ground_option, num);
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

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Display Structure Spec (Customizable / Auto-generated)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const regenerated = computeStructureDisplay(currentBuilding.basement_floors, currentBuilding.ground_option, currentBuilding.total_floors || 14);
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

                  {/* MULTI TOWERS & BLOCKS */}
                  <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div>
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-brand-500" />
                          <span>Towers & Blocks in Complex (Multi-Tower Option)</span>
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Specify standalone tower or multiple towers/blocks (e.g. Twin Towers, Tower A/B/C, IT Blocks).
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
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

                  {/* MULTI CATEGORY OPTION & AVAILABLE SIZES */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                                    return;
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
                        value={currentBuilding.power_backup || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, power_backup: e.target.value })}
                        placeholder="e.g. 100% DG backup"
                        className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Lifts / Elevators</label>
                      <input
                        type="text"
                        value={currentBuilding.lifts || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, lifts: e.target.value })}
                        placeholder="e.g. 12 high-speed passenger lifts"
                        className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Parking & Air Conditioning */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Parking Amenities</label>
                      <input
                        type="text"
                        value={currentBuilding.parking || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, parking: e.target.value })}
                        placeholder="e.g. Multi-level covered parking, reserved bays"
                        className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Air Conditioning (HVAC)</label>
                      <input
                        type="text"
                        value={currentBuilding.air_conditioning || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, air_conditioning: e.target.value })}
                        placeholder="e.g. Central Chilled Water HVAC system with AHU on every floor"
                        className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Security & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Security & Access Control</label>
                      <input
                        type="text"
                        value={currentBuilding.security || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, security: e.target.value })}
                        placeholder="e.g. 24/7 CCTV surveillance, RFID boom barriers, turnstile access"
                        className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Complete Address / Plot *</label>
                      <input
                        type="text"
                        value={currentBuilding.address || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, address: e.target.value })}
                        placeholder="e.g. Plot A-40, Sector 62, Noida"
                        className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTENT & OVERVIEW */}
              {buildingModalTab === 'content' && (
                <div className="space-y-4">
                  {/* Short Description */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tower Short Description
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Used for cards, previews, and snippet summaries across the public website.
                    </p>
                    <textarea
                      rows={2}
                      value={currentBuilding.short_description || ''}
                      onChange={(e) => setCurrentBuilding({ ...currentBuilding, short_description: e.target.value })}
                      placeholder="e.g. Grade-A commercial IT park offering customizable office spaces, 100% DG backup, and seamless metro connectivity in Sector 62 Noida..."
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>

                  {/* Tower Overview */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tower Overview & Commercial Features *
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Complete overview of commercial amenities, tenant profile, and building specifications. Configured Hyperlink Words will automatically link inside this text.
                    </p>
                    <textarea
                      rows={7}
                      value={currentBuilding.overview || currentBuilding.description || ''}
                      onChange={(e) => setCurrentBuilding({ ...currentBuilding, overview: e.target.value, description: e.target.value })}
                      onPaste={(e) => handleOverviewPaste(e, (val) => setCurrentBuilding({ ...currentBuilding, overview: val, description: val }), currentBuilding.overview || currentBuilding.description || '')}
                      placeholder="Comprehensive overview of commercial amenities, corporate tenant profile, architecture, and building advantages..."
                      className="glass-input overview-input w-full px-3 py-2.5 rounded-xl text-sm"
                    />
                  </div>

                  {/* Location & Connectivity */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Location & Connectivity
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Connectivity to metro stations, expressways, airports, and major commercial hubs.
                    </p>
                    <textarea
                      rows={4}
                      value={currentBuilding.location_connectivity || ''}
                      onChange={(e) => setCurrentBuilding({ ...currentBuilding, location_connectivity: e.target.value })}
                      onPaste={(e) => handleOverviewPaste(e, (val) => setCurrentBuilding({ ...currentBuilding, location_connectivity: val }), currentBuilding.location_connectivity || '')}
                      placeholder="e.g. 500 meters from Sector 62 Electronic City Metro Station, direct access to NH-24 / Delhi-Meerut Expressway, 30 mins from Noida International Airport..."
                      className="glass-input overview-input w-full px-3 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: IMAGES & ALT TEXT */}
              {buildingModalTab === 'images' && (
                <div className="p-1">
                  <AdminMediaManager
                    primaryImage={currentBuilding.hero_image || ''}
                    onPrimaryImageChange={(url) => setCurrentBuilding(prev => ({ 
                      ...prev, 
                      hero_image: url,
                      og_image: prev.og_image || ''
                    }))}
                    primaryAlt={currentBuilding.hero_image_alt || ''}
                    onPrimaryAltChange={(alt) => setCurrentBuilding(prev => ({ ...prev, hero_image_alt: alt }))}
                    primaryTitle={currentBuilding.hero_image_title || ''}
                    onPrimaryTitleChange={(title) => setCurrentBuilding(prev => ({ ...prev, hero_image_title: title }))}
                    primaryCaption={currentBuilding.hero_image_caption || ''}
                    onPrimaryCaptionChange={(cap) => setCurrentBuilding(prev => ({ ...prev, hero_image_caption: cap }))}
                    fallbackAltText={getTowerImageAlt(currentBuilding)}
                    gallery={currentBuilding.gallery || []}
                    onGalleryChange={(gal) => setCurrentBuilding(prev => ({ ...prev, gallery: gal }))}
                    imageDetails={currentBuilding.image_details || []}
                    onImageDetailsChange={(details) => setCurrentBuilding(prev => ({ ...prev, image_details: details }))}
                    entityType="tower"
                    entityName={currentBuilding.name || 'Commercial Tower'}
                  />
                </div>
              )}

              {/* TAB 4: SEO & URLS */}
              {buildingModalTab === 'seo' && (
                <div className="space-y-4">
                  {/* SEO Title */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Tower SEO Meta Title
                      </label>
                      <span className={`text-[11px] font-mono ${
                        (currentBuilding.seo_title?.length || 0) > 60 ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        {currentBuilding.seo_title?.length || 0} / 60 chars
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Appears in Google search results and browser tabs. If left blank, a high-converting title is automatically generated from tower name and sector.
                    </p>
                    <input
                      type="text"
                      value={currentBuilding.seo_title || ''}
                      onChange={(e) => setCurrentBuilding({ ...currentBuilding, seo_title: e.target.value })}
                      placeholder={`e.g. ${currentBuilding.name || 'Commercial Tower'} Office Space in ${currentBuilding.location_name || 'Sector 62 Noida'}`}
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                    />
                  </div>

                  {/* SEO Description */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Tower SEO Meta Description
                      </label>
                      <span className={`text-[11px] font-mono ${
                        (currentBuilding.seo_description?.length || 0) > 160 ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        {currentBuilding.seo_description?.length || 0} / 160 chars
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Engaging search summary to increase Google CTR.
                    </p>
                    <textarea
                      rows={3}
                      value={currentBuilding.seo_description || ''}
                      onChange={(e) => setCurrentBuilding({ ...currentBuilding, seo_description: e.target.value })}
                      placeholder={`e.g. Explore office space and commercial properties available in ${currentBuilding.name || 'Commercial Tower'}, ${currentBuilding.location_name || 'Sector 62, Noida'}. View available sizes, rental options and property details.`}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>

                  {/* SEO Keywords & URL Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        SEO Keywords (Optional)
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Comma-separated target phrases (no keyword stuffing).
                      </p>
                      <input
                        type="text"
                        value={currentBuilding.seo_keywords || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, seo_keywords: e.target.value })}
                        placeholder="e.g. office space for rent, commercial building, sector 62 noida"
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                          URL Slug *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const generated = (currentBuilding.name || 'tower')
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/(^-|-$)/g, '');
                            setCurrentBuilding({ ...currentBuilding, slug: generated });
                          }}
                          className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Generate from Name</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Clean URL: /buildings/{currentBuilding.slug || 'slug'} (also aliases /tower/{currentBuilding.slug || 'slug'})
                      </p>
                      <input
                        type="text"
                        required
                        value={currentBuilding.slug || ''}
                        onChange={(e) => setCurrentBuilding({ 
                          ...currentBuilding, 
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                        })}
                        placeholder="e.g. ithums-62-tower-d-sector-62-noida"
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Canonical URL */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Canonical URL
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const canonical = getTowerCanonicalUrl(currentBuilding);
                          setCurrentBuilding({ ...currentBuilding, canonical_url: canonical });
                        }}
                        className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Fill Default</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Prevents duplicate content issues. Default: {getTowerCanonicalUrl(currentBuilding)}
                    </p>
                    <input
                      type="text"
                      value={currentBuilding.canonical_url || ''}
                      onChange={(e) => setCurrentBuilding({ ...currentBuilding, canonical_url: e.target.value })}
                      placeholder={getTowerCanonicalUrl(currentBuilding)}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                    />
                  </div>

                  {/* Open Graph / Social Sharing */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-brand-500" />
                      <span>Social Media & Open Graph Settings (WhatsApp, Facebook, LinkedIn, X)</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">OG Title</label>
                        <input
                          type="text"
                          value={currentBuilding.og_title || ''}
                          onChange={(e) => setCurrentBuilding({ ...currentBuilding, og_title: e.target.value })}
                          placeholder={currentBuilding.seo_title || currentBuilding.name}
                          className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold flex items-center gap-1">
                            <span>OG Image URL</span>
                            <span className="text-[10px] text-slate-400 font-normal">(WhatsApp / Social Preview)</span>
                          </label>
                          <div className="flex items-center gap-2">
                            {currentBuilding.hero_image && (
                              <button
                                type="button"
                                onClick={() => setCurrentBuilding({ ...currentBuilding, og_image: currentBuilding.hero_image })}
                                className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                              >
                                Use Featured
                              </button>
                            )}
                            {currentBuilding.og_image && (
                              <button
                                type="button"
                                onClick={() => setCurrentBuilding({ ...currentBuilding, og_image: '' })}
                                className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentBuilding.og_image || ''}
                            onChange={(e) => setCurrentBuilding({ ...currentBuilding, og_image: e.target.value })}
                            placeholder={currentBuilding.hero_image || 'Featured Image URL fallback'}
                            className="glass-input flex-1 px-3 py-2 rounded-xl text-xs font-mono"
                          />
                          <label className="cursor-pointer px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 border border-slate-200 dark:border-slate-700">
                            {isUploadingBuildingOgImg ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UploadCloud className="w-3.5 h-3.5" />
                            )}
                            <span>{isUploadingBuildingOgImg ? 'Uploading...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleBuildingOgImageUpload}
                              disabled={isUploadingBuildingOgImg}
                            />
                          </label>
                        </div>

                        {/* Preview thumbnail */}
                        <div className="mt-2 flex items-center gap-2">
                          {currentBuilding.og_image ? (
                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-1.5 rounded-lg w-full">
                              <img
                                src={currentBuilding.og_image}
                                alt="OG Preview"
                                className="w-10 h-10 object-cover rounded border border-emerald-300 dark:border-emerald-700 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
                                  Custom OG Image Active
                                </p>
                                <p className="text-[9px] text-slate-500 truncate font-mono">
                                  {currentBuilding.og_image.startsWith('data:') ? 'Custom Uploaded Image (Base64)' : currentBuilding.og_image}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCurrentBuilding({ ...currentBuilding, og_image: '' })}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                title="Remove OG image (fall back to Featured Image)"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : currentBuilding.hero_image ? (
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-1.5 rounded-lg w-full">
                              <img
                                src={currentBuilding.hero_image}
                                alt="Fallback Featured"
                                className="w-10 h-10 object-cover rounded border border-slate-300 dark:border-slate-600 opacity-70 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                  Using Featured Image as OG fallback
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">OG Description</label>
                      <textarea
                        rows={2}
                        value={currentBuilding.og_description || ''}
                        onChange={(e) => setCurrentBuilding({ ...currentBuilding, og_description: e.target.value })}
                        placeholder={currentBuilding.seo_description || 'Social preview excerpt...'}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: HYPERLINK WORDS */}
              {buildingModalTab === 'hyperlinks' && (
                <div className="p-1">
                  <AdminHyperlinksManager
                    hyperlinks={currentBuilding.hyperlinks || []}
                    onChange={(newLinks) => setCurrentBuilding(prev => ({ ...prev, hyperlinks: newLinks }))}
                    entityName={currentBuilding.name || 'Commercial Tower'}
                  />
                </div>
              )}

              {/* TAB 6: SEO PREVIEW */}
              {buildingModalTab === 'preview' && (
                <div className="p-1">
                  <AdminSeoPreviewSection
                    title={currentBuilding.name || ''}
                    seoTitle={currentBuilding.seo_title}
                    description={currentBuilding.short_description || currentBuilding.overview || currentBuilding.description || ''}
                    seoDescription={currentBuilding.seo_description}
                    slug={currentBuilding.slug || ''}
                    urlPrefix="https://shristiestate.in/buildings/"
                    featuredImage={currentBuilding.hero_image}
                    ogImage={currentBuilding.og_image}
                    ogTitle={currentBuilding.og_title}
                    ogDescription={currentBuilding.og_description}
                    type="building"
                    entity={currentBuilding}
                  />
                </div>
              )}

              {/* ACTION BUTTONS */}
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
                      <span>Update Tower SEO & Specs</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Commercial Tower</span>
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

      {/* Edit Building Available Properties Modal */}
      {managingBuildingProps && (
        <EditBuildingPropertiesModal
          isOpen={showManagePropsModal}
          building={managingBuildingProps}
          onClose={() => {
            setShowManagePropsModal(false);
            setManagingBuildingProps(null);
          }}
          onPropertiesUpdated={() => {
            StorageService.getBuildings().then(setBuildings);
            StorageService.getProperties().then(setProperties);
          }}
        />
      )}

      {/* MARKET GUIDE ADD / EDIT MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex min-h-full items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl my-auto max-h-[96vh] sm:max-h-[90vh] flex flex-col">
            <button 
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 sm:bg-transparent z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header & Mode Switcher */}
            <div className="mb-4 shrink-0 pr-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {isEditingGuide ? 'Edit Market Guide & Insight' : 'New Market Guide & Insight'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-['Outfit']">
                  {isEditingGuide ? `Edit: ${currentGuide.title || 'Untitled Article'}` : 'Add Market Research & Advisory Guide'}
                </h2>
              </div>

              {/* View Switcher: Editor Form vs Live Preview */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setGuideModalTab('edit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    guideModalTab === 'edit'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  📝 Editor Form
                </button>
                <button
                  type="button"
                  onClick={() => setGuideModalTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    guideModalTab === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-brand-500" />
                  <span>Live Preview</span>
                  {currentGuide.hyperlinks && currentGuide.hyperlinks.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-brand-600 text-white text-[10px]">
                      {currentGuide.hyperlinks.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* TAB 1: FORM EDITOR */}
            {guideModalTab === 'edit' && (
              <form onSubmit={handleSaveGuide} className="space-y-5 overflow-y-auto pr-2 flex-1 -mr-1">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold mb-1">Guide / Article Title *</label>
                  <input
                    type="text"
                    required
                    value={currentGuide.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      const autoSlug = !isEditingGuide ? generateBlogSlug(title) : currentGuide.slug;
                      setCurrentGuide(prev => ({ ...prev, title, slug: autoSlug }));
                    }}
                    placeholder="e.g. Commercial Office Space in Sector 62, Noida: Complete Corporate Guide"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                {/* Slug & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={currentGuide.slug || ''}
                      onChange={(e) => setCurrentGuide(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g. commercial-office-space-sector-62-noida"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      URL path: /blog/{currentGuide.slug || 'slug-name'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Category *</label>
                    <input
                      type="text"
                      required
                      list="guide-category-suggestions"
                      value={currentGuide.category || ''}
                      onChange={(e) => setCurrentGuide(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g. Office Market, Warehousing & 3PL, Market Trends..."
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                    <datalist id="guide-category-suggestions">
                      <option value="Office Market" />
                      <option value="Warehousing & 3PL" />
                      <option value="Market Trends" />
                      <option value="Lease Advisory" />
                      <option value="Factory & Industrial" />
                      <option value="Commercial Land" />
                      <option value="Retail & Showrooms" />
                    </datalist>
                  </div>
                </div>

                {/* Date, Read Time & Author */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Publication Date *</label>
                    <input
                      type="text"
                      required
                      value={currentGuide.date || ''}
                      onChange={(e) => setCurrentGuide(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="e.g. March 2026"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Read Time *</label>
                    <input
                      type="text"
                      required
                      value={currentGuide.readTime || ''}
                      onChange={(e) => setCurrentGuide(prev => ({ ...prev, readTime: e.target.value }))}
                      placeholder="e.g. 6 min read"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Author / Desk</label>
                    <input
                      type="text"
                      value={currentGuide.author || ''}
                      onChange={(e) => setCurrentGuide(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="e.g. Shristi Estate Advisory Desk"
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* FEATURED IMAGE CONTROLS */}
                <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Featured Image
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {currentGuide.featured_image_url || currentGuide.image
                        ? 'Custom image uploaded'
                        : 'No image uploaded (default placeholder will display)'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Visual Preview */}
                    <div className="relative aspect-[16/10] w-full sm:w-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm">
                      <img
                        src={getBlogFeaturedImage(currentGuide)}
                        alt={getBlogImageAlt(currentGuide)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          currentGuide.featured_image_url || currentGuide.image 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {currentGuide.featured_image_url || currentGuide.image ? 'Custom' : 'Default'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-1 w-full space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="btn-glass-primary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                          <UploadCloud className="w-4 h-4" />
                          <span>{isUploadingGuideImage ? 'Uploading to Storage...' : (currentGuide.featured_image_url || currentGuide.image ? 'Replace Image' : 'Upload Featured Image')}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingGuideImage}
                            onChange={handleGuideImageUpload}
                            className="hidden"
                          />
                        </label>

                        {(currentGuide.featured_image_url || currentGuide.image) && (
                          <button
                            type="button"
                            onClick={handleRemoveGuideImage}
                            className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Image</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <input
                          type="text"
                          value={currentGuide.featured_image_url || currentGuide.image || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentGuide(prev => ({ ...prev, image: val, featured_image_url: val }));
                          }}
                          placeholder="Or paste direct image URL (https://...)"
                          className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
                        />
                        <p className="text-[10px] text-slate-400">
                          Uploads are securely saved in Supabase storage (`blog-images`) with automatic compression.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Image Alt Text & Caption */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={currentGuide.featured_image_alt || ''}
                        onChange={(e) => setCurrentGuide(prev => ({ ...prev, featured_image_alt: e.target.value }))}
                        placeholder={getBlogImageAlt(currentGuide)}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        If left blank, title-based fallback: "{getBlogImageAlt(currentGuide)}" is used.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Image Caption (Optional)
                      </label>
                      <input
                        type="text"
                        value={currentGuide.featured_image_caption || ''}
                        onChange={(e) => setCurrentGuide(prev => ({ ...prev, featured_image_caption: e.target.value }))}
                        placeholder="e.g. Grade-A Tech Space at Sector 62, Noida"
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Displayed directly below the featured image on the public article page.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-semibold mb-1">Excerpt / Summary *</label>
                  <textarea
                    rows={2}
                    required
                    value={currentGuide.excerpt || ''}
                    onChange={(e) => setCurrentGuide(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Short summary displayed on blog cards and search engines (2-3 sentences)..."
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>

                {/* SEO METADATA */}
                <div className="glass-card p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      SEO Metadata
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Defaults automatically to Title and Excerpt
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Custom SEO Title</label>
                      <input
                        type="text"
                        value={currentGuide.seo_title || ''}
                        onChange={(e) => setCurrentGuide(prev => ({ ...prev, seo_title: e.target.value }))}
                        placeholder={currentGuide.title || 'Custom meta title...'}
                        className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Custom Meta Description</label>
                      <input
                        type="text"
                        value={currentGuide.seo_description || ''}
                        onChange={(e) => setCurrentGuide(prev => ({ ...prev, seo_description: e.target.value }))}
                        placeholder={currentGuide.excerpt || 'Custom meta description...'}
                        className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* FULL ARTICLE CONTENT WITH QUICK LINK TOOLBAR */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold">Full Article / Advisory Content</label>
                    <button
                      type="button"
                      onClick={handleOpenAddHyperlink}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>🔗 Add Hyperlink Word</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={currentGuide.content || ''}
                    onChange={(e) => setCurrentGuide(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter comprehensive article paragraphs, research data, lease guidelines, or regulatory details..."
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>Supports plain text with paragraphs or standard HTML tags</span>
                    <span>Words: {(currentGuide.content || '').split(/\s+/).filter(Boolean).length}</span>
                  </div>
                </div>

                {/* HYPERLINK WORDS SECTION */}
                <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-brand-50/20 dark:bg-brand-950/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Hyperlink Words & Text Link Manager
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white">
                          {(currentGuide.hyperlinks || []).length} configured
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Automatically creates clickable links on matching words/phrases inside the public article.
                      </p>
                    </div>

                    {!showHyperlinkForm && (
                      <button
                        type="button"
                        onClick={handleOpenAddHyperlink}
                        className="btn-glass-primary px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Hyperlink</span>
                      </button>
                    )}
                  </div>

                  {/* INLINE HYPERLINK ADD/EDIT FORM */}
                  {showHyperlinkForm && (
                    <div className="p-4 rounded-xl border border-brand-300 dark:border-brand-800 bg-white dark:bg-[#070C1E] shadow-lg space-y-3 mt-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                          {editingHyperlinkIndex !== null ? 'Edit Hyperlink Entry' : 'New Hyperlink Entry'}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setShowHyperlinkForm(false); setEditingHyperlinkIndex(null); }}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Word / Phrase */}
                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Words / Phrase to Link *</label>
                          <input
                            type="text"
                            required
                            value={hyperlinkInput.text}
                            onChange={(e) => setHyperlinkInput(prev => ({ ...prev, text: e.target.value }))}
                            placeholder="e.g. Office Space in Noida"
                            className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
                          />
                        </div>

                        {/* Link Type */}
                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Link Type *</label>
                          <select
                            value={hyperlinkInput.type}
                            onChange={(e) => {
                              const t = e.target.value as HyperlinkConfig['type'];
                              setHyperlinkInput(prev => ({
                                ...prev,
                                type: t,
                                open_in_new_tab: t === 'external'
                              }));
                            }}
                            className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
                          >
                            <option value="internal">Internal Link (shristiestate.in)</option>
                            <option value="external">External Link (https://...)</option>
                            <option value="email">Email (mailto:...)</option>
                            <option value="phone">Phone (tel:...)</option>
                          </select>
                        </div>
                      </div>

                      {/* Internal Preset Selector or Direct URL */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {hyperlinkInput.type === 'internal' && (
                          <div>
                            <label className="block text-[11px] font-semibold mb-1">Select Internal Page</label>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  setHyperlinkInput(prev => ({ ...prev, url: e.target.value }));
                                }
                              }}
                              className="glass-input w-full px-3 py-1.5 rounded-xl text-xs text-slate-700 dark:text-slate-200"
                              defaultValue=""
                            >
                              <option value="" disabled>-- Pick Internal Route --</option>
                              {['Main', 'Workflows', 'Categories', 'Locations', 'Inventory'].map(grp => (
                                <optgroup key={grp} label={grp}>
                                  {INTERNAL_PAGE_PRESETS.filter(p => p.group === grp).map(p => (
                                    <option key={p.url} value={p.url}>
                                      {p.label} ({p.url})
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className={hyperlinkInput.type === 'internal' ? '' : 'sm:col-span-2'}>
                          <label className="block text-[11px] font-semibold mb-1">Link URL *</label>
                          <input
                            type="text"
                            required
                            value={hyperlinkInput.url}
                            onChange={(e) => setHyperlinkInput(prev => ({ ...prev, url: e.target.value }))}
                            placeholder={
                              hyperlinkInput.type === 'internal'
                                ? '/commercial-real-estate or /properties'
                                : hyperlinkInput.type === 'external'
                                ? 'https://example.com'
                                : hyperlinkInput.type === 'email'
                                ? 'info@shristiestate.in'
                                : '+918750098666'
                            }
                            className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      {/* Settings: Open in new tab, title, occurrences */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Optional Link Title (Tooltip)</label>
                          <input
                            type="text"
                            value={hyperlinkInput.title || ''}
                            onChange={(e) => setHyperlinkInput(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. Commercial Office Space in Noida"
                            className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold mb-1">Match Occurrence</label>
                          <select
                            value={hyperlinkInput.match_mode || 'first'}
                            onChange={(e) => setHyperlinkInput(prev => ({ ...prev, match_mode: e.target.value as 'first' | 'all' }))}
                            className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
                          >
                            <option value="first">First occurrence only (Recommended)</option>
                            <option value="all">All occurrences</option>
                          </select>
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hyperlinkInput.open_in_new_tab}
                              onChange={(e) => setHyperlinkInput(prev => ({ ...prev, open_in_new_tab: e.target.checked }))}
                              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                            />
                            <span>Open in New Tab</span>
                          </label>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => { setShowHyperlinkForm(false); setEditingHyperlinkIndex(null); }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveHyperlink}
                          className="btn-glass-primary px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                        >
                          {editingHyperlinkIndex !== null ? 'Update Hyperlink' : 'Save Hyperlink'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HYPERLINKS TABLE / LIST */}
                  <div className="space-y-2">
                    {(!currentGuide.hyperlinks || currentGuide.hyperlinks.length === 0) ? (
                      <p className="text-xs text-slate-400 py-2 italic text-center">
                        No hyperlinks configured yet. Click "+ Add Hyperlink" to convert keywords like "Office Space in Noida" into clickable links automatically.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="px-3 py-2">Words / Phrase</th>
                              <th className="px-3 py-2">Destination URL</th>
                              <th className="px-3 py-2">Type</th>
                              <th className="px-3 py-2">Mode</th>
                              <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/60 dark:bg-[#070C1E]/60">
                            {currentGuide.hyperlinks.map((hl, idx) => (
                              <tr key={hl.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="px-3 py-2 font-bold text-brand-600 dark:text-brand-400">
                                  {hl.text}
                                </td>
                                <td className="px-3 py-2 font-mono text-[11px] text-slate-600 dark:text-slate-300 max-w-[180px] truncate" title={hl.url}>
                                  {hl.url}
                                </td>
                                <td className="px-3 py-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {hl.type}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-[11px] text-slate-400">
                                  {hl.match_mode === 'all' ? 'All' : '1st only'}
                                  {hl.open_in_new_tab ? ' (New tab)' : ''}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditHyperlink(idx)}
                                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                      title="Edit Hyperlink"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteHyperlink(idx)}
                                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                                      title="Delete Hyperlink"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Toggles: Published & Featured */}
                <div className="flex items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentGuide.published ?? true}
                      onChange={(e) => setCurrentGuide(prev => ({ ...prev, published: e.target.checked }))}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span>Publish Live on Website</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentGuide.featured ?? false}
                      onChange={(e) => setCurrentGuide(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span>Mark as Featured Article</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowGuideModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploadingGuideImage}
                    className="btn-glass-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : isEditingGuide ? 'Update Guide' : 'Save Guide'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: LIVE ADMIN PREVIEW */}
            {guideModalTab === 'preview' && (
              <div className="space-y-4 overflow-y-auto pr-2 flex-1 -mr-1">
                {/* Subtab Switcher */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuidePreviewSubTab('card')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        guidePreviewSubTab === 'card'
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      🎴 Public Blog Card Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuidePreviewSubTab('article')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        guidePreviewSubTab === 'article'
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      📄 Full Article & Hyperlinks Preview
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Preview reflects real-time edits
                  </span>
                </div>

                {/* Subtab 2A: Public Blog Card View */}
                {guidePreviewSubTab === 'card' && (
                  <div className="p-6 bg-slate-100 dark:bg-slate-950/80 rounded-2xl flex items-center justify-center">
                    <div className="w-full max-w-sm glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 flex flex-col justify-between shadow-xl">
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={getBlogFeaturedImage(currentGuide)}
                          alt={getBlogImageAlt(currentGuide)}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-600 text-white shadow-md">
                            {currentGuide.category || 'Office Market'}
                          </span>
                        </div>
                        {currentGuide.featured && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white shadow-sm">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{currentGuide.date || 'March 2026'}</span>
                            <span>•</span>
                            <span>{currentGuide.readTime || '5 min read'}</span>
                          </div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Outfit'] leading-snug">
                            {currentGuide.title || 'Untitled Commercial Guide'}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                            {currentGuide.excerpt || 'Article summary will appear here on public blog cards...'}
                          </p>
                          {currentGuide.author && (
                            <span className="text-[10px] text-slate-400 font-medium block">
                              By {currentGuide.author}
                            </span>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                            <span>Read More</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[10px] text-slate-400">
                            /blog/{currentGuide.slug || 'slug'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtab 2B: Full Article Preview with Hyperlinks Rendered */}
                {guidePreviewSubTab === 'article' && (
                  <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/70 rounded-2xl space-y-6 border border-slate-200 dark:border-slate-800">
                    <div className="space-y-3">
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-600 text-white">
                        {currentGuide.category || 'Office Market'}
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                        {currentGuide.title || 'Untitled Article'}
                      </h1>
                      <div className="flex items-center gap-3 text-xs text-slate-500 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span>{currentGuide.date || 'March 2026'}</span>
                        <span>•</span>
                        <span>{currentGuide.readTime || '5 min read'}</span>
                        {currentGuide.author && (
                          <>
                            <span>•</span>
                            <span>By {currentGuide.author}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Featured Image & Caption */}
                    <div className="space-y-2">
                      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                        <img
                          src={getBlogFeaturedImage(currentGuide)}
                          alt={getBlogImageAlt(currentGuide)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {currentGuide.featured_image_caption && (
                        <p className="text-xs text-slate-500 italic px-2">
                          📸 {currentGuide.featured_image_caption}
                        </p>
                      )}
                    </div>

                    {/* Excerpt callout */}
                    {currentGuide.excerpt && (
                      <div className="p-4 rounded-xl border-l-4 border-l-brand-600 bg-brand-50/50 dark:bg-brand-950/30 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        {currentGuide.excerpt}
                      </div>
                    )}

                    {/* Rendered Content with Live Hyperlinks */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold">Article Content (Hyperlinks Applied Live):</span>
                        <span className="text-[11px] text-brand-600 dark:text-brand-400">
                          {(currentGuide.hyperlinks || []).length} keywords active
                        </span>
                      </div>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: applyHyperlinksToContent(
                            currentGuide.content || currentGuide.excerpt || 'No content written yet.',
                            currentGuide.hyperlinks
                          )
                        }}
                        className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-3 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* Preview Tab Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setGuideModalTab('edit')}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    ← Back to Editor Form
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveGuide}
                    disabled={isSaving}
                    className="btn-glass-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : isEditingGuide ? 'Update Guide' : 'Save Guide'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
