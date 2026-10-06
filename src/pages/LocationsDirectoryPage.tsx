import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Location } from '../types';
import { LocationCard } from '../components/common/LocationCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { HyperlinkedText } from '../components/common/HyperlinkedText';

export const LocationsDirectoryPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>(() => StorageService.getInitialLocations());
  const [cityFilter, setCityFilter] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;
    StorageService.getLocations().then((data) => {
      if (isMounted) setLocations(data);
    });
    return () => { isMounted = false; };
  }, []);

  const cities = ['All', ...Array.from(new Set(locations.map(l => l.city)))];

  const filteredLocations = cityFilter === 'All' 
    ? locations 
    : locations.filter(l => l.city === cityFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Locations' }
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Geographic Coverage
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mt-1">
            Commercial Locations in Noida & NCR
          </h1>
          <HyperlinkedText
            as="p"
            inline
            className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1"
            text="Select a commercial sector to explore buildings, IT parks, and verified office/warehouse inventory."
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`px-3 py-1 rounded-none text-xs font-mono uppercase tracking-wider transition-all border ${
                cityFilter === c
                  ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                  : 'bg-white dark:bg-[#0B132B] border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-700 dark:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800">
        {filteredLocations.map((loc, idx) => (
          <LocationCard key={loc.id} location={loc} index={idx} />
        ))}
      </div>
    </div>
  );
};
