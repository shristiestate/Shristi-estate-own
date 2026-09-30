import { MarketGuide } from '../types';

export const DEFAULT_BLOG_PLACEHOLDER_IMAGE = 
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';

export function getBlogFeaturedImage(guide?: Partial<MarketGuide> | null): string {
  if (!guide) return DEFAULT_BLOG_PLACEHOLDER_IMAGE;
  const img = guide.featured_image_url || guide.image;
  if (typeof img === 'string' && img.trim().length > 0) {
    return img.trim();
  }
  return DEFAULT_BLOG_PLACEHOLDER_IMAGE;
}

export function getBlogImageAlt(guide?: Partial<MarketGuide> | null): string {
  if (!guide) return 'Commercial Real Estate in Noida & Delhi NCR - Shristi Estate';
  if (guide.featured_image_alt && guide.featured_image_alt.trim()) {
    return guide.featured_image_alt.trim();
  }
  if (guide.title && guide.title.trim()) {
    // Generate clean descriptive alt text without special punctuation
    return guide.title.trim().replace(/[:;,\-–—]+/g, ' ').replace(/\s+/g, ' ');
  }
  return 'Shristi Estate Commercial Real Estate Advisory';
}

export function generateBlogSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
