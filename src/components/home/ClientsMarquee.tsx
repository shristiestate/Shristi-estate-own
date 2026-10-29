import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Briefcase, 
  Globe, 
  ArrowUpRight 
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { ClientLogo } from '../../types';

export const ClientsMarquee: React.FC = () => {
  const [clients, setClients] = useState<ClientLogo[]>(() => {
    return StorageService.getInitialClients().filter(c => c.published !== false);
  });
  const [selectedClient, setSelectedClient] = useState<ClientLogo | null>(null);

  useEffect(() => {
    StorageService.getClients().then((data) => {
      if (Array.isArray(data)) {
        setClients(data.filter(c => c.published !== false));
      }
    });
  }, []);

  if (!clients || clients.length === 0) return null;

  // Ensure plenty of duplicated items for a completely seamless, gap-free infinite scroll
  const repeatCount = Math.max(4, Math.ceil(16 / Math.max(1, clients.length)));
  const trackItems = Array.from({ length: repeatCount }, () => clients).flat();

  const handleCardClick = (client: ClientLogo) => {
    setSelectedClient(client);
  };

  return (
    <section className="relative w-full py-6 sm:py-8 overflow-hidden">
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-6 px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-[11px] font-semibold mb-3 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
          <span>Our Corporate Occupiers & Brand Partners</span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
          Trusted by Industry Leaders
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 font-sans max-w-2xl mx-auto">
          Advising multinational corporations, Fortune 500 enterprises, and fast-growing technology companies across Noida and Delhi NCR commercial corridors.
        </p>
      </div>

      {/* INFINITE SLIDING MARQUEE CONTAINER (CSS ALPHA MASK ELIMINATES OPAQUE WHITE BOXES) */}
      <div 
        className="group relative w-full overflow-hidden py-6 select-none"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        {/* HARDWARE-ACCELERATED GAPLESS SLIDING TRACK */}
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] will-change-transform">
          {/* Primary Track */}
          <div className="flex shrink-0 items-center gap-3.5 sm:gap-4 pr-3.5 sm:pr-4">
            {trackItems.map((client, idx) => (
              <BrandCard
                key={`client-${client.id}-${idx}`}
                client={client}
                onClick={() => handleCardClick(client)}
              />
            ))}
          </div>
          {/* Duplicate Track for 100% gapless seamless looping */}
          <div 
            className="flex shrink-0 items-center gap-3.5 sm:gap-4 pr-3.5 sm:pr-4"
            aria-hidden="true"
          >
            {trackItems.map((client, idx) => (
              <BrandCard
                key={`client-dup-${client.id}-${idx}`}
                client={client}
                onClick={() => handleCardClick(client)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CLIENT / BRAND DETAIL POP-UP MODAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-md bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl animate-popup-spring"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedClient(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-lg bg-slate-50 dark:bg-slate-850 p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                {selectedClient.logo ? (
                  <img
                    src={selectedClient.logo}
                    alt={selectedClient.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-brand-500" />
                )}
              </div>
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-sm mb-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Corporate Occupier</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-sans">
                  {selectedClient.name}
                </h3>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
              {selectedClient.industry && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Industry Sector
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedClient.industry}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-500" /> Representation
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Institutional Real Estate Advisory
                </span>
              </div>

              {selectedClient.website_url && (
                <div className="pt-2">
                  <a
                    href={selectedClient.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass-primary w-full py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Visit Company Website</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

interface BrandCardProps {
  client: ClientLogo;
  onClick: () => void;
}

const BrandCard: React.FC<BrandCardProps> = ({ client, onClick }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group/card relative flex flex-col items-center justify-center w-44 sm:w-52 h-26 sm:h-28 px-4 py-2.5 bg-white/85 dark:bg-[#0B132B]/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-brand-500/80 dark:hover:border-brand-400 hover:shadow-xl dark:hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer select-none text-center shrink-0"
    >
      {/* FLOATING BRAND NAME POP-UP BALLOON / TOOLTIP (SPRINGS UP ON HOVER) */}
      <div 
        className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover/card:opacity-100 group-hover/card:-top-13 scale-75 group-hover/card:scale-100 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-40 whitespace-nowrap"
      >
        <div className="px-3 py-1.5 bg-slate-900/95 dark:bg-brand-950/95 text-white text-[11px] font-bold shadow-2xl border border-brand-500/40 flex items-center gap-1.5 backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-brand-400" />
          <span className="font-sans font-extrabold tracking-wide text-brand-200">
            {client.name}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 bg-brand-500/30 text-brand-300 font-mono">
            Occupier
          </span>
          {/* Triangular Pointer Beak */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-brand-950 border-r border-b border-brand-500/40" />
        </div>
      </div>

      {/* LOGO CONTAINER */}
      <div className="w-14 h-10 sm:w-16 sm:h-11 overflow-hidden flex items-center justify-center mb-1.5 transition-transform duration-300 group-hover/card:scale-110">
        {client.logo ? (
          <img
            src={client.logo}
            alt={client.name}
            loading="lazy"
            decoding="async"
            className="max-w-full max-h-full object-contain filter grayscale opacity-75 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <Building2 className="w-6 h-6 text-slate-400 group-hover/card:text-brand-500 transition-colors" />
        )}
      </div>

      {/* BRAND NAME */}
      <div className="relative w-full overflow-hidden flex flex-col items-center">
        <span className="font-bold text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 font-sans group-hover/card:text-brand-600 dark:group-hover/card:text-brand-400 transition-colors truncate max-w-full block">
          {client.name}
        </span>

        {client.industry && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-full block mt-0.5 font-medium transition-colors group-hover/card:text-slate-600 dark:group-hover/card:text-slate-300">
            {client.industry}
          </span>
        )}
      </div>

      {/* Subtle corner accent indicator on hover */}
      <div className="absolute bottom-1 right-1 opacity-0 group-hover/card:opacity-100 transition-opacity text-brand-500">
        <ExternalLink className="w-2.5 h-2.5" />
      </div>
    </div>
  );
};

export default ClientsMarquee;
