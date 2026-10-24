import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const imagesToConvert = [
  'public/images/categories/commercial-land.jpg',
  'public/images/categories/factory-industrial.jpg',
  'public/images/categories/it-business-parks.jpg',
  'public/images/categories/office-spaces.jpg',
  'public/images/categories/shops-retail.jpg',
  'public/images/categories/warehouses.jpg',
  'public/images/founder.jpg',
  'public/hero-commercial-park.jpg',
  'public/hero-commercial-park-mobile.jpg',
];

async function convertImages() {
  console.log('--- Starting WebP Image Optimization ---');
  let totalOrigBytes = 0;
  let totalWebpBytes = 0;

  for (const relPath of imagesToConvert) {
    const fullInputPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullInputPath)) {
      console.warn(`File not found: ${relPath}`);
      continue;
    }

    const ext = path.extname(relPath);
    const webpRelPath = relPath.replace(ext, '.webp');
    const fullOutputPath = path.join(rootDir, webpRelPath);

    const origStats = fs.statSync(fullInputPath);
    totalOrigBytes += origStats.size;

    await sharp(fullInputPath)
      .webp({ quality: 82, effort: 6 })
      .toFile(fullOutputPath);

    const webpStats = fs.statSync(fullOutputPath);
    totalWebpBytes += webpStats.size;

    const savedPercent = (((origStats.size - webpStats.size) / origStats.size) * 100).toFixed(1);
    console.log(`✓ ${path.basename(relPath)} (${(origStats.size / 1024).toFixed(1)} KB) -> ${path.basename(webpRelPath)} (${(webpStats.size / 1024).toFixed(1)} KB) [-${savedPercent}%]`);
  }

  const overallSaved = (((totalOrigBytes - totalWebpBytes) / totalOrigBytes) * 100).toFixed(1);
  console.log('----------------------------------------');
  console.log(`Total Original: ${(totalOrigBytes / 1024).toFixed(1)} KB`);
  console.log(`Total Optimized WebP: ${(totalWebpBytes / 1024).toFixed(1)} KB`);
  console.log(`Overall Payload Savings: -${overallSaved}% (${((totalOrigBytes - totalWebpBytes) / 1024).toFixed(1)} KB saved)`);
}

convertImages().catch((err) => {
  console.error('Error during image optimization:', err);
  process.exit(1);
});
