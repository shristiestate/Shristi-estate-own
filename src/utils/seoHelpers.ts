import { Building, Property } from '../types';

export interface SeoStatusResult {
  status: 'Complete' | 'Needs Attention';
  isComplete: boolean;
  missingFields: string[];
}

/**
 * Evaluates SEO completeness for Tower/Building or Property without arbitrary scoring.
 */
export function computeSeoStatus(
  entity: any,
  type: 'building' | 'property'
): SeoStatusResult {
  const missing: string[] = [];
  if (!entity) {
    return { status: 'Needs Attention', isComplete: false, missingFields: ['Record Data'] };
  }

  // Title / SEO Title
  const hasTitle = Boolean(entity.seo_title?.trim() || entity.title?.trim() || entity.name?.trim());
  if (!hasTitle) missing.push('SEO Title');

  // Description / SEO Description
  const hasDesc = Boolean(entity.seo_description?.trim() || entity.description?.trim() || entity.short_description?.trim());
  if (!hasDesc) missing.push('SEO Description');

  // Slug
  if (!entity.slug?.trim()) missing.push('URL Slug');

  // Featured Image
  const hasImg = type === 'building' 
    ? Boolean(entity.hero_image?.trim())
    : Boolean(entity.primary_image?.trim());
  if (!hasImg) missing.push('Featured Image');

  // Image Alt Text
  const hasAlt = type === 'building'
    ? Boolean(entity.hero_image_alt?.trim())
    : Boolean(entity.primary_image_alt?.trim());
  if (!hasAlt) missing.push('Image Alt Text');

  // Overview / Content
  const hasContent = Boolean(entity.overview?.trim() || entity.description?.trim());
  if (!hasContent) missing.push('Overview Content');

  return {
    status: missing.length === 0 ? 'Complete' : 'Needs Attention',
    isComplete: missing.length === 0,
    missingFields: missing
  };
}

/**
 * Sensible fallback alt text for Tower / Building
 */
export function getTowerImageAlt(bld: Partial<Building>, customAlt?: string): string {
  if (customAlt && customAlt.trim()) return customAlt.trim();
  if (bld.hero_image_alt && bld.hero_image_alt.trim()) return bld.hero_image_alt.trim();
  const name = bld.name?.trim() || bld.tower_name?.trim() || 'Commercial Tower';
  const loc = bld.sector?.trim() || bld.location_name?.trim() || 'Noida';
  return `${name} commercial office space in ${loc}`;
}

/**
 * Sensible fallback alt text for Property
 */
export function getPropertyImageAlt(prop: Partial<Property>, customAlt?: string): string {
  if (customAlt && customAlt.trim()) return customAlt.trim();
  if (prop.primary_image_alt && prop.primary_image_alt.trim()) return prop.primary_image_alt.trim();
  const area = prop.built_up_area ? `${prop.built_up_area} sq ft ` : '';
  const furnishing = prop.furnishing ? `${prop.furnishing.toLowerCase()} ` : '';
  const type = prop.property_type?.toLowerCase() || 'office space';
  const listing = prop.listing_type ? `for ${prop.listing_type.toLowerCase()}` : 'for lease';
  const building = prop.building_name ? `in ${prop.building_name}` : '';
  const loc = prop.location_name ? `${prop.location_name}` : 'Noida';
  return `${area}${furnishing}${type} ${listing} ${building} ${loc}`.replace(/\s+/g, ' ').trim();
}

/**
 * Generates canonical URL for Building / Tower
 */
export function getTowerCanonicalUrl(bld: Partial<Building>): string {
  if (bld.canonical_url && bld.canonical_url.trim()) return bld.canonical_url.trim();
  return `https://shristiestate.in/buildings/${bld.slug || ''}`;
}

/**
 * Generates canonical URL for Property
 */
export function getPropertyCanonicalUrl(prop: Partial<Property>): string {
  if (prop.canonical_url && prop.canonical_url.trim()) return prop.canonical_url.trim();
  return `https://shristiestate.in/properties/${prop.slug || ''}`;
}

/**
 * Generates Schema.org JSON-LD for a Commercial Building / Tower
 */
export function generateTowerStructuredData(bld: Building, properties: Property[] = []): object {
  const canonical = getTowerCanonicalUrl(bld);
  const altText = getTowerImageAlt(bld);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Place',
        '@id': canonical,
        'name': bld.seo_title || bld.name,
        'description': bld.seo_description || bld.description,
        'url': canonical,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': bld.address,
          'addressLocality': bld.location_name || 'Noida',
          'addressRegion': 'Uttar Pradesh',
          'addressCountry': 'IN'
        },
        'photo': {
          '@type': 'ImageObject',
          'url': bld.hero_image,
          'caption': bld.hero_image_caption || altText
        },
        ...(properties.length > 0 ? {
          'containsPlace': properties.slice(0, 10).map(p => ({
            '@type': 'RealEstateListing',
            'name': p.title,
            'url': getPropertyCanonicalUrl(p)
          }))
        } : {})
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://shristiestate.in'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Commercial Real Estate',
            'item': 'https://shristiestate.in/properties'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': bld.location_name || 'Noida',
            'item': `https://shristiestate.in/locations/${bld.location_id?.replace('loc-', '') || ''}`
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': bld.name,
            'item': canonical
          }
        ]
      }
    ]
  };
}

/**
 * Generates Schema.org JSON-LD for a Property
 */
export function generatePropertyStructuredData(prop: Property, building?: Building | null): object {
  const canonical = getPropertyCanonicalUrl(prop);
  const altText = getPropertyImageAlt(prop);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateListing',
        '@id': canonical,
        'name': prop.seo_title || prop.title,
        'description': prop.seo_description || prop.description,
        'url': canonical,
        'image': [prop.primary_image, ...(prop.gallery || [])].filter(Boolean),
        'datePosted': prop.created_at || new Date().toISOString(),
        'offers': {
          '@type': 'Offer',
          'price': prop.price,
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock',
          'businessFunction': prop.listing_type === 'Sale' ? 'https://schema.org/Sell' : 'https://schema.org/LeaseOut'
        }
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://shristiestate.in'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Commercial Real Estate',
            'item': 'https://shristiestate.in/properties'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': prop.location_name || 'Noida',
            'item': `https://shristiestate.in/locations/${prop.location_id?.replace('loc-', '') || ''}`
          },
          ...(building ? [{
            '@type': 'ListItem',
            'position': 4,
            'name': building.name,
            'item': getTowerCanonicalUrl(building)
          }] : []),
          {
            '@type': 'ListItem',
            'position': building ? 5 : 4,
            'name': prop.reference_number || prop.title,
            'item': canonical
          }
        ]
      }
    ]
  };
}
