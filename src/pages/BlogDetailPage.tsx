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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-lg">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          Market Guide Not Found
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          The research article or market insight you are looking for may have been moved, renamed, or is currently under revision.
        </p>
        <div className="pt-2">
          <Link
            to="/blog"
            className="btn-glass-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
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
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto" />
          <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl mx-auto" />
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
      <header className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm">
            {guide.category}
          </span>
          {guide.featured && (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Featured Insight</span>
            </span>
          )}
        </div>

        {/* Primary H1 */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] leading-tight tracking-tight">
          {guide.title}
        </h1>

        {/* Meta Bar: Date, Read Time, Author, Share */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-500" />
              <span>{guide.date}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-500" />
              <span>{guide.readTime}</span>
            </span>
            {guide.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-500" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{guide.author}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-all shadow-sm"
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
        <div className="relative aspect-[16/9] sm:aspect-[21/10] w-full rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xl">
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
        <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-l-4 border-l-brand-600 border-slate-200 dark:border-slate-800 bg-brand-50/40 dark:bg-brand-950/20 shadow-md">
          <div className="flex items-start gap-3">
            <BookmarkCheck className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Key Takeaway / Overview
              </span>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {guide.excerpt}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full Article Content with Hyperlinks Applied */}
      <section className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
        <div 
          dangerouslySetInnerHTML={{ __html: articleHtml }}
          className="space-y-4"
        />
      </section>

      {/* Commercial Advisory Action Card (CTA) */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white/90 via-brand-50/20 to-slate-50 dark:from-[#0B132B] dark:via-brand-950/20 dark:to-slate-900 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Commercial Lease & Acquisition Advisory</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Planning your next corporate move in Noida or Delhi NCR?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Our enterprise advisory desk assists corporate occupiers with site selection, institutional negotiations, fit-out moratoriums, and lease diligence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <a
              href={generateGeneralEnquiryWhatsAppLink({ propertyName: guide.title })}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Advisory</span>
            </a>

            <Link
              to="/tell-us-requirement"
              className="btn-glass-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>Submit Requirement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Related / Previous Articles Section */}
      {relatedGuides.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Continue Reading
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                Related Commercial Insights
              </h3>
            </div>
            <Link
              to="/blog"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedGuides.map((relGuide) => {
              const relImg = getBlogFeaturedImage(relGuide);
              const relAlt = getBlogImageAlt(relGuide);
              return (
                <div
                  key={relGuide.id}
                  className="glass-card rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 flex flex-col justify-between group shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={relImg}
                      alt={relAlt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-600 text-white shadow-sm">
                        {relGuide.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{relGuide.date}</span>
                        <span>•</span>
                        <span>{relGuide.readTime}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit'] line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {relGuide.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {relGuide.excerpt}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        to={`/blog/${relGuide.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:gap-1.5 transition-all"
                      >
                        <span>Read More</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
};
