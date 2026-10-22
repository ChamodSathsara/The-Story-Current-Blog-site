import React, { useState } from 'react';
import { toast } from 'sonner';
import { Building2, ImagePlus, Pencil, Plus, Trash2, User } from 'lucide-react';
import { FormField } from '../../components/admin/FormField';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/CSwitch';
import { Input } from '../../components/ui/Input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/Sheet';
import { Textarea } from '../../components/ui/Textarea';
import { useStore } from '../../contexts/StoreContext';
import type { Author } from '../../types/models';
import { slugify, uid } from '../../utils/format';
import { authorSchema, firstErrors } from '../../utils/validation';

const blank = (): Author => ({
  id: '', fullName: '', displayName: '', slug: '', avatarUrl: '', bio: '', role: '', email: '', showEmail: false, website: '',
  socials: {}, active: true, isOrganization: false
});

export function Authors() {
  const { db, upsert, remove } = useStore();
  const [editing, setEditing] = useState<Author | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [picker, setPicker] = useState(false);
  const count = (id: string) => db.posts.filter((p) => p.authorId === id).length;

  const set = <K extends keyof Author,>(k: K, v: Author[K]) => editing && setEditing({ ...editing, [k]: v });

  const save = () => {
    if (!editing) return;
    const parsed = authorSchema.safeParse(editing);
    if (!parsed.success) return setErrors(firstErrors(parsed.error));
    if (db.authors.some((a) => a.slug === editing.slug && a.id !== editing.id)) return setErrors({ slug: 'Slug already in use' });
    const item = { ...editing, id: editing.id || uid() };
    upsert('authors', item, `${editing.id ? 'Updated' : 'Created'} author "${item.displayName}"`);
    toast.success('Author saved');
    setEditing(null);
  };

  const del = (a: Author) => {
    if (count(a.id) > 0) return toast.error(`${a.displayName} has ${count(a.id)} article(s). Reassign them or mark the author inactive instead.`);
    if (!window.confirm(`Delete author "${a.displayName}"?`)) return;
    remove('authors', [a.id], `Deleted author "${a.displayName}"`);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Authors"
        description="Attribute every article accurately. Use the Editorial Team for organization-written content."
        actions={<Button onClick={() => {setErrors({});setEditing(blank());}}><Plus className="h-4 w-4" /> New author</Button>} />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {db.authors.map((a) =>
        <article key={a.id} className="flex flex-col rounded-lg border border-border bg-white p-5">
            <div className="flex items-start gap-3">
              {a.avatarUrl ? <img src={a.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand"><User className="h-5 w-5" /></span>}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{a.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{a.role || '—'}</p>
              </div>
              <StatusBadge status={a.active ? 'active' : 'inactive'} />
            </div>
            <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{a.bio || 'No biography yet.'}</p>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">{a.isOrganization ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}{a.isOrganization ? 'Organization' : 'Person'} · {count(a.id)} articles</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => {setErrors({});setEditing({ ...a, socials: { ...a.socials } });}} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50" onClick={() => del(a)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </article>
        )}
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing?.id ? 'Edit author' : 'New author'}</SheetTitle>
            <SheetDescription>Only add real people or your organization. Never invent identities or credentials.</SheetDescription>
          </SheetHeader>
          {editing &&
          <div className="space-y-4 px-4 pb-6">
              <div className="flex items-center gap-4">
                {editing.avatarUrl ? <img src={editing.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted"><User className="h-6 w-6 text-muted-foreground" /></span>}
                <Button variant="outline" size="sm" onClick={() => setPicker(true)}><ImagePlus className="h-4 w-4" /> Profile picture</Button>
                {editing.avatarUrl && <Button variant="ghost" size="sm" onClick={() => set('avatarUrl', '')}>Remove</Button>}
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div><p className="text-sm font-medium">Organization / team byline</p><p className="text-xs text-muted-foreground">Uses Organization in structured data</p></div>
                <Switch checked={editing.isOrganization} onCheckedChange={(v) => set('isOrganization', v)} />
              </div>
              <FormField label="Full name" htmlFor="a-full" required error={errors.fullName}>
                <Input id="a-full" value={editing.fullName} onChange={(e) => setEditing({ ...editing, fullName: e.target.value, displayName: editing.displayName || '', slug: editing.id ? editing.slug : slugify(e.target.value) })} />
              </FormField>
              <FormField label="Display name" htmlFor="a-disp" required error={errors.displayName} hint="Shown in bylines">
                <Input id="a-disp" value={editing.displayName} onChange={(e) => set('displayName', e.target.value)} />
              </FormField>
              <FormField label="URL slug" htmlFor="a-slug" required error={errors.slug} hint={`/author/${editing.slug || '…'}`}>
                <Input id="a-slug" value={editing.slug} onChange={(e) => set('slug', slugify(e.target.value))} />
              </FormField>
              <FormField label="Job title / role" htmlFor="a-role"><Input id="a-role" value={editing.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. Sports Contributor" /></FormField>
              <FormField label="Short biography" htmlFor="a-bio" error={errors.bio} counter={{ value: editing.bio.length, max: 1200 }}>
                <Textarea id="a-bio" rows={4} value={editing.bio} onChange={(e) => set('bio', e.target.value)} />
              </FormField>
              <FormField label="Email (private)" htmlFor="a-email" error={errors.email}><Input id="a-email" type="email" value={editing.email} onChange={(e) => set('email', e.target.value)} /></FormField>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-[#FF5A00]" checked={editing.showEmail} onChange={(e) => set('showEmail', e.target.checked)} /> Show email publicly on profile</label>
              <FormField label="Website" htmlFor="a-web" error={errors.website}><Input id="a-web" value={editing.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" /></FormField>
              <div className="grid grid-cols-2 gap-3">
                {(['twitter', 'facebook', 'linkedin', 'instagram'] as const).map((k) =>
              <FormField key={k} label={k === 'twitter' ? 'X / Twitter' : k[0].toUpperCase() + k.slice(1)} htmlFor={`a-${k}`}>
                    <Input id={`a-${k}`} value={editing.socials[k] ?? ''} onChange={(e) => set('socials', { ...editing.socials, [k]: e.target.value })} placeholder="https://" />
                  </FormField>
              )}
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="text-sm font-medium">Active (selectable & public profile)</span>
                <Switch checked={editing.active} onCheckedChange={(v) => set('active', v)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save}>Save author</Button>
              </div>
            </div>
          }
        </SheetContent>
      </Sheet>
      <MediaPicker open={picker} onOpenChange={setPicker} title="Profile picture" onSelect={(id) => set('avatarUrl', db.media.find((m) => m.id === id)?.url ?? '')} />
    </div>);

}