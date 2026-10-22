import React, { useState } from 'react';
import { toast } from 'sonner';
import { Archive, Inbox as InboxIcon, Mail, MailOpen, Reply, Search, Trash2 } from 'lucide-react';
import { selectCls } from '../../components/admin/FormField';
import { EmptyState, PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../contexts/StoreContext';
import type { ContactMessage, MessageStatus } from '../../types/models';
import { formatDate, timeAgo } from '../../utils/format';

export function Inbox() {
  const { db, upsert, remove } = useStore();
  const [filter, setFilter] = useState<MessageStatus | 'all' | 'inbox'>('inbox');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const list = db.messages.
  filter((m) => filter === 'all' ? true : filter === 'inbox' ? m.status !== 'archived' : m.status === filter).
  filter((m) => `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase().includes(q.toLowerCase())).
  sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const current = db.messages.find((m) => m.id === openId);

  const open = (m: ContactMessage) => {
    setOpenId(m.id);
    if (m.status === 'unread') upsert('messages', { ...m, status: 'read' });
  };
  const setStatus = (m: ContactMessage, status: MessageStatus) => {
    upsert('messages', { ...m, status }, `Marked message from ${m.email} as ${status}`);
    if (status === 'archived') setOpenId(null);
  };
  const del = (m: ContactMessage) => {
    if (!window.confirm('Delete this message permanently?')) return;
    remove('messages', [m.id], `Deleted message from ${m.email} ("${m.subject}")`);
    setOpenId(null);
    toast.success('Message deleted');
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Contact Inbox" description={`${db.messages.filter((m) => m.status === 'unread').length} unread · messages from the public contact form`} />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages…" className="bg-white pl-9" aria-label="Search messages" />
        </div>
        <select className={`${selectCls} sm:w-44`} value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filter by status">
          <option value="inbox">Inbox</option><option value="unread">Unread</option><option value="read">Read</option><option value="archived">Archived</option><option value="all">All</option>
        </select>
      </div>

      {db.messages.length === 0 ?
      <EmptyState icon={<InboxIcon className="h-5 w-5" />} title="No messages yet" description="Messages submitted on the Contact page will appear here." /> :

      <div className="grid min-h-[520px] overflow-hidden rounded-lg border border-border bg-white lg:grid-cols-[380px_1fr]">
          <ul className={`divide-y divide-border overflow-y-auto border-border lg:border-r ${current ? 'hidden lg:block' : ''}`}>
            {list.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">No messages match.</li>}
            {list.map((m) =>
          <li key={m.id}>
                <button onClick={() => open(m)} className={`block w-full px-4 py-3 text-left transition hover:bg-muted ${openId === m.id ? 'bg-brand-soft' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`truncate text-sm ${m.status === 'unread' ? 'font-bold' : 'font-medium'}`}>{m.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(m.createdAt)}</span>
                  </div>
                  <p className={`truncate text-sm ${m.status === 'unread' ? 'text-ink' : 'text-muted-foreground'}`}>{m.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.message}</p>
                </button>
              </li>
          )}
          </ul>
          <div className={`${current ? '' : 'hidden lg:flex'} flex-col`}>
            {current ?
          <div className="flex h-full flex-col">
                <div className="flex flex-wrap items-center gap-1 border-b border-border p-3">
                  <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setOpenId(null)}>← Back</Button>
                  <Button variant="ghost" size="sm" onClick={() => window.open(`mailto:${current.email}?subject=${encodeURIComponent(`Re: ${current.subject}`)}`)}><Reply className="h-4 w-4" /> Reply</Button>
                  {current.status !== 'unread' ?
              <Button variant="ghost" size="sm" onClick={() => setStatus(current, 'unread')}><Mail className="h-4 w-4" /> Mark unread</Button> :

              <Button variant="ghost" size="sm" onClick={() => setStatus(current, 'read')}><MailOpen className="h-4 w-4" /> Mark read</Button>
              }
                  {current.status !== 'archived' && <Button variant="ghost" size="sm" onClick={() => setStatus(current, 'archived')}><Archive className="h-4 w-4" /> Archive</Button>}
                  <Button variant="ghost" size="sm" className="ml-auto text-red-600 hover:bg-red-50" onClick={() => del(current)}><Trash2 className="h-4 w-4" /> Delete</Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-bold">{current.subject}</h2>
                    <StatusBadge status={current.status} />
                  </div>
                  <p className="mt-2 text-sm"><span className="font-medium">{current.name}</span> <span className="text-muted-foreground">&lt;{current.email}&gt;</span></p>
                  <p className="text-xs text-muted-foreground">Received {formatDate(current.createdAt, true)}</p>
                  <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed">{current.message}</div>
                </div>
              </div> :

          <div className="m-auto text-center text-sm text-muted-foreground"><MailOpen className="mx-auto mb-2 h-8 w-8" />Select a message to read</div>
          }
          </div>
        </div>
      }
    </div>);

}