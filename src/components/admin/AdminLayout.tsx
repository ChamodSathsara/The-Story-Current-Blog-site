import React, { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3, ExternalLink, FileText, FolderTree, Image as ImageIcon, Inbox, LayoutDashboard, Link2, LogOut, Mail, Menu,
  PenSquare, Search, Settings, ShieldCheck, Tags, Users } from
'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { useSeo } from '../../hooks/useSeo';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/Sheet';

const NAV: Array<{ group: string; items: Array<{ to: string; label: string; Icon: LucideIcon; end?: boolean; badge?: 'messages' }> }> = [
{ group: 'Overview', items: [{ to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true }] },
{
  group: 'Content',
  items: [
  { to: '/admin/posts', label: 'All Posts', Icon: FileText, end: true },
  { to: '/admin/posts/new', label: 'Create Post', Icon: PenSquare },
  { to: '/admin/categories', label: 'Categories', Icon: FolderTree },
  { to: '/admin/tags', label: 'Tags', Icon: Tags },
  { to: '/admin/authors', label: 'Authors', Icon: Users },
  { to: '/admin/sources', label: 'Sources', Icon: Link2 },
  { to: '/admin/media', label: 'Media Library', Icon: ImageIcon }]

},
{
  group: 'Audience',
  items: [
  { to: '/admin/inbox', label: 'Contact Inbox', Icon: Inbox, badge: 'messages' as const },
  { to: '/admin/subscribers', label: 'Newsletter Subscribers', Icon: Mail }]

},
{
  group: 'Site',
  items: [
  { to: '/admin/seo', label: 'SEO Settings', Icon: Search },
  { to: '/admin/settings', label: 'Website Settings', Icon: Settings },
  { to: '/admin/analytics', label: 'Analytics', Icon: BarChart3 },
  { to: '/admin/account', label: 'Account & Security', Icon: ShieldCheck }]

}];


export function AdminLayout() {
  const { user, logout } = useAuth();
  const { db } = useStore();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  useSeo({ title: 'Admin | The Story Current', noindex: true });

  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  const unread = db.messages.filter((m) => m.status === 'unread').length;

  const nav =
  <nav aria-label="Admin" className="flex flex-col gap-6 px-3 py-4">
      {NAV.map((g) =>
    <div key={g.group}>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{g.group}</p>
          <ul className="space-y-0.5">
            {g.items.map(({ to, label, Icon, end, badge }) =>
        <li key={to}>
                <NavLink
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-soft text-brand-deep' : 'text-ink/80 hover:bg-muted hover:text-ink'}`}>
            
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{label}</span>
                  {badge === 'messages' && unread > 0 && <span className="rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">{unread}</span>}
                </NavLink>
              </li>
        )}
          </ul>
        </div>
    )}
    </nav>;


  const brand =
  <Link to="/admin" className="flex items-center gap-2.5">
      <img src={db.settings.logoUrl} alt="" className="h-8 w-8 rounded" width={32} height={32} />
      <span className="leading-tight">
        <span className="block text-sm font-bold">{db.settings.siteName}</span>
        <span className="block text-[10px] font-medium uppercase tracking-widest text-brand">Newsroom CMS</span>
      </span>
    </Link>;


  return (
    <div className="flex min-h-screen w-full bg-muted">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">{brand}</div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 overflow-y-auto bg-white p-0">
          <SheetHeader className="border-b border-border px-5 py-4"><SheetTitle>{brand}</SheetTitle></SheetHeader>
          {nav}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white px-4 md:px-6">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex-1" />
          <a href="/" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand sm:inline-flex">
            View site <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <div className="mx-2 hidden h-6 w-px bg-border sm:block" />
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{user.name.slice(0, 1).toUpperCase()}</span>
            <span className="hidden text-sm font-medium md:block">{user.name}</span>
          </div>
          <button onClick={logout} className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-ink" aria-label="Sign out">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>);

}
