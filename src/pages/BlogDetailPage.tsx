import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Share2, 
  Check, 
  Building2, 
  BookOpen, 
  Sparkles,
  PhoneCall,
  MessageSquare,
  BookmarkCheck,
  ChevronRight
} from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { StorageService } from '../services/storageService';
import { MarketGuide } from '../types';
import { applyHyperlinksToContent } from '../utils/hyperlinks';
import { updatePageSeo } from '../utils/seo';
import { getBlogFeaturedImage, getBlogImageAlt, DEFAULT_BLOG_PLACEHOLDER_IMAGE } from '../utils/blogConstants';
import { generateGeneralEnquiryWhatsAppLink } from '../utils/whatsapp';

interface BlogDetailPageProps {
  onOpenEnquiry?: (customSubject?: string) => void;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ onOpenEnquiry }) => {
  const { slug } = useParams<{ slug: string }>();

  const initialGuide = slug ? StorageService.getInitialGuideBySlug(slug) : null;
  const [guide, setGuide] = useState<MarketGuide | null>(() => initialGuide);
  const [relatedGuides, setRelatedGuides] = useState<MarketGuide[]>([]);
  const [hasResolved, setHasResolved] = useState(() => Boolean(initialGuide));
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    StorageService.getGuideBySlug(slug).then(async (foundGuide) => {
      if (!isMounted) return;
      setGuide(foundGuide);
      setHasResolved(true);

      if (foundGuide) {
        // Fetch related published guides
        const all = await StorageService.getGuides();
        if (isMounted) {
          const published = all.filter(g => g.id !== foundGuide.id && g.published !== false);
          // Prefer same category, then fallback to others
          const sameCategory = published.filter(g => g.category === foundGuide.category);
          const others = published.filter(g => g.category !== foundGuide.category);
          setRelatedGuides([...sameCategory, ...others].slice(0, 3));
        }
      }
    }).catch(() => {
      if (isMounted) setHasResolved(true);
    });

    return () => { isMounted = false; };
  }, [slug]);

  // Update SEO metadata whenever guide changes
  useEffect(() => {
    if (!guide) return;

    const featuredImg = getBlogFeaturedImage(guide);
    const seoTitle = guide.seo_title || guide.title;
    const seoDescription = guide.seo_description || guide.excerpt;
    const canonicalUrl = `https://shristiestate.in/blog/${guide.slug}`;

    const cleanup = updatePageSeo({
      title: seoTitle,
      description: seoDescription,
      canonicalUrl,
      ogImage: featuredImg,
      ogType: 'article',
      article: {
        publishedTime: guide.created_at || guide.date,
        modifiedTime: guide.updated_at || guide.created_at || guide.date,
        author: guide.author || 'Shristi Estate Advisory Desk',
        section: guide.category
      }
    });

    return cleanup;
  }, [guide]);

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setImageError(false);
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!guide && hasResolved) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-none bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
          <BookOpen className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Market Guide Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
          The research article or market insight you are looking for may have been moved, renamed, or is currently under revision.
        </p>
        <div className="pt-2">
          <Link
            to="/blog"
            className="rounded-none border border-brand-600 bg-brand-600 hover:bg-brand-700 text-white inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Market Insights & Guides</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-none mx-auto" />
          <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-none mx-auto" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-none mx-auto" />
        </div>
      </div>
    );
  }

  const featuredImgUrl = imageError ? DEFAULT_BLOG_PLACEHOLDER_IMAGE : getBlogFeaturedImage(guide);
  const altText = getBlogImageAlt(guide);
  const articleHtml = applyHyperlinksToContent(guide.content || guide.excerpt || '', guide.hyperlinks);

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
      {/* Hierarchical Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: 'Market Insights & Guides', path: '/blog' },
            { label: guide.title }
          ]}
        />

        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Guides</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-4 sm:space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-none text-[10px] font-mono font-semibold uppercase tracking-wider bg-brand-600 text-white shadow-sm">
            {guide.category}
          </span>
          {guide.featured && (
            <span className="px-2.5 py-1 rounded-none text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-500 text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Featured Insight</span>
            </span>
          )}
        </div>

        {/* Primary H1 */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white leading-snug tracking-tight">
          {guide.title}
        </h1>

        {/* Meta Bar: Date, Read Time, Author, Share */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2.5 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-sans">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-500" />
              <span>{guide.date}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              <span>{guide.readTime}</span>
            </span>
            {guide.author && (
              <span className="flex items-center gap-1.5 font-sans">
                <User className="w-3.5 h-3.5 text-brand-500" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{guide.author}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-[#0E1838] text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider transition-all"
            title="Copy article link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share Guide</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Featured Image Section */}
      <section className="space-y-2.5">
        <div className="relative aspect-[16/9] sm:aspect-[21/10] w-full rounded-none overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
          <img
            src={featuredImgUrl}
            alt={altText}
            fetchPriority="high"
            decoding="async"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Optional Image Caption */}
        {guide.featured_image_caption && guide.featured_image_caption.trim().length > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic px-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
            <span>{guide.featured_image_caption.trim()}</span>
          </p>
        )}
      </section>

      {/* Executive Excerpt Highlight */}
      {guide.excerpt && (
        <div className="rounded-none p-4 sm:p-5 border-l-4 border-l-brand-600 border-y border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070C1E]">
          <div className="flex items-start gap-3">
            <BookmarkCheck className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5 stroke-[1.5]" />
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Key Takeaway / Overview
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                {guide.excerpt}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full Article Content with Hyperlinks Applied */}
      <section className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed space-y-4">
        <div 
          dangerouslySetInnerHTML={{ __html: articleHtml }}
          className="space-y-4"
        />
      </section>

      {/* Commercial Advisory Action Card (CTA) */}
      <section className="rounded-none p-5 sm:p-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10.5px] font-mono font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Commercial Lease & Acquisition Advisory</span>
            </span>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              Planning your next corporate move in Noida or Delhi NCR?
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Our enterprise advisory desk assists corporate occupiers with site selection, institutional negotiations, fit-out moratoriums, and lease diligence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <a
              href={generateGeneralEnquiryWhatsAppLink({ propertyName: guide.title })}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Advisory</span>
            </a>

            <Link
              to="/tell-us-requirement"
              className="btn-glass-primary rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <span>Submit Requirement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Related / Previous Articles Section */}
      {relatedGuides.length > 0 && (
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-[10.5px] font-mono font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Continue Reading
              </span>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight mt-0.5">
                Related Commercial Insights
              </h3>
            </div>
            <Link
              to="/blog"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 uppercase tracking-wider font-mono text-[10.5px]"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800 [&>*]:border-r [&>*]:border-b [&>*]:border-slate-200 dark:[&>*]:border-slate-800">
            {relatedGuides.map((relGuide, idx) => {
              const relImg = getBlogFeaturedImage(relGuide);
              const relAlt = getBlogImageAlt(relGuide);
              const numberDisplay = String(idx + 1).padStart(2, '0');

              return (
                <article
                  key={relGuide.id}
                  className="rounded-none bg-white dark:bg-[#0B132B] flex flex-col justify-between group transition-colors duration-300 hover:bg-slate-50/80 dark:hover:bg-[#0E1838]"
                >
                  {/* Top Architectural Header */}
                  <div className="px-3.5 py-2 sm:px-4 sm:py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                        {relGuide.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold shrink-0">
                      {numberDisplay}
                    </span>
                  </div>

                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <Link to={`/blog/${relGuide.slug}`} className="block w-full h-full">
                      <img
                        src={relImg}
                        alt={relAlt}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <div className="absolute top-2.5 left-2.5 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-none text-[9.5px] font-mono font-semibold uppercase tracking-wider bg-brand-600 text-white shadow-sm">
                        {relGuide.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-brand-500" />
                          <span>{relGuide.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brand-500" />
                          <span>{relGuide.readTime}</span>
                        </span>
                      </div>
                      <h4 className="text-[13px] sm:text-[13.5px] font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug tracking-tight">
                        <Link to={`/blog/${relGuide.slug}`}>
                          {relGuide.title}
                        </Link>
                      </h4>
                      <p className="text-[11px] sm:text-[11.5px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-sans">
                        {relGuide.excerpt}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <Link
                        to={`/blog/${relGuide.slug}`}
                        className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 group-hover:gap-1.5 transition-all"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <span className="text-[10px] font-mono text-slate-400">
                        {relGuide.readTime}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
};
