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
import { AnimatedText } from '../components/common/AnimatedText';
import { ScrollReveal } from '../components/common/ScrollReveal';

interface BuildingDetailPageProps {
  onOpenEnquiry: (property?: Property) => void;
}

export const BuildingDetailPage: React.FC<BuildingDetailPageProps> = ({ onOpenEnquiry }) => {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const [building, setBuilding] = useState<Building | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!buildingSlug) return;
    setLoading(true);
    StorageService.getBuildingBySlug(buildingSlug).then(async (bld) => {
      if (bld) {
        setBuilding(bld);
        setActiveImage(bld.hero_image);
        const props = await StorageService.getPropertiesByBuilding(bld.id);
        setProperties(props);
      }
      setLoading(false);
    });
  }, [buildingSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading building infrastructure and properties...
      </div>
    );
  }

  if (!building) {
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

  const waLink = generateBuildingWhatsAppLink(building);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hierarchical Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Commercial Buildings', path: '/properties' },
          { label: building.location_name, path: `/locations/${building.location_id.replace('loc-', '')}` },
          { label: building.name }
        ]}
      />

      {/* Building Hero & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Gallery / Image Showcase (7 Cols) */}
        <ScrollReveal variant="image-reveal" triggerOnLoad className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden glass-card border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xl">
            <img
              src={activeImage || building.hero_image}
              alt={building.name}
              className="w-full h-full object-cover transition-all duration-300 card-image-zoom"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-brand-600 text-white shadow-lg">
                Grade-A Commercial Project
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {building.gallery && building.gallery.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveImage(building.hero_image)}
                className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  activeImage === building.hero_image ? 'border-brand-500 scale-105' : 'border-transparent opacity-70'
                }`}
              >
                <img src={building.hero_image} alt="Hero" className="w-full h-full object-cover" />
              </button>
              {building.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img ? 'border-brand-500 scale-105' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </ScrollReveal>

        {/* Building Title & Quick Commercial Specs (5 Cols) */}
        <ScrollReveal variant="slide-right" triggerOnLoad delay={0.15} className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>Commercial Tower</span>
              </div>
              <AnimatedText as="h1" type="hero" triggerOnLoad delay={0.1} className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
                {building.name}
              </AnimatedText>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{building.address}</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Available Units</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {properties.length} Available
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Floor Structure</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                  G + {building.total_floors} Floors
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Unit Sizes</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {building.size_range}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Rent Guidance</span>
                <span className="text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 mt-0.5 block">
                  {building.rent_range || 'On Request'}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onOpenEnquiry(properties[0] || null)}
                className="btn-glass-primary w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Building Site Visit</span>
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Enquire via WhatsApp</span>
              </a>

              <a
                href="tel:+918750098666"
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-brand-500" />
                <span>Call Commercial Specialist (+91 87500 98666)</span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Building Overview & Technical Specifications (Section 10) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ScrollReveal variant="fade-up" className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-[#0B132B]/75 border border-slate-200/90 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Building Overview & Specifications
            </h2>
            <div className="overview-text text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
              {building.description}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Technical Infrastructure
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Power Backup</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{building.power_backup}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Elevator Capacity</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{building.lifts}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Car & Vehicle Parking</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{building.parking}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Security Infrastructure</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{building.security}</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {building.amenities && building.amenities.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                Building Features & Campus Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {building.amenities.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-teal" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ScrollReveal>

        {/* Transit & Landmarks */}
        <ScrollReveal variant="fade-up" delay={0.1} className="glass-card rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-[#0B132B]/75 border border-slate-200/90 dark:border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
            Transit & Surroundings
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium mb-1">Public Transit / Metro:</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                {building.nearby_transport}
              </p>
            </div>

            {building.nearby_landmarks && building.nearby_landmarks.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium mb-2">Key Landmarks:</span>
                <ul className="space-y-2">
                  {building.nearby_landmarks.map((landmark, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <Compass className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <span>{landmark}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* MANDATORY HIERARCHY: AVAILABLE PROPERTIES IN THIS BUILDING (SECTION 11) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Immediate Inventory
            </span>
            <AnimatedText as="h2" showAccentLine className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Available Properties in {building.name} ({properties.length})
            </AnimatedText>
          </div>
        </div>

        {properties.length === 0 ? (
          <ScrollReveal variant="fade-up" className="py-12 text-center glass-card rounded-3xl p-8 space-y-3">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No live public vacancies currently listed in {building.name}.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our office frequently handles private leases and lease renewals inside {building.name}. Submit your desired area to be notified first.
            </p>
            <button
              onClick={() => onOpenEnquiry()}
              className="btn-glass-primary px-5 py-2.5 rounded-xl text-xs font-semibold mt-2"
            >
              Enquire for Upcoming Vacancies in {building.name}
            </button>
          </ScrollReveal>
        ) : (
          <ScrollReveal variant="stagger" stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} onEnquire={onOpenEnquiry} />
            ))}
          </ScrollReveal>
        )}
      </section>
    </div>
  );
};
