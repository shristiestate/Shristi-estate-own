import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { Location } from '../../types';

interface LocationCardProps {
  location: Location;
  index?: number;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, index }) => {
  const numberDisplay = typeof index === 'number' 
    ? String(index + 1).padStart(2, '0') 
    : '01';

  return (
    <Link
      to={`/locations/${location.slug}`}
      className="relative rounded-none overflow-hidden flex flex-col group border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] hover:bg-slate-50/80 dark:hover:bg-[#0E1838] transition-colors duration-300"
    >
      {/* Top Architectural Header Bar: Minimal Line Icon Left, Number Right */}
      <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-white/[0.02]">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3 h-3 text-brand-600 dark:text-brand-400 stroke-[1.5] shrink-0" />
          <span className="text-[9.5px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {location.city}, {location.region}
          </span>
        </div>
        <span className="font-mono text-[9.5px] sm:text-[10px] tracking-widest text-brand-600/70 dark:text-brand-400/70 font-semibold shrink-0 ml-2">
          {numberDisplay}
        </span>
      </div>

      {/* Sharp Rectangular Hero Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={location.hero_image}
          alt={location.name}
          width="400"
          height="250"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Counters Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded-none text-[8.5px] sm:text-[9px] font-mono uppercase tracking-wider bg-slate-950/80 text-white backdrop-blur-sm border border-white/10">
            {location.building_count} Buildings
          </span>
          <span className="px-1.5 py-0.5 rounded-none text-[8.5px] sm:text-[9px] font-mono uppercase tracking-wider bg-brand-950/80 text-brand-200 border border-brand-500/30">
            {location.property_count} Units
          </span>
        </div>

        {/* Location Name at bottom of image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          <span className="text-[8.5px] sm:text-[9px] font-mono uppercase tracking-wider text-brand-300 block mb-0.5">
            Commercial Corridor
          </span>
          <div className="text-sm sm:text-base font-bold text-white tracking-tight drop-shadow-sm truncate">
            {location.name}
          </div>
        </div>
      </div>

      {/* Location Details Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <p className="overview-card-text text-[10.5px] sm:text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-sans">
          {location.description}
        </p>

        {/* Bottom Architectural Action: “Explore” with arrow */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            <span>Explore Sector</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>

          <span className="text-[9.5px] sm:text-[10px] font-mono text-slate-400 dark:text-slate-500">
            {location.property_count} Listed
          </span>
        </div>
      </div>
    </Link>
  );
};
