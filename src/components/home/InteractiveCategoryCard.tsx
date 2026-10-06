import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
  const { isDark } = useTheme();
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
    const factor = 0.12;
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * factor;
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * factor;
    currentPos.current.px += (targetPos.current.px - currentPos.current.px) * factor;
    currentPos.current.py += (targetPos.current.py - currentPos.current.py) * factor;

    if (imgRef.current) {
      imgRef.current.style.transform = `scale(1.08) translate3d(${currentPos.current.x.toFixed(2)}px, ${currentPos.current.y.toFixed(2)}px, 0)`;
    }
    if (spotlightRef.current) {
      const spotColor = isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)';
      spotlightRef.current.style.background = `radial-gradient(480px circle at ${currentPos.current.px.toFixed(1)}% ${currentPos.current.py.toFixed(1)}%, ${spotColor}, transparent 70%)`;
    }

    const diff = Math.abs(targetPos.current.x - currentPos.current.x) + Math.abs(targetPos.current.y - currentPos.current.y);
    if (diff > 0.02) {
      animFrameRef.current = requestAnimationFrame(updatePhysics);
    } else {
      animFrameRef.current = null;
    }
  }, [isDark]);

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

    targetPos.current.x = (x / rect.width - 0.5) * 24;
    targetPos.current.y = (y / rect.height - 0.5) * 24;

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
      className={`relative rounded-none border-r border-b border-slate-200 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between group overflow-hidden transition-all duration-300 bg-white dark:bg-[#0B132B] ${
        isHovered
          ? 'bg-slate-50/80 dark:bg-[#0E1838] border-brand-500/70 dark:border-brand-500/70 shadow-md dark:shadow-[0_10px_30px_rgba(2,132,199,0.15)]'
          : 'hover:bg-slate-50/50 dark:hover:bg-[#0E1838]/60'
      }`}
      style={{ isolation: 'isolate' }}
    >
      {/* 1. INTERACTIVE GENERATED IMAGE LAYER (Optimized for both Light and Dark mode) */}
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
            opacity: isHovered ? (isDark ? 0.40 : 0.32) : 0,
            filter: isHovered 
              ? (isDark ? 'contrast(1.08) saturate(1.15) brightness(0.85)' : 'contrast(1.05) saturate(1.1) brightness(1.02)') 
              : 'none',
          }}
        />
        
        {/* Dynamic smooth subtle cursor spotlight */}
        <div 
          ref={spotlightRef}
          className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
          style={{
            opacity: isHovered ? 1 : 0
          }}
        />

        {/* Adaptive scrim over image preserving razor-sharp contrast in both themes */}
        <div 
          className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
          style={{
            opacity: isHovered ? 1 : 0,
            background: isDark
              ? 'linear-gradient(to top, rgba(11,19,43,0.95) 0%, rgba(11,19,43,0.80) 45%, rgba(11,19,43,0.45) 100%)'
              : 'linear-gradient(to top, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.65) 100%)'
          }}
        />
      </div>

      {/* 2. CARD CONTENT (Crisp, high-contrast typography in both Light and Dark mode) */}
      <div className="relative z-10 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
        {/* Top: Minimal Line Icon at Left, Number 01, 02, 03 at Right */}
        <div className="flex items-center justify-between">
          <div className={`w-9 h-9 rounded-none border flex items-center justify-center transition-all duration-300 shadow-xs ${
            isHovered
              ? 'bg-brand-600 text-white border-brand-600 dark:border-brand-500 scale-105 shadow-brand-500/25'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-brand-600 dark:text-brand-400'
          }`}>
            <Icon className="w-4 h-4 stroke-[1.5]" />
          </div>
          <span className={`font-mono text-xs tracking-widest font-semibold transition-colors duration-300 ${
            isHovered
              ? 'text-brand-600 dark:text-brand-400 font-bold'
              : 'text-slate-400 dark:text-slate-500'
          }`}>
            {numberDisplay}
          </span>
        </div>

        {/* Heading: Structured Geometric Card Title */}
        <h3 className="text-lg sm:text-xl font-semibold transition-colors duration-300 mt-5 mb-2 leading-snug text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300">
          {title}
        </h3>

        {/* Description: Smaller Clean Sans-Serif Text */}
        <p className="text-xs leading-relaxed font-sans transition-colors duration-300 text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200">
          {desc}
        </p>

        <span className={`inline-block mt-4 text-[10px] font-mono uppercase tracking-wider transition-all duration-300 px-2 py-0.5 border ${
          isHovered
            ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/70 border-brand-200 dark:border-brand-800/80 font-semibold'
            : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
        }`}>
          {badge}
        </span>
      </div>

      {/* 3. Bottom: “Explore Category” with Smooth Animated Arrow */}
      <div className="relative z-10 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold uppercase tracking-wider transition-all duration-300 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:border-brand-200 dark:group-hover:border-brand-800/80">
        <span className="group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Explore Category</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1.5 text-brand-600 dark:text-brand-400" />
      </div>
    </Link>
  );
};

export default InteractiveCategoryCard;
