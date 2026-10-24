import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Layers,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Building2,
  Sparkles,
  Check,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  RefreshCw,
  Folder,
  Plus,
  X,
  Search,
  Filter,
  ArrowRight,
  Maximize2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  HardDrive,
  Copy
} from 'lucide-react';
import { Property, Building, FurnishingType } from '../../types';
import { StorageService } from '../../services/storageService';
import { STANDARD_BUILDING_UNITS, UnitSpec } from '../../utils/buildingUnits';
import {
  getSqFtImagesMap,
  fetchSqFtImagesMap,
  saveSqFtImageMapping,
  deleteSqFtImageMapping,
  resetAllUnitImagesMap,
  normalizeSqFtKey,
  SqFtImageEntry,
  getAdminHeaders,
  safeParseJson
} from '../../utils/unitSqftImages';
import { AutoUploadSqFtImagesModal } from './AutoUploadSqFtImagesModal';

interface AdminUnitImagesManagerProps {
  onRefreshProperties?: () => void;
}

export interface UnitSizeCardItem {
  area: number;
  areaDisplay: string;
  type: string;
  furnishing: FurnishingType;
  floor?: string;
  features?: string[];
  defaultImage: string;
  defaultGallery: string[];
  customEntry: SqFtImageEntry | null;
  matchingUnitsCount: number;
  affectedBuildings: Array<{ id: string; name: string; slug: string; unitSlug?: string }>;
}

