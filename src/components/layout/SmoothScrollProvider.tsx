import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initLenis, destroyLenis, getLenis, prefersReducedMotion } from '../../utils/animations';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const location = useLocation();
  const pageContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize Lenis on mount
  useEffect(() => {
    const lenis = initLenis();

    return () => {
      destroyLenis();
    };
  }, []);

  // Handle route change: scroll to top, refresh ScrollTrigger, and subtle page transition fade-in
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    // Refresh ScrollTrigger calculations after route DOM renders
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    // Page-load transition animation
    const container = pageContainerRef.current;
    if (container && !prefersReducedMotion()) {
      gsap.fromTo(
        container,
        { opacity: 0.85, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
        }
      );
    }

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div ref={pageContainerRef} className="page-transition-wrapper w-full">
      {children}
    </div>
  );
};
