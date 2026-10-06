import { HyperlinkConfig } from '../types';

export const INTERNAL_PAGE_PRESETS: Array<{ label: string; url: string; group: string }> = [
  { label: 'Home Page', url: '/', group: 'Main' },
  { label: 'About Shristi Estate', url: '/about', group: 'Main' },
  { label: 'Commercial Real Estate Services', url: '/services', group: 'Main' },
  { label: 'Market Insights & Blog', url: '/blog', group: 'Main' },
  { label: 'Contact Us', url: '/contact', group: 'Main' },
  { label: 'Post Your Requirement', url: '/tell-us-requirement', group: 'Workflows' },
  { label: 'List Your Commercial Property', url: '/list-your-property', group: 'Workflows' },
  { label: 'Browse All Properties', url: '/properties', group: 'Inventory' },
  { label: 'Office Spaces', url: '/office-space', group: 'Categories' },
  { label: 'IT & Business Parks', url: '/it-business-parks', group: 'Categories' },
  { label: 'Warehouses & Logistics', url: '/warehouses', group: 'Categories' },
  { label: 'Industrial & Factories', url: '/factory-industrial', group: 'Categories' },
  { label: 'Commercial Land & Plots', url: '/land', group: 'Categories' },
  { label: 'Retail & Commercial Shops', url: '/shops', group: 'Categories' },
  { label: 'Commercial Locations Directory', url: '/locations', group: 'Locations' },
  { label: 'Sector 62, Noida (IT Hub)', url: '/locations/sector-62', group: 'Locations' },
  { label: 'Sector 63, Noida (Industrial & IT)', url: '/locations/sector-63', group: 'Locations' },
  { label: 'Noida Expressway (Corporate Spine)', url: '/locations/noida-expressway', group: 'Locations' },
  { label: 'Sector 18, Noida (Commercial & Retail)', url: '/locations/sector-18', group: 'Locations' },
  { label: 'Sector 83 / Phase 2 (Warehousing)', url: '/locations/sector-83', group: 'Locations' },
  { label: 'Sector 85, Noida (Industrial Hub)', url: '/locations/sector-85', group: 'Locations' },
  { label: 'Sector 73, Noida', url: '/locations/sector-73', group: 'Locations' },
  { label: 'Sector 2, Noida', url: '/locations/sector-2', group: 'Locations' },
  { label: 'Greater Noida', url: '/locations/greater-noida', group: 'Locations' },
  { label: 'The I-Thum / I-Thum Tower', url: '/buildings/i-thum', group: 'Buildings' },
  { label: 'The Corenthum', url: '/buildings/the-corenthum', group: 'Buildings' }
];

export const GLOBAL_HYPERLINKS_STORAGE_KEY = 'shristi_global_hyperlinks_v1';

