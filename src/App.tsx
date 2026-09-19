import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Phone, MessageSquare, Calendar, Home, Search as SearchIcon } from 'lucide-react';
import { WhatsAppIcon } from './components/common/SocialIcons';
import { generateGeneralEnquiryWhatsAppLink } from './utils/whatsapp';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { EnquiryModal } from './components/modals/EnquiryModal';
import { SearchModal } from './components/modals/SearchModal';
import { SmoothScrollProvider } from './components/layout/SmoothScrollProvider';
import { BackgroundTexture } from './components/layout/BackgroundTexture';
import { Property } from './types';

// Pages
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { BuildingDetailPage } from './pages/BuildingDetailPage';
import { LocationsDirectoryPage } from './pages/LocationsDirectoryPage';
import { LocationPage } from './pages/LocationPage';
import { RequirementPage } from './pages/RequirementPage';
import { ListPropertyPage } from './pages/ListPropertyPage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ContactPage } from './pages/ContactPage';
import { BlogPage } from './pages/BlogPage';
import { LegalPage } from './pages/LegalPage';
import { AdminPage } from './pages/AdminPage';

// Scroll to top helper on route transitions
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Professional 404 Error Page (Section 76)
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
      <div className="glass-card rounded-3xl p-8 sm:p-12 max-w-lg text-center space-y-4 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0B132B]/75 shadow-2xl">
        <span className="text-4xl font-extrabold text-brand-600 dark:text-brand-400 font-['Outfit']">404</span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
          We couldn't find that property or page.
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          The commercial unit or building you requested may have been leased, moved, or temporarily updated.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
          <Link to="/properties" className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-semibold">
            Search Properties
          </Link>
          <Link to="/locations" className="px-4 py-2 rounded-xl text-xs font-semibold glass-card border border-slate-200 dark:border-slate-700">
            Browse Locations
          </Link>
          <Link to="/" className="px-4 py-2 rounded-xl text-xs font-semibold glass-card border border-slate-200 dark:border-slate-700">
            Go Home
          </Link>
          <Link to="/contact" className="px-4 py-2 rounded-xl text-xs font-semibold glass-card border border-slate-200 dark:border-slate-700">
            Contact Shristi Estate
          </Link>
        </div>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleOpenEnquiry = (property?: Property) => {
    setSelectedProperty(property || null);
    setIsEnquiryOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
      <ScrollToTop />
      <BackgroundTexture />
      
      {/* Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenEnquiry={() => handleOpenEnquiry()}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        <SmoothScrollProvider>
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

            {/* Buildings */}
            <Route path="/buildings/:buildingSlug" element={<BuildingDetailPage onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/buildings/:buildingSlug/properties" element={<BuildingDetailPage onOpenEnquiry={handleOpenEnquiry} />} />

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
            <Route path="/legal/:docType" element={<LegalPage />} />
            <Route path="/legal" element={<LegalPage />} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminPage />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SmoothScrollProvider>
      </main>

      {/* Footer */}
      <Footer />

      {/* STICKY BOTTOM ACTION BAR FOR MOBILE (SECTION 82) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-2.5 glass-nav border-t border-slate-200/90 dark:border-slate-800/90 shadow-2xl flex items-center gap-2">
        <a
          href="tel:+918750098666"
          className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
        >
          <Phone className="w-3.5 h-3.5 text-brand-500" />
          <span>Call</span>
        </a>

        <a
          href={generateGeneralEnquiryWhatsAppLink({ propertyName: 'Commercial Property Options' })}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>

        <button
          onClick={() => handleOpenEnquiry()}
          className="btn-glass-primary flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Enquire</span>
        </button>
      </div>

      {/* Global Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        property={selectedProperty}
      />
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
