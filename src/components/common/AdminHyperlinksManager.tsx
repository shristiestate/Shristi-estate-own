import React, { useState } from 'react';
import { Link2, Plus, Edit3, Trash2, Globe, ExternalLink, Phone, Mail, Check, X, Search, Sparkles } from 'lucide-react';
import { HyperlinkConfig } from '../../types';
import { INTERNAL_PAGE_PRESETS, formatHyperlinkUrl } from '../../utils/hyperlinks';

interface AdminHyperlinksManagerProps {
  hyperlinks: HyperlinkConfig[];
  onChange: (updated: HyperlinkConfig[]) => void;
  entityName?: string;
}

export const AdminHyperlinksManager: React.FC<AdminHyperlinksManagerProps> = ({
  hyperlinks,
  onChange,
  entityName = 'Page'
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [filterSearch, setFilterSearch] = useState('');
  const [presetSearch, setPresetSearch] = useState('');

  const [input, setInput] = useState<HyperlinkConfig>({
    text: '',
    url: '',
    type: 'internal',
    open_in_new_tab: false,
    title: '',
    match_mode: 'first',
    max_occurrences: 1
  });

  const handleOpenAdd = () => {
    setInput({
      text: '',
      url: '',
      type: 'internal',
      open_in_new_tab: false,
      title: '',
      match_mode: 'first',
      max_occurrences: 1
    });
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleOpenEdit = (idx: number) => {
    const item = hyperlinks[idx];
    if (!item) return;
    setInput({ ...item });
    setEditingIndex(idx);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!input.text.trim() || !input.url.trim()) {
      alert('Please provide both Words/Phrase and Destination URL.');
      return;
    }

    const formattedUrl = formatHyperlinkUrl(input.url.trim(), input.type);
    const item: HyperlinkConfig = {
      ...input,
      id: input.id || `hl-${Date.now()}`,
      text: input.text.trim(),
      url: formattedUrl,
      title: input.title?.trim() || input.text.trim()
    };

    let updated: HyperlinkConfig[];
    if (editingIndex !== null && editingIndex >= 0) {
      updated = [...hyperlinks];
      updated[editingIndex] = item;
    } else {
      updated = [...hyperlinks, item];
    }

    onChange(updated);
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    onChange(hyperlinks.filter((_, i) => i !== index));
  };

  const filteredPresets = INTERNAL_PAGE_PRESETS.filter(p => 
    p.label.toLowerCase().includes(presetSearch.toLowerCase()) ||
    p.url.toLowerCase().includes(presetSearch.toLowerCase()) ||
    (p.group && p.group.toLowerCase().includes(presetSearch.toLowerCase()))
  );

  const displayedHyperlinks = filterSearch
    ? hyperlinks.filter(h => h.text.toLowerCase().includes(filterSearch.toLowerCase()) || h.url.toLowerCase().includes(filterSearch.toLowerCase()))
    : hyperlinks;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-brand-900 dark:text-brand-200 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>SEO Hyperlink Words Engine</span>
          </span>
          <p className="text-[11px] text-brand-700 dark:text-brand-300 mt-0.5">
            Automatically transforms key phrases (e.g. "Office Space in Sector 62") into SEO-friendly links without touching HTML.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-glass-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Hyperlink Word</span>
        </button>
      </div>

      {/* INLINE ADD/EDIT FORM */}
      {showForm && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {editingIndex !== null ? 'Edit Hyperlink Word' : 'Configure New Hyperlink Word'}
            </span>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingIndex(null); }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Words / Target Phrase to Link *
              </label>
              <input
                type="text"
                value={input.text}
                onChange={(e) => setInput(prev => ({ ...prev, text: e.target.value }))}
                placeholder="e.g. Office Space in Sector 62"
                className="glass-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                The exact text or keywords in {entityName} overview to convert into a link.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Link Type
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'internal', label: 'Internal', icon: Globe },
                  { id: 'external', label: 'External', icon: ExternalLink },
                  { id: 'phone', label: 'Phone', icon: Phone },
                  { id: 'email', label: 'Email', icon: Mail }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = input.type === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setInput(prev => ({ ...prev, type: item.id as any }))}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Internal Page Suggestions */}
          {input.type === 'internal' && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-500" />
                  <span>Internal Page Suggestions (Click to Apply)</span>
                </span>
                <input
                  type="text"
                  value={presetSearch}
                  onChange={(e) => setPresetSearch(e.target.value)}
                  placeholder="Filter pages..."
                  className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-28"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {filteredPresets.slice(0, 14).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(prev => ({
                        ...prev,
                        url: preset.url,
                        text: prev.text || preset.label
                      }));
                    }}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-colors ${
                      input.url === preset.url
                        ? 'bg-brand-600 text-white border-brand-600 font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                    }`}
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Destination URL */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Destination URL *
            </label>
            <input
              type="text"
              value={input.url}
              onChange={(e) => setInput(prev => ({ ...prev, url: e.target.value }))}
              placeholder={input.type === 'phone' ? '8750098666' : input.type === 'email' ? 'info@shristiestate.in' : '/commercial-real-estate/sector-62'}
              className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Match Mode</label>
              <select
                value={input.match_mode || 'first'}
                onChange={(e) => setInput(prev => ({ ...prev, match_mode: e.target.value as any }))}
                className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
              >
                <option value="first">First occurrence only (Recommended)</option>
                <option value="all">All occurrences</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Max Occurrences</label>
              <input
                type="number"
                min="1"
                max="10"
                value={input.max_occurrences || 1}
                onChange={(e) => setInput(prev => ({ ...prev, max_occurrences: Number(e.target.value) || 1 }))}
                className="glass-input w-full px-3 py-1.5 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center pt-4">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.open_in_new_tab || false}
                  onChange={(e) => setInput(prev => ({ ...prev, open_in_new_tab: e.target.checked }))}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Open in New Tab</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingIndex(null); }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-glass-primary px-4 py-1.5 rounded-xl text-xs font-bold"
            >
              {editingIndex !== null ? 'Update Hyperlink' : 'Save Hyperlink'}
            </button>
          </div>
        </div>
      )}

      {/* HYPERLINKS TABLE */}
      <div className="space-y-2">
        {hyperlinks.length > 3 && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-500">
              {displayedHyperlinks.length} of {hyperlinks.length} active links
            </span>
            <div className="relative w-44">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search links..."
                className="w-full pl-7 pr-2 py-1 rounded-lg text-[11px] glass-input"
              />
            </div>
          </div>
        )}

        {hyperlinks.length === 0 ? (
          <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
            <Link2 className="w-6 h-6 mx-auto mb-1 opacity-50" />
            <p className="text-xs">No hyperlink words configured yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click "+ Add Hyperlink Word" above to link phrases in the overview text automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-3 py-2">Words / Target Phrase</th>
                  <th className="px-3 py-2">Destination URL</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Mode</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/60 dark:bg-[#070C1E]/60">
                {displayedHyperlinks.map((hl, idx) => (
                  <tr key={hl.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-bold text-brand-600 dark:text-brand-400">
                      {hl.text}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={hl.url}>
                      {hl.url}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {hl.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-400">
                      {hl.match_mode === 'all' ? 'All' : '1st'}
                      {hl.open_in_new_tab ? ' (New tab)' : ''}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(idx)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          title="Edit Hyperlink"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(idx)}
                          className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                          title="Delete Hyperlink"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
