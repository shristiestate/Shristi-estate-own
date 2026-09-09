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
  showSubtitle = true
}) => {
  // If icon-only variant is requested
  if (variant === 'icon') {
    return (
      <Link to="/" className={`inline-flex items-center group select-none ${className}`}>
        {theme === 'dark' ? (
          <img
            src="/logo-icon-dark.png"
            alt="Shristi Estate Logo Mark"
            className="h-9 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          />
        ) : theme === 'light' ? (
          <img
            src="/logo-icon-light.png"
            alt="Shristi Estate Logo Mark"
            className="h-9 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="relative flex items-center justify-center">
            <img
              src="/logo-icon-light.png"
              alt="Shristi Estate Logo Mark"
              className="h-9 sm:h-10 w-auto object-contain dark:hidden group-hover:scale-105 transition-transform duration-200"
            />
            <img
              src="/logo-icon-dark.png"
              alt="Shristi Estate Logo Mark"
              className="h-9 sm:h-10 w-auto object-contain hidden dark:block group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
      </Link>
    );
  }

  // Full & Compact Logo with high-definition emblem mark and crisp vector typography
  const isDarkExplicit = theme === 'dark';
  const isLightExplicit = theme === 'light';

  return (
    <Link 
      to="/" 
      className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}
      aria-label="Shristi Estate - Commercial Real Estate Home"
    >
      {/* Official 3-Towers Architectural Emblem */}
      <div className="relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.04]">
        {isDarkExplicit ? (
          <img
            src="/logo-icon-dark.png"
            alt="Shristi Estate Emblem"
            className="h-8.5 sm:h-9.5 xl:h-10 w-auto object-contain"
          />
        ) : isLightExplicit ? (
          <img
            src="/logo-icon-light.png"
            alt="Shristi Estate Emblem"
            className="h-8.5 sm:h-9.5 xl:h-10 w-auto object-contain"
          />
        ) : (
          <>
            <img
              src="/logo-icon-light.png"
              alt="Shristi Estate Emblem"
              className="h-8.5 sm:h-9.5 xl:h-10 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-icon-dark.png"
              alt="Shristi Estate Emblem"
              className="h-8.5 sm:h-9.5 xl:h-10 w-auto object-contain hidden dark:block"
            />
          </>
        )}
      </div>

      {/* Brand Company Name */}
      <div className="flex items-center gap-1.5 leading-none select-none">
        <span 
          className={`font-extrabold text-[19px] sm:text-[21px] xl:text-[22px] tracking-tight transition-colors ${
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
          className={`font-semibold text-[19px] sm:text-[21px] xl:text-[22px] tracking-tight transition-colors ${
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
