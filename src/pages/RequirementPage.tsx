import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, MessageSquare, PhoneCall, Building2, MapPin } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

export const RequirementPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    listingType: 'Rent',
    category: 'office-space',
    preferredLocations: 'Sector 62, Noida',
    buildingPreference: '',
    requiredArea: '1,500 - 3,000 sq.ft',
    budget: '',
    furnishing: 'Furnished',
    businessUse: '',
    preferredDate: '',
    preferredTime: '',
    additionalRequirements: '',
    consent: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Please enter your full name.');
    if (!formData.phone.trim() || formData.phone.length < 10) return setError('Please enter a valid mobile number.');
    if (!formData.email.trim()) return setError('Please enter your corporate email.');
    if (!formData.consent) return setError('Please accept consent.');

    setLoading(true);

    try {
      await StorageService.createLead({
        lead_type: 'requirement',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferred_contact_method: 'phone',
        message: `Requirement for ${formData.requiredArea} ${formData.category} in ${formData.preferredLocations}. Budget: ${formData.budget || 'Market Rate'}. Business Use: ${formData.businessUse}`,
        requirement_details: {
          category: formData.category,
          listing_type: formData.listingType,
          max_budget: formData.budget,
          furnishing: formData.furnishing,
          preferred_locations: [formData.preferredLocations],
        },
        preferred_visit_date: formData.preferredDate,
        preferred_visit_time: formData.preferredTime,
        source_page: '/tell-us-requirement',
        lead_source: 'website',
      });
      setSubmitted(true);
    } catch (err) {
      setError('Error submitting requirement. Please connect via WhatsApp or Phone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Property Finder', path: '/properties' },
          { label: 'Post Your Requirement' }
        ]}
      />

      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0B132B]/85 shadow-2xl">
        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              Requirement Dossier Logged
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
              Thank you, <strong>{formData.name}</strong>. Your commercial space requirement has been dispatched to our senior leasing desk. A consultant will review matching floor plans and contact you shortly.
            </p>
            <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/properties" className="btn-glass-primary px-6 py-2.5 rounded-xl text-sm font-semibold">
                Explore Public Listings
              </Link>
              <a
                href={`https://wa.me/919811234567?text=${encodeURIComponent(
                  `Hello Shristi Estate, I just submitted my requirement for ${formData.requiredArea} in ${formData.preferredLocations}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Connect on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Custom Space Acquisition
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
                Tell Us What Property You Need
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Our team will search verified offline inventory across all major IT parks, logistics parks, and industrial corridors in Noida & NCR.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Row 2: Requirement Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Intent (Buy / Rent / Lease)
                  </label>
                  <select
                    value={formData.listingType}
                    onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Lease">Corporate Lease</option>
                    <option value="Sale">Outright Purchase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Asset Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  >
                    <option value="office-space">Office Spaces</option>
                    <option value="it-business-parks">IT & Business Parks</option>
                    <option value="warehouses">Warehouses & Logistics</option>
                    <option value="factory-industrial">Factory & Industrial Units</option>
                    <option value="land">Commercial Land</option>
                    <option value="shops-retail">Shops & Retail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Required Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2,500 sq.ft or 20,000 sq.ft"
                    value={formData.requiredArea}
                    onChange={(e) => setFormData({ ...formData, requiredArea: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Row 3: Locations & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Preferred Locations / Sectors
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 62, Expressway, Sector 83"
                    value={formData.preferredLocations}
                    onChange={(e) => setFormData({ ...formData, preferredLocations: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Budget (per month / total)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1,50,000/mo or ₹5 Cr"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Furnishing Preference
                  </label>
                  <select
                    value={formData.furnishing}
                    onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  >
                    <option value="Furnished">Fully Furnished</option>
                    <option value="Plug-and-Play">Plug-and-Play (IT)</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Bare Shell">Bare Shell</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Business Use */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Business / Industrial Use & Seating Plan
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Software development agency with 40 workstations, need 2 cabins, or pharmaceutical storage with 30ft ceiling..."
                  value={formData.businessUse}
                  onChange={(e) => setFormData({ ...formData, businessUse: e.target.value })}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>

              {/* Consent */}
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="req-consent"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-1 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="req-consent" className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  I agree to allow Shristi Estate commercial advisors to send property recommendations and schedule site inspections.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-glass-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Submitting Requirement...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Commercial Requirement</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
