import React from 'react';
import { useParams } from 'react-router-dom';
import { Globe, Mail } from 'lucide-react';
import { ArticleCard } from '../../components/public/ArticleCard';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon } from '../../components/public/SocialIcons';
import { useStore } from '../../contexts/StoreContext';
import { useSeo } from '../../hooks/useSeo';
import { livePosts } from '../../utils/posts';
import { NotFound } from './NotFound';

export function Author() {
  const { slug } = useParams();
  const { db } = useStore();
  const author = db.authors.find((a) => a.slug === slug && a.active);
  const posts = author ? livePosts(db).filter((p) => p.authorId === author.id) : [];
  const s = db.settings;

  useSeo(
    author ?
    {
      title: `${author.displayName} | ${s.siteName}`,
      description: author.bio.slice(0, 160),
      path: `/author/${author.slug}`,
      type: 'profile',
      image: author.avatarUrl,
      jsonLd: [{
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': author.isOrganization ? 'Organization' : 'Person',
          name: author.displayName,
          description: author.bio,
          image: author.avatarUrl || undefined,
          url: `${s.siteUrl}/author/${author.slug}`,
          ...(author.isOrganization ? {} : { jobTitle: author.role || undefined, worksFor: { '@type': 'Organization', name: s.siteName } }),
          sameAs: [author.website, ...Object.values(author.socials)].filter(Boolean)
        }
      }]
    } :
    { title: 'Author not found', noindex: true }
  );

  if (!author) return <NotFound />;
  const socials = [
  { href: author.socials.facebook, Icon: FacebookIcon, label: 'Facebook' },
  { href: author.socials.twitter, Icon: XIcon, label: 'X' },
  { href: author.socials.linkedin, Icon: LinkedInIcon, label: 'LinkedIn' },
  { href: author.socials.instagram, Icon: InstagramIcon, label: 'Instagram' }].
  filter((x) => x.href);

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: author.displayName }]} />
      <header className="mt-6 flex flex-col gap-6 rounded-xl bg-brand-soft p-6 sm:flex-row sm:items-center md:p-10">
        <img src={author.avatarUrl || s.logoUrl} alt={`${author.displayName}`} className="h-28 w-28 rounded-full border-4 border-white object-cover shadow" width={112} height={112} />
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{author.role || 'Contributor'}</p>
          <h1 className="mt-1 font-serif text-3xl font-extrabold md:text-4xl">{author.displayName}</h1>
          {author.fullName !== author.displayName && <p className="text-sm text-muted-foreground">{author.fullName}</p>}
          <p className="mt-3 max-w-2xl text-muted-foreground">{author.bio}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {author.website && <a href={author.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium hover:text-brand"><Globe className="h-3.5 w-3.5" /> Website</a>}
            {author.showEmail && author.email && <a href={`mailto:${author.email}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium hover:text-brand"><Mail className="h-3.5 w-3.5" /> Email</a>}
            {socials.map(({ href, Icon, label }) =>
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-brand hover:text-white"><Icon className="h-3.5 w-3.5" /></a>
            )}
          </div>
        </div>
      </header>
      <h2 className="mb-6 mt-12 border-b-2 border-ink pb-2 font-serif text-2xl font-extrabold">Published stories ({posts.length})</h2>
      {posts.length ?
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{posts.map((p) => <ArticleCard key={p.id} post={p} />)}</div> :

      <p className="text-muted-foreground">No published stories yet.</p>
      }
    </div>);

}