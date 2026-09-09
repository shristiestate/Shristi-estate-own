import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Building2, Layers, CheckCircle2, Shield, ArrowRight, HelpCircle } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Location, Building, Property } from '../types';
import { PropertyCard } from '../components/common/PropertyCard';
import { BuildingCard } from '../components/common/BuildingCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface LocationPageProps {
  onOpenEnquiry: (property?: Property) => void;
}

export const LocationPage: React.FC<LocationPageProps> = ({ onOpenEnquiry }) => {
  const { locationSlug } = useParams<{ locationSlug: string }>();
  const [location, setLocation] = useState<Location | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!locationSlug) return;
    setLoading(true);
    StorageService.getLocationBySlug(locationSlug).then(async (loc) => {
      if (loc) {
        setLocation(loc);
        const [blds, props] = await Promise.all([
          StorageService.getBuildingsByLocation(loc.id),
          StorageService.getPropertiesByLocation(loc.id)
        ]);
        setBuildings(blds);
        setProperties(props);
      }
      setLoading(false);
    });
  }, [locationSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading commercial inventory for this sector...
      </div>
    );
  }

  if (!location) {
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
      <div className="relative rounded-3xl overflow-hidden glass-card p-8 sm:p-12 border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xl">
        <img
          src={location.hero_image}
          alt={location.name}
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
            <MapPin className="w-3.5 h-3.5" />
            {location.city}, {location.region}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Outfit'] tracking-tight">
            Commercial Property in {location.name}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {location.description}
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs sm:text-sm text-slate-300">
            <span><strong>{buildings.length}</strong> Commercial Towers / Projects</span>
            <span>•</span>
            <span><strong>{properties.length}</strong> Available Properties</span>
          </div>
        </div>
      </div>

      {/* MANDATORY HIERARCHY: BUILDINGS IN THIS LOCATION (SECTION 8 & 29) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Commercial Infrastructure
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Buildings & Projects in {location.name}
            </h2>
          </div>
        </div>

        {buildings.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-xs text-slate-500">
            No independent multi-story buildings registered yet in this sector. Direct plots and units are displayed below.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {buildings.map((b) => (
              <BuildingCard key={b.id} building={b} />
            ))}
          </div>
        )}
      </section>

      {/* AVAILABLE PROPERTIES IN THIS LOCATION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Current Opportunities
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Available Properties in {location.name} ({properties.length})
            </h2>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="py-12 text-center glass-card rounded-3xl p-8 space-y-3">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No live public inventory currently listed in {location.name}.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We frequently have off-market corporate leases and direct owner mandates in this sector.
            </p>
            <Link
              to="/tell-us-requirement"
              className="btn-glass-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold mt-2"
            >
              <span>Submit Requirement for {location.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} onEnquire={onOpenEnquiry} />
            ))}
          </div>
        )}
      </section>

      {/* LOCATION OVERVIEW & WHY INVEST/LEASE HERE */}
      <section className="glass-card rounded-3xl p-8 bg-white/70 dark:bg-[#0B132B]/75 border border-slate-200/90 dark:border-slate-800 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            Commercial Advantages of {location.name}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {location.name} stands as one of the most prominent commercial micro-markets within {location.city}. Benefiting from comprehensive arterial road networks, reliable industrial power grids, and close proximity to public rapid transit hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Metro & Arterial Connectivity
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Direct access to metro stations, signal-free expressway stretches, and quick connectivity to New Delhi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Talent Pool Access
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              High density of IT engineering, corporate management, and skilled workforce residing within a 15-minute commute radius.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Commercial Infrastructure
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Equipped with Grade-A building management systems, multi-tier car parking, and round-the-clock security infrastructure.
            </p>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Looking for an off-market or custom office footprint in {location.name}?
          </div>
          <button
            onClick={() => onOpenEnquiry()}
            className="btn-glass-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold"
          >
            Enquire for {location.name}
          </button>
        </div>
      </section>
    </div>
  );
};
