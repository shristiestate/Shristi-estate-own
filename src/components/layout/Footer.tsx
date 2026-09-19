import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { 
  WhatsAppIcon, 
  LinkedInIcon, 
  InstagramIcon, 
  YouTubeIcon, 
  FacebookIcon 
} from '../common/SocialIcons';
import { generateGeneralEnquiryWhatsAppLink } from '../../utils/whatsapp';
import { ScrollReveal } from '../common/ScrollReveal';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 relative overflow-hidden">
      {/* Decorative ambient glass glow (strictly corporate blue/cyan, no gold) */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-accent-teal/10 rounded-full blur-3xl pointer-events-none" />

      {/* Professional Optimized Width Container (max-w-[1440px] with balanced padding) */}
      <div className="max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        <ScrollReveal variant="stagger" stagger={0.08}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8 xl:gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Corporate Overview */}
          <div className="space-y-4">
            <Logo theme="dark" />
            
            <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">
              Premier commercial real estate consultancy in Noida &amp; Delhi NCR. Specializing in corporate leasing, IT parks, warehousing, and commercial investment advisory.
            </p>

            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Verified Commercial Advisory</span>
            </div>
            
            {/* Social Media & Instant Channels */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 font-['Outfit']">
                Connect With Us
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {/* WhatsApp */}
                <a
                  href={generateGeneralEnquiryWhatsAppLink({ propertyName: 'Commercial Advisory & Listings' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat direct on WhatsApp"
                  className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-[#25D366] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#25D366]/30 border border-slate-700/80 hover:border-[#25D366] group"
                  title="WhatsApp: +91 87500 98666"
                >
                  <WhatsAppIcon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/sanjeet-kumar-885615433/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Sanjeet Kumar on LinkedIn"
                  className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-[#0A66C2] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#0A66C2]/30 border border-slate-700/80 hover:border-[#0A66C2] group"
                  title="LinkedIn: Sanjeet Kumar"
                >
                  <LinkedInIcon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/shristi_estate01/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Shristi Estate on Instagram"
                  className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#DD2A7B]/30 border border-slate-700/80 hover:border-pink-500 group"
                  title="Instagram: @shristi_estate01"
                >
                  <InstagramIcon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/channel/UC9aTbGlGuHQQb-0r1iYmc7g"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Subscribe to Shristi Estate on YouTube"
                  className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-[#FF0000] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#FF0000]/30 border border-slate-700/80 hover:border-[#FF0000] group"
                  title="YouTube: Shristi Estate Channel"
                >
                  <YouTubeIcon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=61594054720145"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Shristi Estate on Facebook"
                  className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-[#1877F2] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#1877F2]/30 border border-slate-700/80 hover:border-[#1877F2] group"
                  title="Facebook: Shristi Estate Official"
                >
                  <FacebookIcon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Commercial Spaces Silo */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-['Outfit'] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
              <span>Commercial Spaces</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-400">
              <li>
                <Link to="/office-space" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Office Spaces
                </Link>
              </li>
              <li>
                <Link to="/it-business-parks" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  IT &amp; Business Parks
                </Link>
              </li>
              <li>
                <Link to="/warehouses" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Warehouses &amp; Logistics
                </Link>
              </li>
              <li>
                <Link to="/factory-industrial" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Factory &amp; Industrial Units
                </Link>
              </li>
              <li>
                <Link to="/land" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Commercial Land Parcels
                </Link>
              </li>
              <li>
                <Link to="/shops" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Shops &amp; Retail Outlets
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 pt-1 transition-colors">
                  View All Listings <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Prime Locations Silo */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-['Outfit'] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
              <span>Prime Locations</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-400">
              <li>
                <Link to="/locations/sector-62" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Sector 62, Noida
                </Link>
              </li>
              <li>
                <Link to="/locations/sector-63" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Sector 63, Noida
                </Link>
              </li>
              <li>
                <Link to="/locations/noida-expressway" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Noida Expressway
                </Link>
              </li>
              <li>
                <Link to="/locations/sector-18" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Sector 18 (Retail Hub)
                </Link>
              </li>
              <li>
                <Link to="/locations/sector-83" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Sector 83 (Logistics Hub)
                </Link>
              </li>
              <li>
                <Link to="/locations/sector-85" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Sector 85 (Industrial Zone)
                </Link>
              </li>
              <li>
                <Link to="/locations" className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 pt-1 transition-colors">
                  All Noida Locations <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Advisory */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-['Outfit'] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
              <span>Company &amp; Advisory</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  About Shristi Estate
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Consulting Services
                </Link>
              </li>
              <li>
                <Link to="/list-your-property" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link to="/tell-us-requirement" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Post Your Requirement
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Contact Advisory Desk
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white hover:translate-x-0.5 transition-all duration-150 block">
                  Market Insights &amp; Guides
                </Link>
              </li>
              <li>
                <a 
                  href="/sitemap.xml" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 pt-1 transition-colors"
                >
                  XML Sitemap <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Registered Office & Helpdesk */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-['Outfit'] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>Registered Office</span>
            </h3>
            <div className="space-y-3 text-xs sm:text-[13px]">
              {/* Address card */}
              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-semibold text-white block">Tower-B, iThum Tower</span>
                  <span className="text-slate-400">Unit 1035, 10th Floor, Plot A-40, Sector-62, Noida 201309</span>
                </div>
              </div>

              {/* Direct phone */}
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Direct Advisory Line</span>
                  <a href="tel:+918750098666" className="text-xs sm:text-[13px] font-bold text-white hover:text-brand-400 transition-colors tracking-wide">
                    +91 87500 98666
                  </a>
                </div>
              </div>

              {/* Official email */}
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Official Inquiries</span>
                  <a href="mailto:contact@shristiestate.in" className="text-xs sm:text-[13px] text-slate-300 hover:text-white transition-colors font-medium">
                    contact@shristiestate.in
                  </a>
                </div>
              </div>

              {/* Consultation hours */}
              <div className="flex items-start gap-2.5 text-slate-300">
                <Clock className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Consultation Hours</span>
                  <span className="text-slate-300 block font-medium">Mon – Sat: 9:30 AM – 7:30 PM</span>
                  <span className="text-slate-500 text-[11px]">Sunday by Appointment</span>
                </div>
              </div>

              {/* Instant WhatsApp Helpdesk Action Button */}
              <div className="pt-1.5">
                <a
                  href={generateGeneralEnquiryWhatsAppLink({ propertyName: 'Commercial Property Consultation' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-[#25D366] text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/80 hover:border-[#25D366] transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-[#25D366]/20 group"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
                  <span>Instant Consultation Desk</span>
                </a>
              </div>
            </div>
          </div>

        </div>
        </ScrollReveal>

        {/* Disclaimer & Legal Links */}
        <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <p className="leading-relaxed text-center lg:text-left max-w-3xl text-xs text-slate-400">
            <strong className="text-slate-300 font-semibold">Regulatory Disclaimer:</strong> Shristi Estate is an independent commercial real estate advisory consultancy. All property listings, floor areas, lease tariffs, and building specifications are indicative and subject to formal verification, due diligence, and mutual agreements between landlords, buyers, and tenants.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-5 gap-y-2 shrink-0 font-medium text-xs text-slate-400">
            <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-slate-700 select-none hidden sm:inline">•</span>
            <Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-slate-700 select-none hidden sm:inline">•</span>
            <Link to="/legal/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            <span className="text-slate-700 select-none hidden sm:inline">•</span>
            <a 
              href="/sitemap.xml" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors flex items-center gap-1"
            >
              XML Sitemap <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Copyright & Accreditation */}
        <div className="pt-6 mt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Shristi Estate (shristiestate.in). All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grade-A Commercial Advisory • Noida &amp; Delhi NCR</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
