import React, { useState, useEffect, useRef } from 'react';
import { Play, Eye, Heart, ExternalLink, ChevronLeft, ChevronRight, Video, Sparkles } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { InstagramReel } from '../../types';

// Instagram Gradient SVG Icon
const InstagramGradientIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad)" strokeWidth="2" />
    <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad)" />
  </svg>
);

export const InstagramReelsShowcase: React.FC = () => {
  const [reels, setReels] = useState<InstagramReel[]>(() => {
    return StorageService.getInitialInstagramReels().filter(r => r.published);
  });
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    StorageService.getInstagramReels().then((data) => {
      setReels(data.filter(r => r.published));
    });
  }, []);

  // Viewport Intersection: Only animate when visible to save 100% of CPU during initial load
  useEffect(() => {
    const target = sectionRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '150px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Smooth continuous auto-scroll only when in view and not paused
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || reels.length === 0 || isPaused || !isVisible) return;

    let animId: number;
    const scrollStep = 0.75; // Smooth scroll speed

    const scrollLoop = () => {
      if (!isPaused && el) {
        el.scrollLeft += scrollStep;
        // If scrolled past half (duplicate items), loop back seamlessly
        if (el.scrollLeft >= (el.scrollWidth - el.clientWidth) / 2) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(scrollLoop);
    };

    animId = requestAnimationFrame(scrollLoop);

    return () => cancelAnimationFrame(animId);
  }, [reels.length, isPaused, isVisible]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = 300;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (!reels || reels.length === 0) return null;

  // Duplicate for seamless infinite loop scroll
  const displayReels = [...reels, ...reels];

  return (
    <section ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[300px] bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800/80 text-pink-700 dark:text-pink-300 text-xs font-semibold mb-2">
            <InstagramGradientIcon className="w-4 h-4" />
            <span>Live Property Walkthroughs & Video Reels</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit'] mt-1">
            Explore Spaces on Instagram Reels
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Watch virtual site tours, high-clearance warehouse walkthroughs, and commercial real estate insights directly on Instagram.
          </p>
        </div>

        {/* Right Actions: Instagram Profile link & Nav Chevrons */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-md hover:opacity-95 transition-opacity"
          >
            <InstagramGradientIcon className="w-4 h-4" />
            <span>Follow @shristiestate</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Scroll reels left"
              className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Scroll reels right"
              className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Animated Horizontal Reels Showcase */}
      <div
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
        style={{ scrollBehavior: 'auto' }}
      >
        {displayReels.map((reel, idx) => (
          <a
            key={`${reel.id}-${idx}`}
            href={reel.reel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative shrink-0 w-[220px] sm:w-[250px] aspect-[9/16] rounded-3xl overflow-hidden glass-card group border border-slate-200/80 dark:border-slate-800/80 shadow-lg hover:shadow-2xl hover:border-pink-500/60 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Background Thumbnail Image */}
            <img
              src={reel.thumbnail_url}
              alt={reel.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
              }}
            />

            {/* Gradient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/40 pointer-events-none" />

            {/* Top Bar: Instagram Reel Badge & Duration */}
            <div className="relative z-10 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-semibold">
                <InstagramGradientIcon className="w-3 h-3" />
                <span>Reel</span>
              </div>

              {reel.duration && (
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono">
                  {reel.duration}
                </span>
              )}
            </div>

            {/* Center: Glowing Play Button on Hover */}
            <div className="relative z-10 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-115 group-hover:bg-gradient-to-tr group-hover:from-pink-500 group-hover:to-amber-400 group-hover:border-transparent transition-all duration-300 shadow-xl">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            {/* Bottom Content: Views, Title, Watch Callout */}
            <div className="relative z-10 p-4 space-y-2">
              {reel.views_display && (
                <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold">
                  <Eye className="w-3.5 h-3.5 text-pink-400" />
                  <span>{reel.views_display} views</span>
                  {reel.likes_display && (
                    <>
                      <span className="text-white/40">•</span>
                      <Heart className="w-3 h-3 text-rose-400 fill-current" />
                      <span>{reel.likes_display}</span>
                    </>
                  )}
                </div>
              )}

              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-pink-200 transition-colors font-['Outfit']">
                {reel.title}
              </h3>

              <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-pink-400 group-hover:text-white transition-colors">
                <span>Watch on Instagram</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default InstagramReelsShowcase;
