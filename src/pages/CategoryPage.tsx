import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Search, Filter, ArrowRight, Shield, CheckCircle2, ChevronDown, HelpCircle } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Property, Building, Location, PropertyCategory } from '../types';
import { CATEGORY_METADATA } from '../data/mockData';
import { PropertyCard } from '../components/common/PropertyCard';
import { BuildingCard } from '../components/common/BuildingCard';
import { LocationCard } from '../components/common/LocationCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { HyperlinkedText } from '../components/common/HyperlinkedText';
import { updatePageSeo, getOrganizationSchema, getBreadcrumbSchema } from '../utils/seo';

interface CategoryFaq {
  question: string;
  answer: string;
}

const CATEGORY_FAQS: Record<string, CategoryFaq[]> = {
  'office-space': [
    {
      question: 'What is the typical lease lock-in period for corporate office space in Noida?',
      answer: 'Standard commercial office leases in Noida typically feature a 3 to 9-year tenure with an initial 3-year lock-in period. Standard rental escalations are generally structured at 15% every 3 years or 5% annually.'
    },
    {
      question: 'What is included in plug-and-play furnished office spaces?',
      answer: 'Plug-and-play furnished offices include pre-wired ergonomic modular workstations, executive cabins, conference and meeting rooms with AV provisions, dedicated reception lobbies, cafeteria facilities, server rooms, and 100% DG power backup.'
    },
    {
      question: 'How are Common Area Maintenance (CAM) charges calculated?',
      answer: 'CAM charges in Grade-A Noida IT & business parks typically range between ₹14 and ₹22 per sq. ft. per month. These charges cover dual-source power backup diesel generation, centralized HVAC chiller operations, 24/7 security, elevator maintenance, and common facility operations.'
    },
    {
      question: 'What security deposit is required for commercial leasing in Noida?',
      answer: 'Landlords across Noida and Delhi NCR generally require an interest-free refundable security deposit equivalent to 3 to 6 months of the agreed monthly gross rental.'
    }
  ],
  'it-business-parks': [
    {
      question: 'Which prominent IT & business parks are located in Noida?',
      answer: 'Key Grade-A IT campuses include Advant Navis Business Park (Expressway), Candor TechSpace (Sector 62 & Sector 135), Max Towers (Sector 16B), Oxygen Business Park (Sector 144), Corenthum, and Stellar IT Park (Sector 62).'
    },
    {
      question: 'What facilities are standard in institutional IT campuses in Noida?',
      answer: 'Institutional campuses offer multi-tier security access controls, high-speed automated elevators, captive food courts, banks/ATMs, multi-level car parking, LEED/IGBC green certifications, and uninterrupted dual-grid power backup.'
    },
    {
      question: 'What floor plate sizes are available in Noida tech parks?',
      answer: 'Floor plates range from flexible 2,500 sq. ft. units up to expansive contiguous floor plates of 30,000 to 60,000+ sq. ft. designed for large technology corporations and global capability centers (GCCs).'
    }
  ],
  'warehouses': [
    {
      question: 'What ceiling clear heights are available in Sector 83 and Greater Noida warehouses?',
      answer: 'Modern Pre-Engineered Building (PEB) logistics warehouses offer clear heights between 28 feet and 42 feet, allowing high-density vertical pallet racking and multi-tier mezzanine configurations.'
    },
    {
      question: 'Are warehouses in Noida equipped for heavy container trailers?',
      answer: 'Yes, logistics facilities in Sector 83, Ecotech, and Yamuna Expressway are engineered with 40-to-60 foot internal concrete apron roads, hydraulic dock levelers, and generous turning radiuses for 40-foot multi-axle trailers.'
    },
    {
      question: 'What fire safety and compliance approvals are provided?',
      answer: 'Approved warehouses hold certified Fire NOCs, automated ceiling sprinkler systems, high-pressure fire hydrants, underground water storage tanks, and smoke heat extraction vents.'
    }
  ],
  'factory-industrial': [
    {
      question: 'What sanctioned industrial power load is available for factories in Noida?',
      answer: 'Industrial sheds in Sector 63, Sector 85, and Phase-II support dedicated high-tension (HT) sanctioned power loads ranging from 100 kVA up to 1,500+ kVA from the Uttar Pradesh state electricity board.'
    },
    {
      question: 'Which industries are permissible under Noida industrial sector zoning?',
      answer: 'Light engineering, electronics manufacturing, pharmaceuticals, packaging, export apparel manufacturing, auto components, and software labs are permitted under Noida Master Plan guidelines.'
    }
  ],
  'shops-retail': [
    {
      question: 'Which sectors in Noida command the highest retail footfall?',
      answer: 'Sector 18 is Noida’s premier central retail hub, accompanied by high-street retail developments along Noida Expressway (Sector 132/142) and institutional retail plazas in Sector 62.'
    },
    {
      question: 'What lease formats are common for retail shops in Noida?',
      answer: 'Retail units are leased under either a fixed monthly rental format or a hybrid revenue-share model (typically 7% to 15% of gross turnover plus a minimum guarantee).'
    }
  ],
  'land': [
    {
      question: 'What commercial land plot sizes are available in Noida & Greater Noida?',
      answer: 'Plots range from 500 sq. meters for boutique corporate headquarters to 5+ acres for institutional tech campuses and logistics parks along the Noida-Greater Noida and Yamuna Expressways.'
    },
    {
      question: 'What is the Floor Area Ratio (FAR) for commercial plots in Noida?',
      answer: 'Commercial FAR typically ranges from 1.5 to 3.0, with additional purchasable FAR permitted by the Noida Authority depending on arterial road width and sector master plans.'
    }
  ]
};

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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const canonical = `https://shristiestate.in/${activeSlug}`;
    const pageTitle = `${meta.title} in Noida & Delhi NCR | Verified Listings | Shristi Estate`;
    const pageDesc = `${meta.description} Browse top commercial listings, buildings, and micro-markets with verified pricing and floor plans.`;
    const categoryFaqs = CATEGORY_FAQS[normalizedCategory] || CATEGORY_FAQS['office-space'] || [];

    const cleanup = updatePageSeo({
      title: pageTitle,
      description: pageDesc,
      canonicalUrl: canonical,
      keywords: `${meta.title.toLowerCase()} noida, ${meta.title.toLowerCase()} for rent, ${activeSlug} noida expressway, commercial properties noida`,
      ogType: 'website',
      ogImage: meta.image,
      breadcrumbs: [
        { name: 'Home', url: 'https://shristiestate.in' },
        { name: meta.title, url: canonical }
      ],
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
          getOrganizationSchema(),
          {
            '@type': 'CollectionPage',
            '@id': `${canonical}#collection`,
            'url': canonical,
            'name': pageTitle,
            'description': pageDesc,
            'image': meta.image
          },
          ...(categoryFaqs.length > 0 ? [{
            '@type': 'FAQPage',
            '@id': `${canonical}#faq`,
            'mainEntity': categoryFaqs.map((faq) => ({
              '@type': 'Question',
              'name': faq.question,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
              }
            }))
          }] : []),
          getBreadcrumbSchema([
            { name: 'Home', url: 'https://shristiestate.in' },
            { name: meta.title, url: canonical }
          ])
        ]
      }
    });
    return cleanup;
  }, [activeSlug, normalizedCategory, meta]);

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
      <div className="relative rounded-none overflow-hidden p-6 sm:p-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white">
        <img
          src={meta.image}
          alt={meta.title}
          className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-[#0B132B] dark:via-[#0B132B]/90 pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-block px-3 py-1 rounded-none text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            Commercial Asset Class
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
            {meta.title}
          </h1>
          <div className="overview-text text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            <HyperlinkedText text={meta.description} inline />
          </div>

          <div className="pt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
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
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                Step 1: Select Your Strategic Sector
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mt-1">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800">
            {locations.slice(0, visibleLocationsCount).map((loc, idx) => (
              <LocationCard key={loc.id} location={loc} index={idx} />
            ))}
          </div>

          {locations.length > visibleLocationsCount && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setVisibleLocationsCount((prev) => Math.min(prev + 3, locations.length))}
                className="btn-glass-primary px-6 py-3 rounded-none text-xs sm:text-sm font-semibold flex items-center gap-2 uppercase tracking-wider"
              >
                <span>Load More Sectors ({locations.length - visibleLocationsCount} more)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVisibleLocationsCount(locations.length)}
                className="px-5 py-3 rounded-none text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors uppercase tracking-wider"
              >
                View All Sectors ({locations.length})
              </button>
            </div>
          )}

          {visibleLocationsCount >= locations.length && locations.length > INITIAL_VISIBLE_LOCATIONS && (
            <div className="flex items-center justify-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setVisibleLocationsCount(INITIAL_VISIBLE_LOCATIONS);
                  document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-none text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors uppercase tracking-wider"
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
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                Step 2: Commercial Buildings & Projects
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mt-1">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800">
            {buildings.slice(0, visibleBuildingsCount).map((b, idx) => (
              <BuildingCard key={b.id} building={b} index={idx} />
            ))}
          </div>

          {buildings.length > visibleBuildingsCount && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setVisibleBuildingsCount((prev) => Math.min(prev + 3, buildings.length))}
                className="btn-glass-primary px-6 py-3 rounded-none text-xs sm:text-sm font-semibold flex items-center gap-2 uppercase tracking-wider"
              >
                <span>Load More Projects ({buildings.length - visibleBuildingsCount} more)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVisibleBuildingsCount(buildings.length)}
                className="px-5 py-3 rounded-none text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors uppercase tracking-wider"
              >
                View All Projects ({buildings.length})
              </button>
            </div>
          )}

          {visibleBuildingsCount >= buildings.length && buildings.length > INITIAL_VISIBLE_BUILDINGS && (
            <div className="flex items-center justify-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setVisibleBuildingsCount(INITIAL_VISIBLE_BUILDINGS);
                  document.getElementById('commercial-projects-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-none text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors uppercase tracking-wider"
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
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
              Step 3: Direct Verified Inventory
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mt-1">
              Available {meta.title} {visibleCount < filteredProperties.length ? `(${Math.min(visibleCount, filteredProperties.length)} of ${filteredProperties.length})` : `(${filteredProperties.length})`}
            </h2>
          </div>

          {/* Quick Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 rounded-none text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Types (Rent / Sale / Lease)</option>
              <option value="Rent">Rent Only</option>
              <option value="Sale">Sale / Purchase Only</option>
              <option value="Lease">Corporate Lease Only</option>
            </select>

            <select
              value={selectedFurnishing}
              onChange={(e) => setSelectedFurnishing(e.target.value)}
              className="px-3 py-1.5 rounded-none text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
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
          <div className="py-16 text-center rounded-none p-8 sm:p-12 space-y-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]">
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              No exact matches found for your selected filters in this category.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Our advisory desk can source unlisted units matching your exact size and budget parameters.
            </p>
            <Link
              to="/tell-us-requirement"
              className="btn-glass-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-none text-xs font-semibold mt-2 uppercase tracking-wider"
            >
              <span>Submit Custom Requirement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800">
              {filteredProperties.slice(0, visibleCount).map((prop, idx) => (
                <PropertyCard key={prop.id} property={prop} index={idx} onEnquire={onOpenEnquiry} />
              ))}
            </div>

            {filteredProperties.length > visibleCount && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 6, filteredProperties.length))}
                  className="btn-glass-primary px-6 py-3 rounded-none text-xs sm:text-sm font-semibold flex items-center gap-2 uppercase tracking-wider"
                >
                  <span>Load More Spaces ({filteredProperties.length - visibleCount} more)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setVisibleCount(filteredProperties.length)}
                  className="px-5 py-3 rounded-none text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors uppercase tracking-wider"
                >
                  View All ({filteredProperties.length})
                </button>
              </div>
            )}

            {visibleCount >= filteredProperties.length && filteredProperties.length > INITIAL_VISIBLE_COUNT && (
              <div className="flex items-center justify-center pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setVisibleCount(INITIAL_VISIBLE_COUNT);
                    document.getElementById('available-inventory-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-none text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors uppercase tracking-wider"
                >
                  Show Fewer (Top {INITIAL_VISIBLE_COUNT})
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Commercial Knowledge & FAQs Section */}
      {CATEGORY_FAQS[normalizedCategory] && CATEGORY_FAQS[normalizedCategory].length > 0 && (
        <section className="rounded-none p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-none bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
              <HelpCircle className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                Frequently Asked Questions ({meta.title})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Essential leasing guidelines, lock-in terms, and commercial tenant advisories in Noida &amp; Delhi NCR.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
            {CATEGORY_FAQS[normalizedCategory].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-3.5 sm:py-4">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left flex items-center justify-between gap-4 group"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans pr-6">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Requirement Callout */}
      <div className="rounded-none p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Need a Specific Space Configuration?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Let us know your team size, power requirements, or dock specifications. We will match you within 24 hours.
          </p>
        </div>
        <Link
          to="/tell-us-requirement"
          className="btn-glass-primary px-5 py-2.5 rounded-none font-semibold text-xs sm:text-sm shrink-0 uppercase tracking-wider"
        >
          Post Your Requirement
        </Link>
      </div>
    </div>
  );
};
