import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ExternalLink, FileText, Flame, PenSquare, Search, Star, Trash2, Zap } from 'lucide-react';
import { selectCls } from '../../components/admin/FormField';
import { EmptyState, PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useStore } from '../../contexts/StoreContext';
import type { PostStatus } from '../../types/models';
import { formatDate } from '../../utils/format';
import { effectivePublishedAt, findAuthor, findCategory, isLive } from '../../utils/posts';

const STATUSES: (PostStatus | 'all')[] = ['all', 'published', 'draft', 'scheduled', 'archived'];

export function Posts() {
  const { db, remove, upsert } = useStore();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') as PostStatus | 'all' | null ?? 'all';
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const posts = useMemo(
    () =>
    db.posts.
    filter((p) => status === 'all' || p.status === status).
    filter((p) => !cat || p.categoryId === cat).
    filter((p) => p.title.toLowerCase().includes(q.toLowerCase())).
    sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [db.posts, status, cat, q]
  );

  const counts = (s: PostStatus | 'all') => s === 'all' ? db.posts.length : db.posts.filter((p) => p.status === s).length;
  const toggleAll = (v: boolean) => setSelected(v ? posts.map((p) => p.id) : []);

  const bulkDelete = () => {
    if (!window.confirm(`Permanently delete ${selected.length} article(s)? This cannot be undone.`)) return;
    const titles = db.posts.filter((p) => selected.includes(p.id)).map((p) => `"${p.title}"`).join(', ');
    remove('posts', selected, `Deleted ${selected.length} article(s): ${titles}`);
    setSelected([]);
    toast.success('Articles deleted');
  };

  const bulkArchive = () => {
    db.posts.filter((p) => selected.includes(p.id)).forEach((p) => upsert('posts', { ...p, status: 'archived' }));
    toast.success(`${selected.length} article(s) archived`);
    setSelected([]);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="All Posts" description="Every article in the newsroom." actions={<Link to="/admin/posts/new" className="inline-flex h-9 items-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-deep"><PenSquare className="h-4 w-4" /> New post</Link>} />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {STATUSES.map((s) =>
        <button key={s} onClick={() => setParams(s === 'all' ? {} : { status: s })} className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium capitalize ${status === s ? 'border-brand text-brand-deep' : 'border-transparent text-muted-foreground hover:text-ink'}`}>
            {s} <span className="ml-1 text-xs tabular-nums text-muted-foreground">{counts(s)}</span>
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles…" className="bg-white pl-9" aria-label="Search posts" />
        </div>
        <select className={`${selectCls} sm:w-56`} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {db.categories.map((c) => <option key={c.id} value={c.id}>{c.parentId ? '— ' : ''}{c.name}</option>)}
        </select>
        {selected.length > 0 &&
        <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-sm text-muted-foreground">{selected.length} selected</span>
            <Button variant="outline" size="sm" onClick={bulkArchive}>Archive</Button>
            <Button variant="destructive" size="sm" onClick={bulkDelete}><Trash2 className="h-4 w-4" /> Delete</Button>
          </div>
        }
      </div>

      {posts.length === 0 ?
      <EmptyState icon={<FileText className="h-5 w-5" />} title="No articles found" description="Try a different filter, or create your first article." action={<Link to="/admin/posts/new" className="text-sm font-semibold text-brand">Create a post →</Link>} /> :

      <div className="rounded-lg border border-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={selected.length === posts.length && posts.length > 0} onCheckedChange={(v) => toggleAll(!!v)} aria-label="Select all" /></TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p) =>
            <TableRow key={p.id}>
                  <TableCell><Checkbox checked={selected.includes(p.id)} onCheckedChange={(v) => setSelected((s) => v ? [...s, p.id] : s.filter((x) => x !== p.id))} aria-label={`Select ${p.title}`} /></TableCell>
                  <TableCell className="max-w-md">
                    <Link to={`/admin/posts/${p.id}`} className="line-clamp-1 font-medium hover:text-brand">{p.title || 'Untitled'}</Link>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {p.isFeatured && <span className="inline-flex items-center gap-0.5 text-brand"><Star className="h-3 w-3" />Featured</span>}
                      {p.isBreaking && <span className="inline-flex items-center gap-0.5 text-red-600"><Zap className="h-3 w-3" />Breaking</span>}
                      {p.isTrending && <span className="inline-flex items-center gap-0.5 text-amber-600"><Flame className="h-3 w-3" />Trending</span>}
                      {p.demo && <span className="rounded bg-muted px-1 font-semibold">DEMO</span>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm md:table-cell">{findCategory(db, p.categoryId)?.name ?? '—'}</TableCell>
                  <TableCell className="hidden text-sm lg:table-cell">{findAuthor(db, p.authorId)?.displayName ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {p.status === 'draft' ? `Edited ${formatDate(p.updatedAt)}` : formatDate(effectivePublishedAt(p), true)}
                  </TableCell>
                  <TableCell>
                    {isLive(p) && <a href={`/article/${p.slug}`} target="_blank" rel="noopener noreferrer" aria-label="View live" className="text-muted-foreground hover:text-brand"><ExternalLink className="h-4 w-4" /></a>}
                  </TableCell>
                </TableRow>
            )}
            </TableBody>
          </Table>
        </div>
      }
    </div>);

}