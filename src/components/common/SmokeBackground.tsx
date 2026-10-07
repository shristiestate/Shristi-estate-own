import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  age: number;
  life: number;
  seed: number;
  spriteIndex: number;
  maxOpacity: number;
  isCursor: boolean;
}

export const SmokeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isDark } = useTheme();

  // Mobile / Touch Performance Optimization:
  // On mobile & touch screens (< 768px or hover: none), completely skip the 60fps canvas particle simulation.
  // Mobile devices have no cursor to follow and a 4x-throttled CPU. Skipping this completely eliminates ~9,500ms of TBT.
  const isMobile = typeof window !== 'undefined' && 
    (window.innerWidth < 768 || window.matchMedia('(hover: none)').matches);

  if (isMobile) {
    return null;
  }

  useEffect(() => {
    // Double check on mount for safety
    if (typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(hover: none)').matches)) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // Existing website theme colors only:
    // Dark mode: Brand 400 (38bdf8), Accent Cyan (06b6d4), Accent Teal (0d9488), Muted Slate (94a3b8)
    // Light mode: Brand 500 (0284c7), Brand 400 (38bdf8), Accent Teal (0d9488), Slate Text (94a3b8)
    const colorPalettes = isDark
      ? [
          [56, 189, 248], // Brand 400
          [6, 182, 212],  // Accent Cyan
          [13, 148, 136], // Accent Teal
          [148, 163, 184] // Slate Text
        ]
      : [
          [2, 132, 199],  // Brand 500
          [56, 189, 248], // Brand 400
          [13, 148, 136], // Accent Teal
          [148, 163, 184] // Slate Text
        ];

    // Pre-render soft puff sprites (one per color) for 60fps GPU blitting
    const spriteSize = 128;
    const sprites: HTMLCanvasElement[] = colorPalettes.map(([r, g, b]) => {
      const sp = document.createElement('canvas');
      sp.width = spriteSize;
      sp.height = spriteSize;
      const sCtx = sp.getContext('2d');
      if (sCtx) {
        const half = spriteSize / 2;
        const grad = sCtx.createRadialGradient(half, half, 0, half, half, half);
        grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(0.35, `rgba(${r},${g},${b},0.55)`);
        grad.addColorStop(0.7, `rgba(${r},${g},${b},0.18)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, spriteSize, spriteSize);
      }
      return sp;
    });

    // Configuration: Lightweight 90-particle budget for desktop (prevents CPU lag)
    const maxParticles = 90;
    const peakAmbientOpacity = isDark ? 0.08 : 0.055;
    const cursorOpacity = isDark ? 0.16 : 0.11;
    const particles: Particle[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);
    const smoothstep = (t: number) => {
      const clamped = Math.max(0, Math.min(1, t));
      return clamped * clamped * (3 - 2 * clamped);
    };

    // Resize handling
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Particle spawning: 5s fading duration + expanded radius
    const spawnParticle = (
      x: number,
      y: number,
      vx: number,
      vy: number,
      isCursor: boolean = false
    ) => {
      if (particles.length >= maxParticles) {
        particles.shift();
      }

      // Fading lifetime: 5 seconds for interactive smoke
      const life = isCursor ? rand(4.5, 5.0) : rand(4.5, 6.5);
      // Increased starting radius for larger volume
      const r = isCursor ? rand(52, 95) : rand(70, 130);
      const spriteIndex = Math.floor(Math.random() * sprites.length);
      const opacity = isCursor ? cursorOpacity : peakAmbientOpacity;

      particles.push({
        x: x + rand(-6, 6),
        y: y + rand(-6, 6),
        vx: vx * 0.10 + rand(-10, 10),
        vy: vy * 0.10 + rand(-8, 8) - (isCursor ? 14 : rand(12, 22)),
        r,
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.25, 0.25),
        age: 0,
        life,
        seed: rand(0, 1000),
        spriteIndex,
        maxOpacity: opacity,
        isCursor
      });
    };

    // Pre-populate with soft ambient particles so screen has immediate depth
    const initialCount = 20;
    for (let i = 0; i < initialCount; i++) {
      particles.push({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-8, 8),
        vy: -rand(10, 20),
        r: rand(65, 125),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.2, 0.2),
        age: rand(0, 4),
        life: rand(4.5, 6.5),
        seed: rand(0, 1000),
        spriteIndex: Math.floor(Math.random() * sprites.length),
        maxOpacity: peakAmbientOpacity,
        isCursor: false
      });
    }

    // Cursor interaction state
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let active = false;
    let vx = 0;
    let vy = 0;
    let carry = 0;
    let idleCursorTimer = 0;

    const point = (x: number, y: number) => {
      if (!active) {
        pos.x = x;
        pos.y = y;
      }
      target.x = x;
      target.y = y;
      active = true;
      idleCursorTimer = 0;
    };

    const handleMouseMove = (e: MouseEvent) => point(e.clientX, e.clientY);
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) point(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) point(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleEnd = () => {
      active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleEnd, { passive: true });
    document.addEventListener('mouseleave', handleEnd);

    // Animation & Physics loop
    let prev = performance.now();
    let time = 0;
    let ambientTimer = 0;

    const tick = (now: number) => {
      // Pause animation if browser tab is hidden to save 100% of CPU in background
      if (typeof document !== 'undefined' && document.hidden) {
        prev = now;
        animId = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min((now - prev) / 1000, 0.033);
      prev = now;
      time += dt;
      ambientTimer += dt;
      idleCursorTimer += dt;

      // Spawn ambient smoke gently
      const ambientInterval = 0.35;
      if (ambientTimer >= ambientInterval) {
        ambientTimer = 0;
        const spawnX = rand(-50, w + 50);
        const spawnY = h + rand(10, 40);
        spawnParticle(spawnX, spawnY, rand(-12, 12), -rand(14, 26), false);

        if (Math.random() < 0.35) {
          const sideX = Math.random() < 0.5 ? -30 : w + 30;
          const sideY = rand(h * 0.3, h * 0.9);
          spawnParticle(sideX, sideY, sideX < 0 ? rand(12, 22) : -rand(12, 22), -rand(10, 18), false);
        }
      }

      ctx.clearRect(0, 0, w, h);

      // Interactive cursor smoke trail with dense, silky emission
      if (active && dt > 0) {
        const px = pos.x;
        const py = pos.y;
        const smoothing = isMobile ? 12 : 16;
        pos.x += (target.x - pos.x) * ease(smoothing, dt);
        pos.y += (target.y - pos.y) * ease(smoothing, dt);

        vx += ((pos.x - px) / dt - vx) * ease(12, dt);
        vy += ((pos.y - py) / dt - vy) * ease(12, dt);

        const dist = Math.hypot(pos.x - px, pos.y - py);
        carry += dist;
        // Spacing along path
        const spacing = isMobile ? 10 : 6.5;
        const n = Math.floor(carry / spacing);

        for (let i = 1; i <= n; i++) {
          const t = i / n;
          spawnParticle(px + (pos.x - px) * t, py + (pos.y - py) * t, vx, vy, true);
        }
        carry -= n * spacing;

        // Gentle puff when hovering almost stationary
        if (dist < 2 && idleCursorTimer > 0.14) {
          idleCursorTimer = 0;
          spawnParticle(pos.x, pos.y, rand(-6, 6), -rand(12, 20), true);
        }
      } else {
        vx *= Math.exp(-6 * dt);
        vy *= Math.exp(-6 * dt);
      }

      const drag = 0.95;
      const damp = Math.exp(-drag * dt);
      const windRadius = isMobile ? 180 : 260;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.life || p.y < -p.r * 2) {
          particles.splice(i, 1);
          continue;
        }

        // Reactive cursor deflection wind (pushes existing smoke particles aside smoothly)
        if (active) {
          const d = Math.hypot(p.x - pos.x, p.y - pos.y);
          if (d < windRadius && d > 1) {
            const f = smoothstep(1 - d / windRadius) * 0.8 * 8 * dt;
            p.vx += vx * f * 0.12;
            p.vy += vy * f * 0.12;
          }
        }

        // Organic ambient wave swirl
        p.vx += Math.sin(time * 0.85 + p.seed) * 14 * dt;
        p.vy += Math.cos(time * 0.65 + p.seed * 1.3) * 8 * dt;
        p.vx *= damp;
        p.vy *= damp;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        // Increased expanding radius growth over the 5-second lifetime
        p.r += (p.isCursor ? 46 : 28) * dt;

        // Smoothstep bell-curve fade in and fade out over the 5s lifetime
        const t = p.age / p.life;
        const alpha = p.maxOpacity * smoothstep(Math.min(t / 0.15, 1)) * (1 - smoothstep(t));

        if (alpha > 0.001) {
          ctx.globalAlpha = alpha;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          const currentSprite = sprites[p.spriteIndex];
          ctx.drawImage(currentSprite, -p.r, -p.r, p.r * 2, p.r * 2);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      document.removeEventListener('mouseleave', handleEnd);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        filter: 'blur(5px)'
      }}
    />
  );
};

export default SmokeBackground;
