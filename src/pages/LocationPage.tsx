import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Building2, Layers, CheckCircle2, Shield, ArrowRight, HelpCircle, ChevronDown } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Location, Building, Property } from '../types';
import { BuildingCard } from '../components/common/BuildingCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { HyperlinkedText } from '../components/common/HyperlinkedText';
import { updatePageSeo, getOrganizationSchema, getBreadcrumbSchema } from '../utils/seo';

interface LocationFaq {
  question: string;
  answer: string;
}

const LOCATION_FAQS: Record<string, LocationFaq[]> = {
  'sector-62': [
    {
      question: 'Why is Sector 62 considered the premier IT corridor in Noida?',
      answer: 'Sector 62 features the highest concentration of institutional Grade-A tech parks (I-Thum, Noida One, Corenthum, Stellar IT Park, Candor TechSpace), seamless Blue Line metro connectivity, 100% power backup grids, and extensive residential catchment.'
    },
    {
      question: 'What are typical commercial office rental rates in Sector 62 Noida?',
      answer: 'Office spaces in Sector 62 typically lease between ₹45 and ₹75 per square foot per month depending on furnishing status (bare shell vs fully furnished plug-and-play) and building tier.'
    },
    {
      question: 'How accessible is Sector 62 from Delhi and the metro?',
      answer: 'Sector 62 has its own dedicated Delhi Metro Blue Line station (Noida Electronic City & Sector 62) and sits directly along NH-24 (Delhi-Meerut Expressway), providing direct 15-minute access to East Delhi.'
    }
  ],
  'noida-expressway': [
    {
      question: 'What types of companies lease commercial space along Noida Expressway?',
      answer: 'Noida Expressway is preferred by multinational corporations (MNCs), Fortune 500 tech companies, financial institutions, and global capability centers (GCCs) requiring large single-floor plates between 15,000 and 50,000+ sq. ft.'
    },
    {
      question: 'Which prominent commercial complexes are located on the Expressway?',
      answer: 'Key complexes include Advant Navis Business Park (Sector 142), Candor TechSpace (Sector 135), Oxygen Business Park (Sector 144), and Express Trade Towers (Sector 132).'
    },
    {
      question: 'How does Aqua Line metro serve Noida Expressway?',
      answer: 'The Noida Metro Aqua Line runs parallel to the Expressway with dedicated stations at Sector 137, Sector 142, and Sector 144, linking directly to the Blue Line interchange at Sector 51/52.'
    }
  ],
  'sector-63': [
    {
      question: 'What commercial and industrial options are available in Sector 63 Noida?',
      answer: 'Sector 63 provides a versatile mix of IT/software offices, BPO hubs, light industrial manufacturing sheds, and electronic assembly facilities.'
    },
    {
      question: 'What is the power infrastructure like in Sector 63?',
      answer: 'Sector 63 benefits from heavy industrial dual-feeder electricity connections with sanctioned loads from 50 kVA up to 500+ kVA.'
    }
  ],
  'sector-83': [
    {
      question: 'Why choose Sector 83 for warehousing and logistics operations?',
      answer: 'Sector 83 sits strategically between Noida Expressway and Phase-II industrial clusters, offering wide concrete arterial roads, heavy multi-axle trailer maneuverability, and high-clearance PEB sheds.'
    },
    {
      question: 'What are typical warehousing rental rates in Sector 83 Noida?',
      answer: 'Warehousing space in Sector 83 generally ranges from ₹22 to ₹38 per square foot per month based on ceiling clear height, plinth level, and hydraulic dock configuration.'
    }
  ],
  'sector-85': [
    {
      question: 'What industrial activities are permissible in Sector 85 Noida?',
      answer: 'Sector 85 is designated for heavy manufacturing, plastics and packaging, automotive engineering, electronics, and garment export manufacturing.'
    }
  ],
  'sector-18': [
    {
      question: 'What makes Sector 18 the commercial retail hub of Noida?',
      answer: 'Sector 18 is Noida’s central business district and highest footfall retail zone, home to flagship retail stores, banks, corporate advisory offices, and proximity to Mall of India and Atta Market.'
    }
  ],
  'greater-noida': [
    {
      question: 'What are the commercial growth drivers for Greater Noida & Yamuna Expressway?',
      answer: 'Key commercial drivers include direct connectivity to the upcoming Noida International Airport (Jewar), large contiguous land parcels, dedicated warehousing zones (Ecotech), and the Eastern Peripheral Expressway.'
    }
  ]
};

