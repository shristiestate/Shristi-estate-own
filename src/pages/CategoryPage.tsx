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

  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('All');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      StorageService.getPropertiesByCategory(normalizedCategory),
      StorageService.getBuildings(),
      StorageService.getLocations(),
    ]).then(([props, blds, locs]) => {
      setProperties(props);
      // Filter buildings that belong to this category or have properties in this category
      const matchingBlds = blds.filter(b => b.category === normalizedCategory || props.some(p => p.building_id === b.id));
      setBuildings(matchingBlds);
      // Filter locations where inventory exists per section 7
      const matchingLocs = locs.filter(l => l.categories.includes(normalizedCategory) || props.some(p => p.location_id === l.id));
      setLocations(matchingLocs);
      setLoading(false);
    });
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
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Step 1: Select Your Strategic Sector
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                {meta.title} by Location
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <LocationCard key={loc.id} location={loc} />
            ))}
          </div>
        </section>
      )}

      {/* MANDATORY HIERARCHY LAYER 2: BUILDINGS / PROJECTS */}
      {buildings.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Step 2: Commercial Buildings & Projects
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                Commercial Projects for {meta.title}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {buildings.map((b) => (
              <BuildingCard key={b.id} building={b} />
            ))}
          </div>
        </section>
      )}

      {/* MANDATORY HIERARCHY LAYER 3: AVAILABLE PROPERTIES WITH FILTERS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Step 3: Direct Verified Inventory
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Available {meta.title} ({filteredProperties.length})
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} onEnquire={onOpenEnquiry} />
            ))}
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