export const DEFAULT_GLOBAL_HYPERLINKS: HyperlinkConfig[] = [
  // Commercial Locations
  {
    id: 'ghl-sec-62',
    text: 'Sector 62, Noida',
    url: '/locations/sector-62',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Explore Sector 62 Commercial Hub',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-sec-62-short',
    text: 'Sector 62',
    url: '/locations/sector-62',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Commercial Properties in Sector 62',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-sec-63',
    text: 'Sector 63, Noida',
    url: '/locations/sector-63',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Sector 63 Industrial & Commercial Hub',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-sec-63-short',
    text: 'Sector 63',
    url: '/locations/sector-63',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Explore Sector 63 Properties',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-noida-exp',
    text: 'Noida Expressway',
    url: '/locations/noida-expressway',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Noida Expressway Corporate Corridor',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-sec-18',
    text: 'Sector 18, Noida',
    url: '/locations/sector-18',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Sector 18 Commercial & Retail Spaces',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-sec-18-short',
    text: 'Sector 18',
    url: '/locations/sector-18',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Sector 18 Retail & Office Spaces',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-sec-83',
    text: 'Sector 83, Noida',
    url: '/locations/sector-83',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Sector 83 Logistics & Warehousing',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-sec-83-short',
    text: 'Sector 83',
    url: '/locations/sector-83',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Sector 83 Warehouses',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-sec-85',
    text: 'Sector 85, Noida',
    url: '/locations/sector-85',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Sector 85 Industrial Area',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-sec-85-short',
    text: 'Sector 85',
    url: '/locations/sector-85',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Sector 85 Factories',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-greater-noida',
    text: 'Greater Noida',
    url: '/locations/greater-noida',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Commercial Properties in Greater Noida',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-sec-73',
    text: 'Sector 73, Noida',
    url: '/locations/sector-73',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Sector 73 Commercial Center',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-sec-73-short',
    text: 'Sector 73',
    url: '/locations/sector-73',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Sector 73 Properties',
    match_mode: 'first',
    max_occurrences: 1
  },

  // Asset Categories
  {
    id: 'ghl-office-spaces',
    text: 'office spaces',
    url: '/office-space',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Browse Commercial Office Spaces',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-office-space-sg',
    text: 'office space',
    url: '/office-space',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Commercial Office Space Options',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-it-parks',
    text: 'IT & business parks',
    url: '/it-business-parks',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Grade-A IT & Business Parks',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-it-parks-alt',
    text: 'IT parks',
    url: '/it-business-parks',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Technology Hubs & IT Campuses',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-warehouses',
    text: 'warehouses',
    url: '/warehouses',
    type: 'internal',
    open_in_new_tab: false,
    title: 'High-Clearance Warehouses & Logistics Hubs',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-factory-ind',
    text: 'factory and industrial properties',
    url: '/factory-industrial',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Industrial Manufacturing Units & Factory Sheds',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-industrial-shed',
    text: 'industrial',
    url: '/factory-industrial',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Industrial Properties & Manufacturing Sheds',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-land',
    text: 'commercial land',
    url: '/land',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Institutional & Commercial Land Plots',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-shops',
    text: 'shops',
    url: '/shops',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Commercial Shops & Retail Spaces',
    match_mode: 'first',
    max_occurrences: 1
  },

  // Key Commercial Landmarks
  {
    id: 'ghl-ithum',
    text: 'The I-Thum',
    url: '/buildings/i-thum',
    type: 'internal',
    open_in_new_tab: false,
    title: 'The I-Thum Commercial Towers Sector 62',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-ithum-heights',
    text: 'IThum Heights',
    url: '/buildings/i-thum',
    type: 'internal',
    open_in_new_tab: false,
    title: 'I-Thum Towers Commercial Complex',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-ithum-tower',
    text: 'I-Thum Tower',
    url: '/buildings/i-thum',
    type: 'internal',
    open_in_new_tab: false,
    title: 'I-Thum Tower Sector 62',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-ithum-short',
    text: 'I-Thum',
    url: '/buildings/i-thum',
    type: 'internal',
    open_in_new_tab: false,
    title: 'The I-Thum Sector 62',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-corenthum',
    text: 'The Corenthum',
    url: '/buildings/the-corenthum',
    type: 'internal',
    open_in_new_tab: false,
    title: 'The Corenthum Sector 62',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-corenthum-short',
    text: 'Corenthum',
    url: '/buildings/the-corenthum',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Corenthum Commercial Complex Sector 62',
    match_mode: 'first',
    max_occurrences: 1
  },

  // Core Pages & Actions
  {
    id: 'ghl-commercial-re',
    text: 'commercial real estate',
    url: '/properties',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Commercial Real Estate in Noida & NCR',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-comm-props',
    text: 'commercial properties',
    url: '/properties',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Explore Commercial Properties',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-all-properties',
    text: 'commercial property',
    url: '/properties',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Search Commercial Real Estate Properties',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-corp-offices',
    text: 'corporate office',
    url: '/office-space',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Corporate Office Spaces for Lease',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-tell-us-req',
    text: 'tell us what property you need',
    url: '/tell-us-requirement',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Submit Commercial Requirement',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-post-requirement',
    text: 'post your requirement',
    url: '/tell-us-requirement',
    type: 'internal',
    open_in_new_tab: false,
    title: 'Submit Commercial Real Estate Requirement',
    match_mode: 'first',
    max_occurrences: 1
  },
  {
    id: 'ghl-list-property',
    text: 'list your property',
    url: '/list-your-property',
    type: 'internal',
    open_in_new_tab: false,
    title: 'List Commercial Space for Rent / Lease',
    match_mode: 'first',
    max_occurrences: 1
  }
];

