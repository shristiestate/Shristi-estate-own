import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, BookOpen, Clock, User, Search, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { StorageService } from '../services/storageService';
import { MarketGuide } from '../types';
import { getBlogFeaturedImage, getBlogImageAlt, DEFAULT_BLOG_PLACEHOLDER_IMAGE } from '../utils/blogConstants';
import { updatePageSeo } from '../utils/seo';

export const BlogPage: React.FC = () => {
  const [guides, setGuides] = useState<MarketGuide[]>(() => 
    StorageService.getInitialGuides().filter(g => g.published !== false)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    StorageService.getGuides().then((all) => {
      if (isMounted) {
        setGuides(all.filter(g => g.published !== false));
      }
    });
    return () => { isMounted = false; };
  }, []);

  // SEO update for the main blog archive page
  useEffect(() => {
    const cleanup = updatePageSeo({
      title: 'Commercial Real Estate Guides & Insights Noida | Shristi Estate',
      description: 'In-depth market research, leasing guidelines, institutional IT park reviews, and micro-market commercial analyses for Noida and Delhi NCR.',
      canonicalUrl: 'https://shristiestate.in/blog',
      ogType: 'website',
      keywords: 'commercial real estate blog noida, office space guide sector 62, warehouse leasing noida, commercial market research delhi ncr'
    });
    return cleanup;
  }, []);

  const handleImageError = (guideId: string) => {
    setFailedImages(prev => ({ ...prev, [guideId]: true }));
  };

  const categories = ['All', ...Array.from(new Set(guides.map(g => g.category).filter(Boolean)))];

  const filteredGuides = guides.filter(guide => {
    if (selectedCategory !== 'All' && guide.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = guide.title.toLowerCase().includes(q);
      const inExcerpt = guide.excerpt.toLowerCase().includes(q);
      const inCategory = guide.category.toLowerCase().includes(q);
      const inAuthor = guide.author ? guide.author.toLowerCase().includes(q) : false;
      return inTitle || inExcerpt || inCategory || inAuthor;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
      <Breadcrumbs
        items={[
          { label: 'Market Insights & Guides' }
        ]}
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2.5">
        <span className="text-[10px] sm:text-[10.5px] font-mono font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60">
          <Sparkles className="w-3 h-3" />
          <span>Commercial Research & Intelligence</span>
        </span>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Commercial Real Estate Insights & Guides
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans max-w-2xl mx-auto">
          Comprehensive market research, institutional leasing guidelines, rental benchmarks, and micro-market intelligence across Noida, Greater Noida, and Delhi NCR.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 w-full md:w-auto no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                  : 'bg-white dark:bg-[#0B132B] border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search articles & topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Blog Cards Grid: 3 cards per row, 0px gap, 1px subtle border */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800 [&>*]:border-r [&>*]:border-b [&>*]:border-slate-200 dark:[&>*]:border-slate-800">
        {filteredGuides.map((post, idx) => {
          const isFailed = failedImages[post.id];
          const imageUrl = isFailed ? DEFAULT_BLOG_PLACEHOLDER_IMAGE : getBlogFeaturedImage(post);
          const imageAlt = getBlogImageAlt(post);
          const articleUrl = `/blog/${post.slug}`;
          const numberDisplay = String(idx + 1).padStart(2, '0');

          return (
            <article
              key={post.id}
              className="rounded-none bg-white dark:bg-[#0B132B] flex flex-col justify-between group transition-colors duration-300 hover:bg-slate-50/80 dark:hover:bg-[#0E1838]"
            >
              {/* Top Architectural Header: Icon + Category + Number (01, 02, ...) */}
              <div className="px-3.5 py-2 sm:px-4 sm:py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-white/[0.02]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                    {post.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold shrink-0">
                  {numberDisplay}
                </span>
              </div>

              {/* Top Featured Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <Link to={articleUrl} className="block w-full h-full">
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    loading="lazy"
                    decoding="async"
                    onError={() => handleImageError(post.id)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Top Category Badge */}
                <div className="absolute top-2.5 left-2.5 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-none text-[9.5px] font-mono font-semibold uppercase tracking-wider bg-brand-600 text-white shadow-sm">
                    {post.category}
                  </span>
                </div>

                {/* Featured Badge if applicable */}
                {post.featured && (
                  <div className="absolute top-2.5 right-2.5 pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded-none text-[9px] font-mono font-semibold uppercase tracking-wider bg-amber-500 text-white shadow-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Featured</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                <div className="space-y-1.5">
                  {/* Publication Date, Read Time, and Optional Author */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-brand-500" />
                      <span>{post.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-500" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  {/* Blog Title */}
                  <h2 className="text-[13px] sm:text-[13.5px] font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug tracking-tight line-clamp-2">
                    <Link to={articleUrl} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-[11px] sm:text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 font-sans">
                    {post.excerpt}
                  </p>

                  {/* Optional Author */}
                  {post.author && (
                    <div className="pt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>By {post.author}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Read More Action Link */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    to={articleUrl}
                    className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 group-hover:gap-1.5 transition-all hover:text-brand-700 dark:hover:text-brand-300"
                    aria-label={`Read more about ${post.title}`}
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <span className="text-[10px] font-mono text-slate-400">
                    {post.readTime}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGuides.length === 0 && (
        <div className="py-16 text-center rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] p-8 space-y-3 max-w-lg mx-auto">
          <BookOpen className="w-9 h-9 text-slate-400 mx-auto stroke-[1.5]" />
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
            No Guides Match Your Criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Try adjusting your search terms or selecting a different category filter.
          </p>
          <button
            type="button"
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="rounded-none border border-brand-600 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
