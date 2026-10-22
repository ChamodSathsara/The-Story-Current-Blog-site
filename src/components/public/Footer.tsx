import React from 'react';
import { Link } from 'react-router-dom';
import { Rss } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { topCategories } from '../../utils/posts';
import { NewsletterForm } from './NewsletterForm';
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon } from './SocialIcons';

export function Footer() {
  const { db } = useStore();
  const s = db.settings;
  const socials = [
  { href: s.facebookUrl, label: 'Facebook', Icon: FacebookIcon },
  { href: s.twitterUrl, label: 'X (Twitter)', Icon: XIcon },
  { href: s.instagramUrl, label: 'Instagram', Icon: InstagramIcon },
  { href: s.youtubeUrl, label: 'YouTube', Icon: YouTubeIcon },
  { href: s.linkedinUrl, label: 'LinkedIn', Icon: LinkedInIcon }].
  filter((x) => x.href);

  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="h-1 bg-brand" />
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <img src={s.logoUrl} alt="" className="h-12 w-12 rounded-md" width={48} height={48} />
            <span className="font-serif text-2xl font-extrabold">{s.siteName}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{s.footerText}</p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map(({ href, label, Icon }) =>
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand">
                <Icon className="h-4 w-4" />
              </a>
            )}
            <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs" title="RSS feed is generated at /rss.xml in production">
              <Rss className="h-3.5 w-3.5" /> RSS
            </span>
          </div>
        </div>
        <nav aria-label="Sections" className="lg:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand">Sections</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {topCategories(db).map((c) =>
            <li key={c.id}><Link to={`/category/${c.slug}`} className="text-white/80 hover:text-brand">{c.name}</Link></li>
            )}
          </ul>
        </nav>
        <nav aria-label="Company" className="lg:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand">The Story Current</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[['About Us', '/about'], ['Contact', '/contact'], ['Newsletter', '/newsletter'], ['Editorial Policy', '/editorial-policy'], ['Corrections Policy', '/corrections-policy'], ['Privacy Policy', '/privacy-policy'], ['Terms & Conditions', '/terms-and-conditions']].map(([l, h]) =>
            <li key={h}><Link to={h} className="text-white/80 hover:text-brand">{l}</Link></li>
            )}
          </ul>
        </nav>
        <div className="lg:col-span-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand">Get the newsletter</h2>
          <p className="mb-4 mt-4 text-sm text-white/70">The day's most important stories, clearly explained. No spam.</p>
          <NewsletterForm source="footer" variant="footer" />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {s.siteName}. All rights reserved.</p>
          <p>Serving readers in the United States, Canada and the United Kingdom.</p>
        </div>
      </div>
    </footer>);

}