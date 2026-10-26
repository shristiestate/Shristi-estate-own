import crypto from 'crypto';

/**
 * Shristi Estate Admin Authentication & Session Security Service
 * - Salted PBKDF2 Cryptographic Hashing (100,000 iterations)
 * - Timing-safe password evaluation to prevent side-channel timing attacks
 * - Cryptographically random session tokens (256-bit entropy)
 * - Sliding session expiration (2-hour active window)
 */

// Default cryptographic salt & hash for administrative access
// Can be customized via process.env.ADMIN_AUTH_SALT and process.env.ADMIN_PASSWORD_HASH
const AUTH_SALT = process.env.ADMIN_AUTH_SALT || 'shristi_sec_salt_2026';
const EXPECTED_HASH = process.env.ADMIN_PASSWORD_HASH || 'd770b7b29319d8c75c3b1aa6f93c1610070a55064b6b5355219b64f5beeb1215';

// Active in-memory session token store: Map<token, { createdAt: number, expiresAt: number }>
const activeSessions = new Map();
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Cleanup expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
}, 10 * 60 * 1000).unref();

/**
 * Derives a PBKDF2 hash from a supplied passcode using the system salt.
 */
export function hashPasscode(passcode) {
  if (typeof passcode !== 'string' || !passcode) return '';
  return crypto.pbkdf2Sync(passcode, AUTH_SALT, 100000, 32, 'sha256').toString('hex');
}

/**
 * Timing-safe comparison to prevent timing leak attacks.
 */
export function verifyPasscode(providedPasscode) {
  if (!providedPasscode || typeof providedPasscode !== 'string') return false;
  const providedHash = hashPasscode(providedPasscode);
  const bufExpected = Buffer.from(EXPECTED_HASH, 'utf-8');
  const bufProvided = Buffer.from(providedHash, 'utf-8');

  if (bufExpected.length !== bufProvided.length) return false;
  return crypto.timingSafeEqual(bufExpected, bufProvided);
}

/**
 * Issues a new secure random session token.
 */
export function createSessionToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeSessions.set(token, {
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  });
  return {
    token,
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString()
  };
}

/**
 * Validates whether a token is active and unexpired. If valid, slides expiration forward.
 */
export function validateSessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const session = activeSessions.get(token);
  if (!session) return false;

  const now = Date.now();
  if (session.expiresAt < now) {
    activeSessions.delete(token);
    return false;
  }

  // Slide expiration window
  session.expiresAt = now + SESSION_TTL_MS;
  return true;
}

/**
 * Revokes a session token immediately.
 */
export function revokeSessionToken(token) {
  if (token && typeof token === 'string') {
    activeSessions.delete(token);
  }
}

/**
 * Express / Connect authentication guard middleware.
 * Verifies Authorization header (Bearer <token>) or x-admin-token.
 */
export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  if (!token || !validateSessionToken(token)) {
    res.statusCode = 401;
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json');
    }
    return res.end(JSON.stringify({
      success: false,
      error: 'Unauthorized: Valid administrator session token required'
    }));
  }

  next();
}

/**
 * Handles /api/admin/auth/login endpoint
 */
export function handleLoginEndpoint(req, res) {
  const { passcode } = req.body || {};

  if (!passcode || !verifyPasscode(passcode)) {
    res.statusCode = 401;
    return res.json({
      success: false,
      error: 'Invalid administrator passcode. Access denied.'
    });
  }

  const session = createSessionToken();
  return res.json({
    success: true,
    message: 'Authentication successful',
    token: session.token,
    expiresAt: session.expiresAt
  });
}

/**
 * Handles /api/admin/auth/verify endpoint
 */
export function handleVerifyEndpoint(req, res) {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  const isValid = validateSessionToken(token);
  if (!isValid) {
    res.statusCode = 401;
    return res.json({ success: false, authenticated: false, error: 'Session expired or invalid' });
  }

  return res.json({ success: true, authenticated: true });
}

/**
 * Handles /api/admin/auth/logout endpoint
 */
export function handleLogoutEndpoint(req, res) {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  revokeSessionToken(token);
  return res.json({ success: true, message: 'Logged out successfully' });
}
