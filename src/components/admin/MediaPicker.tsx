import React, { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/Sheet';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { MediaUploader } from './MediaUploader';

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  title?: string;
}

export function MediaPicker({ open, onOpenChange, selectedId, onSelect, title = 'Select image' }: MediaPickerProps) {
  const { db } = useStore();
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<string | null>(selectedId ?? null);
  const items = db.media.filter((m) => `${m.title} ${m.alt}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col bg-white sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Choose from the media library or upload a new image.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <MediaUploader compact onUploaded={(items) => items[0] && setPicked(items[0].id)} />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search library…" className="pl-9" aria-label="Search media" />
          </div>
          <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3">
            {items.map((m) =>
            <button
              key={m.id}
              type="button"
              onClick={() => setPicked(m.id)}
              onDoubleClick={() => {onSelect(m.id);onOpenChange(false);}}
              className={`group relative overflow-hidden rounded-md border-2 text-left transition ${picked === m.id ? 'border-brand ring-2 ring-brand/30' : 'border-transparent hover:border-border'}`}
              aria-pressed={picked === m.id}>
              
                <img src={m.url} alt={m.alt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                <p className="truncate px-2 py-1.5 text-xs">{m.title}</p>
                {!m.alt && <span className="absolute left-1.5 top-1.5 rounded bg-amber-500 px-1.5 text-[10px] font-semibold text-white">No alt</span>}
                {picked === m.id && <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white"><Check className="h-3.5 w-3.5" /></span>}
              </button>
            )}
            {items.length === 0 && <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No images found.</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!picked} onClick={() => {if (picked) {onSelect(picked);onOpenChange(false);}}}>Use selected image</Button>
        </div>
      </SheetContent>
    </Sheet>);

}