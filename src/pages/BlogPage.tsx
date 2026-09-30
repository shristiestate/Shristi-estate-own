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
      <div className="text-center max-w-3xl mx-auto space-y-3.5">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Commercial Research & Intelligence</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
          Commercial Real Estate Insights & Guides
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Comprehensive market research, institutional leasing guidelines, rental benchmarks, and micro-market intelligence across Noida, Greater Noida, and Delhi NCR.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full md:w-auto no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'glass-card border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search articles & topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredGuides.map((post) => {
          const isFailed = failedImages[post.id];
          const imageUrl = isFailed ? DEFAULT_BLOG_PLACEHOLDER_IMAGE : getBlogFeaturedImage(post);
          const imageAlt = getBlogImageAlt(post);
          const articleUrl = `/blog/${post.slug}`;

          return (
            <article
              key={post.id}
              className="glass-card rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Top Featured Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
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
                <div className="absolute top-3 left-3 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-600 text-white shadow-md">
                    {post.category}
                  </span>
                </div>

                {/* Featured Badge if applicable */}
                {post.featured && (
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Featured</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Publication Date, Read Time, and Optional Author */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span>{post.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  {/* Blog Title */}
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                    <Link to={articleUrl} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Optional Author */}
                  {post.author && (
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>By {post.author}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Read More Action Link */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    to={articleUrl}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400 group-hover:gap-2 transition-all hover:text-brand-700 dark:hover:text-brand-300"
                    aria-label={`Read more about ${post.title}`}
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <span className="text-[11px] text-slate-400 font-medium">
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
        <div className="py-16 text-center glass-card rounded-3xl p-8 space-y-4 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No Guides Match Your Criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search terms or selecting a different category filter.
          </p>
          <button
            type="button"
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
