import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, ArrowUpDown, SlidersHorizontal, ArrowRight, Building2, MapPin, ChevronLeft, ChevronRight, PhoneCall, FileText, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Property, Location } from '../types';
import { PropertyCard } from '../components/common/PropertyCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { HyperlinkedText } from '../components/common/HyperlinkedText';
import { updatePageSeo, getOrganizationSchema, getBreadcrumbSchema } from '../utils/seo';
import { RequirementModal } from '../components/modals/RequirementModal';
import { WhatsAppIcon } from '../components/common/SocialIcons';
import { buildWhatsAppUrl } from '../utils/whatsapp';

interface PropertiesPageProps {
  onOpenEnquiry: (property?: Property) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ onOpenEnquiry }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>(() => StorageService.getInitialProperties());
  const [locations, setLocations] = useState<Location[]>(() => StorageService.getInitialLocations());
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showRequirementModal, setShowRequirementModal] = useState(false);

  // Pagination state (Fixed 12 properties per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [locationId, setLocationId] = useState(searchParams.get('location') || '');
  const [listingType, setListingType] = useState(searchParams.get('type') || '');
  const [furnishing, setFurnishing] = useState('');
  const [minArea, setMinArea] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'area-desc'>('default');

  useEffect(() => {
    const canonical = 'https://shristiestate.in/properties';
    const catText = category ? `${category} ` : 'Commercial ';
    const typeText = listingType ? `for ${listingType} ` : 'for Rent & Lease ';
    const title = `${catText}Properties ${typeText}in Noida | Verified Listings`;
    const description = `Explore verified commercial real estate listings in Noida, Greater Noida, and Expressway. Compare ${category || 'office spaces, warehouses, and IT parks'} with prices, floor plans, and amenities.`;

    const cleanup = updatePageSeo({
      title,
      description,
      canonicalUrl: canonical,
      keywords: 'commercial properties noida, office space for rent noida, it park lease, warehouse for rent noida, commercial real estate listings',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', url: 'https://shristiestate.in' },
        { name: 'Properties', url: canonical }
      ],
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
          getOrganizationSchema(),
          {
            '@type': 'CollectionPage',
            '@id': `${canonical}#collection`,
            'url': canonical,
            'name': title,
            'description': description
          },
          getBreadcrumbSchema([
            { name: 'Home', url: 'https://shristiestate.in' },
            { name: 'Properties', url: canonical }
          ])
        ]
      }
    });
    return cleanup;
  }, [category, listingType]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      StorageService.getProperties(),
      StorageService.getLocations(),
    ]).then(([props, locs]) => {
      if (isMounted) {
        setProperties(props);
        setLocations(locs);
      }
    });
    return () => { isMounted = false; };
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
    setCurrentPage(1);
    setSearchParams({});
  };

  // Reset to page 1 whenever any filter or sorting criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, category, locationId, listingType, furnishing, minArea, sortBy]);

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

  // Pagination Logic (10-15 properties per view, default 12)
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = sorted.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Real-Time Commercial Database
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mt-1">
            Commercial Properties for Lease & Sale
          </h1>
          <HyperlinkedText
            as="p"
            inline
            className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1"
            text="Browse verified offices, IT spaces, warehouses, industrial units, and commercial plots across Noida & NCR."
          />
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="lg:hidden px-3.5 py-2 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Filters ({filtered.length} Results)</span>
        </button>
      </div>

      {/* Desktop & Mobile Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Filter Sidebar (3 Cols) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
          <div className="rounded-none p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-900 dark:text-white">
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">
                Keyword / Building / ID
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. I-Thum, SE-6201..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">
                Listing Type
              </label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="w-full px-3 py-2 rounded-none text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              >
                <option value="">All (Rent / Sale / Lease)</option>
                <option value="Rent">Rent</option>
                <option value="Sale">Sale</option>
                <option value="Lease">Lease</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-none text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">
                Sector / Locality
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 rounded-none text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">
                Furnishing
              </label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="w-full px-3 py-2 rounded-none text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">
                Minimum Area (sq.ft)
              </label>
              <select
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="w-full px-3 py-2 rounded-none text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
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
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-1 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              {sorted.length > 0 ? (
                <>
                  Showing <strong className="text-slate-900 dark:text-white">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, sorted.length)}</strong> of <strong className="text-slate-900 dark:text-white">{sorted.length}</strong> matching commercial properties
                </>
              ) : (
                <span>0 matching properties</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-none text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              >
                <option value="default">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="area-desc">Area: Largest First</option>
              </select>
            </div>
          </div>

          {/* NO RESULT EXPERIENCE */}
          {sorted.length === 0 ? (
            <div className="py-16 text-center rounded-none p-8 sm:p-12 space-y-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]">
              <div className="w-12 h-12 rounded-none border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                We couldn't find an exact match.
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Try adjusting your filters, or tell us what property you need. Our team maintains extensive off-market commercial inventory across Sector 62, 63, and Expressway.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-none text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => setShowRequirementModal(true)}
                  className="btn-glass-primary px-6 py-2.5 rounded-none text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Submit Your Requirement</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Paginated Property Grid (10-15 items) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800">
                {paginatedProperties.map((prop, idx) => (
                  <PropertyCard key={prop.id} property={prop} index={idx} onEnquire={onOpenEnquiry} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                    Showing page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-none text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] text-slate-700 dark:text-slate-300 disabled:opacity-35 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors uppercase tracking-wider text-[11px]"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-none text-xs font-semibold border transition-colors ${
                              currentPage === pageNum
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span key={pageNum} className="px-1 text-slate-400 text-xs">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-none text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] text-slate-700 dark:text-slate-300 disabled:opacity-35 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors uppercase tracking-wider text-[11px]"
                      aria-label="Next Page"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Can't Find Your Property? Custom Commercial Sourcing Banner (Sharp 0px Monolith) */}
              <div className="mt-10 relative overflow-hidden rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] p-6 sm:p-8 lg:p-9 shadow-sm">
                {/* Ambient glow accent */}
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 lg:gap-8">
                  {/* Left Column: Context, Heading, Value Propositions */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[11px] font-mono font-semibold uppercase tracking-wider bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/25">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Custom Commercial Sourcing</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-sans text-slate-900 dark:text-white tracking-tight">
                      Can’t Find Your Ideal Commercial Space?
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-2xl">
                      Need a specific floorplate, custom bare-shell or plug-and-play layout, or off-market commercial space in Noida? Submit your requirement and our corporate advisory team will shortlist verified options within 2 hours.
                    </p>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Verified Off-Market Inventory</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Zero Advisory Fee for Tenants</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                        <span>2-Hour Rapid Response</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Clean Sharp 0px Action Buttons */}
                  <div className="flex flex-col sm:flex-row xl:flex-col gap-2.5 w-full xl:w-auto xl:min-w-[320px] shrink-0">
                    <button
                      onClick={() => setShowRequirementModal(true)}
                      className="btn-glass-primary w-full px-6 py-3.5 rounded-none font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <FileText className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                      <span>Submit Your Requirement</span>
                      <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      <a
                        href="tel:+918750098666"
                        className="px-3.5 py-2.5 rounded-none border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                        title="Call Advisory: +91 87500 98666"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        <span>Call Now</span>
                      </a>

                      <a
                        href={buildWhatsAppUrl("Hello Shristi Estate, I couldn't find my desired commercial space on your Available Properties page. Please assist me with customized options.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp px-3.5 py-2.5 rounded-none text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                      >
                        <WhatsAppIcon className="w-4 h-4 text-white" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Requirement Modal */}
      <RequirementModal
        isOpen={showRequirementModal}
        onClose={() => setShowRequirementModal(false)}
        defaultLocation={locationId || ''}
        defaultCategory={category || 'Office Space'}
      />
    </div>
  );
};
