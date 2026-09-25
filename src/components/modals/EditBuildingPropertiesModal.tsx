import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  Building2, 
  DollarSign, 
  SlidersHorizontal, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  Image as ImageIcon,
  Search,
  ExternalLink,
  ChevronDown,
  Camera,
  UploadCloud,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { Building, Property, FurnishingType, PropertyStatus } from '../../types';
import { StorageService } from '../../services/storageService';
import { formatIndianCurrency, extractBaseRate } from '../../utils/buildingUnits';
import { EditPropertyModal } from './EditPropertyModal';

export const CURATED_OFFICE_IMAGES = [
  {
    title: 'Executive Furnished Suite',
    tag: 'Furnished',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Plug & Play Workstations Hall',
    tag: 'Plug & Play',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Modern Tech Workspace',
    tag: 'Workstations',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Boardroom & Conference Suite',
    tag: 'Conference',
    url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Director Cabin & Meeting Desk',
    tag: 'Cabin',
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Corporate Reception & Lounge',
    tag: 'Reception',
    url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Enterprise Floor Plate',
    tag: 'Enterprise',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Bare Shell Commercial Floor',
    tag: 'Bare Shell',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Semi-Furnished Office',
    tag: 'Semi-Furnished',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Breakout & Cafeteria Zone',
    tag: 'Pantry/Breakout',
    url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Glass Tower Skyline Office',
    tag: 'Skyline View',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Collaborative Innovation Lab',
    tag: 'Open Plan',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  }
];

interface EditBuildingPropertiesModalProps {
  isOpen: boolean;
  building: Building | null;
  onClose: () => void;
  onPropertiesUpdated?: (updated: Property[]) => void;
}

