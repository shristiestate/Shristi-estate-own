import React from 'react';

/**
 * Cleans unwanted formatting from pasted text (e.g. from Word, Google Docs, browsers, external sites)
 * while strictly preserving:
 * 1. The exact intended wording
 * 2. Single and intentional multiple spaces
 * 3. Exact line breaks and paragraph structure
 * 4. No synthetic HTML conversion (<p>, <br>, etc.)
 */
export function cleanPastedText(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // If the input contains raw HTML tags (e.g., from rich-text clipboard fallback),
  // convert paragraph breaks and breaks to natural newlines before stripping tags
  if (/<[a-z][\s\S]*>/i.test(text)) {
    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '');
  }

  return text
    // Normalize Windows (\r\n) and legacy Mac (\r) line breaks to standard \n
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove invisible zero-width characters and directional controls silently inserted by Word / Docs
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '')
    // Normalize non-breaking spaces (&nbsp; / \u00A0 / \u202F) to regular spaces
    // so word spacing and line wrapping remain natural without collapsing intentional spaces
    .replace(/[\u00A0\u202F]/g, ' ')
    // Normalize form feed and vertical tab
    .replace(/[\v\f]/g, '\n');
}

/**
 * Reusable paste handler for textareas to ensure pasted content from Word, Google Docs,
 * or web pages is cleaned of unwanted hidden formatting while preserving exact spacing and paragraphs.
 */
export function handleOverviewPaste(
  e: React.ClipboardEvent<HTMLTextAreaElement>,
  onChange: (value: string) => void,
  currentValue: string
): void {
  const clipboard = e.clipboardData;
  let rawText = clipboard.getData('text/plain');

  if (!rawText) {
    rawText = clipboard.getData('text/html') || '';
  }

  if (!rawText) return;

  e.preventDefault();


  const cleaned = cleanPastedText(rawText);
  const textarea = e.currentTarget;
  const start = textarea.selectionStart ?? currentValue.length;
  const end = textarea.selectionEnd ?? currentValue.length;

  const newValue = currentValue.substring(0, start) + cleaned + currentValue.substring(end);
  onChange(newValue);

  // Restore cursor position immediately after inserted text
  requestAnimationFrame(() => {
    try {
      textarea.selectionStart = textarea.selectionEnd = start + cleaned.length;
    } catch {
      // Ignore if element is unmounted or unfocused
    }
  });
}

/**
 * Computes human-readable building structure representation (e.g. "2B + G + 8 Floors")
 * from basement, ground, and superstructure floor inputs.
 */
export function computeStructureDisplay(basement?: string, ground?: string, floors?: number): string {
  const parts: string[] = [];
  const b = (basement || '').trim();

  if (b && b !== 'No Basement' && b !== 'None') {
    if (b.includes('5')) parts.push('5B');
    else if (b.includes('4')) parts.push('4B');
    else if (b.includes('3')) parts.push('3B');
    else if (b.includes('2')) parts.push('2B');
    else if (b.includes('1') || b.toLowerCase().includes('single')) parts.push('B');
    else parts.push(b);
  }

  const g = (ground || 'Ground (G)').trim();
  if (g === 'Ground (G)') parts.push('G');
  else if (g === 'Ground + Mezzanine (G + M)') parts.push('G + M');
  else if (g === 'Lower Ground + Upper Ground (LG + UG)') parts.push('LG + UG');
  else if (g === 'Stilt + Ground (S + G)') parts.push('S + G');
  else if (g === 'Stilt Only (S)') parts.push('S');
  else if (g === 'Ground Only') parts.push('Ground');
  else if (g && g !== 'No Ground') parts.push(g);

  const f = Number(floors) || 0;
  if (f > 0 && g !== 'Ground Only') {
    parts.push(`${f} Floors`);
  }

  return parts.join(' + ') || (f > 0 ? `G + ${f} Floors` : 'Ground Only');
}

/**
 * Intelligently retrieves or computes the full floor structure for any building,
 * ensuring configured or commercial basements (e.g. 2B / 3B) are always displayed.
 */
export function getBuildingStructureDisplay(building?: any | null): string {
  if (!building) return '';

  let basement = (building.basement_floors || '').trim();
  const ground = (building.ground_option || 'Ground (G)').trim();
  const floors = Number(building.total_floors) || 0;
  const explicit = (building.structure_display || '').trim();

  // If basement is not explicitly set on the building object, infer from parking/desc/commercial standards
  if (!basement) {
    const parkingLower = (building.parking || '').toLowerCase();
    const descLower = (building.description || '').toLowerCase();

    if (parkingLower.includes('3-level basement') || parkingLower.includes('3 level basement') || parkingLower.includes('3 basements') || descLower.includes('3-level basement')) {
      basement = '3 Basements (3B)';
    } else if (
      parkingLower.includes('double basement') ||
      parkingLower.includes('2-level basement') ||
      parkingLower.includes('2 basements') ||
      parkingLower.includes('covered basement') ||
      parkingLower.includes('multi-tier basement') ||
      parkingLower.includes('multi-level basement') ||
      descLower.includes('multi-tier basement')
    ) {
      basement = '2 Basements (2B)';
    } else if (parkingLower.includes('1-level basement') || parkingLower.includes('single basement') || parkingLower.includes('1 basement')) {
      basement = '1 Basement (1B)';
    } else if (parkingLower.includes('basement') || descLower.includes('basement')) {
      basement = '2 Basements (2B)';
    } else if (floors >= 4 && !parkingLower.includes('no basement') && building.category !== 'warehouses' && building.category !== 'land') {
      // Commercial towers in Noida/NCR universally possess multi-level basements
      basement = '2 Basements (2B)';
    } else {
      basement = 'No Basement';
    }
  }

  // If explicit structure_display is present:
  if (explicit) {
    const hasBasementInExplicit = /(\b\d*B\b|basement)/i.test(explicit);
    if (basement === 'No Basement' || basement === 'None') {
      if (!hasBasementInExplicit) return explicit;
    } else {
      // If explicit already mentions the basement (e.g. "2B + G + 8 Floors"), use it directly
      if (hasBasementInExplicit) return explicit;
      // If explicit omitted the basement (e.g. was just "G + 8 Floors"), compute it to include basements
    }
  }

  return computeStructureDisplay(basement, ground, floors);
}
