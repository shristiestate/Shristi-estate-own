import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, ArrowRight, X } from 'lucide-react';
import { toSafeInternalPath } from '../../utils/navigation';
import { StorageService } from '../../services/storageService';
import { Property, Building, Location } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      StorageService.getProperties().then(setProperties);
      StorageService.getBuildings().then(setBuildings);
      StorageService.getLocations().then(setLocations);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const filteredProperties = cleanQuery
    ? properties.filter(p => 
        p.title.toLowerCase().includes(cleanQuery) ||
        p.reference_number.toLowerCase().includes(cleanQuery) ||
        p.location_name.toLowerCase().includes(cleanQuery) ||
        (p.building_name && p.building_name.toLowerCase().includes(cleanQuery))
      ).slice(0, 4)
    : [];

  const filteredBuildings = cleanQuery
    ? buildings.filter(b => 
        b.name.toLowerCase().includes(cleanQuery) ||
        b.location_name.toLowerCase().includes(cleanQuery)
      ).slice(0, 3)
    : [];

  const filteredLocations = cleanQuery
    ? locations.filter(l => 
        l.name.toLowerCase().includes(cleanQuery)
      ).slice(0, 2)
    : [];

  const handleSelect = (url: string) => {
    onClose();
    navigate(toSafeInternalPath(url));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
      {/* Frosted Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 bg-white/95 dark:bg-[#0B132B]/95 border border-slate-200 dark:border-slate-800 shadow-2xl z-10">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <Search className="w-5 h-5 text-brand-500 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search by sector, building (e.g. I-Thum), ID (SE-6201), office, warehouse..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-base sm:text-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type a location, building name, or property specification to see instant results.
            </div>
          ) : filteredProperties.length === 0 && filteredBuildings.length === 0 && filteredLocations.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                We couldn't find an exact match for "{query}".
              </p>
              <p className="text-xs text-slate-500">
                You can submit your custom requirement and our commercial desk will source matching inventory.
              </p>
              <button
                onClick={() => handleSelect('/tell-us-requirement')}
                className="mt-2 btn-glass-primary px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Tell Us Your Requirement
              </button>
            </div>
          ) : (
            <>
              {/* Properties Matches */}
              {filteredProperties.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Available Properties
                  </div>
                  <div className="space-y-1.5">
                    {filteredProperties.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(`/properties/${p.slug}`)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                            {p.reference_number}
                          </span>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                            {p.title}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white shrink-0 ml-2">
                          {p.price_display}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Buildings Matches */}
              {filteredBuildings.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Commercial Buildings & Projects
                  </div>
                  <div className="space-y-1.5">
                    {filteredBuildings.map(b => (
                      <button
                        key={b.id}
                        onClick={() => handleSelect(`/buildings/${b.slug}`)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Building2 className="w-4 h-4 text-brand-500 shrink-0" />
                          <div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {b.name}
                            </span>
                            <span className="text-xs text-slate-500 ml-1.5">
                              • {b.location_name}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Locations Matches */}
              {filteredLocations.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Commercial Locations
                  </div>
                  <div className="space-y-1.5">
                    {filteredLocations.map(l => (
                      <button
                        key={l.id}
                        onClick={() => handleSelect(`/locations/${l.slug}`)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <MapPin className="w-4 h-4 text-accent-emerald shrink-0" />
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {l.name}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