export const EditBuildingPropertiesModal: React.FC<EditBuildingPropertiesModalProps> = ({
  isOpen,
  building,
  onClose,
  onPropertiesUpdated
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'compact' | 'enterprise'>('all');

  // Bulk rate apply
  const [bulkRate, setBulkRate] = useState<string>('');

  // Add custom unit state
  const [showAddForm, setShowAddForm] = useState(false);
  const [customArea, setCustomArea] = useState<number>(1500);
  const [customType, setCustomType] = useState<string>('Custom Commercial Suite');
  const [customFurnishing, setCustomFurnishing] = useState<FurnishingType>('Furnished');
  const [customFloor, setCustomFloor] = useState<string>('4th Floor');
  const [customRate, setCustomRate] = useState<number>(55);
  const [customStatus, setCustomStatus] = useState<PropertyStatus>('Available');
  const [customImage, setCustomImage] = useState<string>('');
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // Image Update Modal State for specific unit
  const [editingImageUnit, setEditingImageUnit] = useState<Property | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [inputImageUrl, setInputImageUrl] = useState<string>('');
  const [selectedGallery, setSelectedGallery] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState<string>('');

  // Full Property Edit Modal State (Edit Property Listing matching Img 1 & Img 2)
  const [fullEditingUnit, setFullEditingUnit] = useState<Property | null>(null);
  const [showFullEditModal, setShowFullEditModal] = useState(false);

  // Save full property from EditPropertyModal
  const handleSaveFullUnit = async (updatedUnit: Property) => {
    await StorageService.saveProperty(updatedUnit);
    setProperties(prev => prev.map(p => p.id === updatedUnit.id ? updatedUnit : p));
    if (onPropertiesUpdated) {
      onPropertiesUpdated(properties.map(p => p.id === updatedUnit.id ? updatedUnit : p));
    }
    setShowFullEditModal(false);
    setFullEditingUnit(null);
  };

  // Load properties when modal opens for building
  useEffect(() => {
    if (!isOpen || !building) return;
    setLoading(true);
    setSavedSuccess(false);
    setShowAddForm(false);
    setDeletedIds([]);
    const initialRate = extractBaseRate(building.rent_range);
    setBulkRate(String(initialRate));
    setCustomRate(initialRate);

    StorageService.getPropertiesByBuilding(building.id).then((props) => {
      setProperties(props);
      setLoading(false);
    });
  }, [isOpen, building]);

  if (!isOpen || !building) return null;

  // Handle single property field changes
  const handleUpdateProperty = (id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates };

      // If price or area changed, recalculate rate or display
      if (updates.price !== undefined && updated.built_up_area > 0) {
        const calculatedRate = Math.round(Number(updates.price) / updated.built_up_area);
        updated.rate_per_sqft = `₹${calculatedRate}/sq.ft`;
        updated.price_display = `₹${formatIndianCurrency(Number(updates.price))}/month`;
      } else if (updates.rate_per_sqft !== undefined) {
        const rateMatch = String(updates.rate_per_sqft).match(/\d+/);
        if (rateMatch) {
          const numRate = parseInt(rateMatch[0], 10);
          const newPrice = Math.round(updated.built_up_area * numRate);
          updated.price = newPrice;
          updated.price_display = `₹${formatIndianCurrency(newPrice)}/month`;
        }
      }

      return updated;
    }));
  };

  // Bulk Apply Rate to All Units
  const handleApplyBulkRate = () => {
    const rateNum = parseInt(bulkRate, 10);
    if (isNaN(rateNum) || rateNum <= 0) return;

    setProperties(prev => prev.map(p => {
      let unitRate = rateNum;
      if (p.built_up_area <= 1000) unitRate = Math.round(rateNum * 1.08);
      else if (p.built_up_area <= 2600) unitRate = rateNum;
      else if (p.built_up_area >= 50000) unitRate = Math.max(35, Math.round(rateNum * 0.92));

      const newPrice = Math.round(p.built_up_area * unitRate);
      return {
        ...p,
        price: newPrice,
        price_display: `₹${formatIndianCurrency(newPrice)}/month`,
        rate_per_sqft: `₹${unitRate}/sq.ft`
      };
    }));
  };

  // Sync selected unit when image editor opens
  useEffect(() => {
    if (editingImageUnit) {
      setSelectedImageUrl(editingImageUnit.primary_image || '');
      setInputImageUrl(editingImageUnit.primary_image || '');
      setSelectedGallery(editingImageUnit.gallery ? [...editingImageUnit.gallery] : []);
      setNewGalleryInput('');
    }
  }, [editingImageUnit]);

  // Save selected image & gallery for active unit
  const handleSaveUnitImage = () => {
    if (!editingImageUnit) return;
    const finalUrl = selectedImageUrl.trim() || editingImageUnit.primary_image;
    handleUpdateProperty(editingImageUnit.id, {
      primary_image: finalUrl,
      gallery: selectedGallery
    });
    setEditingImageUnit(null);
  };

  // Local image upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setSelectedImageUrl(result);
          setInputImageUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Bulk Apply building hero photo to all units
  const handleApplyBuildingImageToAll = () => {
    if (!building?.hero_image) return;
    if (!window.confirm(`Set "${building.name}" building photo as primary image for all ${properties.length} units?`)) return;
    setProperties(prev => prev.map(p => ({
      ...p,
      primary_image: building.hero_image
    })));
  };

  // Add gallery image to unit
  const handleAddGalleryImage = (url: string) => {
    if (!url.trim()) return;
    setSelectedGallery(prev => [...prev, url.trim()]);
    setNewGalleryInput('');
  };

  // Remove gallery image from unit
  const handleRemoveGalleryImage = (index: number) => {
    setSelectedGallery(prev => prev.filter((_, idx) => idx !== index));
  };

  // Add Custom Unit
  const handleAddCustomUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customArea || customArea <= 0) return;

    const monthlyPrice = Math.round(customArea * customRate);
    const cleanBuildingCode = building.slug.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'PROP';
    const newUnitId = `prop-${building.id}-${customArea}-${Date.now().toString().slice(-4)}`;
    const newSlug = `${customArea}-sqft-office-${building.slug}-${Date.now().toString().slice(-4)}`;

    const newUnit: Property = {
      id: newUnitId,
      title: `${customArea.toLocaleString('en-IN')} sq.ft. ${customType} in ${building.name}`,
      slug: newSlug,
      reference_number: `SE-${cleanBuildingCode}-${customArea >= 1000 ? (customArea / 1000) + 'K' : customArea}`,
      category: building.category || 'office-space',
      property_type: customType,
      listing_type: 'Rent',
      status: customStatus,
      price: monthlyPrice,
      price_display: `₹${formatIndianCurrency(monthlyPrice)}/month`,
      rate_per_sqft: `₹${customRate}/sq.ft`,
      rent_frequency: 'month',
      location_id: building.location_id,
      location_name: building.location_name,
      building_id: building.id,
      building_name: building.name,
      tower: building.towers && building.towers.length > 0 ? building.towers[0] : (building.tower_details || 'Main Tower'),
      address: `${customFloor}, ${building.name}, ${building.address}`,
      city: 'Noida',
      built_up_area: customArea,
      carpet_area: Math.round(customArea * 0.72),
      area_unit: 'sq.ft',
      floor: customFloor,
      total_floors: building.total_floors || 10,
      furnishing: customFurnishing,
      parking: customArea >= 20000 ? 'Dedicated multi-slot covered parking' : 'Reserved parking bay',
      power_load: building.power_backup || '100% DG Power Backup',
      possession: 'Immediate',
      description: `Grade-A ${customArea} sq.ft. ${customType.toLowerCase()} on ${customFloor} in ${building.name}, ${building.location_name}. Fully compliant with high speed elevators, 100% DG backup, and 24/7 security.`,
      features: ['Modular Workstations', 'Cabins', 'Conference Room', 'Power Backup', 'Lift Access'],
      amenities: building.amenities && building.amenities.length > 0 ? building.amenities : ['Central AC', 'Elevator', 'Security'],
      primary_image: customImage.trim() || building.hero_image,
      gallery: building.gallery || [],
      featured: false,
      published: true,
      is_seed: true,
      created_at: new Date().toISOString()
    };

    setProperties(prev => [...prev, newUnit].sort((a, b) => a.built_up_area - b.built_up_area));
    setCustomImage('');
    setShowAddForm(false);
  };

  // Delete Unit
  const handleDeleteUnit = (id: string) => {
    setDeletedIds(prev => [...prev, id]);
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  // Save All Changes
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const delId of deletedIds) {
        await StorageService.deleteProperty(delId);
      }
      for (const prop of properties) {
        await StorageService.saveProperty(prop);
      }

      setSavedSuccess(true);
      if (onPropertiesUpdated) {
        onPropertiesUpdated(properties);
      }

      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } catch (e) {
      console.error('Error saving building properties:', e);
      alert('Failed to save properties. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered properties for viewing
  const filteredUnits = properties.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = p.title.toLowerCase().includes(q) || 
                    String(p.built_up_area).includes(q) || 
                    p.reference_number.toLowerCase().includes(q) ||
                    p.furnishing.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (tierFilter === 'compact') return p.built_up_area <= 2600;
    if (tierFilter === 'enterprise') return p.built_up_area >= 20000;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Building Inventory Management
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {properties.length} Available Units
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                Available Properties: {building.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Bulk Rate Calculator & Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Quick Bulk Rate Recalculator */}
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 flex-1 max-w-lg">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0 pl-1">
                Base Tariff (₹/sq.ft):
              </span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={bulkRate}
                  onChange={(e) => setBulkRate(e.target.value)}
                  placeholder="55"
                  className="w-full pl-6 pr-2 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyBulkRate}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-all shrink-0 cursor-pointer"
                title="Recalculates all unit monthly rents based on this base rate"
              >
                Apply to All Units
              </button>
            </div>

            {/* Actions: Sync Building Photo & Add Custom Unit */}
            <div className="flex items-center gap-2 flex-wrap">
              {building.hero_image && (
                <button
                  type="button"
                  onClick={handleApplyBuildingImageToAll}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                  title="Sync building architecture photo to all units"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
                  <span>Sync Building Photo to All</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showAddForm 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white' 
                    : 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/20'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cancel New Unit' : 'Add Custom Unit'}</span>
              </button>
            </div>
          </div>

          {/* Sub Toolbar: Tier Filters & Unit Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs self-start">
              <button
                type="button"
                onClick={() => setTierFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  tierFilter === 'all' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All Units ({properties.length})
              </button>
              <button
                type="button"
                onClick={() => setTierFilter('compact')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  tierFilter === 'compact' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Compact (600 - 2,600 sq.ft)
              </button>
              <button
                type="button"
                onClick={() => setTierFilter('enterprise')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  tierFilter === 'enterprise' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Enterprise (20K - 100K+ sq.ft)
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search size, title, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Add Custom Unit Drawer Form */}
        {showAddForm && (
          <form onSubmit={handleAddCustomUnit} className="p-4 sm:p-5 bg-brand-50/50 dark:bg-brand-950/20 border-b border-brand-200 dark:border-brand-900/60 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Add New Commercial Unit to {building.name}
              </h4>
              <span className="text-[11px] text-slate-500">Auto-calculates monthly pricing based on area and rate</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Area (sq.ft) *</label>
                <input
                  type="number"
                  required
                  value={customArea}
                  onChange={(e) => setCustomArea(Number(e.target.value))}
                  placeholder="e.g. 1500"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Rate (₹/sq.ft) *</label>
                <input
                  type="number"
                  required
                  value={customRate}
                  onChange={(e) => setCustomRate(Number(e.target.value))}
                  placeholder="e.g. 55"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Estimated Rent</label>
                <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-brand-600 dark:text-brand-400">
                  ₹{formatIndianCurrency(customArea * customRate)}/mo
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Furnishing</label>
                <select
                  value={customFurnishing}
                  onChange={(e) => setCustomFurnishing(e.target.value as FurnishingType)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="Furnished">Furnished</option>
                  <option value="Plug-and-Play">Plug-and-Play</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Bare Shell">Bare Shell</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Status</label>
                <select
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value as PropertyStatus)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="Available">Available</option>
                  <option value="Ready to Move">Ready to Move</option>
                  <option value="Under Negotiation">Under Negotiation</option>
                  <option value="Rented">Rented</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Floor / Tower</label>
                <input
                  type="text"
                  value={customFloor}
                  onChange={(e) => setCustomFloor(e.target.value)}
                  placeholder="e.g. 4th Floor"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="col-span-2 sm:col-span-3 lg:col-span-6">
                <label className="block text-slate-500 font-semibold mb-1">Unit Photo URL (Optional - defaults to building photo)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customImage}
                    onChange={(e) => setCustomImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or paste image link"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  {customImage && (
                    <img src={customImage} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-brand-200/50 dark:border-brand-900/30">
              <button
                type="submit"
                className="btn-glass-primary px-4 py-1.5 rounded-xl text-xs font-bold"
              >
                + Insert Unit to Building Inventory
              </button>
            </div>
          </form>
        )}

        {/* Units Interactive Editor List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Loading available properties for {building.name}...
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No units matched your filter or search query.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredUnits.map((unit) => (
                <div 
                  key={unit.id}
                  className="glass-card rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all hover:border-brand-400"
                >
                  {/* Left: Unit Identity & Thumbnail with Photo Update Trigger */}
                  <div className="flex items-center gap-3 min-w-[220px]">
                    <div 
                      onClick={() => setEditingImageUnit(unit)}
                      className="relative group/thumb w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border-2 border-slate-200 dark:border-slate-700 hover:border-brand-500 cursor-pointer shadow-sm transition-all"
                      title="Click to update photo for this unit"
                    >
                      <img src={unit.primary_image} alt="" className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-0.5 text-center">
                        <Camera className="w-4 h-4 text-brand-300" />
                        <span className="text-[9px] font-bold mt-0.5 leading-tight">Update</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-brand-500 text-white">
                          {unit.built_up_area.toLocaleString('en-IN')} sq.ft
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {unit.reference_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingImageUnit(unit)}
                          className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 bg-brand-50 dark:bg-brand-950/60 px-1.5 py-0.5 rounded-md border border-brand-200 dark:border-brand-800 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Update or change unit photo"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Change Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFullEditingUnit(unit);
                            setShowFullEditModal(true);
                          }}
                          className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 hover:text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800 flex items-center gap-1 cursor-pointer transition-colors ml-auto"
                          title="Edit full listing specifications (Images, Gallery, Tariff, Technical Specs, Key Features, Description)"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Full Listing</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={unit.title}
                        onChange={(e) => handleUpdateProperty(unit.id, { title: e.target.value })}
                        className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 px-1 py-0.5 rounded mt-0.5 w-full"
                      />
                    </div>
                  </div>

                  {/* Middle: Live Rate, Monthly Price, Furnishing, Floor */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs flex-1 max-w-xl">
                    {/* Rate per sq.ft */}
                    <div>
                      <label className="text-[10px] text-slate-400 block font-medium">Rate / sq.ft</label>
                      <input
                        type="text"
                        value={unit.rate_per_sqft || ''}
                        onChange={(e) => handleUpdateProperty(unit.id, { rate_per_sqft: e.target.value })}
                        placeholder="₹55/sq.ft"
                        className="w-full px-2 py-1 rounded-lg text-xs font-bold text-brand-600 dark:text-brand-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    {/* Monthly Price */}
                    <div>
                      <label className="text-[10px] text-slate-400 block font-medium">Monthly Rent (₹)</label>
                      <input
                        type="number"
                        value={unit.price}
                        onChange={(e) => handleUpdateProperty(unit.id, { price: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    {/* Furnishing */}
                    <div>
                      <label className="text-[10px] text-slate-400 block font-medium">Furnishing</label>
                      <select
                        value={unit.furnishing}
                        onChange={(e) => handleUpdateProperty(unit.id, { furnishing: e.target.value as FurnishingType })}
                        className="w-full px-2 py-1 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="Furnished">Furnished</option>
                        <option value="Plug-and-Play">Plug-and-Play</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Bare Shell">Bare Shell</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="text-[10px] text-slate-400 block font-medium">Status</label>
                      <select
                        value={unit.status}
                        onChange={(e) => handleUpdateProperty(unit.id, { status: e.target.value as PropertyStatus })}
                        className={`w-full px-2 py-1 rounded-lg text-xs font-bold border ${
                          unit.status === 'Available' || unit.status === 'Ready to Move'
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                            : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <option value="Available">Available</option>
                        <option value="Ready to Move">Ready to Move</option>
                        <option value="Under Negotiation">Under Negotiation</option>
                        <option value="Rented">Rented</option>
                        <option value="Sold">Sold</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setFullEditingUnit(unit);
                        setShowFullEditModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-sm shadow-brand-500/20 active:scale-95 flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Open full property listing editor (Title, Photos, Tariff, Technical Specs, Key Features, Description)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Remove this unit from building"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Changes persist immediately to website inventory and search.</span>
            {savedSuccess && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold animate-bounce">
                <CheckCircle2 className="w-4 h-4" /> Saved Successfully!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAll}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 shadow-md shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Inventory...' : `Save ${properties.length} Available Units`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* UPDATE UNIT PHOTO MODAL */}
      {editingImageUnit && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-card rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5 max-h-[92vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-brand-500 text-white">
                    {editingImageUnit.built_up_area.toLocaleString('en-IN')} sq.ft
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {editingImageUnit.reference_number}
                  </span>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    Photo Manager
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-1">
                  Update Unit Photo: {editingImageUnit.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingImageUnit(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 overflow-y-auto flex-1 pr-1">
              {/* Top Row: Current Selection Preview & Input Methods */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                {/* Preview */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-brand-500 shadow-md">
                    <img 
                      src={selectedImageUrl || editingImageUnit.primary_image} 
                      alt="Selected Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Active Selection</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 text-center">
                    This photo will be displayed across search cards, listings & detail pages.
                  </span>
                </div>

                {/* Inputs: URL or Upload */}
                <div className="md:col-span-7 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-brand-500" />
                      <span>Option A: Custom Image URL</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={inputImageUrl}
                        onChange={(e) => setInputImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or any image link"
                        className="glass-input flex-1 px-3 py-2 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (inputImageUrl.trim()) {
                            setSelectedImageUrl(inputImageUrl.trim());
                          }
                        }}
                        className="btn-glass-primary px-3 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Option B: Upload from Device</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors shadow-sm">
                      <UploadCloud className="w-4 h-4 text-brand-500" />
                      <span>Choose File (PNG, JPG, WebP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {building.hero_image && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImageUrl(building.hero_image);
                          setInputImageUrl(building.hero_image);
                        }}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Reset to "{building.name}" Building Hero Photo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Building Architecture Photos (If available) */}
              {((building.gallery && building.gallery.length > 0) || building.hero_image) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-500" />
                      <span>Building Exterior & Campus Photos ({[building.hero_image, ...(building.gallery || [])].filter(Boolean).length})</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Click to select</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {[building.hero_image, ...(building.gallery || [])].filter(Boolean).map((imgUrl, i) => {
                      const isSelected = selectedImageUrl === imgUrl;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => {
                            setSelectedImageUrl(imgUrl);
                            setInputImageUrl(imgUrl);
                          }}
                          className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            isSelected ? 'border-brand-500 ring-2 ring-brand-500/30 scale-105' : 'border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute top-1 right-1 p-0.5 rounded-full bg-brand-500 text-white">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 12 Curated Commercial Office Interior Presets */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Curated Grade-A Office Interior Presets (1-Click Apply)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Verified commercial grade images</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {CURATED_OFFICE_IMAGES.map((preset, idx) => {
                    const isSelected = selectedImageUrl === preset.url;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setSelectedImageUrl(preset.url);
                          setInputImageUrl(preset.url);
                        }}
                        className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all p-1 bg-white dark:bg-slate-900 cursor-pointer ${
                          isSelected 
                            ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-md shadow-brand-500/10' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-brand-300'
                        }`}
                      >
                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img src={preset.url} alt={preset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-950/70 text-white backdrop-blur">
                            {preset.tag}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 p-0.5 rounded-full bg-brand-500 text-white shadow">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="p-1">
                          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {preset.title}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Unit Gallery Photos Manager */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
                    <span>Additional Gallery Photos for this Unit ({selectedGallery.length})</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedGallery.map((gUrl, gIdx) => (
                    <div key={gIdx} className="relative group/g w-20 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
                      <img src={gUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(gIdx)}
                        className="absolute inset-0 bg-rose-950/80 text-white opacity-0 group-hover/g:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
                    <input
                      type="url"
                      value={newGalleryInput}
                      onChange={(e) => setNewGalleryInput(e.target.value)}
                      placeholder="Add secondary photo URL..."
                      className="glass-input flex-1 px-2.5 py-1.5 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddGalleryImage(newGalleryInput)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                Clicking save immediately updates the unit in this inventory session.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingImageUnit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUnitImage}
                  className="btn-glass-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 active:scale-95 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Apply Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT FULL PROPERTY LISTING MODAL (MATCHING IMG 1 & 2) */}
      {showFullEditModal && fullEditingUnit && (
        <EditPropertyModal
          isOpen={showFullEditModal}
          property={fullEditingUnit}
          onClose={() => {
            setShowFullEditModal(false);
            setFullEditingUnit(null);
          }}
          onSave={handleSaveFullUnit}
        />
      )}
    </div>
  );
};
