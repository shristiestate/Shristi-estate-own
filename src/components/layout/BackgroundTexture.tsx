import React from 'react';

/**
 * BackgroundTexture:
 * Injects a luxury architectural texture system across all pages:
 * 1. Blueprint micro-grid and dot matrix with radial mask
 * 2. Subtle ambient gradient light orbs (cyan/brand-blue/teal)
 * 3. Organic micro-noise film grain for a tactile, high-end matte finish
 *
 * 100% non-intrusive (pointer-events-none, fixed, GPU accelerated).
 */
export const BackgroundTexture: React.FC = () => {
  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Ambient Luxury Light Orbs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-brand-500/12 via-accent-teal/8 to-transparent dark:from-brand-600/15 dark:via-accent-teal/10 rounded-full blur-[100px] will-change-transform" />
      <div className="absolute top-[35%] -left-32 w-[500px] h-[500px] bg-brand-600/5 dark:bg-brand-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-[65%] -right-32 w-[550px] h-[550px] bg-accent-teal/6 dark:bg-accent-teal/8 rounded-full blur-[130px]" />

      {/* 2. Architectural Blueprint Grid & Dot Matrix Layer */}
      <div 
        className="absolute inset-0 bg-texture-grid opacity-75 dark:opacity-85" 
      />

      {/* 3. Ultra-fine Organic Micro-Noise Film Grain */}
      <div 
        className="absolute inset-0 bg-noise-grain opacity-[0.035] dark:opacity-[0.045] mix-blend-overlay" 
      />
    </div>
  );
};
