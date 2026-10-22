import { useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';

interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  jsonLd?: Record<string, unknown>[];
}

function setMeta(attr: 'name' | 'property', key: string, content: string | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string | undefined) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Client mirror of Next.js generateMetadata(). Production renders these tags on the server. */
export function useSeo(opts: SeoOptions): void {
  const { db } = useStore();
  const s = db.settings;
  const key = JSON.stringify(opts);

  useEffect(() => {
    const title = opts.title ? `${opts.title}` : s.defaultSeoTitle;
    const description = opts.description || s.defaultMetaDescription;
    const url = opts.canonical || `${s.siteUrl}${opts.path ?? window.location.pathname}`;
    const image = opts.image || s.defaultOgImageUrl;
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', opts.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setLink('canonical', opts.noindex ? undefined : url);
    setMeta('property', 'og:site_name', s.siteName);
    setMeta('property', 'og:type', opts.type || 'website');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:locale', 'en_US');
    setMeta('property', 'article:published_time', opts.publishedTime || undefined);
    setMeta('property', 'article:modified_time', opts.modifiedTime || undefined);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    document.head.querySelectorAll('script[data-tsc-jsonld]').forEach((n) => n.remove());
    (opts.jsonLd || []).forEach((data) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.tscJsonld = 'true';
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, s.siteName, s.siteUrl, s.defaultSeoTitle, s.defaultMetaDescription, s.defaultOgImageUrl]);
}