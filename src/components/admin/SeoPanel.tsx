import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ImagePlus, Link2, XCircle } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import type { Post, PostSeo } from '../../types/models';
import { analyzeSeo, effectiveMetaDescription, effectiveSeoTitle, internalLinkSuggestions } from '../../utils/seo';
import { findMedia } from '../../utils/posts';
import { Button } from '../ui/Button';
import { Switch } from '../ui/CSwitch';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { FormField } from './FormField';
import { MediaPicker } from './MediaPicker';
import { Panel } from './PageHeader';

interface SeoPanelProps {
  post: Post;
  errors: Record<string, string>;
  onChange: (patch: Partial<PostSeo>) => void;
  onInsertLink: (target: Post) => void;
}

export function SeoPanel({ post, errors, onChange, onInsertLink }: SeoPanelProps) {
  const { db } = useStore();
  const [picker, setPicker] = useState(false);
  const { checks, score } = analyzeSeo(post, db);
  const suggestions = internalLinkSuggestions(post, db);
  const title = effectiveSeoTitle(post, db.settings.siteName);
  const desc = effectiveMetaDescription(post);
  const og = findMedia(db, post.seo.ogImageId);
  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';
  const s = post.seo;

  return (
    <Panel title="Search & social" description="Advisory guidance only — no tool can guarantee Google rankings." actions={<span className={`text-sm font-bold tabular-nums ${scoreColor}`}>{score}/100</span>}>
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Google search preview</p>
          <div className="rounded-lg border border-border p-4">
            <p className="truncate text-xs text-[#202124]">{db.settings.siteUrl.replace(/^https?:\/\//, '')} › article › {post.slug || 'your-slug'}</p>
            <p className="mt-1 line-clamp-1 text-lg leading-snug text-[#1a0dab]">{title.length > 60 ? `${title.slice(0, 57)}…` : title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{desc ? desc.length > 160 ? `${desc.slice(0, 157)}…` : desc : 'Add a meta description to control this snippet.'}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Focus keyword" htmlFor="seo-kw"><Input id="seo-kw" value={s.focusKeyword} onChange={(e) => onChange({ focusKeyword: e.target.value })} placeholder="e.g. NFL playoff format" /></FormField>
          <FormField label="Secondary keywords" htmlFor="seo-kw2" hint="Comma separated"><Input id="seo-kw2" value={s.secondaryKeywords} onChange={(e) => onChange({ secondaryKeywords: e.target.value })} /></FormField>
        </div>
        <FormField label="SEO title" htmlFor="seo-title" hint="Leave blank to use the headline + site name" counter={{ value: title.length, max: 70, ideal: [30, 60] }}>
          <Input id="seo-title" value={s.seoTitle} onChange={(e) => onChange({ seoTitle: e.target.value })} placeholder={title} />
        </FormField>
        <FormField label="Meta description" htmlFor="seo-desc" hint="Leave blank to use the excerpt" counter={{ value: desc.length, max: 170, ideal: [120, 160] }}>
          <Textarea id="seo-desc" rows={3} value={s.metaDescription} onChange={(e) => onChange({ metaDescription: e.target.value })} placeholder={post.excerpt} />
        </FormField>
        <FormField label="Canonical URL" htmlFor="seo-canon" error={errors.canonicalUrl} hint="Only set if this article's original version lives at another URL">
          <Input id="seo-canon" value={s.canonicalUrl} onChange={(e) => onChange({ canonicalUrl: e.target.value })} placeholder={`${db.settings.siteUrl}/article/${post.slug}`} />
        </FormField>

        <div className="space-y-4 rounded-lg bg-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Social sharing (Open Graph / X)</p>
          <FormField label="Social title" htmlFor="og-title" counter={{ value: s.ogTitle.length, max: 95 }}><Input id="og-title" className="bg-white" value={s.ogTitle} onChange={(e) => onChange({ ogTitle: e.target.value })} placeholder={post.title} /></FormField>
          <FormField label="Social description" htmlFor="og-desc" counter={{ value: s.ogDescription.length, max: 200 }}><Textarea id="og-desc" className="bg-white" rows={2} value={s.ogDescription} onChange={(e) => onChange({ ogDescription: e.target.value })} placeholder={desc} /></FormField>
          <div className="flex items-center gap-3">
            {og ? <img src={og.url} alt="" className="h-16 w-28 rounded object-cover" /> : <span className="flex h-16 w-28 items-center justify-center rounded border border-dashed border-border bg-white text-[10px] text-muted-foreground">Uses featured</span>}
            <Button type="button" variant="outline" size="sm" onClick={() => setPicker(true)}><ImagePlus className="h-4 w-4" /> Social image</Button>
            {og && <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ogImageId: null })}>Reset</Button>}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <div>
            <p className="text-sm font-medium">Hide from search engines (noindex)</p>
            <p className="text-xs text-muted-foreground">Also removes the article from the XML sitemap</p>
          </div>
          <Switch checked={s.noindex} onCheckedChange={(v) => onChange({ noindex: v })} />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Checklist</p>
          <ul className="space-y-1.5">
            {checks.map((c) =>
            <li key={c.label} className="flex items-start gap-2 text-sm">
                {c.level === 'good' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : c.level === 'warn' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />}
                {c.label}
              </li>
            )}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Internal linking suggestions</p>
          {suggestions.length === 0 ?
          <p className="text-sm text-muted-foreground">Add a headline and focus keyword to see related published articles.</p> :

          <ul className="divide-y divide-border rounded-md border border-border">
              {suggestions.map((p) =>
            <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="truncate text-sm">{p.title}</span>
                  <Button type="button" variant="ghost" size="xs" onClick={() => onInsertLink(p)}><Link2 className="h-3.5 w-3.5" /> Insert</Button>
                </li>
            )}
            </ul>
          }
        </div>
      </div>
      <MediaPicker open={picker} onOpenChange={setPicker} title="Social sharing image" selectedId={s.ogImageId} onSelect={(id) => onChange({ ogImageId: id })} />
    </Panel>);

}