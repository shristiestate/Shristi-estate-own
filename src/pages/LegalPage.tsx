import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, FileText, AlertTriangle } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const LegalPage: React.FC = () => {
  const { docType } = useParams<{ docType?: string }>();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'disclaimer'>(
    (docType as any) || 'privacy'
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Legal & Disclosures' },
          { label: activeTab === 'privacy' ? 'Privacy Policy' : activeTab === 'terms' ? 'Terms of Service' : 'Commercial Disclaimer' }
        ]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'privacy' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'terms' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setActiveTab('disclaimer')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'disclaimer' ? 'bg-brand-600 text-white shadow-md' : 'glass-card hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Property Disclaimer
        </button>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 space-y-6 leading-relaxed text-sm text-slate-600 dark:text-slate-300">
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Privacy Policy
            </h1>
            <p>
              At Shristi Estate (shristiestate.in), we respect the confidentiality of your corporate and personal information. This Privacy Policy sets out how we collect, store, and process requirements submitted through our website and commercial consultation forms.
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">1. Information We Collect</h3>
            <p>
              When you enquire about a property, schedule a site inspection, or submit a property requirement, we collect your contact details (Full Name, Corporate Email, Mobile Number) and the operational criteria of your business (e.g. required floor area, preferred sectors, budget).
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">2. Usage of Information</h3>
            <p>
              Your contact data is used solely to provide commercial real estate advisory services, match your criteria with available inventory, and arrange authorized on-site visits. We do not sell or trade your contact data with external third parties.
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">3. Data Security</h3>
            <p>
              All submissions are stored securely and accessed exclusively by licensed commercial real estate consultants working directly on behalf of Shristi Estate.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Terms of Service
            </h1>
            <p>
              Welcome to Shristi Estate. By accessing or using our commercial discovery portal, you agree to comply with the terms and conditions outlined below.
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">1. Advisory Role</h3>
            <p>
              Shristi Estate operates as an independent commercial real estate consulting agency. We facilitate meetings, property comparisons, and lease negotiations between prospective tenants/buyers and property owners.
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">2. Non-Circumvention</h3>
            <p>
              Commercial properties, floor layouts, and building landlord contacts introduced by Shristi Estate through site visits or proposals remain subject to standard commercial advisory agreements.
            </p>
          </div>
        )}

        {activeTab === 'disclaimer' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Commercial Property Disclaimer
            </h1>
            <p>
              All commercial property details, floor plans, dimensions, square footages (super built-up, built-up, carpet), and rental rates published on shristiestate.in are provided for preliminary identification and informational guidance only.
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">1. Independent Verification</h3>
            <p>
              While Shristi Estate makes every effort to ensure accurate seed and verified inventory information, all prospective tenants and purchasers are strongly advised to carry out independent physical measurements, title searches, municipal zoning checks, and legal due diligence before signing binding lease deeds or commercial purchase contracts.
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">2. Live Inventory Status</h3>
            <p>
              Commercial spaces are subject to prior lease, sale, price modification, or withdrawal by building owners without prior notice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
