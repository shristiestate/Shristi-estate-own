import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Search, 
  Filter, 
  Edit3, 
  RotateCcw, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Eye, 
  X, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Copy, 
  Check, 
  SlidersHorizontal,
  FileText,
  Trash2
} from 'lucide-react';
import { PageSeoConfig, PageSeoCategory } from '../../types/seo';

interface AdminPageSeoManagerProps {
  pages: PageSeoConfig[];
  onSavePage: (config: PageSeoConfig) => Promise<void>;
  onResetPage: (idOrPath: string) => Promise<void>;
  onResetAll: () => Promise<void>;
}

export const AdminPageSeoManager: React.FC<AdminPageSeoManagerProps> = ({
  pages,
  onSavePage,
  onResetPage,
  onResetAll
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingPage, setEditingPage] = useState<PageSeoConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [activePreviewDevice, setActivePreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // New Custom Page Form State
  const [newPagePath, setNewPagePath] = useState('');
  const [newPageName, setNewPageName] = useState('');
  const [newPageCategory, setNewPageCategory] = useState<PageSeoCategory>('Custom');

  // Computed Metrics
  const metrics = useMemo(() => {
    const total = pages.length;
    const customized = pages.filter(p => p.isCustom).length;
    const optimalTitles = pages.filter(p => p.title && p.title.length >= 45 && p.title.length <= 65).length;
    const optimalDescriptions = pages.filter(p => p.description && p.description.length >= 120 && p.description.length <= 165).length;
    const noindexed = pages.filter(p => p.noindex).length;

    return { total, customized, optimalTitles, optimalDescriptions, noindexed };
  }, [pages]);

  // Categories list
  const categories: string[] = ['All', 'Core Pages', 'Commercial Categories', 'Locations', 'Workflows', 'Informational', 'Custom'];

  // Filtered pages
  const filteredPages = useMemo(() => {
    return pages.filter(page => {
      const matchesSearch = 
        page.pageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.keywords.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || page.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [pages, searchQuery, selectedCategory]);

  const handleEditClick = (page: PageSeoConfig) => {
    setEditingPage({ ...page });
  };

  const handleSaveEdit = async () => {
    if (!editingPage) return;
    setIsSaving(true);
    try {
      await onSavePage(editingPage);
      setSaveSuccessToast(`Saved SEO for "${editingPage.pageName}"`);
      setTimeout(() => setSaveSuccessToast(null), 3000);
      setEditingPage(null);
    } catch (err) {
      console.error('Failed to save page SEO:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCustomPage = async () => {
    if (!newPagePath.trim() || !newPageName.trim()) return;

    let cleanPath = newPagePath.trim();
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

    const newConfig: PageSeoConfig = {
      id: `page-custom-${Date.now()}`,
      path: cleanPath,
      pageName: newPageName.trim(),
      category: newPageCategory,
      title: `${newPageName.trim()} | Shristi Estate Commercial Advisory`,
      description: `Explore ${newPageName.trim()} in Noida and Delhi NCR with verified listings and specialist advisory from Shristi Estate.`,
      keywords: `${newPageName.toLowerCase()}, commercial real estate noida, shristi estate`,
      canonicalUrl: `https://shristiestate.in${cleanPath}`,
      ogTitle: `${newPageName.trim()} | Shristi Estate`,
      ogDescription: `Explore ${newPageName.trim()} in Noida and Delhi NCR with verified commercial real estate listings.`,
      ogImage: 'https://shristiestate.in/hero-commercial-park.jpg',
      noindex: false,
      isCustom: true
    };

    setIsSaving(true);
    try {
      await onSavePage(newConfig);
      setSaveSuccessToast(`Created SEO for new route "${cleanPath}"`);
      setTimeout(() => setSaveSuccessToast(null), 3000);
      setShowAddCustomModal(false);
      setNewPagePath('');
      setNewPageName('');
    } finally {
      setIsSaving(false);
    }
  };

  const syncMetaToOg = () => {
    if (!editingPage) return;
    setEditingPage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ogTitle: prev.title,
        ogDescription: prev.description
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* SUCCESS TOAST */}
      {saveSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-600/30 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Granular Search Engine Optimization</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              Page SEO & Meta Tag Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Configure route-specific titles, meta descriptions, canonical URLs, Open Graph preview cards, and indexing directives for every individual page across Shristi Estate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddCustomModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Route SEO</span>
            </button>

            <button
              onClick={() => setShowResetAllConfirm(true)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Reset all pages to system defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Managed Pages</span>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit']">
              {metrics.total}
            </div>
            <span className="text-[11px] text-slate-500">{metrics.customized} Customized by Admin</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Title Health (50-65 chars)</span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 font-['Outfit']">
              {metrics.optimalTitles} / {metrics.total}
            </div>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Optimal Google SERP Length</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Description Health</span>
            <div className="text-xl sm:text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5 font-['Outfit']">
              {metrics.optimalDescriptions} / {metrics.total}
            </div>
            <span className="text-[11px] text-cyan-600/80 dark:text-cyan-400/80">120-165 Chars Snippet Range</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Search Directives</span>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit']">
              {metrics.total - metrics.noindexed} Indexable
            </div>
            <span className="text-[11px] text-amber-500 font-medium">{metrics.noindexed} Noindexed (Legal)</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="glass-card rounded-2xl p-4 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search pages by name, path (/office-space), title, or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 admin-scrollbar shrink-0 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PAGES LIST TABLE / CARDS */}
      <div className="glass-card rounded-2xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredPages.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No pages match your filter</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or selected category.</p>
            </div>
          ) : (
            filteredPages.map(page => {
              const titleLen = page.title?.length || 0;
              const descLen = page.description?.length || 0;
              const isTitleOptimal = titleLen >= 45 && titleLen <= 65;
              const isDescOptimal = descLen >= 120 && descLen <= 165;

              return (
                <div 
                  key={page.id} 
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors"
                >
                  {/* Left: Page Meta Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">
                        {page.pageName}
                      </span>
                      <a
                        href={page.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-brand-600 dark:text-brand-400 hover:underline"
                        title="View live page in new tab"
                      >
                        <span>{page.path}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                        {page.category}
                      </span>
                      {page.isCustom ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Customized
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-400">
                          Default
                        </span>
                      )}
                      {page.noindex && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          noindex
                        </span>
                      )}
                    </div>

                    {/* SEO Title Line */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {page.title}
                      </span>
                      <span className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded ${
                        isTitleOptimal 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {titleLen} chars
                      </span>
                    </div>

                    {/* Meta Description Line */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                      {page.description}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                    <button
                      onClick={() => handleEditClick(page)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit SEO</span>
                    </button>

                    {page.isCustom && (
                      <button
                        onClick={async () => {
                          if (confirm(`Reset SEO for "${page.pageName}" back to original system default?`)) {
                            await onResetPage(page.id);
                            setSaveSuccessToast(`Reset "${page.pageName}" to default.`);
                            setTimeout(() => setSaveSuccessToast(null), 3000);
                          }
                        }}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Reset to default system SEO"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingPage && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex min-h-full items-start sm:items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl my-auto max-h-[96vh] sm:max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setEditingPage(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="mb-4 shrink-0 pr-8">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Editing Page SEO Configuration</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] mt-0.5">
                {editingPage.pageName} ({editingPage.path})
              </h2>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-6 admin-scrollbar text-xs sm:text-sm">
              {/* Meta Title Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Meta Title</span>
                    <span className="text-[11px] font-normal text-slate-400">(Appears in browser tabs & Google search snippet)</span>
                  </label>
                  <span className={`text-xs font-mono font-semibold ${
                    editingPage.title.length >= 45 && editingPage.title.length <= 65
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-500'
                  }`}>
                    {editingPage.title.length} / 60 recommended
                  </span>
                </div>
                <input
                  type="text"
                  value={editingPage.title}
                  onChange={e => setEditingPage({ ...editingPage, title: e.target.value })}
                  placeholder="Primary keyword | Secondary keyword | Shristi Estate"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs sm:text-sm"
                />
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      editingPage.title.length >= 45 && editingPage.title.length <= 65
                        ? 'bg-emerald-500'
                        : editingPage.title.length > 65
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (editingPage.title.length / 65) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Meta Description Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Meta Description</span>
                    <span className="text-[11px] font-normal text-slate-400">(Snippet shown on Google search results)</span>
                  </label>
                  <span className={`text-xs font-mono font-semibold ${
                    editingPage.description.length >= 120 && editingPage.description.length <= 165
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-500'
                  }`}>
                    {editingPage.description.length} / 160 recommended
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={editingPage.description}
                  onChange={e => setEditingPage({ ...editingPage, description: e.target.value })}
                  placeholder="Engaging, accurate summary including primary micro-markets, value proposition, and call to action..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs sm:text-sm leading-relaxed"
                />
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      editingPage.description.length >= 120 && editingPage.description.length <= 165
                        ? 'bg-emerald-500'
                        : editingPage.description.length > 165
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (editingPage.description.length / 165) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Meta Keywords & Canonical URL Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Meta Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingPage.keywords}
                    onChange={e => setEditingPage({ ...editingPage, keywords: e.target.value })}
                    placeholder="office space noida, sector 62 commercial, corporate leasing"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    value={editingPage.canonicalUrl || `https://shristiestate.in${editingPage.path}`}
                    onChange={e => setEditingPage({ ...editingPage, canonicalUrl: e.target.value })}
                    placeholder="https://shristiestate.in/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              {/* Open Graph & Social Sharing Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Share2 className="w-4 h-4 text-emerald-500" />
                    <span>Open Graph & Social Share Preview (WhatsApp, LinkedIn, Twitter)</span>
                  </div>
                  <button
                    type="button"
                    onClick={syncMetaToOg}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy from Meta Tags</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">OG Title</label>
                    <input
                      type="text"
                      value={editingPage.ogTitle || ''}
                      onChange={e => setEditingPage({ ...editingPage, ogTitle: e.target.value })}
                      placeholder="Title on social cards..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">OG Image URL</label>
                    <input
                      type="text"
                      value={editingPage.ogImage || ''}
                      onChange={e => setEditingPage({ ...editingPage, ogImage: e.target.value })}
                      placeholder="https://shristiestate.in/images/..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">OG Description</label>
                  <textarea
                    rows={2}
                    value={editingPage.ogDescription || ''}
                    onChange={e => setEditingPage({ ...editingPage, ogDescription: e.target.value })}
                    placeholder="Brief summary when link is shared in WhatsApp or social feeds..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Robots Indexation Directive */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs sm:text-sm">
                    Search Engine Indexing Directive
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {editingPage.noindex 
                      ? '⚠️ This page is currently hidden from search engine crawlers (noindex, nofollow).' 
                      : '✅ Active for Google, Bing, and AI search indexing (index, follow).'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!editingPage.noindex}
                    onChange={e => setEditingPage({ ...editingPage, noindex: !e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* LIVE PREVIEWS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Search & Social Preview</span>
                  </span>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setActivePreviewDevice('desktop')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        activePreviewDevice === 'desktop' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Google SERP
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewDevice('mobile')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        activePreviewDevice === 'mobile' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Social Card
                    </button>
                  </div>
                </div>

                {activePreviewDevice === 'desktop' ? (
                  /* GOOGLE SERP PREVIEW */
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800 shadow-inner font-sans space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[9px] text-brand-600">
                        S
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Shristi Estate</span>
                      <span>›</span>
                      <span className="truncate">{editingPage.canonicalUrl || `https://shristiestate.in${editingPage.path}`}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1">
                      {editingPage.title || 'Untitled Page | Shristi Estate'}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {editingPage.description || 'No meta description configured yet.'}
                    </p>
                  </div>
                ) : (
                  /* SOCIAL / WHATSAPP CARD PREVIEW */
                  <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070C1E] shadow-md">
                    <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                      {editingPage.ogImage ? (
                        <img 
                          src={editingPage.ogImage} 
                          alt="OG Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://shristiestate.in/hero-commercial-park.jpg';
                          }}
                        />
                      ) : (
                        <Globe className="w-12 h-12 text-slate-400" />
                      )}
                    </div>
                    <div className="p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">shristiestate.in</span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {editingPage.ogTitle || editingPage.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                        {editingPage.ogDescription || editingPage.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save SEO Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM ROUTE MODAL */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex min-h-full items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl">
            <button
              onClick={() => setShowAddCustomModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Custom Route
              </span>
              <h3 className="text-xl font-bold font-['Outfit'] mt-0.5">
                Add SEO for New Page / Route
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure SEO for a custom campaign page, landing page, or dynamic sub-path.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Route Path</label>
                <input
                  type="text"
                  value={newPagePath}
                  onChange={e => setNewPagePath(e.target.value)}
                  placeholder="/commercial-leasing-guide-2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Page Friendly Name</label>
                <input
                  type="text"
                  value={newPageName}
                  onChange={e => setNewPageName(e.target.value)}
                  placeholder="2026 Commercial Leasing Guide"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={newPageCategory}
                  onChange={e => setNewPageCategory(e.target.value as PageSeoCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="Core Pages">Core Pages</option>
                  <option value="Commercial Categories">Commercial Categories</option>
                  <option value="Locations">Locations</option>
                  <option value="Workflows">Workflows</option>
                  <option value="Informational">Informational</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateCustomPage}
                disabled={!newPagePath.trim() || !newPageName.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                Create & Configure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET ALL MODAL */}
      {showResetAllConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex min-h-full items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-card rounded-3xl p-6 bg-white dark:bg-[#0B132B] border border-rose-500/30 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 font-['Outfit']">
              Reset All Page SEO to System Defaults?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              This will overwrite all custom titles, descriptions, and Open Graph settings across every page back to their initial factory defaults. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetAllConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onResetAll();
                  setShowResetAllConfirm(false);
                  setSaveSuccessToast('All pages reset to default SEO settings.');
                  setTimeout(() => setSaveSuccessToast(null), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
