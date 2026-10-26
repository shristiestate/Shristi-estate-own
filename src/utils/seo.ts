import { PageSeoConfig } from '../types/seo';
import { DEFAULT_PAGES_SEO, PAGES_SEO_STORAGE_KEY, PAGES_SEO_UPDATED_EVENT } from '../data/defaultPagesSeo';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SeoMetadata {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  keywords?: string;
  structuredData?: object;
  noindex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
  };
}

let _memPagesSeo: PageSeoConfig[] | null = null;

/**
 * Normalizes a URL or path to a clean path (e.g. "https://shristiestate.in/office-space" -> "/office-space")
 */
export function normalizePathname(urlOrPath: string): string {
  if (!urlOrPath) return '/';
  try {
    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
      const u = new URL(urlOrPath);
      return u.pathname.replace(/\/+$/, '') || '/';
    }
  } catch (e) {
    // ignore
  }
  return urlOrPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
}

/**
 * Retrieves all PageSeoConfig items from memory/localStorage with fallback to DEFAULT_PAGES_SEO
 */
export function getAllPagesSeo(): PageSeoConfig[] {
  if (_memPagesSeo && _memPagesSeo.length > 0) {
    return _memPagesSeo;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(PAGES_SEO_STORAGE_KEY);
      if (stored) {
        const parsed: PageSeoConfig[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with DEFAULT_PAGES_SEO to ensure newly added pages exist
          const mergedMap = new Map<string, PageSeoConfig>();
          DEFAULT_PAGES_SEO.forEach(d => mergedMap.set(d.path, { ...d }));
          parsed.forEach(p => {
            const existing = mergedMap.get(p.path);
            if (existing) {
              mergedMap.set(p.path, { ...existing, ...p, isCustom: true });
            } else {
              mergedMap.set(p.path, p);
            }
          });
          _memPagesSeo = Array.from(mergedMap.values());
          return _memPagesSeo;
        }
      }
    } catch (e) {
      console.warn('Error reading pages SEO from localStorage:', e);
    }
  }
  _memPagesSeo = DEFAULT_PAGES_SEO.map(item => ({ ...item }));
  return _memPagesSeo;
}

/**
 * Retrieves the custom SEO configuration for a specific path or URL
 */
export function getStoredPageSeo(urlOrPath: string): PageSeoConfig | null {
  const cleanPath = normalizePathname(urlOrPath);
  const list = getAllPagesSeo();
  const found = list.find(p => normalizePathname(p.path) === cleanPath);
  return found || null;
}

/**
 * Saves a page SEO configuration and broadcasts the update event
 */
export async function savePageSeoConfig(config: PageSeoConfig): Promise<void> {
  const list = getAllPagesSeo().map(item => ({ ...item }));
  const cleanPath = normalizePathname(config.path);
  const idx = list.findIndex(p => normalizePathname(p.path) === cleanPath || p.id === config.id);

  const updatedItem: PageSeoConfig = {
    ...config,
    path: cleanPath,
    isCustom: true,
    updatedAt: new Date().toISOString()
  };

  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updatedItem };
  } else {
    list.push(updatedItem);
  }

  _memPagesSeo = list;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PAGES_SEO_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent(PAGES_SEO_UPDATED_EVENT, { detail: { path: cleanPath, config: updatedItem } }));
    } catch (e) {
      console.error('Failed to save pages SEO to localStorage:', e);
    }

    // Also sync to backend API in background if server is running
    try {
      fetch('/api/admin/pages-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      }).catch(() => {});
    } catch (e) {}
  }
}

/**
 * Saves multiple page SEO configurations at once
 */
export async function saveAllPagesSeoConfigs(configs: PageSeoConfig[]): Promise<void> {
  _memPagesSeo = configs;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PAGES_SEO_STORAGE_KEY, JSON.stringify(configs));
      window.dispatchEvent(new CustomEvent(PAGES_SEO_UPDATED_EVENT, { detail: { all: true } }));
    } catch (e) {
      console.error('Failed to save all pages SEO to localStorage:', e);
    }
    try {
      fetch('/api/admin/pages-seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: configs })
      }).catch(() => {});
    } catch (e) {}
  }
}

/**
 * Resets a specific page or all pages to defaults
 */
