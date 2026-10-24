import React, { useState } from 'react';
import { 
  Star, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  MapPin
} from 'lucide-react';
import { ClientReview } from '../../types';
import { StorageService } from '../../services/storageService';

interface AdminReviewsManagerProps {
  reviews: ClientReview[];
  onRefresh: () => void;
}

export const AdminReviewsManager: React.FC<AdminReviewsManagerProps> = ({ reviews, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<ClientReview>>({
    client_name: '',
    client_role: '',
    company_name: '',
    avatar_url: '',
    rating: 5,
    review_title: '',
    review_text: '',
    space_leased: '',
    building_name: '',
    location_name: 'Noida',
    category: 'Office',
    verified: true,
    published: true,
    source: 'Google',
    order: 0,
    featured: true
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: `rev-${Date.now()}`,
      client_name: '',
      client_role: '',
      company_name: '',
      avatar_url: '',
      rating: 5,
      review_title: '',
      review_text: '',
      space_leased: '',
      building_name: '',
      location_name: 'Sector 62, Noida',
      category: 'Office',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      verified: true,
      published: true,
      source: 'Google',
      order: 0,
      featured: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (rev: ClientReview) => {
    setIsEditing(true);
    setFormData({ ...rev });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.review_text || !formData.company_name) {
      alert('Client Name, Company, and Review Text are required.');
      return;
    }

    setIsSaving(true);
    try {
      const reviewToSave: ClientReview = {
        id: formData.id || `rev-${Date.now()}`,
        client_name: formData.client_name,
        client_role: formData.client_role || 'Business Executive',
        company_name: formData.company_name,
        avatar_url: formData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.client_name)}&background=0284c7&color=fff`,
        rating: formData.rating || 5,
        review_title: formData.review_title || 'Excellent Commercial Experience',
        review_text: formData.review_text,
        space_leased: formData.space_leased || '',
        building_name: formData.building_name || '',
        location_name: formData.location_name || 'Noida NCR',
        category: formData.category || 'Office',
        date: formData.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        verified: formData.verified ?? true,
        source: formData.source || 'Google',
        published: formData.published ?? true,
        order: Number(formData.order) || 0,
        featured: formData.featured ?? true
      };

      await StorageService.saveReview(reviewToSave);
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert('Error saving review: ' + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (rev: ClientReview) => {
    const updated = { ...rev, published: !rev.published };
    await StorageService.saveReview(updated);
    onRefresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete review from "${name}"?`)) {
      await StorageService.deleteReview(id);
      onRefresh();
    }
  };

  const filtered = reviews.filter(r => {
    const matchSearch = 
      r.client_name.toLowerCase().includes(search.toLowerCase()) ||
      r.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.building_name && r.building_name.toLowerCase().includes(search.toLowerCase())) ||
      r.review_text.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || r.category === filterCategory;
    return matchSearch && matchCat;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      {/* HEADER & STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <MessageSquare className="w-4 h-4 text-brand-500" />
            <span>Total Reviews</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            {reviews.length}
          </span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 mb-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Average Rating</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            {avgRating} / 5.0
          </span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Leases</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            {reviews.filter(r => r.verified).length}
          </span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 mb-1">
            <Eye className="w-4 h-4" />
            <span>Published Active</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            {reviews.filter(r => r.published).length}
          </span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client, company, or building..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="Office">Corporate Office</option>
            <option value="IT Park">IT Park</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Review</span>
        </button>
      </div>

      {/* REVIEWS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className={`p-5 rounded-xl border transition-all ${
              rev.published 
                ? 'bg-white dark:bg-[#0B132B] border-slate-200 dark:border-slate-800 shadow-xs' 
                : 'bg-slate-50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-700 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                  {rev.avatar_url ? (
                    <img src={rev.avatar_url} alt={rev.client_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-brand-600 uppercase">
                      {rev.client_name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {rev.client_name}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    {rev.client_role} · <strong className="text-brand-600 dark:text-brand-400">{rev.company_name}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={() => handleTogglePublish(rev)}
                  title={rev.published ? 'Hide / Unpublish' : 'Publish Review'}
                  className="p-1.5 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {rev.published ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                </button>
                <button
                  onClick={() => handleOpenEdit(rev)}
                  title="Edit Review"
                  className="p-1.5 hover:text-brand-500 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(rev.id, rev.client_name)}
                  title="Delete Review"
                  className="p-1.5 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stars & Details */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                {rev.rating}.0
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {rev.category}
              </span>
              {rev.verified && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            <h5 className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
              "{rev.review_title}"
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-3">
              {rev.review_text}
            </p>

            {(rev.space_leased || rev.building_name) && (
              <div className="text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span className="truncate">
                  {rev.space_leased ? `${rev.space_leased} · ` : ''}{rev.building_name}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* EDIT / ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mb-4">
              {isEditing ? 'Edit Client Review' : 'Add New Client Review'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.client_name || ''}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name || ''}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.client_role || ''}
                    onChange={(e) => setFormData({ ...formData, client_role: e.target.value })}
                    placeholder="e.g. VP Operations"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rating (1-5)
                  </label>
                  <select
                    value={formData.rating || 5}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Space Leased
                  </label>
                  <input
                    type="text"
                    value={formData.space_leased || ''}
                    onChange={(e) => setFormData({ ...formData, space_leased: e.target.value })}
                    placeholder="e.g. 14,500 sq.ft Furnished Suite"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Building & Sector
                  </label>
                  <input
                    type="text"
                    value={formData.building_name || ''}
                    onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                    placeholder="e.g. The I-Thum, Sector 62"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Review Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formData.review_title || ''}
                  onChange={(e) => setFormData({ ...formData, review_title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Review Body *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.review_text || ''}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.verified ?? true}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="rounded text-brand-600"
                  />
                  <span>Verified Lease</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.published ?? true}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded text-brand-600"
                  />
                  <span>Published (Visible on site)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  {isSaving ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsManager;
