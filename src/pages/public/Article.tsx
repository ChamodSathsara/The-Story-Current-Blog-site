import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArticleView } from '../../components/public/ArticleView';
import { useStore } from '../../contexts/StoreContext';
import { useSeo } from '../../hooks/useSeo';
import { articleJsonLd, breadcrumbJsonLd, effectiveMetaDescription, effectiveSeoTitle } from '../../utils/seo';
import { effectivePublishedAt, findCategory, findMedia, isLive } from '../../utils/posts';
import { NotFound } from './NotFound';

export function Article() {
  const { slug } = useParams();
  const { db, incrementViews } = useStore();
  const post = db.posts.find((p) => p.slug === slug && isLive(p));

  useEffect(() => {
    if (!post) return;
    const key = `tsc_viewed_${post.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    incrementViews(post.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  const s = db.settings;
  const cat = post ? findCategory(db, post.categoryId) : undefined;
  const og = post ? findMedia(db, post.seo.ogImageId) || findMedia(db, post.featuredImageId) : undefined;

  useSeo(
    post ?
    {
      title: post.seo.ogTitle || effectiveSeoTitle(post, s.siteName),
      description: post.seo.ogDescription || effectiveMetaDescription(post),
      path: `/article/${post.slug}`,
      canonical: post.seo.canonicalUrl || undefined,
      image: og?.url,
      type: 'article',
      noindex: post.seo.noindex,
      publishedTime: effectivePublishedAt(post),
      modifiedTime: post.updatedAt,
      jsonLd: [
      articleJsonLd(post, db),
      breadcrumbJsonLd([
      { name: 'Home', url: `${s.siteUrl}/` },
      ...(cat ? [{ name: cat.name, url: `${s.siteUrl}/category/${cat.slug}` }] : []),
      { name: post.title, url: `${s.siteUrl}/article/${post.slug}` }]
      )]

    } :
    { title: `Article not found | ${s.siteName}`, noindex: true }
  );

  if (!post) return <NotFound />;
  return <ArticleView post={post} />;
}