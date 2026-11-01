import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { imageApiMiddleware } from './server/imageApi.js';
import {
  securityHeadersMiddleware,
  corsMiddleware,
  safeFileGuardMiddleware,
  apiRateLimiter
} from './server/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security Suite: Disable fingerprinted headers, enforce CSP, HSTS, and CORS
app.disable('x-powered-by');
app.use(securityHeadersMiddleware);
app.use(corsMiddleware);
app.use(safeFileGuardMiddleware);

// High-Performance Compression: Gzip/Deflate on-the-fly for HTML, JSON, CSS, JS, SVG
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Global API rate limiting
app.use('/api', apiRateLimiter.middleware());

// Parse JSON bodies with sensible max size
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Mount Image Management API routes
// - POST /api/admin/images/upload
// - GET /api/admin/images
// - PUT /api/admin/images/replace
// - DELETE /api/admin/images/:name
// - GET/PUT /api/admin/site-images
app.use(imageApiMiddleware);

// Guard: Ensure any unhandled /api call returns JSON 404 instead of falling through to index.html
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `API endpoint ${req.method} ${req.path} not found` });
});

// Cache-Control Strategy for Max Speed and Instant Updates
const staticCacheOptions = {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    // Vite hashed assets (immutable for 1 year)
    if (filePath.includes(`${path.sep}assets${path.sep}`) || filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(woff2?|ttf|eot)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(webp|jpg|jpeg|png|svg|ico|avif)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
    } else if (/\.html$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
};

// Serve static assets from public/ (including /images/...)
app.use(express.static(path.join(__dirname, 'public'), staticCacheOptions));

// Serve production frontend bundle if built
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, staticCacheOptions));

// Build set of valid routes from sitemap.xml and app routing
const validPaths = new Set([
  '/',
  '/office-space',
  '/it-business-parks',
  '/warehouses',
  '/factory-industrial',
  '/land',
  '/shops',
  '/properties',
  '/locations',
  '/tell-us-requirement',
  '/list-your-property',
  '/about',
  '/services',
  '/contact',
  '/blog',
  '/legal',
  '/legal/privacy',
  '/legal/terms',
  '/legal/disclaimer',
  '/admin'
]);

try {
  const sitemapPath = path.join(__dirname, 'public/sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    const matches = sitemapContent.matchAll(/<loc>https:\/\/shristiestate\.in([^<]*)<\/loc>/g);
    for (const match of matches) {
      const p = match[1].replace(/\/$/, '') || '/';
      validPaths.add(p);
    }
    console.log(`[SEO Edge] Loaded ${validPaths.size} verified routes for indexation & 404 status enforcement.`);
  }
} catch (e) {
  console.warn('[SEO Edge] Could not parse sitemap for route validation:', e.message);
}

function isValidRoute(urlPath) {
  const cleanPath = urlPath.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  if (validPaths.has(cleanPath)) return true;

  // Dynamic prefixes
  const dynamicPrefixes = [
    '/category/',
    '/properties/',
    '/property/',
    '/buildings/',
    '/tower/',
    '/towers/',
    '/locations/',
    '/blog/',
    '/legal/'
  ];
  return dynamicPrefixes.some(prefix => cleanPath.startsWith(prefix));
}

// Edge Fallback: Return HTTP 200 for valid routes and true HTTP 404 for invalid routes
app.use((req, res) => {
  const isKnown = isValidRoute(req.path);
  const statusCode = isKnown ? 200 : 404;

  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

  if (!isKnown) {
    const dist404 = path.join(distPath, '404.html');
    const public404 = path.join(__dirname, 'public/404.html');
    if (fs.existsSync(dist404)) {
      return res.status(404).sendFile(dist404);
    }
    if (fs.existsSync(public404)) {
      return res.status(404).sendFile(public404);
    }
  }

  // Instant First Contentful Paint: Serve pre-rendered SSG HTML snapshot if it exists for this route
  const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
  if (cleanPath) {
    const prerenderedPath = path.join(distPath, cleanPath, 'index.html');
    if (fs.existsSync(prerenderedPath)) {
      return res.status(statusCode).sendFile(prerenderedPath);
    }
  }

  const indexHtml = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.status(statusCode).sendFile(indexHtml);
  } else {
    res.status(statusCode).send(`
      <!DOCTYPE html>
      <html>
        <head><title>${isKnown ? 'Shristi Estate Server' : '404 - Not Found'}</title></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>${isKnown ? 'Shristi Estate Local Server Active' : '404 - Page Not Found'}</h2>
          <p>${isKnown
        ? `API endpoints running on port ${PORT}. Run <code>npm run dev</code> for Vite dev server or <code>npm run build</code> for production frontend.`
        : `The requested URL <code>${req.path}</code> was not found on this server.`
      }</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`[Shristi Estate Server] Running on http://localhost:${PORT}`);
  console.log(`[Storage] Images are saved directly to local project folder: ${path.join(__dirname, 'public/images')}`);
});
