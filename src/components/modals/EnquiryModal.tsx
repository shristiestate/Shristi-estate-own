import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  MessageSquare 
} from 'lucide-react';
import { Property, Lead } from '../../types';
import { StorageService } from '../../services/storageService';
import { WhatsAppIcon } from '../common/SocialIcons';
import { generatePropertyWhatsAppLink, generateGeneralEnquiryWhatsAppLink } from '../../utils/whatsapp';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  buildingName?: string;
  locationName?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  property,
  buildingName,
  locationName,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    inquiryType: 'Rent',
    preferredDate: '',
    preferredTime: '',
    message: '',
    consent: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation per section 78
    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!formData.consent) {
      setError('Please acknowledge consent to receive property details.');
      return;
    }

    setLoading(true);

    try {
      await StorageService.createLead({
        lead_type: formData.preferredDate ? 'site_visit' : 'enquiry',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferred_contact_method: 'phone',
        message: formData.message || `Inquiry for ${property ? property.title : 'commercial space'}`,
        property_id: property?.id,
        property_title: property?.title,
        building_id: property?.building_id,
        building_name: property?.building_name || buildingName,
        location_id: property?.location_id,
        location_name: property?.location_name || locationName,
        preferred_visit_date: formData.preferredDate,
        preferred_visit_time: formData.preferredTime,
        source_page: window.location.pathname,
        lead_source: 'website',
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Lead submission failed:', err);
      setError('Failed to submit requirement. Please try again or WhatsApp us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      inquiryType: 'Rent',
      preferredDate: '',
      preferredTime: '',
      message: '',
      consent: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Frosted Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={handleResetAndClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl glass-card rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-[#0B132B]/95 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 my-8">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          /* Confirmation Message */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Requirement Received
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{formData.name}</strong>. Your inquiry has been received. A dedicated Shristi Estate commercial specialist will contact you shortly with verified inventory options.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleResetAndClose}
                className="btn-glass-primary w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold"
              >
                Done
              </button>
              <a
                href={
                  property
                    ? generatePropertyWhatsAppLink(property, formData.name)
                    : generateGeneralEnquiryWhatsAppLink({
                        propertyName: buildingName || 'Commercial Space',
                        location: locationName || 'Noida / NCR',
                        clientName: formData.name,
                      })
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Connect on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          /* Enquiry Form */
          <div>
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
                Commercial Advisory Desk
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
                {property ? 'Enquire About Property' : 'Commercial Space Enquiry'}
              </h2>

              {/* Property / Building Context Pill */}
              {(property || buildingName) && (
                <div className="mt-3 p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200">
                  <Building2 className="w-4 h-4 text-brand-500 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold">{property?.title || buildingName}</span>
                    {(property?.building_name || property?.location_name || locationName) && (
                      <span className="text-slate-500 dark:text-slate-400 ml-1">
                        • {property?.building_name ? `${property.building_name}, ` : ''}{property?.location_name || locationName}
                      </span>
                    )}
                  </div>
                  {property?.reference_number && (
                    <span className="ml-auto px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono font-bold shrink-0">
                      {property.reference_number}
                    </span>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Malhotra"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 8750098666"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate / Business Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Inquiry Type & Site Visit Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requirement
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-sm"
                  >
                    <option value="Rent">Rent / Lease</option>
                    <option value="Buy">Outright Purchase</option>
                    <option value="Consultation">General Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Visit Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="glass-input w-full px-3 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-sm"
                  >
                    <option value="">Anytime</option>
                    <option value="Morning (10 AM - 1 PM)">10 AM – 1 PM</option>
                    <option value="Afternoon (1 PM - 4 PM)">1 PM – 4 PM</option>
                    <option value="Evening (4 PM - 7 PM)">4 PM – 7 PM</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specific Requirements or Questions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Expected team size, move-in timeframe, budget parameters..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="consent-check"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="consent-check" className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  I consent to Shristi Estate commercial advisors contacting me via Call/WhatsApp/Email regarding this property requirement.
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glass-primary flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Request Details & Site Visit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
