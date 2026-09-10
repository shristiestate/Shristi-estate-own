import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  PhoneCall, 
  MessageSquare,
  Building,
  Building2,
  ChevronDown
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { WhatsAppIcon } from '../common/SocialIcons';
import { generateGeneralEnquiryWhatsAppLink } from '../../utils/whatsapp';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenEnquiry: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenEnquiry }) => {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { 
      name: 'Commercial',
      dropdown: [
        { name: 'Office Spaces', path: '/office-space' },
        { name: 'IT & Business Parks', path: '/it-business-parks' },
        { name: 'Warehouses', path: '/warehouses' },
        { name: 'Factory & Industrial', path: '/factory-industrial' },
        { name: 'Commercial Land', path: '/land' },
        { name: 'Shops & Retail', path: '/shops' },
      ] 
    },
    { name: 'Properties', path: '/properties' },
    { name: 'Locations', path: '/locations' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled 
            ? 'glass-nav shadow-lg shadow-black/5 dark:shadow-black/20 py-2.5' 
            : 'bg-white/90 dark:bg-[#070C1E]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((item) => {
              if (item.dropdown) {
                const isCurrent = item.dropdown.some(d => location.pathname === d.path);
                return (
                  <div key={item.name} className="relative group">
                    <button 
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[13.5px] xl:text-sm font-medium tracking-normal transition-colors ${
                        isCurrent 
                          ? 'text-brand-600 dark:text-brand-400 font-semibold bg-brand-50/80 dark:bg-brand-950/40' 
                          : 'text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                    
                    {/* Dropdown Menu with Glassmorphism */}
                    <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 w-52">
                      <div className="glass-card rounded-2xl p-1.5 shadow-xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-xl">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`flex items-center px-3 py-2 rounded-xl text-[13.5px] font-medium transition-all ${
                              location.pathname === subItem.path
                                ? 'bg-brand-500 text-white font-semibold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-800/80 hover:text-brand-600 dark:hover:text-brand-400'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-xl text-[13.5px] xl:text-sm font-medium tracking-normal transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 font-semibold bg-brand-50/80 dark:bg-brand-950/40'
                      : 'text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Tools: Search, Theme Toggle, Enquire CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search */}
            <button
              onClick={onOpenSearch}
              aria-label="Search Properties"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* List Property Coloured CTA Button (Before Enquire) */}
            <Link
              to="/list-your-property"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 xl:px-4 py-2 rounded-xl text-[13px] xl:text-sm font-semibold tracking-normal text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 hover:from-teal-500 hover:to-cyan-500 shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 border border-cyan-400/30 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>List Property</span>
            </Link>

            {/* Enquire CTA */}
            <button
              onClick={onOpenEnquiry}
              className="btn-glass-primary hidden sm:inline-flex items-center gap-1.5 px-3.5 xl:px-4 py-2 rounded-xl text-[13px] xl:text-sm font-semibold tracking-normal whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enquire Now</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white/95 dark:bg-[#070C1E]/95 backdrop-blur-2xl transition-all">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <Logo />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2.5">
            <Link
              to="/"
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-brand-50 dark:hover:bg-slate-800"
            >
              Home
            </Link>

            <div className="pt-2 pb-1 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Commercial Categories
            </div>
            <div className="pl-2 space-y-0.5">
              <Link to="/office-space" className="block px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                🏢 Office Spaces
              </Link>
              <Link to="/it-business-parks" className="block px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                💻 IT & Business Parks
              </Link>
              <Link to="/warehouses" className="block px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                📦 Warehouses & Logistics
              </Link>
              <Link to="/factory-industrial" className="block px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                🏭 Factory & Industrial
              </Link>
              <Link to="/land" className="block px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                📐 Commercial Land
              </Link>
              <Link to="/shops" className="block px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                🛍️ Shops & Retail
              </Link>
            </div>

            <div className="pt-2 pb-1 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Discovery & Information
            </div>
            <div className="space-y-0.5">
              <Link to="/properties" className="block px-4 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                Explore All Properties
              </Link>
              <Link to="/locations" className="block px-4 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                Prime Locations
              </Link>
              <Link to="/tell-us-requirement" className="block px-4 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                Post Space Requirement
              </Link>
              <Link to="/about" className="block px-4 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                About Shristi Estate
              </Link>
              <Link to="/contact" className="block px-4 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                Contact & Office
              </Link>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <Link
              to="/list-your-property"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-center font-bold text-sm text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 shadow-md shadow-cyan-500/25 border border-cyan-400/30"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>List Property</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEnquiry();
              }}
              className="btn-glass-primary w-full py-2.5 rounded-xl text-center font-semibold text-sm"
            >
              Enquire for Commercial Space
            </button>
            <a
              href={generateGeneralEnquiryWhatsAppLink({ propertyName: 'Commercial Property in Noida / NCR' })}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-center font-semibold text-sm"
            >
              <WhatsAppIcon className="w-4 h-4" />
              WhatsApp Us Direct
            </a>
          </div>
        </div>
      )}
    </>
  );
};
