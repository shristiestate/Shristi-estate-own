import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_CONFIG, prefersReducedMotion } from '../../utils/animations';

export type AnimationVariant =
  | 'fade-up'
  | 'fade-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale-in'
  | 'stagger'
  | 'image-reveal'
  | 'parallax';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  className?: string;
  triggerOnLoad?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration,
  distance = ANIMATION_CONFIG.distance.md,
  stagger = ANIMATION_CONFIG.stagger.normal,
  className = '',
  triggerOnLoad = false,
  style,
  id,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;

    const animDuration = duration || ANIMATION_CONFIG.duration.normal;

    const ctx = gsap.context(() => {
      if (variant === 'stagger') {
        const items = el.querySelectorAll('.scroll-reveal-item');
        const targetItems = items.length > 0 ? items : Array.from(el.children);

        gsap.set(targetItems, {
          y: distance,
          opacity: 0,
        });

        if (triggerOnLoad) {
          gsap.to(targetItems, {
            y: 0,
            opacity: 1,
            duration: animDuration,
            stagger,
            delay,
            ease: ANIMATION_CONFIG.ease.out,
          });
        } else {
          gsap.to(targetItems, {
            y: 0,
            opacity: 1,
            duration: animDuration,
            stagger,
            delay,
            ease: ANIMATION_CONFIG.ease.out,
            scrollTrigger: {
              trigger: el,
              start: ANIMATION_CONFIG.viewportTrigger,
              toggleActions: ANIMATION_CONFIG.toggleActions,
            },
          });
        }
      } else if (variant === 'slide-left') {
        gsap.set(el, { x: -distance, opacity: 0 });
        const animProps = {
          x: 0,
          opacity: 1,
          duration: animDuration,
          delay,
          ease: ANIMATION_CONFIG.ease.out,
        };

        if (triggerOnLoad) {
          gsap.to(el, animProps);
        } else {
          gsap.to(el, {
            ...animProps,
            scrollTrigger: {
              trigger: el,
              start: ANIMATION_CONFIG.viewportTrigger,
              toggleActions: ANIMATION_CONFIG.toggleActions,
            },
          });
        }
      } else if (variant === 'slide-right') {
        gsap.set(el, { x: distance, opacity: 0 });
        const animProps = {
          x: 0,
          opacity: 1,
          duration: animDuration,
          delay,
          ease: ANIMATION_CONFIG.ease.out,
        };

        if (triggerOnLoad) {
          gsap.to(el, animProps);
        } else {
          gsap.to(el, {
            ...animProps,
            scrollTrigger: {
              trigger: el,
              start: ANIMATION_CONFIG.viewportTrigger,
              toggleActions: ANIMATION_CONFIG.toggleActions,
            },
          });
        }
      } else if (variant === 'fade-down') {
        gsap.set(el, { y: -distance, opacity: 0 });
        const animProps = {
          y: 0,
          opacity: 1,
          duration: animDuration,
          delay,
          ease: ANIMATION_CONFIG.ease.out,
        };

        if (triggerOnLoad) {
          gsap.to(el, animProps);
        } else {
          gsap.to(el, {
            ...animProps,
            scrollTrigger: {
              trigger: el,
              start: ANIMATION_CONFIG.viewportTrigger,
              toggleActions: ANIMATION_CONFIG.toggleActions,
            },
          });
        }
      } else if (variant === 'scale-in') {
        gsap.set(el, { scale: 0.95, opacity: 0 });
        const animProps = {
          scale: 1,
          opacity: 1,
          duration: animDuration,
          delay,
          ease: ANIMATION_CONFIG.ease.out,
        };

        if (triggerOnLoad) {
          gsap.to(el, animProps);
        } else {
          gsap.to(el, {
            ...animProps,
            scrollTrigger: {
              trigger: el,
              start: ANIMATION_CONFIG.viewportTrigger,
              toggleActions: ANIMATION_CONFIG.toggleActions,
            },
          });
        }
      } else if (variant === 'image-reveal') {
        // Soft scale-in from 1.06 to 1 with smooth opacity
        const img = el.querySelector('img') || el;
        gsap.set(img, { scale: 1.06 });
        gsap.set(el, { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: ANIMATION_CONFIG.viewportTrigger,
            toggleActions: ANIMATION_CONFIG.toggleActions,
          },
        });

        tl.to(el, {
          opacity: 1,
          duration: animDuration * 0.7,
          ease: ANIMATION_CONFIG.ease.out,
          delay,
        }).to(
          img,
          {
            scale: 1,
            duration: animDuration,
            ease: ANIMATION_CONFIG.ease.out,
          },
          '<'
        );
      } else if (variant === 'parallax') {
        // Hero background image subtle parallax
        gsap.to(el, {
          y: 60,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      } else {
        // Default: fade-up
        gsap.set(el, { y: distance, opacity: 0 });
        const animProps = {
          y: 0,
          opacity: 1,
          duration: animDuration,
          delay,
          ease: ANIMATION_CONFIG.ease.out,
        };

        if (triggerOnLoad) {
          gsap.to(el, animProps);
        } else {
          gsap.to(el, {
            ...animProps,
            scrollTrigger: {
              trigger: el,
              start: ANIMATION_CONFIG.viewportTrigger,
              toggleActions: ANIMATION_CONFIG.toggleActions,
            },
          });
        }
      }
    }, el);

    return () => {
      ctx.revert();
    };
  }, [variant, delay, duration, distance, stagger, triggerOnLoad]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`scroll-reveal-box ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
