import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { WhatsAppIcon } from '../components/common/SocialIcons';

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
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          Contact Shristi Estate
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Visit our corporate office at I-Thum Tower, Sector 62, Noida, or connect directly with our commercial specialists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Corporate Headquarters
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Registered Address</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-snug mt-0.5">
                    Unit No. 1035, 10th Floor, Tower-B, iThum Tower, Plot No. A-40, Sector-62, Noida, Uttar Pradesh 201309
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 text-accent-teal flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Direct Telephone</span>
                  <a href="tel:+918750098666" className="text-slate-800 dark:text-slate-200 font-semibold hover:text-brand-600 mt-0.5 block">
                    +91 87500 98666
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Corporate Email</span>
                  <a href="mailto:contact@shristiestate.in" className="text-slate-800 dark:text-slate-200 font-semibold hover:text-brand-600 mt-0.5 block">
                    contact@shristiestate.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Consultation Hours</span>
                  <p className="text-slate-800 dark:text-slate-200 text-xs mt-0.5">
                    Monday to Saturday: 9:30 AM – 7:30 PM <br />
                    Sunday: Assisted Site Visits by Appointment
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <a
                href="https://wa.me/918750098666?text=Hello%20Shristi%20Estate,%20I%20would%20like%20to%20connect%20with%20your%20commercial%20team."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Chat Direct on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Send an Advisory Inquiry
            </h2>

            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-xl font-bold">Message Dispatched</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Thank you for writing to Shristi Estate. An advisor will contact you within business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-glass-primary px-5 py-2 rounded-xl text-xs font-semibold mt-2"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Varma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Requirements / Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your space requirement, team size, desired location or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glass-primary w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <span>Sending...</span> : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
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
