import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, CornerDownRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormField, selectCls } from '../../components/admin/FormField';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/CSwitch';
import { Input } from '../../components/ui/Input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/Sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Textarea } from '../../components/ui/Textarea';
import { useStore } from '../../contexts/StoreContext';
import type { Category } from '../../types/models';
import { slugify, uid } from '../../utils/format';
import { categorySchema, firstErrors } from '../../utils/validation';

const blank = (): Category => ({ id: '', name: '', slug: '', description: '', parentId: null, order: 99, enabled: true, seoTitle: '', metaDescription: '' });

export function Categories() {
  const { db, upsert, remove } = useStore();
  const [editing, setEditing] = useState<Category | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(false);

  const parents = db.categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order);
  const childrenOf = (id: string) => db.categories.filter((c) => c.parentId === id).sort((a, b) => a.order - b.order);
  const count = (id: string) => db.posts.filter((p) => p.categoryId === id).length;

  const open = (c?: Category) => {
    setErrors({});
    setSlugTouched(!!c);
    setEditing(c ? { ...c } : blank());
  };

  const save = () => {
    if (!editing) return;
    const parsed = categorySchema.safeParse(editing);
    if (!parsed.success) return setErrors(firstErrors(parsed.error));
    if (db.categories.some((c) => c.slug === editing.slug && c.id !== editing.id)) return setErrors({ slug: 'This slug is already in use' });
    const isNew = !editing.id;
    const siblings = db.categories.filter((c) => c.parentId === editing.parentId);
    const item = { ...editing, id: editing.id || uid(), order: isNew ? siblings.length + 1 : editing.order };
    upsert('categories', item, `${isNew ? 'Created' : 'Updated'} category "${item.name}"`);
    toast.success('Category saved');
    setEditing(null);
  };

  const move = (c: Category, dir: -1 | 1) => {
    const list = db.categories.filter((x) => x.parentId === c.parentId).sort((a, b) => a.order - b.order);
    const idx = list.findIndex((x) => x.id === c.id);
    const swap = list[idx + dir];
    if (!swap) return;
    upsert('categories', { ...c, order: swap.order });
    upsert('categories', { ...swap, order: c.order });
  };

  const del = (c: Category) => {
    if (count(c.id) > 0) return toast.error('Reassign this category\'s articles before deleting it.');
    if (childrenOf(c.id).length > 0) return toast.error('Delete or move its subcategories first.');
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    remove('categories', [c.id], `Deleted category "${c.name}"`);
  };

  const row = (c: Category, depth: number) =>
  <TableRow key={c.id}>
      <TableCell>
        <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
          {depth > 0 && <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground" />}
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-muted-foreground">/category/{c.slug}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="tabular-nums">{count(c.id)}</TableCell>
      <TableCell>
        <Switch size="sm" checked={c.enabled} onCheckedChange={(v) => upsert('categories', { ...c, enabled: v }, `${v ? 'Enabled' : 'Disabled'} category "${c.name}"`)} aria-label={`Toggle ${c.name}`} />
      </TableCell>
      <TableCell className="text-xs">{c.seoTitle && c.metaDescription ? <span className="text-emerald-600">Complete</span> : <span className="text-amber-600">Incomplete</span>}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => move(c, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => move(c, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => open(c)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => del(c)} aria-label="Delete" className="text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </TableCell>
    </TableRow>;


  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Categories" description="Organize sections and subcategories. Order controls navigation." actions={<Button onClick={() => open()}><Plus className="h-4 w-4" /> New category</Button>} />
      <div className="rounded-lg border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Posts</TableHead><TableHead>Enabled</TableHead><TableHead>SEO</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
          </TableHeader>
          <TableBody>{parents.flatMap((p) => [row(p, 0), ...childrenOf(p.id).map((k) => row(k, 1))])}</TableBody>
        </Table>
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing?.id ? 'Edit category' : 'New category'}</SheetTitle>
            <SheetDescription>Each category has its own landing page and SEO metadata.</SheetDescription>
          </SheetHeader>
          {editing &&
          <div className="space-y-4 px-4 pb-6">
              <FormField label="Name" htmlFor="cat-name" required error={errors.name}>
                <Input id="cat-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: slugTouched ? editing.slug : slugify(e.target.value) })} />
              </FormField>
              <FormField label="Slug" htmlFor="cat-slug" required error={errors.slug}>
                <Input id="cat-slug" value={editing.slug} onChange={(e) => {setSlugTouched(true);setEditing({ ...editing, slug: slugify(e.target.value) });}} />
              </FormField>
              <FormField label="Parent category" htmlFor="cat-parent">
                <select id="cat-parent" className={selectCls} value={editing.parentId ?? ''} onChange={(e) => setEditing({ ...editing, parentId: e.target.value || null })}>
                  <option value="">None (top level)</option>
                  {parents.filter((p) => p.id !== editing.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </FormField>
              <FormField label="Description" htmlFor="cat-desc" error={errors.description}>
                <Textarea id="cat-desc" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </FormField>
              <FormField label="SEO title" htmlFor="cat-seo" error={errors.seoTitle} counter={{ value: editing.seoTitle.length, max: 70, ideal: [30, 60] }}>
                <Input id="cat-seo" value={editing.seoTitle} onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })} />
              </FormField>
              <FormField label="Meta description" htmlFor="cat-meta" error={errors.metaDescription} counter={{ value: editing.metaDescription.length, max: 170, ideal: [120, 160] }}>
                <Textarea id="cat-meta" rows={3} value={editing.metaDescription} onChange={(e) => setEditing({ ...editing, metaDescription: e.target.value })} />
              </FormField>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="text-sm font-medium">Visible on website</span>
                <Switch checked={editing.enabled} onCheckedChange={(v) => setEditing({ ...editing, enabled: v })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save}>Save category</Button>
              </div>
            </div>
          }
        </SheetContent>
      </Sheet>
    </div>);

}