import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Check, 
  X, 
  UploadCloud, 
  Sparkles,
  Eye,
  EyeOff,
  Globe,
  Briefcase
} from 'lucide-react';
import { ClientLogo } from '../../types';
import { StorageService } from '../../services/storageService';
import { compressImageFile } from '../../utils/imageCompression';

interface AdminClientsManagerProps {
  clients: ClientLogo[];
  onRefresh: () => void;
}

const COMMON_INDUSTRIES = [
  'Enterprise IT & Software',
  'Technology & Electronics',
  'Cloud & Data Infrastructure',
  'Consulting & Professional Services',
  'Fintech & Digital Payments',
  'Engineering & Industrial Tech',
  'Banking & Financial Services',
  'Telecom & Mobility'
];

export const AdminClientsManager: React.FC<AdminClientsManagerProps> = ({ clients, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<ClientLogo>>({
    name: '',
    logo: '',
    industry: '',
    website_url: '',
    website: '',
    order: 1,
    featured: false,
    published: true,
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: `client-${Date.now()}`,
      name: '',
      logo: '',
      industry: 'Enterprise IT & Software',
      website_url: '',
      website: '',
      order: (clients.length + 1) * 10,
      featured: false,
      published: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (client: ClientLogo) => {
    setIsEditing(true);
    setFormData({ 
      ...client,
      website: client.website || client.website_url || '',
      website_url: client.website_url || client.website || ''
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 600, 0.9);
      if (compressedDataUrl) {
        setFormData(prev => ({ ...prev, logo: compressedDataUrl }));
      }
    } catch (err) {
      console.error('Failed to upload client logo:', err);
      alert('Failed to process logo image. Please try again or provide an image URL.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Please enter a company name.');
      return;
    }
    if (!formData.logo?.trim()) {
      alert('Please provide a logo image or URL.');
      return;
    }

    setIsSaving(true);
    try {
      const siteUrl = formData.website?.trim() || formData.website_url?.trim() || '';
      const clientToSave: ClientLogo = {
        id: formData.id || `client-${Date.now()}`,
        name: formData.name.trim(),
        logo: formData.logo.trim(),
        industry: formData.industry?.trim() || '',
        website: siteUrl,
        website_url: siteUrl,
        order: Number(formData.order) || 0,
        featured: !!formData.featured,
        published: formData.published !== false,
      };

      await StorageService.saveClient(clientToSave);
      setShowModal(false);
      onRefresh();
    } catch (err) {
      console.error('Error saving client:', err);
      alert('Failed to save client. Please check your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from clients & brands?`)) {
      await StorageService.deleteClient(id);
      onRefresh();
    }
  };

  const handleTogglePublish = async (client: ClientLogo) => {
    const updated = { ...client, published: client.published === false ? true : false };
    await StorageService.saveClient(updated);
    onRefresh();
  };

  const filteredClients = clients
    .filter(c => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.industry && c.industry.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Landing Page Marquee</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            Clients & Brand Partners
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Manage the brand logos and tenant profiles showcased on the auto-scrolling landing page marquee. Changes sync live with the landing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-glass-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand / Client</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Clients</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
            {clients.length}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live on Marquee</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-['Outfit'] mt-1">
            {clients.filter(c => c.published !== false).length}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hidden / Inactive</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-['Outfit'] mt-1">
            {clients.filter(c => c.published === false).length}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Featured</span>
          <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 font-['Outfit'] mt-1">
            {clients.filter(c => c.featured).length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search clients by company name or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredClients.length} of {clients.length}
        </span>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredClients.map((client) => {
          const site = client.website || client.website_url;
          return (
            <div
              key={client.id}
              className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/80 flex flex-col justify-between hover:shadow-lg transition-all group"
            >
              <div>
                {/* Top Controls: Status Pill & Order */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(client)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                      client.published !== false
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20'
                    }`}
                    title="Toggle Live/Hidden on landing page"
                  >
                    {client.published !== false ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Live on Marquee</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <span>Order:</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">{client.order || 0}</span>
                  </div>
                </div>

                {/* Logo Preview Container */}
                <div className="h-20 w-full rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-3 flex items-center justify-center overflow-hidden mb-3.5 group-hover:border-brand-500/30 transition-colors">
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="max-h-full max-w-full object-contain filter dark:brightness-95 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=0F172A&color=fff&size=128`;
                    }}
                  />
                </div>

                {/* Company Info */}
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate" title={client.name}>
                      {client.name}
                    </h3>
                    {client.featured && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  {client.industry && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{client.industry}</span>
                    </p>
                  )}

                  {site && (
                    <a
                      href={site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 mt-1 truncate"
                    >
                      <Globe className="w-3 h-3 shrink-0" />
                      <span>{site.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(client)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                  title="Edit Client"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(client.id, client.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Client"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center glass-card rounded-2xl p-8 space-y-3">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No clients or brands found matching your search.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn-glass-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Brand</span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex min-h-full items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                  {isEditing ? 'Edit Brand / Client' : 'Add New Brand / Client'}
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
              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Company / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Microsoft Corporation"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g., Enterprise IT & Software"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_INDUSTRIES.slice(0, 4).map((ind) => (
                    <button
                      type="button"
                      key={ind}
                      onClick={() => setFormData(prev => ({ ...prev, industry: ind }))}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      + {ind.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo URL & File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Brand Logo Image *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://... or upload below"
                    value={formData.logo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
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

                {/* Logo Live Preview */}
                {formData.logo && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="h-12 w-28 bg-white dark:bg-slate-800 rounded-lg p-1.5 border border-slate-200/80 flex items-center justify-center shrink-0">
                      <img
                        src={formData.logo}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/120x40?text=Preview+Error';
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 overflow-hidden">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Logo Live Preview</p>
                      <p className="truncate text-slate-400 font-mono text-[10px]">{formData.logo}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Website URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  value={formData.website || formData.website_url || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    website: e.target.value,
                    website_url: e.target.value 
                  }))}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs sm:text-sm"
                />
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
                      Live on Marquee
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
                      Featured Brand
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
                  <span>{isSaving ? 'Saving...' : isEditing ? 'Update Client' : 'Save Client'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
