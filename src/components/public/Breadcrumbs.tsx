import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  name: string;
  href?: string;
}

export function Breadcrumbs({ items }: {items: Crumb[];}) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) =>
        <li key={`${c.name}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
            {c.href ?
          <Link to={c.href} className="hover:text-brand">{c.name}</Link> :

          <span aria-current="page" className="text-ink">{c.name}</span>
          }
          </li>
        )}
      </ol>
    </nav>);

}