import type { Database, Post } from '../types/models';
import { escapeXml, isValidSlug, stripHtml, wordCount } from './format';
import { effectivePublishedAt, findAuthor, findCategory, findMedia, livePosts } from './posts';

export type CheckLevel = 'good' | 'warn' | 'bad';
export interface SeoCheck {
  label: string;
  level: CheckLevel;
}

export function effectiveSeoTitle(post: Post, siteName: string): string {
  return post.seo.seoTitle || `${post.title} | ${siteName}`;
}

export function effectiveMetaDescription(post: Post): string {
  return post.seo.metaDescription || post.excerpt;
}

/** Advisory checklist only — it does not guarantee search rankings. */
export function analyzeSeo(post: Post, db: Database): {checks: SeoCheck[];score: number;} {
  const checks: SeoCheck[] = [];
  const title = effectiveSeoTitle(post, db.settings.siteName);
  const desc = effectiveMetaDescription(post);
  const kw = post.seo.focusKeyword.trim().toLowerCase();
  const body = stripHtml(post.content).toLowerCase();
  const words = wordCount(post.content);

  checks.push(title.length >= 30 && title.length <= 60 ?
  { label: `SEO title length is good (${title.length} chars)`, level: 'good' } :
  { label: `SEO title is ${title.length} chars — aim for 30–60`, level: 'warn' });
  checks.push(!desc ? { label: 'Meta description is missing', level: 'bad' } :
  desc.length >= 120 && desc.length <= 160 ? { label: `Meta description length is good (${desc.length})`, level: 'good' } :
  { label: `Meta description is ${desc.length} chars — aim for 120–160`, level: 'warn' });
  checks.push(isValidSlug(post.slug) ? { label: 'URL slug is valid', level: 'good' } : { label: 'URL slug is invalid or empty', level: 'bad' });

  if (!kw) {
    checks.push({ label: 'No focus keyword set', level: 'warn' });
  } else {
    checks.push(post.title.toLowerCase().includes(kw) ? { label: 'Focus keyword appears in headline', level: 'good' } : { label: 'Focus keyword missing from headline', level: 'warn' });
    checks.push(desc.toLowerCase().includes(kw) ? { label: 'Focus keyword in meta description', level: 'good' } : { label: 'Focus keyword missing from meta description', level: 'warn' });
    checks.push(post.slug.includes(kw.replace(/\s+/g, '-')) ? { label: 'Focus keyword in URL slug', level: 'good' } : { label: 'Consider adding focus keyword to slug', level: 'warn' });
    checks.push(body.slice(0, 600).includes(kw) ? { label: 'Focus keyword in opening paragraph', level: 'good' } : { label: 'Focus keyword not in opening paragraph', level: 'warn' });
  }

  checks.push(words >= 300 ? { label: `Article length: ${words} words`, level: 'good' } : { label: `Article is short (${words} words) — 300+ recommended`, level: 'warn' });

  const featured = findMedia(db, post.featuredImageId);
  checks.push(!featured ? { label: 'No featured image selected', level: 'bad' } :
  featured.alt.trim() ? { label: 'Featured image has alt text', level: 'good' } : { label: 'Featured image is missing alt text', level: 'bad' });

  const inlineImgs = post.content.match(/<img[^>]*>/g) || [];
  const missingAlt = inlineImgs.filter((t) => !/alt="[^"]+"/.test(t)).length;
  if (inlineImgs.length) {
    checks.push(missingAlt === 0 ? { label: 'All inline images have alt text', level: 'good' } : { label: `${missingAlt} inline image(s) missing alt text`, level: 'bad' });
  }
  const hasInternal = new RegExp(`href="(/|${db.settings.siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`).test(post.content);
  checks.push(hasInternal ? { label: 'Contains internal links', level: 'good' } : { label: 'No internal links yet — see suggestions', level: 'warn' });
  checks.push(post.sources.length ? { label: `${post.sources.length} source(s) cited`, level: 'good' } : { label: 'No sources cited', level: 'warn' });

  const score = Math.round(checks.reduce((s, c) => s + (c.level === 'good' ? 1 : c.level === 'warn' ? 0.4 : 0), 0) / checks.length * 100);
  return { checks, score };
}

