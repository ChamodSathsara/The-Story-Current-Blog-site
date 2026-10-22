import React, { useRef, useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import type { MediaItem } from '../../types/models';
import { ALLOWED_IMAGE_TYPES } from '../../utils/image';

export function MediaUploader({ onUploaded, compact = false }: {onUploaded?: (items: MediaItem[]) => void;compact?: boolean;}) {
  const { upload, uploading } = useMediaUpload();
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    const items = await upload(files);
    onUploaded?.(items);
    if (input.current) input.current.value = '';
  };

  return (
    <div
      onDragOver={(e) => {e.preventDefault();setDrag(true);}}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {e.preventDefault();setDrag(false);void handle(e.dataTransfer.files);}}
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition ${compact ? 'p-5' : 'p-10'} ${drag ? 'border-brand bg-brand-soft' : 'border-border bg-white'}`}>
      
      {uploading ? <Loader2 className="h-8 w-8 animate-spin text-brand" /> : <UploadCloud className="h-8 w-8 text-brand" />}
      <p className="mt-3 text-sm font-medium">{uploading ? 'Optimizing images…' : 'Drag & drop images here'}</p>
      <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP or GIF · up to 8 MB · converted to WebP automatically</p>
      <button type="button" onClick={() => input.current?.click()} disabled={uploading} className="mt-4 rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand disabled:opacity-50">
        Browse files
      </button>
      <input ref={input} type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} multiple className="hidden" onChange={(e) => void handle(e.target.files)} aria-label="Upload images" />
    </div>);

}