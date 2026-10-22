import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '../contexts/StoreContext';
import type { MediaItem } from '../types/models';
import { uid } from '../utils/format';
import { compressImage, validateImageFile } from '../utils/image';

/**
 * Validates, compresses (WebP) and stores uploaded images.
 * Production: POST to a server route that re-validates MIME/size and writes to Cloudflare R2.
 */
export function useMediaUpload() {
  const { upsert } = useStore();
  const [uploading, setUploading] = useState(false);

  const upload = async (files: FileList | File[]): Promise<MediaItem[]> => {
    const list = Array.from(files);
    const created: MediaItem[] = [];
    setUploading(true);
    for (const file of list) {
      const err = validateImageFile(file);
      if (err) {
        toast.error(`${file.name}: ${err}`);
        continue;
      }
      try {
        const out = await compressImage(file);
        const item: MediaItem = {
          id: uid(),
          url: out.dataUrl,
          title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          alt: '',
          caption: '',
          credit: '',
          license: '',
          mimeType: out.mimeType,
          size: out.size,
          width: out.width,
          height: out.height,
          createdAt: new Date().toISOString()
        };
        upsert('media', item, `Uploaded image "${item.title}"`);
        created.push(item);
      } catch (e) {
        toast.error(`${file.name}: ${(e as Error).message}`);
      }
    }
    setUploading(false);
    if (created.length) toast.success(`${created.length} image${created.length > 1 ? 's' : ''} uploaded and optimized`);
    return created;
  };

  return { upload, uploading };
}