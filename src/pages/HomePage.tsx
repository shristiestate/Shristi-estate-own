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
import { ClientsMarquee } from '../components/home/ClientsMarquee';
import { InstagramReelsShowcase } from '../components/home/InstagramReelsShowcase';

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
      StorageService.getProperties().then((data) => { if (isMounted) setProperties(data); });
      StorageService.getBuildings().then((data) => { if (isMounted) setBuildings(data); });
      StorageService.getLocations().then((data) => { if (isMounted) setLocations(data); });
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
  const featuredBuildings = buildings.slice(0, 4);
  const primeLocations = locations.filter(l => l.featured).slice(0, 6);

  const categories = [
    {
      id: 'office-space',
      title: 'Office Spaces',
      desc: 'Corporate offices, furnished suites, and bare shell spaces for rent, lease and sale.',
      icon: Building2,
      path: '/office-space',
      badge: 'Rent / Sale / Lease'
    },
    {
      id: 'it-business-parks',
      title: 'IT & Business Parks',
      desc: 'Grade-A corporate campuses, technology hubs, and high-spec corporate towers.',
      icon: Cpu,
      path: '/it-business-parks',
      badge: 'Grade-A Campuses'
    },
    {
      id: 'warehouses',
      title: 'Warehouses & Logistics',
      desc: 'High-clearance storage, 3PL logistics facilities, and distribution hubs.',
      icon: Warehouse,
      path: '/warehouses',
      badge: 'Supply Chain Ready'
    },
    {
      id: 'factory-industrial',
      title: 'Factory & Industrial',
      desc: 'Industrial manufacturing units, factory sheds, and heavy-power plots.',
      icon: Factory,
      path: '/factory-industrial',
      badge: 'Heavy Power Load'
    },
    {
      id: 'land',
      title: 'Commercial Land',
      desc: 'Clear-title commercial and industrial plots for institutional development.',
      icon: Compass,
      path: '/land',
      badge: 'Freehold / Leasehold'
    },
    {
      id: 'shops-retail',
      title: 'Shops & Retail',
      desc: 'High-street retail shops, prime showrooms, and commercial market spaces.',
      icon: Store,
      path: '/shops',
      badge: 'Prime Footfall'
    },
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* 1. HERO SECTION WITH FADED & BLURRY IMG1 BACKDROP AND REARRANGED TEXT (IMAGE 2 STYLE) */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* INTERACTIVE CURSOR-REACTIVE 3D COMMERCIAL PARK TEXTURE (IMG1) UNDER H1 */}
        <InteractiveHeroTexture />

        {/* Soft Ambient Background Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-600/10 to-accent-teal/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto">
          {/* Main Hero Text Block - Left-Aligned (Arranged like Image 2) */}
          <div className="max-w-3xl text-left space-y-4 sm:space-y-5">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-semibold shadow-sm">
              <Shield className="w-3.5 h-3.5 text-brand-500" />
              <span>Dedicated Commercial Advisory • Noida & Delhi NCR</span>
            </div>

            {/* Master Headline (H1 - like Image 2 "Landing Page") */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] font-['Outfit']">
              Find the Right <br className="hidden sm:inline" />
              Commercial Property
            </h1>

            {/* Sub-headline directly under H1 (Thin font as requested) */}
            <p className="text-lg sm:text-xl lg:text-2xl font-light text-slate-500 dark:text-slate-400 font-['Outfit'] tracking-wide">
              with <span className="font-normal text-brand-600 dark:text-brand-400">Shristi Estate</span> • Commercial Real Estate Solutions
            </p>

            {/* Description paragraph (like Image 2 multi-line body) */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal pt-1 max-w-2xl">
              Explore verified office spaces, IT & business parks, warehouses, factory and industrial properties, commercial land, shops and prime corporate leasing opportunities across Noida and Delhi NCR.
            </p>

            {/* Action Row - Pill buttons (like Image 2 "Try Now" pill style) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#search-panel"
                className="rounded-full px-7 py-3 font-semibold text-sm sm:text-base border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all flex items-center gap-2 shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Explore Properties</span>
              </a>

              <Link
                to="/list-your-property"
                className="rounded-full px-7 py-3 font-semibold text-sm sm:text-base bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25 transition-all"
              >
                List Your Property
              </Link>

              <a
                href={generateGeneralEnquiryWhatsAppLink({ propertyName: 'Commercial Space in Noida / NCR' })}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-6 py-3 font-semibold text-sm sm:text-base btn-whatsapp flex items-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>

          {/* SLIM PREMIUM GLASS SEARCH PANEL */}
          <div id="search-panel" className="pt-6 sm:pt-8 max-w-4xl">
            <div className="glass-card rounded-2xl p-3.5 sm:p-4 shadow-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0B132B]/85 backdrop-blur-xl">
              {/* Slim Buy / Rent / Lease Tabs */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/70 pb-2 mb-2.5">
                {(['Rent', 'Lease', 'Sale'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSearchTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      searchTab === tab
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {tab === 'Sale' ? 'Buy / Purchase' : tab}
                  </button>
                ))}
              </div>

              {/* Slim Search Form Fields */}
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-left">
                {/* Category Select */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Property Category
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="glass-input w-full h-[38px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer appearance-none pr-8"
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
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Location / Sector
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLocation}
                      onChange={(e) => {
                        setSelectedLocation(e.target.value);
                        setSelectedBuilding('');
                      }}
                      className="glass-input w-full h-[38px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer appearance-none pr-8"
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
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Building / Project
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBuilding}
                      onChange={(e) => setSelectedBuilding(e.target.value)}
                      className="glass-input w-full h-[38px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer appearance-none pr-8"
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

                {/* Submit Button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="btn-glass-primary w-full h-[38px] px-4 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all"
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
      <ClientsMarquee />

      {/* 2. HIERARCHICAL DISCOVERY PATH EXPLAINER (SECTION 1 & 90) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white/60 dark:bg-[#0B132B]/60 border border-slate-200/70 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Structured Discovery Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Outfit'] mt-1">
              How You Discover Commercial Real Estate
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Unlike generic portals, Shristi Estate organizes every property by its exact commercial building and sector, ensuring 100% genuine inventory.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center mb-2">1</span>
              <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">Category</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Office, IT, Sheds</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center mb-2">2</span>
              <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">Location</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Sector 62, 63, Expy</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center mb-2">3</span>
              <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">Building / Project</span>
              <span className="text-[11px] text-slate-400 mt-0.5">I-Thum, Noida One</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center mb-2">4</span>
              <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">Available Units</span>
              <span className="text-[11px] text-slate-400 mt-0.5">750 to 15,000 sq.ft</span>
            </div>

            <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center mb-2">5</span>
              <span className="font-semibold text-xs sm:text-sm text-brand-600 dark:text-brand-400">Site Visit / Deal</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Assisted Onsite</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROPERTY CATEGORIES GRID (SECTION 21) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Commercial Portfolio
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
              Commercial Property Categories
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Select your specific asset class to explore buildings and available spaces.
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-2 transition-all"
          >
            <span>Explore All Inventory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={cat.path}
                className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between group border border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-[#0B132B]/75 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <span>Browse Buildings & Properties</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. PRIME LOCATIONS (SECTION 22) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Strategic Commercial Corridors
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
              Commercial Hubs in Noida & NCR
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Direct access to top industrial zones, expressway business belts, and IT clusters.
            </p>
          </div>
          <Link
            to="/locations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-2 transition-all"
          >
            <span>View All Sectors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {primeLocations.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </div>
      </section>

      {/* 5. COMMERCIAL BUILDINGS SHOWCASE (SECTION 8 & 30) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              The Building Layer
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
              Featured Commercial Projects & IT Parks
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Explore inventory directly by building, including floor structures and amenities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBuildings.map((building) => (
            <BuildingCard key={building.id} building={building} />
          ))}
        </div>
      </section>

      {/* 6. FEATURED PROPERTIES GRID (SECTION 11, 34-37) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Verified & Seed Inventory
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
              Featured Commercial Properties
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Ready-to-move corporate offices, warehouses, and industrial units with immediate possession.
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-2 transition-all"
          >
            <span>View All ({properties.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} onEnquire={onOpenEnquiry} />
          ))}
        </div>
      </section>

      {/* AUTO-ANIMATED INSTAGRAM REELS SHOWCASE */}
      <InstagramReelsShowcase />

      {/* 7. CUSTOM REQUIREMENT BANNER ("TELL US WHAT PROPERTY YOU NEED" - SECTION 40 & 51) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-card p-8 sm:p-12 border border-brand-500/30 bg-gradient-to-br from-brand-900/90 via-navy-950 to-slate-950 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/30 text-brand-300 border border-brand-400/30">
              Tailored Commercial Advisory
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] tracking-tight">
              Can't Find Your Exact Floor Area or Location?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Tell us what property you need. Our commercial real estate team has offline access to 500+ corporate office floors, warehouse parcels, and industrial units across Noida, Greater Noida, and NCR.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                to="/tell-us-requirement"
                className="btn-glass-primary px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2"
              >
                <span>Tell Us What Property You Need</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={generateGeneralEnquiryWhatsAppLink({
                  propertyName: 'Custom Commercial Requirement',
                  propertyType: 'Tailored Commercial Space',
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Instant WhatsApp Desk</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TRUST & COMMERCIAL ASSURANCE (SECTION 85) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/70">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              Local Commercial Expertise
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Decade of on-ground commercial transaction experience across Sector 62, Sector 63, Sector 18, and the Expressway.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/70">
            <div className="w-12 h-12 rounded-2xl bg-accent-teal/10 text-accent-teal flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              Assisted Site Visits
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              We arrange verified physical site inspections of offices, factories, and warehouses with complete documentation briefing.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/70">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              Transparent Negotiations
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Fair market rates, zero hidden terms, and complete clarity on power loads, maintenance charges, and lease deed terms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
