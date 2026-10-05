import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Key, Handshake, Search, CalendarCheck, FileText, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const ServicesPage: React.FC = () => {
  const services = [
    {
      title: 'Corporate Office Leasing',
      desc: 'Full-cycle leasing advisory for corporate tenants, technology companies, and consulting practices. We match your headcount, IT infrastructure, and budgetary parameters with prime buildings in Sector 62, Expressway, and Sector 16/18.',
      benefits: ['Space requirement modeling', 'Lease deed negotiations', 'Fit-out period negotiation', '100% DG backup verification'],
      icon: Building2
    },
    {
      title: 'Commercial Property Sales & Acquisitions',
      desc: 'Expert representation for purchasing institutional commercial buildings, IT suites, high-street retail shops, and commercial land plots with clean, unencumbered titles.',
      benefits: ['Title due diligence assistance', 'Return-on-investment modeling', 'Noida Authority transfer guidance', 'Direct landlord negotiation'],
      icon: Key
    },
    {
      title: 'Warehousing & Industrial Leasing',
      desc: 'Specialized industrial advisory for supply chain, e-commerce, FMCG, and manufacturing setups across Sector 63, 83, 85, Phase-II, and Greater Noida.',
      benefits: ['Ceiling height and dock verification', 'Sanctioned industrial power load checks', 'Container trailer access analysis', 'Pollution NOC guidance'],
      icon: Handshake
    },
    {
      title: 'Assisted Site Visits & Inspections',
      desc: 'Dedicated commercial specialists accompany your corporate real estate committee or facilities team on physical inspections with detailed floor-plan dossiers.',
      benefits: ['Zero-fee site coordination', 'Side-by-side building comparisons', 'Building manager discussions', 'Instant availability checks'],
      icon: CalendarCheck
    },
    {
      title: 'Landlord & Owner Representation',
      desc: 'Comprehensive marketing, tenant screening, and commercial asset representation for owners of office floors, retail shops, and industrial plots in NCR.',
      benefits: ['Targeted marketing to MNCs', 'Tenant creditworthiness verification', 'Rental yield optimization', 'Standardized commercial lease drafting'],
      icon: FileText
    },
    {
      title: 'Commercial Real Estate Advisory',
      desc: 'Strategic commercial consultation for companies relocating, expanding footprints, or consolidating multiple NCR branch offices into unified headquarters.',
      benefits: ['Micro-market tariff analysis', 'Commute & transit analysis', 'Long-term lease restructuring', 'Expansion clause planning'],
      icon: Search
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumbs
        items={[
          { label: 'Services & Advisory' }
        ]}
      />

      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          Commercial Advisory Suite
        </span>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Commercial Real Estate Services
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans max-w-2xl mx-auto">
          Tailored property solutions for business tenants, institutional buyers, and commercial property owners across Noida, Greater Noida, and Delhi-NCR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-slate-200 dark:border-slate-800 [&>*]:border-r [&>*]:border-b [&>*]:border-slate-200 dark:[&>*]:border-slate-800">
        {services.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <div
              key={i}
              className="p-6 bg-white dark:bg-[#0B132B] flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-none bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  {svc.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {svc.desc}
                </p>

                <div className="pt-1 space-y-1.5">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Key Benefits:</span>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-sans">
                    {svc.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-brand-500 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/tell-us-requirement"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider group-hover:gap-1.5 transition-all"
                >
                  <span>Request Service Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
