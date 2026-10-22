import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { PostListing } from '../../components/public/PostListing';
import { useStore } from '../../contexts/StoreContext';
import { useSeo } from '../../hooks/useSeo';
import { breadcrumbJsonLd } from '../../utils/seo';
import { childCategories, findCategory, postsInCategory } from '../../utils/posts';
import { NotFound } from './NotFound';

export function Category() {
  const { slug } = useParams();
  const { db } = useStore();
  const cat = db.categories.find((c) => c.slug === slug && c.enabled);
  const parent = cat?.parentId ? findCategory(db, cat.parentId) : undefined;
  const s = db.settings;

  useSeo(
    cat ?
    {
      title: cat.seoTitle || `${cat.name} | ${s.siteName}`,
      description: cat.metaDescription || cat.description,
      path: `/category/${cat.slug}`,
      jsonLd: [breadcrumbJsonLd([{ name: 'Home', url: `${s.siteUrl}/` }, { name: cat.name, url: `${s.siteUrl}/category/${cat.slug}` }])]
    } :
    { title: 'Category not found', noindex: true }
  );

  if (!cat) return <NotFound />;
  const kids = childCategories(db, cat.id);
  const siblings = parent ? childCategories(db, parent.id) : [];
  const chips = kids.length ? kids : siblings;

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, ...(parent ? [{ name: parent.name, href: `/category/${parent.slug}` }] : []), { name: cat.name }]} />
      <header className="mb-8 mt-4 border-b-2 border-ink pb-6">
        <h1 className="font-serif text-4xl font-extrabold tracking-tight md:text-5xl">{cat.name}</h1>
        {cat.description && <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{cat.description}</p>}
        {chips.length > 0 &&
        <nav aria-label={`${parent?.name ?? cat.name} subcategories`} className="mt-5 flex flex-wrap gap-2">
            {parent && <Link to={`/category/${parent.slug}`} className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium hover:border-brand">All {parent.name}</Link>}
            {chips.map((k) =>
          <Link key={k.id} to={`/category/${k.slug}`} aria-current={k.id === cat.id ? 'page' : undefined} className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${k.id === cat.id ? 'border-brand bg-brand text-white' : 'border-border hover:border-brand hover:text-brand'}`}>
                {k.name}
              </Link>
          )}
          </nav>
        }
      </header>
      <PostListing posts={postsInCategory(db, cat.id)} emptyText={`No ${cat.name} stories have been published yet.`} />
    </div>);

}