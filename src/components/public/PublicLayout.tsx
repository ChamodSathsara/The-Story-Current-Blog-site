import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CookieConsent } from './CookieConsent';
import { Footer } from './Footer';
import { HeadScripts } from './HeadScripts';
import { Header } from './Header';

export function PublicLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <HeadScripts />
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>);

}