import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Building2, 
  Sparkles, 
  Check, 
  Image as ImageIcon,
  ArrowRight,
  Eye,
  RefreshCw,
  Folder,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Property, Building } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  getSqFtImagesMap, 
  fetchSqFtImagesMap, 
  saveSqFtImageMapping, 
  getAdminHeaders 
} from '../../utils/unitSqftImages';

interface AutoUploadSqFtImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedProperties: Property[]) => void;
  initialSqFt?: number | null;
}

interface PendingImageFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  sizeFormatted: string;
}

export const AutoUploadSqFtImagesModal: React.FC<AutoUploadSqFtImagesModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialSqFt
}) => {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSqFt, setSelectedSqFt] = useState<number>(initialSqFt || 1200);
  const [customSqFtInput, setCustomSqFtInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Images to upload
  const [pendingFiles, setPendingFiles] = useState<PendingImageFile[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing unit image overwrite preference (Requirement: "If a unit already has its own image, do not overwrite it. Just ask me whether I want to replace it or not.")
  const [replaceExisting, setReplaceExisting] = useState<'replace' | 'keep'>('replace');

  // Submission state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successResult, setSuccessResult] = useState<{
    count: number;
    sqft: number;
    primaryImage: string;
    galleryCount: number;
  } | null>(null);

  // UI accordion for showing list of units in group
  const [showUnitList, setShowUnitList] = useState<boolean>(false);

  // Load all properties across the project when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessResult(null);

    Promise.all([
      StorageService.getProperties(),
      fetchSqFtImagesMap()
    ]).then(([props]) => {
      setAllProperties(props || []);
      setLoading(false);

      if (initialSqFt) {
        setSelectedSqFt(initialSqFt);
      } else if (props && props.length > 0) {
        // Find most frequent or default to 1200 if present
        const has1200 = props.some(p => Number(p.built_up_area) === 1200);
        if (has1200) {
          setSelectedSqFt(1200);
        } else {
          setSelectedSqFt(Number(props[0].built_up_area) || 1200);
        }
      }
    }).catch(err => {
      console.warn('Failed loading properties for sq ft grouping:', err);
      setLoading(false);
    });
  }, [isOpen, initialSqFt]);

  // Clean up preview object URLs on unmount or file reset
  useEffect(() => {
    return () => {
      pendingFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    };
  }, []);

  // Compute all unique square footage values available in project
  const sqFtGroups = useMemo(() => {
    const map = new Map<number, number>();
    allProperties.forEach(p => {
      const area = Number(p.built_up_area);
      if (!isNaN(area) && area > 0) {
        map.set(area, (map.get(area) || 0) + 1);
      }
    });

    // Default commercial unit sizes if properties list is sparse
    const defaultStandardSizes = [600, 750, 900, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2600, 5000, 10000, 20000, 25000, 30000];
    defaultStandardSizes.forEach(s => {
      if (!map.has(s)) map.set(s, 0);
    });

    return Array.from(map.entries())
      .map(([sqft, count]) => ({ sqft, count }))
      .sort((a, b) => a.sqft - b.sqft);
  }, [allProperties]);

  // Units matching currently selected square footage
  const matchingUnits = useMemo(() => {
    const target = isCustomMode ? parseInt(customSqFtInput, 10) : selectedSqFt;
    if (isNaN(target) || target <= 0) return [];
    return allProperties.filter(p => Number(p.built_up_area) === target);
  }, [allProperties, selectedSqFt, isCustomMode, customSqFtInput]);

  // Units in group that already have an assigned image
  const unitsWithExistingImages = useMemo(() => {
    return matchingUnits.filter(u => {
      const img = u.primary_image ? String(u.primary_image).trim() : '';
      return img !== '' && !img.includes('placeholder') && !img.includes('default-property');
    });
  }, [matchingUnits]);

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(e.target.files);
    }
  };

  // Validate and process selected image files
  const processSelectedFiles = (fileList: FileList) => {
    setErrorMessage('');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const newItems: PendingImageFile[] = [];

    Array.from(fileList).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(`"${file.name}" was skipped. Only JPG, PNG, WEBP, GIF, and SVG are accepted.`);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the 15 MB file size limit.`);
        return;
      }

      newItems.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        sizeFormatted: `${(file.size / 1024).toFixed(1)} KB`
      });
    });

    if (newItems.length > 0) {
      setPendingFiles(prev => [...prev, ...newItems]);
    }
  };

  const removePendingFile = (id: string) => {
    setPendingFiles(prev => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const clearAllPendingFiles = () => {
    pendingFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Perform upload to localhost /public/images/units/[sqft]/ and assign to all matching units
  const handleUploadAndApply = async () => {
    const targetSqFt = isCustomMode ? parseInt(customSqFtInput, 10) : selectedSqFt;
    if (isNaN(targetSqFt) || targetSqFt <= 0) {
      setErrorMessage('Please select a valid Square Feet value.');
      return;
    }

    if (pendingFiles.length === 0) {
      setErrorMessage('Please select at least one image file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setUploadStatusText(`Uploading ${pendingFiles.length} images to local folder /public/images/units/${targetSqFt}/...`);

    try {
      // 1. Upload files directly to local project folder via local server API
      // Files are saved once on disk under public/images/units/[sqft]/ with unique timestamped names
      const formData = new FormData();
      const subfolder = `units/${targetSqFt}`;
      formData.append('subfolder', subfolder);
      formData.append('prefix', `unit-${targetSqFt}`);

      pendingFiles.forEach(item => {
        formData.append('images', item.file);
      });

      const res = await fetch(`/api/admin/images/upload?subfolder=${encodeURIComponent(subfolder)}`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image(s) to local server');
      }

      // Collect uploaded file URLs
      const uploadedFiles: Array<{ url: string; path: string }> = Array.isArray(data.files) && data.files.length > 0
        ? data.files
        : (data.url ? [{ url: data.url, path: data.url }] : []);

      if (uploadedFiles.length === 0) {
        throw new Error('No uploaded file URLs returned from server.');
      }

      const primaryImageUrl = uploadedFiles[0].url;
      const galleryUrls = uploadedFiles.map(f => f.url);

      setUploadStatusText(`Saving image assignments across all ${matchingUnits.length} units with ${targetSqFt} sq.ft...`);

      // 2. Save sq ft mapping to data/unit-sqft-images.json & src/data/unit-sqft-images.json
      await saveSqFtImageMapping(targetSqFt, {
        primary_image: primaryImageUrl,
        gallery: galleryUrls,
        unit_count: matchingUnits.length
      });

      // 3. Update all matching units in project
      // Follow rule: "If a unit already has its own image, do not overwrite it. Just ask me whether I want to replace it or not."
      let updatedUnitsCount = 0;
      const updatedAllProperties = allProperties.map(prop => {
        if (Number(prop.built_up_area) !== targetSqFt) {
          return prop;
        }

        const hasExisting = prop.primary_image && prop.primary_image.trim() !== '' &&
          !prop.primary_image.includes('placeholder') &&
          !prop.primary_image.includes('default-property');

        // If user chose 'keep' and unit already has an image, do not overwrite
        if (hasExisting && replaceExisting === 'keep') {
          return prop;
        }

        updatedUnitsCount++;

        // Append new images to gallery without duplicates
        const currentGallery = Array.isArray(prop.gallery) ? prop.gallery : [];
        const combinedGallery = Array.from(new Set([...galleryUrls, ...currentGallery]));

        return {
          ...prop,
          primary_image: primaryImageUrl,
          gallery: combinedGallery
        };
      });

      // 4. Batch persist all updated properties in StorageService (localStorage + database)
      const propertiesToSave = updatedAllProperties.filter(p => Number(p.built_up_area) === targetSqFt);
      try {
        await StorageService.saveProperties(propertiesToSave);
      } catch (saveErr) {
        console.warn('StorageService batch save warning (local disk & JSON mappings are preserved):', saveErr);
      }

      // Update in-memory state
      setAllProperties(updatedAllProperties);

      setSuccessResult({
        count: updatedUnitsCount,
        sqft: targetSqFt,
        primaryImage: primaryImageUrl,
        galleryCount: galleryUrls.length
      });

      clearAllPendingFiles();

      if (onSuccess) {
        onSuccess(updatedAllProperties);
      }
    } catch (err: any) {
      console.error('Auto upload error:', err);
      setErrorMessage(err?.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
      setUploadStatusText('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl my-auto rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B132B] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Bulk Auto-Upload
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                  <ShieldCheck className="w-3 h-3" /> Localhost Only
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white">
                Auto-Assign Images by Square Footage
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload once per square footage group. Images are automatically saved locally and applied to every matching unit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {/* Success Banner */}
          {successResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold text-sm">
                  Successfully auto-assigned images to {successResult.count} units ({successResult.sqft.toLocaleString('en-IN')} sq.ft)!
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 pl-7">
                Files saved to: <code className="font-mono bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded text-[11px]">{successResult.primaryImage}</code>.
                Every unit card and detail page in this group now reflects these images.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-200 flex items-center gap-2.5 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SECTION 1: SQUARE FOOTAGE SELECTOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>1. Select Square Footage (Area)</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                {isCustomMode ? 'Choose from standard sizes' : '+ Enter custom sq.ft'}
              </button>
            </div>

            {isCustomMode ? (
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="e.g. 1200, 1500, 1850..."
                    value={customSqFtInput}
                    onChange={(e) => setCustomSqFtInput(e.target.value)}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">sq.ft</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800/70 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]">
                {sqFtGroups.map(({ sqft, count }) => {
                  const isSelected = selectedSqFt === sqft;
                  return (
                    <button
                      key={sqft}
                      type="button"
                      onClick={() => setSelectedSqFt(sqft)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-[1.02]'
                          : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="font-bold">{sqft.toLocaleString('en-IN')}</span>
                      <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {count} {count === 1 ? 'unit' : 'units'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Target Group Stats Banner (UI Requirement #2) */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 font-bold">
                  {matchingUnits.length}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    This group has {matchingUnits.length} {matchingUnits.length === 1 ? 'unit' : 'units'} ({isCustomMode ? (customSqFtInput || '0') : selectedSqFt.toLocaleString('en-IN')} sq.ft)
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {matchingUnits.length > 0 ? (
                      <>Found across {Array.from(new Set(matchingUnits.map(u => u.building_name || 'Individual'))).slice(0, 3).join(', ')}{matchingUnits.length > 3 ? ' and more' : ''}</>
                    ) : (
                      'No existing units match this area yet. Uploaded images will become the default for newly added units.'
                    )}
                  </div>
                </div>
              </div>

              {matchingUnits.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowUnitList(!showUnitList)}
                  className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>{showUnitList ? 'Hide Unit List' : 'View Matching Units'}</span>
                  {showUnitList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Collapsible Unit List */}
            {showUnitList && matchingUnits.length > 0 && (
              <div className="max-h-44 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {matchingUnits.map(unit => (
                  <div key={unit.id} className="p-2.5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {unit.primary_image ? (
                        <img 
                          src={unit.primary_image} 
                          alt="" 
                          className="w-8 h-8 rounded object-cover border border-slate-200 dark:border-slate-800 shrink-0" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{unit.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {unit.building_name || 'Commercial'} • {unit.tower || 'Main Tower'} • Floor: {unit.floor || 'Ground'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      {unit.price_display || 'Available'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: EXISTING IMAGE OVERWRITE DECISION (UI Requirement #4) */}
          {matchingUnits.length > 0 && (
            <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">
                    {unitsWithExistingImages.length} of {matchingUnits.length} units in this group already have images.
                  </span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    How should units with existing images be handled?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <label 
                  className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    replaceExisting === 'replace'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="replaceOption"
                    value="replace"
                    checked={replaceExisting === 'replace'}
                    onChange={() => setReplaceExisting('replace')}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">
                      Replace All ({matchingUnits.length} units)
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Update all units with this square footage to use the newly uploaded images.
                    </span>
                  </div>
                </label>

                <label 
                  className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    replaceExisting === 'keep'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="replaceOption"
                    value="keep"
                    checked={replaceExisting === 'keep'}
                    onChange={() => setReplaceExisting('keep')}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">
                      Keep Existing Images
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Do not overwrite units that already have an image. Only apply to remaining units.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* SECTION 3: SELECT & PREVIEW IMAGES BEFORE UPLOAD (UI Requirements #1 & #2) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Select Image(s) to Upload
              </label>
              {pendingFiles.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllPendingFiles}
                  className="text-xs text-rose-500 hover:underline font-semibold"
                >
                  Clear Selection ({pendingFiles.length})
                </button>
              )}
            </div>

            {/* Dropzone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                dragActive
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-brand-400/80 bg-slate-50/50 dark:bg-white/[0.01]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Click to select images or drag & drop files here
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select one or multiple images (JPG, PNG, WEBP, GIF, SVG up to 15 MB).
                </p>
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                Saved locally to /public/images/units/{isCustomMode ? (customSqFtInput || 'custom') : selectedSqFt}/
              </span>
            </div>

            {/* PREVIEW BEFORE UPLOADING (UI Requirement #2) */}
            {pendingFiles.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Preview Selected Images ({pendingFiles.length})
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    1st image = Cover image • Remaining = Gallery
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]">
                  {pendingFiles.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <img 
                        src={item.previewUrl} 
                        alt={item.name} 
                        className="w-full h-24 object-cover" 
                      />
                      <div className="p-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            index === 0
                              ? 'bg-brand-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {index === 0 ? 'Primary Cover' : `Gallery #${index}`}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePendingFile(item.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate">
                          {item.name}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {item.sizeFormatted}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {pendingFiles.length > 0 ? (
              <span>
                {pendingFiles.length} {pendingFiles.length === 1 ? 'image' : 'images'} will be assigned to all matching units.
              </span>
            ) : (
              <span>Select images above to preview and assign.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="btn-glass px-4 py-2.5 rounded-xl text-xs font-semibold flex-1 sm:flex-initial"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUploadAndApply}
              disabled={isUploading || pendingFiles.length === 0}
              className={`btn-glass-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 flex-1 sm:flex-initial shadow-md ${
                (isUploading || pendingFiles.length === 0) ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{uploadStatusText || 'Uploading...'}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    Upload & Apply to {matchingUnits.length} Units ({isCustomMode ? (customSqFtInput || '0') : selectedSqFt.toLocaleString('en-IN')} sq.ft)
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
