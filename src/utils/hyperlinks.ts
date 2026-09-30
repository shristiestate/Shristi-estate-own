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
  { label: 'IT & Business Parks', url: '/it-business-parks', group: 'Categories' },
  { label: 'Warehouses & Logistics', url: '/warehouses', group: 'Categories' },
  { label: 'Industrial & Factories', url: '/factory-industrial', group: 'Categories' },
  { label: 'Commercial Land & Plots', url: '/land', group: 'Categories' },
  { label: 'Retail & Commercial Shops', url: '/shops', group: 'Categories' },
  { label: 'Commercial Locations Directory', url: '/locations', group: 'Locations' },
  { label: 'Sector 62, Noida (IT Hub)', url: '/locations/sector-62', group: 'Locations' },
  { label: 'Sector 132, Noida Expressway', url: '/locations/sector-132', group: 'Locations' },
  { label: 'Sector 83 / Phase 2 (Warehousing)', url: '/locations/sector-83', group: 'Locations' },
  { label: 'Sector 73, Noida', url: '/locations/sector-73', group: 'Locations' }
];

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
function wrapPlainTextInParagraphs(text: string): string {
  if (!text) return '';
  // Check if string already contains block HTML tags
  const hasBlockTags = /<(?:p|div|section|article|h[1-6]|ul|ol|li|blockquote|table)\b/i.test(text);
  if (hasBlockTags) {
    return text;
  }

  // Split on double line breaks into paragraphs
  return text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p class="mb-4 leading-relaxed">${p.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

/**
 * Applies configured hyperlink phrases safely to article content.
 * 
 * Safety & Quality Guarantees:
 * - Does NOT modify HTML tags or attributes (e.g. img src, class names)
 * - Never nests <a> tags inside existing <a> tags
 * - Preserves the author's original text casing
 * - Respects maximum occurrences (default 1 / first occurrence)
 * - Properly handles open in new tab with rel="noopener noreferrer"
 */
export function applyHyperlinksToContent(
  rawContent: string,
  hyperlinks: HyperlinkConfig[] = []
): string {
  if (!rawContent || !rawContent.trim()) {
    return '';
  }

  const initialHtml = wrapPlainTextInParagraphs(rawContent.trim());
  const activeRules = (hyperlinks || []).filter(h => h && h.text && h.text.trim() && h.url && h.url.trim());

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

    for (const rule of activeRules) {
      const phrase = rule.text.trim();
      if (!phrase) continue;

      const formattedUrl = formatHyperlinkUrl(rule.url, rule.type);
      const isFirstOnly = rule.match_mode === 'first' || !rule.match_mode;
      const maxOccurrences = isFirstOnly ? 1 : (rule.max_occurrences || Infinity);

      let occurrencesApplied = 0;
      const regex = new RegExp(`(${escapeRegExp(phrase)})`, 'gi');

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
          // Do not replace inside script or style tags
          if (parentEl && /^(script|style|textarea|code|pre)$/i.test(parentEl.tagName)) {
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
    console.error('Failed to apply hyperlinks to article content:', err);
    return initialHtml;
  }
}
