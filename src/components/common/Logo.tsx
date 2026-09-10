import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon';
  theme?: 'auto' | 'dark' | 'light';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  variant = 'full',
  theme = 'auto',
}) => {
  // If icon-only variant is requested
  if (variant === 'icon') {
    return (
      <Link to="/" className={`inline-flex items-center group select-none ${className}`}>
        {theme === 'dark' ? (
          <img
            src="/logo-icon-dark.png"
            alt="Shristi Estate Logo Mark"
            className="h-7 sm:h-8 md:h-9 w-auto max-h-[34px] object-contain group-hover:scale-105 transition-transform duration-200"
            style={{ maxHeight: '34px', width: 'auto' }}
          />
        ) : theme === 'light' ? (
          <img
            src="/logo-icon-light.png"
            alt="Shristi Estate Logo Mark"
            className="h-7 sm:h-8 md:h-9 w-auto max-h-[34px] object-contain group-hover:scale-105 transition-transform duration-200"
            style={{ maxHeight: '34px', width: 'auto' }}
          />
        ) : (
          <div className="relative flex items-center justify-center">
            <img
              src="/logo-icon-light.png"
              alt="Shristi Estate Logo Mark"
              className="h-7 sm:h-8 md:h-9 w-auto max-h-[34px] object-contain dark:hidden group-hover:scale-105 transition-transform duration-200"
              style={{ maxHeight: '34px', width: 'auto' }}
            />
            <img
              src="/logo-icon-dark.png"
              alt="Shristi Estate Logo Mark"
              className="h-7 sm:h-8 md:h-9 w-auto max-h-[34px] object-contain hidden dark:block group-hover:scale-105 transition-transform duration-200"
              style={{ maxHeight: '34px', width: 'auto' }}
            />
          </div>
        )}
      </Link>
    );
  }

  // Full & Compact Logo with responsive architectural emblem and crisp typography
  const isDarkExplicit = theme === 'dark';
  const isLightExplicit = theme === 'light';

  return (
    <Link 
      to="/" 
      className={`inline-flex items-center gap-2 sm:gap-2.5 group select-none ${className}`}
      aria-label="Shristi Estate - Commercial Real Estate Home"
    >
      {/* Official 3-Towers Architectural Emblem - constrained strictly to max 32px on mobile */}
      <div className="relative shrink-0 flex items-center justify-center h-7 sm:h-8 md:h-9 w-auto transition-transform duration-200 group-hover:scale-[1.04]">
        {isDarkExplicit ? (
          <img
            src="/logo-icon-dark.png"
            alt="Shristi Estate Emblem"
            className="h-7 sm:h-8 md:h-9 w-auto max-h-[32px] sm:max-h-[36px] md:max-h-[40px] object-contain"
            style={{ maxHeight: '34px', width: 'auto' }}
          />
        ) : isLightExplicit ? (
          <img
            src="/logo-icon-light.png"
            alt="Shristi Estate Emblem"
            className="h-7 sm:h-8 md:h-9 w-auto max-h-[32px] sm:max-h-[36px] md:max-h-[40px] object-contain"
            style={{ maxHeight: '34px', width: 'auto' }}
          />
        ) : (
          <>
            <img
              src="/logo-icon-light.png"
              alt="Shristi Estate Emblem"
              className="h-7 sm:h-8 md:h-9 w-auto max-h-[32px] sm:max-h-[36px] md:max-h-[40px] object-contain dark:hidden"
              style={{ maxHeight: '34px', width: 'auto' }}
            />
            <img
              src="/logo-icon-dark.png"
              alt="Shristi Estate Emblem"
              className="h-7 sm:h-8 md:h-9 w-auto max-h-[32px] sm:max-h-[36px] md:max-h-[40px] object-contain hidden dark:block"
              style={{ maxHeight: '34px', width: 'auto' }}
            />
          </>
        )}
      </div>

      {/* Brand Company Name */}
      <div className="flex items-center gap-1 sm:gap-1.5 leading-none select-none">
        <span 
          className={`font-extrabold text-[16px] sm:text-[18px] md:text-[20px] tracking-tight transition-colors ${
            isDarkExplicit 
              ? 'text-white' 
              : isLightExplicit 
                ? 'text-slate-900' 
                : 'text-slate-900 dark:text-white'
          }`}
        >
          Shristi
        </span>
        <span 
          className={`font-semibold text-[16px] sm:text-[18px] md:text-[20px] tracking-tight transition-colors ${
            isDarkExplicit 
              ? 'text-slate-300' 
              : isLightExplicit 
                ? 'text-slate-600' 
                : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Estate
        </span>
      </div>
    </Link>
  );
};
