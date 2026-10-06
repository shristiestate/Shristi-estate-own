import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Maximize2, 
  ShieldCheck, 
  Zap, 
  Car, 
  ArrowRight, 
  MessageSquare, 
  PhoneCall, 
  Calendar, 
  Compass, 
  CheckCircle2
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Building, Property } from '../types';
import { PropertyCard } from '../components/common/PropertyCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { WhatsAppIcon } from '../components/common/SocialIcons';
import { generateBuildingWhatsAppLink } from '../utils/whatsapp';
import { getBuildingStructureDisplay } from '../utils/textFormat';
import { resolveLocationSlug } from '../utils/propertyLocation';
import { updatePageSeo } from '../utils/seo';
import { 
  getTowerImageAlt, 
  getTowerCanonicalUrl, 
  generateTowerStructuredData 
} from '../utils/seoHelpers';
import { applyHyperlinksToContent } from '../utils/hyperlinks';
import { HyperlinkedText } from '../components/common/HyperlinkedText';

interface BuildingDetailPageProps {
  onOpenEnquiry: (property?: Property) => void;
}

export const BuildingDetailPage: React.FC<BuildingDetailPageProps> = ({ onOpenEnquiry }) => {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  
  const initialBld = buildingSlug ? StorageService.getInitialBuildingBySlug(buildingSlug) : null;
  const [building, setBuilding] = useState<Building | null>(() => initialBld);
  const [properties, setProperties] = useState<Property[]>(() => 
    initialBld ? StorageService.getInitialPropertiesByBuilding(initialBld.id) : []
  );
  const [activeImage, setActiveImage] = useState<string>(() => initialBld?.hero_image || '');
  const [hasResolved, setHasResolved] = useState(() => Boolean(initialBld));
  const [unitFilter, setUnitFilter] = useState<'all' | 'compact' | 'enterprise'>('all');
  const [selectedArea, setSelectedArea] = useState<number | null>(null);

  useEffect(() => {
    if (!buildingSlug) return;
    let isMounted = true;
    StorageService.getBuildingBySlug(buildingSlug).then(async (bld) => {
      if (!isMounted) return;
      if (bld) {
        setBuilding(bld);
        const validImages = [bld.hero_image, ...(bld.gallery || [])].filter(Boolean);
        setActiveImage((prev) => (prev && validImages.includes(prev) ? prev : bld.hero_image));
        const props = await StorageService.getPropertiesByBuilding(bld.id);
        if (isMounted) setProperties(props);
      }
      if (isMounted) setHasResolved(true);
    }).catch(() => {
      if (isMounted) setHasResolved(true);
    });

    return () => { isMounted = false; };
  }, [buildingSlug]);

  // Dynamic SEO & Structured Data update
  useEffect(() => {
    if (!building) return;
    const title = building.seo_title || `${building.name} Office Space in ${building.location_name}`;
    const desc = building.seo_description || building.short_description || building.description || `Explore office space and commercial properties in ${building.name}, ${building.location_name}.`;
    const canonical = building.canonical_url || getTowerCanonicalUrl(building);
    const ogImg = building.og_image || building.hero_image;
    const structuredData = generateTowerStructuredData(building, properties);

    updatePageSeo({
      title,
      description: desc,
      keywords: building.seo_keywords,
      canonicalUrl: canonical,
      ogTitle: building.og_title || title,
      ogDescription: building.og_description || desc,
      ogImage: ogImg,
      structuredData
    });
  }, [building, properties]);

  if (!building && hasResolved) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Building Not Found</h2>
        <p className="text-sm text-slate-500">We couldn't locate this commercial project.</p>
        <Link to="/properties" className="btn-glass-primary inline-block px-5 py-2.5 rounded-xl text-sm font-semibold">
          Browse Properties
        </Link>
      </div>
    );
  }

  if (!building) {
    return null;
  }

  const waLink = generateBuildingWhatsAppLink(building);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hierarchical Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Commercial Buildings', path: '/properties' },
          { label: building.location_name, path: `/locations/${resolveLocationSlug(building.location_id, building.location_name)}` },
          { label: building.name }
        ]}
      />

      {/* Building Hero & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Gallery / Image Showcase (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] rounded-none overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#070C1E] shadow-none">
            <img
              src={activeImage || building.hero_image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'}
              alt={getTowerImageAlt(building, activeImage === building.hero_image ? building.hero_image_alt : undefined)}
              title={building.hero_image_title || building.name}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-none text-[10px] font-semibold uppercase tracking-wider bg-stone-900 text-white border border-stone-800">
                Grade-A Commercial Project
              </span>
            </div>
          </div>

          {/* Image Caption */}
          {building.hero_image_caption && (
            <p className="text-xs text-stone-500 dark:text-stone-400 italic px-1">
              {building.hero_image_caption}
            </p>
          )}

          {/* Thumbnails */}
          {(() => {
            const rawGallery = Array.isArray(building.gallery) ? building.gallery : [];
            const displayHero = building.hero_image;
            const cleanGallery = rawGallery.filter(img => img && img !== displayHero);
            const allThumbnails = [displayHero, ...cleanGallery].filter(Boolean);

            if (allThumbnails.length <= 1) return null;

            return (
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
                {allThumbnails.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-16 rounded-none overflow-hidden border shrink-0 transition-all cursor-pointer ${
                      activeImage === img ? 'border-slate-900 dark:border-white scale-[1.02]' : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${building.name} - View ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=300&q=80'; }}
                    />
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Building Title & Quick Commercial Specs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-none p-6 sm:p-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {building.categories && building.categories.length > 0 ? (
                  building.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-none text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 uppercase tracking-wider"
                    >
                      {cat.replace(/-/g, ' ')}
                    </span>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>{building.category?.replace(/-/g, ' ') || 'Commercial Tower'}</span>
                  </div>
                )}
                {building.towers && building.towers.length > 1 && (
                  <span className="px-2.5 py-0.5 rounded-none text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {building.towers.length} Towers / Blocks
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
                {building.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{building.address}</span>
                </div>
                {building.locations && building.locations.length > 1 && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <span>• Serving Sectors:</span>
                    <span>{building.location_names?.join(', ') || building.location_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-200 dark:border-slate-800 text-xs">
              <div className="p-2.5 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Available</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                  {properties.length} Units
                </span>
              </div>
              <div className="p-2.5 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Structure</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 block truncate" title={getBuildingStructureDisplay(building)}>
                  {getBuildingStructureDisplay(building)}
                </span>
              </div>
              <div className="p-2.5 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Towers</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate" title={building.tower_details || 'Single Tower'}>
                  {building.tower_details || (building.towers && building.towers.length > 1 ? `${building.towers.length} Towers` : 'Single Tower')}
                </span>
              </div>
              <div className="p-2.5 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Guidance</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 block">
                  {building.rent_range || 'On Request'}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onOpenEnquiry(properties[0] || null)}
                className="btn-glass-primary w-full py-3 rounded-none font-semibold text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Building Site Visit</span>
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full py-3 rounded-none font-semibold text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Enquire via WhatsApp</span>
              </a>

              <a
                href="tel:+918750098666"
                className="w-full py-2.5 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
              >
                <PhoneCall className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Call Commercial Specialist (+91 87500 98666)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Building Overview & Technical Specifications */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-none p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              Building Overview & Specifications
            </h2>
            {building.short_description && (
              <HyperlinkedText
                as="p"
                inline
                hyperlinks={building.hyperlinks}
                className="text-sm font-semibold text-brand-700 dark:text-brand-300 mt-2"
                text={building.short_description}
              />
            )}
            <div 
              className="overview-text text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed space-y-3 prose dark:prose-invert max-w-none font-sans"
              dangerouslySetInnerHTML={{
                __html: applyHyperlinksToContent(
                  (building.overview || building.description || '').replace(/\n/g, '<br/>'),
                  building.hyperlinks || []
                )
              }}
            />
          </div>

          {building.location_connectivity && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-2">
                Location & Connectivity
              </h3>
              <div 
                className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed prose dark:prose-invert max-w-none font-sans"
                dangerouslySetInnerHTML={{
                  __html: applyHyperlinksToContent(
                    building.location_connectivity.replace(/\n/g, '<br/>'),
                    building.hyperlinks || []
                  )
                }}
              />
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
              Technical Infrastructure & Structure
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Floor Structure</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                  {getBuildingStructureDisplay(building)}
                </span>
                {building.basement_floors && building.basement_floors !== 'No Basement' && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Basement: {building.basement_floors} • {building.ground_option || 'Ground Level'}
                  </span>
                )}
              </div>
              <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Towers & Wings</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                  {building.tower_details || (building.towers && building.towers.length > 0 ? building.towers.join(', ') : 'Single Standalone Tower')}
                </span>
              </div>
              <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Power Backup</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{building.power_backup}</span>
              </div>
              <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Elevator Capacity</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{building.lifts}</span>
              </div>
              <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Car & Vehicle Parking</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{building.parking}</span>
              </div>
              <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px]">Security Infrastructure</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{building.security}</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {building.amenities && building.amenities.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-3">
                Building Features & Campus Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {building.amenities.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-none text-xs font-medium bg-slate-50 dark:bg-[#070C1E] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transit & Landmarks */}
        <div className="rounded-none p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Transit & Surroundings
          </h2>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px] mb-1">Public Transit / Metro:</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                {building.nearby_transport}
              </p>
            </div>

            {building.nearby_landmarks && building.nearby_landmarks.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-medium uppercase tracking-wider text-[10px] mb-2">Key Landmarks:</span>
                <ul className="space-y-2">
                  {building.nearby_landmarks.map((landmark, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <Compass className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                      <span>{landmark}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MANDATORY HIERARCHY: AVAILABLE PROPERTIES IN THIS BUILDING */}
      <section className="space-y-6" id="building-inventory">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                Immediate Verified Inventory
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mt-0.5">
              Available Properties in {building.name} ({properties.length})
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-none bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs self-start md:self-auto flex-wrap">
            <button
              onClick={() => { setUnitFilter('all'); setSelectedArea(null); }}
              className={`px-3 py-1.5 rounded-none font-semibold transition-all uppercase tracking-wider text-[11px] ${
                unitFilter === 'all' && selectedArea === null
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Units ({properties.length})
            </button>
            <button
              onClick={() => { setUnitFilter('compact'); setSelectedArea(null); }}
              className={`px-3 py-1.5 rounded-none font-semibold transition-all uppercase tracking-wider text-[11px] ${
                unitFilter === 'compact' && selectedArea === null
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Compact & Mid-Size
            </button>
            <button
              onClick={() => { setUnitFilter('enterprise'); setSelectedArea(null); }}
              className={`px-3 py-1.5 rounded-none font-semibold transition-all uppercase tracking-wider text-[11px] ${
                unitFilter === 'enterprise' && selectedArea === null
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Enterprise Floors
            </button>
          </div>
        </div>

        {/* Quick Size Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-slate-400 shrink-0 font-medium mr-1 uppercase tracking-wider text-[10px]">Filter Size:</span>
          {[
            { label: 'All', value: null },
            { label: '600 sq.ft', value: 600 },
            { label: '750 sq.ft', value: 750 },
            { label: '900 sq.ft', value: 900 },
            { label: '1,000 sq.ft', value: 1000 },
            { label: '1,200 sq.ft', value: 1200 },
            { label: '1,400 sq.ft', value: 1400 },
            { label: '1,600 sq.ft', value: 1600 },
            { label: '1,800 sq.ft', value: 1800 },
            { label: '2,200 sq.ft', value: 2200 },
            { label: '2,600 sq.ft', value: 2600 },
            { label: '20,000 sq.ft', value: 20000 },
            { label: '25,000 sq.ft', value: 25000 },
            { label: '30,000 sq.ft', value: 30000 },
            { label: '35,000 sq.ft', value: 35000 },
            { label: '40,000 sq.ft', value: 40000 },
            { label: '50,000 sq.ft', value: 50000 },
            { label: '60,000 sq.ft', value: 60000 },
            { label: '75,000 sq.ft', value: 75000 },
            { label: '90,000 sq.ft', value: 90000 },
            { label: '1,00,000+ sq.ft', value: 100000 },
          ].map((pill, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedArea(pill.value);
                if (pill.value === null) setUnitFilter('all');
              }}
              className={`px-2.5 py-1 rounded-none shrink-0 font-semibold transition-all border text-[11px] ${
                selectedArea === pill.value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white dark:bg-[#0B132B] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {(() => {
          const filtered = properties.filter((prop) => {
            if (selectedArea !== null && prop.built_up_area !== selectedArea) return false;
            if (unitFilter === 'compact') return prop.built_up_area <= 2600;
            if (unitFilter === 'enterprise') return prop.built_up_area >= 20000;
            return true;
          });

          if (filtered.length === 0) {
            return (
              <div className="py-12 text-center rounded-none p-8 space-y-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]">
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  No matching units found for selected size filter.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => { setUnitFilter('all'); setSelectedArea(null); }}
                    className="btn-glass-primary px-5 py-2.5 rounded-none text-xs font-semibold uppercase tracking-wider"
                  >
                    View All {properties.length} Available Units
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800">
              {filtered.map((prop, idx) => (
                <PropertyCard key={prop.id} property={prop} index={idx} onEnquire={onOpenEnquiry} />
              ))}
            </div>
          );
        })()}
      </section>

    </div>
  );
};
