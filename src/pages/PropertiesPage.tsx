import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, ArrowUpDown, SlidersHorizontal, ArrowRight, Building2, MapPin } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Property, Location } from '../types';
import { PropertyCard } from '../components/common/PropertyCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface PropertiesPageProps {
  onOpenEnquiry: (property?: Property) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ onOpenEnquiry }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [locationId, setLocationId] = useState(searchParams.get('location') || '');
  const [listingType, setListingType] = useState(searchParams.get('type') || '');
  const [furnishing, setFurnishing] = useState('');
  const [minArea, setMinArea] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'area-desc'>('default');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      StorageService.getProperties(),
      StorageService.getLocations(),
    ]).then(([props, locs]) => {
      setProperties(props);
      setLocations(locs);
      setLoading(false);
    });
  }, []);

  // Sync params if URL changes
  useEffect(() => {
    if (searchParams.get('category')) setCategory(searchParams.get('category') || '');
    if (searchParams.get('location')) setLocationId(searchParams.get('location') || '');
    if (searchParams.get('type')) setListingType(searchParams.get('type') || '');
  }, [searchParams]);

  const resetFilters = () => {
    setSearchTerm('');
    setCategory('');
    setLocationId('');
    setListingType('');
    setFurnishing('');
    setMinArea('');
    setSortBy('default');
    setSearchParams({});
  };

  // Filtering Logic
  const filtered = properties.filter((p) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = 
        p.title.toLowerCase().includes(q) ||
        p.reference_number.toLowerCase().includes(q) ||
        p.location_name.toLowerCase().includes(q) ||
        (p.building_name && p.building_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (category && p.category !== category) return false;
    if (locationId && p.location_id !== locationId) return false;
    if (listingType && p.listing_type !== listingType) return false;
    if (furnishing && p.furnishing !== furnishing) return false;
    if (minArea && p.built_up_area < Number(minArea)) return false;
    return true;
  });

  // Sorting Logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'area-desc') return b.built_up_area - a.built_up_area;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Properties', path: '/properties' },
          { label: 'Available Inventory' }
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Real-Time Commercial Database
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
            Commercial Properties for Lease & Sale
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Browse verified offices, IT spaces, warehouses, industrial units, and commercial plots across Noida & NCR.
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="lg:hidden btn-glass-primary px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters ({filtered.length} Results)</span>
        </button>
      </div>

      {/* Desktop & Mobile Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Filter Sidebar (3 Cols) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-['Outfit']">
                Filter Search
              </span>
              <button
                onClick={resetFilters}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Keyword / Building / ID
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. I-Thum, SE-6201..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full pl-9 pr-3 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Listing Type
              </label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium"
              >
                <option value="">All (Rent / Sale / Lease)</option>
                <option value="Rent">Rent</option>
                <option value="Sale">Sale</option>
                <option value="Lease">Lease</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium"
              >
                <option value="">All Categories</option>
                <option value="office-space">Office Spaces</option>
                <option value="it-business-parks">IT & Business Parks</option>
                <option value="warehouses">Warehouses</option>
                <option value="factory-industrial">Factory & Industrial</option>
                <option value="land">Commercial Land</option>
                <option value="shops-retail">Shops & Retail</option>
              </select>
            </div>

            {/* Sector / Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Sector / Locality
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Furnishing */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Furnishing
              </label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium"
              >
                <option value="">Any Furnishing</option>
                <option value="Furnished">Furnished</option>
                <option value="Plug-and-Play">Plug-and-Play</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Bare Shell">Bare Shell</option>
              </select>
            </div>

            {/* Minimum Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Minimum Area (sq.ft)
              </label>
              <select
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium"
              >
                <option value="">Any Size</option>
                <option value="1000">1,000+ sq.ft</option>
                <option value="2000">2,000+ sq.ft</option>
                <option value="5000">5,000+ sq.ft</option>
                <option value="10000">10,000+ sq.ft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Area (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <div>
              Showing <strong>{sorted.length}</strong> matching commercial properties
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="glass-input px-2.5 py-1.5 rounded-xl text-xs font-semibold"
              >
                <option value="default">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="area-desc">Area: Largest First</option>
              </select>
            </div>
          </div>

          {/* NO RESULT EXPERIENCE (SECTION 51) */}
          {sorted.length === 0 ? (
            <div className="py-16 text-center glass-card rounded-3xl p-8 sm:p-12 space-y-4 border border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                We couldn't find an exact match.
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Try adjusting your filters, or tell us what property you need. Our team maintains extensive off-market commercial inventory across Sector 62, 63, and Expressway.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear All Filters
                </button>
                <Link
                  to="/tell-us-requirement"
                  className="btn-glass-primary px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Tell Us What Property You Need</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((prop) => (
                <PropertyCard key={prop.id} property={prop} onEnquire={onOpenEnquiry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
