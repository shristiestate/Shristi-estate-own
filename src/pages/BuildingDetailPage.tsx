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
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Building, Property } from '../types';
import { PropertyCard } from '../components/common/PropertyCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { WhatsAppIcon } from '../components/common/SocialIcons';
import { generateBuildingWhatsAppLink } from '../utils/whatsapp';
import { getBuildingStructureDisplay } from '../utils/textFormat';
import { EditBuildingPropertiesModal } from '../components/modals/EditBuildingPropertiesModal';

interface BuildingDetailPageProps {
  onOpenEnquiry: (property?: Property) => void;
}

export const BuildingDetailPage: React.FC<BuildingDetailPageProps> = ({ onOpenEnquiry }) => {
  const { buildingSlug } = useParams<{ buildingSlug: string }>();
  const [building, setBuilding] = useState<Building | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [unitFilter, setUnitFilter] = useState<'all' | 'compact' | 'enterprise'>('all');
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [showEditPropsModal, setShowEditPropsModal] = useState(false);

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
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden glass-card border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xl">
            <img
              src={activeImage || building.hero_image}
              alt={building.name}
              className="w-full h-full object-cover transition-all duration-300"
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
        </div>

        {/* Building Title & Quick Commercial Specs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {building.categories && building.categories.length > 0 ? (
                  building.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 uppercase tracking-wider"
                    >
                      {cat.replace(/-/g, ' ')}
                    </span>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    <span>{building.category?.replace(/-/g, ' ') || 'Commercial Tower'}</span>
                  </div>
                )}
                {building.towers && building.towers.length > 1 && (
                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                    {building.towers.length} Towers / Blocks
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
                {building.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{building.address}</span>
                </div>
                {building.locations && building.locations.length > 1 && (
                  <div className="flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
                    <span>• Serving Sectors:</span>
                    <span>{building.location_names?.join(', ') || building.location_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Available Units</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {properties.length} Available
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Structure</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 block truncate" title={getBuildingStructureDisplay(building)}>
                  {getBuildingStructureDisplay(building)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Towers / Blocks</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate" title={building.tower_details || 'Single Tower'}>
                  {building.tower_details || (building.towers && building.towers.length > 1 ? `${building.towers.length} Towers` : 'Single Tower')}
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
        </div>
      </div>

      {/* Building Overview & Technical Specifications (Section 10) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-[#0B132B]/75 border border-slate-200/90 dark:border-slate-800 space-y-6">
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
              Technical Infrastructure & Structure
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Floor Structure</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                  {getBuildingStructureDisplay(building)}
                </span>
                {building.basement_floors && building.basement_floors !== 'No Basement' && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Basement: {building.basement_floors} • {building.ground_option || 'Ground Level'}
                  </span>
                )}
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Towers & Wings</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                  {building.tower_details || (building.towers && building.towers.length > 0 ? building.towers.join(', ') : 'Single Standalone Tower')}
                </span>
              </div>
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
        </div>

        {/* Transit & Landmarks */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-[#0B132B]/75 border border-slate-200/90 dark:border-slate-800 space-y-6">
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
        </div>
      </section>

      {/* MANDATORY HIERARCHY: AVAILABLE PROPERTIES IN THIS BUILDING (SECTION 11) */}
      <section className="space-y-6" id="building-inventory">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Immediate Verified Inventory
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                Available Properties in {building.name} ({properties.length})
              </h2>
              <button
                onClick={() => setShowEditPropsModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 active:scale-95 cursor-pointer"
                title="Edit, add, or adjust rates for available units in this building"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Available Properties</span>
              </button>
            </div>
          </div>

          {/* Category Tabs: All, Compact & Mid-Size, Enterprise Floors */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs self-start md:self-auto flex-wrap">
            <button
              onClick={() => { setUnitFilter('all'); setSelectedArea(null); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                unitFilter === 'all' && selectedArea === null
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Units ({properties.length})
            </button>
            <button
              onClick={() => { setUnitFilter('compact'); setSelectedArea(null); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                unitFilter === 'compact' && selectedArea === null
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Compact & Mid-Size (600 - 2.6K sq.ft)
            </button>
            <button
              onClick={() => { setUnitFilter('enterprise'); setSelectedArea(null); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                unitFilter === 'enterprise' && selectedArea === null
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Enterprise Floors (20K - 100K+ sq.ft)
            </button>
          </div>
        </div>

        {/* Quick Size Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-slate-400 shrink-0 font-medium mr-1">Quick Size Filter:</span>
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
              className={`px-2.5 py-1 rounded-lg shrink-0 font-semibold transition-all border ${
                selectedArea === pill.value
                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-400'
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
              <div className="py-12 text-center glass-card rounded-3xl p-8 space-y-3">
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  No matching units found for selected size filter.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => { setUnitFilter('all'); setSelectedArea(null); }}
                    className="btn-glass-primary px-5 py-2.5 rounded-xl text-xs font-semibold"
                  >
                    View All {properties.length} Available Units
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((prop) => (
                <PropertyCard key={prop.id} property={prop} onEnquire={onOpenEnquiry} />
              ))}
            </div>
          );
        })()}
      </section>

      {/* Edit Building Available Properties Modal */}
      {building && (
        <EditBuildingPropertiesModal
          isOpen={showEditPropsModal}
          building={building}
          onClose={() => setShowEditPropsModal(false)}
          onPropertiesUpdated={(updated) => {
            setProperties(updated);
          }}
        />
      )}
    </div>
  );
};