export async function resetPageSeoToDefault(idOrPath: string): Promise<void> {
  const clean = normalizePathname(idOrPath);
  const defaultItem = DEFAULT_PAGES_SEO.find(d => normalizePathname(d.path) === clean || d.id === idOrPath);
  
  const list = getAllPagesSeo().map(item => {
    if (normalizePathname(item.path) === clean || item.id === idOrPath) {
      return defaultItem ? { ...defaultItem } : item;
    }
    return item;
  });

  _memPagesSeo = list;
  if (typeof window !== 'undefined') {
    localStorage.setItem(PAGES_SEO_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(PAGES_SEO_UPDATED_EVENT, { detail: { reset: idOrPath } }));
    try {
      if (defaultItem) {
        fetch('/api/admin/pages-seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultItem)
        }).catch(() => {});
      }
    } catch (e) {}
  }
}

/**
 * Resets all pages to default SEO
 */
export async function resetAllPagesSeoToDefaults(): Promise<void> {
  _memPagesSeo = DEFAULT_PAGES_SEO.map(d => ({ ...d }));
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PAGES_SEO_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(PAGES_SEO_UPDATED_EVENT, { detail: { resetAll: true } }));
    try {
      fetch('/api/admin/pages-seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: DEFAULT_PAGES_SEO })
      }).catch(() => {});
    } catch (e) {}
  }
}

/**
 * Standard Organization / RealEstateAgent Schema for Shristi Estate
 * Conforms to Google Structured Data and LocalBusiness specifications.
 */
export function getOrganizationSchema() {
  return {
    '@type': 'RealEstateAgent',
    '@id': 'https://shristiestate.in/#organization',
    'name': 'Shristi Estate',
    'alternateName': 'Shristi Estate Advisory',
    'legalName': 'Shristi Estate Commercial Advisory',
    'url': 'https://shristiestate.in',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://shristiestate.in/logo-light.png',
      'width': 512,
      'height': 512
    },
    'image': 'https://shristiestate.in/hero-commercial-park.jpg',
    'description': 'Premier commercial real estate consultancy in Noida & Delhi NCR, specializing in corporate office leasing, IT parks, retail shops, warehouses, and industrial properties.',
    'telephone': '+91-8750098666',
    'email': 'contact@shristiestate.in',
    'founder': {
      '@type': 'Person',
      'name': 'Sanjeet Kumar',
      'jobTitle': 'Founder & Principal Advisor',
      'image': 'https://shristiestate.in/images/founder.jpg'
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Unit No. 1035, 10th Floor, Tower-B, iThum Tower, Plot No. A-40, Sector-62',
      'addressLocality': 'Noida',
      'addressRegion': 'Uttar Pradesh',
      'postalCode': '201309',
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '28.6280',
      'longitude': '77.3649'
    },
    'areaServed': [
      { '@type': 'AdministrativeArea', 'name': 'Noida' },
      { '@type': 'AdministrativeArea', 'name': 'Greater Noida' },
      { '@type': 'AdministrativeArea', 'name': 'Yamuna Expressway' },
      { '@type': 'AdministrativeArea', 'name': 'Delhi NCR' }
    ],
    'priceRange': '₹₹₹',
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': '09:30',
        'closes': '19:30'
      }
    ],
    'sameAs': [
      'https://www.linkedin.com/company/shristi-estate',
      'https://www.instagram.com/shristiestate'
    ]
  };
}

/**
 * Standard WebSite schema with Sitelinks Searchbox
 */
export function getWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': 'https://shristiestate.in/#website',
    'url': 'https://shristiestate.in',
    'name': 'Shristi Estate',
    'description': 'Commercial Real Estate Discovery and Advisory in Noida & Delhi NCR',
    'publisher': {
      '@id': 'https://shristiestate.in/#organization'
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://shristiestate.in/properties?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generates BreadcrumbList structured data
 */
export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${items[items.length - 1]?.url || 'https://shristiestate.in'}#breadcrumb`,
    'itemListElement': items.map((item, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': item.name,
      'item': item.url
    }))
  };
}

/**
 * Updates DOM title, meta tags, and JSON-LD structured data for the active route.
 * Returns a cleanup function to reset state on unmount.
 */
