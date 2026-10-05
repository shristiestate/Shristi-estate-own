import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LucideIcon } from 'lucide-react';

export interface InteractiveCategoryCardProps {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  path: string;
  badge: string;
  image: string;
  index: number;
}

export const InteractiveCategoryCard: React.FC<InteractiveCategoryCardProps> = ({
  title,
  desc,
  icon: Icon,
  path,
  badge,
  image,
  index
}) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Animation frame and target/current state refs (zero re-render overhead during mouse moves)
  const animFrameRef = useRef<number | null>(null);
  const targetPos = useRef({ x: 0, y: 0, px: 50, py: 50 });
  const currentPos = useRef({ x: 0, y: 0, px: 50, py: 50 });

  const numberDisplay = String(index + 1).padStart(2, '0');

  // Smooth lerp (linear interpolation) physics running at display refresh rate (60/120Hz)
  const updatePhysics = useCallback(() => {
    // 0.12 factor provides a buttery, liquid damped inertia
    const factor = 0.12;
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * factor;
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * factor;
    currentPos.current.px += (targetPos.current.px - currentPos.current.px) * factor;
    currentPos.current.py += (targetPos.current.py - currentPos.current.py) * factor;

    if (imgRef.current) {
      imgRef.current.style.transform = `scale(1.10) translate3d(${currentPos.current.x.toFixed(2)}px, ${currentPos.current.y.toFixed(2)}px, 0)`;
    }
    if (spotlightRef.current) {
      spotlightRef.current.style.background = `radial-gradient(480px circle at ${currentPos.current.px.toFixed(1)}% ${currentPos.current.py.toFixed(1)}%, rgba(255, 255, 255, 0.20), transparent 70%)`;
    }

    const diff = Math.abs(targetPos.current.x - currentPos.current.x) + Math.abs(targetPos.current.y - currentPos.current.y);
    if (diff > 0.02) {
      animFrameRef.current = requestAnimationFrame(updatePhysics);
    } else {
      animFrameRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(updatePhysics);
    }
  }, [updatePhysics]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetPos.current.px = (x / rect.width) * 100;
    targetPos.current.py = (y / rect.height) * 100;

    // Smooth subtle parallax displacement (-16px to +16px)
    targetPos.current.x = (x / rect.width - 0.5) * 32;
    targetPos.current.y = (y / rect.height - 0.5) * 32;

    startLoop();
  }, [startLoop]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    startLoop();
  }, [startLoop]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    targetPos.current = { x: 0, y: 0, px: 50, py: 50 };
    startLoop();
  }, [startLoop]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <Link
      ref={cardRef}
      to={path}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-none border-r border-b border-slate-200 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between group overflow-hidden transition-all duration-500 ${
        isHovered
          ? 'bg-slate-950 border-brand-500/60 shadow-xl'
          : 'bg-white dark:bg-[#0B132B]'
      }`}
      style={{ isolation: 'isolate' }}
    >
      {/* 1. INTERACTIVE GENERATED IMAGE LAYER (White to full image transition) */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <img
          ref={imgRef}
          src={image}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover will-change-transform transition-[opacity,filter] duration-700 ease-out"
          style={{
            transform: 'scale(1.04) translate3d(0, 0, 0)',
            opacity: isHovered ? 0.95 : 0,
            filter: isHovered ? 'contrast(1.08) saturate(1.15) brightness(0.82)' : 'none',
          }}
        />
        
        {/* Dynamic smooth cursor spotlight over the image */}
        <div 
          ref={spotlightRef}
          className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
          style={{
            opacity: isHovered ? 1 : 0
          }}
        />

        {/* Cinematic dark scrim over image to give text 100% razor-sharp contrast */}
        <div 
          className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
          style={{
            opacity: isHovered ? 1 : 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.52) 45%, rgba(0,0,0,0.32) 100%)'
          }}
        />
      </div>

      {/* 2. CARD CONTENT (Smooth inverse color transition: dark on white -> crisp white on image) */}
      <div className="relative z-10 transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
        {/* Top: Small Minimal Line Icon at Left, Number 01, 02, 03 at Right */}
        <div className="flex items-center justify-between">
          <div className={`w-9 h-9 rounded-none border flex items-center justify-center transition-all duration-300 shadow-sm ${
            isHovered
              ? 'bg-brand-600 text-white border-brand-400 scale-105 shadow-brand-500/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-brand-600 dark:text-brand-400'
          }`}>
            <Icon className="w-4 h-4 stroke-[1.5]" />
          </div>
          <span className={`font-mono text-xs tracking-widest font-semibold transition-colors duration-300 ${
            isHovered
              ? 'text-white/90 drop-shadow-sm'
              : 'text-brand-600/70 dark:text-brand-400/70'
          }`}>
            {numberDisplay}
          </span>
        </div>

        {/* Heading: Structured Geometric Card Title */}
        <h3 className={`text-lg sm:text-xl font-semibold transition-colors duration-300 mt-5 mb-2 leading-snug ${
          isHovered
            ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
            : 'text-slate-900 dark:text-white'
        }`}>
          {title}
        </h3>

        {/* Description: Smaller Clean Sans-Serif Text */}
        <p className={`text-xs leading-relaxed font-sans transition-colors duration-300 ${
          isHovered
            ? 'text-slate-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]'
            : 'text-slate-600 dark:text-slate-300'
        }`}>
          {desc}
        </p>

        <span className={`inline-block mt-4 text-[10px] font-mono uppercase tracking-wider transition-all duration-300 ${
          isHovered
            ? 'text-brand-300 bg-brand-950/70 border border-brand-500/40 px-2 py-0.5'
            : 'text-slate-400 dark:text-slate-500'
        }`}>
          {badge}
        </span>
      </div>

      {/* 3. Bottom: “Explore Category” with Smooth Animated Arrow */}
      <div className={`relative z-10 pt-6 mt-6 border-t flex items-center justify-between text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
        isHovered
          ? 'border-white/20 text-white'
          : 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
      }`}>
        <span className="group-hover:text-brand-300 transition-colors">Explore Category</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-brand-300" />
      </div>
    </Link>
  );
};
