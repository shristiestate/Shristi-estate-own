import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, Calendar, Home, Search as SearchIcon } from 'lucide-react';
import { WhatsAppIcon } from './components/common/SocialIcons';
import { generateGeneralEnquiryWhatsAppLink } from './utils/whatsapp';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Property } from './types';
import { SmokeBackground } from './components/common/SmokeBackground';
import { FloatingQuickActions } from './components/common/FloatingQuickActions';
import { updatePageSeo } from './utils/seo';

// Lazy-load modals so their forms and logic don't bloat the critical initial JS bundle
const EnquiryModal = React.lazy(() => import('./components/modals/EnquiryModal').then(m => ({ default: m.EnquiryModal })));
const SearchModal = React.lazy(() => import('./components/modals/SearchModal').then(m => ({ default: m.SearchModal })));

// Critical path: Keep HomePage eager for instant FCP and LCP
import { HomePage } from './pages/HomePage';

// Lazy-load secondary pages off the critical path for optimal mobile speed & 0ms TBT
const CategoryPage = React.lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const PropertiesPage = React.lazy(() => import('./pages/PropertiesPage').then(m => ({ default: m.PropertiesPage })));
const PropertyDetailPage = React.lazy(() => import('./pages/PropertyDetailPage').then(m => ({ default: m.PropertyDetailPage })));
const BuildingDetailPage = React.lazy(() => import('./pages/BuildingDetailPage').then(m => ({ default: m.BuildingDetailPage })));
const LocationsDirectoryPage = React.lazy(() => import('./pages/LocationsDirectoryPage').then(m => ({ default: m.LocationsDirectoryPage })));
const LocationPage = React.lazy(() => import('./pages/LocationPage').then(m => ({ default: m.LocationPage })));
const RequirementPage = React.lazy(() => import('./pages/RequirementPage').then(m => ({ default: m.RequirementPage })));
const ListPropertyPage = React.lazy(() => import('./pages/ListPropertyPage').then(m => ({ default: m.ListPropertyPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ServicesPage = React.lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const BlogPage = React.lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogDetailPage = React.lazy(() => import('./pages/BlogDetailPage').then(m => ({ default: m.BlogDetailPage })));
const LegalPage = React.lazy(() => import('./pages/LegalPage').then(m => ({ default: m.LegalPage })));

// Lazy load heavy admin dashboard
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));

// Scroll to top helper on route transitions
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Lazy load 404 page with basketball mini-game
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

export const AppContent: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Intercept clicks on internal hyperlink anchors for instant, smooth client-side routing
    const handleGlobalLinkClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//') && target.target !== '_blank') {
        e.preventDefault();
        navigate(href);
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('click', handleGlobalLinkClick);
    return () => {
      document.removeEventListener('click', handleGlobalLinkClick);
    };
  }, [navigate]);

  const handleOpenEnquiry = (property?: Property) => {
    setSelectedProperty(property || null);
    setIsEnquiryOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative isolate">
      <ScrollToTop />
      
      {/* Full-Page Animated Smoke Effect Background Layer */}
      <SmokeBackground />
      
      {/* Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenEnquiry={() => handleOpenEnquiry()}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-20 w-full overflow-x-hidden pb-12 sm:pb-16">
        <React.Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage onOpenEnquiry={handleOpenEnquiry} />} />
            
            {/* Commercial Category Silos */}
            <Route path="/office-space" element={<CategoryPage categorySlug="office-space" onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/it-business-parks" element={<CategoryPage categorySlug="it-business-parks" onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/warehouses" element={<CategoryPage categorySlug="warehouses" onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/factory-industrial" element={<CategoryPage categorySlug="factory-industrial" onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/land" element={<CategoryPage categorySlug="land" onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/shops" element={<CategoryPage categorySlug="shops" onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/category/:categorySlug" element={<CategoryPage onOpenEnquiry={handleOpenEnquiry} />} />

            {/* Properties */}
            <Route path="/properties" element={<PropertiesPage onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/properties/:propertySlug" element={<PropertyDetailPage onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/property/:propertySlug" element={<PropertyDetailPage onOpenEnquiry={handleOpenEnquiry} />} />

            {/* Buildings & Towers */}
            <Route path="/buildings/:buildingSlug" element={<BuildingDetailPage onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/buildings/:buildingSlug/properties" element={<BuildingDetailPage onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/tower/:buildingSlug" element={<BuildingDetailPage onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/towers/:buildingSlug" element={<BuildingDetailPage onOpenEnquiry={handleOpenEnquiry} />} />

            {/* Locations */}
            <Route path="/locations" element={<LocationsDirectoryPage />} />
            <Route path="/locations/:locationSlug" element={<LocationPage onOpenEnquiry={handleOpenEnquiry} />} />

            {/* Lead & Requirement Workflows */}
            <Route path="/tell-us-requirement" element={<RequirementPage />} />
            <Route path="/list-your-property" element={<ListPropertyPage />} />

            {/* Informational Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage onOpenEnquiry={() => handleOpenEnquiry()} />} />
            <Route path="/legal/:docType" element={<LegalPage />} />
            <Route path="/legal" element={<LegalPage />} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminPage />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </React.Suspense>
      </main>

      {/* Footer */}
      <Footer />

      {/* STICKY BOTTOM ACTION BAR FOR MOBILE */}
      <div 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-2.5 bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-2"
        style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <a
          href="tel:+918750098666"
          className="flex-1 py-2.5 rounded-none bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800 uppercase tracking-wider"
        >
          <Phone className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Call</span>
        </a>

        <a
          href={generateGeneralEnquiryWhatsAppLink({ propertyName: 'Commercial Property Options' })}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp flex-1 py-2.5 rounded-none text-xs font-semibold flex items-center justify-center gap-1.5 uppercase tracking-wider"
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>

        <button
          onClick={() => handleOpenEnquiry()}
          className="btn-glass-primary flex-1 py-2.5 rounded-none text-xs font-semibold flex items-center justify-center gap-1.5 uppercase tracking-wider"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Enquire</span>
        </button>
      </div>

      {/* Floating Speed-Dial Quick Connect: Enquiries, WhatsApp & Call across all pages */}
      <FloatingQuickActions onOpenEnquiry={() => handleOpenEnquiry()} />

      {/* Global Modals (Lazy Loaded on Demand) */}
      {isSearchOpen && (
        <React.Suspense fallback={null}>
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </React.Suspense>
      )}
      {isEnquiryOpen && (
        <React.Suspense fallback={null}>
          <EnquiryModal
            isOpen={isEnquiryOpen}
            onClose={() => setIsEnquiryOpen(false)}
            property={selectedProperty}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
