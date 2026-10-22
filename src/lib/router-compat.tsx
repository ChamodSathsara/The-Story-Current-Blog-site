'use client';

import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation';
import React, { createContext, isValidElement, useContext, useEffect, useMemo } from 'react';

type RouteProps = { path?: string; index?: boolean; element: React.ReactNode; children?: React.ReactNode };
type NavigateOptions = { replace?: boolean; state?: unknown };
type Match = { element: React.ReactNode; params: Record<string, string> };

const OutletContext = createContext<React.ReactNode>(null);
const ParamsContext = createContext<Record<string, string>>({});
const navigationState = new Map<string, unknown>();

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Route(props: RouteProps) {
  void props;
  return null;
}

function segments(value: string) {
  return value.split('/').filter(Boolean);
}

function consume(pattern: string, pathname: string, exact: boolean) {
  if (pattern === '*') return { matched: true, rest: '', params: {} };
  const wanted = segments(pattern);
  const actual = segments(pathname);
  if (wanted.length > actual.length || (exact && wanted.length !== actual.length)) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < wanted.length; i += 1) {
    if (wanted[i].startsWith(':')) params[wanted[i].slice(1)] = decodeURIComponent(actual[i]);
    else if (wanted[i] !== actual[i]) return null;
  }
  return { matched: true, rest: actual.slice(wanted.length).join('/'), params };
}

function findMatch(nodes: React.ReactNode, pathname: string, inherited: Record<string, string> = {}): Match | null {
  for (const node of React.Children.toArray(nodes)) {
    if (!isValidElement<RouteProps>(node)) continue;
    const { path, index, element, children } = node.props;
    if (index) {
      if (segments(pathname).length === 0) return { element, params: inherited };
      continue;
    }
    if (path == null) {
      const child = findMatch(children, pathname, inherited);
      if (child) return { element: <OutletContext.Provider value={child.element}>{element}</OutletContext.Provider>, params: child.params };
      continue;
    }
    const result = consume(path, pathname, !children);
    if (!result) continue;
    const params = { ...inherited, ...result.params };
    if (children) {
      const child = findMatch(children, result.rest, params);
      if (child) return { element: <OutletContext.Provider value={child.element}>{element}</OutletContext.Provider>, params: child.params };
      continue;
    }
    return { element, params };
  }
  return null;
}

export function Routes({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const match = useMemo(() => findMatch(children, pathname), [children, pathname]);
  return <ParamsContext.Provider value={match?.params ?? {}}>{match?.element ?? null}</ParamsContext.Provider>;
}

export function Outlet() {
  return <>{useContext(OutletContext)}</>;
}

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string; replace?: boolean; state?: unknown };

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, replace, state, onClick, ...props }, ref) {
  return <NextLink ref={ref} href={to} replace={replace} onClick={(event) => {
    if (state !== undefined) navigationState.set(to.split('?')[0], state);
    onClick?.(event);
  }} {...props} />;
});

export function NavLink({ to, end, className, ...props }: Omit<LinkProps, 'className'> & { end?: boolean; className?: string | ((value: { isActive: boolean }) => string) }) {
  const pathname = usePathname() || '/';
  const active = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  return <Link to={to} className={typeof className === 'function' ? className({ isActive: active }) : className} {...props} />;
}

export function Navigate({ to, replace = false, state }: { to: string; replace?: boolean; state?: unknown }) {
  const router = useRouter();
  useEffect(() => {
    if (state !== undefined) navigationState.set(to.split('?')[0], state);
    if (replace) router.replace(to); else router.push(to);
  }, [replace, router, state, to]);
  return null;
}

export function useNavigate() {
  const router = useRouter();
  return (to: string, options: NavigateOptions = {}) => {
    if (options.state !== undefined) navigationState.set(to.split('?')[0], options.state);
    if (options.replace) router.replace(to); else router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname() || '/';
  const search = useNextSearchParams();
  const value = search?.toString() ?? '';
  return { pathname, search: value ? `?${value}` : '', state: navigationState.get(pathname) ?? null };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  return useContext(ParamsContext) as T;
}

type SearchParamsInput = URLSearchParams | Record<string, string> | ((current: URLSearchParams) => URLSearchParams | Record<string, string>);

export function useSearchParams(): [URLSearchParams, (next: SearchParamsInput) => void] {
  const current = useNextSearchParams();
  const pathname = usePathname() || '/';
  const router = useRouter();
  const params = useMemo(() => new URLSearchParams(current?.toString() ?? ''), [current]);
  const setParams = (next: SearchParamsInput) => {
    const resolved = typeof next === 'function' ? next(new URLSearchParams(params)) : next;
    const query = resolved instanceof URLSearchParams ? resolved.toString() : new URLSearchParams(resolved).toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };
  return [params, setParams];
}
