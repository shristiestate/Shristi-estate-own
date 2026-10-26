import crypto from 'crypto';

/**
 * Shristi Estate Production Security Suite
 * - Security Headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
 * - Strict Origin-Validated CORS
 * - Sliding Window Rate Limiting (Brute-force and DoS defense)
 * - Safe Path & Hidden File Protection
 */

// --- 1. RATE LIMITER (In-Memory Sliding Window) ---
class RateLimiter {
  constructor(windowMs, maxRequests, message = 'Too many requests, please try again later.') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    this.hits = new Map();

    // Clean up expired buckets every 5 minutes to prevent memory leaks
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, timestamps] of this.hits.entries()) {
      const active = timestamps.filter(t => now - t < this.windowMs);
      if (active.length === 0) {
        this.hits.delete(ip);
      } else {
        this.hits.set(ip, active);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const timestamps = this.hits.get(ip) || [];
      const windowStart = now - this.windowMs;
      const recent = timestamps.filter(t => t > windowStart);

      if (recent.length >= this.maxRequests) {
        const retryAfterSeconds = Math.ceil((recent[0] + this.windowMs - now) / 1000);
        res.setHeader('Retry-After', Math.max(1, retryAfterSeconds));
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.statusCode = 429;
        if (!res.getHeader('Content-Type')) {
          res.setHeader('Content-Type', 'application/json');
        }
        return res.end(JSON.stringify({
          success: false,
          error: this.message,
          retryAfter: retryAfterSeconds
        }));
      }

      recent.push(now);
      this.hits.set(ip, recent);

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - recent.length));
      next();
    };
  }
}

// Global API rate limit: 120 requests per minute
export const apiRateLimiter = new RateLimiter(60 * 1000, 120, 'API rate limit exceeded. Please wait a moment.');

// Auth rate limit: 5 login attempts per 15 minutes (Brute-force protection)
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5, 'Too many login attempts. Account locked for 15 minutes.');

// Lead/Form submission rate limit: 15 submissions per 10 minutes (Anti-spam protection)
export const formRateLimiter = new RateLimiter(10 * 60 * 1000, 15, 'Too many form submissions. Please try again shortly.');


// --- 2. CORS (Strict Origin Verification) ---
const ALLOWED_ORIGINS = new Set([
  'https://shristiestate.in',
  'https://www.shristiestate.in',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
]);

export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (origin) {
    if (ALLOWED_ORIGINS.has(origin) || origin.endsWith('.shristiestate.in')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  } else {
    // Same-origin or non-browser request
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Admin-Token');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Respond immediately to OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  next();
}


// --- 3. SECURITY HEADERS MIDDLEWARE ---
export function securityHeadersMiddleware(req, res, next) {
  // Remove fingerprinting headers
  if (typeof res.removeHeader === 'function') {
    res.removeHeader('X-Powered-By');
  }

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (limit sensors & camera)
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content-Security-Policy (Allow GTM, GA, doubleclick, maps, fonts, and supabase)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://images.unsplash.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://googleads.g.doubleclick.net https://images.unsplash.com",
    "frame-src 'self' https://www.googletagmanager.com https://www.google.com https://maps.google.com https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);

  next();
}


// --- 4. SAFE FILE ACCESS GUARD ---
export function safeFileGuardMiddleware(req, res, next) {
  const url = (req.url || '').split('?')[0].toLowerCase();

  // Block hidden files or path traversal
  if (url.includes('/.') || url.includes('..') || url.includes('%2e%2e')) {
    // Allow standard .well-known for SSL/discovery
    if (!url.startsWith('/.well-known/')) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain');
      return res.end('Access Denied: Protected resource');
    }
  }

  // Block sensitive extensions
  const forbiddenExtensions = [
    '.env', '.git', '.sql', '.bak', '.backup', '.log', '.key', '.pem',
    '.cert', '.conf', '.config', '.sh', '.bat', '.ps1', '.yml', '.yaml'
  ];

  if (forbiddenExtensions.some(ext => url.endsWith(ext) || url.includes(ext + '?'))) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Access Denied: Protected file type');
  }

  next();
}
