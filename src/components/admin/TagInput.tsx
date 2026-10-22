import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { slugify, uid } from '../../utils/format';

export function TagInput({ value, onChange }: {value: string[];onChange: (ids: string[]) => void;}) {
  const { db, upsert } = useStore();
  const [q, setQ] = useState('');
  const selected = db.tags.filter((t) => value.includes(t.id));
  const matches = q.trim() ? db.tags.filter((t) => !value.includes(t.id) && t.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  const exact = db.tags.find((t) => t.slug === slugify(q));

  const addNew = () => {
    const name = q.trim();
    if (name.length < 2) return;
    if (exact) {
      if (!value.includes(exact.id)) onChange([...value, exact.id]);
    } else {
      const tag = { id: uid(), name, slug: slugify(name) };
      upsert('tags', tag, `Created tag "${name}"`);
      onChange([...value, tag.id]);
    }
    setQ('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {selected.map((t) =>
        <span key={t.id} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-deep">
            #{t.name}
            <button type="button" onClick={() => onChange(value.filter((id) => id !== t.id))} aria-label={`Remove tag ${t.name}`} className="hover:text-ink"><X className="h-3 w-3" /></button>
          </span>
        )}
      </div>
      <div className="relative mt-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ',') {e.preventDefault();addNew();}}}
          placeholder="Type a tag and press Enter"
          aria-label="Add tag"
          className="h-9 w-full rounded-md border border-input px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        
        {matches.length > 0 &&
        <ul className="absolute z-20 mt-1 w-full rounded-md border border-border bg-white py-1 shadow-lg">
            {matches.map((t) =>
          <li key={t.id}>
                <button type="button" onClick={() => {onChange([...value, t.id]);setQ('');}} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-brand-soft">#{t.name}</button>
              </li>
          )}
          </ul>
        }
      </div>
    </div>);

}