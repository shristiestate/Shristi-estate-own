import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Building2, Users, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { HyperlinkedText } from '../components/common/HyperlinkedText';
import { WhatsAppIcon } from '../components/common/SocialIcons';
import { generateGeneralEnquiryWhatsAppLink } from '../utils/whatsapp';

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
          <HyperlinkedText
            as="p"
            inline
            className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans"
            text="Shristi Estate is committed to transparent, structured, and friction-free commercial real estate discovery. We specialize exclusively in corporate office spaces, IT business parks, industrial units, and logistics infrastructure."
          />
        </div>
      </div>

      {/* 2. Meet the Founder Section */}
      <section className="rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Founder Portrait Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] p-2.5 sm:p-3 rounded-none shadow-xs">
              <div className="aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden relative bg-slate-900">
                <img
                  src="/images/founder.jpg"
                  alt="Sanjeet Kumar - Founder of Shristi Estate"
                  loading="eager"
                  className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-brand-600 text-white font-semibold mb-1">
                    Founder &amp; Principal Advisor
                  </span>
                  <div className="text-white text-base sm:text-lg font-bold font-['Outfit']">
                    Sanjeet Kumar
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans">
                    Commercial Advisory • Noida &amp; Delhi NCR
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Credentials / Commitment */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070C1E]/60">
                <div className="text-[10px] font-mono uppercase text-brand-600 dark:text-brand-400 font-semibold">Focus</div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">Corporate &amp; Industrial</div>
              </div>
              <div className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070C1E]/60">
                <div className="text-[10px] font-mono uppercase text-accent-teal font-semibold">Standard</div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">100% Genuine Inventory</div>
              </div>
            </div>
          </div>

          {/* Founder Message & Vision Column */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] sm:text-[11px] font-mono uppercase tracking-widest bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Leadership &amp; Advisory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                Meet the Founder of Shristi Estate
              </h2>
              <p className="text-sm sm:text-base font-semibold text-brand-600 dark:text-brand-400 mt-1">
                Your Trusted Partner in Commercial Real Estate
              </p>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              <p>
                Welcome to Shristi Estate, your trusted partner for commercial real estate solutions in Noida, Greater Noida and Delhi-NCR.
              </p>

              <p>
                I believe that finding the right commercial property is about more than location and price. It is about understanding your business needs, choosing the right space and making informed property decisions.
              </p>

              <HyperlinkedText
                as="p"
                inline
                text="At Shristi Estate, we assist businesses, investors, property owners and tenants with office spaces, IT parks, furnished offices, retail shops, industrial properties, warehouses, factories and commercial land."
              />

              <HyperlinkedText
                as="p"
                inline
                text="My approach is built around transparent communication, local market knowledge and personalised assistance. Whether you are looking to rent an office, lease an industrial property, buy commercial space or find the right tenant for your property, my goal is to help you explore suitable options with confidence."
              />

              <p>
                I aim to build long-term relationships through honest guidance, responsive service and a clear understanding of every client's requirements.
              </p>
            </div>

            {/* Featured Founder Pull-Quote */}
            <div className="p-4 sm:p-5 border-l-4 border-brand-600 bg-brand-50/60 dark:bg-brand-950/30 border border-slate-200/80 dark:border-slate-800/80 rounded-none my-4">
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug font-['Outfit']">
                “Shristi Estate is committed to helping you find the right space for your next business move.”
              </p>
              <p className="text-xs sm:text-sm italic text-brand-700 dark:text-brand-300 mt-1.5 font-medium">
                Let's find the right property for your goals.
              </p>
            </div>

            {/* Direct Connect Action Row */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={generateGeneralEnquiryWhatsAppLink({ propertyName: 'Direct Advisory with Founder' })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp rounded-none px-5 py-2.5 font-semibold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Speak with Founder</span>
              </a>

              <Link
                to="/tell-us-requirement"
                className="btn-glass-primary rounded-none px-5 py-2.5 font-semibold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <span>Share Your Requirement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/properties"
                className="rounded-none px-5 py-2.5 font-semibold text-xs uppercase tracking-wider bg-white dark:bg-[#070C1E] hover:bg-slate-50 dark:hover:bg-[#0E1838] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 transition-all"
              >
                Explore Properties
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Core Values */}
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
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-sans">
            <HyperlinkedText
              as="span"
              inline
              text="Our senior advisory desk operates from our corporate office located in I-Thum Tower, Sector 62, Noida. We maintain active leasing and sales representation across:"
            />
          </div>
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
