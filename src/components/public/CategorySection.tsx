import React from 'react';
import type { Category, Post } from '../../types/models';
import { ArticleCard } from './ArticleCard';
import { SectionHeader } from './SectionHeader';

interface CategorySectionProps {
  category: Category;
  posts: Post[];
  layout?: 'lead-list' | 'grid';
}

export function CategorySection({ category, posts, layout = 'lead-list' }: CategorySectionProps) {
  if (!posts.length) return null;
  const [lead, ...rest] = posts;

  return (
    <section aria-labelledby={`sec-${category.slug}`} className="py-10">
      <div id={`sec-${category.slug}`}>
        <SectionHeader title={category.name} href={`/category/${category.slug}`} />
      </div>
      {layout === 'grid' ?
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {posts.slice(0, 4).map((p) => <ArticleCard key={p.id} post={p} />)}
        </div> :

      <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ArticleCard post={lead} />
          </div>
          <div className="space-y-6 divide-y divide-border lg:col-span-5 [&>*:not(:first-child)]:pt-6">
            {rest.slice(0, 3).map((p) => <ArticleCard key={p.id} post={p} variant="horizontal" />)}
            {rest.length === 0 && <p className="text-sm text-muted-foreground">More {category.name.toLowerCase()} stories coming soon.</p>}
          </div>
        </div>
      }
    </section>);

}