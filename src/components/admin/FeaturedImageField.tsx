import React, { useState } from 'react';
import { ImagePlus, RefreshCw, X } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { findMedia } from '../../utils/posts';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from './FormField';
import { MediaPicker } from './MediaPicker';

interface FeaturedImageFieldProps {
  mediaId: string | null;
  onChange: (id: string | null) => void;
  error?: string;
  altError?: string;
}

/** Caption, alt text and credit are stored on the media record so they stay consistent when reused. */
export function FeaturedImageField({ mediaId, onChange, error, altError }: FeaturedImageFieldProps) {
  const { db, upsert } = useStore();
  const [picker, setPicker] = useState(false);
  const m = findMedia(db, mediaId);

  const patch = (k: 'alt' | 'caption' | 'credit', v: string) => m && upsert('media', { ...m, [k]: v });

  return (
    <div className="space-y-3">
      {m ?
      <div className="relative overflow-hidden rounded-md border border-border">
          <img src={m.url} alt={m.alt} className="aspect-[16/9] w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-1">
            <button type="button" onClick={() => setPicker(true)} className="rounded bg-white/90 p-1.5 shadow hover:bg-white" aria-label="Replace image"><RefreshCw className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => onChange(null)} className="rounded bg-white/90 p-1.5 shadow hover:bg-white" aria-label="Remove image"><X className="h-3.5 w-3.5" /></button>
          </div>
        </div> :

      <button type="button" onClick={() => setPicker(true)} className={`flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-sm text-muted-foreground hover:border-brand hover:text-brand ${error ? 'border-red-400' : 'border-border'}`}>
          <ImagePlus className="h-6 w-6" /> Select featured image
        </button>
      }
      {error && <p className="text-xs text-red-600">{error}</p>}
      {m &&
      <>
          <FormField label="Alt text" htmlFor="fi-alt" required error={altError}><Input id="fi-alt" value={m.alt} onChange={(e) => patch('alt', e.target.value)} placeholder="Describe the image" /></FormField>
          <FormField label="Caption" htmlFor="fi-cap"><Input id="fi-cap" value={m.caption} onChange={(e) => patch('caption', e.target.value)} /></FormField>
          <FormField label="Image credit" htmlFor="fi-credit"><Input id="fi-credit" value={m.credit} onChange={(e) => patch('credit', e.target.value)} placeholder="Photo: Name / Agency" /></FormField>
        </>
      }
      {!m && <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setPicker(true)}>Open media library</Button>}
      <MediaPicker open={picker} onOpenChange={setPicker} selectedId={mediaId} title="Featured image" onSelect={onChange} />
    </div>);

}