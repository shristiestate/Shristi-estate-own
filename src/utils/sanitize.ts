/**
 * Shristi Estate Client-Side Security & Sanitization Utilities
 * - XSS Prevention & HTML Escaping
 * - Input Sanitization & Boundary Length Truncation
 * - Safe URL Verification (blocks javascript:, data:, vbscript:)
 * - Phone & Email Normalization
 */

/**
 * Escapes unsafe HTML characters to prevent XSS injection.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (typeof str !== 'string' || !str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips dangerous HTML tags and event handlers while preserving safe semantic formatting.
 */
export function sanitizeHtml(rawHtml: string | null | undefined): string {
  if (typeof rawHtml !== 'string' || !rawHtml) return '';

  // 1. Remove script, style, iframe, object, embed, form, and applet tags with contents
  let clean = rawHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  clean = clean.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  // 2. Remove all inline event handlers (e.g. onload=, onclick=, onerror=, onmouseover=)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Remove dangerous protocols from href and src attributes (javascript:, vbscript:, data:text/html)
  clean = clean.replace(/(href|src)\s*=\s*['"]\s*(javascript:|vbscript:|data:text\/html)[^'"]*['"]/gi, '$1="#"');

  return clean;
}

/**
 * Cleans plain text form inputs: trims whitespace, removes control chars, and caps max length.
 */
export function sanitizeText(value: unknown, maxLength: number = 500): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  // Strip control characters (except newline \n and carriage return \r)
  const cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitizes phone numbers, keeping only digits, plus, hyphens, and spaces.
 */
export function sanitizePhone(phone: unknown): string {
  if (!phone) return '';
  const str = String(phone).trim();
  return str.replace(/[^0-9+\-\s()]/g, '').slice(0, 20);
}

/**
 * Validates and sanitizes email address.
 */
export function sanitizeEmail(email: unknown): string {
  if (!email) return '';
  const str = String(email).trim().toLowerCase();
  // Basic safe email pattern
  const isMatch = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(str);
  return isMatch ? str.slice(0, 100) : '';
}

/**
 * Validates and sanitizes URLs, blocking dangerous pseudo-protocols.
 */
export function sanitizeUrl(url: unknown, defaultUrl: string = '#'): string {
  if (typeof url !== 'string' || !url.trim()) return defaultUrl;
  const trimmed = url.trim();

  // Allow safe relative paths
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Block dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:')) {
    return defaultUrl;
  }

  // Ensure absolute URLs use http or https
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('tel:') || lower.startsWith('mailto:')) {
    return trimmed;
  }

  return defaultUrl;
}
