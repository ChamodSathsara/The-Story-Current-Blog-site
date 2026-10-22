import React, { useState } from 'react';
import { toast } from 'sonner';
import { Download, Mail, Search, Trash2, UserMinus } from 'lucide-react';
import { selectCls } from '../../components/admin/FormField';
import { EmptyState, PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useStore } from '../../contexts/StoreContext';
import type { Subscriber, SubscriberStatus } from '../../types/models';
import { downloadText, formatDate } from '../../utils/format';

export function Subscribers() {
  const { db, upsert, remove } = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<SubscriberStatus | 'all'>('all');
  const list = db.subscribers.
  filter((s) => status === 'all' || s.status === status).
  filter((s) => `${s.email} ${s.name}`.toLowerCase().includes(q.toLowerCase())).
  sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const exportCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [
    ['email', 'name', 'status', 'subscribed_at', 'consent_at', 'consent_text', 'signup_source', 'verified_at', 'unsubscribed_at'],
    ...list.map((s) => [s.email, s.name, s.status, s.createdAt, s.consentAt, s.consentText, s.signupSource, s.verifiedAt ?? '', s.unsubscribedAt ?? ''])];

    downloadText(`subscribers-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((r) => r.map(esc).join(',')).join('\n'), 'text/csv');
    toast.success(`Exported ${list.length} subscriber(s)`);
  };

  const unsubscribe = (s: Subscriber) => upsert('subscribers', { ...s, status: 'unsubscribed', unsubscribedAt: new Date().toISOString() }, `Unsubscribed ${s.email}`);
  const del = (s: Subscriber) => {
    if (!window.confirm(`Permanently remove ${s.email} and their consent record?`)) return;
    remove('subscribers', [s.id], `Removed subscriber ${s.email}`);
  };

  const c = (st: SubscriberStatus) => db.subscribers.filter((s) => s.status === st).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Newsletter Subscribers" description="Collection & consent records. Email sending and double opt-in will plug into this list later." actions={<Button variant="outline" onClick={exportCsv} disabled={!list.length}><Download className="h-4 w-4" /> Export CSV</Button>} />
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[['Unverified', c('pending')], ['Confirmed', c('active')], ['Unsubscribed', c('unsubscribed')]].map(([l, v]) =>
        <div key={l as string} className="rounded-lg border border-border bg-white p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 text-2xl font-bold tabular-nums">{v}</p></div>
        )}
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or name…" className="bg-white pl-9" aria-label="Search subscribers" />
        </div>
        <select className={`${selectCls} sm:w-44`} value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter status">
          <option value="all">All statuses</option><option value="pending">Unverified</option><option value="active">Confirmed</option><option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>
      {list.length === 0 ?
      <EmptyState icon={<Mail className="h-5 w-5" />} title="No subscribers yet" description="Sign-ups from the homepage, article pages, footer and newsletter page appear here." /> :

      <div className="rounded-lg border border-border bg-white">
          <Table>
            <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Source</TableHead><TableHead className="hidden md:table-cell">Subscribed</TableHead><TableHead className="hidden lg:table-cell">Consent</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.map((s) =>
            <TableRow key={s.id}>
                  <TableCell><p className="font-medium">{s.email}</p>{s.name && <p className="text-xs text-muted-foreground">{s.name}</p>}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell className="hidden text-sm capitalize md:table-cell">{s.signupSource.replace('-', ' ')}</TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{formatDate(s.createdAt, true)}</TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell" title={s.consentText}>{s.consent ? `Given ${formatDate(s.consentAt)}` : '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {s.status !== 'unsubscribed' && <Button variant="ghost" size="icon-sm" onClick={() => unsubscribe(s)} aria-label="Unsubscribe" title="Unsubscribe"><UserMinus className="h-4 w-4" /></Button>}
                      <Button variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50" onClick={() => del(s)} aria-label="Remove" title="Remove"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
            )}
            </TableBody>
          </Table>
        </div>
      }
    </div>);

}