import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_CONFIG, prefersReducedMotion } from '../../utils/animations';

interface AnimatedTextProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  type?: 'words' | 'fade-up' | 'hero' | 'subtitle';
  delay?: number;
  duration?: number;
  showAccentLine?: boolean;
  accentLineClassName?: string;
  triggerOnLoad?: boolean;
  style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  as: Component = 'h2',
  className = '',
  type = 'words',
  delay = 0,
  duration,
  showAccentLine = false,
  accentLineClassName = 'h-1 bg-gradient-to-r from-brand-600 to-accent-teal rounded-full mt-2 w-20',
  triggerOnLoad = false,
  style,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;

    const animDuration = duration || (type === 'hero' ? ANIMATION_CONFIG.duration.hero : ANIMATION_CONFIG.duration.normal);
    const targetWords = el.querySelectorAll('.anim-word-inner');
    const accentLine = lineRef.current;

    const ctx = gsap.context(() => {
      if (type === 'words' || type === 'hero') {
        const targets = targetWords.length > 0 ? targetWords : el;
        
        // Initial state
        gsap.set(targets, { y: '110%', opacity: 0 });
        if (accentLine) {
          gsap.set(accentLine, { scaleX: 0, transformOrigin: 'left center' });
        }

        if (triggerOnLoad) {
          // Page load entrance sequence
          const tl = gsap.timeline({ delay });
          tl.to(targets, {
            y: '0%',
            opacity: 1,
            duration: animDuration,
            stagger: ANIMATION_CONFIG.stagger.fast,
            ease: ANIMATION_CONFIG.ease.out,
          });
          if (accentLine) {
            tl.to(
              accentLine,
              {
                scaleX: 1,
                duration: 0.6,
                ease: ANIMATION_CONFIG.ease.out,
              },
              '-=0.3'
            );
          }
        } else {
          // ScrollTrigger bi-directional animation
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: ANIMATION_CONFIG.viewportTrigger,
              toggleActions: ANIMATION_CONFIG.toggleActions,
            },
          });

          tl.to(targets, {
            y: '0%',
            opacity: 1,
            duration: animDuration,
            stagger: ANIMATION_CONFIG.stagger.fast,
            ease: ANIMATION_CONFIG.ease.out,
            delay,
          });

          if (accentLine) {
            tl.to(
              accentLine,
              {
                scaleX: 1,
                duration: 0.6,
                ease: ANIMATION_CONFIG.ease.out,
              },
              '-=0.2'
            );
          }
        }
      } else {
        // Simple fade + upward slide for subtitles and paragraphs
        gsap.set(el, { y: ANIMATION_CONFIG.distance.sm, opacity: 0 });

        if (triggerOnLoad) {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: animDuration,
            delay,
            ease: ANIMATION_CONFIG.ease.out,
          });
        } else {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: animDuration,
            delay,
            ease: ANIMATION_CONFIG.ease.out,
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
  }, [type, delay, duration, triggerOnLoad]);

  // Recursively process children to wrap words in overflow-hidden spans if type === 'words' or 'hero'
  const renderFormattedChildren = (content: React.ReactNode): React.ReactNode => {
    if (type === 'fade-up' || type === 'subtitle') {
      return content;
    }

    if (typeof content === 'string') {
      const words = content.split(' ');
      return words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.08em] whitespace-normal mr-[0.25em]">
          <span className="anim-word-inner inline-block will-change-transform">
            {word}
          </span>
        </span>
      ));
    }

    if (React.isValidElement(content)) {
      if (content.type === 'br') {
        return content;
      }
      // If it's a span or styled container with text children (like gradient text)
      const childProps = content.props as { children?: React.ReactNode; className?: string };
      if (childProps && childProps.children) {
        return React.cloneElement(
          content as React.ReactElement<{ children?: React.ReactNode }>,
          {},
          renderFormattedChildren(childProps.children)
        );
      }
      return content;
    }

    if (Array.isArray(content)) {
      return content.map((item, idx) => (
        <React.Fragment key={idx}>{renderFormattedChildren(item)}</React.Fragment>
      ));
    }

    return content;
  };

  const DynamicTag = Component as any;

  return (
    <div className="inline-block max-w-full">
      <DynamicTag
        ref={containerRef}
        className={`${className} ${type === 'fade-up' ? 'will-change-transform' : ''}`}
        style={style}
      >
        {renderFormattedChildren(children)}
      </DynamicTag>
      {showAccentLine && (
        <div ref={lineRef} className={accentLineClassName} />
      )}
    </div>
  );
};
