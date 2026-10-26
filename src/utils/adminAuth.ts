/**
 * Shristi Estate Client-Side Admin Authentication & Session Management
 * - Secure Session Token Handling (sessionStorage instead of localStorage)
 * - Automatic Admin Authorization Header Injection
 * - Fast Token Verification with Backend
 */

const TOKEN_KEY = 'shristi_admin_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAdminToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('shristi_admin_auth');
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/admin/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-admin-token': token
      }
    });
    if (!res.ok) {
      clearAdminToken();
      return false;
    }
    const data = await res.json();
    if (!data || !data.authenticated) {
      clearAdminToken();
      return false;
    }
    return true;
  } catch {
    // If backend is momentarily unreachable, keep existing state
    return Boolean(token);
  }
}

/**
 * Automatically attaches Authorization headers to all /api/admin/* and upload calls.
 */
let isInterceptorInstalled = false;

export function installAdminFetchInterceptor(): void {
  if (typeof window === 'undefined' || isInterceptorInstalled) return;
  isInterceptorInstalled = true;

  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init: RequestInit = {}) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes('/api/admin') || url.includes('/api/upload-image')) {
      const token = getAdminToken();
      if (token) {
        init = init || {};
        const headers = new Headers(init.headers || (typeof input === 'object' && 'headers' in input ? input.headers : {}));
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        if (!headers.has('x-admin-token')) {
          headers.set('x-admin-token', token);
        }
        init.headers = headers;
      }
    }

    return originalFetch.call(this, input, init);
  };
}

// Auto-install interceptor on load
if (typeof window !== 'undefined') {
  installAdminFetchInterceptor();
}
