import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Location } from '../types';
import { LocationCard } from '../components/common/LocationCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const LocationsDirectoryPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [cityFilter, setCityFilter] = useState<string>('All');

  useEffect(() => {
    StorageService.getLocations().then(setLocations);
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

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Geographic Coverage
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
            Commercial Locations in Noida & NCR
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Select a commercial sector to explore buildings, IT parks, and verified office/warehouse inventory.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                cityFilter === c
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((loc) => (
          <LocationCard key={loc.id} location={loc} />
        ))}
      </div>
    </div>
  );
};
