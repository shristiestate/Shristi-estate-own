import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Phone, 
  MessageSquareText, 
  Calendar, 
  X, 
  ChevronRight, 
  Headphones, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import { WhatsAppIcon } from './SocialIcons';
import { generateGeneralEnquiryWhatsAppLink, WHATSAPP_NUMBER } from '../../utils/whatsapp';

interface FloatingQuickActionsProps {
  onOpenEnquiry: () => void;
}

export const FloatingQuickActions: React.FC<FloatingQuickActionsProps> = ({ onOpenEnquiry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTucked, setIsTucked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Auto-hide or tuck slightly on fast downward scroll, reveal on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 120) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }

      // If menu is open, don't auto-tuck
      if (isOpen) {
        lastScrollY.current = currentScrollY;
        return;
      }

      // Auto-tuck when scrolling down quickly on long pages, un-tuck when scrolling up
      if (currentScrollY > 400 && currentScrollY - lastScrollY.current > 40) {
        setIsTucked(true);
      } else if (lastScrollY.current - currentScrollY > 25) {
        setIsTucked(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Dismiss tooltip after 7 seconds or on scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  // Handle click outside to close the speed-dial
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
    setShowTooltip(false);
    if (isTucked) setIsTucked(false);
  }, [isTucked]);

  const toggleTuck = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTucked(prev => !prev);
    setIsOpen(false);
  }, []);

  const handleEnquiryClick = () => {
    setIsOpen(false);
    onOpenEnquiry();
  };

  const whatsappHref = generateGeneralEnquiryWhatsAppLink({
    propertyName: 'Commercial Property Options & Advisory',
  });

  return (
    <aside 
      ref={containerRef}
      aria-label="Quick Connect & Enquiries"
      className="fixed z-40 select-none transition-all duration-300 ease-out bottom-20 sm:bottom-8 right-3 sm:right-7"
    >
      {/* TUCKED / HIDDEN TAB STATE */}
      {isTucked ? (
        <button
          onClick={() => setIsTucked(false)}
          className="group flex items-center gap-2 pl-3 pr-2.5 py-2.5 bg-white/95 dark:bg-[#0B132B]/95 text-slate-800 dark:text-slate-100 border border-brand-500/30 dark:border-brand-400/30 shadow-glass-lg backdrop-blur-xl transition-all duration-300 hover:translate-x-0 translate-x-2 hover:shadow-glow-cyan"
          title="Open Quick Contact"
          aria-label="Expand Quick Contact"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="absolute w-4 h-4 rounded-full bg-emerald-500/30 animate-ping" />
          </div>
          <Headphones className="w-4 h-4 text-brand-600 dark:text-brand-400 transition-transform group-hover:scale-110" />
          <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">
            Quick Contact
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-transform group-hover:translate-x-0.5" />
        </button>
      ) : (
        <div className="flex flex-col items-end">
          {/* EXPANDED SPEED-DIAL ACTIONS PALETTE */}
          {isOpen && (
            <div 
              role="dialog"
              aria-label="Contact options"
              className="flex flex-col gap-2.5 mb-3 items-end w-72 sm:w-80 animate-fab-spring-up"
            >
              {/* Card Header with Status */}
              <div className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-100/90 dark:bg-[#070C1E]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                    Advisors Online
                  </span>
                  <span className="text-slate-400">• Avg reply: 5m</span>
                </div>
              </div>

              {/* ACTION 1: INSTANT ENQUIRY MODAL */}
              <button
                onClick={handleEnquiryClick}
                className="group w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-white via-white to-brand-50/60 dark:from-[#0B132B] dark:via-[#0E1838] dark:to-[#082f49]/40 border border-slate-200 dark:border-brand-500/30 hover:border-brand-500 shadow-glass dark:shadow-glass-dark backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-cyan text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-200">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                        Send Enquiry
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                        Priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Book site visits & tailored listings
                    </p>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-brand-500 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>

              {/* ACTION 2: WHATSAPP CHAT */}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="group w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-white via-white to-emerald-50/60 dark:from-[#0B132B] dark:via-[#0c1f1f] dark:to-[#064e3b]/30 border border-slate-200 dark:border-emerald-500/30 hover:border-emerald-500 shadow-glass dark:shadow-glass-dark backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-teal text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#25D366]/10 dark:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 group-hover:bg-[#25D366] group-hover:text-white transition-colors duration-200">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                        WhatsApp Chat
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Instant
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Direct broker chat & floor plans
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              {/* ACTION 3: DIRECT PHONE CALL */}
              <a
                href="tel:+918750098666"
                onClick={() => setIsOpen(false)}
                className="group w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-white via-white to-sky-50/60 dark:from-[#0B132B] dark:via-[#0c1b33] dark:to-[#0284c7]/30 border border-slate-200 dark:border-sky-500/30 hover:border-sky-500 shadow-glass dark:shadow-glass-dark backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-cyan text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-200">
                    <Phone className="w-5 h-5 group-hover:animate-fab-phone-wiggle" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                        Call Advisory
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        Toll Free
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      +91 87500 98666 • Speak with expert
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-sky-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </div>
          )}

          {/* MAIN FLOATING TRIGGER ROW */}
          <div className="flex items-center gap-2">
            {/* Tooltip Badge (Visible on desktop initially or when not open) */}
            {showTooltip && !isOpen && (
              <div 
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/95 dark:bg-[#0B132B]/95 text-slate-900 dark:text-white text-xs font-semibold shadow-glass border border-slate-200 dark:border-brand-500/40 backdrop-blur-md animate-popup-spring"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Enquire or Chat</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white ml-1"
                  aria-label="Dismiss tooltip"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Primary Action Button (FAB) */}
            <button
              onClick={toggleOpen}
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              className={`relative flex items-center justify-center w-14 h-14 sm:w-14 sm:h-14 rounded-none transition-all duration-300 shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                isOpen 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rotate-90 border border-slate-700 dark:border-white' 
                  : 'bg-gradient-to-br from-brand-500 via-brand-600 to-sky-700 text-white border border-brand-400/50 hover:scale-105 active:scale-95 shadow-glow-cyan'
              }`}
              title={isOpen ? 'Close menu' : 'Quick Connect: Enquiry, WhatsApp, Call'}
              aria-label={isOpen ? 'Close contact options' : 'Open contact options'}
            >
              {/* Subtle outer pulsing aura ring when closed */}
              {!isOpen && (
                <>
                  <span className="absolute -inset-1 border border-brand-400/40 pointer-events-none animate-ping opacity-30" />
                  <span className="absolute -inset-2 border border-brand-400/20 pointer-events-none opacity-40" />
                </>
              )}

              {isOpen ? (
                <X className="w-6 h-6 transition-transform duration-200 -rotate-90" />
              ) : (
                <div className="relative flex items-center justify-center">
                  <MessageSquareText className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                  {/* Active online notification dot */}
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-emerald-400 border-2 border-brand-600 rounded-full" />
                </div>
              )}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
