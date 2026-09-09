import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Building2, Users, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumbs
        items={[
          { label: 'About Shristi Estate' }
        ]}
      />

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-8 sm:p-14 border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xl">
        <div className="max-w-2xl space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Commercial Real Estate Consultancy
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Outfit'] tracking-tight">
            Specialized Commercial Advisory for Noida & Delhi NCR
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Shristi Estate is committed to transparent, structured, and friction-free commercial real estate discovery. We specialize exclusively in corporate office spaces, IT business parks, industrial units, and logistics infrastructure.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            Building-First Discovery
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We organize commercial real estate by actual physical building towers, ensuring clients know the precise floor plate, power backups, and elevator infrastructure before scheduling inspections.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-teal/10 text-accent-teal flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            Strict Transparency
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We provide realistic market rents, carpet versus super area disclosures, and complete clarity on maintenance, parking allotments, and municipal approvals.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            End-to-End Deal Execution
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            From initial requirement assessment and assisted site visits through commercial lease deed drafting and fit-out coordination, our consultants represent your best interests.
          </p>
        </div>
      </div>

      {/* Areas Served & Office */}
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
          Primary Commercial Territories
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Our senior advisory desk operates from our corporate office located in <strong>I-Thum Tower, Sector 62, Noida</strong>. We maintain active leasing and sales representation across:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
            <span>Sector 62 (IT Hub)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
            <span>Sector 63 (Industrial/IT)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
            <span>Noida Expressway</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
            <span>Sector 18 (Commercial/Retail)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
            <span>Sector 83 & 85 (Logistics)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
            <span>Greater Noida & Ecotech</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
            <span>Sector 1, 2, 3 (Delhi Border)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
            <span>Film City & Sector 16</span>
          </div>
        </div>
      </div>
    </div>
  );
};
