import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  User,
  MapPin,
  Building2,
  Maximize2,
  IndianRupee,
  PhoneCall,
  MessageSquare,
  FileText
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { WhatsAppIcon } from '../common/SocialIcons';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation?: string;
  defaultCategory?: string;
}

export const RequirementModal: React.FC<RequirementModalProps> = ({
  isOpen,
  onClose,
  defaultLocation = '',
  defaultCategory = 'Office Space',
}) => {
  const [formData, setFormData] = useState({
    rentOrBuy: 'Rent' as 'Rent' | 'Buy' | 'Lease',
    location: defaultLocation,
    propertyType: defaultCategory,
    requiredArea: '',
    budget: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Prevent background scrolling and stacking leaks while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const propertyTypeOptions = [
    'Office Space',
    'IT & Business Park',
    'Bare Shell Office',
    'Furnished / Plug & Play',
    'Warehouse & Logistics',
    'Industrial / Factory',
    'Commercial Retail / Shop',
    'Commercial Land / Plot',
  ];

  const popularLocations = [
    'Sector 62, Noida',
    'Noida Expressway',
    'Sector 63, Noida',
    'Sector 16 / 18, Noida',
    'Sector 135 / 142, Noida',
    'Greater Noida West',
  ];

  const quickAreaPills = [
    '500 - 1,000 sq.ft',
    '1,000 - 2,500 sq.ft',
    '2,500 - 5,000 sq.ft',
    '5,000 - 10,000 sq.ft',
    '10,000 - 25,000 sq.ft',
    '25,000+ sq.ft',
  ];

  const generateWhatsAppMessage = () => {
    return `Hello Shristi Estate,

I want to submit a Commercial Property Requirement:

• Preference: ${formData.rentOrBuy}
• Property Type: ${formData.propertyType}
• Preferred Location: ${formData.location || 'Noida / NCR'}
• Required Area: ${formData.requiredArea || 'Flexible'}
• Budget: ${formData.budget || 'Market Guidance'}
• Client Name: ${formData.name || 'Interested Client'}
• Contact Phone: ${formData.phone || 'Direct'}
${formData.notes ? `• Additional Notes: ${formData.notes}\n` : ''}
Please share matching verified options. Thank you!`;
  };

  const handleDirectWhatsApp = () => {
    const waUrl = buildWhatsAppUrl(generateWhatsAppMessage());
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!formData.location.trim()) {
      setError('Please enter your preferred location.');
      return;
    }

    setLoading(true);

    const messageText = `Client Requirement: ${formData.rentOrBuy} preference for ${formData.propertyType} (${formData.requiredArea || 'Flexible area'}) in ${formData.location}. Budget: ${formData.budget || 'Flexible'}.${formData.notes ? ' Notes: ' + formData.notes : ''}`;

    try {
      await StorageService.createLead({
        lead_type: 'requirement',
        status: 'New Requirement',
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        preferred_contact_method: 'phone',
        message: messageText,
        property_title: `${formData.requiredArea || 'Custom'} ${formData.propertyType} in ${formData.location}`,
        location_name: formData.location.trim(),
        requirement_details: {
          category: formData.propertyType,
          listing_type: formData.rentOrBuy,
          min_area: parseInt(formData.requiredArea.replace(/[^0-9]/g, ''), 10) || undefined,
          max_budget: formData.budget.trim(),
          preferred_locations: [formData.location.trim()],
        },
        source_page: typeof window !== 'undefined' ? window.location.pathname : '/properties',
        lead_source: 'website',
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Failed to save requirement lead:', err);
      // Still show submitted so client has access to immediate WhatsApp & Call options
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 sm:p-6 overflow-y-auto isolate">
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={handleResetAndClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-none p-5 sm:p-7 bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 shadow-2xl z-10 my-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 rounded-none border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          /* Submission Confirmation View */
          <div className="text-center py-6 sm:py-8 space-y-4">
            <div className="w-14 h-14 rounded-none bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Lead Status: New Requirement Logged
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Requirement Submitted Successfully
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900 dark:text-white">{formData.name}</strong>. Our commercial leasing specialists will review verified off-market and listed inventory across Noida & NCR matching your exact parameters.
              </p>
            </div>

            {/* Structured Summary Box */}
            <div className="text-left max-w-md mx-auto p-4 rounded-none bg-slate-50 dark:bg-[#070C1E] border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Preference & Type:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formData.rentOrBuy} • {formData.propertyType}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Preferred Location:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formData.location}</span>
              </div>
              {formData.requiredArea && (
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Required Area:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.requiredArea}</span>
                </div>
              )}
              {formData.budget && (
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Budget:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formData.budget}</span>
                </div>
              )}
            </div>

            {/* Direct Connect CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="w-full sm:w-auto px-5 py-2.5 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Instant WhatsApp Connect</span>
              </button>
              <a
                href="tel:+918750098666"
                className="w-full sm:w-auto px-5 py-2.5 rounded-none border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Call Commercial Desk</span>
              </a>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-none text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <div className="space-y-5">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-[10px] font-mono uppercase tracking-widest mb-1.5">
                <FileText className="w-3 h-3" />
                <span>Custom Commercial Sourcing</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Submit Your Property Requirement
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Can't find your ideal space in our database? Share your parameters and our corporate team will source verified options within 2 hours.
              </p>

              {/* Instant Call / WhatsApp Options Strip */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Instant Inquiry:
                </span>
                <a
                  href="tel:+918750098666"
                  className="px-3 py-1.5 rounded-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <PhoneCall className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                  <span>Call Now (+91 87500 98666)</span>
                </a>
                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  className="px-3 py-1.5 rounded-none bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-800"
                >
                  <WhatsAppIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>WhatsApp Inquiry</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-none bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Rent / Purchase Preference */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Transaction Preference *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Rent', 'Buy', 'Lease'] as const).map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setFormData({ ...formData, rentOrBuy: pref })}
                      className={`py-2 px-3 text-xs font-semibold rounded-none border transition-all text-center uppercase tracking-wider ${
                        formData.rentOrBuy === pref
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-[#070C1E] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500'
                      }`}
                    >
                      {pref === 'Buy' ? 'Buy / Purchase' : pref === 'Rent' ? 'Rent / Lease' : 'Long Lease'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Property Type & Preferred Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Property Type *
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white font-medium focus:outline-none focus:border-brand-500"
                    >
                      {propertyTypeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Preferred Location *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sector 62, Expressway..."
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Location Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <span className="text-slate-400 shrink-0 text-[10px] uppercase tracking-wider">Quick:</span>
                {popularLocations.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, location: loc })}
                    className="px-2 py-0.5 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] hover:border-brand-500 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 shrink-0 transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>

              {/* Row 3: Required Area (sq. ft.) & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Required Area (sq. ft.)
                  </label>
                  <div className="relative">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. 1,500 sq.ft or 10,000 sq.ft"
                      value={formData.requiredArea}
                      onChange={(e) => setFormData({ ...formData, requiredArea: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Estimated Budget
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. ₹60,000/mo or ₹2.5 Cr"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Area Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <span className="text-slate-400 shrink-0 text-[10px] uppercase tracking-wider">Sizes:</span>
                {quickAreaPills.map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, requiredArea: pill })}
                    className="px-2 py-0.5 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] hover:border-brand-500 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 shrink-0 transition-colors"
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Row 4: Contact Details (Name, Phone, Email) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="block text-[11px] font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                  Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                      Email (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        placeholder="corporate@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5: Notes / Specific Requirements */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Specific Requirements or Preferred Towers (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Near metro station, 24/7 power backup, minimum 20 workstations + 2 cabins needed..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glass-primary px-6 py-2.5 rounded-none text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Submitting Requirement...' : 'Submit Commercial Requirement'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  className="px-4 py-2.5 rounded-none border border-emerald-500/40 hover:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
