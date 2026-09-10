import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Maximize2, 
  Armchair, 
  Layers, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Property } from '../../types';
import { WhatsAppIcon } from './SocialIcons';

interface PropertyCardProps {
  property: Property;
  onEnquire?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onEnquire }) => {
  // Direct WhatsApp message formatting per spec 42:
  // "Hello Shristi Estate, I am interested in Property ID SE-XXXX in [Building], [Location]. Please share the details and availability."
  const buildingText = property.building_name ? `in ${property.building_name}, ` : '';
  const waText = encodeURIComponent(
    `Hello Shristi Estate,\nI am interested in Property ID ${property.reference_number} ${buildingText}${property.location_name}.\nPlease share the details and availability.`
  );
  const waLink = `https://wa.me/918750098666?text=${waText}`;

  return (
    <div className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col group border border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-[#0B132B]/75 transition-all duration-300">
      {/* Property Hero Image with Status & Tag Overlays */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={property.primary_image}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Subtle Gradient Shade */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Listing Type: Rent / Sale / Lease */}
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-600 text-white shadow-md">
              For {property.listing_type}
            </span>
            
            {/* Status: Ready to Move / Available */}
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md bg-slate-900/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {property.status}
            </span>
          </div>

          {/* Reference ID */}
          <span className="px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-black/60 text-slate-200 backdrop-blur-md border border-white/10">
            {property.reference_number}
          </span>
        </div>

        {/* Bottom Image Overlay: Price & Rate */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-['Outfit'] drop-shadow-sm">
              {property.price_display}
            </div>
            {property.rate_per_sqft && (
              <div className="text-xs font-medium text-slate-300">
                Rate: {property.rate_per_sqft}
              </div>
            )}
          </div>
          
          {property.is_seed ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 backdrop-blur-sm border border-slate-700">
              Sample Inventory
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 backdrop-blur-sm border border-emerald-700 flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Building & Location Links */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex-wrap">
            {property.building_name && (
              <>
                <span className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
                  <Building2 className="w-3.5 h-3.5" />
                  {property.building_name}
                </span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {property.location_name}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
            <Link to={`/properties/${property.slug}`}>
              {property.title}
            </Link>
          </h3>

          {/* Specification Pills Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-300">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Area</span>
              <span className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1 mt-0.5">
                <Maximize2 className="w-3.5 h-3.5 text-brand-500" />
                {property.built_up_area.toLocaleString()} {property.area_unit}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Furnishing</span>
              <span className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1 mt-0.5">
                <Armchair className="w-3.5 h-3.5 text-accent-teal" />
                {property.furnishing}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Floor</span>
              <span className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1 mt-0.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                {property.floor ? `${property.floor} Fl` : 'Ground'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          <Link
            to={`/properties/${property.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold text-xs sm:text-sm transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* WhatsApp Direct */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp enquiry for property"
            className="p-2.5 rounded-xl btn-whatsapp flex items-center justify-center text-white"
            title="Chat on WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>

          {/* Enquire Modal Trigger */}
          <button
            onClick={() => onEnquire && onEnquire(property)}
            className="btn-glass-primary px-3 sm:px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm"
          >
            Enquire
          </button>
        </div>
      </div>
    </div>
  );
};
