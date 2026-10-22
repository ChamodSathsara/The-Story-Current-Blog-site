import React, { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Link2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { EmptyState, PageHeader } from '../../components/admin/PageHeader';
import { blankSource, SourceForm } from '../../components/admin/SourceForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/Sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useStore } from '../../contexts/StoreContext';
import { sourceTypeLabel } from '../../data/sourceTypes';
import type { Source } from '../../types/models';
import { uid } from '../../utils/format';

export function Sources() {
  const { db, upsert, remove } = useStore();
  const [editing, setEditing] = useState<Source | null>(null);
  const [q, setQ] = useState('');
  const usage = (id: string) => db.posts.filter((p) => p.sources.some((s) => s.sourceId === id)).length;
  const list = db.sources.filter((s) => `${s.name} ${s.publisher} ${s.url}`.toLowerCase().includes(q.toLowerCase()));

  const save = (s: Source) => {
    const item = { ...s, id: s.id || uid() };
    upsert('sources', item, `${s.id ? 'Updated' : 'Created'} source "${item.name}"`);
    toast.success('Source saved');
    setEditing(null);
  };

  const del = (s: Source) => {
    const n = usage(s.id);
    if (n > 0) return toast.error(`Cited in ${n} article(s). Remove it from those articles first.`);
    if (!window.confirm(`Delete source "${s.name}"?`)) return;
    remove('sources', [s.id], `Deleted source "${s.name}"`);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Sources"
        description="Reusable references cited in articles. Attribution does not replace copyright permission."
        actions={<Button onClick={() => setEditing(blankSource())}><Plus className="h-4 w-4" /> New source</Button>} />
      
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sources…" className="bg-white pl-9" aria-label="Search sources" />
      </div>
      {list.length === 0 ?
      <EmptyState icon={<Link2 className="h-5 w-5" />} title="No sources" description="Add sources here or while editing an article." /> :

      <div className="rounded-lg border border-border bg-white">
          <Table>
            <TableHeader><TableRow><TableHead>Source</TableHead><TableHead>Type</TableHead><TableHead>Publisher</TableHead><TableHead>Cited in</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.map((s) =>
            <TableRow key={s.id}>
                  <TableCell className="max-w-xs">
                    <p className="truncate font-medium">{s.name}</p>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 truncate text-xs text-brand hover:underline">{s.url}<ExternalLink className="h-3 w-3 shrink-0" /></a>
                  </TableCell>
                  <TableCell className="text-sm">{sourceTypeLabel(s.type)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.publisher || '—'}</TableCell>
                  <TableCell className="tabular-nums">{usage(s.id)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditing({ ...s })} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50" onClick={() => del(s)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
            )}
            </TableBody>
          </Table>
        </div>
      }
      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing?.id ? 'Edit source' : 'New source'}</SheetTitle>
            <SheetDescription>Sources link readers to the original publication.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {editing && <SourceForm key={editing.id || 'new'} initial={editing} existing={db.sources} onSave={save} onCancel={() => setEditing(null)} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>);

}