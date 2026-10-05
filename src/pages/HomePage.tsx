import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  MapPin, 
  ArrowRight, 
  Shield, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Layers, 
  MessageSquare, 
  PhoneCall, 
  Cpu, 
  Warehouse, 
  Factory, 
  Compass, 
  Store,
  CalendarCheck
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Property, Building, Location } from '../types';
import { PropertyCard } from '../components/common/PropertyCard';
import { BuildingCard } from '../components/common/BuildingCard';
import { toSafeInternalPath } from '../utils/navigation';
import { LocationCard } from '../components/common/LocationCard';
import { WhatsAppIcon } from '../components/common/SocialIcons';
import { generateGeneralEnquiryWhatsAppLink } from '../utils/whatsapp';
import { InteractiveHeroTexture } from '../components/common/InteractiveHeroTexture';
import { InteractiveCategoryCard } from '../components/home/InteractiveCategoryCard';

// Lazy-load non-critical below-the-fold media showcases
const ClientsMarquee = React.lazy(() => import('../components/home/ClientsMarquee').then(m => ({ default: m.ClientsMarquee })));
const InstagramReelsShowcase = React.lazy(() => import('../components/home/InstagramReelsShowcase').then(m => ({ default: m.InstagramReelsShowcase })));

interface HomePageProps {
  onOpenEnquiry: (property?: Property) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenEnquiry }) => {
  const [properties, setProperties] = useState<Property[]>(() => StorageService.getInitialProperties());
  const [buildings, setBuildings] = useState<Building[]>(() => StorageService.getInitialBuildings());
  const [locations, setLocations] = useState<Location[]>(() => StorageService.getInitialLocations());
  const navigate = useNavigate();

  // Search filter state
  const [searchTab, setSearchTab] = useState<'Rent' | 'Sale' | 'Lease'>('Rent');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const fetchFreshData = () => {
      StorageService.getHomepageBundle().then((bundle) => {
        if (!isMounted) return;
        if (bundle.properties && bundle.properties.length > 0) setProperties(bundle.properties);
        if (bundle.buildings && bundle.buildings.length > 0) setBuildings(bundle.buildings);
        if (bundle.locations && bundle.locations.length > 0) setLocations(bundle.locations);
      }).catch((err) => {
        console.warn('getHomepageBundle error fallback:', err);
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(fetchFreshData, { timeout: 2000 });
      return () => {
        isMounted = false;
        (window as any).cancelIdleCallback(handle);
      };
    } else {
      const timer = setTimeout(fetchFreshData, 50);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('type', searchTab);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedBuilding) params.set('building', selectedBuilding);
    navigate(toSafeInternalPath(`/properties?${params.toString()}`));
  };

  const featuredProperties = properties.filter(p => p.featured).slice(0, 6);
  const featuredBuildings = buildings.slice(0, 6);
  const primeLocations = locations.filter(l => l.featured).slice(0, 6);

  const categories = [
    {
      id: 'office-space',
      title: 'Office Spaces',
      desc: 'Corporate offices, furnished suites, and bare shell spaces for rent, lease and sale.',
      icon: Building2,
      path: '/office-space',
      badge: 'Rent / Sale / Lease',
      image: '/images/categories/office-spaces.jpg'
    },
    {
      id: 'it-business-parks',
      title: 'IT & Business Parks',
      desc: 'Grade-A corporate campuses, technology hubs, and high-spec corporate towers.',
      icon: Cpu,
      path: '/it-business-parks',
      badge: 'Grade-A Campuses',
      image: '/images/categories/it-business-parks.jpg'
    },
    {
      id: 'warehouses',
      title: 'Warehouses & Logistics',
      desc: 'High-clearance storage, 3PL logistics facilities, and distribution hubs.',
      icon: Warehouse,
      path: '/warehouses',
      badge: 'Supply Chain Ready',
      image: '/images/categories/warehouses.jpg'
    },
    {
      id: 'factory-industrial',
      title: 'Factory & Industrial',
      desc: 'Industrial manufacturing units, factory sheds, and heavy-power plots.',
      icon: Factory,
      path: '/factory-industrial',
      badge: 'Heavy Power Load',
      image: '/images/categories/factory-industrial.jpg'
    },
    {
      id: 'land',
      title: 'Commercial Land',
      desc: 'Clear-title commercial and industrial plots for institutional development.',
      icon: Compass,
      path: '/land',
      badge: 'Freehold / Leasehold',
      image: '/images/categories/commercial-land.jpg'
    },
    {
      id: 'shops-retail',
      title: 'Shops & Retail',
      desc: 'High-street retail shops, prime showrooms, and commercial market spaces.',
      icon: Store,
      path: '/shops',
      badge: 'Prime Footfall',
      image: '/images/categories/shops-retail.jpg'
    },
  ];

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* 1. HERO SECTION WITH EDITORIAL ARCHITECTURAL STYLING */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* INTERACTIVE CURSOR-REACTIVE 3D COMMERCIAL PARK TEXTURE UNDER H1 */}
        <InteractiveHeroTexture />

        {/* Soft Ambient Background Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-600/10 to-accent-teal/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto">
          {/* Main Hero Text Block - Editorial Layout */}
          <div className="max-w-3xl text-left space-y-4 sm:space-y-5">
            {/* Eyebrow badge (Sharp 0px, 1px border) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono uppercase tracking-widest shadow-xs">
              <Shield className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 stroke-[1.5]" />
              <span>Dedicated Commercial Advisory • Noida & Delhi NCR</span>
            </div>

            {/* Master Headline (H1 - Strong Structured Geometric Sans) */}
            <h1 className="text-[clamp(2.15rem,1.35rem+3.2vw,3.85rem)] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Find the Right <br className="hidden sm:inline" />
              Commercial Property
            </h1>

            {/* Sub-headline directly under H1 */}
            <p className="text-base sm:text-lg lg:text-xl font-normal text-slate-600 dark:text-slate-300 tracking-normal">
              with <span className="font-semibold text-slate-900 dark:text-white">Shristi Estate</span> • Commercial Real Estate Solutions
            </p>

            {/* Description paragraph */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-sans max-w-2xl">
              Explore verified office spaces, IT & business parks, warehouses, factory and industrial properties, commercial land, shops and prime corporate leasing opportunities across Noida and Delhi NCR.
            </p>

            {/* Action Row - Architectural Sharp Buttons (0px corners, 1px borders) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#search-panel"
                className="btn-glass-primary rounded-none px-6 py-3 font-semibold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Explore Properties</span>
              </a>

              <Link
                to="/list-your-property"
                className="rounded-none px-6 py-3 font-semibold text-xs uppercase tracking-wider bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-[#0E1838] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 transition-all"
              >
                List Your Property
              </Link>

              <a
                href={generateGeneralEnquiryWhatsAppLink({ propertyName: 'Commercial Space in Noida / NCR' })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp rounded-none px-6 py-3 font-semibold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>

          {/* SLIM PREMIUM GLASS SEARCH PANEL */}
          {/* ARCHITECTURAL MONOLITHIC SEARCH PANEL (Corners: 0px, 1px subtle border) */}
          <div id="search-panel" className="pt-6 sm:pt-8 max-w-4xl">
            <div className="rounded-none p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B132B]/95 shadow-sm">
              {/* Architectural Tab Controls (Sharp 0px) */}
              <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
                {(['Rent', 'Lease', 'Sale'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSearchTab(tab)}
                    className={`px-4 py-1.5 rounded-none text-xs font-mono uppercase tracking-wider transition-all border ${
                      searchTab === tab
                        ? 'bg-brand-600 text-white border-brand-600 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#0E1838]'
                    }`}
                  >
                    {tab === 'Sale' ? 'Purchase' : tab}
                  </button>
                ))}
              </div>

              {/* Architectural Search Form Fields */}
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-left">
                {/* Category Select */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Property Category
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="editorial-input w-full h-[40px] px-3 py-1.5 rounded-none text-xs font-medium text-slate-800 dark:text-slate-100 cursor-pointer appearance-none pr-8 bg-white dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800 focus:border-brand-500"
                    >
                      <option value="">All Categories</option>
                      <option value="office-space">Office Spaces</option>
                      <option value="it-business-parks">IT & Business Parks</option>
                      <option value="warehouses">Warehouses</option>
                      <option value="factory-industrial">Factory & Industrial</option>
                      <option value="land">Commercial Land</option>
                      <option value="shops-retail">Shops & Retail</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Location Select */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Location / Sector
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLocation}
                      onChange={(e) => {
                        setSelectedLocation(e.target.value);
                        setSelectedBuilding('');
                      }}
                      className="editorial-input w-full h-[40px] px-3 py-1.5 rounded-none text-xs font-medium text-slate-800 dark:text-slate-100 cursor-pointer appearance-none pr-8 bg-white dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800 focus:border-brand-500"
                    >
                      <option value="">All Locations</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Building Select */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Building / Project
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBuilding}
                      onChange={(e) => setSelectedBuilding(e.target.value)}
                      className="editorial-input w-full h-[40px] px-3 py-1.5 rounded-none text-xs font-medium text-slate-800 dark:text-slate-100 cursor-pointer appearance-none pr-8 bg-white dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800 focus:border-brand-500"
                    >
                      <option value="">All Buildings</option>
                      {buildings
                        .filter((b) => !selectedLocation || b.location_id === selectedLocation || (b.locations && b.locations.includes(selectedLocation)))
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.location_name.split(',')[0]})
                          </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Submit Button (Sharp 0px) */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="btn-glass-primary w-full h-[40px] px-4 rounded-none font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* AUTO-ANIMATED CLIENTS & OCCUPIERS MARQUEE */}
      <React.Suspense fallback={<div className="h-16" />}>
        <ClientsMarquee />
      </React.Suspense>

      {/* 2. HIERARCHICAL DISCOVERY PATH EXPLAINER (Architectural Monolith) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-none p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Structured Discovery Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mt-1">
              How You Discover Commercial Real Estate
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 font-sans">
              Unlike generic portals, Shristi Estate organizes every property by its exact commercial building and sector, ensuring 100% genuine inventory.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border-t border-l border-slate-200 dark:border-slate-800 [&>*]:border-r [&>*]:border-b [&>*]:border-slate-200 dark:[&>*]:border-slate-800 text-center">
            <div className="p-5 rounded-none bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center">
              <span className="font-mono text-xs text-brand-600/70 dark:text-brand-400/70 font-semibold mb-2">01</span>
              <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Category</span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-sans">Office, IT, Sheds</span>
            </div>

            <div className="p-5 rounded-none bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center">
              <span className="font-mono text-xs text-brand-600/70 dark:text-brand-400/70 font-semibold mb-2">02</span>
              <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Location</span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-sans">Sector 62, 63, Expy</span>
            </div>

            <div className="p-5 rounded-none bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center">
              <span className="font-mono text-xs text-brand-600/70 dark:text-brand-400/70 font-semibold mb-2">03</span>
              <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Building</span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-sans">I-Thum, Noida One</span>
            </div>

            <div className="p-5 rounded-none bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center">
              <span className="font-mono text-xs text-brand-600/70 dark:text-brand-400/70 font-semibold mb-2">04</span>
              <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Available Units</span>
              <span className="text-[11px] text-slate-500 mt-0.5 font-sans">750 to 15,000 sq.ft</span>
            </div>

            <div className="col-span-2 md:col-span-1 p-5 rounded-none bg-brand-600 text-white flex flex-col items-center">
              <span className="font-mono text-xs text-brand-100 font-semibold mb-2">05</span>
              <span className="text-sm sm:text-base font-semibold">Assisted Deal</span>
              <span className="text-[11px] text-brand-100 mt-0.5 font-sans">Onsite Execution</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROPERTY CATEGORIES GRID (Layout: 3 cards in one row, Gap: 0px, 0px Sharp Corners) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Commercial Portfolio
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-white mt-1">
              Commercial Property Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-sans">
              Select your specific asset class to explore buildings and available spaces.
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 group hover:gap-2 transition-all"
          >
            <span>Explore All Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Cards In One Row, Gap 0px, Thin 1px Subtle Border */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800">
          {categories.map((cat, idx) => (
            <InteractiveCategoryCard
              key={cat.id}
              {...cat}
              index={idx}
            />
          ))}
        </div>
      </section>

      {/* 4. PRIME LOCATIONS (Layout: 3 cards in one row, Gap: 0px, 0px Sharp Corners) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Strategic Commercial Corridors
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-white mt-1">
              Commercial Hubs in Noida & NCR
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-sans">
              Direct access to top industrial zones, expressway business belts, and IT clusters.
            </p>
          </div>
          <Link
            to="/locations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white hover:gap-2 transition-all"
          >
            <span>View All Sectors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Cards In One Row, Gap 0px */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800 [&>*]:border-r [&>*]:border-b [&>*]:border-slate-200 dark:[&>*]:border-slate-800">
          {primeLocations.map((loc, idx) => (
            <LocationCard key={loc.id} location={loc} index={idx} />
          ))}
        </div>
      </section>

      {/* 5. COMMERCIAL BUILDINGS SHOWCASE (Layout: 3 cards in one row, Gap: 0px) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400">
              The Building Layer
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-white mt-1">
              Featured Commercial Projects & IT Parks
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-sans">
              Explore inventory directly by building, including floor structures and amenities.
            </p>
          </div>
        </div>

        {/* 3 Cards In One Row, Gap 0px */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800 [&>*]:border-r [&>*]:border-b [&>*]:border-slate-200 dark:[&>*]:border-slate-800">
          {featuredBuildings.map((building, idx) => (
            <BuildingCard key={building.id} building={building} index={idx} />
          ))}
        </div>
      </section>

      {/* 6. FEATURED PROPERTIES GRID (Layout: 3 cards in one row, Gap: 0px) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Verified & Seed Inventory
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-white mt-1">
              Featured Commercial Properties
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-sans">
              Ready-to-move corporate offices, warehouses, and industrial units with immediate possession.
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 hover:gap-2 transition-all"
          >
            <span>View All ({properties.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Cards In One Row, Gap 0px */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800 [&>*]:border-r [&>*]:border-b [&>*]:border-slate-200 dark:[&>*]:border-slate-800">
          {featuredProperties.map((prop, idx) => (
            <PropertyCard key={prop.id} property={prop} index={idx} onEnquire={onOpenEnquiry} />
          ))}
        </div>
      </section>

      {/* AUTO-ANIMATED INSTAGRAM REELS SHOWCASE */}
      <React.Suspense fallback={<div className="h-64" />}>
        <InstagramReelsShowcase />
      </React.Suspense>

      {/* 7. CUSTOM REQUIREMENT BANNER (Architectural Panel, 0px Sharp Corners) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-none overflow-hidden p-8 sm:p-12 border border-slate-200 dark:border-slate-800 bg-[#0B132B] text-white shadow-xs">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-none text-[10px] font-mono uppercase tracking-widest border border-white/20 text-brand-300">
              Tailored Commercial Advisory
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Can't Find Your Exact Floor Area or Location?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
              Tell us what property you need. Our commercial real estate team has offline access to 500+ corporate office floors, warehouse parcels, and industrial units across Noida, Greater Noida, and NCR.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                to="/tell-us-requirement"
                className="px-6 py-3 rounded-none font-semibold text-xs uppercase tracking-wider bg-white text-neutral-900 hover:bg-neutral-200 transition-colors flex items-center gap-2 border border-white"
              >
                <span>Tell Us What Property You Need</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={generateGeneralEnquiryWhatsAppLink({
                  propertyName: 'Custom Commercial Requirement',
                  propertyType: 'Tailored Commercial Space',
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-none font-semibold text-xs uppercase tracking-wider bg-[#128C7E] hover:bg-[#0D7366] text-white border border-[#25D366] flex items-center gap-2 transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Instant WhatsApp Desk</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TRUST & COMMERCIAL ASSURANCE (Layout: 3 cards in one row, Gap: 0px) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800 [&>*]:border-r [&>*]:border-b [&>*]:border-slate-200 dark:[&>*]:border-slate-800">
          <div className="rounded-none p-7 border-r border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-none border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <Shield className="w-4 h-4 stroke-[1.5]" />
                </div>
                <span className="font-mono text-xs tracking-widest text-brand-600/70 dark:text-brand-400/70 font-semibold">
                  01
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mt-5 mb-2 leading-snug">
                Local Commercial Expertise
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Decade of on-ground commercial transaction experience across Sector 62, Sector 63, Sector 18, and the Expressway.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              <span>On-Ground Network</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="rounded-none p-7 border-r border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-none border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <CalendarCheck className="w-4 h-4 stroke-[1.5]" />
                </div>
                <span className="font-mono text-xs tracking-widest text-brand-600/70 dark:text-brand-400/70 font-semibold">
                  02
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mt-5 mb-2 leading-snug">
                Assisted Site Visits
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                We arrange verified physical site inspections of offices, factories, and warehouses with complete documentation briefing.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              <span>Inspection Dossiers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="rounded-none p-7 border-r border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-none border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />
                </div>
                <span className="font-mono text-xs tracking-widest text-brand-600/70 dark:text-brand-400/70 font-semibold">
                  03
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mt-5 mb-2 leading-snug">
                Transparent Negotiations
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Fair market rates, zero hidden terms, and complete clarity on power loads, maintenance charges, and lease deed terms.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              <span>Direct Developer Terms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
