/**
 * Attempts to upload/save the compressed image directly into the project's
 * public/images/ folders via the Vite dev server endpoint.
 * Falls back silently to the dataUrl if the server endpoint is unavailable.
 */
async function trySaveToProject(file: File, dataUrl: string, folder: string = 'uploads'): Promise<string> {
  if (typeof window === 'undefined' || !dataUrl) return dataUrl;
  try {
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        dataUrl,
        folder
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.url) {
        return data.url;
      }
    }
  } catch {
    // Dev server upload endpoint not available or offline, fallback to data URL
  }
  return dataUrl;
}

/**
 * Highly optimized client-side image compressor utility for web applications.
 * Converts images to optimized WebP (with fallback to JPEG) with responsive dimensions,
 * preventing LocalStorage QuotaExceeded errors while maintaining crisp visual fidelity.
 * If running on Vite dev server, also automatically saves the file to public/images/<folder>/.
 */
export const compressImageFile = (
  file: File, 
  maxWidth = 1200, 
  quality = 0.76,
  folder: 'towers' | 'properties' | 'uploads' | 'categories' = 'uploads'
): Promise<string> => {
  return new Promise((resolve) => {
    if (!file) {
      resolve('');
      return;
    }

    // Preserve SVGs directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = (reader.result as string) || '';
        const saved = await trySaveToProject(file, result, folder);
        resolve(saved);
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    // For small GIFs under 1.5MB, preserve animation
    if (file.type === 'image/gif' && file.size < 1.5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = (reader.result as string) || '';
        const saved = await trySaveToProject(file, result, folder);
        resolve(saved);
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || '';
      if (!dataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = async () => {
        try {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d', { alpha: false });

          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          // Fill white background for transparent images converted to jpeg/webp
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Try WebP first for superior compression (~40-60% smaller than JPEG)
          let output = canvas.toDataURL('image/webp', quality);
          if (!output.startsWith('data:image/webp')) {
            // Fallback to JPEG if browser canvas doesn't support webp export
            output = canvas.toDataURL('image/jpeg', quality);
          }

          // Secondary pass if still too large (> 180KB base64 string)
          if (output.length > 250000 && (width > 800 || height > 800)) {
            const smallerMax = 800;
            const sHeight = Math.round((height * smallerMax) / width);
            const sWidth = smallerMax;
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = sWidth;
            smallCanvas.height = sHeight;
            const sCtx = smallCanvas.getContext('2d', { alpha: false });
            if (sCtx) {
              sCtx.fillStyle = '#FFFFFF';
              sCtx.fillRect(0, 0, sWidth, sHeight);
              sCtx.drawImage(canvas, 0, 0, sWidth, sHeight);
              const smallOutput = smallCanvas.toDataURL('image/webp', 0.70);
              if (smallOutput.startsWith('data:image/webp') && smallOutput.length < output.length) {
                output = smallOutput;
              }
            }
          }

          const savedUrl = await trySaveToProject(file, output, folder);
          resolve(savedUrl);
        } catch (err) {
          console.warn('Canvas compression error, falling back:', err);
          const saved = await trySaveToProject(file, dataUrl, folder);
          resolve(saved);
        }
      };

      img.onerror = async () => {
        console.warn('Image element decode failed, falling back to data URL');
        const saved = await trySaveToProject(file, dataUrl, folder);
        resolve(saved);
      };

      img.src = dataUrl;
    };

    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};
