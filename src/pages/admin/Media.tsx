import React, { useState } from 'react';
import { toast } from 'sonner';
import { Image as ImageIcon, Search, Trash2 } from 'lucide-react';
import { FormField } from '../../components/admin/FormField';
import { MediaUploader } from '../../components/admin/MediaUploader';
import { EmptyState, PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/Sheet';
import { Textarea } from '../../components/ui/Textarea';
import { useStore } from '../../contexts/StoreContext';
import type { MediaItem } from '../../types/models';
import { formatBytes, formatDate } from '../../utils/format';

export function Media() {
  const { db, upsert, remove } = useStore();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const items = db.media.filter((m) => `${m.title} ${m.alt} ${m.credit}`.toLowerCase().includes(q.toLowerCase()));

  const usage = (id: string) =>
  db.posts.filter((p) => p.featuredImageId === id || p.seo.ogImageId === id || p.content.includes(db.media.find((m) => m.id === id)?.url ?? '###')).length;

  const save = () => {
    if (!editing) return;
    upsert('media', editing, `Updated media details "${editing.title}"`);
    toast.success('Image details saved');
    setEditing(null);
  };

  const del = (m: MediaItem) => {
    const used = usage(m.id);
    if (used > 0) {
      toast.error(`This image is used by ${used} article(s). Replace it there before deleting.`);
      return;
    }
    if (!window.confirm(`Delete "${m.title}" permanently?`)) return;
    remove('media', [m.id], `Deleted image "${m.title}"`);
    setEditing(null);
    toast.success('Image deleted');
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Media Library" description={`${db.media.length} images · stored in Cloudflare R2 in production`} />
      <MediaUploader />
      <div className="relative mt-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, alt or credit…" className="bg-white pl-9" aria-label="Search media" />
      </div>
      {items.length === 0 ?
      <div className="mt-6"><EmptyState icon={<ImageIcon className="h-5 w-5" />} title="No images" description="Upload images to reuse them across articles." /></div> :

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => {
          const used = usage(m.id);
          return (
            <button key={m.id} type="button" onClick={() => setEditing({ ...m })} className="group overflow-hidden rounded-lg border border-border bg-white text-left transition hover:border-brand hover:shadow-sm">
                <div className="relative">
                  <img src={m.url} alt={m.alt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  {!m.alt && <span className="absolute left-2 top-2 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">Missing alt text</span>}
                  {m.demo && <span className="absolute right-2 top-2 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">Demo</span>}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.size ? formatBytes(m.size) : 'External'} · {used ? `Used in ${used}` : 'Unused'}</p>
                </div>
              </button>);

        })}
        </div>
      }

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Image details</SheetTitle>
            <SheetDescription>Alt text, caption, credit and licensing.</SheetDescription>
          </SheetHeader>
          {editing &&
          <div className="space-y-4 px-4 pb-6">
              <img src={editing.url} alt={editing.alt} className="w-full rounded-md border border-border" />
              <p className="text-xs text-muted-foreground">
                {editing.width}×{editing.height} · {editing.mimeType} · {editing.size ? formatBytes(editing.size) : 'external'} · uploaded {formatDate(editing.createdAt)}
              </p>
              <FormField label="Title" htmlFor="m-title"><Input id="m-title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></FormField>
              <FormField label="Alt text" htmlFor="m-alt" required hint="Describe the image for screen readers and search engines." counter={{ value: editing.alt.length, max: 125 }}>
                <Textarea id="m-alt" rows={2} value={editing.alt} onChange={(e) => setEditing({ ...editing, alt: e.target.value })} />
              </FormField>
              <FormField label="Caption" htmlFor="m-cap"><Textarea id="m-cap" rows={2} value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} /></FormField>
              <FormField label="Credit" htmlFor="m-credit" hint="e.g. Photo: Jane Doe / Agency"><Input id="m-credit" value={editing.credit} onChange={(e) => setEditing({ ...editing, credit: e.target.value })} /></FormField>
              <FormField label="License / usage notes" htmlFor="m-lic"><Textarea id="m-lic" rows={2} value={editing.license} onChange={(e) => setEditing({ ...editing, license: e.target.value })} /></FormField>
              <div className="flex justify-between gap-2 pt-2">
                <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => del(editing)}><Trash2 className="h-4 w-4" /> Delete</Button>
                <Button onClick={save}>Save details</Button>
              </div>
            </div>
          }
        </SheetContent>
      </Sheet>
    </div>);

}