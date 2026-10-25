import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sitemapPath = path.join(rootDir, 'public/sitemap.xml');
const distSitemapPath = path.join(rootDir, 'dist/sitemap.xml');
const mockDataPath = path.join(rootDir, 'src/data/mockData.ts');

if (!fs.existsSync(sitemapPath)) {
  console.error('public/sitemap.xml not found.');
  process.exit(1);
}

const today = new Date().toISOString().split('T')[0];
let content = fs.readFileSync(sitemapPath, 'utf-8');

// Update existing lastmod dates to current timestamp
content = content.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

// Extract all 37 buildings from mockData.ts
try {
  const mockContent = fs.readFileSync(mockDataPath, 'utf-8');
  const buildingsMatch = mockContent.match(/export const INITIAL_BUILDINGS: Building\[\] = \[([\s\S]*?)\];/);
  if (buildingsMatch) {
    const slugs = [...new Set([...buildingsMatch[1].matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]))];
    
    // Check which building URLs are missing from sitemap.xml
    let addedCount = 0;
    let newEntries = '';

    slugs.forEach(slug => {
      const url = `https://shristiestate.in/buildings/${slug}`;
      if (!content.includes(url)) {
        newEntries += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
        addedCount++;
      }
      const propUrl = `https://shristiestate.in/buildings/${slug}/properties`;
      if (!content.includes(propUrl)) {
        newEntries += `  <url>\n    <loc>${propUrl}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        addedCount++;
      }
    });

    if (newEntries) {
      content = content.replace('</urlset>', `${newEntries}</urlset>`);
      console.log(`✓ Added ${addedCount} optimized building routes to sitemap.`);
    }
  }

  // Extract all market guides / blogs from mockData.ts
  const guidesMatch = mockContent.match(/export const INITIAL_MARKET_GUIDES: MarketGuide\[\] = \[([\s\S]*?)\];/);
  if (guidesMatch) {
    const guideSlugs = [...new Set([...guidesMatch[1].matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]))];
    let addedGuideCount = 0;
    let newGuideEntries = '';

    guideSlugs.forEach(slug => {
      const url = `https://shristiestate.in/blog/${slug}`;
      if (!content.includes(url)) {
        newGuideEntries += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
        addedGuideCount++;
      }
    });

    if (newGuideEntries) {
      content = content.replace('</urlset>', `${newGuideEntries}</urlset>`);
      console.log(`✓ Added ${addedGuideCount} blog guide routes to sitemap.`);
    }
  }
} catch (err) {
  console.warn('Could not extract slugs for sitemap:', err.message);
}

fs.writeFileSync(sitemapPath, content, 'utf-8');
console.log(`✓ Updated public/sitemap.xml with live lastmod: ${today}`);

if (fs.existsSync(path.join(rootDir, 'dist'))) {
  fs.writeFileSync(distSitemapPath, content, 'utf-8');
  console.log(`✓ Synchronized dist/sitemap.xml with live lastmod: ${today}`);
}
