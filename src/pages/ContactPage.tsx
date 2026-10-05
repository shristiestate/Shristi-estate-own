import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { WhatsAppIcon } from '../components/common/SocialIcons';
import { generateGeneralEnquiryWhatsAppLink } from '../utils/whatsapp';
import { handleOverviewPaste } from '../utils/textFormat';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Commercial Enquiry',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setLoading(true);

    const waUrl = generateGeneralEnquiryWhatsAppLink({
      propertyName: formData.subject || 'Commercial Space Enquiry',
      clientName: formData.name,
    });

    try {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (openErr) {
      console.warn('Could not auto open WhatsApp:', openErr);
    }

    try {
      await StorageService.createLead({
        lead_type: 'general',
        name: formData.name,
        email: formData.email || 'contact@shristiestate.in',
        phone: formData.phone,
        preferred_contact_method: 'phone',
        message: `${formData.subject}: ${formData.message}`,
        source_page: '/contact',
        lead_source: 'website',
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumbs
        items={[
          { label: 'Contact Us' }
        ]}
      />

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          Get in Touch
        </span>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Contact Shristi Estate
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          Visit our corporate office at I-Thum Tower, Sector 62, Noida, or connect directly with our commercial specialists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Contact Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-none p-6 sm:p-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] space-y-5">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              Corporate Headquarters
            </h2>

            <div className="space-y-3.5 text-xs font-sans">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-none bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
                  <MapPin className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Registered Address</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-snug mt-0.5">
                    Unit No. 1035, 10th Floor, Tower-B, iThum Tower, Plot No. A-40, Sector-62, Noida, Uttar Pradesh 201309
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-none bg-accent-teal/10 text-accent-teal flex items-center justify-center shrink-0 border border-accent-teal/20">
                  <Phone className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Direct Telephone</span>
                  <a href="tel:+918750098666" className="text-slate-800 dark:text-slate-200 font-semibold hover:text-brand-600 mt-0.5 block">
                    +91 87500 98666
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-none bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <Mail className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Corporate Email</span>
                  <a href="mailto:contact@shristiestate.in" className="text-slate-800 dark:text-slate-200 font-semibold hover:text-brand-600 mt-0.5 block">
                    contact@shristiestate.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                  <Clock className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Consultation Hours</span>
                  <p className="text-slate-800 dark:text-slate-200 text-xs mt-0.5">
                    Monday to Saturday: 9:30 AM – 7:30 PM <br />
                    Sunday: Assisted Site Visits by Appointment
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <a
                href={generateGeneralEnquiryWhatsAppLink({
                  propertyName: formData.subject || 'Commercial Space Enquiry',
                  clientName: formData.name,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full py-2.5 rounded-none font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Chat Direct on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-none p-6 sm:p-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] space-y-5">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              Send an Advisory Inquiry
            </h2>

            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-semibold">Message Dispatched</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto font-sans">
                  Thank you for writing to Shristi Estate. An advisor will contact you within business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-glass-primary px-4 py-2 rounded-none text-xs font-semibold uppercase tracking-wider mt-2"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Varma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="Office Space Enquiry">Office Space Enquiry</option>
                      <option value="Warehouse / Logistics">Warehouse / Logistics</option>
                      <option value="Industrial Unit / Shed">Industrial Unit / Shed</option>
                      <option value="Site Visit Booking">Site Visit Booking</option>
                      <option value="General Commercial Enquiry">General Commercial Enquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Your Requirements / Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your space requirement, team size, desired location or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    onPaste={(e) => handleOverviewPaste(e, (val) => setFormData({ ...formData, message: val }), formData.message)}
                    className="overview-input w-full px-3 py-2 rounded-none text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glass-primary w-full py-2.5 rounded-none font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <span>Sending...</span> : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Advisory Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
