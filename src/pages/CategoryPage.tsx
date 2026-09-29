import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Search, Filter, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Property, Building, Location, PropertyCategory } from '../types';
import { CATEGORY_METADATA } from '../data/mockData';
import { PropertyCard } from '../components/common/PropertyCard';
import { BuildingCard } from '../components/common/BuildingCard';
import { LocationCard } from '../components/common/LocationCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface CategoryPageProps {
  categorySlug?: string;
  onOpenEnquiry: (property?: Property) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug: propSlug, onOpenEnquiry }) => {
  const params = useParams<{ categorySlug: string }>();
  const activeSlug = propSlug || params.categorySlug || 'office-space';

  // Normalize slug
  const normalizedCategory: PropertyCategory = 
    activeSlug === 'shops' ? 'shops-retail' : 
    (activeSlug as PropertyCategory);

  const meta = CATEGORY_METADATA[normalizedCategory] || CATEGORY_METADATA['office-space'];

  const initialProps = StorageService.getInitialPropertiesByCategory(normalizedCategory);
  const initialBlds = StorageService.getInitialBuildings().filter(b => 
    b.category === normalizedCategory || 
    (b.categories && b.categories.includes(normalizedCategory)) || 
    initialProps.some(p => p.building_id === b.id)
  );
  const initialLocs = StorageService.getInitialLocations().filter(l => 
    l.categories.includes(normalizedCategory) || initialProps.some(p => p.location_id === l.id)
  );

  const [properties, setProperties] = useState<Property[]>(() => initialProps);
  const [buildings, setBuildings] = useState<Building[]>(() => initialBlds);
  const [locations, setLocations] = useState<Location[]>(() => initialLocs);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('All');

  // Progressive loading / show few
  const INITIAL_VISIBLE_COUNT = 6;
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

  const INITIAL_VISIBLE_BUILDINGS = 4;
  const [visibleBuildingsCount, setVisibleBuildingsCount] = useState<number>(INITIAL_VISIBLE_BUILDINGS);

  const INITIAL_VISIBLE_LOCATIONS = 3;
  const [visibleLocationsCount, setVisibleLocationsCount] = useState<number>(INITIAL_VISIBLE_LOCATIONS);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [selectedType, selectedFurnishing]);

  useEffect(() => {
    // Instant synchronous sync to avoid old data flash when navigating between category pages
    const syncProps = StorageService.getInitialPropertiesByCategory(normalizedCategory);
    setProperties(syncProps);
    setBuildings(StorageService.getInitialBuildings().filter(b => 
      b.category === normalizedCategory || 
      (b.categories && b.categories.includes(normalizedCategory)) || 
      syncProps.some(p => p.building_id === b.id)
    ));
    setLocations(StorageService.getInitialLocations().filter(l => 
      l.categories.includes(normalizedCategory) || syncProps.some(p => p.location_id === l.id)
    ));
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setVisibleBuildingsCount(INITIAL_VISIBLE_BUILDINGS);
    setVisibleLocationsCount(INITIAL_VISIBLE_LOCATIONS);

    let isMounted = true;
    Promise.all([
      StorageService.getPropertiesByCategory(normalizedCategory),
      StorageService.getBuildings(),
      StorageService.getLocations(),
    ]).then(([props, blds, locs]) => {
      if (!isMounted) return;
      setProperties(props);
      const matchingBlds = blds.filter(b => 
        b.category === normalizedCategory || 
        (b.categories && b.categories.includes(normalizedCategory)) || 
        props.some(p => p.building_id === b.id)
      );
      setBuildings(matchingBlds);
      const matchingLocs = locs.filter(l => l.categories.includes(normalizedCategory) || props.some(p => p.location_id === l.id));
      setLocations(matchingLocs);
    });
    return () => { isMounted = false; };
  }, [normalizedCategory]);

  const filteredProperties = properties.filter(p => {
    if (selectedType !== 'All' && p.listing_type !== selectedType) return false;
    if (selectedFurnishing !== 'All' && p.furnishing !== selectedFurnishing) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: meta.title }
        ]}
      />

      {/* Category Hero */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-8 sm:p-12 border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xl">
        <img
          src={meta.image}
          alt={meta.title}
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Commercial Asset Class
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Outfit'] tracking-tight">
            {meta.title}
          </h1>
          <div className="overview-text text-base sm:text-lg text-slate-300 leading-relaxed">
            {meta.description}
          </div>

          <div className="pt-2 flex items-center gap-4 text-xs sm:text-sm text-slate-300">
            <span><strong>{properties.length}</strong> Available Spaces</span>
            <span>•</span>
            <span><strong>{buildings.length}</strong> Commercial Towers / Hubs</span>
            <span>•</span>
            <span><strong>{locations.length}</strong> Sectors</span>
          </div>
        </div>
      </div>

      {/* MANDATORY HIERARCHY LAYER 1: LOCATIONS */}
      {locations.length > 0 && (
        <section className="space-y-6" id="locations-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Step 1: Select Your Strategic Sector
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                {meta.title} by Location {visibleLocationsCount < locations.length ? `(${Math.min(visibleLocationsCount, locations.length)} of ${locations.length})` : `(${locations.length})`}
              </h2>
            </div>

            {locations.length > INITIAL_VISIBLE_LOCATIONS && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Showing top {Math.min(visibleLocationsCount, locations.length)} of {locations.length} sectors
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.slice(0, visibleLocationsCount).map((loc) => (
              <LocationCard key={loc.id} location={loc} />
            ))}
          </div>

          {locations.length > visibleLocationsCount && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <button
                onClick={() => setVisibleLocationsCount((prev) => Math.min(prev + 3, locations.length))}
                className="btn-glass-primary px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm"
              >
                <span>Load More Sectors ({locations.length - visibleLocationsCount} more)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVisibleLocationsCount(locations.length)}
                className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              >
                View All Sectors ({locations.length})
              </button>
            </div>
          )}

          {visibleLocationsCount >= locations.length && locations.length > INITIAL_VISIBLE_LOCATIONS && (
            <div className="flex items-center justify-center pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <button
                onClick={() => {
                  setVisibleLocationsCount(INITIAL_VISIBLE_LOCATIONS);
                  document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-2xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Show Fewer (Top {INITIAL_VISIBLE_LOCATIONS})
              </button>
            </div>
          )}
        </section>
      )}

      {/* MANDATORY HIERARCHY LAYER 2: BUILDINGS / PROJECTS */}
      {buildings.length > 0 && (
        <section className="space-y-6" id="commercial-projects-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Step 2: Commercial Buildings & Projects
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                Commercial Projects for {meta.title} {visibleBuildingsCount < buildings.length ? `(${Math.min(visibleBuildingsCount, buildings.length)} of ${buildings.length})` : `(${buildings.length})`}
              </h2>
            </div>

            {buildings.length > INITIAL_VISIBLE_BUILDINGS && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Showing top {Math.min(visibleBuildingsCount, buildings.length)} of {buildings.length} projects
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {buildings.slice(0, visibleBuildingsCount).map((b) => (
              <BuildingCard key={b.id} building={b} />
            ))}
          </div>

          {buildings.length > visibleBuildingsCount && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <button
                onClick={() => setVisibleBuildingsCount((prev) => Math.min(prev + 4, buildings.length))}
                className="btn-glass-primary px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm"
              >
                <span>Load More Projects ({buildings.length - visibleBuildingsCount} more)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVisibleBuildingsCount(buildings.length)}
                className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              >
                View All Projects ({buildings.length})
              </button>
            </div>
          )}

          {visibleBuildingsCount >= buildings.length && buildings.length > INITIAL_VISIBLE_BUILDINGS && (
            <div className="flex items-center justify-center pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <button
                onClick={() => {
                  setVisibleBuildingsCount(INITIAL_VISIBLE_BUILDINGS);
                  document.getElementById('commercial-projects-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-2xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Show Fewer (Top {INITIAL_VISIBLE_BUILDINGS})
              </button>
            </div>
          )}
        </section>
      )}

      {/* MANDATORY HIERARCHY LAYER 3: AVAILABLE PROPERTIES WITH FILTERS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4" id="available-inventory-section">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Step 3: Direct Verified Inventory
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Available {meta.title} {visibleCount < filteredProperties.length ? `(${Math.min(visibleCount, filteredProperties.length)} of ${filteredProperties.length})` : `(${filteredProperties.length})`}
            </h2>
          </div>

          {/* Quick Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              <option value="All">All Types (Rent / Sale / Lease)</option>
              <option value="Rent">Rent Only</option>
              <option value="Sale">Sale / Purchase Only</option>
              <option value="Lease">Corporate Lease Only</option>
            </select>

            <select
              value={selectedFurnishing}
              onChange={(e) => setSelectedFurnishing(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              <option value="All">All Furnishing</option>
              <option value="Furnished">Furnished</option>
              <option value="Plug-and-Play">Plug & Play</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Bare Shell">Bare Shell</option>
            </select>
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="py-16 text-center glass-card rounded-3xl p-8 space-y-3">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No exact matches found for your selected filters in this category.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our advisory desk can source unlisted units matching your exact size and budget parameters.
            </p>
            <Link
              to="/tell-us-requirement"
              className="btn-glass-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold mt-2"
            >
              <span>Submit Custom Requirement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.slice(0, visibleCount).map((prop) => (
                <PropertyCard key={prop.id} property={prop} onEnquire={onOpenEnquiry} />
              ))}
            </div>

            {filteredProperties.length > visibleCount && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 6, filteredProperties.length))}
                  className="btn-glass-primary px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm"
                >
                  <span>Load More Spaces ({filteredProperties.length - visibleCount} more)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setVisibleCount(filteredProperties.length)}
                  className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  View All ({filteredProperties.length})
                </button>
              </div>
            )}

            {visibleCount >= filteredProperties.length && filteredProperties.length > INITIAL_VISIBLE_COUNT && (
              <div className="flex items-center justify-center pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  onClick={() => {
                    setVisibleCount(INITIAL_VISIBLE_COUNT);
                    document.getElementById('available-inventory-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Show Fewer (Top {INITIAL_VISIBLE_COUNT})
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Requirement Callout */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
            Need a Specific Space Configuration?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Let us know your team size, power requirements, or dock specifications. We will match you within 24 hours.
          </p>
        </div>
        <Link
          to="/tell-us-requirement"
          className="btn-glass-primary px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shrink-0"
        >
          Post Your Requirement
        </Link>
      </div>
    </div>
  );
};
