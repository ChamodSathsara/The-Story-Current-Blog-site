import React from 'react';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { useStore } from '../../contexts/StoreContext';
import { staticPages } from '../../data/staticPages';
import { useSeo } from '../../hooks/useSeo';
import { NotFound } from './NotFound';

export function StaticPage({ slug }: {slug: string;}) {
  const { db } = useStore();
  const page = staticPages.find((p) => p.slug === slug);
  useSeo(page ? { title: `${page.title} | ${db.settings.siteName}`, description: page.description, path: `/${page.slug}` } : { noindex: true });
  if (!page) return <NotFound />;
  return (
    <div className="container max-w-3xl py-10">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: page.title }]} />
      <h1 className="mt-4 border-b-2 border-ink pb-4 font-serif text-4xl font-extrabold md:text-5xl">{page.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{page.description}</p>
      <div className="article-body mt-8">
        {page.sections.map((s) =>
        <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.body.map((b, i) => <p key={i}>{b}</p>)}
          </section>
        )}
        {slug === 'about' || slug === 'privacy-policy' ?
        <p>Questions? Email us at <a href={`mailto:${db.settings.contactEmail}`}>{db.settings.contactEmail}</a>.</p> :
        null}
      </div>
    </div>);

}