export interface SeoMetadata {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  keywords?: string;
  structuredData?: object;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
  };
}

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

  // 4. Open Graph
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', seo.ogType || 'article');
  if (seo.ogTitle || seo.title) {
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.ogTitle || seo.title);
  }
  if (seo.ogDescription || seo.description) {
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', seo.ogDescription || seo.description);
  }
  if (seo.canonicalUrl) {
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', seo.canonicalUrl);
  }
  if (seo.ogImage) {
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', seo.ogImage);
  }

  // 5. Twitter Card
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  if (seo.ogTitle || seo.title) {
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seo.ogTitle || seo.title);
  }
  if (seo.ogDescription || seo.description) {
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seo.ogDescription || seo.description);
  }
  if (seo.ogImage) {
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', seo.ogImage);
  }

  // 6. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (seo.canonicalUrl) {
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', seo.canonicalUrl);
  }

  // 7. Structured Data (Schema.org)
  const scriptId = 'shristi-schema-jsonld';
  let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (seo.structuredData) {
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(seo.structuredData);
  } else if (seo.ogType === 'article') {
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': seo.title,
      'description': seo.description || '',
      'image': seo.ogImage ? [seo.ogImage] : undefined,
      'datePublished': seo.article?.publishedTime || new Date().toISOString(),
      'dateModified': seo.article?.modifiedTime || seo.article?.publishedTime || new Date().toISOString(),
      'author': {
        '@type': 'Person',
        'name': seo.article?.author || 'Shristi Estate Advisory Desk'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Shristi Estate',
        'url': 'https://shristiestate.in',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://shristiestate.in/logo-light.png'
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': seo.canonicalUrl || window.location.href
      }
    };

    scriptEl.textContent = JSON.stringify(structuredData);
  }

  // Cleanup on unmount
  return () => {
    document.title = prevTitle;
    const s = document.getElementById(scriptId);
    if (s && s.parentNode) {
      s.parentNode.removeChild(s);
    }
  };
}
