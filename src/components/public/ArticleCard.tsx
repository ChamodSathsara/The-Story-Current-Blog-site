import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import type { Post } from '../../types/models';
import { timeAgo } from '../../utils/format';
import { effectivePublishedAt, findAuthor, findCategory, findMedia } from '../../utils/posts';

type Variant = 'hero' | 'standard' | 'horizontal' | 'compact';

interface ArticleCardProps {
  post: Post;
  variant?: Variant;
  priority?: boolean;
  index?: number;
}

export function CategoryLabel({ name, slug }: {name: string;slug: string;}) {
  return (
    <Link to={`/category/${slug}`} className="relative z-10 text-[11px] font-bold uppercase tracking-[0.14em] text-brand hover:text-brand-deep">
      {name}
    </Link>);

}

export function ArticleCard({ post, variant = 'standard', priority = false, index }: ArticleCardProps) {
  const { db } = useStore();
  const img = findMedia(db, post.featuredImageId);
  const cat = findCategory(db, post.categoryId);
  const author = findAuthor(db, post.authorId);
  const published = effectivePublishedAt(post);
  const href = `/article/${post.slug}`;

  const meta =
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {author && <span className="font-medium text-ink/80">{author.displayName}</span>}
      {author && <span aria-hidden="true">·</span>}
      <time dateTime={published || undefined}>{timeAgo(published)}</time>
    </div>;


  if (variant === 'hero') {
    return (
      <article className="group relative">
        <Link to={href} className="block overflow-hidden rounded-lg">
          {img &&
          <img src={img.url} alt={img.alt} width={img.width} height={img.height} loading={priority ? 'eager' : 'lazy'} decoding={priority ? 'sync' : 'async'} className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
          }
        </Link>
        <div className="mt-5">
          {cat && <CategoryLabel name={cat.name} slug={cat.slug} />}
          <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-ink md:text-[2.6rem] md:leading-[1.1]">
            <Link to={href} className="hover:text-brand-deep">{post.title}</Link>
          </h2>
          {post.subtitle && <p className="mt-3 text-lg text-muted-foreground">{post.subtitle}</p>}
          <div className="mt-4 flex items-center gap-3">
            {meta}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{post.readingTime} min read</span>
          </div>
        </div>
      </article>);

  }

  if (variant === 'horizontal') {
    return (
      <article className="group flex gap-4">
        <div className="min-w-0 flex-1">
          {cat && <CategoryLabel name={cat.name} slug={cat.slug} />}
          <h3 className="mt-1 font-serif text-lg font-bold leading-snug text-ink">
            <Link to={href} className="hover:text-brand-deep">{post.title}</Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          <div className="mt-2">{meta}</div>
        </div>
        {img &&
        <Link to={href} className="shrink-0 overflow-hidden rounded-md">
            <img src={img.url} alt={img.alt} loading="lazy" width={240} height={160} className="h-24 w-32 object-cover transition group-hover:scale-105 sm:h-28 sm:w-40" />
          </Link>
        }
      </article>);

  }

  if (variant === 'compact') {
    return (
      <article className="group flex gap-4">
        {index !== undefined && <span className="font-serif text-3xl font-extrabold leading-none text-brand">{index + 1}</span>}
        <div className="min-w-0">
          {cat && <CategoryLabel name={cat.name} slug={cat.slug} />}
          <h3 className="mt-1 font-serif text-base font-bold leading-snug text-ink">
            <Link to={href} className="hover:text-brand-deep">{post.title}</Link>
          </h3>
          <div className="mt-1.5">{meta}</div>
        </div>
      </article>);

  }

  return (
    <article className="group flex flex-col">
      {img &&
      <Link to={href} className="block overflow-hidden rounded-md">
          <img src={img.url} alt={img.alt} loading="lazy" width={640} height={360} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        </Link>
      }
      <div className="mt-3 flex flex-1 flex-col">
        {cat && <CategoryLabel name={cat.name} slug={cat.slug} />}
        <h3 className="mt-1.5 font-serif text-xl font-bold leading-snug text-ink">
          <Link to={href} className="hover:text-brand-deep">{post.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        <div className="mt-auto pt-3">{meta}</div>
      </div>
    </article>);

}