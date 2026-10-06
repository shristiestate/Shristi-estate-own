/**
 * Utility to clean property location/address by removing floor and tower prefixes
 * such as "2nd Floor, Tower A, ...", "Tower B, 10th Floor, ...", "4th Floor, ...", etc.
 */
export function cleanPropertyAddress(address?: string | null, buildingName?: string | null): string {
  if (!address || typeof address !== 'string') return '';

  let cleaned = address.trim();

  // Pattern matching floor indicators at the start of address:
  // e.g., "2nd Floor", "8th & 9th Floors", "3 Contiguous Floors", "Multiple Floors", 
  // "Dedicated Block", "Entire Building / Campus", "Ground Floor", "Mezzanine Floor", etc.
  const floorPattern = /^\s*(?:\d+(?:st|nd|rd|th)?(?:\s*(?:&|and|,)\s*\d+(?:st|nd|rd|th)?)*\s+Floors?|\d+\s+Contiguous\s+Floors?|Multiple\s+Floors?|Dedicated\s+Block|Entire\s+Building(?:\s*\/\s*Campus)?|Ground(?:\s+Floor)?|Basement(?:\s+Level)?|Mezzanine(?:\s+Level|\s+Floor)?)\s*,?\s*/i;

  // Pattern matching tower indicators at the start:
  // e.g., "Tower A", "Tower 1", "Tower A1", "Main Tower", "Single Tower", "North Tower", "South Tower", etc.
  const towerPattern = /^\s*(?:Tower\s+[A-Za-z0-9-]+|(?:Main|Single|North|South|East|West)\s+Tower)\s*,?\s*/i;

  // Loop to strip combinations in any order (e.g. "Floor, Tower, " or "Tower, Floor, ")
  for (let i = 0; i < 3; i++) {
    const prev = cleaned;
    cleaned = cleaned.replace(floorPattern, '');
    cleaned = cleaned.replace(towerPattern, '');
    if (cleaned === prev) break;
  }

  cleaned = cleaned.trim();

  // If buildingName is provided and not already present in cleaned address, prepend it cleanly
  if (buildingName && buildingName.trim()) {
    const bName = buildingName.trim();
    if (!cleaned.toLowerCase().includes(bName.toLowerCase())) {
      cleaned = `${bName}, ${cleaned}`;
    }
  }

  return cleaned;
}

/**
 * Resolves the canonical URL slug for any location identifier or name.
 * Prevents broken link errors (e.g., "loc-sec-62" -> "sector-62").
 */
export function resolveLocationSlug(locationId?: string | null, locationName?: string | null): string {
  if (!locationId && !locationName) return 'noida';

  const idToSlugMap: Record<string, string> = {
    'loc-sec-62': 'sector-62',
    'sec-62': 'sector-62',
    'loc-sec-63': 'sector-63',
    'sec-63': 'sector-63',
    'loc-noida-exp': 'noida-expressway',
    'noida-exp': 'noida-expressway',
    'loc-sec-18': 'sector-18',
    'sec-18': 'sector-18',
    'loc-sec-2': 'sector-2',
    'sec-2': 'sector-2',
    'loc-sec-83': 'sector-83',
    'sec-83': 'sector-83',
    'loc-sec-85': 'sector-85',
    'sec-85': 'sector-85',
    'loc-greater-noida': 'greater-noida',
    'loc-sec-73': 'sector-73',
    'sec-73': 'sector-73',
  };

  if (locationId) {
    const cleanId = locationId.toLowerCase().trim();
    if (idToSlugMap[cleanId]) return idToSlugMap[cleanId];
    if (cleanId.startsWith('sec-')) return cleanId.replace(/^sec-(\d+)/, 'sector-$1');
    if (cleanId.startsWith('loc-sec-')) return cleanId.replace(/^loc-sec-(\d+)/, 'sector-$1');
    if (cleanId.startsWith('loc-')) return cleanId.replace(/^loc-/, '');
    return cleanId;
  }

  if (locationName) {
    const lower = locationName.toLowerCase().trim();
    const secMatch = lower.match(/sector\s*(\d+)/i);
    if (secMatch) return `sector-${secMatch[1]}`;
    if (lower.includes('expressway')) return 'noida-expressway';
    if (lower.includes('greater noida')) return 'greater-noida';
  }

  return 'noida';
}
