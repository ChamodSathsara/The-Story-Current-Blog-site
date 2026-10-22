import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MailX } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useSeo } from '../../hooks/useSeo';

/** One-click unsubscribe endpoint used by future email sends: /unsubscribe?token=… */
export function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { db, upsert } = useStore();
  const [done, setDone] = useState(false);
  const sub = token ? db.subscribers.find((s) => s.unsubscribeToken === token) : undefined;
  useSeo({ title: 'Unsubscribe', noindex: true });

  const confirm = () => {
    if (!sub) return;
    upsert('subscribers', { ...sub, status: 'unsubscribed', unsubscribedAt: new Date().toISOString() });
    setDone(true);
  };

  return (
    <div className="container flex max-w-lg flex-col items-center py-24 text-center">
      <MailX className="h-12 w-12 text-brand" />
      {!sub ?
      <>
          <h1 className="mt-4 font-serif text-3xl font-bold">Link not valid</h1>
          <p className="mt-2 text-muted-foreground">This unsubscribe link is invalid or has expired.</p>
        </> :
      done || sub.status === 'unsubscribed' ?
      <>
          <h1 className="mt-4 font-serif text-3xl font-bold">You've been unsubscribed</h1>
          <p className="mt-2 text-muted-foreground">{sub.email} will no longer receive our newsletter.</p>
        </> :

      <>
          <h1 className="mt-4 font-serif text-3xl font-bold">Unsubscribe?</h1>
          <p className="mt-2 text-muted-foreground">Stop sending The Story Current newsletter to {sub.email}.</p>
          <button onClick={confirm} className="mt-6 rounded-md bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-deep">Unsubscribe</button>
        </>
      }
      <Link to="/" className="mt-6 text-sm font-semibold text-brand">Return to homepage</Link>
    </div>);

}