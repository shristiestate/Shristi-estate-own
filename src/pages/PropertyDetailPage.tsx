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
  Building
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Property, Building as BuildingType } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { WhatsAppIcon } from '../components/common/SocialIcons';
import { generatePropertyWhatsAppLink } from '../utils/whatsapp';
import { getBuildingStructureDisplay } from '../utils/textFormat';

interface PropertyDetailPageProps {
  onOpenEnquiry: (property: Property) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ onOpenEnquiry }) => {
  const { propertySlug } = useParams<{ propertySlug: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [building, setBuilding] = useState<BuildingType | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertySlug) return;
    setLoading(true);
    StorageService.getPropertyBySlug(propertySlug).then(async (prop) => {
      if (prop) {
        setProperty(prop);
        setActiveImage(prop.primary_image);
        if (prop.building_id) {
          const bld = await StorageService.getBuildings().then(blds => blds.find(b => b.id === prop.building_id));
          if (bld) setBuilding(bld);
        }
      }
      setLoading(false);
    });
  }, [propertySlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading verified property details...
      </div>
    );
  }

  if (!property) {
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
      {/* Hierarchical Breadcrumbs (Section 81) */}
      <Breadcrumbs
        items={[
          { label: property.category.replace('-', ' ').toUpperCase(), path: `/${property.category}` },
          { label: property.location_name, path: `/locations/${property.location_id.replace('loc-', '')}` },
          ...(property.building_name && building ? [{ label: property.building_name, path: `/buildings/${building.slug}` }] : []),
          { label: property.reference_number }
        ]}
      />

      {/* Main Grid: Left Gallery & Details (8 Cols) | Right Action Panel (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Gallery Showcase */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xl">
              <img
                src={activeImage || property.primary_image}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Status & ID Badge */}
              <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex items-center gap-1.5 sm:gap-2">
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-brand-600 text-white shadow-md">
                  For {property.listing_type}
                </span>
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold backdrop-blur-md bg-slate-900/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {property.status}
                </span>
              </div>

              <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4">
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-mono font-bold bg-black/70 text-white backdrop-blur-md border border-white/10">
                  ID: {property.reference_number}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img ? 'border-brand-500 scale-105 shadow-md' : 'border-transparent opacity-75'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Title & Header Meta */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              <span>{property.property_type}</span>
              {property.building_name && (
                <>
                  <span>•</span>
                  <Link to={`/buildings/${building?.slug || ''}`} className="hover:underline flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {property.building_name}
                  </Link>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight leading-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{property.address}</span>
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Property Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 text-xs block">Built-Up Area</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                  {property.built_up_area.toLocaleString()} {property.area_unit}
                </span>
              </div>

              {property.land_area ? (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 text-xs block">Plot / Land Area</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                    {property.land_area.toLocaleString()} {property.area_unit}
                  </span>
                </div>
              ) : null}

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 text-xs block">Carpet Area</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                  {property.carpet_area ? `${property.carpet_area.toLocaleString()} sq.ft` : 'Available on request'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 text-xs block">Furnishing State</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                  {property.furnishing}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 text-xs block">Floor / Levels</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                  {property.floor ? `${property.floor} / ${property.total_floors || 'G'}` : 'Ground Floor'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 text-xs block">Possession</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                  {property.possession}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 text-xs block">Parking Allotment</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                  {property.parking}
                </span>
              </div>

              {property.power_load && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 text-xs block">Power / Load</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                    {property.power_load}
                  </span>
                </div>
              )}

              {property.road_width && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 text-xs block">Road Width / Frontage</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                    {property.road_width}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-[#0B132B]/75 border border-slate-200/90 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Commercial Overview & Highlights
            </h2>
            <div className="overview-text text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {property.description}
            </div>

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

          {/* Building Association Layer (Section 8) */}
          {building && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Located Inside Commercial Project
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] mt-1">
                    {building.name}
                  </h3>
                </div>
                <Link
                  to={`/buildings/${building.slug}`}
                  className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>View Building</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overview-text text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {building.description}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div>
                  <span className="text-slate-400 block font-medium">Structure</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{getBuildingStructureDisplay(building)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Lifts</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{building.lifts}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Power</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{building.power_backup}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Parking</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{building.parking}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Action Panel (4 Cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0B132B]/85 shadow-2xl space-y-6">
            {/* Pricing Section */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Commercial Lease / Outright Tariff
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
                {property.price_display}
              </div>
              {property.rate_per_sqft && (
                <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">
                  Effective Rate: {property.rate_per_sqft}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => onOpenEnquiry(property)}
                className="btn-glass-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Verified Site Visit</span>
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Instant WhatsApp Enquiry</span>
              </a>

              <a
                href="tel:+918750098666"
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-brand-500" />
                <span>Call +91 87500 98666</span>
              </a>

              <button
                onClick={handleShare}
                className="w-full py-2.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
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
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-emerald shrink-0" />
                <span>Direct Site Visit Coordination</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-emerald shrink-0" />
                <span>Title & Lease Deed Verification Support</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-emerald shrink-0" />
                <span>Zero Advance Fees for Site Inspections</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
