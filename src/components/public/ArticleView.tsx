import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { sourceTypeLabel } from '../../data/sourceTypes';
import type { Post } from '../../types/models';
import { formatDate } from '../../utils/format';
import { effectivePublishedAt, findAuthor, findCategory, findMedia, relatedPosts, trendingPosts } from '../../utils/posts';
import { sanitizeHtml } from '../../utils/security';
import { AdSlot } from './AdSlot';
import { ArticleCard } from './ArticleCard';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';
import { NewsletterForm } from './NewsletterForm';
import { SectionHeader } from './SectionHeader';
import { ShareButtons } from './ShareButtons';

export function ArticleView({ post, isPreview = false }: {post: Post;isPreview?: boolean;}) {
  const { db } = useStore();
  const img = findMedia(db, post.featuredImageId);
  const cat = findCategory(db, post.categoryId);
  const parent = cat?.parentId ? findCategory(db, cat.parentId) : undefined;
  const author = findAuthor(db, post.authorId);
  const tags = db.tags.filter((t) => post.tagIds.includes(t.id));
  const sources = post.sources.map((ps) => ({ ...ps, source: db.sources.find((s) => s.id === ps.sourceId) })).filter((x) => x.source);
  const related = isPreview ? [] : relatedPosts(db, post, 3);
  const trending = trendingPosts(db, 5).filter((p) => p.id !== post.id).slice(0, 4);
  const published = effectivePublishedAt(post);
  const wasUpdated = published && new Date(post.updatedAt).getTime() - new Date(published).getTime() > 60 * 1000;
  const url = `${db.settings.siteUrl}/article/${post.slug}`;

  const [bodyTop, bodyRest] = useMemo(() => {
    const clean = sanitizeHtml(post.content);
    const parts = clean.split(/(?<=<\/p>)/);
    if (parts.length < 5) return [clean, ''];
    return [parts.slice(0, 3).join(''), parts.slice(3).join('')];
  }, [post.content]);

  const crumbs: Crumb[] = [{ name: 'Home', href: '/' }];
  if (parent) crumbs.push({ name: parent.name, href: `/category/${parent.slug}` });
  if (cat) crumbs.push({ name: cat.name, href: `/category/${cat.slug}` });
  crumbs.push({ name: post.title });

  return (
    <div className="container py-8">
      <div className="grid gap-12 lg:grid-cols-12">
        <article className="lg:col-span-8" itemScope itemType="https://schema.org/NewsArticle">
          <header>
            <Breadcrumbs items={crumbs} />
            {cat &&
            <Link to={`/category/${cat.slug}`} className="mt-6 inline-block rounded bg-brand px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-brand-deep">
                {cat.name}
              </Link>
            }
            <h1 itemProp="headline" className="mt-4 font-serif text-3xl font-extrabold leading-[1.12] tracking-tight text-ink md:text-5xl">{post.title || 'Untitled article'}</h1>
            {post.subtitle && <p className="mt-4 text-xl leading-relaxed text-muted-foreground">{post.subtitle}</p>}

            <div className="mt-6 flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {author && <img src={author.avatarUrl || db.settings.logoUrl} alt="" className="h-11 w-11 rounded-full object-cover" width={44} height={44} />}
                <div className="text-sm">
                  {author &&
                  <p className="font-semibold text-ink" itemProp="author">
                      By <Link to={`/author/${author.slug}`} className="hover:text-brand">{author.displayName}</Link>
                    </p>
                  }
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>Published <time itemProp="datePublished" dateTime={published || undefined}>{formatDate(published, true)}</time></span>
                    {wasUpdated &&
                    <span className="inline-flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Updated <time itemProp="dateModified" dateTime={post.updatedAt}>{formatDate(post.updatedAt, true)}</time></span>
                    }
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{post.readingTime} min read</span>
                  </p>
                </div>
              </div>
              <ShareButtons url={url} title={post.title} />
            </div>
          </header>

          {img &&
          <figure className="mt-6">
              <img src={img.url} alt={img.alt} width={img.width} height={img.height} className="aspect-[16/9] w-full rounded-lg object-cover" itemProp="image" />
              {(img.caption || img.credit) &&
            <figcaption className="mt-2 text-sm text-muted-foreground">
                  {img.caption}
                  {img.credit && <span className="ml-1 text-xs uppercase tracking-wide">Credit: {img.credit}</span>}
                </figcaption>
            }
            </figure>
          }

          <AdSlot position="articleTop" />

          <div className="article-body" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: bodyTop }} />
          {bodyRest &&
          <>
              <AdSlot position="articleInline" format="rectangle" />
              <div className="article-body" dangerouslySetInnerHTML={{ __html: bodyRest }} />
            </>
          }

          {sources.length > 0 &&
          <section aria-labelledby="sources" className="mt-10 rounded-lg border border-border p-6">
              <h2 id="sources" className="font-serif text-xl font-bold">Sources &amp; References</h2>
              <ol className="mt-4 space-y-3">
                {sources.map(({ source, note }, i) => source &&
              <li key={source.id} className="flex gap-3 text-sm">
                    <span className="font-semibold text-brand">{i + 1}.</span>
                    <div>
                      <a href={source.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-semibold text-ink underline decoration-brand/40 underline-offset-2 hover:text-brand">
                        {source.name} <ExternalLink className="h-3 w-3" />
                      </a>
                      <p className="text-muted-foreground">
                        {[source.publisher, sourceTypeLabel(source.type), source.publishedDate && formatDate(source.publishedDate)].filter(Boolean).join(' · ')}
                      </p>
                      {(note || source.note) && <p className="mt-0.5 text-xs italic text-muted-foreground">{note || source.note}</p>}
                    </div>
                  </li>
              )}
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">Source links open the original publisher. Attribution does not imply endorsement.</p>
            </section>
          }

          {tags.length > 0 &&
          <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tags</span>
              {tags.map((t) =>
            <Link key={t.id} to={`/tag/${t.slug}`} className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:border-brand hover:bg-brand-soft hover:text-brand-deep">#{t.name}</Link>
            )}
            </div>
          }

          {author &&
          <section aria-label="About the author" className="mt-10 flex gap-4 border-t border-border pt-8">
              <img src={author.avatarUrl || db.settings.logoUrl} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" width={64} height={64} />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand">{author.role || 'Author'}</p>
                <Link to={`/author/${author.slug}`} className="font-serif text-lg font-bold hover:text-brand">{author.displayName}</Link>
                <p className="mt-1 text-sm text-muted-foreground">{author.bio}</p>
              </div>
            </section>
          }

          <section aria-labelledby="nl-article" className="mt-10 rounded-xl bg-brand-soft p-6 md:p-8">
            <h2 id="nl-article" className="font-serif text-2xl font-extrabold">Enjoyed this story?</h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">Get explainers like this in your inbox. Free, and you can unsubscribe anytime.</p>
            <NewsletterForm source="article" />
          </section>
        </article>

        <aside className="space-y-8 lg:col-span-4">
          <div className="lg:sticky lg:top-6 lg:space-y-8">
            {trending.length > 0 &&
            <section aria-labelledby="art-trending" className="rounded-lg border border-border p-6">
                <h2 id="art-trending" className="mb-5 border-b-2 border-brand pb-2 font-serif text-lg font-extrabold">Trending Now</h2>
                <ol className="space-y-5">{trending.map((p, i) => <li key={p.id}><ArticleCard post={p} variant="compact" index={i} /></li>)}</ol>
              </section>
            }
            <div className="hidden lg:block"><AdSlot position="sidebar" format="rectangle" className="!my-0" /></div>
          </div>
        </aside>
      </div>

      {related.length > 0 &&
      <section aria-labelledby="related" className="mt-16">
          <div id="related"><SectionHeader title="Related Stories" /></div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{related.map((p) => <ArticleCard key={p.id} post={p} />)}</div>
        </section>
      }
    </div>);

}