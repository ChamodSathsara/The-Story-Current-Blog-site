import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  href?: string;
  as?: 'h1' | 'h2';
}

export function SectionHeader({ title, href, as = 'h2' }: SectionHeaderProps) {
  const Tag = as;
  return (
    <div className="mb-6 flex items-end justify-between border-b-2 border-ink pb-2">
      <Tag className="relative font-serif text-2xl font-extrabold tracking-tight text-ink after:absolute after:-bottom-[10px] after:left-0 after:h-[3px] after:w-full after:bg-brand">
        {title}
      </Tag>
      {href &&
      <Link to={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-deep">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      }
    </div>);

}