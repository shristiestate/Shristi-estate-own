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
      <div className="relative rounded-none overflow-hidden p-6 sm:p-10 border border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
        <div className="max-w-2xl space-y-3">
          <span className="inline-block px-3 py-1 rounded-none text-[10px] sm:text-[11px] font-mono uppercase tracking-widest bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Commercial Real Estate Consultancy
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white">
            Specialized Commercial Advisory for Noida & Delhi NCR
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Shristi Estate is committed to transparent, structured, and friction-free commercial real estate discovery. We specialize exclusively in corporate office spaces, IT business parks, industrial units, and logistics infrastructure.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800">
        <div className="p-6 border-r border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] space-y-2.5">
          <div className="w-10 h-10 rounded-none bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20">
            <Building2 className="w-5 h-5 stroke-[1.75]" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            Building-First Discovery
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            We organize commercial real estate by actual physical building towers, ensuring clients know the precise floor plate, power backups, and elevator infrastructure before scheduling inspections.
          </p>
        </div>

        <div className="p-6 border-r border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] space-y-2.5">
          <div className="w-10 h-10 rounded-none bg-accent-teal/10 text-accent-teal flex items-center justify-center border border-accent-teal/20">
            <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            Strict Transparency
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            We provide realistic market rents, carpet versus super area disclosures, and complete clarity on maintenance, parking allotments, and municipal approvals.
          </p>
        </div>

        <div className="p-6 border-r border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] space-y-2.5">
          <div className="w-10 h-10 rounded-none bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
            <Target className="w-5 h-5 stroke-[1.75]" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            End-to-End Deal Execution
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            From initial requirement assessment and assisted site visits through commercial lease deed drafting and fit-out coordination, our consultants represent your best interests.
          </p>
        </div>
      </div>

      {/* Areas Served & Office */}
      <div className="rounded-none p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Primary Commercial Territories
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-sans">
            Our senior advisory desk operates from our corporate office located in <strong>I-Thum Tower, Sector 62, Noida</strong>. We maintain active leasing and sales representation across:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {[
            'Sector 62 (IT Hub)',
            'Sector 63 (Industrial/IT)',
            'Noida Expressway',
            'Sector 18 (Commercial/Retail)',
            'Sector 83 & 85 (Logistics)',
            'Greater Noida & Ecotech',
            'Sector 1, 2, 3 (Delhi Border)',
            'Film City & Sector 16'
          ].map((loc, idx) => (
            <div key={idx} className="p-2.5 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{loc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
