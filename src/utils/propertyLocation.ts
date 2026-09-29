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
