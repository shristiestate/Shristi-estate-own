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
  ArrowLeftRight
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Property, Building, Location, Lead, LeadStatus, PropertyStatus } from '../types';
import { handleOverviewPaste } from '../utils/textFormat';

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
    area_unit: 'sq.ft',
    furnishing: 'Furnished',
    parking: '1 Covered Bay',
    possession: 'Ready to Move',
    description: '',
    primary_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    published: true,
  });

  // Building Modal Form (Add & Edit)
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [isEditingBuilding, setIsEditingBuilding] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState<Partial<Building>>({
    name: '',
    location_id: 'loc-sec-62',
    location_name: 'Sector 62, Noida',
    category: 'office-space',
    address: 'Plot A-40, Sector 62, Noida',
    description: '',
    hero_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    total_floors: 14,
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
    setCurrentProperty({
      title: '',
      category: 'office-space',
      property_type: 'Commercial Office',
      listing_type: 'Rent',
      status: 'Available',
      price: 65000,
      price_display: '₹65,000/month',
      rate_per_sqft: '₹55/sq.ft',
      location_id: locations[0]?.id || 'loc-sec-62',
      location_name: locations[0]?.name || 'Sector 62, Noida',
      building_id: buildings[0]?.id || undefined,
      building_name: buildings[0]?.name || undefined,
      address: 'Sector 62, Noida',
      city: 'Noida',
      built_up_area: 1150,
      area_unit: 'sq.ft',
      furnishing: 'Furnished',
      parking: '1 Covered Slot',
      possession: 'Ready to Move',
      description: '',
      primary_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
      gallery: [],
      published: true,
    });
    setNewPropertyGalleryUrl('');
    setShowPropertyModal(true);
  };

  const handleOpenEditProperty = (prop: Property) => {
    setIsEditingProperty(true);
    setCurrentProperty({
      ...prop,
      gallery: prop.gallery && Array.isArray(prop.gallery) ? [...prop.gallery] : []
    });
    setNewPropertyGalleryUrl('');
    setShowPropertyModal(true);
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
        category: (currentProperty.category || 'office-space') as any,
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
        address: currentProperty.address || 'Sector 62, Noida',
        city: currentProperty.city || 'Noida',
        built_up_area: Number(currentProperty.built_up_area) || 1200,
        carpet_area: (currentProperty.carpet_area && !isNaN(Number(currentProperty.carpet_area))) ? Number(currentProperty.carpet_area) : null as any,
        area_unit: currentProperty.area_unit || 'sq.ft',
        floor: currentProperty.floor || 'Ground',
        furnishing: (currentProperty.furnishing || 'Furnished') as any,
        parking: currentProperty.parking || '1 Covered Slot',
        power_load: currentProperty.power_load || '100% DG Backup',
        possession: currentProperty.possession || 'Immediate',
        description: currentProperty.description || '',
        features: currentProperty.features || ['24/7 Security', 'Power Backup', 'Air Conditioning'],
        amenities: currentProperty.amenities || ['High-speed Elevators', 'Cafeteria Provision'],
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
    setCurrentBuilding({
      name: '',
      location_id: locations[0]?.id || 'loc-sec-62',
      location_name: locations[0]?.name || 'Sector 62, Noida',
      category: 'office-space',
      address: 'Plot A-40, Sector 62, Noida',
      description: '',
      hero_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      gallery: [],
      total_floors: 14,
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
    setShowBuildingModal(true);
  };

  const handleOpenEditBuilding = (bld: Building) => {
    setIsEditingBuilding(true);
    setCurrentBuilding({
      ...bld,
      gallery: bld.gallery && Array.isArray(bld.gallery) ? [...bld.gallery] : []
    });
    setNewBuildingGalleryUrl('');
    setShowBuildingModal(true);
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    if (window.confirm('Are you sure you want to delete this commercial building?')) {
      await StorageService.deleteBuilding(buildingId);
      setBuildings(prev => prev.filter(b => b.id !== buildingId));
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
      const loc = locations.find(l => l.id === currentBuilding.location_id);

      const buildingObj: Building = {
        id: currentBuilding.id || `bld-${Date.now()}`,
        name: currentBuilding.name.trim(),
        slug: currentBuilding.slug || currentBuilding.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        location_id: currentBuilding.location_id || (locations[0]?.id || 'loc-sec-62'),
        location_name: loc ? loc.name : (currentBuilding.location_name || 'Sector 62, Noida'),
        category: (currentBuilding.category || 'office-space') as any,
        address: currentBuilding.address || 'Sector 62, Noida',
        description: currentBuilding.description || '',
        hero_image: currentBuilding.hero_image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        gallery: Array.isArray(currentBuilding.gallery) ? currentBuilding.gallery : [],
        total_floors: Number(currentBuilding.total_floors) || 1,
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
    if (!propertySearch) return true;
    const q = propertySearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.reference_number.toLowerCase().includes(q) ||
      p.location_name.toLowerCase().includes(q) ||
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
    .filter(l => l.lead_type === 'list_property' && l.images && l.images.length > 0)
    .flatMap(l => (l.images || []).map((img, idx) => ({
      id: `lead-img-${l.id}-${idx}`,
      url: img,
      title: `${l.name} • ${l.property_title || l.building_name || l.location_name || 'Owner Property'}`,
      source: `Landlord (${l.phone})`,
      created_at: l.created_at.slice(0, 10),
      lead_id: l.id
    })));

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Commercial Content & Inventory Editor
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Supabase Live Cloud DB
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
            Admin Management Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full edit control over property images, building tariffs, floor areas, and live statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:border-brand-300 dark:hover:border-brand-800 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:text-brand-400 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 group cursor-pointer"
            title="Sync & Update Live Data from Supabase Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 transition-transform ${loading ? 'animate-spin text-brand-500' : 'group-hover:rotate-180 duration-500'}`} />
            <span>{loading ? 'Syncing...' : 'Sync & Update'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* METRICS DASHBOARD (SECTION 48) */}
      {/* OPTIMIZED METRIC BUTTONS & QUICK SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Properties Button */}
        <button
          onClick={() => setActiveTab('properties')}
          className={`glass-card rounded-2xl p-4.5 sm:p-5 text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between border cursor-pointer select-none active:scale-[0.98] ${
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
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/25 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 group-hover:border-brand-500/40 transition-all duration-300 shadow-inner">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                <span>Manage</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mt-3.5">
              Properties
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit'] tracking-tight leading-none">
              {properties.length}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{properties.filter(p => p.status === 'Available' || p.status === 'Ready to Move').length} Active</span>
            </div>
            {activeTab === 'properties' && (
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Active</span>
            )}
          </div>
        </button>

        {/* Buildings Button */}
        <button
          onClick={() => setActiveTab('buildings')}
          className={`glass-card rounded-2xl p-4.5 sm:p-5 text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between border cursor-pointer select-none active:scale-[0.98] ${
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
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-500/40 transition-all duration-300 shadow-inner">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                <span>Manage</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mt-3.5">
              Buildings
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit'] tracking-tight leading-none">
              {buildings.length}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span>In {locations.length} Sectors</span>
            </div>
            {activeTab === 'buildings' && (
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Active</span>
            )}
          </div>
        </button>

        {/* Total Inquiries Button */}
        <button
          onClick={() => {
            setActiveTab('leads');
            setLeadStatusFilter('All');
          }}
          className={`glass-card rounded-2xl p-4.5 sm:p-5 text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between border cursor-pointer select-none active:scale-[0.98] ${
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
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:border-blue-500/40 transition-all duration-300 shadow-inner">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <span>Leads</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mt-3.5">
              Total Inquiries
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit'] tracking-tight leading-none">
              {leads.length}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>{leads.filter(l => l.status === 'New').length} New Unread</span>
            </div>
            {activeTab === 'leads' && leadStatusFilter === 'All' && (
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Active</span>
            )}
          </div>
        </button>

        {/* Site Visits Button */}
        <button
          onClick={() => {
            setActiveTab('leads');
            setLeadStatusFilter('Visit Scheduled');
          }}
          className={`glass-card rounded-2xl p-4.5 sm:p-5 text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between border cursor-pointer select-none active:scale-[0.98] ${
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
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/25 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 group-hover:border-teal-500/40 transition-all duration-300 shadow-inner">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                <span>Visits</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mt-3.5">
              Site Visits
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit'] tracking-tight leading-none">
              {leads.filter(l => l.status === 'Visit Scheduled').length}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>Scheduled Active</span>
            </div>
            {activeTab === 'leads' && leadStatusFilter === 'Visit Scheduled' && (
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Active</span>
            )}
          </div>
        </button>

        {/* Conversions Button */}
        <button
          onClick={() => {
            setActiveTab('leads');
            setLeadStatusFilter('Converted');
          }}
          className={`glass-card rounded-2xl p-4.5 sm:p-5 text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between border cursor-pointer select-none active:scale-[0.98] col-span-2 sm:col-span-1 ${
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
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:border-emerald-500/40 transition-all duration-300 shadow-inner">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <span>Deals</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mt-3.5">
              Conversions
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit'] tracking-tight leading-none">
              {leads.filter(l => l.status === 'Converted').length}
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Closed Deals</span>
            </div>
            {activeTab === 'leads' && leadStatusFilter === 'Converted' && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active</span>
            )}
          </div>
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'properties' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Properties & Tariffs ({properties.length})
        </button>
        <button
          onClick={() => setActiveTab('buildings')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'buildings' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Buildings & Rates ({buildings.length})
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'leads' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Leads & Inquiries ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'locations' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Locations ({locations.length})
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'media' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image Uploader & Media ({allMediaItems.length})</span>
        </button>
      </div>

      {/* TAB 1: PROPERTIES MANAGER WITH EDITABLE IMAGES, TARIFFS & SPECS */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search property by title, ID, building, or location..."
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-xs"
              />
            </div>

            <button
              onClick={handleOpenAddProperty}
              className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Commercial Property</span>
            </button>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Property & Image</th>
                    <th className="p-3.5">Building & Location</th>
                    <th className="p-3.5">Area & Type</th>
                    <th className="p-3.5">Tariff / Price</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredProperties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Image & Title */}
                      <td className="p-3.5 flex items-center gap-3">
                        <div className="relative group/img cursor-pointer shrink-0" onClick={() => handleOpenEditProperty(prop)}>
                          <img 
                            src={prop.primary_image} 
                            alt="" 
                            className="w-14 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 group-hover/img:opacity-80 transition-opacity" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <Edit3 className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <span 
                            onClick={() => handleOpenEditProperty(prop)}
                            className="font-bold text-slate-900 dark:text-white text-xs block line-clamp-1 hover:text-brand-600 cursor-pointer"
                          >
                            {prop.title}
                          </span>
                          <span className="text-[10px] font-mono text-brand-500 font-semibold">
                            {prop.reference_number}
                          </span>
                        </div>
                      </td>

                      {/* Building & Location */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {prop.building_name || 'Independent'}
                        </div>
                        <div className="text-[11px] text-slate-400">{prop.location_name}</div>
                      </td>

                      {/* Area & Type */}
                      <td className="p-3.5">
                        <div className="font-semibold">{prop.built_up_area} {prop.area_unit}</div>
                        <div className="text-[11px] text-slate-400">{prop.furnishing}</div>
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
                          {/* EDIT / UPDATE BUTTON */}
                          <button
                            onClick={() => handleOpenEditProperty(prop)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-600 dark:bg-brand-950/80 dark:hover:bg-brand-600 text-brand-700 dark:text-brand-300 hover:text-white border border-brand-200/90 dark:border-brand-800/80 flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:shadow-brand-500/20 active:scale-95 group cursor-pointer"
                            title="Update Property (Images, Tariff, Specs, Status)"
                          >
                            <Edit3 className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
                            <span>Update</span>
                          </button>

                          {/* VIEW BUTTON */}
                          <Link
                            to={`/properties/${prop.slug}`}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* DELETE BUTTON */}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUILDINGS MANAGER WITH EDITABLE IMAGES, TARIFFS & DETAILS */}
      {activeTab === 'buildings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">
              Manage commercial buildings, hero images, rent tariffs, and available floors
            </span>
            <button
              onClick={handleOpenAddBuilding}
              className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Commercial Building</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Tariff Range:</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">{bld.rent_range || 'On Request'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Structure:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">G + {bld.total_floors} Floors</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Size Range:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{bld.size_range}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Power:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{bld.power_backup}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => handleOpenEditBuilding(bld)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-md shadow-brand-500/20 active:scale-95 flex items-center gap-1.5 transition-all group cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
                      <span>Update Specs & Tariff</span>
                    </button>

                    <Link to={`/buildings/${bld.slug}`} className="text-xs text-slate-500 hover:text-brand-500 font-semibold flex items-center gap-1">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
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
              className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 shadow-md">
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

                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {lead.property_title || lead.building_name || 'Custom Space Requirement'}
                        </div>
                        <p className="overview-card-text text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {lead.message}
                        </p>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOCATIONS MANAGER WITH FULL EDIT & ADD CONTROLS */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">
              Manage commercial sectors, hero images, descriptions, and categories
            </span>
            <button
              onClick={handleOpenAddLocation}
              className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Commercial Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                <div className="p-5 space-y-3">
                  <p className="overview-card-text text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {loc.description}
                  </p>

                  <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100 dark:border-slate-800 font-semibold text-emerald-500">
                    <span>{loc.building_count} Commercial Buildings</span>
                    <span>•</span>
                    <span>{loc.property_count} Properties</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => handleOpenEditLocation(loc)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-md shadow-brand-500/20 active:scale-95 flex items-center gap-1.5 transition-all group cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
                      <span>Update Sector Profile</span>
                    </button>

                    <Link to={`/locations/${loc.slug}`} className="text-xs text-slate-500 hover:text-brand-500 font-semibold flex items-center gap-1">
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
          <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 shadow-md space-y-5">
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
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setMediaUploadMode('device')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/40 dark:bg-slate-900/40 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 group">
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleMediaFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 group-hover:scale-110 text-brand-600 dark:text-brand-400 flex items-center justify-center transition-transform mb-2">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to select photos or drag & drop files here
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
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
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Filter Media:</span>
              <button
                type="button"
                onClick={() => setMediaFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mediaFilter === 'admin'
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Admin & System ({customMedia.length})
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter('landlord')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-sm border border-white/10">
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

                <div className="p-3.5 space-y-2.5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Added: {item.created_at}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentProperty(prev => ({ ...prev, primary_image: item.url }));
                        setShowPropertyModal(true);
                      }}
                      className="flex-1 py-1 px-2 rounded-lg text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors text-center"
                    >
                      Use in Property
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentBuilding(prev => ({ ...prev, hero_image: item.url }));
                        setShowBuildingModal(true);
                      }}
                      className="flex-1 py-1 px-2 rounded-lg text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors text-center"
                    >
                      Use in Building
                    </button>
                    {item.id.startsWith('media-') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            <button 
              onClick={() => setShowPropertyModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {isEditingProperty ? 'Edit Property Listing' : 'New Commercial Listing'}
              </span>
              <h2 className="text-2xl font-bold font-['Outfit']">
                {isEditingProperty ? `Edit: ${currentProperty.reference_number}` : 'Add Commercial Property'}
              </h2>
            </div>
            
            <form onSubmit={handleSaveProperty} className="space-y-4">
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

              {/* Category, Listing Type, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={currentProperty.category}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, category: e.target.value as any })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  >
                    <option value="office-space">Office Space</option>
                    <option value="it-business-parks">IT Park</option>
                    <option value="warehouses">Warehouse</option>
                    <option value="factory-industrial">Factory & Industrial</option>
                    <option value="land">Commercial Land</option>
                    <option value="shops-retail">Retail Shop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Listing Type</label>
                  <select
                    value={currentProperty.listing_type}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, listing_type: e.target.value as any })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Lease">Lease</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Status</label>
                  <select
                    value={currentProperty.status}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, status: e.target.value as any })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
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

              {/* Location & Building Association */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Location / Sector</label>
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
                    <option value="">Independent / Standalone</option>
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.location_name})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area & Furnishing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Built-Up Area (sq.ft) *</label>
                  <input
                    type="number"
                    required
                    value={currentProperty.built_up_area}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, built_up_area: Number(e.target.value) })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Carpet Area (sq.ft)</label>
                  <input
                    type="number"
                    value={currentProperty.carpet_area || ''}
                    onChange={(e) => setCurrentProperty({ ...currentProperty, carpet_area: Number(e.target.value) || undefined })}
                    placeholder="e.g. 850"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Furnishing</label>
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
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold mb-1">Description & Key Highlights</label>
                <textarea
                  rows={5}
                  value={currentProperty.description}
                  onChange={(e) => setCurrentProperty({ ...currentProperty, description: e.target.value })}
                  onPaste={(e) => handleOverviewPaste(e, (val) => setCurrentProperty({ ...currentProperty, description: val }), currentProperty.description)}
                  placeholder="Describe workstations, cabins, view, and immediate availability..."
                  className="glass-input overview-input w-full px-3 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPropertyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-600 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-brand-500/25 active:scale-95 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            <button 
              onClick={() => setShowBuildingModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {isEditingBuilding ? 'Edit Commercial Building' : 'New Commercial Building'}
              </span>
              <h2 className="text-2xl font-bold font-['Outfit']">
                {isEditingBuilding ? `Edit: ${currentBuilding.name}` : 'Add Commercial Building'}
              </h2>
            </div>

            <form onSubmit={handleSaveBuilding} className="space-y-4">
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
                  <label className="block text-xs font-semibold mb-1">Location / Sector *</label>
                  <select
                    value={currentBuilding.location_id}
                    onChange={(e) => {
                      const loc = locations.find(l => l.id === e.target.value);
                      setCurrentBuilding({ 
                        ...currentBuilding, 
                        location_id: e.target.value,
                        location_name: loc ? loc.name : currentBuilding.location_name
                      });
                    }}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
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

              {/* Floors & Size Range */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Total Floors (Structure)</label>
                  <input
                    type="number"
                    value={currentBuilding.total_floors}
                    onChange={(e) => setCurrentBuilding({ ...currentBuilding, total_floors: Number(e.target.value) })}
                    placeholder="e.g. 14"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Available Sizes Range</label>
                  <input
                    type="text"
                    value={currentBuilding.size_range}
                    onChange={(e) => setCurrentBuilding({ ...currentBuilding, size_range: e.target.value })}
                    placeholder="e.g. 750 sq.ft – 25,000 sq.ft"
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Primary Category</label>
                  <select
                    value={currentBuilding.category}
                    onChange={(e) => setCurrentBuilding({ ...currentBuilding, category: e.target.value as any })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                  >
                    <option value="office-space">Office Space</option>
                    <option value="it-business-parks">IT Park</option>
                    <option value="warehouses">Warehouse</option>
                    <option value="factory-industrial">Factory & Industrial</option>
                    <option value="shops-retail">Retail & Mall</option>
                  </select>
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBuildingModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-600 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-brand-500/25 active:scale-95 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
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

      {/* LOCATION ADD / EDIT MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            <button 
              onClick={() => setShowLocationModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {isEditingLocation ? 'Edit Commercial Location' : 'New Commercial Location'}
              </span>
              <h2 className="text-2xl font-bold font-['Outfit']">
                {isEditingLocation ? `Edit: ${currentLocation.name}` : 'Add Commercial Sector'}
              </h2>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4">
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-600 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-brand-500/25 active:scale-95 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
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
    </div>
  );
};
