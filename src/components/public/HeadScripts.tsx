import { useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { useConsent } from '../../hooks/useConsent';

function addScript(id: string, src: string, attrs: Record<string, string> = {}) {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.async = true;
  s.src = src;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

/** Injects GA4, Search Console verification, favicon and AdSense — only when configured. */
export function HeadScripts() {
  const { db } = useStore();
  const [consent] = useConsent();
  const s = db.settings;

  useEffect(() => {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = s.faviconUrl;
  }, [s.faviconUrl]);

  useEffect(() => {
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="google-site-verification"]');
    if (!s.gscVerification) {
      meta?.remove();
      return;
    }
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      document.head.appendChild(meta);
    }
    meta.content = s.gscVerification;
  }, [s.gscVerification]);

  useEffect(() => {
    if (!s.ga4Id || !/^G-[A-Z0-9]+$/.test(s.ga4Id) || consent !== 'accepted') return;
    addScript('tsc-ga4', `https://www.googletagmanager.com/gtag/js?id=${s.ga4Id}`);
    const w = window as unknown as {dataLayer: unknown[];gtag?: (...args: unknown[]) => void;};
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag(...args: unknown[]) {
      w.dataLayer.push(args);
    };
    w.gtag('js', new Date());
    w.gtag('config', s.ga4Id, { anonymize_ip: true });
  }, [s.ga4Id, consent]);

  useEffect(() => {
    if (!s.adsenseEnabled || !/^ca-pub-\d+$/.test(s.adsenseClientId) || consent !== 'accepted') return;
    addScript('tsc-adsense', `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${s.adsenseClientId}`, { crossorigin: 'anonymous' });
  }, [s.adsenseEnabled, s.adsenseClientId, consent]);

  return null;
}