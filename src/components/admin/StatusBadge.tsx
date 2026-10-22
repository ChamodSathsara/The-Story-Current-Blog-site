import React from 'react';

const styles: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  draft: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  scheduled: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  archived: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  unread: 'bg-brand-soft text-brand-deep ring-brand/30',
  read: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  pending: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  unsubscribed: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  enabled: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  disabled: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  inactive: 'bg-gray-100 text-gray-600 ring-gray-500/20'
};

const labels: Record<string, string> = { pending: 'Unverified' };

export function StatusBadge({ status }: {status: string;}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${styles[status] ?? styles.draft}`}>
      {labels[status] ?? status}
    </span>);

}