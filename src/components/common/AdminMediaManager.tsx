import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Star, Trash2, ArrowLeft, ArrowRight, Eye, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { ImageItem } from '../../types';
import { compressImageFile } from '../../utils/imageCompression';

interface AdminMediaManagerProps {
  primaryImage: string;
  onPrimaryImageChange: (url: string) => void;
  primaryAlt?: string;
  onPrimaryAltChange: (alt: string) => void;
  primaryTitle?: string;
  onPrimaryTitleChange: (title: string) => void;
  primaryCaption?: string;
  onPrimaryCaptionChange: (caption: string) => void;
  fallbackAltText: string;
  gallery: string[];
  onGalleryChange: (gallery: string[]) => void;
  imageDetails?: ImageItem[];
  onImageDetailsChange?: (details: ImageItem[]) => void;
  entityType: 'tower' | 'property';
  entityName: string;
}

export const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({
  primaryImage,
  onPrimaryImageChange,
  primaryAlt = '',
  onPrimaryAltChange,
  primaryTitle = '',
  onPrimaryTitleChange,
  primaryCaption = '',
  onPrimaryCaptionChange,
  fallbackAltText,
  gallery,
  onGalleryChange,
  imageDetails = [],
  onImageDetailsChange,
  entityType,
  entityName
}) => {
  const [isUploadingPrimary, setIsUploadingPrimary] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);

  // Sync imageDetails list with gallery URLs
  const getDetailFor = (url: string, index: number): ImageItem => {
    const existing = imageDetails.find(d => d.url === url);
    if (existing) return existing;
    return {
      url,
      alt: '',
      title: `${entityName} - View ${index + 1}`,
      caption: ''
    };
  };

  const updateDetail = (url: string, patch: Partial<ImageItem>) => {
    if (!onImageDetailsChange) return;
    const current = [...imageDetails];
    const idx = current.findIndex(d => d.url === url);
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...patch };
    } else {
      current.push({
        url,
        alt: patch.alt || '',
        title: patch.title || '',
        caption: patch.caption || ''
      });
    }
    onImageDetailsChange(current);
  };

  // Upload primary photo
  const handlePrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPrimary(true);
    try {
      const compressed = await compressImageFile(file);
      if (compressed) {
        onPrimaryImageChange(compressed);
      } else {
        alert('Could not process this image file. Please choose a valid JPG, PNG, or WebP image.');
      }
    } catch (err: any) {
      console.error('Failed to compress primary image:', err);
      alert('Image upload failed: ' + (err?.message || 'Please choose a different image file.'));
    } finally {
      setIsUploadingPrimary(false);
      e.target.value = '';
    }
  };

  // Upload multiple gallery photos
  const handleGalleryMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingGallery(true);
    try {
      const results: string[] = [];
      for (const file of files) {
        try {
          const compressed = await compressImageFile(file);
          if (compressed) results.push(compressed);
        } catch (fErr) {
          console.warn('Failed compressing a gallery image:', fErr);
        }
      }
      if (results.length > 0) {
        onGalleryChange([...gallery, ...results]);
      } else {
        alert('Could not process the selected photos. Please ensure files are valid images.');
      }
    } catch (err: any) {
      console.error('Gallery upload error:', err);
      alert('Gallery upload failed: ' + (err?.message || 'Please try again.'));
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleAddGalleryUrl = () => {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) return;
    if (gallery.includes(trimmed)) {
      alert('This image URL is already in the gallery.');
      return;
    }
    onGalleryChange([...gallery, trimmed]);
    setNewGalleryUrl('');
  };

  const handleSetFeatured = (url: string, index: number) => {
    const oldPrimary = primaryImage;
    const oldPrimaryAlt = primaryAlt;
    const oldPrimaryTitle = primaryTitle;
    const oldPrimaryCaption = primaryCaption;

    const targetDetail = getDetailFor(url, index);

    // Swap URLs
    const newGallery = gallery.filter((_, i) => i !== index);
    if (oldPrimary) newGallery.unshift(oldPrimary);
    onGalleryChange(newGallery);

    onPrimaryImageChange(url);
    onPrimaryAltChange(targetDetail.alt || '');
    onPrimaryTitleChange(targetDetail.title || '');
    onPrimaryCaptionChange(targetDetail.caption || '');

    // Update details
    if (onImageDetailsChange && oldPrimary) {
      updateDetail(oldPrimary, {
        alt: oldPrimaryAlt,
        title: oldPrimaryTitle,
        caption: oldPrimaryCaption
      });
    }
  };

  const handleMoveGallery = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= gallery.length) return;
    const updated = [...gallery];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    onGalleryChange(updated);
  };

  const handleDeleteGallery = (index: number) => {
    const url = gallery[index];
    onGalleryChange(gallery.filter((_, i) => i !== index));
    if (onImageDetailsChange) {
      onImageDetailsChange(imageDetails.filter(d => d.url !== url));
    }
  };

  const handleDeletePrimary = () => {
    if (!window.confirm(`Are you sure you want to delete this featured photo?`)) return;
    if (gallery.length > 0) {
      const nextPrimary = gallery[0];
      const nextDetail = getDetailFor(nextPrimary, 0);
      onPrimaryImageChange(nextPrimary);
      onPrimaryAltChange(nextDetail.alt || '');
      onPrimaryTitleChange(nextDetail.title || '');
      onPrimaryCaptionChange(nextDetail.caption || '');
      onGalleryChange(gallery.slice(1));
      if (onImageDetailsChange) {
        onImageDetailsChange(imageDetails.filter(d => d.url !== nextPrimary));
      }
    } else {
      onPrimaryImageChange('');
      onPrimaryAltChange('');
      onPrimaryTitleChange('');
      onPrimaryCaptionChange('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sync reminder banner */}
      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>Photo Updates:</strong> When deleting, uploading, or reordering images, remember to click the <strong>Update / Save</strong> button at the bottom of the modal to sync your changes across the website.
          </span>
        </div>
      </div>

      {/* 1. PRIMARY / FEATURED IMAGE */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Primary / Featured {entityType === 'tower' ? 'Tower' : 'Property'} Image</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Primary visual for listing cards, search engine snippets, and social sharing previews.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {primaryImage ? (
              <button
                type="button"
                onClick={handleDeletePrimary}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-800 transition-colors shadow-sm"
                title="Delete this featured photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Photo</span>
              </button>
            ) : null}

            <label className="btn-glass-primary px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-sm">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isUploadingPrimary ? 'Uploading...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isUploadingPrimary}
                onChange={handlePrimaryUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Preview Canvas */}
          <div className="md:col-span-4 space-y-1.5">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
              <img
                src={primaryImage || 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=800&q=80'}
                alt={primaryAlt || fallbackAltText}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.failed) {
                    target.dataset.failed = 'true';
                    target.src = 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=800&q=80';
                  }
                }}
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-sm">
                Featured
              </span>
              {primaryImage ? (
                <button
                  type="button"
                  onClick={handleDeletePrimary}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 shadow-md backdrop-blur-sm transition-all"
                  title="Delete Featured Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
            <span className="text-[10px] text-slate-400 block text-center">
              16:10 Aspect Ratio • Cover Fit
            </span>
          </div>

          {/* Metadata Inputs */}
          <div className="md:col-span-8 space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Image URL</label>
              <input
                type="text"
                value={primaryImage}
                onChange={(e) => onPrimaryImageChange(e.target.value)}
                placeholder="https://images.unsplash.com/... or paste asset link"
                className="glass-input w-full px-3 py-1.5 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold">
                  Image Alt Text (SEO Essential)
                </label>
                <span className="text-[10px] text-slate-400">
                  {primaryAlt.length} chars
                </span>
              </div>
              <input
                type="text"
                value={primaryAlt}
                onChange={(e) => onPrimaryAltChange(e.target.value)}
                placeholder={`e.g. ${fallbackAltText}`}
                className="glass-input w-full px-3 py-1.5 rounded-xl text-xs font-medium"
              />
              <div className="mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 space-y-0.5 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold block text-slate-700 dark:text-slate-300">
                  ⚡ Automatic Sensible Fallback:
                </span>
                <span className="italic block truncate">
                  "{fallbackAltText}"
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Image Title Attribute</label>
                <input
                  type="text"
                  value={primaryTitle}
                  onChange={(e) => onPrimaryTitleChange(e.target.value)}
                  placeholder={`e.g. ${entityName}`}
                  className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Image Caption</label>
                <input
                  type="text"
                  value={primaryCaption}
                  onChange={(e) => onPrimaryCaptionChange(e.target.value)}
                  placeholder="Caption displayed under public photo"
                  className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GALLERY IMAGES MANAGER */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
              <span>Gallery Photo Showcase ({gallery.length} Images)</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Upload, reorder, delete, and manage Alt text, Title, and Captions for every secondary photo.
            </p>
          </div>

          <label className="btn-glass-primary px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-sm">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isUploadingGallery ? 'Uploading...' : 'Upload Photos'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={isUploadingGallery}
              onChange={handleGalleryMultiUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Add URL input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newGalleryUrl}
            onChange={(e) => setNewGalleryUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGalleryUrl(); } }}
            placeholder="Paste photo URL here to add to gallery..."
            className="glass-input flex-1 px-3 py-1.5 rounded-xl text-xs"
          />
          <button
            type="button"
            onClick={handleAddGalleryUrl}
            className="btn-glass-primary px-3 py-1.5 rounded-xl text-xs font-bold shrink-0"
          >
            Add Photo
          </button>
        </div>

        {/* Gallery Cards List */}
        {gallery.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
            <p className="text-xs font-semibold">No gallery images added yet</p>
            <p className="text-[11px] mt-0.5">Upload multiple files or paste URLs above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gallery.map((url, idx) => {
              const detail = getDetailFor(url, idx);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row items-start gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {/* Thumbnail & Actions */}
                  <div className="w-full md:w-36 shrink-0 space-y-1.5">
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">
                      <img
                        src={url}
                        alt={detail.alt || `${entityName} photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.failed) {
                            target.dataset.failed = 'true';
                            target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80';
                          }
                        }}
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveGallery(idx, 'left')}
                          className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 border border-slate-200 dark:border-slate-700 hover:border-brand-500"
                          title="Move Earlier"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === gallery.length - 1}
                          onClick={() => handleMoveGallery(idx, 'right')}
                          className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 border border-slate-200 dark:border-slate-700 hover:border-brand-500"
                          title="Move Later"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSetFeatured(url, idx)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 hover:bg-amber-500 hover:text-white transition-colors"
                        title="Set this image as Featured Primary Photo"
                      >
                        <Star className="w-2.5 h-2.5" />
                        <span>Featured</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteGallery(idx)}
                        className="p-1 rounded bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Editor for Gallery Image */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold mb-0.5 text-slate-600 dark:text-slate-400">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={detail.alt || ''}
                        onChange={(e) => updateDetail(url, { alt: e.target.value })}
                        placeholder={`${entityName} view ${idx + 1}`}
                        className="glass-input w-full px-2.5 py-1.5 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold mb-0.5 text-slate-600 dark:text-slate-400">
                        Image Title
                      </label>
                      <input
                        type="text"
                        value={detail.title || ''}
                        onChange={(e) => updateDetail(url, { title: e.target.value })}
                        placeholder={`${entityName} - Interior ${idx + 1}`}
                        className="glass-input w-full px-2.5 py-1.5 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold mb-0.5 text-slate-600 dark:text-slate-400">
                        Caption
                      </label>
                      <input
                        type="text"
                        value={detail.caption || ''}
                        onChange={(e) => updateDetail(url, { caption: e.target.value })}
                        placeholder="Caption under this image"
                        className="glass-input w-full px-2.5 py-1.5 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
