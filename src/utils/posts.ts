import type { Author, Category, Database, MediaItem, Post } from '../types/models';

export function effectivePublishedAt(post: Post): string | null {
  if (post.status === 'scheduled') return post.scheduledAt;
  return post.publishedAt;
}

/** A post is publicly visible when published (and not future-dated) or scheduled with a past release time. */
export function isLive(post: Post, now = Date.now()): boolean {
  if (post.status === 'published') return !post.publishedAt || new Date(post.publishedAt).getTime() <= now;
  if (post.status === 'scheduled') return !!post.scheduledAt && new Date(post.scheduledAt).getTime() <= now;
  return false;
}

export function livePosts(db: Database): Post[] {
  const now = Date.now();
  return db.posts.
  filter((p) => isLive(p, now)).
  sort((a, b) => new Date(effectivePublishedAt(b) || 0).getTime() - new Date(effectivePublishedAt(a) || 0).getTime());
}

export function enabledCategories(db: Database): Category[] {
  return db.categories.filter((c) => c.enabled).sort((a, b) => a.order - b.order);
}

export function topCategories(db: Database): Category[] {
  return enabledCategories(db).filter((c) => !c.parentId);
}

export function childCategories(db: Database, parentId: string): Category[] {
  return enabledCategories(db).filter((c) => c.parentId === parentId);
}

export function categoryFamilyIds(db: Database, categoryId: string): string[] {
  return [categoryId, ...db.categories.filter((c) => c.parentId === categoryId).map((c) => c.id)];
}

export function postsInCategory(db: Database, categoryId: string): Post[] {
  const ids = categoryFamilyIds(db, categoryId);
  return livePosts(db).filter((p) => p.categoryId && ids.includes(p.categoryId));
}

export function featuredPosts(db: Database): Post[] {
  return livePosts(db).filter((p) => p.isFeatured);
}

export function breakingPosts(db: Database): Post[] {
  return livePosts(db).filter((p) => p.isBreaking);
}

/** Manually flagged trending posts first, then real internal view counts. Never invented metrics. */
export function trendingPosts(db: Database, limit = 5): Post[] {
  const live = livePosts(db);
  const manual = live.filter((p) => p.isTrending);
  const byViews = live.filter((p) => !p.isTrending && p.views > 0).sort((a, b) => b.views - a.views);
  return [...manual, ...byViews].slice(0, limit);
}

export function relatedPosts(db: Database, post: Post, limit = 3): Post[] {
  return livePosts(db).
  filter((p) => p.id !== post.id).
  map((p) => {
    let score = 0;
    if (p.categoryId === post.categoryId) score += 3;
    score += p.tagIds.filter((t) => post.tagIds.includes(t)).length * 2;
    return { p, score };
  }).
  filter((x) => x.score > 0).
  sort((a, b) => b.score - a.score).
  slice(0, limit).
  map((x) => x.p);
}

export function searchPosts(db: Database, query: string): Post[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return livePosts(db).filter((p) => {
    const hay = `${p.title} ${p.subtitle} ${p.excerpt} ${p.content.replace(/<[^>]*>/g, ' ')}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export function findMedia(db: Database, id: string | null): MediaItem | undefined {
  return id ? db.media.find((m) => m.id === id) : undefined;
}

export function findCategory(db: Database, id: string | null): Category | undefined {
  return id ? db.categories.find((c) => c.id === id) : undefined;
}

export function findAuthor(db: Database, id: string | null): Author | undefined {
  return id ? db.authors.find((a) => a.id === id) : undefined;
}

export function uniqueSlug(base: string, taken: string[]): string {
  if (!taken.includes(base)) return base;
  let i = 2;
  while (taken.includes(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}