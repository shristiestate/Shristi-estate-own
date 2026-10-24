import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Folder, 
  ExternalLink,
  Layers,
  Sparkles,
  Eye,
  SlidersHorizontal,
  Save,
  HardDrive,
  Plus,
  X,
  CheckSquare,
  Square,
  Building2,
  Home,
  Tag,
  ArrowRight
} from 'lucide-react';
import { getSiteImages, saveSiteImagesLocally, SiteImagesConfig } from '../../utils/siteImages';
import { StorageService } from '../../services/storageService';
import { Property, Building } from '../../types';
import { AutoUploadSqFtImagesModal } from './AutoUploadSqFtImagesModal';

export interface LocalImageItem {
  name: string;
  path: string;
  subfolder: string;
  relativePath: string;
  size: number;
  sizeFormatted: string;
  modified: string;
  createdAt: string;
}

export interface PendingUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  sizeFormatted: string;
}

export const AdminLocalImagesManager: React.FC = () => {
  // Image library state
  const [images, setImages] = useState<LocalImageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Batch Upload state (10-25+ images at a time)
  const [selectedFolder, setSelectedFolder] = useState<string>('uploads');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [pendingFiles, setPendingFiles] = useState<PendingUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replace modal / state
  const [replaceTarget, setReplaceTarget] = useState<LocalImageItem | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string>('');
  const [isReplacing, setIsReplacing] = useState<boolean>(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Assign to Unit / Building modal state
  const [assignTarget, setAssignTarget] = useState<LocalImageItem | null>(null);
  const [assignMode, setAssignMode] = useState<'unit' | 'building'>('unit');
  const [assignSlot, setAssignSlot] = useState<'cover' | 'gallery'>('cover');
  const [buildingsList, setBuildingsList] = useState<Building[]>([]);
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [assignFilterBuilding, setAssignFilterBuilding] = useState<string>('all');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterFolder, setFilterFolder] = useState<string>('All');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  // Gallery Multi-selection for bulk operations
  const [selectedGalleryPaths, setSelectedGalleryPaths] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  // Site Images Config (data/site-images.json)
  const [siteConfig, setSiteConfig] = useState<SiteImagesConfig>(() => getSiteImages());
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [showConfigSection, setShowConfigSection] = useState<boolean>(false);
  const [showSqFtModal, setShowSqFtModal] = useState<boolean>(false);

  // Recycle Bin / Restore Trash state
  const [trashItems, setTrashItems] = useState<Array<{
    id: string;
    name: string;
    relativePath: string;
    path: string;
    sizeFormatted: string;
    deletedAt: string;
    storedFilename: string;
  }>>([]);
  const [showTrashSection, setShowTrashSection] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  // Admin auth headers
  const getAuthHeaders = () => ({
    'x-admin-auth': 'true',
    'Authorization': 'Bearer shristi-admin-authorized'
  });

  const fetchImages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/images', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load local images');
      }
      setImages(data.images || []);
    } catch (err: any) {
      console.error('Error fetching images:', err);
      setError(err?.message || 'Could not connect to image management API');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrash = async () => {
    try {
      const res = await fetch('/api/admin/images/trash', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.trash)) {
        setTrashItems(data.trash);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleRestoreImage = async (itemOrPath: string) => {
    setIsRestoring(true);
    setError('');
    try {
      const res = await fetch('/api/admin/images/restore', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: itemOrPath })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to restore image');
      }
      setSuccessMessage(data.message || 'Image restored successfully to project folder!');
      fetchImages();
      fetchTrash();
    } catch (err: any) {
      setError(err?.message || 'Error restoring image');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all items in the Recycle Bin? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/images/trash', {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Recycle Bin emptied successfully.');
        setTrashItems([]);
      }
    } catch (err: any) {
      setError('Failed to empty recycle bin');
    }
  };

  const fetchSiteConfig = async () => {
    try {
      const res = await fetch('/api/admin/site-images', {
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setSiteConfig(prev => ({ ...prev, ...json.data }));
      }
    } catch (err) {
      // fallback to local config
    }
  };

  useEffect(() => {
    fetchImages();
    fetchSiteConfig();
    fetchTrash();
  }, []);

  // Clear messages after 4s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      pendingFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  // Handle Drag & Drop
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
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  // Handle selecting multiple files (e.g. 10 - 25+ images at a time)
  const handleFilesSelect = (filesList: FileList | File[]) => {
    setError('');
    const files = Array.from(filesList);
    if (!files.length) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const newItems: PendingUploadItem[] = [];
    let invalidCount = 0;
    let oversizedCount = 0;

    for (const file of files) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext);
      if (!validTypes.includes(file.type) && !isValidExt) {
        invalidCount++;
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        oversizedCount++;
        continue;
      }

      newItems.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        sizeFormatted: `${(file.size / 1024).toFixed(1)} KB`
      });
    }

    if (invalidCount > 0) {
      setError(`Skipped ${invalidCount} file(s) with invalid format. Allowed: JPG, PNG, WEBP, GIF, SVG.`);
    } else if (oversizedCount > 0) {
      setError(`Skipped ${oversizedCount} file(s) exceeding 15 MB limit.`);
    }

    if (newItems.length > 0) {
      setPendingFiles(prev => {
        const combined = [...prev, ...newItems];
        if (combined.length > 50) {
          setError(`Selected first 50 images (maximum per batch).`);
          return combined.slice(0, 50);
        }
        return combined;
      });
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
    pendingFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit batch upload of 10-25+ images
  const handleUploadSubmit = async () => {
    if (pendingFiles.length === 0) return;
    setIsUploading(true);
    setError('');
    setUploadProgressText(`Uploading ${pendingFiles.length} images to public/images/${selectedFolder}/...`);

    const formData = new FormData();
    formData.append('subfolder', selectedFolder);
    pendingFiles.forEach(item => {
      formData.append('images', item.file);
    });

    try {
      const res = await fetch(`/api/admin/images/upload?subfolder=${encodeURIComponent(selectedFolder)}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload images');
      }

      const count = data.count || pendingFiles.length;
      setSuccessMessage(`Successfully uploaded ${count} image${count > 1 ? 's' : ''} directly to public/images/${selectedFolder}/`);
      clearAllPendingFiles();
      fetchImages();
    } catch (err: any) {
      setError(err?.message || 'Error uploading images');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  // Handle Image Replace
  const handleReplaceSubmit = async () => {
    if (!replaceTarget || !replaceFile) return;
    setIsReplacing(true);
    setError('');

    const formData = new FormData();
    formData.append('image', replaceFile);
    formData.append('targetPath', replaceTarget.relativePath);

    try {
      const res = await fetch(`/api/admin/images/replace?targetPath=${encodeURIComponent(replaceTarget.relativePath)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to replace image');
      }

      setSuccessMessage(`Replaced ${replaceTarget.name} successfully. The existing path was preserved.`);
      setReplaceTarget(null);
      setReplaceFile(null);
      setReplacePreview('');
      fetchImages();
    } catch (err: any) {
      setError(err?.message || 'Error replacing image');
    } finally {
      setIsReplacing(false);
    }
  };

  // Handle Image Deletion
  const handleDeleteImage = async (item: LocalImageItem) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${item.name} from public/images? This action cannot be undone.`);
    if (!confirmed) return;

    setError('');
    try {
      const res = await fetch(`/api/admin/images?path=${encodeURIComponent(item.relativePath)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete image');
      }

      setSuccessMessage(`Deleted ${item.name} from local project folder.`);
      fetchImages();
    } catch (err: any) {
      setError(err?.message || 'Error deleting image');
    }
  };

  // Copy Path to Clipboard
  const handleCopyPath = (pathStr: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pathStr);
      setCopiedPath(pathStr);
      setTimeout(() => setCopiedPath(null), 2000);
    }
  };

  // Load buildings & properties for assigning images
  const loadEntitiesForAssignment = async () => {
    try {
      const [blds, props] = await Promise.all([
        StorageService.getBuildings(),
        StorageService.getProperties()
      ]);
      setBuildingsList(blds || []);
      setPropertiesList(props || []);
      if (blds && blds.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(blds[0].id);
      }
      if (props && props.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(props[0].id);
      }
    } catch (err) {
      console.warn('Could not load buildings or properties for assignment:', err);
    }
  };

  // Submit assignment of image to chosen unit or building
  const handleAssignSubmit = async () => {
    if (!assignTarget) return;
    setIsAssigning(true);
    setError('');

    try {
      if (assignMode === 'unit') {
        if (!selectedPropertyId) {
          throw new Error('Please select a unit/property to assign this image to.');
        }
        const prop = propertiesList.find(p => p.id === selectedPropertyId);
        if (!prop) {
          throw new Error('Selected property could not be found.');
        }

        const currentGallery = Array.isArray(prop.gallery) ? [...prop.gallery] : [];
        const updated: Property = {
          ...prop,
          gallery: currentGallery
        };

        if (assignSlot === 'cover') {
          if (updated.primary_image && updated.primary_image !== assignTarget.path && !updated.gallery.includes(updated.primary_image)) {
            updated.gallery.unshift(updated.primary_image);
          }
          updated.primary_image = assignTarget.path;
        } else {
          if (!updated.gallery.includes(assignTarget.path)) {
            updated.gallery.push(assignTarget.path);
          }
        }

        await StorageService.saveProperty(updated);
        setPropertiesList(prev => prev.map(p => p.id === updated.id ? updated : p));
        setSuccessMessage(`Assigned "${assignTarget.name}" to unit "${updated.title}" successfully as ${assignSlot === 'cover' ? 'primary cover image' : 'gallery image'}!`);
        setAssignTarget(null);
      } else {
        if (!selectedBuildingId) {
          throw new Error('Please select a building to assign this image to.');
        }
        const bld = buildingsList.find(b => b.id === selectedBuildingId);
        if (!bld) {
          throw new Error('Selected building could not be found.');
        }

        const currentGallery = Array.isArray(bld.gallery) ? [...bld.gallery] : [];
        const updated: Building = {
          ...bld,
          gallery: currentGallery
        };

        if (assignSlot === 'cover') {
          if (updated.hero_image && updated.hero_image !== assignTarget.path && !updated.gallery.includes(updated.hero_image)) {
            updated.gallery.unshift(updated.hero_image);
          }
          updated.hero_image = assignTarget.path;
        } else {
          if (!updated.gallery.includes(assignTarget.path)) {
            updated.gallery.push(assignTarget.path);
          }
        }

        await StorageService.saveBuilding(updated);
        setBuildingsList(prev => prev.map(b => b.id === updated.id ? updated : b));
        setSuccessMessage(`Assigned "${assignTarget.name}" to building "${updated.name}" successfully as ${assignSlot === 'cover' ? 'primary cover image' : 'gallery image'}!`);
        setAssignTarget(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to assign image');
    } finally {
      setIsAssigning(false);
    }
  };

  // Save Site-Images.json config
  const handleSaveSiteConfig = async () => {
    setIsSavingConfig(true);
    setError('');
    try {
      // 1. Save locally to localStorage + broadcast event
      saveSiteImagesLocally(siteConfig);

      // 2. Persist to data/site-images.json on disk
      const res = await fetch('/api/admin/site-images', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(siteConfig)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to write data/site-images.json');
      }

      setSuccessMessage('Site image choices saved to data/site-images.json on local disk!');
    } catch (err: any) {
      setError(err?.message || 'Failed to save site images configuration');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Toggle selection for bulk actions in gallery
  const handleToggleSelectGallery = (pathStr: string) => {
    setSelectedGalleryPaths(prev => {
      const next = new Set(prev);
      if (next.has(pathStr)) {
        next.delete(pathStr);
      } else {
        next.add(pathStr);
      }
      return next;
    });
  };

  const handleSelectAllGallery = () => {
    if (selectedGalleryPaths.size === filteredImages.length) {
      setSelectedGalleryPaths(new Set());
    } else {
      setSelectedGalleryPaths(new Set(filteredImages.map(img => img.path)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGalleryPaths.size === 0) return;
    const count = selectedGalleryPaths.size;
    const confirmed = window.confirm(`Are you sure you want to delete ${count} selected image${count > 1 ? 's' : ''} from public/images? This action cannot be undone.`);
    if (!confirmed) return;

    setIsBulkDeleting(true);
    setError('');
    try {
      const pathsArray = Array.from(selectedGalleryPaths);
      const res = await fetch(`/api/admin/images?path=${encodeURIComponent(pathsArray.join(','))}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete selected images');
      }

      setSuccessMessage(`Deleted ${data.deletedCount || count} image${count > 1 ? 's' : ''} from local project folder.`);
      setSelectedGalleryPaths(new Set());
      fetchImages();
    } catch (err: any) {
      setError(err?.message || 'Error deleting selected images');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkCopyPaths = () => {
    if (selectedGalleryPaths.size === 0) return;
    const text = Array.from(selectedGalleryPaths).join('\n');
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setSuccessMessage(`Copied ${selectedGalleryPaths.size} image path${selectedGalleryPaths.size > 1 ? 's' : ''} to clipboard!`);
    }
  };

  const POPULAR_UNIT_SIZES = ['600', '700', '800', '900', '1000', '2000', '5000', '10000'];
  const ALL_UNIT_SIZES = ['600', '700', '750', '800', '900', '1000', '1200', '1400', '1600', '1800', '2000', '2200', '2600', '5000', '10000', '20000', '25000', '30000'];
  const STANDARD_FOLDERS = ['uploads', 'properties', 'towers', 'categories', 'hero', 'gallery'];

  // Discover all unique subfolders present in the project directory
  const discoveredFolders = Array.from(new Set(images.map(img => img.subfolder).filter(Boolean))).sort();

  const filteredImages = images.filter((img) => {
    const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          img.path.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFolder = true;
    if (filterFolder === 'All') {
      matchesFolder = true;
    } else if (filterFolder === 'units_all') {
      matchesFolder = img.subfolder.startsWith('units') || img.path.includes('/units/');
    } else if (filterFolder.startsWith('unit_')) {
      const size = filterFolder.replace('unit_', '');
      matchesFolder = img.subfolder === `units/${size}` || img.path.includes(`/units/${size}/`);
    } else {
      matchesFolder = img.subfolder === filterFolder;
    }
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Architecture Assurance Card */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400">
                <HardDrive className="w-3.5 h-3.5" />
                <span>100% Local Project Disk Storage</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-mono">
                public/images/
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white mt-1">
              Project Image Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Upload, organize, and replace images stored directly inside this project folder (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-mono text-[11px]">public/images/</code>). Zero cloud dependencies (No Supabase, Firebase, or S3).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !showTrashSection;
                setShowTrashSection(next);
                if (next) fetchTrash();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                showTrashSection
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-amber-500'
              }`}
              title="View and restore deleted images"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Recycle Bin ({trashItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSqFtModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-brand-500/40 bg-brand-50/60 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Auto-upload images to all units with the same square footage"
            >
              <Layers className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Auto-Upload by Sq Ft</span>
            </button>
            <button
              type="button"
              onClick={() => setShowConfigSection(!showConfigSection)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand-500 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>{showConfigSection ? 'Hide Site Mapping' : 'Site Image Slots (JSON)'}</span>
            </button>
            <button
              type="button"
              onClick={fetchImages}
              className="p-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand-500 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Refresh Image List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
            <button type="button" onClick={() => setError('')} className="text-rose-500 hover:text-rose-700">✕</button>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
            <button type="button" onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}
      </div>

      {/* Recycle Bin & Restore Drawer */}
      {showTrashSection && (
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20 shadow-md space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                  Recycle Bin
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                  {trashItems.length} Deleted Image{trashItems.length === 1 ? '' : 's'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-['Outfit'] text-slate-900 dark:text-white">
                Deleted Images Restore Center
              </h3>
              <p className="text-xs text-slate-500">
                Any deleted image can be restored back to its original location in <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">public/images/</code> with zero errors.
              </p>
            </div>
            {trashItems.length > 0 && (
              <button
                type="button"
                onClick={handleEmptyTrash}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Recycle Bin</span>
              </button>
            )}
          </div>

          {trashItems.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-amber-200 dark:border-amber-900/40 rounded-2xl bg-white/40 dark:bg-slate-900/40">
              <CheckCircle2 className="w-8 h-8 text-amber-500/70 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Recycle Bin is empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">When you delete images, they are safely preserved here for instant restoration.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {trashItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate" title={item.relativePath}>
                      Original: {item.relativePath}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{item.sizeFormatted}</span>
                      <span>•</span>
                      <span>{new Date(item.deletedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRestoreImage(item.id)}
                    disabled={isRestoring}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRestoring ? 'animate-spin' : ''}`} />
                    <span>Restore</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Site Images Mapping Drawer (data/site-images.json) */}
      {showConfigSection && (
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-500/30 bg-brand-50/20 dark:bg-brand-950/20 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 font-mono">
                data/site-images.json
              </span>
              <h3 className="text-base sm:text-lg font-bold font-['Outfit'] text-slate-900 dark:text-white">
                Website Key Image Slots
              </h3>
              <p className="text-xs text-slate-500">
                Configure which local images render for the Hero section, Founder portrait, and Category pages.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveSiteConfig}
              disabled={isSavingConfig}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingConfig ? 'Saving...' : 'Save to site-images.json'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* Hero Desktop */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hero Desktop Image Path:
              </label>
              <input
                type="text"
                value={siteConfig.hero.desktop}
                onChange={(e) => setSiteConfig({
                  ...siteConfig,
                  hero: { ...siteConfig.hero, desktop: e.target.value }
                })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                placeholder="/hero-commercial-park.jpg"
              />
            </div>

            {/* Hero Mobile */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hero Mobile Image Path:
              </label>
              <input
                type="text"
                value={siteConfig.hero.mobile}
                onChange={(e) => setSiteConfig({
                  ...siteConfig,
                  hero: { ...siteConfig.hero, mobile: e.target.value }
                })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                placeholder="/hero-commercial-park-mobile.jpg"
              />
            </div>

            {/* Founder Portrait */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Founder Portrait Path:
              </label>
              <input
                type="text"
                value={siteConfig.founder.image}
                onChange={(e) => setSiteConfig({
                  ...siteConfig,
                  founder: { ...siteConfig.founder, image: e.target.value }
                })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                placeholder="/images/founder.jpg"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Batch Drag-and-Drop & File Picker Upload Zone (10-25+ images at a time) */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                <Layers className="w-3 h-3" />
                <span>Batch Upload Supported (10–25+ Photos)</span>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold font-['Outfit'] text-slate-900 dark:text-white mt-1">
              Upload Images to Local Project
            </h3>
            <p className="text-xs text-slate-500">
              Files are saved directly to disk in <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">public/images/{selectedFolder}/</span>
            </p>
          </div>

          {/* Subfolder Picker */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unit Sizes:</span>
              {POPULAR_UNIT_SIZES.map((sz) => {
                const folderKey = `units/${sz}`;
                return (
                  <button
                    key={folderKey}
                    type="button"
                    onClick={() => setSelectedFolder(folderKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      selectedFolder === folderKey
                        ? 'bg-brand-600 text-white font-bold shadow-xs ring-1 ring-brand-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sz} sq.ft
                  </button>
                );
              })}
              <select
                value={selectedFolder.startsWith('units/') ? selectedFolder : ''}
                onChange={(e) => {
                  if (e.target.value) setSelectedFolder(e.target.value);
                }}
                className="px-2 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                <option value="">More sizes...</option>
                {ALL_UNIT_SIZES.filter(sz => !POPULAR_UNIT_SIZES.includes(sz)).map(sz => (
                  <option key={sz} value={`units/${sz}`}>
                    units/{sz} ({sz} sq.ft)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Core Folders:</span>
              {STANDARD_FOLDERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFolder(f)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    selectedFolder === f
                      ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden Multi-file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesSelect(e.target.files);
            }
          }}
          className="hidden"
        />

        {pendingFiles.length > 0 ? (
          <div className="space-y-4">
            {/* Batch Summary & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-brand-500/10 dark:bg-brand-950/40 border border-brand-500/25">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold font-mono bg-brand-600 text-white shadow-xs">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{pendingFiles.length} Images Selected</span>
                </span>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                  Total: {(pendingFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                  Destination: <code className="text-brand-600 dark:text-brand-400 font-bold">public/images/{selectedFolder}/</code>
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-500 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-600" />
                  <span>Add More</span>
                </button>

                <button
                  type="button"
                  onClick={clearAllPendingFiles}
                  disabled={isUploading}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  Clear All
                </button>

                <button
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
                  <span>{isUploading ? 'Uploading Batch to Disk...' : `Upload All (${pendingFiles.length} Images)`}</span>
                </button>
              </div>
            </div>

            {/* Uploading progress indicator */}
            {isUploading && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-600" />
                    <span>{uploadProgressText}</span>
                  </span>
                  <span className="font-semibold text-brand-600">Writing {pendingFiles.length} files to disk...</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full animate-pulse w-full" />
                </div>
              </div>
            )}

            {/* Thumbnail Gallery Grid of Selected Photos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800">
              {pendingFiles.map((item, idx) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/80 text-white backdrop-blur-xs">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePendingFile(item.id);
                      }}
                      disabled={isUploading}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-xs shadow-md transition-all cursor-pointer"
                      title="Remove from batch"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <p className="text-[11px] font-mono text-slate-800 dark:text-slate-200 truncate font-semibold" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {item.sizeFormatted}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty Drag & Drop Area */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all cursor-pointer relative overflow-hidden ${
              dragActive
                ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-brand-500/60 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex flex-col items-center gap-2.5 py-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Drag and drop 10–25 images here, or <span className="text-brand-600 dark:text-brand-400 underline">browse files</span>
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Batch upload supported — select 10 to 25+ photos simultaneously to store into <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">public/images/{selectedFolder}/</span>.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Up to 50 images per batch • Up to 15 MB each • JPG, PNG, WebP, GIF, SVG
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Current Images Grid Header & Filters */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-['Outfit'] text-slate-900 dark:text-white">
              Project Image Gallery ({filteredImages.length})
            </h3>
            <p className="text-xs text-slate-500">
              Browse stored images, copy paths, replace files, or use multi-select for batch delete/copy.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-44 sm:w-56 focus:outline-brand-500"
              />
            </div>

            {/* Select All Toggle */}
            {filteredImages.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllGallery}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-brand-500 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {selectedGalleryPaths.size === filteredImages.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-brand-600" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Select All ({filteredImages.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bulk Action Bar when images are selected in Gallery */}
        {selectedGalleryPaths.size > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-brand-500/10 dark:bg-brand-950/40 border border-brand-500/25 text-xs animate-fadeIn flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-700 dark:text-brand-300 font-mono">
                {selectedGalleryPaths.size} image{selectedGalleryPaths.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkCopyPaths}
                className="px-3 py-1.5 rounded-lg font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-brand-500 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Paths</span>
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-3 py-1.5 rounded-lg font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedGalleryPaths.size})`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Folder Filter Pills */}
        <div className="space-y-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setFilterFolder('All')}
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                filterFolder === 'All'
                  ? 'bg-brand-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Images ({images.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterFolder('units_all')}
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                filterFolder === 'units_all'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
              }`}
            >
              All Units (units/*)
            </button>

            {STANDARD_FOLDERS.map((folderName) => (
              <button
                key={folderName}
                type="button"
                onClick={() => setFilterFolder(folderName)}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  filterFolder === folderName
                    ? 'bg-brand-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {folderName}
              </button>
            ))}
          </div>

          {/* Unit Size Filter Row */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" /> Unit Sizes:
            </span>
            {POPULAR_UNIT_SIZES.map((sz) => {
              const filterKey = `unit_${sz}`;
              const count = images.filter(img => img.subfolder === `units/${sz}` || img.path.includes(`/units/${sz}/`)).length;
              return (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setFilterFolder(filterKey)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                    filterFolder === filterKey
                      ? 'bg-brand-600 text-white font-bold shadow-xs ring-1 ring-brand-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sz} sq.ft {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
            <select
              value={filterFolder.startsWith('unit_') ? filterFolder : (filterFolder.startsWith('units/') ? filterFolder : '')}
              onChange={(e) => {
                if (e.target.value) setFilterFolder(e.target.value);
              }}
              className="px-2 py-0.5 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              <option value="">More Unit Sizes...</option>
              {ALL_UNIT_SIZES.filter(sz => !POPULAR_UNIT_SIZES.includes(sz)).map(sz => (
                <option key={sz} value={`unit_${sz}`}>
                  {sz} sq.ft
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Images Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" />
            Scanning public/images/ directory...
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            No images found matching criteria in <code className="font-mono">public/images/</code>.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img) => (
              <div
                key={img.path}
                className={`group relative rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  selectedGalleryPaths.has(img.path)
                    ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 ring-2 ring-brand-500/30'
                    : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-brand-500/50'
                }`}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setPreviewModalImage(img.path)}>
                  <img
                    src={img.path}
                    alt={img.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                    <span className="text-[10px] text-white flex items-center gap-1 font-mono">
                      <Eye className="w-3 h-3" /> Click to enlarge
                    </span>
                  </div>

                  {/* Multi-select checkbox on card */}
                  <div
                    className="absolute top-2 right-2 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGalleryPaths.has(img.path)}
                      onChange={() => handleToggleSelectGallery(img.path)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600 bg-white/90 shadow-sm"
                      title="Select image for bulk actions"
                    />
                  </div>

                  {/* Folder Badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-950/80 text-white backdrop-blur-xs border border-white/10 uppercase">
                    {img.subfolder}
                  </span>
                </div>

                {/* Details Body */}
                <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate font-mono" title={img.name}>
                      {img.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>{img.sizeFormatted}</span>
                      <span>{new Date(img.modified).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Path box with Copy Button */}
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60">
                    <code className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate flex-1 select-all" title={img.path}>
                      {img.path}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyPath(img.path)}
                      className={`p-1 rounded-md text-xs transition-all cursor-pointer shrink-0 ${
                        copiedPath === img.path
                          ? 'bg-emerald-500 text-white'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                      title="Copy image path"
                    >
                      {copiedPath === img.path ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Assign to Unit / Building Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setAssignTarget(img);
                      loadEntitiesForAssignment();
                    }}
                    className="w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Layers className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                    <span>Assign to Unit / Building</span>
                  </button>

                  {/* Actions Row */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    {/* Replace Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setReplaceTarget(img);
                        setReplaceFile(null);
                        setReplacePreview('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Replace</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Assign Image to Unit or Building Modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="rounded-2xl max-w-lg w-full bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm sm:text-base font-bold font-['Outfit'] text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <span>Assign Image to Unit or Building</span>
              </h3>
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Selected Image Preview Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <img
                src={assignTarget.path}
                alt={assignTarget.name}
                className="w-16 h-16 rounded-lg object-cover border border-slate-300 dark:border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate font-mono">
                  {assignTarget.name}
                </p>
                <code className="text-[11px] text-brand-600 dark:text-brand-400 block truncate font-mono mt-0.5">
                  {assignTarget.path}
                </code>
                <span className="text-[10px] text-slate-500 font-mono">
                  {assignTarget.sizeFormatted} • Folder: {assignTarget.subfolder}
                </span>
              </div>
            </div>

            {/* Target Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                What would you like to assign this image to?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAssignMode('unit')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    assignMode === 'unit'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Individual Unit / Property</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode('building')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    assignMode === 'building'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Commercial Building</span>
                </button>
              </div>
            </div>

            {/* Unit Mode Options */}
            {assignMode === 'unit' && (
              <div className="space-y-3 pt-1">
                {/* Filter properties by building */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Filter by Building:
                  </label>
                  <select
                    value={assignFilterBuilding}
                    onChange={(e) => {
                      setAssignFilterBuilding(e.target.value);
                      const filtered = propertiesList.filter(p => e.target.value === 'all' || p.building_id === e.target.value);
                      if (filtered.length > 0) {
                        setSelectedPropertyId(filtered[0].id);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="all">All Buildings ({propertiesList.length} total units)</option>
                    {buildingsList.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({propertiesList.filter(p => p.building_id === b.id).length} units)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Property / Unit selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Specific Unit:
                  </label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                  >
                    {propertiesList
                      .filter(p => assignFilterBuilding === 'all' || p.building_id === assignFilterBuilding)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.building_name ? `[${p.building_name}] ` : ''}{p.title} • {p.built_up_area || p.carpet_area || 0} sq.ft {p.unit_number ? `(#${p.unit_number})` : ''}
                        </option>
                      ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Each unit is independently editable. Changes to this unit will not alter other units in the building.
                  </p>
                </div>
              </div>
            )}

            {/* Building Mode Options */}
            {assignMode === 'building' && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Commercial Building:
                  </label>
                  <select
                    value={selectedBuildingId}
                    onChange={(e) => setSelectedBuildingId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    {buildingsList.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.location_name || b.address}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Image Role / Slot Selection */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Image Role:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  assignSlot === 'cover'
                    ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="assignSlot"
                    checked={assignSlot === 'cover'}
                    onChange={() => setAssignSlot('cover')}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Primary Cover Photo
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                      Main display thumbnail on cards, listing, and search
                    </span>
                  </div>
                </label>

                <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  assignSlot === 'gallery'
                    ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="assignSlot"
                    checked={assignSlot === 'gallery'}
                    onChange={() => setAssignSlot('gallery')}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Add to Gallery
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                      Appended to the multi-image gallery carousel
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignSubmit}
                disabled={isAssigning}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${isAssigning ? 'animate-spin' : ''}`} />
                <span>{isAssigning ? 'Saving Assignment...' : 'Confirm Assignment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Replace Image Modal */}
      {replaceTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="rounded-2xl max-w-md w-full bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm sm:text-base font-bold font-['Outfit'] text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-brand-600" />
                <span>Replace Existing Image</span>
              </h3>
              <button
                type="button"
                onClick={() => setReplaceTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p>
                Target path: <code className="font-mono text-brand-600 font-bold">{replaceTarget.path}</code>
              </p>
              <p className="text-[11px] text-slate-500">
                The uploaded photo will overwrite this file on disk, keeping the same URL so all pages update automatically without code changes.
              </p>
            </div>

            {/* Replacement Picker */}
            <div
              onClick={() => replaceInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-brand-500"
            >
              <input
                ref={replaceInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setReplaceFile(f);
                    setReplacePreview(URL.createObjectURL(f));
                  }
                }}
                className="hidden"
              />

              {replacePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={replacePreview} alt="New replacement" className="max-h-36 rounded-lg object-contain shadow-xs" />
                  <span className="text-[11px] font-mono text-slate-500">
                    New: {replaceFile?.name} ({(replaceFile!.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <div className="py-2 text-xs text-slate-500">
                  <UploadCloud className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                  Click to select replacement image
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReplaceTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReplaceSubmit}
                disabled={!replaceFile || isReplacing}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReplacing ? 'animate-spin' : ''}`} />
                <span>{isReplacing ? 'Replacing...' : 'Confirm Replace'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Enlarge Image Lightbox */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh]">
            <img
              src={previewModalImage}
              alt="Enlarged preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-slate-700"
            />
            <button
              type="button"
              onClick={() => setPreviewModalImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 border border-slate-600 text-white flex items-center justify-center hover:bg-slate-700 shadow-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 7. Auto-Upload Images to All Units with Same Square Footage Modal */}
      <AutoUploadSqFtImagesModal
        isOpen={showSqFtModal}
        onClose={() => setShowSqFtModal(false)}
        onSuccess={() => {
          fetchImages();
          loadEntitiesForAssignment();
        }}
      />
    </div>
  );
};
