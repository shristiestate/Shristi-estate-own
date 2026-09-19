/**
 * Navigation Safety Utility
 * Mitigates open redirects (CVE-2025-68470, CVE-2026-53669) by ensuring that internal
 * navigation targets strictly resolve to internal application routes.
 */

export function toSafeInternalPath(path: unknown, fallback: string = '/'): string {
  if (typeof path !== 'string' || !path.trim()) {
    return fallback;
  }

  const trimmed = path.trim();

  // Must begin with a single slash '/'
  if (!trimmed.startsWith('/')) {
    return fallback;
  }

  // Prevent protocol-relative URLs (e.g., '//evil.com') and backslash bypasses (e.g., '/\evil.com' or '/\\evil.com')
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.includes('\\')) {
    return fallback;
  }

  // Prevent scheme injection (e.g. '/javascript:', '/https:')
  if (/^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
