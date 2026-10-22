import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { ArticleCard } from '../../components/public/ArticleCard';
import { useStore } from '../../contexts/StoreContext';
import { useSeo } from '../../hooks/useSeo';
import { searchPosts } from '../../utils/posts';

export function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [value, setValue] = useState(query);
  const { db } = useStore();
  const results = searchPosts(db, query);

  useSeo({ title: query ? `Search: ${query} | ${db.settings.siteName}` : `Search | ${db.settings.siteName}`, noindex: true });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(value.trim() ? { q: value.trim() } : {});
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="font-serif text-4xl font-extrabold">Search</h1>
      <form onSubmit={submit} role="search" className="mt-6 flex gap-2">
        <label htmlFor="search-page" className="sr-only">Search stories</label>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input id="search-page" autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search headlines, topics, explainers…" className="h-12 w-full rounded-md border border-border pl-11 pr-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </div>
        <button className="h-12 rounded-md bg-brand px-6 font-semibold text-white hover:bg-brand-deep">Search</button>
      </form>
      {query &&
      <p className="mt-6 text-sm text-muted-foreground" role="status">
          {results.length} {results.length === 1 ? 'result' : 'results'} for <strong className="text-ink">“{query}”</strong>
        </p>
      }
      <div className="mt-6 space-y-6 divide-y divide-border [&>*:not(:first-child)]:pt-6">
        {results.map((p) => <ArticleCard key={p.id} post={p} variant="horizontal" />)}
      </div>
      {query && results.length === 0 &&
      <div className="mt-6 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="font-semibold">No stories match your search.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try fewer or different keywords.</p>
        </div>
      }
    </div>);

}