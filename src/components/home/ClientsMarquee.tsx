import React, { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink, Sparkles, Building2 } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { ClientLogo } from '../../types';

export const ClientsMarquee: React.FC = () => {
  const [clients, setClients] = useState<ClientLogo[]>(() => {
    return StorageService.getInitialClients().filter(c => c.published);
  });

  useEffect(() => {
    StorageService.getClients().then((data) => {
      setClients(data.filter(c => c.published));
    });
  }, []);

  if (!clients || clients.length === 0) return null;

  // Duplicate for seamless infinite loop
  const marqueeItems = [...clients, ...clients, ...clients];

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-[11px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              <span>Corporate Trust & Tenant Advisory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']">
              Trusted by Leading Enterprises & Brands
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Advising multinational corporations, tech giants, and institutional occupiers across Noida and Delhi NCR.
          </p>
        </div>
      </div>

      {/* Infinite Marquee Track with edge fade masks */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max gap-4 sm:gap-6 animate-marquee hover:[animation-play-state:paused] py-2">
          {marqueeItems.map((client, idx) => (
            <div
              key={`${client.id}-${idx}`}
              className="glass-card rounded-2xl px-5 py-3.5 flex items-center gap-3.5 border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0B132B]/75 hover:border-brand-500/50 hover:shadow-lg transition-all duration-300 group select-none shrink-0"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                {client.logo ? (
                  <img
                    src={client.logo}
                    alt={client.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-brand-500" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit'] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {client.name}
                  </span>
                  {client.website_url && (
                    <a
                      href={client.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-brand-500 transition-colors"
                      title={`Visit ${client.name}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {client.industry && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                    {client.industry}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsMarquee;
