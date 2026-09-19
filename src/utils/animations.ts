import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Centralized Animation Configuration
 * Tweak speed, delay, distance, and triggers from this single place.
 */
export const ANIMATION_CONFIG = {
  // Durations in seconds
  duration: {
    fast: 0.5,
    normal: 0.8,
    hero: 1.0,
    slow: 1.2,
  },
  // Distances in pixels (translated along Y or X)
  distance: {
    sm: 20,
    md: 35,
    lg: 50,
  },
  // Stagger delays in seconds
  stagger: {
    fast: 0.05,
    normal: 0.1,
    relaxed: 0.15,
  },
  // Luxury, high-end real estate easing
  ease: {
    out: 'power2.out',
    outCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    inOut: 'power2.inOut',
  },
  // ScrollTrigger viewport start point (~15-20% inside viewport)
  viewportTrigger: 'top 85%',
  // Bi-directional replay actions: reveal when scrolling down, reverse smoothly when scrolling up
  toggleActions: 'play reverse play reverse',
};

/**
 * Check if the user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Global Lenis smooth scrolling instance
 */
let lenisInstance: Lenis | null = null;

export const initLenis = (): Lenis | null => {
  if (typeof window === 'undefined' || prefersReducedMotion()) {
    return null;
  }

  if (lenisInstance) {
    return lenisInstance;
  }

  try {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenisInstance.on('scroll', ScrollTrigger.update);

    // Add Lenis's requestAnimationFrame to GSAP's ticker
    gsap.ticker.add((time) => {
      lenisInstance?.raf(time * 1000);
    });

    // Disable lag smoothing to prevent visual jumps
    gsap.ticker.lagSmoothing(0);

    return lenisInstance;
  } catch (err) {
    console.warn('Could not initialize Lenis smooth scroll:', err);
    return null;
  }
};

export const getLenis = (): Lenis | null => lenisInstance;

export const destroyLenis = (): void => {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
};

/**
 * Refresh ScrollTrigger measurements across the app (useful after route change or DOM update)
 */
export const refreshScrollTrigger = (): void => {
  if (typeof window !== 'undefined') {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }
};
