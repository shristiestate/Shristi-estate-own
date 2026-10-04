import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface RibbonConfig {
  id: string;
  lineCount: number;
  baseWidth: number; // Width of the ribbon bundle in px
  colorDark: { r: number; g: number; b: number };
  colorLight: { r: number; g: number; b: number };
  baseOpacity: number;
  speed: number;
  freq1: number;
  freq2: number;
  amp1: number;
  amp2: number;
  phaseShift: number; // Out-of-phase step per line
  parallaxWeight: number;
  // Normalized control points (x, y) from 0 to 1 across viewport
  p0: [number, number];
  p1: [number, number];
  p2: [number, number];
  p3: [number, number];
}

/**
 * SilkRibbonBackground
 * 
 * Full-screen animated background made of hundreds of thin, delicate lines (0.5 to 1px)
 * layered closely together, forming soft, silky, ribbon-like waves, like folded translucent
 * fabric or contour lines.
 * 
 * - Waves concentrated mainly on the right side (top-right and bottom-right)
 * - Small wisps in the top-left and bottom-left corners
 * - Left-center area kept completely clear for readability of text and search UI
 * - Lines fade softly at edges with low opacity at the tips and higher opacity where they overlap
 * - Uses existing theme colors only (brand cyan/blue, accent teal, slate text)
 * - Mouse parallax and continuous 60fps silky drift
 */
