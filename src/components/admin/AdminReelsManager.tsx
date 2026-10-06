import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Check, 
  X, 
  UploadCloud, 
  Play, 
  Eye, 
  EyeOff, 
  Heart, 
  Clock, 
  Sparkles,
  Video,
  Tag
} from 'lucide-react';
import { InstagramReel } from '../../types';
import { StorageService } from '../../services/storageService';
import { InstagramIcon } from '../common/SocialIcons';
import { compressImageFile } from '../../utils/imageCompression';

interface AdminReelsManagerProps {
  reels: InstagramReel[];
  onRefresh: () => void;
}

const COMMON_REEL_CATEGORIES = [
  'Virtual Tour',
  'Industrial & Warehouse',
  'IT & Business Park',
  'Commercial Retail',
  'Market Insights',
  'Client Story'
];

export const AdminReelsManager: React.FC<AdminReelsManagerProps> = ({ reels, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<InstagramReel>>({
    title: '',
    reel_url: '',
    instagramUrl: '',
    thumbnail_url: '',
    thumbnailUrl: '',
    video_url: '',
    videoUrl: '',
    views_display: '25K',
    views: '25K',
    likes_display: '1.5K',
    likes: '1.5K',
    category: 'Virtual Tour',
    caption: '',
    duration: '0:45',
    order: 1,
    featured: true,
    published: true,
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: `reel-${Date.now()}`,
      title: '',
      reel_url: 'https://www.instagram.com/shristi_estate01/',
      instagramUrl: 'https://www.instagram.com/shristi_estate01/',
      thumbnail_url: '',
      thumbnailUrl: '',
      video_url: '',
      videoUrl: '',
      views_display: '15K',
      views: '15K',
      likes_display: '950',
      likes: '950',
      category: 'Virtual Tour',
      caption: '',
      duration: '0:45',
      order: (reels.length + 1) * 10,
      featured: true,
      published: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (reel: InstagramReel) => {
    setIsEditing(true);
    setFormData({ 
      ...reel,
      instagramUrl: reel.instagramUrl || reel.reel_url,
      reel_url: reel.reel_url || reel.instagramUrl || '',
      thumbnailUrl: reel.thumbnailUrl || reel.thumbnail_url,
      thumbnail_url: reel.thumbnail_url || reel.thumbnailUrl || '',
      views: reel.views || reel.views_display || '10K',
      views_display: reel.views_display || reel.views || '10K',
      likes: reel.likes || reel.likes_display || '500',
      likes_display: reel.likes_display || reel.likes || '500',
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 720, 0.85);
      if (compressedDataUrl) {
        setFormData(prev => ({ 
          ...prev, 
          thumbnail_url: compressedDataUrl,
          thumbnailUrl: compressedDataUrl 
        }));
      }
    } catch (err) {
      console.error('Failed to process reel thumbnail:', err);
      alert('Failed to process thumbnail image. Please try again or provide an image URL.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const reelLink = formData.reel_url?.trim() || formData.instagramUrl?.trim() || '';
    const thumbLink = formData.thumbnail_url?.trim() || formData.thumbnailUrl?.trim() || '';

    if (!formData.title?.trim()) {
      alert('Please enter a Reel title.');
      return;
    }
    if (!reelLink) {
      alert('Please enter an Instagram post or reel URL.');
      return;
    }
    if (!thumbLink) {
      alert('Please provide a thumbnail image or URL for the Reel preview.');
      return;
    }

    setIsSaving(true);
    try {
      const viewVal = formData.views_display?.trim() || formData.views?.trim() || '10K';
      const likeVal = formData.likes_display?.trim() || formData.likes?.trim() || '500';
      const vidVal = formData.video_url?.trim() || formData.videoUrl?.trim() || '';

      const reelToSave: InstagramReel = {
        id: formData.id || `reel-${Date.now()}`,
        title: formData.title.trim(),
        reel_url: reelLink,
        instagramUrl: reelLink,
        thumbnail_url: thumbLink,
        thumbnailUrl: thumbLink,
        video_url: vidVal,
        videoUrl: vidVal,
        views_display: viewVal,
        views: viewVal,
        likes_display: likeVal,
        likes: likeVal,
        category: formData.category?.trim() || 'Virtual Tour',
        caption: formData.caption?.trim() || '',
        duration: formData.duration?.trim() || '0:30',
        order: Number(formData.order) || 0,
        featured: !!formData.featured,
        published: formData.published !== false,
      };

      await StorageService.saveInstagramReel(reelToSave);
      setShowModal(false);
      onRefresh();
    } catch (err) {
      console.error('Error saving reel:', err);
      alert('Failed to save Instagram Reel. Please check your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove Reel "${title}"?`)) {
      await StorageService.deleteInstagramReel(id);
      onRefresh();
    }
  };

  const handleTogglePublish = async (reel: InstagramReel) => {
    const updated = { ...reel, published: reel.published === false ? true : false };
    await StorageService.saveInstagramReel(updated);
    onRefresh();
  };

  const handleToggleFeatured = async (reel: InstagramReel) => {
    const updated = { ...reel, featured: !reel.featured };
    await StorageService.saveInstagramReel(updated);
    onRefresh();
  };

  const categories = ['All', ...Array.from(new Set(reels.map(r => r.category).filter(Boolean)))];

  const filteredReels = reels
    .filter(r => {
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        (r.caption && r.caption.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-2">
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>Landing Page Reel Showcase</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            Instagram Reels & Video Tours
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Manage vertical video tours, warehouse walkthroughs, and commercial property reels that appear in the interactive landing page showcase.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://www.instagram.com/shristi_estate01/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-card border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>@shristi_estate01</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-glass-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Add Instagram Reel</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Reels</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
            {reels.length}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live on Showcase</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-['Outfit'] mt-1">
            {reels.filter(r => r.published !== false).length}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hidden / Draft</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-['Outfit'] mt-1">
            {reels.filter(r => r.published === false).length}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Featured Tours</span>
          <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 font-['Outfit'] mt-1">
            {reels.filter(r => r.featured).length}
          </div>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search reels by title, category, or caption..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat as string)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reels Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredReels.map((reel) => {
          const thumb = reel.thumbnail_url || reel.thumbnailUrl;
          const link = reel.reel_url || reel.instagramUrl;
          const vCount = reel.views_display || reel.views;
          const lCount = reel.likes_display || reel.likes;

          return (
            <div
              key={reel.id}
              className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/80 flex flex-col justify-between hover:shadow-xl transition-all group"
            >
              {/* Top 9:16 Video Thumbnail Container */}
              <div className="relative aspect-[9/13] w-full overflow-hidden bg-slate-900">
                <img
                  src={thumb}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=720&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Instagram & Category Badges Top Left */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-md flex items-center gap-1">
                    <InstagramIcon className="w-3 h-3 text-white" />
                    <span>Reel</span>
                  </span>
                  {reel.category && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {reel.category}
                    </span>
                  )}
                </div>

                {/* Quick Live Toggle Top Right */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(reel)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border shadow transition-all flex items-center gap-1 ${
                      reel.published !== false
                        ? 'bg-emerald-500/90 text-white border-emerald-400/40 hover:bg-emerald-600'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={reel.published !== false ? 'Click to hide from website' : 'Click to publish live'}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${reel.published !== false ? 'bg-white' : 'bg-amber-400'}`} />
                    <span>{reel.published !== false ? 'Live' : 'Hidden'}</span>
                  </button>
                </div>

                {/* Center Play Button indicator */}
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center pointer-events-auto"
                  title="Watch on Instagram"
                >
                  <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md border border-white/50 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white/40 transition-all shadow-xl">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </a>

                {/* Bottom Meta Stats inside Thumbnail */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                  <div className="flex items-center gap-2">
                    {vCount && (
                      <span className="flex items-center gap-1 font-semibold">
                        <Eye className="w-3 h-3 text-white/80" />
                        {vCount}
                      </span>
                    )}
                    {lCount && (
                      <span className="flex items-center gap-1 font-semibold">
                        <Heart className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                        {lCount}
                      </span>
                    )}
                  </div>

                  {reel.duration && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/60 backdrop-blur-md">
                      {reel.duration}
                    </span>
                  )}
                </div>
              </div>

              {/* Info and Actions Section */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                      {reel.title}
                    </h3>
                    {reel.featured && (
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(reel)}
                        className="text-amber-500 shrink-0 p-0.5"
                        title="Featured reel (Click to toggle)"
                      >
                        ★
                      </button>
                    )}
                  </div>

                  {reel.caption && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {reel.caption}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Instagram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(reel)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                      title="Edit Reel"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(reel.id, reel.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Reel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredReels.length === 0 && (
          <div className="col-span-full py-12 text-center glass-card rounded-2xl p-8 space-y-3">
            <Video className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No Instagram reels matched your search or category filter.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn-glass-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Instagram Reel</span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Reel Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex min-h-full items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl glass-card rounded-2xl p-6 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                  {isEditing ? 'Edit Instagram Reel' : 'Add New Instagram Reel'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grade A IT Park Walkthrough - Noida Expressway"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
                />
              </div>

              {/* Instagram Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Instagram Reel or Profile Link *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://www.instagram.com/reel/... or https://instagram.com/shristi_estate01/"
                    value={formData.reel_url || formData.instagramUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, reel_url: val, instagramUrl: val }));
                    }}
                    className="glass-input flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-mono"
                  />
                  {(formData.reel_url || formData.instagramUrl) && (
                    <a
                      href={formData.reel_url || formData.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 flex items-center gap-1"
                    >
                      <span>Test</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category / Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g., Virtual Tour, Warehouse Walkthrough"
                  value={formData.category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_REEL_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      + {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnail URL & File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thumbnail / Poster Image * (Vertical 9:16 recommended)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://... or upload image below"
                    value={formData.thumbnail_url || formData.thumbnailUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, thumbnail_url: val, thumbnailUrl: val }));
                    }}
                    className="glass-input flex-1 px-3 py-2 rounded-xl text-xs font-mono"
                  />
                  <label className="btn-glass-primary px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {(formData.thumbnail_url || formData.thumbnailUrl) && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="h-16 w-12 bg-black rounded-lg overflow-hidden shrink-0 relative">
                      <img
                        src={formData.thumbnail_url || formData.thumbnailUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 overflow-hidden">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Thumbnail Live Preview (9:16)</p>
                      <p className="truncate text-slate-400 font-mono text-[10px]">{formData.thumbnail_url || formData.thumbnailUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Video Preview URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Optional Direct MP4 Video URL (for inline video preview)
                </label>
                <input
                  type="url"
                  placeholder="https://assets.mixkit.co/.../video.mp4 (Optional)"
                  value={formData.video_url || formData.videoUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, video_url: val, videoUrl: val }));
                  }}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-mono"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Caption / Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Virtual walkthrough of 45,000 sq.ft Grade A space..."
                  value={formData.caption || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
                />
              </div>

              {/* Stats Counters: Views, Likes, Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Views Count
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 48.5K"
                    value={formData.views_display || formData.views || '15K'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, views_display: val, views: val }));
                    }}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Likes Count
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2.1K"
                    value={formData.likes_display || formData.likes || '950'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, likes_display: val, likes: val }));
                    }}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0:45"
                    value={formData.duration || '0:45'}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Order & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order ?? 10}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="flex items-center sm:pt-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.published !== false}
                      onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Live on Showcase
                    </span>
                  </label>
                </div>

                <div className="flex items-center sm:pt-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Featured Tour
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-glass-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : isEditing ? 'Update Reel' : 'Save Reel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
