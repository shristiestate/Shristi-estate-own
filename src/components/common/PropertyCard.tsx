import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Maximize2, 
  Armchair, 
  Clock,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';
import { Property } from '../../types';
import { WhatsAppIcon } from './SocialIcons';
import { generatePropertyWhatsAppLink } from '../../utils/whatsapp';
import { UnitImageShowcase } from './UnitImageShowcase';

interface PropertyCardProps {
  property: Property;
  index?: number;
  onEnquire?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, index, onEnquire }) => {
  const waLink = generatePropertyWhatsAppLink(property);
  const numberDisplay = typeof index === 'number' 
    ? String(index + 1).padStart(2, '0') 
    : (property.reference_number?.replace(/[^0-9]/g, '').slice(-2) || '01');

  // Compile showcase images for auto-animating gallery
  const showcaseImages = React.useMemo(() => {
    const list: string[] = [];
    if (property.primary_image) list.push(property.primary_image);
    if (Array.isArray(property.gallery)) {
      property.gallery.forEach((img) => {
        if (img && typeof img === 'string' && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    if (list.length === 1) {
      const curations = [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      ];
      curations.forEach((c) => {
        if (list.length < 3 && !list.includes(c)) list.push(c);
      });
    }
    return list;
  }, [property.primary_image, property.gallery]);

  return (
    <div className="relative rounded-none overflow-hidden flex flex-col group border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] hover:bg-slate-50/80 dark:hover:bg-[#0E1838] transition-colors duration-300">
      {/* Top Architectural Header Bar: Icon Left, Number Right */}
      <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-white/[0.02]">
        <div className="flex items-center gap-1.5 min-w-0">
          <Building2 className="w-3 h-3 text-brand-600 dark:text-brand-400 stroke-[1.75] shrink-0" />
          <span className="text-[9.5px] sm:text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {property.listing_type} • {property.category?.replace(/-/g, ' ') || 'Commercial'}
          </span>
        </div>
        <span className="font-mono text-[9.5px] sm:text-[10px] tracking-widest text-brand-600/70 dark:text-brand-400/70 font-semibold shrink-0 ml-2">
          {numberDisplay}
        </span>
      </div>

      {/* Sharp Rectangular Image Showcase */}
      <div className="relative">
        <UnitImageShowcase
          images={showcaseImages}
          alt={property.title}
          aspectRatio="aspect-[16/10]"
          className="rounded-none"
        >
          {/* Top Overlays */}
          <div className="p-2.5 flex items-center justify-between gap-2 pointer-events-auto">
            <span className="px-1.5 py-0.5 rounded-none text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-wider bg-brand-600 text-white shadow-sm">
              {property.status}
            </span>
            <span className="px-1.5 py-0.5 rounded-none text-[8.5px] sm:text-[9px] font-mono font-medium bg-slate-900/80 text-white backdrop-blur-sm border border-white/10">
              {property.reference_number}
            </span>
          </div>

          {/* Bottom Image Overlay: Price & Rate */}
          <div className="p-2.5 pb-2.5 flex items-end justify-between gap-2 pointer-events-auto">
            <div className="min-w-0">
              <div className="text-sm sm:text-[15px] font-bold text-white tracking-tight drop-shadow-sm truncate">
                {property.price_display}
              </div>
              {property.rate_per_sqft && (
                <div className="text-[9.5px] sm:text-[10px] font-medium text-slate-200/90 drop-shadow-sm truncate">
                  Rate: {property.rate_per_sqft}
                </div>
              )}
            </div>
            
            <span className="text-[8.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-none bg-slate-900/90 text-slate-200 border border-slate-700 shrink-0">
              {property.is_seed ? 'Sample' : 'Verified'}
            </span>
          </div>
        </UnitImageShowcase>
      </div>

      {/* Property Details Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Building & Location Metadata */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 mb-1 flex-wrap font-sans">
            {property.building_name && (
              <>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {property.building_name}
                </span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-2.5 h-2.5 text-brand-500 shrink-0" />
              <span className="truncate">{property.location_name}</span>
            </span>
          </div>

          {/* Structured Architectural Heading */}
          <h3 className="text-[13px] sm:text-[13.5px] font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug tracking-tight">
            <Link to={`/properties/${property.slug}`}>
              {property.title}
            </Link>
          </h3>

          {/* Architectural Specs Row */}
          <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-300">
            <div className="flex flex-col min-w-0">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-medium">Area</span>
              <span className="text-[10px] sm:text-[10.5px] font-semibold truncate flex items-center gap-1 mt-0.5 text-slate-800 dark:text-slate-200" title={`${property.built_up_area.toLocaleString()} ${property.area_unit}`}>
                <Maximize2 className="w-2.5 h-2.5 text-brand-500 shrink-0" />
                <span className="truncate">{property.built_up_area.toLocaleString()} {property.area_unit}</span>
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-medium">Furnishing</span>
              <span className="text-[10px] sm:text-[10.5px] font-semibold truncate flex items-center gap-1 mt-0.5 text-slate-800 dark:text-slate-200" title={property.furnishing}>
                <Armchair className="w-2.5 h-2.5 text-brand-500 shrink-0" />
                <span className="truncate">
                  {property.furnishing?.replace(/Plug-and-Play/gi, 'Plug & Play').replace(/Semi-Furnished/gi, 'Semi-Furn.').replace(/Fully Furnished/gi, 'Furnished') || 'Plug & Play'}
                </span>
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-medium">Possession</span>
              <span className="text-[10px] sm:text-[10.5px] font-semibold truncate flex items-center gap-1 mt-0.5 text-slate-800 dark:text-slate-200" title={property.possession || 'Immediate'}>
                <Clock className="w-2.5 h-2.5 text-brand-500 shrink-0" />
                <span className="truncate">{property.possession || 'Immediate'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Architectural Action Controls: "View Property" with arrow & Enquire */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <Link
            to={`/properties/${property.slug}`}
            className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors"
          >
            <span>View Property</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* WhatsApp Direct */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp enquiry for property"
              className="p-1.5 rounded-none border border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-[#25D366] hover:text-white text-emerald-600 dark:text-emerald-400 hover:border-[#25D366] transition-colors"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </a>

            {/* Enquire Trigger */}
            <button
              onClick={() => onEnquire && onEnquire(property)}
              className="btn-glass-primary px-2.5 py-1 rounded-none text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider"
            >
              Enquire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
