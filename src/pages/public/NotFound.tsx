import React from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo';

export function NotFound() {
  useSeo({ title: 'Page not found | The Story Current', noindex: true });
  return (
    <section className="container flex flex-col items-center py-24 text-center">
      <p className="font-serif text-8xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 font-serif text-3xl font-bold">This story has drifted away</h1>
      <p className="mt-2 max-w-md text-muted-foreground">The page you're looking for doesn't exist, was moved, or is no longer available.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep">Back to homepage</Link>
        <Link to="/search" className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">Search stories</Link>
      </div>
    </section>);

}