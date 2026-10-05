import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, ArrowRight, Layers } from 'lucide-react';
import { Building } from '../../types';
import { getBuildingStructureDisplay } from '../../utils/textFormat';
import { StorageService } from '../../services/storageService';

interface BuildingCardProps {
  building: Building;
  index?: number;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({ building, index }) => {
  const numberDisplay = typeof index === 'number' 
    ? String(index + 1).padStart(2, '0') 
    : '01';

  return (
    <div className="relative rounded-none overflow-hidden flex flex-col group border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] hover:bg-slate-50/80 dark:hover:bg-[#0E1838] transition-colors duration-300">
      {/* Top Architectural Header Bar: Minimal Line Icon Left, Number Right */}
      <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-white/[0.02]">
        <div className="flex items-center gap-1.5 min-w-0">
          <Building2 className="w-3 h-3 text-brand-600 dark:text-brand-400 stroke-[1.75] shrink-0" />
          <span className="text-[9.5px] sm:text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {(building.categories?.[0] || building.category || 'Commercial').replace(/-/g, ' ')}
          </span>
        </div>
        <span className="font-mono text-[9.5px] sm:text-[10px] tracking-widest text-brand-600/70 dark:text-brand-400/70 font-semibold shrink-0 ml-2">
          {numberDisplay}
        </span>
      </div>

      {/* Sharp Rectangular Building Hero Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={building.hero_image}
          alt={building.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Floating Badge */}
        <div className="absolute top-2.5 right-2.5 pointer-events-auto">
          <span className="px-1.5 py-0.5 rounded-none text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-wider bg-brand-600 text-white shadow-sm">
            {building.property_count || 1} Available {building.property_count === 1 ? 'Unit' : 'Units'}
          </span>
        </div>

        {/* Building Name & Location at bottom of hero */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-0.5">
          <span className="text-[8.5px] sm:text-[9px] font-mono uppercase tracking-wider text-slate-200 block truncate">
            {building.tower_details || 'Commercial Project / Tower'}
          </span>
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-300">
            <MapPin className="w-2.5 h-2.5 text-brand-400 shrink-0" />
            <span className="truncate">
              {building.location_name}
              {building.locations && building.locations.length > 1 && (
                <span className="ml-1 text-[8.5px] text-brand-300 font-mono">
                  (+{building.locations.length - 1} more)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Building Specifications */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Structured Architectural Heading */}
          <h3 className="text-[13px] sm:text-[13.5px] font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate leading-snug tracking-tight">
            <Link to={`/buildings/${building.slug}`}>
              {building.name}
            </Link>
          </h3>

          <p className="overview-card-text text-[10.5px] sm:text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mt-1 font-sans">
            {building.description}
          </p>

          {/* Specs Overview */}
          <div className="space-y-1.5 py-2 mt-2.5 border-y border-slate-100 dark:border-slate-800/80 text-[10px] sm:text-[10.5px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-sans">
                <Layers className="w-2.5 h-2.5 text-brand-500 shrink-0" />
                Floors & Structure:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[10px] sm:text-[10.5px]">
                {getBuildingStructureDisplay(building)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-sans">Unit Sizes:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[10px] sm:text-[10.5px]">
                {building.size_range}
              </span>
            </div>

            {building.rent_range && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Typical Rent:</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400 text-[10px] sm:text-[10.5px]">
                  {building.rent_range}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Architectural Action: “Explore” with arrow */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <Link
            to={`/buildings/${building.slug}`}
            className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors"
          >
            <span>Explore Building</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            to={`/buildings/${building.slug}/properties`}
            className="btn-glass-primary px-2.5 py-1 rounded-none text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider"
            title="View Available Units"
          >
            Units ({StorageService.getBuildingUnitCount(building)})
          </Link>
        </div>
      </div>
    </div>
  );
};
