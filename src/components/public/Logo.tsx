import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string | null;
  showWordmark?: boolean;
}

const sizes = { sm: 'h-9 w-9', md: 'h-12 w-12', lg: 'h-16 w-16' };
const text = { sm: 'text-lg', md: 'text-2xl md:text-[1.75rem]', lg: 'text-3xl' };

export function Logo({ size = 'md', linkTo = '/', showWordmark = true }: LogoProps) {
  const { db } = useStore();
  const { logoUrl, siteName } = db.settings;
  const inner =
  <span className="flex items-center gap-3">
      <img src={logoUrl} alt={`${siteName} logo`} className={`${sizes[size]} rounded-md object-cover`} width={64} height={64} />
      {showWordmark &&
    <span className="flex flex-col leading-none">
          <span className={`font-serif font-extrabold tracking-tight text-ink ${text[size]}`}>{siteName}</span>
          {size !== 'sm' && <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">News · Explained · Sourced</span>}
        </span>
    }
    </span>;

  if (!linkTo) return inner;
  return (
    <Link to={linkTo} aria-label={`${siteName} home`} className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4">
      {inner}
    </Link>);

}