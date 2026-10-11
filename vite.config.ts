import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function localImageUploadPlugin(): Plugin {
  return {
    name: 'local-image-upload',
    configureServer(server) {
      server.middlewares.use('/api/upload-image', async (req, res, next) => {
        if (req.method !== 'POST') {
          return next();
        }

        try {
          const buffers: Buffer[] = [];
          for await (const chunk of req) {
            buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          const rawBody = Buffer.concat(buffers).toString('utf-8');
          const { filename, dataUrl, folder = 'uploads' } = JSON.parse(rawBody);

          if (!dataUrl || typeof dataUrl !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing dataUrl' }));
            return;
          }

          const safeFolders = ['towers', 'properties', 'uploads', 'categories'];
          const targetDirName = safeFolders.includes(folder) ? folder : 'uploads';
          const targetDir = path.resolve(__dirname, 'public/images', targetDirName);

          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          let ext = '.webp';
          let base64Data = dataUrl;

          if (matches) {
            const mime = matches[1];
            base64Data = matches[2];
            if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
            else if (mime.includes('png')) ext = '.png';
            else if (mime.includes('webp')) ext = '.webp';
            else if (mime.includes('svg')) ext = '.svg';
            else if (mime.includes('gif')) ext = '.gif';
          }

          const originalBase = filename ? path.parse(filename).name : 'img';
          const safeName = originalBase
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 40) || 'image';
          const finalFilename = `${safeName}-${Date.now()}${ext}`;
          const filePath = path.join(targetDir, finalFilename);

          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

          const publicUrl = `/images/${targetDirName}/${finalFilename}`;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, url: publicUrl, filename: finalFilename }));
        } catch (err: any) {
          console.error('Local image upload error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Upload failed' }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localImageUploadPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    port: 3000,
    open: false,
    watch: {
      ignored: ['**/dist/**', '**/.git/**'],
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