export function getStoredGlobalHyperlinks(): HyperlinkConfig[] {
  if (typeof window === 'undefined') return DEFAULT_GLOBAL_HYPERLINKS;
  try {
    const raw = localStorage.getItem(GLOBAL_HYPERLINKS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_GLOBAL_HYPERLINKS;
}

export function escapeRegExp(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function formatHyperlinkUrl(url: string, type: 'internal' | 'external' | 'email' | 'phone'): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (type === 'email') {
    return trimmed.toLowerCase().startsWith('mailto:') ? trimmed : `mailto:${trimmed}`;
  }
  if (type === 'phone') {
    return trimmed.toLowerCase().startsWith('tel:') ? trimmed : `tel:${trimmed.replace(/\s+/g, '')}`;
  }
  if (type === 'external') {
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('//')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }
  // Internal link
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('?')) {
    return trimmed;
  }
  return `/${trimmed}`;
}

/**
 * Converts double line breaks into <p> paragraphs if raw text is not already HTML.
 */
function wrapPlainTextInParagraphs(text: string, inline: boolean = false): string {
  if (!text) return '';
  if (inline) {
    return text.replace(/\n/g, '<br />');
  }

  // Check if string already contains block HTML tags
  const hasBlockTags = /<(?:p|div|section|article|h[1-6]|ul|ol|li|blockquote|table)\b/i.test(text);
  if (hasBlockTags) {
    return text;
  }

  // Only wrap in <p> if there are actual paragraphs
  if (!text.includes('\n\n')) {
    return text.replace(/\n/g, '<br />');
  }

  // Split on double line breaks into paragraphs
  return text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p class="mb-4 leading-relaxed">${p.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

export interface ApplyHyperlinksOptions {
  inline?: boolean;
  disableGlobal?: boolean;
}

/**
 * Applies configured hyperlink phrases safely to content across all pages of the website.
 * 
 * Guarantees:
 * - Combines page/entity-specific hyperlinks with global site-wide hyperlinks
 * - Prioritizes longer phrases first (e.g. "Sector 62, Noida" before "Sector 62")
 * - Never breaks HTML tags or attributes
 * - Never nests <a> inside an existing <a>
 * - Preserves original casing
 * - Seamless SPA client-side routing
 */
export function applyHyperlinksToContent(
  rawContent?: string | null,
  customHyperlinks: HyperlinkConfig[] = [],
  options: ApplyHyperlinksOptions = {}
): string {
  if (!rawContent || !rawContent.trim()) {
    return '';
  }

  const initialHtml = wrapPlainTextInParagraphs(rawContent.trim(), options.inline);

  // Combine custom entity hyperlinks with site-wide global hyperlinks
  const globalRules = options.disableGlobal ? [] : getStoredGlobalHyperlinks();
  
  // Custom links take precedence over global links for matching phrases
  const customMap = new Map<string, HyperlinkConfig>();
  (customHyperlinks || []).forEach(h => {
    if (h && h.text && h.text.trim() && h.url && h.url.trim()) {
      customMap.set(h.text.trim().toLowerCase(), h);
    }
  });

  const mergedRules: HyperlinkConfig[] = [...(customHyperlinks || [])];
  globalRules.forEach(g => {
    if (g && g.text && g.text.trim() && g.url && g.url.trim()) {
      const key = g.text.trim().toLowerCase();
      if (!customMap.has(key)) {
        mergedRules.push(g);
      }
    }
  });

  const activeRules = mergedRules.filter(h => h && h.text && h.text.trim() && h.url && h.url.trim());

  if (activeRules.length === 0) {
    return initialHtml;
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return initialHtml;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${initialHtml}</body>`, 'text/html');
    const container = doc.body;

    // CRITICAL: Sort by phrase length descending so longer phrases match first!
    const sortedRules = [...activeRules].sort((a, b) => b.text.trim().length - a.text.trim().length);

    for (const rule of sortedRules) {
      const phrase = rule.text.trim();
      if (!phrase) continue;

      const formattedUrl = formatHyperlinkUrl(rule.url, rule.type);
      const isFirstOnly = rule.match_mode === 'first' || !rule.match_mode;
      const maxOccurrences = isFirstOnly ? 1 : (rule.max_occurrences || Infinity);

      let occurrencesApplied = 0;
      const startBoundary = /^\w/.test(phrase) ? '\\b' : '';
      const endBoundary = /\w$/.test(phrase) ? '\\b' : '';
      const regex = new RegExp(`${startBoundary}(${escapeRegExp(phrase)})${endBoundary}`, 'gi');

      // Collect all text nodes currently in the container that are not inside an <a> tag
      const textNodes: Text[] = [];
      const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.textContent || !node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          // Do not replace inside existing anchor tags
          const parentEl = node.parentElement;
          if (parentEl && parentEl.closest('a')) {
            return NodeFilter.FILTER_REJECT;
          }
          // Do not replace inside script, style, textarea, code, pre tags
          if (parentEl && /^(script|style|textarea|code|pre|button|select|input)$/i.test(parentEl.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      let currentNode = walker.nextNode();
      while (currentNode) {
        textNodes.push(currentNode as Text);
        currentNode = walker.nextNode();
      }

      for (const textNode of textNodes) {
        if (occurrencesApplied >= maxOccurrences) break;

        const textContent = textNode.textContent || '';
        if (!regex.test(textContent)) continue;
        regex.lastIndex = 0; // reset stateful regex

        const fragment = doc.createDocumentFragment();
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(textContent)) !== null) {
          if (occurrencesApplied >= maxOccurrences) {
            break;
          }

          const matchStart = match.index;
          const matchLength = match[0].length;

          // Append preceding text if any
          if (matchStart > lastIndex) {
            fragment.appendChild(doc.createTextNode(textContent.slice(lastIndex, matchStart)));
          }

          // Create the hyperlink element
          const anchor = doc.createElement('a');
          anchor.href = formattedUrl;
          anchor.textContent = match[0]; // preserves original casing
          anchor.className = 'text-brand-600 dark:text-brand-400 font-semibold underline underline-offset-2 decoration-brand-400/60 hover:text-brand-700 dark:hover:text-brand-300 hover:decoration-brand-600 transition-colors inline-hyperlink cursor-pointer';

          if (rule.title && rule.title.trim()) {
            anchor.title = rule.title.trim();
          }

          if (rule.open_in_new_tab || rule.type === 'external') {
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
          }

          fragment.appendChild(anchor);
          occurrencesApplied++;
          lastIndex = matchStart + matchLength;

          if (isFirstOnly) break;
        }

        // Append remaining text after last match
        if (lastIndex < textContent.length) {
          fragment.appendChild(doc.createTextNode(textContent.slice(lastIndex)));
        }

        if (textNode.parentNode) {
          textNode.parentNode.replaceChild(fragment, textNode);
        }
      }
    }

    return container.innerHTML;
  } catch (err) {
    console.error('Failed to apply hyperlinks to content:', err);
    return initialHtml;
  }
}
