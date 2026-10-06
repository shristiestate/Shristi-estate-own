import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause,
  Eye, 
  Heart, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Video, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X,
  MessageCircle,
  Maximize2
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { InstagramReel } from '../../types';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

// Brand Corporate Themed Instagram Vector Icon
const InstagramBrandIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="ig-grad-brand" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad-brand)" strokeWidth="2" />
    <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad-brand)" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad-brand)" />
  </svg>
);

interface CarouselGeometryConfig {
  cardWidth: number;
  cardHeight: number;
  baseGap: number;
  perspective: number;
  maxSlots: number;
  depthCenter: number;
  depthEdge: number;
  maxAngle: number;
  scaleCenter: number;
  scaleEdge: number;
}

export const InstagramReelsShowcase: React.FC = () => {
  const [reels, setReels] = useState<InstagramReel[]>(() => {
    return StorageService.getInitialInstagramReels().filter(r => r.published);
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const [containerWidth, setContainerWidth] = useState<number>(1200);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hoveredReelId, setHoveredReelId] = useState<string | null>(null);

  // Global mute toggle for inline card previews
  const [isInlineMuted, setIsInlineMuted] = useState<boolean>(true);

  // Modal Preview Player State
  const [modalReel, setModalReel] = useState<InstagramReel | null>(null);
  const [modalIsPlaying, setModalIsPlaying] = useState<boolean>(true);
  const [modalIsMuted, setModalIsMuted] = useState<boolean>(false);
  const [modalProgress, setModalProgress] = useState<number>(0);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  // Smooth continuous progress: floating-point index of the center card
  const [progress, setProgress] = useState<number>(0);
  const progressRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Drag interaction state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartProgressRef = useRef<number>(0);
  const lastDragXRef = useRef<number>(0);
  const lastDragTimeRef = useRef<number>(0);
  const dragVelocityRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);

  useEffect(() => {
    StorageService.getInstagramReels().then((data) => {
      const pub = data.filter(r => r.published);
      if (pub.length > 0) setReels(pub);
    });
  }, []);

  // Responsive container observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleResize = () => {
      if (el) setContainerWidth(el.clientWidth || 1200);
    };
    handleResize();

    const ro = new ResizeObserver(() => handleResize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Viewport intersection observer to conserve CPU
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
      { rootMargin: '120px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalReel) {
        setModalReel(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalReel]);

  // Carousel 3D geometry configuration dynamically computed from container size
  const config: CarouselGeometryConfig = useMemo(() => {
    if (containerWidth >= 1150) {
      return {
        cardWidth: 235,
        cardHeight: 418,
        baseGap: 24,
        perspective: 1100,
        maxSlots: 3, // Total visible up to 7 cards (-3 to +3)
        depthCenter: -160, // Recessed deep in center
        depthEdge: 65,     // Brought forward at flanks
        maxAngle: 32,      // Leans inward by up to 32 deg
        scaleCenter: 0.83, // Smallest in the middle
        scaleEdge: 1.05    // Larger at edges
      };
    } else if (containerWidth >= 800) {
      return {
        cardWidth: 205,
        cardHeight: 364,
        baseGap: 20,
        perspective: 950,
        maxSlots: 2.5,
        depthCenter: -130,
        depthEdge: 45,
        maxAngle: 28,
        scaleCenter: 0.85,
        scaleEdge: 1.02
      };
    } else {
      return {
        cardWidth: 172,
        cardHeight: 306,
        baseGap: 16,
        perspective: 800,
        maxSlots: 2,
        depthCenter: -85,
        depthEdge: 30,
        maxAngle: 22,
        scaleCenter: 0.86,
        scaleEdge: 1.0
      };
    }
  }, [containerWidth]);

  // Projected-space gap solver:
  // Solves exact projected slot offsets so that in 2D perspective screen space,
  // the edge-to-edge gap between adjacent cards is CONSTANT (config.baseGap).
  const slotOffsets = useMemo(() => {
    const K = Math.ceil(config.maxSlots) + 1;
    const offsets: number[] = [0];

    const getWProj = (slotIndex: number) => {
      const u = Math.min(1, slotIndex / config.maxSlots);
      const s = config.scaleCenter + (config.scaleEdge - config.scaleCenter) * Math.pow(u, 1.15);
      const z = config.depthCenter * (1 - Math.pow(u, 1.25)) + config.depthEdge * Math.pow(u, 1.25);
      const persMag = config.perspective / (config.perspective - z);
      const rotY = config.maxAngle * Math.pow(u, 0.95);
      const cosRot = Math.cos((rotY * Math.PI) / 180);
      return config.cardWidth * s * persMag * cosRot;
    };

    for (let k = 1; k <= K; k++) {
      const wPrev = getWProj(k - 1);
      const wCurr = getWProj(k);
      const step = (wPrev + wCurr) / 2 + config.baseGap;
      offsets.push(offsets[k - 1] + step);
    }

    return offsets;
  }, [config]);

  // Function to compute continuous 3D transforms for any continuous relative offset `delta`
  const getCardTransform = useCallback((delta: number) => {
    const K = config.maxSlots;
    const sign = delta < 0 ? -1 : 1;
    const absDelta = Math.abs(delta);

    // Smooth Hermite interpolation of projected X across solved slot offsets
    const k0 = Math.floor(absDelta);
    const k1 = k0 + 1;
    const t = absDelta - k0;
    const smoothT = t * t * (3 - 2 * t);

    const x0 = k0 < slotOffsets.length 
      ? slotOffsets[k0] 
      : slotOffsets[slotOffsets.length - 1] + (k0 - (slotOffsets.length - 1)) * (slotOffsets[1] - slotOffsets[0]);
    const x1 = k1 < slotOffsets.length 
      ? slotOffsets[k1] 
      : slotOffsets[slotOffsets.length - 1] + (k1 - (slotOffsets.length - 1)) * (slotOffsets[1] - slotOffsets[0]);
    const xProj = sign * (x0 + (x1 - x0) * smoothT);

    // Normalized progress across arc: u in [-1, 1]
    const u = Math.max(-1.4, Math.min(1.4, delta / K));
    const absU = Math.min(1.4, Math.abs(u));

    // "Smallest in the middle": scale rises from center outward
    const scale = config.scaleCenter + (config.scaleEdge - config.scaleCenter) * Math.pow(Math.min(1, absU), 1.15);

    // Concave ring curling around viewer:
    // Center is recessed (negative Z), edges brought forward (positive Z)
    const z = config.depthCenter * (1 - Math.pow(Math.min(1, absU), 1.25)) + config.depthEdge * Math.pow(Math.min(1, absU), 1.25);

    // "Leaning in at both edges":
    // Left edge (u < 0) leans right (positive rotY), right edge (u > 0) leans left (negative rotY)
    const rotY = -Math.sign(u) * config.maxAngle * Math.pow(Math.min(1, absU), 0.95);

    // Compensate world X so that perspective projection maps it EXACTLY onto xProj!
    // xProj = xWorld * (D / (D - z))  ===>  xWorld = xProj * ((D - z) / D)
    const xWorld = xProj * ((config.perspective - z) / config.perspective);

    // Cards closer to the viewer (higher Z) have higher z-index
    const zIndex = Math.round((z + 300) * 10);

    // Opacity fade for far cards beyond the visible ring
    const fade = Math.max(0, 1 - Math.pow(Math.max(0, absDelta - K) / 1.1, 2));

    return {
      xProj,
      xWorld,
      z,
      rotY,
      scale,
      zIndex,
      opacity: fade,
      absU
    };
  }, [config, slotOffsets]);

  // Main animation loop: smooth auto-scroll, inertia, and spring snap
  useEffect(() => {
    if (!isVisible || reels.length === 0 || modalReel) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(64, currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const N = reels.length;

      if (isDraggingRef.current) {
        // Dragging is actively driving progressRef
      } else {
        // If there is lingering drag velocity, apply inertia
        if (Math.abs(dragVelocityRef.current) > 0.05) {
          progressRef.current += dragVelocityRef.current * dt;
          targetProgressRef.current = Math.round(progressRef.current);
          dragVelocityRef.current *= Math.pow(0.1, dt); // rapid damping
        } else {
          dragVelocityRef.current = 0;

          if (isPaused) {
            // Gently spring towards the nearest integer slot when paused
            const snapDiff = targetProgressRef.current - progressRef.current;
            progressRef.current += snapDiff * Math.min(1, 10 * dt);
          } else {
            // Ambient slow drift around the ring
            const driftSpeed = 0.14; // ~1 full card step every 7 seconds
            progressRef.current += driftSpeed * dt;
            targetProgressRef.current = Math.round(progressRef.current);
          }
        }
      }

      // Keep progress bounded within [0, N) with smooth float modulo
      if (progressRef.current >= N) {
        progressRef.current -= N;
        targetProgressRef.current -= N;
      } else if (progressRef.current < 0) {
        progressRef.current += N;
        targetProgressRef.current += N;
      }

      setProgress(progressRef.current);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isVisible, isPaused, reels.length, modalReel]);

  // Pointer drag interaction handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (reels.length === 0) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartProgressRef.current = progressRef.current;
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = performance.now();
    dragVelocityRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 4) {
      hasMovedRef.current = true;
    }

    // Convert pixel drag to carousel index step
    const slotStepPx = Math.max(160, slotOffsets[1] || 220);
    const progressDelta = -deltaX / slotStepPx;
    progressRef.current = dragStartProgressRef.current + progressDelta;

    // Track instantaneous release velocity
    const now = performance.now();
    const dt = (now - lastDragTimeRef.current) / 1000;
    if (dt > 0.008) {
      const dx = e.clientX - lastDragXRef.current;
      dragVelocityRef.current = -(dx / slotStepPx) / dt;
      lastDragXRef.current = e.clientX;
      lastDragTimeRef.current = now;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if already released
    }

    // Snap to closest integer slot unless high velocity is present
    if (Math.abs(dragVelocityRef.current) < 0.8) {
      targetProgressRef.current = Math.round(progressRef.current);
    } else {
      const stepDirection = Math.sign(dragVelocityRef.current);
      targetProgressRef.current = Math.round(progressRef.current + stepDirection * 0.7);
    }
  };

  // Nav arrow controls
  const handleStep = (direction: 'left' | 'right') => {
    const step = direction === 'left' ? -1 : 1;
    targetProgressRef.current = Math.round(progressRef.current) + step;
    progressRef.current = targetProgressRef.current;
    dragVelocityRef.current = 0;
  };

  // Click on a flanking card rotates it to center; clicking centered card opens preview modal
  const handleCardClick = (reel: InstagramReel, delta: number) => {
    if (hasMovedRef.current) return; // Ignore drag movements
    if (Math.abs(delta) > 0.45) {
      // Rotate ring to center this card
      targetProgressRef.current = Math.round(progressRef.current + delta);
      progressRef.current = targetProgressRef.current;
    } else {
      // Already centered: open full video preview modal
      setModalReel(reel);
      setModalIsPlaying(true);
      setModalProgress(0);
    }
  };

  if (!reels || reels.length === 0) return null;

  const N = reels.length;
  const activeIndex = ((Math.round(progress) % N) + N) % N;

  // Build the list of visible cards around the current progress
  const visibleCards = [];
  const maxDelta = config.maxSlots + 1.2;

  for (let i = 0; i < N; i++) {
    let delta = (i - progress) % N;
    if (delta > N / 2) delta -= N;
    if (delta < -N / 2) delta += N;

    if (Math.abs(delta) <= maxDelta) {
      visibleCards.push({
        reel: reels[i],
        reelIndex: i,
        delta,
        transform: getCardTransform(delta)
      });
    }
  }

  // Sort back-to-front so closer cards render cleanly
  visibleCards.sort((a, b) => a.transform.zIndex - b.transform.zIndex);

  return (
    <section 
      ref={sectionRef} 
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 overflow-hidden"
    >
      {/* Ambient background glows matching website navy/cyan brand theme */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-brand-600/15 via-cyan-500/10 to-brand-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-mono uppercase tracking-wider font-semibold mb-2">
            <InstagramBrandIcon className="w-4 h-4" />
            <span>Immersive Video Walkthroughs • Live Previews</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Space_Grotesk'] mt-1">
            Explore Spaces on Instagram Reels
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Portrait walkthroughs curved around your view with live video previews. Hover or center any reel to preview the space, or click to expand.
          </p>
        </div>

        {/* Right Actions: Instagram Profile link & Nav Chevrons */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/shristi_estate01/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-none text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 transition-all font-mono uppercase tracking-wider"
          >
            <InstagramBrandIcon className="w-4 h-4" />
            <span>Follow @shristi_estate01</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleStep('left')}
              aria-label="Previous reel"
              className="w-10 h-10 rounded-none glass-card flex items-center justify-center text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleStep('right')}
              aria-label="Next reel"
              className="w-10 h-10 rounded-none glass-card flex items-center justify-center text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Ring Stage Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] select-none cursor-grab active:cursor-grabbing overflow-visible flex items-center justify-center"
        style={{
          perspective: `${config.perspective}px`,
          perspectiveOrigin: '50% 50%'
        }}
      >


        {/* ============================================================== */}
        {/* 3D PORTRAIT MEDIA CARDS (Gaps solved in projected space)       */}
        {/* ============================================================== */}
        {visibleCards.map(({ reel, reelIndex, delta, transform }) => {
          const isCentered = Math.abs(delta) < 0.45;
          const isHovered = hoveredReelId === reel.id;
          const showVideoPreview = (isCentered || isHovered) && !!reel.video_url;

          return (
            <div
              key={`${reel.id}-${reelIndex}`}
              onMouseEnter={() => setHoveredReelId(reel.id)}
              onMouseLeave={() => setHoveredReelId(null)}
              onClick={() => handleCardClick(reel, delta)}
              className="absolute left-1/2 top-1/2 transition-shadow will-change-transform"
              style={{
                width: `${config.cardWidth}px`,
                height: `${config.cardHeight}px`,
                zIndex: transform.zIndex,
                opacity: transform.opacity,
                transform: `translate3d(calc(-50% + ${transform.xWorld}px), -50%, ${transform.z}px) rotateY(${transform.rotY}deg) scale(${transform.scale})`,
                transformOrigin: '50% 50%',
                pointerEvents: transform.opacity < 0.1 ? 'none' : 'auto'
              }}
            >
              {/* Dynamic Ground Contact Shadow on the Ring */}
              <div
                className="absolute -bottom-7 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  width: `${config.cardWidth * 0.85}px`,
                  height: '24px',
                  background: 'radial-gradient(ellipse at center, rgba(11,19,43,0.75) 0%, rgba(2,132,199,0.22) 45%, transparent 75%)',
                  filter: 'blur(7px)',
                  transform: 'scaleY(0.4)',
                  opacity: Math.max(0.2, 1 - transform.absU * 0.4)
                }}
              />

              {/* Card Container */}
              <div
                className={`group relative w-full h-full rounded-none overflow-hidden bg-white/90 dark:bg-[#0B132B]/95 border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isCentered
                    ? 'border-brand-500/90 shadow-[0_20px_50px_rgba(2,132,199,0.35)] ring-1 ring-brand-400/60'
                    : 'border-slate-200/90 dark:border-slate-800/90 shadow-xl hover:border-brand-500/60 hover:shadow-2xl'
                }`}
              >
                {/* Background Thumbnail Image */}
                <img
                  src={reel.thumbnail_url}
                  alt={reel.title}
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                    showVideoPreview ? 'opacity-0 scale-105' : 'opacity-100 group-hover:scale-105'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {/* Inline Video Preview Player (Plays when centered or hovered) */}
                {showVideoPreview && (
                  <video
                    src={reel.video_url}
                    autoPlay
                    loop
                    muted={isInlineMuted}
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                    style={{ opacity: 1 }}
                  />
                )}

                {/* Cinematic Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30 pointer-events-none" />

                {/* Glass Rim Lighting (Curvature Accent) */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-brand-500/15 pointer-events-none" />

                {/* Top Header: Reel Badge & Live Status & Audio Controls */}
                <div className="relative z-10 p-3 sm:p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono uppercase tracking-wider font-semibold">
                    {showVideoPreview ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-emerald-300">Live Preview</span>
                      </>
                    ) : (
                      <>
                        <InstagramBrandIcon className="w-3 h-3" />
                        <span>Reel</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Inline Mute / Unmute Button for centered active card */}
                    {showVideoPreview && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsInlineMuted(!isInlineMuted);
                        }}
                        aria-label={isInlineMuted ? 'Unmute preview' : 'Mute preview'}
                        className="p-1 rounded-none bg-black/60 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/80 transition-colors"
                      >
                        {isInlineMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-brand-400" />}
                      </button>
                    )}

                    {reel.duration && (
                      <span className="px-2 py-0.5 rounded-none bg-black/60 backdrop-blur-md text-white text-[10px] font-mono">
                        {reel.duration}
                      </span>
                    )}
                  </div>
                </div>

                {/* Center: Glowing Floating Play / Expand Button */}
                <div className="relative z-10 flex items-center justify-center pointer-events-none my-auto">
                  <div
                    className={`w-11 sm:w-12 h-11 sm:h-12 rounded-none backdrop-blur-md border flex items-center justify-center text-white transition-all duration-300 shadow-xl ${
                      isCentered || isHovered
                        ? 'bg-brand-600/90 border-white/40 scale-110 shadow-brand-500/50'
                        : 'bg-white/25 border-white/30 group-hover:scale-110 group-hover:bg-brand-600'
                    }`}
                  >
                    {isCentered ? (
                      <Maximize2 className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                    ) : (
                      <Play className="w-4 sm:w-5 h-4 sm:h-5 fill-current ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Bottom Content Area: Views, Likes, Title & Watch CTA */}
                <div className="relative z-10 p-3.5 sm:p-4 space-y-1.5 sm:space-y-2">
                  {/* Category tag */}
                  {reel.category && (
                    <div className="inline-block px-2 py-0.5 rounded-none bg-brand-950/70 border border-brand-800/70 backdrop-blur-sm text-[10px] font-mono uppercase tracking-wider text-brand-300 font-semibold">
                      {reel.category}
                    </div>
                  )}

                  {reel.views_display && (
                    <div className="flex items-center gap-1.5 text-white/90 text-[11px] sm:text-xs font-semibold">
                      <Eye className="w-3.5 h-3.5 text-brand-400" />
                      <span>{reel.views_display} views</span>
                      {reel.likes_display && (
                        <>
                          <span className="text-white/40">•</span>
                          <Heart className="w-3 h-3 text-cyan-400 fill-current" />
                          <span>{reel.likes_display}</span>
                        </>
                      )}
                    </div>
                  )}

                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-brand-200 transition-colors font-['Space_Grotesk']">
                    {reel.title}
                  </h3>

                  <div className="pt-0.5 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider font-semibold text-brand-400 group-hover:text-brand-200 transition-colors">
                    <span>{isCentered ? 'Click for Full Preview' : 'Click to Focus & Play'}</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ring Progress Indicators & Jump Controls */}
      <div className="mt-8 flex items-center justify-center">
        {/* Carousel Dots */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-none glass-card border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#0B132B]/80">
          {reels.map((r, idx) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                targetProgressRef.current = idx;
                progressRef.current = idx;
                dragVelocityRef.current = 0;
              }}
              aria-label={`Jump to reel ${idx + 1}`}
              className={`h-2 rounded-none transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-6 bg-gradient-to-r from-brand-500 to-cyan-400'
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-brand-400/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* CINEMATIC REEL PREVIEW MODAL                                   */}
      {/* ============================================================== */}
      {modalReel && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setModalReel(null)}
        >
          <div 
            className="relative w-full max-w-sm sm:max-w-md aspect-[9/16] max-h-[90vh] bg-[#070C1E] rounded-none overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Video Player */}
            {modalReel.video_url ? (
              <video
                ref={modalVideoRef}
                src={modalReel.video_url}
                autoPlay
                loop
                muted={modalIsMuted}
                playsInline
                onTimeUpdate={(e) => {
                  const target = e.currentTarget;
                  if (target.duration) {
                    setModalProgress((target.currentTime / target.duration) * 100);
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={modalReel.thumbnail_url}
                alt={modalReel.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Dark Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60 pointer-events-none" />

            {/* Top Modal Controls */}
            <div className="relative z-20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1 rounded-none bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-mono uppercase tracking-wider font-semibold">
                <InstagramBrandIcon className="w-3.5 h-3.5" />
                <span>{modalReel.category || 'Reel Tour'}</span>
              </div>

              <div className="flex items-center gap-2">
                {modalReel.video_url && (
                  <button
                    type="button"
                    onClick={() => setModalIsMuted(!modalIsMuted)}
                    className="p-2 rounded-none bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
                    aria-label={modalIsMuted ? 'Unmute' : 'Mute'}
                  >
                    {modalIsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-brand-400" />}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setModalReel(null)}
                  className="p-2 rounded-none bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center Play/Pause Overlay Click */}
            {modalReel.video_url && (
              <button
                type="button"
                onClick={() => {
                  if (modalVideoRef.current) {
                    if (modalIsPlaying) {
                      modalVideoRef.current.pause();
                      setModalIsPlaying(false);
                    } else {
                      modalVideoRef.current.play();
                      setModalIsPlaying(true);
                    }
                  }
                }}
                className="absolute inset-0 w-full h-full flex items-center justify-center z-10 cursor-pointer bg-transparent"
                aria-label={modalIsPlaying ? 'Pause video' : 'Play video'}
              >
                {!modalIsPlaying && (
                  <div className="w-16 h-16 rounded-none bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                )}
              </button>
            )}

            {/* Bottom Modal Content & Quick Actions */}
            <div className="relative z-20 p-5 space-y-3">
              {/* Playback scrubber */}
              {modalReel.video_url && (
                <div className="w-full bg-white/20 h-1 rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-150"
                    style={{ width: `${modalProgress}%` }}
                  />
                </div>
              )}

              {/* Stats & Title */}
              <div className="space-y-1">
                {modalReel.views_display && (
                  <div className="flex items-center gap-2 text-white/90 text-xs font-semibold">
                    <Eye className="w-3.5 h-3.5 text-brand-400" />
                    <span>{modalReel.views_display} views</span>
                    {modalReel.likes_display && (
                      <>
                        <span className="text-white/40">•</span>
                        <Heart className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                        <span>{modalReel.likes_display} likes</span>
                      </>
                    )}
                  </div>
                )}

                <h3 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk'] leading-snug">
                  {modalReel.title}
                </h3>

                {modalReel.caption && (
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {modalReel.caption}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <a
                  href={buildWhatsAppUrl(`Hi Shristi Estate, I watched the video tour for "${modalReel.title}". Please share inventory availability, floor plans, and pricing.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono uppercase tracking-wider font-semibold shadow-md transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={modalReel.reel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-none bg-brand-600 hover:bg-brand-500 text-white text-xs font-mono uppercase tracking-wider font-semibold shadow-md transition-colors"
                >
                  <InstagramBrandIcon className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default InstagramReelsShowcase;