export const AdminUnitImagesManager: React.FC<AdminUnitImagesManagerProps> = ({
  onRefreshProperties
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [sqFtMap, setSqFtMap] = useState<Record<string, SqFtImageEntry>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'default' | 'compact' | 'mid' | 'large'>('all');

  // Modal states
  const [showAutoUploadModal, setShowAutoUploadModal] = useState<boolean>(false);
  const [autoUploadTargetSqFt, setAutoUploadTargetSqFt] = useState<number | null>(null);
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [managingCard, setManagingCard] = useState<UnitSizeCardItem | null>(null);

  // Expanded building coverage drawers per card
  const [expandedBuildings, setExpandedBuildings] = useState<Record<number, boolean>>({});

  // Direct card upload state: tracking which card is currently uploading
  const [uploadingSqFt, setUploadingSqFt] = useState<number | null>(null);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Add custom unit state
  const [newUnitSqFt, setNewUnitSqFt] = useState<string>('');
  const [newUnitType, setNewUnitType] = useState<string>('');
  const [newUnitFurnishing, setNewUnitFurnishing] = useState<FurnishingType>('Furnished');

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [props, blds, map] = await Promise.all([
        StorageService.getProperties(),
        StorageService.getBuildings(),
        fetchSqFtImagesMap()
      ]);
      setProperties(props || []);
      setBuildings(blds || []);
      setSqFtMap(map || {});
    } catch (err: any) {
      console.error('Failed to load unit image manager data:', err);
      setStatusMessage({ text: 'Failed to load units or images map', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      fetchSqFtImagesMap().then(map => setSqFtMap(map || {}));
    };
    window.addEventListener('shristi_unit_images_updated', handleUpdate);
    window.addEventListener('shristi_unit_images_reset', handleUpdate);

    return () => {
      window.removeEventListener('shristi_unit_images_updated', handleUpdate);
      window.removeEventListener('shristi_unit_images_reset', handleUpdate);
    };
  }, []);

  // Compute aggregated list of all unit sizes (both standard specs and any custom ones created or in properties)
  const unitCards = useMemo<UnitSizeCardItem[]>(() => {
    const mapByArea = new Map<number, UnitSizeCardItem>();

    // 1. Populate from STANDARD_BUILDING_UNITS
    STANDARD_BUILDING_UNITS.forEach(spec => {
      mapByArea.set(spec.area, {
        area: spec.area,
        areaDisplay: spec.areaDisplay,
        type: spec.type,
        furnishing: spec.furnishing,
        floor: spec.floor,
        features: spec.features,
        defaultImage: spec.image,
        defaultGallery: spec.gallery || [],
        customEntry: sqFtMap[normalizeSqFtKey(spec.area)] || null,
        matchingUnitsCount: 0,
        affectedBuildings: []
      });
    });

    // 2. Discover any additional areas defined in sqFtMap or properties
    Object.keys(sqFtMap).forEach(key => {
      const areaNum = parseInt(key, 10);
      if (!isNaN(areaNum) && areaNum > 0 && !mapByArea.has(areaNum)) {
        mapByArea.set(areaNum, {
          area: areaNum,
          areaDisplay: `${areaNum.toLocaleString('en-IN')} sq.ft.`,
          type: 'Commercial Office Space',
          furnishing: 'Furnished',
          defaultImage: '/images/units/1000/unit-1000-main.webp',
          defaultGallery: [],
          customEntry: sqFtMap[key] || null,
          matchingUnitsCount: 0,
          affectedBuildings: []
        });
      }
    });

    // 3. Associate properties & buildings with each unit size
    properties.forEach(prop => {
      const area = Number(prop.built_up_area);
      if (isNaN(area) || area <= 0) return;

      if (!mapByArea.has(area)) {
        mapByArea.set(area, {
          area,
          areaDisplay: `${area.toLocaleString('en-IN')} sq.ft.`,
          type: prop.property_type || 'Commercial Office Unit',
          furnishing: prop.furnishing || 'Furnished',
          defaultImage: prop.primary_image || '/images/units/1000/unit-1000-main.webp',
          defaultGallery: prop.gallery || [],
          customEntry: sqFtMap[normalizeSqFtKey(area)] || null,
          matchingUnitsCount: 0,
          affectedBuildings: []
        });
      }

      const item = mapByArea.get(area)!;
      item.matchingUnitsCount++;

      if (prop.building_id || prop.building_name) {
        const bldId = prop.building_id || '';
        const bldName = prop.building_name || 'Commercial Tower';
        const bldSlug = bldName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!item.affectedBuildings.some(b => b.name.toLowerCase() === bldName.toLowerCase())) {
          item.affectedBuildings.push({
            id: bldId,
            name: bldName,
            slug: bldSlug,
            unitSlug: prop.slug
          });
        }
      }
    });

    // Also populate building coverage from buildings list for standard units
    buildings.forEach(bld => {
      STANDARD_BUILDING_UNITS.forEach(spec => {
        const item = mapByArea.get(spec.area);
        if (item && !item.affectedBuildings.some(b => b.name.toLowerCase() === bld.name.toLowerCase())) {
          const areaSlug = `${spec.area}`;
          item.affectedBuildings.push({
            id: bld.id,
            name: bld.name,
            slug: bld.slug,
            unitSlug: `${areaSlug}-sqft-office-${bld.slug}`
          });
        }
      });
    });

    return Array.from(mapByArea.values()).sort((a, b) => a.area - b.area);
  }, [properties, buildings, sqFtMap]);

  // Filtered unit cards
  const filteredCards = useMemo(() => {
    return unitCards.filter(card => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesArea = String(card.area).includes(q);
        const matchesDisplay = card.areaDisplay.toLowerCase().includes(q);
        const matchesType = card.type.toLowerCase().includes(q);
        const matchesFurnishing = card.furnishing.toLowerCase().includes(q);
        const matchesBuilding = card.affectedBuildings.some(b => b.name.toLowerCase().includes(q));
        if (!matchesArea && !matchesDisplay && !matchesType && !matchesFurnishing && !matchesBuilding) {
          return false;
        }
      }

      // Type filter
      if (filterType === 'custom') return Boolean(card.customEntry);
      if (filterType === 'default') return !card.customEntry;
      if (filterType === 'compact') return card.area < 1000;
      if (filterType === 'mid') return card.area >= 1000 && card.area <= 2500;
      if (filterType === 'large') return card.area > 2500;

      return true;
    });
  }, [unitCards, searchQuery, filterType]);

  // Summary statistics
  const stats = useMemo(() => {
    const totalSizes = unitCards.length;
    const customCount = unitCards.filter(c => c.customEntry).length;
    const totalBuildingsCount = buildings.length || 15;
    const totalUnitsAffected = unitCards.reduce((acc, c) => acc + (c.matchingUnitsCount || c.affectedBuildings.length), 0);
    return { totalSizes, customCount, totalBuildingsCount, totalUnitsAffected };
  }, [unitCards, buildings]);

  // Direct card upload handler
  const handleCardFilesSelected = async (area: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (allowed.includes(f.type)) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setStatusMessage({ text: 'Please select valid image files (JPG, PNG, WebP).', type: 'error' });
      return;
    }

    setUploadingSqFt(area);
    setUploadProgressText(`Uploading ${validFiles.length} images to /public/images/units/${area}/...`);

    try {
      const formData = new FormData();
      const subfolder = `units/${area}`;
      formData.append('subfolder', subfolder);
      formData.append('prefix', `unit-${area}`);

      validFiles.forEach(f => {
        formData.append('images', f);
      });

      let uploadedList: Array<{ url: string; path: string }> = [];
      let savedToDisk = false;

      // 1. Attempt to upload directly to local disk directory via backend API
      try {
        const res = await fetch(`/api/admin/images/upload?subfolder=${encodeURIComponent(subfolder)}`, {
          method: 'POST',
          headers: getAdminHeaders(),
          body: formData
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok && data.success) {
            uploadedList = Array.isArray(data.files) && data.files.length > 0
              ? data.files
              : (data.url ? [{ url: data.url, path: data.url }] : []);
            if (uploadedList.length > 0) {
              savedToDisk = true;
            }
          }
        }
      } catch (backendErr) {
        console.warn('Backend server upload offline, switching to seamless client fallback:', backendErr);
      }

      // 2. Offline / Static host fallback: convert images into high-quality WebP Data URLs
      if (!savedToDisk || uploadedList.length === 0) {
        setUploadProgressText(`Processing ${validFiles.length} image(s) for instant local & building sync...`);
        const fallbackUrls: string[] = [];
        for (const file of validFiles) {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string) || '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
          if (dataUrl) {
            fallbackUrls.push(dataUrl);
          }
        }

        if (fallbackUrls.length === 0) {
          throw new Error('Could not process the selected image files.');
        }

        uploadedList = fallbackUrls.map(url => ({ url, path: url }));
      }

      const primaryUrl = uploadedList[0].url;
      const uploadedUrls = uploadedList.map(u => u.url);

      // Preserve any existing gallery images if present
      const currentEntry = sqFtMap[normalizeSqFtKey(area)];
      const combinedGallery = Array.from(new Set([
        ...uploadedUrls,
        ...(currentEntry?.gallery || [])
      ]));

      // Save mapping to server JSON and localStorage
      const updatedMap = await saveSqFtImageMapping(area, {
        primary_image: primaryUrl,
        gallery: combinedGallery,
        unit_count: properties.filter(p => Number(p.built_up_area) === area).length
      });

      setSqFtMap(updatedMap);
      setStatusMessage({
        text: savedToDisk
          ? `✓ Successfully uploaded ${validFiles.length} image(s) to /public/images/units/${area}/ and synced across all ${area.toLocaleString('en-IN')} sq.ft. units in all buildings!`
          : `✓ Successfully synced ${validFiles.length} image(s) across all ${area.toLocaleString('en-IN')} sq.ft. units in all buildings! (Saved to local browser storage; start "node server.js" to write files to disk)`,
        type: 'success'
      });

      // Clear the file input
      if (fileInputRefs.current[area]) {
        fileInputRefs.current[area]!.value = '';
      }

      if (onRefreshProperties) onRefreshProperties();
    } catch (err: any) {
      console.error('Direct card upload failed:', err);
      setStatusMessage({ text: err.message || 'Upload failed', type: 'error' });
    } finally {
      setUploadingSqFt(null);
      setUploadProgressText('');
    }
  };

  // Revert/Delete mapping for a card
  const handleRevertCard = async (area: number) => {
    if (!window.confirm(`Are you sure you want to revert ${area.toLocaleString('en-IN')} sq.ft. back to default template images?`)) {
      return;
    }

    try {
      const updated = await deleteSqFtImageMapping(area);
      setSqFtMap(updated);
      setStatusMessage({
        text: `✓ Reverted ${area.toLocaleString('en-IN')} sq.ft. units back to default images across all buildings.`,
        type: 'success'
      });
      if (onRefreshProperties) onRefreshProperties();
    } catch (err: any) {
      setStatusMessage({ text: 'Failed to revert image mapping: ' + err.message, type: 'error' });
    }
  };

  // Create custom unit size
  const handleCreateCustomUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const areaNum = parseInt(newUnitSqFt.replace(/[^0-9]/g, ''), 10);
    if (isNaN(areaNum) || areaNum <= 0) {
      alert('Please enter a valid numeric square footage (e.g. 2500)');
      return;
    }

    // Check if already in sqFtMap
    const key = normalizeSqFtKey(areaNum);
    if (!sqFtMap[key]) {
      // Initialize with empty mapping so card shows up
      const updated = await saveSqFtImageMapping(areaNum, {
        primary_image: '',
        gallery: [],
        unit_count: 0
      });
      setSqFtMap(updated);
    }

    setShowAddCustomModal(false);
    setNewUnitSqFt('');
    setNewUnitType('');
    setStatusMessage({
      text: `✓ Added ${areaNum.toLocaleString('en-IN')} sq.ft. unit size to manager. You can now upload local images for it!`,
      type: 'success'
    });
  };

  // Reset all
  const handleResetAll = async () => {
    if (!window.confirm('Are you sure you want to reset ALL unit sq.ft. image mappings to default? This cannot be undone.')) {
      return;
    }
    try {
      await resetAllUnitImagesMap();
      setSqFtMap({});
      setStatusMessage({ text: '✓ All unit image overrides have been reset to project defaults.', type: 'success' });
      if (onRefreshProperties) onRefreshProperties();
    } catch (err: any) {
      setStatusMessage({ text: 'Failed to reset: ' + err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/80 to-brand-50/30 dark:from-[#0B132B] dark:via-[#090E22] dark:to-[#0B1A3A] p-5 sm:p-7 shadow-lg">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Info */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Local Storage & Global Building Auto-Sync</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-slate-900 dark:text-white tracking-tight">
              Unit Images & Building Auto-Propagation
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Upload local photos for any commercial unit size (e.g., 600, 1,000, 1,200 sq.ft.). Images are saved directly on disk in{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px] text-brand-600 dark:text-brand-400">
                /public/images/units/[sqft]/
              </code>{' '}
              and <strong>instantly update that same unit across every commercial tower page</strong> on your website.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-xs">
                <Layers className="w-4 h-4 text-brand-500" />
                <span className="text-slate-500 dark:text-slate-400">Unit Sizes:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.totalSizes}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-xs">
                <Building2 className="w-4 h-4 text-indigo-500" />
                <span className="text-slate-500 dark:text-slate-400">Buildings Covered:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.totalBuildingsCount} Towers</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-slate-500 dark:text-slate-400">Custom Photos Active:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{stats.customCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-xs">
                <HardDrive className="w-4 h-4 text-amber-500" />
                <span className="text-slate-500 dark:text-slate-400">Destination:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">Local Project Files</span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setAutoUploadTargetSqFt(null);
                setShowAutoUploadModal(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Bulk Auto-Upload Wizard</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddCustomModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-brand-500" />
              <span>Add Custom Unit Size</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Reload from disk JSON"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Reload</span>
              </button>

              <button
                type="button"
                onClick={handleResetAll}
                className="px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Reset all custom unit images to clean template defaults"
              >
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS NOTIFICATION TOAST */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:opacity-75 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by sq.ft. (e.g. 1200), unit type, or building..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-9 pr-3.5 py-2 rounded-xl text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Sizes ({unitCards.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              filterType === 'custom'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Custom Photos ({stats.customCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('default')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'default'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Template Default ({unitCards.length - stats.customCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('compact')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'compact'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            &lt; 1,000 sq.ft.
          </button>
          <button
            type="button"
            onClick={() => setFilterType('mid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'mid'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            1,000 - 2,500 sq.ft.
          </button>
          <button
            type="button"
            onClick={() => setFilterType('large')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'large'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            2,500+ sq.ft.
          </button>
        </div>
      </div>

      {/* UNIT CARDS GRID */}
      {filteredCards.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-8 space-y-3">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No unit sizes match your filter</h3>
          <p className="text-xs text-slate-500">Try clearing the search query or reset the filter.</p>
          <button
            onClick={() => { setSearchQuery(''); setFilterType('all'); }}
            className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => {
            const hasCustom = Boolean(card.customEntry && card.customEntry.primary_image);
            const activePrimaryImage = card.customEntry?.primary_image || card.defaultImage;
            const activeGallery = card.customEntry?.gallery && card.customEntry.gallery.length > 0
              ? card.customEntry.gallery
              : card.defaultGallery;
            const isUploadingThis = uploadingSqFt === card.area;
            const isDrawerOpen = Boolean(expandedBuildings[card.area]);

            return (
              <div
                key={card.area}
                className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white dark:bg-[#0B132B] shadow-sm hover:shadow-md ${
                  hasCustom
                    ? 'border-emerald-500/40 dark:border-emerald-500/30 ring-1 ring-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-brand-500/50'
                }`}
              >
                {/* CARD HEADER */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/25">
                      {card.areaDisplay}
                    </span>

                    {hasCustom ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Local Disk Active</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        Default Template
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {card.type}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{card.furnishing}</span>
                      {card.floor && <span>• {card.floor}</span>}
                    </div>
                  </div>

                  {/* Local path info badge */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                    <Folder className="w-3 h-3 text-brand-400 shrink-0" />
                    <span className="truncate">public/images/units/{card.area}/</span>
                  </div>
                </div>

                {/* IMAGE PREVIEW STAGE */}
                <div className="relative group/img bg-slate-950 aspect-[16/10] overflow-hidden select-none">
                  <img
                    src={activePrimaryImage}
                    alt={`${card.areaDisplay} ${card.type}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Overlay Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm border border-white/10">
                      Primary Cover
                    </span>
                    {activeGallery.length > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-600/90 text-white backdrop-blur-sm shadow-sm">
                        +{activeGallery.length} Gallery Photos
                      </span>
                    )}
                  </div>

                  {/* View Lightbox button on hover */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewImageModal(activePrimaryImage)}
                      className="p-2 rounded-xl bg-white/90 text-slate-900 hover:bg-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      title="Enlarge Cover Photo"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Uploading Spinner Overlay */}
                  {isUploadingThis && (
                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                      <RefreshCw className="w-7 h-7 text-brand-400 animate-spin mb-2" />
                      <p className="text-xs font-bold text-white">Saving to Local Project Files...</p>
                      <p className="text-[10px] text-slate-300 mt-1">{uploadProgressText}</p>
                    </div>
                  )}
                </div>

                {/* GALLERY THUMBNAIL STRIP */}
                {activeGallery.length > 0 && (
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0">
                      Gallery:
                    </span>
                    {activeGallery.slice(0, 5).map((imgUrl, gIdx) => (
                      <button
                        key={gIdx}
                        type="button"
                        onClick={() => setPreviewImageModal(imgUrl)}
                        className="relative w-10 h-8 rounded overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-brand-500 shrink-0 group/thumb transition-all"
                      >
                        <img
                          src={imgUrl}
                          alt={`Gallery ${gIdx + 1}`}
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </button>
                    ))}
                    {activeGallery.length > 5 && (
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        +{activeGallery.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* BUILDING COVERAGE EXPANDER */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0B132B]">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedBuildings((prev) => ({
                        ...prev,
                        [card.area]: !prev[card.area]
                      }))
                    }
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        Auto-synced to{' '}
                        <strong className="text-slate-900 dark:text-white">
                          {card.affectedBuildings.length || stats.totalBuildingsCount} Commercial Buildings
                        </strong>
                      </span>
                    </div>
                    {isDrawerOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {/* Expanded Building List */}
                  {isDrawerOpen && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {card.affectedBuildings.map((bld, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 text-[11px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60"
                        >
                          <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                            {bld.name}
                          </span>
                          {bld.unitSlug ? (
                            <a
                              href={`/properties/${bld.unitSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5 shrink-0 text-[10px]"
                            >
                              <span>View Unit Page</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <a
                              href={`/properties/${bld.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5 shrink-0 text-[10px]"
                            >
                              <span>View Tower</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CARD FOOTER ACTIONS */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {/* Hidden Native File Input for Direct Local Upload */}
                    <input
                      type="file"
                      ref={(el) => { fileInputRefs.current[card.area] = el; }}
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={(e) => handleCardFilesSelected(card.area, e.target.files)}
                      className="hidden"
                      id={`file-input-${card.area}`}
                    />

                    {/* Direct Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[card.area]?.click()}
                      disabled={isUploadingThis}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 active:scale-95 shadow-sm shadow-brand-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{hasCustom ? 'Upload More / Replace' : 'Upload Local Photos'}</span>
                    </button>

                    {/* Manage Details Button */}
                    <button
                      type="button"
                      onClick={() => setManagingCard(card)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="Manage cover, gallery and details"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>Manage</span>
                    </button>
                  </div>

                  {/* Revert link if custom */}
                  {hasCustom && (
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Live in all building pages
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRevertCard(card.area)}
                        className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        Revert to default
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MANAGE UNIT PHOTOS MODAL */}
      {managingCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Manage Photos & Auto-Sync
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {managingCard.areaDisplay} — {managingCard.type}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setManagingCard(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Primary Image Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Primary Cover Image
                </label>
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <img
                    src={managingCard.customEntry?.primary_image || managingCard.defaultImage}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md text-[11px] font-bold bg-brand-600 text-white shadow">
                    Cover Photo
                  </div>
                </div>
              </div>

              {/* Upload More Photos directly */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Upload Local Photos to /public/images/units/{managingCard.area}/
                </label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/40">
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={async (e) => {
                      if (e.target.files) {
                        await handleCardFilesSelected(managingCard.area, e.target.files);
                        // Refresh managing card with new customEntry
                        const updated = getSqFtImagesMap()[normalizeSqFtKey(managingCard.area)];
                        setManagingCard((prev) => (prev ? { ...prev, customEntry: updated } : null));
                      }
                    }}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-brand-500 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to select local image files (JPG, PNG, WebP)
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Images will be stored in your project files and applied across all buildings immediately
                  </span>
                </label>
              </div>

              {/* Gallery Photos List */}
              {managingCard.customEntry?.gallery && managingCard.customEntry.gallery.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Gallery Images ({managingCard.customEntry.gallery.length})
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {managingCard.customEntry.gallery.map((gUrl, idx) => {
                      const isCover = gUrl === managingCard.customEntry?.primary_image;
                      return (
                        <div
                          key={idx}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-900"
                        >
                          <img src={gUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                          {isCover && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-600 text-white">
                              Cover
                            </span>
                          )}
                          <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const updatedMap = await saveSqFtImageMapping(managingCard.area, {
                                    ...managingCard.customEntry!,
                                    primary_image: gUrl
                                  });
                                  setSqFtMap(updatedMap);
                                  setManagingCard((prev) =>
                                    prev ? { ...prev, customEntry: updatedMap[normalizeSqFtKey(managingCard.area)] } : null
                                  );
                                }}
                                className="px-2 py-1 rounded bg-white text-slate-900 text-[10px] font-bold shadow hover:bg-slate-100"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={async () => {
                                const newGal = (managingCard.customEntry?.gallery || []).filter((g) => g !== gUrl);
                                const newPrimary =
                                  managingCard.customEntry?.primary_image === gUrl
                                    ? newGal[0] || ''
                                    : managingCard.customEntry?.primary_image || '';
                                const updatedMap = await saveSqFtImageMapping(managingCard.area, {
                                  ...managingCard.customEntry!,
                                  primary_image: newPrimary,
                                  gallery: newGal
                                });
                                setSqFtMap(updatedMap);
                                setManagingCard((prev) =>
                                  prev ? { ...prev, customEntry: updatedMap[normalizeSqFtKey(managingCard.area)] } : null
                                );
                              }}
                              className="p-1 rounded bg-rose-600 text-white hover:bg-rose-500"
                              title="Remove from gallery"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Any changes made are synced automatically across all building pages.
              </span>
              <button
                type="button"
                onClick={() => setManagingCard(null)}
                className="btn-glass-primary px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM UNIT SIZE MODAL */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomUnit}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Custom Unit Size
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Create a new unit size to manage and upload local photos for across your website.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Square Footage (sq.ft.) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2500"
                  value={newUnitSqFt}
                  onChange={(e) => setNewUnitSqFt(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Unit Type Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Director Floorplate or Tech Wing"
                  value={newUnitType}
                  onChange={(e) => setNewUnitType(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Furnishing
                </label>
                <select
                  value={newUnitFurnishing}
                  onChange={(e) => setNewUnitFurnishing(e.target.value as FurnishingType)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs mt-1"
                >
                  <option value="Furnished">Furnished</option>
                  <option value="Plug-and-Play">Plug-and-Play</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Bare Shell">Bare Shell</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-glass-primary px-5 py-2 rounded-xl text-xs font-bold"
              >
                Create Unit Size
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FULL-SIZE IMAGE PREVIEW LIGHTBOX */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <img src={previewImageModal} alt="Preview" className="w-full h-full object-contain max-h-[85vh]" />
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* BULK AUTO-UPLOAD WIZARD MODAL */}
      <AutoUploadSqFtImagesModal
        isOpen={showAutoUploadModal}
        onClose={() => {
          setShowAutoUploadModal(false);
          setAutoUploadTargetSqFt(null);
        }}
        initialSqFt={autoUploadTargetSqFt}
        onSuccess={() => {
          loadData();
          if (onRefreshProperties) onRefreshProperties();
        }}
      />
    </div>
  );
};
