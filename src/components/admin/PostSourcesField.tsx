import React, { useState } from 'react';
import { ExternalLink, Plus, X } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { sourceTypeLabel } from '../../data/sourceTypes';
import type { PostSource, Source } from '../../types/models';
import { uid } from '../../utils/format';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/Sheet';
import { selectCls } from './FormField';
import { blankSource, SourceForm } from './SourceForm';

export function PostSourcesField({ value, onChange }: {value: PostSource[];onChange: (v: PostSource[]) => void;}) {
  const { db, upsert } = useStore();
  const [creating, setCreating] = useState(false);
  const available = db.sources.filter((s) => !value.some((v) => v.sourceId === s.id));

  const add = (id: string) => id && onChange([...value, { sourceId: id, note: '' }]);
  const create = (s: Source) => {
    const item = { ...s, id: uid() };
    upsert('sources', item, `Created source "${item.name}"`);
    onChange([...value, { sourceId: item.id, note: '' }]);
    setCreating(false);
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && <p className="text-xs text-muted-foreground">No sources cited. Add the primary sources behind this article.</p>}
      {value.map((ps, i) => {
        const s = db.sources.find((x) => x.id === ps.sourceId);
        if (!s) return null;
        return (
          <div key={ps.sourceId} className="rounded-md border border-border p-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium hover:text-brand">{s.name}<ExternalLink className="h-3 w-3" /></a>
                <p className="truncate text-xs text-muted-foreground">{sourceTypeLabel(s.type)}{s.publisher && ` · ${s.publisher}`}</p>
              </div>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${s.name}`} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
            </div>
            <Input value={ps.note} onChange={(e) => onChange(value.map((v, j) => j === i ? { ...v, note: e.target.value } : v))} placeholder="Article-specific note (optional)" className="mt-2 h-8 text-xs" aria-label="Attribution note" />
          </div>);

      })}
      <select className={selectCls} value="" onChange={(e) => add(e.target.value)} aria-label="Add existing source">
        <option value="">+ Add saved source…</option>
        {available.map((s) => <option key={s.id} value={s.id}>{s.name}{s.publisher ? ` — ${s.publisher}` : ''}</option>)}
      </select>
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New source</Button>
      <Sheet open={creating} onOpenChange={setCreating}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add a source</SheetTitle>
            <SheetDescription>Saved to the Sources library for reuse.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">{creating && <SourceForm initial={blankSource()} existing={db.sources} onSave={create} onCancel={() => setCreating(false)} />}</div>
        </SheetContent>
      </Sheet>
    </div>);

}