import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Maximize2, 
  Armchair, 
  Layers, 
  Zap, 
  Car, 
  CheckCircle2, 
  MessageSquare, 
  PhoneCall, 
  Calendar, 
  Share2, 
  ArrowRight,
  ShieldCheck,
  Check,
  Building,
  ChevronRight
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Property, Building as BuildingType } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { PropertyCard } from '../components/common/PropertyCard';
import { WhatsAppIcon } from '../components/common/SocialIcons';
import { generatePropertyWhatsAppLink } from '../utils/whatsapp';
import { getBuildingStructureDisplay } from '../utils/textFormat';
import { cleanPropertyAddress } from '../utils/propertyLocation';
import { updatePageSeo } from '../utils/seo';
import { 
  getPropertyImageAlt, 
  getPropertyCanonicalUrl, 
  generatePropertyStructuredData 
} from '../utils/seoHelpers';
import { applyHyperlinksToContent } from '../utils/hyperlinks';

interface PropertyDetailPageProps {
  onOpenEnquiry: (property: Property) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ onOpenEnquiry }) => {
  const { propertySlug } = useParams<{ propertySlug: string }>();
  
  const initialProp = propertySlug ? StorageService.getInitialPropertyBySlug(propertySlug) : null;
  const initialBld = initialProp && initialProp.building_id
    ? StorageService.getInitialBuildings().find(b => b.id === initialProp.building_id) || null
    : null;

  const [property, setProperty] = useState<Property | null>(() => initialProp);
  const [building, setBuilding] = useState<BuildingType | null>(() => initialBld);
  const [buildingProperties, setBuildingProperties] = useState<Property[]>([]);
  const [activeImage, setActiveImage] = useState<string>(() => initialProp?.primary_image || '');
  const [copied, setCopied] = useState(false);
  const [hasResolved, setHasResolved] = useState(() => Boolean(initialProp));

  useEffect(() => {
    if (!propertySlug) return;
    let isMounted = true;
    StorageService.getPropertyBySlug(propertySlug).then(async (prop) => {
      if (!isMounted) return;
      if (prop) {
        setProperty(prop);
        const validImages = [prop.primary_image, ...(prop.gallery || [])].filter(Boolean);
        setActiveImage((prev) => (prev && validImages.includes(prev) ? prev : prop.primary_image));
        if (prop.building_id) {
          const bld = await StorageService.getBuildingById(prop.building_id);
          if (isMounted && bld) {
            setBuilding(bld);
            const related = await StorageService.getPropertiesByBuilding(bld.id);
            if (isMounted) {
              setBuildingProperties(related.filter(p => p.id !== prop.id));
            }
          }
        }
      }
      if (isMounted) setHasResolved(true);
    }).catch(() => {
      if (isMounted) setHasResolved(true);
    });

    return () => { isMounted = false; };
  }, [propertySlug]);

  // Dynamic SEO & Structured Data update
  useEffect(() => {
    if (!property) return;
    const title = property.seo_title || `${property.built_up_area ? property.built_up_area + ' sq ft ' : ''}${property.property_type} for ${property.listing_type} in ${property.building_name || property.location_name}`;
    const desc = property.seo_description || property.short_description || property.description || `Explore this ${property.built_up_area || ''} sq.ft commercial office space for ${property.listing_type?.toLowerCase() || 'lease'} in ${property.location_name}.`;
    const canonical = property.canonical_url || getPropertyCanonicalUrl(property);
    const ogImg = property.og_image || property.primary_image;
    const structuredData = generatePropertyStructuredData(property, building || undefined);

    updatePageSeo({
      title,
      description: desc,
      keywords: property.seo_keywords,
      canonicalUrl: canonical,
      ogTitle: property.og_title || title,
      ogDescription: property.og_description || desc,
      ogImage: ogImg,
      structuredData
    });
  }, [property, building]);

  if (!property && hasResolved) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Property Not Found</h2>
        <p className="text-sm text-slate-500">We couldn't locate this commercial property.</p>
        <Link to="/properties" className="btn-glass-primary inline-block px-5 py-2.5 rounded-xl text-sm font-semibold">
          Browse All Properties
        </Link>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  // Pre-filled WhatsApp link with structured property inquiry details
  const waLink = generatePropertyWhatsAppLink(property);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const allImages = [property.primary_image, ...(property.gallery || [])];

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-8 space-y-6 sm:space-y-10">
      {/* Hierarchical Breadcrumbs (Section 81 & Req 15) */}
      <Breadcrumbs
        items={[
          { label: property.category.replace('-', ' ').toUpperCase(), path: `/${property.category}` },
          { label: property.location_name, path: `/locations/${property.location_id.replace('loc-', '')}` },
          ...(property.building_name && building ? [{ label: property.building_name, path: `/buildings/${building.slug}` }] : []),
          ...(property.tower ? [{ label: property.tower, path: `/buildings/${building?.slug || ''}` }] : []),
          { label: property.title || property.reference_number }
        ]}
      />

      {/* Main Grid: Left Gallery & Details (8 Cols) | Right Action Panel (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Gallery Showcase */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-[16/10] rounded-none overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#070C1E] shadow-none">
              <img
                src={activeImage || property.primary_image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'}
                alt={getPropertyImageAlt(property, activeImage === property.primary_image ? property.primary_image_alt : undefined)}
                title={property.primary_image_title || property.title}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80';
                }}
              />

              {/* Status & ID Badge */}
              <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex items-center gap-1.5 sm:gap-2">
                <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-none text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white border border-stone-800">
                  For {property.listing_type}
                </span>
                <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-none text-[10px] sm:text-xs font-semibold backdrop-blur-md bg-stone-900/90 text-stone-200 border border-stone-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-none bg-emerald-400" />
                  {property.status}
                </span>
              </div>

              <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4">
                <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-none text-[10px] sm:text-xs font-mono font-bold bg-stone-900/90 text-white backdrop-blur-md border border-stone-700">
                  ID: {property.reference_number}
                </span>
              </div>
            </div>

            {/* Property Image Caption */}
            {property.primary_image_caption && (
              <p className="text-xs text-stone-500 dark:text-stone-400 italic px-1">
                {property.primary_image_caption}
              </p>
            )}

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-none overflow-hidden border shrink-0 transition-all ${
                      activeImage === img ? 'border-slate-900 dark:border-white scale-[1.02]' : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${property.title} view ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Title & Header Meta */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-none bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold uppercase tracking-wider border border-stone-300 dark:border-stone-700 text-[10px]">
                {property.property_type}
              </span>
              {property.building_name && (
                <Link 
                  to={`/buildings/${building?.slug || ''}`} 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white border border-stone-300 dark:border-stone-700 text-[10px] font-semibold transition-all"
                >
                  <Building2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>{property.building_name}</span>
                </Link>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight leading-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{cleanPropertyAddress(property.address, property.building_name)}</span>
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="rounded-none p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B]">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-4">
              Property Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block uppercase tracking-wider">Built-Up Area</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                  {property.built_up_area.toLocaleString()} {property.area_unit}
                </span>
              </div>

              {property.land_area ? (
                <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[11px] block uppercase tracking-wider">Plot / Land Area</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                    {property.land_area.toLocaleString()} {property.area_unit}
                  </span>
                </div>
              ) : null}

              <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block uppercase tracking-wider">Carpet Area</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                  {property.carpet_area ? `${property.carpet_area.toLocaleString()} sq.ft` : 'Available on request'}
                </span>
              </div>

              <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block uppercase tracking-wider">Furnishing State</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                  {property.furnishing}
                </span>
              </div>

              <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block uppercase tracking-wider">Possession</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                  {property.possession}
                </span>
              </div>

              <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block uppercase tracking-wider">Parking Allotment</span>
                <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                  {property.parking}
                </span>
              </div>

              {property.power_load && (
                <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[11px] block uppercase tracking-wider">Power / Load</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                    {property.power_load}
                  </span>
                </div>
              )}

              {property.road_width && (
                <div className="p-3 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 text-[11px] block uppercase tracking-wider">Road Width / Frontage</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-1 block">
                    {property.road_width}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-none p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              Commercial Overview & Highlights
            </h2>
            {property.short_description && (
              <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                {property.short_description}
              </p>
            )}
            <div 
              className="overview-text text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: applyHyperlinksToContent(
                  (property.overview || property.description || '').replace(/\n/g, '<br/>'),
                  property.hyperlinks || []
                )
              }}
            />

            {property.location_connectivity && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Location & Connectivity
                </h4>
                <div 
                  className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: applyHyperlinksToContent(
                      property.location_connectivity.replace(/\n/g, '<br/>'),
                      property.hyperlinks || []
                    )
                  }}
                />
              </div>
            )}

            {/* Features list */}
            {property.features && property.features.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Key Space Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                  {property.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Building Association Layer */}
          {building && (
            <div className="rounded-none p-6 sm:p-8 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                    Located Inside Commercial Project
                  </span>
                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                    {building.name}
                  </h3>
                </div>
                <Link
                  to={`/buildings/${building.slug}`}
                  className="btn-glass-primary px-4 py-2 rounded-none text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <span>View Building</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overview-text text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                {building.description}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div className="p-2.5 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Structure</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{getBuildingStructureDisplay(building)}</span>
                </div>
                <div className="p-2.5 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Lifts</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{building.lifts}</span>
                </div>
                <div className="p-2.5 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Power</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{building.power_backup}</span>
                </div>
                <div className="p-2.5 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Parking</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{building.parking}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Action Panel (4 Cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="rounded-none p-6 sm:p-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] shadow-none space-y-6">
            {/* Pricing Section */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] block mb-1">
                Commercial Lease / Outright Tariff
              </span>
              <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {property.price_display}
              </div>
              {property.rate_per_sqft && (
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                  Effective Rate: {property.rate_per_sqft}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => onOpenEnquiry(property)}
                className="btn-glass-primary w-full py-3.5 rounded-none font-semibold text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Verified Site Visit</span>
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full py-3.5 rounded-none font-semibold text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Instant WhatsApp Enquiry</span>
              </a>

              <a
                href="tel:+918750098666"
                className="w-full py-3 rounded-none border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
              >
                <PhoneCall className="w-4 h-4 text-stone-500" />
                <span>Call +91 87500 98666</span>
              </a>

              <button
                onClick={handleShare}
                className="w-full py-2.5 rounded-none text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Link Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Property Dossier</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Assurance Pill */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400 font-sans">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Direct Site Visit Coordination</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Title & Lease Deed Verification Support</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Zero Advance Fees for Site Inspections</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PROPERTIES IN THIS TOWER */}
      {property.tower && buildingProperties.some(p => p.tower === property.tower) && (
        <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                Tower Inventory
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                Other Properties in {property.tower}
              </h3>
            </div>
            {building && (
              <Link to={`/buildings/${building.slug}`} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 uppercase tracking-wider">
                <span>View {property.tower} Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800">
            {buildingProperties.filter(p => p.tower === property.tower).slice(0, 3).map((relProp, idx) => (
              <PropertyCard key={relProp.id} property={relProp} index={idx} onEnquire={onOpenEnquiry} />
            ))}
          </div>
        </section>
      )}

      {/* MORE PROPERTIES IN THIS BUILDING */}
      {buildingProperties.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                Building Portfolio
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                More Properties in {property.building_name || building?.name || 'this Building'}
              </h3>
            </div>
            {building && (
              <Link to={`/buildings/${building.slug}`} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 uppercase tracking-wider">
                <span>All Units in {building.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800">
            {buildingProperties.slice(0, 3).map((relProp, idx) => (
              <PropertyCard key={relProp.id} property={relProp} index={idx} onEnquire={onOpenEnquiry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
