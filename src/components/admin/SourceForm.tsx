import React, { useState } from 'react';
import { sourceTypes } from '../../data/sourceTypes';
import type { Source } from '../../types/models';
import { firstErrors, sourceSchema } from '../../utils/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { FormField, selectCls } from './FormField';

export const blankSource = (): Source => ({ id: '', name: '', url: '', publisher: '', publishedDate: '', type: 'news', note: '' });

interface SourceFormProps {
  initial: Source;
  existing: Source[];
  onSave: (s: Source) => void;
  onCancel: () => void;
}

export function SourceForm({ initial, existing, onSave, onCancel }: SourceFormProps) {
  const [s, setS] = useState<Source>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const parsed = sourceSchema.safeParse(s);
    if (!parsed.success) return setErrors(firstErrors(parsed.error));
    const dup = existing.find((x) => x.url.replace(/\/$/, '') === s.url.replace(/\/$/, '') && x.id !== s.id);
    if (dup) return setErrors({ url: `This URL is already saved as "${dup.name}"` });
    onSave(s);
  };

  return (
    <div className="space-y-4">
      <FormField label="Source name" htmlFor="s-name" required error={errors.name}><Input id="s-name" value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} placeholder="e.g. NASA" /></FormField>
      <FormField label="Source URL" htmlFor="s-url" required error={errors.url}><Input id="s-url" value={s.url} onChange={(e) => setS({ ...s, url: e.target.value })} placeholder="https://www.nasa.gov/" /></FormField>
      <FormField label="Publisher" htmlFor="s-pub" error={errors.publisher}><Input id="s-pub" value={s.publisher} onChange={(e) => setS({ ...s, publisher: e.target.value })} /></FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Source type" htmlFor="s-type">
          <select id="s-type" className={selectCls} value={s.type} onChange={(e) => setS({ ...s, type: e.target.value as Source['type'] })}>
            {sourceTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </FormField>
        <FormField label="Publication date" htmlFor="s-date"><Input id="s-date" type="date" value={s.publishedDate} onChange={(e) => setS({ ...s, publishedDate: e.target.value })} /></FormField>
      </div>
      <FormField label="Attribution note" htmlFor="s-note" hint="Optional, e.g. “Data from the 2024 annual report”"><Textarea id="s-note" rows={2} value={s.note} onChange={(e) => setS({ ...s, note: e.target.value })} /></FormField>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit}>Save source</Button>
      </div>
    </div>);

}