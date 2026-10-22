import React, { useState } from 'react';
import type { Post } from '../../types/models';
import { AdSlot } from './AdSlot';
import { ArticleCard } from './ArticleCard';

const PAGE_SIZE = 9;

export function PostListing({ posts, emptyText }: {posts: Post[];emptyText: string;}) {
  const [page, setPage] = useState(1);
  if (!posts.length) {
    return <p className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">{emptyText}</p>;
  }
  const visible = posts.slice(0, page * PAGE_SIZE);
  const [lead, ...rest] = visible;
  return (
    <div>
      <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-12">
        <div className="lg:col-span-8"><ArticleCard post={lead} variant="hero" priority /></div>
        <div className="space-y-6 divide-y divide-border lg:col-span-4 [&>*:not(:first-child)]:pt-6">
          {rest.slice(0, 3).map((p) => <ArticleCard key={p.id} post={p} variant="compact" />)}
        </div>
      </div>
      {rest.length > 3 &&
      <>
          <AdSlot position="homeBetween" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(3).map((p) => <ArticleCard key={p.id} post={p} />)}
          </div>
        </>
      }
      {visible.length < posts.length &&
      <div className="mt-10 text-center">
          <button onClick={() => setPage((p) => p + 1)} className="rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold hover:border-brand hover:bg-brand hover:text-white">
            Load more stories
          </button>
        </div>
      }
    </div>);

}