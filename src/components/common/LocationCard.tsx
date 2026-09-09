import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2, Layers, ArrowRight } from 'lucide-react';
import { Location } from '../../types';

interface LocationCardProps {
  location: Location;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  return (
    <Link
      to={`/locations/${location.slug}`}
      className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col group border border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-[#0B132B]/75 transition-all duration-300"
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={location.hero_image}
          alt={location.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

        {/* Counters */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10">
            {location.building_count} Buildings
          </span>
          <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-brand-600/90 text-white backdrop-blur-md">
            {location.property_count} Properties
          </span>
        </div>

        {/* Location Name & City */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-1 text-xs text-brand-400 font-semibold mb-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location.city}, {location.region}</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight font-['Outfit'] group-hover:text-brand-300 transition-colors">
            {location.name}
          </h3>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {location.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            View Buildings & Units
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-600 text-slate-600 dark:text-slate-300 group-hover:text-white flex items-center justify-center transition-all">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};