export function internalLinkSuggestions(post: Post, db: Database, limit = 5): Post[] {
  const words = new Set(
    `${post.title} ${post.seo.focusKeyword} ${post.seo.secondaryKeywords}`.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3)
  );
  return livePosts(db).
  filter((p) => p.id !== post.id).
  map((p) => {
    const hay = `${p.title} ${p.seo.focusKeyword}`.toLowerCase();
    let score = [...words].filter((w) => hay.includes(w)).length * 2;
    if (p.categoryId === post.categoryId) score += 1;
    score += p.tagIds.filter((t) => post.tagIds.includes(t)).length;
    return { p, score };
  }).
  filter((x) => x.score > 0).
  sort((a, b) => b.score - a.score).
  slice(0, limit).
  map((x) => x.p);
}

export function articleJsonLd(post: Post, db: Database): Record<string, unknown> {
  const s = db.settings;
  const author = findAuthor(db, post.authorId);
  const image = findMedia(db, post.seo.ogImageId) || findMedia(db, post.featuredImageId);
  const category = findCategory(db, post.categoryId);
  const url = `${s.siteUrl}/article/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: { '@type': 'WebPage', '@id': post.seo.canonicalUrl || url },
    headline: post.title.slice(0, 110),
    description: effectiveMetaDescription(post),
    image: image ? [image.url] : undefined,
    datePublished: effectivePublishedAt(post),
    dateModified: post.updatedAt,
    articleSection: category?.name,
    keywords: [post.seo.focusKeyword, post.seo.secondaryKeywords].filter(Boolean).join(', ') || undefined,
    author: author ?
    author.isOrganization ?
    { '@type': 'Organization', name: author.displayName, url: `${s.siteUrl}/author/${author.slug}` } :
    { '@type': 'Person', name: author.displayName, url: `${s.siteUrl}/author/${author.slug}`, jobTitle: author.role || undefined } :
    undefined,
    publisher: { '@type': 'Organization', name: s.siteName, logo: { '@type': 'ImageObject', url: s.logoUrl } }
  };
}

export function breadcrumbJsonLd(items: {name: string;url: string;}[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url }))
  };
}

export function buildSitemap(db: Database): string {
  const base = db.settings.siteUrl;
  const urls: {loc: string;lastmod?: string;}[] = [{ loc: `${base}/` }];
  db.categories.filter((c) => c.enabled).forEach((c) => urls.push({ loc: `${base}/category/${c.slug}` }));
  db.authors.filter((a) => a.active).forEach((a) => urls.push({ loc: `${base}/author/${a.slug}` }));
  livePosts(db).filter((p) => !p.seo.noindex).forEach((p) => urls.push({ loc: `${base}/article/${p.slug}`, lastmod: p.updatedAt }));
  ['about', 'contact', 'newsletter', 'privacy-policy', 'terms-and-conditions', 'editorial-policy', 'corrections-policy'].forEach((p) => urls.push({ loc: `${base}/${p}` }));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.
  map((u) => `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).
  join('\n')}\n</urlset>`;
}

export function buildRobots(db: Database): string {
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /search\n\nSitemap: ${db.settings.siteUrl}/sitemap.xml`;
}

export function buildRss(db: Database): string {
  const s = db.settings;
  const items = livePosts(db).slice(0, 30).map((p) => {
    const author = findAuthor(db, p.authorId);
    return `    <item>\n      <title>${escapeXml(p.title)}</title>\n      <link>${s.siteUrl}/article/${p.slug}</link>\n      <guid isPermaLink="true">${s.siteUrl}/article/${p.slug}</guid>\n      <pubDate>${new Date(effectivePublishedAt(p) || p.createdAt).toUTCString()}</pubDate>\n      <description>${escapeXml(p.excerpt)}</description>${author ? `\n      <dc:creator>${escapeXml(author.displayName)}</dc:creator>` : ''}\n    </item>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">\n  <channel>\n    <title>${escapeXml(s.siteName)}</title>\n    <link>${s.siteUrl}</link>\n    <description>${escapeXml(s.description)}</description>\n    <language>en-us</language>\n${items.join('\n')}\n  </channel>\n</rss>`;
}