export function updatePageSeo(seo: SeoMetadata): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const prevTitle = document.title;

  // Check for admin-configured page override
  const currentPath = window.location.pathname;
  const pageOverride = getStoredPageSeo(currentPath) || (seo.canonicalUrl ? getStoredPageSeo(seo.canonicalUrl) : null);

  const effectiveTitle = pageOverride?.title?.trim() || seo.title;
  const effectiveDescription = pageOverride?.description?.trim() || seo.description;
  const effectiveKeywords = pageOverride?.keywords?.trim() || seo.keywords;
  const effectiveCanonical = pageOverride?.canonicalUrl?.trim() || seo.canonicalUrl || window.location.href;
  const effectiveOgTitle = pageOverride?.ogTitle?.trim() || seo.ogTitle;
  const effectiveOgDescription = pageOverride?.ogDescription?.trim() || seo.ogDescription || effectiveDescription;
  const effectiveOgImage = pageOverride?.ogImage?.trim() || seo.ogImage || 'https://shristiestate.in/logo-light.png';
  const effectiveNoindex = pageOverride?.noindex !== undefined ? pageOverride.noindex : seo.noindex;

  // 1. Update Title
  if (effectiveTitle) {
    document.title = effectiveTitle.includes('Shristi Estate') 
      ? effectiveTitle 
      : `${effectiveTitle} | Shristi Estate`;
  }

  // Helper to set or create meta tag
  const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Standard Meta Description
  if (effectiveDescription) {
    setMetaTag('meta[name="description"]', 'name', 'description', effectiveDescription);
  }

  // 3. Keywords
  if (effectiveKeywords) {
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', effectiveKeywords);
  }

  // 4. Robots
  if (effectiveNoindex) {
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
  } else {
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  }

  // 5. Open Graph
  setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'en_IN');
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Shristi Estate');
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', seo.ogType || 'website');
  
  const resolvedTitle = effectiveOgTitle || (effectiveTitle.includes('Shristi Estate') ? effectiveTitle : `${effectiveTitle} | Shristi Estate`);
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', resolvedTitle);
  
  const resolvedDesc = effectiveOgDescription || 'Specialist commercial real estate discovery and advisory across Noida, Greater Noida, and Delhi NCR.';
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', resolvedDesc);
  
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', effectiveCanonical);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', effectiveOgImage);

  // 6. Twitter Card
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', resolvedTitle);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', resolvedDesc);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', effectiveOgImage);

  // 7. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (effectiveCanonical) {
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', effectiveCanonical);
  }

  // 8. Structured Data (Schema.org)
  const scriptId = 'shristi-schema-jsonld';
  let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
  
  let finalStructuredData: object | null = null;

  if (seo.structuredData) {
    finalStructuredData = seo.structuredData;
  } else if (seo.ogType === 'article') {
    finalStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          '@id': `${effectiveCanonical}#article`,
          'headline': effectiveTitle || seo.title,
          'description': effectiveDescription || seo.description || '',
          'image': effectiveOgImage ? [effectiveOgImage] : ['https://shristiestate.in/hero-commercial-park.jpg'],
          'datePublished': seo.article?.publishedTime || new Date().toISOString(),
          'dateModified': seo.article?.modifiedTime || seo.article?.publishedTime || new Date().toISOString(),
          'author': {
            '@type': 'Person',
            'name': seo.article?.author || 'Sanjeet Kumar',
            'url': 'https://shristiestate.in/about'
          },
          'publisher': {
            '@id': 'https://shristiestate.in/#organization'
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': effectiveCanonical
          }
        },
        ...(seo.breadcrumbs && seo.breadcrumbs.length > 0 ? [getBreadcrumbSchema(seo.breadcrumbs)] : [])
      ]
    };
  } else {
    // Default WebPage + Breadcrumbs if provided
    finalStructuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${effectiveCanonical}#webpage`,
          'url': effectiveCanonical,
          'name': resolvedTitle,
          'description': resolvedDesc,
          'isPartOf': {
            '@id': 'https://shristiestate.in/#website'
          }
        },
        ...(seo.breadcrumbs && seo.breadcrumbs.length > 0 ? [getBreadcrumbSchema(seo.breadcrumbs)] : [])
      ]
    };
  }

  if (finalStructuredData) {
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(finalStructuredData);
  }

  // Cleanup on unmount / route transition
  return () => {
    document.title = prevTitle;
    const s = document.getElementById(scriptId);
    if (s && s.parentNode) {
      s.parentNode.removeChild(s);
    }
  };
}
