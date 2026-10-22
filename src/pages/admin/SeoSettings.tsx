import React, { useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { FormField } from '../../components/admin/FormField';
import { PageHeader, Panel } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { useStore } from '../../contexts/StoreContext';
import { downloadText } from '../../utils/format';
import { buildRobots, buildRss, buildSitemap } from '../../utils/seo';

type FileKey = 'sitemap' | 'robots' | 'rss';

export function SeoSettings() {
  const { db, updateSettings } = useStore();
  const s = db.settings;
  const [form, setForm] = useState({ siteUrl: s.siteUrl, defaultSeoTitle: s.defaultSeoTitle, defaultMetaDescription: s.defaultMetaDescription, defaultOgImageUrl: s.defaultOgImageUrl });
  const [file, setFile] = useState<FileKey>('sitemap');

  const files: Record<FileKey, {name: string;mime: string;content: string;}> = {
    sitemap: { name: 'sitemap.xml', mime: 'application/xml', content: buildSitemap(db) },
    robots: { name: 'robots.txt', mime: 'text/plain', content: buildRobots(db) },
    rss: { name: 'rss.xml', mime: 'application/rss+xml', content: buildRss(db) }
  };

  const save = () => {
    try {
      new URL(form.siteUrl);
    } catch {
      return toast.error('Enter a valid site URL, e.g. https://thestorycurrent.com');
    }
    updateSettings({ ...form, siteUrl: form.siteUrl.replace(/\/$/, '') }, 'Updated default SEO settings');
    toast.success('SEO settings saved');
  };

  const missing = db.posts.filter((p) => p.status === 'published' && (!p.seo.focusKeyword || !(p.seo.metaDescription || p.excerpt)));
  const missingAlt = db.media.filter((m) => !m.alt.trim());

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="SEO Settings" description="Site-wide defaults and technical SEO files. Per-article SEO lives in the editor." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Defaults">
          <div className="space-y-4">
            <FormField label="Canonical site URL" htmlFor="seo-site" hint="Your production domain, used for canonical tags, sitemap and JSON-LD"><Input id="seo-site" value={form.siteUrl} onChange={(e) => setForm({ ...form, siteUrl: e.target.value })} /></FormField>
            <FormField label="Default SEO title" htmlFor="seo-dt" counter={{ value: form.defaultSeoTitle.length, max: 70, ideal: [30, 60] }}><Input id="seo-dt" value={form.defaultSeoTitle} onChange={(e) => setForm({ ...form, defaultSeoTitle: e.target.value })} /></FormField>
            <FormField label="Default meta description" htmlFor="seo-dd" counter={{ value: form.defaultMetaDescription.length, max: 170, ideal: [120, 160] }}><Textarea id="seo-dd" rows={3} value={form.defaultMetaDescription} onChange={(e) => setForm({ ...form, defaultMetaDescription: e.target.value })} /></FormField>
            <FormField label="Default social image URL" htmlFor="seo-og"><Input id="seo-og" value={form.defaultOgImageUrl} onChange={(e) => setForm({ ...form, defaultOgImageUrl: e.target.value })} /></FormField>
            <Button onClick={save}>Save defaults</Button>
          </div>
        </Panel>
        <Panel title="Health check" description="Based on your current content">
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span>Published articles missing focus keyword / description</span><span className={`font-semibold ${missing.length ? 'text-amber-600' : 'text-emerald-600'}`}>{missing.length}</span></li>
            <li className="flex justify-between"><span>Images missing alt text</span><span className={`font-semibold ${missingAlt.length ? 'text-amber-600' : 'text-emerald-600'}`}>{missingAlt.length}</span></li>
            <li className="flex justify-between"><span>Articles set to noindex</span><span className="font-semibold">{db.posts.filter((p) => p.seo.noindex).length}</span></li>
            <li className="flex justify-between"><span>Categories without SEO metadata</span><span className="font-semibold">{db.categories.filter((c) => !c.seoTitle || !c.metaDescription).length}</span></li>
          </ul>
          <div className="mt-5 rounded-md bg-brand-soft p-3 text-xs text-ink/80">
            Structured data emitted: NewsArticle (with Person/Organization author, publisher, datePublished, dateModified), BreadcrumbList, NewsMediaOrganization, WebSite SearchAction and ProfilePage. Admin, search and thin tag pages are noindexed.
          </div>
        </Panel>
      </div>
      <Panel title="Technical files" description="Generated live from published content. In production these are served by /sitemap.xml, /robots.txt and /rss.xml routes." className="mt-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(Object.keys(files) as FileKey[]).map((k) =>
          <button key={k} onClick={() => setFile(k)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${file === k ? 'bg-brand text-white' : 'bg-muted hover:bg-brand-soft'}`}>{files[k].name}</button>
          )}
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => downloadText(files[file].name, files[file].content, files[file].mime)}><Download className="h-4 w-4" /> Download</Button>
        </div>
        <pre className="max-h-96 overflow-auto rounded-md bg-ink p-4 font-mono text-xs leading-relaxed text-white/90">{files[file].content}</pre>
      </Panel>
    </div>);

}