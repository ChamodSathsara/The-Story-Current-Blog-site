import React from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { PostListing } from '../../components/public/PostListing';
import { useStore } from '../../contexts/StoreContext';
import { useSeo } from '../../hooks/useSeo';
import { livePosts } from '../../utils/posts';
import { NotFound } from './NotFound';

export function Tag() {
  const { slug } = useParams();
  const { db } = useStore();
  const tag = db.tags.find((t) => t.slug === slug);
  const posts = tag ? livePosts(db).filter((p) => p.tagIds.includes(tag.id)) : [];

  useSeo(
    tag ?
    { title: `${tag.name} — Stories tagged #${tag.name} | ${db.settings.siteName}`, description: `All stories tagged ${tag.name} on ${db.settings.siteName}.`, path: `/tag/${tag.slug}`, noindex: posts.length < 2 } :
    { title: 'Tag not found', noindex: true }
  );

  if (!tag) return <NotFound />;
  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: `#${tag.name}` }]} />
      <header className="mb-8 mt-4 border-b-2 border-ink pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Tag</p>
        <h1 className="mt-1 font-serif text-4xl font-extrabold">#{tag.name}</h1>
        <p className="mt-2 text-muted-foreground">{posts.length} {posts.length === 1 ? 'story' : 'stories'}</p>
      </header>
      <PostListing posts={posts} emptyText="No published stories use this tag yet." />
    </div>);

}