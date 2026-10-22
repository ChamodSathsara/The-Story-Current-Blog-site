import React, { useState } from 'react';
import { Check, Link2, Mail } from 'lucide-react';
import { FacebookIcon, LinkedInIcon, XIcon } from './SocialIcons';

export function ShareButtons({ url, title }: {url: string;title: string;}) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
  { label: 'Share on Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FacebookIcon },
  { label: 'Share on X', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, Icon: XIcon },
  { label: 'Share on LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: LinkedInIcon }];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  const btn = 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition hover:border-brand hover:bg-brand hover:text-white';
  return (
    <div className="flex items-center gap-2" aria-label="Share this article">
      {links.map(({ label, href, Icon }) =>
      <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={btn}>
          <Icon className="h-4 w-4" />
        </a>
      )}
      <a href={`mailto:?subject=${t}&body=${u}`} aria-label="Share by email" className={btn}>
        <Mail className="h-4 w-4" />
      </a>
      <button type="button" onClick={copy} aria-label="Copy link" className={btn}>
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>);

}