import fs from 'fs';
import path from 'path';
import https from 'https';

const ROOT_DIR = process.cwd();
const UNITS_DIR = path.resolve(ROOT_DIR, 'public/images/units');

if (!fs.existsSync(UNITS_DIR)) {
  fs.mkdirSync(UNITS_DIR, { recursive: true });
}

// Unsplash high quality office images mapped to sizes
const UNIT_IMAGES_MAP = {
  '600': [
    { name: 'unit-600-main.webp', id: '1497366216548-37526070297c' },
    { name: 'unit-600-gallery-1.webp', id: '1497215728101-856f4ea42174' },
    { name: 'unit-600-gallery-2.webp', id: '1486406146926-c627a92ad1ab' }
  ],
  '700': [
    { name: 'unit-700-main.webp', id: '1497215728101-856f4ea42174' },
    { name: 'unit-700-gallery-1.webp', id: '1545324418-cc1a3fa10c00' }
  ],
  '750': [
    { name: 'unit-750-main.webp', id: '1497215728101-856f4ea42174' },
    { name: 'unit-750-gallery-1.webp', id: '1545324418-cc1a3fa10c00' }
  ],
  '800': [
    { name: 'unit-800-main.webp', id: '1545324418-cc1a3fa10c00' },
    { name: 'unit-800-gallery-1.webp', id: '1497366811353-6870744d04b2' }
  ],
  '900': [
    { name: 'unit-900-main.webp', id: '1545324418-cc1a3fa10c00' },
    { name: 'unit-900-gallery-1.webp', id: '1554469384-e58fac16e23a' }
  ],
  '1000': [
    { name: 'unit-1000-main.webp', id: '1486406146926-c627a92ad1ab' },
    { name: 'unit-1000-gallery-1.webp', id: '1524758631624-e2822e304c36' },
    { name: 'unit-1000-gallery-2.webp', id: '1497366216548-37526070297c' }
  ],
  '1200': [
    { name: 'unit-1200-main.webp', id: '1524758631624-e2822e304c36' },
    { name: 'unit-1200-gallery-1.webp', id: '1497366811353-6870744d04b2' }
  ],
  '1400': [
    { name: 'unit-1400-main.webp', id: '1554469384-e58fac16e23a' },
    { name: 'unit-1400-gallery-1.webp', id: '1486406146926-c627a92ad1ab' }
  ],
  '1600': [
    { name: 'unit-1600-main.webp', id: '1497215728101-856f4ea42174' },
    { name: 'unit-1600-gallery-1.webp', id: '1497366216548-37526070297c' }
  ],
  '1800': [
    { name: 'unit-1800-main.webp', id: '1497366811353-6870744d04b2' },
    { name: 'unit-1800-gallery-1.webp', id: '1577495508048-b635879837f1' }
  ],
  '2000': [
    { name: 'unit-2000-main.webp', id: '1497366754035-f200968a6e72' },
    { name: 'unit-2000-gallery-1.webp', id: '1504384308090-c894fdcc538d' }
  ],
  '2200': [
    { name: 'unit-2200-main.webp', id: '1497366754035-f200968a6e72' },
    { name: 'unit-2200-gallery-1.webp', id: '1486406146926-c627a92ad1ab' }
  ],
  '2600': [
    { name: 'unit-2600-main.webp', id: '1504384308090-c894fdcc538d' },
    { name: 'unit-2600-gallery-1.webp', id: '1524758631624-e2822e304c36' }
  ],
  '5000': [
    { name: 'unit-5000-main.webp', id: '1577495508048-b635879837f1' },
    { name: 'unit-5000-gallery-1.webp', id: '1486325212027-8081e485255e' }
  ],
  '10000': [
    { name: 'unit-10000-main.webp', id: '1486325212027-8081e485255e' },
    { name: 'unit-10000-gallery-1.webp', id: '1582650625119-3a31f841839d' }
  ],
  '20000': [
    { name: 'unit-20000-main.webp', id: '1577495508048-b635879837f1' },
    { name: 'unit-20000-gallery-1.webp', id: '1486325212027-8081e485255e' }
  ],
  '25000': [
    { name: 'unit-25000-main.webp', id: '1486325212027-8081e485255e' },
    { name: 'unit-25000-gallery-1.webp', id: '1582650625119-3a31f841839d' }
  ],
  '30000': [
    { name: 'unit-30000-main.webp', id: '1582650625119-3a31f841839d' },
    { name: 'unit-30000-gallery-1.webp', id: '1464938050520-ef2270bb8ce8' }
  ]
};

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- Initializing Local Unit Images Directory ---');
  let downloadedCount = 0;

  for (const [size, items] of Object.entries(UNIT_IMAGES_MAP)) {
    const sizeDir = path.join(UNITS_DIR, size);
    if (!fs.existsSync(sizeDir)) {
      fs.mkdirSync(sizeDir, { recursive: true });
    }

    for (const item of items) {
      const destFile = path.join(sizeDir, item.name);
      if (fs.existsSync(destFile)) {
        console.log(`[Already Exists] /images/units/${size}/${item.name}`);
        continue;
      }
      const url = `https://images.unsplash.com/photo-${item.id}?auto=format&fm=webp&fit=crop&w=1000&q=80`;
      try {
        console.log(`[Downloading] /images/units/${size}/${item.name}...`);
        await downloadImage(url, destFile);
        const stats = fs.statSync(destFile);
        console.log(`  ✓ Saved (${(stats.size / 1024).toFixed(1)} KB)`);
        downloadedCount++;
      } catch (err) {
        console.error(`  ✗ Failed to download ${item.name}:`, err.message);
      }
    }
  }

  console.log(`\n--- Completed! Downloaded ${downloadedCount} unit images into public/images/units/ ---`);
}

run();