export const SilkRibbonBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mobile / Touch Optimization:
    // Skip heavy 258 Bezier curves canvas loop on mobile/touch to eliminate main-thread blocking
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(hover: none)').matches);
    if (isMobile) {
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Mouse tracking with smooth damping (lerp)
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    let targetRawX = -9999;
    let targetRawY = -9999;
    let currentRawX = -9999;
    let currentRawY = -9999;

    const handlePointerMove = (e: MouseEvent) => {
      // Normalize to -1 ... 1
      targetMouseX = (e.clientX / (window.innerWidth || 1)) * 2 - 1;
      targetMouseY = (e.clientY / (window.innerHeight || 1)) * 2 - 1;
      targetRawX = e.clientX;
      targetRawY = e.clientY;
    };

    const handlePointerLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
      targetRawX = -9999;
      targetRawY = -9999;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    // Ribbon Definitions:
    // Existing theme palette strictly:
    // - Brand 400: rgb(56, 189, 248) (#38bdf8)
    // - Brand 500: rgb(2, 132, 199) (#0284c7)
    // - Brand 600: rgb(3, 105, 161) (#0369a1)
    // - Accent Teal: rgb(13, 148, 136) (#0d9488)
    // - Accent Cyan: rgb(6, 182, 212) (#06b6d4)
    // - Text/Slate: rgb(148, 163, 184) (#94a3b8) / rgb(100, 116, 139) (#64748b)
    const ribbons: RibbonConfig[] = [
      // 1. Major Top-Right Silk Ribbon (Flows gracefully into upper-right quadrant)
      {
        id: 'top-right-main',
        lineCount: 56,
        baseWidth: 150,
        colorDark: { r: 56, g: 189, b: 248 }, // Brand cyan 400
        colorLight: { r: 2, g: 132, b: 199 }, // Brand 500
        baseOpacity: 0.16,
        speed: 0.00032,
        freq1: 1.35,
        freq2: 2.1,
        amp1: 36,
        amp2: 18,
        phaseShift: 0.045,
        parallaxWeight: 24,
        p0: [0.56, -0.06],
        p1: [0.70, 0.10],
        p2: [0.90, 0.26],
        p3: [1.06, 0.50],
      },
      // 2. Upper-Right Translucent Counter-Fold (Forms folded translucent fabric effect)
      {
        id: 'top-right-overlap',
        lineCount: 46,
        baseWidth: 125,
        colorDark: { r: 13, g: 148, b: 136 }, // Accent teal
        colorLight: { r: 3, g: 105, b: 161 }, // Brand 600
        baseOpacity: 0.13,
        speed: -0.00026,
        freq1: 1.75,
        freq2: 1.25,
        amp1: 30,
        amp2: 18,
        phaseShift: 0.042,
        parallaxWeight: -18,
        p0: [0.68, -0.08],
        p1: [0.84, 0.18],
        p2: [0.76, 0.38],
        p3: [1.02, 0.58],
      },
      // 3. Bottom-Right Majestic Silk Cascade (Contour waves sweeping through bottom-right)
      {
        id: 'bottom-right-cascade',
        lineCount: 58,
        baseWidth: 165,
        colorDark: { r: 6, g: 182, b: 212 }, // Accent cyan
        colorLight: { r: 2, g: 132, b: 199 }, // Brand 500
        baseOpacity: 0.15,
        speed: 0.00030,
        freq1: 1.3,
        freq2: 2.2,
        amp1: 40,
        amp2: 20,
        phaseShift: 0.040,
        parallaxWeight: 26,
        p0: [0.54, 0.56],
        p1: [0.72, 0.68],
        p2: [0.88, 0.86],
        p3: [1.08, 1.06],
      },
      // 4. Bottom-Right Lower Accent Fold (Contour lines tucked near bottom edge)
      {
        id: 'bottom-right-ground',
        lineCount: 40,
        baseWidth: 115,
        colorDark: { r: 56, g: 189, b: 248 }, // Brand 400
        colorLight: { r: 13, g: 148, b: 136 }, // Accent teal
        baseOpacity: 0.12,
        speed: -0.00024,
        freq1: 1.85,
        freq2: 1.15,
        amp1: 26,
        amp2: 15,
        phaseShift: 0.046,
        parallaxWeight: -15,
        p0: [0.64, 0.70],
        p1: [0.82, 0.80],
        p2: [0.94, 0.94],
        p3: [1.05, 1.10],
      },
      // 5. Top-Left Delicate Wisp (Kept small and high, completely clear of text)
      {
        id: 'top-left-wisp',
        lineCount: 26,
        baseWidth: 70,
        colorDark: { r: 148, g: 163, b: 184 }, // Slate text
        colorLight: { r: 2, g: 132, b: 199 }, // Brand 500
        baseOpacity: 0.09,
        speed: 0.00022,
        freq1: 2.1,
        freq2: 1.4,
        amp1: 18,
        amp2: 10,
        phaseShift: 0.05,
        parallaxWeight: 12,
        p0: [-0.06, -0.06],
        p1: [0.06, 0.04],
        p2: [0.16, 0.12],
        p3: [0.24, 0.20],
      },
      // 6. Bottom-Left Corner Accent (Kept small and low, completely clear of center)
      {
        id: 'bottom-left-wisp',
        lineCount: 24,
        baseWidth: 72,
        colorDark: { r: 56, g: 189, b: 248 }, // Brand 400
        colorLight: { r: 100, g: 116, b: 139 }, // Slate text
        baseOpacity: 0.09,
        speed: -0.00020,
        freq1: 1.6,
        freq2: 2.3,
        amp1: 20,
        amp2: 12,
        phaseShift: 0.048,
        parallaxWeight: -12,
        p0: [-0.06, 0.80],
        p1: [0.08, 0.86],
        p2: [0.16, 0.94],
        p3: [0.24, 1.06],
      },
    ];

    // High-DPI Canvas Resize
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Cubic Bezier evaluation
    const bezierPoint = (
      p0: [number, number],
      p1: [number, number],
      p2: [number, number],
      p3: [number, number],
      t: number
    ): [number, number] => {
      const it = 1 - t;
      const it2 = it * it;
      const it3 = it2 * it;
      const t2 = t * t;
      const t3 = t2 * t;

      const x = it3 * p0[0] + 3 * it2 * t * p1[0] + 3 * it * t2 * p2[0] + t3 * p3[0];
      const y = it3 * p0[1] + 3 * it2 * t * p1[1] + 3 * it * t2 * p2[1] + t3 * p3[1];
      return [x, y];
    };

    // Cubic Bezier tangent vector evaluation
    const bezierTangent = (
      p0: [number, number],
      p1: [number, number],
      p2: [number, number],
      p3: [number, number],
      t: number
    ): [number, number] => {
      const it = 1 - t;
      const it2 = it * it;
      const t2 = t * t;

      const dx = 3 * it2 * (p1[0] - p0[0]) + 6 * it * t * (p2[0] - p1[0]) + 3 * t2 * (p3[0] - p2[0]);
      const dy = 3 * it2 * (p1[1] - p0[1]) + 6 * it * t * (p2[1] - p1[1]) + 3 * t2 * (p3[1] - p2[1]);
      const len = Math.hypot(dx, dy) || 1;
      return [dx / len, dy / len];
    };

    let lastTime = performance.now();
    let accumulatedTime = 0;

    // Sample resolution along the ribbon curve
    const SAMPLES = 64;
    const sampleT = new Float32Array(SAMPLES + 1);
    for (let s = 0; s <= SAMPLES; s++) {
      sampleT[s] = s / SAMPLES;
    }

    const render = (now: number) => {
      const delta = Math.min(now - lastTime, 40); // Cap frame delta for smooth 60fps
      lastTime = now;
      accumulatedTime += delta;

      // Subtle mouse parallax smooth lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.035;
      currentMouseY += (targetMouseY - currentMouseY) * 0.035;

      if (targetRawX !== -9999) {
        if (currentRawX < -1000) {
          currentRawX = targetRawX;
          currentRawY = targetRawY;
        } else {
          currentRawX += (targetRawX - currentRawX) * 0.08;
          currentRawY += (targetRawY - currentRawY) * 0.08;
        }
      } else {
        currentRawX += (-9999 - currentRawX) * 0.05;
        currentRawY += (-9999 - currentRawY) * 0.05;
      }

      // Transparent clear - preserves website's existing background completely
      ctx.clearRect(0, 0, width, height);

      // Render each ribbon bundle
      for (let r = 0; r < ribbons.length; r++) {
        const ribbon = ribbons[r];
        const color = isDark ? ribbon.colorDark : ribbon.colorLight;
        const time = accumulatedTime * ribbon.speed;

        // Apply mouse parallax to control points
        const mouseShiftX = currentMouseX * ribbon.parallaxWeight;
        const mouseShiftY = currentMouseY * ribbon.parallaxWeight;

        const p0: [number, number] = [ribbon.p0[0] * width + mouseShiftX, ribbon.p0[1] * height + mouseShiftY];
        const p1: [number, number] = [ribbon.p1[0] * width + mouseShiftX * 0.7, ribbon.p1[1] * height + mouseShiftY * 0.7];
        const p2: [number, number] = [ribbon.p2[0] * width + mouseShiftX * 0.4, ribbon.p2[1] * height + mouseShiftY * 0.4];
        const p3: [number, number] = [ribbon.p3[0] * width, ribbon.p3[1] * height];

        // Precompute spine points and perpendicular normals
        const spinePoints: [number, number][] = new Array(SAMPLES + 1);
        const spineNormals: [number, number][] = new Array(SAMPLES + 1);

        for (let s = 0; s <= SAMPLES; s++) {
          const t = sampleT[s];
          spinePoints[s] = bezierPoint(p0, p1, p2, p3, t);
          const tan = bezierTangent(p0, p1, p2, p3, t);
          spineNormals[s] = [-tan[1], tan[0]];
        }

        // Create linear gradient along ribbon path: low opacity at tips, highest where waves overlap
        const grad = ctx.createLinearGradient(p0[0], p0[1], p3[0], p3[1]);
        grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`); // Soft fade at start tip
        grad.addColorStop(0.15, `rgba(${color.r}, ${color.g}, ${color.b}, ${ribbon.baseOpacity * 0.5})`);
        grad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${ribbon.baseOpacity})`); // Peak silk body
        grad.addColorStop(0.85, `rgba(${color.r}, ${color.g}, ${color.b}, ${ribbon.baseOpacity * 0.6})`);
        grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`); // Soft fade at end tip

        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.7; // Thin, delicate 0.5 - 1px lines

        // Draw bundle of lines
        const totalLines = ribbon.lineCount;
        for (let i = 0; i < totalLines; i++) {
          // Normalized strand index across bundle: -0.5 to +0.5
          const u = i / (totalLines - 1) - 0.5;

          // Out-of-phase wave progression for silky fabric folds
          const linePhase = i * ribbon.phaseShift;

          ctx.beginPath();

          for (let s = 0; s <= SAMPLES; s++) {
            const t = sampleT[s];
            const pt = spinePoints[s];
            const norm = spineNormals[s];

            // Natural organic taper envelope along length
            const lengthTaper = Math.sin(Math.PI * t);

            // Multiphase continuous silky wave motion
            const wave1 = Math.sin(t * Math.PI * 2 * ribbon.freq1 + time + linePhase);
            const wave2 = Math.cos(t * Math.PI * 2 * ribbon.freq2 - time * 0.85 + linePhase * 1.3);
            const wave3 = Math.sin(t * Math.PI * 3.8 + linePhase * 0.6 + time * 0.4);

            // Displacement perpendicular to the ribbon guide curve
            const displacement =
              (wave1 * ribbon.amp1 + wave2 * ribbon.amp2 + wave3 * 5) * lengthTaper;

            // Offset from guide spine
            const offset = (u * ribbon.baseWidth * lengthTaper) + displacement;

            let px = pt[0] + norm[0] * offset;
            let py = pt[1] + norm[1] * offset;

            // Direct cursor proximity deflection
            if (currentRawX > -1000) {
              const dx = px - currentRawX;
              const dy = py - currentRawY;
              const distSq = dx * dx + dy * dy;
              if (distSq < 32400 && distSq > 0.01) { // 180px radius
                const dist = Math.sqrt(distSq);
                const factor = 1 - dist / 180;
                const push = factor * factor * 26;
                px += (dx / dist) * push;
                py += (dy / dist) * push;
              }
            }

            if (s === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }

          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [isDark]);

  return (
    <>
      {/* Lightweight CSS ambient glow for mobile (0ms JS, GPU-accelerated CSS) */}
      <div 
        aria-hidden="true"
        className="md:hidden fixed inset-0 pointer-events-none z-0 select-none opacity-40 dark:opacity-25"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 85% 20%, rgba(56, 189, 248, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 85% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at 85% 20%, rgba(2, 132, 199, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 85% 80%, rgba(13, 148, 136, 0.06) 0%, transparent 50%)'
        }}
      />

      {/* Desktop high-performance silky ribbon canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="hidden md:block fixed inset-0 pointer-events-none z-0 select-none"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </>
  );
};

export default SilkRibbonBackground;