interface LocationPageProps {
  onOpenEnquiry: (property?: Property) => void;
}

export const LocationPage: React.FC<LocationPageProps> = ({ onOpenEnquiry }) => {
  const { locationSlug } = useParams<{ locationSlug: string }>();
  
  const initialLoc = locationSlug ? StorageService.getInitialLocationBySlug(locationSlug) : null;
  const [location, setLocation] = useState<Location | null>(() => initialLoc);
  const [buildings, setBuildings] = useState<Building[]>(() => 
    initialLoc ? StorageService.getInitialBuildingsByLocation(initialLoc.id) : []
  );
  const [hasResolved, setHasResolved] = useState(() => Boolean(initialLoc));
  
  const INITIAL_VISIBLE_BUILDINGS = 4;
  const [visibleBuildingsCount, setVisibleBuildingsCount] = useState<number>(INITIAL_VISIBLE_BUILDINGS);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!location) return;
    const canonical = `https://shristiestate.in/locations/${location.slug || locationSlug}`;
    const pageTitle = `${location.name}, ${location.city} Commercial Real Estate & Office Space | Shristi Estate`;
    const pageDesc = location.description 
      ? `${location.description.slice(0, 150)}... Browse verified IT parks, towers, and commercial office space in ${location.name}.`
      : `Explore commercial properties, IT parks, and office spaces in ${location.name}, ${location.city}. Verified listings with full power backup and amenities.`;
    const locKey = location.slug || locationSlug || '';
    const locFaqs = LOCATION_FAQS[locKey] || LOCATION_FAQS['sector-62'] || [];

    const cleanup = updatePageSeo({
      title: pageTitle,
      description: pageDesc,
      canonicalUrl: canonical,
      keywords: `office space ${location.name.toLowerCase()}, commercial real estate ${location.name.toLowerCase()}, ${location.name.toLowerCase()} noida, it park ${location.name.toLowerCase()}`,
      ogType: 'website',
      ogImage: location.hero_image || 'https://shristiestate.in/hero-commercial-park.jpg',
      breadcrumbs: [
        { name: 'Home', url: 'https://shristiestate.in' },
        { name: 'Locations', url: 'https://shristiestate.in/locations' },
        { name: location.name, url: canonical }
      ],
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
          getOrganizationSchema(),
          {
            '@type': 'Place',
            '@id': `${canonical}#place`,
            'url': canonical,
            'name': `${location.name}, ${location.city}`,
            'description': pageDesc,
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': location.name,
              'addressRegion': 'Uttar Pradesh',
              'addressCountry': 'IN'
            }
          },
          ...(locFaqs.length > 0 ? [{
            '@type': 'FAQPage',
            '@id': `${canonical}#faq`,
            'mainEntity': locFaqs.map((faq) => ({
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
            { name: 'Locations', url: 'https://shristiestate.in/locations' },
            { name: location.name, url: canonical }
          ])
        ]
      }
    });
    return cleanup;
  }, [location, locationSlug]);

  useEffect(() => {
    if (!locationSlug) return;
    let isMounted = true;
    
    // Instant synchronous hydration if available
    const syncLoc = StorageService.getInitialLocationBySlug(locationSlug);
    if (syncLoc) {
      setLocation(syncLoc);
      setBuildings(StorageService.getInitialBuildingsByLocation(syncLoc.id));
      setHasResolved(true);
      if (locationSlug !== syncLoc.slug && typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/locations/${syncLoc.slug}`);
      }
    }

    StorageService.getLocationBySlug(locationSlug).then(async (loc) => {
      if (!isMounted) return;
      if (loc) {
        setLocation(loc);
        const blds = await StorageService.getBuildingsByLocation(loc.id);
        if (isMounted) {
          setBuildings(blds);
        }
        if (locationSlug !== loc.slug && typeof window !== 'undefined') {
          window.history.replaceState(null, '', `/locations/${loc.slug}`);
        }
      }
      if (isMounted) setHasResolved(true);
    }).catch(() => {
      if (isMounted) setHasResolved(true);
    });

    return () => { isMounted = false; };
  }, [locationSlug]);

  useEffect(() => {
    setVisibleBuildingsCount(INITIAL_VISIBLE_BUILDINGS);
  }, [locationSlug]);

  if (!location && hasResolved) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Location Not Found</h2>
        <p className="text-sm text-slate-500">We couldn't locate this commercial sector.</p>
        <Link to="/locations" className="btn-glass-primary inline-block px-5 py-2.5 rounded-xl text-sm font-semibold">
          Browse All Locations
        </Link>
      </div>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Locations', path: '/locations' },
          { label: location.name }
        ]}
      />

      {/* Location Hero */}
      <div className="relative rounded-none overflow-hidden p-6 sm:p-10 border border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
        <img
          src={location.hero_image}
          alt={location.name}
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] sm:text-[11px] font-mono uppercase tracking-widest bg-brand-500/20 text-brand-300 border border-brand-500/30">
            <MapPin className="w-3 h-3" />
            {location.city}, {location.region}
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white">
            Commercial Property in {location.name}
          </h1>
          <HyperlinkedText
            text={location.description}
            className="overview-text text-xs sm:text-sm text-slate-300 leading-relaxed font-sans"
          />

          <div className="pt-1 flex items-center gap-3 text-xs text-slate-300">
            <span><strong>{buildings.length}</strong> Commercial Towers / Projects</span>
            {location.building_count && (
              <>
                <span>•</span>
                <span><strong>Prime Sector Corridor</strong></span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MANDATORY HIERARCHY: BUILDINGS IN THIS LOCATION (SECTION 8 & 29) */}
      <section className="space-y-6" id="location-buildings-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Commercial Infrastructure
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight mt-0.5">
              Buildings & Projects in {location.name} {visibleBuildingsCount < buildings.length ? `(${Math.min(visibleBuildingsCount, buildings.length)} of ${buildings.length})` : `(${buildings.length})`}
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

        {buildings.length === 0 ? (
          <div className="rounded-none p-6 text-center text-xs text-slate-500 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]">
            No independent multi-story buildings registered yet in this sector.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-slate-200 dark:border-slate-800">
              {buildings.slice(0, visibleBuildingsCount).map((b) => (
                <BuildingCard key={b.id} building={b} />
              ))}
            </div>

            {buildings.length > visibleBuildingsCount && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  onClick={() => setVisibleBuildingsCount((prev) => Math.min(prev + 4, buildings.length))}
                  className="btn-glass-primary px-5 py-2.5 rounded-none text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                >
                  <span>Load More Projects ({buildings.length - visibleBuildingsCount} more)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setVisibleBuildingsCount(buildings.length)}
                  className="px-5 py-2.5 rounded-none text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors uppercase tracking-wider"
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
                    document.getElementById('location-buildings-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-none text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors uppercase tracking-wider"
                >
                  Show Fewer (Top {INITIAL_VISIBLE_BUILDINGS})
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* LOCATION OVERVIEW & WHY INVEST/LEASE HERE */}
      <section className="rounded-none p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Commercial Advantages of {location.name}
          </h2>
          <div className="overview-text text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-sans">
            {location.name} stands as one of the most prominent commercial micro-markets within {location.city}. Benefiting from comprehensive arterial road networks, reliable industrial power grids, and close proximity to public rapid transit hubs.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Metro & Arterial Connectivity
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Direct access to metro stations, signal-free expressway stretches, and quick connectivity to New Delhi.
            </p>
          </div>

          <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Talent Pool Access
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              High density of IT engineering, corporate management, and skilled workforce residing within a 15-minute commute radius.
            </p>
          </div>

          <div className="p-4 rounded-none bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Commercial Infrastructure
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Equipped with Grade-A building management systems, multi-tier car parking, and round-the-clock security infrastructure.
            </p>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-sans">
            Looking for an off-market or custom office footprint in {location.name}?
          </div>
          <button
            onClick={() => onOpenEnquiry()}
            className="btn-glass-primary px-4 py-2 rounded-none text-xs font-semibold uppercase tracking-wider"
          >
            Enquire for {location.name}
          </button>
        </div>
      </section>

      {/* Localized Micro-Market FAQs */}
      {LOCATION_FAQS[location.slug || locationSlug || ''] && LOCATION_FAQS[location.slug || locationSlug || ''].length > 0 && (
        <section className="rounded-none p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-none bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
              <HelpCircle className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                Frequently Asked Questions ({location.name})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Local commercial leasing insights, metro transit, and micro-market rental parameters.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
            {LOCATION_FAQS[location.slug || locationSlug || ''].map((faq, idx) => {
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
    </div>
  );
};
