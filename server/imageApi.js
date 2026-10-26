import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicImagesDir = path.join(projectRoot, 'public', 'images');
const trashDir = path.join(projectRoot, 'data', 'trash-images');
const trashIndexFile = path.join(trashDir, 'trash-index.json');
const siteImagesDataFile = path.join(projectRoot, 'data', 'site-images.json');
const siteImagesSrcFile = path.join(projectRoot, 'src', 'data', 'site-images.json');
const unitImagesDataFile = path.join(projectRoot, 'data', 'unit-sqft-images.json');
const unitImagesSrcFile = path.join(projectRoot, 'src', 'data', 'unit-sqft-images.json');
const pagesSeoDataFile = path.join(projectRoot, 'data', 'pages-seo.json');
const pagesSeoSrcFile = path.join(projectRoot, 'src', 'data', 'pages-seo.json');

// Ensure required directories exist
[publicImagesDir, trashDir, path.join(projectRoot, 'data')].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

if (!fs.existsSync(trashIndexFile)) {
  fs.writeFileSync(trashIndexFile, JSON.stringify([], null, 2), 'utf-8');
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function readTrashIndex() {
  try {
    if (fs.existsSync(trashIndexFile)) {
      return JSON.parse(fs.readFileSync(trashIndexFile, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading trash index:', e);
  }
  return [];
}

function writeTrashIndex(list) {
  try {
    fs.writeFileSync(trashIndexFile, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing trash index:', e);
  }
}

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const rawSubfolder = req.query.subfolder || req.body?.subfolder || 'uploads';
    const cleanSub = String(rawSubfolder).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\.\./g, '');
    const dest = path.join(publicImagesDir, cleanSub);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const prefix = req.body?.prefix || '';
    const parsed = path.parse(file.originalname);
    const safeBase = (prefix ? `${prefix}-` : '') + parsed.name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
    const ext = parsed.ext || '.jpg';
    cb(null, `${safeBase || 'image'}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// Single file replace storage
const replaceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetPath = req.query.targetPath || req.body?.targetPath;
    if (!targetPath) {
      return cb(new Error('Missing targetPath for replace'));
    }
    const cleanTarget = String(targetPath).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\.\./g, '');
    const fullTarget = path.join(publicImagesDir, cleanTarget);
    const dest = path.dirname(fullTarget);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const targetPath = req.query.targetPath || req.body?.targetPath;
    const cleanTarget = String(targetPath).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\.\./g, '');
    const filename = path.basename(cleanTarget);
    cb(null, filename);
  }
});

const uploadReplace = multer({ storage: replaceStorage });

const router = express.Router();

router.use((req, res, next) => {
  if (typeof res.status !== 'function') {
    res.status = function(code) {
      this.statusCode = code;
      return this;
    };
  }
  if (typeof res.json !== 'function') {
    res.json = function(data) {
      if (!this.getHeader('Content-Type')) {
        this.setHeader('Content-Type', 'application/json');
      }
      this.end(JSON.stringify(data));
      return this;
    };
  }
  next();
});

// Helper to scan directory recursively for images
function scanImages(dir, baseDir = publicImagesDir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanImages(fullPath, baseDir));
    } else if (/\.(jpg|jpeg|png|webp|svg|gif|avif)$/i.test(entry.name)) {
      const stat = fs.statSync(fullPath);
      const relative = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const subfolder = path.dirname(relative).replace(/\\/g, '/');
      results.push({
        name: entry.name,
        path: `/images/${relative}`,
        subfolder: subfolder === '.' ? 'root' : subfolder,
        relativePath: relative,
        size: stat.size,
        sizeFormatted: formatBytes(stat.size),
        modified: stat.mtime.toISOString(),
        createdAt: stat.birthtime.toISOString()
      });
    }
  }
  return results;
}

// 1. GET /api/admin/images - list all images
router.get('/images', (req, res) => {
  try {
    const images = scanImages(publicImagesDir);
    // Sort newest modified first
    images.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
    res.json({ success: true, count: images.length, images });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST /api/admin/images/upload - multiple or single file upload
router.post('/images/upload', upload.any(), (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files were uploaded.' });
    }

    const uploaded = files.map(f => {
      const rel = path.relative(publicImagesDir, f.path).replace(/\\/g, '/');
      const url = `/images/${rel}`;
      return {
        url,
        path: url,
        filename: f.filename,
        size: f.size
      };
    });

    res.json({
      success: true,
      count: uploaded.length,
      files: uploaded,
      url: uploaded[0].url,
      filename: uploaded[0].filename
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. PUT /api/admin/images/replace - overwrite specific existing image
router.put('/images/replace', uploadReplace.single('image'), (req, res) => {
  try {
    const targetPath = req.query.targetPath || req.body?.targetPath;
    const cleanTarget = String(targetPath || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\.\./g, '');
    const finalUrl = `/images/${cleanTarget}`;
    res.json({ success: true, path: finalUrl, message: 'Image replaced successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. GET /api/admin/images/trash - list recycled items
router.get('/images/trash', (req, res) => {
  try {
    const trash = readTrashIndex();
    res.json({ success: true, trash });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/admin/images/restore - restore from recycle bin
router.post('/images/restore', (req, res) => {
  try {
    const targetPath = req.body?.path;
    if (!targetPath) {
      return res.status(400).json({ success: false, error: 'Missing path to restore' });
    }

    const trash = readTrashIndex();
    const cleanTarget = String(targetPath).replace(/^\/images\//, '').replace(/\\/g, '/');
    const index = trash.findIndex(t => t.relativePath === cleanTarget || t.path === targetPath || t.storedFilename === targetPath);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Item not found in Recycle Bin' });
    }

    const item = trash[index];
    const sourcePath = path.join(trashDir, item.storedFilename);
    const destPath = path.join(publicImagesDir, item.relativePath);

    if (fs.existsSync(sourcePath)) {
      const destFolder = path.dirname(destPath);
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }
      fs.copyFileSync(sourcePath, destPath);
      fs.unlinkSync(sourcePath);
    }

    trash.splice(index, 1);
    writeTrashIndex(trash);

    res.json({ success: true, message: `Restored ${item.name} successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. DELETE /api/admin/images/trash - empty recycle bin
router.delete('/images/trash', (req, res) => {
  try {
    const entries = fs.readdirSync(trashDir);
    for (const file of entries) {
      if (file !== 'trash-index.json') {
        fs.unlinkSync(path.join(trashDir, file));
      }
    }
    writeTrashIndex([]);
    res.json({ success: true, message: 'Recycle Bin emptied successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. DELETE /api/admin/images - delete image(s) and move to recycle bin
router.delete('/images', (req, res) => {
  try {
    const rawPaths = req.query.path;
    if (!rawPaths) {
      return res.status(400).json({ success: false, error: 'Missing path parameter' });
    }

    const paths = String(rawPaths).split(',').map(p => p.trim()).filter(Boolean);
    const trash = readTrashIndex();
    let deletedCount = 0;

    for (const p of paths) {
      const cleanRel = p.replace(/^\/images\//, '').replace(/\\/g, '/').replace(/\.\./g, '');
      const fullPath = path.join(publicImagesDir, cleanRel);

      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        const storedFilename = `${Date.now()}-${path.basename(cleanRel)}`;
        const trashDest = path.join(trashDir, storedFilename);

        fs.copyFileSync(fullPath, trashDest);
        fs.unlinkSync(fullPath);

        trash.unshift({
          id: `trash-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: path.basename(cleanRel),
          relativePath: cleanRel,
          path: `/images/${cleanRel}`,
          sizeFormatted: formatBytes(stat.size),
          deletedAt: new Date().toISOString(),
          storedFilename
        });

        deletedCount++;
      }
    }

    writeTrashIndex(trash);
    res.json({ success: true, deletedCount, message: `Moved ${deletedCount} item(s) to Recycle Bin.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Site Images Configuration
router.get('/site-images', (req, res) => {
  try {
    const file = fs.existsSync(siteImagesDataFile) ? siteImagesDataFile : siteImagesSrcFile;
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      return res.json({ success: true, data });
    }
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/site-images', (req, res) => {
  try {
    const payload = req.body;
    const content = JSON.stringify(payload, null, 2);
    [siteImagesDataFile, siteImagesSrcFile].forEach(f => {
      const dir = path.dirname(f);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(f, content, 'utf-8');
    });
    res.json({ success: true, message: 'Saved site images configuration.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Unit SqFt Images Configuration
router.get('/unit-sqft-images', (req, res) => {
  try {
    const file = fs.existsSync(unitImagesDataFile) ? unitImagesDataFile : unitImagesSrcFile;
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      return res.json({ success: true, data });
    }
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/unit-sqft-images', (req, res) => {
  try {
    const { sqft, entry, map } = req.body || {};
    let finalMap = {};

    const file = fs.existsSync(unitImagesDataFile) ? unitImagesDataFile : unitImagesSrcFile;
    if (fs.existsSync(file)) {
      try {
        finalMap = JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch (e) {
        finalMap = {};
      }
    }

    if (map && typeof map === 'object') {
      finalMap = { ...finalMap, ...map };
    } else if (sqft && entry) {
      finalMap[String(sqft)] = entry;
    }

    const content = JSON.stringify(finalMap, null, 2);
    [unitImagesDataFile, unitImagesSrcFile].forEach(f => {
      const dir = path.dirname(f);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(f, content, 'utf-8');
    });

    res.json({ success: true, data: finalMap });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/unit-sqft-images', (req, res) => {
  try {
    const sqft = req.query.sqft;
    const isAll = req.query.all === 'true';

    let finalMap = {};
    const file = fs.existsSync(unitImagesDataFile) ? unitImagesDataFile : unitImagesSrcFile;
    if (fs.existsSync(file)) {
      try {
        finalMap = JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch (e) {
        finalMap = {};
      }
    }

    if (isAll) {
      finalMap = {};
    } else if (sqft) {
      delete finalMap[String(sqft)];
    }

    const content = JSON.stringify(finalMap, null, 2);
    [unitImagesDataFile, unitImagesSrcFile].forEach(f => {
      const dir = path.dirname(f);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(f, content, 'utf-8');
    });

    res.json({ success: true, data: finalMap });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// Pages SEO Management Endpoints
// ==========================================

// GET /api/admin/pages-seo
router.get('/pages-seo', (req, res) => {
  try {
    const file = fs.existsSync(pagesSeoDataFile) ? pagesSeoDataFile : pagesSeoSrcFile;
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      return res.json({ success: true, data });
    }
    return res.json({ success: true, data: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/pages-seo (bulk update)
router.put('/pages-seo', (req, res) => {
  try {
    const list = req.body?.data || req.body;
    if (!Array.isArray(list)) {
      return res.status(400).json({ success: false, error: 'Expected an array of page SEO configurations' });
    }
    const content = JSON.stringify(list, null, 2);
    [pagesSeoDataFile, pagesSeoSrcFile].forEach(f => {
      const dir = path.dirname(f);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(f, content, 'utf-8');
    });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/pages-seo (upsert single)
router.post('/pages-seo', (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.path) {
      return res.status(400).json({ success: false, error: 'Path is required' });
    }
    let list = [];
    const file = fs.existsSync(pagesSeoDataFile) ? pagesSeoDataFile : pagesSeoSrcFile;
    if (fs.existsSync(file)) {
      try {
        list = JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch (e) {
        list = [];
      }
    }
    const idx = list.findIndex(p => p.path === item.path || (item.id && p.id === item.id));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...item, id: item.id || `page-${Date.now()}`, updatedAt: new Date().toISOString() });
    }
    const content = JSON.stringify(list, null, 2);
    [pagesSeoDataFile, pagesSeoSrcFile].forEach(f => {
      const dir = path.dirname(f);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(f, content, 'utf-8');
    });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/pages-seo/:id
router.delete('/pages-seo/:id', (req, res) => {
  try {
    const id = req.params.id;
    let list = [];
    const file = fs.existsSync(pagesSeoDataFile) ? pagesSeoDataFile : pagesSeoSrcFile;
    if (fs.existsSync(file)) {
      try {
        list = JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch (e) {
        list = [];
      }
    }
    list = list.filter(p => p.id !== id && p.path !== id);
    const content = JSON.stringify(list, null, 2);
    [pagesSeoDataFile, pagesSeoSrcFile].forEach(f => {
      const dir = path.dirname(f);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(f, content, 'utf-8');
    });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/save-local-bundle - saves complete state bundle to disk
router.post('/save-local-bundle', (req, res) => {
  try {
    const bundle = req.body;
    if (!bundle || typeof bundle !== 'object') {
      return res.status(400).json({ success: false, error: 'Expected bundle object' });
    }

    const dataDir = path.join(projectRoot, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    // 1. Save master backup bundle
    const backupFile = path.join(dataDir, 'local-backup-bundle.json');
    fs.writeFileSync(backupFile, JSON.stringify({ ...bundle, savedAt: new Date().toISOString() }, null, 2), 'utf-8');

    // 2. Save individual JSON data files if provided
    if (bundle.properties && Array.isArray(bundle.properties)) {
      fs.writeFileSync(path.join(dataDir, 'properties.json'), JSON.stringify(bundle.properties, null, 2), 'utf-8');
    }
    if (bundle.buildings && Array.isArray(bundle.buildings)) {
      fs.writeFileSync(path.join(dataDir, 'buildings.json'), JSON.stringify(bundle.buildings, null, 2), 'utf-8');
    }
    if (bundle.pagesSeo && Array.isArray(bundle.pagesSeo)) {
      const seoContent = JSON.stringify(bundle.pagesSeo, null, 2);
      [pagesSeoDataFile, pagesSeoSrcFile].forEach(f => {
        const dir = path.dirname(f);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(f, seoContent, 'utf-8');
      });
    }
    if (bundle.guides && Array.isArray(bundle.guides)) {
      fs.writeFileSync(path.join(dataDir, 'guides.json'), JSON.stringify(bundle.guides, null, 2), 'utf-8');
    }

    res.json({ success: true, message: 'All local data safely saved to disk', savedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Main middleware adapter that handles both Express and Connect (Vite dev server)
export async function imageApiMiddleware(req, res, next) {
  const url = req.url || '';
  if (!url.startsWith('/api/admin/')) {
    return next();
  }

  // 1. Polyfill res.status and res.json for Connect / Vite compatibility
  if (typeof res.status !== 'function') {
    res.status = function(code) {
      this.statusCode = code;
      return this;
    };
  }

  if (typeof res.json !== 'function') {
    res.json = function(data) {
      if (!this.getHeader('Content-Type')) {
        this.setHeader('Content-Type', 'application/json');
      }
      this.end(JSON.stringify(data));
      return this;
    };
  }

  if (typeof res.send !== 'function') {
    res.send = function(body) {
      if (typeof body === 'object' && body !== null) {
        return this.json(body);
      }
      this.end(body);
      return this;
    };
  }

  // 2. Ensure query params are parsed
  if (!req.query) {
    if (url.includes('?')) {
      const qStr = url.split('?')[1];
      req.query = Object.fromEntries(new URLSearchParams(qStr).entries());
    } else {
      req.query = {};
    }
  }

  // 3. Ensure JSON body is parsed when running under Vite Connect
  const contentType = req.headers['content-type'] || '';
  if (!req.body && contentType.includes('application/json') && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const raw = Buffer.concat(buffers).toString('utf-8');
      req.body = raw ? JSON.parse(raw) : {};
    } catch (err) {
      req.body = {};
    }
  }

  // Strip prefix for the internal router
  req.url = url.replace(/^\/api\/admin/, '') || '/';
  router(req, res, (err) => {
    // Restore original url on pass-through
    req.url = url;
    if (err) {
      res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
    } else {
      res.status(404).json({ success: false, error: `Admin API route not found: ${url}` });
    }
  });
}