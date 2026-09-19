import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, ArrowRight, Layers, ShieldCheck, Zap } from 'lucide-react';
import { Building } from '../../types';

interface BuildingCardProps {
  building: Building;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({ building }) => {
  return (
    <div className="scroll-reveal-item glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col group border border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-[#0B132B]/75 transition-all duration-300 will-change-transform">
      {/* Building Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={building.hero_image}
          alt={building.name}
          loading="lazy"
          className="w-full h-full object-cover card-image-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Available Properties Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-600/95 text-white backdrop-blur-md shadow-md border border-brand-400/30">
            {building.property_count || 1} Available {building.property_count === 1 ? 'Unit' : 'Units'}
          </span>
        </div>

        {/* Building Name & Location at bottom of hero */}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider block">
            Commercial Project / Tower
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight font-['Outfit'] drop-shadow-sm">
            {building.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-slate-300 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{building.location_name}</span>
          </div>
        </div>
      </div>

      {/* Building Specifications */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <p className="overview-card-text text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {building.description}
        </p>

        {/* Specs Overview */}
        <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-500" />
              Floors & Structure:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              G + {building.total_floors} Floors
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Unit Sizes:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {building.size_range}
            </span>
          </div>

          {building.rent_range && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Typical Rent:</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                {building.rent_range}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={`/buildings/${building.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold text-xs sm:text-sm hover:bg-brand-600 dark:hover:bg-brand-400 transition-colors"
          >
            <span>Explore Building</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          
          <Link
            to={`/buildings/${building.slug}/properties`}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            title="View Available Units"
          >
            Units ({building.property_count || 1})
          </Link>
        </div>
      </div>
    </div>
  );
};
