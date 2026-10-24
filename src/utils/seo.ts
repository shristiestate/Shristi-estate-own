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

  // 1. Update Title
  if (seo.title) {
    document.title = seo.title.includes('Shristi Estate') 
      ? seo.title 
      : `${seo.title} | Shristi Estate`;
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
  if (seo.description) {
    setMetaTag('meta[name="description"]', 'name', 'description', seo.description);
  }

  // 3. Keywords
  if (seo.keywords) {
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', seo.keywords);
  }

  // 4. Robots
  if (seo.noindex) {
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
  } else {
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  }

  // 5. Open Graph
  setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'en_IN');
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Shristi Estate');
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', seo.ogType || 'website');
  
  const resolvedTitle = seo.ogTitle || (seo.title.includes('Shristi Estate') ? seo.title : `${seo.title} | Shristi Estate`);
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', resolvedTitle);
  
  const resolvedDesc = seo.ogDescription || seo.description || 'Specialist commercial real estate discovery and advisory across Noida, Greater Noida, and Delhi NCR.';
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', resolvedDesc);
  
  const canonical = seo.canonicalUrl || window.location.href;
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonical);

  const ogImg = seo.ogImage || 'https://shristiestate.in/logo-light.png';
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImg);

  // 6. Twitter Card
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', resolvedTitle);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', resolvedDesc);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImg);

  // 7. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (canonical) {
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonical);
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
          '@id': `${canonical}#article`,
          'headline': seo.title,
          'description': seo.description || '',
          'image': seo.ogImage ? [seo.ogImage] : ['https://shristiestate.in/hero-commercial-park.jpg'],
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
            '@id': canonical
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
          '@id': `${canonical}#webpage`,
          'url': canonical,
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
