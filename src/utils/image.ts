export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export interface ProcessedImage {
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Only JPEG, PNG, WebP and GIF images are allowed.';
  if (file.size > MAX_UPLOAD_BYTES) return 'Images must be 8 MB or smaller.';
  return null;
}

/** Resize to max 1600px and convert to WebP for fast delivery. */
export function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File is not a valid image'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unavailable'));
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/webp', quality);
        const size = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
        resolve({ dataUrl, width: w, height: h, size, mimeType: 'image/webp' });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}