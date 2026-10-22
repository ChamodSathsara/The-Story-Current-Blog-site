import React from 'react';
import { CalendarCheck, ListChecks, ShieldCheck } from 'lucide-react';
import { NewsletterForm } from '../../components/public/NewsletterForm';
import { useStore } from '../../contexts/StoreContext';
import { useSeo } from '../../hooks/useSeo';

export function Newsletter() {
  const { db } = useStore();
  useSeo({ title: `Newsletter | ${db.settings.siteName}`, description: 'Subscribe to The Story Current newsletter for clear, sourced explainers delivered to your inbox.', path: '/newsletter' });
  return (
    <div className="bg-white">
      <section className="border-b border-border bg-brand-soft">
        <div className="container grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <img src={db.settings.logoUrl} alt="" className="h-16 w-16 rounded-lg" width={64} height={64} />
            <h1 className="mt-6 font-serif text-4xl font-extrabold leading-tight md:text-5xl">The Story Current, in your inbox.</h1>
            <p className="mt-4 text-lg text-muted-foreground">A free newsletter with the stories that matter across world news, sports, technology, entertainment and discoveries — explained, with sources.</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 font-serif text-xl font-bold">Subscribe for free</h2>
            <NewsletterForm source="newsletter-page" showName />
          </div>
        </div>
      </section>
      <section className="container grid gap-8 py-14 md:grid-cols-3">
        {[
        { Icon: ListChecks, t: 'Curated, not cluttered', d: 'A short selection of our best explainers and reporting.' },
        { Icon: CalendarCheck, t: 'Predictable schedule', d: 'We\'ll tell you how often we send before our first issue.' },
        { Icon: ShieldCheck, t: 'Your privacy matters', d: 'We never sell your email. Unsubscribe with one click.' }].
        map(({ Icon, t, d }) =>
        <div key={t}>
            <Icon className="h-8 w-8 text-brand" />
            <h3 className="mt-3 font-serif text-lg font-bold">{t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        )}
      </section>
    </div>);

}