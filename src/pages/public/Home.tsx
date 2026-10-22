import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Newspaper } from 'lucide-react';
import { AdSlot } from '../../components/public/AdSlot';
import { ArticleCard } from '../../components/public/ArticleCard';
import { BreakingTicker } from '../../components/public/BreakingTicker';
import { CategorySection } from '../../components/public/CategorySection';
import { NewsletterForm } from '../../components/public/NewsletterForm';
import { SectionHeader } from '../../components/public/SectionHeader';
import { useStore } from '../../contexts/StoreContext';
import { useSeo } from '../../hooks/useSeo';
import { breakingPosts, featuredPosts, livePosts, postsInCategory, trendingPosts } from '../../utils/posts';

const HOME_SECTIONS: {slug: string;layout: 'lead-list' | 'grid';}[] = [
{ slug: 'sports', layout: 'lead-list' },
{ slug: 'technology-ai', layout: 'grid' },
{ slug: 'entertainment', layout: 'lead-list' },
{ slug: 'lifestyle', layout: 'grid' },
{ slug: 'discoveries-facts', layout: 'lead-list' }];


export function Home() {
  const { db } = useStore();
  const s = db.settings;
  useSeo({
    title: s.defaultSeoTitle,
    description: s.defaultMetaDescription,
    path: '/',
    jsonLd: [
    { '@context': 'https://schema.org', '@type': 'NewsMediaOrganization', name: s.siteName, url: s.siteUrl, logo: s.logoUrl, sameAs: [s.facebookUrl, s.twitterUrl, s.instagramUrl, s.youtubeUrl, s.linkedinUrl].filter(Boolean) },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: s.siteName, url: s.siteUrl, potentialAction: { '@type': 'SearchAction', target: `${s.siteUrl}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }]

  });

  const all = livePosts(db);
  const featured = featuredPosts(db);
  const hero = featured[0] ?? all[0];
  const secondary = (featured.length > 1 ? featured.slice(1) : all.filter((p) => p.id !== hero?.id)).slice(0, 3);
  const used = new Set([hero?.id, ...secondary.map((p) => p.id)]);
  const latest = all.filter((p) => !used.has(p.id)).slice(0, 6);
  const trending = trendingPosts(db, 5);

  if (!hero) {
    return (
      <div className="container py-24 text-center">
        <Newspaper className="mx-auto h-12 w-12 text-brand" />
        <h1 className="mt-4 font-serif text-3xl font-bold">Stories are on the way</h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">Our newsroom hasn't published anything yet. Subscribe and we'll let you know when the first stories go live.</p>
        <div className="mx-auto mt-8 max-w-lg text-left"><NewsletterForm source="homepage" /></div>
      </div>);

  }

  return (
    <>
      <h1 className="sr-only">{s.siteName} — latest news and explainers</h1>
      <BreakingTicker posts={breakingPosts(db)} />

      <div className="container">
        <section aria-label="Featured stories" className="grid gap-8 py-8 lg:grid-cols-12 lg:py-10">
          <div className="lg:col-span-8 lg:border-r lg:border-border lg:pr-8">
            <ArticleCard post={hero} variant="hero" priority />
          </div>
          <div className="lg:col-span-4">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Top Stories</p>
            <div className="space-y-6 divide-y divide-border [&>*:not(:first-child)]:pt-6">
              {secondary.map((p, i) => i === 0 ? <ArticleCard key={p.id} post={p} /> : <ArticleCard key={p.id} post={p} variant="compact" />)}
            </div>
          </div>
        </section>

        <AdSlot position="homeTop" />

        <div className="grid gap-10 py-6 lg:grid-cols-12">
          <section aria-labelledby="latest" className="lg:col-span-8">
            <div id="latest"><SectionHeader title="Latest News" /></div>
            <div className="grid gap-8 sm:grid-cols-2">
              {latest.map((p) => <ArticleCard key={p.id} post={p} />)}
            </div>
          </section>
          <aside className="space-y-8 lg:col-span-4">
            {trending.length > 0 &&
            <section aria-labelledby="trending" className="rounded-lg bg-brand-soft p-6">
                <h2 id="trending" className="mb-5 flex items-center gap-2 font-serif text-xl font-extrabold">
                  <Flame className="h-5 w-5 text-brand" /> Trending Stories
                </h2>
                <ol className="space-y-5">
                  {trending.map((p, i) => <li key={p.id}><ArticleCard post={p} variant="compact" index={i} /></li>)}
                </ol>
              </section>
            }
            <div className="hidden lg:block lg:sticky lg:top-6">
              <AdSlot position="sidebar" format="rectangle" className="!my-0" />
            </div>
          </aside>
        </div>

        {HOME_SECTIONS.map(({ slug, layout }, i) => {
          const cat = db.categories.find((c) => c.slug === slug && c.enabled);
          if (!cat) return null;
          const posts = postsInCategory(db, cat.id).slice(0, 4);
          return (
            <React.Fragment key={slug}>
              <CategorySection category={cat} posts={posts} layout={layout} />
              {i === 1 && posts.length > 0 && <AdSlot position="homeBetween" />}
            </React.Fragment>);

        })}

        <section aria-labelledby="nl-home" className="my-10 grid items-center gap-8 rounded-xl border border-brand/15 bg-brand-soft p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Free newsletter</p>
            <h2 id="nl-home" className="mt-2 font-serif text-3xl font-extrabold leading-tight">Stay ahead of the current.</h2>
            <p className="mt-3 text-muted-foreground">The most important stories of the day, explained with sources you can check. Delivered to your inbox.</p>
            <Link to="/newsletter" className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-deep">Learn more about the newsletter →</Link>
          </div>
          <NewsletterForm source="homepage" />
        </section>
      </div>
    </>);

}