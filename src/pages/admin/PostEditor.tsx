import React, { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Editor } from '@tiptap/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Archive, ArrowLeft, CalendarClock, Eye, Loader2, Save, Send, Undo2, X } from 'lucide-react';
import { FeaturedImageField } from '../../components/admin/FeaturedImageField';
import { FormField, selectCls } from '../../components/admin/FormField';
import { Panel } from '../../components/admin/PageHeader';
import { PostSourcesField } from '../../components/admin/PostSourcesField';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { SeoPanel } from '../../components/admin/SeoPanel';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { TagInput } from '../../components/admin/TagInput';
import { ArticleView } from '../../components/public/ArticleView';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/CSwitch';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { useStore } from '../../contexts/StoreContext';
import { usePostEditor } from '../../hooks/usePostEditor';
import type { Post } from '../../types/models';
import { formatDate, fromLocalInput, readingTime, timeAgo, toLocalInput, wordCount } from '../../utils/format';

export function PostEditor() {
  const { id } = useParams();
  return <PostEditorForm key={id ?? 'new'} id={id} />;
}

function PostEditorForm({ id }: {id?: string;}) {
  const { db } = useStore();
  const ed = usePostEditor(id);
  const { post, update, errors } = ed;
  const [editor, setEditor] = useState<Editor | null>(null);
  const [preview, setPreview] = useState(false);
  const onReady = useCallback((e: Editor) => setEditor(e), []);

  if (ed.notFound) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-xl font-bold">Article not found</h1>
        <Link to="/admin/posts" className="mt-4 inline-block text-sm font-semibold text-brand">Back to all posts</Link>
      </div>);

  }

  const insertLink = (target: Post) => {
    editor?.chain().focus().insertContent(`<a href="/article/${target.slug}">${target.title.replace(/</g, '&lt;')}</a> `).run();
  };

  const leave = (e: React.MouseEvent) => {
    if (ed.dirty && !window.confirm('You have unsaved changes. Leave without saving?')) e.preventDefault();
  };

  const parents = db.categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order);
  const words = wordCount(post.content);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/posts" onClick={leave} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-white hover:bg-muted" aria-label="Back to posts"><ArrowLeft className="h-4 w-4" /></Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{ed.exists ? 'Edit article' : 'New article'}</h1>
              <StatusBadge status={post.status} />
              {post.demo && <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white">DEMO</span>}
            </div>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {ed.autoSaving ? 'Autosaving…' : ed.dirty ? 'Unsaved changes' : ed.lastSaved ? `Saved ${timeAgo(ed.lastSaved)}` : 'Not saved yet'}
              {post.status === 'draft' && ' · drafts autosave every 20s'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPreview(true)}><Eye className="h-4 w-4" /> Preview</Button>
          <Button variant="outline" onClick={ed.saveDraft}><Save className="h-4 w-4" /> {post.status === 'published' ? 'Save changes' : 'Save draft'}</Button>
          {post.status !== 'published' && <Button onClick={ed.publish}><Send className="h-4 w-4" /> Publish now</Button>}
          {post.status === 'published' && <Button onClick={ed.publish}><Send className="h-4 w-4" /> Update live article</Button>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <Panel>
            <div className="space-y-5">
              <FormField label="Headline" htmlFor="p-title" required error={errors.title} counter={{ value: post.title.length, max: 150, ideal: [40, 90] }}>
                <Textarea id="p-title" rows={2} value={post.title} onChange={(e) => update({ title: e.target.value.replace(/\n/g, ' ') })} placeholder="Write a clear, accurate headline" className="resize-none font-serif text-2xl font-bold" />
              </FormField>
              <FormField label="Subtitle" htmlFor="p-sub"><Input id="p-sub" value={post.subtitle} onChange={(e) => update({ subtitle: e.target.value })} placeholder="Optional deck shown under the headline" /></FormField>
              <FormField label="URL slug" htmlFor="p-slug" required error={errors.slug} hint={`${db.settings.siteUrl}/article/${post.slug || '…'}`}>
                <Input id="p-slug" value={post.slug} onChange={(e) => ed.setSlug(e.target.value)} />
              </FormField>
              <FormField label="Short excerpt" htmlFor="p-excerpt" required error={errors.excerpt} hint="Used on cards and as the default meta description" counter={{ value: post.excerpt.length, max: 320, ideal: [120, 200] }}>
                <Textarea id="p-excerpt" rows={3} value={post.excerpt} onChange={(e) => update({ excerpt: e.target.value })} />
              </FormField>
            </div>
          </Panel>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Article body <span className="text-brand">*</span></span>
              <span className="text-xs text-muted-foreground">{words} words · {readingTime(post.content)} min read</span>
            </div>
            <RichTextEditor key={post.id || 'new'} value={post.content} onChange={(html) => update({ content: html })} onReady={onReady} />
            {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content}</p>}
          </div>

          <SeoPanel post={post} errors={errors} onChange={ed.updateSeo} onInsertLink={insertLink} />
        </div>

        <aside className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-4">
              <FormField label="Publication date" htmlFor="p-pub" hint="Leave blank to use the moment you publish">
                <Input id="p-pub" type="datetime-local" value={toLocalInput(post.publishedAt)} onChange={(e) => update({ publishedAt: fromLocalInput(e.target.value) })} />
              </FormField>
              <FormField label="Schedule for" htmlFor="p-sched" error={errors.scheduledAt}>
                <Input id="p-sched" type="datetime-local" value={toLocalInput(post.scheduledAt)} onChange={(e) => update({ scheduledAt: fromLocalInput(e.target.value) })} />
              </FormField>
              <Button variant="outline" className="w-full" onClick={ed.schedule}><CalendarClock className="h-4 w-4" /> Schedule</Button>
              <dl className="grid grid-cols-2 gap-2 rounded-md bg-muted p-3 text-xs">
                <dt className="text-muted-foreground">Created</dt><dd className="text-right">{formatDate(post.createdAt)}</dd>
                <dt className="text-muted-foreground">Last updated</dt><dd className="text-right">{formatDate(post.updatedAt, true)}</dd>
                <dt className="text-muted-foreground">Reading time</dt><dd className="text-right">{readingTime(post.content)} min</dd>
              </dl>
              {ed.exists &&
              <div className="flex gap-2">
                  {post.status !== 'draft' && <Button variant="ghost" size="sm" className="flex-1" onClick={() => ed.setStatus('draft', 'Moved to drafts')}><Undo2 className="h-4 w-4" /> To draft</Button>}
                  {post.status !== 'archived' && <Button variant="ghost" size="sm" className="flex-1" onClick={() => ed.setStatus('archived', 'Archived')}><Archive className="h-4 w-4" /> Archive</Button>}
                </div>
              }
            </div>
          </Panel>

          <Panel title="Homepage placement">
            <div className="space-y-3">
              {([['isFeatured', 'Featured', 'Hero & top stories'], ['isBreaking', 'Breaking news', 'Shown in the ticker'], ['isTrending', 'Trending', 'Pinned to Trending Stories']] as const).map(([k, l, d]) =>
              <div key={k} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{l}</p><p className="text-xs text-muted-foreground">{d}</p></div>
                  <Switch checked={post[k]} onCheckedChange={(v) => update({ [k]: v } as Partial<Post>)} aria-label={l} />
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Organization">
            <div className="space-y-4">
              <FormField label="Category" htmlFor="p-cat" required error={errors.categoryId}>
                <select id="p-cat" className={selectCls} value={post.categoryId ?? ''} onChange={(e) => update({ categoryId: e.target.value || null })}>
                  <option value="">Select category…</option>
                  {parents.map((p) =>
                  <optgroup key={p.id} label={p.name}>
                      <option value={p.id}>{p.name}</option>
                      {db.categories.filter((c) => c.parentId === p.id).sort((a, b) => a.order - b.order).map((c) => <option key={c.id} value={c.id}>— {c.name}</option>)}
                    </optgroup>
                  )}
                </select>
              </FormField>
              <FormField label="Author" htmlFor="p-author" required error={errors.authorId} hint={<Link to="/admin/authors" className="text-brand hover:underline">Manage authors</Link>}>
                <select id="p-author" className={selectCls} value={post.authorId ?? ''} onChange={(e) => update({ authorId: e.target.value || null })}>
                  <option value="">Select author…</option>
                  {db.authors.filter((a) => a.active || a.id === post.authorId).map((a) => <option key={a.id} value={a.id}>{a.displayName}</option>)}
                </select>
              </FormField>
              <div className="space-y-1.5"><span className="text-sm font-medium">Tags</span><TagInput value={post.tagIds} onChange={(tagIds) => update({ tagIds })} /></div>
            </div>
          </Panel>

          <Panel title="Featured image">
            <FeaturedImageField mediaId={post.featuredImageId} onChange={(featuredImageId) => update({ featuredImageId })} error={errors.featuredImageId} altError={errors.featuredImageAlt} />
          </Panel>

          <Panel title="Sources & references" description="Author and source are separate — cite the original publications here.">
            <PostSourcesField value={post.sources} onChange={(sources) => update({ sources })} />
          </Panel>
        </aside>
      </div>

      <AnimatePresence>
        {preview &&
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 flex flex-col bg-white" role="dialog" aria-label="Article preview">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-brand-soft px-4">
              <p className="text-sm font-semibold"><Eye className="mr-2 inline h-4 w-4 text-brand" />Preview — this is how readers will see the article</p>
              <Button variant="outline" size="sm" onClick={() => setPreview(false)}><X className="h-4 w-4" /> Close preview</Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ArticleView post={{ ...post, readingTime: readingTime(post.content), publishedAt: post.publishedAt || new Date().toISOString() }} isPreview />
            </div>
          </motion.div>
        }
      </AnimatePresence>
      {ed.autoSaving && <Loader2 className="fixed bottom-4 right-4 h-5 w-5 animate-spin text-brand" aria-hidden="true" />}
    </div>);

}