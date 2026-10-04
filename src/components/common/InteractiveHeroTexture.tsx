import React, { useEffect, useRef } from 'react';

/**
 * InteractiveHeroTexture
 * 
 * Provides an interactive cursor-reactive texture backdrop for the hero section:
 * 1. 3D Parallax & Depth Tilt on img1 (commercial park isometric) driven by mouse coordinates.
 * 2. Dynamic Cursor Focus Reveal: Faded & blurry by default, revealing crisp details under cursor.
 * 3. Dynamic Cursor Spotlight: Soft luminous glow tracking the cursor across the texture.
 * 4. High-performance RAF lerp animation loop (60-120fps) without React re-renders.
 */
export const InteractiveHeroTexture: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const revealImgRef = useRef<HTMLImageElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    let targetX = 0; // -1 to 1
    let targetY = 0; // -1 to 1
    let currentX = 0;
    let currentY = 0;

    // Pixel coordinates for spotlight & reveal mask
    let targetPixelX = window.innerWidth * 0.7;
    let targetPixelY = 300;
    let currentPixelX = targetPixelX;
    let currentPixelY = targetPixelY;

    let isHovering = false;
    let time = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      // Check if mouse is near or inside hero bounds
      if (e.clientY <= rect.bottom + 150 && e.clientY >= rect.top - 100) {
        isHovering = true;
        // Normalize between -1 and 1
        targetX = ((e.clientX / window.innerWidth) * 2 - 1);
        targetY = ((e.clientY / window.innerHeight) * 2 - 1);
        targetPixelX = relX;
        targetPixelY = relY;
      } else {
        isHovering = false;
      }
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Smooth 60-120fps physics loop with easing & idle wave oscillation
    const loop = () => {
      time += 0.015;

      // If mouse is idle or outside, add gentle ambient breathing drift
      const idleOffsetBX = !isHovering ? Math.sin(time * 0.6) * 0.15 : 0;
      const idleOffsetBY = !isHovering ? Math.cos(time * 0.5) * 0.12 : 0;

      const effTargetX = isHovering ? targetX : idleOffsetBX;
      const effTargetY = isHovering ? targetY : idleOffsetBY;

      // Lerp smoothing (linear interpolation with damping)
      currentX += (effTargetX - currentX) * 0.06;
      currentY += (effTargetY - currentY) * 0.06;

      currentPixelX += (targetPixelX - currentPixelX) * 0.09;
      currentPixelY += (targetPixelY - currentPixelY) * 0.09;

      // Parallax values
      const moveX = currentX * -28; // Counter parallax translate
      const moveY = currentY * -20;
      const rotX = currentY * -4.5; // 3D perspective tilt
      const rotY = currentX * 6.5;

      const transformStr = `perspective(1200px) translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.08)`;

      if (baseImgRef.current) {
        baseImgRef.current.style.transform = transformStr;
      }
      if (revealImgRef.current) {
        revealImgRef.current.style.transform = transformStr;
        const maskVal = `radial-gradient(circle 320px at ${currentPixelX.toFixed(1)}px ${currentPixelY.toFixed(1)}px, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 45%, transparent 100%)`;
        revealImgRef.current.style.webkitMaskImage = maskVal;
        revealImgRef.current.style.maskImage = maskVal;
      }

      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(550px circle at ${currentPixelX.toFixed(1)}px ${currentPixelY.toFixed(1)}px, rgba(2, 132, 199, 0.18), transparent 75%)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      aria-hidden="true" 
      className="absolute inset-0 pointer-events-none overflow-hidden -z-10 select-none"
    >
      {/* 1. Base Layer: Faded and Blurry 3D Commercial Park Texture */}
      <img
        ref={baseImgRef}
        src="/hero-commercial-park.png"
        alt=""
        className="w-full h-full object-cover object-right sm:object-[75%_35%] lg:object-right-bottom opacity-35 dark:opacity-20 blur-[2.5px] will-change-transform"
        style={{ transformOrigin: 'center center' }}
      />

      {/* 2. Interactive Cursor Reveal Lens: Sharpens & illuminates texture directly under the cursor */}
      <img
        ref={revealImgRef}
        src="/hero-commercial-park.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-right sm:object-[75%_35%] lg:object-right-bottom opacity-65 dark:opacity-40 blur-[0.5px] will-change-transform"
        style={{ 
          transformOrigin: 'center center',
          WebkitMaskImage: 'radial-gradient(circle 300px at 70% 40%, rgba(0,0,0,0.8) 0%, transparent 100%)',
          maskImage: 'radial-gradient(circle 300px at 70% 40%, rgba(0,0,0,0.8) 0%, transparent 100%)',
        }}
      />

      {/* 3. Interactive Cursor Spotlight / Luminous Glow Layer */}
      <div 
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none mix-blend-screen dark:mix-blend-lighten transition-opacity duration-300"
      />

      {/* 4. Directional Gradient Masks to ensure 100% text readability and smooth page blending */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-slate-50/80 to-slate-50/20 dark:from-[#070C1E]/95 dark:via-[#070C1E]/85 dark:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-[#070C1E]" />
    </div>
  );
};

export default InteractiveHeroTexture;
