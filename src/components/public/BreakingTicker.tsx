import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import type { Post } from '../../types/models';

export function BreakingTicker({ posts }: {posts: Post[];}) {
  if (!posts.length) return null;
  const loop = [...posts, ...posts];
  return (
    <section aria-label="Breaking news" className="border-b border-border bg-white">
      <div className="container flex items-stretch gap-0 overflow-hidden py-0">
        <div className="z-10 flex shrink-0 items-center gap-1.5 bg-brand px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
          <Zap className="h-3.5 w-3.5 fill-white" /> Breaking
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="tsc-ticker-track flex w-max items-center gap-10 whitespace-nowrap py-2.5 pl-6">
            {loop.map((p, i) =>
            <Link key={`${p.id}-${i}`} to={`/article/${p.slug}`} className="flex items-center gap-3 text-sm font-medium text-ink hover:text-brand" tabIndex={i >= posts.length ? -1 : 0}>
                <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                {p.title}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>);

}