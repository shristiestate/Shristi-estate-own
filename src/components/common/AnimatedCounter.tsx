import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_CONFIG, prefersReducedMotion } from '../../utils/animations';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  duration = 1.4,
  className = '',
}) => {
  const countRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = countRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = `${prefix}${value}${suffix}`;
      return;
    }

    const obj = { count: 0 };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: ANIMATION_CONFIG.viewportTrigger,
        onEnter: () => {
          gsap.to(obj, {
            count: value,
            duration,
            ease: 'power2.out',
            onUpdate: () => {
              if (el) {
                el.textContent = `${prefix}${Math.round(obj.count)}${suffix}`;
              }
            },
          });
        },
        onLeaveBack: () => {
          // Reset count on scrolling back up past the element
          obj.count = 0;
          if (el) {
            el.textContent = `${prefix}0${suffix}`;
          }
        },
      });
    }, el);

    return () => {
      ctx.revert();
    };
  }, [value, suffix, prefix, duration]);

  return (
    <span ref={countRef} className={`tabular-nums ${className}`}>
      {prefix}0{suffix}
    </span>
  );
};
