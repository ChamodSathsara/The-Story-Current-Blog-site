import React, { useState } from 'react';
import { toast } from 'sonner';
import { Check, Pencil, Plus, Tags as TagsIcon, Trash2, X } from 'lucide-react';
import { EmptyState, PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useStore } from '../../contexts/StoreContext';
import { slugify, uid } from '../../utils/format';

export function Tags() {
  const { db, upsert, remove } = useStore();
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const count = (id: string) => db.posts.filter((p) => p.tagIds.includes(id)).length;
  const tags = [...db.tags].sort((a, b) => a.name.localeCompare(b.name));

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (n.length < 2) return toast.error('Tag name is too short');
    const slug = slugify(n);
    if (db.tags.some((t) => t.slug === slug)) return toast.error('That tag already exists');
    upsert('tags', { id: uid(), name: n, slug }, `Created tag "${n}"`);
    setName('');
  };

  const rename = (id: string) => {
    const t = db.tags.find((x) => x.id === id);
    const n = editName.trim();
    if (!t || n.length < 2) return;
    const slug = slugify(n);
    if (db.tags.some((x) => x.slug === slug && x.id !== id)) return toast.error('Another tag uses that name');
    upsert('tags', { ...t, name: n, slug }, `Renamed tag "${t.name}" to "${n}"`);
    setEditId(null);
  };

  const del = (id: string, n: string) => {
    if (!window.confirm(`Delete tag "${n}"? It will be removed from ${count(id)} article(s).`)) return;
    db.posts.filter((p) => p.tagIds.includes(id)).forEach((p) => upsert('posts', { ...p, tagIds: p.tagIds.filter((t) => t !== id) }));
    remove('tags', [id], `Deleted tag "${n}"`);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Tags" description="Topic labels that group related articles." />
      <form onSubmit={create} className="mb-6 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag name" className="max-w-xs bg-white" aria-label="New tag name" />
        <Button type="submit"><Plus className="h-4 w-4" /> Add tag</Button>
      </form>
      {tags.length === 0 ?
      <EmptyState icon={<TagsIcon className="h-5 w-5" />} title="No tags yet" description="Create tags here or directly in the article editor." /> :

      <div className="rounded-lg border border-border bg-white">
          <Table>
            <TableHeader><TableRow><TableHead>Tag</TableHead><TableHead>Slug</TableHead><TableHead>Articles</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {tags.map((t) =>
            <TableRow key={t.id}>
                  <TableCell>
                    {editId === t.id ?
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 max-w-[200px]" autoFocus onKeyDown={(e) => e.key === 'Enter' && rename(t.id)} aria-label="Tag name" /> :

                <span className="font-medium">#{t.name}</span>
                }
                  </TableCell>
                  <TableCell className="text-muted-foreground">/tag/{t.slug}</TableCell>
                  <TableCell className="tabular-nums">{count(t.id)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {editId === t.id ?
                  <>
                          <Button variant="ghost" size="icon-sm" onClick={() => rename(t.id)} aria-label="Save"><Check className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setEditId(null)} aria-label="Cancel"><X className="h-4 w-4" /></Button>
                        </> :

                  <Button variant="ghost" size="icon-sm" onClick={() => {setEditId(t.id);setEditName(t.name);}} aria-label="Rename"><Pencil className="h-4 w-4" /></Button>
                  }
                      <Button variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50" onClick={() => del(t.id, t.name)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
            )}
            </TableBody>
          </Table>
        </div>
      }
    </div>);

}