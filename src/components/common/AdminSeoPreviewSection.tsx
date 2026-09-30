import React from 'react';
import { Globe, Share2, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { computeSeoStatus } from '../../utils/seoHelpers';

interface AdminSeoPreviewSectionProps {
  title: string;
  seoTitle?: string;
  description: string;
  seoDescription?: string;
  slug: string;
  urlPrefix: string; // e.g. "https://shristiestate.in/buildings/" or "https://shristiestate.in/properties/"
  featuredImage?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  type: 'building' | 'property';
  entity: any;
}

export const AdminSeoPreviewSection: React.FC<AdminSeoPreviewSectionProps> = ({
  title,
  seoTitle,
  description,
  seoDescription,
  slug,
  urlPrefix,
  featuredImage,
  ogImage,
  ogTitle,
  ogDescription,
  type,
  entity
}) => {
  const displayTitle = seoTitle?.trim() || title?.trim() || 'Untitled Page';
  const displayDesc = seoDescription?.trim() || description?.trim() || 'No description entered yet.';
  const displayUrl = `${urlPrefix.replace(/\/$/, '')}/${slug || 'url-slug'}`;
  const displayImg = ogImage?.trim() || featuredImage?.trim() || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
  const displayOgTitle = ogTitle?.trim() || displayTitle;
  const displayOgDesc = ogDescription?.trim() || displayDesc;

  const seoCheck = computeSeoStatus(entity, type);

  return (
    <div className="space-y-4">
      {/* SEO Completeness Status Bar */}
      <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        seoCheck.status === 'Complete'
          ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          : 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
      }`}>
        <div className="flex items-center gap-2.5">
          {seoCheck.status === 'Complete' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          )}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">
              SEO Status: {seoCheck.status}
            </div>
            {seoCheck.status === 'Complete' ? (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                All essential metadata, image tags, and content fields are configured.
              </p>
            ) : (
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Missing: {seoCheck.missingFields.join(', ')}
              </p>
            )}
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-900/60 self-start sm:self-auto border border-current/20">
          {type === 'building' ? 'Tower / Building' : 'Commercial Property'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Search Result Preview */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
            <Globe className="w-3.5 h-3.5 text-brand-500" />
            <span>Google Search Preview</span>
          </div>

          <div className="space-y-1 font-sans">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
              {displayUrl}
            </div>
            <h4 className="text-sm font-semibold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer truncate">
              {displayTitle} | Shristi Estate
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {displayDesc}
            </p>
          </div>
        </div>

        {/* Social / WhatsApp Card Preview */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
            <Share2 className="w-3.5 h-3.5 text-brand-500" />
            <span>Social / WhatsApp Card Preview</span>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80">
            <div className="aspect-[16/9] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
              <img
                src={displayImg}
                alt="OG Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2.5 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">shristiestate.in</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {displayOgTitle}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug">
                {displayOgDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
