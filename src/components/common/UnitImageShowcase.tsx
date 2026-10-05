import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UnitImageShowcaseProps {
  images: string[];
  alt: string;
  aspectRatio?: string;
  interval?: number;
  className?: string;
  children?: React.ReactNode;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80';

export const UnitImageShowcase: React.FC<UnitImageShowcaseProps> = ({
  images: rawImages,
  alt,
  aspectRatio = 'aspect-[16/10]',
  interval = 3800,
  className = '',
  children
}) => {
  // Clean and deduplicate images
  const images = React.useMemo(() => {
    const list = (rawImages || []).filter(img => typeof img === 'string' && img.trim().length > 0);
    return list.length > 0 ? list : [FALLBACK_IMAGE];
  }, [rawImages]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Viewport intersection observer: only animate when card is actually visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-animate image transition ONLY when in viewport and not paused
  useEffect(() => {
    if (images.length <= 1 || isPaused || !isVisible) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, interval, isPaused, isVisible]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(idx);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full ${aspectRatio} overflow-hidden bg-slate-900 group select-none ${className}`}
    >
      {/* Active and Adjacent Image Layers */}
      {images.map((src, idx) => {
        const isActive = idx === currentIndex;
        // Optimization: Only mount DOM images if active or adjacent to avoid downloading entire gallery upfront
        const isAdjacent = Math.abs(idx - currentIndex) <= 1 || (currentIndex === 0 && idx === images.length - 1) || (currentIndex === images.length - 1 && idx === 0);
        if (!isActive && !isAdjacent) return null;

        return (
          <div
            key={src + idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            <img
              src={src}
              alt={`${alt} - Photo ${idx + 1}`}
              loading={idx === 0 ? 'lazy' : 'lazy'}
              decoding="async"
              className={`w-full h-full object-cover transition-transform duration-3000 ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
          </div>
        );
      })}

      {/* Subtle Gradient Overlays for Badges & Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/35 pointer-events-none z-10" />

      {/* Interactive Hover Navigation Chevrons (when multiple images) */}
      {images.length > 1 && (
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous unit photo"
            className="w-7 h-7 rounded-none bg-black/70 hover:bg-black text-white flex items-center justify-center pointer-events-auto transition-transform active:scale-95 cursor-pointer border border-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next unit photo"
            className="w-7 h-7 rounded-none bg-black/70 hover:bg-black text-white flex items-center justify-center pointer-events-auto transition-transform active:scale-95 cursor-pointer border border-white/20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top/Overlay Children (Badges, Status, Ref ID) */}
      <div className="relative z-20 h-full flex flex-col justify-between pointer-events-none">
        {children}

        {/* Animated Segmented Progress Bars (Sharp 0px) */}
        {images.length > 1 && (
          <div className="absolute bottom-1.5 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-auto z-20 py-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleDotClick(e, idx)}
                aria-label={`Go to photo ${idx + 1}`}
                className={`h-[2px] rounded-none transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitImageShowcase;
