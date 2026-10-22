import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronDown, Mail, Menu, Search } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { childCategories, topCategories } from '../../utils/posts';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/Sheet';
import { Logo } from './Logo';
import { FacebookIcon } from './SocialIcons';

export function Header() {
  const { db } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const cats = topCategories(db);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  const navCls = ({ isActive }: {isActive: boolean;}) =>
  `relative inline-flex h-12 items-center whitespace-nowrap px-3 text-sm font-semibold transition-colors hover:text-brand ${isActive ? 'text-brand after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-brand' : 'text-ink'}`;

  return (
    <header className="bg-white">
      <div className="border-b border-border bg-white">
        <div className="container flex h-9 items-center justify-between text-xs text-muted-foreground">
          <time dateTime={new Date().toISOString().slice(0, 10)}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</time>
          <div className="flex items-center gap-4">
            <Link to="/newsletter" className="hidden items-center gap-1.5 hover:text-brand sm:inline-flex">
              <Mail className="h-3.5 w-3.5" /> Newsletter
            </Link>
            <Link to="/about" className="hidden hover:text-brand sm:inline">About</Link>
            <Link to="/contact" className="hidden hover:text-brand sm:inline">Contact</Link>
            <a href={db.settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="The Story Current on Facebook" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90">
              <FacebookIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="container flex items-center justify-between gap-4 py-4 md:py-5">
        <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <Logo size="md" />
        <form onSubmit={submitSearch} role="search" className="hidden w-72 items-center rounded-full border border-border bg-white pl-4 pr-1 focus-within:border-brand lg:flex">
          <label htmlFor="header-search" className="sr-only">Search articles</label>
          <input id="header-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stories…" className="h-10 flex-1 bg-transparent text-sm outline-none" />
          <button type="submit" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-deep" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </form>
        <Link to="/search" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border lg:hidden" aria-label="Search">
          <Search className="h-5 w-5" />
        </Link>
      </div>

      <nav aria-label="Primary" className="hidden border-y-2 border-ink lg:block">
        <div className="container flex items-center">
          <NavLink to="/" end className={navCls}>Home</NavLink>
          {cats.map((c) => {
            const kids = childCategories(db, c.id);
            return (
              <div key={c.id} className="group relative">
                <NavLink to={`/category/${c.slug}`} className={navCls}>
                  {c.name}
                  {kids.length > 0 && <ChevronDown className="ml-1 h-3.5 w-3.5" />}
                </NavLink>
                {kids.length > 0 &&
                <div className="invisible absolute left-0 top-full z-40 w-52 rounded-b-md border border-border bg-white py-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {kids.map((k) =>
                  <Link key={k.id} to={`/category/${k.slug}`} className="block px-4 py-2 text-sm hover:bg-brand-soft hover:text-brand-deep">{k.name}</Link>
                  )}
                  </div>
                }
              </div>);

          })}
        </div>
      </nav>
      <div className="h-[3px] bg-brand lg:hidden" />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-80 overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle><Logo size="sm" linkTo={null} /></SheetTitle>
          </SheetHeader>
          <form onSubmit={submitSearch} className="px-4">
            <label htmlFor="mobile-search" className="sr-only">Search</label>
            <input id="mobile-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stories…" className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-brand" />
          </form>
          <nav aria-label="Mobile" className="flex flex-col px-2 py-2">
            <Link to="/" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 font-semibold hover:bg-brand-soft">Home</Link>
            {cats.map((c) =>
            <div key={c.id}>
                <Link to={`/category/${c.slug}`} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 font-semibold hover:bg-brand-soft">{c.name}</Link>
                {childCategories(db, c.id).map((k) =>
              <Link key={k.id} to={`/category/${k.slug}`} onClick={() => setOpen(false)} className="block rounded-md py-2 pl-7 pr-3 text-sm text-muted-foreground hover:bg-brand-soft">{k.name}</Link>
              )}
              </div>
            )}
            <div className="my-2 border-t border-border" />
            {[['Newsletter', '/newsletter'], ['About', '/about'], ['Contact', '/contact']].map(([l, h]) =>
            <Link key={h} to={h} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-brand-soft">{l}</Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>);

}