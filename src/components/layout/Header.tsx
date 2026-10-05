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
    window.addEventListener('scroll', handleScroll, { passive: true });
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
            ? 'glass-nav shadow-xs py-2 sm:py-2.5' 
            : 'bg-white/95 dark:bg-[#070C1E]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-2 sm:py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-3 xl:gap-6 min-h-[44px] sm:min-h-[48px]">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink min-w-0">
            {navLinks.map((item) => {
              if (item.dropdown) {
                const isCurrent = item.dropdown.some(d => location.pathname === d.path);
                return (
                  <div key={item.name} className="relative group">
                    <button 
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-none text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap border border-transparent ${
                        isCurrent 
                          ? 'text-brand-600 dark:text-brand-400 font-semibold border-brand-600 dark:border-brand-400' 
                          : 'text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-slate-200 dark:hover:border-slate-800'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                    
                    {/* Architectural Dropdown Menu (Corners: 0px, 1px border) */}
                    <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 w-56 z-50">
                      <div className="rounded-none p-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] shadow-lg">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`flex items-center px-3 py-2 rounded-none text-xs font-mono uppercase tracking-wider transition-all ${
                              location.pathname === subItem.path
                                ? 'bg-brand-600 text-white font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400'
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
                  className={`px-3 py-1.5 rounded-none text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap border ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 font-semibold border-brand-600 dark:border-brand-400'
                      : 'text-slate-700 dark:text-slate-300 border-transparent hover:text-brand-600 dark:hover:text-brand-400 hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Tools: Search, Theme Toggle, Enquire CTA (Sharp 0px) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Search */}
            <button
              onClick={onOpenSearch}
              aria-label="Search Properties"
              className="p-2 rounded-none text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-none text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-800"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* List Property Coloured CTA Button */}
            <Link
              to="/list-your-property"
              className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-none text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-[#0E1838] border border-slate-300 dark:border-slate-700 transition-all whitespace-nowrap"
            >
              <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>List Property</span>
            </Link>

            {/* Enquire CTA */}
            <button
              onClick={onOpenEnquiry}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-none text-xs font-semibold uppercase tracking-wider btn-glass-primary transition-all whitespace-nowrap cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Enquire</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-none text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer (Sharp Architectural Panel) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white dark:bg-[#070C1E] transition-all">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <Logo />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-none text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-none text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-[#0E1838] border-b border-slate-200 dark:border-slate-800"
            >
              Home
            </Link>

            <div className="pt-2 pb-1 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Commercial Categories
            </div>
            <div className="space-y-0.5">
              <Link to="/office-space" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400">
                Office Spaces
              </Link>
              <Link to="/it-business-parks" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400">
                IT & Business Parks
              </Link>
              <Link to="/warehouses" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400">
                Warehouses & Logistics
              </Link>
              <Link to="/factory-industrial" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400">
                Factory & Industrial
              </Link>
              <Link to="/land" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400">
                Commercial Land
              </Link>
              <Link to="/shops" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400">
                Shops & Retail
              </Link>
            </div>

            <div className="pt-3 pb-1 px-4 text-[10px] font-mono uppercase tracking-widest text-brand-600 dark:text-brand-400 border-t border-slate-200 dark:border-slate-800">
              Discovery & Information
            </div>
            <div className="space-y-0.5">
              <Link to="/properties" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400">
                Explore All Properties
              </Link>
              <Link to="/locations" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400">
                Prime Locations
              </Link>
              <Link to="/tell-us-requirement" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400">
                Post Space Requirement
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400">
                About Shristi Estate
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 rounded-none text-xs font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#0E1838] hover:text-brand-600 dark:hover:text-brand-400">
                Contact & Office
              </Link>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <Link
              to="/list-your-property"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-none text-center font-semibold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 bg-white dark:bg-[#0B132B] hover:bg-slate-50 dark:hover:bg-[#0E1838] border border-slate-300 dark:border-slate-700"
            >
              <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>List Property</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEnquiry();
              }}
              className="btn-glass-primary w-full py-2.5 rounded-none text-center font-semibold text-xs uppercase tracking-wider"
            >
              Enquire for Commercial Space
            </button>
            <a
              href={generateGeneralEnquiryWhatsAppLink({ propertyName: 'Commercial Property in Noida / NCR' })}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp flex items-center justify-center gap-2 w-full py-2.5 rounded-none text-center font-semibold text-xs uppercase tracking-wider"
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
