import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Plus, 
  Trash2, 
  Tag, 
  MapPin, 
  Building2, 
  Layers, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  Check, 
  ArrowLeftRight,
  Cpu,
  Warehouse,
  Factory,
  Trees,
  Store
} from 'lucide-react';
import { Property, Building, Location, PropertyCategory, PropertyStatus, FurnishingType } from '../../types';
import { StorageService } from '../../services/storageService';
import { handleOverviewPaste } from '../../utils/textFormat';

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
    defaultPower: '15 KVA 3-Phase Commercial Load',
    defaultRoad: '45 Feet High Footfall Sector Road',
    suggestedFeatures: [
      'Heavy Footfall Zone',
      'Double Height Glass Frontage',
      'Dedicated Retail Signage Fascia',
      'Dedicated Customer Car Parking',
      'Metro Station Gate Adjacent',
      '24/7 Power Backup',
      'Central AC'
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

export interface EditPropertyModalProps {
  isOpen: boolean;
  property: Property | null;
  locations?: Location[];
  buildings?: Building[];
  onClose: () => void;
  onSave: (updatedProperty: Property) => void | Promise<void>;
}

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  isOpen,
  property,
  locations: initialLocations,
  buildings: initialBuildings,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Property | null>(null);
  const [locations, setLocations] = useState<Location[]>(initialLocations || []);
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings || []);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newFeatureTag, setNewFeatureTag] = useState('');
  const [customPropertyTypeInput, setCustomPropertyTypeInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync when property changes or opens
  useEffect(() => {
    if (property) {
      setFormData({
        ...property,
        gallery: property.gallery ? [...property.gallery] : [],
        features: property.features ? [...property.features] : [],
      });
      setNewGalleryUrl('');
      setNewFeatureTag('');
      setCustomPropertyTypeInput('');
    }
  }, [property, isOpen]);

  // Load locations and buildings if not provided
  useEffect(() => {
    if (!initialLocations || initialLocations.length === 0) {
      StorageService.getLocations().then(setLocations);
    }
    if (!initialBuildings || initialBuildings.length === 0) {
      StorageService.getBuildings().then(setBuildings);
    }
  }, [initialLocations, initialBuildings]);

  if (!isOpen || !formData) return null;

  // Handle Primary Image Upload
  const handlePrimaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormData(prev => prev ? { ...prev, primary_image: result } : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Gallery Multi-upload
  const handleGalleryMultiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormData(prev => prev ? {
            ...prev,
            gallery: [...(prev.gallery || []), result]
          } : null);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Add Gallery URL
  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setFormData(prev => prev ? {
      ...prev,
      gallery: [...(prev.gallery || []), newGalleryUrl.trim()]
    } : null);
    setNewGalleryUrl('');
  };

  // Update specific gallery item URL
  const handleUpdateGalleryUrl = (index: number, url: string) => {
    setFormData(prev => {
      if (!prev) return null;
      const updated = [...(prev.gallery || [])];
      updated[index] = url;
      return { ...prev, gallery: updated };
    });
  };

  // Delete gallery item
  const handleDeleteGalleryItem = (index: number) => {
    setFormData(prev => {
      if (!prev) return null;
      const updated = (prev.gallery || []).filter((_, i) => i !== index);
      return { ...prev, gallery: updated };
    });
  };

  // Swap gallery item with primary cover
  const handleSetPrimaryFromGallery = (index: number) => {
    setFormData(prev => {
      if (!prev) return null;
      const gallery = [...(prev.gallery || [])];
      const newCover = gallery[index];
      const oldCover = prev.primary_image;
      gallery[index] = oldCover;
      return {
        ...prev,
        primary_image: newCover,
        gallery
      };
    });
  };

  // Replace single gallery item with file
  const handleReplaceGalleryItem = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          handleUpdateGalleryUrl(index, result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add feature tag
  const handleAddFeatureTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || newFeatureTag).trim();
    if (!tag) return;
    setFormData(prev => {
      if (!prev) return null;
      const existing = prev.features || [];
      if (existing.includes(tag)) return prev;
      return { ...prev, features: [...existing, tag] };
    });
    if (!tagToAdd) setNewFeatureTag('');
  };

  // Remove feature tag
  const handleRemoveFeatureTag = (index: number) => {
    setFormData(prev => {
      if (!prev) return null;
      const existing = prev.features || [];
      return { ...prev, features: existing.filter((_, i) => i !== index) };
    });
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error('Error saving property listing:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto p-2 sm:p-4 md:p-6 flex min-h-full items-start sm:items-center justify-center bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl my-auto max-h-[96vh] sm:max-h-[90vh] flex flex-col animate-fade-in">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 sm:bg-transparent z-10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-3 sm:mb-4 shrink-0 pr-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Edit Property Listing
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white">
            Edit: {formData.reference_number || formData.title}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 -mr-1">
          {/* Title & Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Property Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 1,150 sq.ft Furnished Corporate Office in I-Thum"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Ref ID</label>
              <input
                type="text"
                value={formData.reference_number || ''}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="e.g. SE-6201"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm font-mono"
              />
            </div>
          </div>

          {/* PRIMARY IMAGE URL & LIVE PREVIEW & UPLOAD */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold">Primary Property Image URL *</label>
              <label className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePrimaryImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                required
                value={formData.primary_image}
                onChange={(e) => setFormData({ ...formData, primary_image: e.target.value })}
                placeholder="Paste image link or click 'Upload from Device' above"
                className="glass-input flex-1 px-3 py-2 rounded-xl text-sm"
              />
              {formData.primary_image && (
                <div className="w-12 h-9 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                  <img src={formData.primary_image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* PROPERTY PHOTO GALLERY (REST OF IMAGES - EDITABLE) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Property Photo Gallery (Rest of Images - {formData.gallery?.length || 0})
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
                  onChange={handleGalleryMultiUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Add via URL input bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGalleryUrl(); } }}
                placeholder="Paste image URL here and click 'Add Photo'..."
                className="glass-input flex-1 px-3 py-1.5 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            </div>

            {/* Gallery List Cards */}
            {(!formData.gallery || formData.gallery.length === 0) ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                No extra gallery photos yet. Click "Upload Photos from Device" or paste a URL above to add images.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {formData.gallery.map((imgUrl, idx) => (
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
                        onChange={(e) => handleUpdateGalleryUrl(idx, e.target.value)}
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
                          onChange={(e) => handleReplaceGalleryItem(idx, e)}
                          className="hidden"
                        />
                      </label>

                      {/* Swap with Primary Cover Image */}
                      <button
                        type="button"
                        title="Update Primary Cover (swaps with current cover image)"
                        onClick={() => handleSetPrimaryFromGallery(idx)}
                        className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-600 dark:bg-brand-950/60 dark:hover:bg-brand-600 text-brand-700 dark:text-brand-300 hover:text-white border border-brand-200/90 dark:border-brand-800/80 transition-all flex items-center gap-1 text-[11px] font-semibold active:scale-95 group/cover cursor-pointer"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 transition-transform group-hover/cover:rotate-180 duration-300" />
                        <span>Update Cover</span>
                      </button>

                      {/* Delete from gallery */}
                      <button
                        type="button"
                        title="Remove this photo"
                        onClick={() => handleDeleteGalleryItem(idx)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                value={formData.price_display}
                onChange={(e) => setFormData({ ...formData, price_display: e.target.value })}
                placeholder="e.g. ₹65,000/month or ₹1.85 Cr"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Numeric Amount (₹) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Rate / Tariff per sq.ft</label>
              <input
                type="text"
                value={formData.rate_per_sqft || ''}
                onChange={(e) => setFormData({ ...formData, rate_per_sqft: e.target.value })}
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
              {formData.category && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${CATEGORY_CONFIG[formData.category as PropertyCategory]?.badgeClass}`}>
                  {CATEGORY_CONFIG[formData.category as PropertyCategory]?.label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Asset Class *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const newCat = e.target.value as PropertyCategory;
                    const config = CATEGORY_CONFIG[newCat] || CATEGORY_CONFIG['office-space'];
                    setFormData({ 
                      ...formData, 
                      category: newCat,
                      property_type: config.defaultType,
                      power_load: formData.power_load || config.defaultPower,
                      road_width: formData.road_width || config.defaultRoad,
                      listing_type: newCat === 'land' ? 'Sale' : (formData.listing_type || 'Rent'),
                      area_unit: newCat === 'land' ? 'sq.meter' : (formData.area_unit || 'sq.ft'),
                      features: formData.features && formData.features.length > 0 
                        ? formData.features 
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
                  Property Type ({CATEGORY_CONFIG[(formData.category || 'office-space') as PropertyCategory]?.label}) *
                </label>
                <select
                  value={formData.property_type || ''}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setFormData({ ...formData, property_type: '' });
                      setCustomPropertyTypeInput('custom');
                    } else {
                      setFormData({ ...formData, property_type: e.target.value });
                    }
                  }}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold"
                >
                  {(CATEGORY_CONFIG[(formData.category || 'office-space') as PropertyCategory]?.types || []).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="__custom__">✍️ Custom Property Type...</option>
                </select>
              </div>
            </div>

            {/* Custom Property Type Input if selected */}
            {(!CATEGORY_CONFIG[(formData.category || 'office-space') as PropertyCategory]?.types.includes(formData.property_type || '') || customPropertyTypeInput !== '') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Custom Property Type Description
                </label>
                <input
                  type="text"
                  value={formData.property_type || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, property_type: e.target.value });
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
                value={formData.listing_type}
                onChange={(e) => setFormData({ ...formData, listing_type: e.target.value as any })}
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
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
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
                  value={formData.location_id}
                  onChange={(e) => {
                    const loc = locations.find(l => l.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      location_id: e.target.value,
                      location_name: loc ? loc.name : formData.location_name
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
                  value={formData.building_id || ''}
                  onChange={(e) => {
                    const bld = buildings.find(b => b.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      building_id: e.target.value || undefined,
                      building_name: bld ? bld.name : undefined,
                      tower: bld && bld.towers && bld.towers.length > 0 ? bld.towers[0] : formData.tower
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

            <div>
              <label className="block text-xs font-semibold mb-1">City</label>
              <input
                type="text"
                value={formData.city || 'Noida'}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
              {(formData.category === 'land' || formData.category === 'warehouses' || formData.category === 'factory-industrial') && (
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
                  value={formData.built_up_area || ''}
                  onChange={(e) => setFormData({ ...formData, built_up_area: Number(e.target.value) })}
                  placeholder="e.g. 4500"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Carpet Area</label>
                <input
                  type="number"
                  value={formData.carpet_area || ''}
                  onChange={(e) => setFormData({ ...formData, carpet_area: Number(e.target.value) || undefined })}
                  placeholder="e.g. 3600"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Plot / Land Area {formData.category === 'land' ? '*' : ''}
                </label>
                <input
                  type="number"
                  value={formData.land_area || ''}
                  onChange={(e) => setFormData({ ...formData, land_area: Number(e.target.value) || undefined })}
                  placeholder="e.g. 1000"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold border-brand-300 dark:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Area Unit</label>
                <select
                  value={formData.area_unit || 'sq.ft'}
                  onChange={(e) => setFormData({ ...formData, area_unit: e.target.value as any })}
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
                  value={formData.power_load || ''}
                  onChange={(e) => setFormData({ ...formData, power_load: e.target.value })}
                  placeholder="e.g. 150 KVA Sanctioned Industrial Load or 100% DG Backup"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Approach Road Width / Frontage</label>
                <input
                  type="text"
                  value={formData.road_width || ''}
                  onChange={(e) => setFormData({ ...formData, road_width: e.target.value })}
                  placeholder="e.g. 60 Feet Wide Arterial Road (40ft Trailer access)"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Furnishing / Shell</label>
                <select
                  value={formData.furnishing}
                  onChange={(e) => setFormData({ ...formData, furnishing: e.target.value as any })}
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
                  value={formData.possession || ''}
                  onChange={(e) => setFormData({ ...formData, possession: e.target.value })}
                  placeholder="e.g. Immediate or Ready to Move"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Parking, Truck Loading Bays & Open Yard</label>
              <input
                type="text"
                value={formData.parking || ''}
                onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                placeholder="e.g. Internal trailer maneuvering & 4 loading bays, or 2 Covered Bays"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* FEATURES & KEY HIGHLIGHTS */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-500" />
                <span>Key Features & Specifications ({formData.features?.length || 0})</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Click suggested pills to add
              </span>
            </div>

            {/* Suggested quick chips */}
            {CATEGORY_CONFIG[(formData.category || 'office-space') as PropertyCategory]?.suggestedFeatures && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {CATEGORY_CONFIG[(formData.category || 'office-space') as PropertyCategory].suggestedFeatures.map((sug) => {
                  const isAdded = (formData.features || []).includes(sug);
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
            {formData.features && formData.features.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                {formData.features.map((feat, idx) => (
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
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onPaste={(e) => handleOverviewPaste(e, (val) => setFormData({ ...formData, description: val }), formData.description)}
              placeholder="Describe location advantages, industrial NOCs, ceiling clearances, immediate availability, or retail footfall..."
              className="glass-input overview-input w-full px-3 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-center cursor-pointer"
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
                  <span>Updating Property Listing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Update Property & Live Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
