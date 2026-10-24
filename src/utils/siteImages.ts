import defaultSiteImages from '../data/site-images.json';

export interface SiteImagesConfig {
  hero: {
    desktop: string;
    mobile: string;
    alt: string;
  };
  founder: {
    image: string;
    alt: string;
  };
  categories: Record<string, string>;
  gallery: string[];
}

export const SITE_IMAGES_STORAGE_KEY = 'shristi_site_images_config';

/**
 * Reads current site images with fallback to data/site-images.json
 */
export function getSiteImages(): SiteImagesConfig {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(SITE_IMAGES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...defaultSiteImages,
          ...parsed,
          hero: { ...defaultSiteImages.hero, ...(parsed.hero || {}) },
          founder: { ...defaultSiteImages.founder, ...(parsed.founder || {}) },
          categories: { ...defaultSiteImages.categories, ...(parsed.categories || {}) },
          gallery: Array.isArray(parsed.gallery) ? parsed.gallery : defaultSiteImages.gallery
        };
      }
    } catch (e) {
      // Use bundled default
    }
  }
  return defaultSiteImages as unknown as SiteImagesConfig;
}

/**
 * Saves site images configuration locally and broadcasts change
 */
export function saveSiteImagesLocally(config: Partial<SiteImagesConfig>): void {
  if (typeof window !== 'undefined') {
    try {
      const current = getSiteImages();
      const updated: SiteImagesConfig = {
        ...current,
        ...config,
        hero: { ...current.hero, ...(config.hero || {}) },
        founder: { ...current.founder, ...(config.founder || {}) },
        categories: { ...current.categories, ...(config.categories || {}) },
        gallery: config.gallery || current.gallery
      };
      localStorage.setItem(SITE_IMAGES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('shristi_site_images_updated', { detail: updated }));
    } catch (e) {
      console.warn('Failed to save site images locally:', e);
    }
  }
}
