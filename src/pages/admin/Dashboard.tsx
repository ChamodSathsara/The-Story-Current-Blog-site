import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, FileEdit, FileText, FolderTree, Image as ImageIcon, Inbox, Mail, PenSquare, Users } from 'lucide-react';
import { EmptyState, PageHeader, Panel } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { formatDate, timeAgo } from '../../utils/format';
import { effectivePublishedAt, isLive } from '../../utils/posts';

export function Dashboard() {
  const { db } = useStore();
  const { user } = useAuth();
  const now = Date.now();
  const live = db.posts.filter((p) => isLive(p, now));
  const scheduledPending = db.posts.filter((p) => p.status === 'scheduled' && !isLive(p, now));

  const stats = [
  { label: 'Total articles', value: db.posts.length, Icon: FileText, to: '/admin/posts' },
  { label: 'Published', value: live.length, Icon: CheckCircle2, to: '/admin/posts?status=published' },
  { label: 'Drafts', value: db.posts.filter((p) => p.status === 'draft').length, Icon: FileEdit, to: '/admin/posts?status=draft' },
  { label: 'Scheduled', value: scheduledPending.length, Icon: CalendarClock, to: '/admin/posts?status=scheduled' },
  { label: 'Categories', value: db.categories.length, Icon: FolderTree, to: '/admin/categories' },
  { label: 'Authors', value: db.authors.length, Icon: Users, to: '/admin/authors' },
  { label: 'New messages', value: db.messages.filter((m) => m.status === 'unread').length, Icon: Inbox, to: '/admin/inbox' },
  { label: 'Subscribers', value: db.subscribers.filter((s) => s.status !== 'unsubscribed').length, Icon: Mail, to: '/admin/subscribers' }];


  const recent = [...live].sort((a, b) => new Date(effectivePublishedAt(b) || 0).getTime() - new Date(effectivePublishedAt(a) || 0).getTime()).slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0] ?? ''}`}
        description="Live figures from your content database. Traffic analytics live in Google Analytics."
        actions={<Link to="/admin/posts/new" className="inline-flex h-9 items-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-deep"><PenSquare className="h-4 w-4" /> New post</Link>} />
      

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, Icon, to }) =>
        <Link key={label} to={to} className="group rounded-lg border border-border bg-white p-4 transition hover:border-brand/50 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-brand" />
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums text-ink">{value}</p>
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Recently published" className="lg:col-span-2" actions={<Link to="/admin/posts" className="text-xs font-semibold text-brand">View all</Link>}>
          {recent.length === 0 ?
          <EmptyState icon={<FileText className="h-5 w-5" />} title="Nothing published yet" description="Your published articles will appear here." /> :

          <ul className="-my-2 divide-y divide-border">
              {recent.map((p) =>
            <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link to={`/admin/posts/${p.id}`} className="block truncate text-sm font-medium hover:text-brand">{p.title}</Link>
                    <p className="text-xs text-muted-foreground">{formatDate(effectivePublishedAt(p), true)} · {p.views} internal views</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
            )}
            </ul>
          }
        </Panel>

        <Panel title="Quick actions">
          <div className="grid gap-2">
            {[
            { to: '/admin/posts/new', label: 'Create a post', Icon: PenSquare },
            { to: '/admin/media', label: 'Upload media', Icon: ImageIcon },
            { to: '/admin/subscribers', label: 'Manage subscribers', Icon: Mail },
            { to: '/admin/inbox', label: 'View messages', Icon: Inbox }].
            map(({ to, label, Icon }) =>
            <Link key={to} to={to} className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 text-sm font-medium hover:border-brand hover:bg-brand-soft">
                <Icon className="h-4 w-4 text-brand" /> {label}
              </Link>
            )}
          </div>
          {scheduledPending.length > 0 &&
          <div className="mt-5 rounded-md bg-blue-50 p-3 text-xs text-blue-800">
              <p className="font-semibold">Upcoming</p>
              {scheduledPending.slice(0, 3).map((p) => <p key={p.id} className="mt-1 truncate">{formatDate(p.scheduledAt, true)} — {p.title}</p>)}
            </div>
          }
        </Panel>
      </div>

      <Panel title="Recent administrative activity" className="mt-6">
        {db.activity.length === 0 ?
        <p className="text-sm text-muted-foreground">No activity recorded yet.</p> :

        <ul className="-my-2 divide-y divide-border">
            {db.activity.slice(0, 10).map((a) =>
          <li key={a.id} className="flex flex-col gap-1 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span><span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{a.action}</span> {a.details}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
              </li>
          )}
          </ul>
        }
      </Panel>
    </div>);

}