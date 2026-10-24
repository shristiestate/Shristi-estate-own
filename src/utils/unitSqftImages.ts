import defaultUnitSqftImages from '../data/unit-sqft-images.json';

export interface SqFtImageEntry {
  primary_image: string;
  gallery: string[];
  unit_count?: number;
  updated_at?: string;
}

export const SQFT_IMAGES_STORAGE_KEY = 'shristi_unit_sqft_images_map';
export const SQFT_IMAGES_EVENT = 'shristi_unit_sqft_images_updated';

export function normalizeSqFtKey(sqft: number | string | undefined | null): string {
  if (sqft === undefined || sqft === null) return '';
  const num = typeof sqft === 'number' ? sqft : parseInt(String(sqft).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? String(sqft).trim() : String(num);
}

export function getAdminHeaders(): Record<string, string> {
  return {
    'x-admin-auth': 'true',
    'Authorization': 'Bearer shristi-admin-authorized'
  };
}

/**
 * Reads current map of unit sq.ft. images from localStorage with fallback to bundled JSON
 */
export function getSqFtImagesMap(): Record<string, SqFtImageEntry> {
  const baseMap: Record<string, SqFtImageEntry> = { ...(defaultUnitSqftImages as unknown as Record<string, SqFtImageEntry>) };
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(SQFT_IMAGES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          return { ...baseMap, ...parsed };
        }
      }
    } catch (e) {
      // Use fallback
    }
  }
  return baseMap;
}

/**
 * Returns matching image override entry for a given square footage
 */
export function getSqFtImageForArea(area: number | string | undefined | null): SqFtImageEntry | undefined {
  if (!area) return undefined;
  const key = normalizeSqFtKey(area);
  const map = getSqFtImagesMap();
  return map[key];
}

/**
 * Fetches latest sq.ft. images mapping from backend API with localStorage caching
 */
export async function fetchSqFtImagesMap(): Promise<Record<string, SqFtImageEntry>> {
  try {
    const res = await fetch('/api/admin/unit-sqft-images', {
      headers: getAdminHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(SQFT_IMAGES_STORAGE_KEY, JSON.stringify(json.data));
          window.dispatchEvent(new CustomEvent(SQFT_IMAGES_EVENT, { detail: json.data }));
        }
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch unit sqft images from API, falling back to local storage', err);
  }
  return getSqFtImagesMap();
}

/**
 * Saves image mapping for a particular sq.ft. size both locally and to server
 */
export async function saveSqFtImageMapping(
  sqft: number | string,
  entry: Partial<SqFtImageEntry>
): Promise<Record<string, SqFtImageEntry>> {
  const key = normalizeSqFtKey(sqft);
  const currentMap = getSqFtImagesMap();
  const existing = currentMap[key] || { primary_image: '', gallery: [] };

  const updatedEntry: SqFtImageEntry = {
    primary_image: entry.primary_image !== undefined ? entry.primary_image : existing.primary_image,
    gallery: Array.isArray(entry.gallery) ? entry.gallery : (existing.gallery || []),
    unit_count: entry.unit_count !== undefined ? entry.unit_count : existing.unit_count,
    updated_at: new Date().toISOString()
  };

  const updatedMap: Record<string, SqFtImageEntry> = {
    ...currentMap,
    [key]: updatedEntry
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SQFT_IMAGES_STORAGE_KEY, JSON.stringify(updatedMap));
      window.dispatchEvent(new CustomEvent(SQFT_IMAGES_EVENT, { detail: updatedMap }));
    } catch (e) {
      console.warn('Failed saving to localStorage', e);
    }
  }

  try {
    await fetch('/api/admin/unit-sqft-images', {
      method: 'PUT',
      headers: {
        ...getAdminHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sqft: key, entry: updatedEntry, map: updatedMap })
    });
  } catch (err) {
    console.warn('Could not persist unit sqft image to backend API:', err);
  }

  return updatedMap;
}

/**
 * Reverts/deletes an override for a square footage
 */
export async function deleteSqFtImageMapping(sqft: number | string): Promise<Record<string, SqFtImageEntry>> {
  const key = normalizeSqFtKey(sqft);
  const currentMap = getSqFtImagesMap();
  const updatedMap = { ...currentMap };
  delete updatedMap[key];

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SQFT_IMAGES_STORAGE_KEY, JSON.stringify(updatedMap));
      window.dispatchEvent(new CustomEvent(SQFT_IMAGES_EVENT, { detail: updatedMap }));
    } catch (e) {
      console.warn('Failed saving to localStorage', e);
    }
  }

  try {
    await fetch(`/api/admin/unit-sqft-images?sqft=${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
  } catch (err) {
    console.warn('Could not delete unit sqft image on backend:', err);
  }

  return updatedMap;
}

/**
 * Resets all unit sq.ft. image overrides back to default
 */
export async function resetAllUnitImagesMap(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SQFT_IMAGES_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SQFT_IMAGES_EVENT, { detail: defaultUnitSqftImages }));
  }

  try {
    await fetch('/api/admin/unit-sqft-images?all=true', {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
  } catch (err) {
    console.warn('Could not reset unit sqft images on backend:', err);
  }
}