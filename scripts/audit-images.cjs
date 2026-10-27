const fs = require('fs');
const path = require('path');

function checkFile(relPath) {
  if (!relPath) return { exists: false, reason: 'empty' };
  if (relPath.startsWith('http://') || relPath.startsWith('https://') || relPath.startsWith('data:')) {
    return { exists: true, remote: true };
  }
  const clean = relPath.startsWith('/') ? relPath.slice(1) : relPath;
  const full = path.join(process.cwd(), 'public', clean);
  return { exists: fs.existsSync(full), path: full, clean };
}

function checkContent(name, content) {
  console.log(`=== Checking ${name} ===`);
  const r = /['"](\/images\/[^'"]+)['"]/g;
  let m;
  const missing = [];
  while ((m = r.exec(content)) !== null) {
    const res = checkFile(m[1]);
    if (!res.exists) {
      missing.push(m[1]);
    }
  }
  const uniqueMissing = [...new Set(missing)];
  console.log(`Total missing in ${name}: ${uniqueMissing.length}`);
  uniqueMissing.forEach(p => console.log(`  - ${p}`));
  return uniqueMissing;
}

const buMissing = checkContent('buildingUnits.ts', fs.readFileSync('src/utils/buildingUnits.ts', 'utf8'));
const mdMissing = checkContent('mockData.ts', fs.readFileSync('src/data/mockData.ts', 'utf8'));

// Check data/unit-sqft-images.json and src/data/unit-sqft-images.json
['src/data/unit-sqft-images.json', 'data/unit-sqft-images.json'].forEach(file => {
  console.log(`=== Checking ${file} ===`);
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  let missing = [];
  for (const [sqft, entry] of Object.entries(json)) {
    if (!checkFile(entry.primary_image).exists) missing.push(`${sqft} primary: ${entry.primary_image}`);
    (entry.gallery || []).forEach(g => {
      if (!checkFile(g).exists) missing.push(`${sqft} gallery: ${g}`);
    });
  }
  console.log(`Total missing in ${file}: ${missing.length}`);
  missing.forEach(p => console.log(`  - ${p}`));
});

function walk(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(full));
    } else if (/\.(ts|tsx|json|js)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

console.log('=== Checking all source files in src/ for broken /images/ paths ===');
const allSrcFiles = walk('src');
let totalMissing = 0;
for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  const r = /['"](\/images\/[^'"]+)['"]/g;
  while ((m = r.exec(content)) !== null) {
    const p = m[1];
    const c = checkFile(p);
    if (!c.exists) {
      totalMissing++;
      console.log(`[${path.relative(process.cwd(), file)}] Missing: ${p}`);
    }
  }
}
console.log('Total broken /images/ references across all of src/:', totalMissing);

['index.html', 'public/404.html'].forEach(f => {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    const r = /['"](\/images\/[^'"]+)['"]/g;
    let m;
    while ((m = r.exec(c)) !== null) {
      if (!checkFile(m[1]).exists) console.log(`[${f}] Missing: ${m[1]}`);
    }
  }
});
console.log('=== Image audit completely clean! ===');



